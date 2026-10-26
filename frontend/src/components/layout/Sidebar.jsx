import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  FileText,
  Briefcase,
  GitCompare,
  HelpCircle,
  Code,
  Mic,
  BarChart3,
  Bot,
  MapPin,
  Shield,
  UserCheck,
} from 'lucide-react';

const Sidebar = ({ isOpen, onClose }) => {
  const { user } = useAuth();

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Job Openings & Discovery', path: '/jobs', icon: Briefcase },
    { label: 'Application Tracker', path: '/applications', icon: UserCheck },
    { label: 'AI Career Coach', path: '/career-coach', icon: Bot },
    { label: 'Placement Intelligence', path: '/placement-intelligence', icon: BarChart3 },
    { label: 'Resume Analyzer', path: '/resume-analyzer', icon: FileText },
    { label: 'JD Matching', path: '/jd-matcher', icon: GitCompare },
    { label: 'Preparation Roadmap', path: '/roadmap', icon: MapPin },
    { label: 'Aptitude Practice', path: '/aptitude', icon: HelpCircle },
    { label: 'Technical MCQs', path: '/technical-mcq', icon: Briefcase },
    { label: 'Coding Practice', path: '/coding', icon: Code },
    { label: 'AI Mock Interview', path: '/mock-interview', icon: Mic },
    { label: 'Analytics & Readiness', path: '/analytics', icon: BarChart3 },
    { label: 'Profile & Setup', path: '/onboarding', icon: UserCheck },
  ];

  if (user?.role === 'admin') {
    navItems.push({ label: 'Admin Portal', path: '/admin', icon: Shield });
  }

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-slate-950/80 z-40 md:hidden backdrop-blur-sm"
        />
      )}

      <aside
        className={`fixed md:static top-16 bottom-0 left-0 w-64 bg-slate-850 border-r border-slate-800 z-40 transform transition-transform duration-200 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        } flex flex-col justify-between overflow-y-auto`}
      >
        <div className="p-4 space-y-1">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-3 py-2">
            Placement Prep Platform
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-brand-600 text-white shadow-md shadow-brand-600/20 font-semibold'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`
                }
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </div>

        <div className="p-4 border-t border-slate-800/80 bg-slate-900/50">
          <div className="bg-gradient-to-r from-indigo-950/60 to-slate-900/60 border border-indigo-500/20 rounded-xl p-3 text-xs text-slate-300">
            <div className="font-semibold text-indigo-400 mb-1 flex items-center space-x-1">
              <span>PrepPulse.AI Platform</span>
            </div>
            <p className="text-[11px] text-slate-400">
              Autonomous Career Intelligence & Placement Accelerator
            </p>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
