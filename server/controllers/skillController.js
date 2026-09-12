const { query, memoryDb, getIsConnected } = require('../config/db');

exports.getSkills = async (req, res, next) => {
  try {
    if (getIsConnected()) {
      const sql = `SELECT * FROM skills ORDER BY id ASC`;
      const skills = await query(sql);
      return res.json({ success: true, skills });
    } else {
      return res.json({ success: true, skills: memoryDb.skills });
    }
  } catch (err) {
    next(err);
  }
};

exports.getSkillById = async (req, res, next) => {
  try {
    const { id } = req.params;
    let skill = null;
    if (getIsConnected()) {
      const rows = await query(`SELECT * FROM skills WHERE id = ?`, [id]);
      if (rows.length > 0) skill = rows[0];
    } else {
      skill = memoryDb.skills.find(s => s.id == id);
    }
    res.json({ success: true, skill });
  } catch (err) {
    next(err);
  }
};

exports.createSkill = async (req, res, next) => {
  try {
    const { skill_code, name, category, description } = req.body;
    if (!skill_code || !name) {
      return res.status(400).json({ success: false, message: 'Skill Code and Name are required' });
    }

    if (getIsConnected()) {
      const sql = `INSERT INTO skills (skill_code, name, category, description) VALUES (?, ?, ?, ?)`;
      const result = await query(sql, [skill_code, name, category || 'Technical', description || '']);
      return res.json({ success: true, message: 'Skill added successfully', id: result.insertId });
    } else {
      const newSkill = { id: memoryDb.skills.length + 1, skill_code, name, category: category || 'Technical', description: description || '' };
      memoryDb.skills.push(newSkill);
      return res.json({ success: true, message: 'Skill added successfully', id: newSkill.id });
    }
  } catch (err) {
    next(err);
  }
};

exports.updateSkill = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { skill_code, name, category, description } = req.body;
    if (getIsConnected()) {
      const sql = `UPDATE skills SET skill_code = ?, name = ?, category = ?, description = ? WHERE id = ?`;
      await query(sql, [skill_code, name, category, description, id]);
    }
    res.json({ success: true, message: 'Skill updated successfully' });
  } catch (err) {
    next(err);
  }
};

exports.deleteSkill = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (getIsConnected()) {
      await query(`DELETE FROM skills WHERE id = ?`, [id]);
    } else {
      const idx = memoryDb.skills.findIndex(s => s.id == id);
      if (idx !== -1) memoryDb.skills.splice(idx, 1);
    }
    res.json({ success: true, message: 'Skill deleted successfully' });
  } catch (err) {
    next(err);
  }
};
