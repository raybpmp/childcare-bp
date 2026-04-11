-- ==========================================
-- CCBP ADMIN FEATURES MIGRATION (v1.2)
-- Remediates schema drift + adds admin feature tables.
-- ==========================================

-- [1] Fix: Add missing 'logins' column to users
ALTER TABLE users ADD COLUMN IF NOT EXISTS logins INT DEFAULT 0 AFTER status;

-- [2] New: Admin internal notes per user
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

-- [3] New: Login history with session metadata
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
