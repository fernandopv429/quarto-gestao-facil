
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { RentalProvider } from "./contexts/RentalContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { Layout } from "./components/Layout";
import { Auth } from "./pages/Auth";
import { Dashboard } from "./pages/Dashboard";
import { Imoveis } from "./pages/Imoveis";
import { Quartos } from "./pages/Quartos";
import { Inquilinos } from "./pages/Inquilinos";
import { Cobrancas } from "./pages/Cobrancas";
import { Despesas } from "./pages/Despesas";
import { Notificacoes } from "./pages/Notificacoes";
import { Relatorios } from "./pages/Relatorios";
import { Configuracoes } from "./pages/Configuracoes";
import { Organizations } from "./pages/Organizations";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <RentalProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/auth" element={<Auth />} />
              <Route path="/" element={
                <ProtectedRoute>
                  <Layout>
                    <Dashboard />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/imoveis" element={
                <ProtectedRoute>
                  <Layout>
                    <Imoveis />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/quartos" element={
                <ProtectedRoute>
                  <Layout>
                    <Quartos />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/inquilinos" element={
                <ProtectedRoute>
                  <Layout>
                    <Inquilinos />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/cobrancas" element={
                <ProtectedRoute>
                  <Layout>
                    <Cobrancas />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/despesas" element={
                <ProtectedRoute>
                  <Layout>
                    <Despesas />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/notificacoes" element={
                <ProtectedRoute>
                  <Layout>
                    <Notificacoes />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/relatorios" element={
                <ProtectedRoute>
                  <Layout>
                    <Relatorios />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/configuracoes" element={
                <ProtectedRoute>
                  <Layout>
                    <Configuracoes />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/organizacoes" element={
                <ProtectedRoute requireAdmin>
                  <Layout>
                    <Organizations />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </RentalProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
