import React from 'react';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  CalendarCheck2,
  ChevronLeft,
  LogOut,
  Menu,
  School,
} from 'lucide-react';
import {
  useLocation,
  useNavigate,
  useSearchParams,
} from 'react-router-dom';

import EshwarIcon from '../../../assets/EshwarIcon.png';
import EshwarLogo from '../../../assets/EshwarLogo.png';

const StudentSidebar = ({ collapsed, setCollapsed }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  const activeTab = location.pathname.includes('/student/dashboard/classroom/')
    ? 'classrooms'
    : searchParams.get('tab') || 'dashboard';

  const navItems = [
    {
      label: 'Dashboard',
      icon: LayoutDashboard,
      tab: 'dashboard',
    },
    {
      label: 'Classrooms',
      icon: School,
      tab: 'classrooms',
    },
    {
      label: 'Attendance',
      icon: CalendarCheck2,
      tab: 'attendance',
    },
  ];

  const handleNavigate = (tab) => {
    if (location.pathname !== '/student/dashboard') {
      navigate(`/student/dashboard?tab=${tab}`);
      return;
    }
    setSearchParams({ tab });
  };

  const handleLogout = () => {
    localStorage.removeItem('lms-user');
    window.location.href = '/';
  };

  return (
    <div className="relative hidden md:block">
      <style>
        {`
          .curve-before::before {
            content: "";
            position: absolute;
            top: -20px;
            right: 0;
            width: 20px;
            height: 20px;
            background: transparent;
            border-bottom-right-radius: 10px;
            box-shadow: 6px 6px 0 0 white;
            z-index: 20;
          }
          .curve-after::after {
            content: "";
            position: absolute;
            bottom: -20px;
            right: 0;
            width: 20px;
            height: 20px;
            background: transparent;
            border-top-right-radius: 10px;
            box-shadow: 6px -6px 0 0 white;
            z-index: 20;
          }
        `}
      </style>

      <div
        className={`fixed top-0 left-0 z-50 flex h-screen flex-col bg-[#08384F] transition-all duration-300 ${
          collapsed ? 'w-20' : 'w-75'
        }`}
      >
        <div className="relative flex min-h-25 items-center justify-center p-6">
          {!collapsed ? (
            <img src={EshwarLogo} alt="logo" className="w-50 object-contain" />
          ) : (
            <img src={EshwarIcon} alt="icon" className="h-10 w-10 object-contain" />
          )}

          <button
            onClick={() => setCollapsed(!collapsed)}
            className="absolute top-10 -right-3 z-60 rounded-full border border-gray-200 bg-white p-1 text-[#08384F] shadow-md"
          >
            {collapsed ? <Menu size={16} /> : <ChevronLeft size={16} />}
          </button>
        </div>

        <div className="mt-4 flex-1 space-y-1 pl-2">
          {navItems.map((item) => {
            const active = activeTab === item.tab;
            const Icon = item.icon;

            return (
              <button
                key={item.tab}
                onClick={() => handleNavigate(item.tab)}
                className={`relative flex h-13.5 w-full items-center rounded-l-[25px] px-3 transition-colors duration-200 ${
                  active ? 'text-[#08384F]' : 'text-white hover:bg-white/5'
                }`}
              >
                {active ? (
                  <motion.div
                    layoutId="activeTabStudent"
                    className="curve-before curve-after absolute inset-0 rounded-l-[25px] bg-white"
                    transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                  />
                ) : null}

                <span
                  className={`relative z-10 flex h-10 w-10 items-center justify-center rounded-full ${
                    active ? 'bg-[#08384F] text-white' : 'bg-transparent'
                  }`}
                >
                  <Icon size={18} />
                </span>

                {!collapsed ? (
                  <span className="relative z-10 ml-3 whitespace-nowrap text-md font-semibold">
                    {item.label}
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>

        <div className="mb-4 px-4 py-6 text-sm font-semibold">
          <button
            onClick={handleLogout}
            className={`flex items-center gap-3 rounded-lg px-4 py-2 font-medium text-white transition-all duration-200 hover:bg-white/10 ${
              collapsed ? 'justify-center px-0 w-full' : 'w-full'
            }`}
          >
            <LogOut size={18} />
            {!collapsed ? <span>Logout</span> : null}
          </button>
        </div>
      </div>
    </div>
  );
};

export default StudentSidebar;
