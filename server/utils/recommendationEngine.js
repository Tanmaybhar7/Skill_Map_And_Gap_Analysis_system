/**
 * Skill_Map AI Learning Recommendation Engine
 * Analyzes gaps and maps personalized learning paths
 */

const { calculateGap } = require('./gapEngine');

function generateRecommendations(userGaps = [], availableCourses = []) {
  const recommendations = [];

  userGaps.forEach(gap => {
    const calc = calculateGap(gap.current_score, gap.required_score);
    if (calc.gapScore > 0) {
      // Find matching course for this skill
      const matchingCourse = availableCourses.find(c => 
        c.title.toLowerCase().includes((gap.skill_name || '').toLowerCase()) ||
        c.description.toLowerCase().includes((gap.skill_name || '').toLowerCase())
      ) || availableCourses[0];

      recommendations.push({
        skill_id: gap.skill_id,
        skill_name: gap.skill_name || 'Core Skill',
        course_id: matchingCourse ? matchingCourse.id : null,
        course_title: matchingCourse ? matchingCourse.title : 'Skill Upgrade Bootcamp',
        resource_title: `Mastering ${gap.skill_name || 'Competency'}: Practical Deep Dive`,
        resource_type: calc.priority === 'Critical' ? 'Course' : (calc.priority === 'Medium' ? 'Workshop' : 'Book'),
        url_or_ref: matchingCourse ? `https://skillmap.org/courses/${matchingCourse.id}` : '#',
        est_hours: calc.priority === 'Critical' ? 30 : (calc.priority === 'Medium' ? 15 : 8),
        priority: calc.priority,
        gap_percentage: calc.gapPercentage,
        status: 'Pending'
      });
    }
  });

  // Sort recommendations by priority (Critical first)
  const priorityOrder = { 'Critical': 1, 'Medium': 2, 'Low': 3 };
  return recommendations.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
}

module.exports = { generateRecommendations };
