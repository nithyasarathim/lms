import React, { useState, useEffect } from "react";
import {
  ArrowLeft,
  Loader2,
  ChevronDown,
  BookMarked,
  AlertTriangle,
  Plus,
  Layers,
  GraduationCap,
} from "lucide-react";
import { useSearchParams } from "react-router-dom";
import {
  fetchRegulation,
  getBatchProgram,
  createBatchProgram,
  updateSection, // Ensure these are exported in your api file
} from "../api/admin.api";
import toast from "react-hot-toast";
import SectionList from "./SectionList";
import AddSectionModal from "../modal/AddSectionModal";
import EditSectionModal from "../modal/EditSectionModal";
import StatusConfirmationModal from "../modal/StatusConfirmationModal";

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

  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editModal, setEditModal] = useState({ isOpen: false, data: null });
  const [statusModal, setStatusModal] = useState({ isOpen: false, data: null });
  const [actionLoading, setActionLoading] = useState(false);

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
          if (bpRes.success) {
            setBatchProgramId(bp._id);
            setSelectedReg(bp.regulationId?._id || bp.regulationId);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [deptId, batchId]);

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
    setSearchParams(newParams);
  };

  const selectedRegName = regulations.find((r) => r._id === selectedReg)?.name;

  return (
    <div className="px-6 py-6 font-['Poppins'] w-full">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div className="flex flex-wrap items-center gap-4">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 text-[#08384F] font-bold text-sm hover:opacity-70 transition-opacity"
          >
            <ArrowLeft size={18} strokeWidth={2.5} /> Back
          </button>
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
          </div>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          disabled={!batchProgramId}
          className={`flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
            batchProgramId
              ? "bg-[#08384F] text-white hover:bg-[#0a4763] shadow-md"
              : "bg-gray-100 text-gray-400 cursor-not-allowed"
          }`}
        >
          <Plus size={18} strokeWidth={2.5} /> Add Section
        </button>
      </div>

      <div className="w-full">
        <div
          className={`bg-white border border-gray-100 rounded-3xl shadow-sm min-h-[500px] w-full flex flex-col ${!batchProgramId || loading ? "items-center justify-center p-10" : "p-6"}`}
        >
          {loading ? (
            <Loader2 className="animate-spin text-[#08384F]" size={40} />
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
              <BookMarked size={32} className="mx-auto text-gray-400" />
              <h3 className="text-lg font-bold">Regulation Required</h3>
            </div>
          )}
        </div>
      </div>

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
