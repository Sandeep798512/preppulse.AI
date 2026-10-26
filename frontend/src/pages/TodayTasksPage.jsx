import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import MainLayout from '../components/layout/MainLayout';
import {
  Calendar,
  CheckCircle2,
  Clock,
  Play,
  SkipForward,
  RotateCcw,
  Sparkles,
  Award,
  ChevronLeft,
  ArrowRight,
  Code,
  FileText,
  Mic,
  BookOpen,
  Zap,
} from 'lucide-react';
import {
  getTodayTasks,
  startRoadmapTask,
  completeRoadmapTask,
  skipRoadmapTask,
} from '../services/careerCoachApi';
import confetti from 'canvas-confetti';

const TodayTasksPage = () => {
  const [roadmap, setRoadmap] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const res = await getTodayTasks();
      if (res.success) {
        setRoadmap(res.data.roadmap);
        setTasks(res.data.tasks || []);
      }
    } catch (err) {
      console.error('Error fetching today tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleStart = async (taskId) => {
    setActionLoading(taskId);
    try {
      await startRoadmapTask(taskId);
      setTasks((prev) =>
        prev.map((t) => (t._id === taskId ? { ...t, status: 'in_progress' } : t))
      );
    } catch (err) {
      alert('Failed to start task');
    } finally {
      setActionLoading(null);
    }
  };

  const handleComplete = async (task) => {
    setActionLoading(task._id);
    try {
      await completeRoadmapTask(task._id, { timeSpent: task.estimatedMinutes });
      setTasks((prev) =>
        prev.map((t) => (t._id === task._id ? { ...t, status: 'completed' } : t))
      );
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch (err) {
      alert('Failed to complete task');
    } finally {
      setActionLoading(null);
    }
  };

  const handleSkip = async (taskId) => {
    setActionLoading(taskId);
    try {
      await skipRoadmapTask(taskId);
      setTasks((prev) =>
        prev.map((t) => (t._id === taskId ? { ...t, status: 'skipped' } : t))
      );
    } catch (err) {
      alert('Failed to skip task');
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="py-24 text-center space-y-3">
          <Zap className="w-10 h-10 text-indigo-400 animate-spin mx-auto" />
          <p className="text-sm text-slate-400">Loading today's preparation schedule...</p>
        </div>
      </MainLayout>
    );
  }

  const completedCount = tasks.filter((t) => t.status === 'completed').length;
  const totalMinutes = tasks.reduce((sum, t) => sum + (t.estimatedMinutes || 30), 0);
  const completedMinutes = tasks
    .filter((t) => t.status === 'completed')
    .reduce((sum, t) => sum + (t.estimatedMinutes || 30), 0);

  return (
    <MainLayout>
      <div className="space-y-6 max-w-4xl mx-auto">
        {/* Navigation & Header */}
        <div className="flex items-center justify-between">
          <Link
            to="/career-coach"
            className="text-xs text-slate-400 hover:text-white transition flex items-center space-x-1"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Back to Coach Dashboard</span>
          </Link>

          <span className="px-3 py-1 bg-indigo-500/20 text-indigo-300 text-xs font-bold rounded-full border border-indigo-500/30">
            Target Study: {roadmap?.dailyStudyTarget || 2} Hours/Day
          </span>
        </div>

        {/* Progress Header Box */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4 shadow-xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-white flex items-center space-x-2">
                <Calendar className="w-7 h-7 text-indigo-400" />
                <span>Today's Placement Preparation Schedule</span>
              </h1>
              <p className="text-sm text-slate-400 mt-1">
                Complete targeted tasks to build streak & raise your readiness score.
              </p>
            </div>

            <div className="flex items-center space-x-4 bg-slate-900/80 p-3 rounded-xl border border-slate-800">
              <div className="text-center px-3 border-r border-slate-800">
                <p className="text-xs text-slate-400 font-medium">Tasks Completed</p>
                <p className="text-lg font-bold text-emerald-400">{completedCount} / {tasks.length}</p>
              </div>
              <div className="text-center px-3">
                <p className="text-xs text-slate-400 font-medium">Study Time</p>
                <p className="text-lg font-bold text-indigo-300">{completedMinutes}m / {totalMinutes}m</p>
              </div>
            </div>
          </div>

          <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden border border-slate-800">
            <div
              className="bg-emerald-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${tasks.length ? Math.round((completedCount / tasks.length) * 100) : 0}%` }}
            />
          </div>
        </div>

        {/* Task Cards List */}
        <div className="space-y-4">
          {tasks.length === 0 ? (
            <div className="p-12 bg-slate-850 border border-slate-800 rounded-2xl text-center space-y-3">
              <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
              <h3 className="text-base font-bold text-white">All Tasks Completed!</h3>
              <p className="text-xs text-slate-400">Great job! You have finished all preparation tasks for today.</p>
              <Link
                to="/career-coach"
                className="inline-block px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition mt-2"
              >
                Return to Dashboard
              </Link>
            </div>
          ) : (
            tasks.map((task, idx) => {
              const isCompleted = task.status === 'completed';
              const isInProgress = task.status === 'in_progress';
              const isSkipped = task.status === 'skipped';

              return (
                <div
                  key={task._id}
                  className={`p-5 rounded-2xl border transition shadow-lg ${
                    isCompleted
                      ? 'bg-slate-900/60 border-emerald-500/30'
                      : isInProgress
                      ? 'bg-slate-850 border-indigo-500/50 shadow-indigo-500/10'
                      : 'bg-slate-850 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center space-x-2">
                        <span className="px-2.5 py-0.5 bg-indigo-500/20 text-indigo-300 text-[10px] font-bold rounded border border-indigo-500/30 uppercase">
                          {task.type}
                        </span>
                        <span className="px-2.5 py-0.5 bg-slate-900 text-slate-400 text-[10px] font-bold rounded border border-slate-800">
                          {task.skill}
                        </span>
                        <span
                          className={`px-2 py-0.5 text-[10px] font-bold rounded ${
                            task.priority === 'Critical'
                              ? 'bg-rose-500/20 text-rose-300'
                              : 'bg-amber-500/20 text-amber-300'
                          }`}
                        >
                          {task.priority} Priority
                        </span>
                      </div>

                      <h3 className={`text-base font-bold ${isCompleted ? 'text-slate-400 line-through' : 'text-white'}`}>
                        {task.title}
                      </h3>
                      <p className="text-xs text-slate-400 leading-relaxed">{task.description}</p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 md:justify-end">
                      <div className="text-xs text-slate-400 flex items-center space-x-1 mr-2">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{task.estimatedMinutes} mins</span>
                      </div>

                      {isCompleted ? (
                        <span className="px-4 py-2 bg-emerald-500/20 text-emerald-300 text-xs font-bold rounded-xl border border-emerald-500/30 flex items-center space-x-1">
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Completed (+20 pts)</span>
                        </span>
                      ) : isSkipped ? (
                        <span className="px-4 py-2 bg-slate-800 text-slate-500 text-xs font-bold rounded-xl border border-slate-700">
                          Skipped
                        </span>
                      ) : (
                        <>
                          <Link
                            to={task.relatedRoute || '/practice'}
                            onClick={() => !isInProgress && handleStart(task._id)}
                            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-600/20 flex items-center space-x-1.5 transition"
                          >
                            <Play className="w-3.5 h-3.5" />
                            <span>{isInProgress ? 'Continue Task' : 'Start Task'}</span>
                          </Link>

                          <button
                            onClick={() => handleComplete(task)}
                            disabled={actionLoading === task._id}
                            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-lg transition"
                          >
                            Mark Complete
                          </button>

                          <button
                            onClick={() => handleSkip(task._id)}
                            disabled={actionLoading === task._id}
                            className="px-3 py-2 bg-slate-800 hover:bg-slate-750 text-slate-400 text-xs font-medium rounded-xl border border-slate-700 transition"
                          >
                            Skip
                          </button>
                        </>
                      )}
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

export default TodayTasksPage;
