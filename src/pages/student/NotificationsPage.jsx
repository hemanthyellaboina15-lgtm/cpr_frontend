import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { notificationApi } from '../../api/notificationApi';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { EmptyState } from '../../components/EmptyState';
import { Pagination } from '../../components/Pagination';

export const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await notificationApi.getUserNotifications({ page, size: 10 });
      setNotifications(res.data.content);
      setTotalPages(res.data.totalPages);
      setTotalElements(res.data.totalElements);
    } catch (err) {
      console.error('Failed to load notifications', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [page]);

  const handleMarkAsRead = async (id) => {
    try {
      await notificationApi.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationApi.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold mb-1">Notifications</h2>
          <p className="text-muted small mb-0">Stay updated on your complaints and maintenance progress.</p>
        </div>
        {notifications.some((n) => !n.read) && (
          <button onClick={handleMarkAllRead} className="btn btn-outline-secondary btn-sm">
            <i className="bi bi-check-all me-1"></i> Mark All as Read
          </button>
        )}
      </div>

      {loading ? (
        <LoadingSpinner message="Loading notifications..." />
      ) : notifications.length === 0 ? (
        <EmptyState
          icon="bi-bell-slash"
          title="No notifications"
          message="You have no notifications at this time."
        />
      ) : (
        <div className="card-custom bg-white shadow-sm overflow-hidden">
          <div className="list-group list-group-flush">
            {notifications.map((n) => (
              <div
                key={n.id}
                className={`list-group-item p-3 d-flex align-items-start justify-content-between ${
                  !n.read ? 'bg-primary bg-opacity-10' : ''
                }`}
              >
                <div className="d-flex align-items-start gap-3">
                  <div
                    className={`stat-icon rounded-circle ${
                      !n.read ? 'bg-primary text-white' : 'bg-light text-secondary'
                    }`}
                    style={{ width: 42, height: 42, fontSize: '1.1rem' }}
                  >
                    <i className="bi bi-bell-fill"></i>
                  </div>
                  <div>
                    <div className="d-flex align-items-center gap-2">
                      <h6 className="fw-bold text-dark mb-1">{n.title}</h6>
                      {!n.read && <span className="badge bg-primary">New</span>}
                    </div>
                    <p className="text-muted small mb-1">{n.message}</p>
                    <small className="text-secondary" style={{ fontSize: '0.75rem' }}>
                      {new Date(n.createdAt).toLocaleString()}
                    </small>
                  </div>
                </div>

                <div className="d-flex align-items-center gap-2">
                  {n.complaintId && (
                    <Link
                      to={`/student/complaints/${n.complaintId}`}
                      className="btn btn-sm btn-outline-primary"
                    >
                      View Complaint
                    </Link>
                  )}
                  {!n.read && (
                    <button
                      onClick={() => handleMarkAsRead(n.id)}
                      className="btn btn-sm btn-light text-muted"
                      title="Mark as read"
                    >
                      <i className="bi bi-check2"></i>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="p-3 border-top d-flex justify-content-between align-items-center flex-wrap gap-2">
            <small className="text-muted">Total notifications: <strong>{totalElements}</strong></small>
            <Pagination currentPage={page} totalPages={totalPages} onPageChange={(p) => setPage(p)} />
          </div>
        </div>
      )}
    </div>
  );
};
