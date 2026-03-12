import React, { useState } from "react";
import {
  X,
  Calendar,
  Hash,
  Loader2,
  AlertCircle,
  CheckCircle2,
  ArrowLeft,
  Layers,
} from "lucide-react";
import { createBatch } from "../api/admin.api";
import toast from "react-hot-toast";

const AddBatchModal = ({ isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: "",
    startYear: new Date().getFullYear(),
    endYear: new Date().getFullYear() + 4,
    programDuration: 4,
  });
  const [loading, setLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  if (!isOpen) return null;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const val = name === "name" ? value : Number(value);

    setFormData((prev) => {
      const updated = { ...prev, [name]: val };
      // Auto-calculate endYear if startYear or duration changes
      if (name === "startYear" || name === "programDuration") {
        updated.endYear = updated.startYear + updated.programDuration;
        updated.name = `${updated.startYear}-${updated.endYear}`;
      }
      return updated;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!showConfirm) {
      setShowConfirm(true);
      return;
    }

    setLoading(true);
    try {
      const payload = {
        ...formData,
        isActive: true,
      };
      await createBatch(payload);
      toast.success("Batch created successfully");
      setFormData({
        name: "",
        startYear: new Date().getFullYear(),
        endYear: new Date().getFullYear() + 4,
        programDuration: 4,
      });
      if (onSuccess) onSuccess();
      handleClose();
    } catch (err) {
      toast.error(err.message || "Error creating batch");
      setShowConfirm(false);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (loading) return;
    setShowConfirm(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 font-['Poppins']">
      <div
        className="absolute inset-0 bg-[#08384F]/30 backdrop-blur-[4px] animate-in fade-in duration-300"
        onClick={handleClose}
      />
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden relative animate-in zoom-in-95 duration-300">
        <div className="flex items-center justify-between px-8 pt-5 border-b border-gray-50">
          <h3 className="text-xl font-bold text-[#282526]">
            {showConfirm ? "Confirm Batch Details" : "Add New Batch"}
          </h3>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-full text-gray-400"
          >
            <X size={22} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-1">
          {showConfirm ? (
            <div className="space-y-4 animate-in slide-in-from-right-4 duration-300">
              <div className="bg-gray-50 border border-gray-100 p-4 rounded-2xl flex items-start gap-3">
                <AlertCircle
                  className="text-gray-600 shrink-0 mt-0.5"
                  size={20}
                />
                <p className="text-sm text-gray-800 font-medium">
                  Review the batch timeline. This will be used to track student
                  progress over {formData.programDuration} years.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                    Batch Name
                  </p>
                  <p className="text-lg font-bold text-[#08384F]">
                    {formData.name}
                  </p>
                </div>
                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                    Duration
                  </p>
                  <p className="text-lg font-bold text-[#08384F]">
                    {formData.programDuration} Years
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowConfirm(false)}
                  className="flex-1 py-3.5 px-6 border border-gray-200 text-gray-600 rounded-2xl font-bold hover:bg-gray-50 flex items-center justify-center gap-2"
                >
                  <ArrowLeft size={18} /> Edit
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-[2] py-3.5 px-6 bg-[#08384F] text-white rounded-2xl font-bold shadow-lg shadow-[#08384F]/20 hover:bg-[#0a4763] flex items-center justify-center gap-2 disabled:opacity-70"
                >
                  {loading ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    <CheckCircle2 size={18} />
                  )}
                  Confirm & Create
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              <div className="relative">
                <label className="text-[13px] font-semibold text-gray-500 uppercase tracking-wider block mb-1.5 ml-1">
                  Batch Name (Automatic)
                </label>
                <div className="relative">
                  <Layers
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                    size={18}
                  />
                  <input
                    required
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="e.g. 2023-2027"
                    className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white focus:border-[#08384F] outline-none transition-all font-bold text-[#08384F]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="relative">
                  <label className="text-[13px] font-semibold text-gray-500 uppercase tracking-wider block mb-1.5 ml-1">
                    Start Year
                  </label>
                  <div className="relative">
                    <Calendar
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                      size={18}
                    />
                    <input
                      required
                      type="number"
                      name="startYear"
                      value={formData.startYear}
                      onChange={handleInputChange}
                      className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:bg-white focus:border-[#08384F]"
                    />
                  </div>
                </div>
                <div className="relative">
                  <label className="text-[13px] font-semibold text-gray-500 uppercase tracking-wider block mb-1.5 ml-1">
                    Duration (Yrs)
                  </label>
                  <div className="relative">
                    <Hash
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                      size={18}
                    />
                    <input
                      required
                      type="number"
                      name="programDuration"
                      value={formData.programDuration}
                      onChange={handleInputChange}
                      className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:bg-white focus:border-[#08384F]"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleClose}
                  className="flex-1 py-3.5 px-6 border border-gray-200 text-gray-600 rounded-2xl font-bold hover:bg-gray-50 transition-all"
                >
                  Discard
                </button>
                <button
                  type="submit"
                  className="flex-[1.5] py-3.5 px-6 bg-[#08384F] text-white rounded-2xl font-bold shadow-lg hover:bg-[#0a4763] transition-all"
                >
                  Review Batch
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default AddBatchModal;
