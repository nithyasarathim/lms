import React, { useState } from "react";
import { X, GraduationCap, Building2, Hash } from "lucide-react";

const AddDepartmentModal = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({ name: "", code: "", program: "" });

  if (!isOpen) return null;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("New Department Data:", formData);
    setFormData({ name: "", code: "", program: "" });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 font-['Poppins']">
      <div
        className="absolute inset-0 bg-[#08384F]/20 backdrop-blur-[2px] animate-in fade-in duration-300"
        onClick={onClose}
      />

      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden relative animate-in zoom-in-95 slide-in-from-bottom-10 duration-300">
        <div className="flex items-center justify-between px-8 py-4 border-b border-gray-50">
          <h3 className="text-xl font-bold text-[#282526] tracking-tight">
            Add Department
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full text-gray-400 transition-colors"
          >
            <X size={22} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 pt-6 space-y-6">
          <div className="space-y-5">
            <div className="relative">
              <label className="text-[13px] font-semibold text-gray-500 uppercase tracking-wider ml-1 mb-1.5 block">
                Department Name
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
                  placeholder="e.g. Computer Science and Engineering"
                  className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#08384F]/5 focus:border-[#08384F] transition-all text-[15px] text-gray-800"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="relative">
                <label className="text-[13px] font-semibold text-gray-500 uppercase tracking-wider ml-1 mb-1.5 block">
                  Dept Code
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
                    placeholder="CSE"
                    className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#08384F]/5 focus:border-[#08384F] transition-all text-[15px] text-gray-800"
                  />
                </div>
              </div>

              <div className="relative">
                <label className="text-[13px] font-semibold text-gray-500 uppercase tracking-wider ml-1 mb-1.5 block">
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
                    className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#08384F]/5 focus:border-[#08384F] transition-all text-[15px] text-gray-800 appearance-none cursor-pointer"
                  >
                    <option value="">Select...</option>
                    <option value="B.E.">B.E.</option>
                    <option value="B.Tech.">B.Tech.</option>
                    <option value="M.E.">M.E.</option>
                    <option value="Ph.D.">Ph.D.</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3.5 px-6 border border-gray-200 text-gray-600 rounded-2xl font-semibold hover:bg-gray-50 active:scale-[0.98] transition-all"
            >
              Discard
            </button>
            <button
              type="submit"
              className="flex-[1.5] py-3.5 px-6 bg-[#08384F] text-white rounded-2xl font-semibold shadow-lg shadow-[#08384F]/20 hover:bg-[#0a4763] hover:shadow-xl active:scale-[0.98] transition-all"
            >
              Create Department
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddDepartmentModal;
