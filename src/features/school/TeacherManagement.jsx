import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Card } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import DataTable from '../../components/ui/DataTable';
import {
  Users,
  Plus,
  RefreshCw,
  Download,
  Upload,
  FileText,
  UserCheck,
  ShieldCheck,
  ArrowLeft,
  Calendar,
  Mail,
  Phone,
  Briefcase,
  DollarSign,
  GraduationCap,
  Clock,
  BookOpen,
  Save,
  Edit,
  X,
  Lock,
} from 'lucide-react';
import toast from 'react-hot-toast';

const TeacherManagement = () => {
  const { user } = useAuth();
  const [teachers, setTeachers] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [isCSVOpen, setIsCSVOpen] = useState(false);
  const [csvText, setCsvText] = useState('');
  const [importing, setImporting] = useState(false);

  // Selected Teacher for Detail View
  const [selectedTeacherId, setSelectedTeacherId] = useState(null);
  const [teacherDetail, setTeacherDetail] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [detailAssignedSection, setDetailAssignedSection] = useState('');
  const [savingCoordinator, setSavingCoordinator] = useState(false);

  // Filter Future Lectures state
  const [showUpcomingOnly, setShowUpcomingOnly] = useState(true);

  // Edit Teacher Profile Form State
  const [savingTeacherProfile, setSavingTeacherProfile] = useState(false);
  const [editTeacherForm, setEditTeacherForm] = useState({
    name: '',
    employeeId: '',
    email: '',
    phone: '',
    qualification: '',
    experienceYears: '',
    salary: '',
  });

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: 'Teacher@123',
    qualification: 'M.Sc, B.Ed',
    experienceYears: 5,
    assignedSectionId: '',
  });

  // Robust Role Evaluation
  const roleStr = (user?.roleName || user?.role_name || '').toLowerCase();
  const userType = (user?.userType || '').toUpperCase();
  const isAdmin =
    userType === 'SUPER_ADMIN' ||
    roleStr.includes('admin') ||
    roleStr.includes('administrator') ||
    !user;

  const canEditTeacher =
    isAdmin ||
    roleStr.includes('principal') ||
    roleStr.includes('vice principal');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [tRes, cRes] = await Promise.all([
        api.get('/school/teachers'),
        api.get('/school/classes'),
      ]);
      setTeachers(tRes.data || []);
      setClasses(cRes.data || []);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load faculty directory');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Fetch Teacher Detail View
  const fetchTeacherDetail = async (id) => {
    setLoadingDetail(true);
    try {
      const res = await api.get(`/school/teachers/${id}`);
      const data = res.data;
      setTeacherDetail(data);
      setDetailAssignedSection(data.assigned_section_id ? String(data.assigned_section_id) : '');
      setEditTeacherForm({
        name: data.name || '',
        employeeId: data.employee_id || '',
        email: data.email || '',
        phone: data.phone || '',
        qualification: data.qualification || '',
        experienceYears: data.experience_years ? String(data.experience_years) : '',
        salary: data.base_salary || data.salary || '',
      });
    } catch (err) {
      console.error(err);
      toast.error('Failed to load teacher detail profile');
    } finally {
      setLoadingDetail(false);
    }
  };

  useEffect(() => {
    if (selectedTeacherId) {
      fetchTeacherDetail(selectedTeacherId);
    }
  }, [selectedTeacherId]);

  // Helper to filter future / upcoming lectures only
  const getFilteredTimetable = (timetableList) => {
    if (!timetableList) return [];
    if (!showUpcomingOnly) return timetableList;

    const currentDayIndex = new Date().getDay(); // 0 = Sun, 1 = Mon, 2 = Tue, 3 = Wed, 4 = Thu, 5 = Fri, 6 = Sat
    const dayMap = {
      SUNDAY: 0,
      MONDAY: 1,
      TUESDAY: 2,
      WEDNESDAY: 3,
      THURSDAY: 4,
      FRIDAY: 5,
      SATURDAY: 6,
    };

    const now = new Date();
    const currentHours = now.getHours();

    return timetableList.filter((t) => {
      const dayIdx = dayMap[(t.day_of_week || '').toUpperCase()];
      if (dayIdx === undefined) return true;

      // Future day of the current week
      if (dayIdx > currentDayIndex) return true;

      // Today: check if current time has not passed lecture end time
      if (dayIdx === currentDayIndex) {
        if (t.end_time) {
          const [endH] = t.end_time.split(':').map(Number);
          return currentHours < endH;
        }
        return true;
      }

      // Past day of the week
      return false;
    });
  };

  // Handle Teacher Profile Update Submit
  const handleUpdateTeacherProfile = async (e) => {
    e.preventDefault();
    if (!selectedTeacherId) return;

    setSavingTeacherProfile(true);
    try {
      await api.put(`/school/teachers/${selectedTeacherId}`, {
        ...editTeacherForm,
        experienceYears: editTeacherForm.experienceYears ? parseInt(editTeacherForm.experienceYears) : null,
        salary: editTeacherForm.salary ? parseFloat(editTeacherForm.salary) : null,
      });
      toast.success('Teacher profile updated successfully!');
      await fetchTeacherDetail(selectedTeacherId);
      fetchData();
    } catch (err) {
      console.error(err);
      toast.error(err.message || 'Failed to update teacher profile');
    } finally {
      setSavingTeacherProfile(false);
    }
  };

  // Handle Class Coordinator Update from Detail Page
  const handleUpdateDetailCoordinator = async () => {
    if (!selectedTeacherId) return;

    setSavingCoordinator(true);
    try {
      const targetSectionId = detailAssignedSection ? parseInt(detailAssignedSection) : null;
      if (targetSectionId) {
        await api.put(`/school/sections/${targetSectionId}/class-teacher`, { teacherId: selectedTeacherId });
      } else if (teacherDetail.assigned_section_id) {
        // Unassign current section
        await api.put(`/school/sections/${teacherDetail.assigned_section_id}/class-teacher`, { teacherId: null });
      }

      toast.success('Class Coordinator assignment saved successfully!');
      await fetchTeacherDetail(selectedTeacherId);
      fetchData();
    } catch (err) {
      console.error(err);
      toast.error(err.message || 'Failed to assign class coordinator');
    } finally {
      setSavingCoordinator(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/school/teachers', formData);
      toast.success('Teacher account created successfully!');
      setIsOpen(false);
      setFormData({
        name: '',
        email: '',
        password: 'Teacher@123',
        qualification: 'M.Sc, B.Ed',
        experienceYears: 5,
        assignedSectionId: '',
      });
      fetchData();
    } catch (err) {
      console.error(err);
      toast.error(err.message || 'Failed to create teacher');
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      setCsvText(evt.target.result);
    };
    reader.readAsText(file);
  };

  const downloadSampleCSV = () => {
    const sampleContent =
      'name,email,qualification,experienceYears,phone\n' +
      'Dr. Sarah Jenkins,sarah.j@school.edu,Ph.D in Mathematics,8,+1 555-0101\n' +
      'Markus Vance,markus.v@school.edu,M.A. English Literature,6,+1 555-0102\n';

    const blob = new Blob([sampleContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'sample_teachers_import.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Sample Teacher CSV downloaded!');
  };

  const handleCSVSubmit = async (e) => {
    e.preventDefault();
    if (!csvText.trim()) {
      toast.error('Please select a CSV file or paste CSV content');
      return;
    }

    setImporting(true);
    try {
      const lines = csvText.trim().split('\n');
      let successCount = 0;
      for (const line of lines) {
        const parts = line.split(',').map((s) => s.trim());
        if (parts.length >= 2 && parts[0] !== 'name') {
          const [name, email, qualification, experienceYears, phone] = parts;
          await api.post('/school/teachers', {
            name,
            email: email || `${name.toLowerCase().replace(/\s+/g, '')}@school.edu`,
            qualification: qualification || 'B.Ed',
            experienceYears: experienceYears ? parseInt(experienceYears) : 3,
            phone: phone || '+1 555-0000',
          });
          successCount++;
        }
      }

      toast.success(`Successfully onboarded ${successCount} faculty members!`);
      setIsCSVOpen(false);
      setCsvText('');
      fetchData();
    } catch (err) {
      console.error(err);
      toast.error(err.message || 'Teacher CSV import failed');
    } finally {
      setImporting(false);
    }
  };

  // Flatten options for Class & Section selector
  const allSectionOptions = [];
  classes.forEach((c) => {
    if (c.sections && c.sections.length > 0) {
      c.sections.forEach((sec) => {
        allSectionOptions.push({
          sectionId: sec.id,
          label: `${c.name} - ${sec.name}`,
          classTeacherName: sec.class_teacher_name,
        });
      });
    }
  });

  const columns = [
    {
      header: 'Employee ID',
      accessor: 'employee_id',
      render: (row) => (
        <code className="bg-slate-100 dark:bg-slate-800 text-indigo-600 dark:text-indigo-300 border border-slate-200 dark:border-slate-700 px-2 py-0.5 rounded-md font-mono text-[11px] font-bold">
          {row.employee_id || `EMP-${row.id}`}
        </code>
      ),
    },
    {
      header: 'Faculty Name',
      accessor: 'name',
      render: (row) => (
        <button
          onClick={() => setSelectedTeacherId(row.id)}
          className="font-bold text-slate-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 text-xs text-left hover:underline"
        >
          <div>{row.name}</div>
          <div className="text-[10px] text-slate-400 font-mono">{row.email}</div>
        </button>
      ),
    },
    {
      header: 'Qualification',
      accessor: 'qualification',
      render: (row) => <Badge variant="neutral">{row.qualification || 'M.A, B.Ed'}</Badge>,
    },
    {
      header: 'Experience',
      accessor: 'experience_years',
      render: (row) => <span className="font-semibold text-slate-700 dark:text-slate-300">{row.experience_years || 5} Years</span>,
    },
    {
      header: 'Assigned Coordinator',
      accessor: 'assigned_classes',
      render: (row) => (
        <div>
          {row.assigned_classes ? (
            <Badge variant="indigo" className="flex items-center gap-1 w-fit">
              <ShieldCheck className="w-3 h-3" /> {row.assigned_classes}
            </Badge>
          ) : (
            <span className="text-slate-400 text-xs italic">Unassigned</span>
          )}
        </div>
      ),
    },
    {
      header: 'Actions',
      accessor: 'id',
      render: (row) => (
        <Button
          variant="outline"
          size="xs"
          icon={Edit}
          onClick={() => setSelectedTeacherId(row.id)}
        >
          Edit Profile & Assign
        </Button>
      ),
    },
  ];

  const filteredTimetable = teacherDetail ? getFilteredTimetable(teacherDetail.timetable) : [];

  return (
    <div className="space-y-6">
      {/* Detail View when selectedTeacherId is active */}
      {selectedTeacherId ? (
        <div className="space-y-6">
          {/* Top Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  setSelectedTeacherId(null);
                  setTeacherDetail(null);
                }}
                className="p-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl text-slate-700 dark:text-slate-200 transition"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-wide flex items-center gap-2">
                  <span>Faculty Profile & Coordinator Details</span>
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Edit teacher profile information, employee ID, and assign Class Coordinator roles
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" icon={RefreshCw} onClick={() => fetchTeacherDetail(selectedTeacherId)}>
                Refresh Profile
              </Button>
            </div>
          </div>

          {loadingDetail || !teacherDetail ? (
            <div className="p-16 text-center text-indigo-500">
              <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-3" />
              <span>Loading teacher profile & timetable...</span>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Profile Card Banner */}
              <Card className="p-6 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl border-indigo-900">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-indigo-600 text-white font-bold text-2xl rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-600/40">
                      {teacherDetail.name?.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-2xl font-bold">{teacherDetail.name}</h3>
                        <Badge variant="success">{teacherDetail.account_status || 'ACTIVE'}</Badge>
                      </div>
                      <div className="text-xs text-indigo-200 mt-1 flex flex-wrap items-center gap-4">
                        <span className="font-mono bg-indigo-900/60 px-2 py-0.5 rounded text-indigo-300">
                          {teacherDetail.employee_id}
                        </span>
                        <span className="flex items-center gap-1">
                          <Mail className="w-3.5 h-3.5 text-indigo-400" /> {teacherDetail.email}
                        </span>
                        {teacherDetail.phone && (
                          <span className="flex items-center gap-1">
                            <Phone className="w-3.5 h-3.5 text-indigo-400" /> {teacherDetail.phone}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 border-t md:border-t-0 md:border-l border-indigo-800/80 pt-4 md:pt-0 md:pl-6 text-xs">
                    <div>
                      <div className="text-indigo-300 font-medium">Class Coordinator</div>
                      <div className="font-bold text-white text-sm mt-0.5">
                        {teacherDetail.assigned_classes ? (
                          <span className="text-emerald-400 flex items-center gap-1">
                            <ShieldCheck className="w-4 h-4" /> {teacherDetail.assigned_classes}
                          </span>
                        ) : (
                          <span className="text-slate-400 italic">No Class Assigned</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Class Coordinator Assignment Control Box */}
              <Card className="p-6 space-y-4 border-2 border-indigo-500/20 dark:border-indigo-800/50 bg-gradient-to-r from-indigo-50/50 via-purple-50/20 to-transparent dark:from-indigo-950/40 dark:via-purple-950/20 dark:to-transparent">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-indigo-100 dark:border-indigo-900/60 pb-3">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <UserCheck className="w-5 h-5 text-indigo-600 dark:text-indigo-400" /> Class Teacher / Section Coordinator Assignment
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Select a Class & Section to authorize this teacher as the official Class Teacher for attendance marking
                    </p>
                  </div>
                  {canEditTeacher && (
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold bg-emerald-50 dark:bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
                      Editable Mode Enabled
                    </span>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row items-end gap-4 text-xs pt-1">
                  <div className="flex-1 w-full">
                    <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1.5 flex items-center gap-1.5">
                      <BookOpen className="w-4 h-4 text-indigo-500" /> Select Class & Section Dropdown
                    </label>
                    <select
                      disabled={!canEditTeacher}
                      value={detailAssignedSection}
                      onChange={(e) => setDetailAssignedSection(e.target.value)}
                      className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-2.5 text-slate-900 dark:text-white font-bold text-xs focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="">-- No Class Teacher Assignment (Unassign) --</option>
                      {allSectionOptions.map((opt) => (
                        <option key={opt.sectionId} value={opt.sectionId}>
                          {opt.label} {opt.classTeacherName ? `(Currently: ${opt.classTeacherName})` : '(Unassigned)'}
                        </option>
                      ))}
                    </select>
                  </div>

                  {canEditTeacher && (
                    <Button
                      variant="primary"
                      size="md"
                      icon={Save}
                      isLoading={savingCoordinator}
                      onClick={handleUpdateDetailCoordinator}
                      className="w-full sm:w-auto"
                    >
                      Save Coordinator Assignment
                    </Button>
                  )}
                </div>
              </Card>

              {/* Grid: Edit Teacher Profile Form & Timetable Schedule */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Editable Teacher Profile Form */}
                <Card className="space-y-4 text-xs">
                  <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                    <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2 text-sm">
                      <GraduationCap className="w-4 h-4 text-indigo-600 dark:text-indigo-400" /> Edit Faculty Profile
                    </h3>
                    {canEditTeacher && (
                      <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold bg-emerald-50 dark:bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
                        Editable Mode
                      </span>
                    )}
                  </div>

                  <form onSubmit={handleUpdateTeacherProfile} className="space-y-3.5">
                    <div>
                      <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Faculty Full Name *</label>
                      <input
                        type="text"
                        required
                        disabled={!canEditTeacher}
                        value={editTeacherForm.name}
                        onChange={(e) => setEditTeacherForm({ ...editTeacherForm, name: e.target.value })}
                        className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1 flex items-center justify-between">
                        <span>Employee ID *</span>
                        {!isAdmin && (
                          <span className="text-[10px] text-amber-600 dark:text-amber-400 font-normal flex items-center gap-1">
                            <Lock className="w-3 h-3" /> Admin Only
                          </span>
                        )}
                      </label>
                      <input
                        type="text"
                        required
                        disabled={!isAdmin}
                        value={editTeacherForm.employeeId}
                        onChange={(e) => setEditTeacherForm({ ...editTeacherForm, employeeId: e.target.value })}
                        className={`w-full border rounded-xl px-3.5 py-2 font-mono text-slate-900 dark:text-white ${
                          !isAdmin
                            ? 'bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800 cursor-not-allowed text-slate-500'
                            : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 focus:ring-2 focus:ring-indigo-500 font-bold'
                        }`}
                      />
                    </div>

                    <div>
                      <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Email Address *</label>
                      <input
                        type="email"
                        required
                        disabled={!canEditTeacher}
                        value={editTeacherForm.email}
                        onChange={(e) => setEditTeacherForm({ ...editTeacherForm, email: e.target.value })}
                        className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2 font-mono text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Phone Number</label>
                      <input
                        type="text"
                        disabled={!canEditTeacher}
                        value={editTeacherForm.phone}
                        onChange={(e) => setEditTeacherForm({ ...editTeacherForm, phone: e.target.value })}
                        className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2 font-mono text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Academic Qualification</label>
                      <input
                        type="text"
                        disabled={!canEditTeacher}
                        value={editTeacherForm.qualification}
                        onChange={(e) => setEditTeacherForm({ ...editTeacherForm, qualification: e.target.value })}
                        className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Experience (Yrs)</label>
                        <input
                          type="number"
                          disabled={!canEditTeacher}
                          value={editTeacherForm.experienceYears}
                          onChange={(e) => setEditTeacherForm({ ...editTeacherForm, experienceYears: e.target.value })}
                          className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2 font-mono text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Base Salary ($)</label>
                        <input
                          type="number"
                          step="0.01"
                          disabled={!canEditTeacher}
                          value={editTeacherForm.salary}
                          onChange={(e) => setEditTeacherForm({ ...editTeacherForm, salary: e.target.value })}
                          className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2 font-mono text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>
                    </div>

                    {canEditTeacher && (
                      <div className="pt-2 flex justify-end">
                        <Button variant="primary" size="md" icon={Save} isLoading={savingTeacherProfile} type="submit" className="w-full">
                          Save Faculty Details
                        </Button>
                      </div>
                    )}
                  </form>
                </Card>

                {/* Timetable Schedule with Future Lectures Filter */}
                <Card className="lg:col-span-2 space-y-4 text-xs">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
                    <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2 text-sm">
                      <Clock className="w-4 h-4 text-indigo-600 dark:text-indigo-400" /> Teaching Timetable Schedule
                    </h3>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setShowUpcomingOnly(!showUpcomingOnly)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition flex items-center gap-1.5 border ${
                          showUpcomingOnly
                            ? 'bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border-indigo-300 dark:border-indigo-800'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                        }`}
                      >
                        <Calendar className="w-3.5 h-3.5" />
                        {showUpcomingOnly ? 'Future Lectures Only' : 'Show All Weekly Slots'}
                      </button>
                    </div>
                  </div>

                  {filteredTimetable && filteredTimetable.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="border-b border-slate-200 dark:border-slate-800 text-[11px] text-slate-400 uppercase">
                            <th className="py-2 px-3">Day</th>
                            <th className="py-2 px-3">Period</th>
                            <th className="py-2 px-3">Class & Section</th>
                            <th className="py-2 px-3">Subject</th>
                            <th className="py-2 px-3">Room</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                          {filteredTimetable.map((t, idx) => (
                            <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                              <td className="py-2 px-3 font-bold text-slate-900 dark:text-white">{t.day_of_week}</td>
                              <td className="py-2 px-3 font-mono text-slate-500">Period {t.period_number}</td>
                              <td className="py-2 px-3 text-indigo-600 dark:text-indigo-300 font-semibold">
                                {t.class_name} - {t.section_name}
                              </td>
                              <td className="py-2 px-3 text-slate-700 dark:text-slate-300">{t.subject_name}</td>
                              <td className="py-2 px-3 font-mono text-slate-500">{t.room_number || 'Room 101'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="p-8 text-center text-slate-400 space-y-2 text-xs">
                      <div>
                        {showUpcomingOnly
                          ? 'No remaining future lectures scheduled for this week.'
                          : 'No teaching timetable slots assigned yet.'}
                      </div>
                      {showUpcomingOnly && teacherDetail?.timetable?.length > 0 && (
                        <Button
                          variant="outline"
                          size="xs"
                          onClick={() => setShowUpcomingOnly(false)}
                          className="mt-1"
                        >
                          View Full Weekly Schedule ({teacherDetail.timetable.length} slots)
                        </Button>
                      )}
                    </div>
                  )}
                </Card>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Faculty Directory Table View */
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-wide flex items-center gap-2">
                <Users className="w-6 h-6 text-indigo-600 dark:text-indigo-400" /> Teaching Faculty & Class Coordinators
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Faculty directory, profile details & Class Coordinator assignments
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" icon={FileText} onClick={() => setIsCSVOpen(true)}>
                Bulk CSV Onboard
              </Button>
              <Button variant="outline" size="sm" icon={RefreshCw} onClick={fetchData}>
                Refresh
              </Button>
              <Button variant="primary" size="sm" icon={Plus} onClick={() => setIsOpen(true)}>
                Onboard Faculty
              </Button>
            </div>
          </div>

          <Card>
            <DataTable
              columns={columns}
              data={teachers}
              isLoading={loading}
              searchPlaceholder="Search faculty name or qualification..."
              emptyMessage="No faculty members registered"
            />
          </Card>
        </div>
      )}

      {/* Onboard Teacher Modal */}
      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Onboard New Teaching Faculty">
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Faculty Full Name *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Dr. Sarah Jenkins"
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-slate-900 dark:text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Email Address *</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="sarah.jenkins@school.edu"
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-slate-900 dark:text-white font-mono"
              />
            </div>
            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Initial Password</label>
              <input
                type="password"
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-slate-900 dark:text-white font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Academic Qualification</label>
              <input
                type="text"
                value={formData.qualification}
                onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
                placeholder="Ph.D in Mathematics, B.Ed"
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Experience (Years)</label>
              <input
                type="number"
                value={formData.experienceYears}
                onChange={(e) => setFormData({ ...formData, experienceYears: parseInt(e.target.value) })}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-slate-900 dark:text-white font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Assign Class Coordinator (Optional)</label>
            <select
              value={formData.assignedSectionId}
              onChange={(e) => setFormData({ ...formData, assignedSectionId: e.target.value })}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-slate-900 dark:text-white font-medium"
            >
              <option value="">-- No Class Assigned --</option>
              {allSectionOptions.map((opt) => (
                <option key={opt.sectionId} value={opt.sectionId}>
                  {opt.label} {opt.classTeacherName ? `(Currently: ${opt.classTeacherName})` : ''}
                </option>
              ))}
            </select>
          </div>

          <div className="pt-4 flex justify-end gap-2">
            <Button variant="outline" type="button" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Onboard Teacher
            </Button>
          </div>
        </form>
      </Modal>

      {/* CSV Import Modal */}
      <Modal isOpen={isCSVOpen} onClose={() => setIsCSVOpen(false)} title="Bulk Faculty CSV Onboard">
        <form onSubmit={handleCSVSubmit} className="space-y-4 text-xs">
          <div className="flex items-center justify-between">
            <p className="text-slate-500 dark:text-slate-400">
              Upload a <code className="text-indigo-600 dark:text-indigo-400 font-bold">.csv</code> file or paste rows below.
            </p>
            <Button variant="outline" size="sm" icon={Download} onClick={downloadSampleCSV} type="button">
              Sample CSV
            </Button>
          </div>

          <div className="p-4 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50/50 dark:bg-slate-800/40 text-center">
            <input
              type="file"
              accept=".csv,text/csv"
              onChange={handleFileUpload}
              className="hidden"
              id="teacher-csv-input"
            />
            <label
              htmlFor="teacher-csv-input"
              className="cursor-pointer inline-flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-semibold hover:underline"
            >
              <Upload className="w-4 h-4" /> Click to choose CSV File
            </label>
          </div>

          <div>
            <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
              CSV Raw Text Format: <span className="font-mono text-[10px] text-indigo-600 dark:text-indigo-400">name, email, qualification, experienceYears, phone</span>
            </label>
            <textarea
              rows={4}
              value={csvText}
              onChange={(e) => setCsvText(e.target.value)}
              placeholder="Dr. Sarah Jenkins, sarah.j@school.edu, Ph.D in Mathematics, 8, +1 555-0101"
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 font-mono text-[11px] text-slate-900 dark:text-white"
            />
          </div>

          <div className="pt-4 flex justify-end gap-2">
            <Button variant="outline" type="button" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" isLoading={importing}>
              Import Faculty
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default TeacherManagement;
