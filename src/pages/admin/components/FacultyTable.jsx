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
import { getAllFaculties } from "../api/admin.api";
import FacultyDetailsModal from "../modal/FacultyDetailsModal";
import toast from "react-hot-toast";
import * as XLSX from "xlsx";

const FacultyTable = ({ onAddClick, onEditClick, onStatusClick }) => {
  const [faculties, setFaculties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFaculty, setSelectedFaculty] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [filterDept, setFilterDept] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await getAllFaculties();
      let facultyData = res?.data?.facultyList || [];
      const sortedData = facultyData.sort((a, b) => {
        if (a.isActive === b.isActive)
          return a.fullName.localeCompare(b.fullName);
        return a.isActive ? -1 : 1;
      });
      setFaculties(sortedData);
    } catch (err) {
      toast.error("Failed to fetch faculty list");
      setFaculties([]);
    } finally {
      setLoading(false);
    }
  };

  const copyEmail = (email) => {
    if (!email) return;
    navigator.clipboard.writeText(email);
    toast.success("Email copied");
  };

  const filteredFaculties = faculties.filter((f) => {
    const search = searchTerm.toLowerCase().trim();
    return (
      (f.fullName.toLowerCase().includes(search) ||
        f.employeeId?.toLowerCase().includes(search) ||
        f.userId?.email?.toLowerCase().includes(search)) &&
      (filterDept === "" || f.departmentId?.code === filterDept)
    );
  });

  const exportToExcel = () => {
    if (filteredFaculties.length === 0) return toast.error("No data to export");
    const exportData = filteredFaculties.map((f) => ({
      "Employee ID": f.employeeId,
      Name: f.fullName,
      Department: f.departmentId?.name || "N/A",
      Code: f.departmentId?.code || "N/A",
      Email: f.userId?.email || "N/A",
      Phone: f.primaryPhone || "N/A",
      Designation: f.designation || "N/A",
      "Joining Date": f.joiningDate?.split("T")[0] || "N/A",
      Status: f.isActive ? "Active" : "Inactive",
    }));
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Faculties");
    const fileName = filterDept
      ? `${filterDept}_Faculties.xlsx`
      : "All_Departments_Faculties.xlsx";
    XLSX.writeFile(wb, fileName);
    toast.success(`Exported ${fileName}`);
  };

  const departments = [
    ...new Set(faculties.map((f) => f.departmentId?.code)),
  ].filter(Boolean);

  return (
    <div className="bg-white border border-gray-100 rounded-3xl overflow-hidden flex flex-col h-[calc(100vh-350px)] min-h-[400px] font-['Poppins']">
      <div className="px-8 py-5 border-b border-gray-50 flex flex-wrap items-center justify-between gap-4 shrink-0 bg-white">
        <h2 className="text-xl font-bold text-[#08384F]">
          Faculty Information
        </h2>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={16}
            />
            <input
              type="text"
              placeholder="Search..."
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
            <Plus size={18} /> Add Faculty
          </button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto custom-scrollbar relative">
        <table className="w-full text-left border-collapse min-w-[1000px]">
          <thead className="sticky top-0 bg-[#08384F] z-20">
            <tr className="text-[11px] font-bold text-white uppercase tracking-widest">
              <th className="px-8 py-4 text-center">Emp ID</th>
              <th className="px-4 py-4">Faculty Name</th>
              <th className="px-4 py-4">Designation</th>
              <th className="px-4 py-4">Dept</th>
              <th className="px-4 py-4 text-center">Contact</th>
              <th className="px-4 py-4 text-center">Email</th>
              <th className="px-4 py-4 text-center">Status</th>
              <th className="px-8 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 font-medium">
            {loading ? (
              <tr>
                <td colSpan="8" className="py-20 text-center">
                  <Loader2 className="animate-spin mx-auto mb-2 text-[#08384F]" />
                </td>
              </tr>
            ) : filteredFaculties.length > 0 ? (
              filteredFaculties.map((faculty) => (
                <tr
                  key={faculty._id}
                  className={`hover:bg-gray-50/50 group transition-colors ${!faculty.isActive && "bg-gray-50/40 opacity-75"}`}
                >
                  <td className="px-8 py-4 text-xs text-gray-500 font-bold text-center">
                    {faculty.employeeId}
                  </td>
                  <td className="px-4 py-6 text-sm text-[#08384F] font-semibold">
                    {faculty.salutation} {faculty.fullName}
                  </td>
                  <td className="px-4 py-4 text-xs text-gray-600">
                    {faculty.designation}
                  </td>
                  <td className="px-4 py-4">
                    <span className="text-[10px] font-bold bg-gray-100 px-2 py-1 rounded-md text-gray-500">
                      {faculty.departmentId?.code}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-xs text-gray-500 font-medium text-center">
                    {faculty.primaryPhone}
                  </td>
                  <td className="px-4 py-4 text-center">
                    <div className="flex items-center justify-center gap-2 group/rowemail">
                      <span className="text-xs text-gray-500 truncate max-w-[150px]">
                        {faculty.userId?.email}
                      </span>
                      <button
                        onClick={() => copyEmail(faculty.userId?.email)}
                        className="opacity-0 group-hover/rowemail:opacity-100 text-[#08384F]"
                      >
                        <Copy size={12} />
                      </button>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-center">
                    <span
                      className={`text-[10px] px-2 py-1 rounded-full font-bold uppercase ${faculty.isActive ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"}`}
                    >
                      {faculty.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-8 py-4 text-right">
                    <div className="flex gap-1 justify-end transition-opacity">
                      <button
                        onClick={() => {
                          setSelectedFaculty(faculty);
                          setIsViewModalOpen(true);
                        }}
                        className="p-2 text-blue-500 bg-blue-50 rounded-lg hover:bg-blue-100"
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        onClick={() => onEditClick(faculty)}
                        className="p-2 text-orange-500 bg-orange-50 rounded-lg hover:bg-orange-100"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => onStatusClick(faculty)}
                        className={`p-2 rounded-lg ${faculty.isActive ? "text-red-500 bg-red-50" : "text-green-500 bg-green-50"}`}
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
      <FacultyDetailsModal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        faculty={selectedFaculty}
      />
    </div>
  );
};

export default FacultyTable;
