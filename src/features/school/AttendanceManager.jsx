import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Card } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import {
  CalendarCheck,
  Save,
  CheckCircle2,
  RefreshCw,
  Download,
  Filter,
  ShieldAlert,
  UserCheck,
  BarChart3,
  UserSearch,
  AlertTriangle,
  Clock,
  XCircle,
  CheckCircle,
  FileSpreadsheet,
  Calendar,
  ShieldCheck,
} from 'lucide-react';
import toast from 'react-hot-toast';

const AttendanceManager = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('daily'); // 'daily' | 'explorer' | 'student'

  // Common metadata
  const [classes, setClasses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Class Coordinator Management Modal State
  const [isCoordinatorModalOpen, setIsCoordinatorModalOpen] = useState(false);
  const [updatingSectionId, setUpdatingSectionId] = useState(null);

  // Tab 1: Daily Class Attendance state
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [students, setStudents] = useState([]);
  const [attendanceMap, setAttendanceMap] = useState({});
  const [remarksMap, setRemarksMap] = useState({});
  const [dailyStatusFilter, setDailyStatusFilter] = useState('ALL');
  const [sectionMetadata, setSectionMetadata] = useState(null);
  const [savingDaily, setSavingDaily] = useState(false);

  // Tab 2: Attendance Explorer state
  const [expClass, setExpClass] = useState('ALL');
  const [expSection, setExpSection] = useState('ALL');
  const [expStartDate, setExpStartDate] = useState(
    new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [expEndDate, setExpEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [expStatus, setExpStatus] = useState('ALL');
  const [expSearch, setExpSearch] = useState('');
  const [explorerData, setExplorerData] = useState({ summary: null, records: [] });
  const [loadingExplorer, setLoadingExplorer] = useState(false);

  // Tab 3: Student Attendance Ledger state with Date Filtering
  const [ledgerClass, setLedgerClass] = useState('');
  const [ledgerSection, setLedgerSection] = useState('');
  const [ledgerStudentId, setLedgerStudentId] = useState('');
  const [ledgerStartDate, setLedgerStartDate] = useState('');
  const [ledgerEndDate, setLedgerEndDate] = useState('');
  const [sectionStudents, setSectionStudents] = useState([]);
  const [ledgerData, setLedgerData] = useState(null);
  const [loadingLedger, setLoadingLedger] = useState(false);

  // Fetch initial classes and teachers metadata
  const fetchData = async () => {
    setLoading(true);
    try {
      const [cRes, tRes] = await Promise.all([
        api.get('/school/classes'),
        api.get('/school/teachers').catch(() => ({ data: [] })),
      ]);
      const classData = cRes.data || [];
      setClasses(classData);
      setTeachers(tRes.data || []);

      if (classData.length > 0) {
        const firstClass = classData[0];
        if (!selectedClass) setSelectedClass(firstClass.id);
        if (!expClass) setExpClass('ALL');
        if (!ledgerClass) setLedgerClass(firstClass.id);

        if (firstClass.sections && firstClass.sections.length > 0) {
          if (!selectedSection) setSelectedSection(firstClass.sections[0].id);
          if (!ledgerSection) setLedgerSection(firstClass.sections[0].id);
        }
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load school academic metadata');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Update section dropdown when selectedClass changes in Tab 1
  const currentClassObj = classes.find((c) => c.id === parseInt(selectedClass));
  const currentSections = currentClassObj?.sections || [];

  useEffect(() => {
    if (currentSections.length > 0) {
      const exists = currentSections.some((s) => s.id === parseInt(selectedSection));
      if (!exists) {
        setSelectedSection(currentSections[0].id);
      }
    } else {
      setSelectedSection('');
    }
  }, [selectedClass]);

  // Tab 3 section synchronization
  const ledgerClassObj = classes.find((c) => c.id === parseInt(ledgerClass));
  const ledgerSections = ledgerClassObj?.sections || [];

  useEffect(() => {
    if (ledgerSections.length > 0) {
      const exists = ledgerSections.some((s) => s.id === parseInt(ledgerSection));
      if (!exists) {
        setLedgerSection(ledgerSections[0].id);
      }
    } else {
      setLedgerSection('');
    }
  }, [ledgerClass]);

  // Fetch Daily Attendance Matrix (Tab 1)
  const fetchDailyAttendance = async () => {
    if (!selectedClass || !selectedSection) return;
    setLoading(true);
    try {
      const [stRes, attRes] = await Promise.all([
        api.get(`/school/students?classId=${selectedClass}&sectionId=${selectedSection}`),
        api.get(
          `/school/attendance?classId=${selectedClass}&sectionId=${selectedSection}&date=${selectedDate}`
        ),
      ]);

      const studentList = stRes.data || [];
      setStudents(studentList);

      const attPayload = attRes.data || {};
      setSectionMetadata(attPayload.sectionInfo || null);

      // Map statuses & remarks
      const newAttMap = {};
      const newRemMap = {};

      studentList.forEach((st) => {
        const found = (attPayload.records || []).find((a) => a.student_id === st.id);
        newAttMap[st.id] = found ? found.status : 'PRESENT';
        newRemMap[st.id] = found ? found.remarks || '' : '';
      });

      setAttendanceMap(newAttMap);
      setRemarksMap(newRemMap);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load attendance records');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'daily' && selectedClass && selectedSection) {
      fetchDailyAttendance();
    }
  }, [selectedClass, selectedSection, selectedDate, activeTab]);

  // Fetch Attendance Explorer (Tab 2)
  const fetchExplorerReport = async () => {
    setLoadingExplorer(true);
    try {
      let query = `/school/attendance/report?startDate=${expStartDate}&endDate=${expEndDate}`;
      if (expClass !== 'ALL') query += `&classId=${expClass}`;
      if (expSection !== 'ALL') query += `&sectionId=${expSection}`;
      if (expStatus !== 'ALL') query += `&status=${expStatus}`;
      if (expSearch.trim()) query += `&search=${encodeURIComponent(expSearch.trim())}`;

      const res = await api.get(query);
      setExplorerData(res.data || { summary: null, records: [] });
    } catch (err) {
      console.error(err);
      toast.error('Failed to load attendance report');
    } finally {
      setLoadingExplorer(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'explorer') {
      fetchExplorerReport();
    }
  }, [activeTab, expClass, expSection, expStartDate, expEndDate, expStatus]);

  // Fetch Section Students for Tab 3
  useEffect(() => {
    const fetchStudentsForLedger = async () => {
      if (!ledgerClass || !ledgerSection) return;
      try {
        const res = await api.get(`/school/students?classId=${ledgerClass}&sectionId=${ledgerSection}`);
        const list = res.data || [];
        setSectionStudents(list);
        if (list.length > 0) {
          setLedgerStudentId(list[0].id);
        } else {
          setLedgerStudentId('');
          setLedgerData(null);
        }
      } catch (err) {
        console.error(err);
      }
    };
    if (activeTab === 'student') {
      fetchStudentsForLedger();
    }
  }, [ledgerClass, ledgerSection, activeTab]);

  // Fetch Student Ledger Details with Date Filter (Tab 3)
  const fetchStudentLedger = async () => {
    if (!ledgerStudentId) return;
    setLoadingLedger(true);
    try {
      let query = `/school/attendance/student/${ledgerStudentId}?`;
      if (ledgerStartDate) query += `&startDate=${ledgerStartDate}`;
      if (ledgerEndDate) query += `&endDate=${ledgerEndDate}`;

      const res = await api.get(query);
      setLedgerData(res.data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load student attendance ledger');
    } finally {
      setLoadingLedger(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'student' && ledgerStudentId) {
      fetchStudentLedger();
    }
  }, [ledgerStudentId, ledgerStartDate, ledgerEndDate, activeTab]);

  // Save Daily Attendance Handler
  const handleSaveAttendance = async () => {
    if (students.length === 0) {
      toast.error('No students in section to save attendance');
      return;
    }

    setSavingDaily(true);
    try {
      const records = students.map((st) => ({
        studentId: st.id,
        status: attendanceMap[st.id] || 'PRESENT',
        remarks: remarksMap[st.id] || null,
      }));

      await api.post('/school/attendance', {
        classId: parseInt(selectedClass),
        sectionId: parseInt(selectedSection),
        date: selectedDate,
        records,
      });

      toast.success('Attendance records saved & notifications dispatched!');
      fetchDailyAttendance();
    } catch (err) {
      console.error(err);
      toast.error(err.message || 'Failed to save attendance records');
    } finally {
      setSavingDaily(false);
    }
  };

  // Assign Class Coordinator handler for Modal
  const handleAssignCoordinator = async (sectionId, teacherIdVal) => {
    setUpdatingSectionId(sectionId);
    try {
      const teacherId = teacherIdVal ? parseInt(teacherIdVal) : null;
      await api.put(`/school/sections/${sectionId}/class-teacher`, { teacherId });
      toast.success('Class Coordinator updated successfully!');
      await fetchData();
      if (activeTab === 'daily') fetchDailyAttendance();
    } catch (err) {
      console.error(err);
      toast.error(err.message || 'Failed to assign class coordinator');
    } finally {
      setUpdatingSectionId(null);
    }
  };

  // Batch action handlers
  const handleBatchStatus = (status) => {
    const updated = { ...attendanceMap };
    students.forEach((st) => {
      updated[st.id] = status;
    });
    setAttendanceMap(updated);
  };

  // Date Presets for Ledger
  const setLedgerDatePreset = (preset) => {
    const today = new Date().toISOString().split('T')[0];
    if (preset === 'THIS_MONTH') {
      const now = new Date();
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
      setLedgerStartDate(firstDay);
      setLedgerEndDate(today);
    } else if (preset === 'LAST_30_DAYS') {
      const past = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      setLedgerStartDate(past);
      setLedgerEndDate(today);
    } else if (preset === 'CLEAR') {
      setLedgerStartDate('');
      setLedgerEndDate('');
    }
  };

  // CSV Export for Explorer
  const exportExplorerCSV = () => {
    if (!explorerData.records || explorerData.records.length === 0) {
      toast.error('No records available to export');
      return;
    }

    let csv = 'Date,Class,Section,Roll No,Admission No,Student Name,Status,Remarks,Marked By\n';
    explorerData.records.forEach((r) => {
      const dateStr = r.date ? r.date.split('T')[0] : '';
      csv += `"${dateStr}","${r.class_name}","${r.section_name}","${r.roll_no || ''}","${r.admission_number}","${r.student_name}","${r.status}","${r.remarks || ''}","${r.marked_by_user || ''}"\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `attendance_report_${expStartDate}_to_${expEndDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success('Attendance CSV exported successfully!');
  };

  // Filtered daily students
  const filteredDailyStudents = students.filter((st) => {
    const stStatus = attendanceMap[st.id] || 'PRESENT';
    if (dailyStatusFilter === 'ALL') return true;
    return stStatus === dailyStatusFilter;
  });

  // Calculate daily live stats
  const dailyCounts = { PRESENT: 0, ABSENT: 0, LATE: 0, EXCUSED: 0 };
  students.forEach((st) => {
    const stStatus = attendanceMap[st.id] || 'PRESENT';
    if (dailyCounts[stStatus] !== undefined) dailyCounts[stStatus]++;
  });

  const isAdminOrPrincipal =
    user?.userType === 'SUPER_ADMIN' ||
    ['School Admin', 'Principal', 'Vice Principal', 'Administrator'].includes(user?.roleName);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-wide flex items-center gap-2.5">
            <CalendarCheck className="w-7 h-7 text-indigo-600 dark:text-indigo-400" /> Reliable Attendance Management
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Real-world role-based student attendance matrix, Class Teacher permissions, and multi-filtered reporting
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {isAdminOrPrincipal && (
            <Button
              variant="outline"
              size="sm"
              icon={UserCheck}
              onClick={() => setIsCoordinatorModalOpen(true)}
              className="border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400"
            >
              Manage Class Coordinators
            </Button>
          )}

          {/* Tab Switcher Navigation */}
          <div className="flex bg-slate-100 dark:bg-slate-900/80 p-1 rounded-2xl border border-slate-200 dark:border-slate-800">
            <button
              onClick={() => setActiveTab('daily')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                activeTab === 'daily'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <CalendarCheck className="w-3.5 h-3.5" /> Daily Class Sheet
            </button>
            <button
              onClick={() => setActiveTab('explorer')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                activeTab === 'explorer'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" /> Attendance Explorer & Filters
            </button>
            <button
              onClick={() => setActiveTab('student')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                activeTab === 'student'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <UserSearch className="w-3.5 h-3.5" /> Student Ledger
            </button>
          </div>
        </div>
      </div>

      {/* ================= TAB 1: DAILY CLASS ATTENDANCE SHEET ================= */}
      {activeTab === 'daily' && (
        <div className="space-y-6">
          {/* Controls Bar */}
          <Card className="p-4 flex flex-wrap items-center justify-between gap-4 text-xs">
            <div className="flex flex-wrap items-center gap-4">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Select Class</label>
                <select
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                  className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-slate-900 dark:text-white font-medium"
                >
                  {classes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Select Section</label>
                <select
                  value={selectedSection}
                  onChange={(e) => setSelectedSection(e.target.value)}
                  className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-slate-900 dark:text-white font-medium"
                >
                  {currentSections.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Attendance Date</label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-slate-900 dark:text-white font-mono"
                />
              </div>

              <div className="border-l border-slate-200 dark:border-slate-700 pl-4">
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1 flex items-center gap-1">
                  <Filter className="w-3 h-3 text-indigo-500" /> Filter Status
                </label>
                <select
                  value={dailyStatusFilter}
                  onChange={(e) => setDailyStatusFilter(e.target.value)}
                  className="bg-slate-50 dark:bg-slate-800 border border-indigo-200 dark:border-indigo-800 rounded-xl px-3 py-1.5 text-indigo-600 dark:text-indigo-300 font-bold"
                >
                  <option value="ALL">All Statuses ({students.length})</option>
                  <option value="PRESENT">PRESENT Only ({dailyCounts.PRESENT})</option>
                  <option value="ABSENT">ABSENT Only ({dailyCounts.ABSENT})</option>
                  <option value="LATE">LATE Only ({dailyCounts.LATE})</option>
                  <option value="EXCUSED">EXCUSED Only ({dailyCounts.EXCUSED})</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" icon={RefreshCw} onClick={fetchDailyAttendance}>
                Refresh
              </Button>
              <Button
                variant="success"
                size="md"
                icon={Save}
                isLoading={savingDaily}
                disabled={students.length === 0}
                onClick={handleSaveAttendance}
              >
                Save Attendance Matrix
              </Button>
            </div>
          </Card>

          {/* Section & Class Teacher Banner */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="p-4 flex items-center gap-3 bg-gradient-to-r from-indigo-500/10 via-purple-500/5 to-transparent border-indigo-200 dark:border-indigo-900">
              <UserCheck className="w-8 h-8 text-indigo-600 dark:text-indigo-400 shrink-0" />
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Class Coordinator</span>
                <div className="text-sm font-bold text-slate-900 dark:text-white">
                  {sectionMetadata?.class_teacher_name ? (
                    <span>
                      {sectionMetadata.class_teacher_name} ({sectionMetadata.teacher_employee_id})
                    </span>
                  ) : (
                    <span className="text-amber-600 dark:text-amber-400 flex items-center gap-1 text-xs">
                      <AlertTriangle className="w-3.5 h-3.5" /> No Class Teacher Assigned
                    </span>
                  )}
                </div>
              </div>
            </Card>

            <Card className="p-4 flex items-center gap-3 bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-transparent border-emerald-200 dark:border-emerald-900">
              <CheckCircle className="w-8 h-8 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Save Status Metadata</span>
                <div className="text-xs font-bold text-slate-900 dark:text-white">
                  {sectionMetadata?.isMarked ? (
                    <span className="text-emerald-600 dark:text-emerald-400">
                      Saved & Up to Date (Marked by {sectionMetadata.markedBy || 'Admin'})
                    </span>
                  ) : (
                    <span className="text-amber-600 dark:text-amber-400">Not Marked for Date {selectedDate}</span>
                  )}
                </div>
              </div>
            </Card>

            {/* Quick Batch Actions */}
            <Card className="p-3 flex items-center justify-between gap-2">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Quick Action Toggles:</span>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => handleBatchStatus('PRESENT')}
                  className="px-2.5 py-1.5 bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 rounded-lg text-[11px] font-bold hover:bg-emerald-200 transition"
                >
                  All Present
                </button>
                <button
                  onClick={() => handleBatchStatus('ABSENT')}
                  className="px-2.5 py-1.5 bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 rounded-lg text-[11px] font-bold hover:bg-rose-200 transition"
                >
                  All Absent
                </button>
              </div>
            </Card>
          </div>

          {/* Student Matrix Table */}
          <Card className="p-0 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 dark:bg-slate-900/80 text-slate-600 dark:text-slate-400 uppercase tracking-wider text-[11px] font-semibold border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="p-4">Roll No</th>
                    <th className="p-4">Student Name</th>
                    <th className="p-4">Admission No</th>
                    <th className="p-4 text-center">Attendance Status Toggles</th>
                    <th className="p-4">Remarks / Reason</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60 text-slate-700 dark:text-slate-300">
                  {loading ? (
                    <tr>
                      <td colSpan="5" className="p-12 text-center text-indigo-500">
                        <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2" />
                        <span>Loading section students attendance...</span>
                      </td>
                    </tr>
                  ) : filteredDailyStudents.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="p-12 text-center text-slate-400 dark:text-slate-500">
                        No students matching status filter "{dailyStatusFilter}".
                      </td>
                    </tr>
                  ) : (
                    filteredDailyStudents.map((st) => {
                      const currentStatus = attendanceMap[st.id] || 'PRESENT';
                      const currentRemark = remarksMap[st.id] || '';

                      return (
                        <tr key={st.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/40 transition">
                          <td className="p-4 font-bold text-indigo-600 dark:text-indigo-300">#{st.roll_no || st.id}</td>
                          <td className="p-4 font-bold text-slate-900 dark:text-white">{st.name}</td>
                          <td className="p-4">
                            <code className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-indigo-600 dark:text-indigo-400 font-mono text-[11px]">
                              {st.admission_number}
                            </code>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center justify-center space-x-2">
                              {['PRESENT', 'ABSENT', 'LATE', 'EXCUSED'].map((statusOption) => {
                                const isSelected = currentStatus === statusOption;
                                let btnStyle =
                                  'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400';
                                if (isSelected) {
                                  if (statusOption === 'PRESENT')
                                    btnStyle =
                                      'bg-emerald-600 text-white border-emerald-500 shadow-md shadow-emerald-600/30';
                                  if (statusOption === 'ABSENT')
                                    btnStyle = 'bg-rose-600 text-white border-rose-500 shadow-md shadow-rose-600/30';
                                  if (statusOption === 'LATE')
                                    btnStyle =
                                      'bg-amber-600 text-white border-amber-500 shadow-md shadow-amber-600/30';
                                  if (statusOption === 'EXCUSED')
                                    btnStyle =
                                      'bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-600/30';
                                }

                                return (
                                  <button
                                    key={statusOption}
                                    onClick={() =>
                                      setAttendanceMap({ ...attendanceMap, [st.id]: statusOption })
                                    }
                                    className={`px-3 py-1.5 rounded-xl border text-[11px] font-bold transition-all duration-150 ${btnStyle}`}
                                  >
                                    {statusOption}
                                  </button>
                                );
                              })}
                            </div>
                          </td>
                          <td className="p-4">
                            <input
                              type="text"
                              placeholder="e.g. Sick leave certificate"
                              value={currentRemark}
                              onChange={(e) =>
                                setRemarksMap({ ...remarksMap, [st.id]: e.target.value })
                              }
                              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1 text-slate-900 dark:text-white text-xs"
                            />
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* ================= TAB 2: ATTENDANCE EXPLORER & FILTERS ================= */}
      {activeTab === 'explorer' && (
        <div className="space-y-6">
          {/* Multi-filter Bar */}
          <Card className="p-4 space-y-4 text-xs">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Filter className="w-4 h-4 text-indigo-500" /> Multi-Param Attendance Search & Analytics Filters
              </h3>
              <Button variant="outline" size="sm" icon={Download} onClick={exportExplorerCSV}>
                Export CSV Report
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Class</label>
                <select
                  value={expClass}
                  onChange={(e) => setExpClass(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-slate-900 dark:text-white"
                >
                  <option value="ALL">All Classes</option>
                  {classes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Section</label>
                <select
                  value={expSection}
                  onChange={(e) => setExpSection(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-slate-900 dark:text-white"
                >
                  <option value="ALL">All Sections</option>
                  <option value="1">Section A</option>
                  <option value="2">Section B</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Start Date</label>
                <input
                  type="date"
                  value={expStartDate}
                  onChange={(e) => setExpStartDate(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-slate-900 dark:text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">End Date</label>
                <input
                  type="date"
                  value={expEndDate}
                  onChange={(e) => setExpEndDate(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-slate-900 dark:text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Status</label>
                <select
                  value={expStatus}
                  onChange={(e) => setExpStatus(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-slate-900 dark:text-white"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="PRESENT">PRESENT</option>
                  <option value="ABSENT">ABSENT</option>
                  <option value="LATE">LATE</option>
                  <option value="EXCUSED">EXCUSED</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="text"
                placeholder="Search student name or admission number..."
                value={expSearch}
                onChange={(e) => setExpSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && fetchExplorerReport()}
                className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-slate-900 dark:text-white text-xs"
              />
              <Button variant="primary" size="sm" onClick={fetchExplorerReport} isLoading={loadingExplorer}>
                Apply Filter Search
              </Button>
            </div>
          </Card>

          {/* Aggregated Analytics Summary Cards */}
          {explorerData.summary && (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <Card className="p-4 bg-gradient-to-br from-indigo-500/10 via-transparent to-transparent">
                <span className="text-[10px] uppercase font-bold text-slate-400">Total Log Entries</span>
                <div className="text-xl font-extrabold text-indigo-600 dark:text-indigo-400 mt-1">
                  {explorerData.summary.totalRecords}
                </div>
              </Card>

              <Card className="p-4 bg-gradient-to-br from-emerald-500/10 via-transparent to-transparent">
                <span className="text-[10px] uppercase font-bold text-slate-400">Present Rate</span>
                <div className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">
                  {explorerData.summary.presentPercentage}%
                </div>
              </Card>

              <Card className="p-4 bg-gradient-to-br from-rose-500/10 via-transparent to-transparent">
                <span className="text-[10px] uppercase font-bold text-slate-400">Total Absences</span>
                <div className="text-xl font-extrabold text-rose-600 dark:text-rose-400 mt-1">
                  {explorerData.summary.absentCount}
                </div>
              </Card>

              <Card className="p-4 bg-gradient-to-br from-amber-500/10 via-transparent to-transparent">
                <span className="text-[10px] uppercase font-bold text-slate-400">Late Arrivals</span>
                <div className="text-xl font-extrabold text-amber-600 dark:text-amber-400 mt-1">
                  {explorerData.summary.lateCount}
                </div>
              </Card>

              <Card className="p-4 bg-gradient-to-br from-purple-500/10 via-transparent to-transparent">
                <span className="text-[10px] uppercase font-bold text-slate-400">Excused Leaves</span>
                <div className="text-xl font-extrabold text-purple-600 dark:text-purple-400 mt-1">
                  {explorerData.summary.excusedCount}
                </div>
              </Card>
            </div>
          )}

          {/* Filtered Log Table */}
          <Card className="p-0 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 dark:bg-slate-900/80 text-slate-600 dark:text-slate-400 uppercase tracking-wider text-[11px] font-semibold border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="p-4">Date</th>
                    <th className="p-4">Class & Section</th>
                    <th className="p-4">Roll No</th>
                    <th className="p-4">Student Name</th>
                    <th className="p-4">Admission No</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Remarks</th>
                    <th className="p-4">Marked By</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60 text-slate-700 dark:text-slate-300">
                  {loadingExplorer ? (
                    <tr>
                      <td colSpan="8" className="p-12 text-center text-indigo-500">
                        <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2" />
                        <span>Querying attendance log records...</span>
                      </td>
                    </tr>
                  ) : explorerData.records.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="p-12 text-center text-slate-400 dark:text-slate-500">
                        No attendance records found matching selected filter criteria.
                      </td>
                    </tr>
                  ) : (
                    explorerData.records.map((r) => {
                      let badgeVar = 'neutral';
                      if (r.status === 'PRESENT') badgeVar = 'success';
                      if (r.status === 'ABSENT') badgeVar = 'danger';
                      if (r.status === 'LATE') badgeVar = 'warning';
                      if (r.status === 'EXCUSED') badgeVar = 'indigo';

                      return (
                        <tr key={r.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/40 transition">
                          <td className="p-4 font-mono text-slate-900 dark:text-white font-bold">
                            {r.date ? r.date.split('T')[0] : ''}
                          </td>
                          <td className="p-4">
                            {r.class_name} - {r.section_name}
                          </td>
                          <td className="p-4 font-bold text-indigo-600 dark:text-indigo-400">#{r.roll_no}</td>
                          <td className="p-4 font-bold text-slate-900 dark:text-white">{r.student_name}</td>
                          <td className="p-4 font-mono text-[11px]">{r.admission_number}</td>
                          <td className="p-4">
                            <Badge variant={badgeVar}>{r.status}</Badge>
                          </td>
                          <td className="p-4 text-slate-500 dark:text-slate-400">{r.remarks || '—'}</td>
                          <td className="p-4 font-medium text-slate-600 dark:text-slate-300">
                            {r.marked_by_user || 'System Admin'}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* ================= TAB 3: INDIVIDUAL STUDENT ATTENDANCE LEDGER ================= */}
      {activeTab === 'student' && (
        <div className="space-y-6">
          {/* Controls with Date Filters */}
          <Card className="p-4 space-y-4 text-xs">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-4">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Class</label>
                  <select
                    value={ledgerClass}
                    onChange={(e) => setLedgerClass(e.target.value)}
                    className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-slate-900 dark:text-white font-medium"
                  >
                    {classes.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Section</label>
                  <select
                    value={ledgerSection}
                    onChange={(e) => setLedgerSection(e.target.value)}
                    className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-slate-900 dark:text-white font-medium"
                  >
                    {ledgerSections.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Select Student</label>
                  <select
                    value={ledgerStudentId}
                    onChange={(e) => setLedgerStudentId(e.target.value)}
                    className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-slate-900 dark:text-white font-bold"
                  >
                    {sectionStudents.map((st) => (
                      <option key={st.id} value={st.id}>
                        #{st.roll_no} {st.name} ({st.admission_number})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Date Filters for Ledger */}
              <div className="flex flex-wrap items-center gap-3 border-l border-slate-200 dark:border-slate-700 pl-4">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1 flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-indigo-500" /> Start Date
                  </label>
                  <input
                    type="date"
                    value={ledgerStartDate}
                    onChange={(e) => setLedgerStartDate(e.target.value)}
                    className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-slate-900 dark:text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1 flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-indigo-500" /> End Date
                  </label>
                  <input
                    type="date"
                    value={ledgerEndDate}
                    onChange={(e) => setLedgerEndDate(e.target.value)}
                    className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-slate-900 dark:text-white font-mono"
                  />
                </div>

                <div className="pt-5 flex items-center gap-1">
                  <button
                    onClick={() => setLedgerDatePreset('THIS_MONTH')}
                    className="px-2.5 py-1 bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-300 rounded-lg text-[11px] font-semibold hover:bg-indigo-100 transition"
                  >
                    This Month
                  </button>
                  <button
                    onClick={() => setLedgerDatePreset('LAST_30_DAYS')}
                    className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg text-[11px] font-semibold hover:bg-slate-200 transition"
                  >
                    30 Days
                  </button>
                  {(ledgerStartDate || ledgerEndDate) && (
                    <button
                      onClick={() => setLedgerDatePreset('CLEAR')}
                      className="px-2 py-1 text-rose-600 dark:text-rose-400 text-[11px] font-semibold hover:underline"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>
            </div>
          </Card>

          {loadingLedger ? (
            <div className="p-12 text-center text-indigo-500">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2" />
              <span>Fetching student attendance ledger...</span>
            </div>
          ) : ledgerData && ledgerData.student ? (
            <div className="space-y-6">
              {/* Student Overview Scorecard */}
              <Card className="p-6 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl border-indigo-900">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-indigo-600 text-white font-bold text-xl rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-600/30">
                      {ledgerData.student.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">{ledgerData.student.name}</h3>
                      <div className="text-xs text-indigo-200 mt-0.5 space-x-3">
                        <span>Class: {ledgerData.student.class_name} - {ledgerData.student.section_name}</span>
                        <span>Roll: #{ledgerData.student.roll_no}</span>
                        <span>Admission: {ledgerData.student.admission_number}</span>
                      </div>
                      {(ledgerStartDate || ledgerEndDate) && (
                        <div className="mt-2 inline-flex items-center gap-1.5 bg-indigo-900/60 border border-indigo-700/60 px-2.5 py-0.5 rounded-lg text-[11px] text-indigo-200 font-mono">
                          <Calendar className="w-3 h-3 text-indigo-400" /> Filter Range: {ledgerStartDate || 'Start'} to {ledgerEndDate || 'Present'}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="text-center">
                      <div className="text-3xl font-black text-emerald-400">
                        {ledgerData.stats.attendanceRate}%
                      </div>
                      <span className="text-[10px] uppercase font-bold text-indigo-200">
                        {ledgerStartDate || ledgerEndDate ? 'Filtered Rate' : 'Overall Attendance Rate'}
                      </span>
                    </div>

                    <div className="h-10 border-r border-indigo-800" />

                    <div className="grid grid-cols-4 gap-4 text-center text-xs">
                      <div>
                        <div className="font-bold text-white text-lg">{ledgerData.stats.present}</div>
                        <span className="text-[10px] text-emerald-400">Present</span>
                      </div>
                      <div>
                        <div className="font-bold text-white text-lg">{ledgerData.stats.absent}</div>
                        <span className="text-[10px] text-rose-400">Absent</span>
                      </div>
                      <div>
                        <div className="font-bold text-white text-lg">{ledgerData.stats.late}</div>
                        <span className="text-[10px] text-amber-400">Late</span>
                      </div>
                      <div>
                        <div className="font-bold text-white text-lg">{ledgerData.stats.excused}</div>
                        <span className="text-[10px] text-indigo-300">Excused</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Day-by-Day History Log */}
              <Card className="p-0 overflow-hidden">
                <div className="p-4 border-b border-slate-200 dark:border-slate-800 font-bold text-xs text-slate-900 dark:text-white flex items-center justify-between">
                  <span>Chronological Attendance Ledger Logs ({ledgerData.logs.length} Records)</span>
                  {(ledgerStartDate || ledgerEndDate) && (
                    <span className="text-[11px] text-indigo-600 dark:text-indigo-400 font-mono">
                      Filtered ({ledgerStartDate || 'Beginning'} → {ledgerEndDate || 'Latest'})
                    </span>
                  )}
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-100 dark:bg-slate-900/80 text-slate-600 dark:text-slate-400 uppercase tracking-wider text-[11px] font-semibold border-b border-slate-200 dark:border-slate-800">
                      <tr>
                        <th className="p-4">Date</th>
                        <th className="p-4">Status</th>
                        <th className="p-4">Remarks / Explanation</th>
                        <th className="p-4">Marked By User</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60 text-slate-700 dark:text-slate-300">
                      {ledgerData.logs.length === 0 ? (
                        <tr>
                          <td colSpan="4" className="p-8 text-center text-slate-400">
                            No attendance records logged for this student in the selected date range.
                          </td>
                        </tr>
                      ) : (
                        ledgerData.logs.map((log) => {
                          let badgeVar = 'neutral';
                          if (log.status === 'PRESENT') badgeVar = 'success';
                          if (log.status === 'ABSENT') badgeVar = 'danger';
                          if (log.status === 'LATE') badgeVar = 'warning';
                          if (log.status === 'EXCUSED') badgeVar = 'indigo';

                          return (
                            <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/40 transition">
                              <td className="p-4 font-mono font-bold text-slate-900 dark:text-white">
                                {log.date ? log.date.split('T')[0] : ''}
                              </td>
                              <td className="p-4">
                                <Badge variant={badgeVar}>{log.status}</Badge>
                              </td>
                              <td className="p-4 text-slate-500 dark:text-slate-400">{log.remarks || '—'}</td>
                              <td className="p-4 font-medium text-slate-600 dark:text-slate-300">
                                {log.marked_by_user || 'System Admin'}
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>
          ) : (
            <div className="p-12 text-center text-slate-400 dark:text-slate-500 text-xs">
              Select a student to view their detailed attendance ledger.
            </div>
          )}
        </div>
      )}

      {/* ================= CLASS COORDINATOR ASSIGNMENT MODAL ================= */}
      <Modal
        isOpen={isCoordinatorModalOpen}
        onClose={() => setIsCoordinatorModalOpen(false)}
        title="Class & Section Coordinators Matrix"
      >
        <div className="space-y-4 text-xs">
          <div className="p-3 bg-indigo-50 dark:bg-indigo-950/80 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 rounded-xl flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 shrink-0 text-indigo-600 dark:text-indigo-400" />
            <span>
              School Admin & Principal Authority: Assign a Class Teacher / Section Coordinator for each section to authorize daily student attendance marking.
            </span>
          </div>

          <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
            {classes.map((c) => (
              <div
                key={c.id}
                className="bg-slate-50 dark:bg-slate-900/60 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2"
              >
                <div className="font-bold text-slate-900 dark:text-white text-xs border-b border-slate-200 dark:border-slate-800 pb-1.5 flex items-center justify-between">
                  <span>{c.name} ({c.code})</span>
                  <Badge variant="indigo">{c.sections?.length || 0} Sections</Badge>
                </div>

                <div className="space-y-2 pt-1">
                  {c.sections && c.sections.length > 0 ? (
                    c.sections.map((sec) => (
                      <div
                        key={sec.id}
                        className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2.5 bg-white dark:bg-slate-800/80 rounded-lg border border-slate-200 dark:border-slate-700/70"
                      >
                        <div className="font-semibold text-slate-800 dark:text-slate-200">
                          {sec.name}
                        </div>

                        <div className="flex items-center gap-2 sm:w-2/3">
                          <select
                            disabled={updatingSectionId === sec.id}
                            value={sec.class_teacher_id || ''}
                            onChange={(e) => handleAssignCoordinator(sec.id, e.target.value)}
                            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1 text-slate-800 dark:text-slate-200 text-xs focus:ring-2 focus:ring-indigo-500 font-medium"
                          >
                            <option value="">-- No Class Teacher Assigned --</option>
                            {teachers.map((t) => (
                              <option key={t.id} value={t.id}>
                                {t.name || `Teacher #${t.id}`} ({t.employee_id || 'EMP'})
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-[11px] text-slate-400 italic">No sections created.</div>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="pt-2 flex justify-end">
            <Button variant="outline" size="sm" onClick={() => setIsCoordinatorModalOpen(false)}>
              Done / Close
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AttendanceManager;
