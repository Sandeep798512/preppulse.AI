import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import MainLayout from '../components/layout/MainLayout';
import {
  Trophy,
  Award,
  CheckCircle2,
  XCircle,
  Clock,
  Sparkles,
  ChevronLeft,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Zap,
  HelpCircle,
  BrainCircuit,
  ArrowRight,
} from 'lucide-react';
import { getInterviewResult } from '../services/interviewApi';
import confetti from 'canvas-confetti';

const InterviewResultPage = () => {
  const { sessionId } = useParams();

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Accordion toggle state
  const [expandedQ, setExpandedQ] = useState(0);

  useEffect(() => {
    const fetchResult = async () => {
      setLoading(true);
      try {
        const res = await getInterviewResult(sessionId);
        if (res.success) {
          setResult(res.data);
          if (res.data.overallScore >= 70) {
            confetti({
              particleCount: 120,
              spread: 80,
              origin: { y: 0.6 },
            });
          }
        }
      } catch (err) {
        console.error('Error fetching result:', err);
        setError('Failed to load interview scorecard result.');
      } finally {
        setLoading(false);
      }
    };

    fetchResult();
  }, [sessionId]);

  if (loading) {
    return (
      <MainLayout>
        <div className="py-24 text-center space-y-3">
          <RefreshCw className="w-10 h-10 text-violet-400 animate-spin mx-auto" />
          <p className="text-sm text-slate-400">Computing AI Interview Scorecard & Feedback...</p>
        </div>
      </MainLayout>
    );
  }

  if (error || !result) {
    return (
      <MainLayout>
        <div className="p-6 bg-rose-500/10 border border-rose-500/20 text-rose-300 rounded-2xl text-center space-y-4">
          <p className="text-base font-semibold">{error || 'Result not found'}</p>
          <Link
            to="/mock-interview"
            className="inline-flex items-center space-x-2 px-4 py-2 bg-slate-800 text-slate-200 text-xs font-semibold rounded-xl"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Back to Mock Interviews</span>
          </Link>
        </div>
      </MainLayout>
    );
  }

  const metrics = result.overallMetrics || {};
  const feedback = result.summaryFeedback || {};

  return (
    <MainLayout>
      <div className="space-y-6 max-w-5xl mx-auto">
        {/* Top Header */}
        <div className="flex items-center justify-between bg-slate-850 border border-slate-800 p-6 rounded-2xl">
          <div className="flex items-center space-x-4">
            <Link
              to="/mock-interview"
              className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition"
            >
              <ChevronLeft className="w-5 h-5" />
            </Link>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-2xl font-bold text-white">Interview Performance Scorecard</h1>
                <span className="px-2.5 py-0.5 bg-violet-500/10 text-violet-300 text-xs font-semibold rounded-full border border-violet-500/20 capitalize">
                  {result.interviewType} Mode
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Target Role: <strong className="text-slate-200">{result.targetRole}</strong> • Difficulty:{' '}
                <strong className="text-slate-200">{result.difficulty}</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <Link
              to={`/interview/${sessionId}/analysis`}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl shadow transition flex items-center space-x-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>View Deep AI Report</span>
            </Link>

            <Link
              to="/mock-interview"
              className="px-4 py-2 bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition flex items-center space-x-1"
            >
              <span>Retake Interview</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Scorecard Hero Banner */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Score Box */}
          <div className="bg-gradient-to-br from-violet-950 via-slate-900 to-slate-850 border border-violet-500/30 p-6 rounded-2xl flex flex-col justify-between shadow-2xl relative overflow-hidden">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-violet-400 uppercase tracking-wider flex items-center space-x-1.5">
                  <Trophy className="w-4 h-4" />
                  <span>Overall Score</span>
                </span>
                <span className="px-3 py-1 bg-violet-500/20 text-violet-300 text-xs font-semibold rounded-full border border-violet-500/30">
                  {result.overallScore >= 75 ? 'Placement Ready' : result.overallScore >= 50 ? 'Intermediate' : 'Developing'}
                </span>
              </div>

              <div className="flex items-baseline space-x-3 pt-2">
                <span className="text-6xl font-extrabold text-white">{result.overallScore}</span>
                <span className="text-xl text-slate-400 font-semibold">/ 100</span>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                Evaluated across relevance, technical correctness, explanation completeness, and text-based clarity indicators.
              </p>
            </div>

            <div className="pt-6 border-t border-slate-800/80 mt-6 grid grid-cols-3 gap-2 text-center text-xs">
              <div>
                <p className="text-[10px] text-slate-400">Total Qs</p>
                <p className="font-bold text-white">{result.questionCount}</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400">Answered</p>
                <p className="font-bold text-emerald-400">{metrics.answeredCount || 0}</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400">Skipped</p>
                <p className="font-bold text-amber-400">{metrics.skippedCount || 0}</p>
              </div>
            </div>
          </div>

          {/* Category Scores Gauges */}
          <div className="lg:col-span-2 bg-slate-850 border border-slate-800 p-6 rounded-2xl space-y-5 shadow-xl">
            <h3 className="text-base font-bold text-white flex items-center space-x-2">
              <Award className="w-5 h-5 text-violet-400" />
              <span>Category Evaluation Breakdown</span>
            </h3>

            <div className="space-y-4">
              {/* Technical Correctness */}
              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-indigo-400">Technical Correctness</span>
                  <span className="text-slate-300">{metrics.technicalScore || 0}%</span>
                </div>
                <div className="w-full bg-slate-900 h-2.5 rounded-full overflow-hidden border border-slate-800">
                  <div
                    className="bg-indigo-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${metrics.technicalScore || 0}%` }}
                  />
                </div>
              </div>

              {/* Communication & Clarity */}
              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-emerald-400">Communication & Clarity</span>
                  <span className="text-slate-300">{metrics.communicationScore || 0}%</span>
                </div>
                <div className="w-full bg-slate-900 h-2.5 rounded-full overflow-hidden border border-slate-800">
                  <div
                    className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${metrics.communicationScore || 0}%` }}
                  />
                </div>
              </div>

              {/* Question Relevance */}
              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-cyan-400">Question Relevance</span>
                  <span className="text-slate-300">{metrics.relevanceScore || 0}%</span>
                </div>
                <div className="w-full bg-slate-900 h-2.5 rounded-full overflow-hidden border border-slate-800">
                  <div
                    className="bg-cyan-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${metrics.relevanceScore || 0}%` }}
                  />
                </div>
              </div>

              {/* Answer Completeness */}
              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-amber-400">Answer Completeness</span>
                  <span className="text-slate-300">{metrics.completenessScore || 0}%</span>
                </div>
                <div className="w-full bg-slate-900 h-2.5 rounded-full overflow-hidden border border-slate-800">
                  <div
                    className="bg-amber-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${metrics.completenessScore || 0}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Strengths & Weaknesses Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Strengths */}
          <div className="bg-slate-850 border border-slate-800 p-6 rounded-2xl space-y-4 shadow-xl">
            <h3 className="text-sm font-bold text-emerald-400 uppercase tracking-wider flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>Key Strengths Identified</span>
            </h3>
            <ul className="space-y-2 text-xs text-slate-200">
              {feedback.strengths?.map((str, i) => (
                <li key={i} className="flex items-start space-x-2 bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                  <span className="text-emerald-400 font-bold">•</span>
                  <span className="leading-relaxed">{str}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Weaknesses / Actionable Tips */}
          <div className="bg-slate-850 border border-slate-800 p-6 rounded-2xl space-y-4 shadow-xl">
            <h3 className="text-sm font-bold text-amber-400 uppercase tracking-wider flex items-center space-x-2">
              <BrainCircuit className="w-4 h-4" />
              <span>Areas to Improve & Actionable Tips</span>
            </h3>
            <ul className="space-y-2 text-xs text-slate-200">
              {feedback.actionableTips?.map((tip, i) => (
                <li key={i} className="flex items-start space-x-2 bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Question-by-Question Review Accordion */}
        <div className="bg-slate-850 border border-slate-800 p-6 rounded-2xl space-y-4 shadow-xl">
          <h3 className="text-base font-bold text-white flex items-center space-x-2">
            <HelpCircle className="w-5 h-5 text-violet-400" />
            <span>Question-by-Question Detailed Review</span>
          </h3>

          <div className="space-y-3">
            {result.questionsReview?.map((qItem, index) => (
              <div
                key={index}
                className="bg-slate-900 border border-slate-750 rounded-xl overflow-hidden transition"
              >
                {/* Accordion Header */}
                <button
                  onClick={() => setExpandedQ(expandedQ === index ? null : index)}
                  className="w-full p-4 flex items-center justify-between text-left hover:bg-slate-800/60 transition"
                >
                  <div className="flex items-center space-x-3">
                    <span className="w-7 h-7 rounded-lg bg-slate-800 text-slate-300 text-xs font-bold flex items-center justify-center border border-slate-700">
                      Q{qItem.order}
                    </span>
                    <div>
                      <h4 className="text-sm font-semibold text-slate-100 line-clamp-1">
                        {qItem.questionText}
                      </h4>
                      <div className="flex items-center space-x-2 text-[11px] text-slate-400 mt-0.5">
                        <span className="capitalize">{qItem.category}</span>
                        <span>•</span>
                        <span>{qItem.difficulty}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    {qItem.isSkipped ? (
                      <span className="px-2.5 py-0.5 bg-amber-500/10 text-amber-400 text-xs font-semibold rounded-full border border-amber-500/20">
                        Skipped
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 bg-emerald-500/10 text-emerald-400 text-xs font-bold rounded-full border border-emerald-500/20">
                        {qItem.scores?.overallAnswerScore || 0} pts
                      </span>
                    )}
                    {expandedQ === index ? (
                      <ChevronUp className="w-4 h-4 text-slate-400" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-400" />
                    )}
                  </div>
                </button>

                {/* Accordion Body */}
                {expandedQ === index && (
                  <div className="p-5 border-t border-slate-800 space-y-4 bg-slate-950/60 text-xs text-slate-300">
                    {/* Student Answer */}
                    <div>
                      <span className="text-slate-400 font-semibold block mb-1">Candidate Answer:</span>
                      <p className="bg-slate-900 p-3 rounded-xl border border-slate-800 leading-relaxed font-sans text-slate-200">
                        {qItem.studentAnswer}
                      </p>
                    </div>

                    {/* Scores & Feedback */}
                    {qItem.scores && (
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
                        <div className="p-2 bg-slate-900 rounded-lg">
                          <span className="text-[10px] text-slate-400">Relevance</span>
                          <p className="font-bold text-white">{qItem.scores.relevance}/10</p>
                        </div>
                        <div className="p-2 bg-slate-900 rounded-lg">
                          <span className="text-[10px] text-slate-400">Correctness</span>
                          <p className="font-bold text-emerald-400">{qItem.scores.correctness}/10</p>
                        </div>
                        <div className="p-2 bg-slate-900 rounded-lg">
                          <span className="text-[10px] text-slate-400">Completeness</span>
                          <p className="font-bold text-indigo-400">{qItem.scores.completeness}/10</p>
                        </div>
                        <div className="p-2 bg-slate-900 rounded-lg">
                          <span className="text-[10px] text-slate-400">Clarity</span>
                          <p className="font-bold text-amber-400">{qItem.scores.clarity}/10</p>
                        </div>
                      </div>
                    )}

                    {qItem.feedback?.suggestedBetterAnswer && (
                      <div className="p-3 bg-indigo-950/30 border border-indigo-500/20 rounded-xl space-y-1">
                        <span className="text-indigo-400 font-semibold">Suggested Ideal Answer Concept:</span>
                        <p className="text-slate-300 leading-relaxed">{qItem.feedback.suggestedBetterAnswer}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default InterviewResultPage;
