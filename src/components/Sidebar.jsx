import React from 'react';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Building,
  GraduationCap,
  Users,
  UserCheck,
  CalendarCheck,
  CreditCard,
  FileSpreadsheet,
  Bus,
  Layers,
  FileText,
  ShieldCheck,
  Clock,
  X,
} from 'lucide-react';

const Sidebar = ({ activeTab, setActiveTab, isMobileOpen, onCloseMobile }) => {
  const { user, targetSchoolCode } = useAuth();
  const isSuperAdmin = user?.userType === 'SUPER_ADMIN';
  const viewingSchoolContext = isSuperAdmin && targetSchoolCode;

  const superAdminNav = [
    { id: 'saas-overview', label: 'SaaS Overview', icon: LayoutDashboard },
    { id: 'saas-schools', label: 'Schools Registry', icon: Building },
    { id: 'saas-audit', label: 'SaaS Audit Trail', icon: ShieldCheck },
  ];

  const schoolErpNav = [
    { id: 'erp-dashboard', label: 'School Dashboard', icon: LayoutDashboard },
    { id: 'erp-students', label: 'Students & Promotions', icon: GraduationCap },
    { id: 'erp-teachers', label: 'Teachers & Staff', icon: Users },
    { id: 'erp-parents', label: 'Parents Directory', icon: UserCheck },
    { id: 'erp-attendance', label: 'Attendance Management', icon: CalendarCheck },
    { id: 'erp-fees', label: 'Fee Collection & Payroll', icon: CreditCard },
    { id: 'erp-exams', label: 'Exams & Marksheets', icon: FileSpreadsheet },
    { id: 'erp-timetable', label: 'Timetable & Homework', icon: Clock },
    { id: 'erp-transport', label: 'Transport System', icon: Bus },
    { id: 'erp-setup', label: 'Academic Setup & Classes', icon: Layers },
    { id: 'erp-audit', label: 'School Audit Logs', icon: FileText },
  ];

  const navItems = isSuperAdmin && !viewingSchoolContext ? superAdminNav : schoolErpNav;

  const handleSelectTab = (tabId) => {
    setActiveTab(tabId);
    if (onCloseMobile) onCloseMobile();
  };

  return (
    <>
      {/* Mobile Drawer Backdrop Overlay */}
      {isMobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-40 md:hidden transition-opacity"
        />
      )}

      {/* Sidebar Navigation (Desktop Fixed + Mobile Off-Canvas Drawer) */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-50 w-64 h-full bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 p-4 flex flex-col justify-between shrink-0 transition-transform duration-300 ease-in-out shadow-xl md:shadow-none ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
          <div className="flex items-center justify-between px-3 py-1.5 mb-1 shrink-0">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              {isSuperAdmin && !viewingSchoolContext ? 'ACADEMIA SaaS Administration' : 'ACADEMIA Operations'}
            </span>
            <button
              onClick={onCloseMobile}
              className="md:hidden p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {viewingSchoolContext && (
            <div className="mb-3 px-3 py-2 bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-500/30 rounded-xl text-xs shrink-0">
              <span className="text-slate-500 dark:text-slate-400 block text-[10px] font-medium uppercase tracking-wide">
                Active Context
              </span>
              <span className="font-bold text-indigo-700 dark:text-indigo-300 truncate block mt-0.5">
                {targetSchoolCode.toUpperCase()}
              </span>
            </div>
          )}

          <nav className="flex-1 overflow-y-auto custom-scrollbar space-y-1 pr-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleSelectTab(item.id)}
                  className={`w-full flex items-center space-x-3 px-3.5 py-2.5 md:py-2 rounded-xl text-xs font-semibold transition-all duration-200 ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 translate-x-0.5'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 shrink-0 ${
                      isActive ? 'text-white' : 'text-slate-500 dark:text-slate-400'
                    }`}
                  />
                  <span className="truncate">{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="pt-2.5 pb-1 border-t border-slate-200 dark:border-slate-800 text-center text-[10px] text-slate-400 dark:text-slate-500 shrink-0">
          Designed & Developed by{' '}
          <span className="font-semibold text-slate-700 dark:text-slate-300">Rahul Chauhan</span>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
