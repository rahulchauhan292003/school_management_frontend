import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCurrentUser } from './store/slices/authSlice';
import Login from './features/auth/Login';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';

import SuperAdminDashboard from './features/superadmin/SuperAdminDashboard';
import SchoolManagement from './features/superadmin/SchoolManagement';
import CreateSchoolModal from './features/superadmin/CreateSchoolModal';
import MasterAuditLogs from './features/superadmin/MasterAuditLogs';
import SchoolSwitchModal from './features/superadmin/SchoolSwitchModal';

import SchoolDashboard from './features/school/SchoolDashboard';
import StudentManagement from './features/school/StudentManagement';
import TeacherManagement from './features/school/TeacherManagement';
import ParentManagement from './features/school/ParentManagement';
import AttendanceManager from './features/school/AttendanceManager';
import FeeManagement from './features/school/FeeManagement';
import ExamManagement from './features/school/ExamManagement';
import TimetableHomeworkManager from './features/school/TimetableHomeworkManager';
import TransportManagement from './features/school/TransportManagement';
import AcademicSetup from './features/school/AcademicSetup';
import SchoolAuditLogs from './features/school/SchoolAuditLogs';

import { useAuth } from './context/AuthContext';
import { RefreshCw } from 'lucide-react';

const App = () => {
  const dispatch = useDispatch();
  const reduxAuth = useSelector((state) => state.auth);
  const contextAuth = useAuth();

  const user = contextAuth.user || reduxAuth.user;
  const loading = reduxAuth.loading && contextAuth.loading;
  const targetSchoolCode = contextAuth.targetSchoolCode || reduxAuth.targetSchoolCode;

  const [activeTab, setActiveTab] = useState('saas-overview');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isSwitcherOpen, setIsSwitcherOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    dispatch(fetchCurrentUser());
  }, [dispatch]);

  // Adjust active tab based on user type and active tenant context
  useEffect(() => {
    if (user) {
      if (user.userType === 'SUPER_ADMIN') {
        if (targetSchoolCode) {
          setActiveTab('erp-dashboard');
        } else {
          setActiveTab('saas-overview');
        }
      } else {
        setActiveTab('erp-dashboard');
      }
    }
  }, [user, targetSchoolCode]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center text-indigo-500 space-y-3 transition-colors">
        <RefreshCw className="w-10 h-10 animate-spin" />
        <span className="text-xs font-semibold tracking-wide text-slate-500 dark:text-slate-400">
          Resolving Multi-Tenant Session...
        </span>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  const renderContent = () => {
    const isSchoolUser = user?.userType === 'SCHOOL_USER';
    const isViewingSchoolContext = isSchoolUser || (user?.userType === 'SUPER_ADMIN' && Boolean(targetSchoolCode));

    // If logged in as a School User OR Super Admin viewing a target school context
    if (isViewingSchoolContext) {
      switch (activeTab) {
        case 'erp-students':
          return <StudentManagement />;
        case 'erp-teachers':
          return <TeacherManagement />;
        case 'erp-parents':
          return <ParentManagement />;
        case 'erp-attendance':
          return <AttendanceManager />;
        case 'erp-fees':
          return <FeeManagement />;
        case 'erp-exams':
          return <ExamManagement />;
        case 'erp-timetable':
          return <TimetableHomeworkManager />;
        case 'erp-transport':
          return <TransportManagement />;
        case 'erp-setup':
          return <AcademicSetup />;
        case 'erp-audit':
          return <SchoolAuditLogs />;
        case 'erp-dashboard':
        default:
          return <SchoolDashboard />;
      }
    }

    // Super Admin Master Control Views
    switch (activeTab) {
      case 'saas-schools':
        return (
          <SchoolManagement
            onOpenCreateModal={() => setIsCreateModalOpen(true)}
            onOpenSwitcher={() => setIsSwitcherOpen(true)}
          />
        );
      case 'saas-audit':
        return <MasterAuditLogs />;
      case 'saas-overview':
      default:
        return (
          <SuperAdminDashboard
            onNavigateSchools={() => setActiveTab('saas-schools')}
            onOpenCreateModal={() => setIsCreateModalOpen(true)}
          />
        );
    }
  };

  return (
    <div className="h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 overflow-hidden transition-colors">
      <Navbar
        activeSchoolName={targetSchoolCode ? targetSchoolCode.toUpperCase() : ''}
        onOpenSchoolSwitcher={() => setIsSwitcherOpen(true)}
        isMobileMenuOpen={isMobileMenuOpen}
        onToggleMobileMenu={() => setIsMobileMenuOpen((prev) => !prev)}
      />

      <div className="flex-1 flex overflow-hidden relative">
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          isMobileOpen={isMobileMenuOpen}
          onCloseMobile={() => setIsMobileMenuOpen(false)}
        />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-100/70 dark:bg-slate-950/90 transition-colors custom-scrollbar">
          <div className="max-w-7xl mx-auto">{renderContent()}</div>
        </main>
      </div>

      <CreateSchoolModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={() => setActiveTab('saas-schools')}
      />

      <SchoolSwitchModal
        isOpen={isSwitcherOpen}
        onClose={() => setIsSwitcherOpen(false)}
      />
    </div>
  );
};

export default App;
