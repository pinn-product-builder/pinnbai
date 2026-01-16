import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { SaasAuthProvider } from "@/contexts/SaasAuthContext";
import { SaasProtectedRoute, AfonsinaRoute } from "@/components/SaasProtectedRoute";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { AdminLayout } from "@/components/layouts/AdminLayout";
import { PlaceholderPage } from "@/pages/PlaceholderPage";

// Afonsina Dashboard Pages (legado - intocado)
import ExecutivePage from "@/pages/dash/ExecutivePage";
import ConversasPage from "@/pages/dash/ConversasPage";
import TrafegoPage from "@/pages/dash/TrafegoPage";
import LigacoesPage from "@/pages/dash/LigacoesPage";
import VendasPage from "@/pages/dash/VendasPage";
import AdminPage from "@/pages/dash/AdminPage";
import ConfigPage from "@/pages/dash/ConfigPage";

// SaaS Pages
import SaasLoginPage from "@/pages/SaasLoginPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
    <QueryClientProvider client={queryClient}>
      <SaasAuthProvider>
        <TooltipProvider delayDuration={200}>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              {/* Public: Login */}
              <Route path="/login" element={<SaasLoginPage />} />
              
              {/* Root redirect */}
              <Route path="/" element={<Navigate to="/login" replace />} />
              
              {/* Afonsina Dashboard (legado - 100% intocado) */}
              <Route path="/dash/*" element={
                <AfonsinaRoute>
                  <DashboardLayout>
                    <Routes>
                      <Route path="executivo" element={<ExecutivePage />} />
                      <Route path="conversas" element={<ConversasPage />} />
                      <Route path="trafego" element={<TrafegoPage />} />
                      <Route path="ligacoes" element={<LigacoesPage />} />
                      <Route path="vendas" element={<VendasPage />} />
                      <Route path="admin" element={<AdminPage />} />
                      <Route path="config" element={<ConfigPage />} />
                    </Routes>
                  </DashboardLayout>
                </AfonsinaRoute>
              } />
              
              {/* Admin Routes */}
              <Route path="/admin" element={
                <SaasProtectedRoute requireAdmin>
                  <AdminLayout />
                </SaasProtectedRoute>
              }>
                <Route index element={<Navigate to="/admin/visao-geral" replace />} />
                <Route path="visao-geral" element={<PlaceholderPage />} />
                <Route path="workspaces" element={<PlaceholderPage />} />
                <Route path="workspaces/:orgId" element={<PlaceholderPage />} />
                <Route path="usuarios" element={<PlaceholderPage />} />
                <Route path="templates" element={<PlaceholderPage />} />
                <Route path="pipelines" element={<PlaceholderPage />} />
              </Route>
              
              {/* App Routes (para clientes genéricos - futuro) */}
              <Route path="/app/*" element={
                <SaasProtectedRoute>
                  <PlaceholderPage />
                </SaasProtectedRoute>
              } />
              
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </SaasAuthProvider>
    </QueryClientProvider>
  </ThemeProvider>
);

export default App;
