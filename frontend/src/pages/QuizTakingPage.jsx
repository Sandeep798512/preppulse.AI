import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../services/api';
import {
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Send,
  Loader2,
  HelpCircle,
  Sparkles,
  Zap,
} from 'lucide-react';

const QuizTakingPage = () => {
  const { quizId } = useParams();
  const navigate = useNavigate();

  const [attempt, setAttempt] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answersMap, setAnswersMap] = useState({}); // questionId -> selectedOptionIndex
  const [secondsRemaining, setSecondsRemaining] = useState(0);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const timerRef = useRef(null);

  useEffect(() => {
    fetchQuizState();

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [quizId]);

  const fetchQuizState = async () => {
    try {
      const { data } = await API.get(`/quizzes/${quizId}`);
      if (data.success) {
        const att = data.attempt;
        setAttempt(att);

        // Pre-fill existing answer map
        const initialMap = {};
        (att.answers || []).forEach((a) => {
          if (a.selectedOptionIndex !== null && a.selectedOptionIndex !== undefined) {
            initialMap[a.questionId] = a.selectedOptionIndex;
          }
        });
        setAnswersMap(initialMap);

        // Calculate countdown from server expiresAt
        const expiresAtMs = new Date(att.expiresAt).getTime();
        const nowMs = Date.now();
        const diffSecs = Math.max(0, Math.floor((expiresAtMs - nowMs) / 1000));
        setSecondsRemaining(diffSecs);

        if (diffSecs <= 0 || att.status !== 'in_progress') {
          handleAutoSubmit();
        } else {
          startCountdown(expiresAtMs);
        }
      }
    } catch (err) {
      setErrorMsg('Failed to load quiz attempt session.');
    } finally {
      setLoading(false);
    }
  };

  const startCountdown = (expiresAtMs) => {
    if (timerRef.current) clearInterval(timerRef.current);

    timerRef.current = setInterval(() => {
      const nowMs = Date.now();
      const diffSecs = Math.max(0, Math.floor((expiresAtMs - nowMs) / 1000));
      setSecondsRemaining(diffSecs);

      if (diffSecs <= 0) {
        clearInterval(timerRef.current);
        handleAutoSubmit();
      }
    }, 1000);
  };

  const handleSelectOption = async (optionIndex) => {
    if (!attempt || attempt.status !== 'in_progress') return;

    const currentQ = attempt.questions[currentIndex];
    const qId = currentQ.questionId;

    // Update local state
    setAnswersMap((prev) => ({
      ...prev,
      [qId]: optionIndex,
    }));

    // Auto-save to backend
    try {
      await API.post(`/quizzes/${quizId}/answer`, {
        questionId: qId,
        selectedOptionIndex: optionIndex,
      });
    } catch (err) {
      console.warn('Failed to auto-save answer:', err);
    }
  };

  const handleSubmitQuiz = async () => {
    if (!window.confirm('Are you sure you want to submit your quiz?')) return;

    setSubmitting(true);
    if (timerRef.current) clearInterval(timerRef.current);

    try {
      const { data } = await API.post(`/quizzes/${quizId}/submit`);
      if (data.success) {
        navigate(`/quiz/${quizId}/result`);
      }
    } catch (err) {
      setErrorMsg('Failed to submit quiz attempt.');
      setSubmitting(false);
    }
  };

  const handleAutoSubmit = async () => {
    if (timerRef.current) clearInterval(timerRef.current);
    try {
      await API.post(`/quizzes/${quizId}/submit`);
      navigate(`/quiz/${quizId}/result`);
    } catch (err) {
      console.error('Auto submit error:', err);
    }
  };

  const formatTimer = (totalSecs) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white text-sm">
        <div className="flex items-center space-x-2">
          <Loader2 className="w-5 h-5 text-brand-500 animate-spin" />
          <span>Loading Quiz Session...</span>
        </div>
      </div>
    );
  }

  if (errorMsg || !attempt) {
    return (
      <div className="min-h-screen bg-slate-900 p-8 flex items-center justify-center">
        <div className="bg-slate-850 border border-slate-800 p-6 rounded-2xl max-w-md text-center space-y-4">
          <AlertTriangle className="w-10 h-10 text-red-400 mx-auto" />
          <h2 className="text-lg font-bold text-white">Quiz Unavailable</h2>
          <p className="text-xs text-slate-400">{errorMsg || 'Could not load quiz instance.'}</p>
          <button
            onClick={() => navigate('/practice')}
            className="px-4 py-2 bg-brand-600 text-white rounded-xl text-xs font-semibold"
          >
            Back to Practice Center
          </button>
        </div>
      </div>
    );
  }

  const currentQ = attempt.questions[currentIndex];
  const selectedOption = answersMap[currentQ.questionId];

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans">
      {/* Header Bar */}
      <header className="h-16 bg-slate-850 border-b border-slate-800 px-4 md:px-6 flex items-center justify-between sticky top-0 z-30 shadow-md">
        <div className="flex items-center space-x-3">
          <span className="font-extrabold text-base text-white uppercase tracking-tight">
            {attempt.category} Quiz • <span className="text-brand-400">{attempt.difficulty}</span>
          </span>
          {attempt.mode === 'practice' && (
            <span className="text-[10px] bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold">
              Practice Mode
            </span>
          )}
        </div>

        {/* Countdown Timer */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 bg-slate-900 border border-slate-700 px-3.5 py-1.5 rounded-xl font-mono text-sm font-bold text-amber-400">
            <Clock className="w-4 h-4 text-amber-400" />
            <span>{formatTimer(secondsRemaining)}</span>
          </div>

          <button
            onClick={handleSubmitQuiz}
            disabled={submitting}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition shadow-md flex items-center space-x-1.5 disabled:opacity-50"
          >
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
            <span>{submitting ? 'Submitting...' : 'Submit Quiz'}</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <div className="flex-1 flex flex-col md:flex-row max-w-7xl w-full mx-auto p-4 md:p-6 gap-6">
        {/* Sidebar Question Navigation Grid */}
        <div className="w-full md:w-64 bg-slate-850 border border-slate-800 rounded-2xl p-4 space-y-4 flex-shrink-0">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="text-xs font-bold text-slate-300">Question Navigator</span>
            <span className="text-[11px] text-slate-400 font-medium">
              {Object.keys(answersMap).length} / {attempt.totalQuestions} Answered
            </span>
          </div>

          <div className="grid grid-cols-5 gap-2">
            {attempt.questions.map((q, idx) => {
              const isAnswered = answersMap[q.questionId] !== undefined && answersMap[q.questionId] !== null;
              const isCurrent = idx === currentIndex;
              return (
                <button
                  key={q.questionId}
                  onClick={() => setCurrentIndex(idx)}
                  className={`h-10 rounded-xl font-bold text-xs transition flex items-center justify-center border ${
                    isCurrent
                      ? 'bg-brand-600 border-brand-400 text-white ring-2 ring-brand-500/40'
                      : isAnswered
                      ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                      : 'bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-600'
                  }`}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>

          <div className="pt-2 text-[11px] space-y-1 text-slate-400 border-t border-slate-800">
            <div className="flex items-center space-x-2">
              <span className="w-3 h-3 rounded bg-emerald-500/30 border border-emerald-500/50" />
              <span>Answered</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-3 h-3 rounded bg-slate-900 border border-slate-700" />
              <span>Unanswered</span>
            </div>
          </div>
        </div>

        {/* Question Panel */}
        <div className="flex-1 bg-slate-850 border border-slate-800 rounded-2xl p-6 md:p-8 flex flex-col justify-between space-y-6 shadow-xl">
          <div className="space-y-6">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-400">
              <span className="bg-slate-900 border border-slate-700 px-3 py-1 rounded-full text-brand-400">
                Question {currentIndex + 1} of {attempt.totalQuestions}
              </span>
              <span className="bg-slate-900 border border-slate-700 px-3 py-1 rounded-full">
                Topic: {currentQ.topic || 'General'}
              </span>
            </div>

            <h2 className="text-base md:text-lg font-bold text-white leading-relaxed">
              {currentQ.question}
            </h2>

            {/* Options List */}
            <div className="space-y-3 pt-2">
              {currentQ.options.map((optionText, optIdx) => {
                const isSelected = selectedOption === optIdx;
                const optionLabel = String.fromCharCode(65 + optIdx); // A, B, C, D

                return (
                  <button
                    key={optIdx}
                    onClick={() => handleSelectOption(optIdx)}
                    className={`w-full p-4 rounded-xl border text-left text-sm transition flex items-center space-x-3.5 ${
                      isSelected
                        ? 'bg-brand-600/20 border-brand-500 text-white font-semibold shadow-md'
                        : 'bg-slate-900 border-slate-700/80 text-slate-200 hover:border-slate-600'
                    }`}
                  >
                    <span className={`w-7 h-7 rounded-lg font-bold text-xs flex items-center justify-center border flex-shrink-0 ${
                      isSelected
                        ? 'bg-brand-600 border-brand-400 text-white'
                        : 'bg-slate-800 border-slate-700 text-slate-400'
                    }`}>
                      {optionLabel}
                    </span>
                    <span className="leading-snug">{optionText}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center justify-between pt-6 border-t border-slate-800">
            <button
              onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
              disabled={currentIndex === 0}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs rounded-xl transition flex items-center space-x-1.5 disabled:opacity-40"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>

            {currentIndex < attempt.totalQuestions - 1 ? (
              <button
                onClick={() => setCurrentIndex(currentIndex + 1)}
                className="px-6 py-2.5 bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs rounded-xl transition flex items-center space-x-1.5 shadow-md shadow-brand-600/20"
              >
                <span>Next Question</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleSubmitQuiz}
                disabled={submitting}
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition shadow-md flex items-center space-x-1.5 disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                <span>Final Submission</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizTakingPage;
