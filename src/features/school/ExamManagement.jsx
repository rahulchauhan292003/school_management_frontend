import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { Card } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import DataTable from '../../components/ui/DataTable';
import Modal from '../../components/ui/Modal';
import { FileSpreadsheet, Plus, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';

const ExamManagement = () => {
  const [schedules, setSchedules] = useState([]);
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal state
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [scheduleForm, setScheduleForm] = useState({
    examTypeId: 1,
    classId: 1,
    sectionId: 1,
    subjectId: 1,
    examDate: new Date().toISOString().split('T')[0],
    maxMarks: 100,
  });

  const fetchExams = async () => {
    setLoading(true);
    try {
      const [exRes, cRes, subRes] = await Promise.all([
        api.get('/school/exams/schedules'),
        api.get('/school/classes'),
        api.get('/school/subjects'),
      ]);
      setSchedules(exRes.data);
      setClasses(cRes.data);
      setSubjects(subRes.data);
      if (cRes.data.length > 0) setScheduleForm((prev) => ({ ...prev, classId: cRes.data[0].id }));
      if (subRes.data.length > 0) setScheduleForm((prev) => ({ ...prev, subjectId: subRes.data[0].id }));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExams();
  }, []);

  const handleCreateSchedule = async (e) => {
    e.preventDefault();
    try {
      await api.post('/school/exams/schedules', scheduleForm);
      toast.success('Exam scheduled successfully!');
      setIsScheduleModalOpen(false);
      fetchExams();
    } catch (err) {
      toast.error(err.message || 'Failed to schedule exam');
    }
  };

  const columns = [
    {
      header: 'Exam Type',
      accessor: 'exam_type_name',
      render: (row) => <span className="font-bold text-slate-900 dark:text-white text-xs">{row.exam_type_name}</span>,
    },
    {
      header: 'Class & Section',
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
      header: 'Exam Date',
      accessor: 'exam_date',
      render: (row) => <span className="text-slate-500 font-mono">{new Date(row.exam_date).toLocaleDateString()}</span>,
    },
    {
      header: 'Max Marks',
      accessor: 'max_marks',
      render: (row) => (
        <span className="font-bold font-mono text-emerald-600 dark:text-emerald-400">
          {parseFloat(row.max_marks).toFixed(0)} Marks
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-wide flex items-center gap-2">
            <FileSpreadsheet className="w-6 h-6 text-indigo-600 dark:text-indigo-400" /> Exams & Marksheet Scheduling
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Exam timetable schedules, marks entry matrix & report card history
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="primary" size="sm" icon={Plus} onClick={() => setIsScheduleModalOpen(true)}>
            Schedule New Exam
          </Button>
          <Button variant="outline" size="sm" icon={RefreshCw} onClick={fetchExams}>
            Refresh
          </Button>
        </div>
      </div>

      <Card>
        <DataTable
          columns={columns}
          data={schedules}
          isLoading={loading}
          searchPlaceholder="Search exam or subject..."
          emptyMessage="No scheduled exams found"
        />
      </Card>

      {/* Schedule Exam Modal */}
      <Modal isOpen={isScheduleModalOpen} onClose={() => setIsScheduleModalOpen(false)} title="Schedule New Examination">
        <form onSubmit={handleCreateSchedule} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Exam Type</label>
            <select
              value={scheduleForm.examTypeId}
              onChange={(e) => setScheduleForm({ ...scheduleForm, examTypeId: parseInt(e.target.value) })}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-slate-900 dark:text-white"
            >
              <option value={1}>First Term Examination</option>
              <option value={2}>Mid Term Examination</option>
              <option value={3}>Final Annual Examination</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Target Class</label>
              <select
                value={scheduleForm.classId}
                onChange={(e) => setScheduleForm({ ...scheduleForm, classId: parseInt(e.target.value) })}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-slate-900 dark:text-white"
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
                value={scheduleForm.sectionId}
                onChange={(e) => setScheduleForm({ ...scheduleForm, sectionId: parseInt(e.target.value) })}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-slate-900 dark:text-white"
              >
                <option value={1}>Section A</option>
                <option value={2}>Section B</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Subject</label>
              <select
                value={scheduleForm.subjectId}
                onChange={(e) => setScheduleForm({ ...scheduleForm, subjectId: parseInt(e.target.value) })}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-slate-900 dark:text-white"
              >
                {(subjects.filter((sub) => !sub.class_id || sub.class_id === scheduleForm.classId).length > 0
                  ? subjects.filter((sub) => !sub.class_id || sub.class_id === scheduleForm.classId)
                  : subjects
                ).map((sub) => (
                  <option key={sub.id} value={sub.id}>
                    {sub.name} ({sub.code}){sub.class_name ? ` - ${sub.class_name}` : ''}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Exam Date</label>
              <input
                type="date"
                required
                value={scheduleForm.examDate}
                onChange={(e) => setScheduleForm({ ...scheduleForm, examDate: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Maximum Marks</label>
            <input
              type="number"
              required
              value={scheduleForm.maxMarks}
              onChange={(e) => setScheduleForm({ ...scheduleForm, maxMarks: parseInt(e.target.value) || 100 })}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-slate-900 dark:text-white font-mono"
            />
          </div>

          <div className="pt-4 flex justify-end gap-2">
            <Button variant="outline" type="button" onClick={() => setIsScheduleModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Schedule Exam Now
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ExamManagement;
