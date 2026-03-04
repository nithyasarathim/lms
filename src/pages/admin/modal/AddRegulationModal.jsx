import React, { useState } from "react";
import { X, BookMarked, Calendar, Loader2 } from "lucide-react";
import { createRegulation } from "../api/admin.api";

const AddRegulationModal = ({ isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: "",
    startYear: new Date().getFullYear(),
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const payload = {
        name: formData.name,
        startYear: Number(formData.startYear),
      };

      await createRegulation(payload);

      setFormData({ name: "", startYear: new Date().getFullYear() });
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      setError(err.message || "Failed to create regulation");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 font-['Poppins']">
      <div
        className="absolute inset-0 bg-[#08384F]/20 backdrop-blur-[2px] animate-in fade-in duration-300"
        onClick={!loading ? onClose : null}
      />

      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col">
        <div className="flex items-center justify-between px-8 py-5 border-b border-gray-50">
          <h3 className="text-xl font-bold text-[#282526] tracking-tight">
            Add Regulation
          </h3>
          <button
            onClick={onClose}
            disabled={loading}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400"
          >
            <X size={22} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {error && (
            <div className="p-3 bg-red-50 text-red-600 text-xs font-medium rounded-xl border border-red-100">
              {error}
            </div>
          )}

          <div className="space-y-5">
            <div className="relative">
              <label className="text-[13px] font-semibold text-gray-500 uppercase tracking-wider ml-1 mb-1.5 block">
                Regulation Name
              </label>
              <div className="relative">
                <BookMarked
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                  size={18}
                />
                <input
                  required
                  disabled={loading}
                  placeholder="e.g. R2023"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#08384F]/5 focus:border-[#08384F] transition-all text-[15px] outline-none"
                />
              </div>
            </div>

            <div className="relative">
              <label className="text-[13px] font-semibold text-gray-500 uppercase tracking-wider ml-1 mb-1.5 block">
                Start Year
              </label>
              <div className="relative">
                <Calendar
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                  size={18}
                />
                <input
                  required
                  disabled={loading}
                  type="number"
                  placeholder="2023"
                  value={formData.startYear}
                  onChange={(e) =>
                    setFormData({ ...formData, startYear: e.target.value })
                  }
                  className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#08384F]/5 focus:border-[#08384F] transition-all text-[15px] outline-none"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              disabled={loading}
              onClick={onClose}
              className="flex-1 py-3.5 px-6 border border-gray-200 text-gray-600 rounded-2xl font-bold hover:bg-gray-50 transition-all disabled:opacity-50"
            >
              Discard
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-[1.5] py-3.5 px-6 bg-[#08384F] text-white rounded-2xl font-bold shadow-lg shadow-[#08384F]/20 hover:bg-[#0a4763] transition-all disabled:opacity-70 flex items-center justify-center gap-2"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={18} />
              ) : (
                "Save Regulation"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddRegulationModal;
