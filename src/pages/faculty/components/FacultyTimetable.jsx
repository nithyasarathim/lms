import React, { useState, useEffect } from 'react';
import { Loader2, Calendar } from 'lucide-react';
import { getFacultyTimetable } from '../api/faculty.api';

const INITIAL_DAYS = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

const formatTimeWithAMPM = (time) => {
  if (!time) return '';
  const [hours, minutes] = time.split(':');
  const hour = parseInt(hours, 10);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const hour12 = hour % 12 || 12;
  return `${hour12}:${minutes} ${ampm}`;
};

// Helper to get current academic year and semester
const getCurrentAcademicYearAndSemester = async () => {
  // Replace with your actual API call
  const response = await fetch('/api/academic-years/current');
  const data = await response.json();
  return {
    academicYearId: data.data._id,
    semesterNumber: data.data.currentSemester
  };
};

// Helper to get faculty ID from stored token
const getFacultyIdFromToken = () => {
  const user = localStorage.getItem('lms-user');
  if (!user) return null;
  try {
    const userObj = JSON.parse(user);
    return userObj.facultyId || userObj._id;
  } catch (e) {
    return null;
  }
};

const FacultyTimetable = () => {
  const [loading, setLoading] = useState(true);
  const [slots, setSlots] = useState([]);
  const [grid, setGrid] = useState({});
  const [error, setError] = useState(null);
  const [academicYearInfo, setAcademicYearInfo] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const facultyId = getFacultyIdFromToken();
        if (!facultyId) throw new Error('Faculty not logged in');

        // Get current academic year and semester
        const { academicYearId, semesterNumber } =
          await getCurrentAcademicYearAndSemester();
        setAcademicYearInfo({ academicYearId, semesterNumber });

        const response = await getFacultyTimetable(
          facultyId,
          academicYearId,
          semesterNumber
        );
        setSlots(response.data.slots);
        setGrid(response.data.grid);
      } catch (err) {
        console.error('Failed to fetch faculty timetable:', err);
        setError(err.message || 'Failed to load timetable');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-[#08384F]" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-red-600 bg-red-50 rounded-lg">
        <p>Error loading timetable: {error}</p>
      </div>
    );
  }

  if (slots.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-gray-500">
        <Calendar className="w-12 h-12 mb-2 text-gray-300" />
        <p className="text-lg">No timetable assigned for this semester.</p>
        <p className="text-sm">
          You will see your classes here once they are scheduled.
        </p>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header with academic year info */}
      {academicYearInfo && (
        <div className="mb-4 text-sm text-gray-600">
          <span className="font-medium">Academic Year: </span>
          {academicYearInfo.academicYearId} | Semester:{' '}
          {academicYearInfo.semesterNumber}
        </div>
      )}

      <div className="bg-white border border-slate-200 rounded-[1rem] overflow-hidden shadow-2xl shadow-slate-200/50">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-slate-50 sticky top-0 z-40 border-b border-slate-200">
                <th className="w-20 p-4 text-[12px] font-black text-slate-400 border-r border-slate-200 bg-slate-50 shadow-[1px_0_0_#e2e8f0]">
                  DAY
                </th>
                {slots.map((slot) => (
                  <th
                    key={slot.order}
                    className={`p-2 text-center border-r border-slate-100 min-w-[100px] ${
                      slot.type !== 'class' ? 'bg-[#08384F]/5' : ''
                    }`}
                  >
                    <div className="flex flex-col items-center gap-1">
                      <span className="text-[9px] font-black text-[#0B56A4] opacity-50 uppercase whitespace-nowrap">
                        {slot.type !== 'class'
                          ? slot.name || slot.type.toUpperCase()
                          : `${slots.filter((s) => s.type === 'class' && s.order <= slot.order).length}`}
                      </span>
                      <span className="text-[9px] font-black text-[#08384F] whitespace-nowrap">
                        {formatTimeWithAMPM(slot.startTime)} -{' '}
                        {formatTimeWithAMPM(slot.endTime)}
                      </span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-300">
              {INITIAL_DAYS.map((day) => (
                <tr
                  key={day}
                  className="hover:bg-slate-50/30 transition-colors"
                >
                  <td className="p-2 text-center text-xs font-black text-[#08384F] bg-slate-50/50 border-r border-slate-300 sticky left-0 z-20 shadow-[1px_0_0_#cbd5e1]">
                    {day}
                  </td>
                  {slots.map((slot) => {
                    const cellEntries = grid[day]?.[slot.order] || [];
                    if (slot.type !== 'class') {
                      // For non‑class slots, show a placeholder
                      return (
                        <td
                          key={`${day}-${slot.order}`}
                          className="p-1 border-r border-slate-100 h-[85px] align-middle min-w-[100px] bg-gray-50"
                        >
                          <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">
                            {slot.type === 'break'
                              ? 'Break'
                              : slot.type === 'lunch'
                                ? 'Lunch'
                                : slot.name}
                          </div>
                        </td>
                      );
                    }

                    return (
                      <td
                        key={`${day}-${slot.order}`}
                        className="p-1 border-r border-slate-100 h-auto align-top min-w-[100px]"
                      >
                        <div className="space-y-2">
                          {cellEntries.map((entry, idx) => (
                            <div
                              key={idx}
                              className="bg-blue-50 border border-blue-100 rounded-md p-2 text-xs"
                            >
                              <div className="font-bold text-blue-800 truncate">
                                {entry.type === 'regular'
                                  ? `${entry.subjectShortName} (${entry.sectionName})`
                                  : `${entry.shortName} (${entry.sectionName})`}
                              </div>
                              <div className="text-[10px] text-gray-600 truncate">
                                {entry.departmentCode} - {entry.batchYear}
                              </div>
                              {entry.venue && (
                                <div className="text-[10px] text-gray-500 truncate">
                                  Venue: {entry.venue}
                                </div>
                              )}
                            </div>
                          ))}
                          {cellEntries.length === 0 && (
                            <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">
                              —
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
        </div>
      </div>
    </div>
  );
};

export default FacultyTimetable;
