import React, { useState, useEffect, useRef } from "react";
import {
  Plus,
  Search,
  Edit2,
  Loader2,
  FileSpreadsheet,
  Printer,
  Eye,
  Copy,
  Filter,
  Power,
  Settings2,
  Check,
  X as CloseIcon,
} from "lucide-react";
import { getAllStudents } from "../api/admin.api";
import StudentDetailsModal from "../modal/StudentDetailsModal";
import toast from "react-hot-toast";
import * as XLSX from "xlsx";

let studentCache = [
  {
    _id: "s1",
    studentId: "STU001",
    fullName: "Aditya Verma",
    firstName: "Aditya",
    lastName: "Verma",
    departmentId: { code: "CSE", name: "Computer Science" },
    section: "A",
    currentYear: "3rd Year",
    userId: { email: "aditya.v@univ.edu" },
    primaryPhone: "9876543210",
    isActive: true,
  },
  {
    _id: "s2",
    studentId: "STU002",
    fullName: "Sneha Kapoor",
    firstName: "Sneha",
    lastName: "Kapoor",
    departmentId: { code: "ECE", name: "Electronics" },
    section: "B",
    currentYear: "2nd Year",
    userId: { email: "sneha.k@univ.edu" },
    primaryPhone: "8765432109",
    isActive: true,
  },
  {
    _id: "s3",
    studentId: "STU003",
    fullName: "Rahul Mehta",
    firstName: "Rahul",
    lastName: "Mehta",
    departmentId: { code: "MECH", name: "Mechanical" },
    section: "C",
    currentYear: "4th Year",
    userId: { email: "rahul.m@univ.edu" },
    primaryPhone: "7654321098",
    isActive: false,
  },
];

const StudentTable = ({ onAddClick, onEditClick, onStatusClick }) => {
  const [students, setStudents] = useState(studentCache || []);
  const [loading, setLoading] = useState(!studentCache);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [showColConfig, setShowColConfig] = useState(false);

  const [filterDept, setFilterDept] = useState("");
  const [filterYear, setFilterYear] = useState("");
  const [filterSection, setFilterSection] = useState("");

  const [visibleColumns, setVisibleColumns] = useState({
    studentId: true,
    fullName: true,
    department: true,
    section: true,
    year: true,
    email: true,
    status: true,
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
  }, []);

  const fetchData = async () => {
    try {
      if (!studentCache || studentCache.length === 0) setLoading(true);
      const res = await getAllStudents();
      let studentData = res?.data?.studentList || [];
      if (studentData.length > 0) {
        const sortedData = studentData.sort((a, b) => {
          if (a.isActive === b.isActive)
            return a.fullName.localeCompare(b.fullName);
          return a.isActive ? -1 : 1;
        });
        studentCache = sortedData;
        setStudents(sortedData);
      }
    } catch (err) {
      console.error("API Fetch failed");
    } finally {
      setLoading(false);
    }
  };

  const filteredStudents = students.filter((s) => {
    const search = searchTerm.toLowerCase().trim();
    const matchesSearch =
      s.fullName.toLowerCase().includes(search) ||
      s.studentId?.toLowerCase().includes(search) ||
      s.userId?.email?.toLowerCase().includes(search);
    const matchesDept = filterDept === "" || s.departmentId?.code === filterDept;
    const matchesYear = filterYear === "" || s.currentYear === filterYear;
    const matchesSection =
      filterSection === "" ||
      s.section?.toLowerCase() === filterSection.toLowerCase();
    return matchesSearch && matchesDept && matchesYear && matchesSection;
  });

  const exportToExcel = () => {
    if (filteredStudents.length === 0) return toast.error("No data to export");
    const exportData = filteredStudents.map((s) => {
      const row = {};
      if (visibleColumns.studentId) row["ID"] = s.studentId;
      if (visibleColumns.fullName) row["Student Name"] = s.fullName;
      if (visibleColumns.department) row["Department"] = s.departmentId?.code || "N/A";
      if (visibleColumns.section) row["Section"] = s.section || "N/A";
      if (visibleColumns.year) row["Year"] = s.currentYear || "N/A";
      if (visibleColumns.email) row["Email"] = s.userId?.email || "N/A";
      if (visibleColumns.status) row["Status"] = s.isActive ? "Active" : "Inactive";
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

  const departments = [...new Set(students.map((s) => s.departmentId?.code))].filter(Boolean);
  const years = [...new Set(students.map((s) => s.currentYear))].filter(Boolean);
  const sections = [...new Set(students.map((s) => s.section))].filter(Boolean);

  return (
    <div className="bg-white border border-gray-100 rounded-3xl overflow-hidden flex flex-col h-[calc(100vh-350px)] min-h-[400px] font-['Poppins'] relative">
      <div className="px-8 py-5 border-b border-gray-50 bg-white print:hidden">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <h2 className="text-xl font-bold text-[#08384F]">Student Information</h2>
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
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-2 pb-2 border-b border-gray-50 mb-2">Visible Columns</p>
                  <div className="space-y-1 max-h-40 overflow-y-auto custom-scrollbar">
                    {Object.keys(visibleColumns).map((key) => (
                      <button key={key} onClick={() => toggleColumn(key)} className="w-full flex items-center justify-between px-2 py-1.5 hover:bg-gray-50 rounded-lg group">
                        <span className="text-xs font-semibold text-gray-600 capitalize">{key.replace(/([A-Z])/g, " $1")}</span>
                        <div className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${visibleColumns[key] ? "bg-[#08384F] border-[#08384F]" : "border-gray-300"}`}>
                          {visibleColumns[key] && <Check size={10} className="text-white" />}
                        </div>
                      </button>
                    ))}
                  </div>
                  
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-2 pt-3 pb-2 border-b border-gray-50 mt-2 mb-2">Extra Print Columns</p>
                  <div className="space-y-2">
                    {extraColumns.map(col => (
                      <div key={col.id} className="flex items-center justify-between bg-gray-50 px-2 py-1 rounded-lg">
                        <span className="text-[11px] font-bold text-[#08384F]">{col.title}</span>
                        <button onClick={() => setExtraColumns(extraColumns.filter(c => c.id !== col.id))} className="text-red-400 hover:text-red-600"><CloseIcon size={14}/></button>
                      </div>
                    ))}
                    <button onClick={addExtraColumn} className="w-full py-2 border border-dashed border-gray-200 rounded-lg text-[10px] font-bold text-gray-400 hover:border-[#08384F] hover:text-[#08384F] transition-all">+ Add Empty Column</button>
                  </div>
                </div>
              )}
            </div>

            <button onClick={exportToExcel} className="p-2.5 bg-emerald-50 text-emerald-600 flex items-center rounded-xl border border-emerald-100 hover:bg-emerald-100 transition-colors">
              <FileSpreadsheet size={18} /> <span className="font-semibold text-sm px-2">Excel</span>
            </button>
            <button onClick={() => window.print()} className="p-2.5 bg-gray-50 text-gray-600 flex items-center rounded-xl border border-gray-100 hover:bg-gray-100 transition-colors">
              <Printer size={18} /> <span className="font-semibold text-sm px-2">Print</span>
            </button>
            <button onClick={onAddClick} className="flex items-center gap-2 bg-[#08384F] text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-[#0b3a53] transition-all">
              <Plus size={18} /> Add Student
            </button>
          </div>
        </div>

        {/* Filters Row */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Search by name, ID, email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-100 rounded-xl text-sm outline-none focus:border-[#08384F]"
            />
          </div>

          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
            <select
              value={filterDept}
              onChange={(e) => setFilterDept(e.target.value)}
              className="pl-9 pr-8 py-2 bg-gray-50 border border-gray-100 rounded-xl text-xs font-bold text-gray-500 outline-none appearance-none cursor-pointer"
            >
              <option value="">All Depts</option>
              {departments.map((dept) => <option key={dept} value={dept}>{dept}</option>)}
            </select>
          </div>

          <select
            value={filterYear}
            onChange={(e) => setFilterYear(e.target.value)}
            className="px-4 py-2 bg-gray-50 border border-gray-100 rounded-xl text-xs font-bold text-gray-500 outline-none cursor-pointer"
          >
            <option value="">All Years</option>
            {years.map((year) => <option key={year} value={year}>{year}</option>)}
          </select>

          <select
            value={filterSection}
            onChange={(e) => setFilterSection(e.target.value)}
            className="px-4 py-2 bg-gray-50 border border-gray-100 rounded-xl text-xs font-bold text-gray-500 outline-none cursor-pointer"
          >
            <option value="">All Sections</option>
            {sections.map((sec) => <option key={sec} value={sec}>Section {sec}</option>)}
          </select>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar relative print:overflow-visible">
        <table className="w-full text-left border-collapse min-w-[1000px]">
          <thead className="sticky top-0 bg-[#08384F] z-20 print:static">
            <tr className="text-[11px] font-bold text-white uppercase tracking-widest">
              {visibleColumns.studentId && <th className="px-8 py-4 text-center">ID</th>}
              {visibleColumns.fullName && <th className="px-4 py-4">Student Name</th>}
              {visibleColumns.department && <th className="px-4 py-4">Department</th>}
              {visibleColumns.section && <th className="px-4 py-4 text-center">Section</th>}
              {visibleColumns.year && <th className="px-4 py-4 text-center">Year</th>}
              {visibleColumns.email && <th className="px-4 py-4 text-center">Email</th>}
              {visibleColumns.status && <th className="px-4 py-4 text-center">Status</th>}
              {/* Extra columns only visible during print/PDF generation */}
              {extraColumns.map(col => <th key={col.id} className="px-4 py-4 text-center border-l border-white/20 hidden print:table-cell">{col.title}</th>)}
              <th className="px-8 py-4 text-right print:hidden">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 font-medium">
            {filteredStudents.map((student) => (
              <tr key={student._id} className="hover:bg-gray-50/50 group transition-colors print:opacity-100">
                {visibleColumns.studentId && <td className="px-8 py-4 text-xs text-gray-500 font-bold text-center">{student.studentId}</td>}
                {visibleColumns.fullName && <td className="px-4 py-6 text-sm text-[#08384F] font-semibold">{student.fullName}</td>}
                {visibleColumns.department && <td className="px-4 py-4"><span className="text-[10px] font-bold bg-gray-100 px-2 py-1 rounded-md text-gray-500">{student.departmentId?.code}</span></td>}
                {visibleColumns.section && <td className="px-4 py-4 text-xs text-gray-600 text-center">{student.section || "N/A"}</td>}
                {visibleColumns.year && <td className="px-4 py-4 text-xs text-gray-600 text-center font-bold">{student.currentYear}</td>}
                {visibleColumns.email && <td className="px-4 py-4 text-center text-xs text-gray-500">{student.userId?.email}</td>}
                {visibleColumns.status && (
                  <td className="px-4 py-4 text-center">
                    <span className={`text-[10px] px-2 py-1 rounded-full font-bold uppercase ${student.isActive ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"}`}>{student.isActive ? "Active" : "Inactive"}</span>
                  </td>
                )}
                {/* Empty data cells only visible in print */}
                {extraColumns.map(col => <td key={col.id} className="px-4 py-4 border-l border-gray-100 min-w-[120px] hidden print:table-cell"></td>)}
                <td className="px-8 py-4 text-right print:hidden">
                  <div className="flex gap-1 justify-end">
                    <button onClick={() => { setSelectedStudent(student); setIsViewModalOpen(true); }} className="p-2 text-blue-500 bg-blue-50 rounded-lg hover:bg-blue-100"><Eye size={16} /></button>
                    <button onClick={() => onEditClick(student)} className="p-2 text-orange-500 bg-orange-50 rounded-lg hover:bg-orange-100"><Edit2 size={16} /></button>
                    <button onClick={() => onStatusClick(student)} className={`p-2 rounded-lg ${student.isActive ? "text-red-500 bg-red-50" : "text-green-500 bg-green-50"}`}><Power size={16} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <StudentDetailsModal isOpen={isViewModalOpen} onClose={() => setIsViewModalOpen(false)} student={selectedStudent} />
    </div>
  );
};

export default StudentTable;