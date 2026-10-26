import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import MainLayout from '../components/layout/MainLayout';
import {
  Clock,
  CheckCircle2,
  XCircle,
  Code,
  FileCode,
  ChevronLeft,
  RefreshCw,
  Terminal,
  Eye,
  X,
} from 'lucide-react';
import { getCodingSubmissions } from '../services/codingApi';

const CodingSubmissionsPage = () => {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ totalPages: 1, total: 0 });

  // Modal for Viewing Submitted Code
  const [selectedSubmission, setSelectedSubmission] = useState(null);

  const fetchSubmissions = async () => {
    setLoading(true);
    try {
      const res = await getCodingSubmissions({ page, limit: 15 });
      if (res.success) {
        setSubmissions(res.data);
        setPagination(res.pagination || { totalPages: 1, total: res.data.length });
      }
    } catch (err) {
      console.error('Error fetching submissions:', err);
      setError('Failed to load submission history.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubmissions();
  }, [page]);

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between bg-slate-850 border border-slate-800 p-6 rounded-2xl">
          <div className="flex items-center space-x-4">
            <Link
              to="/coding"
              className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition"
            >
              <ChevronLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-white">Coding Submission History</h1>
              <p className="text-xs text-slate-400 mt-1">
                Review your past coding solutions, test case evaluation details, and execution performance.
              </p>
            </div>
          </div>
        </div>

        {/* Submissions Table / List */}
        {loading ? (
          <div className="py-20 text-center space-y-3">
            <RefreshCw className="w-8 h-8 text-indigo-400 animate-spin mx-auto" />
            <p className="text-sm text-slate-400">Loading submission logs...</p>
          </div>
        ) : error ? (
          <div className="p-6 bg-rose-500/10 border border-rose-500/20 text-rose-300 rounded-2xl text-center">
            {error}
          </div>
        ) : submissions.length === 0 ? (
          <div className="py-16 text-center bg-slate-850 border border-slate-800 rounded-2xl space-y-3">
            <FileCode className="w-12 h-12 text-slate-600 mx-auto" />
            <h3 className="text-base font-semibold text-slate-200">No Submissions Found</h3>
            <p className="text-xs text-slate-400">You haven't submitted any coding solutions yet.</p>
            <Link
              to="/coding"
              className="inline-block px-4 py-2 bg-indigo-600 text-white text-xs font-semibold rounded-xl"
            >
              Start Coding Practice
            </Link>
          </div>
        ) : (
          <div className="bg-slate-850 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-900 border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold">
                  <tr>
                    <th className="px-6 py-4">Problem</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Language</th>
                    <th className="px-6 py-4">Test Cases Passed</th>
                    <th className="px-6 py-4">Execution Time</th>
                    <th className="px-6 py-4">Submitted At</th>
                    <th className="px-6 py-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-slate-300">
                  {submissions.map((sub) => (
                    <tr key={sub._id} className="hover:bg-slate-800/60 transition">
                      <td className="px-6 py-4 font-semibold text-white">
                        {sub.problem ? (
                          <Link
                            to={`/coding/problem/${sub.problem.slug}`}
                            className="hover:text-indigo-400 transition"
                          >
                            {sub.problem.title}
                          </Link>
                        ) : (
                          'Deleted Challenge'
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[11px] font-bold inline-flex items-center space-x-1 ${
                            sub.status === 'Accepted'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                          }`}
                        >
                          {sub.status === 'Accepted' ? (
                            <CheckCircle2 className="w-3 h-3" />
                          ) : (
                            <XCircle className="w-3 h-3" />
                          )}
                          <span>{sub.status}</span>
                        </span>
                      </td>
                      <td className="px-6 py-4 capitalize font-mono text-slate-400">{sub.language}</td>
                      <td className="px-6 py-4 font-mono">
                        {sub.passCount} / {sub.totalTestCases} ({sub.score}%)
                      </td>
                      <td className="px-6 py-4 font-mono text-slate-400">{sub.executionTimeMs} ms</td>
                      <td className="px-6 py-4 text-slate-400">
                        {new Date(sub.createdAt).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => setSelectedSubmission(sub)}
                          className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-indigo-300 rounded-lg text-xs font-semibold inline-flex items-center space-x-1 border border-slate-700 transition"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View Code</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* View Code Modal */}
        {selectedSubmission && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-slate-850 border border-slate-800 rounded-2xl max-w-3xl w-full p-6 space-y-4 shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div>
                  <h3 className="text-lg font-bold text-white">
                    Solution Code: {selectedSubmission.problem?.title || 'Coding Challenge'}
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Language: <span className="capitalize">{selectedSubmission.language}</span> • Status:{' '}
                    <span className="font-semibold text-emerald-400">{selectedSubmission.status}</span>
                  </p>
                </div>
                <button
                  onClick={() => setSelectedSubmission(null)}
                  className="p-2 bg-slate-800 hover:bg-slate-750 text-slate-400 rounded-xl"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto bg-slate-950 p-4 rounded-xl font-mono text-xs text-emerald-400">
                <pre>{selectedSubmission.code}</pre>
              </div>

              {selectedSubmission.errorMessage && (
                <div className="p-3 bg-rose-950/40 border border-rose-500/20 rounded-xl text-xs text-rose-300 font-mono">
                  <strong>Error Message:</strong> {selectedSubmission.errorMessage}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default CodingSubmissionsPage;
