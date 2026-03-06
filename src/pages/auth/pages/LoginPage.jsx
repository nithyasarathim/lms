import React, { useState } from "react";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { login } from "../api/auth.api";
import loginBackground from "../../../assets/loginBackground.svg";

const LoginPage = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await login(formData);

      if (!res?.success) {
        return toast.error(res?.message || "Invalid credentials");
      }

      const { token, role, _id, email } = res.data;

      localStorage.setItem(
        "lms-user",
        JSON.stringify({ token, role, _id, email }),
      );

      toast.success("Welcome back!");
      navigate(`/${role.toLowerCase()}/dashboard`, { replace: true });
    } catch (error) {
      const errorMsg =
        error.message ||
        "Something went wrong. Please try again.";
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="w-full min-h-screen bg-gray-50 p-4 md:p-8 font-['Poppins']">
      <div className="w-full h-full md:flex gap-8">
        <div className="hidden md:block md:w-[60%]">
          <div className="h-full rounded-3xl overflow-hidden shadow-lg">
            <img
              src={loginBackground}
              alt="Login Background"
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        <div className="w-full md:w-[40%] flex items-center justify-center">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-10">
            <div className="mb-8 text-center">
              <h2 className="text-3xl font-semibold text-gray-800 mb-2">
                Sign in to <span className="text-[#0B56A4]">LMS</span>
              </h2>
              <p className="text-gray-500 text-sm">
                Enter your credentials to continue
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-600 ml-1">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  placeholder="name@university.edu"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#0B56A4] focus:border-transparent transition"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-600 ml-1">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#0B56A4] focus:border-transparent transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#0B56A4] transition"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="text-right">
                <button
                  type="button"
                  className="text-xs font-medium text-[#0B56A4] hover:underline"
                >
                  Forgot password?
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl text-white text-sm font-semibold transition bg-[#0B56A4] hover:bg-[#084b8c] disabled:bg-[#0b55a4b4] disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading && <Loader2 size={18} className="animate-spin" />}
                {loading ? "Verifying..." : "Login"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LoginPage;
