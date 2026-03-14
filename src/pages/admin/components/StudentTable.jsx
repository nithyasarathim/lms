import React, { useState, useEffect, useRef } from "react";
import Eshwar from "../../../assets/eshwar.png";
import {
  Plus,
  Search,
  Edit2,
  Loader2,
  FileSpreadsheet,
  Printer,
  Eye,
  Power,
  Settings2,
  Check,
  ChevronUp,
  ChevronDown,
  X as CloseIcon,
} from "lucide-react";
import { getAllStudents } from "../api/admin.api";
import StudentDetailsModal from "../modals/StudentDetailsModal";
import toast from "react-hot-toast";
import * as XLSX from "xlsx";

let studentCache = {};

const StudentTable = ({
  academicYearId,
  onAddClick,
  onEditClick,
  onStatusClick,
}) => {
  const [students, setStudents] = useState(() => {
    return academicYearId && studentCache[academicYearId]
      ? studentCache[academicYearId]
      : [];
  });

  const [loading, setLoading] = useState(() => {
    return !(academicYearId && studentCache[academicYearId]);
  });

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
  const [filterSemType, setFilterSemType] = useState("odd");
  const [filterStatus, setFilterStatus] = useState("");

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
    if (!academicYearId) return;
    if (studentCache[academicYearId]) {
      setStudents(studentCache[academicYearId]);
      setLoading(false);
    } else {
      fetchData();
    }
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
      if (!studentCache[academicYearId]) setLoading(true);
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
        studentCache[academicYearId] = sortedData;
        setStudents(sortedData);
      } else {
        studentCache[academicYearId] = [];
        setStudents([]);
      }
    } catch (err) {
      toast.error("Failed to load students");
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc")
      direction = "desc";
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
      const semNum = Number(s.semesterNumber);
      const isEven = semNum % 2 === 0;
      const matchesSemType = filterSemType === "odd" ? !isEven : isEven;
      const matchesStatus =
        filterStatus === "" ||
        (filterStatus === "active" ? s.isActive : !s.isActive);
      return (
        matchesSearch &&
        matchesDept &&
        matchesYear &&
        matchesSection &&
        matchesSemType &&
        matchesStatus
      );
    })
    .sort((a, b) => {
      if (sortConfig.key === "yearLevel")
        return sortConfig.direction === "asc"
          ? a.yearLevel - b.yearLevel
          : b.yearLevel - a.yearLevel;
      return 0;
    });

  const exportToExcel = () => {
    if (filteredStudents.length === 0) return toast.error("No data to export");
    const exportData = filteredStudents.map((s, index) => {
      const row = {};
      if (visibleColumns.sNo) row["S.No"] = index + 1;
      if (visibleColumns.rollNumber) row["Roll Number"] = s.rollNumber || "";
      if (visibleColumns.registerNumber)
        row["REG. NO"] = s.registerNumber || "";
      if (visibleColumns.fullName)
        row["Student Name"] = `${s.firstName} ${s.lastName}`;
      if (visibleColumns.department)
        row["Department"] = s.department?.code || "";
      if (visibleColumns.section) row["Section"] = s.section?.name || "";
      if (visibleColumns.year) row["Year"] = s.yearLevel || "";
      if (visibleColumns.sem) row["SEM"] = s.semesterNumber || "";
      if (visibleColumns.email) row["Email"] = s.user?.email || "";
      extraColumns.forEach((col) => (row[col.title] = ""));
      return row;
    });
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Students");
    XLSX.writeFile(wb, "Student_Records.xlsx");
  };

  const handlePrint = () => {
    const printWindow = window.open("", "_blank");
    const printHtml = `
      <html>
        <head>
          <title>Student Records</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');
            body { font-family: 'Poppins', sans-serif; padding: 10px; color: #333; margin: 0; }
            .header-container { display: flex; align-items: center; justify-content: space-between; border-bottom: 2px solid #08384F; padding-bottom: 10px; margin-bottom: 15px; }
            .logo { height: 60px; }
            .report-title { text-align: right; }
            .report-title h1 { margin: 0; color: #08384F; font-size: 18px; }
            .report-title p { margin: 2px 0 0 0; font-size: 10px; color: #666; }
            .filter-info { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; background: #f9f9f9; padding: 10px; border-radius: 8px; margin-bottom: 15px; font-size: 10px; border: 1px solid #eee; }
            .filter-label { font-weight: 700; color: #08384F; text-transform: uppercase; margin-right: 4px; }
            table { width: 100%; border-collapse: collapse; font-size: 10px; border: 1px solid #ccc; }
            th { background-color: #08384F !important; color: white !important; -webkit-print-color-adjust: exact; padding: 6px 4px; text-align: left; border: 1px solid #ccc; text-transform: uppercase; }
            td { padding: 4px; border: 1px solid #ccc; }
            tr:nth-child(even) { background-color: #fcfcfc; }
            @media print { .no-print { display: none; } @page { margin: 1cm; } }
          </style>
        </head>
        <body>
          <div class="header-container">
            <img src="${Eshwar}" class="logo" />
            <div class="report-title">
              <h1>Student Information Report</h1>
              <p>Date: ${new Date().toLocaleDateString()} | Time: ${new Date().toLocaleTimeString()}</p>
            </div>
          </div>
          <div class="filter-info">
            <div><span class="filter-label">Dept:</span> ${filterDept || "All"}</div>
            <div><span class="filter-label">Sec:</span> ${filterSection || "All"}</div>
            <div><span class="filter-label">Year:</span> ${filterYear || "All"}</div>
            <div><span class="filter-label">Sem Type:</span> ${filterSemType}</div>
            <div><span class="filter-label">Status:</span> ${filterStatus || "All"}</div>
            <div><span class="filter-label">Search:</span> ${searchTerm || "None"}</div>
          </div>
          <table>
            <thead>
              <tr>
                ${visibleColumns.sNo ? "<th>S.No</th>" : ""}
                ${visibleColumns.rollNumber ? "<th>Roll No</th>" : ""}
                ${visibleColumns.registerNumber ? "<th>Reg.No</th>" : ""}
                ${visibleColumns.fullName ? "<th>Name</th>" : ""}
                ${visibleColumns.department ? "<th>Dept</th>" : ""}
                ${visibleColumns.section ? "<th>Sec</th>" : ""}
                ${visibleColumns.year ? "<th>Year</th>" : ""}
                ${visibleColumns.sem ? "<th>Sem</th>" : ""}
                ${visibleColumns.email ? "<th>Email</th>" : ""}
                ${extraColumns.map((col) => `<th>${col.title}</th>`).join("")}
              </tr>
            </thead>
            <tbody>
              ${filteredStudents
                .map(
                  (s, i) => `
                <tr>
                  ${visibleColumns.sNo ? `<td>${i + 1}</td>` : ""}
                  ${visibleColumns.rollNumber ? `<td>${s.rollNumber || ""}</td>` : ""}
                  ${visibleColumns.registerNumber ? `<td>${s.registerNumber || ""}</td>` : ""}
                  ${visibleColumns.fullName ? `<td>${s.firstName} ${s.lastName}</td>` : ""}
                  ${visibleColumns.department ? `<td>${s.department?.code || ""}</td>` : ""}
                  ${visibleColumns.section ? `<td>${s.section?.name || ""}</td>` : ""}
                  ${visibleColumns.year ? `<td>${s.yearLevel || ""}</td>` : ""}
                  ${visibleColumns.sem ? `<td>${s.semesterNumber || ""}</td>` : ""}
                  ${visibleColumns.email ? `<td>${s.user?.email || ""}</td>` : ""}
                  ${extraColumns.map(() => `<td></td>`).join("")}
                </tr>
              `,
                )
                .join("")}
            </tbody>
          </table>
          <script>
            window.onload = function() { window.print(); setTimeout(function() { window.close(); }, 500); };
          </script>
        </body>
      </html>
    `;
    printWindow.document.write(printHtml);
    printWindow.document.close();
  };

  const toggleColumn = (col) =>
    setVisibleColumns((prev) => ({ ...prev, [col]: !prev[col] }));

  const addExtraColumn = () => {
    const title = prompt("Enter Column Title:");
    if (title) setExtraColumns([...extraColumns, { id: Date.now(), title }]);
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
      <td className="px-6 py-2">
        <div className="h-3 bg-gray-100 rounded w-4 mx-auto"></div>
      </td>
      <td className="px-6 py-2">
        <div className="h-3 bg-gray-100 rounded w-16 mx-auto"></div>
      </td>
      <td className="px-4 py-2">
        <div className="h-3 bg-gray-100 rounded w-32"></div>
      </td>
      <td className="px-4 py-2">
        <div className="h-3 bg-gray-100 rounded w-12"></div>
      </td>
      <td className="px-4 py-2">
        <div className="h-3 bg-gray-100 rounded w-4 mx-auto"></div>
      </td>
      <td className="px-4 py-2">
        <div className="h-3 bg-gray-100 rounded w-4 mx-auto"></div>
      </td>
      <td className="px-4 py-2">
        <div className="h-3 bg-gray-100 rounded w-4 mx-auto"></div>
      </td>
      <td className="px-4 py-2">
        <div className="h-3 bg-gray-100 rounded w-24 mx-auto"></div>
      </td>
      <td className="px-8 py-2">
        <div className="flex gap-2 justify-end">
          <div className="h-8 w-24 bg-gray-50 rounded-lg"></div>
        </div>
      </td>
    </tr>
  );

  return (
    <div className="bg-white border border-gray-100 rounded-3xl overflow-hidden flex flex-col h-[calc(100vh-320px)] min-h-[400px] font-['Poppins'] relative">
      <div className="px-8 py-5 border-b border-gray-50 bg-white print:hidden">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold text-[#08384F]">
              Student Information
            </h2>
            <span className="text-[#08384F] text-sm font-bold">
              ({filteredStudents.length})
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative" ref={configRef}>
              <button
                onClick={() => setShowColConfig(!showColConfig)}
                className={`p-2.5 flex items-center gap-2 rounded-xl border transition-all ${showColConfig ? "bg-[#08384F] text-white border-[#08384F]" : "bg-gray-50 text-gray-600 border-gray-100"}`}
              >
                <Settings2 size={18} />
                <span className="font-semibold text-sm">Configure Export</span>
              </button>
              {showColConfig && (
                <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-100 rounded-2xl shadow-2xl z-[100] p-3">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pb-2 border-b mb-2">
                    Visible Export Columns
                  </p>
                  <div className="space-y-1 max-h-40 overflow-y-auto custom-scrollbar">
                    {Object.keys(visibleColumns).map((key) => (
                      <button
                        key={key}
                        onClick={() => toggleColumn(key)}
                        className="w-full flex items-center justify-between px-2 py-1.5 hover:bg-gray-50 rounded-lg"
                      >
                        <span className="text-xs font-semibold text-gray-600 capitalize">
                          {key.replace(/([A-Z])/g, " $1")}
                        </span>
                        <div
                          className={`w-4 h-4 rounded border flex items-center justify-center ${visibleColumns[key] ? "bg-[#08384F] border-[#08384F]" : "border-gray-300"}`}
                        >
                          {visibleColumns[key] && (
                            <Check size={10} className="text-white" />
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pt-3 pb-2 border-b mt-2 mb-2">
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
                          className="text-red-400"
                        >
                          <CloseIcon size={14} />
                        </button>
                      </div>
                    ))}
                    <button
                      onClick={addExtraColumn}
                      className="w-full py-2 border border-dashed rounded-lg text-[10px] font-bold text-gray-400 hover:text-[#08384F]"
                    >
                      + Add Column
                    </button>
                  </div>
                </div>
              )}
            </div>
            <button
              onClick={exportToExcel}
              className="p-2.5 bg-emerald-50 text-emerald-600 flex items-center rounded-xl border border-emerald-100"
            >
              <FileSpreadsheet size={18} />
              <span className="font-semibold text-sm px-2">Excel</span>
            </button>
            <button
              onClick={handlePrint}
              className="p-2.5 bg-gray-50 text-gray-600 flex items-center rounded-xl border border-gray-100"
            >
              <Printer size={18} />
              <span className="font-semibold text-sm px-2">Print</span>
            </button>
            <button
              onClick={onAddClick}
              className="flex items-center gap-2 bg-[#08384F] text-white px-5 py-2.5 rounded-xl text-sm font-bold"
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
              placeholder="Search students..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-100 rounded-xl text-sm outline-none focus:border-[#08384F]"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 bg-gray-50 border border-gray-100 rounded-xl text-xs font-bold text-gray-500"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
          <select
            value={filterSemType}
            onChange={(e) => setFilterSemType(e.target.value)}
            className="px-4 py-2 bg-gray-50 border border-gray-100 rounded-xl text-xs font-bold text-[#08384F]"
          >
            <option value="odd">Odd Sem</option>
            <option value="even">Even Sem</option>
          </select>
          <select
            value={filterDept}
            onChange={(e) => setFilterDept(e.target.value)}
            className="px-4 py-2 bg-gray-50 border border-gray-100 rounded-xl text-xs font-bold text-gray-500"
          >
            <option value="">All Depts</option>
            {uniqueDepts.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
          <select
            value={filterYear}
            onChange={(e) => setFilterYear(e.target.value)}
            className="px-4 py-2 bg-gray-50 border border-gray-100 rounded-xl text-xs font-bold text-gray-500"
          >
            <option value="">All Years</option>
            {uniqueYears.map((y) => (
              <option key={y} value={y}>
                {y} Year
              </option>
            ))}
          </select>
          <select
            value={filterSection}
            onChange={(e) => setFilterSection(e.target.value)}
            className="px-4 py-2 bg-gray-50 border border-gray-100 rounded-xl text-xs font-bold text-gray-500"
          >
            <option value="">All Sections</option>
            {uniqueSections.map((s) => (
              <option key={s} value={s}>
                Section {s}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto relative">
        <table className="w-full text-left border-collapse min-w-[1000px]">
          <thead className="sticky top-0 bg-[#08384F] z-20">
            <tr className="text-[11px] font-bold text-white uppercase tracking-widest">
              <th className="px-6 py-4 text-center">S.No</th>
              <th className="px-3 py-4 text-center">Roll No</th>
              <th className="px-2 py-4">Student Name</th>
              <th className="px-4 py-4">Dept</th>
              <th className="px-2 py-4 text-center">Sec</th>
              <th
                className="px-4 py-4 text-center cursor-pointer"
                onClick={() => handleSort("yearLevel")}
              >
                <div className="flex items-center justify-center gap-1">
                  Year{" "}
                  {sortConfig.key === "yearLevel" &&
                    (sortConfig.direction === "asc" ? (
                      <ChevronUp size={10} />
                    ) : (
                      <ChevronDown size={10} />
                    ))}
                </div>
              </th>
              <th className="px-4 py-4 text-center">SEM</th>
              <th className="px-2 py-4 text-center">Email</th>
              <th className="px-8 py-4 text-center print:hidden">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading
              ? [...Array(6)].map((_, i) => <ShimmerRow key={i} />)
              : filteredStudents.map((student, index) => (
                  <tr
                    key={student._id}
                    className="hover:bg-gray-50/50 transition-colors"
                  >
                    <td className="px-6 py-2 text-xs text-gray-400 font-bold text-center">
                      {index + 1}
                    </td>
                    <td className="px-6 py-2 text-xs text-gray-500 font-bold text-center">
                      {student.rollNumber || "N/A"}
                    </td>
                    <td className="px-4 text-sm text-[#08384F] font-semibold">
                      {student.firstName} {student.lastName}
                    </td>
                    <td className="px-4 py-2">
                      <span className="text-[10px] font-bold bg-gray-100 px-2 py-1 rounded-md text-gray-500">
                        {student.department?.code}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-xs text-gray-600 text-center font-bold">
                      {student.section?.name === "UNALLOCATED"
                        ? "U"
                        : student.section?.name || "N/A"}
                    </td>
                    <td className="px-4 py-2 text-xs text-gray-600 text-center font-bold">
                      {student.yearLevel}
                    </td>
                    <td className="px-4 py-2 text-xs text-gray-600 text-center font-bold">
                      {student.semesterNumber || "N/A"}
                    </td>
                    <td className="px-4 py-2 text-center text-xs text-gray-500">
                      {student.user?.email}
                    </td>
                    <td className="px-8 py-2 text-right print:hidden">
                      <div className="flex gap-1 justify-end">
                        <button
                          onClick={() => {
                            setSelectedStudent(student);
                            setIsViewModalOpen(true);
                          }}
                          className="p-2 text-blue-500 bg-blue-50 rounded-lg"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={() => onEditClick(student)}
                          className="p-2 text-orange-500 bg-orange-50 rounded-lg"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => onStatusClick(student)}
                          className={`p-2 rounded-lg ${student.isActive ? "text-red-500 bg-red-50" : "text-green-500 bg-green-50"}`}
                        >
                          <Power size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
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
