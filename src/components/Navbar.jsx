import React from 'react';
import { useAuth } from '../context/AuthContext';
import ThemeToggle from './ui/ThemeToggle';
import { Shield, Building2, LogOut, RefreshCw, Menu, X } from 'lucide-react';

const Navbar = ({
  activeSchoolName,
  onOpenSchoolSwitcher,
  isMobileMenuOpen,
  onToggleMobileMenu,
}) => {
  const { user, targetSchoolCode, setTargetSchool, logout } = useAuth();

  return (
    <header className="sticky top-0 z-40 bg-white dark:bg-slate-900/90 border-b border-slate-200 dark:border-slate-800 px-4 sm:px-6 py-3 flex items-center justify-between transition-colors shadow-sm">
      <div className="flex items-center space-x-3">
        {/* Mobile Hamburger Toggle Button */}
        <button
          onClick={onToggleMobileMenu}
          type="button"
          className="md:hidden p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-700 transition"
          aria-label="Toggle mobile navigation menu"
        >
          {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>

        <div className="flex items-center space-x-2.5">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 shrink-0">
            <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
          </div>
          <div>
            <h1 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white tracking-wide truncate max-w-[160px] sm:max-w-none">
              {user?.userType === 'SUPER_ADMIN' ? 'ACADEMIA Master Console' : 'ACADEMIA School Portal'}
            </h1>
            <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 font-medium truncate max-w-[160px] sm:max-w-none">
              {user?.userType === 'SUPER_ADMIN' ? 'Platform Management' : (activeSchoolName || user?.schoolCode?.toUpperCase())}
            </p>
          </div>
        </div>

        {/* Super Admin Context Switching Indicator Banner */}
        {user?.userType === 'SUPER_ADMIN' && targetSchoolCode && (
          <div className="hidden lg:flex items-center space-x-2 bg-indigo-50 dark:bg-indigo-950/80 border border-indigo-200 dark:border-indigo-500/30 rounded-xl px-3 py-1 text-xs text-indigo-700 dark:text-indigo-200">
            <Building2 className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 animate-pulse" />
            <span>Active Tenant DB: <strong className="text-indigo-800 dark:text-indigo-300 font-bold">{targetSchoolCode.toUpperCase()}</strong></span>
            <button
              onClick={onOpenSchoolSwitcher}
              className="ml-1 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 p-1 rounded-lg transition text-indigo-700 dark:text-indigo-300 flex items-center gap-1 font-semibold"
              title="Switch Tenant Context"
            >
              <RefreshCw className="w-3 h-3" /> Switch
            </button>
            <button
              onClick={() => setTargetSchool('')}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs ml-1 font-bold"
              title="Clear Context"
            >
              ✕
            </button>
          </div>
        )}
      </div>

      <div className="flex items-center space-x-2 sm:space-x-3">
        {user?.userType === 'SUPER_ADMIN' && !targetSchoolCode && (
          <button
            onClick={onOpenSchoolSwitcher}
            className="hidden sm:flex items-center space-x-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 transition shadow-sm"
          >
            <Building2 className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            <span>Select DB</span>
          </button>
        )}

        <ThemeToggle />

        <div className="flex items-center space-x-2 bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 px-2.5 py-1 rounded-xl">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center text-xs shadow-sm shrink-0">
            {user?.name?.[0] || 'U'}
          </div>
          <div className="hidden md:block text-left">
            <div className="text-xs font-bold text-slate-900 dark:text-white truncate max-w-[120px]">{user?.name}</div>
            <div className="text-[10px] text-indigo-600 dark:text-indigo-400 font-semibold uppercase tracking-wider">{user?.roleName || user?.userType}</div>
          </div>
        </div>

        <button
          onClick={logout}
          className="p-2 rounded-xl bg-slate-100 hover:bg-rose-50 dark:bg-slate-800 dark:hover:bg-rose-950/60 border border-slate-200 dark:border-slate-700 hover:border-rose-200 dark:hover:border-rose-800/40 text-slate-600 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition"
          title="Sign Out"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};

export default Navbar;
