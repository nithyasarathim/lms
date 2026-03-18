import React from "react";
import {
  Loader2,
  Plus,
  X,
  ArrowLeft,
  ArrowRight,
  Settings,
} from "lucide-react";

const INITIAL_DAYS = ["MON", "TUE", "WED", "THU", "FRI", "SAT"];

const formatTimeWithAMPM = (time) => {
  if (!time) return "";
  const [hours, minutes] = time.split(":");
  const hour = parseInt(hours, 10);
  const ampm = hour >= 12 ? "PM" : "AM";
  const hour12 = hour % 12 || 12;
  return `${hour12}:${minutes} ${ampm}`;
};

const TimetableGridShimmer = () => {
  return (
    <div className="bg-white border border-slate-200 rounded-[1.5rem] overflow-hidden shadow-2xl shadow-slate-200/50 flex flex-col h-full">
      <div className="flex-1 overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="w-20 p-4 border-r border-slate-200">
                <div className="h-4 w-10 bg-slate-200 rounded animate-pulse mx-auto"></div>
              </th>
              {[...Array(9)].map((_, i) => (
                <th
                  key={i}
                  className="p-2 text-center border-r border-slate-100 min-w-[100px]"
                >
                  <div className="flex flex-col items-center gap-1">
                    <div className="h-3 w-16 bg-slate-200 rounded animate-pulse"></div>
                    <div className="h-3 w-20 bg-slate-200 rounded animate-pulse"></div>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-300">
            {INITIAL_DAYS.map((day) => (
              <tr key={day} className="hover:bg-slate-50/30 transition-colors">
                <td className="p-2 text-center border-r border-slate-300 bg-slate-50/50">
                  <div className="h-4 w-8 bg-slate-200 rounded animate-pulse mx-auto"></div>
                </td>
                {[...Array(9)].map((_, i) => (
                  <td
                    key={i}
                    className="p-1 border-r border-slate-100 h-[85px] align-middle min-w-[100px]"
                  >
                    <div className="w-full h-full rounded-sm bg-slate-100 animate-pulse"></div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const TimetableGrid = ({
  isLoading,
  slots,
  timetableData,
  isConfigMode,
  onMoveSlot,
  onRemoveCell,
  onEditSlotTime,
  onAssignSubject,
}) => {
  const getCellData = (day, slotOrder) => {
    const cell = timetableData?.[day]?.[slotOrder];
    if (!cell) return null;

    let code = cell.code || "";
    let short = cell.short || "";

    if (
      cell.facultyAssignmentId &&
      typeof cell.facultyAssignmentId === "object"
    ) {
      const subjectId = cell.facultyAssignmentId.subjectComponentId?.subjectId;
      const component = cell.facultyAssignmentId.subjectComponentId;
      code = subjectId?.code || code;
      short = component?.shortName || subjectId?.shortName || short;
    } else if (
      cell.additionalHourId &&
      typeof cell.additionalHourId === "object"
    ) {
      code = cell.additionalHourId.shortName || code;
      short = cell.additionalHourId.shortName || short;
    }

    return { code, short };
  };

  const getColumnWidth = (slot) => {
    return slot.type !== "class" ? "w-12" : "min-w-[100px]";
  };

  if (isLoading) {
    return <TimetableGridShimmer />;
  }

  return (
    <div className="bg-white border border-slate-200 rounded-[1.5rem] overflow-hidden shadow-2xl shadow-slate-200/50 flex flex-col h-full relative">
      <div className="flex-1 overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-slate-50 sticky top-0 z-40 border-b border-slate-200">
              <th className="w-20 p-4 text-[12px] font-black text-slate-400 border-r border-slate-200 bg-slate-50 shadow-[1px_0_0_#e2e8f0]">
                DAY
              </th>

              {slots.map((slot, i) => (
                <th
                  key={slot.order}
                  className={`p-2 text-center border-r border-slate-100 ${getColumnWidth(slot)} ${
                    slot.type !== "class" ? "bg-[#08384F]/5" : ""
                  }`}
                >
                  <div
                    onClick={() => isConfigMode && onEditSlotTime(slot)}
                    className={`flex flex-col items-center gap-1 ${isConfigMode ? "cursor-pointer group/header" : ""}`}
                  >
                    <span className="flex items-center gap-1 text-[9px] font-black text-[#0B56A4] opacity-50 uppercase whitespace-nowrap">
                      {isConfigMode && slot.type !== "class" && (
                        <ArrowLeft
                          size={10}
                          className="hover:text-black cursor-pointer shrink-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            onMoveSlot(i, -1);
                          }}
                        />
                      )}

                      <span className="truncate max-w-[50px]">
                        {slot.type !== "class"
                          ? slot.name || slot.type.toUpperCase()
                          : `${
                              slots.filter(
                                (s, idx) => idx < i && s.type === "class",
                              ).length + 1
                            }`}
                      </span>

                      {isConfigMode && slot.type !== "class" && (
                        <ArrowRight
                          size={10}
                          className="hover:text-black cursor-pointer shrink-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            onMoveSlot(i, 1);
                          }}
                        />
                      )}
                    </span>

                    <span
                      className={`text-[9px] font-black text-[#08384F] whitespace-nowrap ${isConfigMode ? "group-hover/header:underline decoration-dotted underline-offset-4" : ""}`}
                    >
                      {formatTimeWithAMPM(slot.startTime)} - {formatTimeWithAMPM(slot.endTime)}
                    </span>
                  </div>
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-300">
            {INITIAL_DAYS.map((day, rIdx) => (
              <tr key={day} className="hover:bg-slate-50/30 transition-colors">
                <td className="p-2 text-center text-xs font-black text-[#08384F] bg-slate-50/50 border-r border-slate-300 sticky left-0 z-20 shadow-[1px_0_0_#cbd5e1]">
                  {day}
                </td>

                {slots.map((slot) => {
                  if (slot.type !== "class") {
                    return (
                      rIdx === 0 && (
                        <td
                          key={slot.order}
                          rowSpan={INITIAL_DAYS.length}
                          className="bg-[#08384F] border-x border-white/5 relative w-12"
                        >
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="[writing-mode:vertical-lr] rotate-180 text-[11px] font-black text-white/30 tracking-[0.2em] uppercase whitespace-nowrap">
                              {slot.name || slot.type}
                            </span>
                          </div>
                        </td>
                      )
                    );
                  }

                  const cellData = getCellData(day, slot.order);

                  return (
                    <td
                      key={`${day}-${slot.order}`}
                      className="p-1 border-r border-slate-100 h-[85px] align-middle min-w-[100px]"
                    >
                      <div className="relative group/cell w-full h-full">
                        {cellData ? (
                          <div className="w-full h-full rounded-sm flex flex-col items-center justify-center p-1.5 border-2 bg-blue-50/50 border-blue-100 text-[#0B56A4] transition-all group-hover/cell:border-blue-300">
                            <span className="text-[8px] font-black opacity-40 mb-0.5 truncate max-w-[90px]">
                              {cellData.code}
                            </span>

                            <span className="text-[13px] font-bold uppercase text-center leading-tight line-clamp-2 max-w-[90px]">
                              {cellData.short}
                            </span>

                            <div className="absolute -top-2 -right-2 flex flex-col gap-1 opacity-0 group-hover/cell:opacity-100 transition-opacity z-10">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onRemoveCell(day, slot.order);
                                }}
                                className="p-1.5 bg-white border border-red-100 rounded-full text-red-500 hover:bg-red-500 hover:text-white shadow-md transition-all"
                              >
                                <X size={10} />
                              </button>

                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onAssignSubject(slot, day);
                                }}
                                className="p-1.5 bg-white border border-slate-200 rounded-full text-slate-500 hover:text-[#08384F] hover:border-[#08384F] shadow-md transition-all"
                              >
                                <Settings size={10} />
                              </button>
                            </div>
                          </div>
                        ) : (
                          <button
                            onClick={() => onAssignSubject(slot, day)}
                            className="w-full h-full rounded-md border-2 border-dashed border-slate-100 flex items-center justify-center transition-all hover:border-slate-300 hover:bg-slate-50 group/add"
                          >
                            <Plus
                              size={14}
                              className="text-slate-200 group-hover/add:text-[#08384F] transition-colors"
                            />
                          </button>
                        )}
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TimetableGrid;