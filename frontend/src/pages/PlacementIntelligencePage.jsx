import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import MainLayout from '../components/layout/MainLayout';
import {
  TrendingUp,
  BarChart3,
  Award,
  Layers,
  CheckCircle2,
  AlertTriangle,
  ChevronLeft,
  Sparkles,
  Zap,
} from 'lucide-react';
import {
  getPlacementIntelligenceOverview,
  getSkillDemandVsReadiness,
} from '../services/placementIntelligenceApi';

const PlacementIntelligencePage = () => {
  const [data, setData] = useState(null);
  const [skillMatrix, setSkillMatrix] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchIntelligence = async () => {
    setLoading(true);
    try {
      const res = await getPlacementIntelligenceOverview();
      if (res.success) {
        setData(res.data);
      }
      const skillRes = await getSkillDemandVsReadiness();
      if (skillRes.success) {
        setSkillMatrix(skillRes.data || []);
      }
    } catch (err) {
      console.error('Error fetching placement intelligence:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIntelligence();
  }, []);

  if (loading) {
    return (
      <MainLayout>
        <div className="py-24 text-center space-y-3">
          <Zap className="w-10 h-10 text-indigo-400 animate-spin mx-auto" />
          <p className="text-sm text-slate-400">Loading Placement Intelligence Dashboard...</p>
        </div>
      </MainLayout>
    );
  }

  if (!data) return null;

  const { readinessScore, scoreInterpretation, targetRole, analytics } = data;
  const funnel = analytics?.funnel || [];
  const rates = analytics?.conversionRates || {};
  const rejection = analytics?.rejectionAnalysis || {};

  return (
    <MainLayout>
      <div className="space-y-6 max-w-6xl mx-auto">
        {/* Top Header Banner */}
        <div className="flex flex-col md:flex-row md:items-center justify-between bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-slate-800 p-6 rounded-2xl gap-4 shadow-xl">
          <div className="flex items-center space-x-4">
            <div className="p-3.5 bg-indigo-500/20 text-indigo-400 rounded-xl border border-indigo-500/30">
              <TrendingUp className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Central Placement Intelligence Dashboard</h1>
              <p className="text-sm text-slate-400 mt-1">
                Data-driven analytics on application conversion, rejection bottlenecks, and skill demand.
              </p>
            </div>
          </div>

          <div className="px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-center">
            <p className="text-[10px] text-slate-400 font-medium">Placement Readiness</p>
            <p className="text-xl font-extrabold text-indigo-300">{readinessScore}/100</p>
          </div>
        </div>

        {/* Funnel & Conversion Rates Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Visual Application Funnel Card */}
          <div className="lg:col-span-2 bg-slate-850 border border-slate-800 p-6 rounded-2xl space-y-4 shadow-xl">
            <h3 className="text-base font-bold text-white flex items-center space-x-2">
              <BarChart3 className="w-5 h-5 text-indigo-400" />
              <span>Campus Application Funnel</span>
            </h3>

            <div className="space-y-3">
              {funnel.map((item, idx) => (
                <div key={idx} className="p-3 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-200">{item.stage}</span>
                  <span className="font-extrabold text-indigo-300">{item.count} Applications</span>
                </div>
              ))}
            </div>
          </div>

          {/* Conversion Rates & Rejection Analysis Card */}
          <div className="bg-slate-850 border border-slate-800 p-6 rounded-2xl space-y-4 shadow-xl flex flex-col justify-between">
            <div className="space-y-4">
              <h3 className="text-base font-bold text-white flex items-center space-x-2">
                <Layers className="w-5 h-5 text-indigo-400" />
                <span>Conversion Metrics</span>
              </h3>

              <div className="space-y-3 text-xs">
                <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl flex justify-between">
                  <span className="text-slate-400">Applied &rarr; Assessment:</span>
                  <span className="font-bold text-emerald-400">{rates.appliedToAssessmentRate || 0}%</span>
                </div>

                <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl flex justify-between">
                  <span className="text-slate-400">Assessment &rarr; Interview:</span>
                  <span className="font-bold text-indigo-300">{rates.assessmentToInterviewRate || 0}%</span>
                </div>

                <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl flex justify-between">
                  <span className="text-slate-400">Interview &rarr; Offer:</span>
                  <span className="font-bold text-violet-400">{rates.interviewToOfferRate || 0}%</span>
                </div>
              </div>
            </div>

            <div className="p-3 bg-rose-950/20 border border-rose-500/20 rounded-xl space-y-1 text-xs text-rose-300 mt-4">
              <p className="font-bold text-rose-400">Rejection Stage Analysis</p>
              <p className="text-[11px]">
                Most Common Bottleneck: <strong>{rejection.mostCommonRejectionReason || 'None'}</strong>
              </p>
            </div>
          </div>
        </div>

        {/* Platform Job Skill Demand vs Student Skill Readiness Matrix */}
        <div className="bg-slate-850 border border-slate-800 p-6 rounded-2xl space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-indigo-400" />
              <span>Platform Job Skill Demand vs Student Skill Readiness</span>
            </h3>
            <span className="text-xs text-slate-400">Target Role: {targetRole}</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {skillMatrix.map((item, idx) => (
              <div key={idx} className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-2 text-xs">
                <div className="flex items-center justify-between font-bold text-white">
                  <span>{item.skill}</span>
                  <span className="text-indigo-400">Demand: {item.platformDemandScore}%</span>
                </div>

                <div className="flex items-center justify-between text-slate-400">
                  <span>Your Score: {item.studentScore}/100</span>
                  <span className={item.gap > 20 ? 'text-rose-400 font-bold' : 'text-emerald-400 font-bold'}>
                    Gap: -{item.gap}
                  </span>
                </div>

                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div className="bg-indigo-500 h-full rounded-full" style={{ width: `${item.studentScore}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default PlacementIntelligencePage;
