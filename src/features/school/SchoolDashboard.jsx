import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { Card, StatCard } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import { GraduationCap, Users, CalendarCheck, TrendingUp, RefreshCw } from 'lucide-react';

const SchoolDashboard = () => {
  const [stats, setStats] = useState({
    studentsCount: 0,
    teachersCount: 0,
    classesCount: 0,
    todayAttendance: [],
  });
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [profRes, stRes, tRes, cRes, attRes] = await Promise.all([
        api.get('/school/profile'),
        api.get('/school/students'),
        api.get('/school/teachers'),
        api.get('/school/classes'),
        api.get('/school/attendance/stats'),
      ]);

      setProfile(profRes.data);
      setStats({
        studentsCount: stRes.data?.length || 0,
        teachersCount: tRes.data?.length || 0,
        classesCount: cRes.data?.length || 0,
        todayAttendance: attRes.data || [],
      });
    } catch (err) {
      console.error('Failed to load school dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-indigo-500">
        <RefreshCw className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  const attendanceTotal = stats.todayAttendance.reduce((acc, curr) => acc + curr.count, 0);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <Card className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <Badge variant="indigo" className="mb-2">
            School ERP Operational Workspace
          </Badge>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
            {profile?.school_name || 'School ERP Portal'}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
            Principal: {profile?.principal_name || 'Dr. Principal'} | Code:{' '}
            <code className="text-indigo-600 dark:text-indigo-400 font-mono font-bold">
              {profile?.school_code}
            </code>
          </p>
        </div>
        <Button variant="outline" size="sm" icon={RefreshCw} onClick={fetchDashboardData}>
          Refresh Data
        </Button>
      </Card>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Students"
          value={stats.studentsCount}
          subtitle="Enrolled in Active Session"
          icon={GraduationCap}
          color="indigo"
        />
        <StatCard
          title="Teaching Staff"
          value={stats.teachersCount}
          subtitle="Active Faculty Members"
          icon={Users}
          color="emerald"
        />
        <StatCard
          title="Active Classes"
          value={stats.classesCount}
          subtitle="With Sections Setup"
          icon={TrendingUp}
          color="amber"
        />
        <StatCard
          title="Today's Attendance"
          value={`${attendanceTotal}`}
          subtitle="Records Marked Today"
          icon={CalendarCheck}
          color="rose"
        />
      </div>
    </div>
  );
};

export default SchoolDashboard;
