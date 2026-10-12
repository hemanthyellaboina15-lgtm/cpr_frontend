import React from 'react';

export const LoadingSpinner = ({ message = 'Loading details...' }) => (
  <div className="d-flex flex-column align-items-center justify-content-center p-5">
    <div className="spinner-border text-primary" role="status" style={{ width: '3rem', height: '3rem' }}>
      <span className="visually-hidden">Loading...</span>
    </div>
    <p className="mt-3 text-muted fw-medium">{message}</p>
  </div>
);
