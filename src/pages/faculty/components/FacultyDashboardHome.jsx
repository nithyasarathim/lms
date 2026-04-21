import React from "react";
import cardBg1 from "../../../assets/cardbg1.svg";
import cardBg2 from "../../../assets/cardbg2.svg";
import cardBg3 from "../../../assets/cardbg3.svg";
import HeaderComponent from "../../shared/components/HeaderComponent";

const FacultyDashboardHome = () => {
  const attendanceData = [
    ["82%", "42%", "85%", "12%", "87%", "90%"],
    ["32%", "83%", "87%", "97%", "92%", "82%"],
    ["92%", "82%", "72%", "62%", "92%", null],
    ["82%", "62%", "92%", "85%", null, "82%"],
    ["72%", "84%", null, null, "32%", "82%"],
    ["83%", "42%", "82%", "81%", "92%", "22%"],
    ["84%", "85%", "22%", "86%", "20%", "12%"],
  ];

  const getColor = (val) => {
    if (!val) return "bg-gray-200";
    const num = parseInt(val);
    if (num >= 80) return "bg-green-200 text-green-800";
    if (num >= 50) return "bg-blue-200 text-blue-800";
    return "bg-pink-200 text-pink-800";
  };

  const cards = [
    {
      label: "Total Classes",
      val: "12",
      bg: cardBg1,
      gradient:
        "linear-gradient(to bottom right, rgba(76, 29, 149, 0.85), rgba(46, 16, 101, 0.9))",
    },
    {
      label: "Total Students",
      val: "54",
      bg: cardBg2,
      gradient:
        "linear-gradient(to bottom right, rgba(20, 83, 45, 0.85), rgba(6, 78, 59, 0.9))",
    },
    {
      label: "Overall Pass Percentage",
      val: "90%",
      bg: cardBg3,
      gradient:
        "linear-gradient(to bottom right, rgba(131, 24, 67, 0.85), rgba(80, 7, 36, 0.9))",
    },
  ];

  return (
    <div className="flex flex-col bg-[#F3F7FF] min-h-screen text-slate-800">
      <HeaderComponent title="Faculty Dashboard" />

      <div className="flex px-6">
        <div className="flex-1 pr-6">
          <div className="grid grid-cols-3 gap-6 mb-8">
            {cards.map((card, i) => (
              <div
                key={i}
                className="relative h-40 rounded-2xl overflow-hidden text-white p-6 shadow-xl"
              >
                <img
                  src={card.bg}
                  className="absolute inset-0 w-full h-full object-cover"
                  alt="bg"
                />
                <div
                  className="absolute inset-0 z-0"
                  style={{ background: card.gradient }}
                ></div>
                <div className="relative z-10 flex flex-col justify-between h-full">
                  <div>
                    <p className="text-sm font-medium opacity-90">
                      {card.label}
                    </p>
                    <p className="text-4xl font-bold">{card.val}</p>
                  </div>
                  <span className="text-[10px] bg-white/20 backdrop-blur-sm self-start px-2 py-1 rounded-md border border-white/10">
                    2025-2026 Academic Year
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-5 gap-6">
            <div className="col-span-2 bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
              <div className="flex justify-between items-center mb-6">
                <h2 className="font-bold">Student Attendance Overview</h2>
                <span className="text-xs text-gray-400">Past 7 Days ↗</span>
              </div>
              <div className="grid grid-cols-7 gap-2 text-center text-[10px]">
                <div />
                {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
                  <div key={d} className="text-gray-400 font-medium">
                    {d}
                  </div>
                ))}
                {attendanceData.map((row, i) => (
                  <React.Fragment key={i}>
                    <div className="text-gray-400 self-center font-medium">
                      {i + 1}st
                    </div>
                    {row.map((cell, j) => (
                      <div
                        key={j}
                        className={`h-10 flex items-center justify-center rounded-lg font-bold transition-all hover:scale-105 ${getColor(cell)}`}
                      >
                        {cell}
                      </div>
                    ))}
                  </React.Fragment>
                ))}
              </div>
              <div className="flex gap-4 mt-8 text-[10px] justify-center text-gray-500">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-green-200"></span>{" "}
                  80-90%+ Good
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-pink-200"></span>{" "}
                  &lt;50 Poor
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-blue-200"></span>{" "}
                  50-80% Average
                </div>
              </div>
            </div>

            <div className="col-span-3 bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
              <h2 className="font-bold mb-6">
                Students Pass Percentage Overview
              </h2>
              <div className="flex flex-col items-center">
                <div className="relative w-48 h-48 mb-10">
                  <div className="absolute inset-0 rounded-full border-[18px] border-blue-50"></div>
                  <div className="absolute inset-0 rounded-full border-[18px] border-blue-500 border-t-transparent border-r-transparent rotate-45"></div>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-4xl font-bold text-slate-700">
                      90%
                    </span>
                    <span className="text-xs text-gray-400 font-medium">
                      Average
                    </span>
                  </div>
                </div>
                <div className="w-full space-y-5 px-4">
                  {[
                    { label: "Cyber Security", val: 90, color: "bg-blue-500" },
                    { label: "C Programming", val: 87, color: "bg-blue-400" },
                    { label: "Mathematics", val: 63, color: "bg-blue-300" },
                    { label: "English", val: 53, color: "bg-blue-200" },
                  ].map((item) => (
                    <div key={item.label}>
                      <div className="flex justify-between text-[11px] mb-1.5">
                        <span className="font-bold text-slate-600">
                          {item.label}
                        </span>
                        <span className="font-bold">{item.val}%</span>
                      </div>
                      <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${item.color} rounded-full`}
                          style={{ width: `${item.val}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="w-80 bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
          <h2 className="font-bold mb-8">Today Schedule</h2>
          <div className="relative border-l-2 border-dashed border-gray-200 ml-2 space-y-10">
            {[
              { color: "bg-blue-500" },
              { color: "bg-orange-400" },
              { color: "bg-pink-400" },
              { color: "bg-green-500" },
              { color: "bg-purple-500" },
              { color: "bg-orange-600" },
              { color: "bg-blue-600" },
            ].map((item, i) => (
              <div key={i} className="relative pl-8 group">
                <div
                  className={`absolute -left-[9px] top-1.5 w-4 h-4 rounded-full border-2 border-white ring-4 ring-white shadow-md transition-transform group-hover:scale-110 ${item.color}`}
                ></div>
                <p className="text-sm font-bold text-slate-800 mb-1">
                  09:00AM-12:00PM
                </p>
                <p className="text-xs text-gray-500 leading-relaxed">
                  <span className="font-bold text-slate-700">
                    Cybersecurity
                  </span>{" "}
                  <br />
                  3rd year (CSE-A)
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FacultyDashboardHome;
