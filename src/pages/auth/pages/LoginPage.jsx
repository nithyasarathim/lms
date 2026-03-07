import React, { useState } from "react";
import { Eye, EyeOff, Loader2, ShieldCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { login } from "../api/auth.api";

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
        error.message || "Something went wrong. Please try again.";
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="w-full min-h-screen bg-gray-50 flex items-center justify-center p-6 font-['Poppins']">
      <div className="w-full max-w-[400px]">
        <div className="flex flex-col items-center mb-10 text-center">
          <div className="w-14 h-14 bg-[#08384F] rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-blue-900/10">
            <ShieldCheck className="text-white" size={28} />
          </div>
          <h2 className="text-3xl font-bold text-[#08384F] mb-1">
            Sign in to <span className="text-[#0B56A4]">LMS</span>
          </h2>
          <p className="text-gray-400 text-sm">
            Enter your credentials to continue
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wide ml-1">
              Email Address
            </label>
            <input
              type="email"
              name="email"
              placeholder="name@university.edu"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm focus:border-[#08384F] focus:ring-1 focus:ring-[#08384F] outline-none transition-all"
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between items-center px-1">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                Password
              </label>
              <button
                type="button"
                className="text-[11px] font-semibold text-[#0B56A4] hover:underline"
              >
                Forgot Password?
              </button>
            </div>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                required
                className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm focus:border-[#08384F] focus:ring-1 focus:ring-[#08384F] outline-none transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-[#08384F] text-white rounded-xl text-sm font-bold hover:bg-[#0B56A4] transition-all active:scale-[0.99] flex items-center justify-center gap-2 mt-2 disabled:bg-[#08384f80] disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                <span>Verifying...</span>
              </>
            ) : (
              "Login"
            )}
          </button>
        </form>

        <div className="mt-10 text-center">
          <p className="text-xs text-gray-400">Secure encryption active.</p>
        </div>
      </div>
    </section>
  );
};

export default LoginPage;
