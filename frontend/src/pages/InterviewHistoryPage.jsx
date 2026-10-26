import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import MainLayout from '../components/layout/MainLayout';
import {
  History,
  CheckCircle2,
  XCircle,
  Clock,
  ChevronLeft,
  RefreshCw,
  Eye,
  Bot,
  Award,
} from 'lucide-react';
import { getInterviewHistory } from '../services/interviewApi';

const InterviewHistoryPage = () => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const res = await getInterviewHistory({ page, limit: 15 });
      if (res.success) {
        setSessions(res.data);
      }
    } catch (err) {
      console.error('Error loading interview history:', err);
      setError('Failed to fetch interview attempt history.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [page]);

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between bg-slate-850 border border-slate-800 p-6 rounded-2xl">
          <div className="flex items-center space-x-4">
            <Link
              to="/mock-interview"
              className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition"
            >
              <ChevronLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-white">Interview History Logs</h1>
              <p className="text-xs text-slate-400 mt-1">
                Review your past AI mock interview attempts, scores, and feedback scorecards.
              </p>
            </div>
          </div>

          <Link
            to="/mock-interview"
            className="px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold rounded-xl shadow transition"
          >
            Start New Session
          </Link>
        </div>

        {/* History Table */}
        {loading ? (
          <div className="py-20 text-center space-y-3">
            <RefreshCw className="w-8 h-8 text-violet-400 animate-spin mx-auto" />
            <p className="text-sm text-slate-400">Loading interview session history...</p>
          </div>
        ) : error ? (
          <div className="p-6 bg-rose-500/10 border border-rose-500/20 text-rose-300 rounded-2xl text-center">
            {error}
          </div>
        ) : sessions.length === 0 ? (
          <div className="py-16 text-center bg-slate-850 border border-slate-800 rounded-2xl space-y-3">
            <Bot className="w-12 h-12 text-slate-600 mx-auto" />
            <h3 className="text-base font-semibold text-slate-200">No Interview History</h3>
            <p className="text-xs text-slate-400">You haven't completed any mock interviews yet.</p>
            <Link
              to="/mock-interview"
              className="inline-block px-4 py-2 bg-violet-600 text-white text-xs font-semibold rounded-xl"
            >
              Start First Interview
            </Link>
          </div>
        ) : (
          <div className="bg-slate-850 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-900 border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold">
                  <tr>
                    <th className="px-6 py-4">Role</th>
                    <th className="px-6 py-4">Type</th>
                    <th className="px-6 py-4">Difficulty</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Score</th>
                    <th className="px-6 py-4">Date</th>
                    <th className="px-6 py-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-slate-300">
                  {sessions.map((s) => (
                    <tr key={s._id} className="hover:bg-slate-800/60 transition">
                      <td className="px-6 py-4 font-bold text-white">{s.targetRole}</td>
                      <td className="px-6 py-4 capitalize font-medium text-slate-300">{s.interviewType}</td>
                      <td className="px-6 py-4">{s.difficulty}</td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[11px] font-semibold capitalize ${
                            s.status === 'completed'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          }`}
                        >
                          {s.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-bold font-mono text-violet-400">
                        {s.overallScore || 0} / 100
                      </td>
                      <td className="px-6 py-4 text-slate-400">
                        {new Date(s.createdAt).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link
                          to={`/interview/${s._id}/result`}
                          className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-violet-300 rounded-lg text-xs font-semibold inline-flex items-center space-x-1 border border-slate-700 transition"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View Scorecard</span>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default InterviewHistoryPage;
