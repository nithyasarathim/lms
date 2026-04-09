import React, { useState, useEffect, useMemo } from "react";
import {
  Plus,
  X,
  Edit2,
  Trash2,
  FlaskConical,
  Check,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const UNITS = [
  { label: "CO 1", key: "CO1" },
  { label: "CO 2", key: "CO2" },
  { label: "CO 3", key: "CO3" },
  { label: "CO 4", key: "CO4" },
  { label: "CO 5", key: "CO5" },
  { label: "Others", key: "OTHERS" },
];

const LabPlanner = ({
  data,
  refreshData,
  onNext,
  onPrev,
  classroom,
  saveCoursePlan,
}) => {
  const [selectedUnit, setSelectedUnit] = useState("CO1");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editTopicIndex, setEditTopicIndex] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteIndex, setDeleteIndex] = useState(null);
  const [unitTitle, setUnitTitle] = useState("");
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [loading, setLoading] = useState(false);

  const [localLabData, setLocalLabData] = useState({});

  const [formData, setFormData] = useState({
    experimentNumber: "",
    title: "",
    plannedDate: "",
    duration: "",
  });

  useEffect(() => {
    if (data?.coursePlan?.planners?.lab) {
      setLocalLabData(data.coursePlan.planners.lab);
    }
  }, [data]);

  useEffect(() => {
    setUnitTitle(localLabData[selectedUnit]?.title || "");
    setIsEditingTitle(false);
  }, [selectedUnit, localLabData]);

  const currentExperiments = useMemo(() => {
    const exps = Array.isArray(localLabData[selectedUnit]?.experiments)
      ? [...localLabData[selectedUnit].experiments]
      : [];
    return exps.sort(
      (a, b) => Number(a.experimentNumber) - Number(b.experimentNumber),
    );
  }, [localLabData, selectedUnit]);

  const handleTitleSubmit = () => {
    const updatedLab = { ...localLabData };
    if (!updatedLab[selectedUnit])
      updatedLab[selectedUnit] = { title: "", experiments: [] };
    updatedLab[selectedUnit].title = unitTitle;
    setLocalLabData(updatedLab);
    setIsEditingTitle(false);
  };

  const handleSubmit = () => {
    const { experimentNumber, title, plannedDate, duration } = formData;
    if (!experimentNumber || !title || !plannedDate || !duration) {
      alert("Please fill all required fields.");
      return;
    }

    const updatedLab = { ...localLabData };
    if (!updatedLab[selectedUnit])
      updatedLab[selectedUnit] = { title: "", experiments: [] };

    let unitExperiments = [...(updatedLab[selectedUnit].experiments || [])];

    const submissionData = {
      experimentNumber: Number(experimentNumber),
      title,
      plannedDate,
      duration: Number(duration),
    };

    // Validation for duplicate experiment numbers (excluding the one being edited)
    const isDuplicate = unitExperiments.some(
      (exp, idx) =>
        exp.experimentNumber === submissionData.experimentNumber &&
        (!isEditing || idx !== editTopicIndex),
    );

    if (isDuplicate) {
      alert(`Experiment Number ${experimentNumber} already exists in this CO.`);
      return;
    }

    if (isEditing && editTopicIndex !== null) {
      unitExperiments[editTopicIndex] = submissionData;
    } else {
      unitExperiments.push(submissionData);
    }

    // Auto-reorder based on experiment number
    unitExperiments.sort((a, b) => a.experimentNumber - b.experimentNumber);

    updatedLab[selectedUnit].experiments = unitExperiments;
    setLocalLabData(updatedLab);
    setIsModalOpen(false);
  };

  const confirmDelete = () => {
    const updatedLab = { ...localLabData };
    if (updatedLab[selectedUnit]?.experiments) {
      updatedLab[selectedUnit].experiments = updatedLab[
        selectedUnit
      ].experiments.filter((_, i) => i !== deleteIndex);
      setLocalLabData(updatedLab);
      setIsDeleteModalOpen(false);
    }
  };

  const handleFinalSubmit = async () => {
    setLoading(true);
    try {
      const payload = {
        subjectId: classroom?.subjectId?._id,
        sectionId: classroom?.sectionId?._id,
        academicYearId: classroom?.academicYearId?._id,
        planners: {
          ...data?.coursePlan?.planners,
          lab: localLabData,
        },
        status: data?.coursePlan?.status || "Draft",
      };
      const res = await saveCoursePlan(payload);
      if (res.success) {
        await refreshData();
        if (onNext) onNext();
      }
    } catch (error) {
      console.error("Save Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = () => {
    setIsEditing(false);
    const nextNum =
      currentExperiments.length > 0
        ? Math.max(...currentExperiments.map((e) => e.experimentNumber)) + 1
        : 1;
    setFormData({
      experimentNumber: nextNum,
      title: "",
      plannedDate: "",
      duration: "",
    });
    setIsModalOpen(true);
  };

  const openEditModal = (item, index) => {
    setIsEditing(true);
    setEditTopicIndex(index);
    setFormData({
      experimentNumber: item.experimentNumber,
      title: item.title || "",
      plannedDate: item.plannedDate ? item.plannedDate.split("T")[0] : "",
      duration: item.duration || "",
    });
    setIsModalOpen(true);
  };

  return (
    <div className="flex flex-col h-full space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b pb-4">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
          {UNITS.map((unit) => (
            <button
              key={unit.key}
              onClick={() => setSelectedUnit(unit.key)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-all text-sm font-bold ${
                selectedUnit === unit.key
                  ? "bg-[#08384f] text-white shadow-md border-[#08384f]"
                  : "bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100"
              }`}
            >
              <FlaskConical size={14} /> {unit.label}
            </button>
          ))}
        </div>
        <button
          onClick={openAddModal}
          className="bg-[#08384F] text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-[#062c3e] shadow-sm text-sm font-bold"
        >
          <Plus size={18} /> Add Experiment
        </button>
      </div>

      <div className="flex justify-center">
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
                {unitTitle || "Click to add CO objective..."}
              </h3>
              <Edit2
                size={12}
                className="text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity"
              />
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full table-fixed divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="w-16 px-4 py-4 text-center font-semibold">
                  Exp #
                </th>
                <th className="px-6 py-4 text-left font-semibold">
                  Experiment Title
                </th>
                <th className="w-40 px-6 py-4 text-left font-semibold">
                  Planned Date
                </th>
                <th className="w-24 px-4 py-4 text-left font-semibold">Dur.</th>
                <th className="w-28 px-4 py-4 text-center font-semibold">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {currentExperiments.length > 0 ? (
                currentExperiments.map((item, idx) => (
                  <tr
                    key={idx}
                    className="hover:bg-gray-50/50 transition-colors"
                  >
                    <td className="px-4 py-4 text-center font-bold text-[#08384F]">
                      {item.experimentNumber}
                    </td>
                    <td className="px-6 py-4 font-medium break-words leading-relaxed">
                      {item.title}
                    </td>
                    <td className="px-6 py-4">
                      {item.plannedDate
                        ? new Date(item.plannedDate).toLocaleDateString()
                        : "-"}
                    </td>
                    <td className="px-4 py-4">{item.duration} hr</td>
                    <td className="px-4 py-4">
                      <div className="flex justify-center gap-1">
                        <button
                          onClick={() => openEditModal(item, idx)}
                          className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => {
                            setDeleteIndex(idx);
                            setIsDeleteModalOpen(true);
                          }}
                          className="p-2 text-red-500 hover:bg-red-100 rounded-lg"
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
                    colSpan={5}
                    className="py-16 text-center text-gray-400 italic"
                  >
                    No experiments added for this CO.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-100 bg-white">
        <button
          onClick={onPrev}
          className="flex items-center gap-2 text-gray-500 font-bold text-sm px-6 py-2 rounded-xl border border-gray-200"
        >
          <ChevronLeft size={18} /> Previous
        </button>
        <button
          onClick={handleFinalSubmit}
          disabled={loading}
          className="flex items-center gap-2 bg-[#08384F] text-white font-bold text-sm px-8 py-2.5 rounded-xl shadow-lg hover:bg-[#0c4a68] disabled:opacity-50 transition-all"
        >
          {loading ? "Saving..." : "Next Step"} <ChevronRight size={18} />
        </button>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
            <div className="flex justify-between items-center p-5 border-b">
              <h2 className="text-lg font-bold text-gray-800">
                {isEditing ? "Update" : "New"} Experiment
              </h2>
              <X
                className="cursor-pointer text-gray-400 hover:text-red-500"
                size={20}
                onClick={() => setIsModalOpen(false)}
              />
            </div>
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-4 gap-4">
                <div className="col-span-1">
                  <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">
                    Exp #
                  </label>
                  <input
                    type="number"
                    value={formData.experimentNumber}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        experimentNumber: e.target.value,
                      })
                    }
                    className="w-full border border-gray-200 rounded-lg px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-[#08384F]/20"
                  />
                </div>
                <div className="col-span-3">
                  <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">
                    Title
                  </label>
                  <input
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    className="w-full border border-gray-200 rounded-lg px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-[#08384F]/20"
                    placeholder="Experiment title..."
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">
                    Planned Date
                  </label>
                  <input
                    type="date"
                    value={formData.plannedDate}
                    onChange={(e) =>
                      setFormData({ ...formData, plannedDate: e.target.value })
                    }
                    className="w-full border border-gray-200 rounded-lg px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-[#08384F]/20"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">
                    Duration (Hrs)
                  </label>
                  <input
                    type="number"
                    value={formData.duration}
                    onChange={(e) =>
                      setFormData({ ...formData, duration: e.target.value })
                    }
                    className="w-full border border-gray-200 rounded-lg px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-[#08384F]/20"
                  />
                </div>
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
                className="bg-[#08384F] text-white px-6 py-2 rounded-lg font-bold text-sm shadow-md"
              >
                Save Locally
              </button>
            </div>
          </div>
        </div>
      )}

      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-[2px] z-[210] flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-[380px] overflow-hidden">
            <div className="flex items-start gap-4 p-6">
              <div className="flex-shrink-0 w-10 h-10 bg-red-50 text-red-600 rounded-md flex items-center justify-center">
                <AlertTriangle size={20} />
              </div>
              <div className="flex-1">
                <h2 className="text-slate-900 text-lg font-semibold mb-1">
                  Delete Experiment
                </h2>
                <p className="text-slate-500 text-sm">
                  Remove experiment{" "}
                  {currentExperiments[deleteIndex]?.experimentNumber}?
                </p>
              </div>
            </div>
            <div className="bg-slate-50 px-6 py-4 flex justify-end gap-3 border-t">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-4 py-2 text-sm font-semibold text-slate-600"
              >
                Keep it
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 text-sm font-bold text-white bg-red-600 rounded shadow-sm"
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

export default LabPlanner;
