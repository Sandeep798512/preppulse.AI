import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import MainLayout from '../components/layout/MainLayout';
import {
  Layers,
  CheckCircle2,
  Clock,
  RotateCcw,
  Sparkles,
  ChevronLeft,
  Calendar,
  Target,
  BookOpen,
  Zap,
} from 'lucide-react';
import { getActiveRoadmap, regenerateRoadmap } from '../services/careerCoachApi';

const RoadmapDetailPage = () => {
  const [roadmap, setRoadmap] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [regenerating, setRegenerating] = useState(false);

  const fetchRoadmap = async () => {
    setLoading(true);
    try {
      const res = await getActiveRoadmap();
      if (res.success) {
        setRoadmap(res.data.roadmap);
        setTasks(res.data.tasks || []);
      }
    } catch (err) {
      console.error('Error fetching active roadmap:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoadmap();
  }, []);

  const handleRegenerate = async () => {
    if (!window.confirm('Regenerate your personalized learning roadmap? Your current roadmap will be archived and updated with your latest skill evidence.')) {
      return;
    }
    setRegenerating(true);
    try {
      const res = await regenerateRoadmap({ reason: 'User triggered manual regeneration' });
      if (res.success) {
        setRoadmap(res.data.roadmap);
        setTasks(res.data.tasks || []);
        alert(`Roadmap Version ${res.data.roadmap.roadmapVersion} generated successfully!`);
      }
    } catch (err) {
      alert('Failed to regenerate roadmap');
    } finally {
      setRegenerating(false);
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="py-24 text-center space-y-3">
          <Zap className="w-10 h-10 text-indigo-400 animate-spin mx-auto" />
          <p className="text-sm text-slate-400">Loading personalized learning roadmap timeline...</p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6 max-w-5xl mx-auto">
        {/* Navigation & Header */}
        <div className="flex items-center justify-between">
          <Link
            to="/career-coach"
            className="text-xs text-slate-400 hover:text-white transition flex items-center space-x-1"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Back to Coach Dashboard</span>
          </Link>

          <button
            onClick={handleRegenerate}
            disabled={regenerating}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-600/20 flex items-center space-x-2 transition disabled:opacity-50"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${regenerating ? 'animate-spin' : ''}`} />
            <span>{regenerating ? 'Regenerating...' : 'Regenerate Roadmap'}</span>
          </button>
        </div>

        {/* Hero Roadmap Banner */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4 shadow-xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-2xl font-bold text-white">4-Week Personalized Learning Roadmap</h1>
                <span className="px-2.5 py-0.5 bg-indigo-500/20 text-indigo-300 text-xs font-semibold rounded-full border border-indigo-500/30">
                  Version {roadmap?.roadmapVersion || 1}.0
                </span>
              </div>
              <p className="text-sm text-slate-400 mt-1">
                Target Role: <strong className="text-white">{roadmap?.targetRole}</strong> &bull; Generated: {new Date(roadmap?.createdAt || Date.now()).toLocaleDateString()}
              </p>
            </div>

            <div className="flex items-center space-x-4 bg-slate-900/80 p-3 rounded-xl border border-slate-800 text-xs">
              <div>
                <p className="text-slate-400">Overall Progress</p>
                <p className="text-xl font-extrabold text-indigo-400">{roadmap?.overallProgress || 0}%</p>
              </div>
              <div className="w-24 bg-slate-800 h-2 rounded-full overflow-hidden">
                <div className="bg-indigo-500 h-full rounded-full" style={{ width: `${roadmap?.overallProgress || 0}%` }} />
              </div>
            </div>
          </div>
        </div>

        {/* Phases Interactive Timeline */}
        <div className="space-y-6">
          {roadmap?.phases?.map((phase) => {
            const phaseTasks = tasks.filter((t) => t.weekNumber === phase.phaseNumber);

            return (
              <div key={phase._id} className="bg-slate-850 border border-slate-800 p-6 rounded-2xl space-y-4 shadow-xl">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center space-x-3">
                    <span className="w-8 h-8 bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 rounded-xl flex items-center justify-center font-bold text-sm">
                      {phase.phaseNumber}
                    </span>
                    <div>
                      <h2 className="text-base font-bold text-white">{phase.title}</h2>
                      <p className="text-xs text-slate-400">{phase.focusArea}</p>
                    </div>
                  </div>

                  <span
                    className={`px-3 py-1 text-xs font-bold rounded-full ${
                      phase.status === 'completed'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : phase.status === 'in_progress'
                        ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                        : 'bg-slate-800 text-slate-500'
                    }`}
                  >
                    {phase.status === 'completed' ? 'Completed' : phase.status === 'in_progress' ? 'In Progress' : 'Not Started'}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                  {phaseTasks.map((t) => (
                    <div key={t._id} className="p-3.5 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-between text-xs">
                      <div className="space-y-0.5">
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-indigo-400">[{t.type}]</span>
                          <span className="font-semibold text-slate-200">{t.title}</span>
                        </div>
                        <p className="text-[11px] text-slate-400">{t.skill} &bull; {t.estimatedMinutes} mins</p>
                      </div>

                      <span className={`px-2 py-0.5 font-bold rounded ${t.status === 'completed' ? 'text-emerald-400 bg-emerald-500/10' : 'text-slate-400'}`}>
                        {t.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </MainLayout>
  );
};

export default RoadmapDetailPage;
