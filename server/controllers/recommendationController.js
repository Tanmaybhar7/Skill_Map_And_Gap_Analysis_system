const { query, memoryDb, getIsConnected } = require('../config/db');
const { generateRecommendations } = require('../utils/recommendationEngine');

exports.getRecommendationsForUser = async (req, res, next) => {
  try {
    const userId = req.params.userId || (req.user ? req.user.id : 3);

    if (getIsConnected()) {
      const recSql = `
        SELECT r.*, s.name as skill_name, c.title as course_title 
        FROM recommendations r 
        LEFT JOIN skills s ON r.skill_id = s.id 
        LEFT JOIN courses c ON r.course_id = c.id 
        WHERE r.user_id = ?
        ORDER BY CASE r.priority WHEN 'Critical' THEN 1 WHEN 'Medium' THEN 2 ELSE 3 END
      `;
      let recommendations = await query(recSql, [userId]);

      if (!recommendations || recommendations.length === 0) {
        // Fallback auto-generation
        const gapsSql = `SELECT us.skill_id, s.name as skill_name, us.current_score, 80 as required_score FROM user_skills us JOIN skills s ON us.skill_id = s.id WHERE us.user_id = ?`;
        const gaps = await query(gapsSql, [userId]);
        const courses = await query(`SELECT * FROM courses`);
        recommendations = generateRecommendations(gaps, courses);
      }

      return res.json({ success: true, recommendations });
    } else {
      return res.json({
        success: true,
        recommendations: [
          { skill_name: 'React', course_title: 'React Bootcamp - Hooks & State', resource_title: 'React 18 & Redux Masterclass', resource_type: 'Course', est_hours: 25, priority: 'Critical', status: 'Assigned', url_or_ref: 'https://react.dev' },
          { skill_name: 'Node.js', course_title: 'Node.js Masterclass & Event Loop', resource_title: 'Asynchronous Node.js & Microservices', resource_type: 'Course', est_hours: 30, priority: 'Critical', status: 'Assigned', url_or_ref: 'https://nodejs.org' },
          { skill_name: 'Express.js', course_title: 'Express API Development', resource_title: 'RESTful Routing & Auth Middleware', resource_type: 'Course', est_hours: 20, priority: 'Critical', status: 'Assigned', url_or_ref: 'https://expressjs.com' },
          { skill_name: 'Leadership', course_title: 'Executive Leadership Fundamentals', resource_title: 'Leadership in Tech & Team Empowerment', resource_type: 'Workshop', est_hours: 15, priority: 'Medium', status: 'Pending', url_or_ref: 'https://coursera.org' },
          { skill_name: 'Communication', course_title: 'Professional Communication', resource_title: 'Corporate Presentation & Pitching', resource_type: 'Book', est_hours: 10, priority: 'Low', status: 'Completed', url_or_ref: 'https://edx.org' }
        ]
      });
    }
  } catch (err) {
    next(err);
  }
};

exports.assignRecommendation = async (req, res, next) => {
  try {
    const { user_id, skill_id, course_id, resource_title, resource_type, est_hours, priority } = req.body;
    if (getIsConnected()) {
      const sql = `INSERT INTO recommendations (user_id, skill_id, course_id, resource_title, resource_type, est_hours, priority, status) VALUES (?, ?, ?, ?, ?, ?, ?, 'Assigned')`;
      await query(sql, [user_id, skill_id, course_id || 1, resource_title || 'Course', resource_type || 'Course', est_hours || 20, priority || 'Medium']);
    }
    res.json({ success: true, message: 'Learning recommendation assigned successfully' });
  } catch (err) {
    next(err);
  }
};
