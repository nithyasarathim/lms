import { Navigate, Outlet } from "react-router-dom";

const GuestRoute = () => {
  const token = localStorage.getItem("usertoken");
  if (token) {
    return <Navigate to="/dashboard" replace />;
  }
  return <Outlet />;
};

export default GuestRoute;
