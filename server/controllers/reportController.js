const { query, memoryDb, getIsConnected } = require('../config/db');

exports.getExecutiveReportData = async (req, res, next) => {
  try {
    const { reportType = 'student', department_id } = req.query;

    let summary = {
      totalUsers: 125,
      totalStudents: 82,
      totalEmployees: 43,
      avgSkillScore: 68.4,
      avgGapPercentage: 31.6,
      criticalGaps: 14,
      completedAssessments: 152
    };

    if (getIsConnected()) {
      const uRes = await query(`SELECT COUNT(*) as cnt FROM users`);
      if (uRes.length > 0) summary.totalUsers = uRes[0].cnt;
    }

    res.json({
      success: true,
      reportType,
      generatedAt: new Date().toISOString(),
      summary,
      details: [
        { name: 'Rahul Sharma', role: 'Student', department: 'Computer Science', skillScore: 59.0, gapPercentage: 41.0, status: 'Action Required' },
        { name: 'Aarav Mehta', role: 'Student', department: 'Computer Science', skillScore: 78.5, gapPercentage: 21.5, status: 'On Track' },
        { name: 'Ananya Gupta', role: 'Student', department: 'Computer Science', skillScore: 84.0, gapPercentage: 16.0, status: 'Exceeding' },
        { name: 'Rohan Verma', role: 'Student', department: 'Information Technology', skillScore: 72.0, gapPercentage: 28.0, status: 'On Track' },
        { name: 'Sneha Kulkarni', role: 'Student', department: 'Information Technology', skillScore: 66.5, gapPercentage: 33.5, status: 'Action Required' }
      ]
    });
  } catch (err) {
    next(err);
  }
};
