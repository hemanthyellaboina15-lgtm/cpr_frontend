import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { notificationApi } from '../api/notificationApi';

export const Navbar = ({ onToggleSidebar }) => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    let isMounted = true;
    const fetchUnread = async () => {
      if (isAuthenticated) {
        try {
          const res = await notificationApi.getUnreadCount();
          if (isMounted) setUnreadCount(res.data.unreadCount || 0);
        } catch (err) {
          // ignore background fetch error
        }
      }
    };

    fetchUnread();
    const interval = setInterval(fetchUnread, 30000); // 30 second notification refresh
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [isAuthenticated]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getRoleBadge = (role) => {
    switch (role) {
      case 'ROLE_ADMIN':
        return <span className="badge bg-danger">Admin</span>;
      case 'ROLE_STAFF':
        return <span className="badge bg-warning text-dark">Staff</span>;
      case 'ROLE_STUDENT':
        return <span className="badge bg-info text-dark">Student</span>;
      default:
        return null;
    }
  };

  return (
    <header className="top-navbar shadow-sm">
      <div className="d-flex align-items-center gap-3">
        {isAuthenticated && (
          <button
            className="btn btn-outline-secondary btn-sm d-lg-none"
            onClick={onToggleSidebar}
            aria-label="Toggle Navigation"
          >
            <i className="bi bi-list fs-5"></i>
          </button>
        )}
        <Link to="/" className="navbar-brand d-flex align-items-center gap-2 m-0 text-decoration-none">
          <span className="bg-primary text-white p-2 rounded-3 d-flex align-items-center justify-content-center" style={{ width: 34, height: 34 }}>
            <i className="bi bi-shield-check"></i>
          </span>
          <span className="fw-bold fs-5 text-dark d-none d-sm-inline">Campus Problem Resolver</span>
        </Link>
      </div>

      <div className="d-flex align-items-center gap-3">
        {isAuthenticated ? (
          <>
            <Link
              to="/student/notifications"
              className="btn btn-light position-relative p-2 rounded-circle"
              title="Notifications"
            >
              <i className="bi bi-bell fs-5 text-secondary"></i>
              {unreadCount > 0 && (
                <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </Link>

            <div className="dropdown">
              <button
                className="btn btn-light d-flex align-items-center gap-2 border py-1 px-3 rounded-pill"
                type="button"
                data-bs-toggle="dropdown"
                aria-expanded="false"
              >
                <i className="bi bi-person-circle fs-5 text-primary"></i>
                <div className="text-start d-none d-md-block">
                  <div className="fw-semibold small leading-none">{user?.fullName || user?.username}</div>
                  <div className="text-muted" style={{ fontSize: '0.75rem' }}>{getRoleBadge(user?.role)}</div>
                </div>
              </button>
              <ul className="dropdown-menu dropdown-menu-end shadow border-0 mt-2">
                <li>
                  <Link className="dropdown-item py-2" to="/profile">
                    <i className="bi bi-person me-2 text-primary"></i> My Profile
                  </Link>
                </li>
                <li><hr className="dropdown-divider" /></li>
                <li>
                  <button className="dropdown-item py-2 text-danger" onClick={handleLogout}>
                    <i className="bi bi-box-arrow-right me-2"></i> Log Out
                  </button>
                </li>
              </ul>
            </div>
          </>
        ) : (
          <div className="d-flex align-items-center gap-2">
            <Link to="/track" className="btn btn-outline-secondary btn-sm">
              <i className="bi bi-search me-1"></i> Track Reference
            </Link>
            <Link to="/login" className="btn btn-primary btn-sm px-3">
              Log In
            </Link>
            <Link to="/register" className="btn btn-outline-primary btn-sm px-3">
              Register
            </Link>
          </div>
        )}
      </div>
    </header>
  );
};
