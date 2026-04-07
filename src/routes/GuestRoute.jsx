import { Navigate, Outlet, useLocation } from "react-router-dom";

const GuestRoute = () => {
  const location = useLocation();
  const storedUser = localStorage.getItem("lms-user");
  const from = location.state?.from?.pathname;

  if (!storedUser) {
    return <Outlet />;
  }

  try {
    const user = JSON.parse(storedUser);

    if (user?.token && user?.role) {
      const destination = from || `/${user.role.toLowerCase()}/dashboard`;
      return <Navigate to={destination} replace />;
    }

    localStorage.removeItem("lms-user");
    return <Navigate to="/?message=session_expired" replace />;
  } catch {
    localStorage.removeItem("lms-user");
    return <Navigate to="/?message=invalid_session" replace />;
  }
};

export default GuestRoute;
