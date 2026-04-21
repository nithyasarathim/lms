import React, { useState, useEffect } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  X,
  Loader2,
  CheckCircle2
} from 'lucide-react';
import HeaderComponent from '../../shared/components/HeaderComponent';
import {
  getAcademicCalendarEntries,
  createAcademicCalendarEntry,
  updateAcademicCalendarEntry,
  deleteAcademicCalendarEntry
} from '../api/admin.api.js';

const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December'
];

const getLocalISODate = (date) => {
  const offset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offset).toISOString().split('T')[0];
};

const AcademicCalendarManagement = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [entriesMap, setEntriesMap] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDateStr, setSelectedDateStr] = useState('');
  const [formData, setFormData] = useState({
    isWorkingDay: true,
    reasonForHoliday: ''
  });
  const [editingEntryId, setEditingEntryId] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchMonthData();
  }, [currentDate.getMonth(), currentDate.getFullYear()]);

  const fetchMonthData = async () => {
    setIsLoading(true);
    try {
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth();
      const startDate = getLocalISODate(new Date(year, month, 1));
      const endDate = getLocalISODate(new Date(year, month + 1, 0));
      const res = await getAcademicCalendarEntries({ startDate, endDate });
      const mapped = {};
      res.data.entries.forEach((entry) => {
        mapped[entry.dateString] = entry;
      });
      setEntriesMap(mapped);
    } catch (error) {
      console.error('Failed to fetch calendar data', error);
    } finally {
      setIsLoading(false);
    }
  };

  const nextMonth = () =>
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1)
    );
  const prevMonth = () =>
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1)
    );
  const goToday = () => setCurrentDate(new Date());

  const handleDayClick = (day) => {
    const clickedDate = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      day
    );
    const dateStr = getLocalISODate(clickedDate);
    const existing = entriesMap[dateStr];
    setSelectedDateStr(dateStr);

    if (existing) {
      setEditingEntryId(existing._id);
      setFormData({
        isWorkingDay: existing.isWorkingDay,
        reasonForHoliday: existing.reasonForHoliday || ''
      });
    } else {
      const isWeekend = clickedDate.getDay() === 0;
      setEditingEntryId(null);
      setFormData({
        isWorkingDay: !isWeekend,
        reasonForHoliday: isWeekend ? 'Sunday' : ''
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const payload = {
        date: selectedDateStr,
        isWorkingDay: formData.isWorkingDay,
        reasonForHoliday: formData.isWorkingDay
          ? null
          : formData.reasonForHoliday
      };
      if (editingEntryId) {
        await updateAcademicCalendarEntry(editingEntryId, payload);
      } else {
        await createAcademicCalendarEntry(payload);
      }
      setIsModalOpen(false);
      fetchMonthData();
    } catch (error) {
      console.error('Failed to save entry', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!editingEntryId) return;
    setIsSaving(true);
    try {
      await deleteAcademicCalendarEntry(editingEntryId);
      setIsModalOpen(false);
      fetchMonthData();
    } catch (error) {
      console.error('Failed to delete entry', error);
    } finally {
      setIsSaving(false);
    }
  };

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const todayStr = getLocalISODate(new Date());
  const blanks = Array(firstDayOfMonth).fill(null);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  return (
    <div className="bg-gray-50 flex flex-col font-['Poppins'] h-screen overflow-hidden">
      <HeaderComponent title="Academic Calendar" />

      <div className="flex-1 p-4 flex flex-col min-h-0">
        <div className="max-w-7xl mx-auto w-full bg-white rounded-2xl shadow-sm border border-gray-200 flex flex-col min-h-0 flex-1">
          {/* Calendar Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#08384F]/5 text-[#08384F] rounded-lg">
                <CalendarIcon size={22} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  {MONTHS[month]} {year}
                </h2>
                <p className="text-xs text-gray-400 font-medium">
                  Manage working days and holidays
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={goToday}
                className="px-4 py-1.5 text-xs font-semibold text-[#08384F] bg-[#08384F]/5 rounded-lg hover:bg-[#08384F]/10 transition-colors"
              >
                Today
              </button>
              <div className="flex items-center gap-1 bg-gray-50 rounded-lg p-1 border border-gray-100">
                <button
                  onClick={prevMonth}
                  className="p-1.5 rounded-md text-gray-500 hover:bg-white hover:shadow-sm"
                >
                  <ChevronLeft size={18} />
                </button>
                <button
                  onClick={nextMonth}
                  className="p-1.5 rounded-md text-gray-500 hover:bg-white hover:shadow-sm"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
          </div>

          {/* Calendar Grid Container */}
          <div className="p-4 flex-1 overflow-hidden flex flex-col">
            <div className="grid grid-cols-7 gap-3 mb-2 px-1">
              {DAYS_OF_WEEK.map((day) => (
                <div
                  key={day}
                  className="text-center font-bold text-[11px] text-gray-400 uppercase tracking-widest"
                >
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-3 flex-1 px-1">
              {blanks.map((_, i) => (
                <div
                  key={`blank-${i}`}
                  className="h-24 rounded-xl bg-gray-50/30 border border-gray-50/50"
                />
              ))}

              {days.map((day) => {
                const dateStr = getLocalISODate(new Date(year, month, day));
                const entry = entriesMap[dateStr];
                const isToday = dateStr === todayStr;
                const isSunday = new Date(year, month, day).getDay() === 0;
                let isWorking = entry ? entry.isWorkingDay : !isSunday;

                return (
                  <div
                    key={day}
                    onClick={() => handleDayClick(day)}
                    className={`h-24 rounded-xl border p-2.5 cursor-pointer transition-all hover:translate-y-[-2px] flex flex-col group
                      ${isToday ? 'ring-2 ring-[#08384F] ring-offset-1' : ''}
                      ${!isWorking ? 'bg-[#F0FDF4] border-[#DCFCE7] hover:border-[#BBF7D0]' : 'bg-white border-gray-100 hover:border-[#08384F]/20'}
                    `}
                  >
                    <div className="flex justify-between items-start">
                      <span
                        className={`text-base font-bold ${!isWorking ? 'text-[#166534]' : 'text-gray-700'}`}
                      >
                        {day}
                      </span>
                      {entry && (
                        <div className="flex items-center gap-1 opacity-80">
                          <span className="text-[10px] font-medium text-[#08384F]">
                            Saved
                          </span>
                          <CheckCircle2 size={11} className="text-[#08384F]" />
                        </div>
                      )}
                    </div>

                    {!isWorking && (
                      <div className="mt-auto">
                        <span className="inline-block px-2 py-0.5 bg-[#DCFCE7] text-[#166534] text-[10px] font-bold rounded-md truncate max-w-full">
                          {entry?.reasonForHoliday || 'Holiday'}
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Configuration Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between p-5 border-b border-gray-50">
              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  Configure Day
                </h3>
                <p className="text-xs font-medium text-gray-400 mt-0.5">
                  {selectedDateStr}
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-gray-400 hover:bg-gray-50 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-5">
              <div className="space-y-5">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
                    Day Status
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() =>
                        setFormData({ ...formData, isWorkingDay: true })
                      }
                      className={`py-3 px-4 rounded-xl border text-sm font-bold transition-all
                        ${formData.isWorkingDay ? 'bg-[#08384F] border-[#08384F] text-white' : 'bg-white border-gray-200 text-gray-500 hover:border-gray-300'}
                      `}
                    >
                      Working Day
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setFormData({ ...formData, isWorkingDay: false })
                      }
                      className={`py-3 px-4 rounded-xl border text-sm font-bold transition-all
                        ${!formData.isWorkingDay ? 'bg-[#DCFCE7] border-[#BBF7D0] text-[#166534]' : 'bg-white border-gray-200 text-gray-500 hover:border-gray-300'}
                      `}
                    >
                      Holiday
                    </button>
                  </div>
                </div>

                {!formData.isWorkingDay && (
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                      Holiday Reason
                    </label>
                    <input
                      type="text"
                      required={!formData.isWorkingDay}
                      value={formData.reasonForHoliday}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          reasonForHoliday: e.target.value
                        })
                      }
                      placeholder="e.g., Diwali, Semester Break"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#08384F]/10 focus:border-[#08384F] outline-none text-sm"
                    />
                  </div>
                )}
              </div>

              <div className="mt-8 flex items-center justify-between gap-3">
                {editingEntryId ? (
                  <button
                    type="button"
                    onClick={handleDelete}
                    className="text-xs font-bold text-red-500 hover:text-red-600 transition-colors"
                  >
                    Reset to Default
                  </button>
                ) : (
                  <div />
                )}

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-5 py-2.5 text-xs font-bold text-gray-500 bg-gray-50 rounded-xl hover:bg-gray-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="px-6 py-2.5 text-xs font-bold text-white bg-[#08384F] rounded-xl flex items-center justify-center min-w-[80px]"
                  >
                    {isSaving ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      'Save'
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AcademicCalendarManagement;
