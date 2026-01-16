import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { attendanceApi } from '@/services/api';
import type { Attendance } from '@/services/api';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import ErrorMessage from '@/components/common/ErrorMessage';
import EmptyState from '@/components/common/EmptyState';

export default function StudentAttendance() {
  const { user } = useAuth();
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user?.profile?.id) {
      fetchAttendance();
    }
  }, [user]);

  const fetchAttendance = async () => {
    if (!user?.profile?.id) return;

    try {
      setLoading(true);
      setError(null);
      const data = await attendanceApi.getByStudent(user.profile.id);
      setAttendance(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load attendance');
    } finally {
      setLoading(false);
    }
  };

  const subjects = useMemo(() => {
    const subjectMap = new Map<string, { name: string; code: string; present: number; total: number }>();
    
    attendance.forEach(a => {
      const subjectName = a.subjects?.name || 'Unknown Subject';
      const subjectCode = a.subjects?.code || 'N/A';
      
      if (!subjectMap.has(a.subject_id)) {
        subjectMap.set(a.subject_id, { name: subjectName, code: subjectCode, present: 0, total: 0 });
      }
      
      const data = subjectMap.get(a.subject_id)!;
      data.total++;
      if (a.present) data.present++;
    });

    return Array.from(subjectMap.values());
  }, [attendance]);

  const { totalPresent, totalClasses } = useMemo(() => {
    const totalPresent = subjects.reduce((sum, s) => sum + s.present, 0);
    const totalClasses = subjects.reduce((sum, s) => sum + s.total, 0);
    return { totalPresent, totalClasses };
  }, [subjects]);

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
      <h1 className="page-title">My Attendance</h1>
      
      {totalClasses === 0 ? (
        <EmptyState message="No attendance records" description="Your attendance will appear once classes begin" />
      ) : (
        <>
          <div className="card-base p-6 text-center">
            <p className="text-5xl font-bold text-primary">{((totalPresent / totalClasses) * 100).toFixed(1)}%</p>
            <p className="text-muted-foreground mt-2">Overall Attendance ({totalPresent}/{totalClasses} classes)</p>
          </div>
          
          <div className="card-base overflow-hidden">
            <table className="w-full">
              <thead><tr className="table-header"><th className="table-cell text-left">Subject</th><th className="table-cell text-center">Present</th><th className="table-cell text-center">Total</th><th className="table-cell text-center">Percentage</th><th className="table-cell text-center">Status</th></tr></thead>
              <tbody>
                {subjects.map((s) => {
                  const pct = ((s.present / s.total) * 100).toFixed(1);
                  return (
                    <tr key={s.code} className="hover:bg-muted/50"><td className="table-cell font-medium">{s.name}<span className="text-muted-foreground ml-2 text-xs">{s.code}</span></td><td className="table-cell text-center">{s.present}</td><td className="table-cell text-center">{s.total}</td><td className="table-cell text-center font-bold">{pct}%</td><td className="table-cell text-center"><span className={Number(pct) >= 75 ? 'badge-success' : 'badge-destructive'}>{Number(pct) >= 75 ? 'Good' : 'Low'}</span></td></tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
