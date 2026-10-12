import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { complaintApi } from '../../api/complaintApi';
import { StatusBadge, PriorityBadge } from '../../components/StatusBadge';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { EmptyState } from '../../components/EmptyState';
import { Pagination } from '../../components/Pagination';
import { StatusUpdateModal } from '../../components/StatusUpdateModal';

export const AssignedComplaintsPage = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('ALL');
  const [priority, setPriority] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [actionMessage, setActionMessage] = useState('');

  const fetchComplaints = async () => {
    setLoading(true);
    try {
      const res = await complaintApi.getComplaints({
        status: status !== 'ALL' ? status : undefined,
        priority: priority || undefined,
        search: search.trim() || undefined,
        page,
        size: 10,
        sortBy: 'createdAt',
        direction: 'desc',
      });

      setComplaints(res.data.content);
      setTotalPages(res.data.totalPages);
      setTotalElements(res.data.totalElements);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, [status, priority, page]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(0);
    fetchComplaints();
  };

  const handleOpenStatus = (c) => {
    setSelectedComplaint(c);
    setIsStatusModalOpen(true);
  };

  const handleStatusSuccess = async (statusData) => {
    try {
      await complaintApi.updateStatus(selectedComplaint.id, statusData);
      setActionMessage(`Status for ${selectedComplaint.referenceNo} updated successfully!`);
      fetchComplaints();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update status');
    }
  };

  return (
    <div>
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-2">
        <div>
          <h2 className="fw-bold mb-1">Assigned Maintenance Tasks</h2>
          <p className="text-muted small mb-0">View issues assigned to your account or departmental queue.</p>
        </div>
      </div>

      {actionMessage && (
        <div className="alert alert-success alert-dismissible fade show" role="alert">
          <i className="bi bi-check-circle me-1"></i> {actionMessage}
          <button type="button" className="btn-close" onClick={() => setActionMessage('')}></button>
        </div>
      )}

      {/* Filter toolbar */}
      <div className="card-custom p-3 bg-white mb-4 shadow-sm">
        <form onSubmit={handleSearchSubmit} className="row g-2 align-items-center">
          <div className="col-md-5">
            <div className="input-group">
              <span className="input-group-text bg-light"><i className="bi bi-search"></i></span>
              <input
                type="text"
                className="form-control"
                placeholder="Search title, location, or ref..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="col-md-3">
            <select
              className="form-select"
              value={status}
              onChange={(e) => { setStatus(e.target.value); setPage(0); }}
            >
              <option value="ALL">All Statuses</option>
              <option value="Reported">Reported (Assigned to Dept)</option>
              <option value="In Progress">In Progress (Active)</option>
              <option value="Resolved">Resolved (Completed)</option>
            </select>
          </div>

          <div className="col-md-3">
            <select
              className="form-select"
              value={priority}
              onChange={(e) => { setPriority(e.target.value); setPage(0); }}
            >
              <option value="">All Priorities</option>
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="CRITICAL">Critical</option>
            </select>
          </div>

          <div className="col-md-1">
            <button type="submit" className="btn btn-outline-primary w-100">Go</button>
          </div>
        </form>
      </div>

      {loading ? (
        <LoadingSpinner message="Loading assigned tasks..." />
      ) : complaints.length === 0 ? (
        <EmptyState
          icon="bi-check2-all"
          title="No assigned tasks"
          message="No complaints currently match your filter selection."
        />
      ) : (
        <div className="card-custom bg-white shadow-sm overflow-hidden">
          <div className="table-responsive">
            <table className="table table-hover table-custom">
              <thead>
                <tr>
                  <th>Ref No</th>
                  <th>Title & Location</th>
                  <th>Category</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Reported By</th>
                  <th>Date</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {complaints.map((c) => (
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
                    <td><span className="small text-secondary">{c.category}</span></td>
                    <td><PriorityBadge priority={c.priority} /></td>
                    <td><StatusBadge status={c.status} /></td>
                    <td>
                      <div className="small fw-semibold">{c.student?.fullName || 'Student'}</div>
                      <small className="text-muted">{c.student?.phoneNumber || c.student?.email}</small>
                    </td>
                    <td><small className="text-muted">{new Date(c.createdAt).toLocaleDateString()}</small></td>
                    <td className="text-end">
                      <div className="d-flex justify-content-end gap-1">
                        {c.status !== 'Resolved' && (
                          <button
                            onClick={() => handleOpenStatus(c)}
                            className="btn btn-sm btn-primary"
                            title="Update Status / Resolve"
                          >
                            <i className="bi bi-pencil-square me-1"></i> Update
                          </button>
                        )}
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

          <div className="p-3 border-top d-flex justify-content-between align-items-center flex-wrap gap-2">
            <small className="text-muted">Total tasks: <strong>{totalElements}</strong></small>
            <Pagination currentPage={page} totalPages={totalPages} onPageChange={(p) => setPage(p)} />
          </div>
        </div>
      )}

      <StatusUpdateModal
        complaint={selectedComplaint}
        isOpen={isStatusModalOpen}
        onClose={() => setIsStatusModalOpen(false)}
        onUpdateStatus={handleStatusSuccess}
      />
    </div>
  );
};
