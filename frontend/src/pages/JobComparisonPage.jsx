import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import MainLayout from '../components/layout/MainLayout';
import {
  Layers,
  CheckCircle2,
  AlertTriangle,
  ChevronLeft,
  ArrowRight,
  Zap,
} from 'lucide-react';
import { compareJobs } from '../services/placementIntelligenceApi';

const JobComparisonPage = () => {
  const [searchParams] = useSearchParams();
  const idsParam = searchParams.get('ids') || '';
  const [comparison, setComparison] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchComparison = async () => {
      const jobIds = idsParam.split(',').filter(Boolean);
      if (jobIds.length === 0) {
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const res = await compareJobs(jobIds);
        if (res.success) {
          setComparison(res.data || []);
        }
      } catch (err) {
        console.error('Error comparing jobs:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchComparison();
  }, [idsParam]);

  if (loading) {
    return (
      <MainLayout>
        <div className="py-24 text-center space-y-3">
          <Zap className="w-10 h-10 text-indigo-400 animate-spin mx-auto" />
          <p className="text-sm text-slate-400">Comparing job requirements, eligibility & readiness scores...</p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6 max-w-6xl mx-auto">
        {/* Navigation */}
        <div className="flex items-center justify-between">
          <Link to="/jobs" className="text-xs text-slate-400 hover:text-white transition flex items-center space-x-1">
            <ChevronLeft className="w-4 h-4" />
            <span>Back to Job Openings</span>
          </Link>
        </div>

        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-slate-800 p-6 rounded-2xl space-y-2 shadow-xl">
          <h1 className="text-2xl font-bold text-white flex items-center space-x-2">
            <Layers className="w-7 h-7 text-indigo-400" />
            <span>Side-by-Side Placement Job Comparison Matrix</span>
          </h1>
          <p className="text-sm text-slate-400">
            Compare eligibility, preparation readiness, skill gaps, and application deadlines across target openings.
          </p>
        </div>

        {comparison.length === 0 ? (
          <div className="p-12 bg-slate-850 border border-slate-800 rounded-2xl text-center text-xs text-slate-400 space-y-2">
            <p className="text-base font-bold text-white">No jobs selected for comparison.</p>
            <p>Go to Job Discovery and select "+ Compare" on up to 3 job cards.</p>
            <Link to="/jobs" className="inline-block px-4 py-2 bg-indigo-600 text-white font-bold rounded-xl mt-2">
              Browse Job Openings
            </Link>
          </div>
        ) : (
          <div className="bg-slate-850 border border-slate-800 rounded-2xl p-6 overflow-x-auto shadow-xl">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-semibold uppercase text-[10px]">
                  <th className="p-3">Attribute</th>
                  {comparison.map((item) => (
                    <th key={item.jobId} className="p-3 min-w-[200px] text-white font-bold text-sm">
                      {item.title}
                      <span className="block text-xs font-normal text-indigo-400 mt-0.5">{item.companyName}</span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-200">
                <tr>
                  <td className="p-3 font-semibold text-slate-400">Location & Work Mode</td>
                  {comparison.map((item) => (
                    <td key={item.jobId} className="p-3">
                      {item.location} ({item.workMode})
                    </td>
                  ))}
                </tr>

                <tr>
                  <td className="p-3 font-semibold text-slate-400">Salary Package</td>
                  {comparison.map((item) => (
                    <td key={item.jobId} className="p-3 font-bold text-indigo-300">
                      {item.salaryRange}
                    </td>
                  ))}
                </tr>

                <tr>
                  <td className="p-3 font-semibold text-slate-400">Eligibility Status</td>
                  {comparison.map((item) => (
                    <td key={item.jobId} className="p-3 font-bold">
                      {item.eligibilityStatus === 'Eligible' ? (
                        <span className="text-emerald-400 flex items-center space-x-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Eligible</span>
                        </span>
                      ) : (
                        <span className="text-amber-400 flex items-center space-x-1">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          <span>{item.eligibilityStatus}</span>
                        </span>
                      )}
                    </td>
                  ))}
                </tr>

                <tr>
                  <td className="p-3 font-semibold text-slate-400">Preparation Readiness</td>
                  {comparison.map((item) => (
                    <td key={item.jobId} className="p-3 font-extrabold text-white text-base">
                      {item.preparationReadinessScore}/100
                    </td>
                  ))}
                </tr>

                <tr>
                  <td className="p-3 font-semibold text-slate-400">Top Priority Gap</td>
                  {comparison.map((item) => (
                    <td key={item.jobId} className="p-3 text-rose-400 font-semibold">
                      {item.topGap}
                    </td>
                  ))}
                </tr>

                <tr>
                  <td className="p-3 font-semibold text-slate-400">Application Status</td>
                  {comparison.map((item) => (
                    <td key={item.jobId} className="p-3 font-semibold">
                      <span className="px-2 py-0.5 bg-slate-900 border border-slate-800 rounded text-[10px]">
                        {item.applicationStatus}
                      </span>
                    </td>
                  ))}
                </tr>

                <tr>
                  <td className="p-3 font-semibold text-slate-400">Action</td>
                  {comparison.map((item) => (
                    <td key={item.jobId} className="p-3">
                      <Link
                        to={`/jobs/${item.jobId}`}
                        className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg transition inline-flex items-center space-x-1"
                      >
                        <span>View Job</span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default JobComparisonPage;
