import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export const RegisterPage = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    username: '',
    email: '',
    phoneNumber: '',
    password: '',
    confirmPassword: '',
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match. Please re-enter.');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await register({
        fullName: formData.fullName.trim(),
        username: formData.username.trim(),
        email: formData.email.trim().toLowerCase(),
        phoneNumber: formData.phoneNumber.trim(),
        password: formData.password,
      });

      navigate('/student/dashboard');
    } catch (err) {
      const msg = err.response?.data?.message ||
        (err.response?.data?.validationErrors ? Object.values(err.response.data.validationErrors).join(', ') : 'Registration failed.');
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="row justify-content-center py-4">
      <div className="col-md-8 col-lg-6">
        <div className="card-custom p-4 p-sm-5 bg-white shadow">
          <div className="text-center mb-4">
            <div className="bg-primary text-white rounded-circle d-inline-flex align-items-center justify-content-center p-3 mb-3" style={{ width: 60, height: 60 }}>
              <i className="bi bi-mortarboard-fill fs-3"></i>
            </div>
            <h3 className="fw-bold">Student Registration</h3>
            <p className="text-muted small">Create an account to lodge and track campus maintenance requests</p>
          </div>

          {error && (
            <div className="alert alert-danger py-2 small">
              <i className="bi bi-x-circle me-1"></i> {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label fw-semibold">Full Name *</label>
              <input
                type="text"
                name="fullName"
                className="form-control"
                placeholder="e.g. Alex Johnson"
                value={formData.fullName}
                onChange={handleChange}
                required
              />
            </div>

            <div className="row">
              <div className="col-md-6 mb-3">
                <label className="form-label fw-semibold">Username *</label>
                <input
                  type="text"
                  name="username"
                  className="form-control"
                  placeholder="e.g. alex_j"
                  value={formData.username}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="col-md-6 mb-3">
                <label className="form-label fw-semibold">Campus Email *</label>
                <input
                  type="email"
                  name="email"
                  className="form-control"
                  placeholder="e.g. alex@student.campus.edu"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="mb-3">
              <label className="form-label fw-semibold">Phone Number (Optional)</label>
              <input
                type="tel"
                name="phoneNumber"
                className="form-control"
                placeholder="e.g. +1-555-1234"
                value={formData.phoneNumber}
                onChange={handleChange}
              />
            </div>

            <div className="row">
              <div className="col-md-6 mb-3">
                <label className="form-label fw-semibold">Password *</label>
                <input
                  type="password"
                  name="password"
                  className="form-control"
                  placeholder="Min 6 characters"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="col-md-6 mb-4">
                <label className="form-label fw-semibold">Confirm Password *</label>
                <input
                  type="password"
                  name="confirmPassword"
                  className="form-control"
                  placeholder="Confirm password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary w-100 py-2 fw-semibold mb-3"
              disabled={loading}
            >
              {loading ? (
                <span><span className="spinner-border spinner-border-sm me-2"></span>Creating Account...</span>
              ) : (
                <span><i className="bi bi-person-check-fill me-1"></i> Register Student Account</span>
              )}
            </button>
          </form>

          <div className="text-center mt-3">
            <span className="text-muted small">Already have an account? </span>
            <Link to="/login" className="text-primary fw-semibold small text-decoration-none">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
