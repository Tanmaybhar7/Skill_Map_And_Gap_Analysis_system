const { query, memoryDb, getIsConnected } = require('../config/db');

exports.getNotifications = async (req, res, next) => {
  try {
    const userId = req.user ? req.user.id : 3;

    if (getIsConnected()) {
      const sql = `SELECT * FROM notifications WHERE user_id = ? ORDER BY id DESC LIMIT 20`;
      const notifications = await query(sql, [userId]);
      return res.json({ success: true, notifications });
    } else {
      return res.json({ success: true, notifications: memoryDb.notifications });
    }
  } catch (err) {
    next(err);
  }
};

exports.markAsRead = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (getIsConnected()) {
      await query(`UPDATE notifications SET is_read = 1 WHERE id = ?`, [id]);
    } else {
      const n = memoryDb.notifications.find(n => n.id == id);
      if (n) n.is_read = 1;
    }
    res.json({ success: true, message: 'Notification marked as read' });
  } catch (err) {
    next(err);
  }
};
