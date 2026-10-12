import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { complaintApi } from '../../api/complaintApi';
import { useAuth } from '../../context/AuthContext';
import { StatusBadge, PriorityBadge } from '../../components/StatusBadge';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { AssignModal } from '../../components/AssignModal';
import { StatusUpdateModal } from '../../components/StatusUpdateModal';

export const ComplaintDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isStudent, isAdmin, isStaff } = useAuth();

  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionMessage, setActionMessage] = useState({ text: '', type: '' });

  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  const fetchComplaint = async () => {
    try {
      const res = await complaintApi.getComplaintById(id);
      setComplaint(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load complaint details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaint();
  }, [id]);

  const handleAssign = async (assignData) => {
    await complaintApi.assignComplaint(complaint.id, assignData);
    setActionMessage({ text: 'Complaint assigned successfully!', type: 'success' });
    fetchComplaint();
  };

  const handleUpdateStatus = async (statusData) => {
    await complaintApi.updateStatus(complaint.id, statusData);
    setActionMessage({ text: 'Status updated successfully!', type: 'success' });
    fetchComplaint();
  };

  const handleCancel = async () => {
    if (!window.confirm(`Are you sure you want to cancel complaint ${complaint.referenceNo}?`)) return;
    try {
      await complaintApi.cancelComplaint(complaint.id);
      setActionMessage({ text: 'Complaint cancelled successfully.', type: 'info' });
      fetchComplaint();
    } catch (err) {
      setActionMessage({ text: err.response?.data?.message || 'Could not cancel complaint.', type: 'danger' });
    }
  };

  const handleAddAttachment = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      alert('File size exceeds the 10MB limit.');
      return;
    }

    setUploadingImage(true);
    try {
      await complaintApi.addAttachment(complaint.id, file);
      setActionMessage({ text: 'Photo attached successfully!', type: 'success' });
      fetchComplaint();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to upload attachment.');
    } finally {
      setUploadingImage(false);
    }
  };

  if (loading) return <LoadingSpinner message="Loading complaint details..." />;

  if (error || !complaint) {
    return (
      <div className="alert alert-danger shadow-sm my-4">
        <h5><i className="bi bi-exclamation-triangle-fill me-2"></i> Error</h5>
        <p>{error || 'Complaint not found.'}</p>
        <button onClick={() => navigate(-1)} className="btn btn-outline-danger btn-sm">
          Go Back
        </button>
      </div>
    );
  }

  const canStudentCancel = isStudent && complaint.status === 'Reported' && !complaint.department && !complaint.assignedStaff;
  const canAssign = isAdmin;
  const canUpdateStatus = isAdmin || isStaff;

  return (
    <div className="py-2">
      {/* Top Header */}
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-2">
        <div>
          <button onClick={() => navigate(-1)} className="btn btn-sm btn-outline-secondary mb-2">
            <i className="bi bi-arrow-left me-1"></i> Back
          </button>
          <div className="d-flex align-items-center gap-2">
            <h3 className="fw-bold mb-0">Complaint Details</h3>
            <span className="badge bg-light text-primary border font-monospace fs-6 px-3 py-1">
              {complaint.referenceNo}
            </span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="d-flex flex-wrap gap-2">
          {canAssign && (
            <button className="btn btn-primary shadow-sm" onClick={() => setIsAssignModalOpen(true)}>
              <i className="bi bi-person-plus-fill me-1"></i> Assign Complaint
            </button>
          )}

          {canUpdateStatus && complaint.status !== 'Resolved' && complaint.status !== 'Cancelled' && (
            <button className="btn btn-dark shadow-sm" onClick={() => setIsStatusModalOpen(true)}>
              <i className="bi bi-gear-fill me-1"></i> Update Status
            </button>
          )}

          {canStudentCancel && (
            <button className="btn btn-outline-danger shadow-sm" onClick={handleCancel}>
              <i className="bi bi-x-circle me-1"></i> Cancel Complaint
            </button>
          )}
        </div>
      </div>

      {actionMessage.text && (
        <div className={`alert alert-${actionMessage.type} alert-dismissible fade show`} role="alert">
          {actionMessage.text}
          <button type="button" className="btn-close" onClick={() => setActionMessage({ text: '', type: '' })}></button>
        </div>
      )}

      <div className="row g-4">
        {/* Left Column: Complaint Details */}
        <div className="col-lg-8">
          <div className="card-custom p-4 bg-white shadow-sm mb-4">
            <div className="d-flex justify-content-between align-items-center border-bottom pb-3 mb-3">
              <div className="d-flex align-items-center gap-2">
                <PriorityBadge priority={complaint.priority} />
                <StatusBadge status={complaint.status} />
              </div>
              <small className="text-muted">
                Reported on: {new Date(complaint.createdAt).toLocaleString()}
              </small>
            </div>

            <h4 className="fw-bold text-dark mb-2">{complaint.title}</h4>
            <div className="mb-4 text-muted small">
              <i className="bi bi-geo-alt-fill text-danger me-1"></i> <strong>Location:</strong> {complaint.location}
            </div>

            <div className="p-3 bg-light rounded-3 mb-4">
              <h6 className="fw-semibold text-dark mb-2">Description:</h6>
              <p className="mb-0 text-secondary" style={{ whiteSpace: 'pre-wrap' }}>{complaint.description}</p>
            </div>

            {/* Resolution info if resolved */}
            {complaint.resolutionNotes && (
              <div className="alert alert-success border-success p-3 rounded-3 mb-4">
                <div className="d-flex justify-content-between align-items-center mb-1">
                  <h6 className="fw-bold mb-0 text-success">
                    <i className="bi bi-check-circle-fill me-1"></i> Official Resolution
                  </h6>
                  {complaint.resolvedAt && (
                    <small className="text-muted">
                      Resolved: {new Date(complaint.resolvedAt).toLocaleString()}
                    </small>
                  )}
                </div>
                <p className="mb-0 text-dark">{complaint.resolutionNotes}</p>
              </div>
            )}

            {/* Supporting Photos */}
            <div className="border-top pt-4">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="fw-bold mb-0">
                  <i className="bi bi-images me-1 text-primary"></i> Supporting Photos ({complaint.attachments?.length || 0})
                </h5>
                <label className="btn btn-sm btn-outline-primary mb-0" style={{ cursor: 'pointer' }}>
                  <i className="bi bi-upload me-1"></i> {uploadingImage ? 'Uploading...' : 'Add Photo'}
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    className="d-none"
                    disabled={uploadingImage}
                    onChange={handleAddAttachment}
                  />
                </label>
              </div>

              {complaint.attachments && complaint.attachments.length > 0 ? (
                <div className="row g-3">
                  {complaint.attachments.map((att) => (
                    <div key={att.id} className="col-sm-6 col-md-4">
                      <div className="card h-100 border rounded-3 overflow-hidden shadow-sm">
                        <a href={att.downloadUrl} target="_blank" rel="noopener noreferrer">
                          <img
                            src={att.downloadUrl}
                            alt={att.originalFileName}
                            className="card-img-top object-fit-cover"
                            style={{ height: 160 }}
                          />
                        </a>
                        <div className="card-body p-2 bg-light">
                          <div className="small text-truncate fw-semibold" title={att.originalFileName}>
                            {att.originalFileName}
                          </div>
                          <div className="d-flex justify-content-between text-muted" style={{ fontSize: '0.75rem' }}>
                            <span>{(att.fileSize / 1024).toFixed(1)} KB</span>
                            <a href={att.downloadUrl} download={att.originalFileName} className="text-primary text-decoration-none">
                              <i className="bi bi-download"></i>
                            </a>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-3 bg-light rounded text-center text-muted small">
                  No images attached to this complaint yet.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Assignment Details & Audit Timeline */}
        <div className="col-lg-4">
          {/* Assignment Information Card */}
          <div className="card-custom p-4 bg-white shadow-sm mb-4">
            <h5 className="fw-bold mb-3 border-bottom pb-2">Assignment Status</h5>

            <div className="mb-3">
              <span className="text-muted small d-block">Department</span>
              <div className="fw-semibold text-dark">
                {complaint.department ? (
                  <span className="badge bg-primary bg-opacity-10 text-primary p-2">
                    {complaint.department.name} ({complaint.department.code})
                  </span>
                ) : (
                  <span className="text-secondary fst-italic">Not Assigned Yet</span>
                )}
              </div>
            </div>

            <div className="mb-3">
              <span className="text-muted small d-block">Assigned Technician</span>
              <div className="fw-semibold text-dark">
                {complaint.assignedStaff ? (
                  <div className="d-flex align-items-center gap-2 mt-1">
                    <i className="bi bi-person-circle fs-5 text-secondary"></i>
                    <div>
                      <div>{complaint.assignedStaff.fullName}</div>
                      <small className="text-muted">{complaint.assignedStaff.email}</small>
                    </div>
                  </div>
                ) : (
                  <span className="text-secondary fst-italic">Unassigned</span>
                )}
              </div>
            </div>

            <div className="mb-3 border-top pt-3">
              <span className="text-muted small d-block">Reported By</span>
              <div className="fw-semibold text-dark mt-1">
                {complaint.student?.fullName || 'Student'} ({complaint.student?.email})
              </div>
              {complaint.student?.phoneNumber && (
                <small className="text-muted"><i className="bi bi-telephone"></i> {complaint.student.phoneNumber}</small>
              )}
            </div>
          </div>

          {/* Audit History Timeline */}
          <div className="card-custom p-4 bg-white shadow-sm">
            <h5 className="fw-bold mb-3 border-bottom pb-2">Status History</h5>
            <div className="timeline">
              {complaint.statusHistory && complaint.statusHistory.map((item, idx) => (
                <div key={idx} className="timeline-item">
                  <div className="timeline-point"></div>
                  <div className="fw-semibold text-dark">
                    {item.actionType} &bull; <StatusBadge status={item.newStatus} />
                  </div>
                  {item.notes && <div className="text-muted small my-1">{item.notes}</div>}
                  <div className="text-secondary" style={{ fontSize: '0.75rem' }}>
                    By {item.performedByName} &bull; {new Date(item.createdAt).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <AssignModal
        complaint={complaint}
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        onAssign={handleAssign}
      />

      <StatusUpdateModal
        complaint={complaint}
        isOpen={isStatusModalOpen}
        onClose={() => setIsStatusModalOpen(false)}
        onUpdateStatus={handleUpdateStatus}
      />
    </div>
  );
};
