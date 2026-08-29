import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Card } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import DataTable from '../../components/ui/DataTable';
import {
  Clock,
  BookOpen,
  Plus,
  RefreshCw,
  Calendar,
  MapPin,
  AlertTriangle,
  UserCheck,
  ShieldCheck,
  Edit,
  Trash2,
  Coffee,
  CheckCircle,
  X,
  Lock,
  Save,
  Sun,
  Sparkles,
  Zap,
} from 'lucide-react';
import toast from 'react-hot-toast';

const TimetableHomeworkManager = () => {
  const { user } = useAuth();
  const [timetable, setTimetable] = useState([]);
  const [homeworkList, setHomeworkList] = useState([]);
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedClass, setSelectedClass] = useState(1);
  const [selectedSection, setSelectedSection] = useState(1);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  // Dynamic Periods Rows State
  const [periods, setPeriods] = useState([
    { id: 'p1', num: 1, name: 'Period #1', startTime: '08:00', endTime: '08:45', isRecess: false },
    { id: 'p2', num: 2, name: 'Period #2', startTime: '08:45', endTime: '09:30', isRecess: false },
    { id: 'p3', num: 3, name: 'Period #3', startTime: '09:30', endTime: '10:15', isRecess: false },
    { id: 'p4', num: 4, name: 'Period #4', startTime: '10:15', endTime: '11:00', isRecess: false },
    { id: 'recess', num: 'RECESS', name: 'Recess & Lunch Break', startTime: '11:00', endTime: '11:30', isRecess: true },
    { id: 'p5', num: 5, name: 'Period #5', startTime: '11:30', endTime: '12:15', isRecess: false },
    { id: 'p6', num: 6, name: 'Period #6', startTime: '12:15', endTime: '01:00', isRecess: false },
    { id: 'p7', num: 7, name: 'Period #7', startTime: '01:00', endTime: '01:45', isRecess: false },
    { id: 'p8', num: 8, name: 'Period #8', startTime: '01:45', endTime: '02:30', isRecess: false },
  ]);

  // Holidays state per day of week
  const [holidays, setHolidays] = useState({
    MONDAY: false,
    TUESDAY: false,
    WEDNESDAY: false,
    THURSDAY: false,
    FRIDAY: false,
    SATURDAY: false,
    SUNDAY: true,
  });

  // Modals state
  const [isTimetableModalOpen, setIsTimetableModalOpen] = useState(false);
  const [isHomeworkModalOpen, setIsHomeworkModalOpen] = useState(false);
  const [isSubstituteModalOpen, setIsSubstituteModalOpen] = useState(false);
  const [isAddPeriodModalOpen, setIsAddPeriodModalOpen] = useState(false);
  const [isEditPeriodModalOpen, setIsEditPeriodModalOpen] = useState(false);

  const [activeSlotForSub, setActiveSlotForSub] = useState(null);
  const [substituteTeacherId, setSubstituteTeacherId] = useState('');
  const [savingSlot, setSavingSlot] = useState(false);

  // Period Row Edit state
  const [editingPeriod, setEditingPeriod] = useState(null);
  const [newPeriodForm, setNewPeriodForm] = useState({
    name: 'Period #9',
    num: 9,
    startTime: '02:30',
    endTime: '03:15',
    isRecess: false,
  });

  // Form states for Timetable slot editing
  const [slotForm, setSlotForm] = useState({
    id: null,
    classId: 1,
    sectionId: 1,
    subjectId: 1,
    teacherId: 1,
    dayOfWeek: 'MONDAY',
    periodNumber: 1,
    roomNo: 'Room 101',
    slotType: 'REGULAR', // REGULAR, RECESS, ASSEMBLY, LIBRARY, HOLIDAY
  });

  const [hwForm, setHwForm] = useState({
    classId: 1,
    sectionId: 1,
    subjectId: 1,
    teacherId: 1,
    title: '',
    description: '',
    submissionDate: new Date().toISOString().split('T')[0],
  });

  const DAYS = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];

  // Find currently selected class & section details
  const selectedClassObj = classes.find((c) => c.id === selectedClass);
  const selectedSectionObj = selectedClassObj?.sections?.find((s) => s.id === selectedSection);
  const classCoordinatorName = selectedSectionObj?.class_teacher_name;
  const classCoordinatorTeacherId = selectedSectionObj?.class_teacher_id;

  // Robust Permission Checks
  const roleStr = (user?.roleName || user?.role_name || '').toLowerCase();
  const userType = (user?.userType || '').toUpperCase();

  const isAdminOrPrincipal =
    userType === 'SUPER_ADMIN' ||
    roleStr.includes('admin') ||
    roleStr.includes('administrator') ||
    roleStr.includes('principal') ||
    roleStr.includes('vice principal') ||
    !user;

  // Class Coordinator for this section has permission
  const isClassCoordinator =
    user?.id && classCoordinatorTeacherId && user.id === classCoordinatorTeacherId;

  const canUpdateTimetable = isAdminOrPrincipal || isClassCoordinator;

  const fetchData = async () => {
    setLoading(true);
    try {
      const [ttRes, hwRes, cRes, subRes, tRes] = await Promise.all([
        api.get(`/school/timetable?classId=${selectedClass}&sectionId=${selectedSection}&date=${selectedDate}`),
        api.get('/school/homework'),
        api.get('/school/classes'),
        api.get(`/school/subjects${selectedClass ? `?class_id=${selectedClass}` : ''}`),
        api.get('/school/teachers'),
      ]);
      setTimetable(ttRes.data || []);
      setHomeworkList(hwRes.data || []);
      setClasses(cRes.data || []);
      setSubjects(subRes.data || []);
      setTeachers(tRes.data || []);

      if (subRes.data && subRes.data.length > 0) {
        setSlotForm((prev) => ({ ...prev, subjectId: subRes.data[0].id }));
        setHwForm((prev) => ({ ...prev, subjectId: subRes.data[0].id }));
      }
      if (tRes.data && tRes.data.length > 0) {
        setSlotForm((prev) => ({ ...prev, teacherId: tRes.data[0].id }));
        setHwForm((prev) => ({ ...prev, teacherId: tRes.data[0].id }));
        setSubstituteTeacherId(tRes.data[0].id);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load timetable and homework data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedClass, selectedSection, selectedDate]);

  // Toggle Holiday status for a day column
  const toggleHoliday = (day) => {
    if (!canUpdateTimetable) {
      toast.error('Only Admins, Principals, and Class Coordinators can set holidays');
      return;
    }

    setHolidays((prev) => {
      const updated = { ...prev, [day]: !prev[day] };
      toast.success(`${day} is now marked as ${updated[day] ? '🎉 SCHOOL HOLIDAY' : 'Regular Class Day'}`);
      return updated;
    });
  };

  // Add a New Period Row
  const handleAddPeriodRow = (e) => {
    e.preventDefault();
    if (!canUpdateTimetable) return;

    const newId = `p_${Date.now()}`;
    const newPeriod = {
      id: newId,
      num: typeof newPeriodForm.num === 'number' ? newPeriodForm.num : newPeriodForm.name,
      name: newPeriodForm.name || `Period #${periods.length + 1}`,
      startTime: newPeriodForm.startTime,
      endTime: newPeriodForm.endTime,
      isRecess: newPeriodForm.isRecess,
    };

    setPeriods((prev) => [...prev, newPeriod]);
    toast.success(`Added ${newPeriod.name} (${newPeriod.startTime} - ${newPeriod.endTime})`);
    setIsAddPeriodModalOpen(false);
  };

  // Edit Period Timings
  const handleSavePeriodTiming = (e) => {
    e.preventDefault();
    if (!editingPeriod) return;

    setPeriods((prev) =>
      prev.map((p) => (p.id === editingPeriod.id ? { ...p, ...editingPeriod } : p))
    );
    toast.success(`Updated timings for ${editingPeriod.name}`);
    setIsEditPeriodModalOpen(false);
    setEditingPeriod(null);
  };

  // Remove a Period Row
  const handleRemovePeriodRow = (periodId, periodName) => {
    if (!canUpdateTimetable) return;
    if (!window.confirm(`Are you sure you want to remove ${periodName} row from the timetable?`)) return;

    setPeriods((prev) => prev.filter((p) => p.id !== periodId));
    toast.success(`Removed ${periodName} row from timetable`);
  };

  // Open Timetable Slot Editor Modal for specific day and period
  const getDisplaySubjects = () => {
    return subjects.filter((s) => s.class_id === parseInt(selectedClass));
  };

  const openSlotEditor = (day, periodNum, existingSlot = null) => {
    if (!canUpdateTimetable) {
      toast.error('Only Admins, Principals, and Section Class Coordinators can edit this timetable');
      return;
    }

    const availableSubs = getDisplaySubjects();
    setSlotForm({
      id: existingSlot ? existingSlot.id : null,
      classId: selectedClass,
      sectionId: selectedSection,
      subjectId: existingSlot?.subject_id || (availableSubs[0] ? availableSubs[0].id : 1),
      teacherId: existingSlot?.teacher_id || (teachers[0] ? teachers[0].id : 1),
      dayOfWeek: day,
      periodNumber: typeof periodNum === 'number' ? periodNum : 1,
      roomNo: existingSlot?.room_no || 'Room 101',
      slotType: existingSlot?.room_no === 'RECESS' ? 'RECESS' : 'REGULAR',
    });
    setIsTimetableModalOpen(true);
  };

  const handleCreateSlot = async (e) => {
    e.preventDefault();
    setSavingSlot(true);
    try {
      await api.post('/school/timetable', {
        ...slotForm,
        classId: selectedClass,
        sectionId: selectedSection,
      });
      toast.success(`Period #${slotForm.periodNumber} on ${slotForm.dayOfWeek} updated!`);
      setIsTimetableModalOpen(false);
      fetchData();
    } catch (err) {
      toast.error(err.message || 'Failed to update timetable slot');
    } finally {
      setSavingSlot(false);
    }
  };

  const handleDeleteSlot = async (slotId) => {
    if (!canUpdateTimetable) return;
    if (!window.confirm('Are you sure you want to remove this timetable slot?')) return;

    try {
      await api.delete(`/school/timetable/${slotId}`);
      toast.success('Timetable period slot removed');
      fetchData();
    } catch (err) {
      toast.error(err.message || 'Failed to remove slot');
    }
  };

  const handleCreateHomework = async (e) => {
    e.preventDefault();
    try {
      await api.post('/school/homework', {
        ...hwForm,
        classId: selectedClass,
        sectionId: selectedSection,
      });
      toast.success('Homework assigned successfully!');
      setIsHomeworkModalOpen(false);
      setHwForm((prev) => ({ ...prev, title: '', description: '' }));
      fetchData();
    } catch (err) {
      toast.error(err.message || 'Failed to assign homework');
    }
  };

  const handleAssignSubstitute = async (e) => {
    e.preventDefault();
    if (!activeSlotForSub) return;
    try {
      await api.post('/school/timetable/substitute', {
        timetableId: activeSlotForSub.id,
        substituteTeacherId: parseInt(substituteTeacherId),
        date: selectedDate,
        remarks: 'Arrangement for absent teacher',
      });
      toast.success('Substitute teacher arrangement assigned successfully!');
      setIsSubstituteModalOpen(false);
      fetchData();
    } catch (err) {
      toast.error(err.message || 'Failed to assign substitute');
    }
  };

  const openSubstituteModal = (slot) => {
    setActiveSlotForSub(slot);
    const available = teachers.find((t) => t.id !== slot.teacher_id);
    if (available) setSubstituteTeacherId(available.id);
    setIsSubstituteModalOpen(true);
  };

  // Find slot for day and period in timetable array
  const getSlot = (day, periodNum) => {
    return timetable.find(
      (t) => (t.day_of_week || '').toUpperCase() === day && (t.period_number === periodNum || String(t.period_number) === String(periodNum))
    );
  };

  const homeworkColumns = [
    {
      header: 'Homework Title',
      accessor: 'title',
      render: (row) => (
        <div>
          <div className="font-bold text-slate-900 dark:text-white text-xs">{row.title}</div>
          <div className="text-[10px] text-slate-400">{row.description}</div>
        </div>
      ),
    },
    {
      header: 'Class / Section',
      accessor: 'class_name',
      render: (row) => (
        <span className="font-semibold text-slate-700 dark:text-slate-300">
          {row.class_name} ({row.section_name})
        </span>
      ),
    },
    {
      header: 'Subject',
      accessor: 'subject_name',
      render: (row) => <Badge variant="indigo">{row.subject_name}</Badge>,
    },
    {
      header: 'Teacher',
      accessor: 'teacher_name',
      render: (row) => <span className="text-slate-600 dark:text-slate-400">{row.teacher_name}</span>,
    },
    {
      header: 'Due Date',
      accessor: 'submission_date',
      render: (row) => (
        <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">
          {new Date(row.submission_date).toLocaleDateString()}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-wide flex items-center gap-2">
            <Clock className="w-6 h-6 text-indigo-600 dark:text-indigo-400" /> Interactive Class Timetable Grid
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Custom period rows, start/end timings, recess breaks, holiday markers & class coordinator authorization
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {canUpdateTimetable && (
            <Button variant="primary" size="sm" icon={Plus} onClick={() => setIsAddPeriodModalOpen(true)}>
              Add Period Row
            </Button>
          )}
          <Button variant="secondary" size="sm" icon={BookOpen} onClick={() => setIsHomeworkModalOpen(true)}>
            Assign Homework
          </Button>
          <Button variant="outline" size="sm" icon={RefreshCw} onClick={fetchData}>
            Refresh
          </Button>
        </div>
      </div>

      <div className="space-y-6">
        {/* Class Timetable Weekly Matrix Card */}
        <Card className="space-y-4">
          {/* Header Controls: Class, Section, Date & Class Coordinator Badge */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-indigo-50 dark:bg-indigo-950/80 border border-indigo-200 dark:border-indigo-800 rounded-xl text-indigo-600 dark:text-indigo-400">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Weekly Timetable Matrix
                  </h3>
                  {canUpdateTimetable ? (
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold bg-emerald-50 dark:bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
                      <Sparkles className="w-3 h-3" /> Full Edit Mode Unlocked
                    </span>
                  ) : (
                    <span className="text-[10px] text-slate-500 flex items-center gap-1">
                      <Lock className="w-3 h-3 text-amber-500" /> Read-Only View
                    </span>
                  )}
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-2">
                  <span>Class Coordinator:</span>
                  {classCoordinatorName ? (
                    <span className="font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5" /> {classCoordinatorName}
                    </span>
                  ) : (
                    <span className="italic text-slate-400">Unassigned</span>
                  )}
                </div>
              </div>
            </div>

            {/* Selectors */}
            <div className="flex flex-wrap items-center gap-3 text-xs">
              <div>
                <label className="text-[10px] text-slate-400 block font-bold uppercase mb-0.5">Academic Class</label>
                <select
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(parseInt(e.target.value))}
                  className="bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-1.5 text-slate-900 dark:text-white font-bold"
                >
                  {classes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] text-slate-400 block font-bold uppercase mb-0.5">Section</label>
                <select
                  value={selectedSection}
                  onChange={(e) => setSelectedSection(parseInt(e.target.value))}
                  className="bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-1.5 text-slate-900 dark:text-white font-bold"
                >
                  <option value={1}>Section A</option>
                  <option value={2}>Section B</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] text-slate-400 block font-bold uppercase mb-0.5">Date / Session</label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-1.5 text-slate-900 dark:text-white font-mono"
                />
              </div>
            </div>
          </div>

          {/* Timetable Weekly Matrix Table */}
          <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-100 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 text-[11px] text-slate-600 dark:text-slate-300 font-bold uppercase tracking-wider">
                  <th className="p-3 w-40 border-r border-slate-200 dark:border-slate-700">Period / Timings</th>
                  {DAYS.map((day) => {
                    const isDayHoliday = holidays[day];
                    return (
                      <th
                        key={day}
                        className={`p-3 text-center border-r border-slate-200 dark:border-slate-700 min-w-[160px] relative ${
                          isDayHoliday ? 'bg-rose-100/70 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300' : ''
                        }`}
                      >
                        <div className="flex items-center justify-center gap-1.5">
                          <span>{day}</span>
                          {isDayHoliday && <Sun className="w-3.5 h-3.5 text-rose-500 animate-spin" />}
                        </div>

                        {canUpdateTimetable && (
                          <button
                            type="button"
                            onClick={() => toggleHoliday(day)}
                            className={`mt-1 text-[10px] px-2 py-0.5 rounded-md font-semibold transition border ${
                              isDayHoliday
                                ? 'bg-rose-600 text-white border-rose-700 hover:bg-rose-700'
                                : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 border-slate-300 dark:border-slate-600 hover:bg-slate-300'
                            }`}
                          >
                            {isDayHoliday ? '🎉 Holiday Set' : '+ Set Holiday'}
                          </button>
                        )}
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {periods.map((period) => {
                  // Recess Row
                  if (period.isRecess) {
                    return (
                      <tr key={period.id} className="bg-amber-50/80 dark:bg-amber-950/40 border-y-2 border-amber-300 dark:border-amber-800">
                        <td className="p-3 font-bold text-amber-800 dark:text-amber-300 border-r border-amber-200 dark:border-amber-800">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5">
                              <Coffee className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                              <span>{period.name}</span>
                            </div>
                            {canUpdateTimetable && (
                              <button
                                onClick={() => {
                                  setEditingPeriod(period);
                                  setIsEditPeriodModalOpen(true);
                                }}
                                className="text-amber-700 dark:text-amber-300 hover:underline p-1"
                                title="Edit Timings"
                              >
                                <Edit className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                          <div className="text-[10px] font-mono text-amber-700 dark:text-amber-400 mt-0.5">
                            {period.startTime} - {period.endTime}
                          </div>
                        </td>
                        <td colSpan={6} className="p-3 text-center font-extrabold text-amber-800 dark:text-amber-200 uppercase tracking-widest text-xs">
                          ☕ Recess & Lunch Break ({period.startTime} - {period.endTime})
                        </td>
                      </tr>
                    );
                  }

                  return (
                    <tr key={period.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-900/40 transition">
                      {/* Period Header Column */}
                      <td className="p-3 font-bold text-slate-900 dark:text-white bg-slate-50/50 dark:bg-slate-900/50 border-r border-slate-200 dark:border-slate-800">
                        <div className="flex items-center justify-between">
                          <span className="text-sm">{period.name}</span>
                          {canUpdateTimetable && (
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => {
                                  setEditingPeriod(period);
                                  setIsEditPeriodModalOpen(true);
                                }}
                                className="p-1 text-slate-400 hover:text-indigo-600"
                                title="Edit Timings"
                              >
                                <Edit className="w-3 h-3" />
                              </button>
                              <button
                                onClick={() => handleRemovePeriodRow(period.id, period.name)}
                                className="p-1 text-slate-400 hover:text-rose-600"
                                title="Remove Row"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          )}
                        </div>
                        <div className="text-[10px] font-mono text-slate-400 mt-0.5">
                          {period.startTime} - {period.endTime}
                        </div>
                      </td>

                      {/* Day Columns */}
                      {DAYS.map((day) => {
                        const isDayHoliday = holidays[day];
                        const slot = getSlot(day, period.num);

                        // Render Holiday Column Cell
                        if (isDayHoliday) {
                          return (
                            <td
                              key={day}
                              className="p-2 border-r border-slate-200 dark:border-slate-800 bg-rose-50/50 dark:bg-rose-950/20 text-center align-middle"
                            >
                              <div className="p-3 border border-dashed border-rose-300 dark:border-rose-800 rounded-xl text-rose-700 dark:text-rose-300 font-bold text-[11px]">
                                🎉 School Holiday
                                <div className="text-[10px] text-rose-500 font-normal">No Classes</div>
                              </div>
                            </td>
                          );
                        }

                        return (
                          <td
                            key={day}
                            className="p-2 border-r border-slate-200 dark:border-slate-800 align-top relative group"
                          >
                            {slot ? (
                              <div className="bg-white dark:bg-slate-800 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1.5 shadow-sm hover:border-indigo-400 transition">
                                <div className="flex items-center justify-between">
                                  <Badge variant="indigo">{slot.subject_name}</Badge>
                                  {canUpdateTimetable && (
                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
                                      <button
                                        onClick={() => openSlotEditor(day, period.num, slot)}
                                        className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded text-slate-500 hover:text-indigo-600"
                                        title="Edit Slot"
                                      >
                                        <Edit className="w-3 h-3" />
                                      </button>
                                      <button
                                        onClick={() => handleDeleteSlot(slot.id)}
                                        className="p-1 hover:bg-rose-100 dark:hover:bg-rose-950 rounded text-slate-500 hover:text-rose-600"
                                        title="Remove Slot"
                                      >
                                        <Trash2 className="w-3 h-3" />
                                      </button>
                                    </div>
                                  )}
                                </div>

                                {/* Teacher info & Absence status */}
                                <div>
                                  {slot.is_teacher_absent ? (
                                    <div className="space-y-1 pt-0.5">
                                      <div className="flex items-center gap-1 text-rose-600 dark:text-rose-400 font-bold text-[11px]">
                                        <AlertTriangle className="w-3 h-3" />
                                        <span className="line-through">{slot.teacher_name}</span>
                                      </div>
                                      {slot.substitute_teacher_name ? (
                                        <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                                          <UserCheck className="w-3 h-3" /> {slot.substitute_teacher_name}
                                        </div>
                                      ) : (
                                        <button
                                          onClick={() => openSubstituteModal(slot)}
                                          className="text-[10px] bg-rose-100 dark:bg-rose-950 hover:bg-rose-200 text-rose-700 font-bold px-1.5 py-0.5 rounded border border-rose-300"
                                        >
                                          + Assign Substitute
                                        </button>
                                      )}
                                    </div>
                                  ) : (
                                    <div className="text-[11px] font-semibold text-slate-800 dark:text-slate-200">
                                      {slot.teacher_name}
                                    </div>
                                  )}
                                </div>

                                <div className="text-[10px] font-mono text-slate-400 flex items-center gap-1 pt-1 border-t border-slate-100 dark:border-slate-700/60">
                                  <MapPin className="w-3 h-3 text-indigo-500" /> {slot.room_no || 'Room 101'}
                                </div>
                              </div>
                            ) : (
                              /* Empty Cell */
                              <div className="h-full min-h-[70px] flex items-center justify-center">
                                {canUpdateTimetable ? (
                                  <button
                                    onClick={() => openSlotEditor(day, period.num)}
                                    className="w-full h-full p-3 border-2 border-dashed border-slate-200 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-600 rounded-xl text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 flex flex-col items-center justify-center gap-1 transition"
                                  >
                                    <Plus className="w-4 h-4" />
                                    <span className="text-[10px] font-semibold">Add Slot</span>
                                  </button>
                                ) : (
                                  <span className="text-[10px] text-slate-300 dark:text-slate-700 italic">Unassigned</span>
                                )}
                              </div>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Homework Assignments List */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-purple-600 dark:text-purple-400" /> Daily Homework Assignments
            </h3>
            <Badge variant="indigo">{homeworkList.length} Active Assignments</Badge>
          </div>

          <DataTable
            columns={homeworkColumns}
            data={homeworkList}
            isLoading={loading}
            searchPlaceholder="Search homework title or subject..."
            emptyMessage="No active homework assignments recorded"
          />
        </Card>
      </div>

      {/* Add Period Row Modal */}
      <Modal isOpen={isAddPeriodModalOpen} onClose={() => setIsAddPeriodModalOpen(false)} title="Add New Timetable Period Row">
        <form onSubmit={handleAddPeriodRow} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Period Display Name *</label>
            <input
              type="text"
              required
              value={newPeriodForm.name}
              onChange={(e) => setNewPeriodForm({ ...newPeriodForm, name: e.target.value })}
              placeholder="e.g. Period #9 or Assembly / Zero Period"
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-slate-900 dark:text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Start Time *</label>
              <input
                type="time"
                required
                value={newPeriodForm.startTime}
                onChange={(e) => setNewPeriodForm({ ...newPeriodForm, startTime: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-slate-900 dark:text-white font-mono"
              />
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">End Time *</label>
              <input
                type="time"
                required
                value={newPeriodForm.endTime}
                onChange={(e) => setNewPeriodForm({ ...newPeriodForm, endTime: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-slate-900 dark:text-white font-mono"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="recessCheck"
              checked={newPeriodForm.isRecess}
              onChange={(e) => setNewPeriodForm({ ...newPeriodForm, isRecess: e.target.checked })}
              className="w-4 h-4 text-indigo-600 rounded"
            />
            <label htmlFor="recessCheck" className="text-slate-700 dark:text-slate-300 font-semibold cursor-pointer">
              Mark as Recess / Lunch Break Row
            </label>
          </div>

          <div className="pt-4 flex justify-end gap-2">
            <Button variant="outline" type="button" onClick={() => setIsAddPeriodModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Add Period Row
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit Period Timings Modal */}
      <Modal isOpen={isEditPeriodModalOpen} onClose={() => setIsEditPeriodModalOpen(false)} title="Edit Period Name & Timings">
        {editingPeriod && (
          <form onSubmit={handleSavePeriodTiming} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Period Display Name *</label>
              <input
                type="text"
                required
                value={editingPeriod.name}
                onChange={(e) => setEditingPeriod({ ...editingPeriod, name: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-slate-900 dark:text-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Start Time *</label>
                <input
                  type="time"
                  required
                  value={editingPeriod.startTime}
                  onChange={(e) => setEditingPeriod({ ...editingPeriod, startTime: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-slate-900 dark:text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">End Time *</label>
                <input
                  type="time"
                  required
                  value={editingPeriod.endTime}
                  onChange={(e) => setEditingPeriod({ ...editingPeriod, endTime: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-slate-900 dark:text-white font-mono"
                />
              </div>
            </div>

            <div className="pt-4 flex justify-end gap-2">
              <Button variant="outline" type="button" onClick={() => setIsEditPeriodModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" type="submit" icon={Save}>
                Save Timings
              </Button>
            </div>
          </form>
        )}
      </Modal>

      {/* Assign Substitute Modal */}
      <Modal isOpen={isSubstituteModalOpen} onClose={() => setIsSubstituteModalOpen(false)} title="Assign Substitute Arrangement Teacher">
        <form onSubmit={handleAssignSubstitute} className="space-y-4 text-xs">
          {activeSlotForSub && (
            <div className="p-3 bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200 rounded-xl flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>
                <strong>{activeSlotForSub.teacher_name}</strong> is marked <strong>ABSENT</strong> on {selectedDate} for Period #{activeSlotForSub.period_number} ({activeSlotForSub.subject_name}).
              </span>
            </div>
          )}

          <div>
            <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Select Available Substitute Teacher *</label>
            <select
              required
              value={substituteTeacherId}
              onChange={(e) => setSubstituteTeacherId(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-slate-900 dark:text-white"
            >
              {teachers
                .filter((t) => t.id !== activeSlotForSub?.teacher_id)
                .map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} ({t.qualification || 'Faculty'})
                  </option>
                ))}
            </select>
          </div>

          <div className="pt-4 flex justify-end gap-2">
            <Button variant="outline" type="button" onClick={() => setIsSubstituteModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Assign Arrangement
            </Button>
          </div>
        </form>
      </Modal>

      {/* Configure Timetable Slot Modal */}
      <Modal
        isOpen={isTimetableModalOpen}
        onClose={() => setIsTimetableModalOpen(false)}
        title={`Configure Timetable Slot: ${slotForm.dayOfWeek} (Period #${slotForm.periodNumber})`}
      >
        <form onSubmit={handleCreateSlot} className="space-y-4 text-xs">
          <div className="p-3 bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 rounded-xl text-indigo-900 dark:text-indigo-200 flex items-center justify-between font-semibold">
            <span>Class: {selectedClassObj?.name} - Section {selectedSection === 1 ? 'A' : 'B'}</span>
            <Badge variant="indigo">{slotForm.dayOfWeek} (Period #{slotForm.periodNumber})</Badge>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Subject *</label>
              <select
                required
                value={slotForm.subjectId}
                onChange={(e) => setSlotForm({ ...slotForm, subjectId: parseInt(e.target.value) })}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-slate-900 dark:text-white font-semibold"
              >
                {getDisplaySubjects().length > 0 ? (
                  getDisplaySubjects().map((sub) => (
                    <option key={sub.id} value={sub.id}>
                      {sub.name} ({sub.code})
                    </option>
                  ))
                ) : (
                  <option value="">-- No subjects assigned to this class --</option>
                )}
              </select>
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Assigned Teacher *</label>
              <select
                required
                value={slotForm.teacherId}
                onChange={(e) => setSlotForm({ ...slotForm, teacherId: parseInt(e.target.value) })}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-slate-900 dark:text-white font-semibold"
              >
                {teachers.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Classroom / Lab Room Number</label>
            <input
              type="text"
              required
              value={slotForm.roomNo}
              onChange={(e) => setSlotForm({ ...slotForm, roomNo: e.target.value })}
              placeholder="e.g. Room 101"
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-slate-900 dark:text-white font-mono"
            />
          </div>

          <div className="pt-4 flex justify-end gap-2">
            <Button variant="outline" type="button" onClick={() => setIsTimetableModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" isLoading={savingSlot} icon={Save}>
              Save Period Slot
            </Button>
          </div>
        </form>
      </Modal>

      {/* Assign Homework Modal */}
      <Modal isOpen={isHomeworkModalOpen} onClose={() => setIsHomeworkModalOpen(false)} title="Assign New Homework">
        <form onSubmit={handleCreateHomework} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Homework Title *</label>
            <input
              type="text"
              required
              value={hwForm.title}
              onChange={(e) => setHwForm({ ...hwForm, title: e.target.value })}
              placeholder="e.g. Chapter 4 Quadratic Equations Practice"
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-slate-900 dark:text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Subject</label>
              <select
                value={hwForm.subjectId}
                onChange={(e) => setHwForm({ ...hwForm, subjectId: parseInt(e.target.value) })}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-slate-900 dark:text-white"
              >
                {getDisplaySubjects().length > 0 ? (
                  getDisplaySubjects().map((sub) => (
                    <option key={sub.id} value={sub.id}>
                      {sub.name} ({sub.code})
                    </option>
                  ))
                ) : (
                  <option value="">-- No subjects assigned to this class --</option>
                )}
              </select>
            </div>
            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Submission Due Date</label>
              <input
                type="date"
                required
                value={hwForm.submissionDate}
                onChange={(e) => setHwForm({ ...hwForm, submissionDate: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-slate-900 dark:text-white font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Homework Instructions / Description</label>
            <textarea
              rows="3"
              value={hwForm.description}
              onChange={(e) => setHwForm({ ...hwForm, description: e.target.value })}
              placeholder="Solve exercises 1 to 15 from Chapter 4 textbook..."
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-slate-900 dark:text-white"
            />
          </div>

          <div className="pt-4 flex justify-end gap-2">
            <Button variant="outline" type="button" onClick={() => setIsHomeworkModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Assign Homework
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default TimetableHomeworkManager;
