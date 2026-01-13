import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import ExecutivePage from "@/pages/dash/ExecutivePage";
import ConversasPage from "@/pages/dash/ConversasPage";
import TrafegoPage from "@/pages/dash/TrafegoPage";
import VapiPage from "@/pages/dash/VapiPage";
import AdminPage from "@/pages/dash/AdminPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/dash/executivo" replace />} />
          <Route path="/dash/*" element={
            <DashboardLayout>
              <Routes>
                <Route path="executivo" element={<ExecutivePage />} />
                <Route path="conversas" element={<ConversasPage />} />
                <Route path="trafego" element={<TrafegoPage />} />
                <Route path="vapi" element={<VapiPage />} />
                <Route path="admin" element={<AdminPage />} />
              </Routes>
            </DashboardLayout>
          } />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
