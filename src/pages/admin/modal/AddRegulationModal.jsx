import React, { useState } from "react";
import {
  X,
  BookMarked,
  Calendar,
  Loader2,
  AlertCircle,
  CheckCircle2,
  ArrowLeft,
  Sparkles,
} from "lucide-react";
import { createRegulation } from "../api/admin.api";

const AddRegulationModal = ({ isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: "",
    startYear: new Date().getFullYear(),
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);

  if (!isOpen) return null;

  const validateAndReview = (e) => {
    e.preventDefault();
    setError("");

    if (!formData.name.trim()) return setError("Regulation name is required");

    if (formData.startYear < 1990 || formData.startYear > 2100) {
      return setError("Please enter a valid academic year");
    }

    setShowConfirm(true);
  };

  const handleFinalSubmit = async () => {
    setLoading(true);
    setError("");

    try {
      const payload = {
        name: formData.name.trim(),
        startYear: Number(formData.startYear),
      };

      await createRegulation(payload);

      setFormData({ name: "", startYear: new Date().getFullYear() });

      if (onSuccess) onSuccess();

      handleClose();
    } catch (err) {
      setError(err.message || "Failed to create regulation");
      setShowConfirm(false);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (loading) return;
    setShowConfirm(false);
    setError("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 ">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-[#08384F]/30 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-3xl shadow-[0_25px_70px_rgba(0,0,0,0.15)] w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-6 border-b border-gray-100 bg-gradient-to-r from-[#08384F]/5 to-transparent">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#08384F] text-white shadow-md">
              <Sparkles size={18} />
            </div>

            <div>
              <h3 className="text-lg font-bold text-[#08384F]">
                {showConfirm ? "Confirm Regulation" : "Create Regulation"}
              </h3>
              <p className="text-xs text-gray-400">
                {showConfirm
                  ? "Review details before saving"
                  : "Define a new academic regulation"}
              </p>
            </div>
          </div>

          <button
            onClick={handleClose}
            disabled={loading}
            className="p-2 hover:bg-gray-100 rounded-full text-gray-400"
          >
            <X size={20} />
          </button>
        </div>

        {/* CONFIRM SCREEN */}
        {showConfirm ? (
          <div className="p-8 space-y-6 animate-in slide-in-from-right-5 duration-300">
            <div className="bg-gray-50 border border-gray-100 p-4 rounded-2xl flex items-start gap-3">
              <AlertCircle className="text-gray-600 mt-0.5" size={18} />
              <p className="text-sm text-gray-800">
                Please verify the regulation details before creating it.
                Curriculum mapping will be linked to this regulation.
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center p-4 bg-gray-50 rounded-2xl">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Regulation Name
                </span>
                <span className="text-base font-bold text-[#08384F]">
                  {formData.name}
                </span>
              </div>

              <div className="flex justify-between items-center p-4 bg-gray-50 rounded-2xl">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Academic Year
                </span>
                <span className="text-base font-bold text-[#08384F]">
                  {formData.startYear}
                </span>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                disabled={loading}
                onClick={() => setShowConfirm(false)}
                className="flex-1 py-3 px-5 border border-gray-200 text-gray-600 rounded-xl font-semibold hover:bg-gray-50 flex items-center justify-center gap-2"
              >
                <ArrowLeft size={16} />
                Edit
              </button>

              <button
                onClick={handleFinalSubmit}
                disabled={loading}
                className="flex-[2] py-3 px-5 bg-[#08384F] text-white rounded-xl font-semibold shadow-lg shadow-[#08384F]/20 hover:bg-[#0a4763] flex items-center justify-center gap-2"
              >
                {loading ? (
                  <Loader2 className="animate-spin" size={18} />
                ) : (
                  <>
                    <CheckCircle2 size={18} />
                    Confirm & Save
                  </>
                )}
              </button>
            </div>
          </div>
        ) : (
          /* FORM SCREEN */

          <form onSubmit={validateAndReview} className="p-8 space-y-6">
            {error && (
              <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm flex items-center gap-2">
                <AlertCircle size={16} />
                {error}
              </div>
            )}

            <div className="space-y-5">
              {/* Regulation Name */}

              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Regulation Name
                </label>

                <div className="relative mt-1">
                  <BookMarked
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                    size={18}
                  />

                  <input
                    required
                    disabled={loading}
                    placeholder="Example: R2023"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-4 focus:ring-[#08384F]/10 focus:border-[#08384F] text-sm"
                  />
                </div>
              </div>

              {/* Academic Year */}

              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Start Year
                </label>

                <div className="relative mt-1">
                  <Calendar
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                    size={18}
                  />

                  <input
                    required
                    disabled={loading}
                    type="number"
                    min="2020"
                    max="2100"
                    value={formData.startYear}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        startYear: e.target.value,
                      })
                    }
                    className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-4 focus:ring-[#08384F]/10 focus:border-[#08384F] text-sm"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                disabled={loading}
                onClick={handleClose}
                className="flex-1 py-3 px-5 border border-gray-200 text-gray-600 rounded-xl font-semibold hover:bg-gray-50"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={loading}
                className="flex-[1.5] py-3 px-5 bg-[#08384F] text-white rounded-xl font-semibold shadow-lg shadow-[#08384F]/20 hover:bg-[#0a4763]"
              >
                Next Step
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default AddRegulationModal;
