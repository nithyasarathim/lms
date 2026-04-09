import React, { useState, useEffect } from 'react';
import { BookOpen, ChevronLeft, ChevronRight, Save } from 'lucide-react';

const PO_LIST = [
  'PO1',
  'PO2',
  'PO3',
  'PO4',
  'PO5',
  'PO6',
  'PO7',
  'PO8',
  'PO9',
  'PO10',
  'PO11',
  'PO12',
  'PSO1',
  'PSO2',
  'PSO3'
];

const COPOMapping = ({
  data,
  refreshData,
  onNext,
  onPrev,
  classroom,
  saveCoursePlan
}) => {
  // Pulling from Master Source in Schema
  const courseOutcomes = data?.coursePlan?.courseDetails?.outcomes || [];

  const [selectedTab, setSelectedTab] = useState('');
  const [loading, setLoading] = useState(false);
  const [coPoMapping, setCoPoMapping] = useState([]);

  useEffect(() => {
    if (data?.coursePlan?.coPoMapping) {
      setCoPoMapping(data.coursePlan.coPoMapping);
    }
    if (courseOutcomes.length > 0 && !selectedTab) {
      setSelectedTab(courseOutcomes[0]._id);
    }
  }, [data, courseOutcomes, selectedTab]);

  // Determine indices for "Save & Next CO" logic
  const currentCoIndex = courseOutcomes.findIndex(
    (co) => co._id === selectedTab
  );
  const isLastCo = currentCoIndex === courseOutcomes.length - 1;

  const getCurrentMapping = () => {
    const existing = coPoMapping.find((m) => m.coId === selectedTab);
    return existing || { coId: selectedTab, mappings: {} };
  };

  const updateMapping = (item, field, value) => {
    const current = getCurrentMapping();
    const newMappings = { ...current.mappings };
    const existingEntry = newMappings[item] || { justification: '', credit: 0 };

    newMappings[item] = {
      justification:
        field === 'justification' ? value : existingEntry.justification,
      credit: field === 'credit' ? Number(value) : existingEntry.credit
    };

    const updatedMapping = [...coPoMapping];
    const index = updatedMapping.findIndex((m) => m.coId === selectedTab);

    if (index > -1) {
      updatedMapping[index] = {
        ...updatedMapping[index],
        mappings: newMappings
      };
    } else {
      updatedMapping.push({ coId: selectedTab, mappings: newMappings });
    }
    setCoPoMapping(updatedMapping);
  };

  // Generic Save Function
  const saveProgress = async () => {
    setLoading(true);
    try {
      const payload = {
        subjectId: classroom?.subjectId?._id,
        sectionId: classroom?.sectionId?._id,
        academicYearId: classroom?.academicYearId?._id,
        coPoMapping: coPoMapping,
        status: data?.coursePlan?.status || 'Draft'
      };
      const res = await saveCoursePlan(payload);
      if (res.success && refreshData) await refreshData();
      return res.success;
    } catch (err) {
      console.error('Error updating CO-PO mapping:', err.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAndNextCO = async () => {
    const success = await saveProgress();
    if (success && !isLastCo) {
      setSelectedTab(courseOutcomes[currentCoIndex + 1]._id);
    }
  };

  const handleFinalNext = async () => {
    const success = await saveProgress();
    if (success && onNext) onNext();
  };

  const currentMappingsObj = getCurrentMapping().mappings || {};

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Tabs Header */}
      <div className="flex items-center justify-between sticky top-0 bg-white z-10 mb-4 pb-2 border-b">
        <div className="flex items-center gap-3 overflow-x-auto no-scrollbar">
          {courseOutcomes.map((co) => (
            <button
              key={co._id}
              onClick={() => setSelectedTab(co._id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm transition-all whitespace-nowrap ${
                selectedTab === co._id
                  ? 'bg-[#08384f] text-white shadow-md'
                  : 'bg-gray-50 text-gray-500 hover:bg-gray-100 border border-gray-100'
              }`}
            >
              <BookOpen size={14} />
              {co.code}
            </button>
          ))}
        </div>

        {/* Save & Next CO Button (Hidden on last CO) */}
        {!isLastCo && courseOutcomes.length > 0 && (
          <button
            onClick={handleSaveAndNextCO}
            disabled={loading}
            className="flex items-center gap-2 text-[#08384f] bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-lg text-xs font-bold transition-all border border-blue-100"
          >
            {loading ? (
              'Saving...'
            ) : (
              <>
                <Save size={14} /> Save & Next CO
              </>
            )}
          </button>
        )}
      </div>

      {/* Mapping List */}
      <div className="flex-1 overflow-auto pr-2 custom-scrollbar">
        {courseOutcomes.length > 0 ? (
          <div className="space-y-2 pb-4">
            {PO_LIST.map((item) => {
              const entry = currentMappingsObj[item] || {
                justification: '',
                credit: 0
              };
              const isMapped = entry.credit > 0;
              return (
                <div
                  key={item}
                  className={`flex items-center border rounded-xl overflow-hidden transition-all ${
                    isMapped
                      ? 'border-blue-200 bg-blue-50/30'
                      : 'border-gray-100 bg-gray-50/50'
                  }`}
                >
                  <div className="w-16 h-12 flex items-center justify-center bg-[#f1f5f9] text-[#08384f] font-bold text-xs border-r border-gray-200">
                    {item}
                  </div>
                  <div className="flex-1 h-12 flex items-center px-4">
                    <input
                      type="text"
                      placeholder={`Provide justification for mapping ${selectedTab ? courseOutcomes.find((c) => c._id === selectedTab)?.code : ''} to ${item}...`}
                      value={entry.justification}
                      onChange={(e) =>
                        updateMapping(item, 'justification', e.target.value)
                      }
                      className="w-full outline-none text-sm text-gray-700 bg-transparent placeholder:text-gray-300"
                    />
                  </div>
                  <div className="flex items-center gap-3 px-4 h-12 border-l border-gray-100 bg-white/50">
                    <span className="text-[10px] uppercase font-black text-gray-400 tracking-widest">
                      Level
                    </span>
                    <select
                      value={entry.credit}
                      onChange={(e) =>
                        updateMapping(item, 'credit', e.target.value)
                      }
                      className={`w-14 h-8 px-1 border rounded-lg text-sm font-bold outline-none cursor-pointer transition-colors ${
                        isMapped
                          ? 'border-[#08384f] text-[#08384f]'
                          : 'border-gray-200 text-gray-400'
                      }`}
                    >
                      {[0, 1, 2, 3].map((v) => (
                        <option key={v} value={v}>
                          {v}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-gray-400">
            <AlertTriangle size={48} className="mb-2 opacity-20" />
            <p className="text-sm italic">
              Please define Course Outcomes in the first step.
            </p>
          </div>
        )}
      </div>

      {/* Main Navigation Footer */}
      <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-100 bg-white shrink-0">
        <button
          onClick={onPrev}
          className="flex items-center gap-2 text-gray-500 font-bold text-sm px-6 py-2 rounded-xl hover:bg-gray-100 transition-all border border-gray-200"
        >
          <ChevronLeft size={18} /> Previous
        </button>

        <button
          onClick={handleFinalNext}
          disabled={loading || courseOutcomes.length === 0}
          className="flex items-center gap-2 bg-[#08384f] text-white font-bold text-sm px-8 py-2.5 rounded-xl shadow-lg hover:bg-[#0c4a68] active:scale-95 disabled:opacity-50 transition-all"
        >
          {loading ? (
            'Saving...'
          ) : (
            <>
              {isLastCo ? 'Finalize & Next' : 'Save & Continue'}{' '}
              <ChevronRight size={18} />
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default COPOMapping;
