import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Card } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import DataTable from '../../components/ui/DataTable';
import Modal from '../../components/ui/Modal';
import { Building, Database, RefreshCw, Eye, Power, AlertTriangle, ShieldCheck } from 'lucide-react';

const SchoolManagement = ({ onOpenCreateModal, onOpenSwitcher }) => {
  const [schools, setSchools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedLogs, setSelectedLogs] = useState(null);
  const { setTargetSchool } = useAuth();

  const fetchSchools = async () => {
    setLoading(true);
    try {
      const res = await api.get('/master/schools');
      setSchools(res.data);
    } catch (err) {
      console.error('Failed to fetch schools:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchools();
  }, []);

  const handleToggleStatus = async (schoolId, currentStatus) => {
    const newStatus = currentStatus === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    try {
      await api.patch(`/master/schools/${schoolId}/status`, { status: newStatus });
      fetchSchools();
    } catch (err) {
      console.error(err);
    }
  };

  const handleRetryProvision = async (schoolId) => {
    try {
      await api.post(`/master/schools/${schoolId}/provision`);
      fetchSchools();
    } catch (err) {
      console.error(err);
    }
  };

  const handleInspectDatabase = (schoolCode) => {
    setTargetSchool(schoolCode);
  };

  const columns = [
    {
      header: 'School Details',
      accessor: 'school_name',
      render: (row) => (
        <div>
          <div className="font-bold text-slate-900 dark:text-white text-sm">{row.school_name}</div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400">{row.plan_name || 'Enterprise SaaS Plan'}</div>
        </div>
      ),
    },
    {
      header: 'Tenant Code',
      accessor: 'school_code',
      render: (row) => (
        <code className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2.5 py-1 rounded-lg text-indigo-600 dark:text-indigo-300 font-mono text-[11px] font-semibold">
          {row.school_code}
        </code>
      ),
    },
    {
      header: 'Dedicated Database',
      accessor: 'database_name',
      render: (row) => (
        <div className="flex items-center space-x-2 text-emerald-600 dark:text-emerald-400 font-mono text-[11px]">
          <Database className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
          <span>{row.database_name}</span>
        </div>
      ),
    },
    {
      header: 'Database Status',
      accessor: 'database_status',
      render: (row) => (
        <Badge
          variant={
            row.database_status === 'ACTIVE'
              ? 'success'
              : row.database_status === 'FAILED'
              ? 'danger'
              : 'warning'
          }
        >
          {row.database_status}
        </Badge>
      ),
    },
    {
      header: 'Account Status',
      accessor: 'status',
      render: (row) => (
        <Badge variant={row.status === 'ACTIVE' ? 'indigo' : 'warning'}>
          {row.status}
        </Badge>
      ),
    },
    {
      header: 'Actions',
      accessor: 'actions',
      render: (row) => (
        <div className="flex items-center justify-end space-x-2">
          {row.database_status === 'ACTIVE' && (
            <Button
              variant="outline"
              size="sm"
              icon={Eye}
              onClick={() => handleInspectDatabase(row.school_code)}
              className="text-xs"
            >
              Inspect DB
            </Button>
          )}

          {row.database_status === 'FAILED' && (
            <Button
              variant="danger"
              size="sm"
              icon={RefreshCw}
              onClick={() => handleRetryProvision(row.id)}
            >
              Retry
            </Button>
          )}

          <Button
            variant={row.status === 'ACTIVE' ? 'outline' : 'success'}
            size="sm"
            icon={Power}
            onClick={() => handleToggleStatus(row.id, row.status)}
            title={row.status === 'ACTIVE' ? 'Suspend School' : 'Activate School'}
          />
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-wide">Schools Registry & Provisioning</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Manage multi-tenant MySQL databases, monitor status, inspect school ERP context
          </p>
        </div>
        <Button
          variant="primary"
          size="md"
          icon={Building}
          onClick={onOpenCreateModal}
        >
          Provision New School DB
        </Button>
      </div>

      <Card>
        <DataTable
          columns={columns}
          data={schools}
          isLoading={loading}
          searchPlaceholder="Search school name or code..."
          emptyMessage="No schools registered yet. Click 'Provision New School DB' to add one."
          actions={
            <Button variant="outline" size="sm" icon={RefreshCw} onClick={fetchSchools}>
              Refresh
            </Button>
          }
        />
      </Card>
    </div>
  );
};

export default SchoolManagement;
