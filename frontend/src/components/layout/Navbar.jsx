import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Sparkles, LogOut, User, ShieldCheck, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';

const Navbar = ({ onToggleSidebar }) => {
  const { user, logout, demoLogin } = useAuth();

  return (
    <header className="h-16 bg-slate-850 border-b border-slate-800 px-4 md:px-6 flex items-center justify-between sticky top-0 z-30 shadow-sm">
      <div className="flex items-center space-x-3">
        <button
          onClick={onToggleSidebar}
          className="md:hidden text-slate-400 hover:text-white p-2 rounded-lg focus:outline-none"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        <Link to="/dashboard" className="flex items-center space-x-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-brand-500/20">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <span className="font-bold text-lg text-white tracking-tight">PrepPulse<span className="text-brand-500">.AI</span></span>
            <span className="hidden sm:inline-block text-[10px] font-semibold uppercase tracking-widest bg-brand-500/10 text-brand-400 px-2 py-0.5 rounded-full ml-2 border border-brand-500/20">
              Placement AI
            </span>
          </div>
        </Link>
      </div>

      <div className="flex items-center space-x-4">
        {user?.isDemo && (
          <span className="flex items-center space-x-1 text-xs bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2.5 py-1 rounded-full font-medium">
            <Zap className="w-3.5 h-3.5" />
            <span>Viva Demo Mode</span>
          </span>
        )}

        {user ? (
          <div className="flex items-center space-x-3">
            <div className="text-right hidden sm:block">
              <div className="text-sm font-semibold text-white leading-tight">{user.name}</div>
              <div className="text-xs text-slate-400 flex items-center justify-end space-x-1">
                {user.role === 'admin' ? (
                  <span className="text-purple-400 font-medium flex items-center">
                    <ShieldCheck className="w-3 h-3 mr-0.5" /> Admin
                  </span>
                ) : (
                  <span>{user.targetRoles?.[0] || 'Software Developer'}</span>
                )}
              </div>
            </div>

            <div className="w-9 h-9 rounded-full bg-slate-700 border border-slate-600 flex items-center justify-center text-brand-400 font-bold">
              {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>

            <button
              onClick={logout}
              title="Logout"
              className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-lg transition"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="flex items-center space-x-3">
            <button
              onClick={() => demoLogin()}
              className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-amber-500/10 text-amber-300 border border-amber-500/30 hover:bg-amber-500/20 transition flex items-center space-x-1"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Instant Viva Demo</span>
            </button>
            <Link
              to="/login"
              className="text-xs font-medium text-slate-300 hover:text-white px-3 py-1.5"
            >
              Sign In
            </Link>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
