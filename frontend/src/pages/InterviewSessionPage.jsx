import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import MainLayout from '../components/layout/MainLayout';
import {
  Bot,
  User,
  Mic,
  MicOff,
  Send,
  SkipForward,
  LogOut,
  Clock,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  Award,
  RefreshCw,
  X,
} from 'lucide-react';
import {
  getInterviewSession,
  submitInterviewAnswer,
  skipInterviewQuestion,
  endInterviewSession,
} from '../services/interviewApi';

const InterviewSessionPage = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();

  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Current Question & Answer State
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [answerText, setAnswerText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [skipping, setSkipping] = useState(false);

  // Timer State
  const [remainingSeconds, setRemainingSeconds] = useState(0);

  // Instant Feedback Modal / Banner
  const [lastFeedback, setLastFeedback] = useState(null);

  // End Confirmation Modal
  const [showEndModal, setShowEndModal] = useState(false);

  // Speech Recognition State
  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef(null);

  // Load Session details
  const fetchSession = async () => {
    try {
      const res = await getInterviewSession(sessionId);
      if (res.success) {
        setSession(res.data);
        setRemainingSeconds(res.data.remainingSeconds || 0);

        if (res.data.status === 'completed' || res.data.status === 'expired') {
          navigate(`/interview/${sessionId}/result`);
          return;
        }

        setCurrentQuestion(res.data.currentQuestion);

        // Load saved draft if present
        const savedDraft = localStorage.getItem(`interview_draft_${sessionId}`);
        if (savedDraft) setAnswerText(savedDraft);
      }
    } catch (err) {
      console.error('Error fetching session:', err);
      setError(err.response?.data?.message || 'Failed to load interview session.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSession();
  }, [sessionId]);

  // Server-Synchronized Timer Countdown Effect
  useEffect(() => {
    if (!remainingSeconds || remainingSeconds <= 0) return;

    const interval = setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          // Auto-end session when timer reaches 0
          handleAutoEndSession();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [remainingSeconds]);

  // Save Draft to LocalStorage
  const handleAnswerChange = (val) => {
    setAnswerText(val);
    localStorage.setItem(`interview_draft_${sessionId}`, val);
  };

  const handleAutoEndSession = async () => {
    try {
      await endInterviewSession(sessionId);
      navigate(`/interview/${sessionId}/result`);
    } catch (err) {
      navigate(`/interview/${sessionId}/result`);
    }
  };

  // Toggle Voice Recognition (Web Speech API)
  const toggleVoiceRecording = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert('Voice speech recognition is not supported in your browser. Please type your response.');
      return;
    }

    if (isRecording) {
      if (recognitionRef.current) recognitionRef.current.stop();
      setIsRecording(false);
    } else {
      try {
        const rec = new SpeechRecognition();
        rec.continuous = true;
        rec.interimResults = true;
        rec.lang = 'en-US';

        rec.onresult = (event) => {
          let transcript = '';
          for (let i = event.resultIndex; i < event.results.length; i++) {
            transcript += event.results[i][0].transcript;
          }
          if (transcript) {
            handleAnswerChange(answerText ? answerText + ' ' + transcript : transcript);
          }
        };

        rec.onerror = (e) => {
          console.warn('Speech recognition error:', e);
          setIsRecording(false);
        };

        rec.onend = () => setIsRecording(false);

        rec.start();
        recognitionRef.current = rec;
        setIsRecording(true);
      } catch (e) {
        alert('Failed to start voice recognition.');
      }
    }
  };

  const handleSubmitAnswer = async () => {
    if (!answerText.trim()) return;
    setSubmitting(true);
    setLastFeedback(null);
    try {
      const res = await submitInterviewAnswer(sessionId, {
        answerText,
        answerType: isRecording ? 'VOICE' : 'TEXT',
        timeTaken: 30,
      });

      if (res.success) {
        localStorage.removeItem(`interview_draft_${sessionId}`);
        setAnswerText('');

        if (res.data.isCompleted) {
          navigate(`/interview/${sessionId}/result`);
        } else {
          setLastFeedback(res.data.evaluation);
          setCurrentQuestion(res.data.nextQuestion);
          setSession((prev) => ({
            ...prev,
            currentQuestionIndex: res.data.currentQuestionIndex,
          }));
        }
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit answer.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSkipQuestion = async () => {
    setSkipping(true);
    try {
      const res = await skipInterviewQuestion(sessionId);
      if (res.success) {
        localStorage.removeItem(`interview_draft_${sessionId}`);
        setAnswerText('');

        if (res.data.isCompleted) {
          navigate(`/interview/${sessionId}/result`);
        } else {
          setCurrentQuestion(res.data.nextQuestion);
          setSession((prev) => ({
            ...prev,
            currentQuestionIndex: res.data.currentQuestionIndex,
          }));
        }
      }
    } catch (err) {
      alert('Failed to skip question.');
    } finally {
      setSkipping(false);
    }
  };

  const handleConfirmEndSession = async () => {
    try {
      await endInterviewSession(sessionId);
      navigate(`/interview/${sessionId}/result`);
    } catch (err) {
      navigate(`/interview/${sessionId}/result`);
    }
  };

  const formatTimer = (secs) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="py-24 text-center space-y-3">
          <RefreshCw className="w-10 h-10 text-violet-400 animate-spin mx-auto" />
          <p className="text-sm text-slate-400">Initializing AI Mock Interviewer...</p>
        </div>
      </MainLayout>
    );
  }

  if (error || !session) {
    return (
      <MainLayout>
        <div className="p-6 bg-rose-500/10 border border-rose-500/20 text-rose-300 rounded-2xl text-center space-y-4">
          <p className="text-base font-semibold">{error || 'Session not found'}</p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6 max-w-5xl mx-auto">
        {/* Top Header Bar */}
        <div className="flex items-center justify-between bg-slate-850 border border-slate-800 px-6 py-4 rounded-2xl shadow-xl">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-violet-500/20 text-violet-400 rounded-xl border border-violet-500/30">
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-base font-bold text-white">{session.targetRole} Mock Interview</h1>
                <span className="px-2.5 py-0.5 bg-violet-500/10 text-violet-300 text-xs font-semibold rounded-full border border-violet-500/20 capitalize">
                  {session.interviewType}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Question {(session.currentQuestionIndex || 0) + 1} of {session.questionCount} • Difficulty:{' '}
                <span className="text-slate-200 font-semibold">{session.difficulty}</span>
              </p>
            </div>
          </div>

          {/* Timer Display */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 px-3.5 py-1.5 bg-slate-900 border border-slate-750 rounded-xl font-mono text-sm font-bold text-amber-400">
              <Clock className="w-4 h-4 text-amber-400" />
              <span>{formatTimer(remainingSeconds)}</span>
            </div>

            <button
              onClick={() => setShowEndModal(true)}
              className="p-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-xl border border-rose-500/20 transition"
              title="End Interview Early"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* AI Interviewer Question Box */}
        {currentQuestion && (
          <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-indigo-950 border border-slate-800 p-6 rounded-2xl space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-violet-600 text-white flex items-center justify-center font-bold text-sm shadow-md">
                  AI
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">AI Interviewer</h3>
                  <p className="text-[11px] text-slate-400">Evaluating relevance & technical depth</p>
                </div>
              </div>

              {currentQuestion.source && (
                <span className="px-2.5 py-1 bg-slate-800 text-slate-300 text-[10px] font-semibold rounded-lg border border-slate-700">
                  {currentQuestion.source}
                </span>
              )}
            </div>

            {/* Question Text */}
            <div className="p-4 bg-slate-950/70 rounded-xl border border-slate-800">
              <p className="text-slate-100 text-base font-medium leading-relaxed">
                "{currentQuestion.questionText}"
              </p>
            </div>

            {/* Expected Concepts */}
            {currentQuestion.expectedConcepts?.length > 0 && (
              <div className="flex items-center space-x-2 text-xs pt-1">
                <span className="text-slate-400 font-medium">Key Concepts Expected:</span>
                <div className="flex flex-wrap gap-1.5">
                  {currentQuestion.expectedConcepts.map((concept, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-0.5 bg-indigo-500/10 text-indigo-300 text-[11px] rounded-md border border-indigo-500/20"
                    >
                      {concept}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Previous Answer Instant AI Feedback Banner */}
        {lastFeedback && (
          <div className="bg-slate-850 border border-emerald-500/30 p-5 rounded-2xl space-y-3 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-xs font-bold text-emerald-400 flex items-center space-x-1.5 uppercase tracking-wider">
                <CheckCircle2 className="w-4 h-4" />
                <span>Previous Answer AI Feedback</span>
              </span>
              <span className="text-xs font-bold text-slate-200">
                Score: <span className="text-emerald-400">{lastFeedback.scores?.overallAnswerScore}/100</span>
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
              <div className="p-2 bg-slate-900 rounded-lg">
                <p className="text-[10px] text-slate-400">Relevance</p>
                <p className="font-bold text-white">{lastFeedback.scores?.relevance}/10</p>
              </div>
              <div className="p-2 bg-slate-900 rounded-lg">
                <p className="text-[10px] text-slate-400">Correctness</p>
                <p className="font-bold text-emerald-400">{lastFeedback.scores?.correctness}/10</p>
              </div>
              <div className="p-2 bg-slate-900 rounded-lg">
                <p className="text-[10px] text-slate-400">Completeness</p>
                <p className="font-bold text-indigo-400">{lastFeedback.scores?.completeness}/10</p>
              </div>
              <div className="p-2 bg-slate-900 rounded-lg">
                <p className="text-[10px] text-slate-400">Clarity</p>
                <p className="font-bold text-amber-400">{lastFeedback.scores?.clarity}/10</p>
              </div>
            </div>

            {lastFeedback.feedback?.keyPositives?.length > 0 && (
              <p className="text-xs text-slate-300">
                <strong className="text-emerald-400">Positive: </strong>
                {lastFeedback.feedback.keyPositives.join(' • ')}
              </p>
            )}
          </div>
        )}

        {/* Student Answer Box */}
        <div className="bg-slate-850 border border-slate-800 p-6 rounded-2xl space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-2">
              <User className="w-4 h-4 text-violet-400" />
              <span>Your Answer</span>
            </label>

            {/* Voice Input Toggle Button */}
            <button
              onClick={toggleVoiceRecording}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition ${
                isRecording
                  ? 'bg-rose-600 text-white animate-pulse'
                  : 'bg-slate-800 hover:bg-slate-750 text-slate-300 border border-slate-700'
              }`}
            >
              {isRecording ? <Mic className="w-3.5 h-3.5" /> : <MicOff className="w-3.5 h-3.5" />}
              <span>{isRecording ? 'Listening...' : 'Voice Input'}</span>
            </button>
          </div>

          <textarea
            value={answerText}
            onChange={(e) => handleAnswerChange(e.target.value)}
            placeholder="Type or speak your answer clearly... Explain your reasoning, technical architecture, and trade-offs."
            rows="6"
            className="w-full bg-slate-950 border border-slate-800 p-4 rounded-xl text-slate-200 text-sm leading-relaxed focus:outline-none focus:border-violet-500 resize-none font-sans"
          />

          <div className="flex items-center justify-between text-xs text-slate-400 border-t border-slate-800/80 pt-3">
            <span>
              Words: <strong className="text-slate-200">{answerText.trim().split(/\s+/).filter(Boolean).length}</strong>
            </span>

            {/* Action Buttons */}
            <div className="flex items-center space-x-3">
              <button
                onClick={handleSkipQuestion}
                disabled={submitting || skipping}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-semibold rounded-xl border border-slate-700 flex items-center space-x-1.5 transition disabled:opacity-50"
              >
                <SkipForward className="w-3.5 h-3.5" />
                <span>Skip</span>
              </button>

              <button
                onClick={handleSubmitAnswer}
                disabled={submitting || skipping || !answerText.trim()}
                className="px-6 py-2 bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-violet-600/20 flex items-center space-x-2 transition disabled:opacity-50"
              >
                {submitting ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Send className="w-3.5 h-3.5" />
                )}
                <span>Submit Answer</span>
              </button>
            </div>
          </div>
        </div>

        {/* End Interview Confirmation Modal */}
        {showEndModal && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-slate-850 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
              <div className="flex items-center space-x-3 text-amber-400">
                <AlertTriangle className="w-6 h-6" />
                <h3 className="text-lg font-bold text-white">End Interview Early?</h3>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Are you sure you want to end this interview session? Submitted answers will be evaluated to generate your scorecard.
              </p>
              <div className="flex justify-end space-x-3 pt-3">
                <button
                  onClick={() => setShowEndModal(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 text-xs font-semibold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmEndSession}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold rounded-xl"
                >
                  End Interview
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default InterviewSessionPage;
