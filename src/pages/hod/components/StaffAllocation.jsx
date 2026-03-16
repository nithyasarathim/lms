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
  Plus,
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
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [query, setQuery] = useState("");
  const dropdownRef = useRef(null);

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
        setAllocationMap({});
      }
    };
    fetchAssignments();
  }, [selectedSection, selectedStructureIndex, academicStructure]);

  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setActiveDropdown(null);
        setQuery("");
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const toggleFaculty = (compId, facultyId) => {
    setAllocationMap((prev) => {
      const currentIds = prev[compId] || [];
      const newIds = currentIds.includes(facultyId)
        ? currentIds.filter((id) => id !== facultyId)
        : [...currentIds, facultyId];
      return { ...prev, [compId]: newIds };
    });
  };

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

  const getFilteredFaculties = (compId) => {
    const alreadyAssigned = allocationMap[compId] || [];
    return faculties.filter(
      (f) =>
        !alreadyAssigned.includes(f._id) &&
        (f.fullName?.toLowerCase().includes(query.toLowerCase()) ||
          f.employeeId?.toLowerCase().includes(query.toLowerCase()) ||
          f.departmentId?.code?.toLowerCase().includes(query.toLowerCase())),
    );
  };

  const getSortedComponents = (components) => {
    const order = { THEORY: 1, PROJECT: 2, PRACTICAL: 3 };
    return [...(components || [])].sort(
      (a, b) => (order[a.componentType] || 99) - (order[b.componentType] || 99),
    );
  };

  const getComponentLabel = (comp) => {
    return comp.name;
  };

  return (
    <div
      className={`transition-all duration-300 min-h-screen bg-gray-50 ${
        collapsed ? "pl-[80px]" : "pl-[300px]"
      }`}
    >
      <HeaderComponent title="Staff Allocation" />
      <div className="px-6 py-4">
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
            className="flex items-center gap-2 bg-[#08384F] text-white px-8 py-2.5 rounded-xl text-sm font-bold shadow-lg disabled:opacity-50 transition-all active:scale-95"
          >
            {isSaving ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <CheckCircle2 size={18} />
            )}
            Confirm Allocation
          </button>
        </div>

        <div className="grid grid-cols-12 gap-5 h-[calc(100vh-170px)]">
          <div className="col-span-3 border border-gray-200 bg-white rounded-3xl p-5 flex flex-col gap-3 overflow-y-auto shadow-sm">
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

          <div className="col-span-3 border border-gray-200 bg-white rounded-3xl p-5 flex flex-col gap-3 overflow-y-auto shadow-sm">
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
              </button>
            ))}
          </div>

          <div className="col-span-6 border border-gray-200 bg-white rounded-3xl p-6 flex flex-col overflow-hidden shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-[#08384F] flex items-center gap-2">
                <BookOpen size={20} /> Subjects
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
                  className="w-full pl-11 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-2xl text-sm outline-none focus:bg-white focus:border-[#08384F] transition-all"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scroll">
              {subjectLoading ? (
                <Loader2 className="animate-spin mx-auto mt-20 text-[#08384F]" />
              ) : (
                subjects
                  .filter(
                    (s) =>
                      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      s.code.toLowerCase().includes(searchTerm.toLowerCase()),
                  )
                  .map((sub) => (
                    <div
                      key={sub._id}
                      className="border border-gray-200 rounded-2xl overflow-h shadow-sm"
                    >
                      <div className="bg-[#08384F]/5 px-4 py-3 border-b border-gray-200 flex items-center gap-2">
                        <span className="font-black text-[#08384F] text-xs">
                          {sub.code}
                        </span>
                        <span className="text-gray-400 text-xs">|</span>
                        <h4 className="font-bold text-sm text-gray-800">
                          {sub.name}
                        </h4>
                      </div>
                      <div className="p-4 space-y-4">
                        {getSortedComponents(sub.components).map((comp) => (
                          <div key={comp._id} className="space-y-2">
                            <div className="flex items-center justify-between">
                              <label className="text-[11px] font-bold text-[#08384F] uppercase tracking-wider block">
                                {getComponentLabel(comp)}
                              </label>
                              <div
                                className="relative"
                                ref={
                                  activeDropdown === comp._id
                                    ? dropdownRef
                                    : null
                                }
                              >
                                <button
                                  onClick={() => {
                                    setActiveDropdown(
                                      activeDropdown === comp._id
                                        ? null
                                        : comp._id,
                                    );
                                    setQuery("");
                                  }}
                                  className="flex items-center gap-2 text-gray-500 text-xs font-bold hover:underline px-1 py-1"
                                >
                                  <Plus size={14} /> Add Faculty
                                </button>
                                {activeDropdown === comp._id && (
                                  <div className="absolute right-0 z-50 mt-1 w-72 bg-white border border-gray-200 rounded-xl shadow-2xl overflow-hidden">
                                    <div className="p-2 bg-gray-50">
                                      <input
                                        autoFocus
                                        value={query}
                                        onChange={(e) =>
                                          setQuery(e.target.value)
                                        }
                                        placeholder="Search faculty..."
                                        className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-xs outline-none"
                                      />
                                    </div>
                                    <div className="max-h-40 overflow-y-auto">
                                      {getFilteredFaculties(comp._id).length >
                                      0 ? (
                                        getFilteredFaculties(comp._id).map(
                                          (f) => (
                                            <div
                                              key={f._id}
                                              onClick={() => {
                                                toggleFaculty(comp._id, f._id);
                                                setActiveDropdown(null);
                                              }}
                                              className="px-4 py-2.5 hover:bg-blue-50 cursor-pointer border-gray-50 last:border-0 flex flex-col"
                                            >
                                              <span className="text-xs text-gray-700">
                                                <strong className="font-bold">
                                                  {f.salutation} {f.fullName}
                                                </strong>
                                                <span className="text-gray-400 font-normal">
                                                  {" "}
                                                  - {f.designation} /{" "}
                                                  {f.departmentId?.code ||
                                                    "N/A"}
                                                </span>
                                              </span>
                                            </div>
                                          ),
                                        )
                                      ) : (
                                        <div className="px-4 py-3 text-xs text-gray-400 text-center">
                                          No matching faculties available
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="space-y-1.5">
                              {(allocationMap[comp._id] || []).map((id) => {
                                const f = faculties.find(
                                  (fac) => fac._id === id,
                                );
                                return (
                                  <div
                                    key={id}
                                    className="flex items-center justify-between border border-blue-100 px-3 py-2 rounded-xl bg-blue-50/30"
                                  >
                                    <span className="text-xs text-[#08384F]">
                                      <strong className="font-bold">
                                        {f?.salutation} {f?.fullName}
                                      </strong>
                                      <span className="text-gray-500 font-normal">
                                        , {f?.designation} /{" "}
                                        {f?.departmentId?.code || "N/A"}
                                      </span>
                                    </span>
                                    <X
                                      size={14}
                                      className="text-red-400 cursor-pointer hover:text-red-600 ml-2"
                                      onClick={() =>
                                        toggleFaculty(comp._id, id)
                                      }
                                    />
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        ))}
                      </div>
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
