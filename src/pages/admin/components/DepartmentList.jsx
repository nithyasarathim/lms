import React, { useEffect, useState } from "react";
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
  Loader2,
} from "lucide-react";
import { getDepartments } from "../api/admin.api";

const DepartmentList = ({ basePath, filter = "" }) => {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDepts = async () => {
      try {
        const response = await getDepartments();

        const deptArray = Array.isArray(response)
          ? response
          : Array.isArray(response?.data)
            ? response.data
            : [];

        setDepartments(deptArray);
      } catch (err) {
        console.error("Error fetching departments:", err);
        setDepartments([]);
      } finally {
        setLoading(false);
      }
    };

    fetchDepts();
  }, []);

  const getIcon = (code) => {
    const iconMap = {
      CSE: <Monitor size={20} />,
      AIML: <Cpu size={20} />,
      CS: <Shield size={20} />,
      CCE: <Radio size={20} />,
      AIDS: <Brain size={20} />,
      CSBS: <Briefcase size={20} />,
      ECE: <Cpu size={20} />,
      EEE: <Zap size={20} />,
      IT: <Monitor size={20} />,
      MECH: <Settings size={20} />,
    };

    return iconMap[code?.toUpperCase()] || <BookOpen size={20} />;
  };

  const filteredDepartments = departments.filter((dept) =>
    dept?.name?.toLowerCase().includes(filter.toLowerCase()),
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20 w-full">
        <Loader2 className="animate-spin text-[#08384F]" size={40} />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 px-6 overflow-y-auto hide-scroll">
      {filteredDepartments.map((dept) => {
        const separator = basePath.includes("?") ? "&" : "?";
        const targetUrl = `${basePath}${separator}deptId=${dept._id}`;

        return (
          <Link
            key={dept._id}
            to={targetUrl}
            className="flex items-center justify-between p-5 bg-[#F9F9F9] border border-[#CACACA] rounded-xl hover:shadow-lg hover:border-[#08384F] transition-all duration-300 group"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-[#08384F] text-white rounded-full shadow-md group-hover:scale-110 transition-transform">
                {getIcon(dept.code)}
              </div>
              <div>
                <p className="font-medium text-sm text-[#0B56A4]">
                  {dept.program} {dept.name} ({dept.code})
                </p>
              </div>
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
