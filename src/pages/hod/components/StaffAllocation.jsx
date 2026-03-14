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

const SearchableDropdown = ({ options, value, onChange, placeholder }) => {
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

const StaffAllocation = () => {
  const [academicStructure, setAcademicStructure] = useState([]);
  const [selectedStructureIndex, setSelectedStructureIndex] = useState(0);
  const [sections, setSections] = useState([]);
  const [selectedSection, setSelectedSection] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [faculties, setFaculties] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [sectionLoading, setSectionLoading] = useState(false);
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

        if (structRes?.data?.success) {
          setAcademicStructure(
            structRes.data.academicStructure ||
              structRes.data.data.academicStructure ||
              [],
          );
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
    const fetchDependencies = async () => {
      const current = academicStructure[selectedStructureIndex];
      if (!current) return;

      setSectionLoading(true);
      setSubjectLoading(true);
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
        }

        setSubjects(subjectData || []);
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

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center">
        <Loader2 className="animate-spin text-[#08384F]" size={40} />
      </div>
    );
  }

  const currentLevel = academicStructure[selectedStructureIndex];

  return (
    <>
      <HeaderComponent title="Staff Allocation" />

      <div className="px-4 mx-2">
        <div className="flex items-center justify-between mt-5">
          <div className="flex items-center gap-3">
            <span className="bg-blue-50 text-[#08384F] border border-blue-100 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider">
              Regulation: {currentLevel?.regulation?.name}
            </span>

            <span className="bg-emerald-50 text-emerald-700 border border-emerald-100 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider">
              Batch: {currentLevel?.batch?.name}
            </span>
          </div>

          <button
            onClick={handleSaveAllocation}
            disabled={isSaving}
            className="flex items-center gap-2 bg-[#08384F] text-white px-8 py-2.5 rounded-xl text-sm font-semibold disabled:opacity-50"
          >
            {isSaving ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <CheckCircle2 size={18} />
            )}
            Confirm Allocation
          </button>
        </div>

        <div className="grid grid-cols-12 gap-4 h-[calc(100vh-210px)] mt-4">
          <div className="col-span-3 border border-gray-200 bg-white rounded-2xl p-4 flex flex-col gap-3 overflow-y-auto">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest px-2 mb-1">
              Academic Year
            </p>

            {academicStructure.map((item, index) => (
              <button
                key={index}
                onClick={() => setSelectedStructureIndex(index)}
                className={`flex items-center justify-between px-5 py-4 rounded-2xl text-[15px] font-semibold border ${
                  selectedStructureIndex === index
                    ? "bg-[#08384F] text-white border-[#08384F]"
                    : "bg-white border-gray-100 text-gray-600 hover:bg-gray-50"
                }`}
              >
                <div className="text-left">
                  <p className="text-xs opacity-70 mb-1 uppercase font-bold">
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

          <div className="col-span-3 border border-gray-200 bg-white rounded-2xl p-4 flex flex-col gap-3 overflow-y-auto">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest px-2 mb-1">
              Select Section
            </p>

            {sectionLoading ? (
              <div className="flex items-center justify-center p-10">
                <Loader2 className="animate-spin text-gray-300" />
              </div>
            ) : (
              sections.map((sec) => (
                <button
                  key={sec._id}
                  onClick={() => setSelectedSection(sec)}
                  className={`flex items-center justify-between px-5 py-4 rounded-2xl text-[15px] font-semibold border ${
                    selectedSection?._id === sec._id
                      ? "bg-[#08384F] text-white border-[#08384F]"
                      : "bg-white border-gray-100 text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  Section {sec.name}
                  <span className="text-[10px] px-2 py-0.5 rounded-full border bg-gray-100 border-gray-200 text-[#08384F]">
                    {sec.studentCount}
                  </span>
                </button>
              ))
            )}
          </div>

          <div className="col-span-6 border border-gray-200 bg-white rounded-2xl p-5 flex flex-col overflow-hidden">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-[#08384F] flex items-center gap-2">
                <BookOpen size={20} /> Subject Allocation
              </h3>

              <div className="relative w-1/2">
                <Search
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  size={14}
                />

                <input
                  type="text"
                  placeholder="Search Subject..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs outline-none"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 pr-2">
              {subjectLoading ? (
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="animate-spin text-[#08384F]" size={32} />
                </div>
              ) : filteredSubjects.length > 0 ? (
                filteredSubjects.map((sub) => (
                  <div
                    key={sub._id}
                    className="p-4 border border-gray-100 rounded-2xl flex items-center gap-6"
                  >
                    <div className="flex flex-col w-[300px]">
                      <p className="text-[11px] font-black text-[#08384F] uppercase mb-1">
                        {sub.code}
                      </p>

                      <p className="text-[15px] font-semibold text-gray-800">
                        {sub.name}
                      </p>
                    </div>

                    <div className="flex-1 w-fit">
                      <SearchableDropdown
                        options={faculties}
                        value={allocationMap[sub._id] || ""}
                        onChange={(facultyId) =>
                          handleFacultyChange(sub._id, facultyId)
                        }
                        placeholder="Select Faculty"
                      />
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex items-center justify-center h-full text-gray-400 italic">
                  No subjects found
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default StaffAllocation;
