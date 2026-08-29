import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Card } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import DataTable from '../../components/ui/DataTable';
import {
  UserCheck,
  RefreshCw,
  FileText,
  Download,
  Upload,
  ArrowLeft,
  Save,
  Mail,
  Phone,
  Briefcase,
  MapPin,
  Users,
  GraduationCap,
  Edit,
  X,
} from 'lucide-react';
import toast from 'react-hot-toast';

const ParentManagement = () => {
  const { user } = useAuth();
  const [parents, setParents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCSVOpen, setIsCSVOpen] = useState(false);
  const [csvText, setCsvText] = useState('');
  const [importing, setImporting] = useState(false);

  // Parent Detail & Update State
  const [selectedParentId, setSelectedParentId] = useState(null);
  const [parentDetail, setParentDetail] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [savingParent, setSavingParent] = useState(false);

  // Edit Form State
  const [editForm, setEditForm] = useState({
    name: '',
    relation: 'Father',
    occupation: '',
    phone: '',
    email: '',
    address: '',
  });

  // Robust Role Evaluation
  const roleStr = (user?.roleName || user?.role_name || '').toLowerCase();
  const userType = (user?.userType || '').toUpperCase();
  const isAdmin =
    userType === 'SUPER_ADMIN' ||
    roleStr.includes('admin') ||
    roleStr.includes('administrator') ||
    !user;

  const canEditParent =
    isAdmin ||
    roleStr.includes('principal') ||
    roleStr.includes('accountant') ||
    roleStr.includes('vice principal');

  const fetchParents = async () => {
    setLoading(true);
    try {
      const res = await api.get('/school/parents');
      setParents(res.data || []);
    } catch (err) {
      console.error(err);
      toast.error(err.message || 'Failed to fetch parents directory');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchParents();
  }, []);

  // Fetch Parent Detail Profile
  const fetchParentDetail = async (id) => {
    setLoadingDetail(true);
    try {
      const res = await api.get(`/school/parents/${id}`);
      const data = res.data;
      setParentDetail(data);
      setEditForm({
        name: data.name || '',
        relation: data.relation || 'Father',
        occupation: data.occupation || '',
        phone: data.phone || '',
        email: data.email || '',
        address: data.address || '',
      });
    } catch (err) {
      console.error(err);
      toast.error('Failed to load parent detail profile');
    } finally {
      setLoadingDetail(false);
    }
  };

  useEffect(() => {
    if (selectedParentId) {
      fetchParentDetail(selectedParentId);
    }
  }, [selectedParentId]);

  // Handle Parent Update Form Submit
  const handleUpdateParent = async (e) => {
    e.preventDefault();
    if (!selectedParentId) return;

    setSavingParent(true);
    try {
      await api.put(`/school/parents/${selectedParentId}`, editForm);
      toast.success('Parent details updated successfully!');
      await fetchParentDetail(selectedParentId);
      fetchParents();
    } catch (err) {
      console.error(err);
      toast.error(err.message || 'Failed to update parent details');
    } finally {
      setSavingParent(false);
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
      'name,email,phone,relation\n' +
      'Robert Smith,robert.smith@email.com,+1 555-0192,FATHER\n' +
      'Eleanor Jones,eleanor.j@email.com,+1 555-0184,MOTHER\n' +
      'David Miller,david.m@email.com,+1 555-0177,GUARDIAN\n';

    const blob = new Blob([sampleContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'sample_parents_import.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Sample Parent CSV downloaded!');
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
          const [name, email, phone, relation] = parts;
          await api.post('/school/parents', {
            name,
            email: email || `${name.toLowerCase().replace(/\s+/g, '')}@parent.com`,
            phone: phone || '+1 555-0000',
            relation: relation || 'GUARDIAN',
          });
          successCount++;
        }
      }

      toast.success(`Successfully registered ${successCount} parent records!`);
      setIsCSVOpen(false);
      setCsvText('');
      fetchParents();
    } catch (err) {
      console.error(err);
      toast.error(err.message || 'Parent CSV import failed');
    } finally {
      setImporting(false);
    }
  };

  const columns = [
    {
      header: 'Parent Name',
      accessor: 'name',
      render: (row) => (
        <button
          onClick={() => setSelectedParentId(row.id)}
          className="font-bold text-slate-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 text-xs text-left hover:underline"
        >
          {row.name}
        </button>
      ),
    },
    {
      header: 'Relation',
      accessor: 'relation',
      render: (row) => <Badge variant="indigo">{row.relation}</Badge>,
    },
    {
      header: 'Phone Number',
      accessor: 'phone',
      render: (row) => <span className="font-mono text-slate-700 dark:text-slate-300">{row.phone || 'N/A'}</span>,
    },
    {
      header: 'Email Address',
      accessor: 'email',
      render: (row) => <span className="text-slate-600 dark:text-slate-400">{row.email || 'N/A'}</span>,
    },
    {
      header: 'Linked Students',
      accessor: 'children',
      render: (row) => (
        <div className="flex flex-wrap gap-1">
          {row.children && row.children.length > 0 ? (
            row.children.map((c) => (
              <code
                key={c.id}
                className="bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 px-2 py-0.5 rounded text-[10px] font-medium"
              >
                {c.name} ({c.admission_number})
              </code>
            ))
          ) : (
            <span className="text-slate-400">None linked</span>
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
          onClick={() => setSelectedParentId(row.id)}
        >
          Edit Profile
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Render Parent Detail View when selectedParentId is active */}
      {selectedParentId ? (
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  setSelectedParentId(null);
                  setParentDetail(null);
                }}
                className="p-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl text-slate-700 dark:text-slate-200 transition"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-wide flex items-center gap-2">
                  <span>Parent Profile & Linked Students</span>
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  View and edit parent profile, contact information, and linked children
                </p>
              </div>
            </div>

            <Button variant="outline" size="sm" icon={RefreshCw} onClick={() => fetchParentDetail(selectedParentId)}>
              Refresh Profile
            </Button>
          </div>

          {loadingDetail || !parentDetail ? (
            <div className="p-16 text-center text-indigo-500">
              <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-3" />
              <span>Loading parent detail profile...</span>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Profile Card Header Banner */}
              <Card className="p-6 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl border-indigo-900">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-indigo-600 text-white font-bold text-2xl rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-600/40">
                      {parentDetail.name?.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-2xl font-bold">{parentDetail.name}</h3>
                        <Badge variant="indigo">{parentDetail.relation || 'Parent'}</Badge>
                      </div>
                      <div className="text-xs text-indigo-200 mt-1 flex flex-wrap items-center gap-4">
                        <span className="flex items-center gap-1">
                          <Mail className="w-3.5 h-3.5 text-indigo-400" /> {parentDetail.email || 'N/A'}
                        </span>
                        <span className="flex items-center gap-1">
                          <Phone className="w-3.5 h-3.5 text-indigo-400" /> {parentDetail.phone || 'N/A'}
                        </span>
                        {parentDetail.occupation && (
                          <span className="flex items-center gap-1">
                            <Briefcase className="w-3.5 h-3.5 text-indigo-400" /> {parentDetail.occupation}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 border-t md:border-t-0 md:border-l border-indigo-800/80 pt-4 md:pt-0 md:pl-6 text-xs">
                    <div className="text-center">
                      <div className="text-2xl font-extrabold text-emerald-400">
                        {parentDetail.children ? parentDetail.children.length : 0}
                      </div>
                      <span className="text-[10px] uppercase font-bold text-indigo-200">Linked Students</span>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Grid: Editable Profile & Linked Students */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Parent Details Form */}
                <Card className="lg:col-span-2 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                    <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2 text-sm">
                      <UserCheck className="w-4 h-4 text-indigo-600 dark:text-indigo-400" /> Parent Information & Contact Details
                    </h3>
                    {canEditParent && (
                      <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold bg-emerald-50 dark:bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
                        Editable Mode Enabled
                      </span>
                    )}
                  </div>

                  <form onSubmit={handleUpdateParent} className="space-y-4 text-xs">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Parent Full Name *</label>
                        <input
                          type="text"
                          required
                          disabled={!canEditParent}
                          value={editForm.name}
                          onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                          className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Relation to Student *</label>
                        <select
                          disabled={!canEditParent}
                          value={editForm.relation}
                          onChange={(e) => setEditForm({ ...editForm, relation: e.target.value })}
                          className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                        >
                          <option value="Father">Father</option>
                          <option value="Mother">Mother</option>
                          <option value="Guardian">Guardian</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Phone Number *</label>
                        <input
                          type="text"
                          required
                          disabled={!canEditParent}
                          value={editForm.phone}
                          onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                          className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2 font-mono text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Email Address</label>
                        <input
                          type="email"
                          disabled={!canEditParent}
                          value={editForm.email}
                          onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                          className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Occupation</label>
                      <input
                        type="text"
                        disabled={!canEditParent}
                        value={editForm.occupation}
                        onChange={(e) => setEditForm({ ...editForm, occupation: e.target.value })}
                        placeholder="e.g. Senior Software Engineer"
                        className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Residential Address</label>
                      <textarea
                        rows={3}
                        disabled={!canEditParent}
                        value={editForm.address}
                        onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                        placeholder="Street, City, State, ZIP code"
                        className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-3 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>

                    {canEditParent && (
                      <div className="pt-2 flex justify-end gap-2">
                        <Button variant="primary" size="md" icon={Save} isLoading={savingParent} type="submit">
                          Save Parent Details
                        </Button>
                      </div>
                    )}
                  </form>
                </Card>

                {/* Linked Students List */}
                <Card className="space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                    <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2 text-sm">
                      <GraduationCap className="w-4 h-4 text-indigo-600 dark:text-indigo-400" /> Linked Children / Students
                    </h3>
                    <Badge variant="indigo">{parentDetail.children?.length || 0} Students</Badge>
                  </div>

                  {parentDetail.children && parentDetail.children.length > 0 ? (
                    <div className="space-y-3">
                      {parentDetail.children.map((child) => (
                        <div
                          key={child.id}
                          className="bg-slate-50 dark:bg-slate-900/60 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1 text-xs"
                        >
                          <div className="flex items-center justify-between font-bold text-slate-900 dark:text-white">
                            <span>{child.name}</span>
                            <Badge variant={child.status === 'ACTIVE' ? 'success' : 'neutral'}>
                              {child.status}
                            </Badge>
                          </div>
                          <div className="text-indigo-600 dark:text-indigo-400 font-mono text-[11px]">
                            {child.admission_number}
                          </div>
                          <div className="text-slate-500 dark:text-slate-400 text-[11px] pt-1">
                            Class: <span className="font-semibold text-slate-700 dark:text-slate-300">{child.class_name} - {child.section_name}</span> (Roll #{child.roll_no || 'N/A'})
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-8 text-center text-slate-400 italic text-xs">
                      No student records linked to this parent yet.
                    </div>
                  )}
                </Card>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Directory Table View */
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-wide flex items-center gap-2">
                <UserCheck className="w-6 h-6 text-indigo-600 dark:text-indigo-400" /> Parents & Guardians Directory
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Parent portal accounts, edit details & multi-children linkage
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" icon={FileText} onClick={() => setIsCSVOpen(true)}>
                Bulk CSV Import
              </Button>
              <Button variant="outline" size="sm" icon={RefreshCw} onClick={fetchParents}>
                Refresh
              </Button>
            </div>
          </div>

          <Card>
            <DataTable
              columns={columns}
              data={parents}
              isLoading={loading}
              searchPlaceholder="Search parent name or phone..."
              emptyMessage="No parent records registered"
            />
          </Card>
        </div>
      )}

      {/* CSV Import Modal */}
      <Modal isOpen={isCSVOpen} onClose={() => setIsCSVOpen(false)} title="Bulk Parent CSV Import">
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
              id="parent-csv-input"
            />
            <label
              htmlFor="parent-csv-input"
              className="cursor-pointer inline-flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-semibold hover:underline"
            >
              <Upload className="w-4 h-4" /> Click to choose CSV File
            </label>
          </div>

          <div>
            <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
              CSV Raw Text Format: <span className="font-mono text-[10px] text-indigo-600 dark:text-indigo-400">name, email, phone, relation</span>
            </label>
            <textarea
              rows={4}
              value={csvText}
              onChange={(e) => setCsvText(e.target.value)}
              placeholder="Robert Smith, robert.smith@email.com, +1 555-0192, FATHER"
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

export default ParentManagement;
