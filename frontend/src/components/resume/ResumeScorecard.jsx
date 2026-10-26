import React from 'react';
import {
  Award,
  CheckCircle2,
  AlertTriangle,
  FileCheck,
  TrendingUp,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  HelpCircle,
  Target,
  Zap,
} from 'lucide-react';

const ResumeScorecard = ({ resume, onReanalyze, isAnalyzing }) => {
  if (!resume) return null;

  const {
    originalFileName,
    resumeScore = 0,
    atsCompatibilityScore = 0,
    sectionScore = 0,
    contentScore = 0,
    skillsScore = 0,
    experienceScore = 0,
    readabilityScore = 0,
    strengths = [],
    weaknesses = [],
    missingSections = [],
    recommendations = [],
    contentIssues = [],
    keywordSuggestions = [],
    sectionChecklist = {},
    skills = [],
  } = resume;

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'HIGH':
        return 'bg-red-500/10 text-red-400 border-red-500/30';
      case 'MEDIUM':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      case 'LOW':
      default:
        return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
    }
  };

  return (
    <div className="space-y-6">
      {/* Overview Top Card */}
      <div className="bg-gradient-to-br from-slate-850 via-slate-900 to-slate-950 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-2 bg-brand-500/10 text-brand-400 border border-brand-500/20 px-3 py-1 rounded-full text-xs font-semibold">
              <FileCheck className="w-3.5 h-3.5" />
              <span>Resume Audit: {originalFileName}</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-white">AI Resume Scorecard</h2>
            <p className="text-xs text-slate-400 max-w-xl">
              Evaluated using transparent weighted scoring across Structure, Content Quality, Technical Skills, Project/Experience depth, and Readability.
            </p>
          </div>

          <div className="flex items-center space-x-4 bg-slate-900/90 border border-slate-700/80 p-4 rounded-2xl">
            {/* Overall Score */}
            <div className="text-center pr-4 border-r border-slate-800">
              <div className="text-xs text-slate-400 font-medium">Overall Score</div>
              <div className="text-4xl font-black text-brand-400 tracking-tight">{resumeScore}<span className="text-sm font-bold text-slate-500">/100</span></div>
              <div className="text-[10px] text-emerald-400 font-semibold mt-0.5">Weighted Final</div>
            </div>

            {/* ATS Score */}
            <div className="text-center pl-2">
              <div className="text-xs text-slate-400 font-medium">AI Compatibility</div>
              <div className="text-3xl font-extrabold text-indigo-400">{atsCompatibilityScore}%</div>
              <div className="text-[10px] text-slate-400 mt-0.5">Format & Readability</div>
            </div>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between">
          <span className="text-xs text-slate-400">
            Note: "AI Resume Compatibility Score" evaluates formatting & skill clarity, not individual company ATS algorithms.
          </span>
          <button
            onClick={onReanalyze}
            disabled={isAnalyzing}
            className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs transition flex items-center space-x-1.5 shadow-md shadow-brand-600/20 disabled:opacity-50"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isAnalyzing ? 'Analyzing...' : 'Re-Run AI Analysis'}</span>
          </button>
        </div>
      </div>

      {/* 5-Part Score Breakdown Bar Chart / Indicators */}
      <div className="bg-slate-850 border border-slate-800 rounded-2xl p-6 space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center space-x-2">
          <Award className="w-4 h-4 text-brand-400" />
          <span>Transparent 5-Factor Score Breakdown</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="bg-slate-900 border border-slate-700/60 p-3.5 rounded-xl space-y-1.5">
            <div className="flex justify-between text-xs font-semibold text-slate-300">
              <span>Structure</span>
              <span className="text-brand-400">{sectionScore}/100</span>
            </div>
            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
              <div className="bg-brand-500 h-full rounded-full" style={{ width: `${sectionScore}%` }} />
            </div>
            <span className="text-[10px] text-slate-400">Weight: 20%</span>
          </div>

          <div className="bg-slate-900 border border-slate-700/60 p-3.5 rounded-xl space-y-1.5">
            <div className="flex justify-between text-xs font-semibold text-slate-300">
              <span>Content Quality</span>
              <span className="text-indigo-400">{contentScore}/100</span>
            </div>
            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
              <div className="bg-indigo-500 h-full rounded-full" style={{ width: `${contentScore}%` }} />
            </div>
            <span className="text-[10px] text-slate-400">Weight: 25%</span>
          </div>

          <div className="bg-slate-900 border border-slate-700/60 p-3.5 rounded-xl space-y-1.5">
            <div className="flex justify-between text-xs font-semibold text-slate-300">
              <span>Skills & Keywords</span>
              <span className="text-emerald-400">{skillsScore}/100</span>
            </div>
            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
              <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${skillsScore}%` }} />
            </div>
            <span className="text-[10px] text-slate-400">Weight: 20%</span>
          </div>

          <div className="bg-slate-900 border border-slate-700/60 p-3.5 rounded-xl space-y-1.5">
            <div className="flex justify-between text-xs font-semibold text-slate-300">
              <span>Projects/Exp</span>
              <span className="text-amber-400">{experienceScore}/100</span>
            </div>
            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
              <div className="bg-amber-500 h-full rounded-full" style={{ width: `${experienceScore}%` }} />
            </div>
            <span className="text-[10px] text-slate-400">Weight: 20%</span>
          </div>

          <div className="bg-slate-900 border border-slate-700/60 p-3.5 rounded-xl space-y-1.5">
            <div className="flex justify-between text-xs font-semibold text-slate-300">
              <span>Readability</span>
              <span className="text-violet-400">{readabilityScore}/100</span>
            </div>
            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
              <div className="bg-violet-500 h-full rounded-full" style={{ width: `${readabilityScore}%` }} />
            </div>
            <span className="text-[10px] text-slate-400">Weight: 15%</span>
          </div>
        </div>
      </div>

      {/* Grid for Strengths & Weaknesses */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Strengths */}
        <div className="bg-slate-850 border border-slate-800 rounded-2xl p-6 space-y-3">
          <h3 className="text-sm font-bold text-white flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Identified Resume Strengths</span>
          </h3>
          {strengths.length > 0 ? (
            <ul className="space-y-2">
              {strengths.map((str, i) => (
                <li key={i} className="text-xs text-slate-300 flex items-start space-x-2 bg-emerald-500/5 border border-emerald-500/10 p-2.5 rounded-xl">
                  <span className="text-emerald-400 font-bold">•</span>
                  <span>{str}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-slate-400">No major strengths identified yet.</p>
          )}
        </div>

        {/* Weaknesses */}
        <div className="bg-slate-850 border border-slate-800 rounded-2xl p-6 space-y-3">
          <h3 className="text-sm font-bold text-white flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <span>Areas for Improvement</span>
          </h3>
          {weaknesses.length > 0 ? (
            <ul className="space-y-2">
              {weaknesses.map((wk, i) => (
                <li key={i} className="text-xs text-slate-300 flex items-start space-x-2 bg-amber-500/5 border border-amber-500/10 p-2.5 rounded-xl">
                  <span className="text-amber-400 font-bold">•</span>
                  <span>{wk}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-slate-400">No major structural weaknesses detected.</p>
          )}
        </div>
      </div>

      {/* Section Checklist & Missing Sections */}
      <div className="bg-slate-850 border border-slate-800 rounded-2xl p-6 space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center space-x-2">
          <ShieldCheck className="w-4 h-4 text-brand-400" />
          <span>Resume Structure Section Checklist</span>
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          {[
            { label: 'Contact Info', key: 'contactInfo' },
            { label: 'Summary', key: 'summary' },
            { label: 'Education', key: 'education' },
            { label: 'Skills', key: 'skills' },
            { label: 'Projects', key: 'projects' },
            { label: 'Experience', key: 'experience' },
            { label: 'Certifications', key: 'certifications' },
          ].map((item) => {
            const isPresent = sectionChecklist[item.key];
            return (
              <div
                key={item.key}
                className={`p-3 rounded-xl border text-center text-xs font-semibold flex flex-col items-center justify-center space-y-1 ${
                  isPresent
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                    : 'bg-slate-900 border-slate-700 text-slate-400 opacity-60'
                }`}
              >
                {isPresent ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-slate-500" />
                )}
                <span>{item.label}</span>
              </div>
            );
          })}
        </div>

        {missingSections.length > 0 && (
          <div className="bg-amber-500/10 border border-amber-500/20 p-3 rounded-xl text-xs text-amber-300 flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            <span>Missing Sections Detected: {missingSections.join(', ')}</span>
          </div>
        )}
      </div>

      {/* Actionable Prioritized Recommendations */}
      <div className="bg-slate-850 border border-slate-800 rounded-2xl p-6 space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center space-x-2">
          <Target className="w-4 h-4 text-brand-400" />
          <span>Prioritized Recommendations</span>
        </h3>

        <div className="space-y-2.5">
          {recommendations.map((rec, i) => (
            <div key={i} className="bg-slate-900 border border-slate-700/80 p-3.5 rounded-xl flex items-start space-x-3">
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getPriorityBadge(rec.priority)}`}>
                {rec.priority}
              </span>
              <p className="text-xs text-slate-200 leading-relaxed">{rec.text}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Content Improvements / Phrasing Suggestions */}
      {contentIssues.length > 0 && (
        <div className="bg-slate-850 border border-slate-800 rounded-2xl p-6 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-brand-400" />
            <span>Content Quality & Bullet Improvement AI Coach</span>
          </h3>

          <div className="space-y-3">
            {contentIssues.map((issue, idx) => (
              <div key={idx} className="bg-slate-900 border border-slate-700/80 p-4 rounded-xl space-y-2 text-xs">
                <div className="flex items-center space-x-2 text-red-400 font-medium">
                  <span className="font-bold">Weak Statement:</span>
                  <span className="italic">"{issue.weakStatement}"</span>
                </div>
                <div className="flex items-center space-x-2 text-emerald-400 font-medium">
                  <span className="font-bold">Better Phrasing:</span>
                  <span>{issue.suggestion}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recommended Keywords to Add */}
      {keywordSuggestions.length > 0 && (
        <div className="bg-slate-850 border border-slate-800 rounded-2xl p-6 space-y-3">
          <h3 className="text-sm font-bold text-white flex items-center space-x-2">
            <Zap className="w-4 h-4 text-brand-400" />
            <span>Recommended Industry Keywords to Add</span>
          </h3>

          <div className="flex flex-wrap gap-2">
            {keywordSuggestions.map((kw, i) => (
              <span key={i} className="text-xs font-semibold bg-brand-500/10 text-brand-300 border border-brand-500/20 px-3 py-1 rounded-full">
                + {kw}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ResumeScorecard;
