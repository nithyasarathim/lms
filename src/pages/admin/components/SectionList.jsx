import React, { useState, useEffect } from "react";
import { Loader2, Users, ChevronRight } from "lucide-react";
import { getSections } from "../api/admin.api";

const SectionList = ({ batchProgramId }) => {
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSections = async () => {
      if (!batchProgramId) return;
      setLoading(true);
      try {
        const res = await getSections(batchProgramId);
        if (res?.success && res?.data?.sections) {
          setSections(res.data.sections);
        } else {
          setSections([]);
        }
      } catch (err) {
        setSections([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSections();
  }, [batchProgramId]);

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="animate-spin text-[#08384F]" size={32} />
      </div>
    );
  }

  if (sections.length === 0) {
    return (
      <div className="space-y-4 py-12 text-center">
        <div className="bg-gray-50 w-16 h-16 rounded-3xl flex items-center justify-center mx-auto mb-4">
          <Users size={32} className="text-gray-300" />
        </div>
        <h3 className="text-lg font-bold text-[#08384F]">No Sections Found</h3>
        <p className="text-sm text-gray-400 max-w-[250px] mx-auto">
          This batch program doesn't have any sections assigned yet.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="flex items-center gap-3 mb-6">
        <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.1em]">
          Allocated Sections ({sections.length})
        </h3>
        <div className="h-[1px] flex-1 bg-gray-100"></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {sections.map((section) => (
          <div
            key={section._id}
            className="group flex items-center justify-between p-4 border border-gray-100 rounded-2xl hover:border-blue-100 hover:shadow-sm hover:shadow-blue-500/5 transition-all cursor-pointer bg-white text-left"
          >
            <div className="flex items-center gap-4">
              <div
                className={`h-11 w-11 rounded-xl flex items-center justify-center font-bold text-sm transition-colors ${
                  section.name === "UNALLOCATED"
                    ? "bg-amber-50 text-amber-600 group-hover:bg-amber-100"
                    : "bg-blue-50 text-blue-600 group-hover:bg-blue-100"
                }`}
              >
                {section.name.charAt(0)}
              </div>
              <div>
                <h4 className="font-bold text-[#08384F] text-[14px] mb-0.5">
                  Section {section.name}
                </h4>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                    Capacity: {section.capacity}
                  </span>
                  <span className="h-1 w-1 rounded-full bg-gray-200"></span>
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider ${section.isActive ? "text-emerald-500" : "text-gray-400"}`}
                  >
                    {section.isActive ? "Active" : "Inactive"}
                  </span>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 p-1.5 rounded-lg group-hover:bg-blue-50 transition-colors">
              <ChevronRight
                size={16}
                className="text-gray-400 group-hover:text-blue-500 transition-colors"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SectionList;
