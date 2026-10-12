import React from 'react';

export const StatusBadge = ({ status }) => {
  if (!status) return null;

  switch (status) {
    case 'Reported':
      return <span className="badge-status badge-reported"><i className="bi bi-clock"></i> Reported</span>;
    case 'In Progress':
      return <span className="badge-status badge-in-progress"><i className="bi bi-gear-fill"></i> In Progress</span>;
    case 'Resolved':
      return <span className="badge-status badge-resolved"><i className="bi bi-check-circle-fill"></i> Resolved</span>;
    case 'Cancelled':
      return <span className="badge-status badge-cancelled"><i className="bi bi-x-circle-fill"></i> Cancelled</span>;
    default:
      return <span className="badge-status badge-cancelled">{status}</span>;
  }
};

export const PriorityBadge = ({ priority }) => {
  if (!priority) return null;

  switch (priority) {
    case 'LOW':
      return <span className="badge-status badge-prio-low"><i className="bi bi-arrow-down-short"></i> Low</span>;
    case 'MEDIUM':
      return <span className="badge-status badge-prio-medium"><i className="bi bi-dash"></i> Medium</span>;
    case 'HIGH':
      return <span className="badge-status badge-prio-high"><i className="bi bi-arrow-up-short"></i> High</span>;
    case 'CRITICAL':
      return <span className="badge-status badge-prio-critical"><i className="bi bi-exclamation-triangle-fill"></i> Critical</span>;
    default:
      return <span className="badge-status">{priority}</span>;
  }
};
