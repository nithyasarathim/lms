import React, { useState, useEffect } from "react";
import {
  Search,
  Plus,
  Trash2,
  Pencil,
  ArrowLeft,
  Settings,
  Loader2,
  BookX,
  Scale,
} from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { getSubjects } from "../api/admin.api";
import EditDepartmentModal from "../modals/EditDepartmentModal";
import AddSubjectModal from "../modals/AddSubjectModal";
import EditSubjectModal from "../modals/EditSubjectModal";
import DeleteConfirmModal from "../modals/DeleteConfirmModal";

const SubjectTable = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [search, setSearch] = useState("");
  const [isEditDeptOpen, setIsEditDeptOpen] = useState(false);
  const [isAddSubjectOpen, setIsAddSubjectOpen] = useState(false);

  const [editSubjectData, setEditSubjectData] = useState(null);
  const [deleteSubjectData, setDeleteSubjectData] = useState(null);

  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const deptId = searchParams.get("deptId");

  useEffect(() => {
    if (deptId) fetchSubjects();
  }, [deptId]);

  const fetchSubjects = async () => {
    setLoading(true);
    try {
      const data = await getSubjects();
      const filteredByDept = data.filter(
        (sub) =>
          sub.departmentId?._id === deptId || sub.departmentId === deptId,
      );
      setSubjects(filteredByDept);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => navigate("/admin/dashboard?tab=subject-management");

  const getCourseTypeLabel = (type) => {
    const types = {
      T: "Theory",
      P: "Prac",
      TP: "Th+Pr",
      TPJ: "Th+Pr+Proj",
      PJ: "Project",
      I: "Intern",
    };
    const label = types[type?.toUpperCase()] || type;
    return (
      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#08384F]/5 text-[#08384F] border border-[#08384F]/10 uppercase">
        {label}
      </span>
    );
  };

  const filteredSubjects = subjects.filter(
    (item) =>
      item.name?.toLowerCase().includes(search.toLowerCase()) ||
      item.code?.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="px-4 animate-in fade-in slide-in-from-bottom-2 duration-300  max-w-[1600px] mx-auto">
      <div className="flex justify-between items-center mb-4">
        <button
          onClick={handleBack}
          className="flex items-center gap-2 text-[#08384F] font-bold hover:text-[#0a4a69] transition-colors text-sm"
        >
          <ArrowLeft size={16} />
          Back
        </button>
        <button
          onClick={() => setIsEditDeptOpen(true)}
          className="flex items-center gap-2 text-gray-500 hover:text-[#08384F] transition-colors text-sm font-bold bg-white border border-gray-200 px-3 py-1.5 rounded-lg "
        >
          <Settings size={14} />
          Edit Department
        </button>
      </div>
      <div className="bg-white rounded-2xl border border-gray-300 overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-gray-50">
          <h2 className="text-lg font-bold text-gray-800">
            Subject Details
            <span className="ml-2 text-sm font-medium text-gray-400">
              ({filteredSubjects.length})
            </span>
          </h2>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                size={16}
              />
              <input
                type="text"
                placeholder="Search code or name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 pr-4 py-2 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#08384F]/5 focus:border-[#08384F] w-64 transition-all"
              />
            </div>
            <button
              onClick={() => setIsAddSubjectOpen(true)}
              className="flex items-center gap-2 bg-[#08384F] text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-[#0b3a53] transition-all active:scale-95"
            >
              <Plus size={16} />
              Add Subject
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px]">
            <thead>
              <tr className="bg-gray-50/50 text-[#08384F] text-[11px] uppercase tracking-wider border-b border-gray-100">
                <th className="text-left px-4 py-3 w-[120px] font-bold">
                  Code
                </th>
                <th className="text-left px-4 py-3 font-bold">Subject Name</th>
                <th className="text-center px-4 py-3 w-[120px] font-bold">
                  Regulation
                </th>
                <th className="text-center px-4 py-3 w-[100px] font-bold">
                  Type
                </th>
                <th className="text-center px-4 py-3 w-[80px] font-bold">
                  Credits
                </th>
                <th className="text-right px-4 py-3 w-[100px] font-bold">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr>
                  <td colSpan="6" className="py-20 text-center">
                    <Loader2
                      className="animate-spin mx-auto text-[#08384F] mb-2"
                      size={24}
                    />
                    <p className="text-xs text-gray-400">
                      Fetching subjects...
                    </p>
                  </td>
                </tr>
              ) : filteredSubjects.length > 0 ? (
                filteredSubjects.map((item) => (
                  <tr
                    key={item._id}
                    className="hover:bg-blue-50/20 transition-colors group"
                  >
                    <td className="px-4 py-3 font-mono text-md font-bold text-[#08384F] w-[120px] uppercase">
                      {item.code}
                    </td>
                    <td className="px-4 py-3 text-md text-gray-700 font-medium">
                      {item.name}
                    </td>
                    <td className="px-4 py-3 text-center w-[120px]">
                      <div className="flex items-center justify-center gap-1.5 text-[#08384F] bg-[#08384F]/5 py-1 px-2 rounded-lg border border-[#08384F]/10">
                        <Scale size={12} />
                        <span className="text-xs font-bold uppercase">
                          {item.regulationId?.name || "N/A"}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center w-[100px]">
                      {getCourseTypeLabel(item.courseType)}
                    </td>
                    <td className="px-4 py-3 text-center font-bold text-gray-600 text-md w-[80px]">
                      {item.credits}
                    </td>
                    <td className="px-4 py-3 w-[100px]">
                      <div className="flex justify-end gap-2 opacity-100 transition-opacity">
                        <button
                          onClick={() => setEditSubjectData(item)}
                          className="p-2 text-emerald-600 bg-emerald-100 rounded-lg transition-colors"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          onClick={() => setDeleteSubjectData(item)}
                          className="p-2 text-rose-600 bg-rose-100 rounded-lg transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="py-20 text-center">
                    <div className="flex flex-col items-center text-gray-300">
                      <BookX size={40} strokeWidth={1} />
                      <p className="text-md font-semibold mt-2 text-gray-400">
                        No subjects found
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <EditDepartmentModal
        isOpen={isEditDeptOpen}
        onClose={() => setIsEditDeptOpen(false)}
        deptId={deptId}
        onSuccess={() => fetchSubjects()}
      />

      <AddSubjectModal
        isOpen={isAddSubjectOpen}
        onClose={() => setIsAddSubjectOpen(false)}
        fetchSubjects={fetchSubjects}
      />

      <EditSubjectModal
        isOpen={!!editSubjectData}
        subject={editSubjectData}
        onClose={() => setEditSubjectData(null)}
        onSuccess={fetchSubjects}
      />

      <DeleteConfirmModal
        isOpen={!!deleteSubjectData}
        subjectId={deleteSubjectData?._id}
        subjectName={deleteSubjectData?.name}
        onClose={() => setDeleteSubjectData(null)}
        onSuccess={fetchSubjects}
      />
    </div>
  );
};

export default SubjectTable;
