/**
 * Central Configurable Placement Readiness Configuration
 */
module.exports = {
  SCORING_VERSION: 'v1.0',

  // Configurable Weighting System (Must sum to 1.0 / 100%)
  WEIGHTS: {
    resumeScore: 0.10,        // 10%
    jobMatchScore: 0.10,      // 10%
    aptitudeScore: 0.15,      // 15%
    technicalScore: 0.15,     // 15%
    codingScore: 0.20,        // 20%
    interviewScore: 0.20,     // 20%
    communicationScore: 0.10, // 10%
  },

  // Minimum Evidence Requirements for Reliable Assessment
  MINIMUM_REQUIREMENTS: {
    minQuizzes: 2,
    minCodingProblems: 5,
    minInterviews: 1,
  },

  // Target Role Skill Requirements Mapping
  ROLE_SKILL_REQUIREMENTS: {
    'Software Developer': [
      'Java', 'Python', 'C++', 'DSA', 'OOP', 'DBMS', 'SQL', 'OS', 'Computer Networks', 'Git', 'Problem Solving'
    ],
    'Software Engineer': [
      'Java', 'DSA', 'System Design', 'OOP', 'DBMS', 'SQL', 'OS', 'Git', 'REST API'
    ],
    'Full Stack Developer': [
      'HTML', 'CSS', 'JavaScript', 'React', 'Node.js', 'Express', 'REST API', 'MongoDB', 'SQL', 'Git', 'Authentication'
    ],
    'Frontend Developer': [
      'HTML', 'CSS', 'JavaScript', 'TypeScript', 'React', 'Redux', 'Tailwind', 'REST API', 'Git', 'UI/UX'
    ],
    'Backend Developer': [
      'Java', 'Node.js', 'Express', 'Python', 'SQL', 'MongoDB', 'REST API', 'DBMS', 'Git', 'Docker', 'Authentication'
    ],
    'Java Developer': [
      'Java', 'Spring Boot', 'OOP', 'Hibernate', 'SQL', 'DBMS', 'REST API', 'Git', 'DSA'
    ],
    'Python Developer': [
      'Python', 'Django', 'Flask', 'SQL', 'PostgreSQL', 'REST API', 'Git', 'DSA', 'OOP'
    ],
    'AI/ML Engineer': [
      'Python', 'Machine Learning', 'Deep Learning', 'PyTorch', 'TensorFlow', 'SQL', 'NumPy', 'Pandas', 'Mathematics'
    ],
    'Data Analyst': [
      'SQL', 'Python', 'Excel', 'Data Visualization', 'Tableau', 'Power BI', 'Statistics', 'DBMS'
    ],
    'QA/Test Engineer': [
      'Java', 'Python', 'Selenium', 'Automation Testing', 'API Testing', 'SQL', 'Git', 'Jira'
    ],
    'DevOps Engineer': [
      'Linux', 'Docker', 'Kubernetes', 'CI/CD', 'AWS', 'Git', 'Python', 'Shell Scripting', 'Networking'
    ],
  },
};
