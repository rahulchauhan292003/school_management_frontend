import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { loginSuperAdmin } from '../../store/slices/authSlice';
import ThemeToggle from '../../components/ui/ThemeToggle';
import Button from '../../components/ui/Button';
import { 
  Shield, 
  Mail, 
  AlertCircle, 
  ArrowRight, 
  Eye, 
  EyeOff, 
  Lock, 
  Sparkles, 
  CheckCircle2, 
  Zap,
  School,
  Activity,
  Database,
  Cpu
} from 'lucide-react';
import toast from 'react-hot-toast';

const SuperAdminLogin = ({ onSwitchToSchoolAdmin }) => {
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.auth);

  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: 'admin@saas.com',
    password: 'SuperAdmin@123',
  });

  const handleQuickFill = () => {
    setFormData({
      email: 'admin@saas.com',
      password: 'SuperAdmin@123',
    });
    toast.success('Loaded Super Admin credentials');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    dispatch(loginSuperAdmin({ 
      email: formData.email, 
      password: formData.password 
    }));
  };

  return (
    <div className="h-screen max-h-screen w-screen bg-slate-100 dark:bg-slate-950 flex items-center justify-center p-3 sm:p-5 relative overflow-hidden transition-colors selection:bg-indigo-500 selection:text-white">
      
      {/* Background Mesh Light Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[550px] h-[550px] bg-indigo-500/15 dark:bg-indigo-600/25 rounded-full blur-[140px] pointer-events-none animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[550px] h-[550px] bg-purple-500/15 dark:bg-purple-600/25 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 w-[350px] h-[350px] bg-cyan-500/10 dark:bg-cyan-600/15 rounded-full blur-[120px] pointer-events-none" />

      {/* Main Container Card - Sleek Glassmorphism 1-Page Layout */}
      <div className="w-full max-w-5xl max-h-[88vh] bg-white/90 dark:bg-slate-900/90 backdrop-blur-2xl rounded-[2.5rem] border border-slate-200/80 dark:border-slate-800/80 shadow-2xl shadow-indigo-500/10 dark:shadow-slate-950/70 overflow-hidden grid grid-cols-1 lg:grid-cols-12 relative z-10">
        
        {/* LEFT PANEL - Master SaaS Control Showcase */}
        <div className="hidden lg:flex lg:col-span-6 bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950 p-6 xl:p-8 flex-col justify-between relative border-r border-slate-800 text-white overflow-hidden">
          
          {/* Top Switcher & Brand Badge */}
          <div className="space-y-3 z-10 pt-1">
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  if (onSwitchToSchoolAdmin) {
                    onSwitchToSchoolAdmin();
                  } else {
                    window.location.hash = '#school';
                  }
                }}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 hover:text-white hover:bg-indigo-500/25 text-xs font-semibold transition-all group"
              >
                <School className="w-3.5 h-3.5 text-indigo-400 group-hover:scale-110 transition-transform" />
                <span>Switch to School Portal</span>
              </button>

              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-indigo-500/10 border border-indigo-500/20 text-[10px] font-mono text-indigo-300">
                ACADEMIA Root
              </span>
            </div>
            
            <h1 className="text-2xl xl:text-3xl font-extrabold tracking-tight leading-tight pt-1">
              ACADEMIA <span className="bg-gradient-to-r from-indigo-400 via-purple-300 to-pink-400 bg-clip-text text-transparent">SaaS Master Console</span>
            </h1>
            <p className="text-xs text-slate-400 font-normal leading-relaxed max-w-sm">
              Real-time multi-tenant database orchestration, server metrics, & subscription control.
            </p>
          </div>

          {/* Graphic Showcase & Floating Live Stats */}
          <div className="my-2 relative flex items-center justify-center p-2">
            <div className="absolute w-56 h-56 bg-indigo-500/20 rounded-full blur-2xl pointer-events-none" />

            {/* Illustration Frame */}
            <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-slate-800/90 max-h-[200px] xl:max-h-[220px]">
              <img 
                src="/login_hero.jpg" 
                alt="Super Admin Dashboard Illustration" 
                className="w-full h-full object-cover rounded-2xl"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent" />
            </div>

            {/* Floating Live Badge 1: DB Isolation */}
            <div className="absolute top-1 right-2 bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-800 shadow-xl flex items-center gap-2">
              <Database className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
              <div>
                <p className="text-[10px] font-bold text-white leading-none">Isolated DBs</p>
                <p className="text-[8px] text-slate-400 mt-0.5">PostgreSQL / Mongo</p>
              </div>
            </div>

            {/* Floating Live Badge 2: Latency */}
            <div className="absolute bottom-1 left-2 bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-800 shadow-xl flex items-center gap-2">
              <Activity className="w-3.5 h-3.5 text-emerald-400" />
              <div>
                <p className="text-[10px] font-bold text-white leading-none">1.2ms Latency</p>
                <p className="text-[8px] text-slate-400 mt-0.5">Global CDN Edge</p>
              </div>
            </div>
          </div>

          {/* Footer Metrics Bar */}
          <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
            <div className="flex items-center gap-1.5 font-medium">
              <Cpu className="w-3.5 h-3.5 text-indigo-400" />
              <span>Multi-Tenant Cluster Node</span>
            </div>
            <span className="font-mono text-[10px] text-slate-500">v2.5 SaaS</span>
          </div>

        </div>

        {/* RIGHT PANEL - Super Admin Form */}
        <div className="lg:col-span-6 p-6 sm:p-8 xl:p-10 flex flex-col justify-between bg-white dark:bg-slate-900 overflow-y-auto">
          
          {/* Header Title with Integrated Theme Toggle */}
          <div className="flex items-start justify-between gap-4 pt-1">
            <div className="space-y-1">
              <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-600/30">
                <Shield className="w-5 h-5" />
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight pt-1">
                Super Admin Login
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Sign in with root SaaS master credentials.
              </p>
            </div>

            <div className="shrink-0 pt-1">
              <ThemeToggle />
            </div>
          </div>

          {/* Error Message Banner */}
          {error && (
            <div className="my-2 p-3 bg-rose-50 dark:bg-rose-950/80 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span className="font-medium text-[11px]">{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3.5 my-2 text-xs">
            {/* Email Field */}
            <div className="space-y-1">
              <label className="block text-slate-700 dark:text-slate-300 font-bold text-[11px]">
                Master Admin Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-indigo-600 dark:text-indigo-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="admin@saas.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1">
              <label className="block text-slate-700 dark:text-slate-300 font-bold text-[11px]">
                Master Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-indigo-600 dark:text-indigo-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              size="lg"
              isLoading={loading}
              icon={ArrowRight}
              className="w-full py-3 text-xs sm:text-sm font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl shadow-lg shadow-indigo-500/25 transition-all duration-200"
            >
              Sign In to Master Console
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
              className="px-3 py-1 bg-indigo-50 dark:bg-indigo-950/80 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 rounded-lg text-[10px] font-mono font-bold hover:bg-indigo-100 dark:hover:bg-indigo-900 transition-colors"
            >
              Auto Fill Master Admin
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};

export default SuperAdminLogin;
