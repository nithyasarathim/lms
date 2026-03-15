import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import AdminSidebar from "../components/AdminSidebar";
import DashboardOverview from "../components/DashboardOverview";
import CurriculumManagement from "../components/CurriculumManagement";
import SubjectManagement from "../components/SubjectManagement";
import FacultyManagement from "../components/FacultyManagement";
import StudentManagement from "../components/StudentManagement";
import BatchManagement from "../components/BatchManagement";

const AdminDashboard = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [collapsed, setCollapsed] = useState(false);
  const activeTab = searchParams.get("tab") || "dashboard";

  const validTabs = [
    "dashboard",
    "curriculum-management",
    "subject-management",
    "faculty-management",
    "student-management",
    "batch-management",
  ];

  useEffect(() => {
    if (!validTabs.includes(activeTab)) {
      setSearchParams({ tab: "dashboard" }, { replace: true });
    }
  }, [activeTab, setSearchParams]);

  const renderComponent = () => {
    switch (activeTab) {
      case "dashboard":
        return <DashboardOverview />;
      case "curriculum-management":
        return <CurriculumManagement />;
      case "subject-management":
        return <SubjectManagement />;
      case "faculty-management":
        return <FacultyManagement />;
      case "student-management":
        return <StudentManagement />;
      case "batch-management":
        return <BatchManagement />;
      default:
        return <DashboardOverview />;
    }
  };

  return (
    <div className="flex min-h-screen ">
      <AdminSidebar collapsed={collapsed} setCollapsed={setCollapsed} />
      <div
        className={`flex-1 transition-all duration-300 ${
          collapsed ? "md:ml-[80px]" : "md:ml-[300px]"
        }`}
      >
        <main className="p-0">{renderComponent()}</main>
      </div>
    </div>
  );
};

export default AdminDashboard;
