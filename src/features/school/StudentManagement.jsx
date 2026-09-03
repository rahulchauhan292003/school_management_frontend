import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Card } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import DataTable from '../../components/ui/DataTable';
import Modal from '../../components/ui/Modal';
import {
  GraduationCap,
  Plus,
  Upload,
  RefreshCw,
  Download,
  FileText,
  ArrowLeft,
  Save,
  User,
  Users,
  Calendar,
  Phone,
  MapPin,
  Heart,
  DollarSign,
  UserCheck,
  Edit,
  CheckCircle,
  XCircle,
  Clock,
  X,
  Lock,
} from 'lucide-react';
import toast from 'react-hot-toast';

const StudentManagement = () => {
  const { user } = useAuth();
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [parentsList, setParentsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedClass, setSelectedClass] = useState('');

  // Student Detail & Update state
  const [selectedStudentId, setSelectedStudentId] = useState(null);
  const [studentDetail, setStudentDetail] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [savingStudent, setSavingStudent] = useState(false);

  // Edit Mode state (Default true for instant editability)
  const [isEditing, setIsEditing] = useState(true);

  // Edit Form State
  const [editForm, setEditForm] = useState({
    name: '',
    admissionNumber: '',
    dob: '',
    gender: 'MALE',
    bloodGroup: '',
    address: '',
    phone: '',
    parentId: '',
    classId: '',
    sectionId: '',
    rollNo: '',
    status: 'ACTIVE',
  });

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isPromoteOpen, setIsPromoteOpen] = useState(false);
  const [isCSVOpen, setIsCSVOpen] = useState(false);
  const [importing, setImporting] = useState(false);
  const [failedRecords, setFailedRecords] = useState([]);

  // Form states for creation
  const [formData, setFormData] = useState({
    name: '',
    admissionNumber: '',
    dob: '2010-01-01',
    gender: 'MALE',
    classId: 1,
    sectionId: 1,
    phone: '',
    email: '',
    fatherName: '',
    motherName: '',
    parentPhone: '',
    parentEmail: '',
  });

  const [promoData, setPromoData] = useState({
    fromSessionId: 1,
    toSessionId: 2,
    targetClassId: 2,
    targetSectionId: 1,
    selectedStudentIds: [],
  });

  const [csvText, setCsvText] = useState('');

  // Robust Role Evaluation
  const roleStr = (user?.roleName || user?.role_name || '').toLowerCase();
  const userType = (user?.userType || '').toUpperCase();
  const isAdmin =
    userType === 'SUPER_ADMIN' ||
    roleStr.includes('admin') ||
    roleStr.includes('administrator') ||
    !user; // Fallback to true if user object is not populated

  const canEditStudent =
    isAdmin ||
    roleStr.includes('principal') ||
    roleStr.includes('accountant') ||
    roleStr.includes('vice principal') ||
    roleStr.includes('teacher');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [stRes, cRes, pRes] = await Promise.all([
        api.get(`/school/students?search=${search}&classId=${selectedClass}`),
        api.get('/school/classes'),
        api.get('/school/parents').catch(() => ({ data: [] })),
      ]);
      setStudents(stRes.data || []);
      setClasses(cRes.data || []);
      setParentsList(pRes.data || []);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load students directory');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [search, selectedClass]);

  // Fetch Student Detail View
  const fetchStudentDetail = async (id) => {
    setLoadingDetail(true);
    setIsEditing(true); // Always enable editing for authorized user
    try {
      const res = await api.get(`/school/students/${id}`);
      const data = res.data;
      setStudentDetail(data);
      setEditForm({
        name: data.name || '',
        admissionNumber: data.admission_number || '',
        dob: data.dob ? data.dob.split('T')[0] : '',
        gender: data.gender || 'MALE',
        bloodGroup: data.blood_group || '',
        address: data.address || '',
        phone: data.phone || '',
        parentId: data.parent_id ? String(data.parent_id) : '',
        classId: data.class_id ? String(data.class_id) : '',
        sectionId: data.section_id ? String(data.section_id) : '',
        rollNo: data.roll_no ? String(data.roll_no) : '',
        status: data.status || 'ACTIVE',
      });
    } catch (err) {
      console.error(err);
      toast.error('Failed to load student detail profile');
    } finally {
      setLoadingDetail(false);
    }
  };

  useEffect(() => {
    if (selectedStudentId) {
      fetchStudentDetail(selectedStudentId);
    }
  }, [selectedStudentId]);

  // Handle Student Profile Update
  const handleUpdateStudent = async (e) => {
    e.preventDefault();
    if (!selectedStudentId) return;

    setSavingStudent(true);
    try {
      const payload = {
        ...editForm,
        parentId: editForm.parentId ? parseInt(editForm.parentId) : null,
        classId: editForm.classId ? parseInt(editForm.classId) : null,
        sectionId: editForm.sectionId ? parseInt(editForm.sectionId) : null,
        rollNo: editForm.rollNo ? parseInt(editForm.rollNo) : null,
      };

      await api.put(`/school/students/${selectedStudentId}`, payload);
      toast.success('Student profile updated successfully!');
      await fetchStudentDetail(selectedStudentId);
      fetchData();
    } catch (err) {
      console.error(err);
      toast.error(err.message || 'Failed to update student profile');
    } finally {
      setSavingStudent(false);
    }
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/school/students', formData);
      toast.success('Student registered successfully!');
      setIsCreateOpen(false);
      fetchData();
    } catch (err) {
      toast.error(err.message || 'Failed to create student');
    }
  };

  const handlePromoteSubmit = async (e) => {
    e.preventDefault();
    if (promoData.selectedStudentIds.length === 0) {
      toast.error('Please select at least one student for promotion');
      return;
    }
    try {
      const promotions = promoData.selectedStudentIds.map((id) => ({
        studentId: id,
        targetClassId: promoData.targetClassId,
        targetSectionId: promoData.targetSectionId,
      }));

      await api.post('/school/students/promote', {
        fromSessionId: promoData.fromSessionId,
        toSessionId: promoData.toSessionId,
        promotions,
      });

      toast.success(`Promoted ${promotions.length} students successfully!`);
      setIsPromoteOpen(false);
      fetchData();
    } catch (err) {
      console.error(err);
      toast.error(err.message || 'Promotion failed');
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

  const [targetImportClass, setTargetImportClass] = useState(1);
  const [targetImportSection, setTargetImportSection] = useState(1);

  // Sync default target import class/section when classes list updates
  useEffect(() => {
    if (classes && classes.length > 0) {
      const classExists = classes.some((c) => c.id === parseInt(targetImportClass));
      if (!classExists) {
        setTargetImportClass(classes[0].id);
        if (classes[0].sections && classes[0].sections.length > 0) {
          setTargetImportSection(classes[0].sections[0].id);
        }
      }
    }
  }, [classes]);

  const downloadSampleCSV = () => {
    const sampleContent =
      'admissionNumber,name,gender,dob,phone,email,fatherName,motherName,parentPhone,parentEmail\n' +
      'ADM-2026-101,Aarav Sharma,MALE,2012-04-15,+91 9876543001,aarav.sharma@example.com,Rajesh Sharma,Sunita Sharma,+91 9876543001,rajesh.sharma@example.com\n' +
      'ADM-2026-102,Ananya Patel,FEMALE,2012-08-22,+91 9876543002,ananya.patel@example.com,Vikram Patel,Meena Patel,+91 9876543002,\n' +
      'ADM-2026-103,Rohan Verma,MALE,2011-11-05,+91 9876543003,rohan.verma@example.com,Sanjay Verma,Kavita Verma,+91 9876543003,sanjay.verma@example.com\n';

    const blob = new Blob([sampleContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'sample_students_import.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Sample Student CSV downloaded!');
  };

  const downloadFailedCSV = () => {
    if (!failedRecords || failedRecords.length === 0) return;
    let csvContent = 'admissionNumber,name,gender,dob,phone,email,fatherName,motherName,parentPhone,parentEmail,failureReason\n';
    failedRecords.forEach((item) => {
      const line = [
        item.admissionNumber || '',
        item.name || '',
        item.gender || '',
        item.dob || '',
        item.phone || '',
        item.email || '',
        item.fatherName || '',
        item.motherName || '',
        item.parentPhone || '',
        item.parentEmail || '',
        `"${(item.error || 'Incomplete record').replace(/"/g, '""')}"`,
      ].join(',');
      csvContent += line + '\n';
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `failed_students_to_fix_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Failed records CSV downloaded! Fix missing values and re-import.');
  };

  const handleCSVSubmit = async (e) => {
    e.preventDefault();
    if (!csvText.trim()) {
      toast.error('Please select a CSV file or paste CSV content');
      return;
    }

    setImporting(true);
    setFailedRecords([]);
    try {
      const lines = csvText.trim().split('\n');
      const csvStudents = lines
        .map((line) => {
          const parts = line.split(',').map((s) => s.trim());
          if (
            parts.length < 2 ||
            parts[0].toLowerCase() === 'admissionnumber' ||
            parts[0].toLowerCase() === 'admission_number'
          )
            return null;
          const [admissionNumber, name, gender, dob, phone, email, fatherName, motherName, parentPhone, parentEmail] = parts;
          return {
            admissionNumber,
            name,
            gender: gender ? gender.toUpperCase() : '',
            dob: dob || '',
            phone: phone || '',
            email: email || '',
            fatherName: fatherName || '',
            motherName: motherName || '',
            parentPhone: parentPhone || '',
            parentEmail: parentEmail || '',
            classId: parseInt(targetImportClass),
            sectionId: parseInt(targetImportSection),
          };
        })
        .filter(Boolean);

      if (csvStudents.length === 0) {
        toast.error('No valid student rows found in CSV');
        return;
      }

      const res = await api.post('/school/students/bulk-csv', { students: csvStudents });
      const stats = res.data;

      if (stats.errors && stats.errors.length > 0) {
        setFailedRecords(stats.errors);
        toast.error(
          `Import summary: ${stats.successCount || 0} imported, ${stats.failedCount || stats.errors.length} failed. Download failed CSV for details.`
        );
      } else {
        setFailedRecords([]);
        toast.success(
          `Bulk Import Complete: ${stats.successCount || csvStudents.length} imported successfully!`
        );
        setIsCSVOpen(false);
        setCsvText('');
      }
      fetchData();
    } catch (err) {
      console.error(err);
      toast.error(err.message || 'CSV Import failed');
    } finally {
      setImporting(false);
    }
  };

  // Find sections for bulk import selected class
  const importClassObj = classes.find((c) => c.id === parseInt(targetImportClass));
  const importSections = importClassObj?.sections || [];

  // Find sections for edit form selected class
  const editClassObj = classes.find((c) => c.id === parseInt(editForm.classId));
  const editSections = editClassObj?.sections || [];

  const columns = [
    {
      header: 'Admission No.',
      accessor: 'admission_number',
      render: (row) => (
        <code className="bg-slate-100 dark:bg-slate-800 text-indigo-600 dark:text-indigo-300 border border-slate-200 dark:border-slate-700 px-2 py-0.5 rounded-md font-mono text-[11px] font-bold">
          {row.admission_number}
        </code>
      ),
    },
    {
      header: 'Student Name',
      accessor: 'name',
      render: (row) => (
        <button
          onClick={() => setSelectedStudentId(row.id)}
          className="font-bold text-slate-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 text-xs text-left hover:underline"
        >
          <div>{row.name}</div>
          <div className="text-[10px] text-slate-400 font-mono">DOB: {row.dob ? new Date(row.dob).toLocaleDateString() : 'N/A'}</div>
        </button>
      ),
    },
    {
      header: 'Gender',
      accessor: 'gender',
      render: (row) => <Badge variant="neutral">{row.gender}</Badge>,
    },
    {
      header: 'Class / Section',
      accessor: 'class_name',
      render: (row) => (
        <div className="font-semibold text-slate-700 dark:text-slate-300">
          {row.class_name ? `${row.class_name} (${row.section_name})` : 'Unassigned'}
        </div>
      ),
    },
    {
      header: 'Roll No.',
      accessor: 'roll_number',
      render: (row) => <span className="font-mono text-slate-500 font-semibold">{row.roll_no || row.roll_number || 'N/A'}</span>,
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (row) => <Badge variant={row.status === 'ACTIVE' ? 'success' : 'neutral'}>{row.status}</Badge>,
    },
    {
      header: 'Actions',
      accessor: 'id',
      render: (row) => (
        <Button
          variant="outline"
          size="xs"
          icon={Edit}
          onClick={() => setSelectedStudentId(row.id)}
        >
          Edit Profile
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* If a student is selected, render Student Detail View */}
      {selectedStudentId ? (
        <div className="space-y-6">
          {/* Top Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  setSelectedStudentId(null);
                  setStudentDetail(null);
                }}
                className="p-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl text-slate-700 dark:text-slate-200 transition"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-wide flex items-center gap-2">
                  <span>Student Profile Details</span>
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Update student profile, admission number, enrollment details, and parent linkage
                </p>
              </div>
            </div>

            <Button variant="outline" size="sm" icon={RefreshCw} onClick={() => fetchStudentDetail(selectedStudentId)}>
              Refresh Profile
            </Button>
          </div>

          {loadingDetail || !studentDetail ? (
            <div className="p-16 text-center text-indigo-500">
              <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-3" />
              <span>Loading student detail profile...</span>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Profile Card Banner */}
              <Card className="p-6 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl border-indigo-900">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-indigo-600 text-white font-bold text-2xl rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-600/40">
                      {studentDetail.name?.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-2xl font-bold">{studentDetail.name}</h3>
                        <Badge variant={studentDetail.status === 'ACTIVE' ? 'success' : 'neutral'}>
                          {studentDetail.status}
                        </Badge>
                      </div>
                      <div className="text-xs text-indigo-200 mt-1 flex flex-wrap items-center gap-4">
                        <span className="font-mono bg-indigo-900/60 px-2 py-0.5 rounded text-indigo-300">
                          {studentDetail.admission_number}
                        </span>
                        <span>Class: {studentDetail.class_name} - {studentDetail.section_name}</span>
                        <span>Roll: #{studentDetail.roll_no || 'N/A'}</span>
                        <span>Gender: {studentDetail.gender}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 border-t md:border-t-0 md:border-l border-indigo-800/80 pt-4 md:pt-0 md:pl-6 text-xs">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-indigo-300">Parent / Guardian</span>
                      <div className="font-bold text-white text-sm mt-0.5">
                        {studentDetail.parent_name || 'No Parent Linked'}
                      </div>
                      <div className="text-[11px] text-indigo-200">{studentDetail.parent_phone || ''}</div>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Grid: Edit Form & Stats */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Editable Profile Form */}
                <Card className="lg:col-span-2 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                    <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2 text-sm">
                      <User className="w-4 h-4 text-indigo-600 dark:text-indigo-400" /> Student Profile & Enrollment Info
                    </h3>
                    {canEditStudent && (
                      <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold bg-emerald-50 dark:bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
                        Editable Mode Enabled
                      </span>
                    )}
                  </div>

                  <form onSubmit={handleUpdateStudent} className="space-y-4 text-xs">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Student Full Name *</label>
                        <input
                          type="text"
                          required
                          disabled={!canEditStudent}
                          value={editForm.name}
                          onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                          className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1 flex items-center justify-between">
                          <span>Admission Number *</span>
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
                          value={editForm.admissionNumber}
                          onChange={(e) => setEditForm({ ...editForm, admissionNumber: e.target.value })}
                          className={`w-full border rounded-xl px-3.5 py-2 font-mono text-slate-900 dark:text-white ${
                            !isAdmin
                              ? 'bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800 cursor-not-allowed text-slate-500'
                              : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 focus:ring-2 focus:ring-indigo-500 font-bold'
                          }`}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Date of Birth</label>
                        <input
                          type="date"
                          disabled={!canEditStudent}
                          value={editForm.dob}
                          onChange={(e) => setEditForm({ ...editForm, dob: e.target.value })}
                          className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2 font-mono text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Gender</label>
                        <select
                          disabled={!canEditStudent}
                          value={editForm.gender}
                          onChange={(e) => setEditForm({ ...editForm, gender: e.target.value })}
                          className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                        >
                          <option value="MALE">MALE</option>
                          <option value="FEMALE">FEMALE</option>
                          <option value="OTHER">OTHER</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Blood Group</label>
                        <input
                          type="text"
                          disabled={!canEditStudent}
                          placeholder="e.g. O+"
                          value={editForm.bloodGroup}
                          onChange={(e) => setEditForm({ ...editForm, bloodGroup: e.target.value })}
                          className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Academic Class</label>
                        <select
                          disabled={!canEditStudent}
                          value={editForm.classId}
                          onChange={(e) => setEditForm({ ...editForm, classId: e.target.value })}
                          className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
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
                          disabled={!canEditStudent}
                          value={editForm.sectionId}
                          onChange={(e) => setEditForm({ ...editForm, sectionId: e.target.value })}
                          className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                        >
                          {editSections.map((sec) => (
                            <option key={sec.id} value={sec.id}>
                              {sec.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Roll Number</label>
                        <input
                          type="number"
                          disabled={!canEditStudent}
                          value={editForm.rollNo}
                          onChange={(e) => setEditForm({ ...editForm, rollNo: e.target.value })}
                          className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2 font-mono text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Linked Parent / Guardian</label>
                        <select
                          disabled={!canEditStudent}
                          value={editForm.parentId}
                          onChange={(e) => setEditForm({ ...editForm, parentId: e.target.value })}
                          className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                        >
                          <option value="">-- No Parent Linked --</option>
                          {parentsList.map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.name} ({p.phone})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Student Status</label>
                        <select
                          disabled={!canEditStudent}
                          value={editForm.status}
                          onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                          className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2 font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                        >
                          <option value="ACTIVE">ACTIVE</option>
                          <option value="PROMOTED">PROMOTED</option>
                          <option value="LEFT">LEFT</option>
                          <option value="GRADUATED">GRADUATED</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Residential Address</label>
                      <textarea
                        rows={2}
                        disabled={!canEditStudent}
                        value={editForm.address}
                        onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                        className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-3 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>

                    {canEditStudent && (
                      <div className="pt-2 flex justify-end gap-2">
                        <Button variant="primary" size="md" icon={Save} isLoading={savingStudent} type="submit">
                          Save Student Profile Details
                        </Button>
                      </div>
                    )}
                  </form>
                </Card>

                {/* Sidebar: Fee History & Attendance Overview */}
                <div className="space-y-6">
                  {/* Recent Fee Payments Card */}
                  <Card className="space-y-4 text-xs">
                    <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2 text-sm">
                      <DollarSign className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> Recent Fee Payments
                    </h3>

                    {studentDetail.payments && studentDetail.payments.length > 0 ? (
                      <div className="space-y-2">
                        {studentDetail.payments.map((pm) => (
                          <div
                            key={pm.id}
                            className="bg-slate-50 dark:bg-slate-900/60 p-3 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between"
                          >
                            <div>
                              <div className="font-bold text-slate-900 dark:text-white">{pm.category_name}</div>
                              <div className="text-[10px] text-slate-400 font-mono">Receipt: {pm.receipt_number}</div>
                            </div>
                            <div className="text-right">
                              <div className="font-extrabold font-mono text-emerald-600 dark:text-emerald-400">
                                ${parseFloat(pm.amount_paid).toFixed(2)}
                              </div>
                              <span className="text-[10px] text-slate-400">{pm.payment_date ? pm.payment_date.split('T')[0] : ''}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-6 text-center text-slate-400 italic">No fee payment records logged yet.</div>
                    )}
                  </Card>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Full Directory View */
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-wide flex items-center gap-2">
                <GraduationCap className="w-6 h-6 text-indigo-600 dark:text-indigo-400" /> Student Information Management
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Student admissions, class & section enrollments, edits & CSV imports
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" icon={FileText} onClick={() => setIsCSVOpen(true)}>
                Bulk CSV Import
              </Button>
              <Button variant="secondary" size="sm" icon={Upload} onClick={() => setIsPromoteOpen(true)}>
                Promote Session
              </Button>
              <Button variant="primary" size="sm" icon={Plus} onClick={() => setIsCreateOpen(true)}>
                Register Student
              </Button>
            </div>
          </div>

          <Card className="space-y-4">
            <div className="flex flex-wrap items-center gap-4 text-xs">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Search student name or admission number..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-slate-900 dark:text-white"
                />
              </div>
              <div className="w-48">
                <select
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-slate-900 dark:text-white"
                >
                  <option value="">All Classes</option>
                  {classes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <DataTable
              columns={columns}
              data={students}
              isLoading={loading}
              searchPlaceholder="Search students..."
              emptyMessage="No student records found"
            />
          </Card>
        </div>
      )}

      {/* Register Student Modal */}
      <Modal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} title="Register New Student Admission">
        <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs">
          
          {/* Section 1: Student Information */}
          <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-700/80 space-y-3">
            <h4 className="font-bold text-indigo-900 dark:text-indigo-300 text-xs flex items-center gap-2 border-b border-slate-200 dark:border-slate-700 pb-2">
              <User className="w-4 h-4 text-indigo-600 dark:text-indigo-400" /> 1. Student Personal & Academic Details
            </h4>

            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Student Full Name *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. David Miller"
                className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-slate-900 dark:text-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Admission Number *</label>
                <input
                  type="text"
                  required
                  value={formData.admissionNumber}
                  onChange={(e) => setFormData({ ...formData, admissionNumber: e.target.value })}
                  placeholder="ADM-2026-001"
                  className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-slate-900 dark:text-white font-mono"
                />
              </div>
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Date of Birth *</label>
                <input
                  type="date"
                  required
                  value={formData.dob}
                  onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                  className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-slate-900 dark:text-white font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Gender *</label>
                <select
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                  className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-slate-900 dark:text-white"
                >
                  <option value="MALE">MALE</option>
                  <option value="FEMALE">FEMALE</option>
                  <option value="OTHER">OTHER</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Class *</label>
                <select
                  value={formData.classId}
                  onChange={(e) => setFormData({ ...formData, classId: parseInt(e.target.value) })}
                  className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-slate-900 dark:text-white"
                >
                  {classes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Section *</label>
                <select
                  value={formData.sectionId}
                  onChange={(e) => setFormData({ ...formData, sectionId: parseInt(e.target.value) })}
                  className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-slate-900 dark:text-white"
                >
                  <option value={1}>Section A</option>
                  <option value={2}>Section B</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Student Phone *</label>
                <input
                  type="text"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+91 9876543210"
                  className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-slate-900 dark:text-white font-mono"
                />
              </div>
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                  Student Email <span className="font-normal text-slate-400">(Optional)</span>
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="student@example.com"
                  className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-slate-900 dark:text-white font-mono"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Parent Information */}
          <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-700/80 space-y-3">
            <h4 className="font-bold text-indigo-900 dark:text-indigo-300 text-xs flex items-center gap-2 border-b border-slate-200 dark:border-slate-700 pb-2">
              <Users className="w-4 h-4 text-indigo-600 dark:text-indigo-400" /> 2. Parent / Guardian Information
            </h4>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Father's Name *</label>
                <input
                  type="text"
                  required
                  value={formData.fatherName}
                  onChange={(e) => setFormData({ ...formData, fatherName: e.target.value })}
                  placeholder="e.g. Robert Miller"
                  className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Mother's Name</label>
                <input
                  type="text"
                  value={formData.motherName}
                  onChange={(e) => setFormData({ ...formData, motherName: e.target.value })}
                  placeholder="e.g. Sarah Miller"
                  className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Parent Phone *</label>
                <input
                  type="text"
                  required
                  value={formData.parentPhone}
                  onChange={(e) => setFormData({ ...formData, parentPhone: e.target.value })}
                  placeholder="+91 9876543210"
                  className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-slate-900 dark:text-white font-mono"
                />
              </div>
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                  Parent Email <span className="font-normal text-slate-400">(Optional)</span>
                </label>
                <input
                  type="email"
                  value={formData.parentEmail}
                  onChange={(e) => setFormData({ ...formData, parentEmail: e.target.value })}
                  placeholder="parent@example.com"
                  className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-slate-900 dark:text-white font-mono"
                />
              </div>
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-2">
            <Button variant="outline" type="button" onClick={() => setIsCreateOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Register Student
            </Button>
          </div>
        </form>
      </Modal>

      {/* CSV Import Modal */}
      <Modal isOpen={isCSVOpen} onClose={() => setIsCSVOpen(false)} title="Bulk Student CSV Import">
        <form onSubmit={handleCSVSubmit} className="space-y-4 text-xs">
          <div className="flex items-center justify-between">
            <p className="text-slate-500 dark:text-slate-400">
              Upload a <code className="text-indigo-600 dark:text-indigo-400 font-bold">.csv</code> file or paste rows below.
            </p>
            <Button variant="outline" size="sm" icon={Download} onClick={downloadSampleCSV} type="button">
              Sample CSV
            </Button>
          </div>

          {/* Class & Section Selector */}
          <div className="grid grid-cols-2 gap-4 bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700">
            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                Target Class *
              </label>
              <select
                value={targetImportClass}
                onChange={(e) => {
                  const cId = parseInt(e.target.value);
                  setTargetImportClass(cId);
                  const selClass = classes.find((c) => c.id === cId);
                  if (selClass?.sections?.length > 0) {
                    setTargetImportSection(selClass.sections[0].id);
                  }
                }}
                className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 font-medium"
              >
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                Target Section *
              </label>
              <select
                value={targetImportSection}
                onChange={(e) => setTargetImportSection(parseInt(e.target.value))}
                className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 font-medium"
              >
                {importSections.length > 0 ? (
                  importSections.map((sec) => (
                    <option key={sec.id} value={sec.id}>
                      {sec.name}
                    </option>
                  ))
                ) : (
                  <option value={1}>Section A</option>
                )}
              </select>
            </div>
          </div>

          <div className="p-4 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50/50 dark:bg-slate-800/40 text-center">
            <input
              type="file"
              accept=".csv,text/csv"
              onChange={handleFileUpload}
              className="hidden"
              id="student-csv-input"
            />
            <label
              htmlFor="student-csv-input"
              className="cursor-pointer inline-flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-semibold hover:underline"
            >
              <Upload className="w-4 h-4" /> Click to choose CSV File
            </label>
          </div>

          {failedRecords.length > 0 && (
            <div className="p-3 bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-800 rounded-xl flex items-center justify-between text-xs">
              <div className="text-red-700 dark:text-red-300">
                <span className="font-bold">{failedRecords.length} record(s) failed validation/import.</span>
                <p className="text-[11px] opacity-80">Click button to download failed rows with detailed reasons.</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                icon={Download}
                onClick={downloadFailedCSV}
                type="button"
                className="border-red-300 text-red-700 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-900/50"
              >
                Failed CSV
              </Button>
            </div>
          )}

          <div>
            <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
              CSV Raw Text Format: <span className="font-mono text-[10px] text-indigo-600 dark:text-indigo-400">admissionNumber, name, gender, dob, phone, email, fatherName, motherName, parentPhone, parentEmail</span>
            </label>
            <textarea
              rows={4}
              value={csvText}
              onChange={(e) => setCsvText(e.target.value)}
              placeholder="ADM-2026-010, John Doe, MALE, 2012-05-10, +91 9876543210, john@example.com, Robert Doe, Sarah Doe, +91 9876543210, robert.doe@example.com"
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 font-mono text-[11px] text-slate-900 dark:text-white"
            />
          </div>

          <div className="pt-4 flex justify-end gap-2">
            <Button variant="outline" type="button" onClick={() => setIsCSVOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" isLoading={importing}>
              Import Records
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default StudentManagement;
