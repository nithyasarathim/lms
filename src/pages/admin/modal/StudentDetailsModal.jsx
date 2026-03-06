import React from "react";
import { X, Mail, Phone, Hash, BookOpen, Layers, User } from "lucide-react";

const StudentDetailsModal = ({ isOpen, onClose, student }) => {
  if (!isOpen || !student) return null;

  const InfoItem = ({ icon: Icon, label, value }) => (
    <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100">
      <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-[#08384F] shadow-sm">
        <Icon size={18} />
      </div>
      <div>
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
          {label}
        </p>
        <p className="text-sm font-bold text-[#08384F]">{value || "N/A"}</p>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[110] p-4 font-['Poppins']">
      <div className="bg-white rounded-[32px] w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="relative h-24 bg-[#08384F] p-6">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
          >
            <X size={20} />
          </button>
          <div className="absolute -bottom-10 left-8 w-20 h-20 bg-white rounded-3xl p-1 shadow-xl">
            <div className="w-full h-full bg-blue-50 rounded-2xl flex items-center justify-center text-[#08384F]">
              <User size={40} />
            </div>
          </div>
        </div>

        <div className="pt-14 px-8 pb-8">
          <div className="mb-6">
            <h2 className="text-2xl font-black text-[#08384F]">
              {student.fullName}
            </h2>
            <span
              className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${student.isActive ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"}`}
            >
              {student.isActive ? "Active Student" : "Inactive"}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <InfoItem
              icon={Hash}
              label="Student ID"
              value={student.studentId}
            />
            <InfoItem
              icon={Layers}
              label="Year / Section"
              value={`${student.currentYear} - ${student.section}`}
            />
            <InfoItem
              icon={BookOpen}
              label="Department"
              value={student.departmentId?.name || student.department}
            />
            <InfoItem
              icon={Phone}
              label="Contact"
              value={student.primaryPhone}
            />
            <div className="col-span-2">
              <InfoItem
                icon={Mail}
                label="Institutional Email"
                value={student.userId?.email || student.email}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDetailsModal;
