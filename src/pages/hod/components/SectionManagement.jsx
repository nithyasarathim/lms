import React, { useState, useEffect } from "react";
import { ChevronRight, Search, ArrowRightLeft, Loader2 } from "lucide-react";
import HeaderComponent from "../../shared/components/HeaderComponent";
import {
  getActiveAcademicYear,
  getCurrentYearAndSections,
  getSectionStudentData,
  updateStudentSections,
} from "../api/hod.api";
import toast from "react-hot-toast";

const Shimmer = ({ className }) => (
  <div className={`animate-pulse bg-gray-200 rounded-lg ${className}`} />
);

const SectionManagement = ({ collapsed }) => {
  const [selectedAcademicYear, setSelectedAcademicYear] = useState(() => {
    return sessionStorage.getItem("cache_academicYear") || "";
  });
  const [yearsData, setYearsData] = useState(() => {
    const cached = sessionStorage.getItem("cache_yearsData");
    return cached && cached !== "undefined" ? JSON.parse(cached) : [];
  });
  const [selectedYearIndex, setSelectedYearIndex] = useState(0);
  const [selectedSection, setSelectedSection] = useState(() => {
    const cached = sessionStorage.getItem("cache_selectedSection");
    return cached && cached !== "undefined" ? JSON.parse(cached) : null;
  });
  const [students, setStudents] = useState([]);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(!yearsData.length);
  const [studentLoading, setStudentLoading] = useState(false);
  const [targetSectionId, setTargetSectionId] = useState("");
  const user = JSON.parse(localStorage.getItem("lms-user") || "{}");
  const deptId = user.departmentId;

  useEffect(() => {
    const fetchInitialData = async () => {
      if (!yearsData.length) setLoading(true);
      try {
        const [ayRes, sectionRes] = await Promise.all([
          getActiveAcademicYear(),
          getCurrentYearAndSections(deptId),
        ]);
        if (ayRes.success && ayRes.data.academicYears.length > 0) {
          const ayName = ayRes.data.academicYears[0].name;
          setSelectedAcademicYear(ayName);
          sessionStorage.setItem("cache_academicYear", ayName);
        }
        if (sectionRes.success) {
          const yData = sectionRes.data.years;
          setYearsData(yData);
          sessionStorage.setItem("cache_yearsData", JSON.stringify(yData));

          if (yData.length > 0 && !selectedSection) {
            const initialSec = yData[0].sections[0];
            setSelectedSection(initialSec);
            sessionStorage.setItem(
              "cache_selectedSection",
              JSON.stringify(initialSec),
            );
          }
        }
      } catch (err) {
        toast.error("Failed to load section data");
      } finally {
        setLoading(false);
      }
    };
    fetchInitialData();
  }, []);

  useEffect(() => {
    const fetchStudents = async () => {
      if (!selectedSection?._id) return;

      const cacheKey = `students_${selectedSection._id}`;
      const cachedStudents = sessionStorage.getItem(cacheKey);

      if (cachedStudents && cachedStudents !== "undefined") {
        setStudents(JSON.parse(cachedStudents));
        setStudentLoading(false);
      } else {
        setStudentLoading(true);
      }

      try {
        const res = await getSectionStudentData(selectedSection._id);
        if (res.success) {
          setStudents(res.data.students);
          sessionStorage.setItem(cacheKey, JSON.stringify(res.data.students));
        }
      } catch (err) {
        toast.error("Failed to fetch students");
      } finally {
        setStudentLoading(false);
      }
    };

    fetchStudents();
    setSelectedStudents([]);
  }, [selectedSection]);

  const filteredStudents = students.filter(
    (s) =>
      s.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.registerNumber?.includes(searchTerm),
  );

  const handleSelectAll = (e) => {
    if (e.target.checked)
      setSelectedStudents(filteredStudents.map((s) => s._id));
    else setSelectedStudents([]);
  };

  const handleToggleStudent = (id) => {
    setSelectedStudents((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  };

  const handleUpdateSection = async () => {
    if (selectedStudents.length === 0)
      return toast.error("Select at least one student");
    if (!targetSectionId) return toast.error("Select a target section");
    setStudentLoading(true);
    try {
      const res = await updateStudentSections(
        selectedStudents,
        targetSectionId,
      );
      if (res.success) {
        toast.success("Students reallocated successfully");

        const [studentRes, sectionRes] = await Promise.all([
          getSectionStudentData(selectedSection._id),
          getCurrentYearAndSections(deptId),
        ]);

        if (studentRes.success) {
          setStudents(studentRes.data.students);
          sessionStorage.setItem(
            `students_${selectedSection._id}`,
            JSON.stringify(studentRes.data.students),
          );
        }
        if (sectionRes.success) {
          setYearsData(sectionRes.data.years);
          sessionStorage.setItem(
            "cache_yearsData",
            JSON.stringify(sectionRes.data.years),
          );
        }

        setSelectedStudents([]);
        setTargetSectionId("");
      }
    } catch (err) {
      toast.error(err.message || "Failed to update sections");
    } finally {
      setStudentLoading(false);
    }
  };

  const currentYearObj = yearsData[selectedYearIndex];

  return (
    <div
      className={`transition-all duration-300 min-h-screen bg-gray-50 ${
        collapsed ? "pl-[80px]" : "pl-[300px]"
      }`}
    >
      <HeaderComponent title="Section Management" />
      <div className="px-6 py-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
        <div className="flex items-center justify-between mt-2 mb-6">
          <div className="flex items-center gap-5">
            <div className="flex items-center text-sm font-semibold text-gray-500 uppercase tracking-wider">
              Academic Year -
              <span className="text-[#08384F] px-2 font-bold text-lg">
                {loading && !selectedAcademicYear ? (
                  <Shimmer className="w-24 h-6 inline-block" />
                ) : (
                  selectedAcademicYear
                )}
              </span>
            </div>
          </div>
          <button
            onClick={handleUpdateSection}
            disabled={
              loading || studentLoading || selectedStudents.length === 0
            }
            className="flex items-center gap-2 bg-[#08384F] text-white px-6 py-2.5 rounded-xl text-sm font-semibold active:scale-95 transition-all shadow-md shadow-[#08384F]/20 disabled:opacity-50"
          >
            {studentLoading && !students.length ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <ArrowRightLeft size={18} />
            )}
            Update Section
          </button>
        </div>

        <div className="grid grid-cols-12 gap-5 h-[calc(100vh-200px)]">
          <div className="col-span-3 border border-gray-200 bg-white rounded-3xl p-5 flex flex-col gap-3 overflow-y-auto shadow-sm">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-2 mb-1">
              Select Year
            </p>
            {loading && !yearsData.length
              ? [1, 2, 3, 4].map((i) => (
                  <Shimmer key={i} className="h-14 w-full rounded-2xl" />
                ))
              : yearsData.map((item, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setSelectedYearIndex(index);
                      const firstSec = item.sections[0];
                      setSelectedSection(firstSec);
                      sessionStorage.setItem(
                        "cache_selectedSection",
                        JSON.stringify(firstSec),
                      );
                    }}
                    className={`flex items-center justify-between px-5 py-4 rounded-2xl text-[15px] font-bold transition-all border ${
                      selectedYearIndex === index
                        ? "bg-[#08384F] text-white border-[#08384F] shadow-lg scale-[1.02]"
                        : "bg-white border-gray-100 text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    Year {item.year}{" "}
                    <ChevronRight
                      size={18}
                      className={
                        selectedYearIndex === index
                          ? "opacity-100"
                          : "opacity-30"
                      }
                    />
                  </button>
                ))}
          </div>

          <div className="col-span-3 border border-gray-200 bg-white rounded-3xl p-5 flex flex-col gap-3 overflow-y-auto shadow-sm">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-2 mb-1">
              Section
            </p>
            {loading && !yearsData.length
              ? [1, 2, 3].map((i) => (
                  <Shimmer key={i} className="h-14 w-full rounded-2xl" />
                ))
              : currentYearObj?.sections.map((sec) => (
                  <button
                    key={sec._id}
                    onClick={() => {
                      setSelectedSection(sec);
                      sessionStorage.setItem(
                        "cache_selectedSection",
                        JSON.stringify(sec),
                      );
                    }}
                    className={`flex items-center justify-between px-5 py-4 rounded-2xl text-[15px] font-bold transition-all border ${
                      selectedSection?._id === sec._id
                        ? "bg-[#08384F] text-white border-[#08384F] shadow-lg scale-[1.02]"
                        : "bg-white border-gray-100 text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    <span>
                      {sec.name === "UNALLOCATED"
                        ? sec.name
                        : `Section ${sec.name}`}
                    </span>
                    <span className="text-[10px] bg-gray-100 text-[#08384F] px-2 py-0.5 rounded-full border border-gray-200">
                      {sec.studentCount}
                    </span>
                  </button>
                ))}
          </div>

          <div className="col-span-6 border border-gray-200 bg-white rounded-3xl p-6 flex flex-col overflow-hidden shadow-sm">
            <div className="flex items-center gap-4 mb-6">
              <div className="relative flex-1">
                <Search
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                  size={18}
                />
                <input
                  type="text"
                  placeholder="Search students..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:bg-white focus:ring-4 focus:ring-[#08384F]/5 focus:border-[#08384F] transition-all text-sm font-medium outline-none"
                />
              </div>
              <select
                value={targetSectionId}
                onChange={(e) => setTargetSectionId(e.target.value)}
                className="border border-gray-100 px-4 py-3 rounded-2xl text-sm font-bold text-[#08384F] outline-none bg-gray-50"
              >
                <option value="">Move to Section</option>
                {currentYearObj?.sections
                  .filter((s) => s._id !== selectedSection?._id)
                  .map((s) => (
                    <option key={s._id} value={s._id}>
                      {s.name}
                    </option>
                  ))}
              </select>
            </div>

            <div className="flex-1 overflow-y-auto pr-2 custom-scroll">
              {studentLoading && !students.length ? (
                <div className="space-y-4">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div
                      key={i}
                      className="flex gap-4 items-center px-4 py-3 bg-gray-50/50 rounded-xl"
                    >
                      <Shimmer className="w-5 h-5 rounded" />
                      <Shimmer className="w-28 h-4 rounded" />
                      <Shimmer className="flex-1 h-4 rounded" />
                    </div>
                  ))}
                </div>
              ) : (
                <table className="w-full text-left">
                  <thead className="sticky top-0 bg-white z-10 border-b border-gray-100">
                    <tr>
                      <th className="py-4 px-4 w-12">
                        <input
                          type="checkbox"
                          onChange={handleSelectAll}
                          checked={
                            filteredStudents.length > 0 &&
                            selectedStudents.length === filteredStudents.length
                          }
                          className="w-5 h-5 accent-[#08384F] rounded cursor-pointer"
                        />
                      </th>
                      <th className="py-4 px-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                        Reg Number
                      </th>
                      <th className="py-4 px-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                        Student Name
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {filteredStudents.map((student) => (
                      <tr
                        key={student._id}
                        className="group hover:bg-gray-50 transition-all"
                      >
                        <td className="py-3.5 px-4">
                          <input
                            type="checkbox"
                            checked={selectedStudents.includes(student._id)}
                            onChange={() => handleToggleStudent(student._id)}
                            className="w-5 h-5 accent-[#08384F] rounded cursor-pointer"
                          />
                        </td>
                        <td className="px-2">
                          <span className="text-[11px] font-black text-[#08384F] bg-[#08384F]/5 px-2 py-1 rounded">
                            {student.registerNumber}
                          </span>
                        </td>
                        <td className="px-2 font-bold text-gray-700 text-sm">
                          {student.fullName}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SectionManagement;
