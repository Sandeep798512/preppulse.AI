import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import MainLayout from '../components/layout/MainLayout';
import {
  Sparkles,
  FileText,
  GitCompare,
  HelpCircle,
  Code,
  Mic,
  BarChart3,
  Bot,
  MapPin,
  ArrowUpRight,
  TrendingUp,
  AlertTriangle,
  Award,
  Zap,
} from 'lucide-react';

import { getPlacementReadiness } from '../services/readinessApi';
import { getCareerCoachOverview } from '../services/careerCoachApi';
import AnimatedCounter from '../components/common/AnimatedCounter';

const DashboardPage = () => {
  const { user } = useAuth();
  const [selectedRole, setSelectedRole] = useState(user?.targetRoles?.[0] || 'Software Developer');
  const [readinessData, setReadinessData] = useState(null);

  useEffect(() => {
    const fetchReadiness = async () => {
      try {
        const res = await getPlacementReadiness();
        if (res.success) setReadinessData(res.data);
      } catch (e) {
        // Fallback
      }
    };
    fetchReadiness();
  }, []);

  const readinessMetrics = {
    placementReadinessScore: readinessData?.overallScore || 78,
    resumeScore: readinessData?.scoresBreakdown?.resume?.score || 82,
    aptitudeScore: readinessData?.scoresBreakdown?.aptitude?.score || 75,
    technicalScore: readinessData?.scoresBreakdown?.technical?.score || 80,
    codingScore: readinessData?.scoresBreakdown?.coding?.score || 72,
    interviewScore: readinessData?.scoresBreakdown?.interview?.score || 76,
    jdMatchScore: readinessData?.scoresBreakdown?.jobMatch?.score || 84,
    streakDays: 5,
    completedTasks: 18,
    weakAreas: readinessData?.weakAreas?.length ? readinessData.weakAreas : ['SQL Joins & Indexing', 'STAR Behavioral Answers', 'Dynamic Programming Basics'],
  };

  const moduleCards = [
    {
      title: 'AI Resume Analyzer',
      desc: 'Extract text, check ATS compatibility score & content quality.',
      path: '/resume-analyzer',
      icon: FileText,
      color: 'from-blue-500/10 to-indigo-500/10 border-blue-500/30 text-blue-400',
      badge: `${readinessMetrics.resumeScore}/100`,
    },
    {
      title: 'Resume vs JD Matcher',
      desc: '5-factor mathematical comparison against target job descriptions.',
      path: '/jd-matcher',
      icon: GitCompare,
      color: 'from-emerald-500/10 to-teal-500/10 border-emerald-500/30 text-emerald-400',
      badge: `${readinessMetrics.jdMatchScore}% Match`,
    },
    {
      title: 'Preparation Roadmap',
      desc: 'Weekly structured study plan generated dynamically for your target role.',
      path: '/roadmap',
      icon: MapPin,
      color: 'from-purple-500/10 to-pink-500/10 border-purple-500/30 text-purple-400',
      badge: '4-Week Plan',
    },
    {
      title: 'Aptitude Practice',
      desc: 'Timed Quant, Logical Reasoning & Verbal ability quizzes.',
      path: '/aptitude',
      icon: HelpCircle,
      color: 'from-amber-500/10 to-orange-500/10 border-amber-500/30 text-amber-400',
      badge: `${readinessMetrics.aptitudeScore}% Score`,
    },
    {
      title: 'Technical MCQs',
      desc: 'Topic-wise CS fundamentals: DSA, DBMS, OS, Networks & Languages.',
      path: '/technical-mcq',
      icon: HelpCircle,
      color: 'from-cyan-500/10 to-sky-500/10 border-cyan-500/30 text-cyan-400',
      badge: `${readinessMetrics.technicalScore}% Accuracy`,
    },
    {
      title: 'Coding Practice Engine',
      desc: 'LeetCode-style code runner with test-case verification in Java, Python & JS.',
      path: '/coding',
      icon: Code,
      color: 'from-rose-500/10 to-red-500/10 border-rose-500/30 text-rose-400',
      badge: `${readinessMetrics.codingScore}% Solved`,
    },
    {
      title: 'AI Mock Interview',
      desc: 'Adaptive voice/text interviews with confidence & technical evaluation.',
      path: '/mock-interview',
      icon: Mic,
      color: 'from-violet-500/10 to-purple-500/10 border-violet-500/30 text-violet-400',
      badge: `${readinessMetrics.interviewScore}/100`,
    },
    {
      title: 'AI Coach Assistant',
      desc: 'Ask follow-up questions, request sample answers & study guidance.',
      path: '/ai-coach',
      icon: Bot,
      color: 'from-indigo-500/10 to-blue-500/10 border-indigo-500/30 text-indigo-400',
      badge: '24/7 AI Tutor',
    },
  ];

  return (
    <MainLayout>
      <div className="space-y-8">
        {/* Welcome Header & Target Role Selector */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-850 border border-slate-800 rounded-2xl p-6 shadow-xl">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <h1 className="text-2xl font-bold text-white">
                Welcome back, {user?.name || 'Student'}! 👋
              </h1>
              {user?.isDemo && (
                <span className="text-[10px] uppercase tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded-full font-bold">
                  Viva Demo Mode
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400">
              {user?.education?.college || 'Computer Science & Engineering'} • Class of {user?.education?.graduationYear || 2026} • CGPA: {user?.education?.cgpa || 8.5}
            </p>
          </div>

          <div className="flex items-center space-x-3 bg-slate-900 border border-slate-700/70 p-2.5 rounded-xl">
            <span className="text-xs font-semibold text-slate-400 pl-2">Target Role:</span>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="bg-slate-800 border border-slate-700 text-white text-xs font-bold rounded-lg px-3 py-1.5 focus:outline-none focus:border-brand-500 cursor-pointer"
            >
              {(user?.targetRoles?.length ? user.targetRoles : ['Software Developer', 'Full Stack Developer', 'Backend Developer', 'Data Analyst', 'AI/ML Engineer']).map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Composite Placement Readiness Score Display */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 bg-gradient-to-br from-brand-900/60 via-slate-850 to-slate-900 border border-brand-500/30 rounded-2xl p-6 flex flex-col justify-between shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10 text-brand-400">
              <Award className="w-32 h-32" />
            </div>

            <div className="space-y-3 relative z-10">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-brand-400 bg-brand-500/10 px-2.5 py-1 rounded-full border border-brand-500/20">
                  Overall Evaluation
                </span>
                <span className="text-xs text-slate-400 font-medium flex items-center space-x-1">
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                  <span>+5% this week</span>
                </span>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-slate-300">Placement Preparation Score</h3>
                <div className="flex items-baseline space-x-2 pt-2">
                  <span className="text-5xl font-extrabold text-white tracking-tight">
                    <AnimatedCounter target={readinessMetrics.placementReadinessScore} duration={1600} />
                  </span>
                  <span className="text-lg font-bold text-slate-400">/ 100</span>
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed pt-1">
                Your current preparation readiness score is <strong className="text-brand-400">{readinessMetrics.placementReadinessScore}/100</strong> based on weighted performance across Resume (15%), Aptitude (15%), Technical (20%), Coding (20%), Interview (20%), and JD Match (10%).
              </p>
            </div>

            <div className="pt-6 relative z-10">
              <Link
                to="/analytics"
                className="w-full bg-brand-600 hover:bg-brand-500 text-white font-semibold py-2.5 rounded-xl text-xs transition flex items-center justify-center space-x-2 shadow-md shadow-brand-600/20"
              >
                <span>View Score Calculation Breakdown</span>
                <ArrowUpRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Quick Metrics Grid */}
          <div className="lg:col-span-2 grid grid-cols-2 sm:grid-cols-3 gap-4">
            <div className="bg-slate-850 border border-slate-800 rounded-2xl p-4 space-y-2 hover:border-blue-500/30 transition-all hover:-translate-y-0.5">
              <div className="text-xs text-slate-400 font-medium">Resume Quality</div>
              <div className="text-2xl font-bold text-blue-400">
                <AnimatedCounter target={readinessMetrics.resumeScore} duration={1300} suffix="%" />
              </div>
              <div className="text-[11px] text-slate-400">AI Compatibility Score</div>
            </div>

            <div className="bg-slate-850 border border-slate-800 rounded-2xl p-4 space-y-2 hover:border-amber-500/30 transition-all hover:-translate-y-0.5">
              <div className="text-xs text-slate-400 font-medium">Aptitude Score</div>
              <div className="text-2xl font-bold text-amber-400">
                <AnimatedCounter target={readinessMetrics.aptitudeScore} duration={1300} suffix="%" />
              </div>
              <div className="text-[11px] text-slate-400">Quant & Verbal</div>
            </div>

            <div className="bg-slate-850 border border-slate-800 rounded-2xl p-4 space-y-2 hover:border-cyan-500/30 transition-all hover:-translate-y-0.5">
              <div className="text-xs text-slate-400 font-medium">Technical MCQs</div>
              <div className="text-2xl font-bold text-cyan-400">
                <AnimatedCounter target={readinessMetrics.technicalScore} duration={1300} suffix="%" />
              </div>
              <div className="text-[11px] text-slate-400">CS Fundamentals</div>
            </div>

            <div className="bg-slate-850 border border-slate-800 rounded-2xl p-4 space-y-2 hover:border-rose-500/30 transition-all hover:-translate-y-0.5">
              <div className="text-xs text-slate-400 font-medium">Coding Solved</div>
              <div className="text-2xl font-bold text-rose-400">
                <AnimatedCounter target={readinessMetrics.codingScore} duration={1300} suffix="%" />
              </div>
              <div className="text-[11px] text-slate-400">Test Cases Passed</div>
            </div>

            <div className="bg-slate-850 border border-slate-800 rounded-2xl p-4 space-y-2 hover:border-violet-500/30 transition-all hover:-translate-y-0.5">
              <div className="text-xs text-slate-400 font-medium">Mock Interview</div>
              <div className="text-2xl font-bold text-violet-400">
                <AnimatedCounter target={readinessMetrics.interviewScore} duration={1300} />/100
              </div>
              <div className="text-[11px] text-slate-400">Voice & Technical</div>
            </div>

            <div className="bg-slate-850 border border-slate-800 rounded-2xl p-4 space-y-2 hover:border-emerald-500/30 transition-all hover:-translate-y-0.5">
              <div className="text-xs text-slate-400 font-medium">Prep Streak</div>
              <div className="text-2xl font-bold text-emerald-400 flex items-center space-x-1">
                <Zap className="w-5 h-5 fill-emerald-400" />
                <span>
                  <AnimatedCounter target={readinessMetrics.streakDays} duration={1000} /> Days
                </span>
              </div>
              <div className="text-[11px] text-slate-400">Active Daily Practice</div>
            </div>
          </div>
        </div>

        {/* Actionable Weak Area Banner */}
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start space-x-3">
            <div className="p-2 bg-amber-500/20 rounded-xl text-amber-400 mt-0.5">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-amber-300">Identified Focus Areas for Improvement</h4>
              <div className="flex flex-wrap gap-2 pt-1">
                {readinessMetrics.weakAreas.map((area, idx) => (
                  <span key={idx} className="text-xs bg-slate-900/80 border border-amber-500/30 text-amber-200 px-2.5 py-0.5 rounded-full font-medium">
                    • {area}
                  </span>
                ))}
              </div>
            </div>
          </div>
          <Link
            to="/roadmap"
            className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl transition self-start md:self-auto flex items-center space-x-1"
          >
            <span>Open Customized Roadmap</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Modules Grid */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-brand-400" />
              <span>Placement Preparation Modules</span>
            </h2>
            <span className="text-xs text-slate-400">Select any module to start practicing</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {moduleCards.map((mod, i) => {
              const Icon = mod.icon;
              return (
                <Link
                  key={i}
                  to={mod.path}
                  className={`bg-slate-850 border border-slate-800 rounded-2xl p-5 hover:border-brand-500/50 transition-all flex flex-col justify-between group shadow-sm`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${mod.color} border flex items-center justify-center`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className="text-[11px] font-semibold bg-slate-900 border border-slate-700 px-2 py-0.5 rounded-full text-slate-300">
                        {mod.badge}
                      </span>
                    </div>

                    <div>
                      <h3 className="font-bold text-white text-base group-hover:text-brand-400 transition flex items-center justify-between">
                        <span>{mod.title}</span>
                        <ArrowUpRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition text-brand-400" />
                      </h3>
                      <p className="text-xs text-slate-400 mt-1 leading-relaxed">{mod.desc}</p>
                    </div>
                  </div>

                  <div className="pt-4 text-xs font-semibold text-brand-400 flex items-center space-x-1 group-hover:translate-x-1 transition">
                    <span>Launch Module</span>
                    <span>→</span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default DashboardPage;
