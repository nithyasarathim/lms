import React, { useEffect, useState } from 'react';
import {
  matchPath,
  useLocation,
  useSearchParams,
} from 'react-router-dom';

import ClassroomWorkDetailPage from '../../shared/components/ClassroomWorkDetailPage';
import ClassroomPage from '../../shared/classroom/ClassroomPage';
import StudentAttendance from '../components/StudentAttendance';
import StudentDashboard from '../components/StudentDashboard';
import StudentSidebar from '../components/StudentSidebar';

const StudentPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const activeTab = searchParams.get('tab') || 'dashboard';
  const validTabs = ['dashboard', 'classrooms', 'attendance'];

  const isDetailRoute = !!matchPath(
    '/student/dashboard/classroom/:classroomId/post/:postId',
    location.pathname
  );

  useEffect(() => {
    if (!validTabs.includes(activeTab)) {
      setSearchParams({ tab: 'dashboard' }, { replace: true });
    }
  }, [activeTab, setSearchParams]);

  const contentClass = `transition-all duration-300 ${
    collapsed ? 'pl-[80px]' : 'pl-[300px]'
  }`;

  return (
    <div className="flex h-screen overflow-hidden">
      <StudentSidebar collapsed={collapsed} setCollapsed={setCollapsed} />
      <div className="flex-1 overflow-hidden">
        <main className="p-0 h-full overflow-hidden">
          <div
            className={`${contentClass} h-full ${
              isDetailRoute ? 'overflow-y-auto' : 'overflow-hidden'
            }`}
          >
            {isDetailRoute ? (
              <ClassroomWorkDetailPage viewerRole="STUDENT" />
            ) : activeTab === 'dashboard' ? (
              <StudentDashboard />
            ) : activeTab === 'attendance' ? (
              <StudentAttendance />
            ) : (
              <ClassroomPage viewerRole="STUDENT" />
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default StudentPage;
