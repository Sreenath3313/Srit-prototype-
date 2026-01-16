import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { timetableApi, studentsApi, attendanceApi, Timetable, Student, Attendance } from '@/services/api';
import { toast } from 'sonner';
import { parseClassSelection } from '@/lib/utils';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorMessage from '../../components/common/ErrorMessage';
import EmptyState from '../../components/common/EmptyState';

interface AttendanceRecord {
  student_id: string;
  subject_id: string;
  date: string;
  present: boolean;
}

export default function FacultyAttendance() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [timetable, setTimetable] = useState<Timetable[]>([]);
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [students, setStudents] = useState<Student[]>([]);
  const [attendanceMap, setAttendanceMap] = useState<Map<string, boolean>>(new Map());

  useEffect(() => {
    if (user?.profile?.id) {
      fetchTimetable();
    }
  }, [user]);

  useEffect(() => {
    if (selectedClass) {
      fetchStudentsAndAttendance();
    }
  }, [selectedClass, selectedDate]);

  const fetchTimetable = async () => {
    if (!user?.profile?.id) return;

    try {
      setLoading(true);
      setError(null);
      console.log('[FacultyAttendance] Fetching timetable...');
      const data = await timetableApi.getByFaculty();
      console.log(`[FacultyAttendance] Loaded ${data.length} timetable entries`);
      setTimetable(data);
      
      if (data.length > 0 && !selectedClass) {
        // Validate that we have proper IDs before setting selectedClass
        if (data[0].section_id && data[0].subject_id) {
          setSelectedClass(`${data[0].section_id}|${data[0].subject_id}`);
        } else {
          console.warn('[FacultyAttendance] Timetable entry missing section_id or subject_id:', data[0]);
        }
      }
    } catch (err) {
      console.error('[FacultyAttendance] Error fetching timetable:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to load timetable';
      setError(errorMessage);
      toast.error('Failed to load timetable');
    } finally {
      setLoading(false);
    }
  };

  const fetchStudentsAndAttendance = async () => {
    if (!selectedClass) return;
    
    // Validate and parse selectedClass
    const parsed = parseClassSelection(selectedClass);
    if (!parsed.valid) {
      console.error('[FacultyAttendance] Invalid selectedClass:', selectedClass, parsed.error);
      toast.error(parsed.error || 'Invalid class selection. Please try again.');
      return;
    }

    const { sectionId, subjectId } = parsed;

    try {
      setLoading(true);
      const studentsData = await studentsApi.getBySection(sectionId);
      
      if (!studentsData || studentsData.length === 0) {
        console.warn('[FacultyAttendance] No students found for section', sectionId);
        toast.warning('No students enrolled in this section yet.');
      }
      
      setStudents(studentsData);

      const attendanceData = await attendanceApi.getBySubject(subjectId, selectedDate, selectedDate);
      const newMap = new Map<string, boolean>();
      
      attendanceData.forEach((record: Attendance) => {
        newMap.set(record.student_id, record.present);
      });

      studentsData.forEach(student => {
        if (!newMap.has(student.id)) {
          newMap.set(student.id, true);
        }
      });

      setAttendanceMap(newMap);
    } catch (err) {
      console.error('Error fetching students:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to load students';
      
      if (errorMessage.includes('not assigned')) {
        toast.error('You are not assigned to this class. Please contact administrator.');
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const toggleAttendance = (studentId: string) => {
    const newMap = new Map(attendanceMap);
    newMap.set(studentId, !newMap.get(studentId));
    setAttendanceMap(newMap);
  };

  const markAllPresent = () => {
    const newMap = new Map<string, boolean>();
    students.forEach(student => newMap.set(student.id, true));
    setAttendanceMap(newMap);
  };

  const markAllAbsent = () => {
    const newMap = new Map<string, boolean>();
    students.forEach(student => newMap.set(student.id, false));
    setAttendanceMap(newMap);
  };

  const handleSave = async () => {
    if (!selectedClass) return;

    // Validate and parse selectedClass
    const parsed = parseClassSelection(selectedClass);
    if (!parsed.valid) {
      toast.error(parsed.error || 'Invalid class selection');
      return;
    }

    const { sectionId, subjectId } = parsed;

    try {
      setSaving(true);
      const records: AttendanceRecord[] = students.map(student => ({
        student_id: student.id,
        subject_id: subjectId,
        date: selectedDate,
        present: attendanceMap.get(student.id) || false,
      }));

      await attendanceApi.markAttendance(records);
      toast.success('Attendance saved successfully!');
    } catch (err) {
      console.error('Error saving attendance:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to save attendance';
      toast.error(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  if (!user?.profile) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (loading && timetable.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6 animate-fade-in">
        <h1 className="page-title">Mark Attendance</h1>
        <ErrorMessage message={error} />
      </div>
    );
  }

  const uniqueClasses = Array.from(
    new Map(timetable.map(item => [
      `${item.section_id}|${item.subject_id}`,
      {
        key: `${item.section_id}|${item.subject_id}`,
        label: `${item.subjects?.name || 'N/A'} - ${item.sections?.name || 'N/A'}`,
        subjectId: item.subject_id,
        sectionId: item.section_id,
      }
    ])).values()
  );

  const presentCount = Array.from(attendanceMap.values()).filter(Boolean).length;
  const absentCount = students.length - presentCount;
  const attendancePercent = students.length > 0 ? ((presentCount / students.length) * 100).toFixed(1) : '0.0';

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="page-title">Mark Attendance</h1>
          <p className="text-muted-foreground mt-1">Record student attendance for your classes</p>
        </div>
      </div>

      {/* Filters */}
      <div className="card-base p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="label-base">Class (Subject - Section)</label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="input-base"
            >
              {uniqueClasses.map((cls) => (
                <option key={cls.key} value={cls.key}>{cls.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label-base">Date</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="input-base"
            />
          </div>
        </div>
      </div>

      {uniqueClasses.length === 0 ? (
        <EmptyState 
          message="No classes assigned" 
          description="You don't have any classes assigned to mark attendance." 
        />
      ) : (
        <>
          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="card-base p-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center">
                <svg className="w-6 h-6 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{presentCount}</p>
                <p className="text-sm text-muted-foreground">Present</p>
              </div>
            </div>
            <div className="card-base p-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-destructive/10 flex items-center justify-center">
                <svg className="w-6 h-6 text-destructive" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{absentCount}</p>
                <p className="text-sm text-muted-foreground">Absent</p>
              </div>
            </div>
            <div className="card-base p-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{attendancePercent}%</p>
                <p className="text-sm text-muted-foreground">Attendance</p>
              </div>
            </div>
          </div>

          {/* Student List */}
          {loading ? (
            <div className="card-base p-8">
              <LoadingSpinner size="lg" />
            </div>
          ) : students.length === 0 ? (
            <EmptyState 
              message="No students found" 
              description="This section doesn't have any students yet." 
            />
          ) : (
            <>
              <div className="card-base overflow-hidden">
                <div className="flex items-center justify-between p-4 border-b border-border">
                  <h2 className="section-title">Student List - {uniqueClasses.find(c => c.key === selectedClass)?.label.split(' - ')[1]}</h2>
                  <div className="flex gap-2">
                    <button onClick={markAllPresent} className="btn-outline text-sm py-1.5">
                      All Present
                    </button>
                    <button onClick={markAllAbsent} className="btn-ghost text-sm py-1.5">
                      All Absent
                    </button>
                  </div>
                </div>
                <div className="divide-y divide-border">
                  {students.map((student, index) => {
                    const isPresent = attendanceMap.get(student.id) || false;
                    return (
                      <div
                        key={student.id}
                        className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
                        style={{ animationDelay: `${index * 30}ms` }}
                      >
                        <div className="flex items-center gap-4">
                          <span className="w-8 text-sm text-muted-foreground">{index + 1}</span>
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <span className="text-sm font-medium text-primary">
                              {student.name.split(' ').map(n => n[0]).join('')}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-foreground">{student.name}</p>
                            <p className="text-sm text-muted-foreground font-mono">{student.roll_no}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => toggleAttendance(student.id)}
                          className={`w-24 py-2 rounded-lg font-medium text-sm transition-all duration-200 ${
                            isPresent
                              ? 'bg-success text-success-foreground'
                              : 'bg-destructive/10 text-destructive border border-destructive/30'
                          }`}
                        >
                          {isPresent ? 'Present' : 'Absent'}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Save Button */}
              <div className="flex justify-end">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="btn-primary px-8 flex items-center gap-2"
                >
                  {saving ? (
                    <>
                      <LoadingSpinner size="sm" />
                      Saving...
                    </>
                  ) : (
                    'Save Attendance'
                  )}
                </button>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
