import React from "react";
import { motion } from "framer-motion";
import EshwarLogo from "../../../assets/EshwarLogo.png";
import EshwarIcon from "../../../assets/EshwarIcon.png";
import {
  Menu,
  LayoutDashboard,
  LogOut,
  ChevronLeft,
  School,
  CalendarDays,
  Calendar,
} from "lucide-react";
import { useSearchParams, useLocation, useNavigate } from "react-router-dom";

const FacultySidebar = ({ collapsed, setCollapsed }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  const activeTab = searchParams.get("tab") || "dashboard";

  const navItems = [
    { label: "Dashboard", icon: LayoutDashboard, tab: "dashboard" },
    { label: "Classrooms", icon: School, tab: "classrooms" },
    { label: "Calendar", icon: Calendar, tab: "calendar" },
    { label: "Time Table", icon: CalendarDays, tab: "timetable" },
  ];

  const handleTabChange = (tab) => {
    if (location.pathname !== "/faculty/dashboard") {
      navigate(`/faculty/dashboard?tab=${tab}`);
      return;
    }
    setSearchParams({ tab });
  };

  const handleLogout = () => {
    localStorage.removeItem("lms-user");
    window.location.href = "/";
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
        className={`fixed top-0 left-0 h-screen bg-[#08384F] z-50 transition-all duration-300 flex flex-col ${
          collapsed ? "w-20" : "w-75"
        }`}
      >
        <div className="relative flex justify-center items-center p-6 min-h-25">
          {!collapsed ? (
            <img src={EshwarLogo} alt="logo" className="w-50 object-contain" />
          ) : (
            <img
              src={EshwarIcon}
              alt="icon"
              className="w-10 h-10 object-contain"
            />
          )}

          <button
            onClick={() => setCollapsed(!collapsed)}
            className="absolute -right-3 top-10 bg-white text-[#08384F] rounded-full p-1 shadow-md border border-gray-200 z-60"
          >
            {collapsed ? <Menu size={16} /> : <ChevronLeft size={16} />}
          </button>
        </div>

        <div className="flex-1 space-y-1 pl-2 relative mt-4">
          {navItems.map((item) => {
            const active = activeTab === item.tab;
            const Icon = item.icon;

            return (
              <button
                key={item.tab}
                onClick={() => handleTabChange(item.tab)}
                className={`flex items-center w-full h-13.5 px-3 rounded-l-[25px] transition-colors duration-200 relative group outline-none ${
                  active ? "text-[#08384F]" : "text-white hover:bg-white/5"
                }`}
              >
                {active && (
                  <motion.div
                    layoutId="activeTabFaculty"
                    className="absolute inset-0 bg-white rounded-l-[25px] curve-before curve-after"
                    transition={{
                      type: "spring",
                      stiffness: 350,
                      damping: 30,
                    }}
                  />
                )}

                <span
                  className={`relative z-10 flex items-center justify-center rounded-full h-10 w-10 shrink-0 transition-colors duration-300 ${
                    active ? "bg-[#08384F]" : "bg-transparent"
                  }`}
                >
                  <Icon
                    size={18}
                    className={`${active ? "text-white" : "inherit"}`}
                  />
                </span>

                {!collapsed && (
                  <span className="relative z-10 font-semibold ml-3 whitespace-nowrap overflow-hidden text-md">
                    {item.label}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <div className="px-4 py-6 mb-4 font-semibold text-sm">
          <button
            onClick={handleLogout}
            className={`flex items-center gap-3 text-white font-medium px-4 py-2 w-full rounded-lg cursor-pointer hover:bg-white/10 transition-all duration-200 ${
              collapsed ? "justify-center px-0 " : " w-fit"
            }`}
          >
            <LogOut size={18} />
            {!collapsed && <span className="">Logout</span>}
          </button>
        </div>
      </div>
    </div>
  );
};

export default FacultySidebar;
