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
import { AppLayout } from "@/components/app/AppLayout";

// Afonsina Dashboard Pages (legado - 100% intocado)
import ExecutivePage from "@/pages/dash/ExecutivePage";
import ConversasPage from "@/pages/dash/ConversasPage";
import TrafegoPage from "@/pages/dash/TrafegoPage";
import LigacoesPage from "@/pages/dash/LigacoesPage";
import VendasPage from "@/pages/dash/VendasPage";
import AdminPage from "@/pages/dash/AdminPage";
import ConfigPage from "@/pages/dash/ConfigPage";

// SaaS Pages - Admin
import SaasLoginPage from "@/pages/SaasLoginPage";
import AdminVisaoGeralPage from "@/pages/admin/AdminVisaoGeralPage";
import AdminWorkspacesPage from "@/pages/admin/AdminWorkspacesPage";
import AdminWorkspaceDetailPage from "@/pages/admin/AdminWorkspaceDetailPage";
import AdminUsuariosPage from "@/pages/admin/AdminUsuariosPage";
import AdminPipelinesPage from "@/pages/admin/AdminPipelinesPage";
import AdminTemplatesPage from "@/pages/admin/AdminTemplatesPage";
import AdminDashboardsPage from "@/pages/admin/AdminDashboardsPage";

// SaaS Pages - App
import DashboardsPage from "@/pages/app/DashboardsPage";
import DashboardEditPage from "@/pages/app/DashboardEditPage";
import DataSourcesPage from "@/pages/app/DataSourcesPage";
import DataSetsPage from "@/pages/app/DataSetsPage";

import { PlaceholderPage } from "@/pages/PlaceholderPage";
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
                <Route path="visao-geral" element={<AdminVisaoGeralPage />} />
                <Route path="workspaces" element={<AdminWorkspacesPage />} />
                <Route path="workspaces/:orgId" element={<AdminWorkspaceDetailPage />} />
                <Route path="usuarios" element={<AdminUsuariosPage />} />
                <Route path="templates" element={<AdminTemplatesPage />} />
                <Route path="pipelines" element={<AdminPipelinesPage />} />
                <Route path="dashboards" element={<AdminDashboardsPage />} />
              </Route>
              
              {/* App Routes (para clientes genéricos) */}
              <Route path="/app/dashboards" element={
                <SaasProtectedRoute>
                  <DashboardsPage />
                </SaasProtectedRoute>
              } />
              <Route path="/app/dashboards/:id" element={
                <SaasProtectedRoute>
                  <DashboardEditPage />
                </SaasProtectedRoute>
              } />
              <Route path="/app/data-sources" element={
                <SaasProtectedRoute>
                  <DataSourcesPage />
                </SaasProtectedRoute>
              } />
              <Route path="/app/data-sets" element={
                <SaasProtectedRoute>
                  <DataSetsPage />
                </SaasProtectedRoute>
              } />
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
