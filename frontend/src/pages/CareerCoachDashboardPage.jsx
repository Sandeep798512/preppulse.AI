import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import MainLayout from '../components/layout/MainLayout';
import {
  Compass,
  Trophy,
  Target,
  Flame,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowRight,
  RotateCcw,
  MessageSquare,
  Calendar,
  Layers,
  Award,
  AlertTriangle,
  Code,
  FileText,
  Mic,
  BookOpen,
  Zap,
} from 'lucide-react';
import { getCareerCoachOverview } from '../services/careerCoachApi';

const CareerCoachDashboardPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchOverview = async () => {
    setLoading(true);
    try {
      const res = await getCareerCoachOverview();
      if (res.success) {
        setData(res.data);
      }
    } catch (err) {
      console.error('Error fetching Career Coach overview:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOverview();
  }, []);

  if (loading) {
    return (
      <MainLayout>
        <div className="py-24 text-center space-y-3">
          <Zap className="w-10 h-10 text-indigo-400 animate-spin mx-auto" />
          <p className="text-sm text-slate-400">Loading AI Career Coach & Personalized Roadmap...</p>
        </div>
      </MainLayout>
    );
  }

  if (!data) return null;

  const {
    goal,
    readinessScore,
    scoreInterpretation,
    targetRole,
    skillGaps,
    nextBestAction,
    roadmap,
    todayTasks,
    completedTodayCount,
    totalTodayCount,
    progressSummary,
  } = data;

  return (
    <MainLayout>
      <div className="space-y-6 max-w-6xl mx-auto">
        {/* Top Header Banner */}
        <div className="flex flex-col md:flex-row md:items-center justify-between bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-slate-800 p-6 rounded-2xl gap-4 shadow-xl">
          <div className="flex items-center space-x-4">
            <div className="p-3.5 bg-indigo-500/20 text-indigo-400 rounded-xl border border-indigo-500/30">
              <Compass className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-2xl font-bold text-white">AI Career Coach & Learning Roadmap</h1>
                <span className="px-2.5 py-0.5 bg-indigo-500/20 text-indigo-300 text-xs font-semibold rounded-full border border-indigo-500/30">
                  Target: {targetRole}
                </span>
              </div>
              <p className="text-sm text-slate-400 mt-1">
                Adaptive career guidance powered by your actual platform readiness & verified metrics.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <Link
              to="/career-coach/chat"
              className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-600/20 flex items-center space-x-2 transition"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Ask AI Coach</span>
            </Link>
            <Link
              to="/career-coach/roadmap"
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-750 border border-slate-700 text-slate-200 text-xs font-bold rounded-xl flex items-center space-x-2 transition"
            >
              <Layers className="w-4 h-4" />
              <span>Full Roadmap</span>
            </Link>
          </div>
        </div>

        {/* Hero Highlight: Next Best Action & Streak / Points */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Next Best Action Card */}
          <div className="lg:col-span-2 bg-gradient-to-br from-indigo-950/80 via-slate-900 to-slate-850 border border-indigo-500/30 p-6 rounded-2xl space-y-4 shadow-xl relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="px-3 py-1 bg-amber-500/20 text-amber-300 text-xs font-bold rounded-full border border-amber-500/30 uppercase tracking-wider flex items-center space-x-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Next Best Action</span>
              </span>
              <span className="text-xs text-slate-400">Est: {nextBestAction.estimatedMinutes} mins</span>
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-bold text-white">{nextBestAction.title}</h2>
              <p className="text-xs text-slate-300 leading-relaxed">{nextBestAction.description}</p>
            </div>

            <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-xl text-xs text-indigo-300 flex items-center justify-between">
              <span>Why? {nextBestAction.reason}</span>
              <Link
                to={nextBestAction.actionRoute}
                className="px-4 py-1.5 bg-indigo-500 hover:bg-indigo-400 text-white font-bold rounded-lg transition flex items-center space-x-1 text-xs"
              >
                <span>Launch Now</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Readiness & Gamification Quick Status */}
          <div className="bg-slate-850 border border-slate-800 p-6 rounded-2xl space-y-4 shadow-xl flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Placement Readiness</span>
                <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 text-[10px] font-bold rounded">
                  {scoreInterpretation}
                </span>
              </div>

              <div className="flex items-baseline space-x-2">
                <span className="text-4xl font-extrabold text-white">{readinessScore}</span>
                <span className="text-slate-400 text-sm">/ 100</span>
              </div>
            </div>

            {/* Streak & Points */}
            <div className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-800">
              <div className="p-3 bg-slate-900 rounded-xl flex items-center space-x-3">
                <Flame className="w-6 h-6 text-amber-500 animate-pulse" />
                <div>
                  <p className="text-xs text-slate-400 font-medium">Streak</p>
                  <p className="text-base font-bold text-white">{progressSummary.currentStreak} Days</p>
                </div>
              </div>

              <div className="p-3 bg-slate-900 rounded-xl flex items-center space-x-3">
                <Trophy className="w-6 h-6 text-indigo-400" />
                <div>
                  <p className="text-xs text-slate-400 font-medium">Points</p>
                  <p className="text-base font-bold text-indigo-300">{progressSummary.points} pts</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Middle Section: Today's Tasks & Roadmap Progress */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Today's Tasks Card */}
          <div className="lg:col-span-2 bg-slate-850 border border-slate-800 p-6 rounded-2xl space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Calendar className="w-5 h-5 text-indigo-400" />
                <h3 className="text-base font-bold text-white">Today's Preparation Tasks</h3>
              </div>
              <div className="flex items-center space-x-3">
                <span className="text-xs font-semibold text-slate-400">
                  {completedTodayCount} / {totalTodayCount} Completed
                </span>
                <Link
                  to="/career-coach/today"
                  className="text-xs font-bold text-indigo-400 hover:text-indigo-300 transition"
                >
                  View All Tasks &rarr;
                </Link>
              </div>
            </div>

            <div className="space-y-3">
              {todayTasks.length === 0 ? (
                <div className="p-6 bg-slate-900 border border-slate-800 rounded-xl text-center text-xs text-slate-400">
                  No tasks assigned for today. You are all caught up!
                </div>
              ) : (
                todayTasks.map((task) => (
                  <div
                    key={task._id}
                    className="p-4 bg-slate-900 border border-slate-750 rounded-xl flex items-center justify-between transition hover:border-slate-700"
                  >
                    <div className="flex items-center space-x-3">
                      <div
                        className={`p-2 rounded-lg text-xs font-bold ${
                          task.status === 'completed'
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : 'bg-indigo-500/20 text-indigo-300'
                        }`}
                      >
                        {task.type}
                      </div>
                      <div>
                        <h4 className={`text-sm font-semibold ${task.status === 'completed' ? 'text-slate-400 line-through' : 'text-white'}`}>
                          {task.title}
                        </h4>
                        <p className="text-xs text-slate-400 mt-0.5">{task.description}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <span className="text-xs text-slate-400">{task.estimatedMinutes}m</span>
                      <Link
                        to={task.relatedRoute || '/practice'}
                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-bold rounded-lg border border-slate-700 transition"
                      >
                        Start Task
                      </Link>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Current Roadmap Progress Overview */}
          <div className="bg-slate-850 border border-slate-800 p-6 rounded-2xl space-y-4 shadow-xl flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center space-x-2">
                  <Layers className="w-4 h-4 text-indigo-400" />
                  <span>Roadmap v{roadmap?.roadmapVersion || 1} Status</span>
                </h3>
                <span className="text-xs text-indigo-400 font-bold">{roadmap?.overallProgress || 0}% Complete</span>
              </div>

              <div className="w-full bg-slate-900 h-2.5 rounded-full overflow-hidden border border-slate-800">
                <div
                  className="bg-indigo-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${roadmap?.overallProgress || 0}%` }}
                />
              </div>

              <div className="space-y-2 pt-2">
                {roadmap?.phases?.map((phase) => (
                  <div key={phase._id} className="p-3 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-between text-xs">
                    <div>
                      <p className="font-semibold text-slate-200">Phase {phase.phaseNumber}: {phase.title}</p>
                      <p className="text-[10px] text-slate-500">{phase.focusArea}</p>
                    </div>
                    <span
                      className={`px-2 py-0.5 text-[10px] font-bold rounded ${
                        phase.status === 'completed'
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : phase.status === 'in_progress'
                          ? 'bg-indigo-500/20 text-indigo-300'
                          : 'bg-slate-800 text-slate-500'
                      }`}
                    >
                      {phase.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <Link
              to="/career-coach/roadmap"
              className="w-full py-2 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 rounded-xl text-center text-xs font-bold transition block mt-4"
            >
              View Full Roadmap Schedule &rarr;
            </Link>
          </div>
        </div>

        {/* Skill Heatmap Grid */}
        <div className="bg-slate-850 border border-slate-800 p-6 rounded-2xl space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center space-x-2">
              <Target className="w-5 h-5 text-indigo-400" />
              <span>Target Role Skill Heatmap & Gaps</span>
            </h3>
            <span className="text-xs text-slate-400">Target Role: {targetRole}</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {skillGaps.map((sg, idx) => {
              const statusColor =
                sg.priority === 'Critical'
                  ? 'border-rose-500/30 bg-rose-950/20 text-rose-300'
                  : sg.priority === 'High'
                  ? 'border-amber-500/30 bg-amber-950/20 text-amber-300'
                  : 'border-emerald-500/30 bg-emerald-950/20 text-emerald-300';

              return (
                <div key={idx} className={`p-4 rounded-xl border ${statusColor} space-y-2`}>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-white">{sg.skill}</span>
                    <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-slate-900 border border-slate-800">
                      {sg.priority}
                    </span>
                  </div>

                  <div className="flex items-baseline justify-between text-xs pt-1">
                    <span className="text-slate-400">Current Score:</span>
                    <span className="font-bold text-white">{sg.currentScore}/100</span>
                  </div>

                  <div className="flex items-baseline justify-between text-xs">
                    <span className="text-slate-400">Target Benchmark:</span>
                    <span className="font-semibold text-slate-300">{sg.targetScore}/100</span>
                  </div>

                  <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden border border-slate-800 mt-2">
                    <div
                      className={`h-full rounded-full ${
                        sg.currentScore >= sg.targetScore ? 'bg-emerald-500' : 'bg-indigo-500'
                      }`}
                      style={{ width: `${Math.min(100, sg.currentScore)}%` }}
                    />
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

export default CareerCoachDashboardPage;
