import React, { useState, useEffect, useRef } from "react";
import {
  ChevronRight,
  Search,
  BookOpen,
  Loader2,
  CheckCircle2,
  User,
  ChevronDown,
  Check,
} from "lucide-react";
import HeaderComponent from "../../shared/components/HeaderComponent";
import {
  getDeptAcademicStructure,
  getSectionsByBatchProgramId,
  assignFacultyToSection,
  getSubjectsBySemester,
  getAllFaculties,
} from "../api/hod.api";
import toast from "react-hot-toast";

const Shimmer = ({ className }) => (
  <div className={`animate-pulse bg-gray-200 rounded-lg ${className}`} />
);

const SearchableDropdown = ({
  options,
  value,
  onChange,
  placeholder,
  loading,
}) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const ref = useRef(null);

  const selected = options.find((o) => o._id === value);

  const filtered = options.filter(
    (o) =>
      o.fullName?.toLowerCase().includes(query.toLowerCase()) ||
      o.employeeId?.toLowerCase().includes(query.toLowerCase()) ||
      o.departmentId?.code?.toLowerCase().includes(query.toLowerCase()),
  );

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  if (loading) return <Shimmer className="h-10 w-full max-w-sm rounded-xl" />;

  return (
    <div className="relative w-full max-w-sm" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={`w-full flex items-center justify-between px-4 py-2.5 bg-white border rounded-xl text-sm transition-all ${
          open
            ? "border-[#08384F] ring-2 ring-[#08384F]/10"
            : "border-gray-200 hover:border-gray-300"
        }`}
      >
        <div className="flex items-center gap-2 truncate">
          <User size={14} className="text-gray-400 shrink-0" />
          <span
            className={`truncate ${
              selected ? "text-gray-900 font-medium" : "text-gray-400"
            }`}
          >
            {selected
              ? `${selected.fullName} (${selected.employeeId})`
              : placeholder}
          </span>
        </div>
        <ChevronDown
          size={16}
          className={`text-gray-400 transition-transform ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {open && (
        <div className="absolute z-50 mt-2 w-full bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
          <div className="p-2 border-b border-gray-100">
            <div className="relative">
              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search faculty..."
                className="w-full pl-8 pr-3 py-2 border border-gray-200 rounded-lg text-xs outline-none focus:ring-2 focus:ring-[#08384F]/10"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          </div>

          <div className="max-h-60 overflow-y-auto">
            {filtered.length > 0 ? (
              filtered.map((opt) => (
                <div
                  key={opt._id}
                  onClick={() => {
                    onChange(opt._id);
                    setOpen(false);
                    setQuery("");
                  }}
                  className={`flex items-center justify-between px-4 py-2.5 text-sm cursor-pointer transition-colors ${
                    value === opt._id
                      ? "bg-blue-50 text-[#08384F]"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <div className="flex flex-col">
                    <span className="font-semibold">{opt.fullName}</span>
                    <span className="text-[10px] text-gray-500 uppercase">
                      {opt.employeeId} • {opt.departmentId?.code}
                    </span>
                  </div>
                  {value === opt._id && (
                    <Check size={14} className="text-[#08384F]" />
                  )}
                </div>
              ))
            ) : (
              <div className="px-4 py-8 text-center text-gray-400 text-xs">
                No faculty found
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const StaffAllocation = ({ collapsed }) => {
  const [academicStructure, setAcademicStructure] = useState(() => {
    const cached = sessionStorage.getItem("cache_staff_academicStructure");
    return cached ? JSON.parse(cached) : [];
  });
  const [selectedStructureIndex, setSelectedStructureIndex] = useState(0);
  const [sections, setSections] = useState([]);
  const [selectedSection, setSelectedSection] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [faculties, setFaculties] = useState(() => {
    const cached = sessionStorage.getItem("cache_staff_faculties");
    return cached ? JSON.parse(cached) : [];
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(!academicStructure.length);
  const [sectionLoading, setSectionLoading] = useState(false);
  const [subjectLoading, setSubjectLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [allocationMap, setAllocationMap] = useState({});

  useEffect(() => {
    const initData = async () => {
      if (!academicStructure.length) setLoading(true);
      try {
        const [structRes, facultyRes] = await Promise.all([
          getDeptAcademicStructure(),
          getAllFaculties(),
        ]);

        if (structRes?.data?.success) {
          const struct =
            structRes.data.academicStructure ||
            structRes.data.data.academicStructure ||
            [];
          setAcademicStructure(struct);
          sessionStorage.setItem(
            "cache_staff_academicStructure",
            JSON.stringify(struct),
          );
        }

        if (facultyRes?.success) {
          const list = facultyRes.data.facultyList || [];
          setFaculties(list);
          sessionStorage.setItem("cache_staff_faculties", JSON.stringify(list));
        }
      } catch {
        toast.error("Failed to load initial data");
      } finally {
        setLoading(false);
      }
    };

    initData();
  }, []);

  useEffect(() => {
    const fetchDependencies = async () => {
      const current = academicStructure[selectedStructureIndex];
      if (!current) return;

      const sectionCacheKey = `sections_${current.batchProgramId}`;
      const subjectCacheKey = `subjects_${current.batchProgramId}_${current.semester}`;

      const cachedSections = sessionStorage.getItem(sectionCacheKey);
      const cachedSubjects = sessionStorage.getItem(subjectCacheKey);

      if (cachedSections && cachedSubjects) {
        const parsedSections = JSON.parse(cachedSections);
        setSections(parsedSections);
        setSelectedSection(parsedSections[0] || null);
        setSubjects(JSON.parse(cachedSubjects));
      } else {
        setSectionLoading(true);
        setSubjectLoading(true);
      }

      setAllocationMap({});

      try {
        const [sectionRes, subjectData] = await Promise.all([
          getSectionsByBatchProgramId(current.batchProgramId),
          getSubjectsBySemester(current.batchProgramId, current.semester),
        ]);

        if (sectionRes?.success) {
          const fetchedSections = sectionRes.data.sections || [];
          const filteredSections = fetchedSections.filter(
            (sec) => sec.name !== "UNALLOCATED",
          );
          setSections(filteredSections);
          setSelectedSection(filteredSections[0] || null);
          sessionStorage.setItem(
            sectionCacheKey,
            JSON.stringify(filteredSections),
          );
        }

        if (subjectData) {
          setSubjects(subjectData);
          sessionStorage.setItem(subjectCacheKey, JSON.stringify(subjectData));
        }
      } catch {
        toast.error("Error fetching data");
      } finally {
        setSectionLoading(false);
        setSubjectLoading(false);
      }
    };

    fetchDependencies();
  }, [selectedStructureIndex, academicStructure]);

  const handleFacultyChange = (subjectId, facultyId) => {
    setAllocationMap((prev) => ({
      ...prev,
      [subjectId]: facultyId,
    }));
  };

  const filteredSubjects = (subjects || []).filter(
    (sub) =>
      sub?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sub?.code?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const handleSaveAllocation = async () => {
    if (!selectedSection) return toast.error("Select a section first");

    const entries = Object.entries(allocationMap || {});
    const assignedData = entries
      .filter(([_, facultyId]) => facultyId && facultyId !== "")
      .map(([subjectId, facultyId]) => ({
        subjectId,
        facultyId,
        sectionId: selectedSection._id,
      }));

    if (assignedData.length === 0)
      return toast.error("Assign at least one faculty");

    setIsSaving(true);

    try {
      await assignFacultyToSection(assignedData);
      toast.success("Staff allocated successfully");
    } catch (err) {
      toast.error(err.message || "Allocation failed");
    } finally {
      setIsSaving(false);
    }
  };

  const currentLevel = academicStructure[selectedStructureIndex];

  return (
    <div
      className={`transition-all duration-300 min-h-screen bg-gray-50 ${
        collapsed ? "pl-[80px]" : "pl-[300px]"
      }`}
    >
      <HeaderComponent title="Staff Allocation" />

      <div className="px-6 py-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            {loading && !academicStructure.length ? (
              <>
                <Shimmer className="w-32 h-8 rounded-full" />
                <Shimmer className="w-32 h-8 rounded-full" />
                <Shimmer className="w-32 h-8 rounded-full" />
              </>
            ) : (
              <>
                <span className="bg-blue-50 text-[#08384F] border border-blue-100 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider">
                  Dept: <span className="p-1 ">{currentLevel?.department?.name || "N/A"}</span>
                </span>
                <span className="bg-blue-50 text-[#08384F] border border-blue-100 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider">
                  Batch: {currentLevel?.batch?.name}
                </span>
                <span className="bg-blue-50 text-[#08384F] border border-blue-100 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider">
                  Regulation: {currentLevel?.regulation?.name}
                </span>
              </>
            )}
          </div>

          <button
            onClick={handleSaveAllocation}
            disabled={isSaving || loading}
            className="flex items-center gap-2 bg-[#08384F] text-white px-8 py-2.5 rounded-xl text-sm font-semibold disabled:opacity-50 active:scale-95 transition-all shadow-md shadow-[#08384F]/20"
          >
            {isSaving ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <CheckCircle2 size={18} />
            )}
            Confirm Allocation
          </button>
        </div>

        <div className="grid grid-cols-12 gap-5 h-[calc(100vh-200px)]">
          <div className="col-span-3 border border-gray-200 bg-white rounded-3xl p-5 flex flex-col gap-3 overflow-y-auto shadow-sm">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] px-2 mb-2">
              Academic Year
            </p>

            {loading && !academicStructure.length
              ? [1, 2, 3, 4].map((i) => (
                  <Shimmer key={i} className="h-16 w-full rounded-2xl" />
                ))
              : academicStructure.map((item, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedStructureIndex(index)}
                    className={`flex items-center justify-between px-5 py-4 rounded-2xl text-[15px] font-bold transition-all border ${
                      selectedStructureIndex === index
                        ? "bg-[#08384F] text-white border-[#08384F] shadow-lg shadow-[#08384F]/20 scale-[1.02]"
                        : "bg-white border-gray-100 text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    <div className="text-left">
                      <p className="text-[10px] opacity-70 mb-1 uppercase font-bold tracking-wider">
                        Year {item.year}
                      </p>
                      <p>Semester {item.semester}</p>
                    </div>
                    <ChevronRight
                      size={18}
                      className={
                        selectedStructureIndex === index
                          ? "opacity-100"
                          : "opacity-30"
                      }
                    />
                  </button>
                ))}
          </div>

          <div className="col-span-3 border border-gray-200 bg-white rounded-3xl p-5 flex flex-col gap-3 overflow-y-auto shadow-sm">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] px-2 mb-2">
              Select Section
            </p>

            {sectionLoading && !sections.length
              ? [1, 2, 3].map((i) => (
                  <Shimmer key={i} className="h-14 w-full rounded-2xl" />
                ))
              : sections.map((sec) => (
                  <button
                    key={sec._id}
                    onClick={() => setSelectedSection(sec)}
                    className={`flex items-center justify-between px-5 py-4 rounded-2xl text-[15px] font-bold transition-all border ${
                      selectedSection?._id === sec._id
                        ? "bg-[#08384F] text-white border-[#08384F] shadow-lg shadow-[#08384F]/20 scale-[1.02]"
                        : "bg-white border-gray-100 text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    Section {sec.name}
                    <span
                      className={`text-[10px] px-2.5 py-1 rounded-full border ${
                        selectedSection?._id === sec._id
                          ? "bg-white/20 border-white/30 text-white"
                          : "bg-gray-100 border-gray-200 text-[#08384F]"
                      }`}
                    >
                      {sec.studentCount}
                    </span>
                  </button>
                ))}
          </div>

          <div className="col-span-6 border border-gray-200 bg-white rounded-3xl p-6 flex flex-col overflow-hidden shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-[#08384F] flex items-center gap-2">
                <BookOpen size={20} /> Subject Allocation
              </h3>

              <div className="relative w-1/2">
                <Search
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                  size={16}
                />
                <input
                  type="text"
                  placeholder="Search subject..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-11 pr-4 py-2.5 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-medium outline-none focus:bg-white focus:border-[#08384F] transition-all"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scroll">
              {subjectLoading && !subjects.length ? (
                [1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="p-5 border border-gray-50 rounded-3xl flex items-center gap-6 bg-gray-50/30"
                  >
                    <div className="space-y-2 flex-1">
                      <Shimmer className="h-3 w-20" />
                      <Shimmer className="h-5 w-48" />
                    </div>
                    <Shimmer className="h-10 w-64 rounded-xl" />
                  </div>
                ))
              ) : filteredSubjects.length > 0 ? (
                filteredSubjects.map((sub) => (
                  <div
                    key={sub._id}
                    className="p-5 border border-gray-100 rounded-3xl flex items-center justify-between gap-6 hover:bg-gray-50 transition-colors group"
                  >
                    <div className="flex flex-col w-[50%]">
                      <p className="text-[10px] font-black text-[#08384F] uppercase mb-1 tracking-wider opacity-60">
                        {sub.code}
                      </p>
                      <p className="text-[15px] font-bold text-gray-800 leading-tight">
                        {sub.name}
                      </p>
                    </div>

                    <div className="flex-1 w-[50%]">
                      <SearchableDropdown
                        options={faculties}
                        value={allocationMap[sub._id] || ""}
                        onChange={(facultyId) =>
                          handleFacultyChange(sub._id, facultyId)
                        }
                        placeholder="Assign Faculty"
                        loading={loading && !faculties.length}
                      />
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-gray-400 gap-2">
                  <BookOpen size={40} className="opacity-10" />
                  <p className="italic text-sm">
                    No subjects found for this semester
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StaffAllocation;
