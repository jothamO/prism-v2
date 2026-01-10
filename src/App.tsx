import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/ui/providers/theme-provider";
import { AuthProvider } from "@/domains/auth";

// Public pages
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import { Login } from "./pages/Login";
import { Signup } from "./pages/Signup";

// Protected route wrapper
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

// Layouts
import { UserLayout, AdminLayout } from "@/ui/layouts";

// User pages
import {
  Dashboard,
  TransactionsPage,
  TaxDashboard,
  ProfilePage,
  AnalyticsPage,
  ReportsPage,
  TeamPage,
  TaxCalendarPage,
  BankConnectPage,
  EducationCenterPage,
  SettingsPage,
  NotificationsPage,
  InsightsPage,
} from "@/ui/pages/user";

// Admin pages
import {
  AdminDashboard,
  AdminUsers,
  AdminCompliance,
  AdminLogin,
  AdminSettings,
  AdminAnalytics,
  AdminChatbots,
  AdminReviews,
  AdminPatterns,
  AdminClassificationTesting,
  AdminLogs,
  AdminFilings,
  AdminVATTesting,
  AdminSimulator,
  AdminEducation,
  AdminNLUTesting,
  AdminBanking,
} from "@/ui/pages/admin";

// Static pages
import { LandingPage, OnboardingPage, FAQPage, PrivacyPage, TermsPage, ContactPage } from "@/ui/pages";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <ThemeProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/landing" element={<LandingPage />} />
            <Route path="/faq" element={<FAQPage />} />
            <Route path="/privacy" element={<PrivacyPage />} />
            <Route path="/terms" element={<TermsPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/onboarding" element={<OnboardingPage />} />
            <Route path="/admin/login" element={<AdminLogin />} />

            {/* User Routes (Protected) */}
            <Route
              element={
                <ProtectedRoute>
                  <UserLayout />
                </ProtectedRoute>
              }
            >
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/transactions" element={<TransactionsPage />} />
              <Route path="/tax" element={<TaxDashboard />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/analytics" element={<AnalyticsPage />} />
              <Route path="/reports" element={<ReportsPage />} />
              <Route path="/team" element={<TeamPage />} />
              <Route path="/calendar" element={<TaxCalendarPage />} />
              <Route path="/bank-connect" element={<BankConnectPage />} />
              <Route path="/education" element={<EducationCenterPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/notifications" element={<NotificationsPage />} />
              <Route path="/insights" element={<InsightsPage />} />
            </Route>

            {/* Admin Routes (Protected + Admin Required) */}
            <Route
              element={
                <ProtectedRoute requireAdmin>
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/users" element={<AdminUsers />} />
              <Route path="/admin/compliance" element={<AdminCompliance />} />
              <Route path="/admin/settings" element={<AdminSettings />} />
              <Route path="/admin/analytics" element={<AdminAnalytics />} />
              <Route path="/admin/chatbots" element={<AdminChatbots />} />
              <Route path="/admin/reviews" element={<AdminReviews />} />
              <Route path="/admin/patterns" element={<AdminPatterns />} />
              <Route path="/admin/classification" element={<AdminClassificationTesting />} />
              <Route path="/admin/logs" element={<AdminLogs />} />
              <Route path="/admin/filings" element={<AdminFilings />} />
              <Route path="/admin/vat-testing" element={<AdminVATTesting />} />
              <Route path="/admin/simulator" element={<AdminSimulator />} />
              <Route path="/admin/education" element={<AdminEducation />} />
              <Route path="/admin/nlu-testing" element={<AdminNLUTesting />} />
              <Route path="/admin/banking" element={<AdminBanking />} />
            </Route>

            {/* Catch-all */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
        </TooltipProvider>
      </ThemeProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
