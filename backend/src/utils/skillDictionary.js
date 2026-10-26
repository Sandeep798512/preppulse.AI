/**
 * Skill Normalization & Relationship Dictionary
 */

// Normalization dictionary mapping aliases to canonical tech names
const skillAliases = {
  'js': 'JavaScript',
  'javascript': 'JavaScript',
  'ts': 'TypeScript',
  'typescript': 'TypeScript',
  'react': 'React',
  'react js': 'React',
  'reactjs': 'React',
  'node': 'Node.js',
  'nodejs': 'Node.js',
  'node.js': 'Node.js',
  'node js': 'Node.js',
  'express': 'Express.js',
  'expressjs': 'Express.js',
  'express.js': 'Express.js',
  'express js': 'Express.js',
  'sql': 'SQL',
  'my sql': 'MySQL',
  'mysql': 'MySQL',
  'postgres': 'PostgreSQL',
  'postgresql': 'PostgreSQL',
  'mongo': 'MongoDB',
  'mongodb': 'MongoDB',
  'rest api': 'REST API',
  'restful api': 'REST API',
  'restful apis': 'REST API',
  'rest apis': 'REST API',
  'dsa': 'DSA',
  'data structures': 'DSA',
  'data structures & algorithms': 'DSA',
  'aws': 'AWS',
  'amazon web services': 'AWS',
  'docker': 'Docker',
  'k8s': 'Kubernetes',
  'kubernetes': 'Kubernetes',
  'java': 'Java',
  'python': 'Python',
  'cpp': 'C++',
  'c++': 'C++',
  'cs': 'C#',
  'c#': 'C#',
  'git': 'Git',
  'github': 'GitHub',
  'html': 'HTML',
  'html5': 'HTML',
  'css': 'CSS',
  'css3': 'CSS',
  'oop': 'OOP',
  'dbms': 'DBMS',
  'os': 'Operating Systems',
};

// Skill relationships for partial match evaluation
const skillRelationships = {
  'Java': {
    'OOP': 0.6,
    'Spring Boot': 0.6,
    'Backend Development': 0.5,
  },
  'Spring Boot': {
    'Java': 0.6,
    'REST API': 0.6,
    'Microservices': 0.6,
  },
  'React': {
    'JavaScript': 0.6,
    'Redux': 0.6,
    'HTML': 0.5,
    'CSS': 0.5,
    'Frontend Development': 0.6,
  },
  'Node.js': {
    'JavaScript': 0.6,
    'Express.js': 0.6,
    'REST API': 0.6,
    'Backend Development': 0.6,
  },
  'Express.js': {
    'Node.js': 0.6,
    'REST API': 0.6,
    'JavaScript': 0.5,
  },
  'MongoDB': {
    'NoSQL': 0.6,
    'Database': 0.4,
  },
  'SQL': {
    'MySQL': 0.6,
    'PostgreSQL': 0.6,
    'Database': 0.5,
    'Relational Databases': 0.6,
  },
  'MySQL': {
    'SQL': 0.6,
    'Database': 0.5,
  },
  'PostgreSQL': {
    'SQL': 0.6,
    'Database': 0.5,
  },
  'DSA': {
    'Algorithms': 0.6,
    'Problem Solving': 0.6,
    'C++': 0.3,
    'Java': 0.3,
  },
  'AWS': {
    'Cloud': 0.6,
    'DevOps': 0.5,
  },
  'Docker': {
    'Containerization': 0.6,
    'DevOps': 0.6,
    'Kubernetes': 0.5,
  },
};

/**
 * Normalize skill string to canonical standard name
 */
const normalizeSkill = (skillStr) => {
  if (!skillStr) return '';
  const trimmed = skillStr.trim().toLowerCase();
  if (skillAliases[trimmed]) {
    return skillAliases[trimmed];
  }
  // Uppercase short acronyms (e.g. OOP, AWS, DSA, SQL, PHP)
  if (trimmed.length <= 4) {
    return trimmed.toUpperCase();
  }
  // Capitalize title for multi-word skills
  return skillStr.trim().split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
};

/**
 * Calculate match weight between a target skill and candidate's skill set
 */
const evaluateSkillMatch = (requiredSkill, candidateSkills = []) => {
  const normRequired = normalizeSkill(requiredSkill);
  const normCandidate = candidateSkills.map(normalizeSkill);

  // Exact Match check
  if (normCandidate.includes(normRequired)) {
    return { matchType: 'EXACT', weight: 1.0, matchedWith: normRequired };
  }

  // Related Skill check
  const relations = skillRelationships[normRequired] || {};
  for (const candidateSkill of normCandidate) {
    if (relations[candidateSkill]) {
      return {
        matchType: 'RELATED',
        weight: relations[candidateSkill],
        matchedWith: candidateSkill,
      };
    }
  }

  return { matchType: 'NONE', weight: 0.0, matchedWith: '' };
};

module.exports = {
  normalizeSkill,
  evaluateSkillMatch,
  skillAliases,
  skillRelationships,
};
