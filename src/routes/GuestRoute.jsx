import { Navigate, Outlet } from "react-router-dom";

const GuestRoute = () => {
  const storedUser = localStorage.getItem("lms-user");

  if (!storedUser) {
    return <Outlet />;
  }

  try {
    const user = JSON.parse(storedUser);

    if (user?.token && user?.role) {
      return <Navigate to={`/${user.role.toLowerCase()}/dashboard`} replace />;
    }

    localStorage.removeItem("lms-user");
    return <Navigate to="/" replace />;
  } catch {
    localStorage.removeItem("lms-user");
    return <Navigate to="/" replace />;
  }
};

export default GuestRoute;
