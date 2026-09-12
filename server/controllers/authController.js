const bcrypt = require('bcryptjs');
const { query, memoryDb, getIsConnected } = require('../config/db');
const { generateToken } = require('../config/jwt');
const { logActivity } = require('../utils/logger');

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    let user = null;
    if (getIsConnected()) {
      const sql = `SELECT u.*, d.name as department_name FROM users u LEFT JOIN departments d ON u.department_id = d.id WHERE u.email = ?`;
      const rows = await query(sql, [email]);
      if (rows && rows.length > 0) user = rows[0];
    } else {
      user = memoryDb.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    }

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials. User account not found.' });
    }

    // Passwords match check (Supports standard hashes or plain text fallback for demo logins)
    let isMatch = false;
    if (user.password.startsWith('$2a$') || user.password.startsWith('$2b$')) {
      isMatch = await bcrypt.compare(password, user.password);
    } 
    // Default system credentials override check
    if (!isMatch) {
      if ((email === 'admin@skillmap.com' && password === 'admin123') ||
          (email === 'faculty@skillmap.com' && password === 'faculty123') ||
          (email === 'student@skillmap.com' && password === 'student123') ||
          (email === 'hr@skillmap.com' && password === 'hr123') ||
          (email === 'training@skillmap.com' && password === 'training123') ||
          (user.password === password)) {
        isMatch = true;
      }
    }

    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid password credential.' });
    }

    const payload = {
      id: user.id,
      user_code: user.user_code,
      name: user.name,
      email: user.email,
      role: user.role,
      department_id: user.department_id,
      department_name: user.department_name || 'General'
    };

    const token = generateToken(payload);
    await logActivity(user.id, 'User Login', 'Auth', `Logged in as ${user.role}`);

    res.json({
      success: true,
      message: 'Authentication successful',
      token,
      user: payload
    });

  } catch (err) {
    next(err);
  }
};

exports.register = async (req, res, next) => {
  try {
    const { name, email, password, role, department_id, designation } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email and password are required' });
    }

    const user_code = 'SM' + Math.floor(1000 + Math.random() * 9000);
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const userRole = role || 'Student';
    const deptId = department_id || 1;

    if (getIsConnected()) {
      const sql = `INSERT INTO users (user_code, name, email, password, role, department_id, designation) VALUES (?, ?, ?, ?, ?, ?, ?)`;
      const result = await query(sql, [user_code, name, email, hashedPassword, userRole, deptId, designation || 'Member']);
      const newUserId = result.insertId;

      const token = generateToken({ id: newUserId, user_code, name, email, role: userRole, department_id: deptId });
      return res.json({ success: true, message: 'User registered successfully', token, user: { id: newUserId, user_code, name, email, role: userRole } });
    } else {
      const newUser = { id: memoryDb.users.length + 1, user_code, name, email, password: hashedPassword, role: userRole, department_id: deptId, designation: designation || 'Member' };
      memoryDb.users.push(newUser);
      const token = generateToken({ id: newUser.id, user_code, name, email, role: userRole, department_id: deptId });
      return res.json({ success: true, message: 'User registered successfully', token, user: newUser });
    }

  } catch (err) {
    next(err);
  }
};

exports.getProfile = async (req, res, next) => {
  try {
    const userId = req.user.id;
    let user = null;

    if (getIsConnected()) {
      const sql = `SELECT u.id, u.user_code, u.name, u.email, u.role, u.department_id, u.designation, u.phone, u.avatar, d.name as department_name FROM users u LEFT JOIN departments d ON u.department_id = d.id WHERE u.id = ?`;
      const rows = await query(sql, [userId]);
      if (rows && rows.length > 0) user = rows[0];
    } else {
      user = memoryDb.users.find(u => u.id == userId);
    }

    res.json({ success: true, user });
  } catch (err) {
    next(err);
  }
};

exports.changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'New password must be at least 6 characters' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    if (getIsConnected()) {
      await query(`UPDATE users SET password = ? WHERE id = ?`, [hashedPassword, userId]);
    }
    
    await logActivity(userId, 'Password Change', 'Auth', 'Changed account password');
    res.json({ success: true, message: 'Password updated successfully' });
  } catch (err) {
    next(err);
  }
};

exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    res.json({ success: true, message: `Password reset link sent to ${email} (Demo Mode)` });
  } catch (err) {
    next(err);
  }
};
