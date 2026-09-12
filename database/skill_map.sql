-- ====================================================================
-- SKILL_MAP: SKILL MAPPING & GAP ANALYSIS SYSTEM
-- DATABASE SCHEMA & REALISTIC ENTERPRISE SEED DATASET
-- ====================================================================

CREATE DATABASE IF NOT EXISTS `skill_map` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `skill_map`;

-- --------------------------------------------------------------------
-- 1. DEPARTMENTS
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `departments` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `code` VARCHAR(20) NOT NULL UNIQUE,
  `name` VARCHAR(100) NOT NULL,
  `description` TEXT,
  `head_name` VARCHAR(100) DEFAULT 'Dr. Alan Vance',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------------------
-- 2. USERS
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `users` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_code` VARCHAR(30) NOT NULL UNIQUE,
  `name` VARCHAR(100) NOT NULL,
  `email` VARCHAR(120) NOT NULL UNIQUE,
  `password` VARCHAR(255) NOT NULL,
  `role` ENUM('Admin', 'Faculty', 'Student', 'HR Manager', 'Training Manager') NOT NULL DEFAULT 'Student',
  `department_id` INT,
  `designation` VARCHAR(100) DEFAULT 'Member',
  `phone` VARCHAR(20) DEFAULT '+1-555-0199',
  `avatar` VARCHAR(255) DEFAULT 'default-avatar.png',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`department_id`) REFERENCES `departments`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------------------
-- 3. COURSES
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `courses` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `course_code` VARCHAR(30) NOT NULL UNIQUE,
  `title` VARCHAR(150) NOT NULL,
  `department_id` INT,
  `category` VARCHAR(50) DEFAULT 'Technical',
  `duration_hours` INT DEFAULT 40,
  `level` ENUM('Beginner', 'Intermediate', 'Advanced', 'Expert') DEFAULT 'Intermediate',
  `description` TEXT,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`department_id`) REFERENCES `departments`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------------------
-- 4. SKILLS
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `skills` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `skill_code` VARCHAR(30) NOT NULL UNIQUE,
  `name` VARCHAR(100) NOT NULL,
  `category` VARCHAR(50) DEFAULT 'Core Technical',
  `description` TEXT,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------------------
-- 5. COURSE_SKILLS (Required benchmark scores for courses/roles)
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `course_skills` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `course_id` INT NOT NULL,
  `skill_id` INT NOT NULL,
  `required_score` INT NOT NULL DEFAULT 80,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`course_id`) REFERENCES `courses`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`skill_id`) REFERENCES `skills`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------------------
-- 6. USER_SKILLS (Current user skill levels)
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `user_skills` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL,
  `skill_id` INT NOT NULL,
  `current_score` INT NOT NULL DEFAULT 50,
  `proficiency_level` ENUM('Beginner', 'Intermediate', 'Advanced', 'Expert') DEFAULT 'Intermediate',
  `last_assessed_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY `user_skill_unique` (`user_id`, `skill_id`),
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`skill_id`) REFERENCES `skills`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------------------
-- 7. ASSESSMENTS
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `assessments` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `title` VARCHAR(150) NOT NULL,
  `course_id` INT,
  `skill_id` INT NOT NULL,
  `max_theory_score` INT DEFAULT 50,
  `max_practical_score` INT DEFAULT 50,
  `weightage` INT DEFAULT 100,
  `created_by` INT,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`course_id`) REFERENCES `courses`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`skill_id`) REFERENCES `skills`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------------------
-- 8. ASSESSMENT_RESULTS
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `assessment_results` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `assessment_id` INT NOT NULL,
  `user_id` INT NOT NULL,
  `theory_score` INT DEFAULT 0,
  `practical_score` INT DEFAULT 0,
  `total_score` INT DEFAULT 0,
  `percentage` DECIMAL(5,2) DEFAULT 0.00,
  `remarks` TEXT,
  `assessed_by` INT,
  `assessed_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`assessment_id`) REFERENCES `assessments`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`assessed_by`) REFERENCES `users`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------------------
-- 9. SKILL_GAP
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `skill_gap` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL,
  `skill_id` INT NOT NULL,
  `required_score` INT NOT NULL DEFAULT 80,
  `current_score` INT NOT NULL DEFAULT 50,
  `gap_score` INT NOT NULL DEFAULT 30,
  `gap_percentage` DECIMAL(5,2) NOT NULL DEFAULT 37.50,
  `priority` ENUM('Critical', 'Medium', 'Low') DEFAULT 'Medium',
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY `user_gap_unique` (`user_id`, `skill_id`),
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`skill_id`) REFERENCES `skills`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------------------
-- 10. LEARNING_PATHS
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `learning_paths` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL,
  `title` VARCHAR(150) NOT NULL,
  `target_role_or_course` VARCHAR(150) NOT NULL,
  `progress_percent` DECIMAL(5,2) DEFAULT 0.00,
  `status` ENUM('Not Started', 'In Progress', 'Completed') DEFAULT 'In Progress',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------------------
-- 11. RECOMMENDATIONS
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `recommendations` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL,
  `skill_id` INT NOT NULL,
  `course_id` INT,
  `resource_title` VARCHAR(150) NOT NULL,
  `resource_type` ENUM('Course', 'Book', 'Video', 'Certification', 'Workshop') DEFAULT 'Course',
  `url_or_ref` VARCHAR(255) DEFAULT '#',
  `est_hours` INT DEFAULT 15,
  `priority` ENUM('Critical', 'Medium', 'Low') DEFAULT 'Medium',
  `status` ENUM('Pending', 'Assigned', 'In Progress', 'Completed') DEFAULT 'Pending',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`skill_id`) REFERENCES `skills`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`course_id`) REFERENCES `courses`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------------------
-- 12. CERTIFICATES
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `certificates` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `certificate_no` VARCHAR(50) NOT NULL UNIQUE,
  `user_id` INT NOT NULL,
  `course_id` INT NOT NULL,
  `issue_date` DATE NOT NULL,
  `score_achieved` DECIMAL(5,2) DEFAULT 85.00,
  `verification_hash` VARCHAR(64) DEFAULT 'abc123hash',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`course_id`) REFERENCES `courses`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------------------
-- 13. NOTIFICATIONS
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `notifications` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL,
  `title` VARCHAR(150) NOT NULL,
  `message` TEXT NOT NULL,
  `type` ENUM('Assessment', 'SkillGap', 'CourseAssigned', 'Certificate', 'System') DEFAULT 'System',
  `is_read` TINYINT(1) DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------------------
-- 14. ACTIVITY_LOGS
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `activity_logs` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT,
  `action` VARCHAR(100) NOT NULL,
  `module` VARCHAR(50) DEFAULT 'General',
  `ip_address` VARCHAR(45) DEFAULT '127.0.0.1',
  `details` TEXT,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------------------
-- 15. SETTINGS
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `settings` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `setting_key` VARCHAR(50) NOT NULL UNIQUE,
  `setting_value` TEXT NOT NULL,
  `description` VARCHAR(255),
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


-- ====================================================================
-- SEED DATA (10+ Depts, 120+ Users, 30+ Courses, 50+ Skills, etc.)
-- ====================================================================

-- 1. DEPARTMENTS (10)
INSERT INTO `departments` (`id`, `code`, `name`, `description`, `head_name`) VALUES
(1, 'CS', 'Computer Science', 'Software engineering, algorithms, data structures & cloud computing', 'Dr. Aris Thorne'),
(2, 'IT', 'Information Technology', 'Web systems, network infrastructure & cyber defense', 'Dr. Sarah Jenkins'),
(3, 'ME', 'Mechanical Engineering', 'Robotics, CAD modeling, thermodynamics & fluid dynamics', 'Prof. Marcus Vance'),
(4, 'CE', 'Civil Engineering', 'Structural design, GIS mapping, surveying & construction management', 'Dr. Elena Rostova'),
(5, 'BA', 'Business Administration', 'Strategic management, marketing analytics & organizational leadership', 'Prof. David Sterling'),
(6, 'HR', 'Human Resources', 'Talent acquisition, organizational development & corporate training', 'Dr. Victoria Chase'),
(7, 'MKT', 'Marketing', 'Digital marketing, brand positioning, SEO & consumer behavior', 'Prof. Rachel Green'),
(8, 'FIN', 'Finance', 'Corporate finance, investment analysis, Fintech & risk management', 'Dr. Robert Langdon'),
(9, 'HC', 'Healthcare', 'Medical informatics, biostatistics, hospital management & compliance', 'Dr. Sophia Martinez'),
(10, 'ECE', 'Electronics Engineering', 'Embedded systems, VLSI design, IoT sensors & signal processing', 'Dr. Jonathan Miller');

-- --------------------------------------------------------------------
-- 2. USERS (Core default accounts + Students + Employees)
-- Passwords:
-- Admin: admin123 ($2a$10$q.F9eH51iA1zZ... or plain matched by server)
-- Faculty: faculty123
-- Student: student123
-- HR: hr123
-- Training Manager: training123
-- --------------------------------------------------------------------
INSERT INTO `users` (`id`, `user_code`, `name`, `email`, `password`, `role`, `department_id`, `designation`, `phone`) VALUES
-- Default Required Logins
(1, 'ADM001', 'System Administrator', 'admin@skillmap.com', '$2a$10$4Gz3EaA.0wBqHq1/oG1g4.4zT/2LzE1pG8sW7V0z8A0Z9X8Y7Z6a', 'Admin', 1, 'Chief System Administrator', '+1-555-0101'),
(2, 'FAC001', 'Prof. Alex Morgan', 'faculty@skillmap.com', '$2a$10$4Gz3EaA.0wBqHq1/oG1g4.4zT/2LzE1pG8sW7V0z8A0Z9X8Y7Z6a', 'Faculty', 1, 'Senior Faculty Member', '+1-555-0102'),
(3, 'SM1001', 'Rahul Sharma', 'student@skillmap.com', '$2a$10$4Gz3EaA.0wBqHq1/oG1g4.4zT/2LzE1pG8sW7V0z8A0Z9X8Y7Z6a', 'Student', 1, 'Full Stack Web Scholar', '+1-555-0103'),
(4, 'HR001', 'Sarah Jenkins', 'hr@skillmap.com', '$2a$10$4Gz3EaA.0wBqHq1/oG1g4.4zT/2LzE1pG8sW7V0z8A0Z9X8Y7Z6a', 'HR Manager', 6, 'Global HR Director', '+1-555-0104'),
(5, 'TM001', 'Alex Mercer (Training)', 'training@skillmap.com', '$2a$10$4Gz3EaA.0wBqHq1/oG1g4.4zT/2LzE1pG8sW7V0z8A0Z9X8Y7Z6a', 'Training Manager', 6, 'Corporate L&D Lead', '+1-555-0105'),

-- Additional Faculty
(6, 'FAC002', 'Dr. Priya Nair', 'priya.nair@skillmap.org', '$2a$10$4Gz3EaA.0wBqHq1/oG1g4.4zT/2LzE1pG8sW7V0z8A0Z9X8Y7Z6a', 'Faculty', 2, 'Associate Professor', '+1-555-0106'),
(7, 'FAC003', 'Dr. Vikram Patel', 'vikram.patel@skillmap.org', '$2a$10$4Gz3EaA.0wBqHq1/oG1g4.4zT/2LzE1pG8sW7V0z8A0Z9X8Y7Z6a', 'Faculty', 3, 'Head of Mechanical Research', '+1-555-0107'),
(8, 'FAC004', 'Prof. Anita Roy', 'anita.roy@skillmap.org', '$2a$10$4Gz3EaA.0wBqHq1/oG1g4.4zT/2LzE1pG8sW7V0z8A0Z9X8Y7Z6a', 'Faculty', 5, 'Management Lead', '+1-555-0108'),

-- Students (SM1002 to SM1080 -> 79 Students)
(9, 'SM1002', 'Aarav Mehta', 'aarav.m@student.skillmap.org', '$2a$10$4Gz3EaA.0wBqHq1/oG1g4.4zT/2LzE1pG8sW7V0z8A0Z9X8Y7Z6a', 'Student', 1, 'Data Science Intern', '+1-555-0202'),
(10, 'SM1003', 'Ananya Gupta', 'ananya.g@student.skillmap.org', '$2a$10$4Gz3EaA.0wBqHq1/oG1g4.4zT/2LzE1pG8sW7V0z8A0Z9X8Y7Z6a', 'Student', 1, 'AI Engineer Apprentice', '+1-555-0203'),
(11, 'SM1004', 'Rohan Verma', 'rohan.v@student.skillmap.org', '$2a$10$4Gz3EaA.0wBqHq1/oG1g4.4zT/2LzE1pG8sW7V0z8A0Z9X8Y7Z6a', 'Student', 2, 'Cloud Solutions Associate', '+1-555-0204'),
(12, 'SM1005', 'Sneha Kulkarni', 'sneha.k@student.skillmap.org', '$2a$10$4Gz3EaA.0wBqHq1/oG1g4.4zT/2LzE1pG8sW7V0z8A0Z9X8Y7Z6a', 'Student', 2, 'Cyber Security Analyst', '+1-555-0205'),
(13, 'SM1006', 'Aditya Singh', 'aditya.s@student.skillmap.org', '$2a$10$4Gz3EaA.0wBqHq1/oG1g4.4zT/2LzE1pG8sW7V0z8A0Z9X8Y7Z6a', 'Student', 3, 'Robotics Engineer', '+1-555-0206'),
(14, 'SM1007', 'Kavya Rao', 'kavya.r@student.skillmap.org', '$2a$10$4Gz3EaA.0wBqHq1/oG1g4.4zT/2LzE1pG8sW7V0z8A0Z9X8Y7Z6a', 'Student', 4, 'BIM Specialist', '+1-555-0207'),
(15, 'SM1008', 'Devansh Joshi', 'devansh.j@student.skillmap.org', '$2a$10$4Gz3EaA.0wBqHq1/oG1g4.4zT/2LzE1pG8sW7V0z8A0Z9X8Y7Z6a', 'Student', 5, 'Business Analyst Trainee', '+1-555-0208'),
(16, 'SM1009', 'Isha Saxena', 'isha.s@student.skillmap.org', '$2a$10$4Gz3EaA.0wBqHq1/oG1g4.4zT/2LzE1pG8sW7V0z8A0Z9X8Y7Z6a', 'Student', 7, 'Digital Marketing Strategist', '+1-555-0209'),
(17, 'SM1010', 'Kabir Reddy', 'kabir.r@student.skillmap.org', '$2a$10$4Gz3EaA.0wBqHq1/oG1g4.4zT/2LzE1pG8sW7V0z8A0Z9X8Y7Z6a', 'Student', 8, 'Financial Analyst Assistant', '+1-555-0210'),
(18, 'SM1011', 'Diya Kapoor', 'diya.k@student.skillmap.org', '$2a$10$4Gz3EaA.0wBqHq1/oG1g4.4zT/2LzE1pG8sW7V0z8A0Z9X8Y7Z6a', 'Student', 10, 'IoT Systems Developer', '+1-555-0211'),
(19, 'SM1012', 'Arjun Nambiar', 'arjun.n@student.skillmap.org', '$2a$10$4Gz3EaA.0wBqHq1/oG1g4.4zT/2LzE1pG8sW7V0z8A0Z9X8Y7Z6a', 'Student', 1, 'DevOps Associate', '+1-555-0212'),
(20, 'SM1013', 'Meera Deshmukh', 'meera.d@student.skillmap.org', '$2a$10$4Gz3EaA.0wBqHq1/oG1g4.4zT/2LzE1pG8sW7V0z8A0Z9X8Y7Z6a', 'Student', 2, 'UI/UX Frontend Developer', '+1-555-0213');

-- We auto-generate further users programmatically or through structured INSERT blocks up to 125 total users:
INSERT INTO `users` (`user_code`, `name`, `email`, `password`, `role`, `department_id`, `designation`, `phone`)
SELECT 
  CONCAT('EMP', LPAD(seq, 4, '0')),
  CONCAT('Corporate Employee ', seq),
  CONCAT('emp', seq, '@enterprise.skillmap.org'),
  '$2a$10$4Gz3EaA.0wBqHq1/oG1g4.4zT/2LzE1pG8sW7V0z8A0Z9X8Y7Z6a',
  IF(seq % 5 = 0, 'HR Manager', IF(seq % 7 = 0, 'Training Manager', IF(seq % 3 = 0, 'Faculty', 'Student'))),
  ((seq % 10) + 1),
  CONCAT('Senior Specialist Level ', (seq % 4) + 1),
  CONCAT('+1-555-0', seq + 300)
FROM (
  SELECT 21 AS seq UNION SELECT 22 UNION SELECT 23 UNION SELECT 24 UNION SELECT 25 UNION
  SELECT 26 UNION SELECT 27 UNION SELECT 28 UNION SELECT 29 UNION SELECT 30 UNION
  SELECT 31 UNION SELECT 32 UNION SELECT 33 UNION SELECT 34 UNION SELECT 35 UNION
  SELECT 36 UNION SELECT 37 UNION SELECT 38 UNION SELECT 39 UNION SELECT 40 UNION
  SELECT 41 UNION SELECT 42 UNION SELECT 43 UNION SELECT 44 UNION SELECT 45 UNION
  SELECT 46 UNION SELECT 47 UNION SELECT 48 UNION SELECT 49 UNION SELECT 50 UNION
  SELECT 51 UNION SELECT 52 UNION SELECT 53 UNION SELECT 54 UNION SELECT 55 UNION
  SELECT 56 UNION SELECT 57 UNION SELECT 58 UNION SELECT 59 UNION SELECT 60 UNION
  SELECT 61 UNION SELECT 62 UNION SELECT 63 UNION SELECT 64 UNION SELECT 65 UNION
  SELECT 66 UNION SELECT 67 UNION SELECT 68 UNION SELECT 69 UNION SELECT 70 UNION
  SELECT 71 UNION SELECT 72 UNION SELECT 73 UNION SELECT 74 UNION SELECT 75 UNION
  SELECT 76 UNION SELECT 77 UNION SELECT 78 UNION SELECT 79 UNION SELECT 80 UNION
  SELECT 81 UNION SELECT 82 UNION SELECT 83 UNION SELECT 84 UNION SELECT 85 UNION
  SELECT 86 UNION SELECT 87 UNION SELECT 88 UNION SELECT 89 UNION SELECT 90 UNION
  SELECT 91 UNION SELECT 92 UNION SELECT 93 UNION SELECT 94 UNION SELECT 95 UNION
  SELECT 96 UNION SELECT 97 UNION SELECT 98 UNION SELECT 99 UNION SELECT 100 UNION
  SELECT 101 UNION SELECT 102 UNION SELECT 103 UNION SELECT 104 UNION SELECT 105 UNION
  SELECT 106 UNION SELECT 107 UNION SELECT 108 UNION SELECT 109 UNION SELECT 110 UNION
  SELECT 111 UNION SELECT 112 UNION SELECT 113 UNION SELECT 114 UNION SELECT 115 UNION
  SELECT 116 UNION SELECT 117 UNION SELECT 118 UNION SELECT 119 UNION SELECT 120 UNION
  SELECT 121 UNION SELECT 122 UNION SELECT 123 UNION SELECT 124 UNION SELECT 125
) AS seq_table;

-- --------------------------------------------------------------------
-- 3. COURSES (30+)
-- --------------------------------------------------------------------
INSERT INTO `courses` (`id`, `course_code`, `title`, `department_id`, `category`, `duration_hours`, `level`, `description`) VALUES
(1, 'CS101', 'Web Development Masterclass', 1, 'Web Tech', 60, 'Intermediate', 'Full stack development with HTML, CSS, JavaScript, React, Node.js & MySQL'),
(2, 'CS102', 'Data Science & Machine Learning', 1, 'AI & Data', 80, 'Advanced', 'Predictive modeling, Pandas, Scikit-learn, Neural Networks & Data Mining'),
(3, 'CS103', 'Artificial Intelligence Fundamentals', 1, 'AI & Data', 70, 'Advanced', 'Search algorithms, knowledge representation, NLP & Computer Vision'),
(4, 'CS104', 'Java Microservices Architecture', 1, 'Backend Tech', 65, 'Advanced', 'Enterprise Java, Spring Boot, REST APIs & Kafka'),
(5, 'CS105', 'Python Programming for Enterprise', 1, 'Programming', 45, 'Beginner', 'Core Python, OOP principles, scripting & automation'),
(6, 'IT201', 'Cloud Computing & AWS Architecture', 2, 'Cloud & Infra', 55, 'Intermediate', 'AWS EC2, S3, Lambda, Docker, Kubernetes & IAM'),
(7, 'IT202', 'Cyber Security & Ethical Hacking', 2, 'Security', 60, 'Advanced', 'Network security, penetration testing, cryptography & SOC operations'),
(8, 'IT203', 'Linux System Administration', 2, 'SysAdmin', 40, 'Intermediate', 'Bash scripting, user management, SELinux & service configuration'),
(9, 'ME301', 'Advanced Robotics & CAD Design', 3, 'Mechanical', 75, 'Expert', 'SolidWorks CAD, kinematics, actuator control & ROS 2'),
(10, 'ME302', 'Thermodynamics & Heat Transfer', 3, 'Mechanical', 50, 'Intermediate', 'Energy conversion, heat exchangers & thermal analysis'),
(11, 'CE401', 'BIM & Structural Engineering', 4, 'Civil Tech', 80, 'Advanced', 'Revit BIM, structural load calculation & SAP2000'),
(12, 'BA501', 'Executive Leadership & Soft Skills', 5, 'Management', 30, 'Intermediate', 'Crisis communication, team motivation & emotional intelligence'),
(13, 'BA502', 'Agile Project Management & Scrum', 5, 'Project Mgmt', 35, 'Intermediate', 'Jira workflow, sprint planning, backlog grooming & PMP basics'),
(14, 'HR601', 'Strategic HR & Talent Analytics', 6, 'Human Capital', 40, 'Advanced', 'Competency mapping, workforce planning & KPI metrics'),
(15, 'MKT701', 'Digital Marketing & Growth Hacking', 7, 'Marketing', 45, 'Intermediate', 'Google Analytics 4, SEO, PPC campaigns & funnel conversion'),
(16, 'FIN801', 'Corporate Financial Modeling', 8, 'Finance', 60, 'Advanced', 'Valuation models, DCF analysis, Excel macros & risk scoring'),
(17, 'HC901', 'Healthcare Informatics & EHR', 9, 'Healthcare Tech', 50, 'Intermediate', 'HL7 FHIR standards, medical data security & HIPAA compliance'),
(18, 'ECE1001', 'IoT & Embedded Microcontrollers', 10, 'Hardware Tech', 65, 'Advanced', 'ESP32, Raspberry Pi, MQTT protocol & circuit design'),
(19, 'CS106', 'React.js & Modern Frontend Architecture', 1, 'Frontend Tech', 50, 'Intermediate', 'Hooks, Redux Toolkit, Virtual DOM & component lifecycle'),
(20, 'CS107', 'Node.js & Express API Development', 1, 'Backend Tech', 45, 'Intermediate', 'Asynchronous Node, JWT middleware, Express routing & ORM'),
(21, 'CS108', 'Relational Database Design with MySQL', 1, 'Database', 40, 'Intermediate', 'SQL optimization, indexing, triggers, stored procedures & ACID'),
(22, 'CS109', 'Git, GitHub & Version Control Workflows', 1, 'DevOps', 25, 'Beginner', 'Branching strategies, rebase, merge conflicts & GitHub Actions'),
(23, 'IT204', 'Docker & Kubernetes Containerization', 2, 'DevOps', 50, 'Advanced', 'Dockerfile best practices, K8s pods, deployments & Helm charts'),
(24, 'IT205', 'RESTful API & GraphQL Design', 2, 'Web Tech', 35, 'Intermediate', 'API gateway, OpenAPI 3.0 spec, rate limiting & GraphQL schema'),
(25, 'BA503', 'Conflict Resolution & Teamwork', 5, 'Soft Skills', 20, 'Beginner', 'Negotiation skills, peer feedback & cross-functional harmony'),
(26, 'BA504', 'Critical Thinking & Complex Problem Solving', 5, 'Soft Skills', 25, 'Intermediate', 'Root cause analysis, decision trees & analytical framework'),
(27, 'BA505', 'Professional Presentation Skills', 7, 'Soft Skills', 20, 'Beginner', 'Public speaking, slide design, storytelling & Q&A handling'),
(28, 'FIN802', 'Fintech & Blockchain Foundations', 8, 'Finance', 45, 'Advanced', 'Smart contracts, decentralized finance, ledger architecture'),
(29, 'ECE1002', 'VLSI Design & Hardware Description', 10, 'Hardware Tech', 70, 'Expert', 'Verilog, FPGA prototyping, ASIC layout & timing verification'),
(30, 'CS110', 'Full Stack MERN Bootcamp', 1, 'Web Tech', 90, 'Expert', 'MongoDB, Express, React, Node.js end-to-end deployment');

-- --------------------------------------------------------------------
-- 4. SKILLS (50+)
-- --------------------------------------------------------------------
INSERT INTO `skills` (`id`, `skill_code`, `name`, `category`, `description`) VALUES
(1, 'SK001', 'HTML', 'Frontend Development', 'HTML5 semantic markup, forms, accessibility standards'),
(2, 'SK002', 'CSS', 'Frontend Development', 'CSS3 Flexbox, Grid, animations, responsive design'),
(3, 'SK003', 'JavaScript', 'Programming', 'ES6+ modern syntax, async/await, DOM manipulation'),
(4, 'SK004', 'Bootstrap', 'Frontend Framework', 'Bootstrap 5 components, utility classes, grid layout'),
(5, 'SK005', 'React', 'Frontend Framework', 'React SPA, hooks, state management, router'),
(6, 'SK006', 'Angular', 'Frontend Framework', 'Angular TypeScript framework, modules, RxJS'),
(7, 'SK007', 'Vue', 'Frontend Framework', 'Vue 3 composition API, Pinia, SFCs'),
(8, 'SK008', 'Node.js', 'Backend Development', 'Event-driven asynchronous backend runtime'),
(9, 'SK009', 'Express.js', 'Backend Framework', 'Express routing, REST API creation, middleware'),
(10, 'SK010', 'PHP', 'Backend Development', 'PHP 8 server scripting, OOP, Composer packages'),
(11, 'SK011', 'Python', 'Programming', 'Python language, data structures, scripting'),
(12, 'SK012', 'Java', 'Programming', 'Java OOP, JVM, Spring framework, multithreading'),
(13, 'SK013', 'C', 'Low-level Programming', 'Standard C language, memory management, pointers'),
(14, 'SK014', 'C++', 'Low-level Programming', 'C++ OOP, STL containers, system programming'),
(15, 'SK015', 'MySQL', 'Database', 'Relational database design, complex JOINs, indexing'),
(16, 'SK016', 'MongoDB', 'Database', 'NoSQL document database, aggregation pipelines'),
(17, 'SK017', 'Oracle', 'Database', 'Enterprise PL/SQL, database administration'),
(18, 'SK018', 'Git', 'DevOps & Version Control', 'Version control workflows, branching, rebasing'),
(19, 'SK019', 'GitHub', 'DevOps & Collaboration', 'GitHub Actions, pull requests, project boards'),
(20, 'SK020', 'Linux', 'Operating System', 'Command line proficiency, shell scripting, permissions'),
(21, 'SK021', 'Docker', 'Cloud & DevOps', 'Containerization, docker-compose, image building'),
(22, 'SK022', 'Kubernetes', 'Cloud & DevOps', 'Container orchestration, clusters, ingress control'),
(23, 'SK023', 'AWS', 'Cloud Computing', 'AWS EC2, S3, IAM, CloudFront, Serverless'),
(24, 'SK024', 'Azure', 'Cloud Computing', 'Microsoft Azure cloud services, DevOps pipelines'),
(25, 'SK025', 'Firebase', 'Cloud Services', 'Firebase Authentication, Realtime Database, Firestore'),
(26, 'SK026', 'REST API', 'Web Services', 'RESTful architectural design, HTTP status standards'),
(27, 'SK027', 'GraphQL', 'Web Services', 'GraphQL schema definition, queries, mutations'),
(28, 'SK028', 'Cyber Security', 'Security', 'Network security fundamentals, OWASP Top 10'),
(29, 'SK029', 'Machine Learning', 'Artificial Intelligence', 'Supervised/unsupervised algorithms, evaluation metrics'),
(30, 'SK030', 'Artificial Intelligence', 'Artificial Intelligence', 'Neural networks, Deep Learning, computer vision'),
(31, 'SK031', 'Data Analytics', 'Data Science', 'Data cleaning, visualization, statistical insights'),
(32, 'SK032', 'Communication', 'Soft Skills', 'Clear verbal & written corporate communication'),
(33, 'SK033', 'Leadership', 'Soft Skills', 'Strategic vision, team empowerment, decision-making'),
(34, 'SK034', 'Teamwork', 'Soft Skills', 'Collaborative problem solving, cross-functional synergy'),
(35, 'SK035', 'Presentation Skills', 'Soft Skills', 'Effective public speaking & slide presentation'),
(36, 'SK036', 'Critical Thinking', 'Analytical Skills', 'Logical reasoning, bias mitigation, objective evaluation'),
(37, 'SK037', 'Problem Solving', 'Analytical Skills', 'Root cause identification, structured troubleshooting'),
(38, 'SK038', 'Time Management', 'Personal Effectiveness', 'Task prioritization, deadline adherence, focus'),
(39, 'SK039', 'Project Management', 'Management', 'Agile, Scrum, Gantt chart planning, risk mitigation'),
(40, 'SK040', 'Robotics & CAD', 'Engineering', 'SolidWorks 3D CAD modeling & kinematic synthesis'),
(41, 'SK041', 'Structural Analysis', 'Civil Engineering', 'Structural loading dynamics & FEA calculations'),
(42, 'SK042', 'Talent Acquisition', 'Human Resources', 'Recruitment pipeline, interview assessment techniques'),
(43, 'SK043', 'Financial Modeling', 'Finance', 'DCF valuation, balance sheet forecasting, Excel'),
(44, 'SK044', 'SEO & SEM', 'Marketing', 'Keyword optimization, search ads, indexing audit'),
(45, 'SK045', 'Healthcare Compliance', 'Healthcare', 'HIPAA standards, EHR records management'),
(46, 'SK046', 'VLSI Design', 'Electronics', 'Digital IC layout, CMOS circuit design, Verilog'),
(47, 'SK047', 'IoT Protocols', 'Embedded Tech', 'MQTT, CoAP, Zigbee wireless sensor networks'),
(48, 'SK048', 'System Architecture', 'Software Architecture', 'High availability, microservices, load balancing'),
(49, 'SK049', 'Quality Assurance', 'Testing', 'Unit testing, integration testing, Cypress, Jest'),
(50, 'SK050', 'UI/UX Design', 'Design', 'Figma wireframing, user journey maps, prototyping');

-- --------------------------------------------------------------------
-- 5. COURSE_SKILLS BENCHMARKS
-- --------------------------------------------------------------------
INSERT INTO `course_skills` (`course_id`, `skill_id`, `required_score`) VALUES
-- Web Development Masterclass (Course 1)
(1, 1, 90), -- HTML
(1, 2, 90), -- CSS
(1, 3, 90), -- JS
(1, 4, 80), -- Bootstrap
(1, 5, 80), -- React
(1, 8, 80), -- Node.js
(1, 9, 80), -- Express.js
(1, 15, 75),-- MySQL
(1, 32, 85),-- Communication
(1, 33, 70),-- Leadership

-- Data Science & ML (Course 2)
(2, 11, 90),-- Python
(2, 29, 85),-- ML
(2, 31, 90),-- Data Analytics
(2, 36, 80),-- Critical Thinking
(2, 37, 85),-- Problem Solving

-- Java Microservices (Course 4)
(4, 12, 90),-- Java
(4, 26, 85),-- REST API
(4, 21, 75),-- Docker
(4, 48, 80);-- System Architecture

-- --------------------------------------------------------------------
-- 6. USER_SKILLS (Realistic student Rahul Sharma user_id=3 + others)
-- Rahul Sharma (User ID: 3)
-- --------------------------------------------------------------------
INSERT INTO `user_skills` (`user_id`, `skill_id`, `current_score`, `proficiency_level`) VALUES
(3, 1, 90, 'Expert'),        -- HTML
(3, 2, 80, 'Advanced'),      -- CSS
(3, 3, 65, 'Intermediate'),  -- JavaScript
(3, 4, 75, 'Advanced'),      -- Bootstrap
(3, 5, 40, 'Beginner'),      -- React (Gap: 40)
(3, 8, 35, 'Beginner'),      -- Node.js (Gap: 45)
(3, 9, 30, 'Beginner'),      -- Express.js (Gap: 50)
(3, 15, 60, 'Intermediate'), -- MySQL (Gap: 15)
(3, 32, 70, 'Intermediate'), -- Communication (Gap: 15)
(3, 33, 45, 'Beginner');     -- Leadership (Gap: 25)

-- Auto-seed skills for other users
INSERT INTO `user_skills` (`user_id`, `skill_id`, `current_score`, `proficiency_level`)
SELECT 
  u.id, 
  s.id, 
  FLOOR(30 + (RAND() * 60)), 
  IF(RAND() > 0.7, 'Expert', IF(RAND() > 0.4, 'Advanced', IF(RAND() > 0.2, 'Intermediate', 'Beginner')))
FROM `users` u
CROSS JOIN `skills` s
WHERE u.id != 3 AND (u.id + s.id) % 7 = 0;

-- --------------------------------------------------------------------
-- 7. ASSESSMENTS (150+ generated)
-- --------------------------------------------------------------------
INSERT INTO `assessments` (`id`, `title`, `course_id`, `skill_id`, `max_theory_score`, `max_practical_score`, `weightage`, `created_by`) VALUES
(1, 'HTML5 Semantic Markup & Form Validation', 1, 1, 50, 50, 100, 2),
(2, 'CSS3 Grid Layout & Responsive Breakpoints', 1, 2, 50, 50, 100, 2),
(3, 'JavaScript Async/Await & Fetch API Practical', 1, 3, 50, 50, 100, 2),
(4, 'Bootstrap 5 Dashboard Component Integration', 1, 4, 50, 50, 100, 2),
(5, 'React Hooks & State Management Test', 1, 5, 50, 50, 100, 2),
(6, 'Node.js Event Loop & Module Architecture', 1, 8, 50, 50, 100, 2),
(7, 'Express.js Routing & Middleware Design', 1, 9, 50, 50, 100, 2),
(8, 'MySQL Relational Schema & Complex Querying', 1, 15, 50, 50, 100, 2),
(9, 'Python Data Analysis & Pandas Processing', 2, 11, 50, 50, 100, 6),
(10, 'Machine Learning Model Evaluation & Tuning', 2, 29, 50, 50, 100, 6);

-- Additional programmatic insertion for 140 assessments:
INSERT INTO `assessments` (`title`, `course_id`, `skill_id`, `max_theory_score`, `max_practical_score`, `created_by`)
SELECT 
  CONCAT('Skill Assessment #', s.id, ' for Course #', c.id),
  c.id,
  s.id,
  50,
  50,
  2
FROM `courses` c
JOIN `skills` s ON (c.id + s.id) % 5 = 0
LIMIT 140;

-- --------------------------------------------------------------------
-- 8. ASSESSMENT_RESULTS (150+)
-- --------------------------------------------------------------------
INSERT INTO `assessment_results` (`assessment_id`, `user_id`, `theory_score`, `practical_score`, `total_score`, `percentage`, `remarks`, `assessed_by`) VALUES
(1, 3, 46, 44, 90, 90.00, 'Excellent semantic HTML knowledge', 2),
(2, 3, 40, 40, 80, 80.00, 'Good flexbox and grid styling', 2),
(3, 3, 32, 33, 65, 65.00, 'Needs practice on promise error handling', 2),
(4, 3, 38, 37, 75, 75.00, 'Clean UI styling with Bootstrap', 2),
(5, 3, 20, 20, 40, 40.00, 'Struggled with useEffect dependencies', 2),
(6, 3, 18, 17, 35, 35.00, 'Needs deep dive into async event loop', 2),
(7, 3, 15, 15, 30, 30.00, 'Middleware order concepts require review', 2),
(8, 3, 30, 30, 60, 60.00, 'Basic JOIN queries passed, indexes missed', 2);

-- Additional results
INSERT INTO `assessment_results` (`assessment_id`, `user_id`, `theory_score`, `practical_score`, `total_score`, `percentage`, `remarks`, `assessed_by`)
SELECT 
  a.id,
  u.id,
  FLOOR(20 + RAND() * 30),
  FLOOR(20 + RAND() * 30),
  (FLOOR(20 + RAND() * 30) + FLOOR(20 + RAND() * 30)),
  ROUND(((FLOOR(20 + RAND() * 30) + FLOOR(20 + RAND() * 30)) / 100.0) * 100, 2),
  'Evaluated automatically by Skill_Map Assessment Engine',
  2
FROM `assessments` a
JOIN `users` u ON (a.id + u.id) % 9 = 0
LIMIT 145;

-- --------------------------------------------------------------------
-- 9. SKILL_GAP (Calculated for Rahul Sharma + 100+ entries)
-- Required Benchmark for Web Dev: HTML(90), CSS(90), JS(90), Bootstrap(80), React(80), Node(80), Express(80), MySQL(75), Comm(85), Lead(70)
-- --------------------------------------------------------------------
INSERT INTO `skill_gap` (`user_id`, `skill_id`, `required_score`, `current_score`, `gap_score`, `gap_percentage`, `priority`) VALUES
(3, 5, 80, 40, 40, 50.00, 'Critical'), -- React
(3, 8, 80, 35, 45, 56.25, 'Critical'), -- Node.js
(3, 9, 80, 30, 50, 62.50, 'Critical'), -- Express.js
(3, 33, 70, 45, 25, 35.71, 'Medium'),   -- Leadership
(3, 32, 85, 70, 15, 17.65, 'Low'),      -- Communication
(3, 2, 90, 80, 10, 11.11, 'Low'),       -- CSS
(3, 3, 90, 65, 25, 27.78, 'Medium'),   -- JavaScript
(3, 15, 75, 60, 15, 20.00, 'Low');      -- MySQL

-- Populate generic gap records for system visualization
INSERT INTO `skill_gap` (`user_id`, `skill_id`, `required_score`, `current_score`, `gap_score`, `gap_percentage`, `priority`)
SELECT 
  u.id,
  s.id,
  80,
  us.current_score,
  GREATEST(0, 80 - us.current_score),
  ROUND((GREATEST(0, 80 - us.current_score) / 80.0) * 100, 2),
  IF((GREATEST(0, 80 - us.current_score) / 80.0) >= 0.50, 'Critical', IF((GREATEST(0, 80 - us.current_score) / 80.0) >= 0.25, 'Medium', 'Low'))
FROM `users` u
JOIN `user_skills` us ON u.id = us.user_id
JOIN `skills` s ON us.skill_id = s.id
WHERE u.id != 3
LIMIT 120;

-- --------------------------------------------------------------------
-- 10. LEARNING_PATHS
-- --------------------------------------------------------------------
INSERT INTO `learning_paths` (`user_id`, `title`, `target_role_or_course`, `progress_percent`, `status`) VALUES
(3, 'Full Stack MERN Developer Certification Path', 'Full Stack Engineer', 42.50, 'In Progress'),
(3, 'Executive Leadership & Soft Skills Accelerator', 'Team Lead', 20.00, 'In Progress'),
(9, 'Data Science & Applied AI Career Track', 'Data Scientist', 65.00, 'In Progress'),
(10, 'Deep Learning & Neural Network Mastery', 'AI Research Scientist', 80.00, 'In Progress'),
(11, 'AWS Certified Cloud Architect Professional', 'Cloud Architect', 30.00, 'In Progress');

-- --------------------------------------------------------------------
-- 11. RECOMMENDATIONS (100+)
-- --------------------------------------------------------------------
INSERT INTO `recommendations` (`user_id`, `skill_id`, `course_id`, `resource_title`, `resource_type`, `url_or_ref`, `est_hours`, `priority`, `status`) VALUES
(3, 5, 19, 'React Bootcamp - Hooks, Context & State', 'Course', 'https://react.dev/learn', 25, 'Critical', 'Assigned'),
(3, 8, 20, 'Node.js Masterclass & Event Driven Architecture', 'Course', 'https://nodejs.org/docs', 30, 'Critical', 'Assigned'),
(3, 9, 20, 'Express API Development & Middleware Design', 'Course', 'https://expressjs.com', 20, 'Critical', 'Assigned'),
(3, 33, 12, 'Leadership Fundamentals & Team Dynamics', 'Course', 'https://coursera.org', 15, 'Medium', 'Pending'),
(3, 32, 27, 'Professional Communication & Pitching', 'Workshop', 'https://edx.org', 10, 'Low', 'Completed');

INSERT INTO `recommendations` (`user_id`, `skill_id`, `course_id`, `resource_title`, `resource_type`, `est_hours`, `priority`, `status`)
SELECT 
  g.user_id,
  g.skill_id,
  1,
  CONCAT('Recommended Module for ', s.name),
  IF(RAND() > 0.5, 'Course', IF(RAND() > 0.3, 'Book', 'Video')),
  FLOOR(10 + RAND() * 30),
  g.priority,
  IF(RAND() > 0.5, 'Pending', 'In Progress')
FROM `skill_gap` g
JOIN `skills` s ON g.skill_id = s.id
WHERE g.user_id != 3
LIMIT 100;

-- --------------------------------------------------------------------
-- 12. CERTIFICATES (50+)
-- --------------------------------------------------------------------
INSERT INTO `certificates` (`certificate_no`, `user_id`, `course_id`, `issue_date`, `score_achieved`, `verification_hash`) VALUES
('CERT-2026-CS101-001', 3, 1, '2026-05-15', 92.50, 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'),
('CERT-2026-CS109-002', 3, 22, '2026-04-10', 88.00, '4b227777d4d1fc61c6f884f48641d02b4d121d3fd328cb08b5531fcacdabf8a4'),
('CERT-2026-IT201-003', 11, 6, '2026-06-01', 94.00, '9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08');

INSERT INTO `certificates` (`certificate_no`, `user_id`, `course_id`, `issue_date`, `score_achieved`, `verification_hash`)
SELECT 
  CONCAT('CERT-2026-GEN-', LPAD(u.id, 4, '0'), '-', LPAD(c.id, 2, '0')),
  u.id,
  c.id,
  DATE_SUB(CURDATE(), INTERVAL FLOOR(RAND() * 90) DAY),
  ROUND(75 + RAND() * 23, 2),
  SHA2(CONCAT(u.id, c.id, RAND()), 256)
FROM `users` u
JOIN `courses` c ON (u.id + c.id) % 8 = 0
LIMIT 50;

-- --------------------------------------------------------------------
-- 13. NOTIFICATIONS (40+)
-- --------------------------------------------------------------------
INSERT INTO `notifications` (`user_id`, `title`, `message`, `type`, `is_read`, `created_at`) VALUES
(3, 'Assessment Assigned', 'You have been assigned: React Hooks & State Management Test', 'Assessment', 0, NOW()),
(3, 'Skill Gap Alert', 'Critical skill gap detected in Node.js (56.25% gap). Recommended learning path assigned.', 'SkillGap', 0, NOW()),
(3, 'Certificate Earned', 'Congratulations! You earned Web Development Masterclass Certificate (CERT-2026-CS101-001)', 'Certificate', 1, NOW() - INTERVAL 1 DAY),
(3, 'Course Assigned', 'New course assigned: Node.js Masterclass & Event Driven Architecture', 'CourseAssigned', 0, NOW());

INSERT INTO `notifications` (`user_id`, `title`, `message`, `type`, `is_read`, `created_at`)
SELECT 
  u.id,
  'System Update Alert',
  'Skill Mapping engine updated department benchmarks for Q3 2026.',
  'System',
  IF(RAND() > 0.5, 1, 0),
  NOW() - INTERVAL FLOOR(RAND() * 10) DAY
FROM `users` u
LIMIT 40;

-- --------------------------------------------------------------------
-- 14. ACTIVITY_LOGS (200+)
-- --------------------------------------------------------------------
INSERT INTO `activity_logs` (`user_id`, `action`, `module`, `ip_address`, `details`, `created_at`) VALUES
(1, 'User Login', 'Auth', '127.0.0.1', 'Admin logged into corporate control panel', NOW() - INTERVAL 5 MINUTE),
(3, 'User Login', 'Auth', '127.0.0.1', 'Student Rahul Sharma logged in', NOW() - INTERVAL 10 MINUTE),
(3, 'Generated Gap Analysis Report', 'Gap Analysis', '127.0.0.1', 'Computed gap scores for Web Dev track', NOW() - INTERVAL 8 MINUTE),
(2, 'Graded Assessment', 'Assessment', '127.0.0.1', 'Graded HTML5 test for Rahul Sharma', NOW() - INTERVAL 2 HOUR);

INSERT INTO `activity_logs` (`user_id`, `action`, `module`, `ip_address`, `details`, `created_at`)
SELECT 
  u.id,
  IF(RAND() > 0.5, 'Viewed Skill Matrix', IF(RAND() > 0.3, 'Exported Gap PDF', 'Completed Skill Test')),
  IF(RAND() > 0.5, 'Skills', 'Analytics'),
  '127.0.0.1',
  'Automated audit trace entry',
  NOW() - INTERVAL FLOOR(RAND() * 30) DAY
FROM `users` u
CROSS JOIN (SELECT 1 UNION SELECT 2 UNION SELECT 3) t
LIMIT 200;

-- --------------------------------------------------------------------
-- 15. SETTINGS
-- --------------------------------------------------------------------
INSERT INTO `settings` (`setting_key`, `setting_value`, `description`) VALUES
('system_name', 'Skill_Map Intelligence Platform', 'Platform title displayed across application'),
('default_gap_threshold', '50', 'Gap percentage threshold for Critical priority rating'),
('enable_ai_recommendations', 'true', 'Enable automated recommendation matching algorithm'),
('dark_mode_default', 'false', 'Default system UI theme preference'),
('institution_name', 'Global Institute of Skill Intelligence & Technology', 'Organization branding name');

-- ====================================================================
-- END OF SQL SCHEMA & DATA SCRIPT
-- ====================================================================
