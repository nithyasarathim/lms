import React from "react";
import { Loader2, AlertCircle, Save } from "lucide-react";

const TimeTableHeader = ({
  activeYear,
  academicStructure,
  structLoading,
  selectedStructureIndex,
  onStructureChange,
  deps,
  depsLoading,
  selectedSection,
  onSectionChange,
  onSave,
  isSaving,
  isConfigMode,
  onToggleConfigMode,
  activeTab,
  onTabChange,
}) => {
  return (
    <div className="flex flex-col md:flex-row items-center justify-between px-8 py-3 bg-white border-b border-slate-100 gap-4 shrink-0">
      <div className="flex items-center gap-6">
        <div className="flex flex-col border-r border-slate-200 pr-6">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
            Academic Year
          </span>
          <span className="text-sm font-bold text-[#08384F]">
            {activeYear?.name || "..."}
          </span>
        </div>
        <div className="flex gap-3">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-slate-400 uppercase ml-1">
              Semester
            </span>
            {structLoading ? (
              <div className="h-[38px] w-40 bg-slate-50 border border-slate-200 animate-pulse rounded-lg" />
            ) : academicStructure.length > 0 ? (
              <select
                value={selectedStructureIndex}
                onChange={(e) => onStructureChange(Number(e.target.value))}
                className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-sm font-bold text-[#08384F] outline-none h-[38px] cursor-pointer"
              >
                {academicStructure.map((item, idx) => (
                  <option key={idx} value={idx}>
                    Sem {item.semester} ({item.batch?.name})
                  </option>
                ))}
              </select>
            ) : (
              <div className="flex items-center gap-2 bg-orange-50 border border-orange-100 rounded-lg px-3 py-1.5 h-[38px]">
                <AlertCircle size={14} className="text-orange-400" />
                <span className="text-xs text-orange-600 font-bold">
                  No semesters
                </span>
              </div>
            )}
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-slate-400 uppercase ml-1">
              Section
            </span>
            {depsLoading ? (
              <div className="h-[38px] w-32 bg-slate-50 border border-slate-200 animate-pulse rounded-lg" />
            ) : academicStructure.length > 0 ? (
              deps.sections.length > 0 ? (
                <select
                  value={selectedSection?._id || ""}
                  onChange={(e) => onSectionChange(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-sm font-bold text-[#08384F] outline-none h-[38px] cursor-pointer"
                >
                  {deps.sections.map((sec) => (
                    <option key={sec._id} value={sec._id}>
                      Section {sec.name}
                    </option>
                  ))}
                </select>
              ) : (
                <div className="flex items-center gap-2 bg-red-50 border border-red-100 rounded-lg px-3 py-1.5 h-[38px]">
                  <AlertCircle size={14} className="text-red-400" />
                  <span className="text-xs text-red-600 font-bold">
                    No sections
                  </span>
                </div>
              )
            ) : null}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <button
          onClick={onSave}
          disabled={isSaving || !selectedSection}
          className="flex items-center gap-2 px-5 py-2 bg-[#08384F] text-white rounded-xl text-[11px] font-black uppercase tracking-widest shadow-lg active:scale-95 transition-all disabled:opacity-50 hover:bg-[#0B56A4]"
        >
          {isSaving ? (
            <Loader2 size={14} className="animate-spin" />
          ) : (
            <Save size={14} />
          )}
          Save Configuration
        </button>
        <button
          onClick={onToggleConfigMode}
          className={`px-4 py-2 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all border ${isConfigMode ? "bg-emerald-600 text-white shadow-lg border-emerald-600" : "text-slate-400 hover:text-[#08384F]"}`}
        >
          {isConfigMode ? "Finish Timeline" : "Edit Timeline"}
        </button>
        <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
          <button
            onClick={() => onTabChange("timetable")}
            className={`px-6 py-2 rounded-lg text-[11px] font-black uppercase tracking-widest transition-all ${activeTab === "timetable" ? "bg-white text-[#08384F] shadow-sm" : "text-slate-400"}`}
          >
            Timetable
          </button>
          <button
            onClick={() => onTabChange("faculty")}
            className={`px-6 py-2 rounded-lg text-[11px] font-black uppercase tracking-widest transition-all ${activeTab === "faculty" ? "bg-white text-[#08384F] shadow-sm" : "text-slate-400"}`}
          >
            Course Matrix
          </button>
        </div>
      </div>
    </div>
  );
};

export default TimeTableHeader;