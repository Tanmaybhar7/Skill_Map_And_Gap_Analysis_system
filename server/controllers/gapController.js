const { query, memoryDb, getIsConnected } = require('../config/db');
const { calculateGap, calculateOverallScores } = require('../utils/gapEngine');

exports.getUserGapAnalysis = async (req, res, next) => {
  try {
    const userId = req.params.userId || (req.user ? req.user.id : 3);

    if (getIsConnected()) {
      const sql = `
        SELECT u.id as user_id, u.name as user_name, u.role, d.name as department_name,
               s.id as skill_id, s.name as skill_name, s.category as skill_category,
               COALESCE(us.current_score, 0) as current_score,
               COALESCE(cs.required_score, 80) as required_score
        FROM users u
        LEFT JOIN departments d ON u.department_id = d.id
        CROSS JOIN skills s
        LEFT JOIN user_skills us ON u.id = us.user_id AND s.id = us.skill_id
        LEFT JOIN course_skills cs ON s.id = cs.skill_id
        WHERE u.id = ?
        LIMIT 10
      `;
      const rows = await query(sql, [userId]);

      const gaps = rows.map(r => {
        const gapInfo = calculateGap(r.current_score, r.required_score);
        return {
          skill_id: r.skill_id,
          skill_name: r.skill_name,
          category: r.skill_category,
          required_score: gapInfo.requiredScore,
          current_score: gapInfo.currentScore,
          gap_score: gapInfo.gapScore,
          gap_percentage: gapInfo.gapPercentage,
          priority: gapInfo.priority
        };
      });

      const overall = calculateOverallScores(rows);

      return res.json({
        success: true,
        user_id: userId,
        overallSkillScore: overall.overallSkillScore,
        overallGapPercentage: overall.overallGapPercentage,
        criticalCount: overall.criticalCount,
        mediumCount: overall.mediumCount,
        lowCount: overall.lowCount,
        gaps
      });
    } else {
      const sampleGaps = [
        { skill_name: 'HTML', current_score: 90, required_score: 90, gap_score: 0, gap_percentage: 0, priority: 'Low' },
        { skill_name: 'CSS', current_score: 80, required_score: 90, gap_score: 10, gap_percentage: 11.11, priority: 'Low' },
        { skill_name: 'JavaScript', current_score: 65, required_score: 90, gap_score: 25, gap_percentage: 27.78, priority: 'Medium' },
        { skill_name: 'Bootstrap', current_score: 75, required_score: 80, gap_score: 5, gap_percentage: 6.25, priority: 'Low' },
        { skill_name: 'React', current_score: 40, required_score: 80, gap_score: 40, gap_percentage: 50.00, priority: 'Critical' },
        { skill_name: 'Node.js', current_score: 35, required_score: 80, gap_score: 45, gap_percentage: 56.25, priority: 'Critical' },
        { skill_name: 'Express.js', current_score: 30, required_score: 80, gap_score: 50, gap_percentage: 62.50, priority: 'Critical' },
        { skill_name: 'MySQL', current_score: 60, required_score: 75, gap_score: 15, gap_percentage: 20.00, priority: 'Low' },
        { skill_name: 'Communication', current_score: 70, required_score: 85, gap_score: 15, gap_percentage: 17.65, priority: 'Low' },
        { skill_name: 'Leadership', current_score: 45, required_score: 70, gap_score: 25, gap_percentage: 35.71, priority: 'Medium' }
      ];

      return res.json({
        success: true,
        user_id: userId,
        overallSkillScore: 59.00,
        overallGapPercentage: 41.00,
        criticalCount: 3,
        mediumCount: 2,
        lowCount: 5,
        gaps: sampleGaps
      });
    }
  } catch (err) {
    next(err);
  }
};

exports.getDepartmentGapSummary = async (req, res, next) => {
  try {
    if (getIsConnected()) {
      const sql = `
        SELECT d.id as department_id, d.name as department_name,
               AVG(us.current_score) as avg_current_score,
               80 as target_score,
               GREATEST(0, 80 - AVG(us.current_score)) as avg_gap
        FROM departments d
        JOIN users u ON d.id = u.department_id
        JOIN user_skills us ON u.id = us.user_id
        GROUP BY d.id
      `;
      const depts = await query(sql);
      return res.json({ success: true, departmentGaps: depts });
    } else {
      return res.json({
        success: true,
        departmentGaps: [
          { department_name: 'Computer Science', avg_current_score: 68.5, target_score: 80, avg_gap: 11.5 },
          { department_name: 'Information Technology', avg_current_score: 72.0, target_score: 80, avg_gap: 8.0 },
          { department_name: 'Electronics Engineering', avg_current_score: 64.0, target_score: 80, avg_gap: 16.0 },
          { department_name: 'Mechanical Engineering', avg_current_score: 70.0, target_score: 80, avg_gap: 10.0 },
          { department_name: 'Business Administration', avg_current_score: 78.0, target_score: 80, avg_gap: 2.0 }
        ]
      });
    }
  } catch (err) {
    next(err);
  }
};
