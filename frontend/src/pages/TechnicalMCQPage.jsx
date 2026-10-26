import React from 'react';
import MainLayout from '../components/layout/MainLayout';
import { Briefcase } from 'lucide-react';

const TechnicalMCQPage = () => {
  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center space-x-3 bg-slate-850 border border-slate-800 p-6 rounded-2xl">
          <div className="p-3 bg-cyan-500/10 text-cyan-400 rounded-xl border border-cyan-500/20">
            <Briefcase className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Technical MCQ Practice</h1>
            <p className="text-xs text-slate-400">Computer Science Fundamentals: Java, Python, JS, DSA, DBMS, SQL, OS & Networks</p>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default TechnicalMCQPage;
