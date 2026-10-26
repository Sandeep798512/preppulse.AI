import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import MainLayout from '../components/layout/MainLayout';
import {
  Code,
  Plus,
  Trash2,
  Edit,
  ChevronLeft,
  RefreshCw,
  X,
  CheckCircle2,
  Layers,
  Save,
} from 'lucide-react';
import {
  getCodingProblems,
  createCodingProblem,
  updateCodingProblem,
  deleteCodingProblem,
} from '../services/codingApi';

const AdminCodingPage = () => {
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProblem, setEditingProblem] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    difficulty: 'Easy',
    category: 'Arrays',
    topics: 'Arrays, Two Pointer',
    constraints: '1 <= nums.length <= 10^4',
    inputFormat: 'Line 1: Array integers',
    outputFormat: 'Result string/integer',
    jsStarter: 'function solve(input) {\n  return "";\n}',
    pythonStarter: 'def solve(input_str):\n    return ""',
    javaStarter: 'public class Solution {\n    public static String solve(String input) {\n        return "";\n    }\n}',
    sampleInput: '2,7,11,15\n9',
    sampleOutput: '0 1',
    hiddenInput: '3,2,4\n6',
    hiddenOutput: '1 2',
  });

  const fetchProblems = async () => {
    setLoading(true);
    try {
      const res = await getCodingProblems({ limit: 50 });
      if (res.success) {
        setProblems(res.data);
      }
    } catch (err) {
      console.error('Error fetching admin problems:', err);
      setError('Failed to fetch coding problems.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProblems();
  }, []);

  const handleOpenCreateModal = () => {
    setEditingProblem(null);
    setFormData({
      title: '',
      description: '',
      difficulty: 'Easy',
      category: 'Arrays',
      topics: 'Arrays, Hashing',
      constraints: '1 <= n <= 10^5',
      inputFormat: 'Line 1: Input string/numbers',
      outputFormat: 'Result output',
      jsStarter: 'function solve(input) {\n  return "";\n}',
      pythonStarter: 'def solve(input_str):\n    return ""',
      javaStarter: 'public class Solution {\n    public static String solve(String input) {\n        return "";\n    }\n}',
      sampleInput: '',
      sampleOutput: '',
      hiddenInput: '',
      hiddenOutput: '',
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (problem) => {
    setEditingProblem(problem);
    setFormData({
      title: problem.title || '',
      description: problem.description || '',
      difficulty: problem.difficulty || 'Easy',
      category: problem.category || 'Arrays',
      topics: problem.topics ? problem.topics.join(', ') : '',
      constraints: problem.constraints ? problem.constraints.join(', ') : '',
      inputFormat: problem.inputFormat || '',
      outputFormat: problem.outputFormat || '',
      jsStarter: problem.starterCode?.javascript || '',
      pythonStarter: problem.starterCode?.python || '',
      javaStarter: problem.starterCode?.java || '',
      sampleInput: problem.testCases?.[0]?.input || '',
      sampleOutput: problem.testCases?.[0]?.expectedOutput || '',
      hiddenInput: problem.testCases?.[1]?.input || '',
      hiddenOutput: problem.testCases?.[1]?.expectedOutput || '',
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this coding problem?')) return;
    try {
      const res = await deleteCodingProblem(id);
      if (res.success) {
        fetchProblems();
      }
    } catch (err) {
      alert('Failed to delete coding problem');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        title: formData.title,
        description: formData.description,
        difficulty: formData.difficulty,
        category: formData.category,
        topics: formData.topics.split(',').map((s) => s.trim()).filter(Boolean),
        constraints: formData.constraints.split(',').map((s) => s.trim()).filter(Boolean),
        inputFormat: formData.inputFormat,
        outputFormat: formData.outputFormat,
        starterCode: {
          javascript: formData.jsStarter,
          python: formData.pythonStarter,
          java: formData.javaStarter,
        },
        testCases: [
          {
            input: formData.sampleInput,
            expectedOutput: formData.sampleOutput,
            isHidden: false,
          },
          {
            input: formData.hiddenInput,
            expectedOutput: formData.hiddenOutput,
            isHidden: true,
          },
        ],
      };

      if (editingProblem) {
        await updateCodingProblem(editingProblem._id, payload);
      } else {
        await createCodingProblem(payload);
      }

      setIsModalOpen(false);
      fetchProblems();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save coding problem');
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between bg-slate-850 border border-slate-800 p-6 rounded-2xl">
          <div className="flex items-center space-x-4">
            <Link to="/admin" className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl">
              <ChevronLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-white">Admin Coding Management</h1>
              <p className="text-xs text-slate-400 mt-1">
                Create, update, and manage DSA coding challenges & hidden test cases.
              </p>
            </div>
          </div>

          <button
            onClick={handleOpenCreateModal}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl flex items-center space-x-2 shadow-lg shadow-indigo-600/20"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Problem</span>
          </button>
        </div>

        {/* Problems List Table */}
        {loading ? (
          <div className="py-20 text-center">
            <RefreshCw className="w-8 h-8 text-indigo-400 animate-spin mx-auto" />
          </div>
        ) : (
          <div className="bg-slate-850 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900 border-b border-slate-800 text-slate-400 uppercase font-semibold">
                <tr>
                  <th className="px-6 py-4">Title</th>
                  <th className="px-6 py-4">Difficulty</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Submissions</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300">
                {problems.map((prob) => (
                  <tr key={prob._id} className="hover:bg-slate-800/60">
                    <td className="px-6 py-4 font-bold text-white">{prob.title}</td>
                    <td className="px-6 py-4 font-semibold">{prob.difficulty}</td>
                    <td className="px-6 py-4">{prob.category}</td>
                    <td className="px-6 py-4">{prob.submissionCount || 0}</td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button
                        onClick={() => handleOpenEditModal(prob)}
                        className="p-1.5 bg-slate-800 text-indigo-300 rounded-lg hover:bg-slate-700"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(prob._id)}
                        className="p-1.5 bg-rose-500/10 text-rose-400 rounded-lg hover:bg-rose-500/20"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <form
              onSubmit={handleSubmit}
              className="bg-slate-850 border border-slate-800 rounded-2xl max-w-3xl w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-lg font-bold text-white">
                  {editingProblem ? 'Edit Coding Problem' : 'Create Coding Problem'}
                </h3>
                <button type="button" onClick={() => setIsModalOpen(false)} className="text-slate-400">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block text-slate-400 mb-1">Title</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-750 p-2.5 rounded-xl text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Difficulty</label>
                  <select
                    value={formData.difficulty}
                    onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-750 p-2.5 rounded-xl text-white"
                  >
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 text-xs mb-1">Description</label>
                <textarea
                  required
                  rows="3"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-750 p-2.5 rounded-xl text-white text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block text-slate-400 mb-1">Sample Test Input</label>
                  <textarea
                    rows="2"
                    value={formData.sampleInput}
                    onChange={(e) => setFormData({ ...formData, sampleInput: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-750 p-2 rounded-xl text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Sample Expected Output</label>
                  <textarea
                    rows="2"
                    value={formData.sampleOutput}
                    onChange={(e) => setFormData({ ...formData, sampleOutput: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-750 p-2 rounded-xl text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block text-slate-400 mb-1">Hidden Test Input</label>
                  <textarea
                    rows="2"
                    value={formData.hiddenInput}
                    onChange={(e) => setFormData({ ...formData, hiddenInput: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-750 p-2 rounded-xl text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Hidden Expected Output</label>
                  <textarea
                    rows="2"
                    value={formData.hiddenOutput}
                    onChange={(e) => setFormData({ ...formData, hiddenOutput: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-750 p-2 rounded-xl text-white font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 text-xs font-semibold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 text-white text-xs font-semibold rounded-xl"
                >
                  Save Problem
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default AdminCodingPage;
