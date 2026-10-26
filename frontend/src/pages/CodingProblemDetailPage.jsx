import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import MainLayout from '../components/layout/MainLayout';
import {
  Code,
  Play,
  Send,
  RotateCcw,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  Sparkles,
  ChevronLeft,
  ChevronDown,
  ChevronUp,
  FileCode,
  Terminal,
  HelpCircle,
  Layers,
  Award,
  RefreshCw,
} from 'lucide-react';
import { getCodingProblemBySlug, runCodingCode, submitCodingSolution } from '../services/codingApi';
import confetti from 'canvas-confetti';

const CodingProblemDetailPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();

  const [problem, setProblem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Code & Language State
  const [language, setLanguage] = useState('javascript');
  const [code, setCode] = useState('');

  // Custom Input
  const [useCustomInput, setUseCustomInput] = useState(false);
  const [customInputText, setCustomInputText] = useState('');

  // Execution State
  const [executing, setExecuting] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('description');
  const [consoleResult, setConsoleResult] = useState(null);

  // Hints Accordion
  const [expandedHint, setExpandedHint] = useState(null);

  useEffect(() => {
    const fetchProblem = async () => {
      setLoading(true);
      try {
        const res = await getCodingProblemBySlug(slug);
        if (res.success) {
          setProblem(res.data);
          // Set initial starter code
          if (res.data.starterCode && res.data.starterCode[language]) {
            setCode(res.data.starterCode[language]);
          } else {
            setCode('// Write your solution here\nfunction solve(input) {\n  return "";\n}');
          }
        }
      } catch (err) {
        console.error('Error fetching problem details:', err);
        setError('Failed to load coding problem details.');
      } finally {
        setLoading(false);
      }
    };

    fetchProblem();
  }, [slug]);

  // Update starter code when language changes
  const handleLanguageChange = (newLang) => {
    setLanguage(newLang);
    if (problem && problem.starterCode && problem.starterCode[newLang]) {
      setCode(problem.starterCode[newLang]);
    }
  };

  const handleResetCode = () => {
    if (problem && problem.starterCode && problem.starterCode[language]) {
      setCode(problem.starterCode[language]);
    }
  };

  const handleRunSampleCode = async () => {
    setExecuting(true);
    setConsoleResult(null);
    try {
      const res = await runCodingCode(problem._id, {
        code,
        language,
        customInput: useCustomInput ? customInputText : undefined,
      });

      if (res.success) {
        setConsoleResult({
          type: res.type,
          ...res.data,
        });
      }
    } catch (err) {
      console.error('Run code error:', err);
      setConsoleResult({
        overallStatus: 'Execution Error',
        testResults: [{ status: 'Error', stderr: err.response?.data?.message || err.message }],
      });
    } finally {
      setExecuting(false);
    }
  };

  const handleSubmitSolution = async () => {
    setSubmitting(true);
    setConsoleResult(null);
    try {
      const res = await submitCodingSolution(problem._id, {
        code,
        language,
      });

      if (res.success) {
        setConsoleResult({
          type: 'submission',
          overallStatus: res.data.status,
          passedTests: res.data.passCount,
          totalTests: res.data.totalTestCases,
          score: res.data.score,
          executionTimeMs: res.data.executionTimeMs,
          testResults: res.data.testResults,
        });

        if (res.data.status === 'Accepted') {
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 },
          });
        }
      }
    } catch (err) {
      console.error('Submit solution error:', err);
      setConsoleResult({
        overallStatus: 'Submission Error',
        testResults: [{ status: 'Error', stderr: err.response?.data?.message || err.message }],
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="py-24 text-center space-y-3">
          <RefreshCw className="w-10 h-10 text-indigo-400 animate-spin mx-auto" />
          <p className="text-sm text-slate-400">Loading IDE & test cases...</p>
        </div>
      </MainLayout>
    );
  }

  if (error || !problem) {
    return (
      <MainLayout>
        <div className="p-6 bg-rose-500/10 border border-rose-500/20 text-rose-300 rounded-2xl text-center space-y-4">
          <p className="text-base font-semibold">{error || 'Problem not found'}</p>
          <Link
            to="/coding"
            className="inline-flex items-center space-x-2 px-4 py-2 bg-slate-800 text-slate-200 text-xs font-semibold rounded-xl"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Back to Coding Practice</span>
          </Link>
        </div>
      </MainLayout>
    );
  }

  const diffColor =
    problem.difficulty === 'Easy'
      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
      : problem.difficulty === 'Medium'
      ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
      : 'bg-rose-500/10 text-rose-400 border-rose-500/20';

  return (
    <MainLayout>
      <div className="space-y-4">
        {/* Top Header Navigation */}
        <div className="flex items-center justify-between bg-slate-850 border border-slate-800 px-5 py-3 rounded-2xl">
          <div className="flex items-center space-x-3">
            <Link
              to="/coding"
              className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition"
            >
              <ChevronLeft className="w-4 h-4" />
            </Link>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-base font-bold text-white">{problem.title}</h1>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${diffColor}`}>
                  {problem.difficulty}
                </span>
                {problem.isSolved && (
                  <span className="flex items-center space-x-1 text-[10px] text-emerald-400 font-medium bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Solved</span>
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Category: {problem.category} • Time Limit: {problem.timeLimitSeconds}s
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Link
              to="/coding/submissions"
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-medium rounded-xl border border-slate-700 flex items-center space-x-1 transition"
            >
              <Clock className="w-3.5 h-3.5" />
              <span>History</span>
            </Link>
          </div>
        </div>

        {/* Workspace: Split 2-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 min-h-[650px]">
          {/* Left Column: Problem Specs (5 cols) */}
          <div className="lg:col-span-5 bg-slate-850 border border-slate-800 rounded-2xl flex flex-col overflow-hidden shadow-xl">
            {/* Tabs Header */}
            <div className="flex items-center border-b border-slate-800 bg-slate-900/60 px-4">
              <button
                onClick={() => setActiveTab('description')}
                className={`px-3 py-3 text-xs font-semibold border-b-2 transition ${
                  activeTab === 'description'
                    ? 'border-indigo-500 text-indigo-400'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                Description
              </button>
              <button
                onClick={() => setActiveTab('hints')}
                className={`px-3 py-3 text-xs font-semibold border-b-2 transition flex items-center space-x-1 ${
                  activeTab === 'hints'
                    ? 'border-indigo-500 text-indigo-400'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span>Hints ({problem.hints?.length || 0})</span>
              </button>
            </div>

            {/* Tab Content */}
            <div className="p-5 flex-1 overflow-y-auto space-y-6 text-slate-300 text-sm">
              {activeTab === 'description' && (
                <>
                  {/* Problem Description */}
                  <div className="space-y-2">
                    <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Problem Statement</h3>
                    <p className="text-slate-200 text-sm leading-relaxed whitespace-pre-line">
                      {problem.description}
                    </p>
                  </div>

                  {/* Input & Output Format */}
                  <div className="space-y-3 bg-slate-900/80 p-4 rounded-xl border border-slate-800">
                    <div>
                      <span className="text-xs font-semibold text-indigo-400">Input Format:</span>
                      <p className="text-xs text-slate-300 mt-1 font-mono whitespace-pre-line">
                        {problem.inputFormat}
                      </p>
                    </div>
                    <div>
                      <span className="text-xs font-semibold text-indigo-400">Output Format:</span>
                      <p className="text-xs text-slate-300 mt-1 font-mono whitespace-pre-line">
                        {problem.outputFormat}
                      </p>
                    </div>
                  </div>

                  {/* Examples */}
                  <div className="space-y-4">
                    <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Examples</h3>
                    {problem.examples?.map((ex, index) => (
                      <div key={index} className="bg-slate-900 border border-slate-750 p-4 rounded-xl space-y-2 font-mono text-xs">
                        <div className="text-slate-400 font-semibold text-[11px]">Example {index + 1}:</div>
                        <div>
                          <span className="text-slate-500">Input:</span>
                          <pre className="text-slate-200 bg-slate-950 p-2 rounded-md mt-1 overflow-x-auto">
                            {ex.input}
                          </pre>
                        </div>
                        <div>
                          <span className="text-slate-500">Output:</span>
                          <pre className="text-emerald-400 bg-slate-950 p-2 rounded-md mt-1 overflow-x-auto">
                            {ex.output}
                          </pre>
                        </div>
                        {ex.explanation && (
                          <p className="text-[11px] text-slate-400 font-sans pt-1">
                            <span className="text-slate-500 font-semibold">Explanation: </span>
                            {ex.explanation}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Constraints */}
                  {problem.constraints?.length > 0 && (
                    <div className="space-y-2">
                      <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Constraints</h3>
                      <ul className="list-disc list-inside space-y-1 text-xs font-mono text-slate-300 bg-slate-900/50 p-3 rounded-xl border border-slate-800">
                        {problem.constraints.map((c, i) => (
                          <li key={i}>{c}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Topics & Tags */}
                  <div className="space-y-2 pt-2">
                    <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Topics</h3>
                    <div className="flex flex-wrap gap-1.5">
                      {problem.topics?.map((topic, i) => (
                        <span key={i} className="px-2.5 py-1 bg-indigo-500/10 text-indigo-300 text-xs font-medium rounded-lg border border-indigo-500/20">
                          {topic}
                        </span>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {activeTab === 'hints' && (
                <div className="space-y-3">
                  {problem.hints && problem.hints.length > 0 ? (
                    problem.hints.map((hint, i) => (
                      <div key={i} className="bg-slate-900 border border-slate-750 rounded-xl overflow-hidden">
                        <button
                          onClick={() => setExpandedHint(expandedHint === i ? null : i)}
                          className="w-full flex items-center justify-between p-3.5 text-xs font-semibold text-slate-200 hover:bg-slate-800/60 transition"
                        >
                          <span className="flex items-center space-x-2">
                            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                            <span>Hint {i + 1}</span>
                          </span>
                          {expandedHint === i ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                        </button>
                        {expandedHint === i && (
                          <div className="p-4 border-t border-slate-800 text-xs text-slate-300 bg-slate-950/60 leading-relaxed">
                            {hint}
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-slate-500 italic text-center py-8">No hints available for this challenge.</p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Online Code Editor & Console (7 cols) */}
          <div className="lg:col-span-7 flex flex-col space-y-4">
            {/* Code Editor Container */}
            <div className="bg-slate-850 border border-slate-800 rounded-2xl flex flex-col flex-1 overflow-hidden shadow-xl">
              {/* Editor Header Bar */}
              <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900 border-b border-slate-800">
                <div className="flex items-center space-x-3">
                  <FileCode className="w-4 h-4 text-indigo-400" />
                  <select
                    value={language}
                    onChange={(e) => handleLanguageChange(e.target.value)}
                    className="bg-slate-850 border border-slate-700 px-3 py-1 rounded-lg text-xs font-semibold text-slate-200 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="javascript">JavaScript (Node.js)</option>
                    <option value="python">Python 3</option>
                    <option value="java">Java 17</option>
                  </select>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleResetCode}
                    className="px-2.5 py-1 bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-medium rounded-lg border border-slate-700 flex items-center space-x-1 transition"
                    title="Reset to starter code"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Reset</span>
                  </button>
                </div>
              </div>

              {/* Code Textarea Editor */}
              <div className="relative flex-1 bg-slate-950 p-4">
                <textarea
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="// Write your code here..."
                  spellCheck="false"
                  className="w-full h-full min-h-[340px] bg-transparent text-emerald-400 font-mono text-xs leading-relaxed resize-none focus:outline-none border-none selection:bg-indigo-500/30"
                />
              </div>

              {/* Custom Input Toggle Bar */}
              <div className="border-t border-slate-800 bg-slate-900/90 px-4 py-2 flex flex-col space-y-2">
                <div className="flex items-center justify-between">
                  <label className="flex items-center space-x-2 text-xs text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={useCustomInput}
                      onChange={(e) => setUseCustomInput(e.target.checked)}
                      className="rounded border-slate-700 text-indigo-600 focus:ring-0 bg-slate-900"
                    />
                    <span>Test Custom Input</span>
                  </label>
                </div>

                {useCustomInput && (
                  <textarea
                    value={customInputText}
                    onChange={(e) => setCustomInputText(e.target.value)}
                    placeholder="Enter custom input lines here..."
                    className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-xl font-mono text-xs text-slate-200 focus:outline-none focus:border-indigo-500 h-20 resize-none"
                  />
                )}
              </div>

              {/* Editor Action Buttons */}
              <div className="p-3 bg-slate-900 border-t border-slate-800 flex items-center justify-end space-x-3">
                <button
                  onClick={handleRunSampleCode}
                  disabled={executing || submitting}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 flex items-center space-x-2 transition disabled:opacity-50"
                >
                  {executing ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-indigo-400" />
                  ) : (
                    <Play className="w-3.5 h-3.5 text-emerald-400" />
                  )}
                  <span>Run Sample Code</span>
                </button>

                <button
                  onClick={handleSubmitSolution}
                  disabled={executing || submitting}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-indigo-600/20 flex items-center space-x-2 transition disabled:opacity-50"
                >
                  {submitting ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Send className="w-3.5 h-3.5" />
                  )}
                  <span>Submit Solution</span>
                </button>
              </div>
            </div>

            {/* Execution Console Results Box */}
            {consoleResult && (
              <div className="bg-slate-850 border border-slate-800 rounded-2xl p-4 space-y-3 shadow-xl">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center space-x-2">
                    <Terminal className="w-4 h-4 text-slate-400" />
                    <span className="text-xs font-bold text-white uppercase tracking-wider">
                      {consoleResult.type === 'submission' ? 'Submission Evaluation Result' : 'Execution Console Output'}
                    </span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                        consoleResult.overallStatus === 'Accepted' || consoleResult.status === 'Success'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                      }`}
                    >
                      {consoleResult.overallStatus || consoleResult.status}
                    </span>

                    {consoleResult.executionTimeMs !== undefined && (
                      <span className="text-[11px] text-slate-400 flex items-center space-x-1">
                        <Clock className="w-3 h-3" />
                        <span>{consoleResult.executionTimeMs} ms</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Custom Input Output */}
                {consoleResult.type === 'custom' && (
                  <div className="space-y-2 font-mono text-xs">
                    <div>
                      <span className="text-slate-500 text-[11px]">Standard Output:</span>
                      <pre className="bg-slate-950 p-3 rounded-xl text-slate-200 mt-1 whitespace-pre-wrap">
                        {consoleResult.stdout || '(No output)'}
                      </pre>
                    </div>
                    {consoleResult.stderr && (
                      <div>
                        <span className="text-rose-400 text-[11px]">Error Output:</span>
                        <pre className="bg-rose-950/40 border border-rose-500/20 p-3 rounded-xl text-rose-300 mt-1 whitespace-pre-wrap">
                          {consoleResult.stderr}
                        </pre>
                      </div>
                    )}
                  </div>
                )}

                {/* Sample / Full Test Cases Accordion */}
                {(consoleResult.type === 'sample' || consoleResult.type === 'submission') && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs text-slate-300">
                      <span>
                        Test Cases Passed: <strong className="text-white">{consoleResult.passedTests}</strong> / {consoleResult.totalTests}
                      </span>
                      {consoleResult.score !== undefined && (
                        <span className="font-semibold text-indigo-400">Score: {consoleResult.score}%</span>
                      )}
                    </div>

                    <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                      {consoleResult.testResults?.map((tr, index) => (
                        <div
                          key={index}
                          className={`p-3 rounded-xl border font-mono text-xs space-y-1.5 ${
                            tr.passed
                              ? 'bg-emerald-950/20 border-emerald-500/20 text-emerald-200'
                              : 'bg-rose-950/20 border-rose-500/20 text-rose-200'
                          }`}
                        >
                          <div className="flex items-center justify-between font-sans">
                            <span className="font-semibold text-xs flex items-center space-x-1.5">
                              {tr.passed ? (
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                              ) : (
                                <XCircle className="w-3.5 h-3.5 text-rose-400" />
                              )}
                              <span>Test Case #{tr.testCaseIndex || index + 1}</span>
                              {tr.isHidden && (
                                <span className="text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded">
                                  Hidden Case
                                </span>
                              )}
                            </span>
                            <span className="text-[11px] font-semibold">{tr.status}</span>
                          </div>

                          {!tr.isHidden && (
                            <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
                              <div>
                                <span className="text-slate-500">Expected:</span>
                                <pre className="text-slate-300 bg-slate-950/80 p-1.5 rounded mt-0.5 overflow-x-auto">
                                  {tr.expectedOutput}
                                </pre>
                              </div>
                              <div>
                                <span className="text-slate-500">Actual:</span>
                                <pre className="text-slate-300 bg-slate-950/80 p-1.5 rounded mt-0.5 overflow-x-auto">
                                  {tr.actualOutput}
                                </pre>
                              </div>
                            </div>
                          )}

                          {tr.stderr && (
                            <div className="text-[11px] text-rose-400 pt-1">
                              <span>Error: {tr.stderr}</span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default CodingProblemDetailPage;
