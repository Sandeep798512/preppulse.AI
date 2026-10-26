import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Sparkles, Zap, Lock, Mail, AlertCircle } from 'lucide-react';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const { login, demoLogin } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setSubmitting(true);
    const result = await login(email, password);
    setSubmitting(false);

    if (result.success) {
      navigate('/dashboard');
    } else {
      setFormError(result.message);
    }
  };

  const handleDemo = async () => {
    setSubmitting(true);
    await demoLogin();
    setSubmitting(false);
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-md bg-slate-850 border border-slate-800 rounded-2xl p-8 space-y-6 shadow-2xl">
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center space-x-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center text-white shadow-lg">
              <Sparkles className="w-5 h-5" />
            </div>
            <span className="font-bold text-xl text-white">PrepPulse<span className="text-brand-500">.AI</span></span>
          </Link>
          <h2 className="text-2xl font-bold text-white pt-2">Sign in to your account</h2>
          <p className="text-xs text-slate-400">Enter your placement prep credentials below</p>
        </div>

        {formError && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-xl text-xs flex items-start space-x-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>{formError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3.5" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="student@college.edu"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-brand-500 transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3.5" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-brand-500 transition"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-brand-600 hover:bg-brand-500 text-white font-semibold py-2.5 rounded-xl text-sm transition shadow-md shadow-brand-600/20 disabled:opacity-50"
          >
            {submitting ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="relative flex items-center justify-center">
          <div className="border-t border-slate-800 w-full" />
          <span className="bg-slate-850 px-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider absolute">OR</span>
        </div>

        <button
          onClick={handleDemo}
          disabled={submitting}
          className="w-full bg-amber-500/10 border border-amber-500/30 hover:bg-amber-500/20 text-amber-300 font-semibold py-2.5 rounded-xl text-xs transition flex items-center justify-center space-x-2"
        >
          <Zap className="w-4 h-4" />
          <span>Bypass Login with Instant Viva Demo Account</span>
        </button>

        <div className="text-center text-xs text-slate-400">
          Don't have an account?{' '}
          <Link to="/register" className="text-brand-400 hover:underline font-semibold">
            Register here
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
