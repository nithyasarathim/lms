import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  ChevronRight,
  Layout,
  BookOpen,
  Users,
  GraduationCap,
  CalendarCheck,
} from "lucide-react";
import { getClassroomById } from "../api/faculty.api";
import ClassroomStream from "./ClassroomStream";
import ClassroomClasswork from "./ClassroomClasswork";
import ClassroomPeople from "./ClassroomPeople";
import ClassroomAttendance from "./ClassroomAttendance";

const ClassroomDetails = ({ id, onBack }) => {
  const [classroom, setClassroom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();

  const activeTab = searchParams.get("view") || "stream";

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await getClassroomById(id);
        if (res?.success) {
          setClassroom(res.data.classroom);
        }
      } catch (error) {
        console.error("Error fetching classroom:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleTabChange = (tabId) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set("view", tabId);
    setSearchParams(newParams);
  };

  if (loading)
    return (
      <div className="p-10 text-center animate-pulse text-gray-400">
        Loading details...
      </div>
    );

  const subjectName = classroom?.subjectId?.name || "Unknown Subject";

  const tabs = [
    { id: "stream", label: "Stream", icon: Layout },
    { id: "classwork", label: "Classwork", icon: BookOpen },
    { id: "people", label: "People", icon: Users },
    { id: "grade", label: "Grades", icon: GraduationCap },
    { id: "attendance", label: "Attendance", icon: CalendarCheck },
  ];

  return (
    <div className="px-6 max-w-7xl mx-auto">
      <nav className="flex items-center space-x-2 text-sm font-medium mb-4">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-500 transition-all ease-in duration-800 cursor-pointer hover:underline group"
        >
          <span>Classrooms</span>
        </button>
        <ChevronRight size={14} className="text-gray-400" />
        <div className="flex items-center gap-2 text-gray-900">
          <span className="truncate max-w-fit font-semibold text-sm">
            {subjectName}
          </span>
        </div>
      </nav>

      <div className="flex items-center gap-5 mb-6 overflow-x-auto no-scrollbar">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`flex items-center gap-3 px-4 py-2 text-sm transition-all relative whitespace-nowrap group ${
                isActive
                  ? "text-[#08384F] font-semibold"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <div
                className={`flex items-center justify-center w-8 h-8 rounded-full transition-all ${
                  isActive
                    ? "bg-[#08384F] text-white"
                    : "bg-gray-100 text-gray-500 group-hover:bg-gray-200"
                }`}
              >
                <Icon size={16} />
              </div>
              {tab.label}
              {isActive && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#08384F] rounded-full" />
              )}
            </button>
          );
        })}
      </div>

      <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm min-h-100">
        {activeTab === "stream" && <ClassroomStream classroom={classroom} />}

        {activeTab === "classwork" && (
          <ClassroomClasswork classroom={classroom} />
        )}

        {activeTab === "people" && <ClassroomPeople classroom={classroom} />}

        {activeTab === "grade" && (
          <div className="animate-in fade-in duration-300">
            <h3 className="text-lg font-semibold text-gray-900">Grades</h3>
            <p className="text-gray-500 text-sm">
              Overview of student performance and grades.
            </p>
          </div>
        )}

        {activeTab === "attendance" && <ClassroomAttendance classroom={classroom}/>}
      </div>
    </div>
  );
};

export default ClassroomDetails;
