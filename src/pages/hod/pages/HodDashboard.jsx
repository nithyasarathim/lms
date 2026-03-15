import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import HodSidebar from "../components/HodSidebar";
import SectionManagement from "../components/SectionManagement";
import StaffAllocation from "../components/StaffAllocation";
import StudentManagement from "../components/StudentManagement";
import TimeTableManagement from "../components/TimeTableManagement";

const HodDashboard = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [collapsed, setCollapsed] = useState(false);
  const activeTab = searchParams.get("tab") || "dashboard";

  const validTabs = [
    "dashboard",
    "staff-allocation",
    "timetable-management",
    "student-management",
    "section-management",
  ];

  useEffect(() => {
    if (!validTabs.includes(activeTab)) {
      setSearchParams({ tab: "dashboard" }, { replace: true });
    }
  }, [activeTab, setSearchParams]);

  const renderComponent = () => {
    switch (activeTab) {
      case "dashboard":
        return (
          <div
            className={`transition-all duration-300 ${collapsed ? "pl-[80px]" : "pl-[300px]"}`}
          >
            <h1 className="p-6 text-xl font-semibold">HOD Dashboard</h1>
          </div>
        );
      case "staff-allocation":
        return <StaffAllocation collapsed={collapsed} />;
      case "timetable-management":
        return (
          <div
            className={`transition-all duration-300 ${collapsed ? "pl-[80px]" : "pl-[300px]"}`}
          >
            <TimeTableManagement />
          </div>
        );
      case "section-management":
        return <SectionManagement collapsed={collapsed} />;
      case "student-management":
        return (
          <div
            className={`transition-all duration-300 ${collapsed ? "pl-[80px]" : "pl-[300px]"}`}
          >
            <StudentManagement />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex min-h-screen">
      <HodSidebar collapsed={collapsed} setCollapsed={setCollapsed} />
      <div className="flex-1">
        <main className="p-0">{renderComponent()}</main>
      </div>
    </div>
  );
};

export default HodDashboard;
