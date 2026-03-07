import React from "react";
import {
  X,
  GraduationCap,
  Mail,
  Calendar,
  User,
  Hash,
  Layers,
  MapPin,
  ShieldCheck,
  ShieldAlert,
  Fingerprint,
  BookOpen,
  CalendarCheck,
} from "lucide-react";

const StudentDetailsModal = ({ isOpen, onClose, student }) => {
  if (!isOpen || !student) return null;

  const DetailItem = ({
    icon: Icon,
    label,
    value,
    color = "text-gray-500",
    fullWidth = false,
  }) => (
    <div
      className={`flex items-center gap-3 p-3 bg-gray-50 rounded-2xl border border-gray-100 transition-all hover:bg-white hover:shadow-sm ${fullWidth ? "col-span-full" : ""}`}
    >
      <div className={`p-2 rounded-xl bg-white shadow-sm ${color}`}>
        <Icon size={18} />
      </div>
      <div>
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider leading-none mb-1">
          {label}
        </p>
        <p className="text-sm font-bold text-[#08384F] leading-none">
          {value || "N/A"}
        </p>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div
        className="fixed inset-0 bg-[#08384F]/20 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div className="bg-white w-full max-w-2xl max-h-[90vh] rounded-[2.5rem] shadow-2xl relative overflow-hidden animate-in fade-in zoom-in duration-300 font-['Poppins'] flex flex-col">
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-r from-[#08384F] to-[#0b4a68]" />

        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all z-10"
        >
          <X size={20} />
        </button>

        <div className="relative pt-12 px-8 flex flex-col items-center flex-shrink-0">
          <div className="w-28 h-28 bg-white rounded-3xl shadow-xl flex items-center justify-center border-4 border-white mb-4 overflow-hidden flex-shrink-0">
            <div className="w-full h-full bg-gray-50 flex items-center justify-center text-[#08384F]">
              <User size={48} strokeWidth={1.5} />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 text-center">
            {student.firstName} {student.lastName}
          </h2>
          <div className="flex items-center gap-2 mt-1 mb-8">
            <span
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                student.status === "active"
                  ? "bg-green-100 text-green-600"
                  : "bg-red-100 text-red-600"
              }`}
            >
              {student.status === "active" ? (
                <ShieldCheck size={12} />
              ) : (
                <ShieldAlert size={12} />
              )}
              {student.status}
            </span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-8 pb-4 custom-scrollbar">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] ml-1 flex items-center gap-2sticky top-0 bg-white py-1 z-10">
                <BookOpen size={14} /> Academic Information
              </h3>
              <div className="grid grid-cols-1 gap-3">
                <DetailItem
                  icon={Fingerprint}
                  label="Roll Number"
                  value={student.rollNumber}
                  color="text-blue-500"
                />
                <DetailItem
                  icon={Hash}
                  label="Register Number"
                  value={student.registerNumber}
                  color="text-indigo-500"
                />
                <DetailItem
                  icon={GraduationCap}
                  label="Department"
                  value={student.department?.name}
                  color="text-purple-500"
                />
                <DetailItem
                  icon={Layers}
                  label="Section"
                  value={
                    student.section?.name === "UNALLOCATED"
                      ? "Unallocated (U)"
                      : student.section?.name
                  }
                  color="text-emerald-500"
                />
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] ml-1 flex items-center gap-2 sticky top-0 bg-white py-1 z-10">
                <User size={14} /> Course & Personal
              </h3>
              <div className="grid grid-cols-1 gap-3">
                <DetailItem
                  icon={Calendar}
                  label="Batch"
                  value={student.batch?.name}
                  color="text-orange-500"
                />
                <DetailItem
                  icon={CalendarCheck}
                  label="Academic Year"
                  value={student.academicYear?.name}
                  color="text-teal-500"
                />
                <div className="grid grid-cols-2 gap-3">
                  <DetailItem
                    icon={Layers}
                    label="Year Level"
                    value={
                      student.yearLevel ? `${student.yearLevel} Year` : "N/A"
                    }
                    color="text-pink-500"
                  />
                  <DetailItem
                    icon={BookOpen}
                    label="Semester"
                    value={
                      student.semesterNumber
                        ? `${student.semesterNumber}nd Sem`
                        : "N/A"
                    }
                    color="text-cyan-500"
                  />
                </div>
                <DetailItem
                  icon={User}
                  label="Gender"
                  value={student.user?.gender}
                  color="text-amber-500"
                />
              </div>
            </div>

            <div className="col-span-full space-y-4 pb-4">
              <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] ml-1 flex items-center gap-2 sticky top-0 bg-white py-1 z-10">
                <Mail size={14} /> Communication
              </h3>
              <DetailItem
                icon={Mail}
                label="Institutional Email"
                value={student.user?.email}
                color="text-sky-500"
                fullWidth={true}
              />
            </div>
          </div>
        </div>

        <div className="px-8 py-6 border-t border-gray-100 flex justify-end flex-shrink-0 bg-white z-10">
          <button
            onClick={onClose}
            className="px-8 py-3 bg-[#08384F] text-white text-sm font-bold rounded-2xl shadow-lg shadow-blue-900/20 hover:bg-[#0a4763] hover:shadow-blue-900/30 transition-all active:scale-95"
          >
            Close Profile
          </button>
        </div>
      </div>
    </div>
  );
};

export default StudentDetailsModal;
