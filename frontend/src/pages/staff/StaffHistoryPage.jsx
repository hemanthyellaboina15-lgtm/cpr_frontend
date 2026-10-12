import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { complaintApi } from '../../api/complaintApi';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { EmptyState } from '../../components/EmptyState';
import { Pagination } from '../../components/Pagination';

export const StaffHistoryPage = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const res = await complaintApi.getComplaints({
        status: 'Resolved',
        page,
        size: 10,
        sortBy: 'resolvedAt',
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
    fetchHistory();
  }, [page]);

  return (
    <div>
      <div className="mb-4">
        <h2 className="fw-bold mb-1">Work History & Completed Tasks</h2>
        <p className="text-muted small mb-0">Record of all problems successfully resolved by your department.</p>
      </div>

      {loading ? (
        <LoadingSpinner message="Loading resolution history..." />
      ) : complaints.length === 0 ? (
        <EmptyState
          icon="bi-clock-history"
          title="No completed work history yet"
          message="When you mark assigned tasks as Resolved, they will appear here with resolution audit notes."
        />
      ) : (
        <div className="card-custom bg-white shadow-sm overflow-hidden">
          <div className="table-responsive">
            <table className="table table-hover table-custom">
              <thead>
                <tr>
                  <th>Ref No</th>
                  <th>Title & Location</th>
                  <th>Resolution Summary</th>
                  <th>Resolved At</th>
                  <th className="text-end">Details</th>
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
                    <td>
                      <div className="text-success small fw-semibold">
                        <i className="bi bi-check2-circle me-1"></i> {c.resolutionNotes || 'Resolved'}
                      </div>
                    </td>
                    <td>
                      <small className="text-muted">
                        {c.resolvedAt ? new Date(c.resolvedAt).toLocaleString() : new Date(c.updatedAt).toLocaleString()}
                      </small>
                    </td>
                    <td className="text-end">
                      <Link to={`/student/complaints/${c.id}`} className="btn btn-sm btn-outline-secondary">
                        <i className="bi bi-eye"></i> View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="p-3 border-top d-flex justify-content-between align-items-center flex-wrap gap-2">
            <small className="text-muted">Completed tickets: <strong>{totalElements}</strong></small>
            <Pagination currentPage={page} totalPages={totalPages} onPageChange={(p) => setPage(p)} />
          </div>
        </div>
      )}
    </div>
  );
};
