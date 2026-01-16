import { useState, useEffect, useMemo } from 'react';
import StatCard from '../../components/common/StatCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorMessage from '../../components/common/ErrorMessage';
import EmptyState from '../../components/common/EmptyState';
import { useAuth } from '@/contexts/AuthContext';
import { attendanceApi, timetableApi, marksApi } from '@/services/api';
import type { Attendance, Timetable, Marks } from '@/services/api';

const PERIOD_TIMES: Record<number, string> = {
  1: '9:00 - 9:50',
  2: '10:00 - 10:50',
  3: '11:00 - 11:50',
  4: '12:00 - 12:50',
  5: '1:30 - 2:20',
  6: '2:30 - 3:20',
};

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function StudentDashboard() {
  const { user } = useAuth();
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [timetable, setTimetable] = useState<Timetable[]>([]);
  const [marks, setMarks] = useState<Marks[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (user?.profile?.id && user?.profile?.section_id) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    if (!user?.profile?.id || !user?.profile?.section_id) return;

    try {
      setLoading(true);
      setError(null);
      const [attendanceData, timetableData, marksData] = await Promise.all([
        attendanceApi.getByStudent(user.profile.id),
        timetableApi.getBySection(user.profile.section_id),
        marksApi.getByStudent(user.profile.id),
      ]);
      setAttendance(attendanceData);
      setTimetable(timetableData);
      setMarks(marksData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
    toast.success('Data refreshed!');
  };

  const stats = useMemo(() => {
    // Calculate attendance percentage
    const totalClasses = attendance.length;
    const presentClasses = attendance.filter(a => a.present).length;
    const attendancePercent = totalClasses > 0 ? ((presentClasses / totalClasses) * 100).toFixed(0) : '0';

    // Calculate CGPA from marks
    let totalMarks = 0;
    let totalMaxMarks = 0;
    marks.forEach(m => {
      const studentTotal = (m.internal1 || 0) + (m.internal2 || 0) + (m.external || 0);
      totalMarks += studentTotal;
      totalMaxMarks += 140;
    });
    const percentage = totalMaxMarks > 0 ? (totalMarks / totalMaxMarks) * 100 : 0;
    const cgpa = (percentage / 10).toFixed(1);

    // Count unique subjects
    const uniqueSubjects = new Set(attendance.map(a => a.subject_id));
    const subjectsCount = uniqueSubjects.size;

    // Get today's classes
    const today = DAYS[new Date().getDay()];
    const todayClasses = timetable.filter(t => t.day === today);

    return [
      { title: 'Attendance', value: `${attendancePercent}%`, icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>, color: 'success' as const },
      { title: 'CGPA', value: cgpa, icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>, color: 'primary' as const },
      { title: 'Subjects', value: String(subjectsCount), icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>, color: 'warning' as const },
      { title: 'Classes Today', value: String(todayClasses.length), icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>, color: 'secondary' as const },
    ];
  }, [attendance, marks, timetable]);

  const todaySchedule = useMemo(() => {
    const today = DAYS[new Date().getDay()];
    return timetable
      .filter(t => t.day === today)
      .sort((a, b) => a.period - b.period)
      .map(t => ({
        period: t.period,
        time: PERIOD_TIMES[t.period] || 'TBA',
        subject: t.subjects?.name || 'Unknown',
        faculty: t.faculty?.name || 'TBA',
      }));
  }, [timetable]);

  const subjectAttendance = useMemo(() => {
    const subjectMap = new Map<string, { subject: string; present: number; total: number }>();
    
    attendance.forEach(a => {
      const subjectName = a.subjects?.name || 'Unknown Subject';
      if (!subjectMap.has(a.subject_id)) {
        subjectMap.set(a.subject_id, { subject: subjectName, present: 0, total: 0 });
      }
      const data = subjectMap.get(a.subject_id)!;
      data.total++;
      if (a.present) data.present++;
    });

    return Array.from(subjectMap.values()).slice(0, 4);
  }, [attendance]);

  if (loading) {
    return <LoadingSpinner className="min-h-[400px]" />;
  }

  if (error) {
    return <ErrorMessage message={error} />;
  }

  if (!user?.profile) {
    return <ErrorMessage message="Unable to load profile. Please try logging in again." />;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Welcome back, {user.name}! Here's your academic overview.</p>
        </div>
        <button 
          onClick={handleRefresh} 
          disabled={refreshing} 
          className="btn-outline flex items-center gap-2"
        >
          <svg 
            className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" 
            />
          </svg>
          {refreshing ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => <StatCard key={stat.title} {...stat} />)}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card-base p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="section-title">Today's Schedule</h2>
            <span className="badge-primary">{DAYS[new Date().getDay()]}</span>
          </div>
          {todaySchedule.length === 0 ? (
            <div className="text-center py-8">
              <svg className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="text-lg font-medium text-foreground mb-1">No classes today</p>
              <p className="text-sm text-muted-foreground mb-4">Enjoy your day off!</p>
              <p className="text-xs text-muted-foreground">
                💡 Tip: Check your timetable to see your weekly schedule
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {todaySchedule.map((item, i) => (
                <div key={i} className="flex items-center gap-4 p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors">
                  <div className="w-12 h-12 rounded-lg gradient-primary flex items-center justify-center text-white font-bold">P{item.period}</div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground">{item.subject}</p>
                    <p className="text-sm text-muted-foreground">{item.faculty}</p>
                  </div>
                  <p className="text-sm font-medium text-foreground">{item.time}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card-base p-6">
          <h2 className="section-title mb-4">Subject-wise Attendance</h2>
          {subjectAttendance.length === 0 ? (
            <div className="text-center py-8">
              <svg className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
              <p className="text-lg font-medium text-foreground mb-1">No attendance data</p>
              <p className="text-sm text-muted-foreground mb-4">Attendance will appear once recorded by your faculty</p>
              <p className="text-xs text-muted-foreground">
                💡 Tip: Make sure your faculty has assigned classes and marked attendance
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {subjectAttendance.map((item) => {
                const percent = ((item.present / item.total) * 100).toFixed(0);
                return (
                  <div key={item.subject}>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium text-foreground">{item.subject}</span>
                      <span className="text-sm text-muted-foreground">{percent}%</span>
                    </div>
                    <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                      <div className={`h-full rounded-full transition-all ${Number(percent) >= 75 ? 'bg-success' : 'bg-destructive'}`} style={{ width: `${percent}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
