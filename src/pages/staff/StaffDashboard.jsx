import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { dashboardApi } from '../../api/dashboardApi';
import { complaintApi } from '../../api/complaintApi';
import { useAuth } from '../../context/AuthContext';
import { StatusBadge, PriorityBadge } from '../../components/StatusBadge';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { StatusUpdateModal } from '../../components/StatusUpdateModal';

export const StaffDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [actionMessage, setActionMessage] = useState('');

  const fetchStats = () => {
    dashboardApi.getStaffStats()
      .then((res) => setStats(res.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleOpenStatus = (c) => {
    setSelectedComplaint(c);
    setIsStatusModalOpen(true);
  };

  const handleStatusSuccess = async (statusData) => {
    try {
      await complaintApi.updateStatus(selectedComplaint.id, statusData);
      setActionMessage(`Task ${selectedComplaint.referenceNo} updated successfully!`);
      fetchStats();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update task status');
    }
  };

  if (loading) return <LoadingSpinner message="Loading your staff dashboard..." />;

  return (
    <div>
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-2">
        <div>
          <h2 className="fw-bold mb-1">Staff Technician Portal</h2>
          <p className="text-muted small mb-0">
            Welcome, <strong>{user?.fullName}</strong> &bull; Department: <strong>{user?.department?.name || 'Assigned Department'}</strong>
          </p>
        </div>
        <Link to="/staff/complaints" className="btn btn-primary px-4 py-2 shadow-sm fw-semibold">
          <i className="bi bi-tools me-1"></i> View Assigned Workload
        </Link>
      </div>

      {actionMessage && (
        <div className="alert alert-success alert-dismissible fade show" role="alert">
          <i className="bi bi-check-circle me-1"></i> {actionMessage}
          <button type="button" className="btn-close" onClick={() => setActionMessage('')}></button>
        </div>
      )}

      {/* Staff KPI Cards */}
      <div className="row g-3 mb-4">
        <div className="col-md-4">
          <div className="card-custom stat-card">
            <div>
              <div className="text-muted small">Total Tasks Assigned</div>
              <h3 className="fw-bold mt-1 mb-0">{stats?.totalComplaints || 0}</h3>
            </div>
            <div className="stat-icon bg-primary bg-opacity-10 text-primary">
              <i className="bi bi-clipboard2-check"></i>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card-custom stat-card border-warning">
            <div>
              <div className="text-muted small">Active (In Progress)</div>
              <h3 className="fw-bold mt-1 mb-0 text-warning">{stats?.inProgressComplaints || 0}</h3>
            </div>
            <div className="stat-icon bg-warning bg-opacity-10 text-warning">
              <i className="bi bi-gear-wide-connected"></i>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card-custom stat-card border-success">
            <div>
              <div className="text-muted small">Successfully Resolved</div>
              <h3 className="fw-bold mt-1 mb-0 text-success">{stats?.resolvedComplaints || 0}</h3>
            </div>
            <div className="stat-icon bg-success bg-opacity-10 text-success">
              <i className="bi bi-check-circle-fill"></i>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Assigned Tasks */}
      <div className="card-custom bg-white shadow-sm mb-4">
        <div className="p-4 border-bottom d-flex justify-content-between align-items-center">
          <h5 className="fw-bold mb-0">Active Assigned Tasks</h5>
          <Link to="/staff/complaints" className="btn btn-outline-primary btn-sm">
            View All Tasks
          </Link>
        </div>

        {stats?.recentComplaints && stats.recentComplaints.length > 0 ? (
          <div className="table-responsive">
            <table className="table table-hover table-custom">
              <thead>
                <tr>
                  <th>Ref No</th>
                  <th>Title & Location</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Date Assigned</th>
                  <th className="text-end">Action</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentComplaints.map((c) => (
                  <tr key={c.id}>
                    <td>
                      <Link to={`/student/complaints/${c.id}`} className="fw-bold text-primary font-monospace text-decoration-none">
                        {c.referenceNo}
                      </Link>
                    </td>
                    <td>
                      <div className="fw-semibold text-dark">{c.title}</div>
                      <small className="text-muted"><i className="bi bi-geo-alt"></i> {c.location}</small>
                    </td>
                    <td><PriorityBadge priority={c.priority} /></td>
                    <td><StatusBadge status={c.status} /></td>
                    <td><small className="text-muted">{new Date(c.createdAt).toLocaleDateString()}</small></td>
                    <td className="text-end">
                      <div className="d-flex justify-content-end gap-1">
                        {c.status !== 'Resolved' && (
                          <button
                            onClick={() => handleOpenStatus(c)}
                            className="btn btn-sm btn-primary"
                          >
                            <i className="bi bi-pencil-square me-1"></i> Update
                          </button>
                        )}
                        <Link to={`/student/complaints/${c.id}`} className="btn btn-sm btn-outline-secondary">
                          <i className="bi bi-eye"></i>
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-5 text-center text-muted">
            <i className="bi bi-emoji-smile fs-1 text-success mb-2 d-block"></i>
            <p>No pending maintenance tasks currently assigned to you.</p>
          </div>
        )}
      </div>

      <StatusUpdateModal
        complaint={selectedComplaint}
        isOpen={isStatusModalOpen}
        onClose={() => setIsStatusModalOpen(false)}
        onUpdateStatus={handleStatusSuccess}
      />
    </div>
  );
};
