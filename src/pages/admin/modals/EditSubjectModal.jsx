import React, { useState, useEffect } from "react";
import {
  X,
  BookOpen,
  Hash,
  Layers,
  Star,
  Loader2,
  Info,
  Clock,
  Tag,
  ChevronDown,
} from "lucide-react";
import { updateSubject } from "../api/admin.api";
import toast from "react-hot-toast";

const EditSubjectModal = ({ isOpen, onClose, subject, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    code: "",
    name: "",
    shortName: "",
    courseCategory: "Professional Core",
    deliveryType: "T",
    credits: "",
    lectureHours: 0,
    practicalHours: 0,
    projectHours: 0,
  });

  useEffect(() => {
    if (subject && isOpen) {
      setFormData({
        code: subject.code || "",
        name: subject.name || "",
        shortName: subject.shortName || "",
        courseCategory: subject.courseCategory || "Professional Core",
        deliveryType: subject.deliveryType || "T",
        credits: subject.credits || "",
        lectureHours: subject.lectureHours || 0,
        practicalHours: subject.practicalHours || 0,
        projectHours: subject.projectHours || 0,
      });
    }
  }, [subject, isOpen]);

  if (!isOpen) return null;

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => {
      const data = {
        ...prev,
        [name]:
          name === "code" || name === "shortName" ? value.toUpperCase() : value,
      };

      if (name === "deliveryType") {
        data.lectureHours = value.includes("T") ? prev.lectureHours : 0;
        data.practicalHours = value.includes("P") ? prev.practicalHours : 0;
        data.projectHours =
          value.includes("J") || value === "I" ? prev.projectHours : 0;
      }

      return data;
    });

    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const payload = {
        ...formData,
        credits: Number(formData.credits),
        lectureHours: Number(formData.lectureHours),
        practicalHours: Number(formData.practicalHours),
        projectHours: Number(formData.projectHours),
        departmentId: subject.departmentId?._id || subject.departmentId,
      };

      await updateSubject(subject._id, payload);
      toast.success("Subject updated successfully");
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.message || "Update failed");
      toast.error(err.message || "Failed to update subject");
    } finally {
      setLoading(false);
    }
  };

  const showLecture = formData.deliveryType.includes("T");
  const showPractical = formData.deliveryType.includes("P");
  const showProject =
    formData.deliveryType.includes("J") || formData.deliveryType === "I";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 font-['Poppins']">
      <div
        className="absolute inset-0 bg-[#08384F]/40 backdrop-blur-sm transition-opacity"
        onClick={!loading ? onClose : null}
      />

      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col border border-gray-100 animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <div>
            <h3 className="text-lg text-[#08384F] font-bold">Edit Subject</h3>
            <p className="text-[11px] text-gray-700">
              Modify course configurations
            </p>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-700 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="px-6 py-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-2 bg-red-50 text-red-600 text-[11px] rounded-lg border border-red-100 flex items-center gap-2">
                <Info size={14} /> {error}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-700 uppercase tracking-wider">
                  Category
                </label>
                <div className="relative">
                  <Tag
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-700"
                    size={14}
                  />
                  <select
                    name="courseCategory"
                    value={formData.courseCategory}
                    onChange={handleInputChange}
                    className="w-full pl-9 pr-8 py-2 bg-gray-50 rounded-lg outline-none text-sm appearance-none border border-transparent focus:border-[#08384F]/20"
                  >
                    {[
                      "Foundation",
                      "Basic Science",
                      "Engineering Science",
                      "Professional Core",
                      "Professional Elective",
                      "Open Elective",
                      "Mandatory",
                      "Skill Enhancement",
                      "Value Added",
                      "Project",
                      "Internship",
                    ].map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-700 pointer-events-none"
                    size={14}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-700 uppercase tracking-wider">
                  Delivery
                </label>
                <div className="relative">
                  <Layers
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-700"
                    size={14}
                  />
                  <select
                    name="deliveryType"
                    value={formData.deliveryType}
                    onChange={handleInputChange}
                    className="w-full pl-9 pr-8 py-2 bg-gray-50 rounded-lg outline-none text-sm appearance-none font-semibold"
                  >
                    <option value="T">Theory</option>
                    <option value="P">Practical</option>
                    <option value="TP">Theory + Practical</option>
                    <option value="TPJ">Theory + Practical + Project</option>
                    <option value="PJ">Project</option>
                    <option value="I">Internship</option>
                  </select>
                  <ChevronDown
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-700 pointer-events-none"
                    size={14}
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-700 uppercase tracking-wider">
                  Short Name
                </label>
                <input
                  required
                  name="shortName"
                  placeholder="e.g., DSA"
                  value={formData.shortName}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-gray-50 rounded-lg outline-none text-sm border border-transparent focus:border-[#08384F]/20 font-bold"
                />
              </div>
              <div className="col-span-3 space-y-1">
                <label className="text-[10px] font-bold text-gray-700 uppercase tracking-wider">
                  Subject Name
                </label>
                <div className="relative">
                  <BookOpen
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-700"
                    size={14}
                  />
                  <input
                    required
                    name="name"
                    placeholder="Full Course Title"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full pl-9 py-2 bg-gray-50 rounded-lg outline-none text-sm border border-transparent focus:border-[#08384F]/20"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-700 uppercase tracking-wider">
                  Code
                </label>
                <div className="relative">
                  <Hash
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-700"
                    size={14}
                  />
                  <input
                    required
                    name="code"
                    placeholder="CS123"
                    value={formData.code}
                    onChange={handleInputChange}
                    className="w-full pl-9 py-2 bg-gray-50 rounded-lg outline-none text-sm font-mono"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-700 uppercase tracking-wider">
                  Credits
                </label>
                <div className="relative">
                  <Star
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-700"
                    size={14}
                  />
                  <input
                    required
                    name="credits"
                    type="number"
                    placeholder="0"
                    value={formData.credits}
                    onChange={handleInputChange}
                    className="w-full pl-9 py-2 bg-gray-50 rounded-lg outline-none text-sm font-bold"
                  />
                </div>
              </div>
            </div>

            <div className="px-6 py-5 bg-[#08384F]/[0.02] border border-[#08384F]/10 rounded-2xl">
              <div className="flex items-center gap-2 mb-5">
                <div className="p-1.5 bg-[#08384F] rounded-lg">
                  <Clock size={14} className="text-white" />
                </div>
                <span className="text-[11px] font-black text-[#08384F] uppercase tracking-[0.12em]">
                  Weekly Hour Allocation
                </span>
              </div>

              <div className="grid grid-cols-3 gap-5">
                <div className="relative">
                  <label className="text-[10px] font-bold text-gray-400 uppercase mb-1.5 block">
                    Lecture
                  </label>
                  {showLecture ? (
                    <input
                      type="number"
                      name="lectureHours"
                      value={formData.lectureHours}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-white border-2 border-gray-100 rounded-xl text-sm font-bold text-[#08384F] outline-none focus:border-[#08384F]/20 text-center shadow-sm"
                    />
                  ) : (
                    <div className="w-full py-3 bg-gray-100/30 border-2 border-dashed border-gray-100 rounded-xl flex items-center justify-center opacity-60">
                      <span className="text-[10px] font-bold text-gray-300">
                        N/A
                      </span>
                    </div>
                  )}
                </div>

                <div className="relative">
                  <label className="text-[10px] font-bold text-gray-400 uppercase mb-1.5 block">
                    Practical
                  </label>
                  {showPractical ? (
                    <input
                      type="number"
                      name="practicalHours"
                      value={formData.practicalHours}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-white border-2 border-gray-100 rounded-xl text-sm font-bold text-[#08384F] outline-none focus:border-[#08384F]/20 text-center shadow-sm"
                    />
                  ) : (
                    <div className="w-full py-3 bg-gray-100/30 border-2 border-dashed border-gray-100 rounded-xl flex items-center justify-center opacity-60">
                      <span className="text-[10px] font-bold text-gray-300">
                        N/A
                      </span>
                    </div>
                  )}
                </div>

                <div className="relative">
                  <label className="text-[10px] font-bold text-gray-400 uppercase mb-1.5 block">
                    Project
                  </label>
                  {showProject ? (
                    <input
                      type="number"
                      name="projectHours"
                      value={formData.projectHours}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-white border-2 border-gray-100 rounded-xl text-sm font-bold text-[#08384F] outline-none focus:border-[#08384F]/20 text-center shadow-sm"
                    />
                  ) : (
                    <div className="w-full py-3 bg-gray-100/30 border-2 border-dashed border-gray-100 rounded-xl flex items-center justify-center opacity-60">
                      <span className="text-[10px] font-bold text-gray-300">
                        N/A
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                disabled={loading}
                onClick={onClose}
                className="flex-1 py-2.5 text-gray-700 text-sm font-bold rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-[2] py-2.5 bg-[#08384F] text-white rounded-lg flex items-center justify-center gap-2 text-sm font-bold shadow-lg shadow-[#08384F]/10 hover:shadow-xl active:scale-[0.98] transition-all"
              >
                {loading ? (
                  <Loader2 className="animate-spin" size={16} />
                ) : (
                  "Update Changes"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditSubjectModal;
