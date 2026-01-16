import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { timetableApi, Timetable } from '@/services/api';
import { toast } from 'sonner';
import StatCard from '../../components/common/StatCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorMessage from '../../components/common/ErrorMessage';
import EmptyState from '../../components/common/EmptyState';

interface AssignedClass {
  subject: string;
  sections: string[];
  students?: number; // Optional - not used for faculty
}

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const PERIOD_TIMES = ['9:00 - 9:50', '10:00 - 10:50', '11:00 - 11:50', '12:00 - 12:50', '1:30 - 2:20', '2:30 - 3:20', '3:30 - 4:20'];

export default function FacultyDashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timetable, setTimetable] = useState<Timetable[]>([]);
  const [todaySchedule, setTodaySchedule] = useState<any[]>([]);
  const [assignedClasses, setAssignedClasses] = useState<AssignedClass[]>([]);

  useEffect(() => {
    if (user?.profile?.id) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    if (!user?.profile?.id) return;

    try {
      setLoading(true);
      setError(null);

      console.log('[FacultyDashboard] Fetching faculty timetable...');
      const data = await timetableApi.getByFaculty();
      console.log(`[FacultyDashboard] Loaded ${data.length} timetable entries`);
      
      if (data.length === 0) {
        console.warn('[FacultyDashboard] No timetable assignments found for faculty');
        toast.info('No classes assigned yet. Please contact your administrator.');
      }
      
      setTimetable(data);

      const today = DAYS[new Date().getDay()];
      const todayClasses = data
        .filter(item => item.day === today)
        .sort((a, b) => a.period - b.period)
        .map(item => ({
          period: item.period,
          time: PERIOD_TIMES[item.period - 1] || 'N/A',
          subject: item.subjects?.name || 'N/A',
          section: item.sections?.name || 'N/A',
          room: 'Room TBD',
        }));
      setTodaySchedule(todayClasses);

      const classMap = new Map<string, { sections: Set<string>; sectionIds: Set<string> }>();
      data.forEach(item => {
        const subjectName = item.subjects?.name || 'N/A';
        const sectionName = item.sections?.name || 'N/A';
        const sectionId = item.section_id;

        if (!classMap.has(subjectName)) {
          classMap.set(subjectName, { sections: new Set(), sectionIds: new Set() });
        }
        classMap.get(subjectName)!.sections.add(sectionName);
        classMap.get(subjectName)!.sectionIds.add(sectionId);
      });

      // Build assigned classes without fetching student counts
      // Faculty don't need student counts on dashboard - they see students when marking attendance/marks
      const classes: AssignedClass[] = [];
      for (const [subject, { sections }] of classMap.entries()) {
        classes.push({
          subject,
          sections: Array.from(sections),
        });
      }
      setAssignedClasses(classes);
    } catch (err) {
      console.error('Error fetching faculty dashboard data:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to load dashboard data';
      setError(errorMessage);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (!user?.profile) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6 animate-fade-in">
        <h1 className="page-title">Dashboard</h1>
        <ErrorMessage message={error} />
      </div>
    );
  }

  const stats = [
    {
      title: 'Assigned Classes',
      value: assignedClasses.length.toString(),
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      ),
      color: 'primary' as const,
    },
    {
      title: 'Total Sections',
      value: String(new Set(timetable.map(t => t.section_id)).size),
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      ),
      color: 'success' as const,
    },
    {
      title: 'Classes Today',
      value: todaySchedule.length.toString(),
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      color: 'warning' as const,
    },
    {
      title: 'Pending Marks',
      value: '0',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      color: 'secondary' as const,
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="page-title">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Welcome back, {user.name}! Here's your overview.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <StatCard key={stat.title} {...stat} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Schedule */}
        <div className="card-base p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="section-title">Today's Schedule</h2>
            <span className="badge-primary">{DAYS[new Date().getDay()]}</span>
          </div>
          {todaySchedule.length === 0 ? (
            <EmptyState message="No classes scheduled for today" description="Enjoy your free day!" />
          ) : (
            <div className="space-y-3">
              {todaySchedule.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center gap-4 p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors"
                >
                  <div className="w-12 h-12 rounded-lg gradient-primary flex items-center justify-center text-white font-bold">
                    P{item.period}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground">{item.subject}</p>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <span>{item.section}</span>
                      <span>•</span>
                      <span>{item.room}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-foreground">{item.time}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Assigned Classes */}
        <div className="card-base p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="section-title">Assigned Classes</h2>
            <button className="text-sm text-primary hover:underline">View All</button>
          </div>
          {assignedClasses.length === 0 ? (
            <div className="text-center py-8">
              <svg className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              <p className="text-lg font-medium text-foreground mb-1">No assigned classes</p>
              <p className="text-sm text-muted-foreground mb-4">You don't have any classes assigned yet</p>
              <p className="text-xs text-muted-foreground">
                💡 Tip: Contact your administrator to assign classes to you
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {assignedClasses.map((item, index) => (
                <div key={index} className="flex items-center gap-4 p-4 rounded-xl border border-border hover:border-primary/30 transition-colors">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground">{item.subject}</p>
                    <div className="flex items-center gap-2 mt-1">
                      {item.sections.map((sec) => (
                        <span key={sec} className="badge-primary text-xs">{sec}</span>
                      ))}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-muted-foreground">
                      {item.sections.length} {item.sections.length === 1 ? 'Section' : 'Sections'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card-base p-6">
        <h2 className="section-title mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { title: 'Mark Attendance', icon: '✓', path: '/faculty/attendance' },
            { title: 'Enter Marks', icon: '📝', path: '/faculty/marks' },
            { title: 'View Timetable', icon: '📅', path: '/faculty/timetable' },
            { title: 'Class Report', icon: '📊', path: '/faculty/reports' },
          ].map((action) => (
            <button
              key={action.title}
              className="flex flex-col items-center gap-3 p-4 rounded-xl border border-border hover:border-primary/50 hover:bg-muted/50 transition-all duration-200 group"
            >
              <span className="text-3xl group-hover:scale-110 transition-transform">{action.icon}</span>
              <span className="text-sm font-medium text-foreground">{action.title}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
