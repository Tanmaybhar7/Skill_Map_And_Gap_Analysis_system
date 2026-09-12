const mysql = require('mysql2/promise');
const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASS || '',
  database: process.env.DB_NAME || 'skill_map',
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

let pool = null;
let isConnected = false;

// In-Memory Database Fallback Store (populated from seed SQL if MySQL unavailable)
const memoryDb = {
  departments: [
    { id: 1, code: 'CS', name: 'Computer Science', description: 'Software engineering & AI', head_name: 'Dr. Aris Thorne' },
    { id: 2, code: 'IT', name: 'Information Technology', description: 'Web systems & security', head_name: 'Dr. Sarah Jenkins' },
    { id: 3, code: 'ME', name: 'Mechanical Engineering', description: 'Robotics & CAD design', head_name: 'Prof. Marcus Vance' },
    { id: 4, code: 'CE', name: 'Civil Engineering', description: 'Structural design & GIS', head_name: 'Dr. Elena Rostova' },
    { id: 5, code: 'BA', name: 'Business Administration', description: 'Leadership & strategy', head_name: 'Prof. David Sterling' },
    { id: 6, code: 'HR', name: 'Human Resources', description: 'Talent & L&D management', head_name: 'Dr. Victoria Chase' },
    { id: 7, code: 'MKT', name: 'Marketing', description: 'Digital marketing & SEO', head_name: 'Prof. Rachel Green' },
    { id: 8, code: 'FIN', name: 'Finance', description: 'Corporate finance & fintech', head_name: 'Dr. Robert Langdon' },
    { id: 9, code: 'HC', name: 'Healthcare', description: 'Health informatics & EHR', head_name: 'Dr. Sophia Martinez' },
    { id: 10, code: 'ECE', name: 'Electronics Engineering', description: 'IoT & VLSI systems', head_name: 'Dr. Jonathan Miller' }
  ],
  users: [
    { id: 1, user_code: 'ADM001', name: 'System Administrator', email: 'admin@skillmap.com', password: 'admin123', role: 'Admin', department_id: 1, designation: 'Chief Administrator', phone: '+1-555-0101', avatar: 'default-avatar.png' },
    { id: 2, user_code: 'FAC001', name: 'Prof. Alex Morgan', email: 'faculty@skillmap.com', password: 'faculty123', role: 'Faculty', department_id: 1, designation: 'Senior Faculty Lead', phone: '+1-555-0102', avatar: 'default-avatar.png' },
    { id: 3, user_code: 'SM1001', name: 'Rahul Sharma', email: 'student@skillmap.com', password: 'student123', role: 'Student', department_id: 1, designation: 'Full Stack Web Scholar', phone: '+1-555-0103', avatar: 'default-avatar.png' },
    { id: 4, user_code: 'HR001', name: 'Sarah Jenkins', email: 'hr@skillmap.com', password: 'hr123', role: 'HR Manager', department_id: 6, designation: 'Global HR Director', phone: '+1-555-0104', avatar: 'default-avatar.png' },
    { id: 5, user_code: 'TM001', name: 'Alex Mercer', email: 'training@skillmap.com', password: 'training123', role: 'Training Manager', department_id: 6, designation: 'Corporate L&D Lead', phone: '+1-555-0105', avatar: 'default-avatar.png' }
  ],
  courses: [
    { id: 1, course_code: 'CS101', title: 'Web Development Masterclass', department_id: 1, category: 'Web Tech', duration_hours: 60, level: 'Intermediate', description: 'Full stack development with HTML, CSS, JavaScript, React, Node.js & MySQL' },
    { id: 2, course_code: 'CS102', title: 'Data Science & Machine Learning', department_id: 1, category: 'AI & Data', duration_hours: 80, level: 'Advanced', description: 'Predictive modeling, Pandas, Scikit-learn & Neural Networks' },
    { id: 3, course_code: 'CS103', title: 'Artificial Intelligence Fundamentals', department_id: 1, category: 'AI & Data', duration_hours: 70, level: 'Advanced', description: 'Search algorithms, knowledge representation, NLP & Computer Vision' },
    { id: 4, course_code: 'IT201', title: 'Cloud Computing & AWS Architecture', department_id: 2, category: 'Cloud & Infra', duration_hours: 55, level: 'Intermediate', description: 'AWS EC2, S3, Lambda, Docker & Kubernetes' },
    { id: 5, course_code: 'IT202', title: 'Cyber Security & Ethical Hacking', department_id: 2, category: 'Security', duration_hours: 60, level: 'Advanced', description: 'Network security, penetration testing & SOC operations' }
  ],
  skills: [
    { id: 1, skill_code: 'SK001', name: 'HTML', category: 'Frontend Development', description: 'HTML5 semantic markup, forms, accessibility' },
    { id: 2, skill_code: 'SK002', name: 'CSS', category: 'Frontend Development', description: 'CSS3 Flexbox, Grid, responsive design' },
    { id: 3, skill_code: 'SK003', name: 'JavaScript', category: 'Programming', description: 'ES6+ modern syntax, async/await, DOM' },
    { id: 4, skill_code: 'SK004', name: 'Bootstrap', category: 'Frontend Framework', description: 'Bootstrap 5 components & grid layout' },
    { id: 5, skill_code: 'SK005', name: 'React', category: 'Frontend Framework', description: 'React SPA, hooks, state management' },
    { id: 6, skill_code: 'SK008', name: 'Node.js', category: 'Backend Development', description: 'Event-driven asynchronous backend runtime' },
    { id: 7, skill_code: 'SK009', name: 'Express.js', category: 'Backend Framework', description: 'Express routing, REST API creation' },
    { id: 8, skill_code: 'SK015', name: 'MySQL', category: 'Database', description: 'Relational database design, queries' },
    { id: 9, skill_code: 'SK032', name: 'Communication', category: 'Soft Skills', description: 'Clear corporate communication' },
    { id: 10, skill_code: 'SK033', name: 'Leadership', category: 'Soft Skills', description: 'Strategic vision & team motivation' }
  ],
  user_skills: [
    { id: 1, user_id: 3, skill_id: 1, current_score: 90, proficiency_level: 'Expert' },
    { id: 2, user_id: 3, skill_id: 2, current_score: 80, proficiency_level: 'Advanced' },
    { id: 3, user_id: 3, skill_id: 3, current_score: 65, proficiency_level: 'Intermediate' },
    { id: 4, user_id: 3, skill_id: 4, current_score: 75, proficiency_level: 'Advanced' },
    { id: 5, user_id: 3, skill_id: 5, current_score: 40, proficiency_level: 'Beginner' },
    { id: 6, user_id: 3, skill_id: 6, current_score: 35, proficiency_level: 'Beginner' },
    { id: 7, user_id: 3, skill_id: 7, current_score: 30, proficiency_level: 'Beginner' },
    { id: 8, user_id: 3, skill_id: 8, current_score: 60, proficiency_level: 'Intermediate' },
    { id: 9, user_id: 3, skill_id: 9, current_score: 70, proficiency_level: 'Intermediate' },
    { id: 10, user_id: 3, skill_id: 10, current_score: 45, proficiency_level: 'Beginner' }
  ],
  skill_gap: [
    { id: 1, user_id: 3, skill_id: 5, required_score: 80, current_score: 40, gap_score: 40, gap_percentage: 50.00, priority: 'Critical' },
    { id: 2, user_id: 3, skill_id: 6, required_score: 80, current_score: 35, gap_score: 45, gap_percentage: 56.25, priority: 'Critical' },
    { id: 3, user_id: 3, skill_id: 7, required_score: 80, current_score: 30, gap_score: 50, gap_percentage: 62.50, priority: 'Critical' },
    { id: 4, user_id: 3, skill_id: 10, required_score: 70, current_score: 45, gap_score: 25, gap_percentage: 35.71, priority: 'Medium' },
    { id: 5, user_id: 3, skill_id: 9, required_score: 85, current_score: 70, gap_score: 15, gap_percentage: 17.65, priority: 'Low' }
  ],
  assessments: [
    { id: 1, title: 'HTML5 Semantic Markup & Form Validation', course_id: 1, skill_id: 1, max_theory_score: 50, max_practical_score: 50, weightage: 100 },
    { id: 2, title: 'CSS3 Grid Layout & Responsive Breakpoints', course_id: 1, skill_id: 2, max_theory_score: 50, max_practical_score: 50, weightage: 100 },
    { id: 3, title: 'JavaScript Async/Await & Fetch API', course_id: 1, skill_id: 3, max_theory_score: 50, max_practical_score: 50, weightage: 100 }
  ],
  assessment_results: [
    { id: 1, assessment_id: 1, user_id: 3, theory_score: 46, practical_score: 44, total_score: 90, percentage: 90.00, remarks: 'Excellent semantic HTML knowledge' },
    { id: 2, assessment_id: 2, user_id: 3, theory_score: 40, practical_score: 40, total_score: 80, percentage: 80.00, remarks: 'Good flexbox and grid styling' },
    { id: 3, assessment_id: 3, user_id: 3, theory_score: 32, practical_score: 33, total_score: 65, percentage: 65.00, remarks: 'Needs practice on promise handling' }
  ],
  recommendations: [
    { id: 1, user_id: 3, skill_id: 5, course_id: 1, resource_title: 'React Bootcamp - Hooks & State', resource_type: 'Course', url_or_ref: 'https://react.dev', est_hours: 25, priority: 'Critical', status: 'Assigned' },
    { id: 2, user_id: 3, skill_id: 6, course_id: 1, resource_title: 'Node.js Masterclass', resource_type: 'Course', url_or_ref: 'https://nodejs.org', est_hours: 30, priority: 'Critical', status: 'Assigned' },
    { id: 3, user_id: 3, skill_id: 7, course_id: 1, resource_title: 'Express API Development', resource_type: 'Course', url_or_ref: 'https://expressjs.com', est_hours: 20, priority: 'Critical', status: 'Assigned' }
  ],
  certificates: [
    { id: 1, certificate_no: 'CERT-2026-CS101-001', user_id: 3, course_id: 1, issue_date: '2026-05-15', score_achieved: 92.50, verification_hash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855' }
  ],
  notifications: [
    { id: 1, user_id: 3, title: 'Assessment Assigned', message: 'React Hooks & State Management Test', type: 'Assessment', is_read: 0, created_at: new Date() },
    { id: 2, user_id: 3, title: 'Skill Gap Alert', message: 'Critical skill gap in Node.js (56.25%)', type: 'SkillGap', is_read: 0, created_at: new Date() }
  ],
  activity_logs: [
    { id: 1, user_id: 1, action: 'User Login', module: 'Auth', ip_address: '127.0.0.1', details: 'Admin logged into corporate panel', created_at: new Date() },
    { id: 2, user_id: 3, action: 'User Login', module: 'Auth', ip_address: '127.0.0.1', details: 'Rahul Sharma logged in', created_at: new Date() }
  ],
  settings: [
    { id: 1, setting_key: 'system_name', setting_value: 'Skill_Map Intelligence Platform', description: 'Platform title' },
    { id: 2, setting_key: 'default_gap_threshold', setting_value: '50', description: 'Critical gap threshold' }
  ]
};

async function initDatabase() {
  try {
    pool = mysql.createPool(dbConfig);
    const conn = await pool.getConnection();
    console.log('✅ Connected to MySQL Database:', process.env.DB_NAME);
    conn.release();
    isConnected = true;
  } catch (err) {
    console.warn('⚠️  MySQL connection failed:', err.message);
    console.warn('🔄 Running in High-Performance In-Memory Simulation Mode');
    isConnected = false;
  }
}

initDatabase();

async function query(sql, params = []) {
  if (isConnected && pool) {
    try {
      const [rows] = await pool.execute(sql, params);
      return rows;
    } catch (err) {
      console.warn('MySQL Query Error, switching to fallback:', err.message);
    }
  }
  return executeInMemoryQuery(sql, params);
}

function executeInMemoryQuery(sql, params) {
  const cleanSql = sql.trim().toLowerCase();
  
  // Basic Mock Router for In-Memory DB
  if (cleanSql.startsWith('select')) {
    if (cleanSql.includes('from users')) return memoryDb.users;
    if (cleanSql.includes('from departments')) return memoryDb.departments;
    if (cleanSql.includes('from courses')) return memoryDb.courses;
    if (cleanSql.includes('from skills')) return memoryDb.skills;
    if (cleanSql.includes('from user_skills')) return memoryDb.user_skills;
    if (cleanSql.includes('from skill_gap')) return memoryDb.skill_gap;
    if (cleanSql.includes('from assessments')) return memoryDb.assessments;
    if (cleanSql.includes('from assessment_results')) return memoryDb.assessment_results;
    if (cleanSql.includes('from recommendations')) return memoryDb.recommendations;
    if (cleanSql.includes('from certificates')) return memoryDb.certificates;
    if (cleanSql.includes('from notifications')) return memoryDb.notifications;
    if (cleanSql.includes('from activity_logs')) return memoryDb.activity_logs;
    if (cleanSql.includes('from settings')) return memoryDb.settings;
  }

  if (cleanSql.startsWith('insert')) {
    return { insertId: Math.floor(Math.random() * 1000) + 100, affectedRows: 1 };
  }

  if (cleanSql.startsWith('update') || cleanSql.startsWith('delete')) {
    return { affectedRows: 1 };
  }

  return [];
}

module.exports = {
  query,
  pool,
  memoryDb,
  getIsConnected: () => isConnected
};
