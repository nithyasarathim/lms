import React, { useState } from "react";
import { X, GraduationCap, Building2, Hash, Loader2 } from "lucide-react";
import { createDepartment } from "../api/admin.api";

const AddDepartmentModal = ({ isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({ name: "", code: "", program: "" });
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
        name: formData.name,
        code: formData.code,
        program: formData.program,
        hodId: null,
        isActive: true,
      };
      await createDepartment(payload);
      setFormData({ name: "", code: "", program: "" });
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      console.error(err);
      alert("Error creating department");
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
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden relative animate-in zoom-in-95 duration-300">
        <div className="flex items-center justify-between px-8 py-4 border-b border-gray-50">
          <h3 className="text-xl font-bold text-[#282526]">Add Department</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full text-gray-400"
          >
            <X size={22} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-8 pt-6 space-y-6">
          <div className="space-y-5">
            <div className="relative">
              <label className="text-[13px] font-semibold text-gray-500 uppercase tracking-wider block mb-1">
                Name
              </label>
              <div className="relative">
                <Building2
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                  size={18}
                />
                <input
                  required
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white focus:border-[#08384F] outline-none transition-all"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[13px] font-semibold text-gray-500 uppercase tracking-wider block mb-1">
                  Code
                </label>
                <div className="relative">
                  <Hash
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                    size={18}
                  />
                  <input
                    required
                    name="code"
                    value={formData.code}
                    onChange={handleInputChange}
                    className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="text-[13px] font-semibold text-gray-500 uppercase tracking-wider block mb-1">
                  Program
                </label>
                <div className="relative">
                  <GraduationCap
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                    size={18}
                  />
                  <select
                    required
                    name="program"
                    value={formData.program}
                    onChange={handleInputChange}
                    className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl appearance-none"
                  >
                    <option value="">Select...</option>
                    <option value="B.E.">B.E.</option>
                    <option value="B.Tech.">B.Tech.</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3.5 px-6 border rounded-2xl font-semibold"
            >
              Discard
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-[1.5] py-3.5 px-6 bg-[#08384F] text-white rounded-2xl font-semibold flex items-center justify-center gap-2"
            >
              {loading && <Loader2 size={18} className="animate-spin" />}
              {loading ? "Creating..." : "Create Department"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddDepartmentModal;
