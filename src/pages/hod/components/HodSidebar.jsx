import React, { useState } from "react";
import { motion } from "framer-motion";
import EshwarLogo from "../../../assets/eshwarLogo.png";
import {
  Menu,
  LayoutDashboard,
  Users,
  GraduationCap,
  CalendarClock,
  Layers,
  LogOut,
} from "lucide-react";
import { useSearchParams } from "react-router-dom";

const HodSidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get("tab") || "dashboard";

  const navItems = [
    { label: "Dashboard", icon: LayoutDashboard, tab: "dashboard" },
    {
      label: "Section Management",
      icon: Layers,
      tab: "section-management",
    },
    {
      label: "Staff Allocation",
      icon: Users,
      tab: "staff-allocation",
    },
    {
      label: "Student Management",
      icon: GraduationCap,
      tab: "student-management",
    },
    {
      label: "Timetable Management",
      icon: CalendarClock,
      tab: "timetable-management",
    },
  ];

  const handleTabChange = (tab) => {
    setSearchParams({ tab });
  };

  const handleLogout = () => {
    localStorage.removeItem("lms-user");
    window.location.href = "/";
  };

  return (
    <div className="relative hidden md:block">
      <div
        className={`fixed top-0 left-0 h-screen bg-[#08384F] z-50 transition-all duration-300 flex flex-col w-[300px]`}
      >
        <div className="logo-container">
          <div className="flex justify-center p-6">
            {!collapsed && (
              <img
                src={EshwarLogo}
                alt="logo"
                className="w-[200px] object-cover"
              />
            )}
          </div>
        </div>

        <div className="flex-1 space-y-1 pl-2 relative">
          {navItems.map((item) => {
            const active = activeTab === item.tab;
            const Icon = item.icon;

            return (
              <button
                key={item.tab}
                onClick={() => handleTabChange(item.tab)}
                className={`flex items-center w-full h-[54px] px-3 rounded-l-[14px] transition-colors duration-200 relative group ${
                  active ? "text-[#08384F]" : "text-white hover:bg-white/10"
                }`}
              >
                {active && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-white rounded-l-[14px]"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}

                <span
                  className={`relative z-10 flex items-center justify-center rounded-full h-10 w-10 transition-colors duration-200 ${
                    active ? "bg-[#08384F]" : "bg-transparent"
                  }`}
                >
                  <Icon size={18} className="text-white" />
                </span>

                {!collapsed && (
                  <span className="relative z-10 font-semibold ml-2 whitespace-nowrap">
                    {item.label}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <div className="px-4 py-6 absolute bottom-4 w-full">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 text-white font-medium px-4 py-2 w-full rounded-lg cursor-pointer hover:bg-white/10 transition-all duration-200"
          >
            <LogOut size={18} />
            {!collapsed && "Logout"}
          </button>
        </div>
      </div>

      {collapsed && (
        <div
          onClick={() => setCollapsed(false)}
          className="fixed top-3 left-3 cursor-pointer z-50 text-white"
        >
          <Menu size={26} />
        </div>
      )}
    </div>
  );
};

export default HodSidebar;
