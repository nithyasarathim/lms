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
} from "lucide-react";
import { useSearchParams } from "react-router-dom";
import {
  fetchRegulation,
  getBatchProgram,
  createBatchProgram,
} from "../api/admin.api";
import toast from "react-hot-toast";

const BatchAllocation = ({ deptId, regId: batchId, regName }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [regulations, setRegulations] = useState([]);
  const [selectedReg, setSelectedReg] = useState("");
  const [batchProgramId, setBatchProgramId] = useState(null);
  const [deptData, setDeptData] = useState(null);
  const [isFixing, setIsFixing] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

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
          } else {
            setBatchProgramId(null);
            setSelectedReg("");
          }
        }
      } catch (err) {
        setBatchProgramId(null);
        setSelectedReg("");
        setDeptData(null);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [deptId, batchId]);

  const handleRegSelect = (e) => {
    const val = e.target.value;
    if (!val) return;
    setSelectedReg(val);
    setShowConfirm(true);
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
          setDeptData(bp.departmentId);
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

  const handleBack = () => {
    const newParams = new URLSearchParams(searchParams);
    newParams.delete("deptId");
    setSearchParams(newParams);
  };

  const selectedRegName = regulations.find((r) => r._id === selectedReg)?.name;

  return (
    <div className="px-6 py-6 font-['Poppins']">
      <div className="flex items-center justify-between mb-8">
        <div className="flex flex-wrap items-center gap-4">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 text-[#08384F] font-bold text-sm hover:opacity-70"
          >
            <ArrowLeft size={18} strokeWidth={2.5} />
            Back
          </button>

          <div className="flex flex-wrap items-center gap-3">
            {deptData && (
              <div className="flex items-center gap-2 bg-white border border-gray-200 px-4 py-2 rounded-xl shadow-sm">
                <GraduationCap size={16} className="text-gray-500" />
                <span className="text-[11px] text-gray-400 font-bold uppercase">
                  Dept
                </span>
                <span className="font-bold text-[14px] text-[#08384F] uppercase">
                  {deptData.program} {deptData.code}
                </span>
              </div>
            )}

            <div className="flex items-center gap-2 bg-white border border-gray-200 px-4 py-2 rounded-xl shadow-sm">
              <Layers size={16} className="text-gray-400" />
              <span className="text-[11px] text-gray-400 font-bold uppercase">
                Batch
              </span>
              <span className="font-bold text-[14px] text-[#08384F] uppercase">
                {regName}
              </span>
            </div>

            <div className="flex items-center gap-2 bg-white border border-gray-200 px-4 py-2 rounded-xl shadow-sm">
              <BookMarked size={16} className="text-gray-400" />
              <span className="text-[11px] text-gray-400 font-bold uppercase">
                Reg
              </span>

              {batchProgramId ? (
                <span className="font-bold text-[14px] text-[#08384F] uppercase">
                  {selectedRegName}
                </span>
              ) : (
                <div className="relative flex items-center">
                  <select
                    value={selectedReg}
                    onChange={handleRegSelect}
                    className="appearance-none bg-transparent pr-5 font-bold text-[14px] text-[#08384F] outline-none cursor-pointer"
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
          </div>
        </div>

        <button
          disabled={!batchProgramId}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition
          ${
            batchProgramId
              ? "bg-[#08384F] text-white hover:bg-[#0a4763]"
              : "bg-gray-100 text-gray-400 cursor-not-allowed"
          }`}
        >
          <Plus size={18} strokeWidth={2.5} />
          Add Section
        </button>
      </div>

      <div className="max-w-4xl mx-auto">
        <div className="bg-white border border-gray-100 rounded-3xl p-20 text-center shadow-sm">
          {loading ? (
            <Loader2
              className="animate-spin mx-auto text-[#08384F]"
              size={48}
            />
          ) : !batchProgramId ? (
            <div className="space-y-4">
              <BookMarked
                size={42}
                className="mx-auto text-gray-500 bg-gray-50 p-3 rounded-2xl"
              />
              <h3 className="text-lg font-semibold text-gray-800">
                Regulation Required
              </h3>
              <p className="text-sm text-gray-400 max-w-xs mx-auto">
                Select a regulation for <span className="font-semibold text-[#08384F]">{deptData?.name || "this department"}</span> to unlock management tools.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <CheckCircle2
                size={42}
                className="mx-auto text-emerald-500 bg-emerald-50 p-3 rounded-2xl"
              />
              <h3 className="text-lg font-semibold text-gray-800">
                Configuration Active
              </h3>
              <div className="text-sm text-gray-400 max-w-sm mx-auto leading-relaxed">
                Batch <span className="font-semibold text-[#08384F]">{regName}</span> for{" "}
                <span className="font-semibold text-[#08384F]">{deptData?.name}</span> is locked with{" "}
                <span className="font-semibold text-[#08384F]">{selectedRegName}</span>.
              </div>
            </div>
          )}
        </div>
      </div>

      {showConfirm && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="text-amber-500" size={22} />
              <h3 className="font-semibold text-gray-800">
                Confirm Regulation
              </h3>
            </div>

            <p className="text-sm text-gray-500 mb-6">
              Fix <span className="font-semibold">{selectedRegName}</span> for
              <span className="font-semibold"> {deptData?.code}</span>. This action cannot be changed later.
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
    </div>
  );
};

export default BatchAllocation;