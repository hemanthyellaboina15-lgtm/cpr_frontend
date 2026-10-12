import React, { useState, useEffect } from 'react';
import { userApi } from '../../api/userApi';
import { LoadingSpinner } from '../../components/LoadingSpinner';

export const UserManagementPage = () => {
  const [users, setUsers] = useState([]);
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ text: '', type: '' });

  const fetchUsers = async () => {
    try {
      const res = await userApi.getAllUsers();
      setUsers(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleToggleStatus = async (id, currentActive, username) => {
    try {
      await userApi.toggleUserStatus(id, !currentActive);
      setMessage({
        text: `User ${username} has been ${!currentActive ? 'activated' : 'deactivated'}.`,
        type: 'info',
      });
      fetchUsers();
    } catch (err) {
      setMessage({ text: err.response?.data?.message || 'Status change failed', type: 'danger' });
    }
  };

  const filteredUsers = roleFilter === 'ALL'
    ? users
    : users.filter((u) => u.role === roleFilter);

  const getRoleBadge = (role) => {
    switch (role) {
      case 'ROLE_ADMIN':
        return <span className="badge bg-danger">Administrator</span>;
      case 'ROLE_STAFF':
        return <span className="badge bg-warning text-dark">Staff</span>;
      case 'ROLE_STUDENT':
        return <span className="badge bg-info text-dark">Student</span>;
      default:
        return <span className="badge bg-secondary">{role}</span>;
    }
  };

  return (
    <div>
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-2">
        <div>
          <h2 className="fw-bold mb-1">User Directory</h2>
          <p className="text-muted small mb-0">View all registered campus accounts and control access permissions.</p>
        </div>

        <div>
          <select
            className="form-select"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
          >
            <option value="ALL">All Roles</option>
            <option value="ROLE_STUDENT">Students Only</option>
            <option value="ROLE_STAFF">Staff Only</option>
            <option value="ROLE_ADMIN">Administrators Only</option>
          </select>
        </div>
      </div>

      {message.text && (
        <div className={`alert alert-${message.type} alert-dismissible fade show`} role="alert">
          {message.text}
          <button type="button" className="btn-close" onClick={() => setMessage({ text: '', type: '' })}></button>
        </div>
      )}

      {loading ? (
        <LoadingSpinner message="Loading user directory..." />
      ) : (
        <div className="card-custom bg-white shadow-sm overflow-hidden">
          <div className="table-responsive">
            <table className="table table-hover table-custom">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Username</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Department</th>
                  <th>Status</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((u) => (
                  <tr key={u.id}>
                    <td>
                      <div className="fw-bold text-dark">{u.fullName}</div>
                      <small className="text-muted">{u.phoneNumber || 'No phone'}</small>
                    </td>
                    <td><code>{u.username}</code></td>
                    <td>{u.email}</td>
                    <td>{getRoleBadge(u.role)}</td>
                    <td>
                      {u.department ? (
                        <span className="badge bg-light text-dark">{u.department.name}</span>
                      ) : (
                        <span className="text-muted small">-</span>
                      )}
                    </td>
                    <td>
                      {u.active ? (
                        <span className="badge bg-success">Active</span>
                      ) : (
                        <span className="badge bg-danger">Inactive</span>
                      )}
                    </td>
                    <td className="text-end">
                      {u.role !== 'ROLE_ADMIN' && (
                        <button
                          onClick={() => handleToggleStatus(u.id, u.active, u.username)}
                          className={`btn btn-sm ${u.active ? 'btn-outline-danger' : 'btn-outline-success'}`}
                        >
                          {u.active ? 'Deactivate' : 'Activate'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="p-3 border-top text-muted small">
            Showing {filteredUsers.length} of {users.length} total users.
          </div>
        </div>
      )}
    </div>
  );
};
