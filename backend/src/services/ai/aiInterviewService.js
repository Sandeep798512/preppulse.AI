const { getFallbackQuestion } = require('../../utils/seedInterviewQuestions');

/**
 * AI & Heuristic Interview Question Generation & Answer Evaluation Service
 */

/**
 * Generate Next Interview Question based on context & previous answer
 */
const generateNextQuestion = async (context) => {
  const apiKey = process.env.AI_API_KEY;

  if (apiKey && apiKey !== 'your_openai_or_gemini_api_key_here') {
    try {
      const aiResult = await callLLMQuestionGen(context, apiKey);
      if (aiResult && aiResult.question) {
        // Verify not duplicate
        const isDuplicate = (context.askedQuestions || []).some(
          (q) => q.toLowerCase().trim() === aiResult.question.toLowerCase().trim()
        );

        if (!isDuplicate) {
          return {
            questionId: 'q_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
            questionText: aiResult.question,
            category: aiResult.category || context.interviewType || 'technical',
            topic: aiResult.topic || 'General',
            difficulty: aiResult.difficulty || context.difficulty || 'Medium',
            source: aiResult.source || (context.resumeSummary ? 'RESUME_BASED' : 'AI_GENERATED'),
            expectedConcepts: Array.isArray(aiResult.expectedConcepts) ? aiResult.expectedConcepts : ['core concept', 'clarity'],
            followUpAllowed: aiResult.followUpAllowed !== false,
          };
        }
      }
    } catch (err) {
      console.warn('⚠️ AI LLM Question Generation failed. Using curated seed question fallback:', err.message);
    }
  }

  // Deterministic Fallback Question Generation
  return generateFallbackQuestion(context);
};

/**
 * Analyze Student Answer (Text / Voice Transcript)
 */
const analyzeAnswer = async (questionObj, answerText, timeTaken, context = {}) => {
  const apiKey = process.env.AI_API_KEY;

  if (apiKey && apiKey !== 'your_openai_or_gemini_api_key_here') {
    try {
      const aiResult = await callLLMAnswerEval(questionObj, answerText, timeTaken, apiKey);
      if (aiResult && aiResult.scores) {
        return sanitizeEvalScores(aiResult, questionObj, answerText);
      }
    } catch (err) {
      console.warn('⚠️ AI LLM Answer Analysis failed. Using heuristic fallback evaluation engine:', err.message);
    }
  }

  // Heuristic Rule-Based Fallback Evaluation Engine
  return generateHeuristicAnswerAnalysis(questionObj, answerText, timeTaken);
};

/**
 * Generate Final Session Summary & Recommendations
 */
const generateSessionSummary = async (session, answers) => {
  const answeredList = answers.filter((a) => !a.isSkipped);
  const skippedList = answers.filter((a) => a.isSkipped);

  if (answeredList.length === 0) {
    return {
      overallScore: 0,
      technicalScore: 0,
      communicationScore: 0,
      relevanceScore: 0,
      completenessScore: 0,
      clarityScore: 0,
      strengths: ['Attempted mock interview session'],
      weaknesses: ['All questions were skipped or unanswered'],
      actionableTips: [
        'Practice taking small technical questions first',
        'Review core fundamentals before attempting full mock sessions',
      ],
    };
  }

  let totalRelevance = 0;
  let totalCorrectness = 0;
  let totalCompleteness = 0;
  let totalClarity = 0;
  let totalConfidence = 0;
  let totalOverall = 0;

  const strengthsSet = new Set();
  const weaknessesSet = new Set();

  answeredList.forEach((a) => {
    totalRelevance += a.scores?.relevance || 0;
    totalCorrectness += a.scores?.correctness || 0;
    totalCompleteness += a.scores?.completeness || 0;
    totalClarity += a.scores?.clarity || 0;
    totalConfidence += a.scores?.confidenceIndicator || 0;
    totalOverall += a.scores?.overallAnswerScore || 0;

    if (a.feedback?.keyPositives) {
      a.feedback.keyPositives.forEach((kp) => strengthsSet.add(kp));
    }
    if (a.feedback?.improvementAreas) {
      a.feedback.improvementAreas.forEach((ia) => weaknessesSet.add(ia));
    }
  });

  const count = answeredList.length;
  const avgRelevance = Math.round((totalRelevance / count) * 10);
  const avgCorrectness = Math.round((totalCorrectness / count) * 10);
  const avgCompleteness = Math.round((totalCompleteness / count) * 10);
  const avgClarity = Math.round((totalClarity / count) * 10);
  const avgOverall = Math.round(totalOverall / count);

  // Adjust overall score for skipped questions (slight penalty)
  const finalScore = Math.max(0, Math.round(avgOverall * (count / (count + skippedList.length))));

  const strengths = Array.from(strengthsSet).slice(0, 5);
  const weaknesses = Array.from(weaknessesSet).slice(0, 5);

  if (strengths.length === 0) {
    strengths.push('Good attempt at answering technical questions under timed pressure.');
    strengths.push('Clear attempt at structuring response text.');
  }

  if (weaknesses.length === 0) {
    weaknesses.push('Could provide deeper technical examples in answers.');
    weaknesses.push('Elaborate more on practical trade-offs.');
  }

  const actionableTips = [
    `Focus on improving answer completeness for ${session.interviewType} questions.`,
    'Use the STAR method (Situation, Task, Action, Result) when explaining projects or challenges.',
    'Practice explaining core concepts in 2-3 concise sentences before diving into details.',
  ];

  return {
    overallScore: finalScore,
    technicalScore: avgCorrectness,
    communicationScore: avgClarity,
    relevanceScore: avgRelevance,
    completenessScore: avgCompleteness,
    clarityScore: avgClarity,
    strengths,
    weaknesses,
    actionableTips,
  };
};

// ============================================================================
// LLM IMPLEMENTATION HELPERS
// ============================================================================

async function callLLMQuestionGen(context, apiKey) {
  const prompt = `You are a Senior Technical HR Interviewer conducting a ${context.difficulty} ${context.interviewType.toUpperCase()} mock interview for a ${context.targetRole} position.

CONSTRAINTS & RULES:
1. Do NOT invent projects, companies, or skills that are NOT present in the candidate's resume/data provided.
2. If previous answer exists, you MAY ask a natural follow-up question related to what the candidate said.
3. Return ONLY a valid JSON object adhering strictly to this schema:

{
  "question": "string",
  "category": "${context.interviewType}",
  "topic": "string",
  "difficulty": "${context.difficulty}",
  "source": "AI_GENERATED",
  "expectedConcepts": ["concept1", "concept2"],
  "followUpAllowed": true
}

CANDIDATE CONTEXT:
Target Role: ${context.targetRole}
Difficulty: ${context.difficulty}
Resume Content: ${JSON.stringify(context.resumeSummary || 'Not provided')}
Job Description Content: ${JSON.stringify(context.jdSummary || 'Not provided')}
Previously Asked Questions (DO NOT REPEAT): ${JSON.stringify(context.askedQuestions || [])}
Previous Question & Answer: ${JSON.stringify(context.lastAnswer || 'None')}
`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      signal: controller.signal,
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
      }),
    });

    clearTimeout(timeoutId);

    if (!response.ok) throw new Error(`API Status ${response.status}`);
    const data = await response.json();
    const raw = data.choices?.[0]?.message?.content || '';
    const cleanJson = raw.replace(/```json/gi, '').replace(/```/g, '').trim();
    return JSON.parse(cleanJson);
  } catch (err) {
    clearTimeout(timeoutId);
    throw err;
  }
}

async function callLLMAnswerEval(questionObj, answerText, timeTaken, apiKey) {
  const prompt = `You are an expert AI Interview Evaluator. Evaluate the candidate's answer.

QUESTION:
"${questionObj.questionText}"

EXPECTED CONCEPTS:
${JSON.stringify(questionObj.expectedConcepts || [])}

CANDIDATE ANSWER:
"${answerText}"

TIME TAKEN: ${timeTaken} seconds

INSTRUCTIONS:
Evaluate:
1. relevance (0-10)
2. correctness (0-10)
3. completeness (0-10)
4. clarity (0-10)
5. confidenceIndicator (0-10) [Text-based certainty indicator]

Return ONLY raw valid JSON matching this schema:
{
  "scores": {
    "relevance": 8,
    "correctness": 8,
    "completeness": 7,
    "clarity": 8,
    "confidenceIndicator": 8,
    "overallAnswerScore": 78
  },
  "starMethodAnalysis": {
    "situation": true,
    "task": true,
    "action": true,
    "result": false,
    "feedback": "string"
  },
  "feedback": {
    "keyPositives": ["string"],
    "improvementAreas": ["string"],
    "suggestedBetterAnswer": "string"
  },
  "suggestedFollowUp": "string"
}`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      signal: controller.signal,
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.2,
      }),
    });

    clearTimeout(timeoutId);

    if (!response.ok) throw new Error(`API Status ${response.status}`);
    const data = await response.json();
    const raw = data.choices?.[0]?.message?.content || '';
    const cleanJson = raw.replace(/```json/gi, '').replace(/```/g, '').trim();
    return JSON.parse(cleanJson);
  } catch (err) {
    clearTimeout(timeoutId);
    throw err;
  }
}

// ============================================================================
// HEURISTIC DETERMINISTIC FALLBACK ENGINE
// ============================================================================

function generateFallbackQuestion(context) {
  const askedTexts = context.askedQuestions || [];

  // Check if we can create a resume-specific question
  if (context.interviewType === 'project' && context.resumeSummary?.projects?.length > 0) {
    const proj = context.resumeSummary.projects[0];
    const projQuestion = `You mentioned in your resume that you built "${proj.title || 'a major project'}". Explain the architecture and your key technical contributions.`;
    if (!askedTexts.includes(projQuestion)) {
      return {
        questionId: 'q_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
        questionText: projQuestion,
        category: 'project',
        topic: 'Architecture',
        difficulty: context.difficulty || 'Medium',
        source: 'RESUME_BASED',
        expectedConcepts: ['system design', 'tech stack choice', 'personal role', 'challenges'],
        followUpAllowed: true,
      };
    }
  }

  // Check if JD missing skill question can be asked
  if (context.jdSummary?.missingSkills?.length > 0) {
    const missingSkill = context.jdSummary.missingSkills[0];
    const jdQuestion = `The job description requires experience in ${missingSkill}. Have you worked with ${missingSkill} or how would you quickly pick it up?`;
    if (!askedTexts.includes(jdQuestion)) {
      return {
        questionId: 'q_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
        questionText: jdQuestion,
        category: 'technical',
        topic: missingSkill,
        difficulty: context.difficulty || 'Medium',
        source: 'JD_BASED',
        expectedConcepts: ['learning approach', 'transferable skills', 'hands-on practice'],
        followUpAllowed: true,
      };
    }
  }

  // Fallback to seed bank
  const seedQ = getFallbackQuestion(context.interviewType, context.difficulty, askedTexts);
  return {
    questionId: 'q_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
    questionText: seedQ.question,
    category: seedQ.category,
    topic: seedQ.topic,
    difficulty: seedQ.difficulty,
    source: 'QUESTION_BANK',
    expectedConcepts: seedQ.expectedConcepts,
    followUpAllowed: true,
  };
}

function generateHeuristicAnswerAnalysis(questionObj, answerText, timeTaken) {
  const cleanAns = (answerText || '').trim();
  const wordCount = cleanAns.split(/\s+/).filter(Boolean).length;

  if (wordCount < 5) {
    return {
      scores: {
        relevance: 3,
        correctness: 3,
        completeness: 2,
        clarity: 4,
        confidenceIndicator: 2,
        overallAnswerScore: 28,
      },
      starMethodAnalysis: {
        situation: false,
        task: false,
        action: false,
        result: false,
        feedback: 'Answer is too brief to evaluate STAR structure.',
      },
      feedback: {
        keyPositives: ['Submitted a response'],
        improvementAreas: ['Elaborate further to cover expected technical concepts.'],
        suggestedBetterAnswer: 'Provide a structured explanation with examples or code logic.',
      },
    };
  }

  // Keyword match score against expected concepts
  const expected = questionObj.expectedConcepts || [];
  let matchCount = 0;
  expected.forEach((concept) => {
    if (cleanAns.toLowerCase().includes(concept.toLowerCase())) {
      matchCount++;
    }
  });

  const conceptCoverage = expected.length > 0 ? matchCount / expected.length : 0.6;

  const relevance = Math.min(10, Math.max(4, Math.round(5 + conceptCoverage * 5)));
  const correctness = Math.min(10, Math.max(4, Math.round(4 + conceptCoverage * 6)));
  const completeness = Math.min(10, Math.max(3, Math.round(wordCount > 30 ? 7 : 4)));
  const clarity = Math.min(10, Math.max(5, Math.round(cleanAns.includes('.') ? 8 : 5)));
  const confidenceIndicator = Math.min(10, Math.max(4, Math.round(cleanAns.includes('I am confident') || cleanAns.includes('built') ? 8 : 6)));

  const overallAnswerScore = Math.round(
    (relevance * 0.3 + correctness * 0.35 + completeness * 0.2 + clarity * 0.15) * 10
  );

  return {
    scores: {
      relevance,
      correctness,
      completeness,
      clarity,
      confidenceIndicator,
      overallAnswerScore,
    },
    starMethodAnalysis: {
      situation: cleanAns.toLowerCase().includes('when') || cleanAns.toLowerCase().includes('project'),
      task: cleanAns.toLowerCase().includes('task') || cleanAns.toLowerCase().includes('goal'),
      action: cleanAns.toLowerCase().includes('built') || cleanAns.toLowerCase().includes('used'),
      result: cleanAns.toLowerCase().includes('result') || cleanAns.toLowerCase().includes('outcome'),
      feedback: 'Good structured response.',
    },
    feedback: {
      keyPositives: ['Addressed the main question', 'Demonstrated understanding of core concepts'],
      improvementAreas: expected.length > 0 ? [`Try to mention concepts like ${expected.slice(0, 2).join(', ')}`] : ['Add practical code examples'],
      suggestedBetterAnswer: `A strong answer should highlight ${expected.join(', ') || 'key architectural choices and real-world examples'}.`,
    },
  };
}

function sanitizeEvalScores(aiResult, questionObj, answerText) {
  const scores = aiResult.scores || {};
  const relevance = Math.min(10, Math.max(0, scores.relevance || 7));
  const correctness = Math.min(10, Math.max(0, scores.correctness || 7));
  const completeness = Math.min(10, Math.max(0, scores.completeness || 7));
  const clarity = Math.min(10, Math.max(0, scores.clarity || 7));
  const confidenceIndicator = Math.min(10, Math.max(0, scores.confidenceIndicator || 7));

  const overallAnswerScore = Math.round(
    (relevance * 0.3 + correctness * 0.35 + completeness * 0.2 + clarity * 0.15) * 10
  );

  return {
    scores: {
      relevance,
      correctness,
      completeness,
      clarity,
      confidenceIndicator,
      overallAnswerScore,
    },
    starMethodAnalysis: aiResult.starMethodAnalysis || {
      situation: true,
      task: true,
      action: true,
      result: false,
      feedback: 'Good response structure',
    },
    feedback: aiResult.feedback || {
      keyPositives: ['Answered clearly'],
      improvementAreas: ['Provide more detail'],
      suggestedBetterAnswer: 'Elaborate on real-world application.',
    },
    suggestedFollowUp: aiResult.suggestedFollowUp || '',
  };
}

module.exports = {
  generateNextQuestion,
  analyzeAnswer,
  generateSessionSummary,
};
