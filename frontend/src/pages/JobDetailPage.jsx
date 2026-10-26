import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import MainLayout from '../components/layout/MainLayout';
import {
  Briefcase,
  MapPin,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ChevronLeft,
  Sparkles,
  Award,
  Layers,
  Zap,
  Bookmark,
  ExternalLink,
  Target,
} from 'lucide-react';
import {
  getJobOpeningById,
  generateJobPreparationPlan,
  trackApplication,
} from '../services/placementIntelligenceApi';

const JobDetailPage = () => {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [prepPlan, setPrepPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generatingPlan, setGeneratingPlan] = useState(false);

  const fetchDetail = async () => {
    setLoading(true);
    try {
      const res = await getJobOpeningById(id);
      if (res.success) {
        setData(res.data);
      }
    } catch (err) {
      console.error('Error fetching job details:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetail();
  }, [id]);

  const handleGeneratePlan = async () => {
    setGeneratingPlan(true);
    try {
      const res = await generateJobPreparationPlan(id);
      if (res.success) {
        setPrepPlan(res.data);
        alert('Company-specific 14-day preparation plan generated successfully!');
      }
    } catch (err) {
      alert('Failed to generate preparation plan');
    } finally {
      setGeneratingPlan(false);
    }
  };

  const handleTrackJob = async (status = 'Saved') => {
    try {
      const res = await trackApplication({ jobId: id, status });
      if (res.success) {
        alert(`Application tracked as "${status}"!`);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to track application');
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="py-24 text-center space-y-3">
          <Zap className="w-10 h-10 text-indigo-400 animate-spin mx-auto" />
          <p className="text-sm text-slate-400">Loading job analysis & company preparation profile...</p>
        </div>
      </MainLayout>
    );
  }

  if (!data || !data.job) return null;

  const { job, eligibility, readiness, skillGaps } = data;
  const company = job.companyId || {};

  return (
    <MainLayout>
      <div className="space-y-6 max-w-5xl mx-auto">
        {/* Navigation */}
        <div className="flex items-center justify-between">
          <Link to="/jobs" className="text-xs text-slate-400 hover:text-white transition flex items-center space-x-1">
            <ChevronLeft className="w-4 h-4" />
            <span>Back to Job Openings</span>
          </Link>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => handleTrackJob('Saved')}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-bold rounded-xl border border-slate-700 transition flex items-center space-x-1.5"
            >
              <Bookmark className="w-4 h-4 text-indigo-400" />
              <span>Save Job</span>
            </button>

            <button
              onClick={() => handleTrackJob('Applied')}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-emerald-600/20 transition flex items-center space-x-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Mark as Applied</span>
            </button>
          </div>
        </div>

        {/* Job Header */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4 shadow-xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <span className="text-xs uppercase font-bold text-indigo-400 tracking-wider">
                {company.name} &bull; {company.companyType || 'Product-Based'}
              </span>
              <h1 className="text-2xl font-bold text-white mt-1">{job.title}</h1>
              <p className="text-xs text-slate-400 mt-1">
                {job.location} &bull; {job.workMode} &bull; {job.employmentType}
              </p>
            </div>

            <div className="flex items-center space-x-4 bg-slate-900/80 p-4 rounded-xl border border-slate-800">
              <div className="text-center px-3 border-r border-slate-800">
                <p className="text-[10px] text-slate-400 font-medium">Eligibility</p>
                <p className={`text-sm font-bold ${eligibility.isEligible ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {eligibility.status}
                </p>
              </div>

              <div className="text-center px-3">
                <p className="text-[10px] text-slate-400 font-medium">Preparation Score</p>
                <p className="text-sm font-bold text-indigo-300">{readiness.companyReadinessScore}/100</p>
              </div>
            </div>
          </div>
        </div>

        {/* Eligibility Explanation & Preparation Readiness Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Eligibility Explanation Card */}
          <div className="bg-slate-850 border border-slate-800 p-6 rounded-2xl space-y-4 shadow-xl">
            <h3 className="text-base font-bold text-white flex items-center space-x-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              <span>Eligibility Verification Breakdown</span>
            </h3>

            <div className="space-y-3">
              {eligibility.explanations?.map((exp, idx) => (
                <div key={idx} className="p-3 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-between text-xs">
                  <div className="space-y-0.5">
                    <p className="font-semibold text-white">{exp.criterion}</p>
                    <p className="text-[11px] text-slate-400">{exp.detail}</p>
                  </div>
                  <span
                    className={`px-2 py-0.5 font-bold text-[10px] rounded ${
                      exp.status === 'pass'
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : exp.status === 'fail'
                        ? 'bg-rose-500/20 text-rose-400'
                        : 'bg-amber-500/20 text-amber-300'
                    }`}
                  >
                    {exp.status.toUpperCase()}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Company Readiness Breakdown Card */}
          <div className="bg-slate-850 border border-slate-800 p-6 rounded-2xl space-y-4 shadow-xl">
            <h3 className="text-base font-bold text-white flex items-center space-x-2">
              <Award className="w-5 h-5 text-indigo-400" />
              <span>Company Preparation Readiness (7-Factor)</span>
            </h3>

            <div className="grid grid-cols-2 gap-2 text-center text-xs">
              {Object.entries(readiness.breakdown || {}).map(([key, item]) => (
                <div key={key} className="p-2.5 bg-slate-900 border border-slate-800 rounded-xl space-y-1">
                  <span className="text-[10px] text-slate-400 uppercase font-medium">{key}</span>
                  <p className="text-sm font-bold text-indigo-300">{item.score}/100</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 14-Day Company Preparation Plan Trigger */}
        <div className="bg-slate-850 border border-slate-800 p-6 rounded-2xl space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white flex items-center space-x-2">
                <Sparkles className="w-5 h-5 text-indigo-400" />
                <span>Company-Specific 14-Day Preparation Schedule</span>
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Generate a tailored 14-day intensive study plan targeting {company.name}'s specific role requirements.
              </p>
            </div>

            <button
              onClick={handleGeneratePlan}
              disabled={generatingPlan}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-600/20 transition disabled:opacity-50"
            >
              {generatingPlan ? 'Generating...' : 'Generate 14-Day Plan'}
            </button>
          </div>

          {prepPlan && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-4 border-t border-slate-800">
              {prepPlan.tasks?.map((t) => (
                <div key={t._id || t.dayNumber} className="p-3 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-between text-xs">
                  <div>
                    <p className="font-bold text-white">{t.title}</p>
                    <p className="text-[11px] text-slate-400">{t.description}</p>
                  </div>
                  <Link
                    to={t.relatedRoute || '/practice'}
                    className="px-3 py-1 bg-indigo-500/20 text-indigo-300 text-[10px] font-bold rounded border border-indigo-500/30"
                  >
                    Start
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default JobDetailPage;
