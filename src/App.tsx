import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import ExecutivePage from "@/pages/dash/ExecutivePage";
import ConversasPage from "@/pages/dash/ConversasPage";
import TrafegoPage from "@/pages/dash/TrafegoPage";
import VapiPage from "@/pages/dash/VapiPage";
import AdminPage from "@/pages/dash/AdminPage";
import ConfigPage from "@/pages/dash/ConfigPage";
import LoginPage from "@/pages/LoginPage";
import NotFound from "./pages/NotFound";
import { ROUTES } from "@/lib/config";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public routes */}
            <Route path={ROUTES.LOGIN} element={<LoginPage />} />
            
            {/* Redirect root to dashboard */}
            <Route path="/" element={<Navigate to={ROUTES.DASHBOARD.EXECUTIVO} replace />} />
            
            {/* Protected dashboard routes */}
            <Route path="/dash/*" element={
              <ProtectedRoute>
                <DashboardLayout>
                  <Routes>
                    <Route path="executivo" element={<ExecutivePage />} />
                    <Route path="conversas" element={<ConversasPage />} />
                    <Route path="trafego" element={<TrafegoPage />} />
                    <Route path="vapi" element={<VapiPage />} />
                    
                    {/* Admin-only routes */}
                    <Route path="admin" element={
                      <ProtectedRoute requireAdmin>
                        <AdminPage />
                      </ProtectedRoute>
                    } />
                    <Route path="config" element={
                      <ProtectedRoute requireAdmin>
                        <ConfigPage />
                      </ProtectedRoute>
                    } />
                  </Routes>
                </DashboardLayout>
              </ProtectedRoute>
            } />
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
