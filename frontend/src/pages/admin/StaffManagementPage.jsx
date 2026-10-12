import React, { useState, useEffect } from 'react';
import { userApi } from '../../api/userApi';
import { departmentApi } from '../../api/departmentApi';
import { LoadingSpinner } from '../../components/LoadingSpinner';

export const StaffManagementPage = () => {
  const [staffList, setStaffList] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    fullName: '',
    phoneNumber: '',
    departmentId: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  const fetchData = async () => {
    try {
      const [staffRes, deptRes] = await Promise.all([
        userApi.getUsersByRole('ROLE_STAFF'),
        departmentApi.getActiveDepartments(),
      ]);
      setStaffList(staffRes.data);
      setDepartments(deptRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.departmentId) {
      setMessage({ text: 'Please select a department for the staff member.', type: 'danger' });
      return;
    }

    setSubmitting(true);
    setMessage({ text: '', type: '' });

    try {
      await userApi.createStaff({
        ...formData,
        departmentId: Number(formData.departmentId),
      });

      setMessage({ text: `Staff account ${formData.username} created successfully!`, type: 'success' });
      setModalOpen(false);
      setFormData({
        username: '',
        email: '',
        password: '',
        fullName: '',
        phoneNumber: '',
        departmentId: '',
      });
      fetchData();
    } catch (err) {
      setMessage({ text: err.response?.data?.message || 'Failed to create staff account', type: 'danger' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (id, currentActive, name) => {
    try {
      await userApi.toggleUserStatus(id, !currentActive);
      setMessage({
        text: `Staff user ${name} has been ${!currentActive ? 'activated' : 'deactivated'}.`,
        type: 'info',
      });
      fetchData();
    } catch (err) {
      setMessage({ text: err.response?.data?.message || 'Status change failed', type: 'danger' });
    }
  };

  return (
    <div>
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-2">
        <div>
          <h2 className="fw-bold mb-1">Staff Management</h2>
          <p className="text-muted small mb-0">Create and oversee technician and departmental staff accounts.</p>
        </div>
        <button className="btn btn-primary shadow-sm" onClick={() => setModalOpen(true)}>
          <i className="bi bi-person-plus-fill me-1"></i> Register New Staff
        </button>
      </div>

      {message.text && (
        <div className={`alert alert-${message.type} alert-dismissible fade show`} role="alert">
          {message.text}
          <button type="button" className="btn-close" onClick={() => setMessage({ text: '', type: '' })}></button>
        </div>
      )}

      {loading ? (
        <LoadingSpinner message="Loading staff accounts..." />
      ) : (
        <div className="card-custom bg-white shadow-sm overflow-hidden">
          <div className="table-responsive">
            <table className="table table-hover table-custom">
              <thead>
                <tr>
                  <th>Staff Member</th>
                  <th>Username</th>
                  <th>Email</th>
                  <th>Assigned Department</th>
                  <th>Phone</th>
                  <th>Status</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {staffList.map((s) => (
                  <tr key={s.id}>
                    <td>
                      <div className="fw-bold text-dark">{s.fullName}</div>
                    </td>
                    <td><code>{s.username}</code></td>
                    <td>{s.email}</td>
                    <td>
                      {s.department ? (
                        <span className="badge bg-primary bg-opacity-10 text-primary">
                          {s.department.name}
                        </span>
                      ) : (
                        <span className="text-muted small">None</span>
                      )}
                    </td>
                    <td>{s.phoneNumber || '-'}</td>
                    <td>
                      {s.active ? (
                        <span className="badge bg-success">Active</span>
                      ) : (
                        <span className="badge bg-danger">Deactivated</span>
                      )}
                    </td>
                    <td className="text-end">
                      <button
                        onClick={() => handleToggleStatus(s.id, s.active, s.fullName)}
                        className={`btn btn-sm ${s.active ? 'btn-outline-danger' : 'btn-outline-success'}`}
                      >
                        {s.active ? 'Deactivate' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create Staff Modal */}
      {modalOpen && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content shadow border-0 rounded-3">
              <div className="modal-header bg-primary text-white">
                <h5 className="modal-title">Register New Staff Member</h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setModalOpen(false)}></button>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="modal-body p-4">
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Full Name *</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. David Water"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      required
                    />
                  </div>

                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label fw-semibold">Username *</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="e.g. staff_water"
                        value={formData.username}
                        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                        required
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label fw-semibold">Email Address *</label>
                      <input
                        type="email"
                        className="form-control"
                        placeholder="e.g. water@campus.edu"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-semibold">Assign to Department *</label>
                    <select
                      className="form-select"
                      value={formData.departmentId}
                      onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
                      required
                    >
                      <option value="">-- Choose Department --</option>
                      {departments.map((d) => (
                        <option key={d.id} value={d.id}>{d.name} ({d.code})</option>
                      ))}
                    </select>
                  </div>

                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label fw-semibold">Password *</label>
                      <input
                        type="password"
                        className="form-control"
                        placeholder="Min 6 characters"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        required
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label fw-semibold">Phone Number</label>
                      <input
                        type="tel"
                        className="form-control"
                        placeholder="e.g. +1-555-0102"
                        value={formData.phoneNumber}
                        onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                      />
                    </div>
                  </div>
                </div>

                <div className="modal-footer bg-light">
                  <button type="button" className="btn btn-outline-secondary" onClick={() => setModalOpen(false)} disabled={submitting}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary px-4" disabled={submitting}>
                    {submitting ? 'Creating...' : 'Create Staff Member'}
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
