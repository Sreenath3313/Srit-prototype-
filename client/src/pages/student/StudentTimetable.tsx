import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { timetableApi } from '@/services/api';
import type { Timetable } from '@/services/api';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import ErrorMessage from '@/components/common/ErrorMessage';
import EmptyState from '@/components/common/EmptyState';

const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const periods = [1, 2, 3, 4, 5, 6];

export default function StudentTimetable() {
  const { user } = useAuth();
  const [timetable, setTimetable] = useState<Timetable[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user?.profile?.section_id) {
      fetchTimetable();
    }
  }, [user]);

  const fetchTimetable = async () => {
    if (!user?.profile?.section_id) return;

    try {
      setLoading(true);
      setError(null);
      const data = await timetableApi.getBySection(user.profile.section_id);
      setTimetable(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load timetable');
    } finally {
      setLoading(false);
    }
  };

  const timetableGrid = useMemo(() => {
    const grid: Record<string, Record<number, { subject: string; faculty: string }>> = {};
    
    days.forEach(day => {
      grid[day] = {};
    });

    timetable.forEach(t => {
      if (!grid[t.day]) grid[t.day] = {};
      grid[t.day][t.period] = {
        subject: t.subjects?.name || 'Unknown',
        faculty: t.faculty?.name || 'TBA',
      };
    });

    return grid;
  }, [timetable]);

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
      <h1 className="page-title">Weekly Timetable</h1>
      
      {timetable.length === 0 ? (
        <EmptyState message="No timetable available" description="Your timetable will appear once it's created" />
      ) : (
        <div className="card-base overflow-x-auto">
          <table className="w-full min-w-[600px]">
            <thead><tr className="table-header"><th className="table-cell">Day</th>{periods.map(p => <th key={p} className="table-cell text-center">P{p}</th>)}</tr></thead>
            <tbody>
              {days.map(day => (
                <tr key={day} className="hover:bg-muted/30">
                  <td className="table-cell font-medium">{day}</td>
                  {periods.map(p => {
                    const slot = timetableGrid[day]?.[p];
                    return <td key={p} className="table-cell text-center p-2">{slot ? <div className="p-2 rounded-lg bg-primary/10 text-sm"><p className="font-medium text-foreground">{slot.subject}</p><p className="text-xs text-muted-foreground">{slot.faculty}</p></div> : <span className="text-muted-foreground/50">-</span>}</td>;
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
