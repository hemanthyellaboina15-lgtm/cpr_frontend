import React from 'react';

export const AboutPage = () => {
  const departments = [
    { name: 'Electrical Maintenance', code: 'ELEC', email: 'electrical@campus.edu', phone: '+1-555-0101', lead: 'Robert Spark' },
    { name: 'Plumbing & Water Supply', code: 'PLUMB', email: 'plumbing@campus.edu', phone: '+1-555-0102', lead: 'David Water' },
    { name: 'Furniture & Carpentry', code: 'FURN', email: 'furniture@campus.edu', phone: '+1-555-0103', lead: 'Campus Workshop' },
    { name: 'Sanitation & Cleanliness', code: 'CLEAN', email: 'sanitation@campus.edu', phone: '+1-555-0104', lead: 'Hygiene Office' },
    { name: 'IT & Campus Network', code: 'IT_NET', email: 'it-support@campus.edu', phone: '+1-555-0105', lead: 'Sarah Lin' },
    { name: 'Campus Safety & Security', code: 'SECURITY', email: 'security@campus.edu', phone: '+1-555-0106', lead: 'Main Gate Control' },
  ];

  return (
    <div className="py-3">
      <div className="card-custom p-4 p-md-5 bg-white mb-4 shadow-sm">
        <h2 className="fw-bold mb-3">About the Campus Problem Reporting & Resolution System</h2>
        <p className="lead text-muted">
          A centralized, role-based campus facility management platform designed to automate and accelerate maintenance reporting, assignment, and resolution across all academic blocks, hostels, laboratories, and outdoor facilities.
        </p>

        <hr className="my-4" />

        <h4 className="fw-bold mb-3">Priority Guidelines</h4>
        <div className="row g-3 mb-4">
          <div className="col-md-3">
            <div className="p-3 bg-light rounded border border-danger">
              <span className="badge bg-danger mb-2">CRITICAL</span>
              <p className="small text-muted mb-0">Direct hazard to life, safety, or total class shutdown (e.g. electrical sparks, chemical leaks).</p>
            </div>
          </div>
          <div className="col-md-3">
            <div className="p-3 bg-light rounded border border-warning">
              <span className="badge bg-warning text-dark mb-2">HIGH</span>
              <p className="small text-muted mb-0">Severe disruption to daily activities (e.g. library Wi-Fi outage, washroom flooding).</p>
            </div>
          </div>
          <div className="col-md-3">
            <div className="p-3 bg-light rounded border border-primary">
              <span className="badge bg-primary mb-2">MEDIUM</span>
              <p className="small text-muted mb-0">Facility impaired but workarounds exist (e.g. broken desk, flickering back row light).</p>
            </div>
          </div>
          <div className="col-md-3">
            <div className="p-3 bg-light rounded border border-secondary">
              <span className="badge bg-secondary mb-2">LOW</span>
              <p className="small text-muted mb-0">Cosmetic or non-urgent repairs (e.g. wall paint scuff, door squeak).</p>
            </div>
          </div>
        </div>

        <h4 className="fw-bold mb-3">Campus Department Directory</h4>
        <div className="table-responsive">
          <table className="table table-bordered table-custom">
            <thead>
              <tr>
                <th>Department</th>
                <th>Code</th>
                <th>Contact Email</th>
                <th>Direct Phone</th>
                <th>Staff Lead</th>
              </tr>
            </thead>
            <tbody>
              {departments.map((d, i) => (
                <tr key={i}>
                  <td className="fw-semibold text-dark">{d.name}</td>
                  <td><code>{d.code}</code></td>
                  <td><a href={`mailto:${d.email}`}>{d.email}</a></td>
                  <td>{d.phone}</td>
                  <td>{d.lead}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
