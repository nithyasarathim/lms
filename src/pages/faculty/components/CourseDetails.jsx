import React, { useEffect, useState } from 'react';
import { Plus, X, ChevronRight } from 'lucide-react';

const CourseDetailsForm = ({
  data,
  refreshData,
  onNext,
  classroom,
  saveCoursePlan
}) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    description: '',
    preRequisites: '',
    coRequisites: '',
    objectives: [''],
    outcomes: [{ statement: '', rtbl: 'K1' }]
  });

  useEffect(() => {
    const coursePlan = data?.coursePlan || data;
    const details = coursePlan?.courseDetails;
    if (details) {
      setFormData({
        description: details.description || '',
        preRequisites: details.preRequisites || '',
        coRequisites: details.coRequisites || '',
        objectives: details.objectives?.length ? details.objectives : [''],
        outcomes: details.outcomes?.length
          ? details.outcomes
          : [{ statement: '', rtbl: 'K1' }]
      });
    }
  }, [data]);

  const handleChange = (field, value) =>
    setFormData((prev) => ({ ...prev, [field]: value }));

  const handleObjectiveChange = (index, value) => {
    setFormData((prev) => {
      const updated = [...prev.objectives];
      updated[index] = value;
      return { ...prev, objectives: updated };
    });
  };

  const addObjective = () =>
    setFormData((prev) => ({ ...prev, objectives: [...prev.objectives, ''] }));

  const removeObjective = (index) => {
    setFormData((prev) => {
      const updated = prev.objectives.filter((_, i) => i !== index);
      return {
        ...prev,
        objectives: updated.length ? updated : ['']
      };
    });
  };

  const handleOutcomeChange = (index, field, value) => {
    setFormData((prev) => {
      const updated = [...prev.outcomes];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, outcomes: updated };
    });
  };

  const addOutcome = () => {
    setFormData((prev) => ({
      ...prev,
      outcomes: [...prev.outcomes, { statement: '', rtbl: 'K1' }]
    }));
  };

  const removeOutcome = (index) => {
    setFormData((prev) => {
      const updated = prev.outcomes.filter((_, i) => i !== index);
      return {
        ...prev,
        outcomes: updated.length ? updated : [{ statement: '', rtbl: 'K1' }]
      };
    });
  };

  const handleSaveAndNext = async () => {
    setLoading(true);
    try {
      const coursePlan = data?.coursePlan || data;
      const payload = {
        subjectId: classroom?.subjectId?._id,
        sectionId: classroom?.sectionId?._id,
        academicYearId: classroom?.academicYearId?._id,
        status: coursePlan?.status || 'Draft',
        courseDetails: {
          courseType: classroom?.subjectId?.deliveryType || 'Theory',
          description: formData.description,
          preRequisites: formData.preRequisites,
          coRequisites: formData.coRequisites,
          objectives: formData.objectives.filter((obj) => obj && obj.trim()),
          outcomes: formData.outcomes
            .filter((out) => out.statement && out.statement.trim())
            .map(({ _id, statement, rtbl }) => ({
              ...(_id && { _id }), // preserve existing _id, omit for new COs
              statement,
              rtbl
            }))
        }
      };

      const res = await saveCoursePlan(payload);
      if (res.success) {
        if (refreshData) await refreshData(); // refetch to get reindexed CO codes & cleaned dependent data
        if (onNext) onNext();
      }
    } catch (err) {
      console.error(
        'Error saving course details:',
        err.response?.data || err.message
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white">
      <form
        className="flex-1 overflow-y-auto pr-2 custom-scrollbar"
        onSubmit={(e) => e.preventDefault()}
      >
        <div className="space-y-6 px-2">
          <div className="grid grid-cols-4 gap-4">
            <div className="flex flex-col gap-1 col-span-1">
              <label className="text-xs font-bold text-gray-600 uppercase">
                Course Type
              </label>
              <input
                type="text"
                readOnly
                value={classroom?.subjectId?.deliveryType || 'N/A'}
                className="w-full border border-gray-200 bg-gray-50 rounded-lg px-3 py-2 text-sm text-gray-500 cursor-not-allowed outline-none"
              />
            </div>
            <div className="flex flex-col gap-1 col-span-3">
              <label className="text-xs font-bold text-gray-600 uppercase">
                Pre-Requisites
              </label>
              <input
                type="text"
                placeholder="e.g. Programming Fundamentals"
                value={formData.preRequisites}
                onChange={(e) => handleChange('preRequisites', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-[#08384f] outline-none"
              />
            </div>
            <div className="flex flex-col gap-1 col-span-4">
              <label className="text-xs font-bold text-gray-600 uppercase">
                Co-Requisites
              </label>
              <input
                type="text"
                placeholder="e.g. Database Management Lab"
                value={formData.coRequisites}
                onChange={(e) => handleChange('coRequisites', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-[#08384f] outline-none"
              />
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-gray-600 uppercase">
              Course Description
            </label>
            <textarea
              placeholder="Briefly describe the course content..."
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm h-28 focus:ring-1 focus:ring-[#08384f] outline-none resize-none"
            />
          </div>
          <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
            <label className="text-xs font-bold text-[#08384f] uppercase mb-3 block">
              Course Objectives
            </label>
            <div className="space-y-2">
              {formData.objectives.map((obj, index) => (
                <div key={`obj-${index}`} className="flex gap-2 items-center">
                  <div className="flex-none w-6 h-6 bg-[#08384f] text-white rounded-full flex items-center justify-center text-[10px] font-bold">
                    {index + 1}
                  </div>
                  <input
                    type="text"
                    value={obj}
                    onChange={(e) =>
                      handleObjectiveChange(index, e.target.value)
                    }
                    className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:border-[#08384f] outline-none bg-white"
                    placeholder="Describe the learning goal..."
                  />
                  <button
                    type="button"
                    onClick={() => removeObjective(index)}
                    className="text-gray-400 hover:text-red-500 p-1"
                  >
                    <X size={18} />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={addObjective}
                className="flex items-center gap-2 text-[#08384f] text-xs font-bold mt-2 hover:underline ml-8"
              >
                <Plus size={14} /> Add Objective
              </button>
            </div>
          </div>
          <div>
            <label className="text-xs font-bold text-gray-600 uppercase mb-3 block">
              Course Outcomes (CO)
            </label>
            <div className="space-y-3">
              {formData.outcomes.map((outcome, index) => (
                <div
                  key={outcome._id || `co-${index}`}
                  className="grid grid-cols-12 gap-3 p-3 bg-white border border-gray-200 rounded-xl"
                >
                  <div className="col-span-2 flex items-center justify-center bg-[#f1f5f9] rounded-lg text-[11px] font-bold text-gray-600">
                    {outcome.code || `CO${index + 1}`}
                  </div>
                  <div className="col-span-7">
                    <input
                      type="text"
                      placeholder="Student will be able to..."
                      value={outcome.statement}
                      onChange={(e) =>
                        handleOutcomeChange(index, 'statement', e.target.value)
                      }
                      className="w-full border-none focus:ring-0 text-sm p-1 outline-none"
                    />
                  </div>
                  <div className="col-span-2">
                    <select
                      value={outcome.rtbl}
                      onChange={(e) =>
                        handleOutcomeChange(index, 'rtbl', e.target.value)
                      }
                      className="w-full border border-gray-200 rounded-md px-1 py-1 text-xs font-bold bg-white outline-none"
                    >
                      {['K1', 'K2', 'K3', 'K4', 'K5', 'K6'].map((k) => (
                        <option key={k} value={k}>
                          {k}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="col-span-1 flex items-center justify-center">
                    <button
                      type="button"
                      onClick={() => removeOutcome(index)}
                      className="text-gray-400 hover:text-red-500 p-1"
                    >
                      <X size={18} />
                    </button>
                  </div>
                </div>
              ))}
              <button
                type="button"
                onClick={addOutcome}
                className="flex items-center gap-2 text-[#08384f] text-xs font-bold mt-2 hover:underline"
              >
                <Plus size={14} /> Add Outcome
              </button>
            </div>
          </div>
        </div>
      </form>
      <footer className="mt-4 pt-4 border-t border-gray-100 flex justify-end items-center gap-4 bg-white">
        <button
          onClick={handleSaveAndNext}
          disabled={loading}
          className="flex items-center gap-2 bg-[#08384f] text-white font-bold text-sm px-8 py-2.5 rounded-xl shadow-lg hover:bg-[#0c4a68] active:scale-95 disabled:opacity-50 transition-all"
        >
          {loading ? (
            'Saving...'
          ) : (
            <>
              Save & Next <ChevronRight size={18} />
            </>
          )}
        </button>
      </footer>
    </div>
  );
};

export default CourseDetailsForm;
