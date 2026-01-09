import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/ui/providers/theme-provider";

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
import { Dashboard } from "@/ui/pages/user/dashboard";
import { TransactionsPage } from "@/ui/pages/user/transactions";
import { TaxDashboard } from "@/ui/pages/user/tax-dashboard";
import { ProfilePage } from "@/ui/pages/user/profile";

// Admin pages
import { AdminDashboard } from "@/ui/pages/admin/dashboard";
import { AdminUsers } from "@/ui/pages/admin/users";
import { AdminCompliance } from "@/ui/pages/admin/compliance";

const queryClient = new QueryClient();

const App = () => (
    <QueryClientProvider client={queryClient}>
        <ThemeProvider>
            <TooltipProvider>
                <Toaster />
                <Sonner />
                <BrowserRouter>
                    <Routes>
                        {/* Public Routes */}
                        <Route path="/" element={<Index />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/signup" element={<Signup />} />

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
                        </Route>

                        {/* Catch-all */}
                        <Route path="*" element={<NotFound />} />
                    </Routes>
                </BrowserRouter>
            </TooltipProvider>
        </ThemeProvider>
    </QueryClientProvider>
);

export default App;
