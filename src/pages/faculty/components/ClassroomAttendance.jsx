import React, { useCallback, useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import {
  AlertCircle,
  CheckCircle2,
  Clock3,
  Loader2,
  LockKeyhole,
  Send
} from 'lucide-react';
import {
  markAttendance,
  getTimetableEntriesForAttendance,
  getAcademicCalendarInfo,
  viewAttendance,
  submitAttendanceRequest
} from '../api/faculty.api.js';

const STATUS_OPTIONS = [
  {
    id: 'Present',
    label: 'P',
    activeBg: 'bg-emerald-600',
    hoverBg: 'hover:bg-emerald-50',
    text: 'text-emerald-700'
  },
  {
    id: 'Absent',
    label: 'A',
    activeBg: 'bg-rose-600',
    hoverBg: 'hover:bg-rose-50',
    text: 'text-rose-700'
  },
  {
    id: 'OnDuty',
    label: 'OD',
    activeBg: 'bg-[#08384F]',
    hoverBg: 'hover:bg-[#08384F]/10',
    text: 'text-[#08384F]'
  }
];

const toLocalDateString = (date = new Date()) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const formatDisplayDate = (dateString) => {
  if (!dateString) return '';
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(year, month - 1, day).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
};

const getEntryId = (entry) => entry?._id || entry?.timetableEntryId || '';

const getComponentLabel = (entry) =>
  entry?.componentShortName ||
  entry?.subjectComponent?.shortName ||
  entry?.componentName ||
  entry?.subjectComponent?.name ||
  entry?.subject?.shortName ||
  entry?.subject?.code ||
  '';

const buildStudentName = (student) =>
  student?.fullName ||
  `${student?.firstName || ''} ${student?.lastName || ''}`.trim();

const ClassroomAttendance = ({ classroom, facultyId }) => {
  const [loading, setLoading] = useState(false);
  const [fetchingStudents, setFetchingStudents] = useState(false);
  const [selectedDate, setSelectedDate] = useState(toLocalDateString());
  const [calendarInfo, setCalendarInfo] = useState(null);
  const [timetableEntries, setTimetableEntries] = useState([]);
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [students, setStudents] = useState([]);
  const [attendanceData, setAttendanceData] = useState({});
  const [originalAttendanceData, setOriginalAttendanceData] = useState({});
  const [currentAttendance, setCurrentAttendance] = useState(null);
  const [requestReason, setRequestReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const selectedEntryId = getEntryId(selectedEntry);
  const todayString = toLocalDateString();
  const isCurrentDay = selectedDate === todayString;

  useEffect(() => {
    async function initAttendanceFlow() {
      setLoading(true);
      setSelectedEntry(null);
      setStudents([]);
      setAttendanceData({});
      setOriginalAttendanceData({});
      setCurrentAttendance(null);
      setRequestReason('');

      try {
        let calendarEntry = {
          dateString: selectedDate,
          isWorkingDay: true,
          reasonForHoliday: null
        };

        try {
          const calRes = await getAcademicCalendarInfo(selectedDate);
          calendarEntry = calRes.data?.entry || calendarEntry;
        } catch {
          calendarEntry = {
            dateString: selectedDate,
            isWorkingDay: true,
            reasonForHoliday: null
          };
        }

        setCalendarInfo(calendarEntry);

        if (!calendarEntry.isWorkingDay) {
          setTimetableEntries([]);
          return;
        }

        const ttRes = await getTimetableEntriesForAttendance({
          classroomId: classroom._id,
          subjectId: classroom.subjectId?._id || classroom.subjectId,
          sectionId: classroom.sectionId?._id || classroom.sectionId,
          academicYearId:
            classroom.academicYearId?._id || classroom.academicYearId,
          semesterNumber: classroom.semesterNumber,
          dateString: selectedDate,
          facultyId
        });

        const entries = ttRes.data?.entries || [];
        setTimetableEntries(entries);
        setSelectedEntry(entries[0] || null);
      } catch (err) {
        toast.error(err.message || 'Failed to load attendance schedule');
        setTimetableEntries([]);
      } finally {
        setLoading(false);
      }
    }

    if (classroom?._id) initAttendanceFlow();
  }, [selectedDate, classroom, facultyId]);

  const loadSelectedAttendance = useCallback(async () => {
    if (!selectedEntryId || !classroom?._id) return;

    setFetchingStudents(true);
    setRequestReason('');
    try {
      const res = await viewAttendance(
        classroom._id,
        selectedDate,
        selectedEntryId
      );

      const payload = res.data || {};
      const fetchedStudents = payload.students || [];
      const period =
        (payload.periods || []).find(
          (item) => String(item.timetableEntryId) === String(selectedEntryId)
        ) || payload.periods?.[0];
      const attendance =
        period?.attendance ||
        (payload.attendances || []).find(
          (item) =>
            String(item.timetableEntry?._id || item.timetableEntry) ===
            String(selectedEntryId)
        ) ||
        null;

      const initial = {};
      fetchedStudents.forEach((student) => {
        initial[student._id] = 'Present';
      });

      if (attendance?.records?.length) {
        attendance.records.forEach((record) => {
          const studentId = record.student?._id || record.student;
          if (studentId) initial[studentId] = record.status;
        });
      }

      setStudents(fetchedStudents);
      setAttendanceData(initial);
      setOriginalAttendanceData(initial);
      setCurrentAttendance(attendance);
    } catch (err) {
      toast.error(err.message || 'Failed to load saved attendance');
      setStudents([]);
      setAttendanceData({});
      setOriginalAttendanceData({});
      setCurrentAttendance(null);
    } finally {
      setFetchingStudents(false);
    }
  }, [classroom?._id, selectedDate, selectedEntryId]);

  useEffect(() => {
    loadSelectedAttendance();
  }, [loadSelectedAttendance]);

  const stats = useMemo(() => {
    const vals = Object.values(attendanceData);
    return {
      P: vals.filter((v) => v === 'Present').length,
      A: vals.filter((v) => v === 'Absent').length,
      OD: vals.filter((v) => v === 'OnDuty').length
    };
  }, [attendanceData]);

  const requestedChanges = useMemo(() => {
    return Object.entries(attendanceData)
      .filter(([studentId, status]) => originalAttendanceData[studentId] !== status)
      .map(([studentId, status]) => ({
        studentId,
        previousStatus: originalAttendanceData[studentId],
        newStatus: status
      }));
  }, [attendanceData, originalAttendanceData]);

  const hasAttendance = Boolean(currentAttendance?._id);
  const latestRequest =
    currentAttendance?.latestRequest || selectedEntry?.latestRequest || null;
  const hasPendingRequest = latestRequest?.approvalStatus === 'Pending';
  const canMarkDirectly = Boolean(selectedEntryId) && !hasAttendance && isCurrentDay;
  const canRequestChange = hasAttendance && !hasPendingRequest;
  const statusButtonsDisabled =
    fetchingStudents ||
    hasPendingRequest ||
    (!canMarkDirectly && !canRequestChange);

  const handleBulkUpdate = (status) => {
    if (statusButtonsDisabled) return;
    const updated = {};
    students.forEach((student) => {
      updated[student._id] = status;
    });
    setAttendanceData(updated);
  };

  const handleStatusChange = (studentId, status) => {
    if (statusButtonsDisabled) return;
    setAttendanceData((prev) => ({
      ...prev,
      [studentId]: status
    }));
  };

  async function handleSave() {
    if (!canMarkDirectly) return;
    setSubmitting(true);
    try {
      const res = await markAttendance({
        classroomId: classroom._id,
        timetableEntryId: selectedEntryId,
        dateString: selectedDate,
        students: Object.entries(attendanceData).map(([studentId, status]) => ({
          studentId,
          status
        }))
      });
      toast.success('Attendance saved and locked');
      const attendanceId = res.data?.attendanceId;
      setSelectedEntry((prev) => ({
        ...prev,
        attendanceId,
        isLocked: true
      }));
      setTimetableEntries((prev) =>
        prev.map((entry) =>
          getEntryId(entry) === selectedEntryId
            ? { ...entry, attendanceId, isLocked: true }
            : entry
        )
      );
      await loadSelectedAttendance();
    } catch (err) {
      toast.error(err.message || 'Failed to save attendance');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleRequestChange() {
    if (!canRequestChange || requestedChanges.length === 0) return;
    if (!requestReason.trim()) {
      toast.error('Please enter a reason for HOD approval');
      return;
    }

    setSubmitting(true);
    try {
      await submitAttendanceRequest({
        attendanceId: currentAttendance._id,
        requestedChanges,
        reason: requestReason.trim()
      });
      toast.success('Attendance change request sent to HOD');
      await loadSelectedAttendance();
    } catch (err) {
      toast.error(err.message || 'Failed to submit request');
    } finally {
      setSubmitting(false);
    }
  }

  const selectedComponentLabel = getComponentLabel(selectedEntry);

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto h-[calc(100vh-260px)] min-h-128 overflow-hidden">
      <div className="grid lg:grid-cols-4 gap-6 h-full">
        <div className="lg:col-span-1 flex flex-col gap-4 h-full overflow-hidden">
          <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-xs">
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
              Selected Date
            </label>
            <input
              type="date"
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium text-gray-700 outline-none focus:ring-2 focus:ring-[#08384F]/20 transition-all cursor-pointer"
              value={selectedDate}
              max={todayString}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 flex-1 flex flex-col min-h-0 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-gray-100 bg-gray-50/50">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                Daily Schedule
              </span>
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {loading ? (
                Array(3)
                  .fill(0)
                  .map((_, i) => (
                    <div
                      key={i}
                      className="h-16 w-full bg-gray-100 animate-pulse rounded-xl"
                    />
                  ))
              ) : calendarInfo && !calendarInfo.isWorkingDay ? (
                <div className="flex flex-col items-center justify-center h-full text-center px-4">
                  <div className="w-12 h-12 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center mb-3">
                    <Clock3 size={22} />
                  </div>
                  <p className="text-sm font-semibold text-gray-800">
                    Non-Working Day
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {calendarInfo.reasonForHoliday || 'Holiday'}
                  </p>
                </div>
              ) : timetableEntries.length === 0 ? (
                <div className="text-center py-10 text-gray-400 text-sm">
                  No periods assigned
                </div>
              ) : (
                timetableEntries.map((entry) => {
                  const entryId = getEntryId(entry);
                  const active = selectedEntryId === entryId;
                  const componentLabel = getComponentLabel(entry);

                  return (
                    <button
                      key={entryId}
                      onClick={() => setSelectedEntry(entry)}
                      className={`w-full p-3 rounded-xl text-left transition-all ${
                        active
                          ? 'bg-[#08384F] text-white shadow-lg shadow-[#08384F]/25 ring-2 ring-[#08384F]/10'
                          : 'hover:bg-gray-50 border border-transparent text-gray-700'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="font-bold text-sm">
                          Period {entry.slotOrder}
                        </div>
                        {entry.attendanceId && (
                          <LockKeyhole
                            size={14}
                            className={active ? 'text-white' : 'text-gray-400'}
                          />
                        )}
                      </div>
                      <div
                        className={`text-xs mt-1 font-semibold truncate ${
                          active ? 'text-slate-100' : 'text-[#08384F]'
                        }`}
                      >
                        {componentLabel || 'Assigned component'}
                      </div>
                      <div
                        className={`text-xs mt-0.5 ${
                          active ? 'text-slate-200' : 'text-gray-400'
                        }`}
                      >
                        {entry.startTime || '--'} - {entry.endTime || '--'}
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {selectedEntry && (
            <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-xs animate-fadeIn">
              <span className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
                Attendance Stats
              </span>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-emerald-50 rounded-xl py-2">
                  <div className="text-lg font-bold text-emerald-600">
                    {stats.P}
                  </div>
                  <div className="text-[10px] font-bold text-emerald-500 uppercase">
                    Pres
                  </div>
                </div>
                <div className="bg-rose-50 rounded-xl py-2">
                  <div className="text-lg font-bold text-rose-600">
                    {stats.A}
                  </div>
                  <div className="text-[10px] font-bold text-rose-500 uppercase">
                    Abs
                  </div>
                </div>
                <div className="bg-[#08384F]/10 rounded-xl py-2">
                  <div className="text-lg font-bold text-[#08384F]">
                    {stats.OD}
                  </div>
                  <div className="text-[10px] font-bold text-[#08384F]/80 uppercase">
                    O.D
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="lg:col-span-3 h-full overflow-hidden">
          {!selectedEntry ? (
            <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-3xl h-full flex flex-col items-center justify-center text-center p-8">
              <div className="w-20 h-20 bg-white rounded-3xl shadow-sm flex items-center justify-center mb-4 transform -rotate-6">
                <AlertCircle className="w-10 h-10 text-gray-300" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800">
                Ready to take attendance?
              </h3>
              <p className="text-gray-400 text-sm mt-1 max-w-xs">
                Select a period from the schedule on the left to begin.
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-gray-200 h-full flex flex-col shadow-xs overflow-hidden animate-fadeIn">
              <div className="px-6 py-4 border-b border-gray-100 flex flex-wrap justify-between items-center gap-4 bg-white sticky top-0 z-10">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2 py-0.5 bg-[#08384F]/10 text-[#08384F] text-[10px] font-bold rounded uppercase">
                      Period {selectedEntry.slotOrder}
                    </span>
                    {selectedComponentLabel && (
                      <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-[10px] font-bold rounded uppercase">
                        {selectedComponentLabel}
                      </span>
                    )}
                    {hasAttendance && (
                      <span className="px-2 py-0.5 bg-amber-50 text-amber-700 text-[10px] font-bold rounded uppercase flex items-center gap-1">
                        <LockKeyhole size={12} />
                        Locked
                      </span>
                    )}
                    {hasPendingRequest && (
                      <span className="px-2 py-0.5 bg-blue-50 text-blue-700 text-[10px] font-bold rounded uppercase">
                        Request Pending
                      </span>
                    )}
                    <span className="text-sm font-bold text-gray-800">
                      {formatDisplayDate(selectedDate)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleBulkUpdate('Present')}
                    disabled={statusButtonsDisabled}
                    className="px-4 py-2 text-xs font-bold rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white transition-all disabled:opacity-40 disabled:hover:bg-emerald-50 disabled:hover:text-emerald-700"
                  >
                    All Present
                  </button>
                  <button
                    onClick={() => handleBulkUpdate('Absent')}
                    disabled={statusButtonsDisabled}
                    className="px-4 py-2 text-xs font-bold rounded-xl bg-rose-50 text-rose-700 hover:bg-rose-600 hover:text-white transition-all disabled:opacity-40 disabled:hover:bg-rose-50 disabled:hover:text-rose-700"
                  >
                    All Absent
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto min-h-0">
                {fetchingStudents ? (
                  <div className="p-6 space-y-4">
                    {Array(6)
                      .fill(0)
                      .map((_, i) => (
                        <div key={i} className="flex gap-4 items-center">
                          <div className="w-10 h-10 rounded-full bg-gray-100 animate-pulse" />
                          <div className="flex-1 space-y-2">
                            <div className="h-4 w-1/3 bg-gray-100 animate-pulse rounded" />
                            <div className="h-3 w-1/4 bg-gray-50 animate-pulse rounded" />
                          </div>
                        </div>
                      ))}
                  </div>
                ) : (
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-gray-50/50 sticky top-0 z-10 backdrop-blur-sm">
                      <tr>
                        <th className="px-6 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                          Student Details
                        </th>
                        <th className="px-6 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {students.map((student) => {
                        const hasChanged =
                          originalAttendanceData[student._id] &&
                          originalAttendanceData[student._id] !==
                            attendanceData[student._id];

                        return (
                          <tr
                            key={student._id}
                            className="hover:bg-gray-50/50 transition-colors"
                          >
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-[#08384F]/10 text-[#08384F] flex items-center justify-center font-bold text-sm shrink-0">
                                  {student.firstName?.[0]}
                                  {student.lastName?.[0]}
                                </div>
                                <div>
                                  <div className="text-sm font-bold text-gray-800 flex items-center gap-2">
                                    {buildStudentName(student)}
                                    {hasChanged && (
                                      <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                                        Changed
                                      </span>
                                    )}
                                  </div>
                                  <div className="text-xs text-gray-400 font-medium">
                                    {student.registerNumber ||
                                      student.rollNumber ||
                                      'No register number'}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex justify-center gap-1.5">
                                {STATUS_OPTIONS.map((opt) => (
                                  <button
                                    key={opt.id}
                                    onClick={() =>
                                      handleStatusChange(student._id, opt.id)
                                    }
                                    disabled={statusButtonsDisabled}
                                    className={`w-10 h-10 rounded-xl text-xs font-bold transition-all border-2 disabled:cursor-not-allowed ${
                                      attendanceData[student._id] === opt.id
                                        ? `${opt.activeBg} border-transparent text-white shadow-md`
                                        : 'bg-white border-gray-100 text-gray-400 hover:border-gray-200'
                                    } ${
                                      statusButtonsDisabled ? 'opacity-70' : ''
                                    }`}
                                  >
                                    {opt.label}
                                  </button>
                                ))}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>

              <div className="p-4 bg-white border-t border-gray-100">
                {!hasAttendance ? (
                  <div className="space-y-3">
                    {!isCurrentDay && (
                      <div className="flex items-center gap-2 text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-100 rounded-xl px-3 py-2">
                        <AlertCircle size={15} />
                        Past attendance can be changed only after a sheet exists.
                      </div>
                    )}
                    <button
                      onClick={handleSave}
                      disabled={submitting || fetchingStudents || !canMarkDirectly}
                      className={`w-full py-3.5 rounded-2xl text-sm font-bold text-white transition-all shadow-lg flex items-center justify-center gap-2 ${
                        submitting
                          ? 'bg-[#08384F]/70'
                          : 'bg-[#08384F] hover:bg-[#0A4866] shadow-[#08384F]/25 disabled:bg-gray-300 disabled:shadow-none'
                      }`}
                    >
                      {submitting ? (
                        <Loader2 size={18} className="animate-spin" />
                      ) : (
                        <CheckCircle2 size={18} />
                      )}
                      Save Attendance
                    </button>
                  </div>
                ) : hasPendingRequest ? (
                  <div className="flex items-center justify-between gap-3 bg-blue-50 border border-blue-100 rounded-2xl px-4 py-3">
                    <div>
                      <p className="text-sm font-bold text-blue-800">
                        Permission request is pending
                      </p>
                      <p className="text-xs text-blue-600 mt-0.5">
                        Wait for HOD approval before raising another change.
                      </p>
                    </div>
                    <Send size={18} className="text-blue-700 shrink-0" />
                  </div>
                ) : (
                  <div className="grid md:grid-cols-[1fr_auto] gap-3 items-end">
                    <div>
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                        Reason for HOD permission
                      </label>
                      <textarea
                        value={requestReason}
                        onChange={(e) => setRequestReason(e.target.value)}
                        placeholder="Explain why this locked attendance needs correction"
                        rows={2}
                        className="mt-1 w-full resize-none rounded-2xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-[#08384F] focus:ring-4 focus:ring-[#08384F]/5"
                      />
                    </div>
                    <button
                      onClick={handleRequestChange}
                      disabled={
                        submitting ||
                        fetchingStudents ||
                        requestedChanges.length === 0 ||
                        !requestReason.trim()
                      }
                      className="h-[58px] px-6 rounded-2xl text-sm font-bold text-white bg-[#08384F] hover:bg-[#0A4866] transition-all shadow-lg shadow-[#08384F]/20 disabled:bg-gray-300 disabled:shadow-none flex items-center justify-center gap-2"
                    >
                      {submitting ? (
                        <Loader2 size={18} className="animate-spin" />
                      ) : (
                        <Send size={18} />
                      )}
                      Request Permission
                      {requestedChanges.length > 0 && (
                        <span className="bg-white/20 px-2 py-0.5 rounded-full text-[11px]">
                          {requestedChanges.length}
                        </span>
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out forwards;
        }
        ::-webkit-scrollbar {
          width: 5px;
        }
        ::-webkit-scrollbar-track {
          background: transparent;
        }
        ::-webkit-scrollbar-thumb {
          background: #e5e7eb;
          border-radius: 10px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: #d1d5db;
        }
      `}</style>
    </div>
  );
};

export default ClassroomAttendance;
