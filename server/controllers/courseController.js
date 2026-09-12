const { query, memoryDb, getIsConnected } = require('../config/db');

exports.getCourses = async (req, res, next) => {
  try {
    if (getIsConnected()) {
      const sql = `SELECT c.*, d.name as department_name FROM courses c LEFT JOIN departments d ON c.department_id = d.id ORDER BY c.id ASC`;
      const courses = await query(sql);
      return res.json({ success: true, courses });
    } else {
      return res.json({ success: true, courses: memoryDb.courses });
    }
  } catch (err) {
    next(err);
  }
};

exports.getCourseById = async (req, res, next) => {
  try {
    const { id } = req.params;
    let course = null;
    if (getIsConnected()) {
      const rows = await query(`SELECT c.*, d.name as department_name FROM courses c LEFT JOIN departments d ON c.department_id = d.id WHERE c.id = ?`, [id]);
      if (rows.length > 0) course = rows[0];
    } else {
      course = memoryDb.courses.find(c => c.id == id);
    }
    res.json({ success: true, course });
  } catch (err) {
    next(err);
  }
};

exports.createCourse = async (req, res, next) => {
  try {
    const { course_code, title, department_id, category, duration_hours, level, description } = req.body;
    if (!course_code || !title) {
      return res.status(400).json({ success: false, message: 'Course Code and Title are required' });
    }

    if (getIsConnected()) {
      const sql = `INSERT INTO courses (course_code, title, department_id, category, duration_hours, level, description) VALUES (?, ?, ?, ?, ?, ?, ?)`;
      const result = await query(sql, [course_code, title, department_id || 1, category || 'Technical', duration_hours || 40, level || 'Intermediate', description || '']);
      return res.json({ success: true, message: 'Course created successfully', id: result.insertId });
    } else {
      const newCourse = { id: memoryDb.courses.length + 1, course_code, title, department_id: department_id || 1, category: category || 'Technical', duration_hours: duration_hours || 40, level: level || 'Intermediate', description: description || '' };
      memoryDb.courses.push(newCourse);
      return res.json({ success: true, message: 'Course created successfully', id: newCourse.id });
    }
  } catch (err) {
    next(err);
  }
};

exports.updateCourse = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { course_code, title, department_id, category, duration_hours, level, description } = req.body;
    if (getIsConnected()) {
      const sql = `UPDATE courses SET course_code = ?, title = ?, department_id = ?, category = ?, duration_hours = ?, level = ?, description = ? WHERE id = ?`;
      await query(sql, [course_code, title, department_id, category, duration_hours, level, description, id]);
    }
    res.json({ success: true, message: 'Course updated successfully' });
  } catch (err) {
    next(err);
  }
};

exports.deleteCourse = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (getIsConnected()) {
      await query(`DELETE FROM courses WHERE id = ?`, [id]);
    } else {
      const idx = memoryDb.courses.findIndex(c => c.id == id);
      if (idx !== -1) memoryDb.courses.splice(idx, 1);
    }
    res.json({ success: true, message: 'Course deleted successfully' });
  } catch (err) {
    next(err);
  }
};
