import React, { useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import {
  AlertCircle,
  CheckCircle2,
  Clock3,
  Loader2,
  LockKeyhole,
  Send,
  CheckSquare,
  Square,
  UserCheck,
  UserX,
  Briefcase,
  X,
  Info,
} from "lucide-react";
import {
  markAttendance,
  getTimetableEntriesForAttendance,
  getAcademicCalendarInfo,
  viewAttendance,
  submitAttendanceRequest,
} from "../api/faculty.api.js";

const STATUS_OPTIONS = [
  {
    id: "Present",
    icon: UserCheck,
    activeBg: "bg-emerald-600",
    hoverBg: "hover:bg-emerald-50",
    text: "text-emerald-700",
    label: "Present",
    description: "Student attended the class",
  },
  {
    id: "Absent",
    icon: UserX,
    activeBg: "bg-rose-600",
    hoverBg: "hover:bg-rose-50",
    text: "text-rose-700",
    label: "Absent",
    description: "Student did not attend",
  },
  {
    id: "OnDuty",
    icon: Briefcase,
    activeBg: "bg-[#08384F]",
    hoverBg: "hover:bg-[#08384F]/10",
    text: "text-[#08384F]",
    label: "On Duty",
    description: "Official duty leave",
  },
];

const toLocalDateString = (date = new Date()) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const formatDisplayDate = (dateString) => {
  if (!dateString) return "";
  const [year, month, day] = dateString.split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const formatTime = (timeString) => {
  if (!timeString) return "--";
  return timeString;
};

const getEntryId = (entry) => entry?._id || entry?.timetableEntryId || "";

const getComponentLabel = (entry) =>
  entry?.componentShortName ||
  entry?.subjectComponent?.shortName ||
  entry?.componentName ||
  entry?.subjectComponent?.name ||
  entry?.subject?.shortName ||
  entry?.subject?.code ||
  "";

const buildStudentName = (student) =>
  student?.fullName ||
  `${student?.firstName || ""} ${student?.lastName || ""}`.trim();

const ConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  stats,
  submitting,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-black text-[#08384F]">{title}</h3>
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X size={20} className="text-gray-400" />
            </button>
          </div>

          <div className="mb-6">
            <p className="text-gray-600 text-sm mb-4">{message}</p>

            {stats && (
              <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-gray-500">
                    Present
                  </span>
                  <span className="text-lg font-black text-emerald-600">
                    {stats.P}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-gray-500">
                    Absent
                  </span>
                  <span className="text-lg font-black text-rose-600">
                    {stats.A}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-gray-500">
                    On Duty
                  </span>
                  <span className="text-lg font-black text-[#08384F]">
                    {stats.OD}
                  </span>
                </div>
                <div className="border-t border-gray-200 pt-2 mt-1">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-gray-500">
                      Total Students
                    </span>
                    <span className="text-sm font-black text-gray-800">
                      {stats.P + stats.A + stats.OD}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-medium hover:bg-gray-50 transition-all"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={submitting}
              className="flex-1 px-4 py-2.5 rounded-xl bg-[#08384F] text-white font-bold hover:bg-[#0A4866] transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {submitting ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <CheckCircle2 size={16} />
              )}
              Confirm
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const RequestConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  requestedChanges,
  reason,
  submitting,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-black text-[#08384F]">
              Request Approval
            </h3>
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X size={20} className="text-gray-400" />
            </button>
          </div>

          <div className="mb-6">
            <p className="text-gray-600 text-sm mb-3">
              You're requesting to change attendance for the following students:
            </p>

            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-3">
              <div className="space-y-2">
                {requestedChanges.slice(0, 5).map((change, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between text-sm"
                  >
                    <span className="font-medium text-gray-700">
                      Student {idx + 1}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs px-2 py-0.5 bg-gray-200 rounded">
                        {change.previousStatus}
                      </span>
                      <span>→</span>
                      <span className="text-xs px-2 py-0.5 bg-[#08384F]/10 text-[#08384F] rounded font-bold">
                        {change.newStatus}
                      </span>
                    </div>
                  </div>
                ))}
                {requestedChanges.length > 5 && (
                  <p className="text-xs text-gray-500 text-center pt-1">
                    +{requestedChanges.length - 5} more students
                  </p>
                )}
              </div>
            </div>

            <div className="bg-blue-50 rounded-xl p-3">
              <p className="text-xs font-medium text-blue-800 mb-1">
                Reason provided:
              </p>
              <p className="text-sm text-blue-900">{reason}</p>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-medium hover:bg-gray-50 transition-all"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={submitting}
              className="flex-1 px-4 py-2.5 rounded-xl bg-[#08384F] text-white font-bold hover:bg-[#0A4866] transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {submitting ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Send size={16} />
              )}
              Submit Request
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

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
  const [requestReason, setRequestReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [selectedStudents, setSelectedStudents] = useState(new Set());
  const [bulkStatusMode, setBulkStatusMode] = useState(false);
  const [selectedBulkStatus, setSelectedBulkStatus] = useState("Present");
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);

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
      setRequestReason("");
      setSelectedStudents(new Set());
      setBulkStatusMode(false);

      try {
        let calendarEntry = {
          dateString: selectedDate,
          isWorkingDay: true,
          reasonForHoliday: null,
        };

        try {
          const calRes = await getAcademicCalendarInfo(selectedDate);
          calendarEntry = calRes.data?.entry || calendarEntry;
        } catch {
          calendarEntry = {
            dateString: selectedDate,
            isWorkingDay: true,
            reasonForHoliday: null,
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
          facultyId,
        });

        const entries = ttRes.data?.entries || [];
        setTimetableEntries(entries);
        setSelectedEntry(entries[0] || null);
      } catch (err) {
        toast.error(err.message || "Failed to load attendance schedule");
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
    setRequestReason("");
    setSelectedStudents(new Set());
    setBulkStatusMode(false);
    try {
      const res = await viewAttendance(
        classroom._id,
        selectedDate,
        selectedEntryId,
      );

      const payload = res.data || {};
      const fetchedStudents = payload.students || [];
      const period =
        (payload.periods || []).find(
          (item) => String(item.timetableEntryId) === String(selectedEntryId),
        ) || payload.periods?.[0];
      const attendance =
        period?.attendance ||
        (payload.attendances || []).find(
          (item) =>
            String(item.timetableEntry?._id || item.timetableEntry) ===
            String(selectedEntryId),
        ) ||
        null;

      const initial = {};
      fetchedStudents.forEach((student) => {
        initial[student._id] = "Present";
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
      toast.error(err.message || "Failed to load saved attendance");
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
      P: vals.filter((v) => v === "Present").length,
      A: vals.filter((v) => v === "Absent").length,
      OD: vals.filter((v) => v === "OnDuty").length,
    };
  }, [attendanceData]);

  const requestedChanges = useMemo(() => {
    return Object.entries(attendanceData)
      .filter(
        ([studentId, status]) => originalAttendanceData[studentId] !== status,
      )
      .map(([studentId, status]) => ({
        studentId,
        previousStatus: originalAttendanceData[studentId],
        newStatus: status,
      }));
  }, [attendanceData, originalAttendanceData]);

  const hasAttendance = Boolean(currentAttendance?._id);
  const latestRequest =
    currentAttendance?.latestRequest || selectedEntry?.latestRequest || null;
  const hasPendingRequest = latestRequest?.approvalStatus === "Pending";
  const canMarkDirectly =
    Boolean(selectedEntryId) && !hasAttendance && isCurrentDay;
  const canRequestChange = hasAttendance && !hasPendingRequest;
  const statusButtonsDisabled =
    fetchingStudents ||
    hasPendingRequest ||
    (!canMarkDirectly && !canRequestChange);

  const handleSelectAll = () => {
    if (selectedStudents.size === students.length) {
      setSelectedStudents(new Set());
      setBulkStatusMode(false);
    } else {
      setSelectedStudents(new Set(students.map((s) => s._id)));
    }
  };

  const handleSelectStudent = (studentId) => {
    const newSelected = new Set(selectedStudents);
    if (newSelected.has(studentId)) {
      newSelected.delete(studentId);
    } else {
      newSelected.add(studentId);
    }
    setSelectedStudents(newSelected);
  };

  const handleApplyBulkStatus = () => {
    if (selectedStudents.size === 0) return;
    const updated = { ...attendanceData };
    selectedStudents.forEach((studentId) => {
      updated[studentId] = selectedBulkStatus;
    });
    setAttendanceData(updated);
    setSelectedStudents(new Set());
    setBulkStatusMode(false);
    toast.success(`Bulk status updated for ${selectedStudents.size} students`, {
      icon: "✓",
      style: { borderRadius: "12px" },
    });
  };

  const handleStatusChange = (studentId, status) => {
    if (statusButtonsDisabled) return;
    setAttendanceData((prev) => ({
      ...prev,
      [studentId]: status,
    }));
  };

  async function handleSave() {
    if (!canMarkDirectly) return;
    setShowConfirmModal(true);
  }

  async function confirmSave() {
    setShowConfirmModal(false);
    setSubmitting(true);
    try {
      await markAttendance({
        classroomId: classroom._id,
        timetableEntryId: selectedEntryId,
        dateString: selectedDate,
        students: Object.entries(attendanceData).map(([studentId, status]) => ({
          studentId,
          status,
        })),
      });
      toast.success("Attendance saved and locked successfully!", {
        icon: "✅",
        style: { borderRadius: "12px", background: "#08384F", color: "#fff" },
      });
      await loadSelectedAttendance();
    } catch (err) {
      toast.error(err.message || "Failed to save attendance");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleRequestChange() {
    if (!canRequestChange || requestedChanges.length === 0) return;
    if (!requestReason.trim()) {
      toast.error("Please enter a reason for HOD approval");
      return;
    }
    setShowRequestModal(true);
  }

  async function confirmRequest() {
    setShowRequestModal(false);
    setSubmitting(true);
    try {
      await submitAttendanceRequest({
        attendanceId: currentAttendance._id,
        requestedChanges,
        reason: requestReason.trim(),
      });
      toast.success("Attendance change request sent to HOD!", {
        icon: "📨",
        style: { borderRadius: "12px", background: "#08384F", color: "#fff" },
      });
      await loadSelectedAttendance();
      setRequestReason("");
    } finally {
      setSubmitting(false);
    }
  }

  const selectedComponentLabel = getComponentLabel(selectedEntry);

  return (
    <div className="max-w-7xl mx-auto h-[calc(100vh-260px)] min-h-128 overflow-hidden">
      <div className="grid lg:grid-cols-4 gap-6 h-full">
        <div className="lg:col-span-1 flex flex-col gap-4 h-full overflow-hidden">
          <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-xs">
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
              Select Date
            </label>
            <input
              type="date"
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium text-gray-700 outline-none focus:ring-2 focus:ring-[#08384F]/20 transition-all cursor-pointer"
              value={selectedDate}
              max={todayString}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
            {!isCurrentDay && (
              <div className="mt-2 flex items-center gap-1.5 text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded-lg">
                <Info size={12} />
                <span>Past date - requires HOD approval for changes</span>
              </div>
            )}
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 flex-1 flex flex-col min-h-0 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-gray-100 bg-gray-50/50">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                Today's Schedule
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
                    {calendarInfo.reasonForHoliday || "Holiday"}
                  </p>
                </div>
              ) : timetableEntries.length === 0 ? (
                <div className="text-center py-10 text-gray-400 text-sm">
                  No periods assigned for this day
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
                          ? "bg-[#08384F] text-white shadow-lg shadow-[#08384F]/25 ring-2 ring-[#08384F]/10"
                          : "bg-gray-50 hover:bg-gray-100 border border-gray-100 text-gray-700"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className="font-bold text-sm shrink-0">
                            P{entry.slotOrder}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div
                              className={`text-xs font-semibold truncate ${
                                active ? "text-slate-100" : "text-[#08384F]"
                              }`}
                            >
                              {componentLabel || "Assigned component"}
                            </div>
                            <div
                              className={`text-xs flex items-center gap-1.5 ${
                                active ? "text-slate-200" : "text-gray-500"
                              }`}
                            >
                              <Clock3 size={10} />
                              {formatTime(entry.startTime)} -{" "}
                              {formatTime(entry.endTime)}
                            </div>
                          </div>
                        </div>
                        {entry.attendanceId && (
                          <LockKeyhole
                            size={14}
                            className={`shrink-0 ${
                              active ? "text-white/80" : "text-gray-400"
                            }`}
                          />
                        )}
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
                Quick Stats
              </span>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-emerald-50 rounded-xl py-2 cursor-pointer hover:bg-emerald-100 transition-colors">
                  <div className="text-lg font-bold text-emerald-600">
                    {stats.P}
                  </div>
                  <div className="text-[10px] font-bold text-emerald-500 uppercase">
                    Present
                  </div>
                </div>
                <div className="bg-rose-50 rounded-xl py-2 cursor-pointer hover:bg-rose-100 transition-colors">
                  <div className="text-lg font-bold text-rose-600">
                    {stats.A}
                  </div>
                  <div className="text-[10px] font-bold text-rose-500 uppercase">
                    Absent
                  </div>
                </div>
                <div className="bg-[#08384F]/10 rounded-xl py-2 cursor-pointer hover:bg-[#08384F]/20 transition-colors">
                  <div className="text-lg font-bold text-[#08384F]">
                    {stats.OD}
                  </div>
                  <div className="text-[10px] font-bold text-[#08384F]/80 uppercase">
                    On Duty
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
                Select a period from the schedule on the left to begin marking
                attendance
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-gray-200 h-full flex flex-col shadow-xs overflow-hidden animate-fadeIn">
              <div className="px-6 py-3 border-b border-gray-100 flex flex-wrap justify-between items-center gap-3 bg-white sticky top-0 z-10">
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
                  {!hasAttendance && isCurrentDay && (
                    <p className="text-xs text-emerald-600 mt-1 flex items-center gap-1">
                      <CheckCircle2 size={12} />
                      You can mark attendance for this period
                    </p>
                  )}
                  {hasAttendance && !hasPendingRequest && (
                    <p className="text-xs text-amber-600 mt-1 flex items-center gap-1">
                      <LockKeyhole size={12} />
                      Attendance locked - request HOD approval for changes
                    </p>
                  )}
                </div>

                {!statusButtonsDisabled && (
                  <div className="flex items-center gap-2">
                    {!bulkStatusMode ? (
                      <button
                        onClick={() => setBulkStatusMode(true)}
                        className="px-3 py-1.5 text-xs font-medium rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-all"
                      >
                        <CheckSquare size={14} className="inline mr-1.5" />
                        Bulk Update
                      </button>
                    ) : (
                      <div className="flex items-center gap-1.5 bg-gray-50 rounded-lg p-1">
                        <button
                          onClick={handleSelectAll}
                          className="px-2.5 py-1 text-xs font-medium rounded-md hover:bg-white transition-all"
                        >
                          {selectedStudents.size === students.length
                            ? "Deselect All"
                            : "Select All"}
                        </button>
                        <select
                          value={selectedBulkStatus}
                          onChange={(e) =>
                            setSelectedBulkStatus(e.target.value)
                          }
                          className="px-2.5 py-1 text-xs font-medium rounded-md border-0 bg-white"
                        >
                          {STATUS_OPTIONS.map((opt) => (
                            <option key={opt.id} value={opt.id}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                        <button
                          onClick={handleApplyBulkStatus}
                          disabled={selectedStudents.size === 0}
                          className="px-2.5 py-1 text-xs font-medium rounded-md bg-[#08384F] text-white hover:bg-[#0A4866] disabled:opacity-40 transition-all"
                        >
                          Apply
                        </button>
                        <button
                          onClick={() => {
                            setBulkStatusMode(false);
                            setSelectedStudents(new Set());
                          }}
                          className="px-2.5 py-1 text-xs font-medium rounded-md hover:bg-white transition-all"
                        >
                          Cancel
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="flex-1 overflow-auto min-h-0">
                {fetchingStudents ? (
                  <div className="p-4 space-y-1">
                    {Array(8)
                      .fill(0)
                      .map((_, i) => (
                        <div key={i} className="flex items-center gap-3 py-2">
                          <div className="w-8 h-8 rounded-lg bg-gray-100 animate-pulse" />
                          <div className="flex-1 space-y-1.5">
                            <div className="h-3.5 w-1/3 bg-gray-100 animate-pulse rounded" />
                            <div className="h-2.5 w-1/4 bg-gray-50 animate-pulse rounded" />
                          </div>
                          <div className="flex gap-1.5">
                            <div className="w-8 h-8 rounded-lg bg-gray-100 animate-pulse" />
                            <div className="w-8 h-8 rounded-lg bg-gray-100 animate-pulse" />
                            <div className="w-8 h-8 rounded-lg bg-gray-100 animate-pulse" />
                          </div>
                        </div>
                      ))}
                  </div>
                ) : students.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center p-8">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                      <UserCheck size={24} className="text-gray-400" />
                    </div>
                    <p className="text-gray-500 font-medium">
                      No students found
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      This section has no enrolled students
                    </p>
                  </div>
                ) : (
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50/80 sticky top-0 z-10 backdrop-blur-sm">
                      <tr className="border-b border-gray-200">
                        {bulkStatusMode && (
                          <th className="w-10 px-4 py-2.5">
                            <button
                              onClick={handleSelectAll}
                              className="text-gray-400 hover:text-[#08384F] transition-colors"
                            >
                              {selectedStudents.size === students.length ? (
                                <CheckSquare
                                  size={16}
                                  className="text-[#08384F]"
                                />
                              ) : (
                                <Square size={16} />
                              )}
                            </button>
                          </th>
                        )}
                        <th className="px-4 py-2.5 text-left text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                          Student Name
                        </th>
                        <th className="px-4 py-2.5 text-left text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                          Register No.
                        </th>
                        <th className="px-4 py-2.5 text-center text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                          Attendance Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {students.map((student) => {
                        const hasChanged =
                          originalAttendanceData[student._id] &&
                          originalAttendanceData[student._id] !==
                            attendanceData[student._id];
                        const isSelected = selectedStudents.has(student._id);

                        return (
                          <tr
                            key={student._id}
                            className={`hover:bg-gray-50/50 transition-colors ${
                              isSelected ? "bg-[#08384F]/5" : ""
                            }`}
                          >
                            {bulkStatusMode && (
                              <td className="px-4 py-2">
                                <button
                                  onClick={() =>
                                    handleSelectStudent(student._id)
                                  }
                                  className="text-gray-400 hover:text-[#08384F] transition-colors"
                                >
                                  {isSelected ? (
                                    <CheckSquare
                                      size={16}
                                      className="text-[#08384F]"
                                    />
                                  ) : (
                                    <Square size={16} />
                                  )}
                                </button>
                              </td>
                            )}
                            <td className="px-4 py-2">
                              <div className="flex items-center gap-2.5">
                                <div className="w-7 h-7 rounded-lg bg-[#08384F]/10 text-[#08384F] flex items-center justify-center font-bold text-[10px] shrink-0">
                                  {student.firstName?.[0]}
                                  {student.lastName?.[0]}
                                </div>
                                <div className="font-medium text-gray-900 text-[13px]">
                                  {buildStudentName(student)}
                                  {hasChanged && (
                                    <span className="ml-2 text-[9px] font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded-full">
                                      Modified
                                    </span>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-2 text-gray-600 text-[12px]">
                              {student.registerNumber ||
                                student.rollNumber ||
                                "—"}
                            </td>
                            <td className="px-4 py-2">
                              <div className="flex justify-center gap-1.5">
                                {STATUS_OPTIONS.map((opt) => {
                                  const Icon = opt.icon;
                                  const isActive =
                                    attendanceData[student._id] === opt.id;

                                  return (
                                    <div
                                      key={opt.id}
                                      className="relative group"
                                    >
                                      <button
                                        onClick={() =>
                                          handleStatusChange(
                                            student._id,
                                            opt.id,
                                          )
                                        }
                                        disabled={statusButtonsDisabled}
                                        className={`w-8 h-8 rounded-lg transition-all border disabled:cursor-not-allowed flex items-center justify-center ${
                                          isActive
                                            ? `${opt.activeBg} border-transparent text-white shadow-sm`
                                            : "bg-white border-gray-100 text-gray-400 hover:border-gray-200 hover:bg-gray-50"
                                        } ${
                                          statusButtonsDisabled
                                            ? "opacity-70"
                                            : ""
                                        }`}
                                        title={opt.description}
                                      >
                                        <Icon size={14} />
                                      </button>
                                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 px-2 py-1 bg-gray-800 text-white text-[10px] font-medium rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-20">
                                        {opt.label}
                                      </div>
                                    </div>
                                  );
                                })}
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
                  <div className="space-y-2">
                    {!isCurrentDay && (
                      <div className="flex items-center gap-2 text-xs font-medium text-amber-700 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
                        <AlertCircle size={14} />
                        Past attendance requires a saved record first
                      </div>
                    )}
                    <button
                      onClick={handleSave}
                      disabled={
                        submitting || fetchingStudents || !canMarkDirectly
                      }
                      className={`w-full py-2.5 rounded-lg text-sm font-bold text-white transition-all shadow-md flex items-center justify-center gap-2 ${
                        submitting
                          ? "bg-[#08384F]/70"
                          : "bg-[#08384F] hover:bg-[#0A4866] shadow-[#08384F]/20 disabled:bg-gray-300 disabled:shadow-none"
                      }`}
                    >
                      {submitting ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : (
                        <CheckCircle2 size={16} />
                      )}
                      Save & Lock Attendance
                    </button>
                  </div>
                ) : hasPendingRequest ? (
                  <div className="flex items-center justify-between gap-3 bg-blue-50 border border-blue-100 rounded-lg px-4 py-2.5">
                    <div>
                      <p className="text-xs font-bold text-blue-800">
                        Request Pending Approval
                      </p>
                      <p className="text-[10px] text-blue-600 mt-0.5">
                        Your change request is with HOD for review
                      </p>
                    </div>
                    <Clock3 size={14} className="text-blue-700 shrink-0" />
                  </div>
                ) : (
                  <div className="flex items-end gap-3">
                    <div className="flex-1">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                        Reason for change request
                      </label>
                      <input
                        type="text"
                        value={requestReason}
                        onChange={(e) => setRequestReason(e.target.value)}
                        placeholder="Explain why this attendance needs correction..."
                        className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-xs outline-none focus:border-[#08384F] focus:ring-2 focus:ring-[#08384F]/10"
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
                      className="h-[42px] px-4 rounded-lg text-xs font-bold text-white bg-[#08384F] hover:bg-[#0A4866] transition-all shadow-md disabled:bg-gray-300 disabled:shadow-none flex items-center justify-center gap-1.5 shrink-0"
                    >
                      {submitting ? (
                        <Loader2 size={12} className="animate-spin" />
                      ) : (
                        <Send size={12} />
                      )}
                      Submit Request
                      {requestedChanges.length > 0 && (
                        <span className="bg-white/20 px-1.5 py-0.5 rounded-full text-[10px]">
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

      <ConfirmationModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={confirmSave}
        title="Confirm Attendance"
        message={`You are about to save attendance for ${students.length} students. This action will lock the attendance and cannot be edited without HOD approval.`}
        stats={stats}
        submitting={submitting}
      />

      <RequestConfirmationModal
        isOpen={showRequestModal}
        onClose={() => setShowRequestModal(false)}
        onConfirm={confirmRequest}
        requestedChanges={requestedChanges}
        reason={requestReason}
        submitting={submitting}
      />

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
          height: 5px;
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
