import React from 'react';
import { Link } from 'react-router-dom';

export const NotFoundPage = () => (
  <div className="card-custom p-5 text-center my-5 bg-white shadow-sm">
    <div className="display-1 fw-bold text-primary mb-3">404</div>
    <h3 className="fw-bold mb-2">Page Not Found</h3>
    <p className="text-muted mb-4">The page or resource you are looking for does not exist.</p>
    <div>
      <Link to="/" className="btn btn-primary px-4 py-2">
        <i className="bi bi-house-door me-1"></i> Return to Home
      </Link>
    </div>
  </div>
);
