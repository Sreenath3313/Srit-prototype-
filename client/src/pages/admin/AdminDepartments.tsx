import { useState, useEffect } from 'react';
import DataTable from '../../components/common/DataTable';
import Modal from '../../components/common/Modal';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorMessage from '../../components/common/ErrorMessage';
import EmptyState from '../../components/common/EmptyState';
import { departmentsApi, Department } from '@/services/api';
import { toast } from 'sonner';

export default function AdminDepartments() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null);
  const [formData, setFormData] = useState({ name: '', code: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await departmentsApi.getAll();
      setDepartments(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch departments';
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
      render: (dept: Department) => (
        <span className="badge-primary font-mono">{dept.code}</span>
      ),
    },
    { key: 'name' as keyof Department, header: 'Department Name' },
    {
      key: 'created_at',
      header: 'Created',
      render: (dept: Department) => (
        <span className="text-muted-foreground">
          {dept.created_at ? new Date(dept.created_at).toLocaleDateString() : '-'}
        </span>
      ),
    },
  ];

  const handleAdd = () => {
    setEditingDepartment(null);
    setFormData({ name: '', code: '' });
    setIsModalOpen(true);
  };

  const handleEdit = (dept: Department) => {
    setEditingDepartment(dept);
    setFormData({ name: dept.name, code: dept.code });
    setIsModalOpen(true);
  };

  const handleDelete = async (dept: Department) => {
    if (confirm(`Are you sure you want to delete ${dept.name}?`)) {
      try {
        await departmentsApi.delete(dept.id);
        setDepartments(departments.filter((d) => d.id !== dept.id));
        toast.success('Department deleted successfully');
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to delete department';
        toast.error(message);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingDepartment) {
        const updated = await departmentsApi.update(editingDepartment.id, formData);
        setDepartments(departments.map((d) => d.id === editingDepartment.id ? updated : d));
        toast.success('Department updated successfully');
      } else {
        const created = await departmentsApi.create(formData);
        setDepartments([...departments, created]);
        toast.success('Department created successfully');
      }
      setIsModalOpen(false);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to save department';
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="page-title">Departments</h1>
          <p className="text-muted-foreground mt-1">Manage academic departments and their details</p>
        </div>
        <button onClick={handleAdd} className="btn-primary flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Department
        </button>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : error ? (
        <ErrorMessage message={error} onRetry={fetchDepartments} />
      ) : departments.length === 0 ? (
        <EmptyState
          title="No departments found"
          description="Get started by adding your first department"
          action={{
            label: "Add Department",
            onClick: handleAdd
          }}
        />
      ) : (
        <DataTable
          columns={columns}
          data={departments}
          onEdit={handleEdit}
          onDelete={handleDelete}
          searchable
          searchKeys={['name', 'code']}
        />
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingDepartment ? 'Edit Department' : 'Add Department'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label-base">Department Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Computer Science Engineering"
              className="input-base"
              required
            />
          </div>
          <div>
            <label className="label-base">Department Code</label>
            <input
              type="text"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
              placeholder="e.g., CSE"
              className="input-base font-mono"
              required
            />
          </div>
          <div className="flex gap-3 pt-4">
            <button type="button" onClick={() => setIsModalOpen(false)} className="btn-ghost flex-1" disabled={submitting}>
              Cancel
            </button>
            <button type="submit" className="btn-primary flex-1" disabled={submitting}>
              {submitting ? 'Saving...' : editingDepartment ? 'Update' : 'Create'} Department
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
