const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');

/**
 * Extract clean text from PDF or DOCX buffer
 */
const extractTextFromBuffer = async (buffer, mimeType, fileName) => {
  let rawText = '';

  const ext = fileName.split('.').pop().toLowerCase();

  if (mimeType === 'application/pdf' || ext === 'pdf') {
    try {
      const data = await pdfParse(buffer);
      rawText = data.text || '';
    } catch (err) {
      throw new Error(`PDF Parsing Failed: ${err.message}. Please upload a readable text-based PDF.`);
    }
  } else if (
    mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    mimeType === 'application/msword' ||
    ext === 'docx' ||
    ext === 'doc'
  ) {
    try {
      const result = await mammoth.extractRawText({ buffer });
      rawText = result.value || '';
    } catch (err) {
      throw new Error(`DOCX Parsing Failed: ${err.message}. Please upload a valid Word document.`);
    }
  } else {
    throw new Error('Unsupported file format. Only PDF and DOCX files are allowed.');
  }

  // Text cleaning & normalization
  let cleanedText = rawText
    .replace(/[\r\n]+/g, '\n') // Normalize line breaks
    .replace(/[\t ]+/g, ' ')   // Collapse horizontal whitespace
    .replace(/[^\x09\x0A\x0D\x20-\x7E]/g, '') // Remove non-printable control chars
    .trim();

  if (!cleanedText || cleanedText.length < 30) {
    throw new Error(
      'Unable to extract readable text from this resume. Please upload a text-based PDF or DOCX file (scanned image PDFs without text layer are not supported).'
    );
  }

  return cleanedText;
};

/**
 * Standard Casing Map for Skills
 */
const skillCasingMap = {
  'java': 'Java',
  'python': 'Python',
  'javascript': 'JavaScript',
  'typescript': 'TypeScript',
  'c++': 'C++',
  'c#': 'C#',
  'php': 'PHP',
  'ruby': 'Ruby',
  'go': 'Go',
  'rust': 'Rust',
  'html': 'HTML',
  'css': 'CSS',
  'react': 'React',
  'react.js': 'React.js',
  'reactjs': 'React.js',
  'node': 'Node.js',
  'node.js': 'Node.js',
  'nodejs': 'Node.js',
  'express': 'Express.js',
  'express.js': 'Express.js',
  'angular': 'Angular',
  'vue': 'Vue.js',
  'vue.js': 'Vue.js',
  'next.js': 'Next.js',
  'redux': 'Redux',
  'tailwind': 'Tailwind CSS',
  'bootstrap': 'Bootstrap',
  'sql': 'SQL',
  'mysql': 'MySQL',
  'postgresql': 'PostgreSQL',
  'mongodb': 'MongoDB',
  'redis': 'Redis',
  'firebase': 'Firebase',
  'oracle': 'Oracle',
  'dsa': 'DSA',
  'data structures': 'Data Structures',
  'algorithms': 'Algorithms',
  'dbms': 'DBMS',
  'operating systems': 'Operating Systems',
  'computer networks': 'Computer Networks',
  'oop': 'OOP',
  'git': 'Git',
  'github': 'GitHub',
  'docker': 'Docker',
  'kubernetes': 'Kubernetes',
  'aws': 'AWS',
  'azure': 'Azure',
  'gcp': 'GCP',
  'linux': 'Linux',
  'rest api': 'REST API',
  'graphql': 'GraphQL',
  'machine learning': 'Machine Learning',
  'deep learning': 'Deep Learning',
  'ai': 'AI',
  'data analysis': 'Data Analysis',
  'pandas': 'Pandas',
  'numpy': 'NumPy',
  'scikit-learn': 'Scikit-Learn',
};

/**
 * Deterministic Basic Resume Parser before AI evaluation
 */
const parseResumeBasic = (text) => {
  const textLower = text.toLowerCase();

  // Contact extraction
  const emailMatch = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/i);
  const phoneMatch = text.match(/(?:(?:\+|00)[\s.-]?\d{1,3}[\s.-]?)?(?:\(\d{2,5}\)|\d{2,5})[\s.-]?\d{3,5}[\s.-]?\d{3,5}/);
  const linkedinMatch = text.match(/(?:https?:\/\/)?(?:www\.)?linkedin\.com\/in\/[a-zA-Z0-9_-]+/i);
  const githubMatch = text.match(/(?:https?:\/\/)?(?:www\.)?github\.com\/[a-zA-Z0-9_-]+/i);
  const portfolioMatch = text.match(/(?:https?:\/\/)?(?:www\.)?[a-zA-Z0-9_-]+\.(?:dev|io|me|app|com)/i);

  // Section Checklist Detection
  const sectionChecklist = {
    contactInfo: Boolean(emailMatch || phoneMatch || linkedinMatch),
    summary: /(summary|objective|profile|about me)/i.test(text),
    education: /(education|academic|qualification|b\.tech|degree|college|university)/i.test(text),
    skills: /(skills|technical skills|technologies|languages|tools)/i.test(text),
    projects: /(projects|key projects|academic projects|personal projects)/i.test(text),
    experience: /(experience|work history|employment|internship|intern)/i.test(text),
    certifications: /(certifications|certificates|courses|licenses)/i.test(text),
  };

  const extractedSkills = [];
  Object.keys(skillCasingMap).forEach((skill) => {
    const escaped = skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(?:^|\\b|\\s)${escaped}(?:$|\\b|\\s)`, 'i');
    if (regex.test(textLower)) {
      const formatted = skillCasingMap[skill];
      if (!extractedSkills.includes(formatted)) {
        extractedSkills.push(formatted);
      }
    }
  });

  return {
    contactInfo: {
      email: emailMatch ? emailMatch[0] : '',
      phone: phoneMatch ? phoneMatch[0] : '',
      linkedin: linkedinMatch ? linkedinMatch[0] : '',
      github: githubMatch ? githubMatch[0] : '',
      portfolio: portfolioMatch ? portfolioMatch[0] : '',
    },
    sectionChecklist,
    extractedSkills,
  };
};

module.exports = {
  extractTextFromBuffer,
  parseResumeBasic,
};
