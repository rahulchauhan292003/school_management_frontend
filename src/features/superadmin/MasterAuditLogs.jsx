import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { Card } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import DataTable from '../../components/ui/DataTable';
import { ShieldCheck, RefreshCw } from 'lucide-react';

const MasterAuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchMasterAuditLogs = async () => {
    setLoading(true);
    try {
      const res = await api.get('/master/audit-logs');
      setLogs(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMasterAuditLogs();
  }, []);

  const columns = [
    {
      header: 'Timestamp',
      accessor: 'created_at',
      render: (row) => <span className="font-mono text-slate-500 text-[11px]">{new Date(row.created_at).toLocaleString()}</span>,
    },
    {
      header: 'User Type',
      accessor: 'user_type',
      render: (row) => <Badge variant="indigo">{row.user_type}</Badge>,
    },
    {
      header: 'Action',
      accessor: 'action',
      render: (row) => <span className="font-bold text-emerald-600 dark:text-emerald-400">{row.action}</span>,
    },
    {
      header: 'Target Tenant',
      accessor: 'target',
      render: (row) => (
        <code className="bg-slate-100 dark:bg-slate-800 text-indigo-600 dark:text-indigo-300 px-2 py-0.5 rounded font-mono text-[11px]">
          {row.target || 'N/A'}
        </code>
      ),
    },
    {
      header: 'IP Address',
      accessor: 'ip_address',
      render: (row) => <span className="font-mono text-slate-500">{row.ip_address || '127.0.0.1'}</span>,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-wide flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-indigo-600 dark:text-indigo-400" /> SaaS Master Audit Trail
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Platform-level security & database provisioning audit log</p>
        </div>
        <Button variant="outline" size="sm" icon={RefreshCw} onClick={fetchMasterAuditLogs}>
          Refresh
        </Button>
      </div>

      <Card>
        <DataTable
          columns={columns}
          data={logs}
          isLoading={loading}
          searchPlaceholder="Search master audit logs..."
          emptyMessage="No master audit logs recorded yet"
        />
      </Card>
    </div>
  );
};

export default MasterAuditLogs;
