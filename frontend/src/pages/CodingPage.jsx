import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import MainLayout from '../components/layout/MainLayout';
import {
  Code,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Sparkles,
  Zap,
  BarChart3,
  BookOpen,
  ChevronRight,
  ArrowRight,
  RefreshCw,
  Trophy,
} from 'lucide-react';
import { getCodingProblems, getCodingAnalytics, getCodingReadiness } from '../services/codingApi';

const CodingPage = () => {
  const navigate = useNavigate();
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters
  const [search, setSearch] = useState('');
  const [difficulty, setDifficulty] = useState('All');
  const [category, setCategory] = useState('All');
  const [status, setStatus] = useState('All');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ totalPages: 1, total: 0 });

  // Stats & Readiness
  const [analytics, setAnalytics] = useState(null);
  const [readiness, setReadiness] = useState(null);

  const fetchProblems = async () => {
    setLoading(true);
    try {
      const params = {
        page,
        limit: 15,
        search: search.trim() || undefined,
        difficulty: difficulty !== 'All' ? difficulty : undefined,
        category: category !== 'All' ? category : undefined,
      };

      const res = await getCodingProblems(params);
      if (res.success) {
        let filtered = res.data;
        if (status === 'Solved') {
          filtered = filtered.filter((p) => p.isSolved);
        } else if (status === 'Unsolved') {
          filtered = filtered.filter((p) => !p.isSolved);
        }
        setProblems(filtered);
        setPagination(res.pagination || { totalPages: 1, total: res.data.length });
      }
    } catch (err) {
      console.error('Error loading coding problems:', err);
      setError('Failed to load coding problems. Please check server connection.');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const [analyticsRes, readinessRes] = await Promise.all([
        getCodingAnalytics(),
        getCodingReadiness(),
      ]);
      if (analyticsRes.success) setAnalytics(analyticsRes.data);
      if (readinessRes.success) setReadiness(readinessRes.data);
    } catch (err) {
      // Non-blocking stats fetch
    }
  };

  useEffect(() => {
    fetchProblems();
  }, [search, difficulty, category, status, page]);

  useEffect(() => {
    fetchStats();
  }, []);

  const categoriesList = ['All', 'Arrays', 'Strings', 'LinkedList', 'Trees', 'Dynamic Programming', 'Searching & Sorting', 'Graphs', 'Recursion'];

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Top Header Banner */}
        <div className="flex flex-col md:flex-row md:items-center justify-between bg-gradient-to-r from-slate-900 via-slate-850 to-indigo-950 border border-slate-800 p-6 rounded-2xl gap-4 shadow-xl">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-indigo-500/20 text-indigo-400 rounded-xl border border-indigo-500/30">
              <Code className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-2xl font-bold text-white">Coding Practice Engine</h1>
                <span className="px-2.5 py-0.5 bg-indigo-500/10 text-indigo-400 text-xs font-semibold rounded-full border border-indigo-500/20">
                  Sandboxed Sandbox v2.0
                </span>
              </div>
              <p className="text-sm text-slate-400 mt-1">
                Placement-oriented DSA coding challenges with multi-language online execution & hidden test case evaluation.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <Link
              to="/coding/submissions"
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-medium rounded-xl border border-slate-700 flex items-center space-x-2 transition"
            >
              <Clock className="w-4 h-4 text-slate-400" />
              <span>Submissions</span>
            </Link>
            <Link
              to="/coding/analytics"
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-xl shadow-lg shadow-indigo-600/20 flex items-center space-x-2 transition"
            >
              <BarChart3 className="w-4 h-4" />
              <span>Coding Analytics</span>
            </Link>
          </div>
        </div>

        {/* Stats & Readiness Quick Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-slate-850 border border-slate-800 p-4 rounded-xl flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Solved Problems</p>
              <div className="flex items-baseline space-x-2 mt-1">
                <span className="text-2xl font-bold text-white">{analytics?.totalSolved || 0}</span>
                <span className="text-xs text-slate-400">/ {analytics?.totalProblemsInBank || 0}</span>
              </div>
            </div>
            <div className="p-2.5 bg-emerald-500/10 text-emerald-400 rounded-lg border border-emerald-500/20">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-slate-850 border border-slate-800 p-4 rounded-xl flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Acceptance Rate</p>
              <div className="flex items-baseline space-x-2 mt-1">
                <span className="text-2xl font-bold text-white">{analytics?.acceptanceRate || 0}%</span>
                <span className="text-xs text-slate-400">({analytics?.totalSubmissions || 0} subs)</span>
              </div>
            </div>
            <div className="p-2.5 bg-cyan-500/10 text-cyan-400 rounded-lg border border-cyan-500/20">
              <Zap className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-slate-850 border border-slate-800 p-4 rounded-xl flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Coding Readiness</p>
              <div className="flex items-baseline space-x-2 mt-1">
                <span className="text-2xl font-bold text-indigo-400">{readiness?.overallScore || 0}</span>
                <span className="text-xs text-slate-400">/ 100</span>
              </div>
            </div>
            <div className="p-2.5 bg-indigo-500/10 text-indigo-400 rounded-lg border border-indigo-500/20">
              <Trophy className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-slate-850 border border-slate-800 p-4 rounded-xl flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Readiness Level</p>
              <p className="text-sm font-semibold text-slate-200 mt-1 truncate max-w-[150px]">
                {readiness?.readinessLevel || 'Beginner'}
              </p>
            </div>
            <div className="p-2.5 bg-amber-500/10 text-amber-400 rounded-lg border border-amber-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Filter Controls Bar */}
        <div className="bg-slate-850 border border-slate-800 p-4 rounded-2xl space-y-4">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* Search Input */}
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search problem name or topic..."
                className="w-full bg-slate-900 border border-slate-750 pl-9 pr-4 py-2 rounded-xl text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Difficulty Filter Tabs */}
            <div className="flex items-center bg-slate-900 p-1 rounded-xl border border-slate-750 w-full md:w-auto overflow-x-auto">
              {['All', 'Easy', 'Medium', 'Hard'].map((diff) => (
                <button
                  key={diff}
                  onClick={() => setDifficulty(diff)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition whitespace-nowrap ${
                    difficulty === diff
                      ? 'bg-indigo-600 text-white shadow'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {diff}
                </button>
              ))}
            </div>

            {/* Category Dropdown */}
            <div className="flex items-center space-x-2 w-full md:w-auto">
              <Filter className="w-4 h-4 text-slate-400" />
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="bg-slate-900 border border-slate-750 px-3 py-2 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-indigo-500 w-full md:w-44"
              >
                {categoriesList.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat === 'All' ? 'All Categories' : cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Status Dropdown */}
            <div className="w-full md:w-auto">
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="bg-slate-900 border border-slate-750 px-3 py-2 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-indigo-500 w-full md:w-36"
              >
                <option value="All">All Status</option>
                <option value="Solved">Solved</option>
                <option value="Unsolved">Unsolved</option>
              </select>
            </div>
          </div>
        </div>

        {/* Problems Grid / List */}
        {loading ? (
          <div className="py-20 text-center space-y-3">
            <RefreshCw className="w-8 h-8 text-indigo-400 animate-spin mx-auto" />
            <p className="text-sm text-slate-400">Loading placement coding challenges...</p>
          </div>
        ) : error ? (
          <div className="p-6 bg-rose-500/10 border border-rose-500/20 text-rose-300 rounded-2xl text-center">
            {error}
          </div>
        ) : problems.length === 0 ? (
          <div className="py-16 text-center bg-slate-850 border border-slate-800 rounded-2xl space-y-3">
            <BookOpen className="w-12 h-12 text-slate-600 mx-auto" />
            <h3 className="text-base font-semibold text-slate-200">No Coding Problems Found</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              No challenges match your selected filters. Try resetting difficulty or search parameters.
            </p>
            <button
              onClick={() => {
                setSearch('');
                setDifficulty('All');
                setCategory('All');
                setStatus('All');
              }}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {problems.map((problem) => {
              const diffColor =
                problem.difficulty === 'Easy'
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                  : problem.difficulty === 'Medium'
                  ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                  : 'bg-rose-500/10 text-rose-400 border-rose-500/20';

              const solveRate =
                problem.submissionCount > 0
                  ? Math.round((problem.acceptedCount / problem.submissionCount) * 100)
                  : 0;

              return (
                <div
                  key={problem._id}
                  className="bg-slate-850 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 transition duration-200 p-5 rounded-2xl flex flex-col justify-between group shadow-lg"
                >
                  <div className="space-y-3">
                    {/* Header: Status & Difficulty */}
                    <div className="flex items-center justify-between">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${diffColor}`}>
                        {problem.difficulty}
                      </span>

                      {problem.isSolved ? (
                        <span className="flex items-center space-x-1 text-xs text-emerald-400 font-medium bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Solved</span>
                        </span>
                      ) : (
                        <span className="text-xs text-slate-500">{problem.category}</span>
                      )}
                    </div>

                    {/* Title & Description */}
                    <div>
                      <h3 className="text-base font-bold text-white group-hover:text-indigo-300 transition line-clamp-1">
                        {problem.title}
                      </h3>
                      <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                        {problem.description}
                      </p>
                    </div>

                    {/* Topics Tags */}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {problem.topics?.slice(0, 3).map((topic, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 bg-slate-900 text-slate-400 text-[10px] font-medium rounded-md border border-slate-750"
                        >
                          {topic}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Footer: Solve Button & Stats */}
                  <div className="pt-4 mt-4 border-t border-slate-800/80 flex items-center justify-between">
                    <div className="text-[11px] text-slate-500">
                      <span>Accuracy: </span>
                      <span className="text-slate-300 font-medium">{solveRate}%</span>
                    </div>

                    <Link
                      to={`/coding/problem/${problem.slug}`}
                      className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl flex items-center space-x-1 shadow transition"
                    >
                      <span>{problem.isSolved ? 'Solve Again' : 'Solve Challenge'}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
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

export default CodingPage;
