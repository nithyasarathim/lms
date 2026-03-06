import React, { useState, useEffect } from "react";
import {
  Users,
  ChevronRight,
  UserMinus,
  Power,
  PencilLine,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { getSections } from "../api/admin.api";

const SectionShimmer = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 w-full">
    {Array.from({ length: 6 }).map((_, i) => (
      <div
        key={i}
        className="flex items-center justify-between p-6 bg-white border border-gray-100 rounded-2xl"
      >
        <div className="flex items-center gap-4 w-full">
          <div className="w-12 h-12 rounded-xl bg-gray-100 animate-pulse shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-3 w-3/4 bg-gray-100 animate-pulse rounded" />
            <div className="h-2 w-1/2 bg-gray-100 animate-pulse rounded" />
          </div>
        </div>
      </div>
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
        <div className="w-20 h-20 rounded-3xl bg-gray-50 flex items-center justify-center border border-dashed border-gray-200">
          <Users size={32} className="text-gray-300" />
        </div>
        <h3 className="text-lg font-semibold text-[#08384F]">
          No Sections Found
        </h3>
      </div>
    );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 w-full pb-4">
      {sections.map((section) => {
        const isUnallocated = section.name?.toUpperCase() === "UNALLOCATED";
        const isActive = section.isActive;

        return (
          <div
            key={section._id}
            className={`group relative flex items-center justify-between p-6 bg-white border rounded-2xl hover:shadow-lg transition-all duration-300 cursor-pointer overflow-hidden ${
              isActive
                ? "border-gray-200 hover:border-[#08384F]"
                : "border-red-100 bg-red-50/30"
            }`}
          >
            <div className="flex items-center gap-4">
              <div className="relative">
                <div
                  className={`p-3 rounded-xl text-white shadow-sm transition-all duration-300 group-hover:scale-105 ${
                    isUnallocated
                      ? "bg-slate-500"
                      : "bg-[#08384F]"
                  } ${!isActive && "grayscale opacity-80"}`}
                >
                  {isUnallocated ? (
                    <UserMinus size={20} />
                  ) : (
                    <Users size={20} />
                  )}
                </div>
                <div
                  className={`absolute -top-1 -right-1 rounded-full border-2 border-white ${isActive ? "text-green-500 bg-white" : "text-red-500 bg-white"}`}
                >
                  {isActive ? (
                    <CheckCircle2
                      size={14}
                      fill="currentColor"
                      className="text-white fill-green-500"
                    />
                  ) : (
                    <XCircle
                      size={14}
                      fill="currentColor"
                      className="text-white fill-red-500"
                    />
                  )}
                </div>
              </div>

              <div className="flex flex-col">
                <p
                  className={`font-semibold text-[15px] tracking-tight truncate max-w-[140px] ${isActive ? "text-[#08384F]" : "text-gray-400"}`}
                >
                  {isUnallocated
                    ? "Unallocated Pool"
                    : `Section ${section.name}`}
                </p>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-gray-500">
                    Cap: {section.capacity}
                  </span>
                  {!isActive && (
                    <span className="text-[10px] font-bold text-red-500 uppercase">
                      Inactive
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex opacity-0 group-hover:opacity-100 transition-all duration-200 gap-1 mr-1">
                {!isUnallocated && (
                  <>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onEdit(section);
                      }}
                      className="p-2 hover:bg-blue-50 text-blue-600 rounded-lg transition-colors"
                    >
                      <PencilLine size={16} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleStatus(section);
                      }}
                      className={`p-2 rounded-lg transition-colors ${isActive ? "hover:bg-red-50 text-red-500" : "hover:bg-green-50 text-green-600"}`}
                    >
                      <Power size={16} />
                    </button>
                  </>
                )}
              </div>
              <ChevronRight
                size={18}
                className="text-gray-300 group-hover:text-[#08384F] group-hover:translate-x-1 transition-all"
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default SectionList;
