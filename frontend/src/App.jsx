import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AppProvider } from "./context/AppContext";
import { ProtectedRoute } from "./components/ProtectedRoute";

import { LandingPage } from "./pages/LandingPage";
import { LoginPage } from "./pages/LoginPage";
import { SignupPage } from "./pages/SignupPage";
import { OnboardingPage } from "./pages/OnboardingPage";
import { DashboardPage } from "./pages/DashboardPage";
import { ResumeAnalyzerPage } from "./pages/ResumeAnalyzerPage";
import { JobDescriptionPage } from "./pages/JobDescriptionPage";
import { AnalysisResultsPage } from "./pages/AnalysisResultsPage";
import { SkillGapPage } from "./pages/SkillGapPage";
import { LearningRoadmapPage } from "./pages/LearningRoadmapPage";
import { InterviewPreparationPage } from "./pages/InterviewPreparationPage";
import { ResumeImprovementPage } from "./pages/ResumeImprovementPage";
import { HistoryPage } from "./pages/HistoryPage";
import { ProfilePage } from "./pages/ProfilePage";

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />

          {/* Protected Routes */}
          <Route
            path="/onboarding"
            element={
              <ProtectedRoute>
                <OnboardingPage />
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
            path="/upload-resume"
            element={
              <ProtectedRoute>
                <ResumeAnalyzerPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/job-description"
            element={
              <ProtectedRoute>
                <JobDescriptionPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/analysis-results"
            element={
              <ProtectedRoute>
                <AnalysisResultsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/skill-gap"
            element={
              <ProtectedRoute>
                <SkillGapPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/learning-roadmap"
            element={
              <ProtectedRoute>
                <LearningRoadmapPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/interview-preparation"
            element={
              <ProtectedRoute>
                <InterviewPreparationPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/resume-improvement"
            element={
              <ProtectedRoute>
                <ResumeImprovementPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/history"
            element={
              <ProtectedRoute>
                <HistoryPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />

          {/* Catch-all fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
}