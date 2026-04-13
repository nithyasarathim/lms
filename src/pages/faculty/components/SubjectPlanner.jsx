import React, { useState, useEffect } from 'react';
import {
  Plus,
  X,
  Edit2,
  Trash2,
  Calendar,
  AlertTriangle,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

const CATEGORIES = [
  { label: 'Assessments', key: 'assessments' },
  { label: 'Activities', key: 'activities' }
];

const SubjectPlanner = ({
  data,
  refreshData,
  onNext,
  onPrev,
  classroom,
  saveCoursePlan
}) => {
  const [selectedCategory, setSelectedCategory] = useState('assessments');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [loading, setLoading] = useState(false);

  // Initial State synced with Schema defaults
  const [assessments, setAssessments] = useState([]);
  const [activities, setActivities] = useState([]);

  const [formData, setFormData] = useState({
    name: '',
    proposedDate: '',
    actualDate: '',
    changeReason: ''
  });

  // Load data from CoursePlan model
  useEffect(() => {
    if (data?.coursePlan) {
      setAssessments(data.coursePlan.assessments || []);
      setActivities(data.coursePlan.activities || []);
    }
  }, [data]);

  const handleSave = async (updatedAssessments, updatedActivities) => {
    setLoading(true);
    try {
      const payload = {
        subjectId: classroom?.subjectId?._id,
        sectionId: classroom?.sectionId?._id,
        academicYearId: classroom?.academicYearId?._id,
        assessments: updatedAssessments || assessments,
        activities: updatedActivities || activities,
        status: data?.coursePlan?.status || 'Draft'
      };

      const res = await saveCoursePlan(payload);
      if (res.success) {
        await refreshData();
        setIsModalOpen(false);
        setIsDeleteModalOpen(false);
      }
    } catch (err) {
      console.error('Save Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = () => {
    setIsEditing(false);
    setEditId(null);
    setFormData({
      name: '',
      proposedDate: '',
      actualDate: '',
      changeReason: ''
    });
    setIsModalOpen(true);
  };

  const openEditModal = (item) => {
    setIsEditing(true);
    setEditId(item._id);
    setFormData({
      name: item.name || '',
      proposedDate: item.proposedDate ? item.proposedDate.split('T')[0] : '',
      actualDate: item.actualDate ? item.actualDate.split('T')[0] : '',
      changeReason: item.changeReason || ''
    });
    setIsModalOpen(true);
  };

  const handleSubmit = () => {
    const isAss = selectedCategory === 'assessments';
    const currentList = isAss ? [...assessments] : [...activities];

    if (isEditing) {
      const idx = currentList.findIndex((item) => item._id === editId);
      if (idx !== -1) currentList[idx] = { ...currentList[idx], ...formData };
    } else {
      currentList.push({ ...formData });
    }

    if (isAss) handleSave(currentList, activities);
    else handleSave(assessments, currentList);
  };

  const confirmDelete = () => {
    const isAss = selectedCategory === 'assessments';
    const currentList = isAss ? [...assessments] : [...activities];
    const updatedList = currentList.filter((item) => item._id !== deleteId);

    if (isAss) handleSave(updatedList, activities);
    else handleSave(assessments, updatedList);
  };

  const currentItems =
    selectedCategory === 'assessments' ? assessments : activities;

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 shrink-0">
        <div className="flex items-center gap-4">
          <h2 className="font-bold text-lg text-[#08384F]">Planner</h2>
          <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-xl">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.key}
                onClick={() => setSelectedCategory(cat.key)}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  selectedCategory === cat.key
                    ? 'bg-white text-[#08384f] shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
        <button
          onClick={openAddModal}
          className="bg-[#08384F] text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-[#062c3e] shadow-sm text-sm font-bold"
        >
          <Plus size={18} /> Add{' '}
          {selectedCategory === 'assessments' ? 'Assessment' : 'Activity'}
        </button>
      </div>

      <div className="flex-1 mt-4 border border-gray-200 rounded-xl bg-white shadow-sm overflow-hidden flex flex-col">
        <div className="overflow-auto flex-1">
          <table className="w-full table-fixed divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50 sticky top-0 z-10">
              <tr>
                <th className="w-12 px-4 py-4 text-center font-bold text-gray-600">
                  #
                </th>
                <th className="px-6 py-4 text-left font-bold text-gray-600">
                  Description
                </th>
                <th className="w-40 px-4 py-4 text-left font-bold text-gray-600">
                  Proposed Date
                </th>
                <th className="w-40 px-4 py-4 text-left font-bold text-gray-600">
                  Actual Date
                </th>
                <th className="px-6 py-4 text-left font-bold text-gray-600">
                  Reason for Change
                </th>
                <th className="w-28 px-4 py-4 text-center font-bold text-gray-600">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {currentItems.length > 0 ? (
                currentItems.map((item, idx) => (
                  <tr key={item._id || idx} className="hover:bg-gray-50/50">
                    <td className="px-4 py-4 text-center font-medium text-gray-400">
                      {idx + 1}
                    </td>
                    <td className="px-6 py-4 font-bold text-[#08384F]">
                      {item.name}
                    </td>
                    <td className="px-4 py-4 text-gray-600">
                      {item.proposedDate
                        ? new Date(item.proposedDate).toLocaleDateString()
                        : '-'}
                    </td>
                    <td className="px-4 py-4 text-gray-600">
                      {item.actualDate
                        ? new Date(item.actualDate).toLocaleDateString()
                        : '-'}
                    </td>
                    <td className="px-6 py-4 text-gray-500 italic text-xs">
                      {item.changeReason || '-'}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex justify-center gap-1">
                        <button
                          onClick={() => openEditModal(item)}
                          className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => {
                            setDeleteId(item._id);
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
              ) : (
                <tr>
                  <td
                    colSpan={6}
                    className="py-20 text-center text-gray-400 italic"
                  >
                    No records found in this category.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex justify-between items-center pt-4 border-t border-gray-100 shrink-0">
        <button
          onClick={onPrev}
          className="flex items-center gap-2 text-gray-500 font-bold text-sm px-6 py-2 rounded-xl border border-gray-200 hover:bg-gray-50"
        >
          <ChevronLeft size={18} /> Previous
        </button>
        <button
          onClick={onNext}
          className="flex items-center gap-2 bg-[#08384F] text-white font-bold text-sm px-8 py-2.5 rounded-xl shadow-lg hover:bg-[#0c4a68]"
        >
          {onNext ? 'Finish & Review' : 'Next Step'} <ChevronRight size={18} />
        </button>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
            <div className="flex justify-between items-center p-5 border-b">
              <h2 className="text-lg font-bold text-gray-800">
                {isEditing ? 'Update' : 'Add New'} Entry
              </h2>
              <X
                className="cursor-pointer text-gray-400 hover:text-red-500"
                size={20}
                onClick={() => setIsModalOpen(false)}
              />
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">
                  Description Name
                </label>
                <input
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="e.g. CIA I or Seminar"
                  className="w-full border border-gray-200 rounded-lg px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-[#08384F]/10"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">
                    Proposed Date
                  </label>
                  <input
                    type="date"
                    value={formData.proposedDate}
                    onChange={(e) =>
                      setFormData({ ...formData, proposedDate: e.target.value })
                    }
                    className="w-full border border-gray-200 rounded-lg px-4 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">
                    Actual Date
                  </label>
                  <input
                    type="date"
                    value={formData.actualDate}
                    onChange={(e) =>
                      setFormData({ ...formData, actualDate: e.target.value })
                    }
                    className="w-full border border-gray-200 rounded-lg px-4 py-2 text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">
                  Reason for Deviation
                </label>
                <textarea
                  value={formData.changeReason}
                  onChange={(e) =>
                    setFormData({ ...formData, changeReason: e.target.value })
                  }
                  className="w-full border border-gray-200 rounded-lg px-4 py-2 text-sm h-20 resize-none"
                  placeholder="Why did the dates change?"
                />
              </div>
            </div>
            <div className="p-5 bg-gray-50 flex justify-end gap-3 border-t">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 font-bold text-gray-500 text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="bg-[#08384F] text-white px-6 py-2 rounded-lg font-bold text-sm shadow-md"
              >
                {loading ? 'Saving...' : 'Save Entry'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-[2px] z-[210] flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-[380px] overflow-hidden">
            <div className="flex items-start gap-4 p-6">
              <div className="flex-shrink-0 w-10 h-10 bg-red-50 text-red-600 rounded-md flex items-center justify-center border border-red-100">
                <AlertTriangle size={20} />
              </div>
              <div>
                <h2 className="text-slate-900 text-lg font-bold">
                  Remove Item
                </h2>
                <p className="text-slate-500 text-sm">
                  Are you sure? This will remove the record from your plan.
                </p>
              </div>
            </div>
            <div className="bg-slate-50 px-6 py-4 flex justify-end gap-3 border-t">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-4 py-2 text-sm font-bold text-slate-500"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 text-sm font-bold text-white bg-red-600 rounded hover:bg-red-700"
              >
                Delete Permanently
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubjectPlanner;
