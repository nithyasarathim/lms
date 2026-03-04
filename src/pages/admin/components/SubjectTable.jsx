import React from "react";
import { ArrowLeft, BookOpen, Users, ClipboardCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";

const SubjectTable = ({ departmentName }) => {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate("/admin/dashboard?tab=semester-registration");
  };

  return (
    <div className="px-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <button
        onClick={handleBack}
        className="flex items-center gap-2 text-[#08384F] font-medium hover:underline mb-6"
      >
        <ArrowLeft size={18} />
        Back to Departments
      </button>

      <div className="bg-white border border-[#CACACA] rounded-2xl p-8 shadow-sm">
        <div className="flex items-center gap-4 mb-6">
          <div className="p-4 bg-[#08384F] text-white rounded-xl shadow-lg">
            <BookOpen size={32} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-[#282526]">
              {departmentName}
            </h2>
            <p className="text-[#0B56A4]">Semester Registration Management</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 bg-[#F9F9F9] border border-gray-100 rounded-xl flex flex-col items-center text-center">
            <Users className="text-[#08384F] mb-2" size={28} />
            <h3 className="font-semibold text-gray-800">Student List</h3>
            <p className="text-xs text-gray-500 mt-1">
              View and manage enrolled students
            </p>
          </div>
          <div className="p-6 bg-[#F9F9F9] border border-gray-100 rounded-xl flex flex-col items-center text-center">
            <ClipboardCheck className="text-[#08384F] mb-2" size={28} />
            <h3 className="font-semibold text-gray-800">Course Selection</h3>
            <p className="text-xs text-gray-500 mt-1">
              Approve subject registrations
            </p>
          </div>
          <div className="p-6 bg-[#F9F9F9] border border-gray-100 rounded-xl flex flex-col items-center text-center">
            <BookOpen className="text-[#08384F] mb-2" size={28} />
            <h3 className="font-semibold text-gray-800">Curriculum</h3>
            <p className="text-xs text-gray-500 mt-1">
              Manage department syllabus
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubjectTable;
