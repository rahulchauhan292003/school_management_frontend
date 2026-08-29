import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import api from '../../services/api';
import { Card, StatCard } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import DataTable from '../../components/ui/DataTable';
import { Building, Database, AlertTriangle, CheckCircle2, ShieldAlert, Plus, RefreshCw, ArrowRight } from 'lucide-react';

const SuperAdminDashboard = ({ onNavigateSchools, onOpenCreateModal }) => {
  const { user } = useSelector((state) => state.auth);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    if (user?.userType !== 'SUPER_ADMIN') {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const res = await api.get('/master/stats');
      setStats(res.data);
    } catch (err) {
      console.error('Failed to load stats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-indigo-500">
        <RefreshCw className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  const s = stats?.stats || { totalSchools: 0, activeSchools: 0, suspendedSchools: 0, failedProvisioning: 0 };
  const recentSchools = stats?.schools || [];

  const columns = [
    {
      header: 'School Name',
      accessor: 'school_name',
      render: (row) => <span className="font-bold text-slate-900 dark:text-white">{row.school_name}</span>,
    },
    {
      header: 'School Code',
      accessor: 'school_code',
      render: (row) => (
        <code className="bg-slate-100 dark:bg-slate-800 text-indigo-600 dark:text-indigo-300 px-2 py-0.5 rounded-md font-mono text-[11px] font-semibold border border-slate-200 dark:border-slate-700">
          {row.school_code}
        </code>
      ),
    },
    {
      header: 'Dedicated Database',
      accessor: 'database_name',
      render: (row) => (
        <code className="text-emerald-600 dark:text-emerald-400 font-mono text-[11px]">
          {row.database_name}
        </code>
      ),
    },
    {
      header: 'DB Status',
      accessor: 'database_status',
      render: (row) => (
        <Badge variant={row.database_status === 'ACTIVE' ? 'success' : 'danger'}>
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
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-wide">SaaS Platform Overview</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Global Master Control — Managing Multi-Tenant School Databases
          </p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline" size="sm" icon={RefreshCw} onClick={fetchStats}>
            Refresh
          </Button>
          <Button variant="primary" size="sm" icon={Plus} onClick={onOpenCreateModal}>
            Create & Provision School DB
          </Button>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Registered Schools"
          value={s.totalSchools}
          subtitle="Dedicated DB Instances"
          icon={Building}
          color="indigo"
        />
        <StatCard
          title="Active Databases"
          value={s.activeSchools}
          subtitle="100% Operational Status"
          icon={CheckCircle2}
          color="emerald"
        />
        <StatCard
          title="Suspended Tenants"
          value={s.suspendedSchools}
          subtitle="Access Restricted"
          icon={AlertTriangle}
          color="amber"
        />
        <StatCard
          title="Provision Failures"
          value={s.failedProvisioning}
          subtitle="Requires Admin Retry"
          icon={ShieldAlert}
          color="rose"
        />
      </div>

      {/* Architecture Highlights Card */}
      <Card className="space-y-4">
        <h3 className="text-sm font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider flex items-center gap-2">
          <Database className="w-4 h-4" /> Master / Base DB Architecture Rules Enforced
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="bg-slate-50 dark:bg-slate-900/60 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
            <div className="font-bold text-slate-900 dark:text-white mb-1">1. Separate MySQL Database per School</div>
            <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
              Every provisioned school receives its own database (e.g. <code className="text-indigo-600 dark:text-indigo-400 font-semibold">school_abc_db</code>). Zero shared operational tables.
            </p>
          </div>
          <div className="bg-slate-50 dark:bg-slate-900/60 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
            <div className="font-bold text-slate-900 dark:text-white mb-1">2. Request-Scoped Tenant Isolation</div>
            <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
              Server resolves database connections per authenticated request. Malicious frontend school ID overrides are strictly blocked.
            </p>
          </div>
          <div className="bg-slate-50 dark:bg-slate-900/60 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
            <div className="font-bold text-slate-900 dark:text-white mb-1">3. Automated Provisioning Pipeline</div>
            <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
              Transactional creation: database build → migration execution → default roles & permissions seeding → admin user setup.
            </p>
          </div>
        </div>
      </Card>

      {/* Recent Schools Table Preview */}
      <Card className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Registered School Databases</h3>
          <Button variant="ghost" size="sm" icon={ArrowRight} onClick={onNavigateSchools}>
            View All Schools
          </Button>
        </div>

        <DataTable
          columns={columns}
          data={recentSchools}
          searchPlaceholder="Search registered schools..."
          emptyMessage="No registered school databases found"
          pageSize={5}
        />
      </Card>
    </div>
  );
};

export default SuperAdminDashboard;
