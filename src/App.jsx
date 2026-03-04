import { Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";

import GuestRoute from "./routes/GuestRoute";
import RoleRoute from "./routes/RoleRoute";

import LoginPage from "./pages/auth/pages/LoginPage";

const AdminDashboard = () => <h1>Admin Dashboard</h1>;
const StudentDashboard = () => <h1>Student Dashboard</h1>;
const FacultyDashboard = () => <h1>Faculty Dashboard</h1>;
const HodDashboard = () => <h1>HOD Dashboard</h1>;

const App = () => {
  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          success: {
            iconTheme: {
              primary: "#08384F",
              secondary: "#fff",
            },
          },
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
