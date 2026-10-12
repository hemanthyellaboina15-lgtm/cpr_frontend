import React, { useState, useEffect } from 'react';
import { dashboardApi } from '../../api/dashboardApi';
import { LoadingSpinner } from '../../components/LoadingSpinner';

export const ReportsPage = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardApi.getAdminStats()
      .then((res) => setStats(res.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner message="Compiling real-time report statistics..." />;

  const total = stats?.totalComplaints || 0;
  const resolved = stats?.resolvedComplaints || 0;
  const inProgress = stats?.inProgressComplaints || 0;
  const reported = stats?.reportedComplaints || 0;
  const cancelled = stats?.cancelledComplaints || 0;
  const resolutionRate = total > 0 ? Math.round((resolved / total) * 100) : 0;

  return (
    <div>
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-2">
        <div>
          <h2 className="fw-bold mb-1">Campus Resolution Performance Reports</h2>
          <p className="text-muted small mb-0">Live aggregated statistics and resolution analytics derived directly from PostgreSQL.</p>
        </div>
        <button className="btn btn-outline-secondary btn-sm" onClick={() => window.print()}>
          <i className="bi bi-printer me-1"></i> Print / Export Report
        </button>
      </div>

      {/* KPI Performance Header */}
      <div className="row g-3 mb-4">
        <div className="col-md-3">
          <div className="card-custom p-4 bg-white shadow-sm text-center">
            <div className="text-muted small">Resolution Success Rate</div>
            <h2 className="fw-bold text-success mt-2 mb-0">{resolutionRate}%</h2>
            <div className="progress mt-3" style={{ height: 8 }}>
              <div className="progress-bar bg-success" style={{ width: `${resolutionRate}%` }}></div>
            </div>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card-custom p-4 bg-white shadow-sm text-center">
            <div className="text-muted small">Total Lodged Complaints</div>
            <h2 className="fw-bold text-dark mt-2 mb-0">{total}</h2>
            <small className="text-muted mt-2 d-block">Lifetime student & staff records</small>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card-custom p-4 bg-white shadow-sm text-center">
            <div className="text-muted small">Currently In Progress</div>
            <h2 className="fw-bold text-warning mt-2 mb-0">{inProgress}</h2>
            <small className="text-muted mt-2 d-block">Technicians actively repairing</small>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card-custom p-4 bg-white shadow-sm text-center">
            <div className="text-muted small">Pending Assignment</div>
            <h2 className="fw-bold text-info mt-2 mb-0">{reported}</h2>
            <small className="text-muted mt-2 d-block">Newly reported tickets</small>
          </div>
        </div>
      </div>

      <div className="row g-4 mb-4">
        {/* Category Breakdown */}
        <div className="col-md-6">
          <div className="card-custom p-4 bg-white shadow-sm h-100">
            <h5 className="fw-bold mb-3 border-bottom pb-2">Complaints by Category</h5>
            {stats?.categoryDistribution && Object.keys(stats.categoryDistribution).length > 0 ? (
              <div>
                {Object.entries(stats.categoryDistribution).map(([cat, count]) => {
                  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
                  return (
                    <div key={cat} className="mb-3">
                      <div className="d-flex justify-content-between text-dark fw-semibold small mb-1">
                        <span>{cat}</span>
                        <span>{count} tickets ({pct}%)</span>
                      </div>
                      <div className="progress" style={{ height: 8 }}>
                        <div className="progress-bar bg-primary" style={{ width: `${pct}%` }}></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-muted">No category data recorded.</p>
            )}
          </div>
        </div>

        {/* Department Distribution */}
        <div className="col-md-6">
          <div className="card-custom p-4 bg-white shadow-sm h-100">
            <h5 className="fw-bold mb-3 border-bottom pb-2">Assigned Complaints by Department</h5>
            {stats?.departmentDistribution && Object.keys(stats.departmentDistribution).length > 0 ? (
              <div>
                {Object.entries(stats.departmentDistribution).map(([dept, count]) => {
                  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
                  return (
                    <div key={dept} className="mb-3">
                      <div className="d-flex justify-content-between text-dark fw-semibold small mb-1">
                        <span>{dept}</span>
                        <span>{count} tickets ({pct}%)</span>
                      </div>
                      <div className="progress" style={{ height: 8 }}>
                        <div className="progress-bar bg-info" style={{ width: `${pct}%` }}></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-muted">No department data assigned yet.</p>
            )}
          </div>
        </div>
      </div>

      <div className="row g-4">
        {/* Priority Distribution */}
        <div className="col-md-6">
          <div className="card-custom p-4 bg-white shadow-sm">
            <h5 className="fw-bold mb-3 border-bottom pb-2">Complaints by Priority Level</h5>
            {stats?.priorityDistribution && Object.keys(stats.priorityDistribution).length > 0 ? (
              <div className="row text-center g-3">
                {Object.entries(stats.priorityDistribution).map(([prio, count]) => (
                  <div key={prio} className="col-6 col-sm-3">
                    <div className="p-3 bg-light rounded border">
                      <span className="text-muted small d-block">{prio}</span>
                      <h4 className="fw-bold mt-1 mb-0">{count}</h4>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted">No priority records.</p>
            )}
          </div>
        </div>

        {/* Audit Log / Recent Status Changes */}
        <div className="col-md-6">
          <div className="card-custom p-4 bg-white shadow-sm">
            <h5 className="fw-bold mb-3 border-bottom pb-2">Recent Resolution History Activity</h5>
            {stats?.recentStatusChanges && stats.recentStatusChanges.length > 0 ? (
              <div className="list-group list-group-flush" style={{ maxHeight: 280, overflowY: 'auto' }}>
                {stats.recentStatusChanges.map((h, i) => (
                  <div key={i} className="list-group-item px-0 py-2">
                    <div className="d-flex justify-content-between small">
                      <span className="fw-semibold text-dark">{h.actionType} &rarr; {h.newStatus}</span>
                      <span className="text-muted">{new Date(h.createdAt).toLocaleDateString()}</span>
                    </div>
                    <small className="text-muted d-block text-truncate">{h.notes}</small>
                    <small className="text-secondary" style={{ fontSize: '0.72rem' }}>By: {h.performedByName}</small>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted">No status transitions logged yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
