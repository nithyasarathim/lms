import React, { useState, useEffect } from "react";
import {
  X,
  Plus,
  Power,
  Loader2,
  CalendarRange,
  ShieldAlert,
  Info,
} from "lucide-react";
import {
  getAllAcademicYears,
  AddAcademicYear,
  updateAcademicYear,
} from "../api/admin.api";
import toast from "react-hot-toast";

const ManageAcademicYearsModal = ({ isOpen, onClose }) => {
  const [years, setYears] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [confirmToggle, setConfirmToggle] = useState({
    show: false,
    data: null,
  });
  const [confirmCreate, setConfirmCreate] = useState(false);
  const [confirmationInput, setConfirmationInput] = useState("");

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const currentYear = new Date().getFullYear();

  const [formData, setFormData] = useState({
    startYear: currentYear,
    endYear: currentYear + 1,
    startMonth: 7,
    endMonth: 5,
    isActive: false,
  });

  const expectedKey = `${formData.startYear}-${formData.endYear}`;

  useEffect(() => {
    if (isOpen) fetchYears();
  }, [isOpen]);

  const fetchYears = async () => {
    setLoading(true);
    try {
      const res = await getAllAcademicYears();
      const data = res?.data?.academicYears || res?.data || res || [];
      setYears(Array.isArray(data) ? data : []);
    } catch (err) {
      toast.error("Failed to load records");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async () => {
    const { id, currentStatus } = confirmToggle.data;
    try {
      await updateAcademicYear(id, { isActive: !currentStatus });
      toast.success(
        `Academic year ${!currentStatus ? "activated" : "deactivated"}`,
      );
      setConfirmToggle({ show: false, data: null });
      fetchYears();
    } catch (err) {
      toast.error("Update failed");
    }
  };

  const validateForm = () => {
    const { startYear, endYear, startMonth, endMonth } = formData;
    if (endYear - startYear !== 1) {
      toast.error("Difference must be exactly 1 year");
      return false;
    }
    const isDuplicate = years.some(
      (y) => y.startYear === startYear && y.endYear === endYear,
    );
    if (isDuplicate) {
      toast.error(`Year ${startYear}-${endYear} already exists`);
      return false;
    }
    if (startMonth === endMonth) {
      toast.error("Months cannot be identical");
      return false;
    }
    return true;
  };

  const handleAddYear = async () => {
    if (confirmationInput !== expectedKey) {
      return toast.error("Year string mismatch");
    }
    setSubmitting(true);
    try {
      await AddAcademicYear(formData);
      toast.success("Academic Year Created");
      setShowAddForm(false);
      setConfirmCreate(false);
      setConfirmationInput("");
      fetchYears();
      setFormData({
        startYear: currentYear,
        endYear: currentYear + 1,
        startMonth: 7,
        endMonth: 5,
        isActive: false,
      });
    } catch (err) {
      toast.error(err.response?.data?.message || "Creation failed");
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[150] p-4 font-['Poppins']">
      <div className="bg-white rounded-[32px] w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[85vh] relative border border-slate-100">
        {confirmToggle.show && (
          <div className="absolute inset-0 z-[170] bg-slate-900/10 backdrop-blur-md flex items-center justify-center p-6 animate-in fade-in duration-300">
            <div className="bg-white w-full max-w-[340px] rounded-[24px] shadow-2xl overflow-hidden text-center border border-slate-100">
              <div className="p-6">
                <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-green-50 text-green-600 flex items-center justify-center">
                  <Info size={24} />
                </div>
                <h3 className="text-base font-bold text-slate-800 mb-2 tracking-tight">
                  Switch Active Year?
                </h3>
                <p className="text-[11px] font-bold text-slate-500 leading-relaxed px-2 uppercase tracking-tight">
                  Activating this year will automatically set all other academic
                  years to inactive.
                </p>
              </div>
              <div className="flex border-t border-slate-100">
                <button
                  onClick={() => setConfirmToggle({ show: false, data: null })}
                  className="flex-1 py-3.5 text-xs font-bold text-slate-400 border-r border-slate-100 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleToggleStatus}
                  className="flex-1 py-3.5 text-xs font-bold text-green-600 hover:bg-green-50"
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        )}

        {confirmCreate && (
          <div className="absolute inset-0 z-[170] bg-slate-900/10 backdrop-blur-md flex items-center justify-center p-6 animate-in fade-in duration-300">
            <div className="bg-white w-full max-w-[360px] rounded-[24px] shadow-2xl overflow-hidden border border-slate-100">
              <div className="p-6 text-center">
                <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-red-50 text-red-600 flex items-center justify-center">
                  <ShieldAlert size={24} />
                </div>
                <h3 className="text-base font-bold text-slate-800 mb-2 tracking-tight">
                  Final Confirmation
                </h3>
                <p className="text-[11px] font-semibold text-slate-500 mb-4 leading-relaxed uppercase tracking-tight">
                  Type{" "}
                  <span className="text-red-600 font-black select-all">
                    {expectedKey}
                  </span>{" "}
                  to initialize. This action cannot be undone.
                </p>
                <input
                  type="text"
                  placeholder={expectedKey}
                  value={confirmationInput}
                  onChange={(e) => setConfirmationInput(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-center text-sm font-black text-[#08384F] outline-none focus:border-red-300 transition-all"
                />
              </div>
              <div className="flex border-t border-slate-100">
                <button
                  onClick={() => {
                    setConfirmCreate(false);
                    setConfirmationInput("");
                  }}
                  className="flex-1 py-3.5 text-xs font-bold text-slate-400 border-r border-slate-100 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddYear}
                  disabled={confirmationInput !== expectedKey || submitting}
                  className={`flex-1 py-3.5 text-xs font-bold transition-colors ${confirmationInput === expectedKey ? "text-red-600 hover:bg-red-50" : "text-slate-300 cursor-not-allowed"}`}
                >
                  {submitting ? (
                    <Loader2 size={14} className="animate-spin mx-auto" />
                  ) : (
                    "Verify & Create"
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="px-6 py-5 border-b border-slate-50 flex justify-between items-center bg-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#08384F] rounded-xl text-white shadow-md shadow-green-900/10">
              <CalendarRange size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#08384F]">
                Academic Years
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-hidden flex flex-col bg-white">
          <div className="p-6 overflow-y-auto custom-scrollbar">
            {!showAddForm ? (
              <button
                onClick={() => setShowAddForm(true)}
                className="w-full py-4 border-2 border-dashed border-slate-100 rounded-2xl flex items-center justify-center gap-2 text-slate-400 hover:border-[#08384F] hover:text-[#08384F] transition-all mb-8 bg-slate-50/50 hover:bg-white"
              >
                <Plus size={16} strokeWidth={2.5} />{" "}
                <span className="font-bold text-xs uppercase tracking-tight">
                  Initialize New Academic Year
                </span>
              </button>
            ) : (
              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5 mb-8 animate-in slide-in-from-top-2 duration-300">
                <div className="grid grid-cols-2 gap-4 mb-5">
                  {["startYear", "endYear"].map((field) => (
                    <div key={field} className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider ml-1">
                        {field === "startYear" ? "Start Year" : "End Year"}
                      </label>
                      <input
                        type="number"
                        value={formData[field]}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            [field]: Number(e.target.value),
                          })
                        }
                        className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm font-bold text-[#08384F] outline-none focus:border-[#08384F]"
                      />
                    </div>
                  ))}
                  {["startMonth", "endMonth"].map((field) => (
                    <div key={field} className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider ml-1">
                        {field === "startMonth" ? "Start Month" : "End Month"}
                      </label>
                      <select
                        value={formData[field]}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            [field]: Number(e.target.value),
                          })
                        }
                        className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm font-bold text-[#08384F] outline-none"
                      >
                        {monthNames.map((m, i) => (
                          <option key={m} value={i + 1}>
                            {m}
                          </option>
                        ))}
                      </select>
                    </div>
                  ))}
                </div>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="flex-1 py-3 rounded-xl text-xs font-bold text-slate-400 hover:bg-slate-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => validateForm() && setConfirmCreate(true)}
                    className="flex-[2] bg-[#08384F] text-white py-3 rounded-xl text-xs font-bold shadow-lg active:scale-95 transition-transform"
                  >
                    Initialize Year
                  </button>
                </div>
              </div>
            )}

            <div className="space-y-3 max-h-[320px] overflow-y-auto pr-2 custom-scrollbar">
              <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1 px-1">
                Registered Academic Years
              </p>
              {loading ? (
                <div className="flex flex-col items-center py-12">
                  <Loader2 className="animate-spin text-[#08384F] mb-3" />
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    Syncing Records
                  </p>
                </div>
              ) : years.length > 0 ? (
                years.map((year) => (
                  <div
                    key={year._id}
                    className={`flex items-center justify-between px-4 py-2 rounded-2xl border transition-all duration-300 ${year.isActive ? "bg-slate-50 border-[#08384F]/20 shadow-sm" : "bg-white border-slate-100 hover:border-slate-200"}`}
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-11 h-11 rounded-xl flex items-center justify-center transition-colors ${year.isActive ? "bg-[#08384F] text-white shadow-lg" : "bg-slate-50 text-slate-300"}`}
                      >
                        <CalendarRange size={20} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-0.5">
                          <h4 className="text-sm font-bold text-[#08384F] tracking-tight">
                            {year.startYear} — {year.endYear}
                          </h4>
                          {year.isActive && (
                            <span className="text-[8px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100 uppercase tracking-tighter">
                              Active
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-[10px] font-black text-slate-400 bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-100 uppercase tracking-tighter">
                        {monthNames[year.startMonth - 1].slice(0, 3)} —{" "}
                        {monthNames[year.endMonth - 1].slice(0, 3)}
                      </span>
                      <button
                        onClick={() =>
                          setConfirmToggle({
                            show: true,
                            data: {
                              id: year._id,
                              currentStatus: year.isActive,
                            },
                          })
                        }
                        className={`p-2.5 rounded-xl transition-all active:scale-90 ${year.isActive ? "text-emerald-500 bg-white shadow-sm border border-emerald-100" : "text-slate-300 bg-slate-50 hover:text-[#08384F]"}`}
                      >
                        <Power size={18} strokeWidth={2.5} />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-10 border-2 border-dashed border-slate-100 rounded-3xl">
                  <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">
                    No Records Found
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="p-5 bg-slate-50/30 border-t border-slate-50 flex justify-center shrink-0">
          <button
            onClick={onClose}
            className="text-[10px] font-black text-slate-400 hover:text-[#08384F] uppercase tracking-[0.3em] transition-colors"
          >
            Exit Management
          </button>
        </div>
      </div>
    </div>
  );
};

export default ManageAcademicYearsModal;
