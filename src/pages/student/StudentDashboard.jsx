import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { dashboardApi } from '../../api/dashboardApi';
import { useAuth } from '../../context/AuthContext';
import { StatusBadge, PriorityBadge } from '../../components/StatusBadge';
import { LoadingSpinner } from '../../components/LoadingSpinner';

export const StudentDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardApi.getStudentStats()
      .then((res) => setStats(res.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner message="Loading your dashboard..." />;

  return (
    <div>
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-3">
        <div>
          <h2 className="fw-bold mb-1">Welcome back, {user?.fullName || user?.username}!</h2>
          <p className="text-muted small mb-0">Track your reported issues and request facilities maintenance.</p>
        </div>
        <Link to="/student/submit" className="btn btn-primary px-4 py-2 shadow-sm fw-semibold">
          <i className="bi bi-plus-circle me-1"></i> Report a Problem
        </Link>
      </div>

      {/* Summary Cards */}
      <div className="row g-3 mb-4">
        <div className="col-sm-6 col-lg-3">
          <div className="card-custom stat-card">
            <div>
              <div className="text-muted small fw-medium">Total Complaints</div>
              <h3 className="fw-bold mt-1 mb-0">{stats?.totalComplaints || 0}</h3>
            </div>
            <div className="stat-icon bg-primary bg-opacity-10 text-primary">
              <i className="bi bi-card-checklist"></i>
            </div>
          </div>
        </div>

        <div className="col-sm-6 col-lg-3">
          <div className="card-custom stat-card">
            <div>
              <div className="text-muted small fw-medium">Reported (Pending)</div>
              <h3 className="fw-bold mt-1 mb-0 text-info">{stats?.reportedComplaints || 0}</h3>
            </div>
            <div className="stat-icon bg-info bg-opacity-10 text-info">
              <i className="bi bi-clock-history"></i>
            </div>
          </div>
        </div>

        <div className="col-sm-6 col-lg-3">
          <div className="card-custom stat-card">
            <div>
              <div className="text-muted small fw-medium">In Progress</div>
              <h3 className="fw-bold mt-1 mb-0 text-warning">{stats?.inProgressComplaints || 0}</h3>
            </div>
            <div className="stat-icon bg-warning bg-opacity-10 text-warning">
              <i className="bi bi-gear-wide-connected"></i>
            </div>
          </div>
        </div>

        <div className="col-sm-6 col-lg-3">
          <div className="card-custom stat-card">
            <div>
              <div className="text-muted small fw-medium">Resolved</div>
              <h3 className="fw-bold mt-1 mb-0 text-success">{stats?.resolvedComplaints || 0}</h3>
            </div>
            <div className="stat-icon bg-success bg-opacity-10 text-success">
              <i className="bi bi-check-circle-fill"></i>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Complaints */}
      <div className="card-custom bg-white shadow-sm mb-4">
        <div className="p-4 border-bottom d-flex justify-content-between align-items-center">
          <h5 className="fw-bold mb-0">My Recent Complaints</h5>
          <Link to="/student/complaints" className="btn btn-outline-primary btn-sm">
            View All Complaints
          </Link>
        </div>

        {stats?.recentComplaints && stats.recentComplaints.length > 0 ? (
          <div className="table-responsive">
            <table className="table table-hover table-custom">
              <thead>
                <tr>
                  <th>Ref No</th>
                  <th>Title</th>
                  <th>Category</th>
                  <th>Location</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentComplaints.map((c) => (
                  <tr key={c.id}>
                    <td><span className="fw-semibold text-primary">{c.referenceNo}</span></td>
                    <td className="fw-medium text-dark">{c.title}</td>
                    <td>{c.category}</td>
                    <td>{c.location}</td>
                    <td><PriorityBadge priority={c.priority} /></td>
                    <td><StatusBadge status={c.status} /></td>
                    <td><small className="text-muted">{new Date(c.createdAt).toLocaleDateString()}</small></td>
                    <td>
                      <Link to={`/student/complaints/${c.id}`} className="btn btn-sm btn-outline-secondary">
                        <i className="bi bi-eye"></i> View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-5 text-center text-muted">
            <i className="bi bi-check2-circle fs-1 text-success mb-2 d-block"></i>
            <p>You haven't reported any issues yet. Click "Report a Problem" to submit a maintenance ticket.</p>
          </div>
        )}
      </div>
    </div>
  );
};
