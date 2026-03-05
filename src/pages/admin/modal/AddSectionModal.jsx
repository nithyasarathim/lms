import React, { useState } from "react";
import { X, Hash, Users, Loader2, LayoutGrid } from "lucide-react";
import { createSection } from "../api/admin.api";
import toast from "react-hot-toast";

const AddSectionModal = ({ isOpen, onClose, onSuccess, batchProgramId }) => {
  const [formData, setFormData] = useState({ name: "", capacity: 60 });
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        name: formData.name.toUpperCase(),
        batchProgramId: batchProgramId,
        capacity: Number(formData.capacity),
        isActive: true,
      };
      await createSection(payload);
      toast.success(`Section ${formData.name} created successfully`);
      setFormData({ name: "", capacity: 60 });
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      toast.error(err.message || "Error creating section");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 font-['Poppins']">
      <div
        className="absolute inset-0 bg-[#08384F]/20 backdrop-blur-[2px]"
        onClick={onClose}
      />
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden relative animate-in zoom-in-95 duration-300">
        <div className="flex items-center justify-between px-8 py-4 border-b border-gray-50">
          <h3 className="text-xl font-bold text-[#282526]">Add Section</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full text-gray-400"
          >
            <X size={22} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-8 pt-6 space-y-6">
          <div className="space-y-5">
            <div>
              <label className="text-[13px] font-semibold text-gray-500 uppercase tracking-wider block mb-1">
                Section Name
              </label>
              <div className="relative">
                <LayoutGrid
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                  size={18}
                />
                <input
                  required
                  placeholder="e.g. A, B or C"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white focus:border-[#08384F] outline-none transition-all font-bold uppercase"
                />
              </div>
            </div>

            <div>
              <label className="text-[13px] font-semibold text-gray-500 uppercase tracking-wider block mb-1">
                Student Capacity
              </label>
              <div className="relative">
                <Users
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                  size={18}
                />
                <input
                  required
                  type="number"
                  name="capacity"
                  value={formData.capacity}
                  onChange={handleInputChange}
                  className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white focus:border-[#08384F] outline-none transition-all font-bold"
                />
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3.5 px-6 border border-gray-100 text-gray-600 rounded-2xl font-semibold hover:bg-gray-50 transition-colors"
            >
              Discard
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-[1.5] py-3.5 px-6 bg-[#08384F] text-white rounded-2xl font-semibold flex items-center justify-center gap-2 hover:bg-[#0a4763] transition-all disabled:opacity-70"
            >
              {loading && <Loader2 size={18} className="animate-spin" />}
              {loading ? "Creating..." : "Create Section"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddSectionModal;
