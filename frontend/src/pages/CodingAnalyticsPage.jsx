import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import MainLayout from '../components/layout/MainLayout';
import {
  BarChart3,
  Trophy,
  CheckCircle2,
  Zap,
  Sparkles,
  ChevronLeft,
  RefreshCw,
  BookOpen,
  ArrowRight,
  TrendingUp,
  BrainCircuit,
} from 'lucide-react';
import { getCodingAnalytics, getCodingReadiness } from '../services/codingApi';

const CodingAnalyticsPage = () => {
  const [analytics, setAnalytics] = useState(null);
  const [readiness, setReadiness] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchAnalyticsData = async () => {
    setLoading(true);
    try {
      const [analyticsRes, readinessRes] = await Promise.all([
        getCodingAnalytics(),
        getCodingReadiness(),
      ]);

      if (analyticsRes.success) setAnalytics(analyticsRes.data);
      if (readinessRes.success) setReadiness(readinessRes.data);
    } catch (err) {
      console.error('Error fetching analytics:', err);
      setError('Failed to load coding performance analytics.');
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
          <RefreshCw className="w-10 h-10 text-indigo-400 animate-spin mx-auto" />
          <p className="text-sm text-slate-400">Computing coding readiness analytics...</p>
        </div>
      </MainLayout>
    );
  }

  if (error || !analytics || !readiness) {
    return (
      <MainLayout>
        <div className="p-6 bg-rose-500/10 border border-rose-500/20 text-rose-300 rounded-2xl text-center space-y-4">
          <p className="text-base font-semibold">{error || 'Failed to load analytics'}</p>
          <Link
            to="/coding"
            className="inline-flex items-center space-x-2 px-4 py-2 bg-slate-800 text-slate-200 text-xs font-semibold rounded-xl"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Back to Coding</span>
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
              to="/coding"
              className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition"
            >
              <ChevronLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-white">Coding Analytics & Readiness</h1>
              <p className="text-xs text-slate-400 mt-1">
                Data-driven placement readiness score, difficulty distribution, and AI recommendations.
              </p>
            </div>
          </div>
        </div>

        {/* Readiness Card & Score */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-850 border border-indigo-500/30 p-6 rounded-2xl flex flex-col justify-between shadow-2xl relative overflow-hidden">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider flex items-center space-x-1.5">
                  <Trophy className="w-4 h-4" />
                  <span>Coding Readiness Score</span>
                </span>
                <span className="px-3 py-1 bg-indigo-500/20 text-indigo-300 text-xs font-semibold rounded-full border border-indigo-500/30">
                  {readiness.readinessLevel}
                </span>
              </div>

              <div className="flex items-baseline space-x-3 pt-2">
                <span className="text-6xl font-extrabold text-white">{readiness.overallScore}</span>
                <span className="text-xl text-slate-400 font-semibold">/ 100</span>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                Calculated dynamically based on solved problem counts, difficulty weightings, DSA topic breadth, and submission acceptance rates.
              </p>
            </div>

            <div className="pt-6 border-t border-slate-800/80 mt-6 flex items-center justify-between">
              <span className="text-xs text-slate-400">Target for Tier-1 Placement: 80+</span>
              <Link
                to="/coding"
                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl flex items-center space-x-1 transition"
              >
                <span>Practice Now</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Difficulty Solved Breakdown */}
          <div className="lg:col-span-2 bg-slate-850 border border-slate-800 p-6 rounded-2xl space-y-5 shadow-xl">
            <h3 className="text-base font-bold text-white flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-indigo-400" />
              <span>Difficulty Distribution Breakdown</span>
            </h3>

            <div className="space-y-4">
              {/* Easy */}
              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-emerald-400">Easy Challenges</span>
                  <span className="text-slate-300">{readiness.solvedBreakdown.easy} / 10 Target</span>
                </div>
                <div className="w-full bg-slate-900 h-2.5 rounded-full overflow-hidden border border-slate-800">
                  <div
                    className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, (readiness.solvedBreakdown.easy / 10) * 100)}%` }}
                  />
                </div>
              </div>

              {/* Medium */}
              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-amber-400">Medium Challenges</span>
                  <span className="text-slate-300">{readiness.solvedBreakdown.medium} / 10 Target</span>
                </div>
                <div className="w-full bg-slate-900 h-2.5 rounded-full overflow-hidden border border-slate-800">
                  <div
                    className="bg-amber-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, (readiness.solvedBreakdown.medium / 10) * 100)}%` }}
                  />
                </div>
              </div>

              {/* Hard */}
              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-rose-400">Hard Challenges</span>
                  <span className="text-slate-300">{readiness.solvedBreakdown.hard} / 5 Target</span>
                </div>
                <div className="w-full bg-slate-900 h-2.5 rounded-full overflow-hidden border border-slate-800">
                  <div
                    className="bg-rose-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, (readiness.solvedBreakdown.hard / 5) * 100)}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 pt-3 border-t border-slate-800 text-center">
              <div>
                <p className="text-[11px] text-slate-400">Total Solved</p>
                <p className="text-lg font-bold text-white">{readiness.solvedBreakdown.total}</p>
              </div>
              <div>
                <p className="text-[11px] text-slate-400">Topics Covered</p>
                <p className="text-lg font-bold text-indigo-400">{readiness.topicCoverageCount}</p>
              </div>
              <div>
                <p className="text-[11px] text-slate-400">Acceptance Rate</p>
                <p className="text-lg font-bold text-emerald-400">{readiness.acceptanceRate}%</p>
              </div>
            </div>
          </div>
        </div>

        {/* Personalized AI Recommendations */}
        <div className="bg-slate-850 border border-slate-800 p-6 rounded-2xl space-y-4 shadow-xl">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-indigo-500/10 text-indigo-400 rounded-xl border border-indigo-500/20">
              <BrainCircuit className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">AI Personalized Recommendations</h3>
              <p className="text-xs text-slate-400">Targeted steps to increase your coding score before campus placements</p>
            </div>
          </div>

          <div className="space-y-3">
            {readiness.recommendations?.map((rec, i) => (
              <div
                key={i}
                className="flex items-start space-x-3 bg-slate-900/80 p-4 rounded-xl border border-slate-800 text-xs text-slate-200"
              >
                <Sparkles className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                <p className="leading-relaxed">{rec}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default CodingAnalyticsPage;
