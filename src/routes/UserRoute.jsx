import { Navigate, Outlet } from "react-router-dom";

const UserRoute = () => {
  const storedUser = localStorage.getItem("lms-user");

  if (!storedUser) {
    return <Navigate to="/" replace />;
  }

  try {
    const user = JSON.parse(storedUser);

    if (user?.token && user?.role === "user") {
      return <Outlet />;
    }

    if (user?.token && user?.role) {
      return <Navigate to={`/${user.role.toLowerCase()}/dashboard`} replace />;
    }

    localStorage.removeItem("lms-user");
    return <Navigate to="/" replace />;
  } catch (error) {
    localStorage.removeItem("lms-user");
    return <Navigate to="/" replace />;
  }
};

export default UserRoute;
