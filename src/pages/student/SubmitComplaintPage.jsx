import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { complaintApi } from '../../api/complaintApi';

export const SubmitComplaintPage = () => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [location, setLocation] = useState('');
  const [priority, setPriority] = useState('MEDIUM');
  const [description, setDescription] = useState('');
  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [createdComplaint, setCreatedComplaint] = useState(null);

  const navigate = useNavigate();

  const categories = [
    'Electrical',
    'Plumbing and Water Leakage',
    'Furniture',
    'Cleanliness',
    'Wi-Fi and Network',
    'Classroom Maintenance',
    'Laboratory Equipment',
    'Safety and Security',
    'Other',
  ];

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    // Validate file size and type
    const validFiles = [];
    const previewUrls = [];

    for (const file of selectedFiles) {
      if (file.size > 10 * 1024 * 1024) {
        setError(`File ${file.name} is larger than the 10MB limit.`);
        return;
      }
      if (!file.type.startsWith('image/')) {
        setError(`File ${file.name} is not an image. Only JPG, PNG, WEBP, and GIF are permitted.`);
        return;
      }
      validFiles.push(file);
      previewUrls.push(URL.createObjectURL(file));
    }

    setFiles(validFiles);
    setPreviews(previewUrls);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!category) {
      setError('Please select an issue category.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('title', title.trim());
      formData.append('category', category);
      formData.append('location', location.trim());
      formData.append('priority', priority);
      formData.append('description', description.trim());

      for (const file of files) {
        formData.append('files', file);
      }

      const res = await complaintApi.createComplaint(formData);
      setCreatedComplaint(res.data);
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to submit complaint. Please check your inputs.';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (createdComplaint) {
    return (
      <div className="card-custom p-5 bg-white text-center shadow-sm my-4">
        <div className="bg-success text-white rounded-circle d-inline-flex align-items-center justify-content-center p-3 mb-3" style={{ width: 70, height: 70 }}>
          <i className="bi bi-check-lg fs-1"></i>
        </div>
        <h3 className="fw-bold text-success mb-2">Complaint Submitted Successfully!</h3>
        <p className="text-muted">
          Your campus report has been logged and assigned the tracking reference:
        </p>
        <div className="my-3">
          <span className="badge bg-primary fs-5 px-4 py-2 font-monospace">
            {createdComplaint.referenceNo}
          </span>
        </div>
        <p className="text-secondary small mb-4">
          Campus administrators will review your complaint and assign it to the responsible department technician. You will receive notifications on updates.
        </p>
        <div className="d-flex justify-content-center gap-3">
          <Link to={`/student/complaints/${createdComplaint.id}`} className="btn btn-primary px-4">
            <i className="bi bi-eye me-1"></i> View Complaint Details
          </Link>
          <button
            onClick={() => {
              setCreatedComplaint(null);
              setTitle('');
              setDescription('');
              setLocation('');
              setCategory('');
              setFiles([]);
              setPreviews([]);
            }}
            className="btn btn-outline-secondary px-4"
          >
            Submit Another Complaint
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="py-2">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold mb-1">Report a Campus Problem</h2>
          <p className="text-muted small mb-0">Fill out the details below. Supporting photos help staff diagnose the issue faster.</p>
        </div>
        <Link to="/student/complaints" className="btn btn-outline-secondary btn-sm">
          <i className="bi bi-arrow-left me-1"></i> Back to My Complaints
        </Link>
      </div>

      <div className="card-custom p-4 p-md-5 bg-white shadow-sm">
        {error && (
          <div className="alert alert-danger py-2 small mb-4">
            <i className="bi bi-exclamation-triangle me-1"></i> {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label fw-semibold">Complaint Title *</label>
            <input
              type="text"
              className="form-control form-control-lg"
              placeholder="e.g. Water leak under sink in Science Block 2nd Floor washroom"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              minLength={5}
              maxLength={150}
              required
            />
            <div className="form-text">Briefly state what the problem is (5 to 150 characters).</div>
          </div>

          <div className="row">
            <div className="col-md-6 mb-3">
              <label className="form-label fw-semibold">Category *</label>
              <select
                className="form-select"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                required
              >
                <option value="">-- Select Problem Category --</option>
                {categories.map((c, i) => (
                  <option key={i} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-md-6 mb-3">
              <label className="form-label fw-semibold">Initial Priority</label>
              <select
                className="form-select"
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
              >
                <option value="LOW">Low (Minor inconvenience / Cosmetic)</option>
                <option value="MEDIUM">Medium (Normal repair needed)</option>
                <option value="HIGH">High (Disrupting class / Urgent hazard)</option>
                <option value="CRITICAL">Critical (Immediate safety risk / Emergency)</option>
              </select>
            </div>
          </div>

          <div className="mb-3">
            <label className="form-label fw-semibold">Campus Location / Room *</label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. Science Block B, 2nd Floor, Room 204 Washroom"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              minLength={3}
              maxLength={150}
              required
            />
            <div className="form-text">Specify block, floor, room number, or outdoor landmark.</div>
          </div>

          <div className="mb-4">
            <label className="form-label fw-semibold">Detailed Description *</label>
            <textarea
              className="form-control"
              rows="4"
              placeholder="Explain the issue in detail, how long it has been occurring, and any safety hazards..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              minLength={10}
              maxLength={2000}
              required
            ></textarea>
          </div>

          {/* Supporting Images */}
          <div className="mb-4">
            <label className="form-label fw-semibold">Attach Supporting Photos (Optional)</label>
            <input
              type="file"
              className="form-control"
              accept="image/jpeg,image/png,image/webp,image/gif"
              multiple
              onChange={handleFileChange}
            />
            <div className="form-text">You can attach multiple photos (max 10MB per image). Accepted formats: JPG, PNG, WEBP, GIF.</div>

            {previews.length > 0 && (
              <div className="d-flex flex-wrap gap-2 mt-3">
                {previews.map((url, i) => (
                  <div key={i} className="position-relative border rounded p-1 bg-light" style={{ width: 100, height: 100 }}>
                    <img src={url} alt="Preview" className="w-100 h-100 object-fit-cover rounded" />
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="d-flex justify-content-end gap-3 pt-3 border-top">
            <button
              type="button"
              className="btn btn-outline-secondary px-4"
              onClick={() => navigate('/student/complaints')}
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary px-5 fw-semibold"
              disabled={submitting}
            >
              {submitting ? (
                <span><span className="spinner-border spinner-border-sm me-2"></span>Submitting Ticket...</span>
              ) : (
                <span><i className="bi bi-send-fill me-1"></i> Submit Complaint</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
