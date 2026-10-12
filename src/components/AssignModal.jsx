import React, { useState, useEffect } from 'react';
import { departmentApi } from '../api/departmentApi';
import { userApi } from '../api/userApi';

export const AssignModal = ({ complaint, isOpen, onClose, onAssign }) => {
  const [departments, setDepartments] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const [departmentId, setDepartmentId] = useState('');
  const [staffId, setStaffId] = useState('');
  const [priority, setPriority] = useState('MEDIUM');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      departmentApi.getActiveDepartments()
        .then((res) => setDepartments(res.data))
        .catch((err) => console.error(err));

      if (complaint) {
        setDepartmentId(complaint.department?.id || '');
        setStaffId(complaint.assignedStaff?.id || '');
        setPriority(complaint.priority || 'MEDIUM');
        setNotes('');
        setError('');
      }
    }
  }, [isOpen, complaint]);

  useEffect(() => {
    if (departmentId) {
      userApi.getStaffByDepartment(departmentId)
        .then((res) => setStaffList(res.data))
        .catch((err) => console.error(err));
    } else {
      setStaffList([]);
      setStaffId('');
    }
  }, [departmentId]);

  if (!isOpen || !complaint) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!departmentId) {
      setError('Please select a department to assign.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      await onAssign({
        departmentId: Number(departmentId),
        staffId: staffId ? Number(staffId) : null,
        priority,
        notes,
      });
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to assign complaint');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content shadow border-0 rounded-3">
          <div className="modal-header bg-primary text-white">
            <h5 className="modal-title">
              <i className="bi bi-person-check me-2"></i> Assign Complaint: {complaint.referenceNo}
            </h5>
            <button type="button" className="btn-close btn-close-white" onClick={onClose} disabled={submitting}></button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="modal-body p-4">
              {error && <div className="alert alert-danger py-2">{error}</div>}

              <div className="mb-3">
                <label className="form-label fw-semibold">Complaint Title</label>
                <div className="form-control-plaintext bg-light p-2 rounded">{complaint.title}</div>
              </div>

              <div className="mb-3">
                <label className="form-label fw-semibold">Assign Department *</label>
                <select
                  className="form-select"
                  value={departmentId}
                  onChange={(e) => setDepartmentId(e.target.value)}
                  required
                >
                  <option value="">-- Choose Department --</option>
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name} ({d.code})
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-3">
                <label className="form-label fw-semibold">Assign Staff Technician (Optional)</label>
                <select
                  className="form-select"
                  value={staffId}
                  onChange={(e) => setStaffId(e.target.value)}
                  disabled={!departmentId}
                >
                  <option value="">-- Assign to Department Pool (Unassigned Staff) --</option>
                  {staffList.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.fullName} ({s.email})
                    </option>
                  ))}
                </select>
                <div className="form-text">If left empty, any staff in this department can claim the complaint.</div>
              </div>

              <div className="mb-3">
                <label className="form-label fw-semibold">Priority</label>
                <select
                  className="form-select"
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                  <option value="CRITICAL">Critical</option>
                </select>
              </div>

              <div className="mb-3">
                <label className="form-label fw-semibold">Assignment Notes / Instructions</label>
                <textarea
                  className="form-control"
                  rows="3"
                  placeholder="Add specific instructions for the technician..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                ></textarea>
              </div>
            </div>

            <div className="modal-footer bg-light">
              <button type="button" className="btn btn-outline-secondary" onClick={onClose} disabled={submitting}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary px-4" disabled={submitting}>
                {submitting ? 'Assigning...' : 'Confirm Assignment'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
