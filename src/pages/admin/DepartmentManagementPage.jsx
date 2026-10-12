import React, { useState, useEffect } from 'react';
import { departmentApi } from '../../api/departmentApi';
import { LoadingSpinner } from '../../components/LoadingSpinner';

export const DepartmentManagementPage = () => {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingDept, setEditingDept] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    contactEmail: '',
    contactPhone: '',
    active: true,
  });
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  const fetchDepartments = async () => {
    try {
      const res = await departmentApi.getAllDepartments();
      setDepartments(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  const handleOpenModal = (dept = null) => {
    if (dept) {
      setEditingDept(dept);
      setFormData({
        name: dept.name,
        code: dept.code,
        description: dept.description || '',
        contactEmail: dept.contactEmail || '',
        contactPhone: dept.contactPhone || '',
        active: dept.active,
      });
    } else {
      setEditingDept(null);
      setFormData({
        name: '',
        code: '',
        description: '',
        contactEmail: '',
        contactPhone: '',
        active: true,
      });
    }
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage({ text: '', type: '' });

    try {
      if (editingDept) {
        await departmentApi.updateDepartment(editingDept.id, formData);
        setMessage({ text: `Department ${formData.name} updated successfully!`, type: 'success' });
      } else {
        await departmentApi.createDepartment(formData);
        setMessage({ text: `Department ${formData.name} created successfully!`, type: 'success' });
      }
      setModalOpen(false);
      fetchDepartments();
    } catch (err) {
      setMessage({ text: err.response?.data?.message || 'Operation failed', type: 'danger' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeactivate = async (id, name) => {
    if (!window.confirm(`Deactivate department ${name}?`)) return;
    try {
      await departmentApi.deleteDepartment(id);
      setMessage({ text: `Department ${name} deactivated.`, type: 'info' });
      fetchDepartments();
    } catch (err) {
      setMessage({ text: err.response?.data?.message || 'Deactivation failed', type: 'danger' });
    }
  };

  return (
    <div>
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-2">
        <div>
          <h2 className="fw-bold mb-1">Department Management</h2>
          <p className="text-muted small mb-0">Configure campus maintenance departments and contact details.</p>
        </div>
        <button className="btn btn-primary shadow-sm" onClick={() => handleOpenModal()}>
          <i className="bi bi-plus-circle me-1"></i> Add New Department
        </button>
      </div>

      {message.text && (
        <div className={`alert alert-${message.type} alert-dismissible fade show`} role="alert">
          {message.text}
          <button type="button" className="btn-close" onClick={() => setMessage({ text: '', type: '' })}></button>
        </div>
      )}

      {loading ? (
        <LoadingSpinner message="Loading departments..." />
      ) : (
        <div className="card-custom bg-white shadow-sm overflow-hidden">
          <div className="table-responsive">
            <table className="table table-hover table-custom">
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Department Name</th>
                  <th>Contact Email</th>
                  <th>Phone</th>
                  <th>Status</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {departments.map((d) => (
                  <tr key={d.id}>
                    <td><span className="badge bg-light text-dark font-monospace fs-6">{d.code}</span></td>
                    <td>
                      <div className="fw-semibold text-dark">{d.name}</div>
                      <small className="text-muted">{d.description}</small>
                    </td>
                    <td><a href={`mailto:${d.contactEmail}`}>{d.contactEmail || '-'}</a></td>
                    <td>{d.contactPhone || '-'}</td>
                    <td>
                      {d.active ? (
                        <span className="badge bg-success">Active</span>
                      ) : (
                        <span className="badge bg-secondary">Inactive</span>
                      )}
                    </td>
                    <td className="text-end">
                      <div className="d-flex justify-content-end gap-1">
                        <button onClick={() => handleOpenModal(d)} className="btn btn-sm btn-outline-secondary" title="Edit">
                          <i className="bi bi-pencil"></i>
                        </button>
                        {d.active && (
                          <button onClick={() => handleDeactivate(d.id, d.name)} className="btn btn-sm btn-outline-danger" title="Deactivate">
                            <i className="bi bi-slash-circle"></i>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create/Edit Modal */}
      {modalOpen && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content shadow border-0 rounded-3">
              <div className="modal-header bg-primary text-white">
                <h5 className="modal-title">
                  {editingDept ? 'Edit Department' : 'Create New Department'}
                </h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setModalOpen(false)}></button>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="modal-body p-4">
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Department Name *</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. Electrical Maintenance"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-semibold">Department Code *</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. ELEC"
                      value={formData.code}
                      onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                      required
                    />
                  </div>

                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label fw-semibold">Contact Email</label>
                      <input
                        type="email"
                        className="form-control"
                        placeholder="e.g. elec@campus.edu"
                        value={formData.contactEmail}
                        onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label fw-semibold">Contact Phone</label>
                      <input
                        type="tel"
                        className="form-control"
                        placeholder="e.g. +1-555-0101"
                        value={formData.contactPhone}
                        onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-semibold">Description</label>
                    <textarea
                      className="form-control"
                      rows="2"
                      placeholder="Description of duties and areas of responsibility..."
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    ></textarea>
                  </div>

                  <div className="form-check form-switch mt-2">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="activeCheck"
                      checked={formData.active}
                      onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                    />
                    <label className="form-check-label fw-semibold" htmlFor="activeCheck">Department Active</label>
                  </div>
                </div>

                <div className="modal-footer bg-light">
                  <button type="button" className="btn btn-outline-secondary" onClick={() => setModalOpen(false)} disabled={submitting}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary px-4" disabled={submitting}>
                    {submitting ? 'Saving...' : 'Save Department'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
