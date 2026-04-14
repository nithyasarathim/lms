import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import FacultySidebar from '../components/FacultySidebar';
import ClassroomPage from '../components/ClassroomPage';
import CalendarComponent from '../components/CalendarComponent';
import TimetableComponent from '../components/TimetableComponent';


const FacultyDashboardHome = () => (
  <h1 className="p-6 text-xl font-semibold">Dashboard Home</h1>
);

const FacultyDashboard = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [collapsed, setCollapsed] = useState(false);
  const activeTab = searchParams.get('tab') || 'dashboard';

  const validTabs = ['dashboard', 'classrooms', 'calendar', 'timetable'];

  useEffect(() => {
    if (!validTabs.includes(activeTab)) {
      setSearchParams({ tab: 'dashboard' }, { replace: true });
    }
  }, [activeTab, setSearchParams]);

  const renderComponent = () => {
    const contentClass = `transition-all duration-300 ${collapsed ? 'pl-[80px]' : 'pl-[300px]'}`;

    switch (activeTab) {
      case 'dashboard':
        return (
          <div className={contentClass}>
            <FacultyDashboardHome />
          </div>
        );
      case 'classrooms':
        return (
          <div className={contentClass}>
            <ClassroomPage />
          </div>
        );
      case 'calendar':
        return (
          <div className={contentClass}>
            <CalendarComponent />
          </div>
        );
      case 'timetable':
        return (
          <div className={contentClass}>
            <TimetableComponent />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex min-h-screen">
      <FacultySidebar collapsed={collapsed} setCollapsed={setCollapsed} />
      <div className="flex-1">
        <main className="p-0">{renderComponent()}</main>
      </div>
    </div>
  );
};

export default FacultyDashboard;
