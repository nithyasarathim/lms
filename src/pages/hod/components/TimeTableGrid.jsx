import React from "react";
import {
  X,
  Plus,
  ArrowLeft,
  ArrowRight,
  Settings,
  Loader2,
} from "lucide-react";

const INITIAL_DAYS = ["MON", "TUE", "WED", "THU", "FRI", "SAT"];

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
  return (
    <div className="bg-white border border-slate-200 rounded-[1.5rem] overflow-hidden shadow-2xl shadow-slate-200/50 flex flex-col h-full relative">
      {isLoading && (
        <div className="absolute inset-0 bg-white/50 backdrop-blur-sm z-50 flex items-center justify-center">
          <Loader2 className="animate-spin text-[#08384F]" size={40} />
        </div>
      )}
      <div className="flex-1 overflow-auto">
        <table className="w-full border-collapse table-fixed min-w-[1100px] h-full">
          <thead>
            <tr className="bg-slate-50 sticky top-0 z-40 border-b border-slate-200">
              <th className="w-20 p-4 text-[12px] font-black text-slate-400 border-r border-slate-200 bg-slate-50 shadow-[1px_0_0_#e2e8f0]">
                DAY
              </th>
              {slots.map((slot, i) => (
                <th
                  key={slot.order}
                  onClick={() => isConfigMode && onEditSlotTime(slot)}
                  className={`p-4 text-center border-r border-slate-100 ${isConfigMode ? "cursor-pointer hover:bg-slate-100" : ""} ${slot.type !== "class" ? "w-16 bg-[#08384F]/5" : ""}`}
                >
                  <div className="flex flex-col items-center gap-1">
                    <span className="flex items-center gap-2 text-[9px] font-black text-[#0B56A4] opacity-50 uppercase">
                      {isConfigMode && slot.type !== "class" && (
                        <ArrowLeft
                          size={10}
                          className="hover:text-black cursor-pointer"
                          onClick={(e) => {
                            e.stopPropagation();
                            onMoveSlot(i, -1);
                          }}
                        />
                      )}
                      {slot.type !== "class"
                        ? slot.name || slot.type.toUpperCase()
                        : `Slot ${slots.filter((s, idx) => idx < i && s.type === "class").length + 1}`}
                      {isConfigMode && slot.type !== "class" && (
                        <ArrowRight
                          size={10}
                          className="hover:text-black cursor-pointer"
                          onClick={(e) => {
                            e.stopPropagation();
                            onMoveSlot(i, 1);
                          }}
                        />
                      )}
                    </span>
                    <span className="text-[12px] font-black text-[#08384F] underline decoration-dotted underline-offset-4">
                      {slot.startTime} - {slot.endTime}
                    </span>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-300">
            {INITIAL_DAYS.map((day, rIdx) => (
              <tr
                key={day}
                className="group hover:bg-slate-50/30 transition-colors"
              >
                <td className="p-4 text-center text-xs font-black text-[#08384F] bg-slate-50/50 border-r border-slate-300 sticky left-0 z-20 shadow-[1px_0_0_#cbd5e1]">
                  {day}
                </td>
                {slots.map((slot) =>
                  slot.type !== "class" ? (
                    rIdx === 0 && (
                      <td
                        key={slot.order}
                        rowSpan={INITIAL_DAYS.length}
                        className="bg-[#08384F] border-x border-white/5 relative"
                      >
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="[writing-mode:vertical-lr] rotate-180 text-[12px] font-black text-white/30 tracking-[0.4em] uppercase">
                            {slot.name || slot.type}
                          </span>
                        </div>
                      </td>
                    )
                  ) : (
                    <td
                      key={slot.order}
                      className="p-2 text-center align-middle border-r border-slate-100"
                    >
                      {timetableData[day]?.[slot.order] ? (
                        <div className="relative w-full h-full min-h-[55px]">
                          <div className="w-full h-full rounded-xl flex flex-col items-center justify-center p-2 border-2 bg-blue-50/50 border-blue-100 text-[#0B56A4]">
                            <span className="text-[9px] font-black opacity-40 mb-1">
                              {timetableData[day][slot.order].code}
                            </span>
                            <span className="text-[11px] font-black uppercase text-center leading-tight">
                              {timetableData[day][slot.order].short}
                            </span>
                          </div>
                          <div className="absolute -top-1 -right-1 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onRemoveCell(day, slot.order);
                              }}
                              className="p-1 bg-white border border-red-100 rounded-full text-red-500 hover:bg-red-50 shadow-sm"
                            >
                              <X size={10} />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onAssignSubject(slot, day);
                              }}
                              className="p-1 bg-white border border-slate-200 rounded-full text-slate-500 hover:text-[#08384F] shadow-sm"
                            >
                              <Settings size={10} />
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => onAssignSubject(slot, day)}
                          className="w-full h-full min-h-[80px] flex items-center justify-center group/add"
                        >
                          <Plus
                            size={14}
                            className="text-slate-200 group-hover/add:text-[#08384F]"
                          />
                        </button>
                      )}
                    </td>
                  ),
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TimetableGrid;
