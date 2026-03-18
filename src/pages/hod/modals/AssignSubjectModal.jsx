import React, { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { getSubjectsForTimeTable } from "../api/hod.api";
import { Loader2, Search, X, Check } from "lucide-react";

const AssignSubjectModal = ({
  faList,
  additionalHours,
  onClose,
  onAssign,
  academicYearId,
  sectionId,
  semesterNumber,
}) => {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState("");

  const { isLoading } = useQuery({
    queryKey: [
      "subjectsForTimeTable",
      academicYearId,
      sectionId,
      semesterNumber,
    ],
    queryFn: async () => {
      const res = await getSubjectsForTimeTable(
        academicYearId,
        sectionId,
        semesterNumber,
      );
      return res.data || res;
    },
    enabled: !!academicYearId && !!sectionId && !!semesterNumber,
  });

  const academicOptions = useMemo(() => {
    return faList.map((fa) => ({
      value: fa._id,
      label: `${fa.subjectComponentId?.subjectId?.code || "N/A"} - ${
        fa.subjectComponentId?.name || "Unknown"
      } (${fa.subjectComponentId?.shortName || ""})`,
      group: "Academic Components",
    }));
  }, [faList]);

  const additionalOptions = useMemo(() => {
    return additionalHours.map((ah, idx) => ({
      value: `ADDITIONAL|${ah._id || ah.shortName}`,
      label: `${ah.name} (${ah.shortName})`,
      group: "Additional Hours",
    }));
  }, [additionalHours]);

  const options = [...academicOptions, ...additionalOptions];

  const filtered = options.filter((opt) =>
    opt.label.toLowerCase().includes(search.toLowerCase()),
  );

  const grouped = filtered.reduce((acc, item) => {
    if (!acc[item.group]) acc[item.group] = [];
    acc[item.group].push(item);
    return acc;
  }, {});

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selected) return;
    onAssign(selected);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white w-fit min-w-md min-h-[30%] rounded-2xl shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h3 className="text-sm font-black text-[#08384F]">Assign Subject</h3>
          <button
            onClick={onClose}
            className="p-1 rounded-md hover:bg-gray-100"
          >
            <X size={16} />
          </button>
        </div>

        {isLoading ? (
          <div className="flex justify-center p-10">
            <Loader2 className="animate-spin text-[#08384F]" />
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div className="relative">
              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                placeholder="Search subject..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold outline-none"
              />
            </div>

            <div className="max-h-56 overflow-y-auto border border-slate-200 rounded-xl divide-y">
              {Object.keys(grouped).map((group) => (
                <div key={group}>
                  <div className="px-3 py-2 text-[10px] font-bold text-slate-400 uppercase bg-slate-50">
                    {group}
                  </div>

                  {grouped[group].map((opt) => (
                    <button
                      type="button"
                      key={opt.value}
                      onClick={() => setSelected(opt.value)}
                      className={`w-full flex items-center justify-between px-3 py-2 text-xs font-semibold hover:bg-slate-50 ${
                        selected === opt.value
                          ? "bg-[#08384F]/5 text-[#08384F]"
                          : "text-slate-600"
                      }`}
                    >
                      {opt.label}
                      {selected === opt.value && (
                        <Check size={14} className="text-[#08384F]" />
                      )}
                    </button>
                  ))}
                </div>
              ))}

              {filtered.length === 0 && (
                <div className="p-4 text-xs text-slate-400 text-center">
                  No results
                </div>
              )}
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2 text-xs font-bold text-slate-400"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={!selected}
                className="flex-1 py-2 bg-[#08384F] text-white rounded-lg text-xs font-black shadow-lg disabled:opacity-40"
              >
                Assign
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default AssignSubjectModal;
