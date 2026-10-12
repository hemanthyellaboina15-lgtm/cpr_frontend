import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const Sidebar = ({ isOpen, onClose }) => {
  const { user, isStudent, isAdmin, isStaff } = useAuth();

  return (
    <aside className={`sidebar ${isOpen ? 'show' : ''}`}>
      <div className="sidebar-header">
        <div className="bg-primary text-white rounded p-1 d-flex align-items-center justify-content-center" style={{ width: 32, height: 32 }}>
          <i className="bi bi-building"></i>
        </div>
        <div className="overflow-hidden">
          <div className="fw-bold text-white small text-truncate">Campus Helpdesk</div>
          <div className="text-secondary" style={{ fontSize: '0.72rem' }}>
            {isAdmin ? 'Admin Console' : isStaff ? 'Staff Portal' : 'Student Portal'}
          </div>
        </div>
      </div>

      <nav className="sidebar-nav">
        {/* STUDENT NAVIGATION */}
        {isStudent && (
          <>
            <NavLink to="/student/dashboard" className="sidebar-link" onClick={onClose}>
              <i className="bi bi-grid-fill"></i> Dashboard
            </NavLink>
            <NavLink to="/student/submit" className="sidebar-link" onClick={onClose}>
              <i className="bi bi-plus-circle-fill text-warning"></i> Report a Problem
            </NavLink>
            <NavLink to="/student/complaints" className="sidebar-link" onClick={onClose}>
              <i className="bi bi-list-task"></i> My Complaints
            </NavLink>
            <NavLink to="/student/notifications" className="sidebar-link" onClick={onClose}>
              <i className="bi bi-bell-fill"></i> Notifications
            </NavLink>
            <NavLink to="/profile" className="sidebar-link" onClick={onClose}>
              <i className="bi bi-person-badge-fill"></i> My Profile
            </NavLink>
          </>
        )}

        {/* ADMIN NAVIGATION */}
        {isAdmin && (
          <>
            <NavLink to="/admin/dashboard" className="sidebar-link" onClick={onClose}>
              <i className="bi bi-speedometer2"></i> Dashboard
            </NavLink>
            <NavLink to="/admin/complaints" className="sidebar-link" onClick={onClose}>
              <i className="bi bi-card-checklist"></i> All Complaints
            </NavLink>
            <NavLink to="/admin/departments" className="sidebar-link" onClick={onClose}>
              <i className="bi bi-diagram-3-fill"></i> Departments
            </NavLink>
            <NavLink to="/admin/staff" className="sidebar-link" onClick={onClose}>
              <i className="bi bi-person-gear"></i> Staff Members
            </NavLink>
            <NavLink to="/admin/users" className="sidebar-link" onClick={onClose}>
              <i className="bi bi-people-fill"></i> User Directory
            </NavLink>
            <NavLink to="/admin/reports" className="sidebar-link" onClick={onClose}>
              <i className="bi bi-graph-up-arrow"></i> Reports & Stats
            </NavLink>
            <NavLink to="/profile" className="sidebar-link" onClick={onClose}>
              <i className="bi bi-person-badge-fill"></i> My Profile
            </NavLink>
          </>
        )}

        {/* STAFF NAVIGATION */}
        {isStaff && (
          <>
            <NavLink to="/staff/dashboard" className="sidebar-link" onClick={onClose}>
              <i className="bi bi-speedometer2"></i> Dashboard
            </NavLink>
            <NavLink to="/staff/complaints" className="sidebar-link" onClick={onClose}>
              <i className="bi bi-tools"></i> Assigned Tasks
            </NavLink>
            <NavLink to="/staff/history" className="sidebar-link" onClick={onClose}>
              <i className="bi bi-clock-history"></i> Work History
            </NavLink>
            <NavLink to="/student/notifications" className="sidebar-link" onClick={onClose}>
              <i className="bi bi-bell-fill"></i> Notifications
            </NavLink>
            <NavLink to="/profile" className="sidebar-link" onClick={onClose}>
              <i className="bi bi-person-badge-fill"></i> My Profile
            </NavLink>
          </>
        )}
      </nav>

      <div className="p-3 border-top border-secondary border-opacity-25 mt-auto">
        <div className="small text-muted">
          Logged in as: <strong className="text-light">{user?.username}</strong>
        </div>
      </div>
    </aside>
  );
};
