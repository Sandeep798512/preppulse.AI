import React from 'react';
import { Link } from 'react-router-dom';
import MainLayout from '../components/layout/MainLayout';
import { Shield, HelpCircle, Code, ArrowRight } from 'lucide-react';

const AdminPage = () => {
  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Banner */}
        <div className="flex items-center space-x-4 bg-slate-850 border border-slate-800 p-6 rounded-2xl">
          <div className="p-3 bg-purple-500/10 text-purple-400 rounded-xl border border-purple-500/20">
            <Shield className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Admin Management Portal</h1>
            <p className="text-xs text-slate-400 mt-1">
              Manage user accounts, MCQs, coding challenges, job roles, interview templates & platform analytics
            </p>
          </div>
        </div>

        {/* Management Modules Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-slate-850 border border-slate-800 p-6 rounded-2xl space-y-4 hover:border-slate-700 transition">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-xl border border-indigo-500/20">
                <HelpCircle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">MCQ Question Bank Management</h3>
                <p className="text-xs text-slate-400 mt-0.5">Add, edit, filter, and remove Aptitude & Technical MCQs</p>
              </div>
            </div>
            <Link
              to="/admin/questions"
              className="inline-flex items-center space-x-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl transition"
            >
              <span>Manage Questions</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="bg-slate-850 border border-slate-800 p-6 rounded-2xl space-y-4 hover:border-slate-700 transition">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20">
                <Code className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Coding Problem Bank Management</h3>
                <p className="text-xs text-slate-400 mt-0.5">Manage DSA coding challenges, starter code & hidden test cases</p>
              </div>
            </div>
            <Link
              to="/admin/coding"
              className="inline-flex items-center space-x-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl transition"
            >
              <span>Manage Coding Problems</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default AdminPage;
