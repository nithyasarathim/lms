import React, { useState, useEffect } from "react";
import {
  Users,
  UserMinus,
  Power,
  PencilLine,
  CheckCircle2,
  XCircle,
  MapPin,
} from "lucide-react";
import { getSections } from "../api/admin.api";

const SectionShimmer = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
    {Array.from({ length: 6 }).map((_, i) => (
      <div
        key={i}
        className="h-44 bg-gray-50 rounded-[2rem] animate-pulse border border-gray-100"
      />
    ))}
  </div>
);

const SectionList = ({ batchProgramId, onEdit, onToggleStatus }) => {
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSections = async () => {
      if (!batchProgramId) return;
      setLoading(true);
      try {
        const res = await getSections(batchProgramId);
        setSections(res?.success ? res.data.sections : []);
      } catch {
        setSections([]);
      } finally {
        setLoading(false);
      }
    };
    fetchSections();
  }, [batchProgramId]);

  if (loading) return <SectionShimmer />;

  if (sections.length === 0)
    return (
      <div className="flex flex-col items-center justify-center w-full py-20 space-y-4 text-center">
        <div className="w-20 h-20 rounded-[2.5rem] bg-gray-50 flex items-center justify-center border border-dashed border-gray-200">
          <Users size={32} className="text-gray-700" />
        </div>
        <h3 className="text-lg font-semibold text-[#08384F]">
          No Sections Found
        </h3>
      </div>
    );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full pb-8 font-['Poppins']">
      {sections.map((section) => {
        const isUnallocated = section.name?.toUpperCase() === "UNALLOCATED";
        const isActive = section.isActive;
        const fillPercentage = Math.min(
          (section.studentCount / section.capacity) * 100,
          100,
        );

        return (
          <div
            key={section._id}
            className={`group relative p-7 bg-white rounded-md border border-gray-400 transition-all duration-300 shadow-sm hover:shadow-md hover:-translate-y-1 ${
              !isActive && "opacity-75"
            }`}
          >
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-4">
                <div
                  className={`p-3.5 rounded-2xl shadow-sm ${
                    isUnallocated
                      ? "bg-slate-100 text-slate-600"
                      : "bg-[#08384F]/5 text-[#08384F]"
                  }`}
                >
                  {isUnallocated ? (
                    <UserMinus size={22} />
                  ) : (
                    <Users size={22} />
                  )}
                </div>
                <div>
                  <h4 className="font-semibold text-[#282526] text-[16px] leading-tight">
                    {isUnallocated
                      ? "Unallocated Pool"
                      : `Section ${section.name}`}
                  </h4>
                  <div className="flex items-center gap-1 mt-1">
                    <MapPin size={12} className="text-gray-700" />
                    <p className="text-[11px] font-medium text-gray-400 uppercase tracking-wider">
                      {section.venue || "No Venue"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex gap-1 bg-gray-50/50 p-1 rounded-xl">
                {!isUnallocated && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit(section);
                    }}
                    className="p-2 hover:bg-white hover:shadow-sm rounded-lg text-gray-400 hover:text-[#08384F] transition-all"
                  >
                    <PencilLine size={16} />
                  </button>
                )}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleStatus(section);
                  }}
                  className={`p-2 rounded-lg transition-all ${
                    isActive
                      ? "hover:bg-white hover:text-red-500 text-gray-400"
                      : "hover:bg-white hover:text-green-500 text-gray-400"
                  }`}
                >
                  <Power size={16} />
                </button>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-end">
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-gray-700 uppercase tracking-widest leading-none mb-1.5">
                    Student Load
                  </span>
                  <span className="text-sm font-semibold text-[#08384F]">
                    {section.studentCount}{" "}
                    <span className="text-gray-700 font-medium text-xs">
                      / {section.capacity}
                    </span>
                  </span>
                </div>
                {isActive ? (
                  <span className="flex items-center gap-1.5 text-[10px] font-bold text-green-600 bg-green-50/50 px-3 py-1.5 rounded-full uppercase tracking-tight">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                    Active
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5 text-[10px] font-bold text-red-500 bg-red-50/50 px-3 py-1.5 rounded-full uppercase tracking-tight">
                    <XCircle
                      size={10}
                      fill="currentColor"
                      className="text-white"
                    />
                    Inactive
                  </span>
                )}
              </div>

              <div className="h-1.5 w-full bg-gray-50 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ease-out ${
                    isUnallocated ? "bg-slate-300" : "bg-[#08384F]"
                  }`}
                  style={{ width: `${fillPercentage}%` }}
                />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default SectionList;
