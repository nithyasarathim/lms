import React, { useState, useEffect } from "react";
import { X, Building2, Hash, GraduationCap, Loader2 } from "lucide-react";
import { getDepartmentById, editDepartment } from "../api/admin.api";

const EditDepartmentModal = ({ isOpen, onClose, deptId, onSuccess }) => {
  const [formData, setFormData] = useState({ name: "", code: "", program: "" });
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);

  useEffect(() => {
    if (isOpen && deptId) {
      const loadData = async () => {
        setFetching(true);
        try {
          const data = await getDepartmentById(deptId);
          setFormData({
            name: data.name,
            code: data.code,
            program: data.program,
          });
        } catch (err) {
          console.error("Fetch failed:", err);
        } finally {
          setFetching(false);
        }
      };
      loadData();
    }
  }, [isOpen, deptId]);

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
      await editDepartment(deptId, payload);
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      console.error("Update failed:", err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 font-['Poppins']">
      <div
        className="absolute inset-0 bg-[#08384F]/20 backdrop-blur-[2px] animate-in fade-in duration-300"
        onClick={onClose}
      />

      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden relative animate-in zoom-in-95 duration-300">
        <div className="flex items-center justify-between px-8 py-4 border-b border-gray-50">
          <h3 className="text-xl font-bold text-[#282526] tracking-tight">
            Edit Department
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full text-gray-400 transition-colors"
          >
            <X size={22} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 pt-6 space-y-6">
          {fetching ? (
            <div className="flex flex-col items-center py-10 gap-2">
              <Loader2 className="animate-spin text-[#08384F]" size={24} />
              <p className="text-sm text-gray-500">Loading details...</p>
            </div>
          ) : (
            <>
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
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
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
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            code: e.target.value.toUpperCase(),
                          })
                        }
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
                        onChange={(e) =>
                          setFormData({ ...formData, program: e.target.value })
                        }
                        className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#08384F]/5 focus:border-[#08384F] transition-all text-[15px] text-gray-800 appearance-none cursor-pointer"
                      >
                        <option value="">Select...</option>
                        <option value="B.E.">B.E.</option>
                        <option value="B.Tech.">B.Tech.</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-3.5 px-6 border border-gray-200 text-gray-600 rounded-2xl font-semibold hover:bg-gray-50 transition-all"
                >
                  Discard
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-[1.5] py-3.5 px-6 bg-[#08384F] text-white rounded-2xl font-semibold shadow-lg hover:bg-[#0a4763] transition-all flex items-center justify-center gap-2"
                >
                  {loading && <Loader2 className="animate-spin" size={18} />}
                  {loading ? "Updating..." : "Update Department"}
                </button>
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  );
};

export default EditDepartmentModal;
