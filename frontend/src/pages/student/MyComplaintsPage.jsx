import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { complaintApi } from '../../api/complaintApi';
import { StatusBadge, PriorityBadge } from '../../components/StatusBadge';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { EmptyState } from '../../components/EmptyState';
import { Pagination } from '../../components/Pagination';

export const MyComplaintsPage = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('ALL');
  const [category, setCategory] = useState('ALL');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [actionMessage, setActionMessage] = useState({ text: '', type: '' });

  const fetchComplaints = async () => {
    setLoading(true);
    try {
      const res = await complaintApi.getComplaints({
        status: status !== 'ALL' ? status : undefined,
        category: category !== 'ALL' ? category : undefined,
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
      console.error('Failed to load complaints', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, [status, category, page]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(0);
    fetchComplaints();
  };

  const handleCancelComplaint = async (complaint) => {
    if (!window.confirm(`Are you sure you want to cancel complaint ${complaint.referenceNo}?`)) {
      return;
    }

    try {
      await complaintApi.cancelComplaint(complaint.id);
      setActionMessage({ text: `Complaint ${complaint.referenceNo} was successfully cancelled.`, type: 'success' });
      fetchComplaints();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to cancel complaint.';
      setActionMessage({ text: msg, type: 'danger' });
    }
  };

  return (
    <div>
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-3">
        <div>
          <h2 className="fw-bold mb-1">My Complaints</h2>
          <p className="text-muted small mb-0">Manage and track all facilities issues reported by you.</p>
        </div>
        <Link to="/student/submit" className="btn btn-primary px-4 py-2 shadow-sm fw-semibold">
          <i className="bi bi-plus-circle me-1"></i> Report a Problem
        </Link>
      </div>

      {actionMessage.text && (
        <div className={`alert alert-${actionMessage.type} alert-dismissible fade show`} role="alert">
          {actionMessage.text}
          <button type="button" className="btn-close" onClick={() => setActionMessage({ text: '', type: '' })}></button>
        </div>
      )}

      {/* Filters & Search */}
      <div className="card-custom p-3 bg-white mb-4 shadow-sm">
        <form onSubmit={handleSearchSubmit} className="row g-2 align-items-center">
          <div className="col-md-4">
            <div className="input-group">
              <span className="input-group-text bg-light"><i className="bi bi-search"></i></span>
              <input
                type="text"
                className="form-control"
                placeholder="Search by title, location, or ref..."
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
              <option value="Reported">Reported (Pending)</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>

          <div className="col-md-3">
            <select
              className="form-select"
              value={category}
              onChange={(e) => { setCategory(e.target.value); setPage(0); }}
            >
              <option value="ALL">All Categories</option>
              <option value="Electrical">Electrical</option>
              <option value="Plumbing and Water Leakage">Plumbing & Water</option>
              <option value="Furniture">Furniture</option>
              <option value="Cleanliness">Cleanliness</option>
              <option value="Wi-Fi and Network">Wi-Fi & Network</option>
              <option value="Classroom Maintenance">Classroom</option>
              <option value="Laboratory Equipment">Lab Equipment</option>
              <option value="Safety and Security">Safety</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="col-md-2">
            <button type="submit" className="btn btn-outline-primary w-100">
              Filter
            </button>
          </div>
        </form>
      </div>

      {loading ? (
        <LoadingSpinner message="Fetching your complaints..." />
      ) : complaints.length === 0 ? (
        <EmptyState
          icon="bi-journal-x"
          title="No complaints found"
          message={search || status !== 'ALL' || category !== 'ALL' ? 'No complaints match your filter criteria.' : 'You have not submitted any complaints yet.'}
          actionText="Report a Problem"
          actionLink="/student/submit"
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
                  <th>Assigned Dept</th>
                  <th>Date</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {complaints.map((c) => {
                  const canCancel = c.status === 'Reported' && !c.department && !c.assignedStaff;
                  return (
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
                      <td><span className="text-secondary small">{c.category}</span></td>
                      <td><PriorityBadge priority={c.priority} /></td>
                      <td><StatusBadge status={c.status} /></td>
                      <td>
                        <span className="text-muted small">
                          {c.department?.name || <em className="text-secondary">Unassigned</em>}
                        </span>
                      </td>
                      <td>
                        <small className="text-muted">{new Date(c.createdAt).toLocaleDateString()}</small>
                      </td>
                      <td className="text-end">
                        <div className="d-flex justify-content-end gap-1">
                          <Link to={`/student/complaints/${c.id}`} className="btn btn-sm btn-outline-primary" title="View Details">
                            <i className="bi bi-eye"></i>
                          </Link>
                          {canCancel && (
                            <button
                              onClick={() => handleCancelComplaint(c)}
                              className="btn btn-sm btn-outline-danger"
                              title="Cancel Complaint"
                            >
                              <i className="bi bi-x-circle"></i>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="p-3 border-top d-flex justify-content-between align-items-center flex-wrap gap-2">
            <small className="text-muted">Total complaints: <strong>{totalElements}</strong></small>
            <Pagination currentPage={page} totalPages={totalPages} onPageChange={(p) => setPage(p)} />
          </div>
        </div>
      )}
    </div>
  );
};
