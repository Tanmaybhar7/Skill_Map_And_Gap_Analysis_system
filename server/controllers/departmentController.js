const { query, memoryDb, getIsConnected } = require('../config/db');

exports.getDepartments = async (req, res, next) => {
  try {
    if (getIsConnected()) {
      const sql = `SELECT d.*, COUNT(u.id) as total_users FROM departments d LEFT JOIN users u ON d.id = u.department_id GROUP BY d.id ORDER BY d.id ASC`;
      const departments = await query(sql);
      return res.json({ success: true, departments });
    } else {
      return res.json({ success: true, departments: memoryDb.departments });
    }
  } catch (err) {
    next(err);
  }
};

exports.getDepartmentById = async (req, res, next) => {
  try {
    const { id } = req.params;
    let dept = null;
    if (getIsConnected()) {
      const rows = await query(`SELECT * FROM departments WHERE id = ?`, [id]);
      if (rows.length > 0) dept = rows[0];
    } else {
      dept = memoryDb.departments.find(d => d.id == id);
    }
    res.json({ success: true, department: dept });
  } catch (err) {
    next(err);
  }
};

exports.createDepartment = async (req, res, next) => {
  try {
    const { code, name, description, head_name } = req.body;
    if (!code || !name) {
      return res.status(400).json({ success: false, message: 'Code and Name are required' });
    }

    if (getIsConnected()) {
      const sql = `INSERT INTO departments (code, name, description, head_name) VALUES (?, ?, ?, ?)`;
      const result = await query(sql, [code, name, description || '', head_name || 'Dr. Department Head']);
      return res.json({ success: true, message: 'Department created successfully', id: result.insertId });
    } else {
      const newDept = { id: memoryDb.departments.length + 1, code, name, description, head_name: head_name || 'Head' };
      memoryDb.departments.push(newDept);
      return res.json({ success: true, message: 'Department created successfully', id: newDept.id });
    }
  } catch (err) {
    next(err);
  }
};

exports.updateDepartment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { code, name, description, head_name } = req.body;
    if (getIsConnected()) {
      await query(`UPDATE departments SET code = ?, name = ?, description = ?, head_name = ? WHERE id = ?`, [code, name, description, head_name, id]);
    }
    res.json({ success: true, message: 'Department updated successfully' });
  } catch (err) {
    next(err);
  }
};

exports.deleteDepartment = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (getIsConnected()) {
      await query(`DELETE FROM departments WHERE id = ?`, [id]);
    } else {
      const idx = memoryDb.departments.findIndex(d => d.id == id);
      if (idx !== -1) memoryDb.departments.splice(idx, 1);
    }
    res.json({ success: true, message: 'Department deleted successfully' });
  } catch (err) {
    next(err);
  }
};
