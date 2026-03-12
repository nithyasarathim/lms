import React, { useState, useEffect } from "react";
import {
  ChevronRight,
  Search,
  ArrowRightLeft,
  Loader2,
  Users,
} from "lucide-react";
import HeaderComponent from "../../shared/components/HeaderComponent";
import {
  getActiveAcademicYear,
  getCurrentYearAndSections,
  getSectionStudentData,
  updateStudentSections,
} from "../api/hod.api";
import toast from "react-hot-toast";

const SectionManagement = () => {
  const [selectedAcademicYear, setSelectedAcademicYear] = useState("");
  const [yearsData, setYearsData] = useState([]);
  const [selectedYearIndex, setSelectedYearIndex] = useState(0);
  const [selectedSection, setSelectedSection] = useState(null);
  const [students, setStudents] = useState([]);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [studentLoading, setStudentLoading] = useState(false);
  const [targetSectionId, setTargetSectionId] = useState("");

  useEffect(() => {
    const fetchInitialData = async () => {
      setLoading(true);
      try {
        const [ayRes, sectionRes] = await Promise.all([
          getActiveAcademicYear(),
          getCurrentYearAndSections(),
        ]);

        if (ayRes.success && ayRes.data.academicYears.length > 0) {
          setSelectedAcademicYear(ayRes.data.academicYears[0].name);
        }

        if (sectionRes.success) {
          setYearsData(sectionRes.data.years);
          if (sectionRes.data.years.length > 0) {
            const firstYear = sectionRes.data.years[0];
            if (firstYear.sections.length > 0) {
              setSelectedSection(firstYear.sections[0]);
            }
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
      setStudentLoading(true);
      try {
        const res = await getSectionStudentData(selectedSection._id);
        if (res.success) {
          setStudents(res.data.students);
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

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center">
        <Loader2 className="animate-spin text-[#08384F]" size={40} />
      </div>
    );
  }

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

        // Refresh data: Fetch students for current section and refresh year/section counts
        const [studentRes, sectionRes] = await Promise.all([
          getSectionStudentData(selectedSection._id),
          getCurrentYearAndSections(),
        ]);

        setStudents(studentRes.data.students);
        setYearsData(sectionRes.data.years);
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
    <>
      <HeaderComponent title="Section Management" />
      <div className="px-4 mx-2 animate-in fade-in slide-in-from-bottom-2 duration-300">
        <div className="flex items-center justify-between mt-5">
          <div className="flex items-center gap-5">
            <p className="text-sm font-semibold text-gray-500">
              ACADEMIC YEAR -
              <span className="text-[#08384F] px-1 font-semibold text-base">
                {selectedAcademicYear}
              </span>
            </p>
          </div>
          <div className="flex items-center gap-3 mb-4">
            <button
              onClick={handleUpdateSection}
              disabled={studentLoading || selectedStudents.length === 0}
              className="flex items-center gap-2 bg-[#08384F] text-white px-6 py-2 rounded-xl text-sm font-semibold active:scale-95 transition-all shadow-md shadow-[#08384F]/20 disabled:opacity-50"
            >
              {studentLoading ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <ArrowRightLeft size={18} />
              )}
              Update Section
            </button>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-4 h-[calc(100vh-210px)] mt-2">
          {/* Column 1: Year Selection */}
          <div className="col-span-3 border border-gray-200 bg-white rounded-2xl p-4 flex flex-col gap-3 overflow-y-auto shadow-sm">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest px-2 mb-1">
              Select Year
            </p>
            {yearsData.map((item, index) => (
              <button
                key={index}
                onClick={() => {
                  setSelectedYearIndex(index);
                  setSelectedSection(item.sections[0]);
                }}
                className={`flex items-center justify-between px-5 py-4 rounded-2xl text-[15px] font-semibold transition-all border ${
                  selectedYearIndex === index
                    ? "bg-[#08384F] text-white border-[#08384F] shadow-lg shadow-[#08384F]/10 scale-[1.02]"
                    : "bg-white border-gray-100 text-gray-600 hover:bg-gray-50"
                }`}
              >
                Year {item.year}
                <ChevronRight
                  size={18}
                  className={
                    selectedYearIndex === index ? "opacity-100" : "opacity-30"
                  }
                />
              </button>
            ))}
          </div>

          {/* Column 2: Section Selection */}
          <div className="col-span-3 border border-gray-200 bg-white rounded-2xl p-4 flex flex-col gap-3 overflow-y-auto shadow-sm">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest px-2 mb-1">
              Section
            </p>
            {currentYearObj?.sections.map((sec) => (
              <button
                key={sec._id}
                onClick={() => setSelectedSection(sec)}
                className={`flex items-center justify-between px-5 py-4 rounded-2xl text-[15px] font-semibold transition-all border ${
                  selectedSection?._id === sec._id
                    ? "bg-[#08384F] text-white border-[#08384F] shadow-lg shadow-[#08384F]/10 scale-[1.02]"
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

          {/* Column 3: Student List */}
          <div className="col-span-6 border border-gray-200 bg-white rounded-2xl p-5 flex flex-col overflow-hidden shadow-sm">
            <div className="flex items-center gap-3 mb-5">
              <div className="relative flex-1">
                <Search
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                  size={20}
                />
                <input
                  type="text"
                  placeholder="Search register number or name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white focus:ring-4 focus:ring-[#08384F]/5 focus:border-[#08384F] transition-all text-sm font-medium outline-none"
                />
              </div>
              <select
                value={targetSectionId}
                onChange={(e) => setTargetSectionId(e.target.value)}
                className="border border-gray-200 px-4 py-3 rounded-2xl text-sm font-semibold text-[#08384F] outline-none bg-gray-50"
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
              {studentLoading ? (
                <div className="flex flex-col items-center justify-center h-full gap-2">
                  <Loader2 className="animate-spin text-[#08384F]" size={30} />
                  <p className="text-xs text-gray-400 uppercase font-bold tracking-widest">
                    Loading Students...
                  </p>
                </div>
              ) : (
                <table className="w-full text-left">
                  <thead className="sticky top-0 bg-white z-10 border-b border-gray-100">
                    <tr>
                      <th className="py-3 px-4">
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
                      <th className="py-3 px-2 text-[11px] font-black text-gray-400 uppercase tracking-wider">
                        Reg Number
                      </th>
                      <th className="py-3 px-2 text-[11px] font-black text-gray-400 uppercase tracking-wider">
                        Student Name
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {filteredStudents.length > 0 ? (
                      filteredStudents.map((student) => (
                        <tr
                          key={student._id}
                          className="group hover:bg-gray-50/50 transition-colors"
                        >
                          <td className="py-4 px-4">
                            <input
                              type="checkbox"
                              checked={selectedStudents.includes(student._id)}
                              onChange={() => handleToggleStudent(student._id)}
                              className="w-5 h-5 accent-[#08384F] rounded cursor-pointer"
                            />
                          </td>
                          <td className="py-4 px-2">
                            <p className="text-[11px] font-black text-[#08384F] leading-none mb-1 uppercase tracking-wider">
                              {student.registerNumber}
                            </p>
                          </td>
                          <td className="py-4 px-2">
                            <p className="text-[15px] font-semibold text-gray-800 leading-tight truncate">
                              {student.fullName}
                            </p>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan="3"
                          className="py-10 text-center text-gray-400 text-sm font-semibold italic"
                        >
                          No students found in Year {currentYearObj?.year} -{" "}
                          {selectedSection?.name}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default SectionManagement;
