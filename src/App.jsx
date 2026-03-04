import { Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";

import GuestRoute from "./routes/GuestRoute";
import LoginPage from "./pages/auth/pages/LoginPage";

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
      </Routes>
    </>
  );
};

export default App;
