import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import MainLayout from '../components/layout/MainLayout';
import {
  Mic,
  Briefcase,
  Code,
  Layers,
  Sparkles,
  Clock,
  HelpCircle,
  Play,
  History,
  BarChart3,
  Bot,
  CheckCircle2,
  FileText,
  Zap,
} from 'lucide-react';
import { startInterviewSession, getInterviewCoach } from '../services/interviewApi';

const MockInterviewPage = () => {
  const navigate = useNavigate();

  // Setup Form State
  const [interviewType, setInterviewType] = useState('technical');
  const [targetRole, setTargetRole] = useState('Full Stack Developer');
  const [difficulty, setDifficulty] = useState('Medium');
  const [questionCount, setQuestionCount] = useState(10);
  const [durationMinutes, setDurationMinutes] = useState(15);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Coach Insights
  const [coachData, setCoachData] = useState(null);

  useEffect(() => {
    const fetchCoach = async () => {
      try {
        const res = await getInterviewCoach();
        if (res.success) setCoachData(res.data);
      } catch (err) {
        // Ignore
      }
    };
    fetchCoach();
  }, []);

  const handleStartInterview = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await startInterviewSession({
        interviewType,
        targetRole,
        difficulty,
        questionCount,
        durationMinutes,
      });

      if (res.success && res.data?.sessionId) {
        navigate(`/interview/${res.data.sessionId}`);
      }
    } catch (err) {
      console.error('Error starting interview session:', err);
      setError(err.response?.data?.message || 'Failed to start interview session. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const rolesList = [
    'Full Stack Developer',
    'Software Developer',
    'Frontend Developer',
    'Backend Developer',
    'Java Developer',
    'Python Developer',
    'Data Analyst',
    'AI/ML Engineer',
    'QA/Test Engineer',
    'DevOps Engineer',
  ];

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Top Header Banner */}
        <div className="flex flex-col md:flex-row md:items-center justify-between bg-gradient-to-r from-slate-900 via-slate-850 to-violet-950 border border-slate-800 p-6 rounded-2xl gap-4 shadow-xl">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-violet-500/20 text-violet-400 rounded-xl border border-violet-500/30">
              <Bot className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-2xl font-bold text-white">AI Mock Interview Room</h1>
                <span className="px-2.5 py-0.5 bg-violet-500/10 text-violet-300 text-xs font-semibold rounded-full border border-violet-500/20">
                  Adaptive AI v2.0
                </span>
              </div>
              <p className="text-sm text-slate-400 mt-1">
                Conduct personalized HR, Technical, Project, & Mixed interviews with real-time text/voice adaptive feedback.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <Link
              to="/interview/history"
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-medium rounded-xl border border-slate-700 flex items-center space-x-2 transition"
            >
              <History className="w-4 h-4 text-slate-400" />
              <span>History</span>
            </Link>
            <Link
              to="/interview/analytics"
              className="px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium rounded-xl shadow-lg shadow-violet-600/20 flex items-center space-x-2 transition"
            >
              <BarChart3 className="w-4 h-4" />
              <span>Interview Analytics</span>
            </Link>
          </div>
        </div>

        {/* AI Coach Banner */}
        {coachData && (
          <div className="bg-slate-850 border border-slate-800 p-4 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-amber-500/10 text-amber-400 rounded-lg border border-amber-500/20 shrink-0">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-semibold text-amber-400 uppercase tracking-wider">AI Interview Coach Tip</p>
                <p className="text-xs text-slate-200 mt-0.5">{coachData.insight}</p>
              </div>
            </div>
            <div className="text-xs text-slate-400 shrink-0 font-medium">
              Recommendation: <span className="text-indigo-300">{coachData.recommendedAction}</span>
            </div>
          </div>
        )}

        {/* Setup Configuration Card */}
        <div className="bg-slate-850 border border-slate-800 p-6 rounded-2xl shadow-xl space-y-6">
          <div className="border-b border-slate-800 pb-4">
            <h2 className="text-lg font-bold text-white flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-violet-400" />
              <span>Configure Your Mock Interview</span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Customize the interview format to mirror real campus placement drives or technical viva rounds.
            </p>
          </div>

          {error && (
            <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs font-semibold rounded-xl">
              {error}
            </div>
          )}

          <form onSubmit={handleStartInterview} className="space-y-6">
            {/* 1. Select Interview Type */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                1. Select Interview Mode
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  {
                    id: 'technical',
                    title: 'Technical Interview',
                    icon: Code,
                    color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/30',
                    desc: 'Java, OOP, DSA, DBMS, SQL, Web Dev & REST APIs',
                  },
                  {
                    id: 'hr',
                    title: 'HR & Behavioral',
                    icon: Briefcase,
                    color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
                    desc: 'Introduction, strengths, career goals & conflict management',
                  },
                  {
                    id: 'project',
                    title: 'Project Viva',
                    icon: Layers,
                    color: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
                    desc: 'Deep dive into your resume projects & architecture',
                  },
                  {
                    id: 'mixed',
                    title: 'Mixed Placement Drive',
                    icon: Zap,
                    color: 'text-violet-400 bg-violet-500/10 border-violet-500/30',
                    desc: 'Comprehensive mix of HR, Technical & Project questions',
                  },
                ].map((type) => {
                  const Icon = type.icon;
                  const isSelected = interviewType === type.id;
                  return (
                    <div
                      key={type.id}
                      onClick={() => setInterviewType(type.id)}
                      className={`p-4 rounded-2xl border cursor-pointer transition flex flex-col justify-between space-y-3 ${
                        isSelected
                          ? 'bg-slate-800 border-violet-500 ring-2 ring-violet-500/30 shadow-lg'
                          : 'bg-slate-900 border-slate-750 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className={`p-2.5 rounded-xl border ${type.color}`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        {isSelected && <CheckCircle2 className="w-5 h-5 text-violet-400" />}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white">{type.title}</h4>
                        <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">{type.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 2. Target Role & Difficulty */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                  2. Target Job Role
                </label>
                <select
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-750 p-3 rounded-xl text-sm text-slate-200 focus:outline-none focus:border-violet-500 font-medium"
                >
                  {rolesList.map((role) => (
                    <option key={role} value={role}>
                      {role}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                  3. Difficulty Level
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {['Easy', 'Medium', 'Hard'].map((diff) => (
                    <button
                      type="button"
                      key={diff}
                      onClick={() => setDifficulty(diff)}
                      className={`py-2.5 rounded-xl text-xs font-semibold border transition ${
                        difficulty === diff
                          ? 'bg-violet-600 text-white border-violet-500 shadow'
                          : 'bg-slate-900 border-slate-750 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {diff}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* 3. Question Count & Duration */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                  4. Number of Questions
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[5, 10, 15, 20].map((num) => (
                    <button
                      type="button"
                      key={num}
                      onClick={() => setQuestionCount(num)}
                      className={`py-2.5 rounded-xl text-xs font-semibold border transition ${
                        questionCount === num
                          ? 'bg-violet-600 text-white border-violet-500 shadow'
                          : 'bg-slate-900 border-slate-750 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {num} Qs
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                  5. Time Limit
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[10, 20, 30, 45].map((mins) => (
                    <button
                      type="button"
                      key={mins}
                      onClick={() => setDurationMinutes(mins)}
                      className={`py-2.5 rounded-xl text-xs font-semibold border transition ${
                        durationMinutes === mins
                          ? 'bg-violet-600 text-white border-violet-500 shadow'
                          : 'bg-slate-900 border-slate-750 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {mins} Mins
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Submit Action Button */}
            <div className="pt-4 border-t border-slate-800 flex items-center justify-end">
              <button
                type="submit"
                disabled={loading}
                className="w-full sm:w-auto px-8 py-3.5 bg-violet-600 hover:bg-violet-500 text-white text-sm font-bold rounded-xl shadow-xl shadow-violet-600/20 flex items-center justify-center space-x-2 transition disabled:opacity-50"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-white" />
                    <span>Start AI Mock Interview</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </MainLayout>
  );
};

export default MockInterviewPage;
