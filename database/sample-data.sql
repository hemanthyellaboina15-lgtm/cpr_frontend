-- ==============================================================================
-- Campus Problem Reporting and Resolution System
-- Sample Seed Data for Testing & Demonstration
-- ==============================================================================

-- 1. SEED DEPARTMENTS
INSERT INTO departments (id, name, code, description, contact_email, contact_phone, is_active) VALUES
(1, 'Electrical Maintenance', 'ELEC', 'Handles lighting, power points, projectors, and wiring issues', 'electrical@campus.edu', '+1-555-0101', true),
(2, 'Plumbing & Water Supply', 'PLUMB', 'Handles washrooms, water filters, leakages, and pipeline issues', 'plumbing@campus.edu', '+1-555-0102', true),
(3, 'Furniture & Carpentry', 'FURN', 'Handles desks, chairs, doors, window panes, and boards', 'furniture@campus.edu', '+1-555-0103', true),
(4, 'Sanitation & Cleanliness', 'CLEAN', 'Handles general cleanliness, waste disposal, and pest control', 'sanitation@campus.edu', '+1-555-0104', true),
(5, 'IT & Campus Network', 'IT_NET', 'Handles campus Wi-Fi, Ethernet, smart classroom setups, and labs', 'it-support@campus.edu', '+1-555-0105', true),
(6, 'Campus Safety & Security', 'SECURITY', 'Handles locks, CCTV surveillance, campus gates, and lighting safety', 'security@campus.edu', '+1-555-0106', true)
ON CONFLICT (id) DO NOTHING;

-- Reset sequence for departments
SELECT setval('departments_id_seq', (SELECT MAX(id) FROM departments));

-- 2. SEED USERS
-- Default passwords:
-- Admin:   Admin@123   (BCrypt hash: $2a$10$wE0bM5h21WjD6P8JekZkG.a3yTqmO1lF76P10dCj6o0B5C1CjK6yO - generated dynamically by DataInitializer)
-- Staff:   Staff@123
-- Student: Student@123
--
-- Notice: Spring Boot's DataInitializer will auto-seed or update passwords with exact BCrypt hashes on first run.
INSERT INTO users (id, username, email, password, full_name, phone_number, role, department_id, is_active) VALUES
(1, 'admin', 'admin@campus.edu', '$2a$10$n8r3VqKqv6.2vF0aP6bLhe2tJ7H5FjQ/6Xw.tF2/Y3A8q4hQ0oR0C', 'System Administrator', '+1-555-0001', 'ROLE_ADMIN', NULL, true),
(2, 'staff_elec', 'elec.staff@campus.edu', '$2a$10$n8r3VqKqv6.2vF0aP6bLhe2tJ7H5FjQ/6Xw.tF2/Y3A8q4hQ0oR0C', 'Robert Spark (Electrical)', '+1-555-0002', 'ROLE_STAFF', 1, true),
(3, 'staff_plumb', 'plumb.staff@campus.edu', '$2a$10$n8r3VqKqv6.2vF0aP6bLhe2tJ7H5FjQ/6Xw.tF2/Y3A8q4hQ0oR0C', 'David Water (Plumbing)', '+1-555-0003', 'ROLE_STAFF', 2, true),
(4, 'staff_it', 'it.staff@campus.edu', '$2a$10$n8r3VqKqv6.2vF0aP6bLhe2tJ7H5FjQ/6Xw.tF2/Y3A8q4hQ0oR0C', 'Sarah Lin (Network)', '+1-555-0004', 'ROLE_STAFF', 5, true),
(5, 'student_john', 'john.doe@student.campus.edu', '$2a$10$n8r3VqKqv6.2vF0aP6bLhe2tJ7H5FjQ/6Xw.tF2/Y3A8q4hQ0oR0C', 'John Doe (CS Student)', '+1-555-0005', 'ROLE_STUDENT', NULL, true),
(6, 'student_jane', 'jane.smith@student.campus.edu', '$2a$10$n8r3VqKqv6.2vF0aP6bLhe2tJ7H5FjQ/6Xw.tF2/Y3A8q4hQ0oR0C', 'Jane Smith (BioTech Student)', '+1-555-0006', 'ROLE_STUDENT', NULL, true)
ON CONFLICT (id) DO NOTHING;

-- Reset sequence for users
SELECT setval('users_id_seq', (SELECT MAX(id) FROM users));

-- 3. SEED COMPLAINTS
INSERT INTO complaints (id, reference_no, title, description, category, location, priority, status, user_id, department_id, assigned_staff_id, resolution_notes, resolved_at, created_at, updated_at) VALUES
(1, 'CMP-20261010-0001', 'Water pipe leaking under sink in Science Block 2nd Floor Washroom', 'Water has been continuously dripping and pooling on the washroom floor since morning, causing a slipping hazard.', 'Plumbing and Water Leakage', 'Science Block, 2nd Floor, Room 204 Washroom', 'HIGH', 'In Progress', 5, 2, 3, NULL, NULL, CURRENT_TIMESTAMP - INTERVAL '2 days', CURRENT_TIMESTAMP - INTERVAL '1 day'),

(2, 'CMP-20261011-0002', 'Projector flickering and switching off in Engineering Block Lecture Hall 3', 'The ceiling projector HDMI port disconnects randomly every 5 minutes during lectures.', 'Electrical', 'Engineering Block A, 1st Floor, Lecture Hall 3', 'CRITICAL', 'Reported', 5, 1, 2, NULL, NULL, CURRENT_TIMESTAMP - INTERVAL '1 day', CURRENT_TIMESTAMP - INTERVAL '1 day'),

(3, 'CMP-20261009-0003', 'Broken bench and sharp metal edge in Room 102', 'One bench has a cracked wooden seat and an exposed sharp nail. Two students could not sit during tutorial.', 'Furniture', 'Academic Block B, Ground Floor, Room 102', 'MEDIUM', 'Resolved', 6, 3, NULL, 'Replaced damaged bench slats and smoothed structural brackets. Tested for student seating safety.', CURRENT_TIMESTAMP - INTERVAL '6 hours', CURRENT_TIMESTAMP - INTERVAL '3 days', CURRENT_TIMESTAMP - INTERVAL '6 hours'),

(4, 'CMP-20261012-0004', 'Library 2nd Floor Wi-Fi access point offline', 'Wi-Fi SSID Campus_Student is unavailable on the entire east wing of Central Library.', 'Wi-Fi and Network', 'Central Library, 2nd Floor, East Reading Wing', 'HIGH', 'In Progress', 6, 5, 4, NULL, NULL, CURRENT_TIMESTAMP - INTERVAL '5 hours', CURRENT_TIMESTAMP - INTERVAL '2 hours')
ON CONFLICT (id) DO NOTHING;

-- Reset sequence for complaints
SELECT setval('complaints_id_seq', (SELECT MAX(id) FROM complaints));

-- 4. SEED COMPLAINT STATUS HISTORY
INSERT INTO complaint_status_history (complaint_id, previous_status, new_status, action_type, notes, performed_by_id, assigned_department_id, assigned_staff_id, created_at) VALUES
(1, NULL, 'Reported', 'SUBMITTED', 'Complaint submitted by student John Doe', 5, NULL, NULL, CURRENT_TIMESTAMP - INTERVAL '2 days'),
(1, 'Reported', 'In Progress', 'ASSIGNED', 'Assigned to Plumbing Department and technician David Water', 1, 2, 3, CURRENT_TIMESTAMP - INTERVAL '1 day'),
(2, NULL, 'Reported', 'SUBMITTED', 'Complaint submitted by student John Doe', 5, NULL, NULL, CURRENT_TIMESTAMP - INTERVAL '1 day'),
(2, 'Reported', 'Reported', 'ASSIGNED', 'Assigned to Electrical Department and technician Robert Spark', 1, 1, 2, CURRENT_TIMESTAMP - INTERVAL '1 day'),
(3, NULL, 'Reported', 'SUBMITTED', 'Complaint submitted by student Jane Smith', 6, NULL, NULL, CURRENT_TIMESTAMP - INTERVAL '3 days'),
(3, 'Reported', 'In Progress', 'IN_PROGRESS', 'Carpenter team inspected damaged bench and initiated replacement', 1, 3, NULL, CURRENT_TIMESTAMP - INTERVAL '1 day'),
(3, 'In Progress', 'Resolved', 'RESOLVED', 'Replaced damaged bench slats and smoothed structural brackets. Tested for student seating safety.', 1, 3, NULL, CURRENT_TIMESTAMP - INTERVAL '6 hours'),
(4, NULL, 'Reported', 'SUBMITTED', 'Complaint submitted by student Jane Smith', 6, NULL, NULL, CURRENT_TIMESTAMP - INTERVAL '5 hours'),
(4, 'Reported', 'In Progress', 'ASSIGNED', 'Assigned to IT Network staff Sarah Lin. Access point AP-LIB-2E diagnosed.', 1, 5, 4, CURRENT_TIMESTAMP - INTERVAL '2 hours');

-- 5. SEED NOTIFICATIONS
INSERT INTO notifications (user_id, complaint_id, title, message, is_read, notification_type, created_at) VALUES
(5, 1, 'Complaint Assigned', 'Your complaint CMP-20261010-0001 has been assigned to Plumbing & Water Supply (Technician: David Water).', false, 'COMPLAINT_ASSIGNED', CURRENT_TIMESTAMP - INTERVAL '1 day'),
(5, 2, 'Complaint Registered', 'Your complaint CMP-20261011-0002 has been successfully registered.', true, 'COMPLAINT_SUBMITTED', CURRENT_TIMESTAMP - INTERVAL '1 day'),
(6, 3, 'Complaint Resolved', 'Your complaint CMP-20261009-0003 has been marked as Resolved by administration.', false, 'COMPLAINT_RESOLVED', CURRENT_TIMESTAMP - INTERVAL '6 hours'),
(6, 4, 'Complaint In Progress', 'Technician Sarah Lin is investigating your complaint CMP-20261012-0004.', false, 'STATUS_CHANGED', CURRENT_TIMESTAMP - INTERVAL '2 hours');
