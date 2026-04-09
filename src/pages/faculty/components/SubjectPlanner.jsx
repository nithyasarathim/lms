import React, { useState, useEffect } from "react";
import {
  Plus,
  X,
  Edit2,
  Trash2,
  Calendar,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const CATEGORIES = [
  { label: "Assessments", key: "assessment" },
  { label: "Activities", key: "activity" },
];

const SubjectPlanner = ({
  data,
  refreshData,
  onNext,
  onPrev,
  classroom,
  saveCoursePlan,
}) => {
  const [selectedCategory, setSelectedCategory] = useState("assessment");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editIndex, setEditIndex] = useState(null);
  const [editItemId, setEditItemId] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteConfig, setDeleteConfig] = useState(null);
  const [loading, setLoading] = useState(false);

  const [assessments, setAssessments] = useState([
    { id: 1, name: "CIA I", proposedDates: [], actualDates: [], reasons: [] },
    { id: 2, name: "CIA II", proposedDates: [], actualDates: [], reasons: [] },
    { id: 3, name: "CIA III", proposedDates: [], actualDates: [], reasons: [] },
    { id: 4, name: "Project Review – 1", proposedDates: [], actualDates: [], reasons: [] },
    { id: 5, name: "Project Review - 2", proposedDates: [], actualDates: [], reasons: [] },
    { id: 6, name: "Project Review - 3", proposedDates: [], actualDates: [], reasons: [] },
  ]);

  const [activities, setActivities] = useState([
    { id: 1, name: "Seminar", proposedDates: [], actualDates: [], reasons: [] },
    { id: 2, name: "Guest Lecture", proposedDates: [], actualDates: [], reasons: [] },
    { id: 3, name: "Workshop", proposedDates: [], actualDates: [], reasons: [] },
    { id: 4, name: "Industrial Visit", proposedDates: [], actualDates: [], reasons: [] },
  ]);

  const [formData, setFormData] = useState({
    proposedDate: "",
    actualDate: "",
    reason: "",
  });

  useEffect(() => {
    const planner = data?.coursePlan?.planner;
    if (planner) {
      if (planner.assessments) setAssessments(planner.assessments);
      if (planner.activities) setActivities(planner.activities);
    }
  }, [data]);

  const handleSave = async (updatedAssessments, updatedActivities) => {
    setLoading(true);
    try {
      const payload = {
        subjectId: classroom?.subjectId?._id,
        sectionId: classroom?.sectionId?._id,
        academicYearId: classroom?.academicYearId?._id,
        planner: {
          assessments: updatedAssessments || assessments,
          activities: updatedActivities || activities,
        },
        status: data?.coursePlan?.status || "Draft",
      };
      const res = await saveCoursePlan(payload);
      if (res.success) {
        await refreshData();
        return true;
      }
    } catch (err) {
      console.error("Save Error:", err);
    } finally {
      setLoading(false);
    }
    return false;
  };

  const openAddModal = (id) => {
    setIsEditing(false);
    setEditItemId(id);
    setFormData({ proposedDate: "", actualDate: "", reason: "" });
    setIsModalOpen(true);
  };

  const openEditModal = (id, index) => {
    setIsEditing(true);
    setEditItemId(id);
    setEditIndex(index);
    const list = selectedCategory === "assessment" ? assessments : activities;
    const parent = list.find((p) => p.id === id);
    setFormData({
      proposedDate: parent.proposedDates[index] || "",
      actualDate: parent.actualDates[index] || "",
      reason: parent.reasons[index] || "",
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async () => {
    const isAssessment = selectedCategory === "assessment";
    const currentList = isAssessment ? assessments : activities;

    const updatedList = currentList.map((item) => {
      if (item.id === editItemId) {
        const newItem = { ...item };
        if (isEditing) {
          newItem.proposedDates[editIndex] = formData.proposedDate;
          newItem.actualDates[editIndex] = formData.actualDate;
          newItem.reasons[editIndex] = formData.reason;
        } else {
          newItem.proposedDates = [...newItem.proposedDates, formData.proposedDate];
          newItem.actualDates = [...newItem.actualDates, formData.actualDate];
          newItem.reasons = [...newItem.reasons, formData.reason];
        }
        return newItem;
      }
      return item;
    });

    const success = await handleSave(
      isAssessment ? updatedList : assessments,
      isAssessment ? activities : updatedList
    );
    if (success) setIsModalOpen(false);
  };

  const confirmDelete = async () => {
    const { id, index } = deleteConfig;
    const isAssessment = selectedCategory === "assessment";
    const currentList = isAssessment ? assessments : activities;

    const updatedList = currentList.map((item) => {
      if (item.id === id) {
        return {
          ...item,
          proposedDates: item.proposedDates.filter((_, i) => i !== index),
          actualDates: item.actualDates.filter((_, i) => i !== index),
          reasons: item.reasons.filter((_, i) => i !== index),
        };
      }
      return item;
    });

    const success = await handleSave(
      isAssessment ? updatedList : assessments,
      isAssessment ? activities : updatedList
    );
    if (success) setIsDeleteModalOpen(false);
  };

  const currentItems = selectedCategory === "assessment" ? assessments : activities;

  return (
    <div className="flex flex-col h-full bg-white overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b pb-4 shrink-0">
        <h2 className="font-medium text-lg text-[#08384F]">Subject Planner</h2>
        <div className="flex items-center gap-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.key}
              onClick={() => setSelectedCategory(cat.key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all text-sm font-bold ${
                selectedCategory === cat.key
                  ? "bg-[#08384f] text-white shadow-md border-[#08384f]"
                  : "bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100"
              }`}
            >
              <Calendar size={14} />
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 mt-4 border border-gray-200 rounded-xl bg-white shadow-sm overflow-hidden flex flex-col">
        <div className="overflow-auto flex-1">
          <table className="w-full table-fixed divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50 sticky top-0 z-10">
              <tr>
                <th className="w-12 px-4 py-4 text-center font-semibold text-gray-600">#</th>
                <th className="px-6 py-4 text-left font-semibold text-gray-600">Description</th>
                <th className="w-32 px-4 py-4 text-left font-semibold text-gray-600">Proposed</th>
                <th className="w-32 px-4 py-4 text-left font-semibold text-gray-600">Actual</th>
                <th className="px-6 py-4 text-left font-semibold text-gray-600">Reason</th>
                <th className="w-28 px-4 py-4 text-center font-semibold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-xs">
              {currentItems.map((item, idx) => (
                <React.Fragment key={item.id}>
                  {item.proposedDates.length === 0 ? (
                    <tr className="hover:bg-gray-50/50">
                      <td className="px-4 py-4 text-center text-gray-400">{idx + 1}</td>
                      <td className="px-6 py-4 font-medium text-gray-700">{item.name}</td>
                      <td colSpan={3} className="px-6 py-4 text-gray-400 italic text-xs">
                        No schedules recorded
                      </td>
                      <td className="px-4 py-4 text-center">
                        <button
                          onClick={() => openAddModal(item.id)}
                          className="p-2 text-[#08384f] hover:bg-gray-100 rounded-lg"
                        >
                          <Plus size={18} />
                        </button>
                      </td>
                    </tr>
                  ) : (
                    item.proposedDates.map((pDate, rIdx) => (
                      <tr key={`${item.id}-${rIdx}`} className="hover:bg-gray-50/50">
                        <td className="px-4 py-4 text-center font-medium">
                          {rIdx === 0 ? idx + 1 : ""}
                        </td>
                        <td className="px-6 py-4 font-medium text-gray-700">
                          {rIdx === 0 ? item.name : ""}
                        </td>
                        <td className="px-4 py-4 text-gray-600">{pDate}</td>
                        <td className="px-4 py-4 text-gray-600">{item.actualDates[rIdx]}</td>
                        <td className="px-6 py-4 text-gray-500 truncate">
                          {item.reasons[rIdx] || "-"}
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex justify-center gap-1">
                            {rIdx === 0 && (
                              <button
                                onClick={() => openAddModal(item.id)}
                                className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
                              >
                                <Plus size={16} />
                              </button>
                            )}
                            <button
                              onClick={() => openEditModal(item.id, rIdx)}
                              className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg"
                            >
                              <Edit2 size={16} />
                            </button>
                            <button
                              onClick={() => {
                                setDeleteConfig({ id: item.id, index: rIdx });
                                setIsDeleteModalOpen(true);
                              }}
                              className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </React.Fragment>
              ))}
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
          onClick={onNext}
          className="flex items-center gap-2 bg-[#08384F] text-white font-bold text-sm px-8 py-2.5 rounded-xl shadow-lg hover:bg-[#0c4a68] transition-all"
        >
          Next Step <ChevronRight size={18} />
        </button>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
            <div className="flex justify-between items-center p-5 border-b">
              <h2 className="text-lg font-bold text-gray-800">
                {isEditing ? "Update" : "Add"} Schedule
              </h2>
              <X
                className="cursor-pointer text-gray-400 hover:text-red-500"
                size={20}
                onClick={() => setIsModalOpen(false)}
              />
            </div>
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">
                    Proposed Date
                  </label>
                  <input
                    type="date"
                    value={formData.proposedDate}
                    onChange={(e) =>
                      setFormData({ ...formData, proposedDate: e.target.value })
                    }
                    className="w-full border border-gray-200 rounded-lg px-4 py-2 text-sm outline-none focus:border-[#08384F]"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">
                    Actual Date
                  </label>
                  <input
                    type="date"
                    value={formData.actualDate}
                    onChange={(e) =>
                      setFormData({ ...formData, actualDate: e.target.value })
                    }
                    className="w-full border border-gray-200 rounded-lg px-4 py-2 text-sm outline-none focus:border-[#08384F]"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">
                  Reason for Change
                </label>
                <textarea
                  value={formData.reason}
                  onChange={(e) =>
                    setFormData({ ...formData, reason: e.target.value })
                  }
                  className="w-full border border-gray-200 rounded-lg px-4 py-2 text-sm outline-none focus:border-[#08384F] h-20 resize-none"
                  placeholder="Enter reason if dates differ..."
                />
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
                disabled={loading}
                className="bg-[#08384F] text-white px-6 py-2 rounded-lg font-bold shadow-lg text-sm"
              >
                {loading ? "Saving..." : "Save Progress"}
              </button>
            </div>
          </div>
        </div>
      )}

      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-[2px] z-[210] flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-[380px] overflow-hidden border border-slate-200">
            <div className="flex items-start gap-4 p-6">
              <div className="flex-shrink-0 w-10 h-10 bg-red-50 text-red-600 rounded-md flex items-center justify-center border border-red-100">
                <AlertTriangle size={20} strokeWidth={2.5} />
              </div>
              <div className="flex-1">
                <h2 className="text-slate-900 text-lg font-semibold leading-tight mb-1">
                  Delete Schedule
                </h2>
                <p className="text-slate-500 text-sm leading-relaxed">
                  Are you sure you want to remove this entry?
                </p>
              </div>
            </div>
            <div className="bg-slate-50 px-6 py-4 flex justify-end gap-3 border-t border-slate-100">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-200/50 rounded transition-colors"
              >
                Keep it
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 text-sm font-bold text-white bg-red-600 hover:bg-red-700 rounded shadow-sm transition-all"
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

export default SubjectPlanner;