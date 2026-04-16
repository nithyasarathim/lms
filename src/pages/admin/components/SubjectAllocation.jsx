import React, { useState, useEffect } from "react";
import {
  ArrowLeft,
  Save,
  Loader2,
  ChevronRight,
  Search,
  BookOpen,
  Plus,
  Trash2,
  CheckCircle2,
  ChevronDown,
  BookText,
  FlaskConical,
  Layers,
} from "lucide-react";
import { useSearchParams } from "react-router-dom";
import {
  getCurriculum,
  createCurriculum,
  updateCurriculum,
  getSubjectsByRegulation,
  getDepartmentById,
} from "../api/admin.api";
import toast from "react-hot-toast";

const SubjectAllocation = ({ deptId, regId, regName }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [subjects, setSubjects] = useState([]);
  const [curriculumId, setCurriculumId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [deptInfo, setDeptInfo] = useState(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSemester, setSelectedSemester] = useState(1);
  const [selectedType, setSelectedType] = useState("ALL");
  const [allocatedData, setAllocatedData] = useState({});

  const deliveryTypes = [
    { id: "ALL", label: "All Subjects" },
    { id: "T", label: "Theory Only" },
    { id: "TP", label: "Theory & Practical" },
    { id: "TPJ", label: "Theory, Practical & Project" },
    { id: "P", label: "Practical Only" },
    { id: "PJ", label: "Project Only" },
    { id: "I", label: "Internship" },
  ];
  const allSemesters = [1, 2, 3, 4, 5, 6, 7, 8];

  useEffect(() => {
    const initData = async () => {
      if (!deptId || !regId) return;
      setLoading(true);
      try {
        const [subjectsRes, curriculumRes, deptRes] = await Promise.all([
          getSubjectsByRegulation(regId),
          getCurriculum(deptId, regId),
          getDepartmentById(deptId),
        ]);

        const subjectList = subjectsRes?.data?.subjects || subjectsRes || [];
        setSubjects(subjectList);

        if (deptRes?.success && deptRes?.data?.department) {
          setDeptInfo(deptRes.data.department);
        } else if (deptRes?.data) {
          setDeptInfo(deptRes.data);
        } else {
          setDeptInfo(deptRes);
        }

        if (
          curriculumRes?.success &&
          curriculumRes?.data?.curriculums?.length > 0
        ) {
          const existing = curriculumRes.data.curriculums[0];
          setCurriculumId(existing._id);

          const mapping = {};
          existing.semesters.forEach((sem) => {
            mapping[sem.semesterNumber] = sem.subjects.map((s) => s._id || s);
          });
          setAllocatedData(mapping);
        } else {
          setCurriculumId(null);
          setAllocatedData({});
        }
      } catch (err) {
        console.error("Initialization error:", err);
      } finally {
        setLoading(false);
      }
    };
    initData();
  }, [deptId, regId]);

  const handleBack = () => {
    const newParams = new URLSearchParams(searchParams);
    newParams.delete("deptId");
    setSearchParams(newParams);
  };

  const handleAddSubject = (subId) => {
    setAllocatedData((prev) => {
      const currentSemsSubjects = prev[selectedSemester] || [];
      if (currentSemsSubjects.includes(subId)) return prev;
      return {
        ...prev,
        [selectedSemester]: [...currentSemsSubjects, subId],
      };
    });
    toast.success("Subject Added", { icon: "➕", duration: 800 });
  };

  const handleRemoveSubject = (sem, subId) => {
    setAllocatedData((prev) => ({
      ...prev,
      [sem]: (prev[sem] || []).filter((id) => id !== subId),
    }));
  };

  const handleSave = async () => {
    if (!regId) return toast.error("Regulation ID is missing");
    setIsSaving(true);
    try {
      const semestersArray = Object.entries(allocatedData)
        .filter(([_, subs]) => subs.length > 0)
        .map(([sem, subs]) => ({
          semesterNumber: parseInt(sem),
          subjects: subs,
        }));
      const payload = {
        departmentId: deptId,
        regulationId: regId,
        semesters: semestersArray,
        isActive: true,
      };
      if (curriculumId) {
        await updateCurriculum(curriculumId, payload);
        toast.success("Curriculum updated successfully");
      } else {
        const response = await createCurriculum(payload);
        setCurriculumId(response.data._id);
        toast.success("Curriculum created successfully");
      }
    } catch (err) {
      toast.error(err?.message || "Failed to save allocation");
    } finally {
      setIsSaving(false);
    }
  };

  const availableSubjects = subjects.filter((sub) => {
    const isAlreadyAllocatedInCurrentSem = (
      allocatedData[selectedSemester] || []
    ).includes(sub._id);
    const matchesSearch =
      sub.code?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sub.name?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType =
      selectedType === "ALL" ||
      sub.deliveryType?.toUpperCase() === selectedType;
    return matchesSearch && matchesType && !isAlreadyAllocatedInCurrentSem;
  });

  const allocatedTheoryOnly = subjects.filter(
    (s) =>
      (allocatedData[selectedSemester] || []).includes(s._id) &&
      s.deliveryType === "T",
  );
  const allocatedTheoryPractical = subjects.filter(
    (s) =>
      (allocatedData[selectedSemester] || []).includes(s._id) &&
      s.deliveryType === "TP",
  );
  const allocatedTheoryPracticalProject = subjects.filter(
    (s) =>
      (allocatedData[selectedSemester] || []).includes(s._id) &&
      s.deliveryType === "TPJ",
  );
  const allocatedProjectOnly = subjects.filter(
    (s) =>
      (allocatedData[selectedSemester] || []).includes(s._id) &&
      s.deliveryType === "PJ",
  );
  const allocatedPracticalOnly = subjects.filter(
    (s) =>
      (allocatedData[selectedSemester] || []).includes(s._id) &&
      (s.deliveryType === "P" || s.deliveryType === "I"),
  );

  const SectionHeader = ({ icon: Icon, title, count }) => (
    <div className="flex items-center gap-2 text-[#08384F] mb-3 px-1">
      <Icon size={16} />
      <span className="text-[11px] font-black uppercase tracking-wider">
        {title}
      </span>
      <span className="ml-auto text-[10px] font-bold bg-[#08384F]/10 px-2 py-0.5 rounded-full">
        {count}
      </span>
    </div>
  );

  const SubjectCard = ({ sub }) => (
    <div className="bg-gray-50/50 border border-gray-100 p-3 rounded-xl flex items-center justify-between transition-all hover:bg-white hover:border-[#08384F]/20">
      <div className="min-w-0">
        <p className="text-[9px] font-black text-[#08384F] leading-none mb-1 uppercase">
          {sub.code}
        </p>
        <p className="text-xs font-bold text-gray-700 truncate">{sub.name}</p>
      </div>
      <button
        onClick={() => handleRemoveSubject(selectedSemester, sub._id)}
        className="p-1.5 text-gray-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all"
      >
        <Trash2 size={14} />
      </button>
    </div>
  );

  return (
    <div className="px-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-5">
          <button
            onClick={handleBack}
            className="flex items-center gap-1.5 text-[#08384F] font-semibold text-sm hover:underline transition-all"
          >
            <ArrowLeft size={18} /> Back
          </button>
          <div className="h-5 w-[1.5px] bg-gray-300"></div>
          <div className="flex items-center gap-2 text-gray-500 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider">
            Dept:{" "}
            <span className="text-[#08384F]">
              {deptInfo ? `${deptInfo.program} ${deptInfo.name}` : "..."}
            </span>
          </div>
          <p className="text-sm font-semibold text-gray-500">
            Regulation -{" "}
            <span className="text-[#08384F] px-1 font-bold text-xs ">
              {regName}
            </span>
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 bg-[#08384F] text-white px-6 py-2 rounded-xl text-sm font-semibold active:scale-95 transition-all shadow-md shadow-[#08384F]/20 disabled:opacity-50"
          >
            {isSaving ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <Save size={18} />
            )}
            {curriculumId ? "Update Curriculum" : "Create Curriculum"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-4 h-[calc(100vh-190px)] mt-2">
        <div className="col-span-2 border border-gray-200 bg-white rounded-2xl p-2 flex flex-col gap-2 overflow-y-auto shadow-sm">
          <p className="py-1 text-center text-xs font-bold text-[#08384F] uppercase tracking-widest">
            Semesters
          </p>
          {allSemesters.map((sem) => {
            const count = (allocatedData[sem] || []).length;
            return (
              <button
                key={sem}
                onClick={() => setSelectedSemester(sem)}
                className={`flex flex-row gap-3 items-center justify-center py-3 rounded-xl text-[13px] font-bold transition-all border ${
                  selectedSemester === sem
                    ? "bg-[#08384F] text-white border-[#08384F] shadow-md"
                    : "bg-white border-gray-50 text-gray-500 hover:bg-gray-50"
                }`}
              >
                <span>Semester {sem}</span>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full ${selectedSemester === sem ? "bg-white text-[#08384F]" : "bg-gray-200 text-gray-600"}`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        <div className="col-span-4 border border-gray-200 rounded-2xl p-4 flex flex-col overflow-hidden shadow-sm">
          <div className="flex items-center justify-between mb-4 px-1">
            <h4 className="text-xs font-bold text-[#08384F] uppercase tracking-widest flex items-center gap-2">
              <CheckCircle2 size={14} className="text-[#08384F]" /> Sem{" "}
              {selectedSemester} Structure
            </h4>
          </div>

          <div className="flex-1 overflow-y-auto space-y-4 pr-1 custom-scroll">
            {allocatedTheoryOnly.length > 0 && (
              <div className="bg-white border border-gray-200 rounded-2xl p-3 shadow-sm">
                <SectionHeader
                  icon={BookText}
                  title="Theory Only"
                  count={allocatedTheoryOnly.length}
                />
                <div className="space-y-2">
                  {allocatedTheoryOnly.map((s) => (
                    <SubjectCard key={s._id} sub={s} />
                  ))}
                </div>
              </div>
            )}
            {allocatedTheoryPractical.length > 0 && (
              <div className="bg-white border border-gray-200 rounded-2xl p-3 shadow-sm">
                <SectionHeader
                  icon={Layers}
                  title="Theory & Practical"
                  count={allocatedTheoryPractical.length}
                />
                <div className="space-y-2">
                  {allocatedTheoryPractical.map((s) => (
                    <SubjectCard key={s._id} sub={s} />
                  ))}
                </div>
              </div>
            )}
            {allocatedTheoryPracticalProject.length > 0 && (
              <div className="bg-white border border-gray-200 rounded-2xl p-3 shadow-sm">
                <SectionHeader
                  icon={Layers}
                  title="Theory, Prac & Proj"
                  count={allocatedTheoryPracticalProject.length}
                />
                <div className="space-y-2">
                  {allocatedTheoryPracticalProject.map((s) => (
                    <SubjectCard key={s._id} sub={s} />
                  ))}
                </div>
              </div>
            )}
            {allocatedProjectOnly.length > 0 && (
              <div className="bg-white border border-gray-200 rounded-2xl p-3 shadow-sm">
                <SectionHeader
                  icon={FlaskConical}
                  title="Project Only"
                  count={allocatedProjectOnly.length}
                />
                <div className="space-y-2">
                  {allocatedProjectOnly.map((s) => (
                    <SubjectCard key={s._id} sub={s} />
                  ))}
                </div>
              </div>
            )}
            {allocatedPracticalOnly.length > 0 && (
              <div className="bg-white border border-gray-200 rounded-2xl p-3 shadow-sm">
                <SectionHeader
                  icon={FlaskConical}
                  title="Practical Only"
                  count={allocatedPracticalOnly.length}
                />
                <div className="space-y-2">
                  {allocatedPracticalOnly.map((s) => (
                    <SubjectCard key={s._id} sub={s} />
                  ))}
                </div>
              </div>
            )}
            {(!allocatedData[selectedSemester] ||
              allocatedData[selectedSemester].length === 0) && (
              <div className="h-full flex flex-col items-center justify-center text-gray-300 py-10 opacity-60 italic text-xs">
                <Layers size={30} className="mb-2" /> No subjects added yet
              </div>
            )}
          </div>
        </div>

        <div className="col-span-6 border border-gray-200 bg-white rounded-2xl p-5 flex flex-col overflow-hidden shadow-sm">
          <div className="flex flex-row items-center gap-3 mb-5 bg-gray-50/50 p-2.5 rounded-2xl border border-gray-100">
            <div className="relative flex-1">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                size={16}
              />
              <input
                type="text"
                placeholder="Search code or name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-xs font-medium outline-none focus:border-[#08384F] focus:ring-4 focus:ring-[#08384F]/5 transition-all"
              />
            </div>
            <div className="relative w-48">
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full bg-[#08384F] text-white border border-[#08384F] py-2.5 pl-4 pr-10 rounded-xl text-xs font-bold outline-none appearance-none focus:ring-4 focus:ring-[#08384F]/20 transition-all cursor-pointer"
              >
                {deliveryTypes.map((t) => (
                  <option
                    key={t.id}
                    value={t.id}
                    className="bg-white text-gray-800 font-medium"
                  >
                    {t.label}
                  </option>
                ))}
              </select>
              <ChevronDown
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white pointer-events-none"
                size={16}
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scroll">
            {loading ? (
              <div className="flex flex-col items-center justify-center h-full">
                <Loader2 className="animate-spin text-[#08384F]" size={32} />
              </div>
            ) : availableSubjects.length > 0 ? (
              availableSubjects.map((sub) => (
                <div
                  key={sub._id}
                  className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 bg-white hover:border-[#08384F]/30 hover:shadow-lg transition-all group active:scale-[0.98]"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-black text-[#08384F] leading-none mb-1.5 uppercase">
                      {sub.code}
                    </p>
                    <p className="text-[14px] font-bold text-gray-800 truncate leading-tight">
                      {sub.name}
                    </p>
                    <div className="flex gap-2 mt-1.5">
                      <span className="text-[9px] font-bold bg-gray-100 text-[#08384F] px-2 py-0.5 rounded border border-[#08384F]/10">
                        {sub.deliveryType}
                      </span>
                      <span className="text-[9px] font-bold text-gray-400 uppercase">
                        Credits: {sub.credits}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleAddSubject(sub._id)}
                    className="bg-[#08384F] text-white p-2.5 rounded-xl hover:bg-[#0a4a69] transition-all shadow-md"
                  >
                    <Plus size={20} />
                  </button>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center h-64 opacity-40">
                <BookOpen size={48} strokeWidth={1} />
                <p className="text-xs font-semibold mt-3 text-center px-10">
                  No matching subjects found.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubjectAllocation;
