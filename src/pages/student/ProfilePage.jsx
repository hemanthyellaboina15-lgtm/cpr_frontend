import React, { useState, useEffect } from 'react';
import { userApi } from '../../api/userApi';
import { useAuth } from '../../context/AuthContext';

export const ProfilePage = () => {
  const { user, refreshProfile } = useAuth();
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  useEffect(() => {
    if (user) {
      setFullName(user.fullName || '');
      setPhoneNumber(user.phoneNumber || '');
    }
  }, [user]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (newPassword && newPassword !== confirmPassword) {
      setMessage({ text: 'New passwords do not match.', type: 'danger' });
      return;
    }

    if (newPassword && newPassword.length < 6) {
      setMessage({ text: 'New password must be at least 6 characters.', type: 'danger' });
      return;
    }

    setSaving(true);
    setMessage({ text: '', type: '' });

    try {
      await userApi.updateProfile({
        fullName: fullName.trim(),
        phoneNumber: phoneNumber.trim(),
        currentPassword: currentPassword || undefined,
        newPassword: newPassword || undefined,
      });

      await refreshProfile();
      setMessage({ text: 'Profile updated successfully!', type: 'success' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to update profile.';
      setMessage({ text: msg, type: 'danger' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="py-2">
      <div className="mb-4">
        <h2 className="fw-bold mb-1">My Profile</h2>
        <p className="text-muted small mb-0">Manage your campus account details and security settings.</p>
      </div>

      {message.text && (
        <div className={`alert alert-${message.type} alert-dismissible fade show`} role="alert">
          {message.text}
          <button type="button" className="btn-close" onClick={() => setMessage({ text: '', type: '' })}></button>
        </div>
      )}

      <div className="row g-4">
        {/* Account Info Box */}
        <div className="col-md-4">
          <div className="card-custom p-4 bg-white shadow-sm text-center">
            <div className="bg-primary text-white rounded-circle d-inline-flex align-items-center justify-content-center p-3 mb-3" style={{ width: 80, height: 80, fontSize: '2rem' }}>
              <i className="bi bi-person-fill"></i>
            </div>
            <h5 className="fw-bold mb-1">{user?.fullName}</h5>
            <span className="badge bg-secondary mb-3">{user?.role?.replace('ROLE_', '')}</span>

            <div className="text-start border-top pt-3 small text-muted">
              <div className="mb-2">
                <strong>Username:</strong> <span className="text-dark">{user?.username}</span>
              </div>
              <div className="mb-2">
                <strong>Email:</strong> <span className="text-dark">{user?.email}</span>
              </div>
              {user?.department && (
                <div className="mb-2">
                  <strong>Department:</strong> <span className="text-dark">{user.department.name}</span>
                </div>
              )}
              <div>
                <strong>Account Status:</strong> <span className="text-success fw-semibold">Active</span>
              </div>
            </div>
          </div>
        </div>

        {/* Update Form */}
        <div className="col-md-8">
          <div className="card-custom p-4 bg-white shadow-sm">
            <h5 className="fw-bold mb-4 border-bottom pb-2">Edit Profile & Password</h5>

            <form onSubmit={handleUpdate}>
              <div className="mb-3">
                <label className="form-label fw-semibold">Full Name *</label>
                <input
                  type="text"
                  className="form-control"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
              </div>

              <div className="mb-4">
                <label className="form-label fw-semibold">Phone Number</label>
                <input
                  type="tel"
                  className="form-control"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="e.g. +1-555-0199"
                />
              </div>

              <h6 className="fw-bold mb-3 border-top pt-3 text-secondary">Change Password (Leave blank to keep current)</h6>

              <div className="mb-3">
                <label className="form-label">Current Password</label>
                <input
                  type="password"
                  className="form-control"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter current password to change"
                />
              </div>

              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label">New Password</label>
                  <input
                    type="password"
                    className="form-control"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Min 6 characters"
                  />
                </div>

                <div className="col-md-6 mb-4">
                  <label className="form-label">Confirm New Password</label>
                  <input
                    type="password"
                    className="form-control"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat new password"
                  />
                </div>
              </div>

              <button type="submit" className="btn btn-primary px-4 fw-semibold" disabled={saving}>
                {saving ? 'Saving Changes...' : 'Save Profile Changes'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
