const InterviewSession = require('../../models/InterviewSession');
const InterviewAnswer = require('../../models/InterviewAnswer');
const InterviewAnalysis = require('../../models/InterviewAnalysis');

/**
 * Scoring Configuration Constants
 */
const QUESTION_WEIGHTS = {
  relevance: 0.15,
  correctness: 0.25,
  completeness: 0.15,
  clarity: 0.15,
  structure: 0.10,
  technicalKnowledge: 0.15,
  communication: 0.05,
};

const OVERALL_WEIGHTS = {
  technicalScore: 0.30,
  correctnessScore: 0.20,
  communicationScore: 0.15,
  completenessScore: 0.10,
  relevanceScore: 0.10,
  structureScore: 0.05,
  questionHandlingScore: 0.05,
  consistencyScore: 0.05,
};

const FILLER_KEYWORDS = [
  'um', 'uh', 'like', 'actually', 'basically', 'you know',
  'i mean', 'maybe', 'i think', 'probably', 'not sure', 'sort of', 'kind of'
];

/**
 * Main Analysis Entry Point: Performs deep analysis on a completed session
 */
const performDeepInterviewAnalysis = async (session, user, userResume = null, userJD = null) => {
  const answers = await InterviewAnswer.find({ sessionId: session._id }).sort({ createdAt: 1 });

  // 1. Analyze individual questions
  const questionAnalyses = [];
  let totalTime = 0;
  let totalFillers = 0;
  const fillerMarkersSet = new Set();
  const coveredConceptsSet = new Set();
  const missingConceptsSet = new Set();
  const technicalInaccuracies = [];

  const topicScoresMap = new Map(); // topic -> { sum: 0, count: 0 }

  answers.forEach((ans, idx) => {
    totalTime += ans.timeTaken || 0;
    const qText = ans.questionText || '';
    const aText = ans.answerText || '';
    const isSkipped = ans.isSkipped || false;

    // Detect fillers in text
    const textLower = aText.toLowerCase();
    FILLER_KEYWORDS.forEach((kw) => {
      const regex = new RegExp(`\\b${kw}\\b`, 'gi');
      const matches = textLower.match(regex);
      if (matches) {
        totalFillers += matches.length;
        fillerMarkersSet.add(kw);
      }
    });

    // Determine expected concepts from session question
    const sessQuestion = session.questions.find((q) => q.questionId === ans.questionId) || {};
    const expected = sessQuestion.expectedConcepts || [];

    const covered = [];
    const missing = [];

    expected.forEach((concept) => {
      if (textLower.includes(concept.toLowerCase())) {
        covered.push(concept);
        coveredConceptsSet.add(concept);
      } else {
        missing.push(concept);
        missingConceptsSet.add(concept);
      }
    });

    // Check technical inaccuracy patterns
    if (textLower.includes('mongodb is a relational database') || textLower.includes('mongodb is relational')) {
      technicalInaccuracies.push({
        questionOrder: idx + 1,
        issue: 'Claimed MongoDB is a relational database.',
        correction: 'MongoDB is a document-based NoSQL database.',
      });
    }
    if (textLower.includes('html is a programming language')) {
      technicalInaccuracies.push({
        questionOrder: idx + 1,
        issue: 'Claimed HTML is a programming language.',
        correction: 'HTML is a Markup Language used for web page structure.',
      });
    }

    // Question-level scores (0-10)
    const rawScores = ans.scores || {};
    const relevance = Math.min(10, Math.max(0, isSkipped ? 0 : rawScores.relevance || 6));
    const correctness = Math.min(10, Math.max(0, isSkipped ? 0 : rawScores.correctness || 6));
    const completeness = Math.min(10, Math.max(0, isSkipped ? 0 : rawScores.completeness || 5));
    const clarity = Math.min(10, Math.max(0, isSkipped ? 0 : rawScores.clarity || 7));
    const structure = Math.min(10, Math.max(0, isSkipped ? 0 : ans.starMethodAnalysis?.situation ? 8 : 6));
    const technicalKnowledge = Math.min(10, Math.max(0, isSkipped ? 0 : rawScores.correctness || 6));
    const communication = Math.min(10, Math.max(0, isSkipped ? 0 : rawScores.clarity || 7));

    // Deterministic question score (0-100)
    const questionScore = isSkipped
      ? 0
      : Math.round(
          (relevance * QUESTION_WEIGHTS.relevance +
            correctness * QUESTION_WEIGHTS.correctness +
            completeness * QUESTION_WEIGHTS.completeness +
            clarity * QUESTION_WEIGHTS.clarity +
            structure * QUESTION_WEIGHTS.structure +
            technicalKnowledge * QUESTION_WEIGHTS.technicalKnowledge +
            communication * QUESTION_WEIGHTS.communication) * 10
        );

    const topicName = sessQuestion.topic || sessQuestion.category || 'General';
    if (!topicScoresMap.has(topicName)) {
      topicScoresMap.set(topicName, { sum: 0, count: 0 });
    }
    const tData = topicScoresMap.get(topicName);
    tData.sum += questionScore;
    tData.count += 1;

    questionAnalyses.push({
      questionOrder: idx + 1,
      questionText: qText,
      category: sessQuestion.category || 'technical',
      topic: topicName,
      difficulty: sessQuestion.difficulty || 'Medium',
      studentAnswer: aText,
      isSkipped,
      scores: {
        relevance,
        correctness,
        completeness,
        clarity,
        structure,
        technicalKnowledge,
        communication,
        overall: questionScore,
      },
      coveredConcepts: covered,
      missingConcepts: missing,
      feedback: ans.feedback?.suggestedBetterAnswer || ans.feedback?.improvementAreas?.[0] || 'Good effort.',
      star: ans.starMethodAnalysis,
    });
  });

  // 2. Aggregate Overall Metrics (0-100 scale)
  const answeredAnswers = answers.filter((a) => !a.isSkipped);
  const totalCount = session.questionCount || 10;
  const answeredCount = answeredAnswers.length;

  const avgMetric = (key) =>
    answeredCount > 0
      ? Math.round(
          (answeredAnswers.reduce((sum, a) => sum + (a.scores?.[key] || 6), 0) / answeredCount) * 10
        )
      : 0;

  const technicalScore = avgMetric('correctness');
  const correctnessScore = avgMetric('correctness');
  const communicationScore = avgMetric('clarity');
  const completenessScore = avgMetric('completeness');
  const relevanceScore = avgMetric('relevance');
  const structureScore = Math.round(
    answeredCount > 0
      ? (answeredAnswers.reduce((sum, a) => sum + (a.starMethodAnalysis?.situation ? 8 : 6), 0) / answeredCount) * 10
      : 0
  );

  const questionHandlingScore = Math.round((answeredCount / totalCount) * 100);
  const consistencyScore = Math.min(100, Math.max(50, 100 - (totalCount - answeredCount) * 10));

  // Deterministic Overall Score (0-100)
  const rawOverall = Math.round(
    technicalScore * OVERALL_WEIGHTS.technicalScore +
      correctnessScore * OVERALL_WEIGHTS.correctnessScore +
      communicationScore * OVERALL_WEIGHTS.communicationScore +
      completenessScore * OVERALL_WEIGHTS.completenessScore +
      relevanceScore * OVERALL_WEIGHTS.relevanceScore +
      structureScore * OVERALL_WEIGHTS.structureScore +
      questionHandlingScore * OVERALL_WEIGHTS.questionHandlingScore +
      consistencyScore * OVERALL_WEIGHTS.consistencyScore
  );

  const overallScore = Math.min(100, Math.max(0, rawOverall));

  // 3. Score Interpretation
  let scoreInterpretation = 'Good';
  if (overallScore >= 90) scoreInterpretation = 'Excellent';
  else if (overallScore >= 80) scoreInterpretation = 'Strong';
  else if (overallScore >= 70) scoreInterpretation = 'Good';
  else if (overallScore >= 60) scoreInterpretation = 'Needs Improvement';
  else if (overallScore >= 40) scoreInterpretation = 'Weak';
  else scoreInterpretation = 'Critical Improvement Needed';

  // 4. STAR Analysis
  const starSituations = answeredAnswers.filter((a) => a.starMethodAnalysis?.situation).length;
  const starTasks = answeredAnswers.filter((a) => a.starMethodAnalysis?.task).length;
  const starActions = answeredAnswers.filter((a) => a.starMethodAnalysis?.action).length;
  const starResults = answeredAnswers.filter((a) => a.starMethodAnalysis?.result).length;

  const situationScore = answeredCount > 0 ? Math.round((starSituations / answeredCount) * 10) : 0;
  const taskScore = answeredCount > 0 ? Math.round((starTasks / answeredCount) * 10) : 0;
  const actionScore = answeredCount > 0 ? Math.round((starActions / answeredCount) * 10) : 0;
  const resultScore = answeredCount > 0 ? Math.round((starResults / answeredCount) * 10) : 0;
  const overallStarScore = Math.round((situationScore + taskScore + actionScore + resultScore) / 4);

  // 5. Topic Performance Breakdown
  const topicPerformance = [];
  const strongTopics = [];
  const weakTopics = [];

  topicScoresMap.forEach((val, topic) => {
    const avgScore = Math.round(val.sum / val.count);
    let status = 'Good';
    if (avgScore >= 85) status = 'Strong';
    else if (avgScore >= 70) status = 'Good';
    else if (avgScore >= 55) status = 'Needs Improvement';
    else status = 'Weak';

    topicPerformance.push({
      topic,
      score: avgScore,
      status,
      questionCount: val.count,
    });

    if (avgScore >= 80) strongTopics.push(topic);
    if (avgScore < 65) weakTopics.push(topic);
  });

  // 6. Resume Consistency Checks
  const resumeAlerts = [];
  if (userResume && userResume.skills) {
    userResume.skills.forEach((sk) => {
      const foundInAns = answers.some((a) => a.answerText.toLowerCase().includes(sk.toLowerCase()));
      // If student says "never used [sk]"
      const claimsNoExp = answers.some((a) =>
        a.answerText.toLowerCase().includes(`never used ${sk.toLowerCase()}`)
      );
      if (claimsNoExp) {
        resumeAlerts.push({
          skillOrProject: sk,
          issue: `Answer states no experience in ${sk}, but ${sk} is listed in your active resume.`,
        });
      }
    });
  }

  // 7. JD Skill Alignment
  let strongestJdSkill = '';
  let weakestJdSkill = '';
  const jdSkillScoresMap = new Map();

  if (userJD && userJD.requiredSkills) {
    userJD.requiredSkills.forEach((sk) => {
      const matchingQ = questionAnalyses.filter((qa) =>
        qa.topic.toLowerCase().includes(sk.toLowerCase()) || qa.questionText.toLowerCase().includes(sk.toLowerCase())
      );
      if (matchingQ.length > 0) {
        const avg = Math.round(matchingQ.reduce((s, q) => s + q.scores.overall, 0) / matchingQ.length);
        jdSkillScoresMap.set(sk, avg);
      }
    });

    let minS = 100;
    let maxS = -1;
    jdSkillScoresMap.forEach((score, sk) => {
      if (score > maxS) {
        maxS = score;
        strongestJdSkill = sk;
      }
      if (score < minS) {
        minS = score;
        weakestJdSkill = sk;
      }
    });
  }

  // 8. Historical Comparison with Previous Session
  const previousAnalysis = await InterviewAnalysis.findOne({
    userId: user._id,
    sessionId: { $ne: session._id },
    analysisStatus: 'completed',
  }).sort({ createdAt: -1 });

  let comparisonWithPrevious = {
    previousSessionId: null,
    previousScore: 0,
    currentScore: overallScore,
    improvementDelta: 0,
    trendStatus: 'First Session',
  };

  const repeatedWeaknessesSet = new Set();

  if (previousAnalysis) {
    const delta = overallScore - previousAnalysis.overallScore;
    let trend = 'Stable';
    if (delta > 2) trend = 'Improving';
    else if (delta < -2) trend = 'Declining';

    comparisonWithPrevious = {
      previousSessionId: previousAnalysis.sessionId,
      previousScore: previousAnalysis.overallScore,
      currentScore: overallScore,
      improvementDelta: delta,
      trendStatus: trend,
    };

    // Detect repeated weaknesses
    if (previousAnalysis.weakTopics) {
      previousAnalysis.weakTopics.forEach((wt) => {
        if (weakTopics.includes(wt)) {
          repeatedWeaknessesSet.add(wt);
        }
      });
    }
  }

  // 9. Strengths & Weaknesses Summary
  const strengths = [];
  const weaknesses = [];

  if (technicalScore >= 75) strengths.push('Strong technical subject matter knowledge.');
  if (communicationScore >= 75) strengths.push('Clear and structured explanation capability.');
  if (strongTopics.length > 0) strengths.push(`Consistent performance in ${strongTopics.join(', ')}.`);

  if (technicalScore < 70) weaknesses.push('Technical answer accuracy needs deeper concept coverage.');
  if (completenessScore < 65) weaknesses.push('Answers were abbreviated and missed key concepts.');
  if (weakTopics.length > 0) weaknesses.push(`Struggled with questions on ${weakTopics.join(', ')}.`);
  if (repeatedWeaknessesSet.size > 0) weaknesses.push(`Repeated weak performance in ${Array.from(repeatedWeaknessesSet).join(', ')}.`);

  if (strengths.length === 0) strengths.push('Good attempt under timed interview conditions.');
  if (weaknesses.length === 0) weaknesses.push('Minor refactoring needed in practical project examples.');

  // 10. Actionable Priority Improvement Plan
  const improvementPlan = [];
  if (weakTopics.length > 0) {
    improvementPlan.push({
      priority: 1,
      area: `Revise ${weakTopics[0]} Fundamentals`,
      action: `Take topic-wise practice quizzes and review documentation on ${weakTopics[0]}.`,
      timeline: 'Today',
    });
  }
  if (completenessScore < 75) {
    improvementPlan.push({
      priority: 2,
      area: 'Elaborate Key Concepts',
      action: 'Practice structuring answers to include definition, real-world example, and trade-offs.',
      timeline: 'Tomorrow',
    });
  }
  improvementPlan.push({
    priority: 3,
    area: 'Behavioral STAR Structuring',
    action: 'Prepare 5 STAR method responses (Situation, Task, Action, Result) for project viva questions.',
    timeline: 'This Week',
  });

  // Calculate concept coverage score
  const totalConcepts = coveredConceptsSet.size + missingConceptsSet.size;
  const conceptCoverageScore = totalConcepts > 0 ? Math.round((coveredConceptsSet.size / totalConcepts) * 100) : 70;

  const totalAnswerTimeSec = totalTime;
  const avgAnswerTime = answeredCount > 0 ? Math.round(totalAnswerTimeSec / answeredCount) : 0;

  return {
    sessionId: session._id,
    userId: user._id,
    overallScore,
    scoreInterpretation,
    metricsBreakdown: {
      technicalScore,
      correctnessScore,
      communicationScore,
      completenessScore,
      relevanceScore,
      structureScore,
      questionHandlingScore,
      consistencyScore,
    },
    starAnalysis: {
      overallStarScore,
      situationScore,
      taskScore,
      actionScore,
      resultScore,
      feedback: resultScore < 6 ? 'Focus on adding measurable results to your project explanations.' : 'Strong STAR structure.',
    },
    communicationAnalysis: {
      clarityScore: communicationScore,
      fillerWordCount: totalFillers,
      fillerMarkers: Array.from(fillerMarkersSet),
      repetitionScore: Math.min(10, Math.max(4, 10 - Math.floor(totalFillers / 2))),
      textConfidenceIndicator: Math.min(10, Math.max(3, 9 - Math.floor(totalFillers / 3))),
      averageAnswerTimeSec: avgAnswerTime,
      feedback: totalFillers > 5 ? 'Try reducing hesitation markers like "basically" or "maybe".' : 'Direct and structured wording.',
    },
    technicalEvaluation: {
      conceptCoverageScore,
      coveredConcepts: Array.from(coveredConceptsSet),
      missingConcepts: Array.from(missingConceptsSet),
      technicalInaccuracies,
    },
    resumeConsistency: {
      consistencyScore: resumeAlerts.length > 0 ? 70 : 100,
      alerts: resumeAlerts,
    },
    jdAlignment: {
      strongestJdSkill,
      weakestJdSkill,
      jdSkillScores: Object.fromEntries(jdSkillScoresMap),
    },
    topicPerformance,
    strongTopics,
    weakTopics,
    repeatedWeaknesses: Array.from(repeatedWeaknessesSet),
    comparisonWithPrevious,
    strengths,
    weaknesses,
    questionAnalyses,
    improvementPlan,
    analysisStatus: 'completed',
    analyzedAt: new Date(),
  };
};

/**
 * Helper for Phase 8 Placement Readiness Integration
 */
const calculateInterviewPerformance = async (userId) => {
  const analyses = await InterviewAnalysis.find({ userId, analysisStatus: 'completed' }).sort({ createdAt: -1 });

  if (analyses.length === 0) {
    return {
      totalInterviews: 0,
      averageScore: 0,
      latestScore: 0,
      highestScore: 0,
      technicalPerformance: 0,
      communicationPerformance: 0,
      consistency: 0,
      improvementTrend: 'No Sessions',
    };
  }

  const totalInterviews = analyses.length;
  const latestScore = analyses[0].overallScore;
  const highestScore = Math.max(...analyses.map((a) => a.overallScore));
  const avgScore = Math.round(analyses.reduce((sum, a) => sum + a.overallScore, 0) / totalInterviews);
  const techAvg = Math.round(analyses.reduce((sum, a) => sum + (a.metricsBreakdown?.technicalScore || 0), 0) / totalInterviews);
  const commAvg = Math.round(analyses.reduce((sum, a) => sum + (a.metricsBreakdown?.communicationScore || 0), 0) / totalInterviews);

  let trend = 'Stable';
  if (analyses.length >= 2) {
    const diff = analyses[0].overallScore - analyses[analyses.length - 1].overallScore;
    if (diff > 3) trend = 'Improving';
    else if (diff < -3) trend = 'Declining';
  }

  return {
    totalInterviews,
    averageScore: avgScore,
    latestScore,
    highestScore,
    technicalPerformance: techAvg,
    communicationPerformance: commAvg,
    consistency: Math.min(100, Math.max(50, 100 - (100 - avgScore) * 0.5)),
    improvementTrend: trend,
  };
};

module.exports = {
  performDeepInterviewAnalysis,
  calculateInterviewPerformance,
};
