import { Navigate, Outlet } from "react-router-dom";

const RoleRoute = ({ allowedRole }) => {
  const storedUser = localStorage.getItem("lms-user");

  if (!storedUser) {
    return <Navigate to="/" replace />;
  }

  try {
    const user = JSON.parse(storedUser);
    if (!user?.token || !user?.role) {
      localStorage.removeItem("lms-user");
      return <Navigate to="/" replace />;
    }
    if (user.role === allowedRole) {
      return <Outlet />;
    }
    return (
      <Navigate
        to={`/${user.role.toLowerCase()}/dashboard`}
        replace
      />
    );

  } catch {
    localStorage.removeItem("lms-user");
    return <Navigate to="/" replace />;
  }
};

export default RoleRoute;
