import React, { useState, useEffect } from 'react';
import MainLayout from '../components/layout/MainLayout';
import API from '../services/api';
import {
  Shield,
  Plus,
  Search,
  CheckCircle2,
  XCircle,
  Trash2,
  Edit2,
  Upload,
  Loader2,
  AlertCircle,
  Sparkles,
} from 'lucide-react';

const AdminQuestionsPage = () => {
  const [questions, setQuestions] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [topic, setTopic] = useState('');
  const [difficulty, setDifficulty] = useState('');

  // Create Modal State
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const [formData, setFormData] = useState({
    question: '',
    category: 'technical',
    topic: 'Java',
    subtopic: '',
    difficulty: 'Medium',
    options: ['', '', '', ''],
    correctAnswer: 0,
    explanation: '',
    hint: '',
    tags: '',
  });

  useEffect(() => {
    fetchQuestions();
  }, [pagination.page, category, difficulty]);

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const params = {
        page: pagination.page,
        limit: 15,
        search,
        category,
        topic,
        difficulty,
      };

      const { data } = await API.get('/questions', { params });
      if (data.success) {
        setQuestions(data.questions);
        setPagination(data.pagination);
      }
    } catch (err) {
      console.error('Failed to fetch admin questions:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateQuestion = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (formData.options.some((o) => !o.trim())) {
      setErrorMsg('Please fill out all 4 option choices.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        ...formData,
        correctAnswer: Number(formData.correctAnswer),
        tags: formData.tags ? formData.tags.split(',').map((t) => t.trim()) : [],
      };

      const { data } = await API.post('/questions', payload);
      if (data.success) {
        setShowModal(false);
        setFormData({
          question: '',
          category: 'technical',
          topic: 'Java',
          subtopic: '',
          difficulty: 'Medium',
          options: ['', '', '', ''],
          correctAnswer: 0,
          explanation: '',
          hint: '',
          tags: '',
        });
        await fetchQuestions();
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to create question.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      const { data } = await API.patch(`/questions/${id}/status`);
      if (data.success) {
        await fetchQuestions();
      }
    } catch (err) {
      console.error('Failed to toggle status:', err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this question?')) return;
    try {
      const { data } = await API.delete(`/questions/${id}`);
      if (data.success) {
        await fetchQuestions();
      }
    } catch (err) {
      console.error('Failed to delete question:', err);
    }
  };

  return (
    <MainLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-850 border border-slate-800 p-6 rounded-2xl shadow-xl">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-purple-500/10 text-purple-400 rounded-xl border border-purple-500/20">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Admin Question Bank Management</h1>
              <p className="text-xs text-slate-400">Add, edit, filter, activate/deactivate & manage Aptitude and Technical MCQs</p>
            </div>
          </div>

          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2.5 bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs rounded-xl transition shadow-md flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Question</span>
          </button>
        </div>

        {/* Filters */}
        <div className="bg-slate-850 border border-slate-800 rounded-2xl p-4 grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search question text..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchQuestions()}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-white focus:outline-none focus:border-brand-500"
            />
          </div>

          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-brand-500 cursor-pointer"
          >
            <option value="">All Categories</option>
            <option value="technical">Technical</option>
            <option value="aptitude">Aptitude</option>
          </select>

          <select
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
            className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-brand-500 cursor-pointer"
          >
            <option value="">All Difficulties</option>
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
          </select>

          <button
            onClick={fetchQuestions}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-xl transition"
          >
            Apply Filters
          </button>
        </div>

        {/* Questions Table */}
        <div className="bg-slate-850 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          {loading ? (
            <div className="py-12 text-center text-slate-400 text-xs flex items-center justify-center space-x-2">
              <Loader2 className="w-5 h-5 text-brand-500 animate-spin" />
              <span>Fetching Question Bank...</span>
            </div>
          ) : questions.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-900 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="p-3.5 rounded-l-xl">Question</th>
                    <th className="p-3.5">Topic</th>
                    <th className="p-3.5">Difficulty</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5 text-right rounded-r-xl">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {questions.map((q) => (
                    <tr key={q._id} className="hover:bg-slate-800/40 transition">
                      <td className="p-3.5 max-w-xs truncate font-medium text-white">{q.question}</td>
                      <td className="p-3.5">
                        <span className="font-semibold text-brand-400">{q.topic}</span>
                        <span className="block text-[10px] text-slate-400 capitalize">{q.category}</span>
                      </td>
                      <td className="p-3.5">
                        <span className="bg-slate-900 border border-slate-700 px-2 py-0.5 rounded text-[11px] font-medium">
                          {q.difficulty}
                        </span>
                      </td>
                      <td className="p-3.5">
                        <button
                          onClick={() => handleToggleStatus(q._id)}
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border transition ${
                            q.isActive
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                              : 'bg-slate-900 text-slate-500 border-slate-700'
                          }`}
                        >
                          {q.isActive ? 'Active' : 'Inactive'}
                        </button>
                      </td>
                      <td className="p-3.5 text-right space-x-2">
                        <button
                          onClick={() => handleDelete(q._id)}
                          className="p-1.5 text-slate-400 hover:text-red-400 rounded-lg hover:bg-slate-800 transition"
                          title="Delete Question"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-12 text-center text-slate-400 text-xs">
              No questions found matching your filter criteria.
            </div>
          )}
        </div>

        {/* Add Question Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-slate-850 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-base font-bold text-white">Add New MCQ to Question Bank</h3>
                <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white">✕</button>
              </div>

              {errorMsg && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-xl text-xs">
                  {errorMsg}
                </div>
              )}

              <form onSubmit={handleCreateQuestion} className="space-y-4 text-xs">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Question Text</label>
                  <textarea
                    rows={3}
                    required
                    value={formData.question}
                    onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                    placeholder="Enter the full question statement..."
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white focus:outline-none focus:border-brand-500"
                  />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">Category</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white"
                    >
                      <option value="technical">Technical</option>
                      <option value="aptitude">Aptitude</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">Topic</label>
                    <input
                      type="text"
                      required
                      value={formData.topic}
                      onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                      placeholder="Java / Quantitative Aptitude"
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">Difficulty</label>
                    <select
                      value={formData.difficulty}
                      onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white"
                    >
                      <option value="Easy">Easy</option>
                      <option value="Medium">Medium</option>
                      <option value="Hard">Hard</option>
                    </select>
                  </div>
                </div>

                {/* 4 Options */}
                <div className="space-y-2">
                  <label className="block font-semibold text-slate-300">Option Choices (Exactly 4)</label>
                  {formData.options.map((opt, idx) => (
                    <div key={idx} className="flex items-center space-x-2">
                      <span className="font-mono text-slate-400 font-bold">{String.fromCharCode(65 + idx)}.</span>
                      <input
                        type="text"
                        required
                        value={opt}
                        onChange={(e) => {
                          const updated = [...formData.options];
                          updated[idx] = e.target.value;
                          setFormData({ ...formData, options: updated });
                        }}
                        placeholder={`Option ${String.fromCharCode(65 + idx)} text`}
                        className="flex-1 bg-slate-900 border border-slate-700 rounded-xl p-2 text-white"
                      />
                      <label className="flex items-center space-x-1 cursor-pointer">
                        <input
                          type="radio"
                          name="correctOptionRadio"
                          checked={formData.correctAnswer === idx}
                          onChange={() => setFormData({ ...formData, correctAnswer: idx })}
                        />
                        <span className="text-[11px] text-slate-400">Correct</span>
                      </label>
                    </div>
                  ))}
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Explanation</label>
                  <textarea
                    rows={2}
                    required
                    value={formData.explanation}
                    onChange={(e) => setFormData({ ...formData, explanation: e.target.value })}
                    placeholder="Step-by-step mathematical reasoning or technical explanation..."
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white"
                  />
                </div>

                <div className="flex justify-end space-x-2 pt-3 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-6 py-2 bg-brand-600 hover:bg-brand-500 text-white rounded-xl font-bold transition disabled:opacity-50"
                  >
                    {submitting ? 'Saving Question...' : 'Save Question'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default AdminQuestionsPage;
