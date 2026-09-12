const { query, memoryDb, getIsConnected } = require('../config/db');

exports.getAssessments = async (req, res, next) => {
  try {
    if (getIsConnected()) {
      const sql = `SELECT a.*, c.title as course_title, s.name as skill_name FROM assessments a LEFT JOIN courses c ON a.course_id = c.id LEFT JOIN skills s ON a.skill_id = s.id ORDER BY a.id DESC`;
      const assessments = await query(sql);
      return res.json({ success: true, assessments });
    } else {
      return res.json({ success: true, assessments: memoryDb.assessments });
    }
  } catch (err) {
    next(err);
  }
};

exports.createAssessment = async (req, res, next) => {
  try {
    const { title, course_id, skill_id, max_theory_score, max_practical_score, weightage } = req.body;
    if (!title || !skill_id) {
      return res.status(400).json({ success: false, message: 'Assessment Title and Skill are required' });
    }

    if (getIsConnected()) {
      const sql = `INSERT INTO assessments (title, course_id, skill_id, max_theory_score, max_practical_score, weightage, created_by) VALUES (?, ?, ?, ?, ?, ?, ?)`;
      const result = await query(sql, [title, course_id || 1, skill_id, max_theory_score || 50, max_practical_score || 50, weightage || 100, req.user ? req.user.id : 1]);
      return res.json({ success: true, message: 'Assessment created successfully', id: result.insertId });
    } else {
      const newAssessment = { id: memoryDb.assessments.length + 1, title, course_id: course_id || 1, skill_id, max_theory_score: max_theory_score || 50, max_practical_score: max_practical_score || 50, weightage: weightage || 100 };
      memoryDb.assessments.push(newAssessment);
      return res.json({ success: true, message: 'Assessment created successfully', id: newAssessment.id });
    }
  } catch (err) {
    next(err);
  }
};

exports.submitAssessmentResult = async (req, res, next) => {
  try {
    const { assessment_id, user_id, theory_score, practical_score, remarks } = req.body;
    const theory = Number(theory_score) || 0;
    const practical = Number(practical_score) || 0;
    const total = theory + practical;
    const percentage = Number((total).toFixed(2));

    if (getIsConnected()) {
      const sql = `INSERT INTO assessment_results (assessment_id, user_id, theory_score, practical_score, total_score, percentage, remarks, assessed_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
      await query(sql, [assessment_id, user_id, theory, practical, total, percentage, remarks || 'Evaluated', req.user ? req.user.id : 1]);
    }

    res.json({ success: true, message: 'Assessment result submitted successfully', score: total, percentage });
  } catch (err) {
    next(err);
  }
};

exports.getAssessmentResults = async (req, res, next) => {
  try {
    const { user_id } = req.query;
    if (getIsConnected()) {
      let sql = `SELECT ar.*, a.title as assessment_title, u.name as student_name, s.name as skill_name FROM assessment_results ar LEFT JOIN assessments a ON ar.assessment_id = a.id LEFT JOIN users u ON ar.user_id = u.id LEFT JOIN skills s ON a.skill_id = s.id`;
      const params = [];
      if (user_id) {
        sql += ` WHERE ar.user_id = ?`;
        params.push(user_id);
      }
      sql += ` ORDER BY ar.id DESC`;
      const results = await query(sql, params);
      return res.json({ success: true, results });
    } else {
      return res.json({ success: true, results: memoryDb.assessment_results });
    }
  } catch (err) {
    next(err);
  }
};
