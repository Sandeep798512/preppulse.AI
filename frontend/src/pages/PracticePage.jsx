import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../components/layout/MainLayout';
import API from '../services/api';
import {
  HelpCircle,
  Briefcase,
  Zap,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Play,
  Layers,
  Sparkles,
  Loader2,
  BookOpen,
} from 'lucide-react';

const PracticePage = () => {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('technical'); // 'aptitude' | 'technical'
  const [selectedTopic, setSelectedTopic] = useState('All Topics');
  const [difficulty, setDifficulty] = useState('Mixed');
  const [mode, setMode] = useState('exam'); // 'exam' | 'practice'
  const [questionCount, setQuestionCount] = useState(10);
  const [timeLimit, setTimeLimit] = useState(15);
  const [negativeMarking, setNegativeMarking] = useState(false);

  const [starting, setStarting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const aptitudeTopics = [
    { title: 'Quantitative Aptitude', sub: 'Percentage, Profit & Loss, Ratio, Time & Work, Speed & Distance, Interest, Probability' },
    { title: 'Logical Reasoning', sub: 'Number Series, Coding-Decoding, Blood Relations, Direction Sense, Syllogisms' },
    { title: 'Verbal Ability', sub: 'Vocabulary, Grammar, Sentence Correction, Reading Comprehension' },
  ];

  const technicalTopics = [
    { title: 'Java', sub: 'OOP, Collections, Exceptions, Multithreading, Strings' },
    { title: 'Python', sub: 'Data Structures, Dictionaries, OOP, Lambda, Pandas' },
    { title: 'DSA', sub: 'Arrays, Stack, Queue, Linked List, Trees, Graphs, Sorting' },
    { title: 'DBMS', sub: 'SQL Queries, Normalization, ACID Properties, Indexing' },
    { title: 'Operating Systems', sub: 'Process Scheduling, Deadlocks, Memory, Paging' },
    { title: 'Computer Networks', sub: 'OSI Model, TCP/IP, HTTP, IP Routing' },
    { title: 'Web Development', sub: 'React, Node.js, Express, REST APIs, HTML/CSS' },
  ];

  const handleStartQuiz = async (overrideTopic) => {
    setErrorMsg('');
    setStarting(true);

    const topicToUse = overrideTopic || selectedTopic;

    try {
      const { data } = await API.post('/quizzes/start', {
        category: activeTab,
        topic: topicToUse === 'All Topics' ? '' : topicToUse,
        difficulty,
        questionCount,
        timeLimit,
        negativeMarking,
        mode,
      });

      if (data.success) {
        navigate(`/quiz/${data.quizId}`);
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to initialize quiz session.');
    } finally {
      setStarting(false);
    }
  };

  return (
    <MainLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-850 border border-slate-800 p-6 rounded-2xl shadow-xl">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-amber-500/10 text-amber-400 rounded-xl border border-amber-500/20">
              <HelpCircle className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Practice Center & MCQ Quiz Engine</h1>
              <p className="text-xs text-slate-400">Timed placement exams & immediate feedback practice mode with 250+ questions</p>
            </div>
          </div>

          <div className="flex items-center space-x-2 bg-slate-900 p-1.5 rounded-xl border border-slate-800">
            <button
              type="button"
              onClick={() => setActiveTab('technical')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition ${
                activeTab === 'technical'
                  ? 'bg-brand-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Technical MCQs
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('aptitude')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition ${
                activeTab === 'aptitude'
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Aptitude Practice
            </button>
          </div>
        </div>

        {/* Setup & Filter Grid */}
        <div className="bg-slate-850 border border-slate-800 rounded-2xl p-6 space-y-6 shadow-xl">
          <h2 className="text-sm font-bold text-white flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-brand-400" />
            <span>Customize Quiz Configuration</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            {/* Mode Selector */}
            <div>
              <label className="block font-semibold text-slate-300 mb-1.5">Quiz Mode</label>
              <select
                value={mode}
                onChange={(e) => setMode(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-brand-500 cursor-pointer"
              >
                <option value="exam">Timed Exam Mode (Placement Simulation)</option>
                <option value="practice">Practice Mode (Instant Feedback & Explanations)</option>
              </select>
            </div>

            {/* Difficulty */}
            <div>
              <label className="block font-semibold text-slate-300 mb-1.5">Difficulty Level</label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-brand-500 cursor-pointer"
              >
                <option value="Mixed">Mixed Difficulty</option>
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>

            {/* Question Count */}
            <div>
              <label className="block font-semibold text-slate-300 mb-1.5">Question Count</label>
              <select
                value={questionCount}
                onChange={(e) => setQuestionCount(Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-brand-500 cursor-pointer"
              >
                <option value={5}>5 Questions</option>
                <option value={10}>10 Questions</option>
                <option value={20}>20 Questions</option>
                <option value={30}>30 Questions</option>
              </select>
            </div>

            {/* Time Limit */}
            <div>
              <label className="block font-semibold text-slate-300 mb-1.5">Time Limit</label>
              <select
                value={timeLimit}
                onChange={(e) => setTimeLimit(Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-brand-500 cursor-pointer"
              >
                <option value={5}>5 Minutes</option>
                <option value={10}>10 Minutes</option>
                <option value={15}>15 Minutes</option>
                <option value={30}>30 Minutes</option>
              </select>
            </div>
          </div>

          {/* Negative Marking Toggle */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-800">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="negMarkingToggle"
                checked={negativeMarking}
                onChange={(e) => setNegativeMarking(e.target.checked)}
                className="w-4 h-4 text-brand-600 bg-slate-900 border-slate-700 rounded cursor-pointer"
              />
              <label htmlFor="negMarkingToggle" className="text-xs text-slate-300 font-medium cursor-pointer">
                Enable Negative Marking (+1 correct / -0.25 incorrect)
              </label>
            </div>

            <button
              type="button"
              disabled={starting}
              onClick={() => handleStartQuiz('All Topics')}
              className="px-6 py-2.5 bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs rounded-xl transition shadow-md shadow-brand-600/20 flex items-center space-x-2 disabled:opacity-50"
            >
              {starting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-white" />}
              <span>{starting ? 'Preparing Quiz...' : 'Start Mixed Topic Exam'}</span>
            </button>
          </div>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-2xl text-xs flex items-center space-x-3">
            <AlertTriangle className="w-5 h-5 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Topic Cards Grid */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-white flex items-center space-x-2">
            <BookOpen className="w-5 h-5 text-brand-400" />
            <span>Select Specific Topic to Practice</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {(activeTab === 'technical' ? technicalTopics : aptitudeTopics).map((t, idx) => (
              <div
                key={idx}
                className="bg-slate-850 border border-slate-800 hover:border-brand-500/50 rounded-2xl p-5 transition-all flex flex-col justify-between group space-y-4"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white group-hover:text-brand-400 transition">{t.title}</span>
                    <span className="text-[10px] bg-slate-900 border border-slate-700 text-slate-400 px-2 py-0.5 rounded-full font-semibold">
                      {activeTab.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">{t.sub}</p>
                </div>

                <button
                  type="button"
                  disabled={starting}
                  onClick={() => handleStartQuiz(t.title)}
                  className="w-full py-2 bg-slate-900 group-hover:bg-brand-600 text-slate-300 group-hover:text-white font-semibold text-xs rounded-xl transition flex items-center justify-center space-x-1.5 border border-slate-700/80 group-hover:border-brand-500"
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>Practice {t.title}</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default PracticePage;
