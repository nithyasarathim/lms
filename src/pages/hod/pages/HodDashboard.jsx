import React, { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import HodSidebar from "../components/HodSidebar";
import SectionManagement from "../components/SectionManagement";
import StaffAllocation from "../components/StaffAllocation";
import StudentManagement from "../components/StudentManagement";
import TimeTableManagement from "../components/TimeTableManagement";

const HodDashboard = () => {
  const [searchParams, setSearchParams] = useSearchParams();
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
        return <></>;

      case "staff-allocation":
        return <StaffAllocation />;

      case "timetable-management":
        return <TimeTableManagement />;

      case "section-management":
        return <SectionManagement />;

      case "student-management":
        return <StudentManagement />;

      default:
        return <h1 className="text-xl font-semibold">HOD Dashboard</h1>;
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <HodSidebar />

      <div className="flex-1 md:ml-[20%] transition-all duration-300">
        <main className="p-4">{renderComponent()}</main>
      </div>
    </div>
  );
};

export default HodDashboard;
