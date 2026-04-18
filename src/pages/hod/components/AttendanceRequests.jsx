import React, { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import {
  CheckCircle2,
  Clock3,
  Loader2,
  Send,
  ShieldCheck,
  XCircle,
  ChevronRight,
  Filter,
  User,
  Calendar,
  AlertTriangle,
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
    border: "border-amber-100",
  },
  Approved: {
    icon: CheckCircle2,
    text: "text-emerald-700",
    bg: "bg-emerald-50",
    border: "border-emerald-100",
  },
  Rejected: {
    icon: XCircle,
    text: "text-rose-700",
    bg: "bg-rose-50",
    border: "border-rose-100",
  },
};

const FILTERS = ["Pending", "Approved", "Rejected", "All"];

const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  const [year, month, day] = dateString.split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const personName = (p) =>
  p
    ? `${p.salutation || ""} ${p.firstName || ""} ${p.lastName || ""}`.trim()
    : "Unknown";

const getAttendanceInfo = (r) => {
  const att = r?.attendanceRecord || {};
  const cls = att.classroom || {};
  const ent = att.timetableEntry || {};
  const comp =
    att.subjectComponent || ent.facultyAssignmentId?.subjectComponentId;
  const sub = comp?.subjectId || cls.subjectId || {};
  return {
    title: comp?.shortName || sub.code || "Subject",
    date: att.dateString,
    period: att.slotOrder || ent.slotOrder,
    section: cls.sectionId?.name || "N/A",
    faculty: personName(r.faculty),
    facultyId: r.faculty?.employeeId || "N/A",
  };
};

const ConfirmModal = ({ isOpen, type, onConfirm, onCancel, loading }) => {
  if (!isOpen) return null;
  const isApprove = type === "Approved";
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="p-6 text-center">
          <div
            className={`w-16 h-16 mx-auto rounded-2xl flex items-center justify-center mb-4 ${isApprove ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"}`}
          >
            {isApprove ? (
              <CheckCircle2 size={32} />
            ) : (
              <AlertTriangle size={32} />
            )}
          </div>
          <h3 className="text-xl font-black text-slate-800">Confirm {type}</h3>
          <p className="text-sm text-slate-500 mt-2 font-medium">
            Are you sure you want to {type.toLowerCase()} this attendance
            correction request?
          </p>
        </div>
        <div className="flex border-t border-slate-100">
          <button
            onClick={onCancel}
            className="flex-1 p-4 text-sm font-bold text-slate-400 hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`flex-1 p-4 text-sm font-bold text-white transition-colors flex items-center justify-center gap-2 ${isApprove ? "bg-emerald-600 hover:bg-emerald-700" : "bg-rose-600 hover:bg-rose-700"}`}
          >
            {loading ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              "Confirm"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

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
  const [confirm, setConfirm] = useState({ open: false, type: "" });

  const loadRequests = async () => {
    setLoading(true);
    try {
      const res = await getAttendanceRequests(status);
      const data = res.data?.requests || [];
      setRequests(data);
      setSummary(res.data?.summary || { ...summary, All: data.length });
      if (!selectedId || !data.find((r) => r._id === selectedId))
        setSelectedId(data[0]?._id || "");
    } catch {
      toast.error("Fetch failed");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, [status]);

  const selectedRequest = useMemo(
    () => requests.find((r) => r._id === selectedId),
    [requests, selectedId],
  );

  const handleResolve = async () => {
    setResolving(true);
    try {
      await resolveAttendanceRequest({
        requestId: selectedId,
        status: confirm.type,
        reviewRemarks: reviewRemarks.trim(),
      });
      toast.success(`Success: ${confirm.type}`);
      setConfirm({ open: false, type: "" });
      setReviewRemarks("");
      loadRequests();
    } catch {
      toast.error("Update failed");
    } finally {
      setResolving(false);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-[#F8FAFC] font-['Poppins']">
      <HeaderComponent title="Attendance Queue" />
      <div className="flex-1 flex overflow-hidden p-6 gap-6">
        <div className="flex-[1.4] flex flex-col bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <div className="flex gap-1.5">
              {FILTERS.map((f) => (
                <button
                  key={f}
                  onClick={() => setStatus(f)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${status === f ? "bg-[#08384F] text-white" : "text-slate-500 hover:bg-slate-50"}`}
                >
                  {f} <span className="ml-1 opacity-50">{summary[f] || 0}</span>
                </button>
              ))}
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 rounded-lg text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
              <Filter size={12} /> QUEUE
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            <table className="w-full text-left">
              <thead className="sticky top-0 bg-slate-50/90 backdrop-blur-sm z-10 border-b border-slate-100">
                <tr>
                  <th className="p-4 text-[10px] font-bold text-slate-400 uppercase">
                    Faculty
                  </th>
                  <th className="p-4 text-[10px] font-bold text-slate-400 uppercase">
                    Details
                  </th>
                  <th className="p-4 text-[10px] font-bold text-slate-400 uppercase text-center">
                    Status
                  </th>
                  <th className="p-4 w-10"></th>
                </tr>
              </thead>
              <tbody>
                {loading
                  ? [...Array(5)].map((_, i) => (
                      <tr key={i}>
                        <td colSpan={4} className="p-4 animate-pulse">
                          <div className="h-10 bg-slate-50 rounded-xl" />
                        </td>
                      </tr>
                    ))
                  : requests.map((req) => {
                      const info = getAttendanceInfo(req);
                      const isSel = selectedId === req._id;
                      const meta =
                        STATUS_META[req.approvalStatus] || STATUS_META.Pending;
                      return (
                        <tr
                          key={req._id}
                          onClick={() => setSelectedId(req._id)}
                          className={`cursor-pointer transition-colors ${isSel ? "bg-blue-50/40" : "hover:bg-slate-50"}`}
                        >
                          <td className="p-4 border-b border-slate-50">
                            <div className="text-xs font-bold text-slate-800">
                              {info.faculty}
                            </div>
                            <div className="text-[10px] text-slate-400">
                              {info.facultyId}
                            </div>
                          </td>
                          <td className="p-4 border-b border-slate-50">
                            <div className="text-xs font-bold text-slate-700">
                              {info.title}
                            </div>
                            <div className="text-[10px] text-slate-400">
                              {formatDate(info.date)} • P{info.period}
                            </div>
                          </td>
                          <td className="p-4 border-b border-slate-50 text-center">
                            <span
                              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${meta.bg} ${meta.text}`}
                            >
                              {req.approvalStatus}
                            </span>
                          </td>
                          <td className="p-4 border-b border-slate-50">
                            <ChevronRight
                              size={14}
                              className={
                                isSel ? "text-[#08384F]" : "text-slate-300"
                              }
                            />
                          </td>
                        </tr>
                      );
                    })}
              </tbody>
            </table>
          </div>
        </div>

        <div className="flex-1 bg-white rounded-3xl border border-slate-200 shadow-sm flex flex-col overflow-hidden">
          {selectedRequest ? (
            <>
              <div className="p-6 border-b border-slate-100">
                <h2 className="text-lg font-black text-slate-800">
                  Review Request
                </h2>
                <div className="mt-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                    Reason
                  </p>
                  <p className="text-xs text-slate-600">
                    "{selectedRequest.reason}"
                  </p>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-6">
                <table className="w-full text-left rounded-2xl border border-slate-100 overflow-hidden">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-4 py-2 text-[10px] font-bold text-slate-400 uppercase">
                        Student
                      </th>
                      <th className="px-4 py-2 text-[10px] font-bold text-slate-400 uppercase text-right">
                        Change
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {selectedRequest.requestedChanges?.map((c, i) => (
                      <tr key={i}>
                        <td className="px-4 py-3">
                          <div className="text-xs font-bold text-slate-800">
                            {c.student?.firstName}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <span className="text-[10px] font-bold text-slate-400 line-through">
                            {c.previousStatus}
                          </span>
                          <span className="text-[10px] font-bold text-emerald-600 ml-2 px-1.5 py-0.5 bg-emerald-50 rounded">
                            {c.newStatus}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {selectedRequest.approvalStatus === "Pending" && (
                <div className="p-6 border-t border-slate-100">
                  <textarea
                    value={reviewRemarks}
                    onChange={(e) => setReviewRemarks(e.target.value)}
                    placeholder="Remarks..."
                    className="w-full p-3 text-xs bg-slate-50 border border-slate-200 rounded-xl mb-4 focus:border-[#08384F] outline-none"
                    rows={2}
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() =>
                        setConfirm({ open: true, type: "Rejected" })
                      }
                      className="flex-1 h-10 rounded-xl border border-rose-100 text-rose-600 font-bold text-xs hover:bg-rose-50 transition-colors"
                    >
                      Reject
                    </button>
                    <button
                      onClick={() =>
                        setConfirm({ open: true, type: "Approved" })
                      }
                      className="flex-[2] h-10 rounded-xl bg-[#08384F] text-white font-bold text-xs hover:opacity-90 shadow-lg shadow-blue-900/10"
                    >
                      Approve
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-slate-300">
              <ShieldCheck size={48} />
              <p className="text-xs font-bold mt-2">Select a request</p>
            </div>
          )}
        </div>
      </div>
      <ConfirmModal
        isOpen={confirm.open}
        type={confirm.type}
        loading={resolving}
        onCancel={() => setConfirm({ open: false, type: "" })}
        onConfirm={handleResolve}
      />
    </div>
  );
};

export default AttendanceRequests;
