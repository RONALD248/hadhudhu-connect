import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";

// Pages
import Landing from "./pages/Landing";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import NotFound from "./pages/NotFound";
import Install from "./pages/Install";

// Dashboard
import { DashboardLayout } from "./components/layout/DashboardLayout";
import Dashboard from "./pages/dashboard/Dashboard";
import Members from "./pages/dashboard/Members";
import Contributions from "./pages/dashboard/Contributions";
import Reports from "./pages/dashboard/Reports";
import Settings from "./pages/dashboard/Settings";
import UserManagement from "./pages/dashboard/UserManagement";
import ActivityLogs from "./pages/dashboard/ActivityLogs";
import Departments from "./pages/dashboard/Departments";
import Events from "./pages/dashboard/Events";
import PaymentCategories from "./pages/dashboard/PaymentCategories";
import Secretariat from "./pages/dashboard/Secretariat";
import Attendance from "./pages/dashboard/Attendance";
import Pledges from "./pages/dashboard/Pledges";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Landing />} />
            <Route path="/install" element={<Install />} />
            <Route path="/auth/login" element={<Login />} />
            <Route path="/auth/register" element={<Register />} />

            {/* Protected Dashboard Routes */}
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }>
              <Route index element={<Dashboard />} />
              <Route path="members" element={<Members />} />
              <Route path="contributions" element={<Contributions />} />
              <Route path="reports" element={<Reports />} />
              <Route path="settings" element={<Settings />} />
              <Route path="categories" element={<PaymentCategories />} />
              <Route path="departments" element={<Departments />} />
              <Route path="secretariat" element={<Secretariat />} />
              <Route path="events" element={<Events />} />
              <Route path="attendance" element={<Attendance />} />
              <Route path="pledges" element={<Pledges />} />
              <Route path="users" element={<UserManagement />} />
              <Route path="activity-logs" element={<ActivityLogs />} />
              <Route path="profile" element={<Settings />} />
            </Route>

            {/* Catch-all */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
