import React, { useState, useEffect } from "react";
import { X, Loader2, BookOpen, Hash, Layers } from "lucide-react";
import { updateSubject } from "../api/admin.api";
import toast from "react-hot-toast";

const EditSubjectModal = ({ isOpen, onClose, subject, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    credits: "",
    courseType: "T",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (subject) {
      setFormData({
        name: subject.name || "",
        code: subject.code || "",
        credits: subject.credits || "",
        courseType: subject.courseType || "T",
      });
    }
  }, [subject]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateSubject(subject._id, {
        ...formData,
        credits: Number(formData.credits),
        departmentId: subject.departmentId?._id || subject.departmentId,
      });
      toast.success("Subject updated successfully");
      onSuccess();
      onClose();
    } catch (error) {
      toast.error(error.message || "Failed to update subject");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 font-['Poppins']">
      <div
        className="absolute inset-0 bg-[#08384F]/20 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="flex items-center justify-between px-8 py-5 border-b border-gray-50">
          <h3 className="text-xl font-bold text-[#282526]">Edit Subject</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full text-gray-400"
          >
            <X size={22} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-8 space-y-5">
          <div>
            <label className="text-[12px] font-bold text-gray-400 uppercase tracking-widest ml-1 mb-1.5 block">
              Subject Name
            </label>
            <div className="relative">
              <BookOpen
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                size={18}
              />
              <input
                required
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white focus:border-[#08384F] outline-none transition-all text-sm font-medium"
              />
            </div>
          </div>
          <div>
            <label className="text-[12px] font-bold text-gray-400 uppercase tracking-widest ml-1 mb-1.5 block">
              Subject Code
            </label>
            <div className="relative">
              <Hash
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                size={18}
              />
              <input
                required
                value={formData.code}
                onChange={(e) =>
                  setFormData({ ...formData, code: e.target.value })
                }
                className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white focus:border-[#08384F] outline-none transition-all text-sm font-medium"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[12px] font-bold text-gray-400 uppercase tracking-widest ml-1 mb-1.5 block">
                Type
              </label>
              <select
                value={formData.courseType}
                onChange={(e) =>
                  setFormData({ ...formData, courseType: e.target.value })
                }
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white focus:border-[#08384F] outline-none transition-all text-sm font-bold text-[#08384F]"
              >
                <option value="T">Theory</option>
                <option value="P">Practical</option>
                <option value="TP">Th + Pr</option>
                <option value="TPJ">Th + Pr + Proj</option>
                <option value="PJ">Project</option>
                <option value="I">Internship</option>
              </select>
            </div>
            <div>
              <label className="text-[12px] font-bold text-gray-400 uppercase tracking-widest ml-1 mb-1.5 block">
                Credits
              </label>
              <input
                type="number"
                required
                value={formData.credits}
                onChange={(e) =>
                  setFormData({ ...formData, credits: e.target.value })
                }
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white focus:border-[#08384F] outline-none transition-all text-sm font-bold text-center"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-[#08384F] text-white rounded-2xl font-bold shadow-lg flex items-center justify-center gap-2 active:scale-95 transition-all disabled:opacity-50 mt-4"
          >
            {loading ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              "Update Subject"
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditSubjectModal;
