import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleFillDemo = (userVal, passVal) => {
    setUsername(userVal);
    setPassword(passVal);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password) {
      setError('Please provide both username and password.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const loggedInUser = await login(username.trim(), password);
      // Route according to user role
      if (loggedInUser.role === 'ROLE_ADMIN') {
        navigate('/admin/dashboard');
      } else if (loggedInUser.role === 'ROLE_STAFF') {
        navigate('/staff/dashboard');
      } else {
        const from = location.state?.from?.pathname || '/student/dashboard';
        navigate(from);
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Invalid username or password. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="row justify-content-center py-4">
      <div className="col-md-8 col-lg-5">
        <div className="card-custom p-4 p-sm-5 bg-white shadow">
          <div className="text-center mb-4">
            <div className="bg-primary text-white rounded-circle d-inline-flex align-items-center justify-content-center p-3 mb-3" style={{ width: 60, height: 60 }}>
              <i className="bi bi-shield-lock-fill fs-3"></i>
            </div>
            <h3 className="fw-bold">Sign In</h3>
            <p className="text-muted small">Access your campus account to lodge or manage issues</p>
          </div>

          {location.search.includes('expired=true') && (
            <div className="alert alert-warning py-2 small">
              <i className="bi bi-exclamation-triangle me-1"></i> Your session has expired. Please log in again.
            </div>
          )}

          {error && (
            <div className="alert alert-danger py-2 small">
              <i className="bi bi-x-circle me-1"></i> {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label fw-semibold">Username or Email</label>
              <div className="input-group">
                <span className="input-group-text bg-light"><i className="bi bi-person"></i></span>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Enter username or email"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  autoFocus
                  required
                />
              </div>
            </div>

            <div className="mb-4">
              <label className="form-label fw-semibold">Password</label>
              <div className="input-group">
                <span className="input-group-text bg-light"><i className="bi bi-key"></i></span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="form-control"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  <i className={`bi ${showPassword ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary w-100 py-2 fw-semibold mb-3"
              disabled={loading}
            >
              {loading ? (
                <span><span className="spinner-border spinner-border-sm me-2"></span>Authenticating...</span>
              ) : (
                <span><i className="bi bi-box-arrow-in-right me-1"></i> Sign In</span>
              )}
            </button>
          </form>

          {/* Demo Credentials Quick-Select */}
          <div className="bg-light p-3 rounded-3 mt-3 border">
            <div className="text-muted small fw-bold mb-2">
              <i className="bi bi-magic me-1"></i> Demo Accounts (1-Click Auto-Fill):
            </div>
            <div className="d-flex flex-wrap gap-2">
              <button
                type="button"
                className="btn btn-sm btn-outline-danger"
                onClick={() => handleFillDemo('admin', 'Admin@123')}
              >
                Admin
              </button>
              <button
                type="button"
                className="btn btn-sm btn-outline-warning text-dark"
                onClick={() => handleFillDemo('staff_elec', 'Staff@123')}
              >
                Electrical Staff
              </button>
              <button
                type="button"
                className="btn btn-sm btn-outline-warning text-dark"
                onClick={() => handleFillDemo('staff_plumb', 'Staff@123')}
              >
                Plumbing Staff
              </button>
              <button
                type="button"
                className="btn btn-sm btn-outline-info text-dark"
                onClick={() => handleFillDemo('student_john', 'Student@123')}
              >
                Student (John)
              </button>
            </div>
          </div>

          <div className="text-center mt-4">
            <span className="text-muted small">New student? </span>
            <Link to="/register" className="text-primary fw-semibold small text-decoration-none">
              Register an account here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
