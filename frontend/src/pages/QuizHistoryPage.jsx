import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import MainLayout from '../components/layout/MainLayout';
import API from '../services/api';
import {
  Clock,
  Award,
  CheckCircle2,
  HelpCircle,
  Eye,
  Loader2,
  Calendar,
  Zap,
} from 'lucide-react';

const QuizHistoryPage = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const { data } = await API.get('/quizzes/history');
      if (data.success) {
        setHistory(data.history);
      }
    } catch (err) {
      console.error('Failed to fetch history:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-850 border border-slate-800 p-6 rounded-2xl shadow-xl">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-brand-500/10 text-brand-400 rounded-xl border border-brand-500/20">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Quiz Attempt History</h1>
              <p className="text-xs text-slate-400">Review past aptitude & technical MCQ practice exams and performance trends</p>
            </div>
          </div>

          <Link
            to="/practice"
            className="px-4 py-2.5 bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs rounded-xl transition shadow-md shadow-brand-600/20"
          >
            Start New Practice Exam
          </Link>
        </div>

        {/* History Table */}
        <div className="bg-slate-850 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          {loading ? (
            <div className="py-12 text-center text-slate-400 text-xs flex items-center justify-center space-x-2">
              <Loader2 className="w-5 h-5 text-brand-500 animate-spin" />
              <span>Loading Attempt History...</span>
            </div>
          ) : history.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-900 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="p-3.5 rounded-l-xl">Category / Topic</th>
                    <th className="p-3.5">Difficulty</th>
                    <th className="p-3.5">Questions</th>
                    <th className="p-3.5">Score</th>
                    <th className="p-3.5">Accuracy</th>
                    <th className="p-3.5">Submitted Date</th>
                    <th className="p-3.5 text-right rounded-r-xl">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {history.map((item) => (
                    <tr key={item._id} className="hover:bg-slate-800/40 transition">
                      <td className="p-3.5 font-bold text-white">
                        <span className="capitalize">{item.category}</span>
                        <span className="block text-[11px] text-slate-400 font-normal">
                          {(item.topics || []).join(', ')}
                        </span>
                      </td>
                      <td className="p-3.5">
                        <span className="bg-slate-900 border border-slate-700 px-2.5 py-0.5 rounded text-[11px] font-semibold">
                          {item.difficulty}
                        </span>
                      </td>
                      <td className="p-3.5 font-semibold text-slate-300">{item.totalQuestions} Qs</td>
                      <td className="p-3.5 font-bold text-brand-400">
                        {item.score} <span className="text-[11px] font-normal text-slate-400">({item.percentage}%)</span>
                      </td>
                      <td className="p-3.5 font-bold text-emerald-400">{item.accuracy}%</td>
                      <td className="p-3.5 text-slate-400">
                        {new Date(item.submittedAt || item.createdAt).toLocaleDateString()}
                      </td>
                      <td className="p-3.5 text-right">
                        <Link
                          to={`/quiz/${item._id}/result`}
                          className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-brand-400 font-semibold rounded-lg transition inline-flex items-center space-x-1"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Review</span>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-12 text-center text-slate-400 space-y-3">
              <HelpCircle className="w-12 h-12 text-slate-600 mx-auto" />
              <h3 className="font-bold text-white text-base">No Previous Quizzes Taken</h3>
              <p className="text-xs max-w-sm mx-auto">
                Head over to the Practice Center to take custom timed quizzes or practice technical & aptitude questions.
              </p>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default QuizHistoryPage;
