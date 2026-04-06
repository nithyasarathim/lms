import React, { useState } from 'react';
import SriEshwarLogo from '../../../assets/EshwarImg.png';
import { Eye, EyeOff, Loader2, Mail, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import LoginBackground from '../../../assets/Background.svg';
import { login } from '../api/auth.api';

const LoginPage = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await login(formData);

      if (!res?.success) {
        return toast.error(res?.message || 'Invalid credentials');
      }

      const { token, role, _id, email, departmentId, facultyId } = res.data;

      localStorage.setItem(
        'lms-user',
        JSON.stringify({ token, role, _id, email, departmentId, facultyId })
      );

      toast.success('Welcome back!');
      navigate(`/${role.toLowerCase()}/dashboard`, { replace: true });
    } catch (error) {
      const errorMsg =
        error.message || 'Something went wrong. Please try again.';
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="fixed inset-0 w-screen h-screen flex overflow-hidden font-['Poppins']">
      <div className="relative hidden lg:flex lg:w-3/5 flex-col items-center justify-center overflow-hidden border-r border-white/10">
        <div className="absolute inset-0 z-0">
          <img
            src={LoginBackground}
            alt="Background"
            draggable="false"
            className="w-full h-full object-cover opacity-90 select-none pointer-events-none"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#08384F]/40 via-transparent to-[#08384F]"></div>
        </div>
      </div>

      <div className="w-full lg:w-2/5 flex items-center justify-center p-6 md:p-12 bg-white">
        <div className="w-full max-w-lg">
          <div className="flex flex-col items-center text-center">
            <img
              src={SriEshwarLogo}
              alt="Sri Eshwar Logo"
              className="h-20 w-auto object-contain mb-6"
            />
            <span className="inline-block px-3 py-1 text-[#08384F] text-[10px] font-bold uppercase tracking-widest rounded-md border border-slate-200 mb-6">
              Official Portal
            </span>
            <h2 className="text-2xl font-black text-[#08384F] tracking-tight mb-2">
              Login to your account
            </h2>
            <p className="text-slate-400 text-xs font-medium leading-relaxed mb-10 max-w-sm">
              Access is restricted only to Sri Eshwar Institutional accounts.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-[#08384F]/60 uppercase tracking-widest ml-1">
                Institutional Email
              </label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#0B56A4] transition-colors">
                  <Mail size={18} />
                </div>
                <input
                  type="email"
                  name="email"
                  placeholder="username@sece.ac.in"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full border border-slate-200 rounded-lg pl-11 pr-4 py-3 text-sm outline-none focus:border-[#0B56A4] transition-all"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center px-1">
                <label className="text-[11px] font-bold text-[#08384F]/60 uppercase tracking-widest">
                  Secure Password
                </label>
                <button
                  type="button"
                  className="text-[11px] font-bold text-[#0B56A4] hover:text-[#08384F]"
                >
                  Help?
                </button>
              </div>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#0B56A4] transition-colors">
                  <Lock size={18} />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="w-full border border-slate-200 rounded-lg pl-11 pr-12 py-3 text-sm outline-none focus:border-[#0B56A4] focus:bg-white transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#08384F]"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 mt-4 bg-gradient-to-r from-[#08384F] via-[#08384F] to-[#0B56A4] bg-[length:200%_200%] bg-left hover:bg-right text-white rounded-lg text-sm font-bold transition-all duration-300 ease-out hover:shadow-md flex items-center justify-center gap-3 active:scale-[0.98] disabled:bg-slate-300"
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  <span>Authenticating...</span>
                </>
              ) : (
                'Sign In to Dashboard'
              )}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
};

export default LoginPage;
