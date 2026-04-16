import React, { useEffect, useState } from "react";
import HeaderComponent from "../../shared/components/HeaderComponent";
import { getFacultyTimetable } from "../api/faculty.api";
import {
  Loader2,
  CalendarX2,
  Coffee,
  MapPin,
  GraduationCap,
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

const getRomanYear = (sem) => {
  const year = Math.ceil(sem / 2);
  const roman = ["", "I", "II", "III", "IV"];
  return roman[year] || year;
};

const TimetableShimmer = () => {
  return (
    <div className="pt-3 px-4 h-full flex flex-col bg-[#FBFBFB] animate-pulse">
      <HeaderComponent title="Time table" />
      <div className="mt-4 flex-1 overflow-hidden bg-white rounded-[1rem] border border-slate-200 flex flex-col">
        <div className="h-14 bg-slate-50 border-b border-slate-200 flex">
          <div className="w-20 border-r border-slate-200" />
          {[1, 2, 3, 4, 5, 6, 7].map((i) => (
            <div key={i} className="flex-1 border-r border-slate-100 p-2 flex flex-col items-center gap-2">
              <div className="h-2 w-8 bg-slate-200 rounded" />
              <div className="h-2 w-12 bg-slate-200 rounded" />
            </div>
          ))}
        </div>
        <div className="flex-1">
          {INITIAL_DAYS.map((day) => (
            <div key={day} className="h-[110px] border-b border-slate-100 flex">
              <div className="w-20 bg-slate-50/50 border-r border-slate-200 flex items-center justify-center">
                <div className="h-3 w-8 bg-slate-200 rounded" />
              </div>
              {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                <div key={i} className="flex-1 p-2 border-r border-slate-50">
                  <div className="h-full w-full bg-slate-50 rounded-lg p-2 space-y-3">
                    <div className="flex justify-between">
                      <div className="h-4 w-12 bg-slate-100 rounded" />
                      <div className="h-2 w-8 bg-slate-100 rounded" />
                    </div>
                    <div className="h-3 w-3/4 bg-slate-100 rounded" />
                    <div className="h-3 w-1/2 bg-slate-100 rounded mt-auto" />
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const TimetableComponent = () => {
  const [timetable, setTimetable] = useState(null);
  const [loading, setLoading] = useState(true);

  const userdata = JSON.parse(localStorage.getItem("lms-user"));
  const facultyId = userdata?.facultyId;

  useEffect(() => {
    const fetchTimetable = async () => {
      if (!facultyId) return;
      setLoading(true);
      try {
        const response = await getFacultyTimetable(facultyId);
        if (response.success) setTimetable(response.data);
      } catch (error) {
        console.error("Error fetching timetable:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchTimetable();
  }, [facultyId]);

  if (loading) return <TimetableShimmer />;

  return (
    <div className="pt-3 px-4 h-full overflow-hidden flex flex-col bg-[#FBFBFB]">
      <HeaderComponent title="Time table" />

      <div className="mt-4 flex-1 overflow-hidden bg-white rounded-[1rem] border border-slate-200 shadow-2xl shadow-slate-200/50 flex flex-col relative">
        <div className="flex-1 overflow-auto">
          {timetable?.slots?.length > 0 ? (
            <table className="w-full border-collapse table-fixed min-w-[1100px]">
              <thead>
                <tr className="bg-slate-50 sticky top-0 z-40 border-b border-slate-200">
                  <th className="w-20 p-4 text-[12px] font-black text-slate-400 border-r border-slate-200 bg-slate-50">
                    DAY
                  </th>
                  {timetable.slots.map((slot, i) => (
                    <th
                      key={slot.order}
                      className={`p-2 text-center border-r border-slate-100 ${slot.type !== "class" ? "w-14 bg-[#08384F]/5" : ""}`}
                    >
                      <div className="flex flex-col items-center gap-0.5">
                        <span className="text-[9px] font-black text-[#0B56A4] opacity-50 uppercase whitespace-nowrap">
                          {slot.type === "class"
                            ? `${timetable.slots.filter((s, idx) => idx < i && s.type === "class").length + 1}`
                            : slot.name || slot.type}
                        </span>
                        <span className="text-[9px] font-black text-[#08384F] whitespace-nowrap">
                          {formatTimeWithAMPM(slot.startTime)}
                        </span>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-200">
                {INITIAL_DAYS.map((day, rIdx) => (
                  <tr
                    key={day}
                    className="hover:bg-slate-50/30 transition-colors group"
                  >
                    <td className="p-2 text-center text-xs font-black text-[#08384F] bg-slate-50/50 border-r border-slate-300 sticky left-0 z-20 shadow-[1px_0_0_#cbd5e1]">
                      {day}
                    </td>

                    {timetable.slots.map((slot) => {
                      if (slot.type !== "class") {
                        return (
                          rIdx === 0 && (
                            <td
                              key={slot.order}
                              rowSpan={INITIAL_DAYS.length}
                              className="bg-[#08384F] border-x border-white/5 relative w-14"
                            >
                              <div className="absolute inset-0 flex items-center justify-center">
                                <span className="[writing-mode:vertical-lr] rotate-180 text-[11px] font-black text-white/30 tracking-[0.2em] uppercase whitespace-nowrap flex items-center gap-2">
                                  <Coffee size={12} className="rotate-180" />{" "}
                                  {slot.name || slot.type}
                                </span>
                              </div>
                            </td>
                          )
                        );
                      }

                      const entries = timetable.grid[day]?.[slot.order] || [];

                      return (
                        <td
                          key={`${day}-${slot.order}`}
                          className="p-1 border-r border-slate-100 h-[100px] align-middle"
                        >
                          <div className="h-full w-full">
                            {entries.length > 0 ? (
                              entries.map((item, idx) => (
                                <div
                                  key={idx}
                                  className={`w-full h-full rounded-lg flex flex-col p-2 shadow-sm transition-all hover:shadow-md ${
                                    item.type === "regular"
                                      ? "border-[#08384F] border-l-[#08384F]"
                                      : "bg-amber-50/40 border-amber-100 border-l-amber-500"
                                  }`}
                                >
                                  <div className="flex justify-between items-start mb-1">
                                    <div
                                      className={`flex items-center gap-1 px-1.5 py-0.5 rounded-md w-fit ${
                                        item.type === "regular" ? "bg-[#08384F]/10" : "bg-amber-600/10"
                                      }`}
                                    >
                                      <MapPin
                                        size={10}
                                        className={
                                          item.type === "regular" ? "text-[#08384F]" : "text-amber-700"
                                        }
                                      />
                                      <span
                                        className={`text-[10px] font-black uppercase ${
                                          item.type === "regular" ? "text-[#08384F]" : "text-amber-700"
                                        }`}
                                      >
                                        {item.venue || "TBA"}
                                      </span>
                                    </div>
                                    <span className="text-[9px] font-bold opacity-70">
                                      {item.subjectCode}
                                    </span>
                                  </div>

                                  <h4
                                    className={`text-[13px] font-black leading-tight uppercase line-clamp-2 mt-2 flex-1 ${
                                      item.type === "regular" ? "text-[#08384F]" : "text-amber-900"
                                    }`}
                                  >
                                    {item.subjectShortName || item.subjectName}
                                  </h4>

                                  <div className="mt-auto pt-1 border-t border-slate-100/50">
                                    <div className="flex items-center gap-1">
                                      <GraduationCap
                                        size={12}
                                        className={
                                          item.type === "regular" ? "text-[#08384F]" : "text-amber-700"
                                        }
                                      />
                                      <span
                                        className={`text-[10px] font-black uppercase ${
                                          item.type === "regular" ? "text-[#08384F]" : "text-amber-700"
                                        }`}
                                      >
                                        {getRomanYear(item.semesterNumber)} - {item.departmentCode} - {item.sectionName}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              ))
                            ) : (
                              <div className="w-full h-full flex items-center justify-center border border-dashed border-slate-100 rounded-lg group-hover:bg-slate-50 transition-colors">
                                <span className="text-[10px] font-bold text-slate-200 uppercase tracking-widest">
                                  Free
                                </span>
                              </div>
                            )}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 gap-4 py-20">
              <CalendarX2 size={64} strokeWidth={1} className="opacity-20" />
              <p className="text-lg font-bold">No Schedule Found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TimetableComponent;