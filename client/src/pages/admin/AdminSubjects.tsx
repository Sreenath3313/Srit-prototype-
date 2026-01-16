import { useState, useEffect } from 'react';
import DataTable from '../../components/common/DataTable';
import Modal from '../../components/common/Modal';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorMessage from '../../components/common/ErrorMessage';
import EmptyState from '../../components/common/EmptyState';
import { subjectsApi, departmentsApi, Subject, Department } from '@/services/api';
import { toast } from 'sonner';

export default function AdminSubjects() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    department_id: '',
    semester: 1,
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
      const [subjectsData, deptData] = await Promise.all([
        subjectsApi.getAll(),
        departmentsApi.getAll()
      ]);
      setSubjects(subjectsData);
      setDepartments(deptData);
      if (deptData.length > 0 && !formData.department_id) {
        setFormData(prev => ({ ...prev, department_id: deptData[0].id }));
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
      key: 'code',
      header: 'Code',
      render: (subject: Subject) => (
        <span className="font-mono font-medium text-foreground">{subject.code}</span>
      ),
    },
    { key: 'name' as keyof Subject, header: 'Subject Name' },
    {
      key: 'department',
      header: 'Department',
      render: (subject: Subject) => (
        <span className="badge-primary">{subject.departments?.code || '-'}</span>
      ),
    },
    {
      key: 'semester',
      header: 'Semester',
      render: (subject: Subject) => (
        <span>Sem {subject.semester}</span>
      ),
    },
  ];

  const handleAdd = () => {
    setEditingSubject(null);
    setFormData({ 
      code: '', 
      name: '', 
      department_id: departments.length > 0 ? departments[0].id : '', 
      semester: 1 
    });
    setIsModalOpen(true);
  };

  const handleEdit = (subject: Subject) => {
    setEditingSubject(subject);
    setFormData({
      code: subject.code,
      name: subject.name,
      department_id: subject.department_id,
      semester: subject.semester,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (subject: Subject) => {
    if (confirm(`Are you sure you want to delete ${subject.name}?`)) {
      try {
        await subjectsApi.delete(subject.id);
        setSubjects(subjects.filter((s) => s.id !== subject.id));
        toast.success('Subject deleted successfully');
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to delete subject';
        toast.error(message);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingSubject) {
        const updated = await subjectsApi.update(editingSubject.id, formData);
        setSubjects(subjects.map((s) => s.id === editingSubject.id ? updated : s));
        toast.success('Subject updated successfully');
      } else {
        const created = await subjectsApi.create(formData);
        setSubjects([...subjects, created]);
        toast.success('Subject created successfully');
      }
      setIsModalOpen(false);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to save subject';
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="page-title">Subjects</h1>
          <p className="text-muted-foreground mt-1">Manage subjects and curriculum</p>
        </div>
        <button onClick={handleAdd} className="btn-primary flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Subject
        </button>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : error ? (
        <ErrorMessage message={error} onRetry={fetchData} />
      ) : subjects.length === 0 ? (
        <EmptyState
          title="No subjects found"
          description="Get started by adding your first subject"
          action={{
            label: "Add Subject",
            onClick: handleAdd
          }}
        />
      ) : (
        <DataTable
          columns={columns}
          data={subjects}
          onEdit={handleEdit}
          onDelete={handleDelete}
          searchable
          searchKeys={['code', 'name']}
        />
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingSubject ? 'Edit Subject' : 'Add Subject'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label-base">Subject Code</label>
            <input
              type="text"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
              placeholder="e.g., CS501"
              className="input-base font-mono"
              required
            />
          </div>
          <div>
            <label className="label-base">Subject Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Machine Learning"
              className="input-base"
              required
            />
          </div>
          <div>
            <label className="label-base">Department</label>
            <select
              value={formData.department_id}
              onChange={(e) => setFormData({ ...formData, department_id: e.target.value })}
              className="input-base"
              required
            >
              <option value="">Select Department</option>
              {departments.map((dept) => (
                <option key={dept.id} value={dept.id}>{dept.name} ({dept.code})</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label-base">Semester</label>
            <select
              value={formData.semester}
              onChange={(e) => setFormData({ ...formData, semester: parseInt(e.target.value) })}
              className="input-base"
            >
              {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                <option key={s} value={s}>Semester {s}</option>
              ))}
            </select>
          </div>
          <div className="flex gap-3 pt-4">
            <button type="button" onClick={() => setIsModalOpen(false)} className="btn-ghost flex-1" disabled={submitting}>
              Cancel
            </button>
            <button type="submit" className="btn-primary flex-1" disabled={submitting}>
              {submitting ? 'Saving...' : editingSubject ? 'Update' : 'Create'} Subject
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
