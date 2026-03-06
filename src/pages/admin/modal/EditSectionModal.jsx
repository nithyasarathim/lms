import React, { useState, useEffect } from "react";
import { X, Loader2, Save } from "lucide-react";

const EditSectionModal = ({ isOpen, onClose, onSave, section, loading }) => {
  const [formData, setFormData] = useState({ name: "", capacity: "" });

  useEffect(() => {
    if (section)
      setFormData({ name: section.name, capacity: section.capacity });
  }, [section]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[100] p-4 font-['Poppins']">
      <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300">
        <div className="px-8 py-6 flex items-center justify-between border-b border-gray-50">
          <h3 className="text-xl font-bold text-[#08384F]">Edit Section</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <X size={20} className="text-gray-400" />
          </button>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSave(formData);
          }}
          className="p-8 space-y-6"
        >
          <div className="space-y-2">
            <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider ml-1">
              Section Name
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-3.5 text-sm font-medium outline-none focus:border-[#08384F] focus:bg-white transition-all"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider ml-1">
              Capacity
            </label>
            <input
              type="number"
              required
              value={formData.capacity}
              onChange={(e) =>
                setFormData({ ...formData, capacity: e.target.value })
              }
              className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-3.5 text-sm font-medium outline-none focus:border-[#08384F] focus:bg-white transition-all"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-4 text-sm font-bold text-gray-400 hover:bg-gray-50 rounded-2xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-[2] py-4 bg-[#08384F] text-white text-sm font-bold rounded-2xl flex items-center justify-center gap-2 hover:bg-[#0a4763] shadow-lg transition-all"
            >
              {loading ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <Save size={18} />
              )}
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditSectionModal;
