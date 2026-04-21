import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  LoaderCircle,
  X
} from 'lucide-react';

import HeaderComponent from '../../shared/components/HeaderComponent';
import { getMyAttendanceOverview } from '../api/student.api';

const statusLegend = [
  {
    key: 'presentCount',
    label: 'Present',
    bgClass: 'bg-[#A7F3D0]',
    textClass: 'text-emerald-700'
  },
  {
    key: 'absentCount',
    label: 'Absent',
    bgClass: 'bg-[#FDA4AF]',
    textClass: 'text-rose-700'
  },
  {
    key: 'onDutyCount',
    label: 'On Duty',
    bgClass: 'bg-[#38BDF8]',
    textClass: 'text-sky-700'
  }
];

const timelineColorMap = {
  blue: { gradient: 'from-[#4285F4] to-[#2B6CB0]' },
  orange: { gradient: 'from-[#FB923C] to-[#EA580C]' },
  pink: { gradient: 'from-[#F472B6] to-[#DB2777]' },
  green: { gradient: 'from-[#4ADE80] to-[#16A34A]' },
  violet: { gradient: 'from-[#A78BFA] to-[#7C3AED]' },
  red: { gradient: 'from-[#F87171] to-[#DC2626]' }
};

const statusPillMap = {
  Present: 'bg-[#D1FAE5] text-[#059669]',
  Absent: 'bg-[#FFE4E6] text-[#E11D48]',
  'On Duty': 'bg-[#E0F2FE] text-[#0284C7]',
  Break: 'bg-[#FEF3C7] text-[#B45309]',
  Lunch: 'bg-[#EDE9FE] text-[#6D28D9]',
  Holiday: 'bg-[#F3F4F6] text-[#4B5563]',
  'Free Hour': 'bg-[#E5E7EB] text-[#374151]'
};

const weekdayLabels = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];

const pad = (value) => String(value).padStart(2, '0');
const formatDateKey = (date) =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
const formatMonthKey = (date) =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}`;

const getShadowStyle = (color) => {
  switch (color) {
    case 'blue':
      return '0 0 16px 6px rgba(59, 130, 246, 0.28)';
    case 'orange':
      return '0 0 16px 6px rgba(251, 146, 60, 0.28)';
    case 'pink':
      return '0 0 16px 6px rgba(244, 114, 182, 0.28)';
    case 'green':
      return '0 0 16px 6px rgba(74, 222, 128, 0.28)';
    case 'violet':
      return '0 0 16px 6px rgba(167, 139, 250, 0.28)';
    case 'red':
      return '0 0 16px 6px rgba(248, 113, 113, 0.28)';
    default:
      return 'none';
  }
};

const buildDateFromMonth = (baseDate, monthDelta) =>
  new Date(baseDate.getFullYear(), baseDate.getMonth() + monthDelta, 1);

const StudentAttendance = () => {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(
    new Date(today.getFullYear(), today.getMonth(), 1)
  );
  const [selectedDate, setSelectedDate] = useState(today);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [attendanceOverview, setAttendanceOverview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [drawerLoading, setDrawerLoading] = useState(false);
  const [error, setError] = useState('');

  const calendarDays = useMemo(() => {
    const monthStart = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth(),
      1
    );
    const startDayOffset = (monthStart.getDay() + 6) % 7;
    const gridStart = new Date(monthStart);
    gridStart.setDate(monthStart.getDate() - startDayOffset);

    return Array.from({ length: 35 }, (_, index) => {
      const cellDate = new Date(gridStart);
      cellDate.setDate(gridStart.getDate() + index);
      return cellDate;
    });
  }, [currentMonth]);

  useEffect(() => {
    let ignore = false;

    const fetchAttendance = async () => {
      const monthKey = formatMonthKey(currentMonth);
      const dateKey = formatDateKey(selectedDate);
      const sameMonthSelection =
        selectedDate.getMonth() === currentMonth.getMonth() &&
        selectedDate.getFullYear() === currentMonth.getFullYear();

      try {
        setError('');
        if (isDrawerOpen && sameMonthSelection) {
          setDrawerLoading(true);
        } else {
          setLoading(true);
        }

        const response = await getMyAttendanceOverview({
          month: monthKey,
          date: sameMonthSelection ? dateKey : `${monthKey}-01`
        });

        if (!ignore) {
          setAttendanceOverview(response?.data || null);
        }
      } catch (err) {
        if (!ignore) {
          setError(err?.message || 'Failed to load attendance overview');
        }
      } finally {
        if (!ignore) {
          setLoading(false);
          setDrawerLoading(false);
        }
      }
    };

    fetchAttendance();

    return () => {
      ignore = true;
    };
  }, [currentMonth, selectedDate]);

  const handleDateSelect = (date) => {
    if (
      date.getMonth() !== currentMonth.getMonth() ||
      date.getFullYear() !== currentMonth.getFullYear()
    ) {
      setCurrentMonth(new Date(date.getFullYear(), date.getMonth(), 1));
    }
    setSelectedDate(date);
    setIsDrawerOpen(true);
  };

  const closeDrawer = () => setIsDrawerOpen(false);

  const handleMonthChange = (delta) => {
    const nextMonth = buildDateFromMonth(currentMonth, delta);
    setCurrentMonth(nextMonth);
    setSelectedDate(new Date(nextMonth.getFullYear(), nextMonth.getMonth(), 1));
    setIsDrawerOpen(false);
  };

  const selectedDateKey = formatDateKey(selectedDate);
  const selectedDateData =
    attendanceOverview?.calendarByDate?.[selectedDateKey] || null;
  const dayView = attendanceOverview?.dayView || {
    schedule: [],
    calendarStatus: null
  };
  const scheduleItems = dayView?.schedule || [];

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-[#F8FAFC]">
      <div className="w-full sticky top-0 pt-3 z-30 bg-white flex-none">
        <HeaderComponent title="Student Attendance" />
      </div>

      {/* Changed to flex-1 overflow-hidden min-h-0 to prevent scrolling */}
      <div className="flex-1 overflow-hidden flex flex-col p-4 md:p-6 min-h-0">
        <div className="flex-1 bg-white rounded-[24px] border border-slate-200 shadow-sm flex flex-col overflow-hidden min-h-0">
          <div className="flex-none flex items-center justify-between px-6 md:px-8 py-4 md:py-5 border-b border-slate-100">
            <div>
              <h2 className="text-lg font-bold text-[#2D3748]">
                My Attendance Calendar
              </h2>
              <p className="text-sm text-slate-500 mt-1 hidden md:block">
                Working days, holidays, and your daily attendance summary.
              </p>
            </div>
            <div className="flex items-center gap-2 md:gap-4">
              <button
                onClick={() => handleMonthChange(-1)}
                className="p-2 border border-slate-200 rounded-xl hover:bg-slate-50"
              >
                <ArrowLeft size={18} />
              </button>
              <span className="text-base md:text-lg font-bold text-[#2D3748] min-w-[140px] md:min-w-[180px] text-center">
                {currentMonth.toLocaleString('en-US', {
                  month: 'long',
                  year: 'numeric'
                })}
              </span>
              <button
                onClick={() => handleMonthChange(1)}
                className="p-2 border border-slate-200 rounded-xl hover:bg-slate-50"
              >
                <ArrowRight size={18} />
              </button>
            </div>
          </div>

          <div className="flex-none grid grid-cols-7 bg-slate-50/50 border-b border-slate-100">
            {weekdayLabels.map((label) => (
              <div
                key={label}
                className="py-2 md:py-3 px-2 md:px-6 text-center md:text-left text-[10px] md:text-[11px] font-black text-slate-400 tracking-widest"
              >
                {label}
              </div>
            ))}
          </div>

          {loading ? (
            <div className="flex-1 flex items-center justify-center gap-3 text-slate-500">
              <LoaderCircle className="animate-spin" size={20} />
              Loading attendance calendar...
            </div>
          ) : error ? (
            <div className="flex-1 flex items-center justify-center text-rose-600 font-medium px-6 text-center">
              {error}
            </div>
          ) : (
            /* Changed auto-rows-fr to grid-rows-5 to strictly enforce 5 uniform rows spanning available height */
            <div className="flex-1 grid grid-cols-7 grid-rows-5 min-h-0">
              {calendarDays.map((date, idx) => {
                const dateKey = formatDateKey(date);
                const dayData = attendanceOverview?.calendarByDate?.[dateKey];
                const isCurrentMonth =
                  date.getMonth() === currentMonth.getMonth();
                const isSelected = dateKey === selectedDateKey;
                const isHoliday =
                  Boolean(dayData) && dayData.isWorkingDay === false;

                return (
                  <button
                    key={idx}
                    onClick={() => handleDateSelect(date)}
                    className={`
                      relative border-r border-b border-slate-100 p-2 md:p-3 transition-all
                      flex flex-col justify-between items-start
                      h-full w-full text-left overflow-hidden
                      ${isSelected ? 'bg-[#E7F0FF] z-10 ring-2 ring-blue-500 ring-inset' : 'bg-white hover:bg-slate-50'}
                      ${!isCurrentMonth ? 'opacity-40' : ''}
                    `}
                  >
                    <div className="w-full flex items-start justify-between gap-1">
                      <span
                        className={`text-lg md:text-2xl font-semibold leading-none ${isCurrentMonth ? 'text-[#1E293B]' : 'text-slate-300'}`}
                      >
                        {date.getDate()}
                      </span>
                      {dayData && isHoliday && (
                        <span
                          className={`px-1.5 md:px-2 py-0.5 md:py-1 rounded-full text-[8px] md:text-[9px] font-black tracking-wide uppercase leading-none ${
                            isHoliday && 'bg-rose-100 text-rose-700'
                          }`}
                        >
                          {isHoliday && 'Leave'}
                        </span>
                      )}
                    </div>

                    {/* mt-auto pushes the data to the bottom. Same cell height regardless of content! */}
                    <div className="w-full flex flex-col items-end gap-1 mt-auto">
                      {dayData?.totalCount > 0 ? (
                        statusLegend.map((item) => (
                          <div
                            key={item.key}
                            className="flex items-center gap-1.5 text-[9px] md:text-[10px] font-bold uppercase tracking-tighter"
                          >
                            <div
                              className={`w-2 h-2 md:w-2.5 md:h-2.5 rounded-sm md:rounded-md ${item.bgClass}`}
                            />
                            <span className="text-slate-600 hidden md:inline-block">
                              {item.label}
                            </span>
                            <span className="text-slate-600 inline-block md:hidden">
                              {item.label.charAt(0)}
                            </span>
                            <span className="text-slate-800 font-black min-w-[16px] md:min-w-[20px] text-right">
                              {pad(dayData[item.key] || 0)}
                            </span>
                          </div>
                        ))
                      ) : (
                        <span className="text-[9px] md:text-[10px] font-semibold text-slate-400 text-right w-full truncate">
                          {isHoliday
                            ? dayData?.reasonForHoliday || 'Holiday'
                            : 'No attendance'}
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {isDrawerOpen && (
        <div
          className="fixed inset-0 bg-slate-950/35 z-[80] transition-opacity duration-300"
          onClick={closeDrawer}
        />
      )}

      <div
        className={`
          fixed top-0 bottom-0 right-0 w-full max-w-[460px]
          bg-gradient-to-b from-white to-[#E7F4FF]
          shadow-2xl border-l border-white flex flex-col z-[90]
          transition-transform duration-300 ease-out
          ${isDrawerOpen ? 'translate-x-0' : 'translate-x-full'}
        `}
      >
        <div className="p-6 flex items-start justify-between border-b border-slate-100/60">
          <div className="pr-4">
            <h3 className="text-lg font-bold text-[#1E293B]">
              Attendance - {selectedDate.getDate()}/
              {selectedDate.getMonth() + 1}/{selectedDate.getFullYear()}
            </h3>

            <div className="flex flex-wrap gap-3 mt-3 text-xs text-slate-600">
              {selectedDateData && (
                <>
                  <span className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-md bg-[#A7F3D0]" />
                    P: {selectedDateData.presentCount || 0}
                  </span>
                  <span className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-md bg-[#FDA4AF]" />
                    A: {selectedDateData.absentCount || 0}
                  </span>
                  <span className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-md bg-[#38BDF8]" />
                    OD: {selectedDateData.onDutyCount || 0}
                  </span>
                </>
              )}
              {dayView?.calendarStatus && (
                <span className="px-2.5 py-1 rounded-full bg-white/80 border border-slate-200 text-slate-700 font-semibold">
                  {dayView.calendarStatus.isWorkingDay
                    ? 'Working Day'
                    : dayView.calendarStatus.reasonForHoliday || 'Holiday'}
                </span>
              )}
            </div>
          </div>

          <button
            onClick={closeDrawer}
            className="p-2 bg-white rounded-full shadow-sm hover:text-red-500 transition shrink-0"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 pb-6">
          {drawerLoading ? (
            <div className="h-full flex items-center justify-center gap-3 text-slate-500">
              <LoaderCircle className="animate-spin" size={20} />
              Loading day schedule...
            </div>
          ) : !dayView?.calendarStatus?.isWorkingDay ? (
            <div className="h-full flex flex-col items-center justify-center text-center px-6">
              <CalendarDays size={44} className="text-slate-300 mb-4" />
              <h4 className="text-lg font-bold text-slate-700">
                No classes today
              </h4>
              <p className="text-sm text-slate-500 mt-2">
                {dayView?.calendarStatus?.reasonForHoliday ||
                  'This date is marked as a holiday.'}
              </p>
            </div>
          ) : scheduleItems.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center px-6">
              <CalendarDays size={44} className="text-slate-300 mb-4" />
              <h4 className="text-lg font-bold text-slate-700">
                Timetable not available
              </h4>
              <p className="text-sm text-slate-500 mt-2">
                No timetable entries were found for this day.
              </p>
            </div>
          ) : (
            <div className="relative border-l-2 border-dashed border-sky-200 ml-4 pl-8 space-y-8 py-6">
              {scheduleItems.map((item, index) => {
                const colorStyle =
                  timelineColorMap[item.colorToken] || timelineColorMap.blue;

                const pillLabel =
                  item.type === 'break'
                    ? 'Break'
                    : item.type === 'lunch'
                      ? 'Lunch'
                      : item.attendanceLabel || 'Free Hour';

                return (
                  <div key={`${item.slotOrder}-${index}`} className="relative">
                    <div
                      style={{ boxShadow: getShadowStyle(item.colorToken) }}
                      className={`
                        absolute -left-[45px] top-1 w-6 h-6 rounded-full
                        bg-gradient-to-br ${colorStyle.gradient}
                        ring-6 ring-white transition-all duration-200
                      `}
                    />

                    <div className="space-y-2">
                      <p className="text-sm font-bold text-slate-700">
                        {item.displayTime}
                      </p>
                      <p className="text-sm font-semibold text-slate-700">
                        {item.subjectName || item.title}
                      </p>

                      {(item.subjectCode ||
                        item.componentName ||
                        item.facultyName) && (
                        <p className="text-sm font-medium text-slate-500">
                          {[
                            item.subjectCode,
                            item.componentName,
                            item.facultyName
                          ]
                            .filter(Boolean)
                            .join(' / ')}
                        </p>
                      )}

                      {item.venue && (
                        <p className="text-xs font-medium text-slate-400">
                          Venue: {item.venue}
                        </p>
                      )}

                      {item.remarks && (
                        <p className="text-xs font-medium text-slate-400">
                          Remarks: {item.remarks}
                        </p>
                      )}

                      <div className="pt-1">
                        <span
                          className={`px-4 py-1 rounded-lg text-xs font-bold ${
                            statusPillMap[pillLabel] ||
                            'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {pillLabel}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentAttendance;
