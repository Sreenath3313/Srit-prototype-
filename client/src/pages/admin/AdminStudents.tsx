import { useState, useEffect } from 'react';
import DataTable from '../../components/common/DataTable';
import Modal from '../../components/common/Modal';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorMessage from '../../components/common/ErrorMessage';
import EmptyState from '../../components/common/EmptyState';
import { studentsApi, sectionsApi, Student, Section } from '@/services/api';
import { toast } from 'sonner';

export default function AdminStudents() {
  const [students, setStudents] = useState<Student[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [formData, setFormData] = useState({
    roll_no: '',
    name: '',
    email: '',
    password: 'student123',
    section_id: '',
    admission_year: new Date().getFullYear(),
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
      const [studentsData, sectionsData] = await Promise.all([
        studentsApi.getAll(),
        sectionsApi.getAll()
      ]);
      setStudents(studentsData);
      setSections(sectionsData);
      if (sectionsData.length > 0 && !formData.section_id) {
        setFormData(prev => ({ ...prev, section_id: sectionsData[0].id }));
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch data';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      key: 'roll_no',
      header: 'Roll No',
      render: (student: Student) => (
        <span className="font-mono font-medium text-foreground">{student.roll_no}</span>
      ),
    },
    {
      key: 'name',
      header: 'Student',
      render: (student: Student) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="text-xs font-medium text-primary">
              {student.name.split(' ').map(n => n[0]).join('')}
            </span>
          </div>
          <p className="font-medium text-foreground">{student.name}</p>
        </div>
      ),
    },
    {
      key: 'section',
      header: 'Section',
      render: (student: Student) => (
        <span className="badge-primary">{student.sections?.name || '-'}</span>
      ),
    },
    {
      key: 'department',
      header: 'Department',
      render: (student: Student) => (
        <span className="text-muted-foreground">{student.sections?.departments?.code || '-'}</span>
      ),
    },
    {
      key: 'admission_year',
      header: 'Admission Year',
      render: (student: Student) => (
        <span className="text-muted-foreground">{student.admission_year}</span>
      ),
    },
  ];

  const handleAdd = () => {
    setEditingStudent(null);
    setFormData({
      roll_no: '',
      name: '',
      email: '',
      password: 'student123',
      section_id: sections.length > 0 ? sections[0].id : '',
      admission_year: new Date().getFullYear(),
    });
    setIsModalOpen(true);
  };

  const handleEdit = (student: Student) => {
    setEditingStudent(student);
    setFormData({
      roll_no: student.roll_no,
      name: student.name,
      email: '',
      password: '',
      section_id: student.section_id,
      admission_year: student.admission_year,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (student: Student) => {
    if (confirm(`Are you sure you want to delete ${student.name}?`)) {
      try {
        await studentsApi.delete(student.id);
        setStudents(students.filter((s) => s.id !== student.id));
        toast.success('Student deleted successfully');
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to delete student';
        toast.error(message);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingStudent) {
        const updateData = {
          roll_no: formData.roll_no,
          name: formData.name,
          section_id: formData.section_id,
          admission_year: formData.admission_year,
        };
        const updated = await studentsApi.update(editingStudent.id, updateData);
        setStudents(students.map((s) => s.id === editingStudent.id ? updated : s));
        toast.success('Student updated successfully');
      } else {
        const created = await studentsApi.create(formData);
        setStudents([...students, created]);
        toast.success('Student created successfully');
      }
      setIsModalOpen(false);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to save student';
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="page-title">Students</h1>
          <p className="text-muted-foreground mt-1">Manage student records and information</p>
        </div>
        <div className="flex gap-3">
          <button className="btn-outline flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            Import
          </button>
          <button onClick={handleAdd} className="btn-primary flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Student
          </button>
        </div>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : error ? (
        <ErrorMessage message={error} onRetry={fetchData} />
      ) : students.length === 0 ? (
        <EmptyState
          title="No students found"
          description="Get started by adding your first student"
          action={{
            label: "Add Student",
            onClick: handleAdd
          }}
        />
      ) : (
        <DataTable
          columns={columns}
          data={students}
          onEdit={handleEdit}
          onDelete={handleDelete}
          searchable
          searchKeys={['roll_no', 'name']}
        />
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingStudent ? 'Edit Student' : 'Add Student'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label-base">Roll Number</label>
              <input
                type="text"
                value={formData.roll_no}
                onChange={(e) => setFormData({ ...formData, roll_no: e.target.value.toUpperCase() })}
                placeholder="e.g., 22CS101"
                className="input-base font-mono"
                required
              />
            </div>
            <div>
              <label className="label-base">Full Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., John Doe"
                className="input-base"
                required
              />
            </div>
            {!editingStudent && (
              <>
                <div>
                  <label className="label-base">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="e.g., john@srit.edu"
                    className="input-base"
                    required
                  />
                </div>
                <div>
                  <label className="label-base">Password</label>
                  <input
                    type="text"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="Default: student123"
                    className="input-base"
                    required
                  />
                </div>
              </>
            )}
            <div>
              <label className="label-base">Section</label>
              <select
                value={formData.section_id}
                onChange={(e) => setFormData({ ...formData, section_id: e.target.value })}
                className="input-base"
                required
              >
                <option value="">Select Section</option>
                {sections.map((sec) => (
                  <option key={sec.id} value={sec.id}>
                    {sec.name} - {sec.departments?.name} (Year {sec.year})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label-base">Admission Year</label>
              <input
                type="number"
                value={formData.admission_year}
                onChange={(e) => setFormData({ ...formData, admission_year: parseInt(e.target.value) })}
                className="input-base"
                min={2000}
                max={2100}
                required
              />
            </div>
          </div>
          <div className="flex gap-3 pt-4">
            <button type="button" onClick={() => setIsModalOpen(false)} className="btn-ghost flex-1" disabled={submitting}>
              Cancel
            </button>
            <button type="submit" className="btn-primary flex-1" disabled={submitting}>
              {submitting ? 'Saving...' : editingStudent ? 'Update' : 'Add'} Student
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
