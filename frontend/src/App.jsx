import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import OnboardingWizard from './pages/OnboardingWizard';
import DashboardPage from './pages/DashboardPage';
import ResumeAnalyzerPage from './pages/ResumeAnalyzerPage';
import JDMatcherPage from './pages/JDMatcherPage';
import RoadmapPage from './pages/RoadmapPage';
import PracticePage from './pages/PracticePage';
import QuizTakingPage from './pages/QuizTakingPage';
import QuizResultPage from './pages/QuizResultPage';
import QuizHistoryPage from './pages/QuizHistoryPage';
import CodingPage from './pages/CodingPage';
import CodingProblemDetailPage from './pages/CodingProblemDetailPage';
import CodingSubmissionsPage from './pages/CodingSubmissionsPage';
import CodingAnalyticsPage from './pages/CodingAnalyticsPage';
import AdminCodingPage from './pages/AdminCodingPage';
import MockInterviewPage from './pages/MockInterviewPage';
import InterviewSessionPage from './pages/InterviewSessionPage';
import InterviewResultPage from './pages/InterviewResultPage';
import InterviewAnalysisReportPage from './pages/InterviewAnalysisReportPage';
import InterviewHistoryPage from './pages/InterviewHistoryPage';
import InterviewAnalyticsPage from './pages/InterviewAnalyticsPage';
import AnalyticsPage from './pages/AnalyticsPage';
import AICoachPage from './pages/AICoachPage';
import AdminPage from './pages/AdminPage';
import AdminQuestionsPage from './pages/AdminQuestionsPage';
import PlacementReadinessPage from './pages/PlacementReadinessPage';
import CareerCoachDashboardPage from './pages/CareerCoachDashboardPage';
import TodayTasksPage from './pages/TodayTasksPage';
import RoadmapDetailPage from './pages/RoadmapDetailPage';
import CareerCoachChatPage from './pages/CareerCoachChatPage';
import JobDiscoveryPage from './pages/JobDiscoveryPage';
import JobDetailPage from './pages/JobDetailPage';
import JobComparisonPage from './pages/JobComparisonPage';
import ApplicationTrackerPage from './pages/ApplicationTrackerPage';
import PlacementIntelligencePage from './pages/PlacementIntelligencePage';

// Protected Route Guard
const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { user, token, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-slate-400 text-sm">
        <div className="flex items-center space-x-2">
          <div className="w-5 h-5 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
          <span>Loading session...</span>
        </div>
      </div>
    );
  }

  if (!token && !user) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && user?.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      <Route
        path="/onboarding"
        element={
          <ProtectedRoute>
            <OnboardingWizard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/resume-analyzer"
        element={
          <ProtectedRoute>
            <ResumeAnalyzerPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/resume"
        element={
          <ProtectedRoute>
            <ResumeAnalyzerPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/resume/:id"
        element={
          <ProtectedRoute>
            <ResumeAnalyzerPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/jd-matcher"
        element={
          <ProtectedRoute>
            <JDMatcherPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/job-analyzer"
        element={
          <ProtectedRoute>
            <JDMatcherPage />
          </ProtectedRoute>
        }
      />

      {/* Practice Center & Quiz Engine Routes */}
      <Route
        path="/practice"
        element={
          <ProtectedRoute>
            <PracticePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/practice/aptitude"
        element={
          <ProtectedRoute>
            <PracticePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/practice/technical"
        element={
          <ProtectedRoute>
            <PracticePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/aptitude"
        element={
          <ProtectedRoute>
            <PracticePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/technical-mcq"
        element={
          <ProtectedRoute>
            <PracticePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/quiz/setup"
        element={
          <ProtectedRoute>
            <PracticePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/quiz/:quizId"
        element={
          <ProtectedRoute>
            <QuizTakingPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/quiz/:quizId/result"
        element={
          <ProtectedRoute>
            <QuizResultPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/quiz-history"
        element={
          <ProtectedRoute>
            <QuizHistoryPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/quiz-history/:quizId"
        element={
          <ProtectedRoute>
            <QuizResultPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/roadmap"
        element={
          <ProtectedRoute>
            <RoadmapPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/coding"
        element={
          <ProtectedRoute>
            <CodingPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/coding/problem/:slug"
        element={
          <ProtectedRoute>
            <CodingProblemDetailPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/coding/submissions"
        element={
          <ProtectedRoute>
            <CodingSubmissionsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/coding/analytics"
        element={
          <ProtectedRoute>
            <CodingAnalyticsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/coding"
        element={
          <ProtectedRoute adminOnly={true}>
            <AdminCodingPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/interview"
        element={
          <ProtectedRoute>
            <MockInterviewPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/mock-interview"
        element={
          <ProtectedRoute>
            <MockInterviewPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/interview/history"
        element={
          <ProtectedRoute>
            <InterviewHistoryPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/interview/analytics"
        element={
          <ProtectedRoute>
            <InterviewAnalyticsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/interview/:sessionId"
        element={
          <ProtectedRoute>
            <InterviewSessionPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/interview/:sessionId/result"
        element={
          <ProtectedRoute>
            <InterviewResultPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/interview/:sessionId/analysis"
        element={
          <ProtectedRoute>
            <InterviewAnalysisReportPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/analytics"
        element={
          <ProtectedRoute>
            <AnalyticsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/ai-coach"
        element={
          <ProtectedRoute>
            <AICoachPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/placement-readiness"
        element={
          <ProtectedRoute>
            <PlacementReadinessPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/readiness"
        element={
          <ProtectedRoute>
            <PlacementReadinessPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/career-coach"
        element={
          <ProtectedRoute>
            <CareerCoachDashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/career-coach/today"
        element={
          <ProtectedRoute>
            <TodayTasksPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/career-coach/roadmap"
        element={
          <ProtectedRoute>
            <RoadmapDetailPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/career-coach/chat"
        element={
          <ProtectedRoute>
            <CareerCoachChatPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/jobs"
        element={
          <ProtectedRoute>
            <JobDiscoveryPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/jobs/compare"
        element={
          <ProtectedRoute>
            <JobComparisonPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/jobs/:id"
        element={
          <ProtectedRoute>
            <JobDetailPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/applications"
        element={
          <ProtectedRoute>
            <ApplicationTrackerPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/placement-intelligence"
        element={
          <ProtectedRoute>
            <PlacementIntelligencePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin"
        element={
          <ProtectedRoute adminOnly={true}>
            <AdminPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/questions"
        element={
          <ProtectedRoute adminOnly={true}>
            <AdminQuestionsPage />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}
