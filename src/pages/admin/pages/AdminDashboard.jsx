import React, { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import AdminSidebar from "../components/AdminSidebar";
import DashboardOverview from "../components/DashboardOverview";
import RegulationManagement from "../components/RegulationManagement";
import SubjectManagement from "../components/SubjectManagement";
import FacultyManagement from "../components/FacultyManagement";
import StudentManagement from "../modal/StudentManagement";
import BatchManagement from "../components/BatchManagement";

const AdminDashboard = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get("tab") || "dashboard";

  const validTabs = [
    "dashboard",
    "regulation-management",
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
      case "regulation-management":
        return <RegulationManagement />;
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
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />
      <div className="flex-1 md:ml-[20%] transition-all duration-300">
        <main className="p-4">{renderComponent()}</main>
      </div>
    </div>
  );
};

export default AdminDashboard;
