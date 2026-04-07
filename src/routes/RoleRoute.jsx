import { Navigate, Outlet, useLocation } from "react-router-dom";

const RoleRoute = ({ allowedRole }) => {
  const location = useLocation();
  const storedUser = localStorage.getItem("lms-user");

  if (!storedUser) {
    const redirectUrl = encodeURIComponent(location.pathname + location.search);
    return (
      <Navigate
        to={`/?redirect=${redirectUrl}`}
        state={{ from: location }}
        replace
      />
    );
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

    const redirectUrl = encodeURIComponent(location.pathname + location.search);
    return (
      <Navigate
        to={`/${user.role.toLowerCase()}/dashboard?message=role_mismatch&redirect=${redirectUrl}`}
        replace
      />
    );
  } catch {
    localStorage.removeItem("lms-user");
    return <Navigate to="/" replace />;
  }
};

export default RoleRoute;
