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
} from "lucide-react";
import { getDepartments } from "../api/admin.api";

let departmentCache = null;

const DepartmentList = ({ basePath, filter = "" }) => {
  const [departments, setDepartments] = useState(departmentCache || []);
  const [loading, setLoading] = useState(!departmentCache);

  useEffect(() => {
    fetchDepts();
  }, []);

  const fetchDepts = async () => {
    try {
      if (!departmentCache) setLoading(true);
      const response = await getDepartments();
      const deptArray = Array.isArray(response)
        ? response
        : Array.isArray(response?.data)
          ? response.data
          : Array.isArray(response?.data?.departments)
            ? response.data.departments
            : [];

      departmentCache = deptArray;
      setDepartments(deptArray);
    } catch (err) {
      console.error("Error fetching departments:", err);
      if (!departmentCache) setDepartments([]);
    } finally {
      setLoading(false);
    }
  };

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

  const filteredDepartments = departments.filter(
    (dept) =>
      dept?.name?.toLowerCase().includes(filter.toLowerCase()) ||
      dept?.code?.toLowerCase().includes(filter.toLowerCase()),
  );

  if (loading && !departmentCache) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 px-6">
        {Array.from({ length: 10 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center justify-between p-5 bg-white border border-gray-200 rounded-xl"
          >
            <div className="flex items-center gap-4 w-full">
              <div className="w-12 h-12 rounded-full bg-gray-200 animate-pulse shrink-0" />
              <div className="flex-1 space-y-3">
                <div className="h-3 w-3/4 bg-gray-200 animate-pulse rounded" />
                <div className="h-3 w-1/2 bg-gray-200 animate-pulse rounded" />
              </div>
            </div>
            <div className="w-5 h-5 bg-gray-200 animate-pulse rounded ml-4 shrink-0" />
          </div>
        ))}
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
      {filteredDepartments.length === 0 && !loading && (
        <div className="col-span-full py-10 text-center text-gray-400">
          No departments found.
        </div>
      )}
    </div>
  );
};

export default DepartmentList;
