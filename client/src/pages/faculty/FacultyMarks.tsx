import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { timetableApi, studentsApi, marksApi, Timetable, Student, Marks } from '@/services/api';
import { toast } from 'sonner';
import { parseClassSelection } from '@/lib/utils';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorMessage from '../../components/common/ErrorMessage';
import EmptyState from '../../components/common/EmptyState';

interface StudentMarkData extends Student {
  marks?: Marks;
}

const examTypes = ['Internal 1', 'Internal 2', 'External'];

export default function FacultyMarks() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [timetable, setTimetable] = useState<Timetable[]>([]);
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [selectedExam, setSelectedExam] = useState(examTypes[0]);
  const [students, setStudents] = useState<StudentMarkData[]>([]);

  useEffect(() => {
    if (user?.profile?.id) {
      fetchTimetable();
    }
  }, [user]);

  useEffect(() => {
    if (selectedClass) {
      fetchStudentsAndMarks();
    }
  }, [selectedClass]);

  const fetchTimetable = async () => {
    if (!user?.profile?.id) return;

    try {
      setLoading(true);
      setError(null);
      console.log('[FacultyMarks] Fetching timetable...');
      const data = await timetableApi.getByFaculty();
      console.log(`[FacultyMarks] Loaded ${data.length} timetable entries`);
      setTimetable(data);
      
      if (data.length > 0 && !selectedClass) {
        // Validate that we have proper IDs before setting selectedClass
        if (data[0].section_id && data[0].subject_id) {
          setSelectedClass(`${data[0].section_id}|${data[0].subject_id}`);
        } else {
          console.warn('[FacultyMarks] Timetable entry missing section_id or subject_id:', data[0]);
        }
      }
    } catch (err) {
      console.error('[FacultyMarks] Error fetching timetable:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to load timetable';
      setError(errorMessage);
      toast.error('Failed to load timetable');
    } finally {
      setLoading(false);
    }
  };

  const fetchStudentsAndMarks = async () => {
    if (!selectedClass) return;
    
    // Validate and parse selectedClass
    const parsed = parseClassSelection(selectedClass);
    if (!parsed.valid) {
      console.error('[FacultyMarks] Invalid selectedClass:', selectedClass, parsed.error);
      toast.error(parsed.error || 'Invalid class selection. Please try again.');
      return;
    }

    const { sectionId, subjectId } = parsed;

    try {
      setLoading(true);
      const studentsData = await studentsApi.getBySection(sectionId);
      
      if (!studentsData || studentsData.length === 0) {
        console.warn('[FacultyMarks] No students found for section', sectionId);
        toast.warning('No students enrolled in this section yet.');
      }
      
      const marksData = await marksApi.getBySubject(subjectId);

      const marksMap = new Map<string, Marks>();
      marksData.forEach(mark => {
        marksMap.set(mark.student_id, mark);
      });

      const studentsWithMarks = studentsData.map(student => ({
        ...student,
        marks: marksMap.get(student.id),
      }));

      setStudents(studentsWithMarks);
    } catch (err) {
      console.error('Error fetching students and marks:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to load students and marks';
      
      if (errorMessage.includes('not assigned')) {
        toast.error('You are not assigned to this class. Please contact administrator.');
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const getMaxMarks = () => {
    return selectedExam === 'External' ? 100 : 20;
  };

  const validateAndParseMarkInput = (value: string, maxMarks: number): number | null => {
    if (value === '') return null;
    const parsed = parseInt(value, 10);
    if (isNaN(parsed)) return null;
    return Math.min(Math.max(0, parsed), maxMarks);
  };

  const updateMark = (studentId: string, value: string) => {
    const numValue = validateAndParseMarkInput(value, getMaxMarks());
    const field = selectedExam === 'Internal 1' ? 'internal1' : selectedExam === 'Internal 2' ? 'internal2' : 'external';
    
    setStudents(students.map(s => {
      if (s.id !== studentId) return s;
      
      const currentMarks = s.marks || {};
      return {
        ...s,
        marks: {
          ...currentMarks,
          [field]: numValue,
        } as Marks,
      };
    }));
  };

  const getCurrentMark = (student: StudentMarkData) => {
    if (!student.marks) return null;
    if (selectedExam === 'Internal 1') return student.marks.internal1;
    if (selectedExam === 'Internal 2') return student.marks.internal2;
    return student.marks.external;
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
      
      for (const student of students) {
        if (student.marks) {
          await marksApi.enterMarks({
            student_id: student.id,
            subject_id: subjectId,
            internal1: student.marks.internal1,
            internal2: student.marks.internal2,
            external: student.marks.external,
          });
        }
      }

      toast.success('Marks saved successfully!');
      await fetchStudentsAndMarks();
    } catch (err) {
      console.error('Error saving marks:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to save marks';
      toast.error(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const getGrade = (total: number, max: number) => {
    const percent = (total / max) * 100;
    if (percent >= 90) return { grade: 'A+', color: 'text-success' };
    if (percent >= 80) return { grade: 'A', color: 'text-success' };
    if (percent >= 70) return { grade: 'B+', color: 'text-primary' };
    if (percent >= 60) return { grade: 'B', color: 'text-primary' };
    if (percent >= 50) return { grade: 'C', color: 'text-warning' };
    if (percent >= 40) return { grade: 'D', color: 'text-warning' };
    return { grade: 'F', color: 'text-destructive' };
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
        <h1 className="page-title">Enter Marks</h1>
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

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="page-title">Enter Marks</h1>
          <p className="text-muted-foreground mt-1">Record and manage student marks</p>
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
            <label className="label-base">Exam Type</label>
            <select
              value={selectedExam}
              onChange={(e) => setSelectedExam(e.target.value)}
              className="input-base"
            >
              {examTypes.map((exam) => (
                <option key={exam} value={exam}>{exam}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {uniqueClasses.length === 0 ? (
        <EmptyState 
          message="No classes assigned" 
          description="You don't have any classes assigned to enter marks." 
        />
      ) : (
        <>
          {/* Info Banner */}
          <div className="card-base p-4 bg-primary/5 border-primary/20">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="font-medium text-foreground">
                  {selectedExam} - {uniqueClasses.find(c => c.key === selectedClass)?.label}
                </p>
                <p className="text-sm text-muted-foreground">
                  Maximum marks: {getMaxMarks()} | Enter marks for each student below
                </p>
              </div>
            </div>
          </div>

          {/* Marks Table */}
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
            <div className="card-base overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="table-header">
                    <th className="table-cell text-left w-12">#</th>
                    <th className="table-cell text-left">Roll No</th>
                    <th className="table-cell text-left">Student Name</th>
                    <th className="table-cell text-center w-32">Internal 1 (20)</th>
                    <th className="table-cell text-center w-32">Internal 2 (20)</th>
                    <th className="table-cell text-center w-32">External (100)</th>
                    <th className="table-cell text-center w-24">Total</th>
                    <th className="table-cell text-center w-20">Grade</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((student, index) => {
                    const internal1 = student.marks?.internal1 || 0;
                    const internal2 = student.marks?.internal2 || 0;
                    const external = student.marks?.external || 0;
                    const total = internal1 + internal2 + external;
                    const { grade, color } = getGrade(total, 140);
                    
                    return (
                      <tr key={student.id} className="hover:bg-muted/50 transition-colors">
                        <td className="table-cell text-muted-foreground">{index + 1}</td>
                        <td className="table-cell font-mono">{student.roll_no}</td>
                        <td className="table-cell">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                              <span className="text-xs font-medium text-primary">
                                {student.name.split(' ').map(n => n[0]).join('')}
                              </span>
                            </div>
                            <span className="font-medium text-foreground">{student.name}</span>
                          </div>
                        </td>
                        <td className="table-cell">
                          <input
                            type="number"
                            min={0}
                            max={20}
                            value={student.marks?.internal1 ?? ''}
                            onChange={(e) => updateMark(student.id, e.target.value)}
                            disabled={selectedExam !== 'Internal 1'}
                            className={`w-full text-center input-base py-1.5 ${
                              selectedExam !== 'Internal 1' ? 'bg-muted cursor-not-allowed' : ''
                            }`}
                            placeholder="-"
                          />
                        </td>
                        <td className="table-cell">
                          <input
                            type="number"
                            min={0}
                            max={20}
                            value={student.marks?.internal2 ?? ''}
                            onChange={(e) => updateMark(student.id, e.target.value)}
                            disabled={selectedExam !== 'Internal 2'}
                            className={`w-full text-center input-base py-1.5 ${
                              selectedExam !== 'Internal 2' ? 'bg-muted cursor-not-allowed' : ''
                            }`}
                            placeholder="-"
                          />
                        </td>
                        <td className="table-cell">
                          <input
                            type="number"
                            min={0}
                            max={100}
                            value={student.marks?.external ?? ''}
                            onChange={(e) => updateMark(student.id, e.target.value)}
                            disabled={selectedExam !== 'External'}
                            className={`w-full text-center input-base py-1.5 ${
                              selectedExam !== 'External' ? 'bg-muted cursor-not-allowed' : ''
                            }`}
                            placeholder="-"
                          />
                        </td>
                        <td className="table-cell text-center font-bold text-foreground">{total}</td>
                        <td className="table-cell text-center">
                          <span className={`font-bold ${color}`}>{grade}</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Save Button */}
          {students.length > 0 && (
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
                  'Save Marks'
                )}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
