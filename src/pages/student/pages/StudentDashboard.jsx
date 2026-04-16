import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import StudentSidebar from '../components/StudentSidebar';
import ClassroomPage from '../components/ClassroomPage';

const StudentDashboard = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [collapsed, setCollapsed] = useState(false);
  
  const activeTab = searchParams.get('tab') || 'classrooms';

  useEffect(() => {
    // Only 'classrooms' is valid now
    if (activeTab !== 'classrooms') {
      setSearchParams({ tab: 'classrooms' }, { replace: true });
    }
  }, [activeTab, setSearchParams]);

  const renderComponent = () => {
    const contentClass = `transition-all duration-300 ${collapsed ? 'pl-[80px]' : 'pl-[300px]'}`;

    switch (activeTab) {
      case 'classrooms':
        return (
          <div className={contentClass}>
            <ClassroomPage />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex min-h-screen">
      <StudentSidebar collapsed={collapsed} setCollapsed={setCollapsed} />
      <div className="flex-1">
        <main className="p-0">{renderComponent()}</main>
      </div>
    </div>
  );
};

export default StudentDashboard;