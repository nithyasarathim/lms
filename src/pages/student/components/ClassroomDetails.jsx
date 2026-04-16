import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  ChevronRight,
  Layout,
  BookOpen,
  Users,
} from "lucide-react";

import ClassroomStream from "./ClassroomStream";
import ClassroomClasswork from "./ClassroomClasswork";
import ClassroomPeople from "./ClassroomPeople";

const DUMMY_CLASSROOM_DATA = {
  "1": {
    _id: "1",
    subjectId: { name: "Machine Learning", code: "CS801" },
    semesterNumber: 5,
    department: { code: "CSE" },
    sectionId: { name: "A" },
    faculty: { name: "Dr. Arunkumar", email: "arun@college.edu" },
    students: [
      { _id: "s1", name: "Alice Johnson", rollNo: "101" },
      { _id: "s2", name: "Bob Smith", rollNo: "102" },
      { _id: "s3", name: "Charlie Davis", rollNo: "103" },
    ],
    announcements: [
      { id: "a1", content: "Welcome to the Machine Learning course!", date: "2024-03-20" },
      { id: "a2", content: "Assignment 1 has been posted in Classwork.", date: "2024-03-22" }
    ]
  },
  "2": {
    _id: "2",
    subjectId: { name: "Data Structures", code: "CS302" },
    semesterNumber: 3,
    department: { code: "CSE" },
    sectionId: { name: "B" },
    faculty: { name: "Prof. Sarah", email: "sarah@college.edu" },
    students: [
      { _id: "s4", name: "David Miller", rollNo: "201" },
      { _id: "s5", name: "Eva Green", rollNo: "202" },
    ]
  }
};

const ClassroomDetails = ({ id, onBack }) => {
  const [classroom, setClassroom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();

  const activeTab = searchParams.get("view") || "stream";

  useEffect(() => {
    const fetchData = () => {
      setLoading(true);
      setTimeout(() => {
        const data = DUMMY_CLASSROOM_DATA[id] || DUMMY_CLASSROOM_DATA["1"];
        setClassroom(data);
        setLoading(false);
      }, 800);
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
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-[#08384F] border-t-transparent rounded-full animate-spin"></div>
          <p className="font-medium">Loading classroom details...</p>
        </div>
      </div>
    );

  const subjectName = classroom?.subjectId?.name || "Unknown Subject";

  const tabs = [
    { id: "stream", label: "Stream", icon: Layout },
    { id: "classwork", label: "Classwork", icon: BookOpen },
    { id: "people", label: "People", icon: Users },
  ];

  return (
    <div className="px-6 max-w-7xl mx-auto mb-10">
      <nav className="flex items-center space-x-2 text-sm font-medium mb-6">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-500 hover:text-[#08384F] transition-colors cursor-pointer"
        >
          Classrooms
        </button>
        <ChevronRight size={14} className="text-gray-400" />
        <span className="text-gray-900 font-semibold truncate">
          {subjectName}
        </span>
      </nav>

      <div className="flex items-center gap-2 mb-6 border-b border-gray-100 overflow-x-auto no-scrollbar">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`flex items-center gap-2 px-5 py-3 text-sm transition-all relative whitespace-nowrap group ${
                isActive
                  ? "text-[#08384F] font-bold"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <Icon size={18} className={isActive ? "text-[#08384F]" : "text-gray-400"} />
              {tab.label}
              {isActive && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#08384F] rounded-full" />
              )}
            </button>
          );
        })}
      </div>

      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm min-h-[500px]">
        {activeTab === "stream" && <ClassroomStream classroom={classroom} />}

        {activeTab === "classwork" && (
          <ClassroomClasswork classroom={classroom} />
        )}

        {activeTab === "people" && <ClassroomPeople classroom={classroom} />}

        {activeTab === "attendance" && (
          <ClassroomAttendance classroom={classroom} />
        )}

        {activeTab === "courseplan" && <CoursePlan classroom={classroom} />}
      </div>
    </div>
  );
};

export default ClassroomDetails;