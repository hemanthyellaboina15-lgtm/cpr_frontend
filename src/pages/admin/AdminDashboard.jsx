import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { dashboardApi } from '../../api/dashboardApi';
import { complaintApi } from '../../api/complaintApi';
import { StatusBadge, PriorityBadge } from '../../components/StatusBadge';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { AssignModal } from '../../components/AssignModal';

export const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [actionMessage, setActionMessage] = useState('');

  const fetchStats = () => {
    dashboardApi.getAdminStats()
      .then((res) => setStats(res.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleOpenAssign = (c) => {
    setSelectedComplaint(c);
    setIsAssignModalOpen(true);
  };

  const handleAssignSuccess = async (assignData) => {
    try {
      await complaintApi.assignComplaint(selectedComplaint.id, assignData);
      setActionMessage(`Complaint ${selectedComplaint.referenceNo} assigned successfully!`);
      fetchStats();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to assign complaint');
    }
  };

  if (loading) return <LoadingSpinner message="Calculating real campus metrics..." />;

  return (
    <div>
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-2">
        <div>
          <h2 className="fw-bold mb-1">Campus Administration Dashboard</h2>
          <p className="text-muted small mb-0">Centralized facilities overview, complaint routing, and department metrics.</p>
        </div>
        <div className="d-flex gap-2">
          <Link to="/admin/complaints" className="btn btn-outline-primary btn-sm">
            <i className="bi bi-list-check me-1"></i> View All Complaints
          </Link>
          <Link to="/admin/reports" className="btn btn-primary btn-sm">
            <i className="bi bi-bar-chart-line me-1"></i> Full Analytics Report
          </Link>
        </div>
      </div>

      {actionMessage && (
        <div className="alert alert-success alert-dismissible fade show" role="alert">
          <i className="bi bi-check-circle me-1"></i> {actionMessage}
          <button type="button" className="btn-close" onClick={() => setActionMessage('')}></button>
        </div>
      )}

      {/* Top 6 KPI Metric Cards */}
      <div className="row g-3 mb-4">
        <div className="col-sm-6 col-lg-2">
          <div className="card-custom stat-card">
            <div>
              <div className="text-muted small">Total Complaints</div>
              <h3 className="fw-bold mt-1 mb-0">{stats?.totalComplaints || 0}</h3>
            </div>
          </div>
        </div>

        <div className="col-sm-6 col-lg-2">
          <div className="card-custom stat-card border-info">
            <div>
              <div className="text-muted small">Reported (Pending)</div>
              <h3 className="fw-bold mt-1 mb-0 text-info">{stats?.reportedComplaints || 0}</h3>
            </div>
          </div>
        </div>

        <div className="col-sm-6 col-lg-2">
          <div className="card-custom stat-card border-warning">
            <div>
              <div className="text-muted small">In Progress</div>
              <h3 className="fw-bold mt-1 mb-0 text-warning">{stats?.inProgressComplaints || 0}</h3>
            </div>
          </div>
        </div>

        <div className="col-sm-6 col-lg-2">
          <div className="card-custom stat-card border-success">
            <div>
              <div className="text-muted small">Resolved</div>
              <h3 className="fw-bold mt-1 mb-0 text-success">{stats?.resolvedComplaints || 0}</h3>
            </div>
          </div>
        </div>

        <div className="col-sm-6 col-lg-2">
          <div className="card-custom stat-card border-danger">
            <div>
              <div className="text-muted small">Critical / High</div>
              <h3 className="fw-bold mt-1 mb-0 text-danger">{stats?.highAndCriticalComplaints || 0}</h3>
            </div>
          </div>
        </div>

        <div className="col-sm-6 col-lg-2">
          <div className="card-custom stat-card">
            <div>
              <div className="text-muted small">Departments</div>
              <h3 className="fw-bold mt-1 mb-0 text-primary">{stats?.totalDepartments || 0}</h3>
            </div>
          </div>
        </div>
      </div>

      <div className="row g-4 mb-4">
        {/* Category Breakdown */}
        <div className="col-lg-6">
          <div className="card-custom p-4 bg-white shadow-sm h-100">
            <h5 className="fw-bold mb-3 border-bottom pb-2">
              <i className="bi bi-pie-chart text-primary me-2"></i> Complaints by Category
            </h5>
            {stats?.categoryDistribution && Object.keys(stats.categoryDistribution).length > 0 ? (
              <div className="list-group list-group-flush">
                {Object.entries(stats.categoryDistribution).map(([cat, count]) => {
                  const pct = stats.totalComplaints > 0 ? Math.round((count / stats.totalComplaints) * 100) : 0;
                  return (
                    <div key={cat} className="list-group-item px-0 py-2">
                      <div className="d-flex justify-content-between mb-1">
                        <span className="fw-semibold text-dark small">{cat}</span>
                        <span className="badge bg-light text-dark">{count} ({pct}%)</span>
                      </div>
                      <div className="progress" style={{ height: 6 }}>
                        <div className="progress-bar bg-primary" role="progressbar" style={{ width: `${pct}%` }}></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-muted small">No categorical records yet.</p>
            )}
          </div>
        </div>

        {/* Staff Workload */}
        <div className="col-lg-6">
          <div className="card-custom p-4 bg-white shadow-sm h-100">
            <h5 className="fw-bold mb-3 border-bottom pb-2">
              <i className="bi bi-person-lines-fill text-warning me-2"></i> Active Staff Workload (In Progress)
            </h5>
            {stats?.staffWorkload && Object.keys(stats.staffWorkload).length > 0 ? (
              <div className="list-group list-group-flush">
                {Object.entries(stats.staffWorkload).map(([staffName, count]) => (
                  <div key={staffName} className="list-group-item px-0 py-2 d-flex justify-content-between align-items-center">
                    <span className="fw-semibold text-dark small">
                      <i className="bi bi-person-circle me-2 text-secondary"></i>{staffName}
                    </span>
                    <span className={`badge ${count > 3 ? 'bg-danger' : count > 0 ? 'bg-warning text-dark' : 'bg-success'}`}>
                      {count} Active Tasks
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted small">No staff workload data found.</p>
            )}
          </div>
        </div>
      </div>

      {/* Recent Complaints Requiring Assignment */}
      <div className="card-custom bg-white shadow-sm mb-4">
        <div className="p-4 border-bottom d-flex justify-content-between align-items-center flex-wrap gap-2">
          <div>
            <h5 className="fw-bold mb-0">Recent Campus Complaints</h5>
            <small className="text-muted">Review and assign incoming student and staff reports.</small>
          </div>
          <Link to="/admin/complaints" className="btn btn-outline-primary btn-sm">
            View All Complaints Table
          </Link>
        </div>

        {stats?.recentComplaints && stats.recentComplaints.length > 0 ? (
          <div className="table-responsive">
            <table className="table table-hover table-custom">
              <thead>
                <tr>
                  <th>Ref No</th>
                  <th>Title & Location</th>
                  <th>Category</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Department</th>
                  <th>Date</th>
                  <th className="text-end">Action</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentComplaints.map((c) => (
                  <tr key={c.id}>
                    <td>
                      <Link to={`/student/complaints/${c.id}`} className="fw-bold text-primary text-decoration-none font-monospace">
                        {c.referenceNo}
                      </Link>
                    </td>
                    <td>
                      <div className="fw-semibold text-dark">{c.title}</div>
                      <small className="text-muted"><i className="bi bi-geo-alt"></i> {c.location}</small>
                    </td>
                    <td><span className="small text-secondary">{c.category}</span></td>
                    <td><PriorityBadge priority={c.priority} /></td>
                    <td><StatusBadge status={c.status} /></td>
                    <td>
                      <span className="small text-muted">
                        {c.department?.name || <span className="text-danger fw-semibold">Needs Assignment</span>}
                      </span>
                    </td>
                    <td><small className="text-muted">{new Date(c.createdAt).toLocaleDateString()}</small></td>
                    <td className="text-end">
                      <div className="d-flex justify-content-end gap-1">
                        <button
                          onClick={() => handleOpenAssign(c)}
                          className="btn btn-sm btn-primary"
                          title="Assign to department"
                        >
                          <i className="bi bi-person-plus-fill me-1"></i> Assign
                        </button>
                        <Link to={`/student/complaints/${c.id}`} className="btn btn-sm btn-outline-secondary" title="View Details">
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
          <div className="p-4 text-center text-muted">No complaints recorded yet.</div>
        )}
      </div>

      <AssignModal
        complaint={selectedComplaint}
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        onAssign={handleAssignSuccess}
      />
    </div>
  );
};
