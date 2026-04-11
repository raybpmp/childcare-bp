-- ==========================================
-- CCBP PORTAL DATABASE MASTER MANIFEST (v1.2)
-- This manifest defines the absolute Baseline.
-- v1.1: Added users.status for Admin suspend/ban functionality.
-- v1.2: Added admin_notes, login_history tables for Admin CRM.
-- ==========================================

-- AI OPERATIONAL CONTEXT:
-- 1. READ Patterns: Dashboard stats pull from users.logins, users.role, users.status, and activities.
-- 2. WRITE Patterns: Session starts use PUT /v1/users/:uid (logins increment) + POST /v1/activities.
-- 3. Admin Actions use PUT /v1/users/:uid (status, tier_id) + POST /v1/activities (type='AdminAction').
-- 4. SCHEMA Management: Use sequential files (02, 03) for all changes after this baseline.

-- [1] ACCESS TIERS (Lookup for Roles/Plans)
CREATE TABLE IF NOT EXISTS access_tiers (
    id INT PRIMARY KEY AUTO_INCREMENT,
    tier_type VARCHAR(50) NOT NULL, -- 'Internal', 'Customer'
    tier_name VARCHAR(50) UNIQUE NOT NULL -- 'Admin', 'Employee', 'Free', 'Launchpad', etc.
);

INSERT IGNORE INTO access_tiers (tier_type, tier_name) VALUES 
('Internal', 'Admin'), 
('Internal', 'Employee'), 
('Customer', 'Free'), 
('Customer', 'Launchpad'), 
('Customer', 'Director'), 
('Customer', 'Ceo Circle');

-- [2] USERS (Core Identity & Access)
-- Mapping: Dashboard Card "Total Logins" -> users.logins
-- Mapping: Admin Dashboard Status badge -> users.status
CREATE TABLE IF NOT EXISTS users (
    uid VARCHAR(128) PRIMARY KEY, -- Firebase UID
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255),
    role VARCHAR(50) DEFAULT 'Member',
    tier_id INT DEFAULT 3,
    status VARCHAR(20) DEFAULT 'active', -- 'active', 'suspended', 'banned'
    logins INT DEFAULT 0, -- Audited requirement for session tracking
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tier_id) REFERENCES access_tiers(id)
);

-- Guard: Add status to existing provisioned databases that predate v1.1
ALTER TABLE users ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'active' AFTER role;

-- [3] ACTIVITIES (Operational Audit Logs)
-- Mapping: Dashboard "Recent Activity" list -> activities table
CREATE TABLE IF NOT EXISTS activities (
    id INT PRIMARY KEY AUTO_INCREMENT,
    uid VARCHAR(128) NOT NULL,
    type VARCHAR(100) NOT NULL, -- 'Session', 'Action', 'Check'
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (uid) REFERENCES users(uid),
    INDEX (uid)
);

-- [4] SALES LEDGER (Financial History)
CREATE TABLE IF NOT EXISTS sales_ledger (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_uid VARCHAR(128) NOT NULL,
    stripe_session_id VARCHAR(255) UNIQUE NOT NULL,
    payment_intent_id VARCHAR(255),
    amount_cents INT NOT NULL,
    purchased_tier_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_uid) REFERENCES users(uid),
    FOREIGN KEY (purchased_tier_id) REFERENCES access_tiers(id)
);

-- [5] ENROLLMENTS (Active Plan Status)
CREATE TABLE IF NOT EXISTS enrollments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_uid VARCHAR(128) NOT NULL,
    tier_id INT NOT NULL,
    status VARCHAR(50) DEFAULT 'Active',
    enrollment_date DATE NOT NULL,
    FOREIGN KEY (user_uid) REFERENCES users(uid),
    FOREIGN KEY (tier_id) REFERENCES access_tiers(id)
);

-- [6] PROJECTS (Business Plan Data)
CREATE TABLE IF NOT EXISTS projects (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_uid VARCHAR(128) NOT NULL,
    project_name VARCHAR(255) NOT NULL,
    project_template VARCHAR(100),
    status VARCHAR(50) DEFAULT 'Open',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_uid) REFERENCES users(uid)
);

-- [7] ADMIN NOTES (Internal CRM comments per user)
CREATE TABLE IF NOT EXISTS admin_notes (
    id INT PRIMARY KEY AUTO_INCREMENT,
    target_uid VARCHAR(128) NOT NULL,
    author_uid VARCHAR(128) NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (target_uid) REFERENCES users(uid),
    FOREIGN KEY (author_uid) REFERENCES users(uid),
    INDEX (target_uid)
);

-- [8] LOGIN HISTORY (Session audit trail)
CREATE TABLE IF NOT EXISTS login_history (
    id INT PRIMARY KEY AUTO_INCREMENT,
    uid VARCHAR(128) NOT NULL,
    ip_address VARCHAR(45),
    user_agent VARCHAR(500),
    login_method VARCHAR(20) DEFAULT 'email',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (uid) REFERENCES users(uid),
    INDEX (uid)
);
