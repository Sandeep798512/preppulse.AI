import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../services/api';
import MainLayout from '../components/layout/MainLayout';
import { User, GraduationCap, Briefcase, CheckCircle2, ArrowRight, ArrowLeft, Sparkles } from 'lucide-react';

const OnboardingWizard = () => {
  const { user, updateUserProfile } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    location: '',
    degree: 'B.Tech',
    branch: 'Computer Science & Engineering',
    college: '',
    graduationYear: 2026,
    cgpa: 8.5,
    backlogs: 0,
    targetRoles: ['Software Developer'],
    skills: ['Java', 'React', 'Node.js', 'SQL', 'Git', 'DSA'],
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        phone: user.profile?.phone || '',
        location: user.profile?.location || '',
        degree: user.education?.degree || 'B.Tech',
        branch: user.education?.branch || 'Computer Science & Engineering',
        college: user.education?.college || '',
        graduationYear: user.education?.graduationYear || 2026,
        cgpa: user.education?.cgpa || 8.5,
        backlogs: user.education?.backlogs || 0,
        targetRoles: user.targetRoles?.length ? user.targetRoles : ['Software Developer'],
        skills: user.skills?.length ? user.skills : ['Java', 'React', 'Node.js', 'SQL', 'Git', 'DSA'],
      });
    }
  }, [user]);

  const targetRolesList = [
    'Software Developer',
    'Full Stack Developer',
    'Frontend Developer',
    'Backend Developer',
    'Java Developer',
    'Python Developer',
    'Data Analyst',
    'AI/ML Engineer',
    'QA/Test Engineer',
    'DevOps Engineer',
  ];

  const availableSkills = [
    'Java', 'Python', 'JavaScript', 'TypeScript', 'React', 'Node.js', 'Express.js',
    'SQL', 'MongoDB', 'PostgreSQL', 'Git', 'Docker', 'Kubernetes', 'AWS',
    'DSA', 'DBMS', 'OS', 'Computer Networks', 'OOP', 'System Design', 'AI/ML'
  ];

  const toggleSkill = (skill) => {
    setFormData((prev) => {
      const exists = prev.skills.includes(skill);
      return {
        ...prev,
        skills: exists ? prev.skills.filter((s) => s !== skill) : [...prev.skills, skill],
      };
    });
  };

  const toggleRole = (role) => {
    setFormData((prev) => {
      const exists = prev.targetRoles.includes(role);
      return {
        ...prev,
        targetRoles: exists ? prev.targetRoles.filter((r) => r !== role) : [...prev.targetRoles, role],
      };
    });
  };

  const handleFinish = async () => {
    setSubmitting(true);
    try {
      const payload = {
        name: formData.name,
        phone: formData.phone,
        location: formData.location,
        education: {
          degree: formData.degree,
          branch: formData.branch,
          college: formData.college,
          graduationYear: Number(formData.graduationYear),
          cgpa: Number(formData.cgpa),
          backlogs: Number(formData.backlogs),
        },
        targetRoles: formData.targetRoles,
        skills: formData.skills,
      };

      const { data } = await API.put('/profile', payload);
      if (data.success) {
        updateUserProfile(data.profile);
        navigate('/dashboard');
      }
    } catch (err) {
      console.error('Failed to update onboarding profile:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <MainLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center space-x-1.5 bg-brand-500/10 text-brand-400 px-3 py-1 rounded-full text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Placement Profile Setup Wizard</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white">Personalize Your AI Preparation Platform</h1>
          <p className="text-sm text-slate-400">Step {step} of 4 — Tell us about your academic background and target role</p>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
          <div
            className="bg-gradient-to-r from-brand-600 to-indigo-500 h-full transition-all duration-300"
            style={{ width: `${(step / 4) * 100}%` }}
          />
        </div>

        <div className="bg-slate-850 border border-slate-800 rounded-2xl p-6 md:p-8 space-y-6 shadow-xl">
          {/* STEP 1: Personal */}
          {step === 1 && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-white flex items-center space-x-2">
                <User className="w-5 h-5 text-brand-400" />
                <span>Personal Information</span>
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Full Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-brand-500"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">Phone Number (Optional)</label>
                    <input
                      type="text"
                      placeholder="+91 9876543210"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-brand-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">Location (Optional)</label>
                    <input
                      type="text"
                      placeholder="Delhi / Bangalore / Remote"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-brand-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Education */}
          {step === 2 && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-white flex items-center space-x-2">
                <GraduationCap className="w-5 h-5 text-brand-400" />
                <span>Academic & Education Details</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Degree</label>
                  <input
                    type="text"
                    value={formData.degree}
                    onChange={(e) => setFormData({ ...formData, degree: e.target.value })}
                    placeholder="B.Tech / M.Tech / BCA"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-brand-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Branch / Specialization</label>
                  <input
                    type="text"
                    value={formData.branch}
                    onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
                    placeholder="Computer Science & Engineering"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-brand-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">College / Institution</label>
                  <input
                    type="text"
                    value={formData.college}
                    onChange={(e) => setFormData({ ...formData, college: e.target.value })}
                    placeholder="National Institute of Technology"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-brand-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Graduation Year</label>
                  <input
                    type="number"
                    value={formData.graduationYear}
                    onChange={(e) => setFormData({ ...formData, graduationYear: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-brand-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Current CGPA / Percentage</label>
                  <input
                    type="number"
                    step="0.1"
                    max="10"
                    value={formData.cgpa}
                    onChange={(e) => setFormData({ ...formData, cgpa: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-brand-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Active Backlogs</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.backlogs}
                    onChange={(e) => setFormData({ ...formData, backlogs: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-brand-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Target Roles */}
          {step === 3 && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-white flex items-center space-x-2">
                <Briefcase className="w-5 h-5 text-brand-400" />
                <span>Select Target Job Roles</span>
              </h3>
              <p className="text-xs text-slate-400">Choose one or more software job roles you want to prepare for:</p>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {targetRolesList.map((role) => {
                  const isSelected = formData.targetRoles.includes(role);
                  return (
                    <button
                      key={role}
                      type="button"
                      onClick={() => toggleRole(role)}
                      className={`p-3 rounded-xl border text-left text-xs font-semibold transition flex items-center justify-between ${
                        isSelected
                          ? 'bg-brand-600/20 border-brand-500 text-brand-300'
                          : 'bg-slate-900 border-slate-700 text-slate-300 hover:border-slate-600'
                      }`}
                    >
                      <span>{role}</span>
                      {isSelected && <CheckCircle2 className="w-4 h-4 text-brand-400 flex-shrink-0 ml-1" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 4: Skills Checklist */}
          {step === 4 && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-white flex items-center space-x-2">
                <Sparkles className="w-5 h-5 text-brand-400" />
                <span>Technical Skills Checklist</span>
              </h3>
              <p className="text-xs text-slate-400">Select technologies and computer science fundamentals you know:</p>

              <div className="flex flex-wrap gap-2">
                {availableSkills.map((skill) => {
                  const isSelected = formData.skills.includes(skill);
                  return (
                    <button
                      key={skill}
                      type="button"
                      onClick={() => toggleSkill(skill)}
                      className={`px-3.5 py-2 rounded-xl border text-xs font-medium transition ${
                        isSelected
                          ? 'bg-brand-600 border-brand-500 text-white shadow-md shadow-brand-600/20'
                          : 'bg-slate-900 border-slate-700 text-slate-300 hover:border-slate-600'
                      }`}
                    >
                      {skill}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between pt-6 border-t border-slate-800">
            {step > 1 ? (
              <button
                type="button"
                onClick={() => setStep(step - 1)}
                className="px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700 transition flex items-center space-x-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Previous Step</span>
              </button>
            ) : <div />}

            {step < 4 ? (
              <button
                type="button"
                onClick={() => setStep(step + 1)}
                className="px-6 py-2.5 rounded-xl bg-brand-600 text-white text-xs font-semibold hover:bg-brand-500 transition shadow-md shadow-brand-600/20 flex items-center space-x-2"
              >
                <span>Continue</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                disabled={submitting}
                onClick={handleFinish}
                className="px-8 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 text-white text-xs font-bold hover:brightness-110 transition shadow-lg shadow-brand-600/20 disabled:opacity-50 flex items-center space-x-2"
              >
                <span>{submitting ? 'Saving Profile...' : 'Complete Setup & Open Dashboard'}</span>
                <CheckCircle2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default OnboardingWizard;
