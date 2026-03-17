import React, { useState, useEffect, useRef } from "react";
import Eshwar from "../../../assets/EshwarImg.png";
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
import { getAllFaculties } from "../api/admin.api";
import FacultyDetailsModal from "../modals/FacultyDetailsModal";
import toast from "react-hot-toast";
import * as XLSX from "xlsx";

let facultyCache = null;

const FacultyTable = ({ onAddClick, onEditClick, onStatusClick }) => {
  const [faculties, setFaculties] = useState(facultyCache || []);
  const [loading, setLoading] = useState(!facultyCache);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFaculty, setSelectedFaculty] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [filterDept, setFilterDept] = useState("");
  const [showColConfig, setShowColConfig] = useState(false);
  const configRef = useRef(null);

  const [visibleColumns, setVisibleColumns] = useState({
    empId: true,
    fullName: true,
    designation: true,
    dept: true,
    contact: true,
    email: true,
    status: true,
  });

  const [extraColumns, setExtraColumns] = useState([]);

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
      if (!facultyCache) setLoading(true);
      const res = await getAllFaculties();
      let facultyData = res?.data?.facultyList || [];
      const sortedData = facultyData.sort((a, b) => {
        if (a.isActive === b.isActive)
          return a.fullName.localeCompare(b.fullName);
        return a.isActive ? -1 : 1;
      });
      facultyCache = sortedData;
      setFaculties(sortedData);
    } catch (err) {
      toast.error("Failed to fetch faculty list");
      if (!facultyCache) setFaculties([]);
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
    const exportData = filteredFaculties.map((f) => {
      const row = {};
      if (visibleColumns.empId) row["Employee ID"] = f.employeeId;
      if (visibleColumns.fullName) row["Name"] = f.fullName;
      if (visibleColumns.designation) row["Designation"] = f.designation || "";
      if (visibleColumns.dept) row["Department"] = f.departmentId?.code || "";
      if (visibleColumns.contact) row["Phone"] = f.primaryPhone || "";
      if (visibleColumns.email) row["Email"] = f.userId?.email || "";
      if (visibleColumns.status)
        row["Status"] = f.isActive ? "Active" : "Inactive";
      extraColumns.forEach((col) => (row[col.title] = ""));
      return row;
    });
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Faculties");
    XLSX.writeFile(wb, "Faculty_Records.xlsx");
  };

  const handlePrint = () => {
    const printWindow = window.open("", "_blank");
    const printHtml = `
      <html>
        <head>
          <title>Faculty Records</title>
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
              <h1>Faculty Information Report</h1>
              <p>Date: ${new Date().toLocaleDateString()} | Time: ${new Date().toLocaleTimeString()}</p>
            </div>
          </div>
          <div class="filter-info">
            <div><span class="filter-label">Dept:</span> ${filterDept || "All"}</div>
            <div><span class="filter-label">Search:</span> ${searchTerm || "None"}</div>
          </div>
          <table>
            <thead>
              <tr>
                ${visibleColumns.empId ? "<th>Emp ID</th>" : ""}
                ${visibleColumns.fullName ? "<th>Name</th>" : ""}
                ${visibleColumns.designation ? "<th>Designation</th>" : ""}
                ${visibleColumns.dept ? "<th>Dept</th>" : ""}
                ${visibleColumns.contact ? "<th>Contact</th>" : ""}
                ${visibleColumns.email ? "<th>Email</th>" : ""}
                ${visibleColumns.status ? "<th>Status</th>" : ""}
                ${extraColumns.map((col) => `<th>${col.title}</th>`).join("")}
              </tr>
            </thead>
            <tbody>
              ${filteredFaculties
                .map(
                  (f) => `
                <tr>
                  ${visibleColumns.empId ? `<td>${f.employeeId}</td>` : ""}
                  ${visibleColumns.fullName ? `<td>${f.fullName}</td>` : ""}
                  ${visibleColumns.designation ? `<td>${f.designation || "-"}</td>` : ""}
                  ${visibleColumns.dept ? `<td>${f.departmentId?.code || "-"}</td>` : ""}
                  ${visibleColumns.contact ? `<td>${f.primaryPhone || "-"}</td>` : ""}
                  ${visibleColumns.email ? `<td>${f.userId?.email || "-"}</td>` : ""}
                  ${visibleColumns.status ? `<td>${f.isActive ? "Active" : "Inactive"}</td>` : ""}
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

  const departments = [
    ...new Set(faculties.map((f) => f.departmentId?.code)),
  ].filter(Boolean);

  const ShimmerRow = () => (
    <tr className="animate-pulse border-b border-gray-50">
      <td className="px-8 py-2">
        <div className="h-3 bg-gray-100 rounded w-16 mx-auto"></div>
      </td>
      <td className="px-4 py-2">
        <div className="h-3 bg-gray-100 rounded w-48"></div>
      </td>
      <td className="px-4 py-2">
        <div className="h-3 bg-gray-100 rounded w-24"></div>
      </td>
      <td className="px-4 py-2">
        <div className="h-3 bg-gray-100 rounded w-12"></div>
      </td>
      <td className="px-4 py-2">
        <div className="h-3 bg-gray-100 rounded w-24 mx-auto"></div>
      </td>
      <td className="px-4 py-2">
        <div className="h-3 bg-gray-100 rounded w-40 mx-auto"></div>
      </td>
      <td className="px-4 py-2">
        <div className="h-3 bg-gray-100 rounded w-16 mx-auto"></div>
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
      <div className="px-8 py-5 border-b border-gray-50 flex flex-wrap items-center justify-between gap-4 shrink-0 bg-white print:hidden">
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
          <div className="relative" ref={configRef}>
            <button
              onClick={() => setShowColConfig(!showColConfig)}
              className={`p-2.5 flex items-center gap-2 rounded-xl border transition-all ${showColConfig ? "bg-[#08384F] text-white border-[#08384F]" : "bg-gray-50 text-gray-600 border-gray-100"}`}
            >
              <Settings2 size={18} />
              <span className="font-semibold text-sm px-1">Configure</span>
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
            className="py-1.5 px-2 bg-emerald-50 flex font-semibold text-sm gap-2 text-emerald-600 rounded-xl border border-emerald-100"
          >
            <FileSpreadsheet size={18} /> Excel
          </button>
          <button
            onClick={handlePrint}
            className="py-1.5 px-2 text-sm font-semibold flex gap-2 bg-gray-50 text-gray-600 rounded-xl border border-gray-100 hover:bg-gray-100 transition-colors"
          >
            <Printer size={18} /> Print
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
              <th className="px-8 py-4 text-right print:hidden">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 font-medium">
            {loading && !facultyCache ? (
              [...Array(6)].map((_, i) => <ShimmerRow key={i} />)
            ) : filteredFaculties.length > 0 ? (
              filteredFaculties.map((faculty) => (
                <tr
                  key={faculty._id}
                  className={`hover:bg-gray-50/50 transition-colors ${!faculty.isActive && "bg-gray-50/40 opacity-75"}`}
                >
                  <td className="px-8 py-2 text-xs text-gray-500 font-bold text-center">
                    {faculty.employeeId}
                  </td>
                  <td className="px-4 py-2 text-sm text-[#08384F] font-semibold">
                    {faculty.salutation} {faculty.fullName}
                  </td>
                  <td className="px-4 py-2 text-xs text-gray-600">
                    {faculty.designation}
                  </td>
                  <td className="px-4 py-2">
                    <span className="text-[10px] font-bold bg-gray-100 px-2 py-1 rounded-md text-gray-500">
                      {faculty.departmentId?.code}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-xs text-gray-500 text-center">
                    {faculty.primaryPhone}
                  </td>
                  <td className="px-4 py-2 text-center text-xs text-gray-500">
                    {faculty.userId?.email}
                  </td>
                  <td className="px-4 py-2 text-center">
                    <span
                      className={`text-[10px] px-2 py-1 rounded-full font-bold uppercase ${faculty.isActive ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"}`}
                    >
                      {faculty.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-8 py-2 text-right print:hidden">
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
