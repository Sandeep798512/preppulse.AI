import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import MainLayout from '../components/layout/MainLayout';
import {
  Trophy,
  Award,
  CheckCircle2,
  XCircle,
  Clock,
  Sparkles,
  ChevronLeft,
  RefreshCw,
  Zap,
  Target,
  BarChart3,
  Layers,
  Activity,
  AlertTriangle,
  RotateCcw,
  BookOpen,
  ArrowRight,
  Shield,
  Briefcase,
  Code,
  FileText,
  HelpCircle,
  Mic,
} from 'lucide-react';
import {
  getPlacementReadiness,
  recalculatePlacementReadiness,
} from '../services/readinessApi';
import confetti from 'canvas-confetti';

const PlacementReadinessPage = () => {
  const [readiness, setReadiness] = useState(null);
  const [loading, setLoading] = useState(true);
  const [recalculating, setRecalculating] = useState(false);
  const [error, setError] = useState('');

  const fetchReadiness = async () => {
    setLoading(true);
    try {
      const res = await getPlacementReadiness();
      if (res.success) {
        setReadiness(res.data);
        if (res.data.overallScore >= 75) {
          confetti({
            particleCount: 120,
            spread: 80,
            origin: { y: 0.6 },
          });
        }
      }
    } catch (err) {
      console.error('Error fetching placement readiness:', err);
      setError('Failed to load placement readiness score.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReadiness();
  }, []);

  const handleRecalculate = async () => {
    setRecalculating(true);
    try {
      const res = await recalculatePlacementReadiness();
      if (res.success) {
        setReadiness(res.data);
      }
    } catch (err) {
      alert('Failed to recalculate readiness score.');
    } finally {
      setRecalculating(false);
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="py-24 text-center space-y-3">
          <RefreshCw className="w-10 h-10 text-indigo-400 animate-spin mx-auto" />
          <p className="text-sm text-slate-400">Computing Central Placement Readiness Engine...</p>
        </div>
      </MainLayout>
    );
  }

  if (error || !readiness) {
    return (
      <MainLayout>
        <div className="p-6 bg-rose-500/10 border border-rose-500/20 text-rose-300 rounded-2xl text-center space-y-4">
          <p className="text-base font-semibold">{error || 'Readiness data not found'}</p>
        </div>
      </MainLayout>
    );
  }

  const breakdown = readiness.scoresBreakdown || {};

  return (
    <MainLayout>
      <div className="space-y-6 max-w-6xl mx-auto">
        {/* Top Banner */}
        <div className="flex flex-col md:flex-row md:items-center justify-between bg-gradient-to-r from-slate-900 via-slate-850 to-indigo-950 border border-slate-800 p-6 rounded-2xl gap-4 shadow-xl">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-indigo-500/20 text-indigo-400 rounded-xl border border-indigo-500/30">
              <Trophy className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-2xl font-bold text-white">Central Placement Readiness Engine</h1>
                <span className="px-2.5 py-0.5 bg-indigo-500/10 text-indigo-300 text-xs font-semibold rounded-full border border-indigo-500/20">
                  {readiness.scoringVersion || 'v1.0'} Engine
                </span>
              </div>
              <p className="text-sm text-slate-400 mt-1">
                Deterministic multi-dimensional assessment of your campus software placement preparedness.
              </p>
            </div>
          </div>

          <button
            onClick={handleRecalculate}
            disabled={recalculating}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-600/20 flex items-center space-x-2 transition disabled:opacity-50"
          >
            <RotateCcw className={`w-4 h-4 ${recalculating ? 'animate-spin' : ''}`} />
            <span>{recalculating ? 'Recalculating...' : 'Recalculate Readiness'}</span>
          </button>
        </div>

        {/* Hero Scorecard & Data Coverage Card */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Readiness Score Box */}
          <div className="bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-850 border border-indigo-500/30 p-6 rounded-2xl flex flex-col justify-between shadow-2xl relative overflow-hidden">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider flex items-center space-x-1.5">
                  <Award className="w-4 h-4" />
                  <span>Overall Readiness Score</span>
                </span>
                <span className="px-3 py-1 bg-indigo-500/20 text-indigo-300 text-xs font-semibold rounded-full border border-indigo-500/30">
                  {readiness.scoreInterpretation}
                </span>
              </div>

              <div className="flex items-baseline space-x-3 pt-2">
                <span className="text-6xl font-extrabold text-white">{readiness.overallScore}</span>
                <span className="text-xl text-slate-400 font-semibold">/ 100</span>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                Calculated deterministically based on your performance across all 7 platform preparation modules.
              </p>
            </div>

            {/* Data Coverage Indicator */}
            <div className="pt-6 border-t border-slate-800/80 mt-6 space-y-2">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-slate-400">Assessment Evidence Coverage:</span>
                <span className="text-indigo-400">{readiness.dataCoveragePercentage}% ({readiness.confidenceLevel})</span>
              </div>
              <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden border border-slate-800">
                <div
                  className="bg-indigo-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${readiness.dataCoveragePercentage}%` }}
                />
              </div>
            </div>
          </div>

          {/* Explainable Contributions Grid (6 cols / cards) */}
          <div className="lg:col-span-2 bg-slate-850 border border-slate-800 p-6 rounded-2xl space-y-4 shadow-xl">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center space-x-2">
              <BarChart3 className="w-4 h-4 text-indigo-400" />
              <span>Explainable Module Score Breakdown</span>
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              {/* Coding 20% */}
              <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl space-y-1">
                <span className="text-[10px] text-slate-400 font-medium">Coding (20%)</span>
                <p className="text-lg font-bold text-rose-400">{breakdown.coding?.score || 0}/100</p>
                <p className="text-[10px] text-slate-500">Contrib: +{breakdown.coding?.contribution || 0}</p>
              </div>

              {/* Interview 20% */}
              <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl space-y-1">
                <span className="text-[10px] text-slate-400 font-medium">Interview (20%)</span>
                <p className="text-lg font-bold text-violet-400">{breakdown.interview?.score || 0}/100</p>
                <p className="text-[10px] text-slate-500">Contrib: +{breakdown.interview?.contribution || 0}</p>
              </div>

              {/* Technical 15% */}
              <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl space-y-1">
                <span className="text-[10px] text-slate-400 font-medium">Technical MCQs (15%)</span>
                <p className="text-lg font-bold text-cyan-400">{breakdown.technical?.score || 0}/100</p>
                <p className="text-[10px] text-slate-500">Contrib: +{breakdown.technical?.contribution || 0}</p>
              </div>

              {/* Aptitude 15% */}
              <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl space-y-1">
                <span className="text-[10px] text-slate-400 font-medium">Aptitude (15%)</span>
                <p className="text-lg font-bold text-amber-400">{breakdown.aptitude?.score || 0}/100</p>
                <p className="text-[10px] text-slate-500">Contrib: +{breakdown.aptitude?.contribution || 0}</p>
              </div>

              {/* Resume 10% */}
              <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl space-y-1">
                <span className="text-[10px] text-slate-400 font-medium">Resume (10%)</span>
                <p className="text-lg font-bold text-blue-400">{breakdown.resume?.score || 0}/100</p>
                <p className="text-[10px] text-slate-500">Contrib: +{breakdown.resume?.contribution || 0}</p>
              </div>

              {/* Job Match 10% */}
              <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl space-y-1">
                <span className="text-[10px] text-slate-400 font-medium">JD Match (10%)</span>
                <p className="text-lg font-bold text-emerald-400">{breakdown.jobMatch?.score || 0}/100</p>
                <p className="text-[10px] text-slate-500">Contrib: +{breakdown.jobMatch?.contribution || 0}</p>
              </div>

              {/* Communication 10% */}
              <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl space-y-1">
                <span className="text-[10px] text-slate-400 font-medium">Communication (10%)</span>
                <p className="text-lg font-bold text-teal-400">{breakdown.communication?.score || 0}/100</p>
                <p className="text-[10px] text-slate-500">Contrib: +{breakdown.communication?.contribution || 0}</p>
              </div>

              {/* Data Total */}
              <div className="p-3 bg-indigo-950/40 border border-indigo-500/30 rounded-xl space-y-1">
                <span className="text-[10px] text-indigo-300 font-semibold">Total Readiness</span>
                <p className="text-lg font-bold text-white">{readiness.overallScore}/100</p>
                <p className="text-[10px] text-indigo-400 font-medium">100% Weighted Sum</p>
              </div>
            </div>
          </div>
        </div>

        {/* Target Role Readiness Cards */}
        <div className="bg-slate-850 border border-slate-800 p-6 rounded-2xl space-y-4 shadow-xl">
          <h3 className="text-base font-bold text-white flex items-center space-x-2">
            <Target className="w-5 h-5 text-indigo-400" />
            <span>Target Role Specific Readiness</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {readiness.targetRolesReadiness?.map((tr, idx) => (
              <div key={idx} className="bg-slate-900 border border-slate-750 p-4 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-white">{tr.role}</h4>
                  <span className="px-2.5 py-1 bg-indigo-500/20 text-indigo-300 text-xs font-bold rounded-lg border border-indigo-500/30">
                    {tr.score}% Match
                  </span>
                </div>

                {tr.missingSkills?.length > 0 && (
                  <div className="text-xs text-slate-400">
                    <span className="text-amber-400 font-medium">Missing Role Skills: </span>
                    <span>{tr.missingSkills.join(', ')}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Critical Placement Gaps & Skill Matrix */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Critical Gaps */}
          <div className="bg-slate-850 border border-slate-800 p-6 rounded-2xl space-y-4 shadow-xl">
            <h3 className="text-sm font-bold text-rose-400 uppercase tracking-wider flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4" />
              <span>Critical Placement Risks & Gaps</span>
            </h3>

            <div className="space-y-3">
              {readiness.criticalGaps?.map((cg, i) => (
                <div key={i} className="p-3.5 bg-rose-950/30 border border-rose-500/20 rounded-xl text-xs text-rose-200">
                  <span className="font-bold text-rose-400">[{cg.severity}] </span>
                  <span>{cg.gap}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Unified Skill Matrix */}
          <div className="bg-slate-850 border border-slate-800 p-6 rounded-2xl space-y-4 shadow-xl">
            <h3 className="text-sm font-bold text-emerald-400 uppercase tracking-wider flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>Unified Skill Matrix</span>
            </h3>

            <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto">
              {readiness.skillMatrix?.map((sm, i) => {
                const color =
                  sm.level === 'Strong'
                    ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20'
                    : sm.level === 'Moderate'
                    ? 'bg-indigo-500/10 text-indigo-300 border-indigo-500/20'
                    : 'bg-rose-500/10 text-rose-300 border-rose-500/20';

                return (
                  <span key={i} className={`px-3 py-1 rounded-lg text-xs font-semibold border ${color}`}>
                    {sm.skill} ({sm.level})
                  </span>
                );
              })}
            </div>
          </div>
        </div>

        {/* Prioritized Action Plan & Weekly Schedule */}
        <div className="bg-slate-850 border border-slate-800 p-6 rounded-2xl space-y-5 shadow-xl">
          <h3 className="text-base font-bold text-white flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-indigo-400" />
            <span>Prioritized Placement Preparation Action Plan</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {readiness.recommendations?.map((rec, i) => (
              <div key={i} className="bg-slate-900 border border-slate-750 p-4 rounded-xl flex items-start space-x-3">
                <span className="px-2 py-0.5 bg-indigo-500/20 text-indigo-300 text-[10px] font-bold rounded">
                  {rec.priority}
                </span>
                <div className="space-y-1 text-xs text-slate-200">
                  <p className="font-semibold">{rec.action}</p>
                  <p className="text-[11px] text-slate-400">Est. Time: {rec.estimatedMinutes} mins</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default PlacementReadinessPage;
