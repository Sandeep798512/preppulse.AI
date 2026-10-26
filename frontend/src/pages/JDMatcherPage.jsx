import React, { useState, useEffect } from 'react';
import MainLayout from '../components/layout/MainLayout';
import JDMatchScorecard from '../components/matching/JDMatchScorecard';
import API from '../services/api';
import {
  GitCompare,
  FileText,
  Sparkles,
  Loader2,
  AlertCircle,
  Briefcase,
  CheckCircle2,
  Copy,
  Zap,
} from 'lucide-react';

const JDMatcherPage = () => {
  const [resumes, setResumes] = useState([]);
  const [selectedResumeId, setSelectedResumeId] = useState('');

  // JD Inputs
  const [jobTitle, setJobTitle] = useState('Java Developer');
  const [company, setCompany] = useState('Target Enterprise');
  const [jdText, setJdText] = useState('');

  // Execution States
  const [analyzingJD, setAnalyzingJD] = useState(false);
  const [analyzingMatch, setAnalyzingMatch] = useState(false);
  const [extractedJD, setExtractedJD] = useState(null);
  const [matchResult, setMatchResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  // Sample Preset JDs for instant Viva demonstration
  const sampleJDs = [
    {
      title: 'Java Backend Developer',
      company: 'TechCorp Solutions',
      text: `We are looking for a Java Developer with 0-2 years of experience.
Key Requirements:
- Strong proficiency in Java 8+, Spring Boot, and REST API development.
- Solid understanding of SQL databases (MySQL/PostgreSQL) and database design.
- Hands-on experience with Git version control and OOP principles.
- Familiarity with Cloud platforms (AWS/Docker) is a plus.
Responsibilities:
- Build scalable RESTful microservices.
- Optimize database queries and collaborate in an Agile development team.`,
    },
    {
      title: 'Full Stack Web Engineer',
      company: 'Innovate Labs',
      text: `Hiring a Full Stack Developer proficient in the MERN stack (MongoDB, Express, React, Node.js).
Requirements:
- Strong skills in JavaScript, HTML5, CSS3, React.js, and Node.js.
- Experience building REST APIs and managing MongoDB databases.
- Good understanding of Git, DSA, and modern Web Security (JWT).
- Preferred: Tailwind CSS, Docker, AWS.`,
    },
    {
      title: 'Data Analyst & Python Developer',
      company: 'DataPulse Systems',
      text: `Seeking a Data Analyst with strong Python and SQL skills.
Requirements:
- Proficient in SQL queries, GROUP BY, subqueries, and window functions.
- Experience with Python data analysis libraries: Pandas, NumPy, and Data Visualization.
- Ability to create reports and communicate key metrics to stakeholders.`,
    },
  ];

  useEffect(() => {
    fetchResumes();
  }, []);

  const fetchResumes = async () => {
    try {
      const { data } = await API.get('/resume');
      if (data.success && data.resumes.length > 0) {
        setResumes(data.resumes);
        setSelectedResumeId(data.resumes[0]._id);
      }
    } catch (err) {
      console.error('Failed to fetch resumes for matching:', err);
    }
  };

  const handleAnalyzeJD = async () => {
    if (!jdText || jdText.trim().length < 30) {
      setErrorMsg('Please enter a valid job description containing enough text for analysis (at least 30 characters).');
      return;
    }

    setErrorMsg('');
    setAnalyzingJD(true);

    try {
      const { data } = await API.post('/jobs/analyze', {
        title: jobTitle,
        company,
        description: jdText,
      });

      if (data.success) {
        setExtractedJD(data.jobDescription);
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to analyze job description.');
    } finally {
      setAnalyzingJD(false);
    }
  };

  const handleRunMatch = async () => {
    if (!selectedResumeId) {
      setErrorMsg('Please select an analyzed resume to compare.');
      return;
    }

    if (!extractedJD) {
      setErrorMsg('Please analyze the Job Description first.');
      return;
    }

    setErrorMsg('');
    setAnalyzingMatch(true);

    try {
      const { data } = await API.post('/matching/analyze', {
        resumeId: selectedResumeId,
        jobDescriptionId: extractedJD._id,
      });

      if (data.success) {
        setMatchResult(data.match);
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to calculate compatibility match.');
    } finally {
      setAnalyzingMatch(false);
    }
  };

  const loadSample = (sample) => {
    setJobTitle(sample.title);
    setCompany(sample.company);
    setJdText(sample.text);
    setExtractedJD(null);
    setMatchResult(null);
    setErrorMsg('');
  };

  const selectedResume = resumes.find(r => r._id === selectedResumeId);

  return (
    <MainLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-850 border border-slate-800 p-6 rounded-2xl shadow-xl">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20">
              <GitCompare className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Resume vs Job Description Matcher</h1>
              <p className="text-xs text-slate-400">5-factor mathematical compatibility engine comparing skills, keywords, education & experience</p>
            </div>
          </div>
        </div>

        {/* Setup Form Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Step 1: Select Resume */}
          <div className="lg:col-span-1 bg-slate-850 border border-slate-800 rounded-2xl p-6 space-y-4">
            <div className="flex items-center space-x-2 text-sm font-bold text-white">
              <span className="w-6 h-6 rounded-full bg-brand-600 text-white flex items-center justify-center text-xs">1</span>
              <span>Select Analyzed Resume</span>
            </div>

            {resumes.length > 0 ? (
              <div className="space-y-3">
                <label className="block text-xs font-semibold text-slate-300">Choose Candidate Resume</label>
                <select
                  value={selectedResumeId}
                  onChange={(e) => setSelectedResumeId(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-brand-500 cursor-pointer"
                >
                  {resumes.map((r) => (
                    <option key={r._id} value={r._id}>
                      {r.originalFileName} (Score: {r.resumeScore}/100)
                    </option>
                  ))}
                </select>

                {selectedResume && (
                  <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl space-y-1 text-xs">
                    <div className="font-semibold text-slate-200">{selectedResume.originalFileName}</div>
                    <div className="text-[11px] text-slate-400">Score: <strong className="text-brand-400">{selectedResume.resumeScore}/100</strong></div>
                    <div className="text-[10px] text-slate-400 truncate">Skills: {(selectedResume.skills || []).slice(0, 5).join(', ')}</div>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-xl text-xs text-amber-300 space-y-2">
                <p>No analyzed resumes found. Please upload a resume first in the Resume Analyzer module.</p>
              </div>
            )}
          </div>

          {/* Step 2: Paste or Select Sample JD */}
          <div className="lg:col-span-2 bg-slate-850 border border-slate-800 rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-sm font-bold text-white">
                <span className="w-6 h-6 rounded-full bg-brand-600 text-white flex items-center justify-center text-xs">2</span>
                <span>Enter Target Job Description</span>
              </div>

              <div className="flex items-center space-x-2">
                <span className="text-[11px] text-slate-400">Presets:</span>
                {sampleJDs.map((s, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => loadSample(s)}
                    className="text-[10px] font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 px-2 py-1 rounded transition"
                  >
                    {s.title.split(' ')[0]}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Target Role Title</label>
                <input
                  type="text"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  placeholder="Java Developer"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-brand-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Target Company Name</label>
                <input
                  type="text"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="Target Employer"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-brand-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Job Description Text</label>
              <textarea
                rows={6}
                value={jdText}
                onChange={(e) => setJdText(e.target.value)}
                placeholder="Paste the target job description requirements, responsibilities, and qualifications here..."
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3.5 text-xs text-white focus:outline-none focus:border-brand-500 leading-relaxed"
              />
            </div>

            <div className="flex items-center space-x-3 pt-2">
              <button
                type="button"
                disabled={analyzingJD}
                onClick={handleAnalyzeJD}
                className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs rounded-xl transition flex items-center space-x-2 disabled:opacity-50"
              >
                {analyzingJD ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4 text-brand-400" />}
                <span>{analyzingJD ? 'Extracting JD Requirements...' : '1. Extract JD Requirements'}</span>
              </button>

              <button
                type="button"
                disabled={analyzingMatch || !extractedJD}
                onClick={handleRunMatch}
                className="px-6 py-2.5 bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs rounded-xl transition shadow-md shadow-brand-600/20 flex items-center space-x-2 disabled:opacity-50"
              >
                {analyzingMatch ? <Loader2 className="w-4 h-4 animate-spin" /> : <GitCompare className="w-4 h-4" />}
                <span>{analyzingMatch ? 'Calculating 5-Factor Match...' : '2. Run 5-Factor Match Audit'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-2xl text-xs flex items-center space-x-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Extracted JD Requirements Panel */}
        {extractedJD && (
          <div className="bg-slate-850 border border-slate-800 rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                <Briefcase className="w-4 h-4 text-emerald-400" />
                <span>Extracted Job Description Requirements</span>
              </h3>
              <span className="text-xs bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 px-2.5 py-0.5 rounded-full font-medium">
                {extractedJD.jobTitle} • {extractedJD.company}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl space-y-2">
                <span className="font-bold text-slate-300 uppercase tracking-wider text-[10px] block">Required Skills:</span>
                <div className="flex flex-wrap gap-1.5">
                  {(extractedJD.requiredSkills || []).map((s, idx) => (
                    <span key={idx} className="bg-brand-500/10 text-brand-300 border border-brand-500/20 px-2 py-0.5 rounded">
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl space-y-2">
                <span className="font-bold text-slate-300 uppercase tracking-wider text-[10px] block">Preferred Skills:</span>
                <div className="flex flex-wrap gap-1.5">
                  {(extractedJD.preferredSkills || []).map((ps, idx) => (
                    <span key={idx} className="bg-purple-500/10 text-purple-300 border border-purple-500/20 px-2 py-0.5 rounded">
                      {ps}
                    </span>
                  ))}
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl space-y-2">
                <span className="font-bold text-slate-300 uppercase tracking-wider text-[10px] block">Soft Skills & Requirements:</span>
                <div className="flex flex-wrap gap-1.5">
                  {(extractedJD.softSkills || []).map((ss, idx) => (
                    <span key={idx} className="bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 px-2 py-0.5 rounded">
                      {ss}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Match Scorecard Results */}
        {matchResult ? (
          <JDMatchScorecard
            matchResult={matchResult}
            resume={selectedResume}
            jobDescription={extractedJD}
            onReanalyze={handleRunMatch}
          />
        ) : (
          <div className="bg-slate-850 border border-slate-800 rounded-2xl p-12 text-center text-slate-400 space-y-3">
            <GitCompare className="w-12 h-12 text-slate-600 mx-auto" />
            <h3 className="font-bold text-white text-base">No Job Comparison Executed Yet</h3>
            <p className="text-xs max-w-sm mx-auto">
              Select an analyzed resume, paste a target job description above, and click "Run 5-Factor Match Audit" to generate your compatibility report.
            </p>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default JDMatcherPage;
