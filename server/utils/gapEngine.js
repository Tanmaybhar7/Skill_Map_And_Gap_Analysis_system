/**
 * Skill_Map Gap Analysis Engine
 * Calculates individual and department-level competency gaps
 */

function calculateGap(currentScore, requiredScore = 80) {
  const current = Math.max(0, Math.min(100, Number(currentScore) || 0));
  const required = Math.max(1, Math.min(100, Number(requiredScore) || 80));
  
  const gapScore = Math.max(0, required - current);
  const gapPercentage = Number(((gapScore / required) * 100).toFixed(2));
  
  let priority = 'Low';
  if (gapPercentage >= 50) {
    priority = 'Critical';
  } else if (gapPercentage >= 25) {
    priority = 'Medium';
  }

  return {
    requiredScore: required,
    currentScore: current,
    gapScore: gapScore,
    gapPercentage: gapPercentage,
    priority: priority
  };
}

function calculateOverallScores(skillList = []) {
  if (!skillList.length) {
    return { overallSkillScore: 0, overallGapPercentage: 0, criticalCount: 0, mediumCount: 0, lowCount: 0 };
  }

  let totalCurrent = 0;
  let totalRequired = 0;
  let criticalCount = 0;
  let mediumCount = 0;
  let lowCount = 0;

  skillList.forEach(item => {
    const gapInfo = calculateGap(item.current_score || item.currentScore, item.required_score || item.requiredScore);
    totalCurrent += gapInfo.currentScore;
    totalRequired += gapInfo.requiredScore;

    if (gapInfo.priority === 'Critical') criticalCount++;
    else if (gapInfo.priority === 'Medium') mediumCount++;
    else lowCount++;
  });

  const overallSkillScore = Number(((totalCurrent / totalRequired) * 100).toFixed(2));
  const overallGapPercentage = Number((100 - overallSkillScore).toFixed(2));

  return {
    overallSkillScore: Math.min(100, overallSkillScore),
    overallGapPercentage: Math.max(0, overallGapPercentage),
    criticalCount,
    mediumCount,
    lowCount
  };
}

module.exports = {
  calculateGap,
  calculateOverallScores
};
