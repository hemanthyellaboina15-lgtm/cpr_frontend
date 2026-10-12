import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export const HomePage = () => {
  const { isAuthenticated, user, isStudent, isAdmin, isStaff } = useAuth();
  const [trackRef, setTrackRef] = useState('');
  const navigate = useNavigate();

  const handleTrack = (e) => {
    e.preventDefault();
    if (trackRef.trim()) {
      navigate(`/track?ref=${encodeURIComponent(trackRef.trim())}`);
    }
  };

  const getDashboardLink = () => {
    if (isAdmin) return '/admin/dashboard';
    if (isStaff) return '/staff/dashboard';
    return '/student/dashboard';
  };

  const categories = [
    { title: 'Electrical', icon: 'bi-lightning-charge', desc: 'Lighting, outlets, switches, projectors, and wiring issues' },
    { title: 'Plumbing & Water', icon: 'bi-droplet-half', desc: 'Washroom leaks, clogged pipes, water cooler filters' },
    { title: 'Furniture & Carpentry', icon: 'bi-hammer', desc: 'Broken desks, loose chairs, door locks, whiteboard frames' },
    { title: 'Cleanliness & Hygiene', icon: 'bi-trash3', desc: 'Classroom waste disposal, washroom cleaning, sanitation' },
    { title: 'Wi-Fi & Network', icon: 'bi-wifi', desc: 'Campus access points, hostel Ethernet, lab connectivity' },
    { title: 'Classroom Maintenance', icon: 'bi-easel', desc: 'Podiums, air conditioning, blinds, PA microphone systems' },
  ];

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-primary text-white py-5 px-3 rounded-4 mb-5 shadow-sm">
        <div className="container py-4">
          <div className="row align-items-center g-5">
            <div className="col-lg-7">
              <span className="badge bg-light text-primary px-3 py-2 rounded-pill fw-bold mb-3">
                <i className="bi bi-shield-check me-1"></i> Transparent Campus Maintenance
              </span>
              <h1 className="display-5 fw-bold mb-3">
                Prompt Campus Problem Reporting & Real-Time Resolution
              </h1>
              <p className="lead mb-4 text-light opacity-90">
                Lodge college complaints about electrical faults, water leakage, broken desks, and Wi-Fi outages with image attachments. Track every update directly from submission to resolution.
              </p>

              <div className="d-flex flex-wrap gap-3">
                {isAuthenticated ? (
                  <Link to={getDashboardLink()} className="btn btn-light btn-lg px-4 text-primary fw-bold shadow-sm">
                    <i className="bi bi-speedometer2 me-2"></i> Open My Dashboard
                  </Link>
                ) : (
                  <>
                    <Link to="/register" className="btn btn-warning btn-lg px-4 fw-bold shadow-sm">
                      <i className="bi bi-person-plus-fill me-2"></i> Student Registration
                    </Link>
                    <Link to="/login" className="btn btn-outline-light btn-lg px-4 fw-semibold">
                      <i className="bi bi-box-arrow-in-right me-2"></i> Log In
                    </Link>
                  </>
                )}
              </div>
            </div>

            {/* Quick Track Reference Box */}
            <div className="col-lg-5">
              <div className="card-custom p-4 bg-white text-dark shadow">
                <h4 className="fw-bold mb-2">Track Complaint Status</h4>
                <p className="text-muted small mb-3">
                  Have a complaint reference number? Enter it below to check current progress instantly.
                </p>
                <form onSubmit={handleTrack}>
                  <div className="mb-3">
                    <div className="input-group">
                      <span className="input-group-text bg-light">
                        <i className="bi bi-search text-primary"></i>
                      </span>
                      <input
                        type="text"
                        className="form-control py-2"
                        placeholder="e.g. CMP-20261010-A101"
                        value={trackRef}
                        onChange={(e) => setTrackRef(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  <button type="submit" className="btn btn-primary w-100 py-2 fw-semibold">
                    Track Complaint
                  </button>
                </form>

                <div className="mt-3 pt-3 border-top text-center">
                  <span className="text-muted small">Need immediate assistance? </span>
                  <Link to="/about" className="text-primary small fw-semibold text-decoration-none">
                    View Campus Contacts
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="mb-5">
        <div className="text-center mb-4">
          <h2 className="fw-bold">Report Campus Facilities & Services</h2>
          <p className="text-muted">Choose your category when reporting an issue for rapid routing</p>
        </div>

        <div className="row g-4">
          {categories.map((c, idx) => (
            <div key={idx} className="col-md-6 col-lg-4">
              <div className="card-custom h-100 p-4 hover-shadow">
                <div className="stat-icon bg-primary bg-opacity-10 text-primary mb-3">
                  <i className={`bi ${c.icon}`}></i>
                </div>
                <h5 className="fw-bold text-dark">{c.title}</h5>
                <p className="text-muted small mb-0">{c.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="card-custom p-5 mb-5 bg-white">
        <div className="text-center mb-5">
          <h2 className="fw-bold">Resolution Process</h2>
          <p className="text-muted">A clear, 3-step structured lifecycle for every campus report</p>
        </div>

        <div className="row g-4 text-center">
          <div className="col-md-4">
            <div className="p-3">
              <div className="bg-primary text-white rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{ width: 56, height: 56 }}>
                <span className="fs-4 fw-bold">1</span>
              </div>
              <h5 className="fw-bold">1. Report Issue</h5>
              <p className="text-muted small">
                Student submits description, room location, priority, and optional photos.
              </p>
            </div>
          </div>

          <div className="col-md-4">
            <div className="p-3">
              <div className="bg-warning text-dark rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{ width: 56, height: 56 }}>
                <span className="fs-4 fw-bold">2</span>
              </div>
              <h5 className="fw-bold">2. Assign & Diagnose</h5>
              <p className="text-muted small">
                Administrators assign the task to the right department technician (status: In Progress).
              </p>
            </div>
          </div>

          <div className="col-md-4">
            <div className="p-3">
              <div className="bg-success text-white rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{ width: 56, height: 56 }}>
                <span className="fs-4 fw-bold">3</span>
              </div>
              <h5 className="fw-bold">3. Resolve & Verify</h5>
              <p className="text-muted small">
                Staff fixes the problem, uploads resolution notes, and marks the report as Resolved.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
