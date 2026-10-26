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
  TrendingUp,
  AlertTriangle,
  FileText,
  Target,
  BarChart3,
  Layers,
  Activity,
  RotateCcw,
} from 'lucide-react';
import { getSessionAnalysis, reanalyzeSession } from '../services/interviewApi';
import confetti from 'canvas-confetti';

const InterviewAnalysisReportPage = () => {
  const { sessionId } = useParams();

  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reanalyzing, setReanalyzing] = useState(false);
  const [error, setError] = useState('');

  const [activeTab, setActiveTab] = useState('overview');
  const [expandedQ, setExpandedQ] = useState(0);

  const fetchAnalysis = async () => {
    setLoading(true);
    try {
      const res = await getSessionAnalysis(sessionId);
      if (res.success) {
        setAnalysis(res.data);
        if (res.data.overallScore >= 75) {
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 },
          });
        }
      }
    } catch (err) {
      console.error('Error loading deep interview analysis:', err);
      setError('Failed to generate deep interview analysis report.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalysis();
  }, [sessionId]);

  const handleReanalyze = async () => {
    setReanalyzing(true);
    try {
      const res = await reanalyzeSession(sessionId);
      if (res.success) {
        setAnalysis(res.data);
      }
    } catch (err) {
      alert('Re-analysis failed.');
    } finally {
      setReanalyzing(false);
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="py-24 text-center space-y-3">
          <RefreshCw className="w-10 h-10 text-violet-400 animate-spin mx-auto" />
          <p className="text-sm text-slate-400">Performing Deep AI Interview Analysis...</p>
        </div>
      </MainLayout>
    );
  }

  if (error || !analysis) {
    return (
      <MainLayout>
        <div className="p-6 bg-rose-500/10 border border-rose-500/20 text-rose-300 rounded-2xl text-center space-y-4">
          <p className="text-base font-semibold">{error || 'Analysis report not found'}</p>
          <Link
            to={`/interview/${sessionId}/result`}
            className="inline-flex items-center space-x-2 px-4 py-2 bg-slate-800 text-slate-200 text-xs font-semibold rounded-xl"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Back to Scorecard</span>
          </Link>
        </div>
      </MainLayout>
    );
  }

  const metrics = analysis.metricsBreakdown || {};
  const comm = analysis.communicationAnalysis || {};
  const techEval = analysis.technicalEvaluation || {};
  const star = analysis.starAnalysis || {};
  const comp = analysis.comparisonWithPrevious || {};

  return (
    <MainLayout>
      <div className="space-y-6 max-w-5xl mx-auto">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-slate-850 border border-slate-800 p-6 rounded-2xl gap-4 shadow-xl">
          <div className="flex items-center space-x-4">
            <Link
              to={`/interview/${sessionId}/result`}
              className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition"
            >
              <ChevronLeft className="w-5 h-5" />
            </Link>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-2xl font-bold text-white">AI Deep Interview Analysis Report</h1>
                <span className="px-2.5 py-0.5 bg-violet-500/10 text-violet-300 text-xs font-semibold rounded-full border border-violet-500/20">
                  Phase 7 Engine
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Analyzed at: {new Date(analysis.analyzedAt || analysis.createdAt).toLocaleString()}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={handleReanalyze}
              disabled={reanalyzing}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-semibold rounded-xl border border-slate-700 flex items-center space-x-2 transition disabled:opacity-50"
            >
              <RotateCcw className={`w-3.5 h-3.5 ${reanalyzing ? 'animate-spin text-violet-400' : ''}`} />
              <span>{reanalyzing ? 'Re-analyzing...' : 'Re-analyze Report'}</span>
            </button>
          </div>
        </div>

        {/* Hero Score Box & Interpretation */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Score Box */}
          <div className="bg-gradient-to-br from-violet-950 via-slate-900 to-slate-850 border border-violet-500/30 p-6 rounded-2xl flex flex-col justify-between shadow-2xl relative overflow-hidden">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-violet-400 uppercase tracking-wider flex items-center space-x-1.5">
                  <Trophy className="w-4 h-4" />
                  <span>Interview Readiness Score</span>
                </span>
                <span className="px-3 py-1 bg-violet-500/20 text-violet-300 text-xs font-semibold rounded-full border border-violet-500/30">
                  {analysis.scoreInterpretation}
                </span>
              </div>

              <div className="flex items-baseline space-x-3 pt-2">
                <span className="text-6xl font-extrabold text-white">{analysis.overallScore}</span>
                <span className="text-xl text-slate-400 font-semibold">/ 100</span>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                Deterministic weighted composite of technical knowledge, answer correctness, communication clarity, completeness, and question handling.
              </p>
            </div>

            {/* Historical Improvement Indicator */}
            {comp.previousScore > 0 && (
              <div className="pt-4 border-t border-slate-800/80 mt-4 flex items-center justify-between text-xs">
                <span className="text-slate-400">Vs Previous Attempt:</span>
                <span
                  className={`font-bold ${
                    comp.improvementDelta >= 0 ? 'text-emerald-400' : 'text-rose-400'
                  }`}
                >
                  {comp.improvementDelta >= 0 ? `+${comp.improvementDelta}` : comp.improvementDelta} pts ({comp.trendStatus})
                </span>
              </div>
            )}
          </div>

          {/* Metric Breakdown Gauges */}
          <div className="lg:col-span-2 bg-slate-850 border border-slate-800 p-6 rounded-2xl space-y-4 shadow-xl">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center space-x-2">
              <Activity className="w-4 h-4 text-violet-400" />
              <span>Multi-Dimensional Performance Gauges</span>
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl space-y-1">
                <span className="text-[10px] text-slate-400 font-medium">Technical Knowledge (30%)</span>
                <p className="text-xl font-bold text-indigo-400">{metrics.technicalScore}%</p>
              </div>

              <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl space-y-1">
                <span className="text-[10px] text-slate-400 font-medium">Answer Correctness (20%)</span>
                <p className="text-xl font-bold text-emerald-400">{metrics.correctnessScore}%</p>
              </div>

              <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl space-y-1">
                <span className="text-[10px] text-slate-400 font-medium">Communication (15%)</span>
                <p className="text-xl font-bold text-cyan-400">{metrics.communicationScore}%</p>
              </div>

              <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl space-y-1">
                <span className="text-[10px] text-slate-400 font-medium">Completeness (10%)</span>
                <p className="text-xl font-bold text-amber-400">{metrics.completenessScore}%</p>
              </div>

              <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl space-y-1">
                <span className="text-[10px] text-slate-400 font-medium">Relevance (10%)</span>
                <p className="text-xl font-bold text-violet-400">{metrics.relevanceScore}%</p>
              </div>

              <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl space-y-1">
                <span className="text-[10px] text-slate-400 font-medium">Answer Structure (5%)</span>
                <p className="text-xl font-bold text-slate-200">{metrics.structureScore}%</p>
              </div>

              <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl space-y-1">
                <span className="text-[10px] text-slate-400 font-medium">Question Handling (5%)</span>
                <p className="text-xl font-bold text-emerald-400">{metrics.questionHandlingScore}%</p>
              </div>

              <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl space-y-1">
                <span className="text-[10px] text-slate-400 font-medium">Consistency (5%)</span>
                <p className="text-xl font-bold text-indigo-400">{metrics.consistencyScore}%</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabbed Navigation Bar */}
        <div className="flex items-center bg-slate-850 border border-slate-800 p-1.5 rounded-2xl overflow-x-auto">
          {[
            { id: 'overview', label: 'Executive Overview & Plan', icon: Sparkles },
            { id: 'technical', label: 'Technical & Concepts', icon: Code },
            { id: 'communication', label: 'Communication & Hesitations', icon: Activity },
            { id: 'star', label: 'STAR Behavioral', icon: Layers },
            { id: 'alignment', label: 'Resume & JD Alignment', icon: Target },
            { id: 'questions', label: 'Question-by-Question', icon: FileText },
          ].map((tab) => {
            const Icon = tab.icon;
            const isSelected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center space-x-2 transition whitespace-nowrap ${
                  isSelected
                    ? 'bg-violet-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* TAB 1: EXECUTIVE OVERVIEW & PLAN */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Strengths */}
              <div className="bg-slate-850 border border-slate-800 p-6 rounded-2xl space-y-4 shadow-xl">
                <h3 className="text-sm font-bold text-emerald-400 uppercase tracking-wider flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Key Strengths</span>
                </h3>
                <ul className="space-y-2 text-xs text-slate-200">
                  {analysis.strengths?.map((str, i) => (
                    <li key={i} className="flex items-start space-x-2 bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                      <span className="text-emerald-400 font-bold">•</span>
                      <span className="leading-relaxed">{str}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Weaknesses */}
              <div className="bg-slate-850 border border-slate-800 p-6 rounded-2xl space-y-4 shadow-xl">
                <h3 className="text-sm font-bold text-rose-400 uppercase tracking-wider flex items-center space-x-2">
                  <XCircle className="w-4 h-4" />
                  <span>Areas Needing Attention</span>
                </h3>
                <ul className="space-y-2 text-xs text-slate-200">
                  {analysis.weaknesses?.map((w, i) => (
                    <li key={i} className="flex items-start space-x-2 bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                      <span className="text-rose-400 font-bold">•</span>
                      <span className="leading-relaxed">{w}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Priority Improvement Plan */}
            <div className="bg-slate-850 border border-slate-800 p-6 rounded-2xl space-y-4 shadow-xl">
              <h3 className="text-base font-bold text-white flex items-center space-x-2">
                <BrainCircuit className="w-5 h-5 text-violet-400" />
                <span>Priority Actionable Improvement Plan</span>
              </h3>

              <div className="space-y-3">
                {analysis.improvementPlan?.map((plan, i) => (
                  <div key={i} className="bg-slate-900 p-4 rounded-xl border border-slate-800 flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="px-2 py-0.5 bg-violet-500/20 text-violet-300 text-[10px] font-bold rounded">
                          Priority #{plan.priority}
                        </span>
                        <h4 className="text-sm font-bold text-white">{plan.area}</h4>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed">{plan.action}</p>
                    </div>
                    <span className="px-3 py-1 bg-slate-800 text-slate-300 text-xs font-semibold rounded-lg shrink-0">
                      {plan.timeline}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: TECHNICAL & CONCEPTS */}
        {activeTab === 'technical' && (
          <div className="space-y-6">
            <div className="bg-slate-850 border border-slate-800 p-6 rounded-2xl space-y-6 shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div>
                  <h3 className="text-base font-bold text-white">Concept Coverage Analysis</h3>
                  <p className="text-xs text-slate-400 mt-0.5">Determined by comparing answer contents against technical concepts expected for your target role.</p>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-extrabold text-indigo-400">{techEval.conceptCoverageScore}%</span>
                  <p className="text-[10px] text-slate-400">Coverage Score</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-3">Covered Concepts ({techEval.coveredConcepts?.length || 0})</h4>
                  <div className="flex flex-wrap gap-2">
                    {techEval.coveredConcepts?.map((c, i) => (
                      <span key={i} className="px-3 py-1 bg-emerald-500/10 text-emerald-300 text-xs rounded-lg border border-emerald-500/20 font-medium">
                        ✓ {c}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-3">Missing Concepts ({techEval.missingConcepts?.length || 0})</h4>
                  <div className="flex flex-wrap gap-2">
                    {techEval.missingConcepts?.map((c, i) => (
                      <span key={i} className="px-3 py-1 bg-amber-500/10 text-amber-300 text-xs rounded-lg border border-amber-500/20 font-medium">
                        ✗ {c}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Technical Inaccuracies */}
              {techEval.technicalInaccuracies?.length > 0 && (
                <div className="space-y-3 pt-4 border-t border-slate-800">
                  <h4 className="text-xs font-bold text-rose-400 uppercase tracking-wider flex items-center space-x-1.5">
                    <AlertTriangle className="w-4 h-4" />
                    <span>Technical Inaccuracies Detected</span>
                  </h4>

                  {techEval.technicalInaccuracies.map((inc, i) => (
                    <div key={i} className="p-4 bg-rose-950/30 border border-rose-500/20 rounded-xl space-y-1 text-xs">
                      <p className="text-rose-300 font-semibold">Q#{inc.questionOrder}: {inc.issue}</p>
                      <p className="text-slate-300"><strong className="text-emerald-400">Correction: </strong>{inc.correction}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: COMMUNICATION & HESITATIONS */}
        {activeTab === 'communication' && (
          <div className="space-y-6">
            <div className="bg-slate-850 border border-slate-800 p-6 rounded-2xl space-y-6 shadow-xl">
              <h3 className="text-base font-bold text-white">Text-Based Communication Indicators</h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-1">
                  <span className="text-xs text-slate-400">Text Confidence Indicator</span>
                  <p className="text-2xl font-bold text-emerald-400">{comm.textConfidenceIndicator} / 10</p>
                </div>
                <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-1">
                  <span className="text-xs text-slate-400">Hesitation / Filler Markers</span>
                  <p className="text-2xl font-bold text-amber-400">{comm.fillerWordCount || 0}</p>
                </div>
                <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-1">
                  <span className="text-xs text-slate-400">Avg Answer Time</span>
                  <p className="text-2xl font-bold text-indigo-400">{comm.averageAnswerTimeSec} sec</p>
                </div>
              </div>

              {comm.fillerMarkers?.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-semibold text-slate-400">Detected Hesitation Words:</h4>
                  <div className="flex flex-wrap gap-2">
                    {comm.fillerMarkers.map((kw, i) => (
                      <span key={i} className="px-2.5 py-1 bg-amber-500/10 text-amber-300 text-xs font-mono rounded-md border border-amber-500/20">
                        "{kw}"
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <p className="text-xs text-slate-300 bg-slate-900 p-4 rounded-xl border border-slate-800 leading-relaxed">
                {comm.feedback}
              </p>
            </div>
          </div>
        )}

        {/* TAB 4: STAR BEHAVIORAL */}
        {activeTab === 'star' && (
          <div className="space-y-6">
            <div className="bg-slate-850 border border-slate-800 p-6 rounded-2xl space-y-6 shadow-xl">
              <h3 className="text-base font-bold text-white">STAR Method Behavioral Framework Evaluation</h3>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-1">
                  <span className="text-xs text-slate-400 font-semibold">Situation (S)</span>
                  <p className="text-2xl font-bold text-indigo-400">{star.situationScore} / 10</p>
                </div>
                <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-1">
                  <span className="text-xs text-slate-400 font-semibold">Task (T)</span>
                  <p className="text-2xl font-bold text-cyan-400">{star.taskScore} / 10</p>
                </div>
                <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-1">
                  <span className="text-xs text-slate-400 font-semibold">Action (A)</span>
                  <p className="text-2xl font-bold text-emerald-400">{star.actionScore} / 10</p>
                </div>
                <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-1">
                  <span className="text-xs text-slate-400 font-semibold">Result (R)</span>
                  <p className="text-2xl font-bold text-amber-400">{star.resultScore} / 10</p>
                </div>
              </div>

              <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-300 leading-relaxed">
                <strong className="text-violet-400">STAR Feedback: </strong>
                {star.feedback || 'Incorporate concrete metrics and outcomes into the Result section of behavioral answers.'}
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: ALIGNMENT */}
        {activeTab === 'alignment' && (
          <div className="space-y-6">
            <div className="bg-slate-850 border border-slate-800 p-6 rounded-2xl space-y-6 shadow-xl">
              <h3 className="text-base font-bold text-white">Resume & Job Description Alignment</h3>

              {analysis.resumeConsistency?.alerts?.length > 0 ? (
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider">Resume Consistency Alerts</h4>
                  {analysis.resumeConsistency.alerts.map((al, i) => (
                    <div key={i} className="p-4 bg-amber-950/30 border border-amber-500/20 rounded-xl text-xs text-amber-200">
                      <strong>{al.skillOrProject}: </strong> {al.issue}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 bg-emerald-950/30 border border-emerald-500/20 rounded-xl text-xs text-emerald-200 flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Interview responses aligned consistently with your uploaded resume content.</span>
                </div>
              )}

              {analysis.jdAlignment?.strongestJdSkill && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-1">
                    <span className="text-emerald-400 font-semibold">Strongest JD Required Skill:</span>
                    <p className="text-base font-bold text-white">{analysis.jdAlignment.strongestJdSkill}</p>
                  </div>
                  <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-1">
                    <span className="text-amber-400 font-semibold">Weakest JD Required Skill:</span>
                    <p className="text-base font-bold text-white">{analysis.jdAlignment.weakestJdSkill}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 6: QUESTION-BY-QUESTION */}
        {activeTab === 'questions' && (
          <div className="bg-slate-850 border border-slate-800 p-6 rounded-2xl space-y-4 shadow-xl">
            <h3 className="text-base font-bold text-white">Granular Question-by-Question Deep Analysis</h3>

            <div className="space-y-3">
              {analysis.questionAnalyses?.map((q, idx) => (
                <div key={idx} className="bg-slate-900 border border-slate-750 rounded-xl overflow-hidden">
                  <button
                    onClick={() => setExpandedQ(expandedQ === idx ? null : idx)}
                    className="w-full p-4 flex items-center justify-between text-left hover:bg-slate-800/60 transition"
                  >
                    <div className="flex items-center space-x-3">
                      <span className="w-7 h-7 rounded-lg bg-slate-800 text-slate-300 text-xs font-bold flex items-center justify-center border border-slate-700">
                        Q{q.questionOrder}
                      </span>
                      <div>
                        <h4 className="text-sm font-semibold text-slate-100 line-clamp-1">{q.questionText}</h4>
                        <span className="text-[11px] text-slate-400">{q.topic} • {q.difficulty}</span>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-emerald-400">{q.scores?.overall || 0} pts</span>
                  </button>

                  {expandedQ === idx && (
                    <div className="p-5 border-t border-slate-800 space-y-3 text-xs text-slate-300 bg-slate-950/60">
                      <div>
                        <span className="text-slate-400 font-semibold block mb-1">Your Answer:</span>
                        <p className="bg-slate-900 p-3 rounded-xl border border-slate-800 text-slate-200">{q.studentAnswer}</p>
                      </div>

                      <div className="p-3 bg-violet-950/30 border border-violet-500/20 rounded-xl space-y-1">
                        <span className="text-violet-300 font-semibold">AI Feedback:</span>
                        <p className="text-slate-300">{q.feedback}</p>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default InterviewAnalysisReportPage;
