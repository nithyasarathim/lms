import { Plus, X, ChevronLeft, ChevronRight } from "lucide-react";
import React, { useEffect, useState } from "react";

const ReferencePlan = ({
  data,
  refreshData,
  onNext,
  onPrev,
  classroom,
  saveCoursePlan,
}) => {
  const [loading, setLoading] = useState(false);
  const initialStructure = {
    textBooks: [""],
    referenceBooks: [""],
    journals: [""],
    webResources: [""],
    moocCourses: [{ platform: "", courseName: "" }],
    projects: [""],
    termWork: { enabled: false, activity: "" },
    gapIdentification: { enabled: false, entry: "" },
  };
  const [references, setReferences] = useState(initialStructure);

  useEffect(() => {
    const refs = data?.coursePlan?.references;
    if (refs) {
      setReferences({
        textBooks: refs.textBooks?.length ? refs.textBooks : [""],
        referenceBooks: refs.referenceBooks?.length
          ? refs.referenceBooks
          : [""],
        journals: refs.journals?.length ? refs.journals : [""],
        webResources: refs.webResources?.length ? refs.webResources : [""],
        moocCourses: refs.moocCourses?.length
          ? refs.moocCourses
          : [{ platform: "", courseName: "" }],
        projects: refs.projects?.length ? refs.projects : [""],
        termWork: refs.termWork || initialStructure.termWork,
        gapIdentification:
          refs.gapIdentification || initialStructure.gapIdentification,
      });
    }
  }, [data]);

  const updateField = (path, index, value, subField = null) => {
    const newData = JSON.parse(JSON.stringify(references));
    const keys = path.split(".");
    let target = newData;
    for (let i = 0; i < keys.length - 1; i++) target = target[keys[i]];
    const lastKey = keys[keys.length - 1];
    if (subField) target[lastKey][index][subField] = value;
    else if (index !== null) target[lastKey][index] = value;
    else target[lastKey] = value;
    setReferences(newData);
  };

  const addField = (path) => {
    const newData = JSON.parse(JSON.stringify(references));
    const keys = path.split(".");
    let target = newData;
    for (let i = 0; i < keys.length - 1; i++) target = target[keys[i]];
    const lastKey = keys[keys.length - 1];
    const newItem =
      lastKey === "moocCourses" ? { platform: "", courseName: "" } : "";
    target[lastKey] = [...(target[lastKey] || []), newItem];
    setReferences(newData);
  };

  const removeField = (path, index) => {
    const newData = JSON.parse(JSON.stringify(references));
    const keys = path.split(".");
    let target = newData;
    for (let i = 0; i < keys.length - 1; i++) target = target[keys[i]];
    const lastKey = keys[keys.length - 1];
    if (target[lastKey] && target[lastKey].length > 1)
      target[lastKey].splice(index, 1);
    else if (target[lastKey])
      target[lastKey][0] =
        lastKey === "moocCourses" ? { platform: "", courseName: "" } : "";
    setReferences(newData);
  };

  const toggleSection = (key, value) => {
    const newData = {
      ...references,
      [key]: { ...references[key], enabled: value },
    };
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
          textBooks: (references.textBooks || []).filter((i) => i.trim()),
          referenceBooks: (references.referenceBooks || []).filter((i) =>
            i.trim(),
          ),
          journals: (references.journals || []).filter((i) => i.trim()),
          webResources: (references.webResources || []).filter((i) => i.trim()),
          moocCourses: (references.moocCourses || []).filter(
            (i) => i.platform.trim() || i.courseName.trim(),
          ),
          projects: (references.projects || []).filter((i) => i.trim()),
          termWork: references.termWork,
          gapIdentification: references.gapIdentification,
        },
        status: data?.coursePlan?.status || "Draft",
      };
      const res = await saveCoursePlan(payload);
      if (res.success) {
        await refreshData();
        onNext();
      }
    } catch (err) {
      console.error("Error saving references:", err);
    } finally {
      setLoading(false);
    }
  };

  const renderSimpleFields = (label, path, placeholder, prefix) => {
    const fieldData = references[path] || [];
    return (
      <div className="mb-4">
        <label className="text-sm font-medium mb-1 block text-gray-700 font-bold uppercase text-[11px] tracking-wider">
          {label}
        </label>
        {fieldData.map((val, idx) => (
          <div key={idx} className="flex items-center gap-2 mb-2">
            <div className="flex flex-1 items-center border border-gray-200 rounded-xl overflow-hidden bg-white shadow-xs">
              {prefix && (
                <span className="bg-[#f1f5f9] px-3 py-2 text-[10px] font-black border-r border-gray-200 text-gray-500 min-w-[45px] text-center uppercase tracking-tighter">
                  {prefix}
                  {idx + 1}
                </span>
              )}
              <input
                type="text"
                className="flex-1 px-3 py-2 text-sm outline-none"
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
            {idx === fieldData.length - 1 && val?.trim() !== "" && (
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
        {renderSimpleFields(
          "TextBook",
          "textBooks",
          "Enter TextBook Name",
          "T",
        )}
        {renderSimpleFields(
          "ReferenceBook",
          "referenceBooks",
          "Enter ReferenceBook Name",
          "R",
        )}
        {renderSimpleFields("Journals", "journals", "Enter Journals Name")}
        {renderSimpleFields(
          "Web Resources",
          "webResources",
          "Enter Web Resources Name",
        )}
        <div className="mb-4">
          <label className="text-sm font-medium mb-1 block text-gray-700 font-bold uppercase text-[11px] tracking-wider">
            MOOC/NPTEL/SWAYAM Courses
          </label>
          {(references.moocCourses || []).map((course, idx) => (
            <div key={idx} className="flex items-center gap-2 mb-2">
              <div className="flex flex-1 gap-2 border border-gray-200 rounded-xl overflow-hidden p-1 shadow-xs bg-white">
                <input
                  className="w-1/3 px-3 py-1.5 text-sm outline-none border-r border-gray-100"
                  placeholder="Platform"
                  value={course.platform}
                  onChange={(e) =>
                    updateField("moocCourses", idx, e.target.value, "platform")
                  }
                />
                <input
                  className="flex-1 px-3 py-1.5 text-sm outline-none"
                  placeholder="Course Name"
                  value={course.courseName}
                  onChange={(e) =>
                    updateField(
                      "moocCourses",
                      idx,
                      e.target.value,
                      "courseName",
                    )
                  }
                />
                <button
                  onClick={() => removeField("moocCourses", idx)}
                  className="px-2 text-gray-300 hover:text-red-500"
                >
                  <X size={16} />
                </button>
              </div>
              {idx === (references.moocCourses || []).length - 1 &&
                course.platform?.trim() !== "" &&
                course.courseName?.trim() !== "" && (
                  <button
                    onClick={() => addField("moocCourses")}
                    className="p-1.5 bg-[#08384f] text-white rounded-lg hover:bg-[#0c4a68] transition-all"
                  >
                    <Plus size={18} />
                  </button>
                )}
            </div>
          ))}
        </div>
        {renderSimpleFields(
          "List of Projects",
          "projects",
          "Enter Project Name",
        )}
        <div className="mb-6">
          <label className="text-sm font-medium block text-gray-700 mb-2 font-bold uppercase text-[11px] tracking-wider">
            Term Work (TW) Activities
          </label>
          <div className="flex gap-4 mb-3">
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="radio"
                name="termWorkEnabled"
                checked={references.termWork?.enabled || false}
                onChange={() => toggleSection("termWork", true)}
              />{" "}
              Yes
            </label>
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="radio"
                name="termWorkEnabled"
                checked={!references.termWork?.enabled}
                onChange={() => toggleSection("termWork", false)}
              />{" "}
              No
            </label>
          </div>
          {references.termWork?.enabled && (
            <textarea
              className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm outline-none min-h-[100px] resize-y"
              placeholder="Describe the Term Work activity..."
              value={references.termWork?.activity || ""}
              onChange={(e) =>
                updateField("termWork.activity", null, e.target.value)
              }
            />
          )}
        </div>
        <div className="mb-6">
          <label className="text-sm font-medium block text-gray-700 mb-2 font-bold uppercase text-[11px] tracking-wider">
            Gap Identification
          </label>
          <div className="flex gap-4 mb-3">
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="radio"
                name="gapIdentificationEnabled"
                checked={references.gapIdentification?.enabled || false}
                onChange={() => toggleSection("gapIdentification", true)}
              />{" "}
              Yes
            </label>
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="radio"
                name="gapIdentificationEnabled"
                checked={!references.gapIdentification?.enabled}
                onChange={() => toggleSection("gapIdentification", false)}
              />{" "}
              No
            </label>
          </div>
          {references.gapIdentification?.enabled && (
            <textarea
              className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm outline-none min-h-[100px] resize-y"
              placeholder="Describe the identified gap..."
              value={references.gapIdentification?.entry || ""}
              onChange={(e) =>
                updateField("gapIdentification.entry", null, e.target.value)
              }
            />
          )}
        </div>
      </div>
      <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-100 bg-white">
        <button
          onClick={onPrev}
          className="flex items-center gap-2 text-gray-500 font-bold text-sm px-6 py-2 rounded-xl hover:bg-gray-100 transition-all border border-gray-200"
        >
          <ChevronLeft size={18} /> Previous
        </button>
        <button
          onClick={handleSaveAndNext}
          disabled={loading}
          className="flex items-center gap-2 bg-[#08384f] text-white font-bold text-sm px-8 py-2.5 rounded-xl shadow-lg hover:bg-[#0c4a68] active:scale-95 disabled:opacity-50 transition-all"
        >
          {loading ? (
            "Saving..."
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
