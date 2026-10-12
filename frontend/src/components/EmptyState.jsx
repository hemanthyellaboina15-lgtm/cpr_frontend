import React from 'react';
import { Link } from 'react-router-dom';

export const EmptyState = ({
  icon = 'bi-inbox',
  title = 'No records found',
  message = 'There is no data matching your current filters or criteria.',
  actionText,
  actionLink,
  onAction,
}) => (
  <div className="card-custom p-5 text-center my-4">
    <div className="mb-3">
      <i className={`bi ${icon} text-muted`} style={{ fontSize: '3.5rem' }}></i>
    </div>
    <h5 className="fw-semibold text-dark">{title}</h5>
    <p className="text-muted mx-auto" style={{ maxWidth: '420px' }}>
      {message}
    </p>
    {(actionText && actionLink) && (
      <div>
        <Link to={actionLink} className="btn btn-primary px-4 py-2 mt-2">
          {actionText}
        </Link>
      </div>
    )}
    {(actionText && onAction) && (
      <div>
        <button onClick={onAction} className="btn btn-primary px-4 py-2 mt-2">
          {actionText}
        </button>
      </div>
    )}
  </div>
);
