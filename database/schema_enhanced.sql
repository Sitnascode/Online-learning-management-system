-- Enhanced LMS Database Schema - Production Ready
-- Features: Security, audit trails, performance optimization, data integrity

-- Drop existing tables if they exist (for fresh setup)
SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS submissions, assignments, enrollments, course_materials, courses, 
                     login_attempts, remember_tokens, security_logs, notifications, 
                     discussion_posts, user_profiles, users;
SET FOREIGN_KEY_CHECKS = 1;

-- Users table with enhanced security features
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('student', 'instructor', 'admin') NOT NULL DEFAULT 'student',
    
    -- Security fields
    is_active BOOLEAN DEFAULT TRUE,
    email_verified BOOLEAN DEFAULT FALSE,
    email_verification_token VARCHAR(64),
    password_reset_token VARCHAR(64),
    password_reset_expires DATETIME,
    failed_login_attempts INT DEFAULT 0,
    locked_until DATETIME NULL,
    
    -- Audit fields
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    last_login TIMESTAMP NULL,
    
    -- Indexes for performance
    INDEX idx_email (email),
    INDEX idx_username (username),
    INDEX idx_role (role),
    INDEX idx_active (is_active),
    INDEX idx_verification_token (email_verification_token),
    INDEX idx_reset_token (password_reset_token)
);

-- User profiles for extended information
CREATE TABLE user_profiles (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    avatar_url VARCHAR(500),
    bio TEXT,
    phone VARCHAR(20),
    timezone VARCHAR(50) DEFAULT 'UTC',
    language VARCHAR(10) DEFAULT 'en',
    date_of_birth DATE,
    
    -- Student specific fields
    student_id VARCHAR(50),
    enrollment_year YEAR,
    
    -- Instructor specific fields
    department VARCHAR(100),
    title VARCHAR(100),
    office_location VARCHAR(100),
    office_hours TEXT,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_profile (user_id),
    INDEX idx_student_id (student_id)
);

-- Enhanced courses table
CREATE TABLE courses (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    course_code VARCHAR(20),
    instructor_id INT NOT NULL,
    instructor_name VARCHAR(255) NOT NULL,
    
    -- Course details
    category VARCHAR(100),
    difficulty_level ENUM('beginner', 'intermediate', 'advanced') DEFAULT 'beginner',
    duration_weeks INT DEFAULT 12,
    max_students INT DEFAULT 50,
    credits DECIMAL(3,1) DEFAULT 3.0,
    
    -- Course status and visibility
    status ENUM('draft', 'active', 'archived', 'suspended') DEFAULT 'draft',
    is_public BOOLEAN DEFAULT TRUE,
    requires_approval BOOLEAN DEFAULT FALSE,
    
    -- Scheduling
    start_date DATE,
    end_date DATE,
    
    -- Media and resources
    thumbnail_url VARCHAR(500),
    syllabus_url VARCHAR(500),
    
    -- Audit fields
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (instructor_id) REFERENCES users(id) ON DELETE RESTRICT,
    INDEX idx_instructor (instructor_id),
    INDEX idx_status (status),
    INDEX idx_category (category),
    INDEX idx_course_code (course_code),
    INDEX idx_public (is_public),
    FULLTEXT idx_search (title, description)
);

-- Course materials and content
CREATE TABLE course_materials (
    id INT PRIMARY KEY AUTO_INCREMENT,
    course_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    type ENUM('video', 'document', 'link', 'quiz', 'assignment') NOT NULL,
    
    -- File information
    file_path VARCHAR(500),
    file_size BIGINT,
    mime_type VARCHAR(100),
    
    -- Content organization
    module_name VARCHAR(255),
    order_index INT DEFAULT 0,
    
    -- Access control
    is_public BOOLEAN DEFAULT TRUE,
    unlock_date DATETIME,
    
    -- Metadata
    duration_minutes INT,
    external_url VARCHAR(500),
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    INDEX idx_course_materials (course_id),
    INDEX idx_type (type),
    INDEX idx_module (module_name),
    INDEX idx_order (order_index)
);

-- Enhanced enrollments with tracking
CREATE TABLE enrollments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    student_id INT NOT NULL,
    course_id INT NOT NULL,
    
    -- Enrollment details
    status ENUM('active', 'completed', 'dropped', 'suspended') DEFAULT 'active',
    enrollment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completion_date TIMESTAMP NULL,
    
    -- Progress tracking
    progress_percentage DECIMAL(5,2) DEFAULT 0.00,
    last_accessed TIMESTAMP NULL,
    total_time_spent INT DEFAULT 0, -- in minutes
    
    -- Grading
    final_grade DECIMAL(5,2) NULL,
    grade_letter VARCHAR(2) NULL,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    UNIQUE KEY unique_enrollment (student_id, course_id),
    INDEX idx_student_enrollments (student_id),
    INDEX idx_course_enrollments (course_id),
    INDEX idx_status (status)
);

-- Enhanced assignments table
CREATE TABLE assignments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    course_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    instructions TEXT,
    
    -- Assignment configuration
    type ENUM('homework', 'quiz', 'project', 'exam', 'discussion') DEFAULT 'homework',
    max_points DECIMAL(6,2) DEFAULT 100.00,
    passing_score DECIMAL(6,2) DEFAULT 60.00,
    
    -- Timing
    assigned_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    due_date TIMESTAMP NOT NULL,
    late_submission_allowed BOOLEAN DEFAULT TRUE,
    late_penalty_percent DECIMAL(5,2) DEFAULT 10.00,
    
    -- Submission settings
    max_attempts INT DEFAULT 1,
    file_upload_allowed BOOLEAN DEFAULT TRUE,
    max_file_size BIGINT DEFAULT 10485760, -- 10MB
    allowed_file_types VARCHAR(255) DEFAULT 'pdf,doc,docx,txt',
    
    -- Grading
    auto_grade BOOLEAN DEFAULT FALSE,
    rubric_url VARCHAR(500),
    
    -- Visibility
    is_published BOOLEAN DEFAULT FALSE,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    INDEX idx_course_assignments (course_id),
    INDEX idx_due_date (due_date),
    INDEX idx_published (is_published),
    INDEX idx_type (type)
);

-- Enhanced submissions with detailed tracking
CREATE TABLE submissions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    assignment_id INT NOT NULL,
    student_id INT NOT NULL,
    
    -- Submission content
    content TEXT,
    file_path VARCHAR(500),
    file_name VARCHAR(255),
    file_size BIGINT,
    
    -- Submission tracking
    attempt_number INT DEFAULT 1,
    status ENUM('draft', 'submitted', 'graded', 'returned') DEFAULT 'draft',
    
    -- Timing
    submitted_at TIMESTAMP NULL,
    is_late BOOLEAN DEFAULT FALSE,
    
    -- Grading
    grade DECIMAL(6,2) NULL,
    points_earned DECIMAL(6,2) NULL,
    feedback TEXT,
    graded_by INT NULL,
    graded_at TIMESTAMP NULL,
    
    -- Plagiarism detection
    plagiarism_score DECIMAL(5,2) NULL,
    plagiarism_report_url VARCHAR(500),
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (assignment_id) REFERENCES assignments(id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (graded_by) REFERENCES users(id) ON DELETE SET NULL,
    
    UNIQUE KEY unique_submission_attempt (assignment_id, student_id, attempt_number),
    INDEX idx_assignment_submissions (assignment_id),
    INDEX idx_student_submissions (student_id),
    INDEX idx_status (status),
    INDEX idx_graded_by (graded_by)
);

-- Security and audit tables
CREATE TABLE login_attempts (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NULL,
    email VARCHAR(255),
    ip_address VARCHAR(45),
    user_agent TEXT,
    success BOOLEAN DEFAULT FALSE,
    attempted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_email_attempts (email),
    INDEX idx_ip_attempts (ip_address),
    INDEX idx_attempted_at (attempted_at)
);

CREATE TABLE remember_tokens (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    token VARCHAR(64) UNIQUE NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_token (token),
    INDEX idx_expires (expires_at)
);

CREATE TABLE security_logs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NULL,
    event_type VARCHAR(50) NOT NULL,
    ip_address VARCHAR(45),
    user_agent TEXT,
    metadata JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_user_logs (user_id),
    INDEX idx_event_type (event_type),
    INDEX idx_created_at (created_at)
);

-- Notifications system
CREATE TABLE notifications (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type ENUM('info', 'success', 'warning', 'error') DEFAULT 'info',
    
    -- Notification details
    action_url VARCHAR(500),
    is_read BOOLEAN DEFAULT FALSE,
    
    -- Delivery
    delivery_method ENUM('in_app', 'email', 'sms') DEFAULT 'in_app',
    sent_at TIMESTAMP NULL,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_notifications (user_id),
    INDEX idx_unread (is_read),
    INDEX idx_type (type)
);

-- Discussion forums
CREATE TABLE discussion_posts (
    id INT PRIMARY KEY AUTO_INCREMENT,
    course_id INT NOT NULL,
    user_id INT NOT NULL,
    parent_id INT NULL, -- For threaded discussions
    
    title VARCHAR(255),
    content TEXT NOT NULL,
    
    -- Post metadata
    is_pinned BOOLEAN DEFAULT FALSE,
    is_locked BOOLEAN DEFAULT FALSE,
    
    -- Engagement
    likes_count INT DEFAULT 0,
    replies_count INT DEFAULT 0,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (parent_id) REFERENCES discussion_posts(id) ON DELETE CASCADE,
    
    INDEX idx_course_discussions (course_id),
    INDEX idx_user_posts (user_id),
    INDEX idx_parent_posts (parent_id),
    INDEX idx_pinned (is_pinned)
);

-- Insert default admin user (password: Admin123!)
INSERT INTO users (username, email, password, role, is_active, email_verified) VALUES 
('admin', 'admin@lms.local', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin', TRUE, TRUE);

-- Insert sample data for testing
INSERT INTO users (username, email, password, role, is_active, email_verified) VALUES 
('john_instructor', 'john@lms.local', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'instructor', TRUE, TRUE),
('jane_student', 'jane@lms.local', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'student', TRUE, TRUE);

INSERT INTO courses (title, description, instructor_id, instructor_name, status, course_code) VALUES 
('Introduction to Web Development', 'Learn the basics of HTML, CSS, and JavaScript', 2, 'John Instructor', 'active', 'WEB101'),
('Advanced Database Systems', 'Deep dive into database design and optimization', 2, 'John Instructor', 'active', 'DB301');

INSERT INTO enrollments (student_id, course_id, status) VALUES 
(3, 1, 'active'),
(3, 2, 'active');

-- Create views for common queries
CREATE VIEW course_enrollment_stats AS
SELECT 
    c.id,
    c.title,
    c.instructor_name,
    COUNT(e.student_id) as enrolled_students,
    AVG(e.progress_percentage) as avg_progress,
    COUNT(CASE WHEN e.status = 'completed' THEN 1 END) as completed_students
FROM courses c
LEFT JOIN enrollments e ON c.id = e.course_id
GROUP BY c.id;

CREATE VIEW student_progress_summary AS
SELECT 
    u.id as student_id,
    u.username,
    COUNT(e.course_id) as total_courses,
    COUNT(CASE WHEN e.status = 'completed' THEN 1 END) as completed_courses,
    AVG(e.progress_percentage) as avg_progress,
    AVG(e.final_grade) as avg_grade
FROM users u
LEFT JOIN enrollments e ON u.id = e.student_id
WHERE u.role = 'student'
GROUP BY u.id;

-- Performance optimization
-- Add composite indexes for common query patterns
ALTER TABLE submissions ADD INDEX idx_assignment_student_attempt (assignment_id, student_id, attempt_number);
ALTER TABLE enrollments ADD INDEX idx_student_status (student_id, status);
ALTER TABLE course_materials ADD INDEX idx_course_module_order (course_id, module_name, order_index);

-- Set up automatic cleanup jobs (implement in application or cron)
-- DELETE FROM login_attempts WHERE attempted_at < DATE_SUB(NOW(), INTERVAL 30 DAY);
-- DELETE FROM remember_tokens WHERE expires_at < NOW();
-- DELETE FROM security_logs WHERE created_at < DATE_SUB(NOW(), INTERVAL 90 DAY);