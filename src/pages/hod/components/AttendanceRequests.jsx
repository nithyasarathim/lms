import React, { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import {
  CheckCircle2,
  Clock3,
  Loader2,
  Send,
  ShieldCheck,
  XCircle,
} from "lucide-react";
import HeaderComponent from "../../shared/components/HeaderComponent";
import {
  getAttendanceRequests,
  resolveAttendanceRequest,
} from "../api/hod.api";

const STATUS_META = {
  Pending: {
    icon: Clock3,
    text: "text-amber-700",
    bg: "bg-amber-50",
  },
  Approved: {
    icon: CheckCircle2,
    text: "text-emerald-700",
    bg: "bg-emerald-50",
  },
  Rejected: {
    icon: XCircle,
    text: "text-rose-700",
    bg: "bg-rose-50",
  },
};

const FILTERS = ["Pending", "Approved", "Rejected", "All"];

const formatDate = (dateString) => {
  if (!dateString) return "Date unavailable";
  const [year, month, day] = dateString.split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const personName = (person) => {
  if (!person) return "Unknown";
  return `${person.salutation || ""} ${person.firstName || ""} ${
    person.lastName || ""
  }`
    .replace(/\s+/g, " ")
    .trim();
};

const studentName = (student) => {
  if (!student) return "Unknown student";
  return `${student.firstName || ""} ${student.lastName || ""}`
    .replace(/\s+/g, " ")
    .trim();
};

const getAttendanceInfo = (request) => {
  const attendance = request?.attendanceRecord || {};
  const classroom = attendance.classroom || {};
  const entry = attendance.timetableEntry || {};
  const entryComponent =
    entry.facultyAssignmentId?.subjectComponentId || attendance.subjectComponent;
  const component = attendance.subjectComponent || entryComponent;
  const subject = component?.subjectId || classroom.subjectId || {};

  return {
    attendance,
    classroom,
    component,
    subject,
    sectionName: classroom.sectionId?.name || "N/A",
    semesterNumber: classroom.semesterNumber || attendance.semesterNumber,
    period: attendance.slotOrder || entry.slotOrder,
    day: attendance.day || entry.day,
    dateString: attendance.dateString,
    title:
      component?.shortName ||
      component?.name ||
      subject.shortName ||
      subject.code ||
      "Subject",
  };
};

const EmptyState = ({ status }) => (
  <div className="h-full flex flex-col items-center justify-center text-center p-8 bg-white border border-dashed border-gray-200 rounded-3xl">
    <div className="w-16 h-16 bg-[#08384F]/10 rounded-2xl flex items-center justify-center mb-4">
      <ShieldCheck className="text-[#08384F]" size={28} />
    </div>
    <h3 className="text-base font-bold text-gray-800">No requests found</h3>
    <p className="text-sm text-gray-400 mt-1 max-w-xs">
      {status === "Pending"
        ? "Pending attendance permissions will appear here."
        : "No attendance permissions match this filter."}
    </p>
  </div>
);

const AttendanceRequests = () => {
  const [status, setStatus] = useState("Pending");
  const [requests, setRequests] = useState([]);
  const [summary, setSummary] = useState({
    Pending: 0,
    Approved: 0,
    Rejected: 0,
    All: 0,
  });
  const [selectedId, setSelectedId] = useState("");
  const [loading, setLoading] = useState(false);
  const [resolving, setResolving] = useState(false);
  const [reviewRemarks, setReviewRemarks] = useState("");

  useEffect(() => {
    let active = true;

    async function loadRequests() {
      setLoading(true);
      try {
        const res = await getAttendanceRequests(status);
        if (!active) return;
        const nextRequests = res.data?.requests || [];
        setRequests(nextRequests);
        setSummary(
          res.data?.summary || {
            Pending: 0,
            Approved: 0,
            Rejected: 0,
            All: nextRequests.length,
          },
        );
        setSelectedId((current) => {
          if (nextRequests.some((request) => request._id === current)) {
            return current;
          }
          return nextRequests[0]?._id || "";
        });
        setReviewRemarks("");
      } catch (err) {
        toast.error(err.message || "Failed to load attendance requests");
      } finally {
        if (active) setLoading(false);
      }
    }

    loadRequests();
    return () => {
      active = false;
    };
  }, [status]);

  const selectedRequest = useMemo(
    () => requests.find((request) => request._id === selectedId) || null,
    [requests, selectedId],
  );

  const selectedInfo = getAttendanceInfo(selectedRequest);
  const statusMeta =
    STATUS_META[selectedRequest?.approvalStatus] || STATUS_META.Pending;
  const StatusIcon = statusMeta.icon;

  const handleResolve = async (resolutionStatus) => {
    if (!selectedRequest?._id) return;
    setResolving(true);
    try {
      await resolveAttendanceRequest({
        requestId: selectedRequest._id,
        status: resolutionStatus,
        reviewRemarks: reviewRemarks.trim(),
      });
      toast.success(`Request ${resolutionStatus.toLowerCase()}`);
      const res = await getAttendanceRequests(status);
      const nextRequests = res.data?.requests || [];
      setRequests(nextRequests);
      setSummary(res.data?.summary || summary);
      setSelectedId(nextRequests[0]?._id || "");
      setReviewRemarks("");
    } catch (err) {
      toast.error(err.message || "Failed to resolve request");
    } finally {
      setResolving(false);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50 font-['Poppins']">
      <HeaderComponent title="Attendance Requests" />

      <div className="px-6 py-4 flex flex-col min-h-0 flex-1">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-5">
          <div className="flex flex-wrap gap-2">
            {FILTERS.map((item) => {
              const active = status === item;
              return (
                <button
                  key={item}
                  onClick={() => setStatus(item)}
                  className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest border transition-all ${
                    active
                      ? "bg-[#08384F] text-white border-[#08384F] shadow-lg shadow-[#08384F]/15"
                      : "bg-white text-gray-500 border-gray-200 hover:border-[#08384F]/30"
                  }`}
                >
                  {item}
                  <span
                    className={`ml-2 px-2 py-0.5 rounded-full ${
                      active
                        ? "bg-white/20 text-white"
                        : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {summary[item] || 0}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 bg-white border border-gray-200 rounded-2xl px-4 py-2">
            <ShieldCheck size={16} className="text-[#08384F]" />
            Department approvals
          </div>
        </div>

        <div className="grid grid-cols-12 gap-5 flex-1 min-h-0">
          <div className="col-span-12 lg:col-span-4 bg-white border border-gray-200 rounded-3xl shadow-sm overflow-hidden flex flex-col min-h-0">
            <div className="px-5 py-4 border-b border-gray-100 bg-white">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                Request Queue
              </p>
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {loading ? (
                Array(5)
                  .fill(0)
                  .map((_, index) => (
                    <div
                      key={index}
                      className="h-28 rounded-2xl bg-gray-100 animate-pulse"
                    />
                  ))
              ) : requests.length === 0 ? (
                <EmptyState status={status} />
              ) : (
                requests.map((request) => {
                  const info = getAttendanceInfo(request);
                  const active = selectedId === request._id;
                  const meta =
                    STATUS_META[request.approvalStatus] || STATUS_META.Pending;
                  const Icon = meta.icon;

                  return (
                    <button
                      key={request._id}
                      onClick={() => {
                        setSelectedId(request._id);
                        setReviewRemarks("");
                      }}
                      className={`w-full text-left rounded-2xl border p-4 transition-all ${
                        active
                          ? "bg-[#08384F] text-white border-[#08384F] shadow-lg shadow-[#08384F]/15"
                          : "bg-white text-gray-700 border-gray-100 hover:border-[#08384F]/20 hover:bg-gray-50"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="text-sm font-black truncate">
                          {info.title}
                        </div>
                        <span
                          className={`shrink-0 inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-black uppercase ${
                            active
                              ? "bg-white/15 text-white"
                              : `${meta.bg} ${meta.text}`
                          }`}
                        >
                          <Icon size={12} />
                          {request.approvalStatus}
                        </span>
                      </div>
                      <div
                        className={`text-xs mt-2 ${
                          active ? "text-slate-100" : "text-gray-500"
                        }`}
                      >
                        {formatDate(info.dateString)} - Period {info.period}
                      </div>
                      <div
                        className={`text-xs mt-1 ${
                          active ? "text-slate-200" : "text-gray-400"
                        }`}
                      >
                        Section {info.sectionName} / Sem{" "}
                        {info.semesterNumber || "N/A"}
                      </div>
                      <div
                        className={`text-xs mt-3 font-semibold truncate ${
                          active ? "text-white" : "text-[#08384F]"
                        }`}
                      >
                        {personName(request.faculty)}
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          <div className="col-span-12 lg:col-span-8 bg-white border border-gray-200 rounded-3xl shadow-sm overflow-hidden flex flex-col min-h-0">
            {!selectedRequest ? (
              <EmptyState status={status} />
            ) : (
              <>
                <div className="px-6 py-5 border-b border-gray-100 flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider bg-[#08384F]/10 text-[#08384F]">
                        Period {selectedInfo.period}
                      </span>
                      <span className="px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider bg-slate-100 text-slate-600">
                        {selectedInfo.title}
                      </span>
                      <span
                        className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider inline-flex items-center gap-1 ${statusMeta.bg} ${statusMeta.text}`}
                      >
                        <StatusIcon size={12} />
                        {selectedRequest.approvalStatus}
                      </span>
                    </div>
                    <h2 className="text-xl font-black text-[#08384F] mt-3">
                      {selectedInfo.subject?.code || ""}{" "}
                      {selectedInfo.subject?.name || "Attendance correction"}
                    </h2>
                    <p className="text-xs text-gray-400 font-semibold mt-1">
                      {formatDate(selectedInfo.dateString)} /{" "}
                      {selectedInfo.day || "Day"} / Section{" "}
                      {selectedInfo.sectionName}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                      Requested By
                    </p>
                    <p className="text-sm font-black text-gray-800 mt-1">
                      {personName(selectedRequest.faculty)}
                    </p>
                    <p className="text-xs text-gray-400 font-semibold">
                      {selectedRequest.faculty?.employeeId || "Employee ID N/A"}
                    </p>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-5">
                  <div className="border border-gray-100 rounded-2xl p-4 bg-gray-50/50">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">
                      Faculty Reason
                    </p>
                    <p className="text-sm text-gray-700 leading-relaxed">
                      {selectedRequest.reason}
                    </p>
                  </div>

                  <div className="border border-gray-100 rounded-2xl overflow-hidden">
                    <div className="px-4 py-3 bg-[#08384F]/5 border-b border-gray-100 flex items-center justify-between">
                      <p className="text-[10px] font-bold text-[#08384F] uppercase tracking-widest">
                        Requested Changes
                      </p>
                      <span className="text-[10px] font-bold text-gray-400">
                        {selectedRequest.requestedChanges?.length || 0} students
                      </span>
                    </div>

                    <table className="w-full text-left">
                      <thead className="bg-white border-b border-gray-100">
                        <tr>
                          <th className="px-4 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                            Student
                          </th>
                          <th className="px-4 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                            From
                          </th>
                          <th className="px-4 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                            To
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {selectedRequest.requestedChanges?.map((change) => (
                          <tr key={change._id || change.student?._id}>
                            <td className="px-4 py-3">
                              <div className="text-sm font-bold text-gray-800">
                                {studentName(change.student)}
                              </div>
                              <div className="text-xs text-gray-400 font-semibold">
                                {change.student?.registerNumber ||
                                  change.student?.rollNumber ||
                                  "Register number N/A"}
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <span className="px-3 py-1 rounded-xl bg-gray-100 text-gray-600 text-xs font-black">
                                {change.previousStatus}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <span className="px-3 py-1 rounded-xl bg-[#08384F] text-white text-xs font-black">
                                {change.newStatus}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {selectedRequest.approvalStatus !== "Pending" && (
                    <div
                      className={`border rounded-2xl p-4 ${
                        selectedRequest.approvalStatus === "Approved"
                          ? "bg-emerald-50 border-emerald-100"
                          : "bg-rose-50 border-rose-100"
                      }`}
                    >
                      <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
                        Reviewed By
                      </p>
                      <p className="text-sm font-black text-gray-800 mt-1">
                        {personName(selectedRequest.reviewedBy)}
                      </p>
                      {selectedRequest.reviewRemarks && (
                        <p className="text-sm text-gray-600 mt-2">
                          {selectedRequest.reviewRemarks}
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {selectedRequest.approvalStatus === "Pending" && (
                  <div className="p-4 border-t border-gray-100 bg-white">
                    <div className="grid md:grid-cols-[1fr_auto_auto] gap-3 items-end">
                      <div>
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                          Review Remarks
                        </label>
                        <textarea
                          value={reviewRemarks}
                          onChange={(e) => setReviewRemarks(e.target.value)}
                          placeholder="Optional note for the faculty"
                          rows={2}
                          className="mt-1 w-full resize-none rounded-2xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-[#08384F] focus:ring-4 focus:ring-[#08384F]/5"
                        />
                      </div>
                      <button
                        onClick={() => handleResolve("Rejected")}
                        disabled={resolving}
                        className="h-[58px] px-6 rounded-2xl text-sm font-bold border border-rose-100 text-rose-700 bg-rose-50 hover:bg-rose-600 hover:text-white transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        {resolving ? (
                          <Loader2 size={18} className="animate-spin" />
                        ) : (
                          <XCircle size={18} />
                        )}
                        Reject
                      </button>
                      <button
                        onClick={() => handleResolve("Approved")}
                        disabled={resolving}
                        className="h-[58px] px-6 rounded-2xl text-sm font-bold text-white bg-[#08384F] hover:bg-[#0A4866] transition-all shadow-lg shadow-[#08384F]/20 disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        {resolving ? (
                          <Loader2 size={18} className="animate-spin" />
                        ) : (
                          <Send size={18} />
                        )}
                        Approve
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AttendanceRequests;
