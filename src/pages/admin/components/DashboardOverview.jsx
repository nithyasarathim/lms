import React, { useEffect, useMemo, useState } from "react";
import {
  ArrowUpRight,
  BookOpen,
  FileText,
  LoaderCircle,
  Percent,
  Users,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import cardBg1 from "../../../assets/cardbg1.svg";
import cardBg2 from "../../../assets/cardbg2.svg";
import cardBg3 from "../../../assets/cardbg3.svg";

import HeaderComponent from "../../shared/components/HeaderComponent";
import {
  getAllAcademicYears,
  getAllFaculties,
  getDepartments,
  getStudentByDeptStats,
  getStudentStats,
} from "../api/admin.api";

const metricStyles = {
  totalFaculty: {
    icon: BookOpen,
    gradient: "from-[#4B2373] to-[#25103A]",
    bgImage: cardBg1,
  },
  totalStudents: {
    icon: Users,
    gradient: "from-[#195A2B] to-[#0D3016]",
    bgImage: cardBg2,
  },
  totalDepartments: {
    icon: Percent,
    gradient: "from-[#6E1C38] to-[#3A0D1D]",
    bgImage: cardBg3,
  },
};

const getInitials = (name = "") =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((value) => value[0]?.toUpperCase() || "")
    .join("");

const buildFacultyCategoryName = (faculty) =>
  `${faculty?.firstName || ""} ${faculty?.lastName || ""}`
    .replace(/\s+/g, " ")
    .trim();

const DashboardOverview = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    const loadDashboard = async () => {
      try {
        setLoading(true);
        const [yearsResponse, departments, facultyResponse] = await Promise.all(
          [getAllAcademicYears(), getDepartments(), getAllFaculties()],
        );
        const academicYears = yearsResponse?.data?.academicYears || [];
        const academicYear =
          academicYears.find((year) => year.isActive) ||
          academicYears[0] ||
          null;
        const faculties = facultyResponse?.data?.facultyList || [];
        const activeFaculties = faculties.filter(
          (f) => f?.isActive !== false && f?.status !== "inactive",
        );

        const [studentStatsResponse, studentDepartmentResponse] = academicYear
          ? await Promise.all([
              getStudentStats(academicYear._id),
              getStudentByDeptStats("", academicYear._id),
            ])
          : [{ data: { totalStudents: 0 } }, { data: { departments: [] } }];

        const studentDepartments =
          studentDepartmentResponse?.data?.departments || [];
        const departmentCodeById = new Map(
          (departments || []).map((d) => [
            String(d._id),
            d.code || d.name || "N/A",
          ]),
        );

        const facultyChartData = (departments || []).map((d) => ({
          name: d.code || d.name || "N/A",
          value: activeFaculties.filter(
            (f) =>
              String(f?.departmentId?._id || f?.departmentId) === String(d._id),
          ).length,
        }));

        const studentsChartData =
          studentDepartments.length > 0
            ? studentDepartments.map((d) => ({
                name:
                  departmentCodeById.get(String(d.departmentId)) ||
                  d.departmentName ||
                  "N/A",
                value: d.totalStudents || 0,
              }))
            : (departments || []).map((d) => ({
                name: d.code || d.name || "N/A",
                value: 0,
              }));

        const recentFaculty = [...activeFaculties]
          .sort(
            (a, b) =>
              new Date(b?.createdAt || 0).getTime() -
              new Date(a?.createdAt || 0).getTime(),
          )
          .slice(0, 6)
          .map((f) => ({
            id: f._id,
            name: buildFacultyCategoryName(f) || f?.employeeId || "Faculty",
            role: f.designation || "Faculty",
            dept: f?.departmentId?.code || "N/A",
            avatar: f?.profileImage || "",
            initials: getInitials(buildFacultyCategoryName(f) || "Faculty"),
          }));

        if (!active) return;
        setDashboardData({
          academicYearLabel: academicYear?.name || "2025-2026 Academic Year",
          cards: [
            {
              key: "totalFaculty",
              title: "Total Faculty",
              value: activeFaculties.length,
            },
            {
              key: "totalStudents",
              title: "Total Students",
              value: studentStatsResponse?.data?.totalStudents || 0,
            },
            {
              key: "totalDepartments",
              title: "Total Departments",
              value: departments?.length || 0,
            },
          ],
          facultyChartData,
          studentsChartData,
          recentFaculty,
        });
      } catch (err) {
        if (active) setError(err?.message || "Failed to load dashboard");
      } finally {
        if (active) setLoading(false);
      }
    };
    loadDashboard();
    return () => {
      active = false;
    };
  }, []);

  const cards = useMemo(
    () =>
      (dashboardData?.cards || []).map((c) => ({
        ...c,
        ...metricStyles[c.key],
      })),
    [dashboardData],
  );

  if (loading)
    return (
      <div className="flex h-screen flex-col overflow-hidden bg-[#F8FAFC]">
        <HeaderComponent title="Dashboard" />
        <div className="flex flex-1 items-center justify-center gap-3 text-slate-500">
          <LoaderCircle className="animate-spin" size={22} />
          <span className="text-sm font-medium">Loading dashboard...</span>
        </div>
      </div>
    );

  if (error)
    return (
      <div className="flex h-screen flex-col overflow-hidden bg-[#F8FAFC]">
        <HeaderComponent title="Dashboard" />
        <div className="flex flex-1 items-center justify-center">
          <div className="text-center">
            <p className="text-red-500 mb-2">Error loading dashboard</p>
            <p className="text-sm text-slate-400">{error}</p>
          </div>
        </div>
      </div>
    );

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-[#F8FAFC]">
      <HeaderComponent title="Dashboard" />

      <div className="flex-1 flex flex-col p-6 gap-5 overflow-hidden min-h-0">
        <div className="grid grid-cols-12 gap-5 flex-1 min-h-0">
          <div className="col-span-12 lg:col-span-8 flex flex-col gap-5 min-h-0">
            <div className="grid grid-cols-3 gap-5 shrink-0">
              {cards.map((metric) => {
                const Icon = metric.icon;
                return (
                  <div
                    key={metric.key}
                    className={`relative flex flex-col justify-between p-4 h-[130px] rounded-2xl bg-gradient-to-br ${metric.gradient} shadow-lg overflow-hidden text-white`}
                  >
                    <div
                      className="absolute inset-0 opacity-[0.12] pointer-events-none"
                      style={{
                        backgroundImage: `url(${metric.bgImage})`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                      }}
                    />
                    <div className="relative z-10 flex flex-col h-full justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-white/15 flex items-center justify-center backdrop-blur-sm">
                          <Icon
                            size={16}
                            className="text-white"
                            strokeWidth={1.5}
                          />
                        </div>
                        <p className="text-white/80 text-[11px] font-black tracking-wider uppercase">
                          {metric.title}
                        </p>
                      </div>
                      <div>
                        <p className="text-3xl font-black leading-none tracking-tight">
                          {metric.value.toLocaleString()}
                        </p>
                        <p className="text-white/40 text-[8px] font-bold uppercase tracking-[0.2em] mt-2 flex items-center gap-1">
                          <FileText size={8} />{" "}
                          {dashboardData?.academicYearLabel}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 flex flex-col flex-1 min-h-0">
              <div className="flex items-center justify-between mb-3 shrink-0">
                <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">
                  Faculty Distribution by Department
                </h3>
                <button className="p-1.5 rounded-xl bg-slate-50 text-slate-400 hover:bg-slate-100 transition-colors">
                  <ArrowUpRight size={14} />
                </button>
              </div>
              <div className="flex-1 min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={dashboardData?.facultyChartData}
                    margin={{ top: 5, right: 5, left: -20, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient
                        id="colorFaculty"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="#22C55E"
                          stopOpacity={0.15}
                        />
                        <stop
                          offset="95%"
                          stopColor="#22C55E"
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>
                    <XAxis
                      dataKey="name"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 9, fill: "#94A3B8", fontWeight: 800 }}
                      dy={8}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 9, fill: "#94A3B8", fontWeight: 700 }}
                    />
                    <Tooltip
                      contentStyle={{
                        borderRadius: "10px",
                        border: "1px solid #E2E8F0",
                        boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                        fontSize: "12px",
                        padding: "8px 12px",
                      }}
                      formatter={(value) => [`${value} Faculty`, "Count"]}
                    />
                    <Area
                      type="monotone"
                      dataKey="value"
                      stroke="#22C55E"
                      strokeWidth={2.5}
                      fill="url(#colorFaculty)"
                      dot={{
                        r: 3,
                        fill: "#22C55E",
                        strokeWidth: 1.5,
                        stroke: "#fff",
                      }}
                      activeDot={{ r: 5, strokeWidth: 1.5, stroke: "#fff" }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <aside className="col-span-12 lg:col-span-4 bg-white rounded-2xl border border-slate-200 shadow-sm p-4 flex flex-col min-h-0">
            <div className="flex items-center justify-between mb-3 shrink-0">
              <div>
                <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">
                  Recent Faculty
                </h3>
                <p className="text-[9px] text-slate-400 font-medium mt-0.5">
                  Last 6 onboarded
                </p>
              </div>
              <button className="p-1.5 rounded-xl bg-slate-50 text-slate-400 hover:bg-slate-100 transition-colors">
                <ArrowUpRight size={14} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto min-h-0 custom-scrollbar space-y-2">
              {dashboardData?.recentFaculty.map((faculty) => (
                <div
                  key={faculty.id}
                  className="flex items-center gap-3 p-2 rounded-xl bg-slate-50/50 hover:bg-white hover:shadow-sm transition-all cursor-pointer group border border-transparent hover:border-slate-200"
                >
                  {faculty.avatar ? (
                    <img
                      src={faculty.avatar}
                      className="w-10 h-10 rounded-xl object-cover shadow-sm group-hover:scale-105 transition-transform"
                      alt={faculty.name}
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#08384F]/10 to-[#08384F]/5 flex items-center justify-center text-[11px] font-black text-[#08384F] shadow-inner">
                      {faculty.initials}
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <h4 className="text-[11px] font-black text-slate-800 truncate mb-0.5 group-hover:text-[#08384F] transition-colors">
                      {faculty.name}
                    </h4>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tight">
                      {faculty.role}
                    </p>
                  </div>
                  <div className="shrink-0 bg-white border border-slate-100 px-2.5 py-1 rounded-lg text-[9px] font-black text-[#08384F] shadow-sm group-hover:bg-[#08384F] group-hover:text-white transition-all uppercase">
                    {faculty.dept}
                  </div>
                </div>
              ))}
            </div>
          </aside>

          {/* Students Distribution Chart - Full width at bottom */}
          <div className="col-span-12 bg-white rounded-2xl border border-slate-200 shadow-sm p-4 flex flex-col shrink-0 h-[260px]">
            <div className="flex items-center justify-between mb-3 shrink-0 flex-wrap gap-2">
              <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">
                Student Distribution by Department
              </h3>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-[#08384F]" />
                  <span className="text-[9px] font-black text-slate-500 uppercase tracking-wider">
                    Total Students
                  </span>
                </div>
                <button className="p-1.5 rounded-xl bg-slate-50 text-slate-400 hover:bg-slate-100 transition-colors">
                  <ArrowUpRight size={14} />
                </button>
              </div>
            </div>
            <div className="flex-1 min-h-0">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={dashboardData?.studentsChartData}
                  margin={{ top: 15, right: 20, left: 0, bottom: 5 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#F1F5F9"
                  />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 10, fill: "#94A3B8", fontWeight: 800 }}
                    dy={8}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 9, fill: "#94A3B8", fontWeight: 700 }}
                  />
                  <Tooltip
                    cursor={{ fill: "#F8FAFC" }}
                    contentStyle={{
                      borderRadius: "10px",
                      border: "1px solid #E2E8F0",
                      boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                      fontSize: "12px",
                      padding: "8px 12px",
                    }}
                    formatter={(value) => [`${value} Students`, "Count"]}
                  />
                  <Bar
                    dataKey="value"
                    fill="#08384F"
                    radius={[6, 6, 0, 0]}
                    barSize={40}
                  >
                    <LabelList
                      dataKey="value"
                      position="top"
                      style={{
                        fontSize: "10px",
                        fontWeight: 900,
                        fill: "#08384F",
                      }}
                      dy={-6}
                    />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `}</style>
    </div>
  );
};

export default DashboardOverview;
