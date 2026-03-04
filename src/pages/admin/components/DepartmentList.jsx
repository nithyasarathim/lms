import React from "react";
import { Link } from "react-router-dom";
import {
  Monitor,
  Cpu,
  Shield,
  Radio,
  Zap,
  Settings,
  Brain,
  Briefcase,
  BookOpen,
  ChevronRight,
} from "lucide-react";

const departments = [
  {
    name: "Computer Science and Engineering (CSE)",
    icon: <Monitor size={20} />,
  },
  {
    name: "Computer Science and Engineering (AI & ML)",
    icon: <Cpu size={20} />,
  },
  {
    name: "Computer Science and Engineering (Cyber Security)",
    icon: <Shield size={20} />,
  },
  {
    name: "Computer & Communication Engineering (CCE)",
    icon: <Radio size={20} />,
  },
  {
    name: "Artificial Intelligence & Data Science (AI & DS)",
    icon: <Brain size={20} />,
  },
  {
    name: "Computer Science and Business Systems (CS&BS)",
    icon: <Briefcase size={20} />,
  },
  {
    name: "Electronics and Communication Engineering (ECE)",
    icon: <Cpu size={20} />,
  },
  {
    name: "Electrical & Electronics Engineering (EEE)",
    icon: <Zap size={20} />,
  },
  { name: "Information Technology (IT)", icon: <Monitor size={20} /> },
  { name: "Mechanical Engineering (MECH)", icon: <Settings size={20} /> },
  { name: "Science & Humanities", icon: <BookOpen size={20} /> },{ name: "Information Technology (IT)", icon: <Monitor size={20} /> },
  { name: "Mechanical Engineering (MECH)", icon: <Settings size={20} /> },
  { name: "Science & Humanities", icon: <BookOpen size={20} /> },{ name: "Information Technology (IT)", icon: <Monitor size={20} /> },
  { name: "Mechanical Engineering (MECH)", icon: <Settings size={20} /> },
  { name: "Science & Humanities", icon: <BookOpen size={20} /> },{ name: "Information Technology (IT)", icon: <Monitor size={20} /> },
  { name: "Mechanical Engineering (MECH)", icon: <Settings size={20} /> },
  { name: "Science & Humanities", icon: <BookOpen size={20} /> },{ name: "Information Technology (IT)", icon: <Monitor size={20} /> },
  { name: "Mechanical Engineering (MECH)", icon: <Settings size={20} /> },
  { name: "Science & Humanities", icon: <BookOpen size={20} /> },
];

const DepartmentList = ({ basePath }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-6  overflow-y-auto hide-scroll">
      {departments.map((dept, index) => {
        const separator = basePath.includes("?") ? "&" : "?";
        const targetUrl = `${basePath}${separator}dept=${encodeURIComponent(dept.name)}`;

        return (
          <Link
            key={index}
            to={targetUrl}
            className="flex items-center justify-between p-5 bg-[#F9F9F9] border border-[#CACACA] rounded-xl hover:shadow-lg hover:border-[#08384F] transition-all duration-300 group"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-[#08384F] text-white rounded-full shadow-md group-hover:scale-110 transition-transform">
                {dept.icon}
              </div>
              <p className="font-medium text-sm text-[#0B56A4]">{dept.name}</p>
            </div>
            <ChevronRight
              size={20}
              className="text-[#08384F] opacity-70 group-hover:translate-x-1 transition-transform"
            />
          </Link>
        );
      })}
    </div>
  );
};

export default DepartmentList;
