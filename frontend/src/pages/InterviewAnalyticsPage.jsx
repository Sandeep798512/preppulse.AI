import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import MainLayout from '../components/layout/MainLayout';
import {
  BarChart3,
  Trophy,
  Award,
  TrendingUp,
  BrainCircuit,
  ChevronLeft,
  RefreshCw,
  Sparkles,
  Bot,
  Zap,
} from 'lucide-react';
import { getInterviewAnalytics, getInterviewCoach } from '../services/interviewApi';

const InterviewAnalyticsPage = () => {
  const [analytics, setAnalytics] = useState(null);
  const [coach, setCoach] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchAnalyticsData = async () => {
    setLoading(true);
    try {
      const [analyticsRes, coachRes] = await Promise.all([
        getInterviewAnalytics(),
        getInterviewCoach(),
      ]);

      if (analyticsRes.success) setAnalytics(analyticsRes.data);
      if (coachRes.success) setCoach(coachRes.data);
    } catch (err) {
      console.error('Error loading interview analytics:', err);
      setError('Failed to compute interview analytics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  if (loading) {
    return (
      <MainLayout>
        <div className="py-24 text-center space-y-3">
          <RefreshCw className="w-10 h-10 text-violet-400 animate-spin mx-auto" />
          <p className="text-sm text-slate-400">Computing interview performance trends...</p>
        </div>
      </MainLayout>
    );
  }

  if (error || !analytics) {
    return (
      <MainLayout>
        <div className="p-6 bg-rose-500/10 border border-rose-500/20 text-rose-300 rounded-2xl text-center space-y-4">
          <p className="text-base font-semibold">{error || 'Failed to load analytics'}</p>
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

  return (
    <MainLayout>
      <div className="space-y-6">
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
              <h1 className="text-2xl font-bold text-white">Interview Analytics & AI Coach</h1>
              <p className="text-xs text-slate-400 mt-1">
                Data-driven interview performance breakdown across HR, Technical, and Project rounds.
              </p>
            </div>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-slate-850 border border-slate-800 p-5 rounded-2xl flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Total Interviews</p>
              <p className="text-3xl font-bold text-white mt-1">{analytics.totalInterviews}</p>
            </div>
            <div className="p-3 bg-violet-500/10 text-violet-400 rounded-xl border border-violet-500/20">
              <Bot className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-slate-850 border border-slate-800 p-5 rounded-2xl flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Average Score</p>
              <p className="text-3xl font-bold text-indigo-400 mt-1">{analytics.averageScore} / 100</p>
            </div>
            <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-xl border border-indigo-500/20">
              <Trophy className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-slate-850 border border-slate-800 p-5 rounded-2xl flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Highest Score</p>
              <p className="text-3xl font-bold text-emerald-400 mt-1">{analytics.highestScore} / 100</p>
            </div>
            <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20">
              <Award className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-slate-850 border border-slate-800 p-5 rounded-2xl flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Recent Score</p>
              <p className="text-3xl font-bold text-amber-400 mt-1">{analytics.recentScore} / 100</p>
            </div>
            <div className="p-3 bg-amber-500/10 text-amber-400 rounded-xl border border-amber-500/20">
              <Zap className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Interview Mode Breakdown Cards */}
        <div className="bg-slate-850 border border-slate-800 p-6 rounded-2xl space-y-5 shadow-xl">
          <h3 className="text-base font-bold text-white flex items-center space-x-2">
            <TrendingUp className="w-5 h-5 text-violet-400" />
            <span>Interview Mode Performance Breakdown</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-slate-900 border border-slate-750 p-4 rounded-xl space-y-2">
              <span className="text-xs font-semibold text-indigo-400">Technical Round</span>
              <p className="text-2xl font-bold text-white">{analytics.typeAverages?.technical || 0}%</p>
              <p className="text-[11px] text-slate-400">Java, OOP, DSA, DBMS, SQL, REST</p>
            </div>

            <div className="bg-slate-900 border border-slate-750 p-4 rounded-xl space-y-2">
              <span className="text-xs font-semibold text-emerald-400">HR Round</span>
              <p className="text-2xl font-bold text-white">{analytics.typeAverages?.hr || 0}%</p>
              <p className="text-[11px] text-slate-400">Strengths, career goals & conflict</p>
            </div>

            <div className="bg-slate-900 border border-slate-750 p-4 rounded-xl space-y-2">
              <span className="text-xs font-semibold text-amber-400">Project Viva Round</span>
              <p className="text-2xl font-bold text-white">{analytics.typeAverages?.project || 0}%</p>
              <p className="text-[11px] text-slate-400">Architecture, DB, APIs & bugs</p>
            </div>

            <div className="bg-slate-900 border border-slate-750 p-4 rounded-xl space-y-2">
              <span className="text-xs font-semibold text-violet-400">Mixed Drive Round</span>
              <p className="text-2xl font-bold text-white">{analytics.typeAverages?.mixed || 0}%</p>
              <p className="text-[11px] text-slate-400">Full placement simulation</p>
            </div>
          </div>
        </div>

        {/* AI Interview Coach Insights Card */}
        {coach && (
          <div className="bg-gradient-to-r from-violet-950 via-slate-900 to-slate-850 border border-violet-500/30 p-6 rounded-2xl space-y-4 shadow-xl">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-violet-500/20 text-violet-400 rounded-xl border border-violet-500/30">
                <BrainCircuit className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">AI Interview Coach Report</h3>
                <p className="text-xs text-slate-400">Personalized feedback derived from real attempt database metrics</p>
              </div>
            </div>

            <p className="text-sm text-slate-200 leading-relaxed bg-slate-950/60 p-4 rounded-xl border border-slate-800">
              {coach.insight}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 space-y-1">
                <span className="text-emerald-400 font-semibold">Strongest Area Identified:</span>
                <p className="text-slate-200 font-medium">{coach.strongestArea}</p>
              </div>
              <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 space-y-1">
                <span className="text-amber-400 font-semibold">Recommended Focus:</span>
                <p className="text-slate-200 font-medium">{coach.recommendedAction}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default InterviewAnalyticsPage;
