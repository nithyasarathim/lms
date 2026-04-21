import React, { useEffect, useMemo, useState } from "react";
import {
  BookOpen,
  CalendarClock,
  LoaderCircle,
  Percent,
  Users2,
  FileText,
} from "lucide-react";

import HeaderComponent from "../../shared/components/HeaderComponent";
import { getStudentDashboard } from "../api/student.api";

// Importing the background images
import cardBg1 from "../../../assets/cardbg1.svg";
import cardBg2 from "../../../assets/cardbg2.svg";
import cardBg3 from "../../../assets/cardbg3.svg";

const cardConfig = {
  totalClasses: {
    icon: BookOpen,
    bgImage: cardBg1,
    gradient:
      "linear-gradient(to bottom right, rgba(76, 29, 149, 0.85), rgba(46, 16, 101, 0.9))",
  },
  totalStudents: {
    icon: Users2,
    bgImage: cardBg2,
    gradient:
      "linear-gradient(to bottom right, rgba(20, 83, 45, 0.85), rgba(6, 78, 59, 0.9))",
  },
  attendancePercentage: {
    icon: Percent,
    bgImage: cardBg3,
    gradient:
      "linear-gradient(to bottom right, rgba(131, 24, 67, 0.85), rgba(80, 7, 36, 0.9))",
  },
};

const toneClassMap = {
  green: "bg-[#A7F3D0] text-[#0F766E]",
  red: "bg-[#FDA4AF] text-[#BE123C]",
  blue: "bg-[#93C5FD] text-[#1D4ED8]",
  gray: "bg-[#E5E7EB] text-[#6B7280]",
};

const scheduleDotColors = [
  "#3B82F6",
  "#FB923C",
  "#EC4899",
  "#22C55E",
  "#A855F7",
  "#F97316",
];

const StudentDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let ignore = false;

    const fetchDashboard = async () => {
      try {
        setLoading(true);
        setError("");
        const response = await getStudentDashboard();
        if (!ignore) {
          setDashboardData(response?.data || null);
        }
      } catch (err) {
        if (!ignore) {
          setError(err?.message || "Failed to load student dashboard");
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    fetchDashboard();

    return () => {
      ignore = true;
    };
  }, []);

  const cards = useMemo(() => {
    const apiCards = dashboardData?.cards || [];
    return apiCards.map((card) => ({
      ...card,
      ...cardConfig[card.key],
    }));
  }, [dashboardData]);

  const attendanceOverview = dashboardData?.attendanceOverview || {
    days: [],
    rows: [],
  };
  const passPercentage = dashboardData?.passPercentage || {
    average: 90,
    subjects: [],
  };

  return (
    <div className="flex flex-col h-screen w-full overflow-hidden bg-[#F8FAFC]">
      <div className="w-full flex-none bg-[#F8FAFC] z-30 pt-2 px-5 pb-2">
        <HeaderComponent title="Dashboard" />
      </div>

      <div className="flex-1 min-h-0 px-5 pb-5 overflow-hidden">
        {loading ? (
          <div className="h-full flex items-center justify-center gap-3 text-slate-500">
            <LoaderCircle className="animate-spin" size={22} />
            Loading dashboard...
          </div>
        ) : error ? (
          <div className="h-full flex items-center justify-center text-rose-600 font-medium text-center px-6">
            {error}
          </div>
        ) : (
          <div className="h-full grid grid-cols-[minmax(0,1fr)_280px] gap-4">
            <div className="h-full flex flex-col gap-4 min-h-0 overflow-hidden">
              <section className="grid grid-cols-3 gap-4 flex-none">
                {cards.map((card) => {
                  const Icon = card.icon;

                  return (
                    <article
                      key={card.key}
                      className="relative overflow-hidden rounded-[14px] p-4 text-white shadow-md h-[120px]"
                    >
                      {/* Background Image Layer */}
                      <img
                        src={card.bgImage}
                        className="absolute inset-0 w-full h-full object-cover"
                        alt="bg"
                      />
                      {/* Gradient Overlay Layer */}
                      <div
                        className="absolute inset-0 z-0"
                        style={{ background: card.gradient }}
                      />

                      <div className="relative z-10 flex h-full flex-col justify-between">
                        <div className="flex items-center gap-3">
                          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 backdrop-blur-md shadow-sm">
                            <Icon size={18} className="text-white" />
                          </span>
                          <p className="text-[13px] font-medium text-white/90">
                            {card.title}
                          </p>
                        </div>

                        <div className="flex items-end justify-between mt-auto">
                          <h3 className="text-3xl font-bold leading-none">
                            {card.value}
                          </h3>
                          <div className="flex items-center gap-1.5 rounded bg-black/25 px-2 py-1 text-[10px] font-medium text-white/90 backdrop-blur-sm">
                            <FileText size={10} />
                            {dashboardData?.academicYear?.name ||
                              "2025-2026 Academic Year"}
                          </div>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </section>

              <section className="flex-1 grid grid-cols-2 gap-4 min-h-0 overflow-hidden">
                <article className="flex flex-col rounded-[14px] border border-slate-200 bg-white shadow-sm overflow-hidden h-full min-h-0">
                  <div className="flex-none flex items-center justify-between border-b border-slate-100 px-5 py-3.5">
                    <h2 className="text-[15px] font-semibold text-slate-800">
                      Student Attendance Overview
                    </h2>
                    <span className="flex items-center gap-1 rounded bg-slate-50 px-2.5 py-1 text-[11px] font-medium text-slate-500 border border-slate-100">
                      Past 7 Days
                    </span>
                  </div>

                  <div className="flex-1 flex flex-col p-5 min-h-0">
                    <div
                      className="flex-1 grid gap-1.5"
                      style={{
                        gridTemplateColumns: `40px repeat(${Math.max(attendanceOverview.days.length, 1)}, minmax(0, 1fr))`,
                        gridTemplateRows: `24px repeat(${Math.max(attendanceOverview.rows.length, 1)}, minmax(0, 1fr))`,
                      }}
                    >
                      <div />
                      {attendanceOverview.days.map((day) => (
                        <div
                          key={day.dateString}
                          className="flex items-end justify-center text-[12px] font-medium text-slate-400 pb-1"
                        >
                          {day.label}
                        </div>
                      ))}

                      {attendanceOverview.rows.map((row) => (
                        <React.Fragment key={row.slotOrder}>
                          <div className="flex items-center justify-center text-[12px] font-medium text-slate-400">
                            {row.label}
                          </div>
                          {row.cells.map((cell, cellIndex) => {
                            const tone =
                              cell.tone === "green"
                                ? "green"
                                : cell.tone === "red"
                                  ? "red"
                                  : cell.tone === "blue"
                                    ? "blue"
                                    : "gray";

                            return (
                              <div
                                key={`${row.slotOrder}-${cellIndex}`}
                                className={`flex h-full w-full items-center justify-center rounded-[4px] text-[13px] font-semibold tracking-tight ${toneClassMap[tone]}`}
                              >
                                {cell.percentage === null
                                  ? "--"
                                  : `${cell.percentage}%`}
                              </div>
                            );
                          })}
                        </React.Fragment>
                      ))}
                    </div>

                    <div className="flex-none flex items-center justify-between mt-4 text-[11px] font-medium text-slate-500">
                      <div className="flex items-center gap-1.5">
                        <span className="h-2.5 w-2.5 rounded-[2px] bg-[#A7F3D0]" />
                        80-90%+ Good
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="h-2.5 w-2.5 rounded-[2px] bg-[#FDA4AF]" />
                        &lt;50 Poor
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="h-2.5 w-2.5 rounded-[2px] bg-[#93C5FD]" />
                        50-80% Average
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="h-2.5 w-2.5 rounded-[2px] bg-[#E5E7EB]" />
                        No Classes
                      </div>
                    </div>
                  </div>
                </article>

                <article className="flex flex-col rounded-[14px] border border-slate-200 bg-white shadow-sm overflow-hidden h-full min-h-0">
                  <div className="flex-none border-b border-slate-100 px-5 py-3.5">
                    <h2 className="text-[15px] font-semibold text-slate-800">
                      Students Pass Percentage Overview
                    </h2>
                  </div>

                  <div className="flex-1 flex flex-col items-center justify-center p-6 min-h-0 overflow-y-auto">
                    <div className="relative flex-none mb-8">
                      <div
                        className="h-36 w-36 rounded-full"
                        style={{
                          background: `conic-gradient(#3B82F6 0deg 234deg, #93C5FD 234deg 288deg, #DBEAFE 288deg 360deg)`,
                        }}
                      >
                        <div className="absolute inset-[14px] rounded-full bg-white flex flex-col items-center justify-center shadow-inner">
                          <span className="text-3xl font-bold text-slate-700 leading-tight">
                            {passPercentage.average}%
                          </span>
                          <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                            Average
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="w-full flex-1 flex flex-col justify-center space-y-4">
                      {passPercentage.subjects.map((subject) => (
                        <div key={subject.name} className="w-full">
                          <div className="mb-1.5 flex items-center justify-between text-[13px]">
                            <span className="font-semibold text-slate-700">
                              {subject.name}
                            </span>
                            <span className="font-medium text-slate-500">
                              {subject.value}%
                            </span>
                          </div>
                          <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
                            <div
                              className="h-full rounded-full bg-[#3B82F6]"
                              style={{ width: `${subject.value}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </article>
              </section>
            </div>

            <aside className="h-full flex flex-col rounded-[14px] border border-[#E0F2FE] bg-gradient-to-b from-[#F0F9FF] to-[#E0F2FE]/50 shadow-sm overflow-hidden">
              <div className="flex-none border-b border-[#E0F2FE] px-5 py-3.5 bg-white/40 backdrop-blur-sm">
                <h2 className="text-[15px] font-semibold text-slate-800">
                  Today Schedule
                </h2>
              </div>

              <div className="flex-1 overflow-y-auto px-6 py-5">
                {dashboardData?.todaySchedule?.status === "LEAVE" ? (
                  <div className="h-full flex flex-col items-center justify-center text-center">
                    <CalendarClock size={32} className="text-slate-400 mb-3" />
                    <h3 className="text-base font-bold text-slate-700">
                      Leave
                    </h3>
                    <p className="mt-1 text-sm text-slate-500">
                      {dashboardData.todaySchedule.title}
                    </p>
                  </div>
                ) : dashboardData?.todaySchedule?.items?.length ? (
                  <div className="relative">
                    <div className="absolute left-[11px] top-2 bottom-2 w-[2px] border-l-2 border-dashed border-slate-300" />

                    <div className="space-y-6">
                      {dashboardData.todaySchedule.items.map((item, index) => (
                        <div key={item.id} className="relative pl-8">
                          <div
                            className="absolute left-0 top-1 h-6 w-6 rounded-full border-[4px] border-[#F0F9FF] shadow-sm z-10"
                            style={{
                              backgroundColor:
                                item.accentColor ||
                                scheduleDotColors[
                                  index % scheduleDotColors.length
                                ],
                            }}
                          />
                          <div className="flex flex-col">
                            <span className="text-[13px] font-bold text-slate-700">
                              {item.displayTime}
                            </span>
                            <span className="text-[13px] font-medium text-slate-600 mt-0.5">
                              {item.subjectName}
                            </span>
                            {item.subtitle && (
                              <span className="text-[11px] text-slate-500 mt-0.5">
                                {item.subtitle}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center">
                    <CalendarClock size={32} className="text-slate-400 mb-3" />
                    <h3 className="text-base font-bold text-slate-700">
                      No schedule
                    </h3>
                    <p className="mt-1 text-[13px] text-slate-500">
                      No timetable entries are available for today.
                    </p>
                  </div>
                )}
              </div>
            </aside>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentDashboard;
