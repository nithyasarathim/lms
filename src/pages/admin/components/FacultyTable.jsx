import React, { useState, useEffect } from "react";
import {
  Plus,
  Mail,
  Phone,
  Search,
  Edit2,
  Trash2,
  Loader2,
  FileSpreadsheet,
  Eye,
  X,
  User,
  Briefcase,
  Calendar,
} from "lucide-react";
import { getAllFaculties } from "../api/admin.api";
import toast from "react-hot-toast";
import * as XLSX from "xlsx";

const FacultyTable = ({ onAddClick, onEditClick }) => {
  const [faculties, setFaculties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFaculty, setSelectedFaculty] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await getAllFaculties();
      const facultyData = res?.data?.facultyList || [];
      setFaculties(Array.isArray(facultyData) ? facultyData : []);
    } catch (err) {
      toast.error("Failed to fetch faculty list");
      setFaculties([]);
    } finally {
      setLoading(false);
    }
  };

  const exportToExcel = () => {
    const exportData = faculties.map((f) => ({
      "Employee ID": f.employeeId,
      Name: `${f.salutation} ${f.firstName} ${f.lastName}`,
      Department: f.departmentId?.name,
      Code: f.departmentId?.code,
      Email: f.userId?.email,
      Phone: f.phone || f.mobileNumber,
      Designation: f.designation,
      "Joining Date": f.joiningDate?.split("T")[0],
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Faculties");
    XLSX.writeFile(wb, "Faculty_Directory.xlsx");
    toast.success("Exporting to Excel...");
  };

  const filteredFaculties = faculties.filter((f) => {
    const fullName = `${f.firstName} ${f.lastName}`.toLowerCase();
    const search = searchTerm.toLowerCase();
    return (
      fullName.includes(search) || f.employeeId?.toLowerCase().includes(search)
    );
  });

  const ViewModal = ({ faculty, onClose }) => (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#08384F]/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="bg-[#08384F] p-8 text-white relative">
          <button onClick={onClose} className="absolute top-6 right-6 p-2 hover:bg-white/10 rounded-full transition-colors"><X size={20}/></button>
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-3xl flex items-center justify-center text-2xl font-bold border border-white/30">
              {faculty.firstName?.[0]}{faculty.lastName?.[0]}
            </div>
            <div>
              <h3 className="text-xl font-bold">{faculty.salutation} {faculty.firstName} {faculty.lastName}</h3>
              <p className="text-white/60 text-md font-medium">{faculty.designation} • {faculty.departmentId?.code}</p>
            </div>
          </div>
        </div>
        <div className="p-8 space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-1">
              <p className="text-[10px] uppercase font-bold text-gray-400 tracking-widest flex items-center gap-1"><User size={12}/> Personal</p>
              <p className="text-sm font-semibold text-gray-700">{faculty.userId?.gender || 'N/A'}</p>
              <p className="text-xs text-gray-500 italic">{faculty.userId?.dateOfBirth?.split('T')[0]}</p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] uppercase font-bold text-gray-400 tracking-widest flex items-center gap-1"><Briefcase size={12}/> Employee ID</p>
              <p className="text-sm font-bold text-[#08384F]">{faculty.employeeId}</p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] uppercase font-bold text-gray-400 tracking-widest flex items-center gap-1"><Mail size={12}/> Email</p>
              <p className="text-xs font-semibold text-gray-600 truncate">{faculty.userId?.email}</p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] uppercase font-bold text-gray-400 tracking-widest flex items-center gap-1"><Calendar size={12}/> Joined On</p>
              <p className="text-sm font-semibold text-gray-700">{faculty.joiningDate?.split('T')[0]}</p>
            </div>
          </div>
          <div className="pt-4 border-t border-gray-50 flex justify-end">
            <button onClick={onClose} className="px-6 py-2.5 bg-gray-100 text-gray-600 rounded-xl text-sm font-bold hover:bg-gray-200 transition-all">Close Profile</button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="bg-white border border-gray-100 rounded-3xl overflow-hidden flex flex-col h-full font-['Poppins']">
      <div className="px-8 py-5 border-b border-gray-50 flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-xl font-bold text-[#08384F]">Faculty Information</h2>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Search ID or Name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 bg-gray-50 border border-gray-100 rounded-xl text-sm outline-none focus:border-[#08384F] transition-all w-60"
            />
          </div>
          <button onClick={exportToExcel} className="flex items-center gap-2 bg-emerald-50 text-emerald-600 px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-emerald-100 transition-all">
            <FileSpreadsheet size={18} /> Export
          </button>
          <button onClick={onAddClick} className="flex items-center gap-2 bg-[#08384F] text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-[#0b3a53] transition-all active:scale-95">
            <Plus size={18} /> Add Faculty
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        <table className="w-full text-left border-collapse">
          <thead className="sticky top-0 bg-white z-10">
            <tr className="text-[11px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-50">
              <th className="px-8 py-4">Emp ID</th>
              <th className="px-4 py-4">Name</th>
              <th className="px-4 py-4">Dept</th>
              <th className="px-4 py-4">Email</th>
              <th className="px-4 py-4">Phone</th>
              <th className="px-15 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? (
              <tr><td colSpan="6" className="py-20 text-center text-gray-400"><Loader2 className="animate-spin mx-auto mb-2" />Retrieving records...</td></tr>
            ) : filteredFaculties.map((faculty) => (
              <tr key={faculty._id} className="hover:bg-gray-50/50 group transition-colors">
                <td className="px-8 py-2 font-bold text-xs text-gray-500">{faculty.employeeId}</td>
                <td className="px-4 py-2 text-sm font-semibold text-[#08384F]">{faculty.salutation} {faculty.firstName} {faculty.lastName}</td>
                <td className="px-4 py-2"><span className="text-[12px] font-bold text-gray-500 bg-gray-100 px-2 py-1 rounded-md">{faculty.departmentId?.code}</span></td>
                <td className="px-4 py-2 text-xs text-gray-500">{faculty.userId?.email}</td>
                <td className="px-4 py-2 text-xs text-gray-500">{faculty.phone || faculty.mobileNumber}</td>
                <td className="px-8 py-2 text-right">
                  <div className="flex gap-1 opacity-0 justify-end opacity-100 transition-opacity">
                    <button onClick={() => setSelectedFaculty(faculty)} className="p-2 text-gray-400 text-blue-500 bg-blue-50 rounded-lg"><Eye size={16} /></button>
                    <button onClick={() => onEditClick(faculty)} className="p-2 text-gray-400 Text-orange-500 bg-orange-50 rounded-lg"><Edit2 size={16} /></button>
                    <button className="p-2 text-gray-400 text-rose-500 bg-rose-50 rounded-lg"><Trash2 size={16} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {selectedFaculty && <ViewModal faculty={selectedFaculty} onClose={() => setSelectedFaculty(null)} />}
    </div>
  );
};

export default FacultyTable;