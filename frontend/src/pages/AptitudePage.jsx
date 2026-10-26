import React from 'react';
import MainLayout from '../components/layout/MainLayout';
import { HelpCircle } from 'lucide-react';

const AptitudePage = () => {
  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center space-x-3 bg-slate-850 border border-slate-800 p-6 rounded-2xl">
          <div className="p-3 bg-amber-500/10 text-amber-400 rounded-xl border border-amber-500/20">
            <HelpCircle className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Aptitude Practice Module</h1>
            <p className="text-xs text-slate-400">Quantitative Aptitude, Logical Reasoning, Verbal Ability & Data Interpretation</p>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default AptitudePage;
