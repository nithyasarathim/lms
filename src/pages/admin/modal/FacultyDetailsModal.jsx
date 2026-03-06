import React, { useEffect, useRef, useState } from "react";
import {
  X,
  User,
  Briefcase,
  Mail,
  Phone,
  CalendarDays,
  GraduationCap,
  Clock,
  CheckCircle2,
  UserCog,
  Fingerprint,
  Smartphone,
  ShieldCheck,
  Award,
  Layers
} from "lucide-react";

const FacultyDetailsModal = ({ isOpen, onClose, faculty }) => {
  const canvasRef = useRef(null);
  const [activeTab, setActiveTab] = useState("Basic Profile");

  useEffect(() => {
    function handleOutsideClick(e) {
      if (canvasRef.current && !canvasRef.current.contains(e.target)) {
        onClose();
      }
    }
    if (isOpen) document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [isOpen, onClose]);

  if (!isOpen || !faculty) return null;

  const tabs = ["Basic Profile", "Attendance", "Subject List", "Timetable"];

  const InfoRow = ({ icon: Icon, label, value }) => (
    <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0 group">
      <div className="flex items-center gap-3">
        <div className="text-gray-500">
          <Icon size={14} strokeWidth={2} />
        </div>
        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
          {label}
        </span>
      </div>
      <span className="text-sm font-semibold text-gray-800">
        {value || "-"}
      </span>
    </div>
  );

  const ShimmerRow = () => (
    <div className="flex items-center justify-between py-4 animate-pulse">
      <div className="w-1/3 h-2 bg-gray-200 rounded"></div>
      <div className="w-1/4 h-2 bg-gray-100 rounded"></div>
    </div>
  );

  return (
    <>
      <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-[2px] z-[100] animate-in fade-in duration-500"></div>
      <section
        ref={canvasRef}
        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-6xl h-[90vh] bg-white rounded-xl z-[110] shadow-2xl flex flex-col overflow-hidden border border-gray-200 animate-in zoom-in-95 duration-300 font-['Poppins']"
      >
        <div className="px-10 py-6 border-b border-gray-100 flex items-center justify-between bg-white shrink-0">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center text-xl font-bold text-gray-700 border border-gray-200">
              {faculty.firstName?.[0]}{faculty.lastName?.[0]}
            </div>
            <div className="space-y-0.5">
              <div className="flex items-center gap-3">
                <h3 className="text-xl font-bold text-gray-900">
                  {faculty.salutation} {faculty.fullName}
                </h3>
                <span className={`text-[9px] px-2 py-0.5 rounded font-bold uppercase tracking-widest border ${
                  faculty.isActive 
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200" 
                  : "bg-red-50 text-red-700 border-red-200"
                }`}>
                  {faculty.isActive ? "Active" : "Inactive"}
                </span>
              </div>
              <p className="text-sm text-gray-600 font-medium">
                {faculty.designation} <span className="mx-2 text-gray-300">|</span> {faculty.departmentId?.name}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-md transition-all text-gray-400 hover:text-gray-900"
          >
            <X size={20} />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="px-10 bg-white border-b border-gray-100 flex items-center justify-between shrink-0">
          <div className="flex gap-10">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-4 text-xs font-bold uppercase tracking-widest transition-all relative ${
                  activeTab === tab ? "text-[#08384F]" : "text-gray-400 hover:text-gray-600"
                }`}
              >
                {tab}
                {activeTab === tab && (
                  <div className="absolute bottom-0 left-0 w-full h-[2px] bg-[#08384F]"></div>
                )}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2 text-gray-600 bg-gray-50 px-3 py-1 rounded-md border border-gray-100">
             <Fingerprint size={15} />
             <span className="text-[12px] font-bold tracking-widest">{faculty.employeeId}</span>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-10 bg-gray-50/40 custom-scrollbar">
          {activeTab === "Basic Profile" ? (
            <div className="grid grid-cols-2 gap-8 animate-in fade-in duration-500">
              {/* Personal Section */}
              <div className="space-y-4">
                <h4 className="text-[10px] font-bold text-gray-600 uppercase tracking-widest border-l-2 border-[#08384F] pl-3">
                  Personal Identity
                </h4>
                <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                  <InfoRow icon={Mail} label="University Email" value={faculty.userId?.email} />
                  <InfoRow icon={Phone} label="Primary Phone" value={faculty.primaryPhone} />
                  <InfoRow icon={Smartphone} label="Secondary Phone" value={faculty.secondaryPhone} />
                  <InfoRow icon={CalendarDays} label="Date of Birth" value={faculty.userId?.dateOfBirth?.split("T")[0]} />
                  <InfoRow icon={User} label="Gender" value={faculty.userId?.gender} />
                </div>
              </div>

              {/* Professional Section */}
              <div className="space-y-4">
                <h4 className="text-[10px] font-bold text-gray-600 uppercase tracking-widest border-l-2 border-[#08384F] pl-3">
                  Work Identity
                </h4>
                <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                  <InfoRow icon={GraduationCap} label="Qualification" value={faculty.qualification} />
                  <InfoRow icon={Award} label="Contract Type" value={faculty.workType} />
                  <InfoRow icon={Clock} label="Joining Date" value={faculty.joiningDate?.split("T")[0]} />
                  <InfoRow icon={UserCog} label="Reporting To" value={faculty.reportingManager || "Dean Office"} />
                  <InfoRow icon={ShieldCheck} label="Employment Status" value={faculty.employmentStatus} />
                </div>
              </div>

              {/* System Metadata */}
              <div className="col-span-2 space-y-4">
                <h4 className="text-[10px] font-bold text-gray-600 uppercase tracking-widest border-l-2 border-[#08384F] pl-3">
                  Record Metadata
                </h4>
                <div className="bg-white p-4 px-8 rounded-lg border border-gray-200 flex justify-between items-center shadow-sm">
                   <div className="flex flex-col">
                      <span className="text-[9px] font-bold text-gray-400 uppercase">System ID</span>
                      <span className="text-xs font-mono text-gray-600">{faculty._id}</span>
                   </div>
                   <div className="flex flex-col text-right">
                      <span className="text-[9px] font-bold text-gray-400 uppercase">Last Sync</span>
                      <span className="text-xs text-gray-600">{new Date(faculty.updatedAt).toLocaleString()}</span>
                   </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="max-w-2xl mx-auto py-12 animate-in fade-in duration-500">
              <div className="text-center space-y-2 mb-8">
                <h3 className="text-lg font-bold text-gray-800 tracking-tight">
                  {activeTab} Dashboard
                </h3>
                <p className="text-gray-500 text-xs font-medium uppercase tracking-widest">
                  Under Construction
                </p>
              </div>
              <div className="bg-white p-8 rounded-lg border border-gray-200 shadow-sm">
                {[1, 2, 3, 4].map((i) => (
                  <ShimmerRow key={i} />
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  );
};

export default FacultyDetailsModal;