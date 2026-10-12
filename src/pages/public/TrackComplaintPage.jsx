import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { complaintApi } from '../../api/complaintApi';
import { StatusBadge, PriorityBadge } from '../../components/StatusBadge';
import { LoadingSpinner } from '../../components/LoadingSpinner';

export const TrackComplaintPage = () => {
  const [searchParams] = useSearchParams();
  const [referenceNo, setReferenceNo] = useState(searchParams.get('ref') || '');
  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchComplaint = async (ref) => {
    if (!ref.trim()) return;
    setLoading(true);
    setError('');
    setComplaint(null);
    try {
      const res = await complaintApi.getComplaintByRef(ref.trim());
      setComplaint(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'No complaint found with reference number: ' + ref);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const initialRef = searchParams.get('ref');
    if (initialRef) {
      setReferenceNo(initialRef);
      fetchComplaint(initialRef);
    }
  }, [searchParams]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchComplaint(referenceNo);
  };

  return (
    <div className="py-3">
      <div className="card-custom p-4 bg-white shadow-sm mb-4">
        <h3 className="fw-bold mb-3"><i className="bi bi-search text-primary me-2"></i> Track Complaint Status</h3>
        <p className="text-muted small mb-4">
          Enter your unique complaint reference number (e.g. <code>CMP-20261010-A101</code>) to track current progress and history.
        </p>

        <form onSubmit={handleSearch} className="row g-2 align-items-center">
          <div className="col-sm-8 col-md-6">
            <input
              type="text"
              className="form-control form-control-lg"
              placeholder="Enter Reference Number..."
              value={referenceNo}
              onChange={(e) => setReferenceNo(e.target.value)}
              required
            />
          </div>
          <div className="col-sm-4 col-md-3">
            <button type="submit" className="btn btn-primary btn-lg w-100 fw-semibold" disabled={loading}>
              {loading ? 'Searching...' : 'Search Status'}
            </button>
          </div>
        </form>
      </div>

      {loading && <LoadingSpinner message="Locating complaint record..." />}

      {error && (
        <div className="alert alert-danger shadow-sm">
          <i className="bi bi-exclamation-circle-fill me-2"></i> {error}
        </div>
      )}

      {complaint && (
        <div className="card-custom p-4 bg-white shadow-sm">
          <div className="d-flex flex-wrap justify-content-between align-items-center border-bottom pb-3 mb-4 gap-2">
            <div>
              <span className="text-muted small">Reference: </span>
              <span className="fw-bold fs-5 text-primary">{complaint.referenceNo}</span>
            </div>
            <div className="d-flex align-items-center gap-2">
              <PriorityBadge priority={complaint.priority} />
              <StatusBadge status={complaint.status} />
            </div>
          </div>

          <h4 className="fw-bold mb-2">{complaint.title}</h4>
          <p className="text-secondary mb-4">{complaint.description}</p>

          <div className="row g-3 bg-light p-3 rounded-3 mb-4">
            <div className="col-md-3">
              <span className="text-muted small d-block">Category</span>
              <strong className="text-dark">{complaint.category}</strong>
            </div>
            <div className="col-md-3">
              <span className="text-muted small d-block">Location</span>
              <strong className="text-dark">{complaint.location}</strong>
            </div>
            <div className="col-md-3">
              <span className="text-muted small d-block">Assigned Department</span>
              <strong className="text-dark">{complaint.department?.name || 'Pending Assignment'}</strong>
            </div>
            <div className="col-md-3">
              <span className="text-muted small d-block">Technician Staff</span>
              <strong className="text-dark">{complaint.assignedStaff?.fullName || 'Not yet assigned'}</strong>
            </div>
          </div>

          {complaint.resolutionNotes && (
            <div className="alert alert-success border-success">
              <h6 className="fw-bold mb-1"><i className="bi bi-check-circle me-1"></i> Resolution Notes:</h6>
              <p className="mb-0">{complaint.resolutionNotes}</p>
              {complaint.resolvedAt && (
                <small className="text-muted d-block mt-1">
                  Resolved on: {new Date(complaint.resolvedAt).toLocaleString()}
                </small>
              )}
            </div>
          )}

          {/* Timeline */}
          <h5 className="fw-bold mt-4 mb-3">Status History & Audit Trail</h5>
          <div className="timeline">
            {complaint.statusHistory && complaint.statusHistory.map((item, idx) => (
              <div key={idx} className="timeline-item">
                <div className="timeline-point"></div>
                <div className="fw-semibold text-dark">
                  {item.actionType}: <StatusBadge status={item.newStatus} />
                </div>
                <div className="text-muted small">{item.notes}</div>
                <div className="text-secondary" style={{ fontSize: '0.75rem' }}>
                  By: {item.performedByName} ({item.performedByRole}) &bull; {new Date(item.createdAt).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
