import React, { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import {
  ArrowUpRight,
  BookOpen,
  Check,
  FileText,
  LoaderCircle,
  Percent,
  Users,
  X
} from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';

import HeaderComponent from '../../shared/components/HeaderComponent';
import {
  getAllAcademicYears,
  getAllFaculties,
  getAttendanceRequests,
  getStudentStats,
  resolveAttendanceRequest
} from '../api/hod.api';

const studentPieColors = ['#3B82F6', '#FCD34D', '#FB923C', '#F472B6'];

const metricStyles = {
  totalFaculty: {
    icon: BookOpen,
    gradient: 'from-[#4B2373] to-[#25103A]'
  },
  totalStudents: {
    icon: Users,
    gradient: 'from-[#195A2B] to-[#0D3016]'
  },
  departmentAttendancePercentage: {
    icon: Percent,
    gradient: 'from-[#6E1C38] to-[#3A0D1D]'
  }
};

const getStoredUser = () => {
  try {
    return JSON.parse(localStorage.getItem('lms-user') || '{}');
  } catch (error) {
    return {};
  }
};

const getInitials = (name = '') =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((value) => value[0]?.toUpperCase() || '')
    .join('');

const buildFullName = (person) =>
  `${person?.salutation || ''} ${person?.firstName || ''} ${person?.lastName || ''}`
    .replace(/\s+/g, ' ')
    .trim();

const getAttendanceCardSubtitle = (request) => {
  const attendance = request?.attendanceRecord || {};
  const classroom = attendance?.classroom || {};
  const component =
    attendance?.subjectComponent ||
    attendance?.timetableEntry?.facultyAssignmentId?.subjectComponentId;
  const subject = component?.subjectId || classroom?.subjectId || {};
  const sectionName = classroom?.sectionId?.name || 'Section';

  return `${sectionName} / ${subject?.shortName || subject?.code || subject?.name || 'Subject'}`;
};

const getFacultyCategory = (designation = '') => {
  const normalized = String(designation).toLowerCase();

  if (normalized.includes('associate')) return 'Associate';
  if (normalized.includes('assistant')) return 'Assistant';
  if (normalized === 'professor' || normalized.includes('professor of practice')) {
    return 'Professor';
  }

  return 'Trainee';
};

const Dashboard = () => {
  const storedUser = useMemo(() => getStoredUser(), []);
  const departmentId = storedUser?.departmentId;

  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [resolvingId, setResolvingId] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let active = true;

    const loadDashboard = async () => {
      if (!departmentId) {
        setError('Unable to resolve department for this HOD account.');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError('');

        const [yearsResponse, facultyResponse, attendanceResponse] = await Promise.all([
          getAllAcademicYears(),
          getAllFaculties({ departmentId }),
          getAttendanceRequests('Pending')
        ]);

        const academicYears = yearsResponse?.data?.academicYears || [];
        const academicYear =
          academicYears.find((year) => year.isActive) || academicYears[0] || null;
        const faculties = facultyResponse?.data?.facultyList || [];
        const activeFaculties = faculties.filter(
          (faculty) => faculty?.isActive !== false && faculty?.status !== 'inactive'
        );
        const studentStatsResponse = academicYear
          ? await getStudentStats(academicYear._id, departmentId)
          : { data: { totalStudents: 0, yearWise: {} } };

        const yearWise = studentStatsResponse?.data?.yearWise || {};
        const studentPieData = [
          { name: 'First Year', value: yearWise.firstYear || 0, color: studentPieColors[0] },
          { name: 'Second Year', value: yearWise.secondYear || 0, color: studentPieColors[1] },
          { name: 'Third Year', value: yearWise.thirdYear || 0, color: studentPieColors[2] },
          { name: 'Fourth Year', value: yearWise.fourthYear || 0, color: studentPieColors[3] }
        ];

        const facultyCategoryCounts = activeFaculties.reduce(
          (accumulator, faculty) => {
            const key = getFacultyCategory(faculty?.designation);
            accumulator[key] += 1;
            return accumulator;
          },
          { Associate: 0, Assistant: 0, Professor: 0, Trainee: 0 }
        );

        const facultyBarData = [
          { name: 'Associate', value: facultyCategoryCounts.Associate },
          { name: 'Assistant', value: facultyCategoryCounts.Assistant },
          { name: 'Professor', value: facultyCategoryCounts.Professor },
          { name: 'Trainee', value: facultyCategoryCounts.Trainee }
        ];

        const onboardedFaculty = [...activeFaculties]
          .sort(
            (left, right) =>
              new Date(right?.createdAt || 0).getTime() -
              new Date(left?.createdAt || 0).getTime()
          )
          .slice(0, 4)
          .map((faculty, index) => ({
            id: faculty._id,
            name: buildFullName(faculty) || faculty?.employeeId || 'Faculty',
            role: faculty?.designation || 'Faculty',
            avatar: faculty?.profileImage || '',
            initials: getInitials(buildFullName(faculty) || 'Faculty'),
            active: index === 0
          }));

        const attendanceRequests = (attendanceResponse?.data?.requests || [])
          .slice(0, 5)
          .map((request) => ({
            id: request._id,
            name: buildFullName(request?.faculty) || 'Faculty',
            role: getAttendanceCardSubtitle(request),
            avatar: '',
            initials: getInitials(buildFullName(request?.faculty) || 'Faculty')
          }));

        if (!active) return;

        setDashboardData({
          academicYearLabel: academicYear?.name || 'No active academic year',
          topMetrics: [
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
              key: 'departmentAttendancePercentage',
              title: 'Department Attendance Percentage',
              value: '07'
            }
          ],
          studentPieData,
          facultyBarData,
          onboardedFaculty,
          attendanceRequests
        });
      } catch (err) {
        if (!active) return;
        setError(err?.message || 'Failed to load HOD dashboard');
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
  }, [departmentId, refreshKey]);

  const topMetrics = useMemo(
    () =>
      (dashboardData?.topMetrics || []).map((metric) => ({
        ...metric,
        ...metricStyles[metric.key]
      })),
    [dashboardData]
  );

  const handleResolve = async (requestId, status) => {
    try {
      setResolvingId(requestId);
      await resolveAttendanceRequest({ requestId, status });
      toast.success(`Request ${status.toLowerCase()}`);
      setRefreshKey((current) => current + 1);
    } catch (err) {
      toast.error(err?.message || 'Failed to resolve request');
    } finally {
      setResolvingId('');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col h-screen overflow-hidden bg-[#F8FAFC]">
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
      <div className="flex flex-col h-screen overflow-hidden bg-[#F8FAFC]">
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

      <div className="flex-1 flex flex-row p-4 gap-4 overflow-hidden min-h-0">
        <div className="flex-1 flex flex-col gap-4 min-h-0">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-none h-[100px]">
            {topMetrics.map((metric) => {
              const Icon = metric.icon;

              return (
                <div
                  key={metric.key}
                  className={`relative flex flex-col justify-between p-4 rounded-[16px] bg-gradient-to-br ${metric.gradient} shadow-sm overflow-hidden text-white`}
                >
                  <div className="absolute inset-0 bg-black/10 mix-blend-overlay pointer-events-none" />
                  <div className="relative z-10 flex flex-col h-full justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center backdrop-blur-sm">
                        <Icon size={16} className="text-white" />
                      </div>
                      <p className="text-white/80 text-[11px] font-semibold tracking-wide">
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

          <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4 min-h-0">
            <div className="col-span-1 bg-white rounded-2xl border border-slate-200 shadow-sm p-4 flex flex-col min-h-0">
              <div className="flex items-center justify-between mb-2 flex-none">
                <h3 className="text-sm font-bold text-slate-700">Students Overview</h3>
                <button className="w-7 h-7 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-100 transition">
                  <ArrowUpRight size={14} />
                </button>
              </div>

              <div className="flex-1 w-full min-h-0 flex flex-col items-center justify-center relative pb-2">
                <ResponsiveContainer width="100%" height="65%">
                  <PieChart>
                    <Pie
                      data={dashboardData?.studentPieData || []}
                      innerRadius="65%"
                      outerRadius="90%"
                      paddingAngle={2}
                      dataKey="value"
                      stroke="none"
                    >
                      {(dashboardData?.studentPieData || []).map((entry) => (
                        <Cell key={entry.name} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        borderRadius: '8px',
                        border: 'none',
                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>

                <div className="flex-none flex flex-col gap-2 mt-4 w-full px-6">
                  {(dashboardData?.studentPieData || []).map((item) => (
                    <div key={item.name} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-3 h-3 rounded-sm"
                          style={{ backgroundColor: item.color }}
                        />
                        <span className="text-slate-500 font-medium">{item.name}</span>
                      </div>
                      <span className="font-bold text-slate-700">
                        - {item.value} Members
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm p-4 flex flex-col min-h-0">
              <div className="flex items-center justify-between mb-4 flex-none">
                <h3 className="text-sm font-bold text-slate-700">Faculty Overview</h3>
                <button className="w-7 h-7 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-100 transition">
                  <ArrowUpRight size={14} />
                </button>
              </div>

              <div className="w-full flex-1 min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={dashboardData?.facultyBarData || []}
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
                      tick={{ fontSize: 11, fill: '#94A3B8', fontWeight: 600 }}
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
                    <Bar dataKey="value" fill="#0A2540" radius={[4, 4, 0, 0]} barSize={40}>
                      <LabelList
                        dataKey="value"
                        position="top"
                        dy={-5}
                        style={{
                          fontSize: '11px',
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

        <div className="w-[320px] flex-none flex flex-col gap-4 min-h-0">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 flex flex-col flex-1 min-h-0">
            <div className="flex items-center justify-between mb-4 flex-none">
              <h3 className="text-sm font-bold text-slate-700">
                Recently Onboarded Faculty
              </h3>
              <button className="w-7 h-7 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-100 transition">
                <ArrowUpRight size={14} />
              </button>
            </div>

            <div className="flex-1 overflow-hidden flex flex-col gap-1">
              {dashboardData?.onboardedFaculty?.length ? (
                dashboardData.onboardedFaculty.map((faculty) => (
                  <div
                    key={faculty.id}
                    className={`flex items-center gap-3 p-2 rounded-xl transition-colors cursor-pointer ${
                      faculty.active
                        ? 'bg-slate-50 shadow-sm border border-slate-100'
                        : 'hover:bg-slate-50'
                    }`}
                  >
                    {faculty.avatar ? (
                      <img
                        src={faculty.avatar}
                        alt={faculty.name}
                        className="w-9 h-9 rounded-full object-cover bg-slate-200"
                      />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-600">
                        {faculty.initials || 'FA'}
                      </div>
                    )}
                    <div className="min-w-0">
                      <h4 className="truncate text-xs font-bold text-slate-800">
                        {faculty.name}
                      </h4>
                      <p className="truncate text-[10px] text-slate-400 font-medium">
                        {faculty.role}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex flex-1 items-center justify-center text-center text-sm text-slate-400">
                  No faculty records available.
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 flex flex-col flex-1 min-h-0">
            <div className="flex items-center justify-between mb-4 flex-none">
              <h3 className="text-sm font-bold text-slate-700">
                Recent attendance request
              </h3>
              <button className="w-7 h-7 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-100 transition">
                <ArrowUpRight size={14} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-3 min-h-0">
              {dashboardData?.attendanceRequests?.length ? (
                dashboardData.attendanceRequests.map((request) => (
                  <div key={request.id} className="flex items-center justify-between group">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-full object-cover bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-600">
                        {request.initials || 'AT'}
                      </div>
                      <div className="min-w-0">
                        <h4 className="truncate text-xs font-bold text-slate-800">
                          {request.name}
                        </h4>
                        <p className="text-[10px] text-slate-400 font-medium line-clamp-1 pr-2">
                          {request.role}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-none">
                      <button
                        onClick={() => handleResolve(request.id, 'Approved')}
                        disabled={resolvingId === request.id}
                        className="w-6 h-6 rounded-full bg-green-50 text-green-500 flex items-center justify-center hover:bg-green-100 transition disabled:opacity-50"
                      >
                        {resolvingId === request.id ? (
                          <LoaderCircle size={12} className="animate-spin" />
                        ) : (
                          <Check size={12} strokeWidth={3} />
                        )}
                      </button>
                      <button
                        onClick={() => handleResolve(request.id, 'Rejected')}
                        disabled={resolvingId === request.id}
                        className="w-6 h-6 rounded-full bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-100 transition disabled:opacity-50"
                      >
                        {resolvingId === request.id ? (
                          <LoaderCircle size={12} className="animate-spin" />
                        ) : (
                          <X size={12} strokeWidth={3} />
                        )}
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex flex-1 items-center justify-center text-center text-sm text-slate-400">
                  No pending attendance requests.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
