const { query } = require('../config/db');

async function logActivity(userId, action, moduleName = 'General', details = '', ipAddress = '127.0.0.1') {
  try {
    const sql = `INSERT INTO activity_logs (user_id, action, module, ip_address, details, created_at) VALUES (?, ?, ?, ?, ?, NOW())`;
    await query(sql, [userId || null, action, moduleName, ipAddress, details]);
  } catch (err) {
    console.error('Failed to record activity log:', err.message);
  }
}

module.exports = { logActivity };
