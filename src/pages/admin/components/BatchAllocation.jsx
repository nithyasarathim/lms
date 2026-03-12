import React, { useState, useEffect } from "react";
import {
  ArrowLeft,
  Loader2,
  ChevronDown,
  BookMarked,
  CheckCircle2,
  AlertTriangle,
  Plus,
  Layers,
  GraduationCap,
  RefreshCw,
  CalendarDays,
  Award,
} from "lucide-react";
import { useSearchParams } from "react-router-dom";
import {
  fetchRegulation,
  getBatchProgram,
  createBatchProgram,
  updateSection,
  getSemesterShiftInfo,
  shiftSemester,
} from "../api/admin.api";
import toast from "react-hot-toast";
import SectionList from "./SectionList";
import AddSectionModal from "../modals/AddSectionModal";
import EditSectionModal from "../modals/EditSectionModal";
import StatusConfirmationModal from "../modals/StatusConfirmationModal";

const BatchAllocation = ({ deptId, regId: batchId, regName }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [regulations, setRegulations] = useState([]);
  const [selectedReg, setSelectedReg] = useState("");
  const [batchProgramId, setBatchProgramId] = useState(null);
  const [deptData, setDeptData] = useState(null);
  const [isFixing, setIsFixing] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const [currentSem, setCurrentSem] = useState(null);
  const [isGraduated, setIsGraduated] = useState(false);
  const [isShiftLoading, setIsShiftLoading] = useState(false);
  const [showShiftConfirm, setShowShiftConfirm] = useState(false);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editModal, setEditModal] = useState({ isOpen: false, data: null });
  const [statusModal, setStatusModal] = useState({ isOpen: false, data: null });
  const [actionLoading, setActionLoading] = useState(false);

  const shouldHighlightReg =
    searchParams.get("highlight") === "reg" && !batchProgramId;

  useEffect(() => {
    const init = async () => {
      if (!deptId || !batchId) return;
      setLoading(true);
      try {
        const regData = await fetchRegulation();
        setRegulations(regData || []);

        const bpRes = await getBatchProgram(batchId, deptId);
        if (bpRes?.data?.batchProgram) {
          const bp = bpRes.data.batchProgram;
          setDeptData(bp.departmentId);

          if (bpRes.success && bp._id) {
            setBatchProgramId(bp._id);
            setSelectedReg(bp.regulationId?._id || bp.regulationId);
            await fetchSemInfo();
          } else {
            setBatchProgramId(null);
            setSelectedReg("");
          }
        } else {
          setBatchProgramId(null);
        }
      } catch (err) {
        console.error("Fetch Error:", err);
        setBatchProgramId(null);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [deptId, batchId]);

  const fetchSemInfo = async () => {
    try {
      const res = await getSemesterShiftInfo(batchId, deptId);
      if (res?.success) {
        setCurrentSem(res.data.currentSemester);
        setIsGraduated(res.data.isGraduated);
      }
    } catch (err) {
      console.error("Sem Info Error:", err);
    }
  };

  const handleShiftSemester = async () => {
    setIsShiftLoading(true);
    try {
      const res = await shiftSemester({ batchId, departmentId: deptId });
      if (res.success) {
        toast.success(res.message || "Semester shifted successfully");
        fetchSemInfo();
        setRefreshKey((prev) => prev + 1);
      }
      setShowShiftConfirm(false);
    } catch (err) {
      toast.error(err.message || "Shift failed");
    } finally {
      setIsShiftLoading(false);
    }
  };

  const removeHighlightParam = () => {
    if (searchParams.get("highlight")) {
      const newParams = new URLSearchParams(searchParams);
      newParams.delete("highlight");
      setSearchParams(newParams);
    }
  };

  const handleRegSelect = (e) => {
    const val = e.target.value;
    if (!val) return;
    setSelectedReg(val);
    setShowConfirm(true);
    removeHighlightParam();
  };

  const handleConfirmRegulation = async () => {
    setIsFixing(true);
    try {
      const payload = {
        batchId,
        departmentId: deptId,
        regulationId: selectedReg,
      };
      const res = await createBatchProgram(payload);
      if (res?.success) {
        toast.success("Regulation fixed successfully");
        const bpRes = await getBatchProgram(batchId, deptId);
        if (bpRes?.success) {
          const bp = bpRes.data.batchProgram;
          setBatchProgramId(bp._id);
          setSelectedReg(bp.regulationId?._id);
          removeHighlightParam();
          fetchSemInfo();
        }
      }
      setShowConfirm(false);
    } catch (err) {
      toast.error(err.message || "Failed to fix regulation");
      setSelectedReg("");
      setShowConfirm(false);
    } finally {
      setIsFixing(false);
    }
  };

  const handleUpdateSection = async (formData) => {
    setActionLoading(true);
    try {
      const res = await updateSection(editModal.data._id, formData);
      if (res.success) {
        toast.success("Section updated successfully");
        setRefreshKey((prev) => prev + 1);
        setEditModal({ isOpen: false, data: null });
      }
    } catch (err) {
      toast.error(err.message || "Update failed");
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleStatus = async () => {
    setActionLoading(true);
    try {
      const newStatus = !statusModal.data.isActive;
      const res = await updateSection(statusModal.data._id, {
        isActive: newStatus,
      });
      if (res.success) {
        toast.success(`Section ${newStatus ? "activated" : "deactivated"}`);
        setRefreshKey((prev) => prev + 1);
        setStatusModal({ isOpen: false, data: null });
      }
    } catch (err) {
      toast.error("Status update failed");
    } finally {
      setActionLoading(false);
    }
  };

  const handleBack = () => {
    const newParams = new URLSearchParams(searchParams);
    newParams.delete("deptId");
    newParams.delete("highlight");
    setSearchParams(newParams);
  };

  const selectedRegName = regulations.find((r) => r._id === selectedReg)?.name;

  return (
    <div className="relative px-6 py-6 font-['Poppins'] w-full min-h-screen">
      {shouldHighlightReg && (
        <div
          className="fixed inset-0 bg-gray-900/40 backdrop-blur-[2px] z-[40] transition-all duration-500"
          onClick={removeHighlightParam}
        />
      )}

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div className="flex flex-wrap items-center gap-4">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 text-[#08384F] font-bold text-sm hover:opacity-70 transition-opacity"
          >
            <ArrowLeft size={18} strokeWidth={2.5} /> Back
          </button>

          {!loading && (
            <div className="flex flex-wrap items-center gap-3">
              {deptData && (
                <div className="flex items-center gap-2 bg-white border border-gray-200 px-4 py-2 rounded-xl shadow-sm">
                  <GraduationCap size={16} className="text-gray-500" />
                  <span className="text-[10px] text-gray-400 font-bold uppercase">
                    Dept
                  </span>
                  <span className="font-bold text-xs text-[#08384F] uppercase">
                    {deptData.program} {deptData.code}
                  </span>
                </div>
              )}

              <div className="flex items-center gap-2 bg-white border border-gray-200 px-4 py-2 rounded-xl shadow-sm">
                <Layers size={16} className="text-gray-400" />
                <span className="text-[10px] text-gray-400 font-bold uppercase">
                  Batch
                </span>
                <span className="font-bold text-xs text-[#08384F] uppercase">
                  {regName}
                </span>
              </div>

              <div
                className={`flex items-center gap-2 bg-white px-4 py-2 rounded-xl shadow-sm transition-all duration-500 border-2 ${
                  shouldHighlightReg
                    ? "relative z-[50] border-[#08384F] ring-8 ring-[#08384F]/20 animate-pulse scale-110"
                    : "border-gray-100"
                }`}
              >
                <BookMarked
                  size={16}
                  className={
                    shouldHighlightReg ? "text-[#08384F]" : "text-gray-400"
                  }
                />
                <span className="text-[10px] text-gray-400 font-bold uppercase">
                  Reg
                </span>
                {batchProgramId ? (
                  <span className="font-bold text-xs text-[#08384F] uppercase">
                    {selectedRegName}
                  </span>
                ) : (
                  <div className="relative flex items-center">
                    <select
                      value={selectedReg}
                      onChange={handleRegSelect}
                      onFocus={removeHighlightParam}
                      className="appearance-none bg-transparent pr-5 font-bold text-xs text-[#08384F] outline-none cursor-pointer uppercase"
                    >
                      <option value="">Select</option>
                      {regulations.map((reg) => (
                        <option key={reg._id} value={reg._id}>
                          {reg.name}
                        </option>
                      ))}
                    </select>
                    <ChevronDown
                      size={14}
                      className="absolute right-0 text-gray-400 pointer-events-none"
                    />
                  </div>
                )}
              </div>

              {batchProgramId && (
                <>
                  {isGraduated ? (
                    <div className="flex items-center gap-2 bg-amber-50 border border-amber-100 px-4 py-2 rounded-xl shadow-sm">
                      <Award size={16} className="text-amber-600" />
                      <span className="font-bold text-xs text-amber-700 uppercase tracking-wide">
                        Graduated
                      </span>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center gap-2 bg-white border border-gray-200 px-4 py-2 rounded-xl shadow-sm">
                        <CalendarDays size={16} className="text-emerald-500" />
                        <span className="text-[10px] text-gray-400 font-bold uppercase">
                          Sem :
                        </span>
                        <span className="font-bold text-xs text-[#08384F] uppercase flex items-center">
                          {currentSem ? (
                            currentSem
                          ) : (
                            <span className="text-red-500 text-[10px]">
                              No Students
                            </span>
                          )}
                        </span>
                      </div>

                      <button
                        onClick={() => setShowShiftConfirm(true)}
                        className="flex items-center gap-2 bg-emerald-50 border border-emerald-100 px-4 py-2 rounded-xl shadow-sm hover:bg-emerald-100 transition-colors group"
                      >
                        <RefreshCw
                          size={16}
                          className="text-emerald-600 group-hover:rotate-180 transition-transform duration-500"
                        />
                        <span className="font-bold text-xs text-emerald-700 uppercase">
                          Promote semester
                        </span>
                      </button>
                    </>
                  )}
                </>
              )}
            </div>
          )}
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          disabled={!batchProgramId}
          className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all bg-[#08384F] text-white hover:bg-[#0a4763] shadow-md active:scale-95 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
        >
          <Plus size={18} strokeWidth={2.5} /> Add Section
        </button>
      </div>

      <div className="w-full">
        <div
          className={`bg-white border border-gray-100 rounded-3xl shadow-sm min-h-[500px] w-full flex flex-col ${
            !batchProgramId || loading
              ? "items-center justify-center p-20"
              : "p-6"
          }`}
        >
          {loading ? (
            <Loader2 className="animate-spin text-[#08384F]" size={48} />
          ) : batchProgramId ? (
            <SectionList
              key={refreshKey}
              batchProgramId={batchProgramId}
              onEdit={(section) =>
                setEditModal({ isOpen: true, data: section })
              }
              onToggleStatus={(section) =>
                setStatusModal({ isOpen: true, data: section })
              }
            />
          ) : (
            <div className="text-center space-y-4">
              <div className="mx-auto w-20 h-20 flex items-center justify-center rounded-2xl bg-gray-50 text-gray-400">
                <BookMarked size={42} />
              </div>
              <h3 className="text-lg font-bold text-gray-800 tracking-tight">
                Regulation Required
              </h3>
              <p className="text-sm text-gray-400 max-w-xs mx-auto">
                Select a regulation for{" "}
                <span className="font-semibold text-[#08384F]">
                  {deptData?.name || "this department"}
                </span>{" "}
                to unlock management tools.
              </p>
            </div>
          )}
        </div>
      </div>

      {showConfirm && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="text-amber-500" size={22} />
              <h3 className="font-semibold text-gray-800">
                Confirm Regulation
              </h3>
            </div>
            <p className="text-sm text-gray-500 mb-6">
              Fix <span className="font-semibold">{selectedRegName}</span> for{" "}
              <span className="font-semibold">{deptData?.code}</span>. This
              action cannot be changed later.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowConfirm(false);
                  setSelectedReg("");
                }}
                className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmRegulation}
                disabled={isFixing}
                className="px-4 py-2 bg-[#08384F] text-white text-sm rounded-lg flex items-center gap-2"
              >
                {isFixing && <Loader2 size={14} className="animate-spin" />}
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {showShiftConfirm && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl border border-emerald-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-emerald-50 rounded-lg">
                <RefreshCw className="text-emerald-600" size={22} />
              </div>
              <h3 className="font-semibold text-gray-800">Shift Semester</h3>
            </div>
            <p className="text-sm text-gray-500 mb-6">
              This will promote all sections in{" "}
              <span className="font-semibold text-[#08384F]">
                {deptData?.code}
              </span>{" "}
              to the next semester level. This process is irreversible.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowShiftConfirm(false)}
                className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900"
              >
                Cancel
              </button>
              <button
                onClick={handleShiftSemester}
                disabled={isShiftLoading}
                className="px-4 py-2 bg-emerald-600 text-white text-sm rounded-lg flex items-center gap-2 hover:bg-emerald-700"
              >
                {isShiftLoading && (
                  <Loader2 size={14} className="animate-spin" />
                )}
                Shift Now
              </button>
            </div>
          </div>
        </div>
      )}

      <AddSectionModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        batchProgramId={batchProgramId}
        onSuccess={() => setRefreshKey((prev) => prev + 1)}
      />
      <EditSectionModal
        isOpen={editModal.isOpen}
        section={editModal.data}
        onClose={() => setEditModal({ isOpen: false, data: null })}
        onSave={handleUpdateSection}
        loading={actionLoading}
      />
      <StatusConfirmationModal
        isOpen={statusModal.isOpen}
        section={statusModal.data}
        onClose={() => setStatusModal({ isOpen: false, data: null })}
        onConfirm={handleToggleStatus}
        loading={actionLoading}
      />
    </div>
  );
};

export default BatchAllocation;
