const { normalizeSkill } = require('../../utils/skillDictionary');

/**
 * AI & Heuristic Job Description Extraction Engine
 */
const analyzeJobDescriptionText = async (jdText) => {
  if (!jdText || jdText.trim().length < 30) {
    throw new Error('Please enter a valid job description containing enough text for analysis.');
  }

  const apiKey = process.env.AI_API_KEY;
  let aiResult = null;

  if (apiKey && apiKey !== 'your_openai_or_gemini_api_key_here') {
    try {
      aiResult = await callExternalJDLLM(jdText, apiKey);
    } catch (err) {
      console.warn('⚠️ External LLM call for JD failed. Falling back to Heuristic Extraction Engine:', err.message);
    }
  }

  if (!aiResult) {
    aiResult = generateRuleBasedJDExtraction(jdText);
  }

  // Normalize extracted skills
  const normalizedRequiredSkills = Array.from(
    new Set((aiResult.requiredSkills || []).map(normalizeSkill).filter(Boolean))
  );
  const normalizedPreferredSkills = Array.from(
    new Set((aiResult.preferredSkills || []).map(normalizeSkill).filter(Boolean))
  );
  const normalizedTechnologies = Array.from(
    new Set(
      [...(aiResult.technologies || []), ...normalizedRequiredSkills, ...normalizedPreferredSkills]
        .map(normalizeSkill)
        .filter(Boolean)
    )
  );

  return {
    jobTitle: aiResult.jobTitle || 'Software Engineer',
    company: aiResult.company || 'Target Employer',
    location: aiResult.location || '',
    employmentType: aiResult.employmentType || 'Full-time',
    requiredSkills: normalizedRequiredSkills,
    preferredSkills: normalizedPreferredSkills,
    softSkills: aiResult.softSkills || [],
    technologies: normalizedTechnologies,
    responsibilities: aiResult.responsibilities || [],
    requiredQualifications: aiResult.requiredQualifications || [],
    preferredQualifications: aiResult.preferredQualifications || [],
    experienceRequirement: aiResult.experienceRequirement || '',
    educationRequirements: aiResult.educationRequirements || [],
    keywords: aiResult.keywords || [],
  };
};

/**
 * Call OpenAI for structured JD JSON extraction
 */
async function callExternalJDLLM(text, apiKey) {
  const prompt = `You are a technical HR recruiter. Extract structured information from the following Job Description.

CRITICAL INSTRUCTIONS:
1. Do NOT fabricate any salary, requirements, qualifications, or skills not explicitly present in the text.
2. If information is missing, leave it as an empty string or empty array.
3. Return ONLY a valid, raw JSON object matching this schema:

{
  "jobTitle": "string",
  "company": "string",
  "location": "string",
  "employmentType": "string",
  "requiredSkills": ["string"],
  "preferredSkills": ["string"],
  "softSkills": ["string"],
  "technologies": ["string"],
  "responsibilities": ["string"],
  "requiredQualifications": ["string"],
  "preferredQualifications": ["string"],
  "experienceRequirement": "string",
  "educationRequirements": ["string"],
  "keywords": ["string"]
}

JOB DESCRIPTION TEXT:
"""
${text.slice(0, 4000)}
"""`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 12000);

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
        temperature: 0.1,
      }),
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`OpenAI API status ${response.status}`);
    }

    const data = await response.json();
    const rawContent = data.choices?.[0]?.message?.content || '';
    const cleanJson = rawContent.replace(/```json/gi, '').replace(/```/g, '').trim();
    return JSON.parse(cleanJson);
  } catch (err) {
    clearTimeout(timeoutId);
    throw err;
  }
}

/**
 * Deterministic Heuristic Extraction Engine
 */
function generateRuleBasedJDExtraction(text) {
  const textLower = text.toLowerCase();

  // Extract job title
  let jobTitle = 'Software Developer';
  const titleMatch = text.match(/(?:looking for|hiring|role:?|position:?)\s*([a-zA-Z0-9\s#\+]{3,30}(?:developer|engineer|analyst|architect))/i);
  if (titleMatch) {
    jobTitle = titleMatch[1].trim();
  }

  // Extract skills dictionary
  const knownTech = [
    'Java', 'Spring Boot', 'Python', 'JavaScript', 'TypeScript', 'React', 'Node.js',
    'Express', 'SQL', 'MySQL', 'PostgreSQL', 'MongoDB', 'AWS', 'Docker', 'Git',
    'REST API', 'DSA', 'DBMS', 'C++', 'C#', 'Redux', 'Tailwind', 'Linux'
  ];

  const requiredSkills = [];
  const preferredSkills = [];

  knownTech.forEach((tech) => {
    const regex = new RegExp(`\\b${tech.replace('+', '\\+')}\\b`, 'i');
    if (regex.test(text)) {
      if (/preferred|nice to have|plus|desirable/i.test(text)) {
        preferredSkills.push(tech);
      } else {
        requiredSkills.push(tech);
      }
    }
  });

  // Soft Skills
  const softSkills = [];
  ['communication', 'teamwork', 'problem solving', 'leadership', 'collaboration'].forEach((ss) => {
    if (textLower.includes(ss)) {
      softSkills.push(ss.charAt(0).toUpperCase() + ss.slice(1));
    }
  });

  // Education
  const educationRequirements = [];
  if (/b\.tech|b\.e\.|bachelor/i.test(text)) educationRequirements.push('B.Tech / B.E.');
  if (/m\.tech|master/i.test(text)) educationRequirements.push('M.Tech / M.S.');

  // Responsibilities
  const responsibilities = [];
  const lines = text.split('\n');
  lines.forEach((line) => {
    const l = line.trim();
    if (l.startsWith('•') || l.startsWith('-') || l.startsWith('*') || /^\d+\./.test(l)) {
      if (l.length > 15 && l.length < 150) {
        responsibilities.push(l.replace(/^[•\-\*\d\.]+\s*/, ''));
      }
    }
  });

  return {
    jobTitle,
    company: 'Target Employer',
    location: textLower.includes('remote') ? 'Remote' : '',
    employmentType: 'Full-time',
    requiredSkills: requiredSkills.length ? requiredSkills : ['Java', 'SQL', 'Git'],
    preferredSkills,
    softSkills,
    technologies: Array.from(new Set([...requiredSkills, ...preferredSkills])),
    responsibilities: responsibilities.slice(0, 5),
    requiredQualifications: educationRequirements,
    preferredQualifications: [],
    experienceRequirement: text.match(/\d+\+?\s*years?\s*of?\s*experience/i)?.[0] || '0-2 years',
    educationRequirements,
    keywords: Array.from(new Set([...requiredSkills, ...preferredSkills, ...softSkills])),
  };
}

module.exports = {
  analyzeJobDescriptionText,
};
