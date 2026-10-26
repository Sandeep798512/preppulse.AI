/**
 * Configurable Role-Skill Mapping, Target Benchmark Scores, and Prerequisite Dependencies
 * Used by Phase 9 Skill Gap Engine, Priority Engine, and Roadmap Generator.
 */

const ROLE_SKILL_BENCHMARKS = {
  'Software Developer': {
    requiredSkills: [
      { name: 'JavaScript', targetScore: 75, importance: 'High', category: 'Programming' },
      { name: 'Java', targetScore: 75, importance: 'High', category: 'Programming' },
      { name: 'DSA', targetScore: 80, importance: 'Critical', category: 'Core CS' },
      { name: 'OOP', targetScore: 75, importance: 'High', category: 'Core CS' },
      { name: 'DBMS', targetScore: 70, importance: 'High', category: 'Core CS' },
      { name: 'SQL', targetScore: 70, importance: 'Medium', category: 'Database' },
      { name: 'Git', targetScore: 65, importance: 'Medium', category: 'Tools' },
      { name: 'REST APIs', targetScore: 70, importance: 'High', category: 'Development' },
      { name: 'Problem Solving', targetScore: 80, importance: 'Critical', category: 'Coding' },
      { name: 'Communication', targetScore: 70, importance: 'High', category: 'Behavioral' },
    ],
    recommendedProjects: [
      { title: 'Placement Management Portal', difficulty: 'Intermediate', techStack: ['React', 'Node.js', 'MongoDB'] },
      { title: 'E-Commerce Microservices Backend', difficulty: 'Advanced', techStack: ['Java', 'Spring Boot', 'SQL'] },
      { title: 'Task & Workflow Automation Platform', difficulty: 'Intermediate', techStack: ['JavaScript', 'Express', 'SQL'] },
    ],
  },

  'Full Stack Developer': {
    requiredSkills: [
      { name: 'HTML/CSS', targetScore: 75, importance: 'Medium', category: 'Frontend' },
      { name: 'JavaScript', targetScore: 85, importance: 'Critical', category: 'Frontend' },
      { name: 'React', targetScore: 80, importance: 'High', category: 'Frontend' },
      { name: 'Node.js', targetScore: 80, importance: 'High', category: 'Backend' },
      { name: 'Express', targetScore: 75, importance: 'High', category: 'Backend' },
      { name: 'MongoDB', targetScore: 75, importance: 'High', category: 'Database' },
      { name: 'SQL', targetScore: 70, importance: 'Medium', category: 'Database' },
      { name: 'REST APIs', targetScore: 80, importance: 'High', category: 'Backend' },
      { name: 'Authentication', targetScore: 75, importance: 'High', category: 'Backend' },
      { name: 'DSA', targetScore: 75, importance: 'High', category: 'Core CS' },
      { name: 'Git', targetScore: 70, importance: 'Medium', category: 'Tools' },
      { name: 'Communication', targetScore: 70, importance: 'High', category: 'Behavioral' },
    ],
    recommendedProjects: [
      { title: 'SaaS Career Preparation Platform', difficulty: 'Advanced', techStack: ['React', 'Node.js', 'Express', 'MongoDB'] },
      { title: 'Real-Time Collaborative Code Editor', difficulty: 'Advanced', techStack: ['React', 'WebSocket', 'Node.js'] },
      { title: 'E-Commerce Portal with Payment Gateway', difficulty: 'Intermediate', techStack: ['React', 'Express', 'Stripe'] },
    ],
  },

  'Java Developer': {
    requiredSkills: [
      { name: 'Java', targetScore: 85, importance: 'Critical', category: 'Programming' },
      { name: 'OOP', targetScore: 85, importance: 'Critical', category: 'Core CS' },
      { name: 'Collections', targetScore: 80, importance: 'High', category: 'Java' },
      { name: 'Spring Boot', targetScore: 80, importance: 'High', category: 'Framework' },
      { name: 'REST APIs', targetScore: 75, importance: 'High', category: 'Backend' },
      { name: 'SQL', targetScore: 75, importance: 'High', category: 'Database' },
      { name: 'DBMS', targetScore: 75, importance: 'High', category: 'Core CS' },
      { name: 'DSA', targetScore: 80, importance: 'Critical', category: 'Core CS' },
      { name: 'Git', targetScore: 65, importance: 'Medium', category: 'Tools' },
      { name: 'Unit Testing', targetScore: 70, importance: 'Medium', category: 'Quality' },
    ],
    recommendedProjects: [
      { title: 'Banking & Transaction Management System', difficulty: 'Advanced', techStack: ['Java', 'Spring Boot', 'PostgreSQL'] },
      { title: 'Library & Asset Management API', difficulty: 'Intermediate', techStack: ['Java', 'Hibernate', 'MySQL'] },
    ],
  },

  'Frontend Developer': {
    requiredSkills: [
      { name: 'HTML/CSS', targetScore: 85, importance: 'High', category: 'Frontend' },
      { name: 'JavaScript', targetScore: 85, importance: 'Critical', category: 'Frontend' },
      { name: 'TypeScript', targetScore: 75, importance: 'High', category: 'Frontend' },
      { name: 'React', targetScore: 85, importance: 'Critical', category: 'Frontend' },
      { name: 'Tailwind CSS', targetScore: 75, importance: 'Medium', category: 'Frontend' },
      { name: 'REST APIs', targetScore: 75, importance: 'High', category: 'Integration' },
      { name: 'State Management', targetScore: 75, importance: 'High', category: 'Frontend' },
      { name: 'Git', targetScore: 70, importance: 'Medium', category: 'Tools' },
    ],
    recommendedProjects: [
      { title: 'Interactive Analytics Dashboard', difficulty: 'Intermediate', techStack: ['React', 'Tailwind', 'Recharts'] },
      { title: 'Design System & UI Component Library', difficulty: 'Intermediate', techStack: ['React', 'TypeScript', 'Storybook'] },
    ],
  },

  'Backend Developer': {
    requiredSkills: [
      { name: 'Node.js', targetScore: 85, importance: 'Critical', category: 'Backend' },
      { name: 'Express', targetScore: 80, importance: 'High', category: 'Backend' },
      { name: 'SQL', targetScore: 80, importance: 'Critical', category: 'Database' },
      { name: 'DBMS', targetScore: 80, importance: 'Critical', category: 'Core CS' },
      { name: 'MongoDB', targetScore: 75, importance: 'High', category: 'Database' },
      { name: 'REST APIs', targetScore: 85, importance: 'Critical', category: 'Backend' },
      { name: 'Authentication', targetScore: 80, importance: 'High', category: 'Security' },
      { name: 'DSA', targetScore: 75, importance: 'High', category: 'Core CS' },
      { name: 'Git', targetScore: 70, importance: 'Medium', category: 'Tools' },
    ],
    recommendedProjects: [
      { title: 'Scalable REST API Gateway & Microservices', difficulty: 'Advanced', techStack: ['Node.js', 'Express', 'Redis', 'PostgreSQL'] },
      { title: 'Role-Based Authentication & Authorization Engine', difficulty: 'Intermediate', techStack: ['Node.js', 'JWT', 'MongoDB'] },
    ],
  },

  'AI/ML Engineer': {
    requiredSkills: [
      { name: 'Python', targetScore: 85, importance: 'Critical', category: 'Programming' },
      { name: 'Statistics', targetScore: 75, importance: 'High', category: 'Math' },
      { name: 'Machine Learning', targetScore: 80, importance: 'Critical', category: 'AI' },
      { name: 'Pandas', targetScore: 80, importance: 'High', category: 'Data Science' },
      { name: 'NumPy', targetScore: 75, importance: 'High', category: 'Data Science' },
      { name: 'SQL', targetScore: 70, importance: 'Medium', category: 'Database' },
      { name: 'Deep Learning', targetScore: 75, importance: 'High', category: 'AI' },
      { name: 'LLM/GenAI', targetScore: 75, importance: 'High', category: 'AI' },
      { name: 'DSA', targetScore: 75, importance: 'High', category: 'Core CS' },
      { name: 'Git', targetScore: 70, importance: 'Medium', category: 'Tools' },
    ],
    recommendedProjects: [
      { title: 'AI Placement Preparation & Resume Analyzer', difficulty: 'Advanced', techStack: ['Python', 'LLM', 'FastAPI', 'React'] },
      { title: 'Predictive Student Placement Success Engine', difficulty: 'Intermediate', techStack: ['Python', 'Scikit-Learn', 'Pandas'] },
    ],
  },

  'Data Analyst': {
    requiredSkills: [
      { name: 'SQL', targetScore: 85, importance: 'Critical', category: 'Database' },
      { name: 'Python', targetScore: 75, importance: 'High', category: 'Programming' },
      { name: 'Excel', targetScore: 80, importance: 'High', category: 'Tools' },
      { name: 'Pandas', targetScore: 75, importance: 'High', category: 'Data' },
      { name: 'Statistics', targetScore: 75, importance: 'High', category: 'Math' },
      { name: 'Data Visualization', targetScore: 80, importance: 'High', category: 'Analytics' },
      { name: 'PowerBI/Tableau', targetScore: 70, importance: 'Medium', category: 'Analytics' },
    ],
    recommendedProjects: [
      { title: 'Campus Placement Trends & Compensation Analysis', difficulty: 'Intermediate', techStack: ['Python', 'SQL', 'PowerBI'] },
      { title: 'Customer Churn Prediction & Retention Dashboard', difficulty: 'Intermediate', techStack: ['Python', 'Pandas', 'Seaborn'] },
    ],
  },
};

/**
 * Skill Prerequisites for Dependency-Aware Roadmap Generation
 */
const SKILL_PREREQUISITES = {
  'React': ['JavaScript', 'HTML/CSS'],
  'Node.js': ['JavaScript'],
  'Express': ['Node.js'],
  'REST APIs': ['Express', 'Node.js'],
  'Authentication': ['REST APIs', 'Express'],
  'Spring Boot': ['Java', 'OOP'],
  'Collections': ['Java'],
  'JDBC': ['Java', 'SQL'],
  'Machine Learning': ['Python', 'Statistics'],
  'Pandas': ['Python'],
  'NumPy': ['Python'],
  'Deep Learning': ['Machine Learning', 'NumPy'],
  'LLM/GenAI': ['Python', 'Deep Learning'],
  'Coding Problems': ['DSA', 'OOP'],
  'System Design': ['DBMS', 'REST APIs', 'Node.js'],
  'Mock Interviews': ['DSA', 'OOP', 'Communication'],
};

module.exports = {
  ROLE_SKILL_BENCHMARKS,
  SKILL_PREREQUISITES,
};
