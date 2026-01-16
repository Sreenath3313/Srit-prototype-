import { useState, useEffect } from 'react';
import Modal from '../../components/common/Modal';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorMessage from '../../components/common/ErrorMessage';
import EmptyState from '../../components/common/EmptyState';
import { timetableApi, sectionsApi, subjectsApi, facultyApi, Timetable, Section, Subject, Faculty } from '@/services/api';
import { toast } from 'sonner';

const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const periods = [1, 2, 3, 4, 5, 6, 7, 8];

export default function AdminAssignments() {
  const [timetables, setTimetables] = useState<Timetable[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [faculties, setFaculties] = useState<Faculty[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSection, setSelectedSection] = useState('');
  const [editingTimetable, setEditingTimetable] = useState<Timetable | null>(null);
  const [formData, setFormData] = useState({
    subject_id: '',
    faculty_id: '',
    day: 'Monday',
    period: 1,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [timetableData, sectionsData, subjectsData, facultiesData] = await Promise.all([
        timetableApi.getAll(),
        sectionsApi.getAll(),
        subjectsApi.getAll(),
        facultyApi.getAll()
      ]);
      setTimetables(timetableData);
      setSections(sectionsData);
      setSubjects(subjectsData);
      setFaculties(facultiesData);
      if (sectionsData.length > 0 && !selectedSection) {
        setSelectedSection(sectionsData[0].id);
      }
      if (subjectsData.length > 0 && !formData.subject_id) {
        setFormData(prev => ({ ...prev, subject_id: subjectsData[0].id }));
      }
      if (facultiesData.length > 0 && !formData.faculty_id) {
        setFormData(prev => ({ ...prev, faculty_id: facultiesData[0].id }));
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch data';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const sectionTimetables = timetables.filter((t) => t.section_id === selectedSection);

  const getTimetable = (day: string, period: number) => {
    return sectionTimetables.find((t) => t.day === day && t.period === period);
  };

  const handleSlotClick = (day: string, period: number) => {
    const existing = getTimetable(day, period);
    if (existing) {
      setEditingTimetable(existing);
      setFormData({
        subject_id: existing.subject_id,
        faculty_id: existing.faculty_id,
        day: existing.day,
        period: existing.period,
      });
    } else {
      setEditingTimetable(null);
      setFormData({
        subject_id: subjects.length > 0 ? subjects[0].id : '',
        faculty_id: faculties.length > 0 ? faculties[0].id : '',
        day,
        period,
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingTimetable) {
        const updated = await timetableApi.update(editingTimetable.id, formData);
        setTimetables(timetables.map((t) => t.id === editingTimetable.id ? updated : t));
        toast.success('Timetable updated successfully');
      } else {
        const created = await timetableApi.create({
          ...formData,
          section_id: selectedSection,
        });
        setTimetables([...timetables, created]);
        toast.success('Timetable created successfully');
      }
      setIsModalOpen(false);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to save timetable';
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemove = async () => {
    if (editingTimetable) {
      try {
        await timetableApi.delete(editingTimetable.id);
        setTimetables(timetables.filter((t) => t.id !== editingTimetable.id));
        toast.success('Timetable entry removed successfully');
        setIsModalOpen(false);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to remove timetable';
        toast.error(message);
      }
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="page-title">Class Assignment</h1>
            <p className="text-muted-foreground mt-1">Assign faculty to subjects and create timetables</p>
          </div>
        </div>
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="page-title">Class Assignment</h1>
            <p className="text-muted-foreground mt-1">Assign faculty to subjects and create timetables</p>
          </div>
        </div>
        <ErrorMessage message={error} onRetry={fetchData} />
      </div>
    );
  }

  if (sections.length === 0) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="page-title">Class Assignment</h1>
            <p className="text-muted-foreground mt-1">Assign faculty to subjects and create timetables</p>
          </div>
        </div>
        <EmptyState
          title="No sections available"
          description="Please create sections first before creating timetables"
        />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="page-title">Class Assignment</h1>
          <p className="text-muted-foreground mt-1">Assign faculty to subjects and create timetables</p>
        </div>
      </div>

      {/* Section Selector */}
      <div className="card-base p-4">
        <div className="flex flex-wrap items-center gap-4">
          <label className="text-sm font-medium text-foreground">Select Section:</label>
          <div className="flex flex-wrap gap-2">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => setSelectedSection(section.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  selectedSection === section.id
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                {section.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Timetable Grid */}
      <div className="card-base overflow-hidden">
        <div className="p-4 border-b border-border">
          <h2 className="section-title">Timetable for {sections.find(s => s.id === selectedSection)?.name}</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="table-header">
                <th className="table-cell text-left">Day / Period</th>
                {periods.map((period) => (
                  <th key={period} className="table-cell text-center min-w-[120px]">
                    Period {period}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {days.map((day) => (
                <tr key={day} className="hover:bg-muted/30">
                  <td className="table-cell font-medium text-foreground">{day}</td>
                  {periods.map((period) => {
                    const timetable = getTimetable(day, period);
                    return (
                      <td key={period} className="table-cell p-2">
                        <button
                          onClick={() => handleSlotClick(day, period)}
                          className={`w-full p-3 rounded-lg text-left transition-all duration-200 ${
                            timetable
                              ? 'bg-primary/10 border border-primary/30 hover:border-primary'
                              : 'bg-muted/50 border border-dashed border-border hover:border-primary/50 hover:bg-muted'
                          }`}
                        >
                          {timetable ? (
                            <div>
                              <p className="text-sm font-medium text-foreground truncate">{timetable.subjects?.name || '-'}</p>
                              <p className="text-xs text-muted-foreground truncate">{timetable.faculty?.name || '-'}</p>
                            </div>
                          ) : (
                            <div className="text-center">
                              <svg className="w-5 h-5 mx-auto text-muted-foreground/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                              </svg>
                            </div>
                          )}
                        </button>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Assignments */}
      <div className="card-base p-6">
        <h2 className="section-title mb-4">All Assignments for {sections.find(s => s.id === selectedSection)?.name}</h2>
        {sectionTimetables.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <svg className="w-12 h-12 mx-auto mb-3 text-muted-foreground/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p>No classes assigned yet</p>
            <p className="text-sm">Click on any slot above to assign a class</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sectionTimetables.map((timetable) => (
              <div key={timetable.id} className="p-4 rounded-xl border border-border hover:border-primary/30 transition-colors">
                <div className="flex items-start justify-between mb-2">
                  <span className="badge-primary">{timetable.day}</span>
                  <span className="text-sm text-muted-foreground">Period {timetable.period}</span>
                </div>
                <h3 className="font-medium text-foreground">{timetable.subjects?.name || '-'}</h3>
                <p className="text-sm text-muted-foreground">{timetable.faculty?.name || '-'}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={`Assign Class - ${formData.day}, Period ${formData.period}`}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label-base">Subject</label>
            <select
              value={formData.subject_id}
              onChange={(e) => setFormData({ ...formData, subject_id: e.target.value })}
              className="input-base"
              required
            >
              <option value="">Select Subject</option>
              {subjects.map((sub) => (
                <option key={sub.id} value={sub.id}>{sub.name} ({sub.code})</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label-base">Faculty</label>
            <select
              value={formData.faculty_id}
              onChange={(e) => setFormData({ ...formData, faculty_id: e.target.value })}
              className="input-base"
              required
            >
              <option value="">Select Faculty</option>
              {faculties.map((fac) => (
                <option key={fac.id} value={fac.id}>{fac.name} ({fac.employee_id})</option>
              ))}
            </select>
          </div>
          <div className="flex gap-3 pt-4">
            {editingTimetable && (
              <button type="button" onClick={handleRemove} className="btn-ghost text-destructive flex-1">
                Remove
              </button>
            )}
            <button type="button" onClick={() => setIsModalOpen(false)} className="btn-ghost flex-1" disabled={submitting}>
              Cancel
            </button>
            <button type="submit" className="btn-primary flex-1" disabled={submitting}>
              {submitting ? 'Saving...' : 'Assign'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
