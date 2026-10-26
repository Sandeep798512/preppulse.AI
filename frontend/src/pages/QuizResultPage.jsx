import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import MainLayout from '../components/layout/MainLayout';
import API from '../services/api';
import {
  Award,
  CheckCircle2,
  XCircle,
  Clock,
  HelpCircle,
  TrendingUp,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  BookOpen,
  Check,
  X,
  Loader2,
} from 'lucide-react';

const QuizResultPage = () => {
  const { quizId } = useParams();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reviewFilter, setReviewFilter] = useState('all'); // 'all' | 'correct' | 'incorrect' | 'skipped'

  useEffect(() => {
    fetchResult();
  }, [quizId]);

  const fetchResult = async () => {
    try {
      const { data } = await API.get(`/quizzes/${quizId}/result`);
      if (data.success) {
        setResult(data.result);
      }
    } catch (err) {
      console.error('Failed to fetch result:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="min-h-[60vh] flex items-center justify-center text-white text-sm">
          <div className="flex items-center space-x-2">
            <Loader2 className="w-5 h-5 text-brand-500 animate-spin" />
            <span>Calculating Final Score & Evaluating Answers...</span>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (!result) {
    return (
      <MainLayout>
        <div className="bg-slate-850 border border-slate-800 p-8 rounded-2xl text-center space-y-4">
          <AlertTriangle className="w-10 h-10 text-amber-400 mx-auto" />
          <h2 className="text-lg font-bold text-white">Result Not Available</h2>
          <p className="text-xs text-slate-400">Could not retrieve the result review for this quiz attempt.</p>
          <Link to="/practice" className="px-4 py-2 bg-brand-600 text-white rounded-xl text-xs font-semibold inline-block">
            Back to Practice Center
          </Link>
        </div>
      </MainLayout>
    );
  }

  const {
    score = 0,
    totalQuestions = 10,
    percentage = 0,
    accuracy = 0,
    correctCount = 0,
    incorrectCount = 0,
    skippedCount = 0,
    timeTakenSeconds = 0,
    topicPerformance = [],
    questions = [],
  } = result;

  const filteredQuestions = questions.filter((q) => {
    if (reviewFilter === 'correct') return q.isCorrect;
    if (reviewFilter === 'incorrect') return q.isAnswered && !q.isCorrect;
    if (reviewFilter === 'skipped') return !q.isAnswered;
    return true;
  });

  const getTopicStatusBadge = (status) => {
    switch (status) {
      case 'Strong':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      case 'Good':
        return 'bg-brand-500/10 text-brand-400 border-brand-500/30';
      case 'Needs Improvement':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      case 'Weak':
      default:
        return 'bg-rose-500/10 text-rose-400 border-rose-500/30';
    }
  };

  return (
    <MainLayout>
      <div className="space-y-8">
        {/* Top Summary Banner */}
        <div className="bg-gradient-to-br from-slate-850 via-slate-900 to-slate-950 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
            <div className="space-y-2">
              <div className="inline-flex items-center space-x-2 bg-brand-500/10 text-brand-400 border border-brand-500/20 px-3 py-1 rounded-full text-xs font-semibold">
                <Award className="w-3.5 h-3.5" />
                <span>Quiz Evaluation Summary</span>
              </div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-white">Quiz Attempt Results</h1>
              <p className="text-xs text-slate-400">
                Authoritative evaluation with score, accuracy, topic breakdown, and full step-by-step question review.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 bg-slate-900/90 border border-slate-700/80 p-4 rounded-2xl">
              <div className="text-center pr-4 border-r border-slate-800">
                <div className="text-xs text-slate-400 font-medium">Final Score</div>
                <div className="text-3xl font-black text-brand-400 tracking-tight">{score}<span className="text-xs font-bold text-slate-500">/{totalQuestions}</span></div>
                <div className="text-[10px] text-emerald-400 font-semibold">{percentage}% Score</div>
              </div>

              <div className="text-center px-3 border-r border-slate-800">
                <div className="text-xs text-slate-400 font-medium">Accuracy</div>
                <div className="text-2xl font-bold text-emerald-400">{accuracy}%</div>
                <div className="text-[10px] text-slate-400">Answer Precision</div>
              </div>

              <div className="text-center pl-2">
                <div className="text-xs text-slate-400 font-medium">Time Taken</div>
                <div className="text-xl font-bold text-amber-400">
                  {Math.floor(timeTakenSeconds / 60)}m {timeTakenSeconds % 60}s
                </div>
                <div className="text-[10px] text-slate-400">Total Duration</div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-slate-850 border border-slate-800 rounded-2xl p-4 flex items-center space-x-3">
            <div className="p-2.5 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-slate-400 font-medium">Correct</div>
              <div className="text-xl font-bold text-white">{correctCount}</div>
            </div>
          </div>

          <div className="bg-slate-850 border border-slate-800 rounded-2xl p-4 flex items-center space-x-3">
            <div className="p-2.5 bg-rose-500/10 text-rose-400 rounded-xl border border-rose-500/20">
              <XCircle className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-slate-400 font-medium">Incorrect</div>
              <div className="text-xl font-bold text-white">{incorrectCount}</div>
            </div>
          </div>

          <div className="bg-slate-850 border border-slate-800 rounded-2xl p-4 flex items-center space-x-3">
            <div className="p-2.5 bg-amber-500/10 text-amber-400 rounded-xl border border-amber-500/20">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-slate-400 font-medium">Skipped</div>
              <div className="text-xl font-bold text-white">{skippedCount}</div>
            </div>
          </div>

          <div className="bg-slate-850 border border-slate-800 rounded-2xl p-4 flex items-center space-x-3">
            <div className="p-2.5 bg-brand-500/10 text-brand-400 rounded-xl border border-brand-500/20">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-slate-400 font-medium">Accuracy</div>
              <div className="text-xl font-bold text-white">{accuracy}%</div>
            </div>
          </div>
        </div>

        {/* Topic Performance Breakdown */}
        {topicPerformance.length > 0 && (
          <div className="bg-slate-850 border border-slate-800 rounded-2xl p-6 space-y-4">
            <h2 className="text-sm font-bold text-white flex items-center space-x-2">
              <BookOpen className="w-4 h-4 text-brand-400" />
              <span>Topic Performance & Weak Area Analytics</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              {topicPerformance.map((tp, i) => (
                <div key={i} className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">{tp.topic}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getTopicStatusBadge(tp.status)}`}>
                      {tp.status}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs text-slate-400">
                    <span>{tp.correct} / {tp.total} Correct</span>
                    <span className="font-bold text-slate-200">{tp.percentage}%</span>
                  </div>
                  <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${tp.percentage >= 75 ? 'bg-emerald-500' : tp.percentage >= 60 ? 'bg-brand-500' : 'bg-rose-500'}`}
                      style={{ width: `${tp.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Question-by-Question Review */}
        <div className="bg-slate-850 border border-slate-800 rounded-2xl p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
            <h2 className="text-sm font-bold text-white flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-brand-400" />
              <span>Full Question Review & Step-by-Step Explanations</span>
            </h2>

            <div className="flex items-center space-x-1.5 bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs">
              {['all', 'correct', 'incorrect', 'skipped'].map((f) => (
                <button
                  key={f}
                  onClick={() => setReviewFilter(f)}
                  className={`px-3 py-1 rounded-lg capitalize font-semibold transition ${
                    reviewFilter === f ? 'bg-brand-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            {filteredQuestions.map((q, idx) => {
              const isCorrect = q.isCorrect;
              const isSkipped = !q.isAnswered;

              return (
                <div
                  key={idx}
                  className={`bg-slate-900 border rounded-2xl p-5 space-y-4 transition ${
                    isCorrect
                      ? 'border-emerald-500/30'
                      : isSkipped
                      ? 'border-slate-800'
                      : 'border-rose-500/30'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        Question {idx + 1} • {q.topic}
                      </span>
                      <h3 className="text-sm font-bold text-white leading-relaxed">{q.question}</h3>
                    </div>

                    <span className={`text-xs font-bold px-3 py-1 rounded-full border flex-shrink-0 flex items-center space-x-1 ${
                      isCorrect
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                        : isSkipped
                        ? 'bg-slate-800 text-slate-400 border-slate-700'
                        : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                    }`}>
                      {isCorrect ? <Check className="w-3.5 h-3.5" /> : isSkipped ? <HelpCircle className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
                      <span>{isCorrect ? 'Correct' : isSkipped ? 'Skipped' : 'Incorrect'}</span>
                    </span>
                  </div>

                  {/* Options List */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {q.options.map((opt, optIdx) => {
                      const isUserChoice = q.userAnswerIndex === optIdx;
                      const isCorrectChoice = q.correctAnswerIndex === optIdx;

                      let style = 'bg-slate-850 border-slate-800 text-slate-300';
                      if (isCorrectChoice) style = 'bg-emerald-500/20 border-emerald-500 text-emerald-300 font-semibold';
                      else if (isUserChoice && !isCorrect) style = 'bg-rose-500/20 border-rose-500 text-rose-300 font-semibold';

                      return (
                        <div key={optIdx} className={`p-3 rounded-xl border flex items-center space-x-2 ${style}`}>
                          <span className="font-mono text-[10px] uppercase opacity-60">
                            {String.fromCharCode(65 + optIdx)}.
                          </span>
                          <span>{opt}</span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Explanation Box */}
                  <div className="bg-slate-850/80 border border-slate-800 p-3.5 rounded-xl text-xs space-y-1">
                    <span className="font-bold text-brand-400 block">Explanation:</span>
                    <p className="text-slate-300 leading-relaxed">{q.explanation}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default QuizResultPage;
