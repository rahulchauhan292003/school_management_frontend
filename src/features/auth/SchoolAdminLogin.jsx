import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { loginSchoolUser } from '../../store/slices/authSlice';
import ThemeToggle from '../../components/ui/ThemeToggle';
import Button from '../../components/ui/Button';
import { 
  Building2, 
  AlertCircle, 
  Eye, 
  EyeOff, 
  Lock, 
  Zap,
  BookOpen,
  User,
  GraduationCap,
  Sparkles
} from 'lucide-react';
import toast from 'react-hot-toast';

const SchoolAdminLogin = () => {
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.auth);

  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  const [formData, setFormData] = useState({
    schoolCode: 'school_a',
    email: 'admin@schoola.com',
    password: 'Password@123',
  });

  const handleQuickFill = () => {
    setFormData({
      schoolCode: 'school_a',
      email: 'admin@schoola.com',
      password: 'Password@123',
    });
    toast.success('Loaded School Admin demo credentials');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    dispatch(loginSchoolUser({ 
      schoolCode: formData.schoolCode, 
      email: formData.email, 
      password: formData.password 
    }));
  };

  const handleForgotPassword = () => {
    toast('Please contact your School Administrator to reset your password.', {
      icon: 'ℹ️',
      duration: 4000
    });
  };

  return (
    <div className="h-screen max-h-screen w-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-3 sm:p-5 relative overflow-hidden transition-colors selection:bg-sky-500 selection:text-white">
      
      {/* Background Mesh Light Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[550px] h-[550px] bg-sky-400/15 dark:bg-sky-600/20 rounded-full blur-[140px] pointer-events-none animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[550px] h-[550px] bg-indigo-500/15 dark:bg-indigo-600/20 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-1/3 left-1/4 w-[350px] h-[350px] bg-teal-400/10 dark:bg-teal-600/15 rounded-full blur-[120px] pointer-events-none" />

      {/* Main Container Card - Sleek Glassmorphism 1-Page Layout */}
      <div className="w-full max-w-5xl max-h-[88vh] bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl rounded-[2.5rem] border border-slate-200/80 dark:border-slate-800/80 shadow-2xl shadow-sky-500/10 dark:shadow-slate-950/70 overflow-hidden grid grid-cols-1 lg:grid-cols-12 relative z-10">
        
        {/* LEFT FORM PANEL - Academia School Style */}
        <div className="lg:col-span-6 p-6 sm:p-8 xl:p-10 flex flex-col justify-between bg-white dark:bg-slate-900 overflow-y-auto">
          
          {/* Academia Logo Header with Integrated Theme Toggle */}
          <div className="space-y-3 pt-1">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-slate-900 dark:bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-slate-900/10">
                  <BookOpen className="w-5.5 h-5.5" />
                </div>
                <div>
                  <h1 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-wider uppercase font-serif">
                    ACADEMIA
                  </h1>
                  <p className="text-[9px] sm:text-[10px] font-bold text-slate-500 dark:text-slate-400 tracking-widest uppercase">
                    SCHOOL MANAGEMENT SYSTEM
                  </p>
                </div>
              </div>

              {/* Theme Toggle integrated cleanly in top right header */}
              <div className="shrink-0">
                <ThemeToggle />
              </div>
            </div>

            <div className="space-y-0.5 pt-1">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                Login to your account
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Enter your school tenant code and account credentials.
              </p>
            </div>
          </div>

          {/* Error Message Banner */}
          {error && (
            <div className="my-1.5 p-2.5 bg-rose-50 dark:bg-rose-950/80 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs rounded-xl flex items-center gap-2">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span className="font-medium text-[11px]">{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3 my-2 text-xs">
            
            {/* School Tenant Code */}
            <div className="space-y-1">
              <label className="block text-slate-700 dark:text-slate-300 font-bold text-[11px] flex items-center justify-between">
                <span>School Tenant Code</span>
                <span className="text-[9px] text-sky-600 dark:text-sky-400 font-mono font-normal">e.g. school_a</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-sky-500 dark:text-slate-400">
                  <Building2 className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  value={formData.schoolCode}
                  onChange={(e) => setFormData({ ...formData, schoolCode: e.target.value })}
                  placeholder="School Code"
                  className="w-full pl-10 pr-4 py-2.5 bg-sky-50/80 dark:bg-slate-800/70 border border-sky-100 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-white text-xs font-mono focus:outline-none focus:ring-2 focus:ring-sky-500/40 transition-all placeholder:text-slate-400"
                />
              </div>
            </div>

            {/* Username or Email */}
            <div className="space-y-1">
              <label className="block text-slate-700 dark:text-slate-300 font-bold text-[11px]">
                Username or Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-sky-500 dark:text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="name@domain.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-sky-50/80 dark:bg-slate-800/70 border border-sky-100 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-sky-500/40 transition-all placeholder:text-slate-400"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1">
              <label className="block text-slate-700 dark:text-slate-300 font-bold text-[11px]">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-sky-500 dark:text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-10 py-2.5 bg-sky-50/80 dark:bg-slate-800/70 border border-sky-100 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-sky-500/40 transition-all placeholder:text-slate-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Forget Password & Remember me */}
            <div className="pt-0.5 flex items-center justify-between text-xs">
              <label className="flex items-center gap-1.5 cursor-pointer text-slate-600 dark:text-slate-400 font-medium">
                <input 
                  type="checkbox" 
                  checked={rememberMe} 
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-3.5 h-3.5 rounded border-slate-300 text-slate-900 focus:ring-slate-500" 
                />
                <span>Remember me</span>
              </label>
              
              <button
                type="button"
                onClick={handleForgotPassword}
                className="text-sky-600 dark:text-sky-400 font-semibold hover:underline"
              >
                Forget password?
              </button>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              size="lg"
              isLoading={loading}
              className="w-full py-3 bg-slate-900 hover:bg-slate-800 dark:bg-indigo-600 dark:hover:bg-indigo-500 text-white rounded-xl font-bold text-xs shadow-lg shadow-slate-900/10 transition-all"
            >
              Login to School Portal
            </Button>
          </form>

          {/* Quick Preset Fill */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1 font-medium">
              <Zap className="w-3.5 h-3.5 text-amber-500" /> Demo Quick Fill:
            </span>
            <button
              type="button"
              onClick={handleQuickFill}
              className="px-3 py-1 bg-sky-50 dark:bg-slate-800/80 border border-sky-200/80 dark:border-slate-700 text-sky-700 dark:text-sky-300 rounded-lg text-[10px] font-mono font-bold hover:bg-sky-100 transition-colors"
            >
              Auto Fill School Credentials
            </button>
          </div>

        </div>

        {/* RIGHT PANEL - Academia Student Illustration Artwork */}
        <div className="hidden lg:block lg:col-span-6 relative bg-gradient-to-tr from-cyan-50 via-sky-50 to-indigo-50 dark:from-slate-950 dark:to-slate-900 overflow-hidden">
          <div className="absolute top-10 right-10 w-4 h-4 text-amber-400 animate-bounce">✦</div>
          <div className="absolute top-20 left-12 w-3 h-3 text-pink-400 animate-pulse">✦</div>
          <div className="absolute bottom-16 right-16 w-5 h-5 text-teal-400">✦</div>

          <div className="w-full h-full p-6 flex items-center justify-center relative z-10">
            <img 
              src="/school_admin_hero.jpg" 
              alt="Students studying on books illustration" 
              className="w-full max-w-lg max-h-[380px] object-contain rounded-3xl shadow-xl transform transition-transform duration-500 hover:scale-[1.02]"
            />
          </div>

          <div className="absolute -bottom-20 -right-20 w-96 h-96 bg-cyan-200/30 dark:bg-cyan-900/20 rounded-full blur-3xl pointer-events-none" />
        </div>

      </div>

    </div>
  );
};

export default SchoolAdminLogin;
