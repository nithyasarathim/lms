import React, { useState } from "react";
import {
  X,
  BookOpen,
  Hash,
  Layers,
  Star,
  Loader2,
  Plus,
  Upload,
  FileSpreadsheet,
  Info,
} from "lucide-react";
import { useSearchParams } from "react-router-dom";
import { addSubject, bulkUploadSubjects } from "../api/admin.api";

const AddSubjectModal = ({ isOpen, onClose, fetchSubjects }) => {
  const [searchParams] = useSearchParams();
  const deptId = searchParams.get("deptId");
  const [activeTab, setActiveTab] = useState("single");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    code: "",
    name: "",
    courseType: "T",
    credits: "",
  });

  if (!isOpen) return null;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "code" ? value.toUpperCase() : value,
    }));
    if (error) setError("");
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (activeTab === "single") {
        const payload = {
          name: formData.name,
          code: formData.code,
          credits: Number(formData.credits),
          courseType: formData.courseType,
          departmentId: deptId,
          isActive: true,
        };
        await addSubject(payload);
      } else {
        if (!file) throw new Error("Please select an Excel file");

        const formDataBulk = new FormData();
        // This maps to req.file on the backend
        formDataBulk.append("file", file);

        // Pass deptId for the URL param and formData for the file body
        await bulkUploadSubjects(deptId, formDataBulk);
      }

      setFormData({ code: "", name: "", courseType: "T", credits: "" });
      setFile(null);
      fetchSubjects();
      onClose();
    } catch (err) {
      setError(err.message || "Operation failed");
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

      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col">
        <div className="flex items-center justify-between px-8 py-5 border-b border-gray-50">
          <h3 className="text-xl font-bold text-[#282526] tracking-tight">
            Add Subject
          </h3>
          <button
            onClick={onClose}
            disabled={loading}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors disabled:opacity-50"
          >
            <X size={22} className="text-gray-400" />
          </button>
        </div>

        <div className="px-8 pt-6">
          <div className="flex p-1 bg-gray-50 border border-gray-100 rounded-2xl">
            <button
              type="button"
              onClick={() => setActiveTab("single")}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-bold rounded-xl transition-all ${
                activeTab === "single"
                  ? "bg-white text-[#08384F] shadow-sm"
                  : "text-gray-400"
              }`}
            >
              <Plus size={14} /> Single Entry
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("bulk")}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-bold rounded-xl transition-all ${
                activeTab === "bulk"
                  ? "bg-white text-[#08384F] shadow-sm"
                  : "text-gray-400"
              }`}
            >
              <FileSpreadsheet size={14} /> Bulk Upload
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {error && (
            <div className="p-3 bg-red-50 text-red-600 text-xs font-medium rounded-xl border border-red-100 animate-shake">
              {error}
            </div>
          )}

          {activeTab === "single" ? (
            <div className="space-y-5">
              <div className="relative">
                <label className="text-[13px] font-semibold text-gray-500 uppercase tracking-wider ml-1 mb-1.5 block">
                  Subject Name
                </label>
                <div className="relative">
                  <BookOpen
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                    size={18}
                  />
                  <input
                    required
                    name="name"
                    disabled={loading}
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="e.g. Data Structures"
                    className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:bg-white focus:border-[#08384F] outline-none focus:ring-4 focus:ring-[#08384F]/5 transition-all text-[15px]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="relative">
                  <label className="text-[13px] font-semibold text-gray-500 uppercase tracking-wider ml-1 mb-1.5 block">
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
                      disabled={loading}
                      value={formData.code}
                      onChange={handleInputChange}
                      placeholder="CS8401"
                      className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:bg-white focus:border-[#08384F] outline-none transition-all text-[15px]"
                    />
                  </div>
                </div>
                <div className="relative">
                  <label className="text-[13px] font-semibold text-gray-500 uppercase tracking-wider ml-1 mb-1.5 block">
                    Credits
                  </label>
                  <div className="relative">
                    <Star
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                      size={18}
                    />
                    <input
                      required
                      name="credits"
                      type="number"
                      disabled={loading}
                      value={formData.credits}
                      onChange={handleInputChange}
                      placeholder="3"
                      className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:bg-white focus:border-[#08384F] outline-none transition-all text-[15px]"
                    />
                  </div>
                </div>
              </div>

              <div className="relative">
                <label className="text-[13px] font-semibold text-gray-500 uppercase tracking-wider ml-1 mb-1.5 block">
                  Course Type
                </label>
                <div className="relative">
                  <Layers
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                    size={18}
                  />
                  <select
                    name="courseType"
                    disabled={loading}
                    value={formData.courseType}
                    onChange={handleInputChange}
                    className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl appearance-none outline-none focus:bg-white focus:border-[#08384F] transition-all text-[15px] cursor-pointer"
                  >
                    <option value="T">Theory (T)</option>
                    <option value="P">Practical (P)</option>
                    <option value="TP">Theory + Practical (TP)</option>
                    <option value="TPJ">
                      Theory + Practical + Project (TPJ)
                    </option>
                    <option value="PJ">Project (PJ)</option>
                    <option value="I">Internship (I)</option>
                  </select>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="border-2 border-dashed border-gray-200 rounded-3xl p-10 flex flex-col items-center justify-center bg-gray-50 hover:bg-gray-100 hover:border-[#08384F]/30 transition-all cursor-pointer relative">
                <input
                  type="file"
                  accept=".xlsx, .xls, .csv"
                  onChange={handleFileChange}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
                <div className="p-4 bg-white rounded-2xl shadow-sm mb-4">
                  <Upload className="text-[#08384F]" size={28} />
                </div>
                <p className="text-[15px] font-bold text-gray-700 text-center">
                  {file ? file.name : "Click to upload Excel"}
                </p>
                <p className="text-xs text-gray-400 mt-1">.xlsx or .csv only</p>
              </div>
              <div className="bg-[#08384F]/5 p-4 rounded-2xl border border-[#08384F]/10 flex gap-3">
                <Info className="text-[#08384F] shrink-0" size={18} />
                <div className="text-[11px] text-[#08384F] leading-relaxed">
                  <p className="font-bold mb-1 uppercase">Required Headers:</p>
                  <p>name, code, credits, courseType</p>
                </div>
              </div>
            </div>
          )}

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
              className="flex-[1.5] py-3.5 px-6 bg-[#08384F] text-white rounded-2xl font-bold shadow-lg shadow-[#08384F]/20 hover:bg-[#0a4763] hover:shadow-xl active:scale-[0.98] transition-all disabled:opacity-70 flex items-center justify-center gap-2"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={18} />
              ) : activeTab === "single" ? (
                "Save Subject"
              ) : (
                "Upload Subjects"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddSubjectModal;
