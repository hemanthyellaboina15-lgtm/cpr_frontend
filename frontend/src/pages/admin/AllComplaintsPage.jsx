import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { complaintApi } from '../../api/complaintApi';
import { departmentApi } from '../../api/departmentApi';
import { StatusBadge, PriorityBadge } from '../../components/StatusBadge';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { EmptyState } from '../../components/EmptyState';
import { Pagination } from '../../components/Pagination';
import { AssignModal } from '../../components/AssignModal';
import { StatusUpdateModal } from '../../components/StatusUpdateModal';

export const AllComplaintsPage = () => {
  const [complaints, setComplaints] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [status, setStatus] = useState('ALL');
  const [category, setCategory] = useState('ALL');
  const [departmentId, setDepartmentId] = useState('');
  const [priority, setPriority] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  // Modals
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [actionMessage, setActionMessage] = useState('');

  useEffect(() => {
    departmentApi.getActiveDepartments()
      .then((res) => setDepartments(res.data))
      .catch((err) => console.error(err));
  }, []);

  const fetchComplaints = async () => {
    setLoading(true);
    try {
      const res = await complaintApi.getComplaints({
        status: status !== 'ALL' ? status : undefined,
        category: category !== 'ALL' ? category : undefined,
        departmentId: departmentId ? Number(departmentId) : undefined,
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
  }, [status, category, departmentId, priority, page]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(0);
    fetchComplaints();
  };

  const handleOpenAssign = (c) => {
    setSelectedComplaint(c);
    setIsAssignModalOpen(true);
  };

  const handleOpenStatus = (c) => {
    setSelectedComplaint(c);
    setIsStatusModalOpen(true);
  };

  const handleAssignSuccess = async (assignData) => {
    try {
      await complaintApi.assignComplaint(selectedComplaint.id, assignData);
      setActionMessage(`Complaint ${selectedComplaint.referenceNo} assigned successfully!`);
      fetchComplaints();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to assign complaint');
    }
  };

  const handleStatusSuccess = async (statusData) => {
    try {
      await complaintApi.updateStatus(selectedComplaint.id, statusData);
      setActionMessage(`Complaint ${selectedComplaint.referenceNo} status updated successfully!`);
      fetchComplaints();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update status');
    }
  };

  return (
    <div>
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-2">
        <div>
          <h2 className="fw-bold mb-1">All Campus Complaints</h2>
          <p className="text-muted small mb-0">Search, filter, assign, and manage all campus facilities complaints.</p>
        </div>
      </div>

      {actionMessage && (
        <div className="alert alert-success alert-dismissible fade show" role="alert">
          <i className="bi bi-check-circle me-1"></i> {actionMessage}
          <button type="button" className="btn-close" onClick={() => setActionMessage('')}></button>
        </div>
      )}

      {/* Filter Toolbar */}
      <div className="card-custom p-3 bg-white mb-4 shadow-sm">
        <form onSubmit={handleSearchSubmit} className="row g-2 align-items-center">
          <div className="col-md-3">
            <div className="input-group">
              <span className="input-group-text bg-light"><i className="bi bi-search"></i></span>
              <input
                type="text"
                className="form-control"
                placeholder="Search title, ref, location..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="col-md-2">
            <select
              className="form-select"
              value={status}
              onChange={(e) => { setStatus(e.target.value); setPage(0); }}
            >
              <option value="ALL">All Statuses</option>
              <option value="Reported">Reported</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>

          <div className="col-md-2">
            <select
              className="form-select"
              value={departmentId}
              onChange={(e) => { setDepartmentId(e.target.value); setPage(0); }}
            >
              <option value="">All Departments</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>

          <div className="col-md-2">
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

          <div className="col-md-2">
            <select
              className="form-select"
              value={category}
              onChange={(e) => { setCategory(e.target.value); setPage(0); }}
            >
              <option value="ALL">All Categories</option>
              <option value="Electrical">Electrical</option>
              <option value="Plumbing and Water Leakage">Plumbing</option>
              <option value="Furniture">Furniture</option>
              <option value="Cleanliness">Cleanliness</option>
              <option value="Wi-Fi and Network">Wi-Fi & Network</option>
              <option value="Classroom Maintenance">Classroom</option>
              <option value="Laboratory Equipment">Lab Equipment</option>
              <option value="Safety and Security">Safety</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="col-md-1">
            <button type="submit" className="btn btn-outline-primary w-100">
              Go
            </button>
          </div>
        </form>
      </div>

      {loading ? (
        <LoadingSpinner message="Loading all complaints..." />
      ) : complaints.length === 0 ? (
        <EmptyState
          icon="bi-inbox"
          title="No complaints found"
          message="No records matched your search filters."
        />
      ) : (
        <div className="card-custom bg-white shadow-sm overflow-hidden">
          <div className="table-responsive">
            <table className="table table-hover table-custom">
              <thead>
                <tr>
                  <th>Ref No</th>
                  <th>Title & Location</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Department & Staff</th>
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
                    <td><PriorityBadge priority={c.priority} /></td>
                    <td><StatusBadge status={c.status} /></td>
                    <td>
                      <div className="small fw-medium">
                        {c.department ? (
                          <span className="text-primary">{c.department.name}</span>
                        ) : (
                          <span className="badge bg-danger bg-opacity-10 text-danger">Unassigned</span>
                        )}
                      </div>
                      {c.assignedStaff && (
                        <small className="text-secondary d-block">
                          <i className="bi bi-person"></i> {c.assignedStaff.fullName}
                        </small>
                      )}
                    </td>
                    <td>
                      <div className="small fw-semibold text-dark">{c.student?.fullName || 'Student'}</div>
                      <small className="text-muted">{c.student?.username}</small>
                    </td>
                    <td>
                      <small className="text-muted">{new Date(c.createdAt).toLocaleDateString()}</small>
                    </td>
                    <td className="text-end">
                      <div className="d-flex justify-content-end gap-1">
                        <button
                          onClick={() => handleOpenAssign(c)}
                          className="btn btn-sm btn-outline-primary"
                          title="Assign"
                        >
                          <i className="bi bi-person-plus-fill"></i>
                        </button>
                        {c.status !== 'Resolved' && c.status !== 'Cancelled' && (
                          <button
                            onClick={() => handleOpenStatus(c)}
                            className="btn btn-sm btn-outline-dark"
                            title="Update Status"
                          >
                            <i className="bi bi-gear-fill"></i>
                          </button>
                        )}
                        <Link to={`/student/complaints/${c.id}`} className="btn btn-sm btn-outline-secondary" title="View">
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
            <small className="text-muted">Total matching records: <strong>{totalElements}</strong></small>
            <Pagination currentPage={page} totalPages={totalPages} onPageChange={(p) => setPage(p)} />
          </div>
        </div>
      )}

      <AssignModal
        complaint={selectedComplaint}
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        onAssign={handleAssignSuccess}
      />

      <StatusUpdateModal
        complaint={selectedComplaint}
        isOpen={isStatusModalOpen}
        onClose={() => setIsStatusModalOpen(false)}
        onUpdateStatus={handleStatusSuccess}
      />
    </div>
  );
};
