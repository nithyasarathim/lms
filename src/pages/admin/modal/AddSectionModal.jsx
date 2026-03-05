import React, { useState } from "react";
import { X, Hash, Users, Loader2 } from "lucide-react";
import { createSection } from "../api/admin.api";
import toast from "react-hot-toast";

const AddSectionModal = ({ isOpen, onClose, batchProgramId, onSuccess }) => {
  const [formData, setFormData] = useState({ name: "", capacity: 60 });
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await createSection({
        name: formData.name.toUpperCase(),
        batchProgramId,
        capacity: Number(formData.capacity),
        isActive: true
      });
      toast.success("Section added successfully");
      setFormData({ name: "", capacity: 60 });
      onSuccess();
      onClose();
    } catch (err) {
      toast.error(err.message || "Failed to add section");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 font-['Poppins']">
      <div className="absolute inset-0 bg-[#08384F]/20 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-50">
          <h3 className="text-lg font-bold text-[#282526]">Add Section</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full"><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="text-xs font-bold text-gray-400 uppercase ml-1 mb-1 block">Section Name</label>
            <div className="relative">
              <Hash className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input required placeholder="e.g. A" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-[#08384F] outline-none transition-all text-sm font-bold" />
            </div>
          </div>
          <div>
            <label className="text-xs font-bold text-gray-400 uppercase ml-1 mb-1 block">Capacity</label>
            <div className="relative">
              <Users className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input required type="number" value={formData.capacity} onChange={(e) => setFormData({...formData, capacity: e.target.value})} className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-[#08384F] outline-none transition-all text-sm font-bold" />
            </div>
          </div>
          <button type="submit" disabled={loading} className="w-full py-3 bg-[#08384F] text-white rounded-xl font-bold flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50">
            {loading ? <Loader2 className="animate-spin" size={18} /> : "Add Section"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddSectionModal;