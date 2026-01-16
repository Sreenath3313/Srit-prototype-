import { useState, useEffect } from 'react';
import DataTable from '../../components/common/DataTable';
import Modal from '../../components/common/Modal';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorMessage from '../../components/common/ErrorMessage';
import EmptyState from '../../components/common/EmptyState';
import { sectionsApi, departmentsApi, Section, Department } from '@/services/api';
import { toast } from 'sonner';

export default function AdminSections() {
  const [sections, setSections] = useState<Section[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSection, setEditingSection] = useState<Section | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    department_id: '',
    year: 1,
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
      const [sectionsData, deptData] = await Promise.all([
        sectionsApi.getAll(),
        departmentsApi.getAll()
      ]);
      setSections(sectionsData);
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
      key: 'name',
      header: 'Section',
      render: (section: Section) => (
        <span className="font-semibold text-foreground">{section.name}</span>
      ),
    },
    {
      key: 'department',
      header: 'Department',
      render: (section: Section) => (
        <span className="badge-primary">{section.departments?.code || '-'}</span>
      ),
    },
    {
      key: 'year',
      header: 'Year',
      render: (section: Section) => (
        <span className="text-muted-foreground">Year {section.year}</span>
      ),
    },
  ];

  const handleAdd = () => {
    setEditingSection(null);
    setFormData({ 
      name: '', 
      department_id: departments.length > 0 ? departments[0].id : '', 
      year: 1 
    });
    setIsModalOpen(true);
  };

  const handleEdit = (section: Section) => {
    setEditingSection(section);
    setFormData({
      name: section.name,
      department_id: section.department_id,
      year: section.year,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (section: Section) => {
    if (confirm(`Are you sure you want to delete ${section.name}?`)) {
      try {
        await sectionsApi.delete(section.id);
        setSections(sections.filter((s) => s.id !== section.id));
        toast.success('Section deleted successfully');
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to delete section';
        toast.error(message);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingSection) {
        const updated = await sectionsApi.update(editingSection.id, formData);
        setSections(sections.map((s) => s.id === editingSection.id ? updated : s));
        toast.success('Section updated successfully');
      } else {
        const created = await sectionsApi.create(formData);
        setSections([...sections, created]);
        toast.success('Section created successfully');
      }
      setIsModalOpen(false);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to save section';
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="page-title">Sections</h1>
          <p className="text-muted-foreground mt-1">Manage class sections and assignments</p>
        </div>
        <button onClick={handleAdd} className="btn-primary flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Section
        </button>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : error ? (
        <ErrorMessage message={error} onRetry={fetchData} />
      ) : sections.length === 0 ? (
        <EmptyState
          title="No sections found"
          description="Get started by adding your first section"
          action={{
            label: "Add Section",
            onClick: handleAdd
          }}
        />
      ) : (
        <DataTable
          columns={columns}
          data={sections}
          onEdit={handleEdit}
          onDelete={handleDelete}
          searchable
          searchKeys={['name']}
        />
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingSection ? 'Edit Section' : 'Add Section'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label-base">Section Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value.toUpperCase() })}
              placeholder="e.g., CSE-A"
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
            <label className="label-base">Year</label>
            <select
              value={formData.year}
              onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
              className="input-base"
            >
              {[1, 2, 3, 4].map((y) => (
                <option key={y} value={y}>Year {y}</option>
              ))}
            </select>
          </div>
          <div className="flex gap-3 pt-4">
            <button type="button" onClick={() => setIsModalOpen(false)} className="btn-ghost flex-1" disabled={submitting}>
              Cancel
            </button>
            <button type="submit" className="btn-primary flex-1" disabled={submitting}>
              {submitting ? 'Saving...' : editingSection ? 'Update' : 'Create'} Section
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
