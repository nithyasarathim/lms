import React, { useState, useEffect } from "react";
import {
  X,
  BookOpen,
  Hash,
  Layers,
  Star,
  Loader2,
  Upload,
  Info,
  Scale,
  Clock,
  Tag,
  ChevronDown,
} from "lucide-react";
import { useSearchParams } from "react-router-dom";
import {
  addSubject,
  bulkUploadSubjects,
  fetchRegulation,
} from "../api/admin.api";

const AddSubjectModal = ({ isOpen, onClose, fetchSubjects }) => {
  const [searchParams] = useSearchParams();
  const deptId = searchParams.get("deptId");

  const [activeTab, setActiveTab] = useState("single");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [regulations, setRegulations] = useState([]);

  const initialState = {
    code: "",
    name: "",
    shortName: "",
    courseCategory: "Professional Core",
    deliveryType: "T",
    credits: "",
    regulationId: "",
    lectureHours: 0,
    practicalHours: 0,
    projectHours: 0,
  };

  const [formData, setFormData] = useState(initialState);

  useEffect(() => {
    if (isOpen) {
      const loadRegulations = async () => {
        try {
          const res = await fetchRegulation();
          setRegulations(res?.data?.regulations || res || []);
        } catch (err) {
          console.error(err);
        }
      };
      loadRegulations();
    }
  }, [isOpen]);

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
      if (activeTab === "single") {
        const payload = {
          ...formData,
          credits: Number(formData.credits),
          lectureHours: Number(formData.lectureHours),
          practicalHours: Number(formData.practicalHours),
          projectHours: Number(formData.projectHours),
          departmentId: deptId,
          isActive: true,
        };
        await addSubject(payload);
      } else {
        if (!file) throw new Error("Please select an Excel file");
        const formDataBulk = new FormData();
        formDataBulk.append("file", file);
        formDataBulk.append("regulationId", formData.regulationId);
        await bulkUploadSubjects(deptId, formDataBulk);
      }
      setFormData(initialState);
      setFile(null);
      fetchSubjects();
      onClose();
    } catch (err) {
      setError(err.message || "Operation failed");
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
            <h3 className="text-lg text-[#08384F] font-bold">Add Subject</h3>
            <p className="text-[11px] text-gray-700">
              Configure new course details
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

        <div className="px-6 py-4">
          <div className="flex p-1 bg-gray-50 rounded-xl mb-4 border border-gray-100">
            <button
              type="button"
              onClick={() => setActiveTab("single")}
              className={`flex-1 py-2 text-sm font-semibold rounded-lg transition ${
                activeTab === "single"
                  ? "bg-white text-[#08384F] shadow-sm"
                  : "text-gray-700"
              }`}
            >
              Single Entry
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("bulk")}
              className={`flex-1 py-2 text-sm font-semibold rounded-lg transition ${
                activeTab === "bulk"
                  ? "bg-white text-[#08384F] shadow-sm"
                  : "text-gray-700"
              }`}
            >
              Bulk Upload
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-2 bg-red-50 text-red-600 text-[11px] rounded-lg border border-red-100 flex items-center gap-2">
                <Info size={14} /> {error}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-700 uppercase tracking-wider">
                  Regulation
                </label>
                <div className="relative">
                  <Scale
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-700"
                    size={14}
                  />
                  <select
                    required
                    name="regulationId"
                    value={formData.regulationId}
                    onChange={handleInputChange}
                    className="w-full pl-9 pr-8 py-2 bg-gray-50 rounded-lg outline-none text-sm appearance-none border border-transparent focus:border-[#08384F]/20"
                  >
                    <option value="">Select Regulation</option>
                    {regulations.map((reg) => (
                      <option key={reg._id} value={reg._id}>
                        {reg.name}
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
            </div>

            {activeTab === "single" ? (
              <>
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

                <div className="grid grid-cols-4 gap-4">
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
                  <div className="space-y-1 col-span-2">
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
                        <option value="TPJ">
                          Theory + Practical + Project
                        </option>
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

                <div className="px-6 py-5 bg-[#08384F]/[0.02] border border-[#08384F]/10 rounded-2xl">
                  <div className="flex items-center justify-between mb-5 px-1">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 bg-[#08384F] rounded-lg shadow-sm shadow-[#08384F]/20">
                        <Clock size={14} className="text-white" />
                      </div>
                      <span className="text-[11px] font-black text-[#08384F] uppercase tracking-[0.12em]">
                        Weekly Hour Allocation
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-5">
                    <div className="relative group">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-tight ml-1 mb-1.5 block group-focus-within:text-[#08384F] transition-colors">
                        Lecture
                      </label>
                      {showLecture ? (
                        <input
                          type="number"
                          name="lectureHours"
                          value={formData.lectureHours}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 bg-white border-2 border-gray-100 rounded-xl text-sm font-bold text-[#08384F] outline-none focus:border-[#08384F]/20 focus:ring-4 focus:ring-[#08384F]/5 transition-all text-center shadow-sm animate-in fade-in zoom-in-95 duration-300"
                        />
                      ) : (
                        <div className="w-full py-3 bg-gray-100/30 border-2 border-dashed border-gray-100 rounded-xl flex items-center justify-center opacity-60">
                          <span className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">
                            N/A
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="relative group">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-tight ml-1 mb-1.5 block group-focus-within:text-[#08384F] transition-colors">
                        Practical
                      </label>
                      {showPractical ? (
                        <input
                          type="number"
                          name="practicalHours"
                          value={formData.practicalHours}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 bg-white border-2 border-gray-100 rounded-xl text-sm font-bold text-[#08384F] outline-none focus:border-[#08384F]/20 focus:ring-4 focus:ring-[#08384F]/5 transition-all text-center shadow-sm animate-in fade-in zoom-in-95 duration-300"
                        />
                      ) : (
                        <div className="w-full py-3 bg-gray-100/30 border-2 border-dashed border-gray-100 rounded-xl flex items-center justify-center opacity-60">
                          <span className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">
                            N/A
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="relative group">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-tight ml-1 mb-1.5 block group-focus-within:text-[#08384F] transition-colors">
                        Project
                      </label>
                      {showProject ? (
                        <input
                          type="number"
                          name="projectHours"
                          value={formData.projectHours}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 bg-white border-2 border-gray-100 rounded-xl text-sm font-bold text-[#08384F] outline-none focus:border-[#08384F]/20 focus:ring-4 focus:ring-[#08384F]/5 transition-all text-center shadow-sm animate-in fade-in zoom-in-95 duration-300"
                        />
                      ) : (
                        <div className="w-full py-3 bg-gray-100/30 border-2 border-dashed border-gray-100 rounded-xl flex items-center justify-center opacity-60">
                          <span className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">
                            N/A
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="border-2 border-dashed border-gray-100 rounded-xl py-8 flex flex-col items-center justify-center bg-gray-50/50 relative group transition-colors hover:border-[#08384F]/20">
                <input
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  onChange={(e) => setFile(e.target.files[0])}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
                <Upload
                  className="text-[#08384F]/40 mb-2 group-hover:scale-110 transition-transform"
                  size={24}
                />
                <p className="text-[11px] font-semibold text-[#08384F]">
                  {file ? file.name : "Click or drag Excel template here"}
                </p>
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                disabled={loading}
                onClick={onClose}
                className="flex-1 py-2.5 text-gray-700 text-sm font-bold rounded-lg hover:bg-gray-50 transition-colors"
              >
                Discard
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-[2] py-2.5 bg-[#08384F] text-white rounded-lg flex items-center justify-center gap-2 text-sm font-bold shadow-lg shadow-[#08384F]/10 hover:shadow-xl active:scale-[0.98] transition-all"
              >
                {loading ? (
                  <Loader2 className="animate-spin" size={16} />
                ) : activeTab === "single" ? (
                  <>
                    Save Subject
                  </>
                ) : (
                  "Start Bulk Upload"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddSubjectModal;
