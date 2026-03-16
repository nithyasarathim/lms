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
  X,
} from "lucide-react";
import HeaderComponent from "../../shared/components/HeaderComponent";
import {
  getDeptAcademicStructure,
  getSectionsByBatchProgramId,
  assignFacultyToSection,
  getSubjectsBySemester,
  getAllFaculties,
  getAssignedFaculties,
} from "../api/hod.api";
import toast from "react-hot-toast";

const Shimmer = ({ className }) => (
  <div className={`animate-pulse bg-gray-200 rounded-lg ${className}`} />
);

const MultiSearchableDropdown = ({
  options,
  selectedIds = [],
  onChange,
  placeholder,
  loading,
}) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const ref = useRef(null);

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

  const toggleOption = (id) => {
    const newSelection = selectedIds.includes(id)
      ? selectedIds.filter((item) => item !== id)
      : [...selectedIds, id];
    onChange(newSelection);
  };

  if (loading) return <Shimmer className="h-10 w-full rounded-xl" />;

  return (
    <div className="relative w-full" ref={ref}>
      <div
        onClick={() => setOpen(!open)}
        className={`w-full flex flex-wrap gap-1 items-center min-h-[42px] px-3 py-1.5 bg-white border rounded-xl text-sm cursor-pointer transition-all ${
          open
            ? "border-[#08384F] ring-2 ring-[#08384F]/10"
            : "border-gray-200 hover:border-gray-300"
        }`}
      >
        {selectedIds.length > 0 ? (
          selectedIds.map((id) => {
            const faculty = options.find((o) => o._id === id);
            return (
              <span
                key={id}
                className="flex items-center gap-1 bg-blue-50 text-[#08384F] px-2 py-1 rounded-lg text-[11px] font-bold border border-blue-100"
              >
                {faculty?.fullName?.split(" ")[0] ||
                  faculty?.firstName ||
                  "Faculty"}
                <X
                  size={12}
                  className="hover:text-red-500"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleOption(id);
                  }}
                />
              </span>
            );
          })
        ) : (
          <span className="text-gray-400 flex items-center gap-2">
            <User size={14} /> {placeholder}
          </span>
        )}
        <ChevronDown size={16} className="ml-auto text-gray-400" />
      </div>

      {open && (
        <div className="absolute z-50 mt-2 w-full bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden">
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
                className="w-full pl-8 pr-3 py-2 border border-gray-200 rounded-lg text-xs outline-none"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          </div>
          <div className="max-h-52 overflow-y-auto">
            {filtered.map((opt) => (
              <div
                key={opt._id}
                onClick={() => toggleOption(opt._id)}
                className="flex items-center justify-between px-4 py-2.5 hover:bg-gray-50 cursor-pointer"
              >
                <div className="flex flex-col">
                  <span
                    className={`text-sm ${
                      selectedIds.includes(opt._id)
                        ? "font-bold text-[#08384F]"
                        : "text-gray-700"
                    }`}
                  >
                    {opt.fullName || `${opt.firstName} ${opt.lastName}`}
                  </span>
                  <span className="text-[10px] text-gray-500 uppercase">
                    {opt.employeeId}
                  </span>
                </div>
                {selectedIds.includes(opt._id) && (
                  <Check size={14} className="text-[#08384F]" />
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const StaffAllocation = ({ collapsed }) => {
  const [academicStructure, setAcademicStructure] = useState([]);
  const [selectedStructureIndex, setSelectedStructureIndex] = useState(0);
  const [sections, setSections] = useState([]);
  const [selectedSection, setSelectedSection] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [faculties, setFaculties] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [subjectLoading, setSubjectLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [allocationMap, setAllocationMap] = useState({});

  useEffect(() => {
    const initData = async () => {
      setLoading(true);
      try {
        const [structRes, facultyRes] = await Promise.all([
          getDeptAcademicStructure(),
          getAllFaculties(),
        ]);
        if (structRes?.success || structRes?.data?.success) {
          const struct =
            structRes.data?.academicStructure ||
            structRes.data?.data?.academicStructure ||
            [];
          setAcademicStructure(struct);
        }
        if (facultyRes?.success) {
          setFaculties(facultyRes.data.facultyList || []);
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
    const fetchDeps = async () => {
      const current = academicStructure[selectedStructureIndex];
      if (!current) return;
      setSubjectLoading(true);
      try {
        const [secRes, subRes] = await Promise.all([
          getSectionsByBatchProgramId(current.batchProgramId),
          getSubjectsBySemester(current.batchProgramId, current.semester),
        ]);
        if (secRes?.success) {
          const validSecs = (secRes.data.sections || []).filter(
            (s) => s.name !== "UNALLOCATED",
          );
          setSections(validSecs);
          setSelectedSection(validSecs[0] || null);
        }
        if (subRes?.success) {
          setSubjects(subRes.data.subjects || []);
        }
      } catch {
        toast.error("Error fetching dependencies");
      } finally {
        setSubjectLoading(false);
      }
    };
    fetchDeps();
  }, [selectedStructureIndex, academicStructure]);

  // Fetch Existing Assignments when Section or Semester Level changes
  useEffect(() => {
    const fetchAssignments = async () => {
      const current = academicStructure[selectedStructureIndex];
      if (!selectedSection || !current) return;

      try {
        const res = await getAssignedFaculties(
          selectedSection._id,
          current.semester,
        );
        if (res?.success) {
          const mapping = {};
          res.data.assignments.forEach((assign) => {
            const componentId =
              assign.subjectComponentId?._id || assign.subjectComponentId;
            mapping[componentId] = assign.facultyIds.map((f) => f._id || f);
          });
          setAllocationMap(mapping);
        }
      } catch (err) {
        // Silent fail for assignments to avoid annoying error toasts when nothing is allocated
        console.log("No existing assignments found");
        setAllocationMap({});
      }
    };
    fetchAssignments();
  }, [selectedSection, selectedStructureIndex, academicStructure]);

  const flattenedComponents = (subjects || [])
    .flatMap((sub) =>
      (sub.components || []).map((comp) => ({
        ...comp,
        parentCode: sub.code,
        parentName: sub.name,
      })),
    )
    .filter(
      (c) =>
        c.parentName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.parentCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.name?.toLowerCase().includes(searchTerm.toLowerCase()),
    );

  const handleSave = async () => {
    const current = academicStructure[selectedStructureIndex];
    if (!selectedSection) return toast.error("Select a section first");

    const allocationEntries = Object.entries(allocationMap)
      .filter(([_, ids]) => ids.length > 0)
      .map(([compId, ids]) => ({
        subjectComponentId: compId,
        facultyIds: ids,
      }));

    const payload = {
      sectionId: selectedSection._id,
      academicYearId: current.academicYearId,
      semesterNumber: current.semester,
      allocations: allocationEntries,
    };

    setIsSaving(true);
    try {
      await assignFacultyToSection(payload);
      toast.success("Staff allocated successfully");
    } catch (err) {
      toast.error(err.message || "Allocation failed");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div
      className={`transition-all duration-300 min-h-screen bg-gray-50 ${collapsed ? "pl-[80px]" : "pl-[300px]"}`}
    >
      <HeaderComponent title="Staff Allocation" />
      <div className="px-6 py-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
        <div className="flex items-center justify-between mb-6">
          <div className="flex flex-wrap gap-3">
            <div className="bg-white border px-3 py-1.5 rounded-full text-xs font-bold text-[#08384F]">
              Batch:{" "}
              {academicStructure[selectedStructureIndex]?.batch?.name || "..."}
            </div>
            <div className="bg-white border px-3 py-1.5 rounded-full text-xs font-bold text-[#08384F]">
              Reg:{" "}
              {academicStructure[selectedStructureIndex]?.regulation?.name ||
                "..."}
            </div>
          </div>
          <button
            onClick={handleSave}
            disabled={isSaving || loading}
            className="flex items-center gap-2 bg-[#08384F] text-white px-8 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-[#08384F]/20 disabled:opacity-50 transition-all active:scale-95"
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
          <div className="col-span-3 border bg-white rounded-3xl p-5 flex flex-col gap-3 overflow-y-auto shadow-sm">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-2 mb-2">
              Academic Year
            </p>
            {academicStructure.map((item, index) => (
              <button
                key={index}
                onClick={() => setSelectedStructureIndex(index)}
                className={`flex flex-col p-4 rounded-2xl text-left border transition-all ${
                  selectedStructureIndex === index
                    ? "bg-[#08384F] text-white"
                    : "bg-white text-gray-600 hover:bg-gray-50"
                }`}
              >
                <span className="text-[10px] font-bold uppercase opacity-60">
                  Year {item.year}
                </span>
                <span className="font-bold">Semester {item.semester}</span>
              </button>
            ))}
          </div>

          <div className="col-span-3 border bg-white rounded-3xl p-5 flex flex-col gap-3 overflow-y-auto shadow-sm">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-2 mb-2">
              Sections
            </p>
            {sections.map((sec) => (
              <button
                key={sec._id}
                onClick={() => setSelectedSection(sec)}
                className={`flex items-center justify-between p-4 rounded-2xl border font-bold transition-all ${
                  selectedSection?._id === sec._id
                    ? "bg-[#08384F] text-white"
                    : "bg-white text-gray-600 hover:bg-gray-50"
                }`}
              >
                Section {sec.name}
                <span
                  className={`text-[10px] px-2.5 py-1 rounded-full ${selectedSection?._id === sec._id ? "bg-white/20" : "bg-gray-100"}`}
                >
                  {sec.studentCount}
                </span>
              </button>
            ))}
          </div>

          <div className="col-span-6 border bg-white rounded-3xl p-6 flex flex-col overflow-hidden shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-[#08384F] flex items-center gap-2">
                <BookOpen size={20} /> Components
              </h3>
              <div className="relative w-1/2">
                <Search
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                  size={16}
                />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-11 pr-4 py-2 bg-gray-50 border rounded-2xl text-sm outline-none focus:bg-white focus:border-[#08384F] transition-all"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scroll">
              {subjectLoading ? (
                <Loader2 className="animate-spin mx-auto mt-20 text-[#08384F]" />
              ) : (
                flattenedComponents.map((comp) => (
                  <div
                    key={comp._id}
                    className="p-4 border rounded-3xl flex flex-col gap-3 hover:bg-gray-50 transition-all"
                  >
                    <div>
                      <p className="text-[9px] font-black text-[#08384F] uppercase tracking-wider opacity-60">
                        {comp.parentCode} • {comp.componentType}
                      </p>
                      <p className="text-[14px] font-bold text-gray-800 leading-tight">
                        {comp.name}
                      </p>
                      {comp.name !== comp.parentName && (
                        <p className="text-[11px] text-gray-500 italic">
                          Part of: {comp.parentName}
                        </p>
                      )}
                    </div>
                    <MultiSearchableDropdown
                      options={faculties}
                      selectedIds={allocationMap[comp._id] || []}
                      onChange={(ids) =>
                        setAllocationMap((prev) => ({
                          ...prev,
                          [comp._id]: ids,
                        }))
                      }
                      placeholder="Assign Faculties"
                      loading={loading && !faculties.length}
                    />
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StaffAllocation;
