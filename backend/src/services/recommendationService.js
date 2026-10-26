const { SKILL_PREREQUISITES } = require('../config/roleSkillMapping');

/**
 * Platform Route Mapper for Internal Feature Deep-Linking
 */
const mapSkillToPlatformRoute = (skillName, taskType) => {
  const s = skillName.toLowerCase();
  if (taskType === 'CODE' || s.includes('dsa') || s.includes('algorithm') || s.includes('array') || s.includes('string')) {
    return { route: '/coding', module: 'coding', title: `Solve ${skillName} Problems` };
  }
  if (taskType === 'QUIZ' || s.includes('java') || s.includes('python') || s.includes('dbms') || s.includes('sql') || s.includes('oop') || s.includes('react') || s.includes('node') || s.includes('aptitude')) {
    return { route: '/technical-mcq', module: 'technical', title: `Take ${skillName} Assessment Quiz` };
  }
  if (taskType === 'INTERVIEW' || s.includes('communication') || s.includes('star') || s.includes('behavioral')) {
    return { route: '/mock-interview', module: 'interview', title: `Practice AI Mock Interview for ${skillName}` };
  }
  if (taskType === 'RESUME' || s.includes('resume')) {
    return { route: '/resume-analyzer', module: 'resume', title: 'Optimize Resume Details' };
  }
  return { route: '/practice', module: 'core', title: `Review ${skillName} Concepts` };
};

/**
 * Determine the single "Next Best Action" deterministically
 */
const getNextBestAction = (skillGaps, readinessScore = 60, dailyHours = 2) => {
  if (!skillGaps || skillGaps.length === 0) {
    return {
      title: 'Complete Placement Readiness Check',
      description: 'Perform a comprehensive assessment to discover your skill gaps.',
      actionRoute: '/placement-readiness',
      module: 'readiness',
      skill: 'General Readiness',
      priority: 'High',
      estimatedMinutes: 30,
      reason: 'No skill gap data detected yet.',
    };
  }

  // Find top priority gap
  const topGap = skillGaps.find((g) => g.priority === 'Critical') || skillGaps.find((g) => g.priority === 'High') || skillGaps[0];
  const skillName = topGap.skill;
  const currentScore = topGap.currentScore;

  let taskType = 'PRACTICE';
  if (topGap.category === 'Coding' || skillName === 'DSA' || currentScore < 45) {
    taskType = 'CODE';
  } else if (topGap.category === 'Behavioral' || topGap.category === 'Interview') {
    taskType = 'INTERVIEW';
  } else if (currentScore < 60) {
    taskType = 'QUIZ';
  }

  const routeInfo = mapSkillToPlatformRoute(skillName, taskType);

  return {
    title: routeInfo.title,
    description: `Your ${skillName} score is currently ${currentScore}/100 (Target: ${topGap.targetScore}). Focus on this top-priority gap for your target role.`,
    actionRoute: routeInfo.route,
    module: routeInfo.module,
    skill: skillName,
    priority: topGap.priority,
    estimatedMinutes: Math.min(60, dailyHours * 30),
    reason: `Your ${skillName} score (${currentScore}/100) is below target benchmark (${topGap.targetScore}/100) for your target role.`,
  };
};

module.exports = {
  mapSkillToPlatformRoute,
  getNextBestAction,
};
