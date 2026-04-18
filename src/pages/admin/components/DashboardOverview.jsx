import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowUpRight,
  BookOpen,
  FileText,
  LoaderCircle,
  Percent,
  Users
} from 'lucide-react';
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
  YAxis
} from 'recharts';

import HeaderComponent from '../../shared/components/HeaderComponent';
import {
  getAllAcademicYears,
  getAllFaculties,
  getDepartments,
  getStudentByDeptStats,
  getStudentStats
} from '../api/admin.api';

const metricStyles = {
  totalFaculty: {
    icon: BookOpen,
    gradient: 'from-[#4B2373] to-[#25103A]'
  },
  totalStudents: {
    icon: Users,
    gradient: 'from-[#195A2B] to-[#0D3016]'
  },
  totalDepartments: {
    icon: Percent,
    gradient: 'from-[#6E1C38] to-[#3A0D1D]'
  }
};

const getInitials = (name = '') =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((value) => value[0]?.toUpperCase() || '')
    .join('');

const buildFacultyCategoryName = (faculty) =>
  `${faculty?.firstName || ''} ${faculty?.lastName || ''}`.replace(/\s+/g, ' ').trim();

const DashboardOverview = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    const loadDashboard = async () => {
      try {
        setLoading(true);
        setError('');

        const [yearsResponse, departments, facultyResponse] = await Promise.all([
          getAllAcademicYears(),
          getDepartments(),
          getAllFaculties()
        ]);

        const academicYears = yearsResponse?.data?.academicYears || [];
        const academicYear =
          academicYears.find((year) => year.isActive) || academicYears[0] || null;

        const faculties = facultyResponse?.data?.facultyList || [];
        const activeFaculties = faculties.filter(
          (faculty) => faculty?.isActive !== false && faculty?.status !== 'inactive'
        );

        const [studentStatsResponse, studentDepartmentResponse] = academicYear
          ? await Promise.all([
              getStudentStats(academicYear._id),
              getStudentByDeptStats('', academicYear._id)
            ])
          : [{ data: { totalStudents: 0 } }, { data: { departments: [] } }];

        const studentDepartments = studentDepartmentResponse?.data?.departments || [];
        const departmentCodeById = new Map(
          (departments || []).map((department) => [
            String(department._id),
            department.code || department.name || 'N/A'
          ])
        );

        const facultyChartData = (departments || []).map((department) => ({
          name: department.code || department.name || 'N/A',
          value: activeFaculties.filter(
            (faculty) =>
              String(faculty?.departmentId?._id || faculty?.departmentId) ===
              String(department._id)
          ).length
        }));

        const studentsChartData =
          studentDepartments.length > 0
            ? studentDepartments.map((department) => ({
                name:
                  departmentCodeById.get(String(department.departmentId)) ||
                  department.departmentName ||
                  'N/A',
                value: department.totalStudents || 0
              }))
            : (departments || []).map((department) => ({
                name: department.code || department.name || 'N/A',
                value: 0
              }));

        const recentFaculty = [...activeFaculties]
          .sort(
            (left, right) =>
              new Date(right?.createdAt || 0).getTime() -
              new Date(left?.createdAt || 0).getTime()
          )
          .slice(0, 5)
          .map((faculty) => ({
            id: faculty._id,
            name: buildFacultyCategoryName(faculty) || faculty?.employeeId || 'Faculty',
            role: faculty.designation || 'Faculty',
            dept: faculty?.departmentId?.code || 'N/A',
            avatar: faculty?.profileImage || '',
            initials: getInitials(buildFacultyCategoryName(faculty) || 'Faculty')
          }));

        if (!active) return;

        setDashboardData({
          academicYearLabel: academicYear?.name || 'No active academic year',
          cards: [
            {
              key: 'totalFaculty',
              title: 'Total Faculty',
              value: activeFaculties.length
            },
            {
              key: 'totalStudents',
              title: 'Total Students',
              value: studentStatsResponse?.data?.totalStudents || 0
            },
            {
              key: 'totalDepartments',
              title: 'Total Department',
              value: departments?.length || 0
            }
          ],
          facultyChartData,
          studentsChartData,
          recentFaculty
        });
      } catch (err) {
        if (!active) return;
        setError(err?.message || 'Failed to load admin dashboard');
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadDashboard();

    return () => {
      active = false;
    };
  }, []);

  const cards = useMemo(
    () =>
      (dashboardData?.cards || []).map((card) => ({
        ...card,
        ...metricStyles[card.key]
      })),
    [dashboardData]
  );

  if (loading) {
    return (
      <div className="flex h-screen flex-col overflow-hidden bg-[#F8FAFC]">
        <div className="w-full bg-white flex-none z-30 pt-2 pb-1">
          <HeaderComponent title="Dashboard" />
        </div>
        <div className="flex flex-1 items-center justify-center gap-3 text-slate-500">
          <LoaderCircle className="animate-spin" size={22} />
          Loading dashboard...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen flex-col overflow-hidden bg-[#F8FAFC]">
        <div className="w-full bg-white flex-none z-30 pt-2 pb-1">
          <HeaderComponent title="Dashboard" />
        </div>
        <div className="flex flex-1 items-center justify-center px-6 text-center font-medium text-rose-600">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-[#F8FAFC]">
      <div className="w-full bg-white flex-none z-30 pt-2 pb-1">
        <HeaderComponent title="Dashboard" />
      </div>

      <div className="flex-1 flex flex-col p-4 gap-4 overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-none">
          {cards.map((metric) => {
            const Icon = metric.icon;

            return (
              <div
                key={metric.key}
                className={`relative flex flex-col justify-between p-4 h-[100px] rounded-[16px] bg-gradient-to-br ${metric.gradient} shadow-md overflow-hidden text-white`}
              >
                <div className="absolute inset-0 bg-black/10 mix-blend-overlay pointer-events-none" />

                <div className="relative z-10 flex flex-col h-full justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center backdrop-blur-sm shadow-sm">
                      <Icon size={16} className="text-white" />
                    </div>
                    <p className="text-white/80 text-xs font-semibold tracking-wide uppercase">
                      {metric.title}
                    </p>
                  </div>
                  <p className="text-2xl font-bold leading-none">{metric.value}</p>
                </div>

                <div className="absolute bottom-3 right-3 bg-white/10 backdrop-blur-md border border-white/10 px-2 py-1 rounded-md text-[8px] font-semibold flex items-center gap-1 z-10">
                  <FileText size={8} className="text-white/80" />
                  {dashboardData?.academicYearLabel || 'Academic Year'}
                </div>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 flex-1 min-h-0">
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm p-4 flex flex-col min-h-0">
            <div className="flex items-center justify-between mb-2 flex-none">
              <h3 className="text-sm font-bold text-slate-700">
                Faculty In Each department
              </h3>
              <button className="w-7 h-7 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-100 transition">
                <ArrowUpRight size={14} />
              </button>
            </div>

            <div className="flex-1 w-full min-h-0">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={dashboardData?.facultyChartData || []}
                  margin={{ top: 10, right: 10, left: -25, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="colorFaculty" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#86EFAC" stopOpacity={0.6} />
                      <stop offset="95%" stopColor="#86EFAC" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 10, fill: '#94A3B8', fontWeight: 600 }}
                    dy={10}
                  />
                  <YAxis hide domain={['auto', 'auto']} />
                  <Tooltip
                    contentStyle={{
                      borderRadius: '12px',
                      border: 'none',
                      boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'
                    }}
                    cursor={{
                      stroke: '#E2E8F0',
                      strokeWidth: 1,
                      strokeDasharray: '4 4'
                    }}
                  />
                  <Area
                    type="linear"
                    dataKey="value"
                    stroke="#4ADE80"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorFaculty)"
                    activeDot={{
                      r: 5,
                      fill: '#3B82F6',
                      stroke: '#FFFFFF',
                      strokeWidth: 2
                    }}
                    dot={{ r: 3, fill: '#3B82F6', strokeWidth: 0 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 flex flex-col min-h-0">
            <div className="flex items-center justify-between mb-3 flex-none">
              <h3 className="text-sm font-bold text-slate-700">
                Recent Onboarded Faculty
              </h3>
              <button className="w-7 h-7 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-100 transition">
                <ArrowUpRight size={14} />
              </button>
            </div>

            <div className="flex-1 flex flex-col justify-between overflow-hidden">
              {dashboardData?.recentFaculty?.length ? (
                dashboardData.recentFaculty.map((faculty) => (
                  <div
                    key={faculty.id}
                    className="flex items-center justify-between group cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      {faculty.avatar ? (
                        <img
                          src={faculty.avatar}
                          alt={faculty.name}
                          className="w-8 h-8 rounded-full object-cover bg-slate-100 ring-2 ring-transparent group-hover:ring-blue-100 transition-all"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-slate-100 ring-2 ring-transparent group-hover:ring-blue-100 transition-all flex items-center justify-center text-[10px] font-bold text-slate-600">
                          {faculty.initials || 'FA'}
                        </div>
                      )}
                      <div className="min-w-0">
                        <h4 className="truncate text-xs font-bold text-[#1E293B] group-hover:text-blue-600 transition-colors">
                          {faculty.name}
                        </h4>
                        <p className="text-[10px] font-medium text-slate-400 mt-0.5 truncate">
                          {faculty.role}
                        </p>
                      </div>
                    </div>
                    <span className="text-[10px] font-black text-slate-700 tracking-wide">
                      {faculty.dept}
                    </span>
                  </div>
                ))
              ) : (
                <div className="flex flex-1 items-center justify-center text-center text-sm text-slate-400">
                  No faculty records available.
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 flex flex-col flex-1 min-h-0">
          <div className="flex items-center justify-between mb-2 flex-none">
            <h3 className="text-sm font-bold text-slate-700">
              Students In Each department
            </h3>
            <button className="w-7 h-7 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-100 transition">
              <ArrowUpRight size={14} />
            </button>
          </div>

          <div className="w-full flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={dashboardData?.studentsChartData || []}
                margin={{ top: 15, right: 20, left: -25, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="4 4"
                  vertical={false}
                  stroke="#E2E8F0"
                />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fill: '#94A3B8', fontWeight: 600 }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fill: '#94A3B8', fontWeight: 500 }}
                />
                <Tooltip
                  cursor={{ fill: '#F8FAFC' }}
                  contentStyle={{
                    borderRadius: '8px',
                    border: 'none',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                  }}
                />
                <Bar dataKey="value" fill="#0A2540" radius={[4, 4, 0, 0]} barSize={35}>
                  <LabelList
                    dataKey="value"
                    position="top"
                    dy={-5}
                    style={{
                      fontSize: '10px',
                      fill: '#475569',
                      fontWeight: 700
                    }}
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardOverview;
