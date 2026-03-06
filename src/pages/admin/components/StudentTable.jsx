import React, { useState, useEffect } from "react";
import {
  Plus,
  Search,
  Edit2,
  Loader2,
  FileSpreadsheet,
  Eye,
  Copy,
  Filter,
  Power,
} from "lucide-react";
import { getAllStudents } from "../api/admin.api";
import StudentDetailsModal from "../modal/StudentDetailsModal";
import toast from "react-hot-toast";
import * as XLSX from "xlsx";

// Dummy Data to initialize the cache
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
  }
];

const StudentTable = ({ onAddClick, onEditClick, onStatusClick }) => {
  const [students, setStudents] = useState(studentCache || []);
  const [loading, setLoading] = useState(!studentCache);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [filterDept, setFilterDept] = useState("");

  useEffect(() => {
    fetchData();
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
      console.error("API Fetch failed, using cache/dummy data");
    } finally {
      setLoading(false);
    }
  };

  const copyEmail = (email) => {
    if (!email) return;
    navigator.clipboard.writeText(email);
    toast.success("Email copied");
  };

  const filteredStudents = students.filter((s) => {
    const search = searchTerm.toLowerCase().trim();
    return (
      (s.fullName.toLowerCase().includes(search) ||
        s.studentId?.toLowerCase().includes(search) ||
        s.userId?.email?.toLowerCase().includes(search)) &&
      (filterDept === "" || s.departmentId?.code === filterDept)
    );
  });

  const exportToExcel = () => {
    if (filteredStudents.length === 0) return toast.error("No data to export");
    const exportData = filteredStudents.map((s) => ({
      "Student ID": s.studentId,
      Name: s.fullName,
      Department: s.departmentId?.name || "N/A",
      Section: s.section || "N/A",
      Year: s.currentYear || "N/A",
      Email: s.userId?.email || "N/A",
      Phone: s.primaryPhone || "N/A",
      Status: s.isActive ? "Active" : "Inactive",
    }));
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Students");
    const fileName = filterDept
      ? `${filterDept}_Students.xlsx`
      : "All_Departments_Students.xlsx";
    XLSX.writeFile(wb, fileName);
    toast.success(`Exported ${fileName}`);
  };

  const departments = [
    ...new Set(students.map((s) => s.departmentId?.code)),
  ].filter(Boolean);

  return (
    <div className="bg-white border border-gray-100 rounded-3xl overflow-hidden flex flex-col h-[calc(100vh-350px)] min-h-[400px] font-['Poppins']">
      <div className="px-8 py-5 border-b border-gray-50 flex flex-wrap items-center justify-between gap-4 shrink-0 bg-white">
        <h2 className="text-xl font-bold text-[#08384F]">
          Student Information
        </h2>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={16}
            />
            <input
              type="text"
              placeholder="Search students..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              autoComplete="new-password"
              spellCheck="false"
              className="pl-10 pr-4 py-2 bg-gray-50 border border-gray-100 rounded-xl text-sm outline-none focus:border-[#08384F] w-60"
            />
          </div>
          <div className="relative">
            <Filter
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={14}
            />
            <select
              value={filterDept}
              onChange={(e) => setFilterDept(e.target.value)}
              className="pl-9 pr-8 py-2 bg-gray-50 border border-gray-100 rounded-xl text-xs font-bold text-gray-500 outline-none appearance-none cursor-pointer"
            >
              <option value="">All Depts</option>
              {departments.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          </div>
          <button
            onClick={exportToExcel}
            className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-100 hover:bg-emerald-100 transition-colors"
          >
            <FileSpreadsheet size={18} />
          </button>
          <button
            onClick={onAddClick}
            className="flex items-center gap-2 bg-[#08384F] text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-[#0b3a53] transition-all"
          >
            <Plus size={18} /> Add Student
          </button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto custom-scrollbar relative">
        <table className="w-full text-left border-collapse min-w-[1000px]">
          <thead className="sticky top-0 bg-[#08384F] z-20">
            <tr className="text-[11px] font-bold text-white uppercase tracking-widest">
              <th className="px-8 py-4 text-center">ID</th>
              <th className="px-4 py-4">Student Name</th>
              <th className="px-4 py-4">Department</th>
              <th className="px-4 py-4 text-center">Section</th>
              <th className="px-4 py-4 text-center">Year</th>
              <th className="px-4 py-4 text-center">Email</th>
              <th className="px-4 py-4 text-center">Status</th>
              <th className="px-8 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 font-medium">
            {loading && (!studentCache || studentCache.length === 0) ? (
              <tr>
                <td colSpan="8" className="py-20 text-center">
                  <Loader2 className="animate-spin mx-auto mb-2 text-[#08384F]" />
                </td>
              </tr>
            ) : filteredStudents.length > 0 ? (
              filteredStudents.map((student) => (
                <tr
                  key={student._id}
                  className={`hover:bg-gray-50/50 group transition-colors ${!student.isActive && "bg-gray-50/40 opacity-75"}`}
                >
                  <td className="px-8 py-4 text-xs text-gray-500 font-bold text-center">
                    {student.studentId}
                  </td>
                  <td className="px-4 py-6 text-sm text-[#08384F] font-semibold">
                    {student.fullName}
                  </td>
                  <td className="px-4 py-4">
                    <span className="text-[10px] font-bold bg-gray-100 px-2 py-1 rounded-md text-gray-500">
                      {student.departmentId?.code}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-xs text-gray-600 text-center">
                    {student.section || "N/A"}
                  </td>
                  <td className="px-4 py-4 text-xs text-gray-600 text-center font-bold">
                    {student.currentYear}
                  </td>
                  <td className="px-4 py-4 text-center">
                    <div className="flex items-center justify-center gap-2 group/rowemail">
                      <span className="text-xs text-gray-500 truncate max-w-[150px]">
                        {student.userId?.email}
                      </span>
                      <button
                        onClick={() => copyEmail(student.userId?.email)}
                        className="opacity-0 group-hover/rowemail:opacity-100 text-[#08384F]"
                      >
                        <Copy size={12} />
                      </button>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-center">
                    <span
                      className={`text-[10px] px-2 py-1 rounded-full font-bold uppercase ${student.isActive ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"}`}
                    >
                      {student.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-8 py-4 text-right">
                    <div className="flex gap-1 justify-end transition-opacity">
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
                        onClick={() => onStatusClick(student)}
                        className={`p-2 rounded-lg ${student.isActive ? "text-red-500 bg-red-50" : "text-green-500 bg-green-50"}`}
                      >
                        <Power size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" className="py-20 text-center text-gray-400">
                  No matching records found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <StudentDetailsModal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        student={selectedStudent}
      />
    </div>
  );
};

export default StudentTable;