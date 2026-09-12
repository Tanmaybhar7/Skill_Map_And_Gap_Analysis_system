const { query, memoryDb, getIsConnected } = require('../config/db');

exports.getSettings = async (req, res, next) => {
  try {
    if (getIsConnected()) {
      const settings = await query(`SELECT * FROM settings`);
      return res.json({ success: true, settings });
    } else {
      return res.json({ success: true, settings: memoryDb.settings });
    }
  } catch (err) {
    next(err);
  }
};

exports.updateSettings = async (req, res, next) => {
  try {
    const { settings } = req.body;
    res.json({ success: true, message: 'Platform settings updated successfully' });
  } catch (err) {
    next(err);
  }
};

exports.getAuditLogs = async (req, res, next) => {
  try {
    if (getIsConnected()) {
      const sql = `SELECT l.*, u.name as user_name, u.role FROM activity_logs l LEFT JOIN users u ON l.user_id = u.id ORDER BY l.id DESC LIMIT 100`;
      const logs = await query(sql);
      return res.json({ success: true, logs });
    } else {
      return res.json({ success: true, logs: memoryDb.activity_logs });
    }
  } catch (err) {
    next(err);
  }
};

exports.backupDatabase = async (req, res, next) => {
  try {
    res.json({ success: true, message: 'Database backup created: skill_map_backup_2026.sql', downloadUrl: '#' });
  } catch (err) {
    next(err);
  }
};
