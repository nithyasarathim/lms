import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  BookOpen,
  CalendarCheck,
  ChevronRight,
  GraduationCap,
  Layout,
  Map,
  Users
} from 'lucide-react';

import { getClassroomById } from '../../faculty/api/faculty.api';
import ClassroomAttendance from '../../faculty/components/ClassroomAttendance';
import CoursePlan from '../../faculty/components/CoursePlan';
import ClassroomClasswork from './ClassroomClasswork';
import ClassroomPeople from './ClassroomPeople';
import ClassroomStream from './ClassroomStream';

const ClassroomDetails = ({ id, onBack, viewerRole = 'FACULTY' }) => {
  const [classroom, setClassroom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();

  const activeTab = searchParams.get('view') || 'stream';
  const isFacultyView = viewerRole === 'FACULTY';

  const tabs = useMemo(
    () => [
      { id: 'stream', label: 'Stream', icon: Layout },
      { id: 'classwork', label: 'Classwork', icon: BookOpen },
      { id: 'people', label: 'People', icon: Users },
      ...(isFacultyView
        ? [
            { id: 'grade', label: 'Grades', icon: GraduationCap },
            { id: 'attendance', label: 'Attendance', icon: CalendarCheck },
            { id: 'courseplan', label: 'Course Plan', icon: Map }
          ]
        : [])
    ],
    [isFacultyView]
  );

  useEffect(() => {
    let active = true;

    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await getClassroomById(id);
        if (active && response?.success) {
          setClassroom(response.data.classroom);
        }
      } catch (error) {
        console.error('Error fetching classroom:', error);
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      active = false;
    };
  }, [id]);

  useEffect(() => {
    if (tabs.some((tab) => tab.id === activeTab)) {
      return;
    }

    const nextParams = new URLSearchParams(searchParams);
    nextParams.set('view', 'stream');
    setSearchParams(nextParams, { replace: true });
  }, [activeTab, searchParams, setSearchParams, tabs]);

  const handleTabChange = (tabId) => {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set('view', tabId);
    setSearchParams(nextParams);
  };

  if (loading) {
    return (
      <div className="p-10 text-center animate-pulse text-gray-400">
        Loading details...
      </div>
    );
  }

  const subjectName = classroom?.subjectId?.name || 'Unknown Subject';
  const { facultyId } = JSON.parse(localStorage.getItem('lms-user') || '{}');

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
                  ? 'text-[#08384F] font-semibold'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <div
                className={`flex items-center justify-center w-8 h-8 rounded-full transition-all ${
                  isActive
                    ? 'bg-[#08384F] text-white'
                    : 'bg-gray-100 text-gray-500 group-hover:bg-gray-200'
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

      <div className="bg-white rounded-2xl p-3 border border-gray-100 shadow-sm min-h-100">
        {activeTab === 'stream' ? (
          <ClassroomStream classroom={classroom} viewerRole={viewerRole} />
        ) : null}

        {activeTab === 'classwork' ? (
          <ClassroomClasswork classroom={classroom} viewerRole={viewerRole} />
        ) : null}

        {activeTab === 'people' ? (
          <ClassroomPeople classroom={classroom} viewerRole={viewerRole} />
        ) : null}

        {isFacultyView && activeTab === 'grade' ? (
          <div className="animate-in fade-in duration-300">
            <h3 className="text-lg font-semibold text-gray-900">Grades</h3>
            <p className="text-gray-500 text-sm">
              Overview of student performance and grades.
            </p>
          </div>
        ) : null}

        {isFacultyView && activeTab === 'attendance' ? (
          <ClassroomAttendance classroom={classroom} facultyId={facultyId} />
        ) : null}

        {isFacultyView && activeTab === 'courseplan' ? (
          <CoursePlan classroom={classroom} />
        ) : null}
      </div>
    </div>
  );
};

export default ClassroomDetails;
