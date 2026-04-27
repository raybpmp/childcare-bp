-- ==========================================
-- CCBP CENTERS + APPLICATIONS MIGRATION (v1.3)
-- Introduces center-based ownership and center-scoped applications.
-- ==========================================

-- [1] CENTERS (Primary business entity)
CREATE TABLE IF NOT EXISTS centers (
    id INT PRIMARY KEY AUTO_INCREMENT,
    owner_uid VARCHAR(128) NOT NULL,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (owner_uid) REFERENCES users(uid),
    INDEX (owner_uid)
);

-- [2] CENTER MEMBERS (Users connected to a center)
CREATE TABLE IF NOT EXISTS center_members (
    id INT PRIMARY KEY AUTO_INCREMENT,
    center_id INT NOT NULL,
    uid VARCHAR(128) NOT NULL,
    member_role VARCHAR(50) DEFAULT 'Owner',
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (center_id) REFERENCES centers(id) ON DELETE CASCADE,
    FOREIGN KEY (uid) REFERENCES users(uid) ON DELETE CASCADE,
    UNIQUE KEY uniq_center_member (center_id, uid),
    INDEX (uid)
);

-- [3] APPLICATION TYPES (Lookup for center-scoped workflows)
CREATE TABLE IF NOT EXISTS application_types (
    id INT PRIMARY KEY AUTO_INCREMENT,
    slug VARCHAR(100) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT IGNORE INTO application_types (slug, name, description) VALUES
('enrollment', 'Enrollment Application', 'Center-owned enrollment workflow for children and families.'),
('employment', 'Employment Application', 'Center-owned staffing and hiring workflow.'),
('waitlist', 'Waitlist Application', 'Center-owned waitlist intake workflow.');

-- [4] CENTER APPLICATIONS (Center-owned application records)
CREATE TABLE IF NOT EXISTS center_applications (
    id INT PRIMARY KEY AUTO_INCREMENT,
    center_id INT NOT NULL,
    application_type_id INT NOT NULL,
    created_by_uid VARCHAR(128) NOT NULL,
    name VARCHAR(255) NOT NULL,
    status VARCHAR(50) DEFAULT 'draft',
    application_data LONGTEXT,
    submitted_at TIMESTAMP NULL DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (center_id) REFERENCES centers(id) ON DELETE CASCADE,
    FOREIGN KEY (application_type_id) REFERENCES application_types(id),
    FOREIGN KEY (created_by_uid) REFERENCES users(uid),
    INDEX (center_id),
    INDEX (created_by_uid)
);

-- [5] OPTIONAL CENTER OWNERSHIP LAYER FOR EXISTING TABLES
ALTER TABLE enrollments ADD COLUMN IF NOT EXISTS center_id INT NULL AFTER user_uid;
ALTER TABLE enrollments ADD CONSTRAINT fk_enrollments_center
    FOREIGN KEY (center_id) REFERENCES centers(id);

ALTER TABLE projects ADD COLUMN IF NOT EXISTS center_id INT NULL AFTER user_uid;
ALTER TABLE projects ADD CONSTRAINT fk_projects_center
    FOREIGN KEY (center_id) REFERENCES centers(id);

ALTER TABLE sales_ledger ADD COLUMN IF NOT EXISTS center_id INT NULL AFTER user_uid;
ALTER TABLE sales_ledger ADD CONSTRAINT fk_sales_ledger_center
    FOREIGN KEY (center_id) REFERENCES centers(id);
