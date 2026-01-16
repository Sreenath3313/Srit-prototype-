import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DataTable from '../../components/common/DataTable';
import Modal from '../../components/common/Modal';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorMessage from '../../components/common/ErrorMessage';
import EmptyState from '../../components/common/EmptyState';
import { facultyApi, departmentsApi, Faculty, Department } from '@/services/api';
import { toast } from 'sonner';

export default function AdminFaculty() {
  const navigate = useNavigate();
  const [faculty, setFaculty] = useState<Faculty[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFaculty, setEditingFaculty] = useState<Faculty | null>(null);
  const [formData, setFormData] = useState({
    employee_id: '',
    name: '',
    email: '',
    password: 'faculty123',
    department_id: '',
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
      const [facultyData, deptData] = await Promise.all([
        facultyApi.getAll(),
        departmentsApi.getAll()
      ]);
      setFaculty(facultyData);
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
      key: 'employee_id',
      header: 'Employee ID',
      render: (fac: Faculty) => (
        <span className="font-mono font-medium text-foreground">{fac.employee_id}</span>
      ),
    },
    {
      key: 'name',
      header: 'Faculty',
      render: (fac: Faculty) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
            <span className="text-sm font-medium text-secondary-foreground">
              {fac.name.split(' ').map(n => n[0]).join('')}
            </span>
          </div>
          <p className="font-medium text-foreground">{fac.name}</p>
        </div>
      ),
    },
    {
      key: 'department',
      header: 'Department',
      render: (fac: Faculty) => (
        <span className="badge-primary">{fac.departments?.code || '-'}</span>
      ),
    },
    {
      key: 'assignments',
      header: 'Assignments',
      render: (fac: Faculty) => {
        const assignmentCount = fac.timetable_count || 0;
        return (
          <div className="flex items-center gap-2">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${assignmentCount > 0 ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
              {assignmentCount} {assignmentCount === 1 ? 'class' : 'classes'}
            </span>
            {assignmentCount === 0 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  navigate('/admin/assignments');
                }}
                className="text-xs text-primary hover:underline"
              >
                Assign Now
              </button>
            )}
          </div>
        );
      }
    },
    {
      key: 'created_at',
      header: 'Joined',
      render: (fac: Faculty) => (
        <span className="text-muted-foreground">
          {fac.created_at ? new Date(fac.created_at).toLocaleDateString() : '-'}
        </span>
      ),
    },
  ];

  const handleAdd = () => {
    setEditingFaculty(null);
    setFormData({
      employee_id: '',
      name: '',
      email: '',
      password: 'faculty123',
      department_id: departments.length > 0 ? departments[0].id : '',
    });
    setIsModalOpen(true);
  };

  const handleEdit = (fac: Faculty) => {
    setEditingFaculty(fac);
    setFormData({
      employee_id: fac.employee_id,
      name: fac.name,
      email: '',
      password: '',
      department_id: fac.department_id,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (fac: Faculty) => {
    if (confirm(`Are you sure you want to delete ${fac.name}?`)) {
      try {
        await facultyApi.delete(fac.id);
        setFaculty(faculty.filter((f) => f.id !== fac.id));
        toast.success('Faculty deleted successfully');
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to delete faculty';
        toast.error(message);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingFaculty) {
        const updateData = {
          employee_id: formData.employee_id,
          name: formData.name,
          department_id: formData.department_id,
        };
        const updated = await facultyApi.update(editingFaculty.id, updateData);
        setFaculty(faculty.map((f) => f.id === editingFaculty.id ? updated : f));
        toast.success('Faculty updated successfully');
      } else {
        const created = await facultyApi.create(formData);
        setFaculty([...faculty, created]);
        toast.success('Faculty created successfully');
        
        // Prompt to assign classes
        const shouldAssign = window.confirm(
          `Faculty ${formData.name} created successfully!\n\nWould you like to assign classes now?`
        );
        if (shouldAssign) {
          navigate('/admin/assignments');
        }
      }
      setIsModalOpen(false);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to save faculty';
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="page-title">Faculty</h1>
          <p className="text-muted-foreground mt-1">Manage faculty members and their assignments</p>
        </div>
        <button onClick={handleAdd} className="btn-primary flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Faculty
        </button>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : error ? (
        <ErrorMessage message={error} onRetry={fetchData} />
      ) : faculty.length === 0 ? (
        <EmptyState
          title="No faculty found"
          description="Get started by adding your first faculty member"
          action={{
            label: "Add Faculty",
            onClick: handleAdd
          }}
        />
      ) : (
        <DataTable
          columns={columns}
          data={faculty}
          onEdit={handleEdit}
          onDelete={handleDelete}
          searchable
          searchKeys={['employee_id', 'name']}
        />
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingFaculty ? 'Edit Faculty' : 'Add Faculty'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label-base">Employee ID</label>
              <input
                type="text"
                value={formData.employee_id}
                onChange={(e) => setFormData({ ...formData, employee_id: e.target.value.toUpperCase() })}
                placeholder="e.g., FAC001"
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
                placeholder="e.g., Dr. John Doe"
                className="input-base"
                required
              />
            </div>
            {!editingFaculty && (
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
                    placeholder="Default: faculty123"
                    className="input-base"
                    required
                  />
                </div>
              </>
            )}
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
          </div>
          <div className="flex gap-3 pt-4">
            <button type="button" onClick={() => setIsModalOpen(false)} className="btn-ghost flex-1" disabled={submitting}>
              Cancel
            </button>
            <button type="submit" className="btn-primary flex-1" disabled={submitting}>
              {submitting ? 'Saving...' : editingFaculty ? 'Update' : 'Add'} Faculty
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
