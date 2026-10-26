import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import MainLayout from '../components/layout/MainLayout';
import {
  Briefcase,
  Search,
  Filter,
  MapPin,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Bookmark,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Award,
  Layers,
  Zap,
} from 'lucide-react';
import { getJobOpenings, trackApplication } from '../services/placementIntelligenceApi';

const JobDiscoveryPage = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [workMode, setWorkMode] = useState('');
  const [sortBy, setSortBy] = useState('Best Match');
  const [selectedForCompare, setSelectedForCompare] = useState([]);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const res = await getJobOpenings({ search, workMode, sortBy });
      if (res.success) {
        setJobs(res.data || []);
      }
    } catch (err) {
      console.error('Error fetching jobs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [workMode, sortBy]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchJobs();
  };

  const toggleCompare = (jobId) => {
    if (selectedForCompare.includes(jobId)) {
      setSelectedForCompare(selectedForCompare.filter((id) => id !== jobId));
    } else {
      if (selectedForCompare.length >= 3) {
        alert('You can compare up to 3 jobs at a time.');
        return;
      }
      setSelectedForCompare([...selectedForCompare, jobId]);
    }
  };

  const handleTrackJob = async (jobId) => {
    try {
      const res = await trackApplication({ jobId, status: 'Saved' });
      if (res.success) {
        alert('Job saved to Application Tracker!');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to track application');
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6 max-w-6xl mx-auto">
        {/* Top Header Banner */}
        <div className="flex flex-col md:flex-row md:items-center justify-between bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-slate-800 p-6 rounded-2xl gap-4 shadow-xl">
          <div className="flex items-center space-x-4">
            <div className="p-3.5 bg-indigo-500/20 text-indigo-400 rounded-xl border border-indigo-500/30">
              <Briefcase className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Campus Job Discovery & Placement Openings</h1>
              <p className="text-sm text-slate-400 mt-1">
                Verified job openings evaluated dynamically against your eligibility profile & preparation score.
              </p>
            </div>
          </div>

          {selectedForCompare.length > 0 && (
            <Link
              to={`/jobs/compare?ids=${selectedForCompare.join(',')}`}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-600/20 flex items-center space-x-2 transition"
            >
              <Layers className="w-4 h-4" />
              <span>Compare Selected ({selectedForCompare.length}/3)</span>
            </Link>
          )}
        </div>

        {/* Filter & Search Bar */}
        <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 bg-slate-850 border border-slate-800 p-4 rounded-2xl shadow-lg">
          <div className="relative col-span-1 md:col-span-2">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by job title, role, or company..."
              className="w-full bg-slate-900 border border-slate-750 pl-9 pr-3 py-2.5 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <select
            value={workMode}
            onChange={(e) => setWorkMode(e.target.value)}
            className="bg-slate-900 border border-slate-750 text-slate-300 text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:border-indigo-500"
          >
            <option value="">All Work Modes</option>
            <option value="Onsite">Onsite</option>
            <option value="Hybrid">Hybrid</option>
            <option value="Remote">Remote</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-slate-900 border border-slate-750 text-slate-300 text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:border-indigo-500"
          >
            <option value="Best Match">Sort: Best Match</option>
            <option value="Readiness">Sort: Preparation Score</option>
            <option value="Deadline">Sort: Nearest Deadline</option>
            <option value="Salary">Sort: Highest Salary</option>
          </select>
        </form>

        {/* Jobs Grid */}
        {loading ? (
          <div className="py-24 text-center space-y-3">
            <Zap className="w-10 h-10 text-indigo-400 animate-spin mx-auto" />
            <p className="text-sm text-slate-400">Evaluating job openings against your profile & preparation readiness...</p>
          </div>
        ) : jobs.length === 0 ? (
          <div className="p-12 bg-slate-850 border border-slate-800 rounded-2xl text-center text-xs text-slate-400 space-y-2">
            <p className="text-base font-bold text-white">No jobs found matching your filters.</p>
            <p>Try resetting filters or searching for alternative roles.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {jobs.map((job) => {
              const company = job.companyId || {};
              const isEligible = job.eligibilityStatus === 'Eligible';
              const isSelected = selectedForCompare.includes(job._id);

              return (
                <div key={job._id} className="bg-slate-850 border border-slate-800 p-6 rounded-2xl space-y-4 shadow-xl flex flex-col justify-between hover:border-slate-700 transition">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-indigo-400 tracking-wider">
                          {company.name || 'Company'} &bull; {job.source}
                        </span>
                        <h2 className="text-lg font-bold text-white mt-0.5">{job.title}</h2>
                      </div>

                      <button
                        onClick={() => toggleCompare(job._id)}
                        className={`px-2.5 py-1 text-[10px] font-bold rounded-lg border transition ${
                          isSelected
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                            : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                        }`}
                      >
                        {isSelected ? '✓ Selected' : '+ Compare'}
                      </button>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
                      <span className="flex items-center space-x-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-500" />
                        <span>{job.location}</span>
                      </span>
                      <span>&bull;</span>
                      <span className="px-2 py-0.5 bg-slate-900 text-slate-300 font-semibold rounded text-[10px] border border-slate-800">
                        {job.workMode}
                      </span>
                      <span>&bull;</span>
                      <span className="text-slate-300 font-semibold">
                        {job.salaryMax > 0 ? `₹${job.salaryMin / 100000}L - ₹${job.salaryMax / 100000}L PA` : 'Salary Not Disclosed'}
                      </span>
                    </div>

                    {/* Eligibility & Readiness Badges */}
                    <div className="grid grid-cols-2 gap-3 pt-2">
                      <div className="p-2.5 bg-slate-900 border border-slate-800 rounded-xl space-y-0.5">
                        <span className="text-[10px] text-slate-400 font-medium">Eligibility Status</span>
                        <div className="flex items-center space-x-1 text-xs font-bold">
                          {isEligible ? (
                            <span className="text-emerald-400 flex items-center space-x-1">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Eligible</span>
                            </span>
                          ) : (
                            <span className="text-amber-400 flex items-center space-x-1">
                              <AlertTriangle className="w-3.5 h-3.5" />
                              <span>{job.eligibilityStatus}</span>
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="p-2.5 bg-slate-900 border border-slate-800 rounded-xl space-y-0.5">
                        <span className="text-[10px] text-slate-400 font-medium">Preparation Score</span>
                        <p className="text-xs font-bold text-indigo-300">{job.preparationReadinessScore}/100</p>
                      </div>
                    </div>

                    {/* Required Skills Badges */}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {job.requiredSkills?.map((s, idx) => (
                        <span key={idx} className="px-2 py-0.5 bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 rounded text-[10px] font-semibold">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
                    <div className="text-[11px] text-slate-500 flex items-center space-x-1">
                      <Clock className="w-3 h-3" />
                      <span>Deadline: {job.deadline ? new Date(job.deadline).toLocaleDateString() : 'Rolling'}</span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleTrackJob(job._id)}
                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-bold rounded-lg border border-slate-700 transition flex items-center space-x-1"
                      >
                        <Bookmark className="w-3.5 h-3.5" />
                        <span>Track</span>
                      </button>

                      <Link
                        to={`/jobs/${job._id}`}
                        className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-lg shadow-md transition flex items-center space-x-1"
                      >
                        <span>View & Prepare</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default JobDiscoveryPage;
