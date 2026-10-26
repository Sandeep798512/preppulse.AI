import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Sparkles,
  Zap,
  Target,
  FileSearch,
  Code2,
  Mic2,
  BarChart3,
  CheckCircle2,
  ArrowRight,
  Shield,
  Layers,
  Briefcase,
  Compass,
  Award,
  Globe,
  TrendingUp,
} from 'lucide-react';

const LandingPage = () => {
  const { demoLogin } = useAuth();
  const navigate = useNavigate();

  const phrases = [
    'With Autonomous AI Intelligence',
    'For Top Tech Software Roles',
    'With 5-Factor Resume Matcher',
    'With Sandboxed Code Execution',
    'With Voice AI Mock Interviews',
    'With 7-Factor Readiness Engine',
  ];

  const [phraseIndex, setPhraseIndex] = React.useState(0);
  const [text, setText] = React.useState('');
  const [isDeleting, setIsDeleting] = React.useState(false);

  React.useEffect(() => {
    const currentPhrase = phrases[phraseIndex];
    const typingSpeed = isDeleting ? 35 : 75;

    const timer = setTimeout(() => {
      if (!isDeleting) {
        setText(currentPhrase.substring(0, text.length + 1));
        if (text.length + 1 === currentPhrase.length) {
          setTimeout(() => setIsDeleting(true), 2000);
        }
      } else {
        setText(currentPhrase.substring(0, text.length - 1));
        if (text.length === 0) {
          setIsDeleting(false);
          setPhraseIndex((prev) => (prev + 1) % phrases.length);
        }
      }
    }, typingSpeed);

    return () => clearTimeout(timer);
  }, [text, isDeleting, phraseIndex]);

  const handleDemoClick = async () => {
    await demoLogin();
    navigate('/dashboard');
  };

  const features = [
    {
      icon: FileSearch,
      title: 'AI Resume & ATS Analyzer',
      description: 'Instant text parsing, ATS compatibility scoring, keyword extraction, and section quality scorecard.',
      glow: 'from-blue-500/20 via-indigo-500/10 to-transparent',
      border: 'border-blue-500/30 text-blue-400',
    },
    {
      icon: Target,
      title: '5-Factor Resume vs JD Matcher',
      description: 'Mathematical 5-pillar matching engine evaluating skill overlap, experience, education, and project relevance.',
      glow: 'from-emerald-500/20 via-teal-500/10 to-transparent',
      border: 'border-emerald-500/30 text-emerald-400',
    },
    {
      icon: Code2,
      title: 'Sandboxed Code Execution Engine',
      description: 'LeetCode-style code runner in Java, Python, and JavaScript with live test-case validation and benchmarking.',
      glow: 'from-purple-500/20 via-pink-500/10 to-transparent',
      border: 'border-purple-500/30 text-purple-400',
    },
    {
      icon: Mic2,
      title: 'Adaptive AI Mock Interviewer',
      description: 'Simulated AI technical & HR interview rounds with dynamic follow-ups, confidence scores, and STAR evaluation.',
      glow: 'from-violet-500/20 via-purple-500/10 to-transparent',
      border: 'border-violet-500/30 text-violet-400',
    },
    {
      icon: BarChart3,
      title: 'Central Placement Readiness Engine',
      description: 'Deterministic 7-factor composite score computing overall campus placement preparedness in real-time.',
      glow: 'from-amber-500/20 via-orange-500/10 to-transparent',
      border: 'border-amber-500/30 text-amber-400',
    },
    {
      icon: Compass,
      title: 'AI Career Coach & Roadmap',
      description: 'Adaptive 4-week learning roadmap with daily task allocations, skill gap priority rules, and Next Best Action.',
      glow: 'from-cyan-500/20 via-blue-500/10 to-transparent',
      border: 'border-cyan-500/30 text-cyan-400',
    },
  ];

  return (
    <div className="min-h-screen bg-[#080d1a] text-slate-100 flex flex-col font-sans relative overflow-x-hidden selection:bg-indigo-500 selection:text-white">
      {/* 3D Background Lighting Mesh & Ambient Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-gradient-to-tr from-indigo-600/30 via-purple-600/20 to-pink-500/10 blur-[130px] rounded-full pointer-events-none -z-10" />
      <div className="absolute top-[400px] -left-[200px] w-[600px] h-[600px] bg-blue-600/20 blur-[140px] rounded-full pointer-events-none -z-10 animate-pulse" />
      <div className="absolute top-[600px] -right-[200px] w-[600px] h-[600px] bg-indigo-600/20 blur-[140px] rounded-full pointer-events-none -z-10" />

      {/* Grid Pattern Background */}
      <div
        className="absolute inset-0 bg-[linear-gradient(to_right,#1f293d15_1px,transparent_1px),linear-gradient(to_bottom,#1f293d15_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none -z-10"
      />

      {/* Navbar */}
      <nav className="h-20 border-b border-slate-800/80 bg-[#080d1a]/80 backdrop-blur-xl px-6 md:px-12 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30 ring-1 ring-white/20">
            <Sparkles className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <span className="font-extrabold text-xl tracking-tight text-white flex items-center space-x-1">
              <span>PrepPulse</span>
              <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">.AI</span>
            </span>
            <span className="block text-[10px] text-indigo-300 font-semibold uppercase tracking-wider">
              Autonomous Career Intelligence System
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <button
            onClick={handleDemoClick}
            className="px-4 py-2 rounded-xl bg-amber-500/10 text-amber-300 border border-amber-500/30 hover:bg-amber-500/20 font-bold text-xs transition-all flex items-center space-x-1.5 shadow-lg shadow-amber-500/10 hover:scale-105 active:scale-95"
          >
            <Zap className="w-4 h-4 text-amber-400 fill-amber-400" />
            <span>Instant Viva Demo</span>
          </button>
          <Link
            to="/login"
            className="text-xs font-semibold px-4 py-2 rounded-xl bg-slate-850 hover:bg-slate-800 text-slate-200 border border-slate-750 transition-all hover:scale-105"
          >
            Sign In
          </Link>
          <Link
            to="/register"
            className="text-xs font-bold px-5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 hover:brightness-110 text-white shadow-lg shadow-indigo-600/30 transition-all hover:scale-105"
          >
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="px-6 md:px-12 pt-6 md:pt-10 pb-12 max-w-6xl mx-auto text-center space-y-5 relative">
        {/* Replace pill text with Catchy Premium Tag */}
        <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-indigo-500/15 via-purple-500/15 to-pink-500/15 border border-indigo-500/30 px-4 py-1.5 rounded-full text-xs font-bold text-indigo-300 shadow-xl backdrop-blur-md hover:border-indigo-400/50 transition">
          <Sparkles className="w-3.5 h-3.5 text-indigo-400 animate-spin" />
          <span>🚀 Next-Gen Placement Preparation & Career Intelligence Platform</span>
        </div>

        {/* 3D Visual Main Headline with Typewriter Animation */}
        <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight leading-[1.1] text-white min-h-[95px] sm:min-h-[140px]">
          Engineer Your Campus Placement <br className="hidden sm:block" />
          <span className="bg-gradient-to-r from-indigo-400 via-purple-300 to-pink-400 bg-clip-text text-transparent drop-shadow-[0_10px_30px_rgba(99,102,241,0.3)]">
            {text}
          </span>
          <span className="inline-block w-1 sm:w-1.5 h-8 sm:h-12 bg-indigo-400 ml-1.5 align-middle rounded-full animate-pulse shadow-[0_0_12px_rgba(129,140,248,0.8)]" />
        </h1>

        <p className="text-slate-300 text-base md:text-xl max-w-3xl mx-auto leading-relaxed font-normal">
          An end-to-end placement preparation ecosystem. Evaluate resumes against real JDs, solve 1,000+ Aptitude & Technical MCQs, run sandboxed code challenges, clear realistic AI mock interviews, and track active company applications.
        </p>

        {/* Hero Call to Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <button
            onClick={handleDemoClick}
            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500 text-slate-950 font-extrabold text-base hover:brightness-110 shadow-[0_0_30px_rgba(245,158,11,0.35)] transition-all hover:scale-105 active:scale-95 flex items-center justify-center space-x-2.5"
          >
            <Zap className="w-5 h-5 fill-slate-950" />
            <span>Launch Viva Demo Mode</span>
          </button>
          <Link
            to="/register"
            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-slate-900/90 hover:bg-slate-850 text-white font-bold text-base border border-slate-700/80 hover:border-indigo-500/50 shadow-xl transition-all hover:scale-105 active:scale-95 flex items-center justify-center space-x-2"
          >
            <span>Create Student Account</span>
            <ArrowRight className="w-4 h-4 text-indigo-400" />
          </Link>
        </div>

        {/* Floating 3D Stat Cards Preview */}
        <div className="pt-12 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto text-left">
          <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-900/90 to-slate-850/80 border border-slate-800 backdrop-blur-md shadow-2xl hover:border-indigo-500/40 transition">
            <span className="text-[10px] uppercase font-bold text-indigo-400 tracking-wider">Scoring Model</span>
            <p className="text-xl font-extrabold text-white mt-0.5">100% Deterministic</p>
            <p className="text-[11px] text-slate-400 mt-1">Multi-pillar mathematical evaluation</p>
          </div>

          <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-900/90 to-slate-850/80 border border-slate-800 backdrop-blur-md shadow-2xl hover:border-emerald-500/40 transition">
            <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider">Interview Analysis</span>
            <p className="text-xl font-extrabold text-white mt-0.5">STAR Framework</p>
            <p className="text-[11px] text-slate-400 mt-1">Confidence & hesitation markers</p>
          </div>

          <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-900/90 to-slate-850/80 border border-slate-800 backdrop-blur-md shadow-2xl hover:border-purple-500/40 transition">
            <span className="text-[10px] uppercase font-bold text-purple-400 tracking-wider">Code Execution</span>
            <p className="text-xl font-extrabold text-white mt-0.5">3 Languages</p>
            <p className="text-[11px] text-slate-400 mt-1">Java, Python & JavaScript</p>
          </div>

          <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-900/90 to-slate-850/80 border border-slate-800 backdrop-blur-md shadow-2xl hover:border-amber-500/40 transition">
            <span className="text-[10px] uppercase font-bold text-amber-400 tracking-wider">Target Roles</span>
            <p className="text-xl font-extrabold text-white mt-0.5">11+ Frameworks</p>
            <p className="text-[11px] text-slate-400 mt-1">Full Stack, Java, AI/ML, QA</p>
          </div>
        </div>

        {/* Roles Badge List */}
        <div className="pt-6 flex flex-wrap justify-center items-center gap-2 text-xs font-medium text-slate-400">
          <span className="text-slate-400 uppercase font-bold text-[10px] tracking-wider mr-2 flex items-center">
            Supported Roles:
          </span>
          {[
            'Software Developer',
            'Full Stack Developer',
            'Frontend Developer',
            'Backend Developer',
            'Java Developer',
            'Python Developer',
            'Data Analyst',
            'AI/ML Engineer',
            'QA/Automation Engineer',
            'DevOps Engineer',
          ].map((role) => (
            <span
              key={role}
              className="bg-slate-900/80 border border-slate-800 px-3 py-1 rounded-xl text-slate-300 font-semibold shadow-md hover:border-indigo-500/40 transition"
            >
              {role}
            </span>
          ))}
        </div>
      </section>

      {/* Integrated Platform Modules 3D Cards Grid */}
      <section className="px-6 md:px-12 py-16 bg-[#060a14]/60 border-y border-slate-800/80 relative">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center space-y-3">
            <span className="px-3 py-1 bg-indigo-500/10 text-indigo-400 text-xs font-bold rounded-full border border-indigo-500/20 uppercase tracking-wider">
              Comprehensive Ecosystem
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white">Integrated Preparation Modules</h2>
            <p className="text-slate-400 text-sm max-w-xl mx-auto">
              Everything required to go from resume drafting to final interview clearing in one unified SaaS platform.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => {
              const Icon = f.icon;
              return (
                <div
                  key={i}
                  className={`bg-gradient-to-b from-slate-900/90 to-slate-850/80 border rounded-2xl p-6 space-y-4 shadow-xl backdrop-blur-xl hover:-translate-y-1.5 transition-all duration-300 group ${f.border}`}
                >
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-tr ${f.glow} flex items-center justify-center border border-white/10 group-hover:scale-110 transition-transform`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-xl text-white group-hover:text-indigo-300 transition-colors">
                    {f.title}
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed font-medium">{f.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 text-center text-xs text-slate-400 border-t border-slate-800/80 bg-[#060a14]">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-xs">
              P
            </div>
            <span className="font-bold text-slate-200">PrepPulse.AI &bull; Campus Placement Engine</span>
          </div>

          <p className="text-slate-400">
            © 2026 AI Placement Preparation & Interview Analysis System
          </p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
