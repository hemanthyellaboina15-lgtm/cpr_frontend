-- ==============================================================================
-- Campus Problem Reporting and Resolution System
-- Database Schema for PostgreSQL
-- ==============================================================================

-- Drop tables in reverse order of foreign keys if they already exist
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS complaint_status_history CASCADE;
DROP TABLE IF EXISTS complaint_attachments CASCADE;
DROP TABLE IF EXISTS complaints CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS departments CASCADE;

-- ------------------------------------------------------------------------------
-- 1. DEPARTMENTS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE departments (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    code VARCHAR(20) NOT NULL UNIQUE,
    description TEXT,
    contact_email VARCHAR(100),
    contact_phone VARCHAR(20),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ------------------------------------------------------------------------------
-- 2. USERS TABLE
-- Roles: ROLE_STUDENT, ROLE_ADMIN, ROLE_STAFF
-- ------------------------------------------------------------------------------
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    phone_number VARCHAR(20),
    role VARCHAR(20) NOT NULL CHECK (role IN ('ROLE_STUDENT', 'ROLE_ADMIN', 'ROLE_STAFF')),
    department_id BIGINT REFERENCES departments(id) ON DELETE SET NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ------------------------------------------------------------------------------
-- 3. COMPLAINTS TABLE
-- Priority: LOW, MEDIUM, HIGH, CRITICAL
-- Status: Reported, In Progress, Resolved, Cancelled
-- Categories: Electrical, Plumbing and Water Leakage, Furniture, Cleanliness,
--             Wi-Fi and Network, Classroom Maintenance, Laboratory Equipment,
--             Safety and Security, Other
-- ------------------------------------------------------------------------------
CREATE TABLE complaints (
    id BIGSERIAL PRIMARY KEY,
    reference_no VARCHAR(30) NOT NULL UNIQUE,
    title VARCHAR(150) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(50) NOT NULL,
    location VARCHAR(150) NOT NULL,
    priority VARCHAR(20) NOT NULL DEFAULT 'MEDIUM' CHECK (priority IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
    status VARCHAR(20) NOT NULL DEFAULT 'Reported' CHECK (status IN ('Reported', 'In Progress', 'Resolved', 'Cancelled')),
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    department_id BIGINT REFERENCES departments(id) ON DELETE SET NULL,
    assigned_staff_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
    resolution_notes TEXT,
    resolved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ------------------------------------------------------------------------------
-- 4. COMPLAINT_ATTACHMENTS TABLE
-- Stores metadata of uploaded images attached to complaints
-- ------------------------------------------------------------------------------
CREATE TABLE complaint_attachments (
    id BIGSERIAL PRIMARY KEY,
    complaint_id BIGINT NOT NULL REFERENCES complaints(id) ON DELETE CASCADE,
    original_file_name VARCHAR(255) NOT NULL,
    stored_file_name VARCHAR(255) NOT NULL,
    file_type VARCHAR(100) NOT NULL,
    file_size BIGINT NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    uploaded_by_id BIGINT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ------------------------------------------------------------------------------
-- 5. COMPLAINT_STATUS_HISTORY TABLE
-- Audit log of every status or assignment transition
-- ------------------------------------------------------------------------------
CREATE TABLE complaint_status_history (
    id BIGSERIAL PRIMARY KEY,
    complaint_id BIGINT NOT NULL REFERENCES complaints(id) ON DELETE CASCADE,
    previous_status VARCHAR(20),
    new_status VARCHAR(20) NOT NULL,
    action_type VARCHAR(50) NOT NULL,
    notes TEXT,
    performed_by_id BIGINT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    assigned_department_id BIGINT REFERENCES departments(id) ON DELETE SET NULL,
    assigned_staff_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ------------------------------------------------------------------------------
-- 6. NOTIFICATIONS TABLE
-- User notification logs for complaint events
-- ------------------------------------------------------------------------------
CREATE TABLE notifications (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    complaint_id BIGINT REFERENCES complaints(id) ON DELETE CASCADE,
    title VARCHAR(150) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    notification_type VARCHAR(50) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ------------------------------------------------------------------------------
-- INDEXES FOR PERFORMANCE OPTIMIZATION
-- ------------------------------------------------------------------------------
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_department ON users(department_id);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);

CREATE INDEX idx_complaints_user ON complaints(user_id);
CREATE INDEX idx_complaints_status ON complaints(status);
CREATE INDEX idx_complaints_department ON complaints(department_id);
CREATE INDEX idx_complaints_assigned_staff ON complaints(assigned_staff_id);
CREATE INDEX idx_complaints_category ON complaints(category);
CREATE INDEX idx_complaints_priority ON complaints(priority);
CREATE INDEX idx_complaints_created_at ON complaints(created_at);
CREATE INDEX idx_complaints_reference_no ON complaints(reference_no);

CREATE INDEX idx_attachments_complaint ON complaint_attachments(complaint_id);
CREATE INDEX idx_history_complaint ON complaint_status_history(complaint_id);
CREATE INDEX idx_history_created_at ON complaint_status_history(created_at);

CREATE INDEX idx_notifications_user_read ON notifications(user_id, is_read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at);
