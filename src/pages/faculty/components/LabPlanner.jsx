import React, { useState, useEffect, useMemo } from 'react';
import {
  Plus,
  X,
  Edit2,
  Trash2,
  FlaskConical,
  Check,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  Save,
  Beaker
} from 'lucide-react';

const LabPlanner = ({
  data,
  refreshData,
  onNext,
  onPrev,
  classroom,
  saveCoursePlan
}) => {
  // --- States ---
  const [selectedCOIdx, setSelectedCOIdx] = useState(0);
  const [localLabData, setLocalLabData] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editTopicIndex, setEditTopicIndex] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteIndex, setDeleteIndex] = useState(null);
  const [unitTitle, setUnitTitle] = useState(''); // Maps to 'objective' or similar in Lab schema
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    plannedDate: '',
    duration: ''
  });

  // --- Memos ---
  const courseOutcomes = useMemo(
    () => data?.coursePlan?.courseDetails?.outcomes || [],
    [data]
  );

  const isLastCO = selectedCOIdx === courseOutcomes.length - 1;

  const currentExperiments = useMemo(() => {
    const currentCOId = courseOutcomes[selectedCOIdx]?._id;
    const labBlock = localLabData.find((l) => l.coId === currentCOId);
    return Array.isArray(labBlock?.experiments) ? labBlock.experiments : [];
  }, [localLabData, selectedCOIdx, courseOutcomes]);

  // --- Effects ---
  useEffect(() => {
    if (data?.coursePlan?.lab) setLocalLabData(data.coursePlan.lab);
  }, [data]);

  useEffect(() => {
    const currentCOId = courseOutcomes[selectedCOIdx]?._id;
    const existingLab = localLabData.find((l) => l.coId === currentCOId);
    // Lab schema typically uses 'objective' or 'unitTitle'
    setUnitTitle(existingLab?.unitTitle || '');
    setIsEditingTitle(false);
  }, [selectedCOIdx, localLabData, courseOutcomes]);

  // --- Handlers ---
  const handleTitleSubmit = () => {
    const currentCOId = courseOutcomes[selectedCOIdx]?._id;
    if (!currentCOId) return;
    setLocalLabData((prev) => {
      const updated = [...prev];
      const idx = updated.findIndex((l) => l.coId === currentCOId);
      if (idx > -1) updated[idx].unitTitle = unitTitle;
      else updated.push({ coId: currentCOId, unitTitle, experiments: [] });
      return updated;
    });
    setIsEditingTitle(false);
  };

  const handleSubmit = () => {
    if (!formData.title?.trim()) return alert('Experiment Title is required.');
    const currentCOId = courseOutcomes[selectedCOIdx]?._id;

    setLocalLabData((prev) => {
      const updated = [...prev];
      let idx = updated.findIndex((l) => l.coId === currentCOId);

      if (idx === -1) {
        updated.push({ coId: currentCOId, unitTitle: '', experiments: [] });
        idx = updated.length - 1;
      }

      const submission = {
        ...formData,
        duration: Number(formData.duration) || 0,
        plannedDate: formData.plannedDate || null
      };

      const experiments = [...updated[idx].experiments];
      if (isEditing) experiments[editTopicIndex] = submission;
      else experiments.push(submission);

      updated[idx].experiments = experiments;
      return updated;
    });
    setIsModalOpen(false);
  };

  const confirmDelete = () => {
    const currentCOId = courseOutcomes[selectedCOIdx]?._id;
    setLocalLabData((prev) => {
      const updated = [...prev];
      const idx = updated.findIndex((l) => l.coId === currentCOId);
      if (idx > -1)
        updated[idx].experiments = updated[idx].experiments.filter(
          (_, i) => i !== deleteIndex
        );
      return updated;
    });
    setIsDeleteModalOpen(false);
  };

  const saveProgress = async () => {
    setLoading(true);
    try {
      const payload = {
        subjectId: classroom?.subjectId?._id,
        sectionId: classroom?.sectionId?._id,
        academicYearId: classroom?.academicYearId?._id,
        lab: localLabData,
        status: data?.coursePlan?.status || 'Draft'
      };
      const res = await saveCoursePlan(payload);
      if (res.success) {
        await refreshData();
        return true;
      }
      return false;
    } catch (e) {
      console.error(e);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAndNextCO = async () => {
    const success = await saveProgress();
    if (success && !isLastCO) {
      setSelectedCOIdx(selectedCOIdx + 1);
    }
  };

  const handleFinalSubmit = async () => {
    const success = await saveProgress();
    if (success && onNext) onNext();
  };

  return (
    <div className="flex flex-col h-full space-y-4">
      {/* Navigation Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b pb-4 shrink-0">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
          {courseOutcomes.map((co, idx) => (
            <button
              key={co._id}
              onClick={() => setSelectedCOIdx(idx)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-all text-sm font-bold whitespace-nowrap ${
                selectedCOIdx === idx
                  ? 'bg-[#08384f] text-white shadow-md border-[#08384f]'
                  : 'bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100'
              }`}
            >
              <FlaskConical size={14} /> {co.code}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          {!isLastCO && courseOutcomes.length > 0 && (
            <button
              onClick={handleSaveAndNextCO}
              disabled={loading}
              className="flex items-center gap-2 text-[#08384f] bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-lg text-xs font-bold transition-all border border-blue-100"
            >
              <Save size={14} /> {loading ? 'Saving...' : 'Save & Next'}
            </button>
          )}

          <button
            onClick={() => {
              setIsEditing(false);
              setFormData({ title: '', plannedDate: '', duration: '' });
              setIsModalOpen(true);
            }}
            className="bg-[#08384F] text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-[#062c3e] shadow-sm text-sm font-bold"
          >
            <Plus size={18} /> Add Experiment
          </button>
        </div>
      </div>

      {/* Lab Objective/Title Editable Header */}
      <div className="flex justify-center shrink-0">
        <div className="w-full max-w-2xl text-center">
          {isEditingTitle ? (
            <div className="flex items-center gap-2 bg-blue-50 p-2 rounded-lg border border-blue-200">
              <input
                autoFocus
                placeholder="Enter Lab Objective/Unit Title for this CO..."
                className="flex-1 outline-none text-sm font-medium bg-transparent px-2"
                value={unitTitle}
                onChange={(e) => setUnitTitle(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleTitleSubmit()}
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
                className={`text-sm font-semibold ${unitTitle ? 'text-gray-700' : 'text-gray-300 italic'}`}
              >
                {unitTitle ||
                  `Click to add ${courseOutcomes[selectedCOIdx]?.code} lab objective...`}
              </h3>
              <Edit2
                size={12}
                className="text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity"
              />
            </div>
          )}
        </div>
      </div>

      {/* Experiments Table Container */}
      <div className="flex-1 border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm flex flex-col min-h-0">
        <div className="overflow-auto flex-1 h-full">
          <table className="w-full table-fixed divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50 sticky top-0 z-10 shadow-sm outline outline-1 outline-gray-200">
              <tr>
                <th className="w-12 px-4 py-4 text-center font-semibold">#</th>
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
                    <td className="px-4 py-4 text-center text-gray-400">
                      {idx + 1}
                    </td>
                    <td className="px-6 py-4 font-medium break-words leading-relaxed">
                      {item.title}
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      {item.plannedDate
                        ? new Date(item.plannedDate).toLocaleDateString()
                        : '-'}
                    </td>
                    <td className="px-4 py-4 text-gray-500">
                      {item.duration ? `${item.duration} hr` : '-'}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex justify-center gap-1">
                        <button
                          onClick={() => {
                            setIsEditing(true);
                            setEditTopicIndex(idx);
                            setFormData({
                              ...item,
                              plannedDate: item.plannedDate?.split('T')[0] || ''
                            });
                            setIsModalOpen(true);
                          }}
                          className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => {
                            setDeleteIndex(idx);
                            setIsDeleteModalOpen(true);
                          }}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
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

      {/* Footer Nav */}
      <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-100 bg-white">
        <button
          onClick={onPrev}
          className="flex items-center gap-2 text-gray-500 font-bold text-sm px-6 py-2 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors"
        >
          <ChevronLeft size={18} /> Previous
        </button>
        <button
          onClick={handleFinalSubmit}
          disabled={loading}
          className="flex items-center gap-2 bg-[#08384F] text-white font-bold text-sm px-8 py-2.5 rounded-xl shadow-lg hover:bg-[#0c4a68] disabled:opacity-50 transition-all"
        >
          {loading ? (
            'Saving...'
          ) : (
            <>
              {isLastCO ? 'Finalize & Next Step' : 'Save & Continue'}{' '}
              <ChevronRight size={18} />
            </>
          )}
        </button>
      </div>

      {/* Add/Edit Experiment Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-5 border-b">
              <h2 className="text-lg font-bold text-gray-800">
                {isEditing ? 'Update' : 'New'} Experiment
              </h2>
              <X
                className="cursor-pointer text-gray-400 hover:text-red-500"
                size={20}
                onClick={() => setIsModalOpen(false)}
              />
            </div>

            <div className="p-5 space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">
                  Experiment Title *
                </label>
                <input
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  className="w-full border border-gray-200 rounded-lg px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-[#08384F]/20"
                  placeholder="e.g. Verification of KVL and KCL"
                />
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
                    placeholder="3"
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

      {/* Delete Confirmation */}
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
                  Are you sure you want to remove this experiment?
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
