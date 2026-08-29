import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { Card } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import { Layers, Plus, BookOpen, RefreshCw, UserCheck } from 'lucide-react';
import toast from 'react-hot-toast';

const AcademicSetup = () => {
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [assigningSection, setAssigningSection] = useState(null);

  // Modals state
  const [isClassModalOpen, setIsClassModalOpen] = useState(false);
  const [isSubjectModalOpen, setIsSubjectModalOpen] = useState(false);

  // Form states
  const [classForm, setClassForm] = useState({
    name: '',
    code: '',
  });

  const [subjectForm, setSubjectForm] = useState({
    name: '',
    code: '',
    type: 'THEORY',
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [cRes, subRes, tRes] = await Promise.all([
        api.get('/school/classes'),
        api.get('/school/subjects'),
        api.get('/school/teachers').catch(() => ({ data: [] })),
      ]);
      setClasses(cRes.data || []);
      setSubjects(subRes.data || []);
      setTeachers(tRes.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateClass = async (e) => {
    e.preventDefault();
    try {
      await api.post('/school/classes', classForm);
      toast.success('Class created successfully!');
      setIsClassModalOpen(false);
      setClassForm({ name: '', code: '' });
      fetchData();
    } catch (err) {
      toast.error(err.message || 'Failed to create class');
    }
  };

  const handleCreateSubject = async (e) => {
    e.preventDefault();
    try {
      await api.post('/school/subjects', subjectForm);
      toast.success('Subject added to curriculum successfully!');
      setIsSubjectModalOpen(false);
      setSubjectForm({ name: '', code: '', type: 'THEORY' });
      fetchData();
    } catch (err) {
      toast.error(err.message || 'Failed to add subject');
    }
  };

  const handleAssignClassTeacher = async (sectionId, teacherIdVal) => {
    setAssigningSection(sectionId);
    try {
      const teacherId = teacherIdVal ? parseInt(teacherIdVal) : null;
      await api.put(`/school/sections/${sectionId}/class-teacher`, { teacherId });
      toast.success('Class Teacher / Section Coordinator assigned successfully!');
      fetchData();
    } catch (err) {
      toast.error(err.message || 'Failed to assign class teacher');
    } finally {
      setAssigningSection(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-wide flex items-center gap-2">
            <Layers className="w-6 h-6 text-indigo-600 dark:text-indigo-400" /> Academic Structure Setup
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Manage Academic Sessions, Classes, Sections, Section Class Teachers & Subject Curriculum
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="primary" size="sm" icon={Plus} onClick={() => setIsClassModalOpen(true)}>
            Add New Class
          </Button>
          <Button variant="secondary" size="sm" icon={BookOpen} onClick={() => setIsSubjectModalOpen(true)}>
            Add Subject
          </Button>
          <Button variant="outline" size="sm" icon={RefreshCw} onClick={fetchData}>
            Refresh
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Classes & Sections & Class Teacher Assignments */}
        <Card className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-600 dark:text-indigo-400" /> Configured Classes, Sections & Coordinators
            </h3>
            <Badge variant="indigo">{classes.length} Classes</Badge>
          </div>
          {loading ? (
            <div className="p-8 text-center text-indigo-500">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2" /> Loading classes and sections...
            </div>
          ) : classes.length === 0 ? (
            <div className="p-8 text-center text-slate-400 dark:text-slate-500 text-xs">No classes configured</div>
          ) : (
            <div className="space-y-4">
              {classes.map((c) => (
                <div
                  key={c.id}
                  className="bg-slate-50 dark:bg-slate-900/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3"
                >
                  <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800/80 pb-2">
                    <div className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
                      <span>{c.name}</span>
                      <span className="bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 text-[10px] font-mono px-2 py-0.5 rounded-full">
                        {c.code}
                      </span>
                    </div>
                    <Badge variant="indigo">Active</Badge>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    {c.sections && c.sections.length > 0 ? (
                      c.sections.map((sec) => (
                        <div
                          key={sec.id}
                          className="p-3 bg-white dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700/70 text-xs space-y-1.5"
                        >
                          <div className="flex items-center justify-between font-bold text-slate-800 dark:text-slate-200">
                            <span>{sec.name}</span>
                            <span className="text-[10px] text-slate-400 font-normal">Cap: {sec.capacity}</span>
                          </div>

                          <div className="pt-1">
                            <label className="block text-[10px] font-semibold text-slate-500 dark:text-slate-400 mb-1 flex items-center gap-1">
                              <UserCheck className="w-3 h-3 text-indigo-500" /> Class Teacher / Coordinator
                            </label>
                            <select
                              disabled={assigningSection === sec.id}
                              value={sec.class_teacher_id || ''}
                              onChange={(e) => handleAssignClassTeacher(sec.id, e.target.value)}
                              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-800 dark:text-slate-200 text-xs focus:ring-2 focus:ring-indigo-500"
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
                      <div className="text-[11px] text-slate-400 italic">No sections created for this class.</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Curriculum Subjects */}
        <Card className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-purple-600 dark:text-purple-400" /> Academic Subjects
            </h3>
            <Badge variant="neutral">{subjects.length} Subjects</Badge>
          </div>
          {loading ? (
            <div className="p-8 text-center text-indigo-500">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2" /> Loading subjects...
            </div>
          ) : subjects.length === 0 ? (
            <div className="p-8 text-center text-slate-400 dark:text-slate-500 text-xs">No subjects configured</div>
          ) : (
            <div className="space-y-3">
              {subjects.map((sub) => (
                <div
                  key={sub.id}
                  className="bg-slate-50 dark:bg-slate-900/60 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between"
                >
                  <div>
                    <div className="font-bold text-slate-900 dark:text-white text-xs">{sub.name}</div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                      Code: {sub.code}
                    </div>
                  </div>
                  <Badge variant="neutral">{sub.type || 'THEORY'}</Badge>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Add Class Modal */}
      <Modal isOpen={isClassModalOpen} onClose={() => setIsClassModalOpen(false)} title="Add New Academic Class">
        <form onSubmit={handleCreateClass} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Class Name *</label>
            <input
              type="text"
              required
              value={classForm.name}
              onChange={(e) => setClassForm({ ...classForm, name: e.target.value })}
              placeholder="e.g. Class 11"
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Class Code *</label>
            <input
              type="text"
              required
              value={classForm.code}
              onChange={(e) => setClassForm({ ...classForm, code: e.target.value })}
              placeholder="e.g. C11"
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-slate-900 dark:text-white font-mono"
            />
          </div>

          <div className="pt-4 flex justify-end gap-2">
            <Button variant="outline" type="button" onClick={() => setIsClassModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Save Class
            </Button>
          </div>
        </form>
      </Modal>

      {/* Add Subject Modal */}
      <Modal isOpen={isSubjectModalOpen} onClose={() => setIsSubjectModalOpen(false)} title="Add Subject to Curriculum">
        <form onSubmit={handleCreateSubject} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Subject Name *</label>
            <input
              type="text"
              required
              value={subjectForm.name}
              onChange={(e) => setSubjectForm({ ...subjectForm, name: e.target.value })}
              placeholder="e.g. Biology"
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-slate-900 dark:text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Subject Code *</label>
              <input
                type="text"
                required
                value={subjectForm.code}
                onChange={(e) => setSubjectForm({ ...subjectForm, code: e.target.value })}
                placeholder="e.g. BIO101"
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-slate-900 dark:text-white font-mono"
              />
            </div>
            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Subject Type</label>
              <select
                value={subjectForm.type}
                onChange={(e) => setSubjectForm({ ...subjectForm, type: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-slate-900 dark:text-white"
              >
                <option value="THEORY">THEORY</option>
                <option value="PRACTICAL">PRACTICAL</option>
                <option value="BOTH">BOTH</option>
              </select>
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-2">
            <Button variant="outline" type="button" onClick={() => setIsSubjectModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="secondary" type="submit">
              Add Subject
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AcademicSetup;
