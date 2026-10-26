import React, { useState, useEffect } from 'react';
import MainLayout from '../components/layout/MainLayout';
import ResumeScorecard from '../components/resume/ResumeScorecard';
import API from '../services/api';
import {
  FileText,
  UploadCloud,
  FileCheck,
  Trash2,
  Eye,
  AlertCircle,
  Sparkles,
  Loader2,
  CheckCircle2,
  Clock,
} from 'lucide-react';

const ResumeAnalyzerPage = () => {
  const [resumes, setResumes] = useState([]);
  const [activeResume, setActiveResume] = useState(null);

  // Upload & Analysis States
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [processStep, setProcessStep] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    fetchResumes();
  }, []);

  const fetchResumes = async () => {
    try {
      const { data } = await API.get('/resume');
      if (data.success) {
        setResumes(data.resumes);
        if (data.resumes.length > 0 && !activeResume) {
          setActiveResume(data.resumes[0]);
        }
      }
    } catch (err) {
      console.error('Failed to fetch resumes:', err);
    }
  };

  const handleFileUpload = async (file) => {
    if (!file) return;

    setErrorMsg('');

    // File format check
    const ext = file.name.split('.').pop().toLowerCase();
    if (!['pdf', 'docx', 'doc'].includes(ext)) {
      setErrorMsg('Invalid file format. Please upload a PDF or DOCX resume document.');
      return;
    }

    // Size check (5 MB)
    if (file.size > 5 * 1024 * 1024) {
      setErrorMsg('File size exceeds 5MB limit. Please upload a smaller file.');
      return;
    }

    const formData = new FormData();
    formData.append('resume', file);

    setUploading(true);
    setProcessStep('Uploading file and extracting text...');

    try {
      // 1. Upload & Extract Text
      const uploadRes = await API.post('/resume/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (uploadRes.data.success) {
        const uploadedDoc = uploadRes.data.resume;
        setProcessStep('Running AI analysis & calculating compatibility score...');
        setAnalyzing(true);

        // 2. Trigger AI Analysis
        const analyzeRes = await API.post(`/resume/${uploadedDoc._id}/analyze`);
        if (analyzeRes.data.success) {
          const completedResume = analyzeRes.data.resume;
          setActiveResume(completedResume);
          await fetchResumes();
        }
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to process resume upload.';
      setErrorMsg(msg);
    } finally {
      setUploading(false);
      setAnalyzing(false);
      setProcessStep('');
    }
  };

  const handleReanalyze = async (resumeId) => {
    setAnalyzing(true);
    setErrorMsg('');
    try {
      const { data } = await API.post(`/resume/${resumeId}/analyze`);
      if (data.success) {
        setActiveResume(data.resume);
        await fetchResumes();
      }
    } catch (err) {
      setErrorMsg('Failed to re-analyze resume.');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleDelete = async (resumeId) => {
    if (!window.confirm('Are you sure you want to delete this resume analysis record?')) return;
    try {
      const { data } = await API.delete(`/resume/${resumeId}`);
      if (data.success) {
        if (activeResume?._id === resumeId) {
          setActiveResume(null);
        }
        await fetchResumes();
      }
    } catch (err) {
      console.error('Failed to delete resume:', err);
    }
  };

  return (
    <MainLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-850 border border-slate-800 p-6 rounded-2xl shadow-xl">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-blue-500/10 text-blue-400 rounded-xl border border-blue-500/20">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">AI Resume & ATS Compatibility Analyzer</h1>
              <p className="text-xs text-slate-400">Extract skills, evaluate structure, content quality, and generate transparent scorecards</p>
            </div>
          </div>
        </div>

        {/* Upload Area */}
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragging(false);
            if (e.dataTransfer.files?.[0]) {
              handleFileUpload(e.dataTransfer.files[0]);
            }
          }}
          className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer ${
            isDragging
              ? 'border-brand-500 bg-brand-500/10'
              : 'border-slate-700/80 bg-slate-850 hover:border-slate-600'
          }`}
        >
          <input
            type="file"
            id="resumeFileInput"
            accept=".pdf,.docx,.doc"
            className="hidden"
            onChange={(e) => {
              if (e.target.files?.[0]) handleFileUpload(e.target.files[0]);
            }}
          />

          <label htmlFor="resumeFileInput" className="cursor-pointer space-y-3 block">
            <div className="w-14 h-14 rounded-2xl bg-brand-500/10 text-brand-400 flex items-center justify-center mx-auto border border-brand-500/20">
              {uploading || analyzing ? (
                <Loader2 className="w-7 h-7 animate-spin" />
              ) : (
                <UploadCloud className="w-7 h-7" />
              )}
            </div>

            <div>
              <h3 className="font-bold text-lg text-white">
                {uploading || analyzing ? 'Processing Resume...' : 'Drop your Resume here, or Click to Browse'}
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Supports <span className="text-slate-200 font-semibold">PDF</span> and <span className="text-slate-200 font-semibold">DOCX</span> files up to 5 MB
              </p>
            </div>

            {(uploading || analyzing) && (
              <div className="inline-flex items-center space-x-2 text-xs text-brand-400 font-semibold bg-brand-500/10 px-3.5 py-1.5 rounded-full border border-brand-500/20">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>{processStep}</span>
              </div>
            )}
          </label>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-2xl text-xs flex items-center space-x-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Uploaded Resumes List / Selector */}
        {resumes.length > 0 && (
          <div className="bg-slate-850 border border-slate-800 rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                <FileCheck className="w-4 h-4 text-brand-400" />
                <span>Uploaded Resumes & Previous Analyses ({resumes.length})</span>
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {resumes.map((resItem) => {
                const isActive = activeResume?._id === resItem._id;
                return (
                  <div
                    key={resItem._id}
                    onClick={() => setActiveResume(resItem)}
                    className={`p-4 rounded-xl border cursor-pointer transition flex items-center justify-between ${
                      isActive
                        ? 'bg-brand-600/20 border-brand-500 text-white shadow-md'
                        : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <div className="space-y-1 overflow-hidden pr-2">
                      <div className="font-semibold text-xs truncate text-white">{resItem.originalFileName}</div>
                      <div className="text-[11px] text-slate-400 flex items-center space-x-2">
                        <span className="uppercase font-bold text-[10px] bg-slate-800 px-1.5 py-0.5 rounded text-slate-300">
                          {resItem.fileType}
                        </span>
                        <span>{new Date(resItem.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <div className="text-right">
                        <div className="font-extrabold text-sm text-brand-400">{resItem.resumeScore}/100</div>
                        <span className="text-[9px] text-slate-400 font-semibold uppercase">{resItem.analysisStatus}</span>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(resItem._id);
                        }}
                        className="p-1.5 text-slate-500 hover:text-red-400 rounded-lg hover:bg-slate-800 transition"
                        title="Delete Resume"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Active Resume Scorecard */}
        {activeResume ? (
          <ResumeScorecard
            resume={activeResume}
            onReanalyze={() => handleReanalyze(activeResume._id)}
            isAnalyzing={analyzing}
          />
        ) : (
          <div className="bg-slate-850 border border-slate-800 rounded-2xl p-12 text-center text-slate-400 space-y-3">
            <FileText className="w-12 h-12 text-slate-600 mx-auto" />
            <h3 className="font-bold text-white text-base">No Resume Selected</h3>
            <p className="text-xs max-w-sm mx-auto">
              Upload your PDF or DOCX resume file above to get a complete 5-part AI Scorecard, structure checklist & actionable recommendations.
            </p>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default ResumeAnalyzerPage;
