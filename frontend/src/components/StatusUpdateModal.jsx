import React, { useState, useEffect } from 'react';

export const StatusUpdateModal = ({ complaint, isOpen, onClose, onUpdateStatus }) => {
  const [status, setStatus] = useState('');
  const [notes, setNotes] = useState('');
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen && complaint) {
      setStatus(complaint.status || 'In Progress');
      setNotes('');
      setResolutionNotes(complaint.resolutionNotes || '');
      setError('');
    }
  }, [isOpen, complaint]);

  if (!isOpen || !complaint) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (status === 'Resolved' && (!resolutionNotes || resolutionNotes.trim().length < 5)) {
      setError('Please provide a detailed resolution description (at least 5 characters).');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      await onUpdateStatus({
        status,
        notes,
        resolutionNotes: status === 'Resolved' ? resolutionNotes : null,
      });
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update status');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content shadow border-0 rounded-3">
          <div className="modal-header bg-dark text-white">
            <h5 className="modal-title">
              <i className="bi bi-arrow-repeat me-2"></i> Update Status: {complaint.referenceNo}
            </h5>
            <button type="button" className="btn-close btn-close-white" onClick={onClose} disabled={submitting}></button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="modal-body p-4">
              {error && <div className="alert alert-danger py-2">{error}</div>}

              <div className="mb-3">
                <label className="form-label fw-semibold">Current Status</label>
                <div>
                  <span className="badge bg-secondary p-2">{complaint.status}</span>
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label fw-semibold">Select New Status *</label>
                <select
                  className="form-select"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  required
                >
                  <option value="In Progress">In Progress (Work Underway)</option>
                  <option value="Resolved">Resolved (Completed)</option>
                  <option value="Reported">Reported (Pending)</option>
                </select>
              </div>

              {status === 'Resolved' && (
                <div className="mb-3 bg-light p-3 rounded border border-success">
                  <label className="form-label fw-bold text-success">
                    <i className="bi bi-check-circle-fill me-1"></i> Resolution Description *
                  </label>
                  <textarea
                    className="form-control"
                    rows="3"
                    placeholder="Describe the solution or maintenance action performed..."
                    value={resolutionNotes}
                    onChange={(e) => setResolutionNotes(e.target.value)}
                    required
                  ></textarea>
                  <div className="form-text">Explain what actions were taken to fix the reported problem.</div>
                </div>
              )}

              <div className="mb-3">
                <label className="form-label fw-semibold">Progress Notes (Optional)</label>
                <textarea
                  className="form-control"
                  rows="2"
                  placeholder="Optional log or remarks..."
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
                {submitting ? 'Updating...' : 'Save Status Update'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
