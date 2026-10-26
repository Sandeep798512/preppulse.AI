const { parseResumeBasic } = require('../../utils/resumeParser');

/**
 * AI & Heuristic Resume Analysis Engine
 */
const analyzeResumeText = async (extractedText, targetRole = 'Software Developer') => {
  const basicParsed = parseResumeBasic(extractedText);
  const apiKey = process.env.AI_API_KEY;

  let aiResult = null;

  if (apiKey && apiKey !== 'your_openai_or_gemini_api_key_here') {
    try {
      aiResult = await callExternalLLM(extractedText, targetRole, apiKey);
    } catch (err) {
      console.warn('⚠️ External LLM call failed or timed out. Falling back to Expert Rule-Based AI Engine:', err.message);
    }
  }

  // If LLM unavailable or not configured, use heuristic evaluation engine
  if (!aiResult) {
    aiResult = generateRuleBasedAnalysis(extractedText, basicParsed, targetRole);
  }

  // Ensure all component scores are numbers bounded [0, 100]
  const structureScore = Math.min(100, Math.max(0, Number(aiResult.structureScore) || 75));
  const contentScore = Math.min(100, Math.max(0, Number(aiResult.contentScore) || 70));
  const skillsScore = Math.min(100, Math.max(0, Number(aiResult.skillsScore) || 80));
  const experienceScore = Math.min(100, Math.max(0, Number(aiResult.experienceScore) || 65));
  const readabilityScore = Math.min(100, Math.max(0, Number(aiResult.readabilityScore) || 85));

  // TRANSPARENT BACKEND WEIGHTED CALCULATIONS
  // Structure: 20%, Content: 25%, Skills: 20%, Experience/Projects: 20%, Readability: 15%
  const overallResumeScore = Math.round(
    structureScore * 0.20 +
    contentScore * 0.25 +
    skillsScore * 0.20 +
    experienceScore * 0.20 +
    readabilityScore * 0.15
  );

  // AI Resume Compatibility Score (ATS-style format & readability)
  const atsCompatibilityScore = Math.round(
    structureScore * 0.30 +
    skillsScore * 0.35 +
    readabilityScore * 0.35
  );

  return {
    parsedBasic: basicParsed,
    scores: {
      resumeScore: overallResumeScore,
      atsCompatibilityScore,
      structureScore,
      contentScore,
      skillsScore,
      experienceScore,
      readabilityScore,
    },
    strengths: aiResult.strengths || [],
    weaknesses: aiResult.weaknesses || [],
    missingSections: aiResult.missingSections || [],
    contentIssues: aiResult.contentIssues || [],
    keywordSuggestions: aiResult.keywordSuggestions || [],
    projectSuggestions: aiResult.projectSuggestions || [],
    skillSuggestions: aiResult.skillSuggestions || [],
    recommendations: aiResult.recommendations || [],
  };
};

/**
 * Call OpenAI API or OpenAI-compatible endpoint
 */
async function callExternalLLM(text, targetRole, apiKey) {
  const prompt = `You are an expert technical recruiter and AI Resume Auditor. Analyze the following resume text for a candidate applying for the target role: "${targetRole}".

CRITICAL INSTRUCTIONS:
1. Do NOT fabricate any experiences, certifications, projects, companies, or metrics.
2. Base all findings ONLY on the provided resume text.
3. Return ONLY a valid, raw JSON object matching this exact schema:

{
  "structureScore": 0-100,
  "contentScore": 0-100,
  "skillsScore": 0-100,
  "experienceScore": 0-100,
  "readabilityScore": 0-100,
  "strengths": ["string"],
  "weaknesses": ["string"],
  "missingSections": ["string"],
  "keywordSuggestions": ["string"],
  "projectSuggestions": ["string"],
  "skillSuggestions": ["string"],
  "contentIssues": [
    { "weakStatement": "exact weak phrasing from text", "suggestion": "improved wording" }
  ],
  "recommendations": [
    { "priority": "HIGH|MEDIUM|LOW", "text": "actionable tip" }
  ]
}

RESUME TEXT:
"""
${text.slice(0, 4000)}
"""`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 12000); // 12 second timeout

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      signal: controller.signal,
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.2,
      }),
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`OpenAI API status ${response.status}`);
    }

    const data = await response.json();
    const rawContent = data.choices?.[0]?.message?.content || '';

    // Sanitize and parse JSON
    const cleanJson = rawContent.replace(/```json/gi, '').replace(/```/g, '').trim();
    return JSON.parse(cleanJson);
  } catch (err) {
    clearTimeout(timeoutId);
    throw err;
  }
}

/**
 * Heuristic Expert Rule-Based Resume Analyzer (Fallback Engine)
 */
function generateRuleBasedAnalysis(text, basicParsed, targetRole) {
  const textLength = text.length;
  const checklist = basicParsed.sectionChecklist;
  const skillsFound = basicParsed.extractedSkills;

  const strengths = [];
  const weaknesses = [];
  const missingSections = [];
  const contentIssues = [];
  const keywordSuggestions = [];
  const recommendations = [];

  // Structure Evaluation
  let structureScore = 100;
  if (!checklist.contactInfo) {
    missingSections.push('Contact Information');
    weaknesses.push('Contact details (email/phone/LinkedIn) are incomplete or missing.');
    structureScore -= 20;
  } else {
    strengths.push('Includes clear contact information and profile links.');
  }

  if (!checklist.education) {
    missingSections.push('Education Section');
    weaknesses.push('Education background is not clearly formatted.');
    structureScore -= 20;
  } else {
    strengths.push('Education background is documented.');
  }

  if (!checklist.skills) {
    missingSections.push('Technical Skills Section');
    weaknesses.push('Dedicated skills section is missing.');
    structureScore -= 25;
  } else {
    strengths.push(`Extracted ${skillsFound.length} relevant technical skills.`);
  }

  if (!checklist.projects) {
    missingSections.push('Projects Section');
    weaknesses.push('No dedicated projects section found.');
    structureScore -= 20;
  } else {
    strengths.push('Includes technical projects detailing hands-on work.');
  }

  if (!checklist.certifications) {
    missingSections.push('Certifications');
  }

  // Skills Score
  let skillsScore = Math.min(100, Math.max(40, skillsFound.length * 10));
  if (skillsFound.length < 4) {
    weaknesses.push('Technical skill coverage is minimal for target role.');
    recommendations.push({
      priority: 'HIGH',
      text: `Add core skills relevant to ${targetRole}, such as Git, SQL, REST APIs, or Data Structures.`,
    });
  }

  // Keyword Suggestions for Target Role
  const roleKeywordsMap = {
    'Software Developer': ['DSA', 'OOP', 'SQL', 'Git', 'REST API', 'Unit Testing'],
    'Full Stack Developer': ['React', 'Node.js', 'Express', 'MongoDB', 'REST API', 'Git'],
    'Frontend Developer': ['JavaScript', 'React', 'HTML5', 'CSS3', 'Tailwind', 'Redux'],
    'Backend Developer': ['Node.js', 'Java', 'Python', 'SQL', 'MongoDB', 'Docker'],
    'Java Developer': ['Java', 'Spring Boot', 'Hibernate', 'Maven', 'SQL', 'OOP'],
    'Python Developer': ['Python', 'Django', 'Flask', 'SQL', 'REST API', 'Pandas'],
    'Data Analyst': ['SQL', 'Python', 'Excel', 'Tableau', 'Power BI', 'Pandas'],
    'AI/ML Engineer': ['Python', 'PyTorch', 'TensorFlow', 'Scikit-Learn', 'Pandas', 'NumPy'],
  };

  const targetKeywords = roleKeywordsMap[targetRole] || roleKeywordsMap['Software Developer'];
  targetKeywords.forEach((kw) => {
    if (!skillsFound.some((s) => s.toLowerCase() === kw.toLowerCase())) {
      keywordSuggestions.push(kw);
    }
  });

  // Content Quality & Weak Statements Identification
  let contentScore = 75;
  const lowerText = text.toLowerCase();

  if (lowerText.includes('worked on') || lowerText.includes('responsible for') || lowerText.includes('made a')) {
    contentIssues.push({
      weakStatement: 'Used passive phrases like "worked on" or "responsible for"',
      suggestion: 'Replace with strong action verbs like "Architected", "Engineered", "Implemented", or "Optimized".',
    });
    contentScore -= 10;
  }

  if (!/\d+%/g.test(text) && !/\d+x/g.test(text) && !/reduced|increased|improved|boosted/i.test(text)) {
    weaknesses.push('Project descriptions lack measurable results or metrics.');
    recommendations.push({
      priority: 'HIGH',
      text: 'Add quantitative metrics to project descriptions (e.g., "Improved page load speed by 35%").',
    });
    contentScore -= 15;
  } else {
    strengths.push('Contains quantifiable metrics and achievements.');
  }

  // Experience / Projects Score
  const experienceScore = checklist.projects || checklist.experience ? 80 : 50;
  const readabilityScore = textLength > 500 && textLength < 4000 ? 85 : 70;

  if (recommendations.length === 0) {
    recommendations.push({
      priority: 'MEDIUM',
      text: 'Ensure technical skills are grouped by category (e.g., Languages, Frameworks, Databases, Tools).',
    });
  }

  return {
    structureScore,
    contentScore,
    skillsScore,
    experienceScore,
    readabilityScore,
    strengths,
    weaknesses,
    missingSections,
    keywordSuggestions,
    projectSuggestions: [
      'Include live project links or GitHub repository URLs.',
      'Explain architecture decisions (e.g., why MongoDB was chosen over SQL).',
    ],
    skillSuggestions: [
      'Group skills logically under headers like Languages, Databases, Tools.',
    ],
    contentIssues: contentIssues.length > 0 ? contentIssues : [
      {
        weakStatement: 'Generic project description',
        suggestion: 'Specify key technical challenges solved and measurable impact achieved.',
      },
    ],
    recommendations,
  };
}

module.exports = {
  analyzeResumeText,
};
