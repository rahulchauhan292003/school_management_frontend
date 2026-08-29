import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { Card } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import DataTable from '../../components/ui/DataTable';
import { FileText, RefreshCw } from 'lucide-react';

const SchoolAuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAuditLogs = async () => {
    setLoading(true);
    try {
      const res = await api.get('/school/audit-logs');
      setLogs(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuditLogs();
  }, []);

  const columns = [
    {
      header: 'Timestamp',
      accessor: 'created_at',
      render: (row) => <span className="font-mono text-slate-500 text-[11px]">{new Date(row.created_at).toLocaleString()}</span>,
    },
    {
      header: 'User',
      accessor: 'user_name',
      render: (row) => <span className="font-bold text-slate-900 dark:text-white text-xs">{row.user_name || 'System'}</span>,
    },
    {
      header: 'Role',
      accessor: 'role_name',
      render: (row) => <Badge variant="indigo">{row.role_name || 'System'}</Badge>,
    },
    {
      header: 'Action',
      accessor: 'action',
      render: (row) => <span className="font-bold text-emerald-600 dark:text-emerald-400">{row.action}</span>,
    },
    {
      header: 'Module',
      accessor: 'module',
      render: (row) => <span className="font-mono text-slate-500">{row.module}</span>,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-wide flex items-center gap-2">
            <FileText className="w-6 h-6 text-indigo-600 dark:text-indigo-400" /> School Operational Audit Logs
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Immutable security event logs recorded within school database</p>
        </div>
        <Button variant="outline" size="sm" icon={RefreshCw} onClick={fetchAuditLogs}>
          Refresh
        </Button>
      </div>

      <Card>
        <DataTable
          columns={columns}
          data={logs}
          isLoading={loading}
          searchPlaceholder="Search audit action or user..."
          emptyMessage="No operational audit records logged yet"
        />
      </Card>
    </div>
  );
};

export default SchoolAuditLogs;
