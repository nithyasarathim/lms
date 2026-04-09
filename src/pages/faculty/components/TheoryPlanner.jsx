import React, { useState, useEffect, useMemo } from "react";
import {
  Plus,
  X,
  Edit2,
  Trash2,
  BookOpen,
  Check,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const UNITS = [
  { label: "Unit 1", key: "0" },
  { label: "Unit 2", key: "1" },
  { label: "Unit 3", key: "2" },
  { label: "Unit 4", key: "3" },
  { label: "Unit 5", key: "4" },
];

const TheoryPlanner = ({
  data,
  refreshData,
  onNext,
  onPrev,
  classroom,
  saveCoursePlan,
}) => {
  const [selectedUnitIdx, setSelectedUnitIdx] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editTopicIndex, setEditTopicIndex] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteIndex, setDeleteIndex] = useState(null);
  const [unitTitle, setUnitTitle] = useState("");
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [loading, setLoading] = useState(false);

  // Local state to manage theory data before final submission
  const [localTheory, setLocalTheory] = useState([]);

  const [formData, setFormData] = useState({
    topicName: "",
    learningPedagogy: "",
    plannedDate: "",
    duration: "",
    reference: "",
  });

  // Sync initial data from props
  useEffect(() => {
    if (data?.coursePlan?.planners?.theory) {
      setLocalTheory(data.coursePlan.planners.theory);
    }
  }, [data]);

  const references = useMemo(() => data?.coursePlan?.references || {}, [data]);

  const referenceOptions = useMemo(() => {
    const options = [];
    if (references?.textBooks) {
      references.textBooks.forEach((book, idx) => {
        if (book?.trim())
          options.push({ label: `T${idx + 1}: ${book}`, value: `T${idx + 1}` });
      });
    }
    if (references?.referenceBooks) {
      references.referenceBooks.forEach((book, idx) => {
        if (book?.trim())
          options.push({ label: `R${idx + 1}: ${book}`, value: `R${idx + 1}` });
      });
    }
    return options;
  }, [references]);

  useEffect(() => {
    setUnitTitle(localTheory[selectedUnitIdx]?.title || "");
    setIsEditingTitle(false);
  }, [selectedUnitIdx, localTheory]);

  const currentTopics = useMemo(() => {
    return Array.isArray(localTheory[selectedUnitIdx]?.topics)
      ? localTheory[selectedUnitIdx].topics
      : [];
  }, [localTheory, selectedUnitIdx]);

  // Frontend local update for Title
  const handleTitleSubmit = () => {
    const updatedTheory = [...localTheory];
    if (!updatedTheory[selectedUnitIdx]) {
      updatedTheory[selectedUnitIdx] = {
        unitNumber: selectedUnitIdx + 1,
        title: "",
        topics: [],
      };
    }
    updatedTheory[selectedUnitIdx].title = unitTitle;
    setLocalTheory(updatedTheory);
    setIsEditingTitle(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Frontend local update for Topics
  const handleSubmit = () => {
    if (!formData.topicName || !formData.plannedDate || !formData.duration) {
      alert("Please fill required fields.");
      return;
    }
    const updatedTheory = [...localTheory];
    if (!updatedTheory[selectedUnitIdx]) {
      updatedTheory[selectedUnitIdx] = {
        unitNumber: selectedUnitIdx + 1,
        title: "",
        topics: [],
      };
    }

    const unitTopics = [...(updatedTheory[selectedUnitIdx].topics || [])];
    const submissionData = { ...formData, duration: Number(formData.duration) };

    if (isEditing && editTopicIndex !== null) {
      unitTopics[editTopicIndex] = submissionData;
    } else {
      unitTopics.push(submissionData);
    }

    updatedTheory[selectedUnitIdx].topics = unitTopics;
    setLocalTheory(updatedTheory);
    setIsModalOpen(false);
  };

  // Frontend local update for Delete
  const confirmDelete = () => {
    const updatedTheory = [...localTheory];
    if (updatedTheory[selectedUnitIdx]?.topics) {
      updatedTheory[selectedUnitIdx].topics = updatedTheory[
        selectedUnitIdx
      ].topics.filter((_, i) => i !== deleteIndex);
      setLocalTheory(updatedTheory);
      setIsDeleteModalOpen(false);
    }
  };

  // Backend hit occurs only on "Next Step"
  const handleFinalSubmit = async () => {
    setLoading(true);
    try {
      const payload = {
        subjectId: classroom?.subjectId?._id,
        sectionId: classroom?.sectionId?._id,
        academicYearId: classroom?.academicYearId?._id,
        planners: { ...data?.coursePlan?.planners, theory: localTheory },
        status: data?.coursePlan?.status || "Draft",
      };
      const res = await saveCoursePlan(payload);
      if (res.success) {
        await refreshData();
        if (onNext) onNext();
      }
    } catch (error) {
      console.error("Final Save Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = () => {
    setIsEditing(false);
    setEditTopicIndex(null);
    setFormData({
      topicName: "",
      learningPedagogy: "",
      plannedDate: "",
      duration: "",
      reference: "",
    });
    setIsModalOpen(true);
  };

  const openEditModal = (item, index) => {
    setIsEditing(true);
    setEditTopicIndex(index);
    setFormData({
      topicName: item.topicName || "",
      learningPedagogy: item.learningPedagogy || "",
      plannedDate: item.plannedDate ? item.plannedDate.split("T")[0] : "",
      duration: item.duration || "",
      reference: item.reference || "",
    });
    setIsModalOpen(true);
  };

  return (
    <div className="flex flex-col h-full space-y-4 bg-white overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b pb-4 shrink-0">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
          {UNITS.map((unit) => (
            <button
              key={unit.key}
              onClick={() => setSelectedUnitIdx(Number(unit.key))}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-all whitespace-nowrap text-sm font-bold ${
                selectedUnitIdx === Number(unit.key)
                  ? "bg-[#08384f] text-white shadow-md border-[#08384f]"
                  : "bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100"
              }`}
            >
              <BookOpen size={14} />
              {unit.label}
            </button>
          ))}
        </div>
        <button
          onClick={openAddModal}
          className="bg-[#08384F] text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-[#062c3e] transition-all shadow-sm text-sm font-bold"
        >
          <Plus size={18} /> Add Topic
        </button>
      </div>

      <div className="flex justify-center shrink-0">
        <div className="w-full max-w-2xl text-center">
          {isEditingTitle ? (
            <div className="flex items-center gap-2 bg-blue-50 p-2 rounded-lg border border-blue-200">
              <input
                autoFocus
                type="text"
                value={unitTitle}
                onChange={(e) => setUnitTitle(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleTitleSubmit()}
                className="flex-1 outline-none text-sm font-medium bg-transparent px-2"
              />
              <button
                onClick={handleTitleSubmit}
                className="p-1 text-green-600 hover:bg-green-100 rounded-md"
              >
                <Check size={18} />
              </button>
              <button
                onClick={() => setIsEditingTitle(false)}
                className="p-1 text-gray-400 hover:bg-gray-100 rounded-md"
              >
                <X size={18} />
              </button>
            </div>
          ) : (
            <div
              onClick={() => setIsEditingTitle(true)}
              className="group cursor-pointer inline-flex items-center gap-3 hover:bg-gray-50 p-2 rounded-md transition-all"
            >
              <h3
                className={`text-sm font-semibold ${unitTitle ? "text-gray-700" : "text-gray-300 italic"}`}
              >
                {unitTitle || "Click to add unit objective..."}
              </h3>
              <Edit2
                size={12}
                className="text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity"
              />
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 border border-gray-200 rounded-xl bg-white shadow-sm overflow-hidden flex flex-col">
        <div className="overflow-auto flex-1">
          <table className="w-full table-fixed divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50 sticky top-0 z-10">
              <tr>
                <th className="w-12 px-4 py-4 text-center font-semibold text-gray-600">
                  #
                </th>
                <th className="px-6 py-4 text-left font-semibold text-gray-600">
                  Topic Name
                </th>
                <th className="w-32 px-4 py-4 text-left font-semibold text-gray-600">
                  Pedagogy
                </th>
                <th className="w-32 px-4 py-4 text-left font-semibold text-gray-600">
                  Planned Date
                </th>
                <th className="w-24 px-4 py-4 text-left font-semibold text-gray-600">
                  Dur.
                </th>
                <th className="w-28 px-4 py-4 text-center font-semibold text-gray-600">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {currentTopics.length > 0 ? (
                currentTopics.map((item, idx) => (
                  <tr
                    key={idx}
                    className="hover:bg-gray-50/50 transition-colors"
                  >
                    <td className="px-4 py-4 text-center font-medium">
                      {idx + 1}
                    </td>
                    <td className="px-6 py-4 font-medium break-words leading-relaxed">
                      {item.topicName}
                    </td>
                    <td className="px-4 py-4">{item.learningPedagogy}</td>
                    <td className="px-4 py-4">
                      {item.plannedDate
                        ? new Date(item.plannedDate).toLocaleDateString()
                        : "-"}
                    </td>
                    <td className="px-4 py-4">{item.duration} hr</td>
                    <td className="px-4 py-4">
                      <div className="flex justify-center gap-1">
                        <button
                          onClick={() => openEditModal(item, idx)}
                          className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => {
                            setDeleteIndex(idx);
                            setIsDeleteModalOpen(true);
                          }}
                          className="p-2 text-red-500 hover:bg-red-100 rounded-lg transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={6}
                    className="py-16 text-center text-gray-400 italic"
                  >
                    No topics added yet for this unit.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-100 bg-white shrink-0">
        <button
          onClick={onPrev}
          className="flex items-center gap-2 text-gray-500 font-bold text-sm px-6 py-2 rounded-xl hover:bg-gray-100 transition-all border border-gray-200"
        >
          <ChevronLeft size={18} /> Previous
        </button>
        <button
          onClick={handleFinalSubmit}
          disabled={loading}
          className="flex items-center gap-2 bg-[#08384F] text-white font-bold text-sm px-8 py-2.5 rounded-xl shadow-lg hover:bg-[#0c4a68] active:scale-95 disabled:opacity-50 transition-all"
        >
          {loading ? "Saving..." : "Next Step"} <ChevronRight size={18} />
        </button>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg">
            <div className="flex justify-between items-center p-5 border-b">
              <h2 className="text-lg font-bold text-gray-800">
                {isEditing ? "Update" : "New"} Topic
              </h2>
              <X
                className="cursor-pointer text-gray-400 hover:text-red-500"
                size={20}
                onClick={() => setIsModalOpen(false)}
              />
            </div>
            <div className="p-6 grid grid-cols-2 gap-4 max-h-[70vh] overflow-y-auto">
              <div className="col-span-2">
                <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">
                  Topic Name
                </label>
                <input
                  name="topicName"
                  value={formData.topicName}
                  onChange={handleInputChange}
                  className="w-full border border-gray-200 rounded-lg px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-[#08384F]/20 focus:border-[#08384F]"
                />
              </div>
              <div className="col-span-2">
                <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">
                  Learning Pedagogy
                </label>
                <input
                  name="learningPedagogy"
                  value={formData.learningPedagogy}
                  onChange={handleInputChange}
                  className="w-full border border-gray-200 rounded-lg px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-[#08384F]/20 focus:border-[#08384F]"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">
                  Planned Date
                </label>
                <input
                  type="date"
                  name="plannedDate"
                  value={formData.plannedDate}
                  onChange={handleInputChange}
                  className="w-full border border-gray-200 rounded-lg px-4 py-2 text-sm outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">
                  Duration (Hrs)
                </label>
                <input
                  type="number"
                  name="duration"
                  value={formData.duration}
                  onChange={handleInputChange}
                  className="w-full border border-gray-200 rounded-lg px-4 py-2 text-sm outline-none"
                />
              </div>
              <div className="col-span-2">
                <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">
                  Reference
                </label>
                <select
                  name="reference"
                  value={formData.reference}
                  onChange={handleInputChange}
                  className="w-full border border-gray-200 rounded-lg px-4 py-2 text-sm outline-none"
                >
                  <option value="">Select Reference</option>
                  {referenceOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="p-5 bg-gray-50 flex justify-end gap-3 rounded-b-xl border-t">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 font-bold text-gray-500 text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                className="bg-[#08384F] text-white px-6 py-2 rounded-lg font-bold shadow-lg text-sm"
              >
                Save Locally
              </button>
            </div>
          </div>
        </div>
      )}

      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-[2px] z-[210] flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-[380px] overflow-hidden border border-slate-200">
            <div className="flex items-start gap-4 p-6">
              <div className="flex-shrink-0 w-10 h-10 bg-red-50 text-red-600 rounded-md flex items-center justify-center">
                <AlertTriangle size={20} strokeWidth={2.5} />
              </div>
              <div className="flex-1">
                <h2 className="text-slate-900 text-lg font-semibold leading-tight mb-1">
                  Delete Topic
                </h2>
                <p className="text-slate-500 text-sm leading-relaxed">
                  Remove this topic from local session?
                </p>
              </div>
            </div>
            <div className="bg-slate-50 px-6 py-4 flex justify-end gap-3 border-t border-slate-100">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-4 py-2 text-sm font-semibold text-slate-600 rounded"
              >
                Keep it
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 text-sm font-bold text-white bg-red-600 rounded shadow-sm transition-all active:scale-[0.98]"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TheoryPlanner;
