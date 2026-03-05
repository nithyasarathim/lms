import { Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { Info } from "lucide-react";

import GuestRoute from "./routes/GuestRoute";
import RoleRoute from "./routes/RoleRoute";

import LoginPage from "./pages/auth/pages/LoginPage";
import AdminDashboard from "./pages/admin/pages/AdminDashboard";

const StudentDashboard = () => <h1>Student Dashboard</h1>;
const FacultyDashboard = () => <h1>Faculty Dashboard</h1>;
const HodDashboard = () => <h1>HOD Dashboard</h1>;

const App = () => {
  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: "#ffffff",
            color: "#374151",
            border: "1px solid #E5E7EB",
            borderRadius: "10px",
            padding: "12px 16px",
            fontSize: "14px",
            boxShadow: "0 4px 10px rgba(0,0,0,0.08)",
          },
          icon: (
            <div
              style={{
                width: "28px",
                height: "28px",
                borderRadius: "9999px",
                background: "#08384F",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Info size={16} color="white" />
            </div>
          ),
        }}
      />

      <Routes>
        <Route element={<GuestRoute />}>
          <Route path="/" element={<LoginPage />} />
        </Route>

        <Route element={<RoleRoute allowedRole="ADMIN" />}>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
        </Route>

        <Route element={<RoleRoute allowedRole="STUDENT" />}>
          <Route path="/student/dashboard" element={<StudentDashboard />} />
        </Route>

        <Route element={<RoleRoute allowedRole="FACULTY" />}>
          <Route path="/faculty/dashboard" element={<FacultyDashboard />} />
        </Route>

        <Route element={<RoleRoute allowedRole="HOD" />}>
          <Route path="/hod/dashboard" element={<HodDashboard />} />
        </Route>
      </Routes>
    </>
  );
};

export default App;
