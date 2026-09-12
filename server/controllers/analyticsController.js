const { query, memoryDb, getIsConnected } = require('../config/db');

exports.getDashboardStats = async (req, res, next) => {
  try {
    const stats = {
      totalUsers: 125,
      totalStudents: 82,
      totalEmployees: 43,
      totalDepartments: 10,
      totalCourses: 30,
      totalSkills: 50,
      completedAssessments: 152,
      pendingAssessments: 18,
      avgSkillScore: 68.4,
      avgGapPercentage: 31.6,
      learningProgress: 74.2
    };

    if (getIsConnected()) {
      const uCnt = await query(`SELECT COUNT(*) as cnt FROM users`);
      if (uCnt.length > 0) stats.totalUsers = uCnt[0].cnt;
      
      const stCnt = await query(`SELECT COUNT(*) as cnt FROM users WHERE role = 'Student'`);
      if (stCnt.length > 0) stats.totalStudents = stCnt[0].cnt;

      const empCnt = await query(`SELECT COUNT(*) as cnt FROM users WHERE role != 'Student'`);
      if (empCnt.length > 0) stats.totalEmployees = empCnt[0].cnt;

      const dCnt = await query(`SELECT COUNT(*) as cnt FROM departments`);
      if (dCnt.length > 0) stats.totalDepartments = dCnt[0].cnt;

      const cCnt = await query(`SELECT COUNT(*) as cnt FROM courses`);
      if (cCnt.length > 0) stats.totalCourses = cCnt[0].cnt;

      const sCnt = await query(`SELECT COUNT(*) as cnt FROM skills`);
      if (sCnt.length > 0) stats.totalSkills = sCnt[0].cnt;
    }

    const departmentComparison = {
      labels: ['Computer Science', 'Info Tech', 'Electronics', 'Mechanical', 'Civil', 'Business', 'HR', 'Finance'],
      currentScores: [68.5, 72.0, 64.0, 70.0, 65.5, 78.0, 74.0, 76.5],
      requiredScores: [85.0, 85.0, 80.0, 80.0, 80.0, 80.0, 80.0, 80.0]
    };

    const skillDistribution = {
      labels: ['Frontend', 'Backend', 'Database', 'Cloud & DevOps', 'AI & Data', 'Soft Skills'],
      data: [28, 22, 18, 14, 10, 8]
    };

    const learningProgressTimeline = {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
      progressData: [45, 52, 58, 63, 69, 72, 74.2]
    };

    const futureSkillForecast = [
      { skill: 'Generative AI & LLM Engineering', currentDemand: 'High', projectedGrowth: '+145%', priority: 'Critical' },
      { skill: 'Cloud Native Architecture', currentDemand: 'High', projectedGrowth: '+85%', priority: 'Critical' },
      { skill: 'Cyber Threat Intelligence', currentDemand: 'High', projectedGrowth: '+92%', priority: 'Critical' },
      { skill: 'Quantum Computing Fundamentals', currentDemand: 'Emerging', projectedGrowth: '+120%', priority: 'Medium' },
      { skill: 'Sustainability & Green Tech', currentDemand: 'Moderate', projectedGrowth: '+65%', priority: 'Medium' }
    ];

    res.json({
      success: true,
      stats,
      charts: {
        departmentComparison,
        skillDistribution,
        learningProgressTimeline
      },
      futureSkillForecast
    });

  } catch (err) {
    next(err);
  }
};

exports.getLeaderboard = async (req, res, next) => {
  try {
    const topPerformers = [
      { rank: 1, name: 'Ananya Gupta', department: 'Computer Science', score: 94.5, badge: 'Master Architect', avatar: 'default-avatar.png' },
      { rank: 2, name: 'Rahul Sharma', department: 'Computer Science', score: 90.0, badge: 'Full Stack Ninja', avatar: 'default-avatar.png' },
      { rank: 3, name: 'Aarav Mehta', department: 'Computer Science', score: 88.2, badge: 'AI Scholar', avatar: 'default-avatar.png' },
      { rank: 4, name: 'Sneha Kulkarni', department: 'Information Technology', score: 86.4, badge: 'Security Pro', avatar: 'default-avatar.png' },
      { rank: 5, name: 'Rohan Verma', department: 'Information Technology', score: 84.0, badge: 'Cloud Specialist', avatar: 'default-avatar.png' }
    ];
    res.json({ success: true, leaderboard: topPerformers });
  } catch (err) {
    next(err);
  }
};
