const { query, memoryDb, getIsConnected } = require('../config/db');

exports.getUserSkillMatrix = async (req, res, next) => {
  try {
    const { department_id } = req.query;

    if (getIsConnected()) {
      let sql = `
        SELECT u.id as user_id, u.name as user_name, u.role, d.name as department_name,
               s.id as skill_id, s.name as skill_name, us.current_score, us.proficiency_level
        FROM users u
        LEFT JOIN departments d ON u.department_id = d.id
        LEFT JOIN user_skills us ON u.id = us.user_id
        LEFT JOIN skills s ON us.skill_id = s.id
        WHERE 1=1
      `;
      const params = [];
      if (department_id) {
        sql += ` AND u.department_id = ?`;
        params.push(department_id);
      }
      sql += ` ORDER BY u.id ASC, s.id ASC`;

      const matrixRows = await query(sql, params);
      return res.json({ success: true, matrix: matrixRows });
    } else {
      return res.json({ success: true, matrix: memoryDb.user_skills });
    }
  } catch (err) {
    next(err);
  }
};

exports.mapUserSkill = async (req, res, next) => {
  try {
    const { user_id, skill_id, current_score, proficiency_level } = req.body;
    if (!user_id || !skill_id) {
      return res.status(400).json({ success: false, message: 'User ID and Skill ID are required' });
    }

    const score = Number(current_score) || 50;
    let level = proficiency_level;
    if (!level) {
      if (score >= 85) level = 'Expert';
      else if (score >= 70) level = 'Advanced';
      else if (score >= 50) level = 'Intermediate';
      else level = 'Beginner';
    }

    if (getIsConnected()) {
      const sql = `
        INSERT INTO user_skills (user_id, skill_id, current_score, proficiency_level) 
        VALUES (?, ?, ?, ?) 
        ON DUPLICATE KEY UPDATE current_score = VALUES(current_score), proficiency_level = VALUES(proficiency_level)
      `;
      await query(sql, [user_id, skill_id, score, level]);
    }

    res.json({ success: true, message: 'User skill map saved successfully', score, level });
  } catch (err) {
    next(err);
  }
};

exports.getDepartmentSkillMatrix = async (req, res, next) => {
  try {
    if (getIsConnected()) {
      const sql = `
        SELECT d.id as department_id, d.name as department_name, s.name as skill_name, AVG(us.current_score) as avg_score
        FROM departments d
        JOIN users u ON d.id = u.department_id
        JOIN user_skills us ON u.id = us.user_id
        JOIN skills s ON us.skill_id = s.id
        GROUP BY d.id, s.id
        ORDER BY d.id, avg_score DESC
      `;
      const deptMatrix = await query(sql);
      return res.json({ success: true, departmentMatrix: deptMatrix });
    } else {
      return res.json({ success: true, departmentMatrix: [] });
    }
  } catch (err) {
    next(err);
  }
};
