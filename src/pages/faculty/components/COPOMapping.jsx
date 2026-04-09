import React, { useState, useEffect } from "react";
import { BookOpen, ChevronLeft, ChevronRight } from "lucide-react";

const PO_LIST = [
  "PO1",
  "PO2",
  "PO3",
  "PO4",
  "PO5",
  "PO6",
  "PO7",
  "PO8",
  "PO9",
  "PO10",
  "PO11",
  "PSO1",
  "PSO2",
  "PSO3",
];

const COPOMapping = ({
  data,
  refreshData,
  onNext,
  onPrev,
  classroom,
  saveCoursePlan,
}) => {
  const [selectedTab, setSelectedTab] = useState("CO1");
  const [loading, setLoading] = useState(false);
  const [coPoMapping, setCoPoMapping] = useState([]);

  useEffect(() => {
    if (data?.coursePlan?.coPoMapping) {
      setCoPoMapping(data.coursePlan.coPoMapping);
    }
  }, [data]);

  const currentMapping = coPoMapping.find((m) => m.coId === selectedTab) || {
    coId: selectedTab,
    mappings: {},
  };

  const updateMapping = (item, field, value) => {
    const updatedMapping = [...coPoMapping];
    const index = updatedMapping.findIndex((m) => m.coId === selectedTab);
    const newEntry = {
      justification:
        field === "justification"
          ? value
          : currentMapping.mappings[item]?.justification || "",
      credit:
        field === "credit"
          ? Number(value)
          : currentMapping.mappings[item]?.credit || 0,
    };
    if (index > -1) {
      updatedMapping[index] = {
        ...updatedMapping[index],
        mappings: { ...updatedMapping[index].mappings, [item]: newEntry },
      };
    } else {
      updatedMapping.push({
        coId: selectedTab,
        mappings: { [item]: newEntry },
      });
    }
    setCoPoMapping(updatedMapping);
  };

  const handleSaveAndNext = async () => {
    setLoading(true);
    try {
      const payload = {
        subjectId: classroom?.subjectId?._id,
        sectionId: classroom?.sectionId?._id,
        academicYearId: classroom?.academicYearId?._id,
        coPoMapping: coPoMapping,
        status: data?.coursePlan?.status || "Draft",
      };
      const res = await saveCoursePlan(payload);
      if (res.success) {
        if (refreshData) await refreshData();
        if (onNext) onNext();
      }
    } catch (err) {
      console.error("Error updating CO-PO mapping:", err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col bg-white">
      <div className="flex-1 overflow-auto pr-2 custom-scrollbar">
        <div className="flex items-center gap-4 sticky top-0 bg-white z-10 mb-4 pb-2 ">
          {["CO1", "CO2", "CO3", "CO4", "CO5"].map((label) => (
            <button
              key={label}
              onClick={() => setSelectedTab(label)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm transition-all ${
                selectedTab === label
                  ? "bg-[#08384f] text-white shadow-lg scale-105"
                  : "bg-gray-100 text-gray-500 hover:bg-gray-200"
              }`}
            >
              <BookOpen size={16} />
              {label}
            </button>
          ))}
        </div>
        <div className="space-y-3 pb-4">
          {PO_LIST.map((item) => {
            const mappingEntry = currentMapping.mappings[item] || {
              justification: "",
              credit: 0,
            };
            const isMapped = mappingEntry.credit > 0;
            return (
              <div
                key={item}
                className={`flex items-center border rounded-xl overflow-hidden transition-all ${isMapped ? "border-blue-200 bg-blue-50/20" : "border-gray-100 bg-gray-50/50"}`}
              >
                <div className="w-16 h-12 flex items-center justify-center bg-[#f1f5f9] text-[#08384f] font-bold text-xs border-r border-gray-200">
                  {item}
                </div>
                <div className="flex-1 h-12 flex items-center px-4 bg-white">
                  <input
                    type="text"
                    placeholder={`Justification for ${item}...`}
                    value={mappingEntry.justification}
                    onChange={(e) =>
                      updateMapping(item, "justification", e.target.value)
                    }
                    className="w-full outline-none text-sm text-gray-700 bg-transparent placeholder:text-gray-300"
                  />
                </div>
                <div className="flex items-center gap-3 px-4 h-12 bg-white border-l border-gray-100">
                  <span className="text-[10px] uppercase font-black text-gray-400 tracking-widest">
                    Level
                  </span>
                  <select
                    value={mappingEntry.credit}
                    onChange={(e) =>
                      updateMapping(item, "credit", e.target.value)
                    }
                    className={`w-14 h-8 px-1 border rounded-lg text-sm font-bold outline-none cursor-pointer transition-colors ${isMapped ? "border-[#08384f] text-[#08384f]" : "border-gray-200 text-gray-400"}`}
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

export default COPOMapping;
