import React, { useState, useEffect } from "react";
import {
  ArrowLeft,
  Save,
  Loader2,
  ChevronRight,
  Search,
  BookOpen,
} from "lucide-react";
import { useSearchParams } from "react-router-dom";
import {
  getSubjects,
  getCurriculum,
  createCurriculum,
  updateCurriculum,
  getSubjectsByRegulation,
} from "../api/admin.api";
import toast from "react-hot-toast";

const SubjectAllocation = ({ deptId, regId, regName }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [subjects, setSubjects] = useState([]);
  const [curriculumId, setCurriculumId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSemester, setSelectedSemester] = useState(1);
  const [selectedType, setSelectedType] = useState("Theory");
  const [allocatedData, setAllocatedData] = useState({});
  const [semesterType, setSemesterType] = useState("odd");

  const oddSemesters = [1, 3, 5, 7];
  const evenSemesters = [2, 4, 6, 8];
  const currentSems = semesterType === "odd" ? oddSemesters : evenSemesters;

  useEffect(() => {
    const initData = async () => {
      if (!deptId || !regId) return;
      setLoading(true);
      try {
        const [subjectsRes, curriculumRes] = await Promise.all([
          getSubjectsByRegulation(regId),
          getCurriculum(deptId, regId),
        ]);

        const filtered = subjectsRes.filter(
          (s) => s.departmentId?._id === deptId || s.departmentId === deptId,
        );
        setSubjects(filtered);

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

  const handleSubjectToggle = (subId) => {
    setAllocatedData((prev) => {
      const currentSemsSubjects = prev[selectedSemester] || [];
      const isSelected = currentSemsSubjects.includes(subId);

      return {
        ...prev,
        [selectedSemester]: isSelected
          ? currentSemsSubjects.filter((id) => id !== subId)
          : [...currentSemsSubjects, subId],
      };
    });
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

  const filteredSubjects = subjects.filter((sub) => {
    const matchesSearch =
      sub.code?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sub.name?.toLowerCase().includes(searchQuery.toLowerCase());

    const subType = sub.courseType?.toUpperCase();
    let matchesType = false;
    if (selectedType === "Theory")
      matchesType = ["T", "TP", "TPJ"].includes(subType);
    else if (selectedType === "Lab")
      matchesType = ["P", "PJ"].includes(subType);
    else if (selectedType === "Internship") matchesType = subType === "I";

    return matchesSearch && matchesType;
  });

  return (
    <div className="px-4  animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="flex items-center justify-between ">
        <div className="flex items-center gap-5">
          <button
            onClick={handleBack}
            className="flex items-center gap-1.5 text-[#08384F] font-semibold text-sm hover:underline transition-all"
          >
            <ArrowLeft size={18} /> Back
          </button>
          <div className="h-5 w-[1.5px] bg-gray-300"></div>
          <p className="text-sm font-semibold gap-10 text-gray-500">
            Regulation -
            <span className="text-[#08384F] px-1 font-semibold text-base">
              {regName}
            </span>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={semesterType}
            onChange={(e) => {
              setSemesterType(e.target.value);
              setSelectedSemester(e.target.value === "odd" ? 1 : 2);
            }}
            className="border border-gray-300 px-4 py-2 rounded-xl text-sm font-semibold text-[#08384F] outline-none shadow-sm cursor-pointer hover:border-[#08384F] transition-colors"
          >
            <option value="odd">Odd Semesters</option>
            <option value="even">Even Semesters</option>
          </select>
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
        <div className="col-span-3 border border-gray-200 bg-white rounded-2xl p-4 flex flex-col gap-3 overflow-y-auto shadow-sm">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest px-2 mb-1">
            Select Semester
          </p>
          {currentSems.map((sem) => (
            <button
              key={sem}
              onClick={() => setSelectedSemester(sem)}
              className={`flex items-center justify-between px-5 py-4 rounded-2xl text-[15px] font-semibold transition-all border ${
                selectedSemester === sem
                  ? "bg-[#08384F] text-white border-[#08384F] shadow-lg shadow-[#08384F]/10 scale-[1.02]"
                  : "bg-white border-gray-100 text-gray-600 hover:bg-gray-50"
              }`}
            >
              Semester {sem}
              <ChevronRight
                size={18}
                className={
                  selectedSemester === sem ? "opacity-100" : "opacity-30"
                }
              />
            </button>
          ))}
        </div>

        <div className="col-span-3 border border-gray-200 bg-white rounded-2xl p-4 flex flex-col gap-3 overflow-y-auto shadow-sm">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest px-2 mb-1">
            Subject Category
          </p>
          {["Theory", "Lab", "Internship"].map((type) => (
            <button
              key={type}
              onClick={() => setSelectedType(type)}
              className={`flex items-center justify-between px-5 py-4 rounded-2xl text-[15px] font-semibold transition-all border ${
                selectedType === type
                  ? "bg-[#08384F] text-white border-[#08384F] shadow-lg shadow-[#08384F]/10 scale-[1.02]"
                  : "bg-white border-gray-100 text-gray-600 hover:bg-gray-50"
              }`}
            >
              {type}
              <ChevronRight
                size={18}
                className={selectedType === type ? "opacity-100" : "opacity-30"}
              />
            </button>
          ))}
        </div>

        <div className="col-span-6 border border-gray-200 bg-white rounded-2xl p-5 flex flex-col overflow-hidden shadow-sm">
          <div className="relative mb-5">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              type="text"
              placeholder="Search code or subject name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white focus:ring-4 focus:ring-[#08384F]/5 focus:border-[#08384F] transition-all text-sm font-medium outline-none"
            />
          </div>

          <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scroll">
            {loading ? (
              <div className="flex flex-col items-center justify-center h-full gap-3">
                <Loader2 className="animate-spin text-[#08384F]" size={32} />
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
                  Loading Subjects...
                </p>
              </div>
            ) : filteredSubjects.length > 0 ? (
              filteredSubjects.map((sub) => {
                const isSelected = (
                  allocatedData[selectedSemester] || []
                ).includes(sub._id);
                return (
                  <label
                    key={sub._id}
                    className={`flex items-center gap-4 p-4 rounded-2xl border cursor-pointer transition-all ${
                      isSelected
                        ? "bg-blue-50/50 border-[#08384F] shadow-sm"
                        : "bg-white border-gray-100 hover:border-gray-300"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleSubjectToggle(sub._id)}
                      className="w-5 h-5 accent-[#08384F] rounded cursor-pointer transition-transform active:scale-90"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] font-black text-[#08384F] leading-none mb-1 uppercase tracking-wider">
                        {sub.code}
                      </p>
                      <p className="text-[15px] font-semibold text-gray-800 truncate leading-tight">
                        {sub.name}
                      </p>
                    </div>
                    <span className="text-[11px] font-black bg-gray-100 border border-gray-200 px-3 py-1 rounded-lg text-[#08384F] uppercase tracking-wide">
                      {sub.courseType}
                    </span>
                  </label>
                );
              })
            ) : (
              <div className="flex flex-col items-center justify-center h-full opacity-40 py-10">
                <BookOpen size={60} strokeWidth={1} />
                <p className="text-sm font-semibold mt-4 text-center px-10">
                  No subjects found in this category.
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
