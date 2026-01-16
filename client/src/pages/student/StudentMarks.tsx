import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { marksApi } from '@/services/api';
import type { Marks } from '@/services/api';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import ErrorMessage from '@/components/common/ErrorMessage';
import EmptyState from '@/components/common/EmptyState';

export default function StudentMarks() {
  const { user } = useAuth();
  const [marks, setMarks] = useState<Marks[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user?.profile?.id) {
      fetchMarks();
    }
  }, [user]);

  const fetchMarks = async () => {
    if (!user?.profile?.id) return;

    try {
      setLoading(true);
      setError(null);
      const data = await marksApi.getByStudent(user.profile.id);
      setMarks(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load marks');
    } finally {
      setLoading(false);
    }
  };

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
      <h1 className="page-title">My Marks</h1>
      
      {marks.length === 0 ? (
        <EmptyState message="No marks available" description="Your marks will appear once they are entered by faculty" />
      ) : (
        <div className="card-base overflow-hidden">
          <table className="w-full">
            <thead><tr className="table-header"><th className="table-cell text-left">Subject</th><th className="table-cell text-center">Internal 1 (20)</th><th className="table-cell text-center">Internal 2 (20)</th><th className="table-cell text-center">External (100)</th><th className="table-cell text-center">Total (140)</th><th className="table-cell text-center">Grade</th></tr></thead>
            <tbody>
              {marks.map((m) => {
                const i1 = m.internal1 || 0;
                const i2 = m.internal2 || 0;
                const ext = m.external || 0;
                const total = i1 + i2 + ext;
                const pct = (total / 140) * 100;
                const grade = pct >= 90 ? 'A+' : pct >= 80 ? 'A' : pct >= 70 ? 'B+' : pct >= 60 ? 'B' : 'C';
                return (
                  <tr key={m.id} className="hover:bg-muted/50"><td className="table-cell font-medium">{m.subjects?.name || 'Unknown'}</td><td className="table-cell text-center">{i1 > 0 ? i1 : '-'}</td><td className="table-cell text-center">{i2 > 0 ? i2 : '-'}</td><td className="table-cell text-center">{ext > 0 ? ext : '-'}</td><td className="table-cell text-center font-bold">{total}</td><td className="table-cell text-center"><span className="badge-success">{grade}</span></td></tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
