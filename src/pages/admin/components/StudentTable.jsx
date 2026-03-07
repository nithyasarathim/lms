import React, { useState, useEffect, useRef } from "react";
import {
  Plus,
  Search,
  Edit2,
  Loader2,
  FileSpreadsheet,
  Printer,
  Eye,
  Filter,
  Power,
  Settings2,
  Check,
  ChevronUp,
  ChevronDown,
  X as CloseIcon,
} from "lucide-react";
import { getAllStudents } from "../api/admin.api";
import StudentDetailsModal from "../modal/StudentDetailsModal";
import toast from "react-hot-toast";
import * as XLSX from "xlsx";

const StudentTable = ({
  academicYearId,
  onAddClick,
  onEditClick,
  onStatusClick,
}) => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [showColConfig, setShowColConfig] = useState(false);
  const [sortConfig, setSortConfig] = useState({
    key: "yearLevel",
    direction: "asc",
  });

  const [filterDept, setFilterDept] = useState("");
  const [filterYear, setFilterYear] = useState("");
  const [filterSection, setFilterSection] = useState("");

  const [visibleColumns, setVisibleColumns] = useState({
    sNo: true,
    rollNumber: true,
    registerNumber: true,
    fullName: true,
    department: true,
    section: true,
    year: true,
    sem: true,
    email: true,
  });

  const [extraColumns, setExtraColumns] = useState([]);
  const configRef = useRef(null);

  useEffect(() => {
    fetchData();
    const handleClickOutside = (e) => {
      if (configRef.current && !configRef.current.contains(e.target))
        setShowColConfig(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [academicYearId]);

  const fetchData = async () => {
    if (!academicYearId) return;
    try {
      setLoading(true);
      const res = await getAllStudents(academicYearId);
      let studentData = res?.data?.students || [];
      if (studentData.length > 0) {
        const sortedData = studentData.sort((a, b) => {
          if (a.status === b.status)
            return (a.firstName + " " + a.lastName).localeCompare(
              b.firstName + " " + b.lastName,
            );
          return a.isActive ? -1 : 1;
        });
        setStudents(sortedData);
      } else {
        setStudents([]);
      }
    } catch (err) {
      console.error("API Fetch failed");
      toast.error("Failed to load students");
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const filteredStudents = students
    .filter((s) => {
      const fullName = `${s.firstName} ${s.lastName}`;
      const search = searchTerm.toLowerCase().trim();
      const matchesSearch =
        fullName.toLowerCase().includes(search) ||
        s.rollNumber?.toLowerCase().includes(search) ||
        s.registerNumber?.toLowerCase().includes(search) ||
        s.user?.email?.toLowerCase().includes(search);
      const matchesDept =
        filterDept === "" || s.department?.code === filterDept;
      const matchesYear =
        filterYear === "" || String(s.yearLevel) === filterYear;
      const matchesSection =
        filterSection === "" ||
        s.section?.name?.toLowerCase() === filterSection.toLowerCase();
      return matchesSearch && matchesDept && matchesYear && matchesSection;
    })
    .sort((a, b) => {
      if (sortConfig.key === "yearLevel") {
        return sortConfig.direction === "asc"
          ? a.yearLevel - b.yearLevel
          : b.yearLevel - a.yearLevel;
      }
      return 0;
    });

  const exportToExcel = () => {
    if (filteredStudents.length === 0) return toast.error("No data to export");
    const exportData = filteredStudents.map((s, index) => {
      const row = {};
      if (visibleColumns.sNo) row["S.No"] = index + 1;
      if (visibleColumns.rollNumber) row["Roll Number"] = s.rollNumber;
      if (visibleColumns.registerNumber) row["REG. NO"] = s.registerNumber;
      if (visibleColumns.fullName)
        row["Student Name"] = `${s.firstName} ${s.lastName}`;
      if (visibleColumns.department)
        row["Department"] = s.department?.name || "N/A";
      if (visibleColumns.section) row["Section"] = s.section?.name || "N/A";
      if (visibleColumns.year) row["Year"] = s.yearLevel || "N/A";
      if (visibleColumns.sem) row["SEM"] = s.semesterNumber || "N/A";
      if (visibleColumns.email) row["Email"] = s.user?.email || "N/A";
      extraColumns.forEach((col) => (row[col.title] = ""));
      return row;
    });
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Students");
    XLSX.writeFile(wb, "Student_Records.xlsx");
  };

  const toggleColumn = (col) =>
    setVisibleColumns((prev) => ({ ...prev, [col]: !prev[col] }));

  const addExtraColumn = () => {
    const title = prompt("Enter Column Title (e.g. Signature, Remarks):");
    if (title) {
      setExtraColumns([...extraColumns, { id: Date.now(), title }]);
    }
  };

  const uniqueDepts = [...new Set(students.map((s) => s.department?.code))]
    .filter(Boolean)
    .sort();

  const uniqueYears = [...new Set(students.map((s) => String(s.yearLevel)))]
    .filter(Boolean)
    .sort((a, b) => Number(a) - Number(b));

  const uniqueSections = [...new Set(students.map((s) => s.section?.name))]
    .filter(Boolean)
    .sort();

  const ShimmerRow = () => (
    <tr className="animate-pulse border-b border-gray-50">
      {visibleColumns.sNo && (
        <td className="px-6 py-5">
          <div className="h-3 bg-gray-200 rounded-full w-4 mx-auto"></div>
        </td>
      )}
      {visibleColumns.rollNumber && (
        <td className="px-6 py-5">
          <div className="h-3 bg-gray-200 rounded-full w-16 mx-auto"></div>
        </td>
      )}
      {visibleColumns.fullName && (
        <td className="px-4 py-5">
          <div className="h-4 bg-gray-200 rounded-full w-32"></div>
        </td>
      )}
      {visibleColumns.department && (
        <td className="px-4 py-5">
          <div className="h-5 bg-gray-100 rounded-md w-12"></div>
        </td>
      )}
      {visibleColumns.section && (
        <td className="px-4 py-5">
          <div className="h-3 bg-gray-200 rounded-full w-4 mx-auto"></div>
        </td>
      )}
      {visibleColumns.year && (
        <td className="px-4 py-5">
          <div className="h-3 bg-gray-200 rounded-full w-4 mx-auto"></div>
        </td>
      )}
      {visibleColumns.sem && (
        <td className="px-4 py-5">
          <div className="h-3 bg-gray-200 rounded-full w-4 mx-auto"></div>
        </td>
      )}
      {visibleColumns.email && (
        <td className="px-4 py-5">
          <div className="h-3 bg-gray-200 rounded-full w-24 mx-auto"></div>
        </td>
      )}
      <td className="px-8 py-5">
        <div className="flex gap-2 justify-end">
          <div className="h-8 w-8 bg-gray-100 rounded-lg"></div>
          <div className="h-8 w-8 bg-gray-100 rounded-lg"></div>
          <div className="h-8 w-8 bg-gray-100 rounded-lg"></div>
        </div>
      </td>
    </tr>
  );

  return (
    <div className="bg-white border border-gray-100 rounded-3xl overflow-hidden flex flex-col h-[calc(100vh-350px)] min-h-[400px] font-['Poppins'] relative">
      <div className="px-8 py-5 border-b border-gray-50 bg-white print:hidden">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold text-[#08384F]">
              Student Information
            </h2>
            <span className="text-[#08384F] text-sm font-bold py-1 rounded-full uppercase tracking-wider ">
              ({filteredStudents.length})
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative" ref={configRef}>
              <button
                onClick={() => setShowColConfig(!showColConfig)}
                className={`p-2.5 flex items-center gap-2 rounded-xl border transition-all ${showColConfig ? "bg-[#08384F] text-white border-[#08384F]" : "bg-gray-50 text-gray-600 border-gray-100 hover:bg-gray-100"}`}
              >
                <Settings2 size={18} />
                <span className="font-semibold text-sm">Configure</span>
              </button>
              {showColConfig && (
                <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-100 rounded-2xl shadow-2xl z-[100] p-3 animate-in fade-in slide-in-from-top-2 duration-200">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-2 pb-2 border-b border-gray-50 mb-2">
                    Visible Columns
                  </p>
                  <div className="space-y-1 max-h-40 overflow-y-auto custom-scrollbar">
                    {Object.keys(visibleColumns).map((key) => (
                      <button
                        key={key}
                        onClick={() => toggleColumn(key)}
                        className="w-full flex items-center justify-between px-2 py-1.5 hover:bg-gray-50 rounded-lg group"
                      >
                        <span className="text-xs font-semibold text-gray-600 capitalize">
                          {key === "sNo"
                            ? "S.No"
                            : key.replace(/([A-Z])/g, " $1")}
                        </span>
                        <div
                          className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${visibleColumns[key] ? "bg-[#08384F] border-[#08384F]" : "border-gray-300"}`}
                        >
                          {visibleColumns[key] && (
                            <Check size={10} className="text-white" />
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-2 pt-3 pb-2 border-b border-gray-50 mt-2 mb-2">
                    Extra Print Columns
                  </p>
                  <div className="space-y-2">
                    {extraColumns.map((col) => (
                      <div
                        key={col.id}
                        className="flex items-center justify-between bg-gray-50 px-2 py-1 rounded-lg"
                      >
                        <span className="text-[11px] font-bold text-[#08384F]">
                          {col.title}
                        </span>
                        <button
                          onClick={() =>
                            setExtraColumns(
                              extraColumns.filter((c) => c.id !== col.id),
                            )
                          }
                          className="text-red-400 hover:text-red-600"
                        >
                          <CloseIcon size={14} />
                        </button>
                      </div>
                    ))}
                    <button
                      onClick={addExtraColumn}
                      className="w-full py-2 border border-dashed border-gray-200 rounded-lg text-[10px] font-bold text-gray-400 hover:border-[#08384F] hover:text-[#08384F] transition-all"
                    >
                      + Add Empty Column
                    </button>
                  </div>
                </div>
              )}
            </div>
            <button
              onClick={exportToExcel}
              className="p-2.5 bg-emerald-50 text-emerald-600 flex items-center rounded-xl border border-emerald-100 hover:bg-emerald-100 transition-colors"
            >
              <FileSpreadsheet size={18} />{" "}
              <span className="font-semibold text-sm px-2">Excel</span>
            </button>
            <button
              onClick={() => window.print()}
              className="p-2.5 bg-gray-50 text-gray-600 flex items-center rounded-xl border border-gray-100 hover:bg-gray-100 transition-colors"
            >
              <Printer size={18} />{" "}
              <span className="font-semibold text-sm px-2">Print</span>
            </button>
            <button
              onClick={onAddClick}
              className="flex items-center gap-2 bg-[#08384F] text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-[#0b3a53] transition-all"
            >
              <Plus size={18} /> Add Student
            </button>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={16}
            />
            <input
              type="text"
              placeholder="Search by name, roll no, reg no..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-100 rounded-xl text-sm outline-none focus:border-[#08384F]"
            />
          </div>
          <select
            value={filterDept}
            onChange={(e) => setFilterDept(e.target.value)}
            className="px-4 py-2 bg-gray-50 border border-gray-100 rounded-xl text-xs font-bold text-gray-500 outline-none cursor-pointer"
          >
            <option value="">All Depts</option>
            {uniqueDepts.map((dept) => (
              <option key={dept} value={dept}>
                {dept}
              </option>
            ))}
          </select>
          <select
            value={filterYear}
            onChange={(e) => setFilterYear(e.target.value)}
            className="px-4 py-2 bg-gray-50 border border-gray-100 rounded-xl text-xs font-bold text-gray-500 outline-none cursor-pointer"
          >
            <option value="">All Years</option>
            {uniqueYears.map((year) => (
              <option key={year} value={year}>
                {year === "1"
                  ? "1st Year"
                  : year === "2"
                    ? "2nd Year"
                    : year === "3"
                      ? "3rd Year"
                      : year === "4"
                        ? "4th Year"
                        : year}
              </option>
            ))}
          </select>
          <select
            value={filterSection}
            onChange={(e) => setFilterSection(e.target.value)}
            className="px-4 py-2 bg-gray-50 border border-gray-100 rounded-xl text-xs font-bold text-gray-500 outline-none cursor-pointer"
          >
            <option value="">All Sections</option>
            {uniqueSections.map((sec) => (
              <option key={sec} value={sec}>
                Section {sec}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar relative print:overflow-visible">
        <table className="w-full text-left border-collapse min-w-[1100px]">
          <thead className="sticky top-0 bg-[#08384F] z-20 print:static">
            <tr className="text-[11px] font-bold text-white uppercase tracking-widest">
              {visibleColumns.sNo && (
                <th className="px-6 py-4 text-center">S.No</th>
              )}
              {visibleColumns.rollNumber && (
                <th className="px-3 py-4 text-center">Roll No</th>
              )}
              {visibleColumns.fullName && (
                <th className="px-2 py-4">Student Name</th>
              )}
              {visibleColumns.department && <th className="px-4 py-4">Dept</th>}
              {visibleColumns.section && (
                <th className="px-2 py-4 text-center">Sec</th>
              )}
              {visibleColumns.year && (
                <th
                  className="px-4 py-4 text-center cursor-pointer select-none group"
                  onClick={() => handleSort("yearLevel")}
                >
                  <div className="flex items-center justify-center gap-1">
                    Year
                    <div className="flex flex-col opacity-50 group-hover:opacity-100 transition-opacity">
                      <ChevronUp
                        size={10}
                        className={
                          sortConfig.key === "yearLevel" &&
                          sortConfig.direction === "asc"
                            ? "text-white opacity-100"
                            : ""
                        }
                      />
                      <ChevronDown
                        size={10}
                        className={
                          sortConfig.key === "yearLevel" &&
                          sortConfig.direction === "desc"
                            ? "text-white opacity-100"
                            : ""
                        }
                      />
                    </div>
                  </div>
                </th>
              )}
              {visibleColumns.sem && (
                <th className="px-4 py-4 text-center">SEM</th>
              )}
              {visibleColumns.email && (
                <th className="px-2 py-4 text-center">Email</th>
              )}
              {extraColumns.map((col) => (
                <th
                  key={col.id}
                  className="px-4 py-4 text-center border-l border-white/20 hidden print:table-cell"
                >
                  {col.title}
                </th>
              ))}
              <th className="px-8 py-4 text-center print:hidden">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 font-medium">
            {loading ? (
              [...Array(6)].map((_, i) => <ShimmerRow key={i} />)
            ) : filteredStudents.length > 0 ? (
              filteredStudents.map((student, index) => (
                <tr
                  key={student._id}
                  className="hover:bg-gray-50/50 group transition-colors print:opacity-100"
                >
                  {visibleColumns.sNo && (
                    <td className="px-6 py-4 text-xs text-gray-400 font-bold text-center">
                      {index + 1}
                    </td>
                  )}
                  {visibleColumns.rollNumber && (
                    <td className="px-6 py-4 text-xs text-gray-500 font-bold text-center">
                      {student.rollNumber || "N/A"}
                    </td>
                  )}
                  {visibleColumns.fullName && (
                    <td className="px-4 py-6 text-sm text-[#08384F] font-semibold">
                      {student.firstName} {student.lastName}
                    </td>
                  )}
                  {visibleColumns.department && (
                    <td className="px-4 py-4">
                      <span className="text-[10px] font-bold bg-gray-100 px-2 py-1 rounded-md text-gray-500">
                        {student.department?.code}
                      </span>
                    </td>
                  )}
                  {visibleColumns.section && (
                    <td className="px-4 py-4 text-xs text-gray-600 text-center font-bold">
                      {student.section?.name === "UNALLOCATED"
                        ? "U"
                        : student.section?.name || "N/A"}
                    </td>
                  )}
                  {visibleColumns.year && (
                    <td className="px-4 py-4 text-xs text-gray-600 text-center font-bold">
                      {student.yearLevel}
                    </td>
                  )}
                  {visibleColumns.sem && (
                    <td className="px-4 py-4 text-xs text-gray-600 text-center font-bold">
                      {student.semesterNumber || "N/A"}
                    </td>
                  )}
                  {visibleColumns.email && (
                    <td className="px-4 py-4 text-center text-xs text-gray-500">
                      {student.user?.email}
                    </td>
                  )}
                  {extraColumns.map((col) => (
                    <td
                      key={col.id}
                      className="px-4 py-4 border-l border-gray-100 min-w-[120px] hidden print:table-cell"
                    ></td>
                  ))}
                  <td className="px-8 py-4 text-right print:hidden">
                    <div className="flex gap-1 justify-end">
                      <button
                        onClick={() => {
                          setSelectedStudent(student);
                          setIsViewModalOpen(true);
                        }}
                        className="p-2 text-blue-500 bg-blue-50 rounded-lg hover:bg-blue-100"
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        onClick={() => onEditClick(student)}
                        className="p-2 text-orange-500 bg-orange-50 rounded-lg hover:bg-orange-100"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() =>
                          onStatusClick({
                            ...student,
                            isActive: student.isActive,
                          })
                        }
                        className={`p-2 rounded-lg ${
                          student.isActive
                            ? "text-red-500 bg-red-50"
                            : "text-green-500 bg-green-50"
                        }`}
                      >
                        <Power size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="12"
                  className="py-20 text-center text-gray-400 font-semibold"
                >
                  No students found for this academic year
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {isViewModalOpen && (
        <StudentDetailsModal
          isOpen={isViewModalOpen}
          onClose={() => setIsViewModalOpen(false)}
          student={selectedStudent}
        />
      )}
    </div>
  );
};

export default StudentTable;
