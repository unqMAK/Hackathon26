import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import ScrollToTop from "@/components/ScrollToTop";

// Auth Pages
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import TeamRegistration from "./pages/TeamRegistration";
import ForgotPassword from "./pages/ForgotPassword";

// Public Pages
import Home from "./pages/Home";
import About from "./pages/About";
import ProblemStatements from "./pages/ProblemStatements";
import Guidelines from "./pages/Guidelines";
import SpocInfo from "./pages/SpocInfo";
import ProjectImplementation from "./pages/ProjectImplementation";
import FAQs from "./pages/FAQs";
import Contact from "./pages/Contact";

// Dashboard Pages
import AdminDashboardHome from "./pages/admin/AdminDashboardHome";
import AdminProblemsPage from "./pages/admin/AdminProblemsPage";
import AdminInstitutesPage from "./pages/admin/AdminInstitutesPage";
import AdminSpocsPage from "./pages/admin/AdminSpocsPage";
import AdminTeamsPage from "./pages/admin/AdminTeamsPage";
import AdminJudgesPage from "./pages/admin/AdminJudgesPage";
import AdminMentorPage from "./pages/admin/AdminMentorPage";
import AdminSubmissionsPage from "./pages/admin/AdminSubmissionsPage";
import AdminSettingsPage from "./pages/admin/AdminSettingsPage";
import AdminUsersPage from "./pages/admin/AdminUsersPage";
import AdminPasswordResetPage from "./pages/admin/AdminPasswordResetPage";
import AdminProfilePage from "./pages/admin/AdminProfilePage";
import AdminCountdownPage from "./pages/admin/AdminCountdownPage";
import AdminRubricsPage from "./pages/admin/AdminRubricsPage";
import AssignJudgesPage from "./pages/admin/AssignJudgesPage";
import ResultsDashboard from "./pages/admin/ResultsDashboard";
import AdminResultsSettings from "./pages/admin/AdminResultsSettings";
import AdminTimelinePage from "./pages/admin/AdminTimelinePage";
import AdminApplicationsPage from "./pages/admin/AdminApplicationsPage";
import AdminFAQsPage from "./pages/admin/AdminFAQsPage";

import PublicLeaderboard from "./pages/PublicLeaderboard";

import SpocDashboard from "./pages/spoc/SpocDashboard";
import SpocPendingTeams from "./pages/spoc/SpocPendingTeams";
import SpocApprovedTeams from "./pages/spoc/SpocApprovedTeams";
import SpocRejectedTeams from "./pages/spoc/SpocRejectedTeams";
// import SpocInvitations from "./pages/spoc/SpocInvitations"; // Removed
import SpocStudents from "./pages/spoc/SpocStudents";
import SpocMentors from "./pages/spoc/SpocMentors";
import SpocJudges from "./pages/spoc/SpocJudges";
import SpocSettings from "./pages/spoc/SpocSettings";
import SpocSubmissionsPage from "./pages/spoc/SpocSubmissionsPage";
import StudentDashboardHome from "./pages/student/StudentDashboardHome";
import StudentTeamPage from "./pages/student/StudentTeamPage";
import StudentProblemsPage from "./pages/student/StudentProblemsPage";
import StudentSubmissionPage from "./pages/student/StudentSubmissionPage";
import StudentProfilePage from "./pages/student/StudentProfilePage";
import StudentAnnouncementsPage from "./pages/student/StudentAnnouncementsPage";
import JudgeDashboard from "./pages/judge/JudgeDashboard";
import JudgeSubmissionsPage from "./pages/judge/JudgeSubmissionsPage";
import JudgeRankingsPage from "./pages/judge/JudgeRankingsPage";
import JudgeProfilePage from "./pages/judge/JudgeProfilePage";
import EvaluateTeam from "./pages/judge/EvaluateTeam";
import MentorDashboard from "./pages/mentor/MentorDashboard";
import MentorTeamView from "./pages/mentor/MentorTeamView";
import MentorTeamsPage from "./pages/mentor/MentorTeamsPage";
import MentorFeedbackPage from "./pages/mentor/MentorFeedbackPage";
import MentorProfilePage from "./pages/mentor/MentorProfilePage";

import AdminAnnouncementsPage from "./pages/admin/AdminAnnouncementsPage";
import SpocAnnouncementsPage from "./pages/spoc/SpocAnnouncementsPage";

import AdminCertificatePage from "./pages/admin/AdminCertificatePage";
import AdminGenerateCertificates from "./pages/admin/AdminGenerateCertificates";
import StudentCertificates from "./pages/student/StudentCertificates";

import NotificationsPage from "./pages/NotificationsPage";
import AdminNotificationsPage from "./pages/admin/AdminNotificationsPage";

import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true,
        }}
      >
        <ScrollToTop />
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/problem-statements" element={<ProblemStatements />} />
          <Route path="/guidelines" element={<Guidelines />} />
          <Route path="/spoc-info" element={<SpocInfo />} />
          <Route path="/project-implementation" element={<ProjectImplementation />} />
          <Route path="/leaderboard" element={<PublicLeaderboard />} />
          <Route path="/faqs" element={<FAQs />} />
          <Route path="/contact" element={<Contact />} />

          {/* Auth Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/register-team" element={<TeamRegistration />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          {/* Protected Dashboard Routes */}
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboardHome />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/problems"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminProblemsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/applications"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminApplicationsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/institutes"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminInstitutesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/teams"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminTeamsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/spocs"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminSpocsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/judges"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminJudgesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/mentors"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminMentorPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/submissions"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminSubmissionsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/countdown"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminCountdownPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/rubrics"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminRubricsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/assign-judges"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AssignJudgesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/results"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <ResultsDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/results-settings"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminResultsSettings />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/timeline"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminTimelinePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/announcements"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminAnnouncementsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/settings"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminSettingsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminUsersPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/profile"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminProfilePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/password-reset"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminPasswordResetPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/faqs"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminFAQsPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/spoc/dashboard"
            element={
              <ProtectedRoute allowedRoles={['spoc']}>
                <SpocDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/spoc/teams/pending"
            element={
              <ProtectedRoute allowedRoles={['spoc']}>
                <SpocPendingTeams />
              </ProtectedRoute>
            }
          />
          <Route
            path="/spoc/teams/approved"
            element={
              <ProtectedRoute allowedRoles={['spoc']}>
                <SpocApprovedTeams />
              </ProtectedRoute>
            }
          />
          <Route
            path="/spoc/teams/rejected"
            element={
              <ProtectedRoute allowedRoles={['spoc']}>
                <SpocRejectedTeams />
              </ProtectedRoute>
            }
          />
// Route removed
          <Route
            path="/spoc/students"
            element={
              <ProtectedRoute allowedRoles={['spoc']}>
                <SpocStudents />
              </ProtectedRoute>
            }
          />
          <Route
            path="/spoc/mentors"
            element={
              <ProtectedRoute allowedRoles={['spoc']}>
                <SpocMentors />
              </ProtectedRoute>
            }
          />
          <Route
            path="/spoc/judges"
            element={
              <ProtectedRoute allowedRoles={['spoc']}>
                <SpocJudges />
              </ProtectedRoute>
            }
          />
          <Route
            path="/spoc/settings"
            element={
              <ProtectedRoute allowedRoles={['spoc']}>
                <SpocSettings />
              </ProtectedRoute>
            }
          />
          <Route
            path="/spoc/submissions"
            element={
              <ProtectedRoute allowedRoles={['spoc']}>
                <SpocSubmissionsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/spoc/announcements"
            element={
              <ProtectedRoute allowedRoles={['spoc']}>
                <SpocAnnouncementsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/dashboard"
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <StudentDashboardHome />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/team"
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <StudentTeamPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/problems"
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <StudentProblemsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/submission"
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <StudentSubmissionPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/profile"
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <StudentProfilePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/announcements"
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <StudentAnnouncementsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/judge/dashboard"
            element={
              <ProtectedRoute allowedRoles={['judge']}>
                <JudgeDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/judge/evaluate/:teamId"
            element={
              <ProtectedRoute allowedRoles={['judge']}>
                <EvaluateTeam />
              </ProtectedRoute>
            }
          />
          <Route
            path="/judge/submissions"
            element={
              <ProtectedRoute allowedRoles={['judge']}>
                <JudgeSubmissionsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/judge/rankings"
            element={
              <ProtectedRoute allowedRoles={['judge']}>
                <JudgeRankingsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/judge/profile"
            element={
              <ProtectedRoute allowedRoles={['judge']}>
                <JudgeProfilePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/mentor/dashboard"
            element={
              <ProtectedRoute allowedRoles={['mentor']}>
                <MentorDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/mentor/teams"
            element={
              <ProtectedRoute allowedRoles={['mentor']}>
                <MentorTeamsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/mentor/team/:teamId"
            element={
              <ProtectedRoute allowedRoles={['mentor']}>
                <MentorTeamView />
              </ProtectedRoute>
            }
          />
          <Route
            path="/mentor/feedback"
            element={
              <ProtectedRoute allowedRoles={['mentor']}>
                <MentorFeedbackPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/mentor/profile"
            element={
              <ProtectedRoute allowedRoles={['mentor']}>
                <MentorProfilePage />
              </ProtectedRoute>
            }
          />

          {/* Certificate Routes */}
          <Route
            path="/admin/certificates/builder"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminCertificatePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/certificates/generate"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminGenerateCertificates />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/certificates"
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <StudentCertificates />
              </ProtectedRoute>
            }
          />
          <Route
            path="/mentor/certificates"
            element={
              <ProtectedRoute allowedRoles={['mentor']}>
                <StudentCertificates />
              </ProtectedRoute>
            }
          />
          <Route
            path="/judge/certificates"
            element={
              <ProtectedRoute allowedRoles={['judge']}>
                <StudentCertificates />
              </ProtectedRoute>
            }
          />
          <Route
            path="/spoc/certificates"
            element={
              <ProtectedRoute allowedRoles={['spoc']}>
                <StudentCertificates />
              </ProtectedRoute>
            }
          />

          {/* Notification Routes */}
          <Route
            path="/notifications"
            element={
              <ProtectedRoute allowedRoles={['admin', 'spoc', 'student', 'mentor', 'judge']}>
                <NotificationsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/notifications/send"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminNotificationsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/spoc/notifications/send"
            element={
              <ProtectedRoute allowedRoles={['spoc']}>
                <AdminNotificationsPage />
              </ProtectedRoute>
            }
          />

          {/* 404 Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
