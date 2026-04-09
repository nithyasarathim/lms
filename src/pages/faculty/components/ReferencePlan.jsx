import { Plus, X, ChevronLeft, ChevronRight } from 'lucide-react';
import React, { useEffect, useState } from 'react';

const ReferencePlan = ({
  data,
  refreshData,
  onNext,
  onPrev,
  classroom,
  saveCoursePlan
}) => {
  const [loading, setLoading] = useState(false);

  const initialStructure = {
    textBooks: [{ code: 'T1', title: '' }],
    referenceBooks: [{ code: 'R1', title: '' }],
    journals: [''],
    webResources: [''],
    onlineCourses: [{ platform: '', name: '' }], // Changed from moocCourses
    projects: [''],
    termWork: { enabled: false, activity: '' },
    gapIdentification: { enabled: false, entry: '' }
  };

  const [references, setReferences] = useState(initialStructure);

  useEffect(() => {
    const refs = data?.coursePlan?.references;
    if (refs) {
      setReferences({
        textBooks: refs.textBooks?.length
          ? refs.textBooks
          : [{ code: 'T1', title: '' }],
        referenceBooks: refs.referenceBooks?.length
          ? refs.referenceBooks
          : [{ code: 'R1', title: '' }],
        journals: refs.journals?.length ? refs.journals : [''],
        webResources: refs.webResources?.length ? refs.webResources : [''],
        onlineCourses: refs.onlineCourses?.length
          ? refs.onlineCourses
          : [{ platform: '', name: '' }],
        projects: refs.projects?.length ? refs.projects : [''],
        termWork: refs.termWork || initialStructure.termWork,
        gapIdentification:
          refs.gapIdentification || initialStructure.gapIdentification
      });
    }
  }, [data]);

  const updateField = (path, index, value, subField = null) => {
    const newData = JSON.parse(JSON.stringify(references));
    const keys = path.split('.');
    let target = newData;
    for (let i = 0; i < keys.length - 1; i++) target = target[keys[i]];
    const lastKey = keys[keys.length - 1];

    if (subField) {
      target[lastKey][index][subField] = value;
    } else if (index !== null) {
      if (typeof target[lastKey][index] === 'object') {
        target[lastKey][index].title = value;
      } else {
        target[lastKey][index] = value;
      }
    } else {
      target[lastKey] = value;
    }
    setReferences(newData);
  };

  const addField = (path) => {
    const newData = JSON.parse(JSON.stringify(references));
    const lastKey = path.split('.').pop();

    let newItem;
    if (lastKey === 'textBooks')
      newItem = { code: `T${newData.textBooks.length + 1}`, title: '' };
    else if (lastKey === 'referenceBooks')
      newItem = { code: `R${newData.referenceBooks.length + 1}`, title: '' };
    else if (lastKey === 'onlineCourses') newItem = { platform: '', name: '' };
    else newItem = '';

    newData[lastKey] = [...(newData[lastKey] || []), newItem];
    setReferences(newData);
  };

  const removeField = (path, index) => {
    const newData = JSON.parse(JSON.stringify(references));
    const target = newData[path];

    if (target && target.length > 1) {
      target.splice(index, 1);
      if (path === 'textBooks' || path === 'referenceBooks') {
        const prefix = path === 'textBooks' ? 'T' : 'R';
        target.forEach((book, i) => (book.code = `${prefix}${i + 1}`));
      }
    } else if (target) {
      if (path === 'textBooks') target[0] = { code: 'T1', title: '' };
      else if (path === 'referenceBooks') target[0] = { code: 'R1', title: '' };
      else if (path === 'onlineCourses') target[0] = { platform: '', name: '' };
      else target[0] = '';
    }
    setReferences(newData);
  };

  const handleSaveAndNext = async () => {
    setLoading(true);
    try {
      const payload = {
        subjectId: classroom?.subjectId?._id,
        sectionId: classroom?.sectionId?._id,
        academicYearId: classroom?.academicYearId?._id,
        references: {
          textBooks: references.textBooks.filter((b) => b.title.trim()),
          referenceBooks: references.referenceBooks.filter((b) =>
            b.title.trim()
          ),
          journals: references.journals.filter((i) => i.trim()),
          webResources: references.webResources.filter((i) => i.trim()),
          onlineCourses: references.onlineCourses.filter(
            (c) => c.platform.trim() || c.name.trim()
          ),
          projects: references.projects.filter((p) => p.trim()),
          termWork: references.termWork,
          gapIdentification: references.gapIdentification
        },
        status: data?.coursePlan?.status || 'Draft'
      };

      const res = await saveCoursePlan(payload);
      if (res.success) {
        await refreshData();
        onNext();
      }
    } catch (err) {
      console.error('Error saving references:', err);
    } finally {
      setLoading(false);
    }
  };

  const renderBookFields = (label, path, placeholder) => {
    const fieldData = references[path] || [];
    return (
      <div className="mb-4">
        <label className="text-sm font-medium mb-1 block text-gray-700 font-bold uppercase text-[11px] tracking-wider">
          {label}
        </label>
        {fieldData.map((val, idx) => (
          <div key={idx} className="flex items-center gap-2 mb-2">
            <div className="flex flex-1 items-center border border-gray-200 rounded-xl overflow-hidden bg-white shadow-xs">
              <span className="bg-[#f1f5f9] px-3 py-2 text-[10px] font-black border-r border-gray-200 text-gray-500 min-w-[45px] text-center">
                {val.code}
              </span>
              <input
                type="text"
                className="flex-1 px-3 py-2 text-sm outline-none"
                placeholder={placeholder}
                value={val.title}
                onChange={(e) => updateField(path, idx, e.target.value)}
              />
              <button
                onClick={() => removeField(path, idx)}
                className="px-2 text-gray-300 hover:text-red-500"
              >
                <X size={16} />
              </button>
            </div>
            {idx === fieldData.length - 1 && val.title?.trim() !== '' && (
              <button
                onClick={() => addField(path)}
                className="p-1.5 bg-[#08384f] text-white rounded-lg hover:bg-[#0c4a68] transition-all"
              >
                <Plus size={18} />
              </button>
            )}
          </div>
        ))}
      </div>
    );
  };

  const renderSimpleFields = (label, path, placeholder) => {
    const fieldData = references[path] || [];
    return (
      <div className="mb-4">
        <label className="text-sm font-medium mb-1 block text-gray-700 font-bold uppercase text-[11px] tracking-wider">
          {label}
        </label>
        {fieldData.map((val, idx) => (
          <div key={idx} className="flex items-center gap-2 mb-2">
            <div className="flex flex-1 items-center border border-gray-200 rounded-xl overflow-hidden bg-white shadow-xs">
              <input
                type="text"
                className="flex-1 px-4 py-2 text-sm outline-none"
                placeholder={placeholder}
                value={val}
                onChange={(e) => updateField(path, idx, e.target.value)}
              />
              <button
                onClick={() => removeField(path, idx)}
                className="px-2 text-gray-300 hover:text-red-500"
              >
                <X size={16} />
              </button>
            </div>
            {idx === fieldData.length - 1 && val?.trim() !== '' && (
              <button
                onClick={() => addField(path)}
                className="p-1.5 bg-[#08384f] text-white rounded-lg hover:bg-[#0c4a68] transition-all"
              >
                <Plus size={18} />
              </button>
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col bg-white">
      <div className="flex-1 overflow-auto pr-2 custom-scrollbar">
        {renderBookFields('Textbooks', 'textBooks', 'Enter Textbook Title')}
        {renderBookFields(
          'Reference Books',
          'referenceBooks',
          'Enter Reference Book Title'
        )}
        {renderSimpleFields('Journals', 'journals', 'Enter Journal Name')}
        {renderSimpleFields(
          'Web Resources',
          'webResources',
          'Enter Web URL or Resource Name'
        )}

        <div className="mb-4">
          <label className="text-sm font-medium mb-1 block text-gray-700 font-bold uppercase text-[11px] tracking-wider">
            Online Courses (MOOC/NPTEL)
          </label>
          {references.onlineCourses.map((course, idx) => (
            <div key={idx} className="flex items-center gap-2 mb-2">
              <div className="flex flex-1 gap-2 border border-gray-200 rounded-xl overflow-hidden p-1 shadow-xs bg-white">
                <input
                  className="w-1/3 px-3 py-1.5 text-sm outline-none border-r border-gray-100"
                  placeholder="Platform"
                  value={course.platform}
                  onChange={(e) =>
                    updateField(
                      'onlineCourses',
                      idx,
                      e.target.value,
                      'platform'
                    )
                  }
                />
                <input
                  className="flex-1 px-3 py-1.5 text-sm outline-none"
                  placeholder="Course Name"
                  value={course.name}
                  onChange={(e) =>
                    updateField('onlineCourses', idx, e.target.value, 'name')
                  }
                />
                <button
                  onClick={() => removeField('onlineCourses', idx)}
                  className="px-2 text-gray-300 hover:text-red-500"
                >
                  <X size={16} />
                </button>
              </div>
              {idx === references.onlineCourses.length - 1 &&
                course.platform?.trim() !== '' && (
                  <button
                    onClick={() => addField('onlineCourses')}
                    className="p-1.5 bg-[#08384f] text-white rounded-lg hover:bg-[#0c4a68] transition-all"
                  >
                    <Plus size={18} />
                  </button>
                )}
            </div>
          ))}
        </div>

        {renderSimpleFields(
          'List of Projects',
          'projects',
          'Enter Project Name'
        )}

        <div className="mb-6">
          <label className="text-sm font-medium block text-gray-700 mb-2 font-bold uppercase text-[11px] tracking-wider">
            Term Work (TW) Activities
          </label>
          <div className="flex gap-4 mb-3">
            {['Yes', 'No'].map((opt) => (
              <label
                key={opt}
                className="flex items-center gap-2 text-sm cursor-pointer"
              >
                <input
                  type="radio"
                  checked={
                    opt === 'Yes'
                      ? references.termWork.enabled
                      : !references.termWork.enabled
                  }
                  onChange={() =>
                    setReferences((prev) => ({
                      ...prev,
                      termWork: { ...prev.termWork, enabled: opt === 'Yes' }
                    }))
                  }
                />{' '}
                {opt}
              </label>
            ))}
          </div>
          {references.termWork.enabled && (
            <textarea
              className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm outline-none min-h-[80px]"
              placeholder="Describe activity..."
              value={references.termWork.activity}
              onChange={(e) =>
                updateField('termWork.activity', null, e.target.value)
              }
            />
          )}
        </div>

        <div className="mb-6">
          <label className="text-sm font-medium block text-gray-700 mb-2 font-bold uppercase text-[11px] tracking-wider">
            Gap Identification
          </label>
          <div className="flex gap-4 mb-3">
            {['Yes', 'No'].map((opt) => (
              <label
                key={opt}
                className="flex items-center gap-2 text-sm cursor-pointer"
              >
                <input
                  type="radio"
                  checked={
                    opt === 'Yes'
                      ? references.gapIdentification.enabled
                      : !references.gapIdentification.enabled
                  }
                  onChange={() =>
                    setReferences((prev) => ({
                      ...prev,
                      gapIdentification: {
                        ...prev.gapIdentification,
                        enabled: opt === 'Yes'
                      }
                    }))
                  }
                />{' '}
                {opt}
              </label>
            ))}
          </div>
          {references.gapIdentification.enabled && (
            <textarea
              className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm outline-none min-h-[80px]"
              placeholder="Describe gap..."
              value={references.gapIdentification.entry}
              onChange={(e) =>
                updateField('gapIdentification.entry', null, e.target.value)
              }
            />
          )}
        </div>
      </div>

      <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-100">
        <button
          onClick={onPrev}
          className="flex items-center gap-2 text-gray-500 font-bold text-sm px-6 py-2 rounded-xl hover:bg-gray-100 border border-gray-200"
        >
          <ChevronLeft size={18} /> Previous
        </button>
        <button
          onClick={handleSaveAndNext}
          disabled={loading}
          className="flex items-center gap-2 bg-[#08384f] text-white font-bold text-sm px-8 py-2.5 rounded-xl shadow-lg hover:bg-[#0c4a68] transition-all"
        >
          {loading ? (
            'Saving...'
          ) : (
            <>
              Next Step <ChevronRight size={18} />
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default ReferencePlan;
