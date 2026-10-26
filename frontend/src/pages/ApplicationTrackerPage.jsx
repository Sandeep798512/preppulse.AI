import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import MainLayout from '../components/layout/MainLayout';
import {
  Bookmark,
  CheckCircle2,
  Clock,
  Briefcase,
  Layers,
  ChevronLeft,
  Plus,
  Trash2,
  Edit3,
  Calendar,
  AlertTriangle,
  Zap,
} from 'lucide-react';
import {
  getApplications,
  updateApplication,
  deleteApplication,
  getUpcomingActions,
} from '../services/placementIntelligenceApi';

const ApplicationTrackerPage = () => {
  const [applications, setApplications] = useState([]);
  const [upcoming, setUpcoming] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState('');

  const fetchApps = async () => {
    setLoading(true);
    try {
      const res = await getApplications(selectedStatus);
      if (res.success) {
        setApplications(res.data || []);
      }
      const upRes = await getUpcomingActions();
      if (upRes.success) {
        setUpcoming(upRes.data.upcomingFollowUps || []);
      }
    } catch (err) {
      console.error('Error fetching applications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApps();
  }, [selectedStatus]);

  const handleStatusChange = async (appId, newStatus) => {
    try {
      const res = await updateApplication(appId, { status: newStatus });
      if (res.success) {
        setApplications((prev) =>
          prev.map((a) => (a._id === appId ? { ...a, status: newStatus } : a))
        );
      }
    } catch (err) {
      alert('Failed to update status');
    }
  };

  const handleDelete = async (appId) => {
    if (!window.confirm('Remove this application record from tracker?')) return;
    try {
      await deleteApplication(appId);
      setApplications((prev) => prev.filter((a) => a._id !== appId));
    } catch (err) {
      alert('Failed to delete application');
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="py-24 text-center space-y-3">
          <Zap className="w-10 h-10 text-indigo-400 animate-spin mx-auto" />
          <p className="text-sm text-slate-400">Loading Job Application Tracker...</p>
        </div>
      </MainLayout>
    );
  }

  const statuses = [
    'Saved',
    'Planning to Apply',
    'Applied',
    'Assessment',
    'Technical Interview',
    'HR Interview',
    'Offer Received',
    'Selected',
    'Rejected',
  ];

  return (
    <MainLayout>
      <div className="space-y-6 max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-slate-800 p-6 rounded-2xl gap-4 shadow-xl">
          <div className="flex items-center space-x-4">
            <div className="p-3.5 bg-indigo-500/20 text-indigo-400 rounded-xl border border-indigo-500/30">
              <Bookmark className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Job Application & Interview Tracker</h1>
              <p className="text-sm text-slate-400 mt-1">
                Track your active campus applications, interview schedules, and recruiter follow-ups.
              </p>
            </div>
          </div>

          <Link
            to="/jobs"
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-600/20 flex items-center space-x-2 transition"
          >
            <Plus className="w-4 h-4" />
            <span>Discover & Track New Job</span>
          </Link>
        </div>

        {/* Filter Bar */}
        <div className="flex items-center space-x-3 bg-slate-850 border border-slate-800 p-4 rounded-2xl shadow-lg overflow-x-auto">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider shrink-0">Filter Status:</span>
          <button
            onClick={() => setSelectedStatus('')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition shrink-0 ${
              selectedStatus === '' ? 'bg-indigo-600 text-white' : 'bg-slate-900 text-slate-400 hover:text-white'
            }`}
          >
            All Applications ({applications.length})
          </button>
          {statuses.map((st) => (
            <button
              key={st}
              onClick={() => setSelectedStatus(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition shrink-0 ${
                selectedStatus === st ? 'bg-indigo-600 text-white' : 'bg-slate-900 text-slate-400 hover:text-white'
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        {/* Applications List */}
        <div className="space-y-4">
          {applications.length === 0 ? (
            <div className="p-12 bg-slate-850 border border-slate-800 rounded-2xl text-center text-xs text-slate-400 space-y-2">
              <p className="text-base font-bold text-white">No applications tracked yet.</p>
              <p>Save job openings from Job Discovery to track your applications here.</p>
            </div>
          ) : (
            applications.map((app) => {
              const job = app.jobId || {};
              const company = app.companyId || {};

              return (
                <div
                  key={app._id}
                  className="bg-slate-850 border border-slate-800 p-5 rounded-2xl space-y-4 shadow-xl hover:border-slate-750 transition"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">
                        {company.name || 'Company'} &bull; {app.source}
                      </span>
                      <h3 className="text-base font-bold text-white">{job.title || 'Job Opening'}</h3>
                      <p className="text-xs text-slate-400">
                        Location: {job.location || 'Pan India'} &bull; Tracked On: {new Date(app.createdAt).toLocaleDateString()}
                      </p>
                    </div>

                    <div className="flex items-center space-x-3">
                      <select
                        value={app.status}
                        onChange={(e) => handleStatusChange(app._id, e.target.value)}
                        className="bg-slate-900 border border-slate-750 text-slate-200 text-xs font-bold rounded-xl px-3 py-2 focus:outline-none focus:border-indigo-500"
                      >
                        {statuses.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>

                      <button
                        onClick={() => handleDelete(app._id)}
                        className="p-2 text-slate-500 hover:text-rose-400 hover:bg-slate-800 rounded-xl transition"
                        title="Remove application"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default ApplicationTrackerPage;
