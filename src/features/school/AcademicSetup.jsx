import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { Card } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import { Layers, Plus, BookOpen, RefreshCw, UserCheck, Trash2, Tag, BookMarked } from 'lucide-react';
import toast from 'react-hot-toast';

const AcademicSetup = () => {
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [assigningSection, setAssigningSection] = useState(null);

  // Modals state
  const [isClassModalOpen, setIsClassModalOpen] = useState(false);
  const [isSectionModalOpen, setIsSectionModalOpen] = useState(false);
  const [isSubjectModalOpen, setIsSubjectModalOpen] = useState(false);

  // Target class selection for quick modal actions
  const [selectedClassForSection, setSelectedClassForSection] = useState(null);

  // Form states
  const [classForm, setClassForm] = useState({
    name: '',
    code: '',
    sections: ['Section A', 'Section B'],
    subjects: [
      { name: 'Physics', code: 'PHY', type: 'BOTH' },
      { name: 'Chemistry', code: 'CHEM', type: 'BOTH' },
      { name: 'Mathematics', code: 'MATH', type: 'THEORY' },
      { name: 'English Literature', code: 'ENG', type: 'THEORY' },
    ],
  });

  const [sectionForm, setSectionForm] = useState({
    name: '',
    capacity: 40,
    classTeacherId: '',
  });

  const [subjectForm, setSubjectForm] = useState({
    classId: '',
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

  const handleAddSectionToClassForm = () => {
    const nextChar = String.fromCharCode(65 + classForm.sections.length);
    setClassForm((prev) => ({
      ...prev,
      sections: [...prev.sections, `Section ${nextChar}`],
    }));
  };

  const handleRemoveSectionFromClassForm = (index) => {
    if (classForm.sections.length <= 1) {
      toast.error('A class must have at least one section');
      return;
    }
    setClassForm((prev) => ({
      ...prev,
      sections: prev.sections.filter((_, i) => i !== index),
    }));
  };

  const handleAddSubjectToClassForm = () => {
    setClassForm((prev) => ({
      ...prev,
      subjects: [...prev.subjects, { name: '', code: '', type: 'THEORY' }],
    }));
  };

  const handleRemoveSubjectFromClassForm = (index) => {
    setClassForm((prev) => ({
      ...prev,
      subjects: prev.subjects.filter((_, i) => i !== index),
    }));
  };

  const handleCreateClass = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        name: classForm.name,
        code: classForm.code,
        sections: classForm.sections.map((secName) => ({ name: secName, capacity: 40 })),
        subjects: classForm.subjects
          .filter((sub) => sub.name && sub.name.trim())
          .map((sub) => ({
            name: sub.name.trim(),
            code: sub.code ? sub.code : `${classForm.code || 'C'}_${sub.name.substring(0, 3).toUpperCase()}`,
            type: sub.type || 'THEORY',
          })),
      };
      await api.post('/school/classes', payload);
      toast.success('Class created with sections and assigned subjects!');
      setIsClassModalOpen(false);
      setClassForm({
        name: '',
        code: '',
        sections: ['Section A', 'Section B'],
        subjects: [
          { name: 'Physics', code: 'PHY', type: 'BOTH' },
          { name: 'Chemistry', code: 'CHEM', type: 'BOTH' },
          { name: 'Mathematics', code: 'MATH', type: 'THEORY' },
          { name: 'English Literature', code: 'ENG', type: 'THEORY' },
        ],
      });
      fetchData();
    } catch (err) {
      toast.error(err.message || 'Failed to create class');
    }
  };

  const handleOpenAddSectionModal = (cls) => {
    setSelectedClassForSection(cls);
    const nextChar = String.fromCharCode(65 + (cls.sections?.length || 0));
    setSectionForm({
      name: `Section ${nextChar}`,
      capacity: 40,
      classTeacherId: '',
    });
    setIsSectionModalOpen(true);
  };

  const handleCreateSection = async (e) => {
    e.preventDefault();
    if (!selectedClassForSection) return;
    try {
      await api.post(`/school/classes/${selectedClassForSection.id}/sections`, sectionForm);
      toast.success(`Section added to ${selectedClassForSection.name} successfully!`);
      setIsSectionModalOpen(false);
      setSelectedClassForSection(null);
      fetchData();
    } catch (err) {
      toast.error(err.message || 'Failed to add section');
    }
  };

  const handleOpenAddSubjectModal = (targetClassId = '') => {
    setSubjectForm({
      classId: targetClassId || (classes[0] ? classes[0].id : ''),
      name: '',
      code: '',
      type: 'THEORY',
    });
    setIsSubjectModalOpen(true);
  };

  const handleCreateSubject = async (e) => {
    e.preventDefault();
    try {
      await api.post('/school/subjects', subjectForm);
      toast.success('Subject assigned to class curriculum successfully!');
      setIsSubjectModalOpen(false);
      setSubjectForm({ classId: '', name: '', code: '', type: 'THEORY' });
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
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-wide flex items-center gap-2">
            <Layers className="w-6 h-6 text-indigo-600 dark:text-indigo-400" /> Academic Structure Setup
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Manage Academic Classes, Sections, Coordinators & Class-Wise Subject Curriculum
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="primary" size="sm" icon={Plus} onClick={() => setIsClassModalOpen(true)}>
            Add New Class
          </Button>
          <Button variant="secondary" size="sm" icon={BookOpen} onClick={() => handleOpenAddSubjectModal('')}>
            Add Subject
          </Button>
          <Button variant="outline" size="sm" icon={RefreshCw} onClick={fetchData}>
            Refresh
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Classes, Sections & Class Subjects */}
        <Card className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-600 dark:text-indigo-400" /> Configured Classes, Sections & Subjects
            </h3>
            <Badge variant="indigo">{classes.length} Classes</Badge>
          </div>

          {loading ? (
            <div className="p-8 text-center text-indigo-500">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2" /> Loading classes and section curriculum...
            </div>
          ) : classes.length === 0 ? (
            <div className="p-8 text-center text-slate-400 dark:text-slate-500 text-xs">No classes configured</div>
          ) : (
            <div className="space-y-6">
              {classes.map((c) => (
                <div
                  key={c.id}
                  className="bg-slate-50 dark:bg-slate-900/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm"
                >
                  {/* Class Header */}
                  <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800/80 pb-3">
                    <div className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
                      <span>{c.name}</span>
                      <span className="bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 text-xs font-mono px-2.5 py-0.5 rounded-full">
                        {c.code}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="xs"
                        icon={Plus}
                        onClick={() => handleOpenAddSectionModal(c)}
                        className="text-xs text-indigo-600 dark:text-indigo-400"
                      >
                        + Add Section
                      </Button>
                      <Button
                        variant="ghost"
                        size="xs"
                        icon={BookMarked}
                        onClick={() => handleOpenAddSubjectModal(c.id)}
                        className="text-xs text-purple-600 dark:text-purple-400"
                      >
                        + Add Subject
                      </Button>
                      <Badge variant="indigo">Active</Badge>
                    </div>
                  </div>

                  {/* Sections Section */}
                  <div className="space-y-2">
                    <div className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                      <span>Sections ({c.sections?.length || 0})</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {c.sections && c.sections.length > 0 ? (
                        c.sections.map((sec) => (
                          <div
                            key={sec.id}
                            className="p-3 bg-white dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700/70 text-xs space-y-2"
                          >
                            <div className="flex items-center justify-between font-bold text-slate-800 dark:text-slate-200">
                              <span>{sec.name}</span>
                              <span className="text-[10px] text-slate-400 font-normal">Capacity: {sec.capacity}</span>
                            </div>

                            <div className="pt-1">
                              <label className="block text-[10px] font-semibold text-slate-500 dark:text-slate-400 mb-1 flex items-center gap-1">
                                <UserCheck className="w-3 h-3 text-indigo-500" /> Class Teacher / Coordinator
                              </label>
                              <select
                                disabled={assigningSection === sec.id}
                                value={sec.class_teacher_id || ''}
                                onChange={(e) => handleAssignClassTeacher(sec.id, e.target.value)}
                                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 text-slate-800 dark:text-slate-200 text-xs focus:ring-2 focus:ring-indigo-500"
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
                        <div className="text-[11px] text-slate-400 italic py-1">No sections created for this class.</div>
                      )}
                    </div>
                  </div>

                  {/* Class-Wise Subjects Section */}
                  <div className="space-y-2 pt-2 border-t border-slate-200/60 dark:border-slate-800/60">
                    <div className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-purple-600 dark:text-purple-400">
                        <BookOpen className="w-3.5 h-3.5" /> Assigned {c.name} Subjects ({c.subjects?.length || 0})
                      </span>
                    </div>

                    {c.subjects && c.subjects.length > 0 ? (
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {c.subjects.map((sub) => (
                          <div
                            key={sub.id}
                            className="p-2.5 bg-white dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700/70 flex items-center justify-between text-xs"
                          >
                            <div className="truncate pr-1">
                              <div className="font-semibold text-slate-900 dark:text-white text-[11px] truncate">{sub.name}</div>
                              <div className="text-[10px] text-slate-400 font-mono">{sub.code}</div>
                            </div>
                            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-purple-50 dark:bg-purple-950 text-purple-600 dark:text-purple-400 shrink-0">
                              {sub.type}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-3 bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/50 dark:border-amber-900/30 rounded-xl text-[11px] text-amber-700 dark:text-amber-400 flex items-center justify-between">
                        <span>No subjects assigned to {c.name} yet.</span>
                        <Button
                          variant="ghost"
                          size="xs"
                          onClick={() => handleOpenAddSubjectModal(c.id)}
                          className="text-[10px] text-purple-600 underline"
                        >
                          + Add Subject
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Academic Subjects Overview (Right Side Column) */}
        <Card className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-purple-600 dark:text-purple-400" /> All Subjects Curriculum
            </h3>
            <Badge variant="neutral">{subjects.length} Subjects</Badge>
          </div>

          {loading ? (
            <div className="p-8 text-center text-indigo-500">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2" /> Loading curriculum subjects...
            </div>
          ) : subjects.length === 0 ? (
            <div className="p-8 text-center text-slate-400 dark:text-slate-500 text-xs">No subjects configured</div>
          ) : (
            <div className="space-y-3">
              {subjects.map((sub) => (
                <div
                  key={sub.id}
                  className="bg-slate-50 dark:bg-slate-900/60 p-3 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <div className="font-bold text-slate-900 dark:text-white text-xs">{sub.name}</div>
                    <Badge variant="neutral">{sub.type || 'THEORY'}</Badge>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-500 dark:text-slate-400 font-mono">Code: {sub.code}</span>
                    {sub.class_name ? (
                      <span className="bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 font-medium px-2 py-0.5 rounded text-[10px] flex items-center gap-1">
                        <Tag className="w-2.5 h-2.5" /> {sub.class_name}
                      </span>
                    ) : (
                      <span className="text-slate-400 italic text-[10px]">All Classes</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Add Class Modal (With Sections & Subjects Builder) */}
      <Modal isOpen={isClassModalOpen} onClose={() => setIsClassModalOpen(false)} title="Add New Academic Class">
        <form onSubmit={handleCreateClass} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Class Name *</label>
            <input
              type="text"
              required
              value={classForm.name}
              onChange={(e) => setClassForm({ ...classForm, name: e.target.value })}
              placeholder="e.g. Class 12"
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Class Code *</label>
            <input
              type="text"
              required
              value={classForm.code}
              onChange={(e) => setClassForm({ ...classForm, code: e.target.value })}
              placeholder="e.g. C12"
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white font-mono"
            />
          </div>

          {/* Sections Builder */}
          <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between">
              <label className="block text-slate-700 dark:text-slate-300 font-semibold">Class Sections *</label>
              <button
                type="button"
                onClick={handleAddSectionToClassForm}
                className="text-xs text-indigo-600 dark:text-indigo-400 font-medium hover:underline flex items-center gap-1"
              >
                <Plus className="w-3 h-3" /> Add Section
              </button>
            </div>

            <div className="space-y-2">
              {classForm.sections.map((secName, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <input
                    type="text"
                    required
                    value={secName}
                    onChange={(e) => {
                      const updated = [...classForm.sections];
                      updated[idx] = e.target.value;
                      setClassForm({ ...classForm, sections: updated });
                    }}
                    className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 text-slate-900 dark:text-white text-xs"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveSectionFromClassForm(idx)}
                    className="text-slate-400 hover:text-red-500 p-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Subjects Builder */}
          <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between">
              <label className="block text-slate-700 dark:text-slate-300 font-semibold">Assign Class Subjects *</label>
              <button
                type="button"
                onClick={handleAddSubjectToClassForm}
                className="text-xs text-purple-600 dark:text-purple-400 font-medium hover:underline flex items-center gap-1"
              >
                <Plus className="w-3 h-3" /> Add Subject
              </button>
            </div>

            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {classForm.subjects.map((sub, idx) => (
                <div key={idx} className="grid grid-cols-12 gap-2 items-center bg-slate-50 dark:bg-slate-800/80 p-2 rounded-xl border border-slate-200 dark:border-slate-700">
                  <input
                    type="text"
                    required
                    placeholder="Subject Name"
                    value={sub.name}
                    onChange={(e) => {
                      const updated = [...classForm.subjects];
                      updated[idx].name = e.target.value;
                      setClassForm({ ...classForm, subjects: updated });
                    }}
                    className="col-span-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1 text-slate-900 dark:text-white text-xs"
                  />
                  <input
                    type="text"
                    placeholder="Code"
                    value={sub.code}
                    onChange={(e) => {
                      const updated = [...classForm.subjects];
                      updated[idx].code = e.target.value;
                      setClassForm({ ...classForm, subjects: updated });
                    }}
                    className="col-span-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1 text-slate-900 dark:text-white text-xs font-mono"
                  />
                  <select
                    value={sub.type}
                    onChange={(e) => {
                      const updated = [...classForm.subjects];
                      updated[idx].type = e.target.value;
                      setClassForm({ ...classForm, subjects: updated });
                    }}
                    className="col-span-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 text-slate-900 dark:text-white text-xs"
                  >
                    <option value="THEORY">THEORY</option>
                    <option value="PRACTICAL">PRACTICAL</option>
                    <option value="BOTH">BOTH</option>
                  </select>
                  <button
                    type="button"
                    onClick={() => handleRemoveSubjectFromClassForm(idx)}
                    className="col-span-1 text-slate-400 hover:text-red-500 flex justify-center"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-2">
            <Button variant="outline" type="button" onClick={() => setIsClassModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Save Class & Assign Subjects
            </Button>
          </div>
        </form>
      </Modal>

      {/* Add Section Modal (For Existing Class) */}
      <Modal
        isOpen={isSectionModalOpen}
        onClose={() => {
          setIsSectionModalOpen(false);
          setSelectedClassForSection(null);
        }}
        title={`Add Section to ${selectedClassForSection?.name || 'Class'}`}
      >
        <form onSubmit={handleCreateSection} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Section Name *</label>
            <input
              type="text"
              required
              value={sectionForm.name}
              onChange={(e) => setSectionForm({ ...sectionForm, name: e.target.value })}
              placeholder="e.g. Section C"
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Capacity (Max Students)</label>
            <input
              type="number"
              min="1"
              max="200"
              value={sectionForm.capacity}
              onChange={(e) => setSectionForm({ ...sectionForm, capacity: parseInt(e.target.value) || 40 })}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Class Teacher / Coordinator</label>
            <select
              value={sectionForm.classTeacherId}
              onChange={(e) => setSectionForm({ ...sectionForm, classTeacherId: e.target.value })}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-slate-900 dark:text-white text-xs"
            >
              <option value="">-- Select Class Teacher (Optional) --</option>
              {teachers.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name || `Teacher #${t.id}`} ({t.employee_id || 'EMP'})
                </option>
              ))}
            </select>
          </div>

          <div className="pt-4 flex justify-end gap-2">
            <Button
              variant="outline"
              type="button"
              onClick={() => {
                setIsSectionModalOpen(false);
                setSelectedClassForSection(null);
              }}
            >
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Save Section
            </Button>
          </div>
        </form>
      </Modal>

      {/* Add Subject Modal */}
      <Modal isOpen={isSubjectModalOpen} onClose={() => setIsSubjectModalOpen(false)} title="Assign Subject to Class Curriculum">
        <form onSubmit={handleCreateSubject} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Target Academic Class *</label>
            <select
              required
              value={subjectForm.classId}
              onChange={(e) => setSubjectForm({ ...subjectForm, classId: e.target.value })}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-slate-900 dark:text-white font-medium"
            >
              <option value="">-- Select Target Class --</option>
              {classes.map((cls) => (
                <option key={cls.id} value={cls.id}>
                  {cls.name} ({cls.code})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Subject Name *</label>
            <input
              type="text"
              required
              value={subjectForm.name}
              onChange={(e) => setSubjectForm({ ...subjectForm, name: e.target.value })}
              placeholder="e.g. Physics / Biology / Accountancy"
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
                placeholder="e.g. PHY101"
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
              Assign Subject
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AcademicSetup;
