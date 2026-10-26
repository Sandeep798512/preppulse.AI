import React from 'react';
import {
  Award,
  CheckCircle2,
  AlertTriangle,
  GitCompare,
  TrendingUp,
  Sparkles,
  ShieldCheck,
  XCircle,
  HelpCircle,
  Target,
  Zap,
  Briefcase,
  BookOpen,
} from 'lucide-react';

const JDMatchScorecard = ({ matchResult, resume, jobDescription, onReanalyze }) => {
  if (!matchResult) return null;

  const {
    overallScore = 0,
    matchLevel = 'Good Match',
    applicationDecision = 'Possible Fit',
    factorScores = {},
    matchedSkills = [],
    partialSkills = [],
    missingRequiredSkills = [],
    missingPreferredSkills = [],
    qualificationMatches = [],
    qualificationGaps = [],
    matchedProjects = [],
    criticalActions = [],
    recommendedSkills = [],
    preparationSuggestions = [],
  } = matchResult;

  const getDecisionBadge = (decision) => {
    switch (decision) {
      case 'Strong Fit':
        return 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30';
      case 'Possible Fit':
        return 'bg-amber-500/10 text-amber-300 border-amber-500/30';
      case 'Skill Gap Heavy':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/30';
      case 'Qualification Mismatch':
      default:
        return 'bg-purple-500/10 text-purple-400 border-purple-500/30';
    }
  };

  const getMatchLevelColor = (level) => {
    if (level.includes('Excellent') || level.includes('Strong')) return 'text-emerald-400';
    if (level.includes('Good') || level.includes('Moderate')) return 'text-brand-400';
    return 'text-amber-400';
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-gradient-to-br from-slate-850 via-slate-900 to-slate-950 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-2 bg-brand-500/10 text-brand-400 border border-brand-500/20 px-3 py-1 rounded-full text-xs font-semibold">
              <GitCompare className="w-3.5 h-3.5" />
              <span>Compatibility Audit: {jobDescription?.title || 'Target Job Role'}</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-white">Resume vs JD Match Scorecard</h2>
            <p className="text-xs text-slate-400 max-w-xl">
              Calculated using the 5-Factor Mathematical Engine comparing Technical Skills, Project Relevance, Academic Qualifications, Semantic Keywords, and Soft Skills.
            </p>
          </div>

          <div className="flex items-center space-x-4 bg-slate-900/90 border border-slate-700/80 p-4 rounded-2xl">
            {/* Overall Score Gauge */}
            <div className="text-center pr-4 border-r border-slate-800">
              <div className="text-xs text-slate-400 font-medium">Match Score</div>
              <div className="text-4xl font-black text-brand-400 tracking-tight">{overallScore}<span className="text-sm font-bold text-slate-500">/100</span></div>
              <div className={`text-xs font-bold mt-0.5 ${getMatchLevelColor(matchLevel)}`}>{matchLevel}</div>
            </div>

            {/* Application Decision Indicator */}
            <div className="text-center pl-2">
              <div className="text-xs text-slate-400 font-medium mb-1">Decision Support</div>
              <span className={`text-xs font-bold px-3 py-1 rounded-full border ${getDecisionBadge(applicationDecision)}`}>
                {applicationDecision}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 5-Factor Score Breakdown Chart */}
      <div className="bg-slate-850 border border-slate-800 rounded-2xl p-6 space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center space-x-2">
          <Award className="w-4 h-4 text-brand-400" />
          <span>5-Factor Compatibility Breakdown</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="bg-slate-900 border border-slate-700/60 p-3.5 rounded-xl space-y-1.5">
            <div className="flex justify-between text-xs font-semibold text-slate-300">
              <span>Technical Skills</span>
              <span className="text-brand-400">{factorScores.technicalSkillScore || 0}%</span>
            </div>
            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
              <div className="bg-brand-500 h-full rounded-full" style={{ width: `${factorScores.technicalSkillScore || 0}%` }} />
            </div>
            <span className="text-[10px] text-slate-400">Weight: 30%</span>
          </div>

          <div className="bg-slate-900 border border-slate-700/60 p-3.5 rounded-xl space-y-1.5">
            <div className="flex justify-between text-xs font-semibold text-slate-300">
              <span>Project Relevance</span>
              <span className="text-indigo-400">{factorScores.experienceProjectScore || 0}%</span>
            </div>
            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
              <div className="bg-indigo-500 h-full rounded-full" style={{ width: `${factorScores.experienceProjectScore || 0}%` }} />
            </div>
            <span className="text-[10px] text-slate-400">Weight: 20%</span>
          </div>

          <div className="bg-slate-900 border border-slate-700/60 p-3.5 rounded-xl space-y-1.5">
            <div className="flex justify-between text-xs font-semibold text-slate-300">
              <span>Qualifications</span>
              <span className="text-emerald-400">{factorScores.qualificationScore || 0}%</span>
            </div>
            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
              <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${factorScores.qualificationScore || 0}%` }} />
            </div>
            <span className="text-[10px] text-slate-400">Weight: 15%</span>
          </div>

          <div className="bg-slate-900 border border-slate-700/60 p-3.5 rounded-xl space-y-1.5">
            <div className="flex justify-between text-xs font-semibold text-slate-300">
              <span>Semantic Keywords</span>
              <span className="text-amber-400">{factorScores.semanticKeywordScore || 0}%</span>
            </div>
            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
              <div className="bg-amber-500 h-full rounded-full" style={{ width: `${factorScores.semanticKeywordScore || 0}%` }} />
            </div>
            <span className="text-[10px] text-slate-400">Weight: 20%</span>
          </div>

          <div className="bg-slate-900 border border-slate-700/60 p-3.5 rounded-xl space-y-1.5">
            <div className="flex justify-between text-xs font-semibold text-slate-300">
              <span>Soft Skills & Role</span>
              <span className="text-violet-400">{factorScores.softSkillRoleScore || 0}%</span>
            </div>
            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
              <div className="bg-violet-500 h-full rounded-full" style={{ width: `${factorScores.softSkillRoleScore || 0}%` }} />
            </div>
            <span className="text-[10px] text-slate-400">Weight: 15%</span>
          </div>
        </div>
      </div>

      {/* Skills Comparison Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Matched & Partial Skills */}
        <div className="bg-slate-850 border border-slate-800 rounded-2xl p-6 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Matched & Related Skills ({matchedSkills.length + partialSkills.length})</span>
          </h3>

          <div className="space-y-3">
            <div>
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-2">Exact Skill Matches:</span>
              <div className="flex flex-wrap gap-2">
                {matchedSkills.map((s, i) => (
                  <span key={i} className="text-xs bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 px-3 py-1 rounded-full font-semibold flex items-center space-x-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    <span>{s}</span>
                  </span>
                ))}
              </div>
            </div>

            {partialSkills.length > 0 && (
              <div>
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-2 pt-2">Partial / Related Matches:</span>
                <div className="flex flex-wrap gap-2">
                  {partialSkills.map((ps, i) => (
                    <span key={i} className="text-xs bg-amber-500/10 text-amber-300 border border-amber-500/30 px-3 py-1 rounded-full font-medium">
                      ◐ {ps}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Missing Skills (Critical Gaps) */}
        <div className="bg-slate-850 border border-slate-800 rounded-2xl p-6 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center space-x-2">
            <XCircle className="w-4 h-4 text-rose-400" />
            <span>Missing Skill Gaps ({missingRequiredSkills.length + missingPreferredSkills.length})</span>
          </h3>

          <div className="space-y-3">
            <div>
              <span className="text-[11px] font-semibold text-rose-400 uppercase tracking-wider block mb-2">Critical Missing Required Skills:</span>
              {missingRequiredSkills.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {missingRequiredSkills.map((ms, i) => (
                    <span key={i} className="text-xs bg-rose-500/10 text-rose-300 border border-rose-500/30 px-3 py-1 rounded-full font-semibold flex items-center space-x-1">
                      <XCircle className="w-3 h-3 text-rose-400" />
                      <span>{ms}</span>
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-emerald-400 font-semibold">✓ All required skills matched!</p>
              )}
            </div>

            {missingPreferredSkills.length > 0 && (
              <div>
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-2 pt-2">Missing Preferred Skills:</span>
                <div className="flex flex-wrap gap-2">
                  {missingPreferredSkills.map((mps, i) => (
                    <span key={i} className="text-xs bg-purple-500/10 text-purple-300 border border-purple-500/30 px-3 py-1 rounded-full">
                      ✗ {mps}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Project Relevance Analysis */}
      {matchedProjects.length > 0 && (
        <div className="bg-slate-850 border border-slate-800 rounded-2xl p-6 space-y-3">
          <h3 className="text-sm font-bold text-white flex items-center space-x-2">
            <Briefcase className="w-4 h-4 text-brand-400" />
            <span>Highly Relevant Resume Projects</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {matchedProjects.map((p, idx) => (
              <div key={idx} className="bg-slate-900 border border-slate-700/80 p-4 rounded-xl space-y-1">
                <div className="flex items-center justify-between text-xs font-bold text-white">
                  <span>{p.projectTitle}</span>
                  <span className="text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">Relevant</span>
                </div>
                <p className="text-xs text-slate-400">{p.relevanceReason}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Actionable Recommendations Panel */}
      <div className="bg-slate-850 border border-slate-800 rounded-2xl p-6 space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center space-x-2">
          <Target className="w-4 h-4 text-brand-400" />
          <span>Action Plan Before Applying</span>
        </h3>

        <div className="space-y-2.5">
          {criticalActions.map((act, i) => (
            <div key={i} className="bg-slate-900 border border-slate-700/80 p-3.5 rounded-xl flex items-start space-x-3 text-xs text-slate-200">
              <span className="text-brand-400 font-bold">•</span>
              <span>{act}</span>
            </div>
          ))}

          {preparationSuggestions.map((sug, i) => (
            <div key={i} className="bg-slate-900 border border-slate-700/80 p-3.5 rounded-xl flex items-start space-x-3 text-xs text-slate-300">
              <span className="text-indigo-400 font-bold">•</span>
              <span>{sug}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default JDMatchScorecard;
