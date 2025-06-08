
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { RentalProvider } from "./contexts/RentalContext";
import { Layout } from "./components/Layout";
import { Dashboard } from "./pages/Dashboard";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <RentalProvider>
        <BrowserRouter>
          <Layout>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/imoveis" element={<div>Página de Imóveis em desenvolvimento</div>} />
              <Route path="/quartos" element={<div>Página de Quartos em desenvolvimento</div>} />
              <Route path="/inquilinos" element={<div>Página de Inquilinos em desenvolvimento</div>} />
              <Route path="/cobrancas" element={<div>Página de Cobranças em desenvolvimento</div>} />
              <Route path="/despesas" element={<div>Página de Despesas em desenvolvimento</div>} />
              <Route path="/notificacoes" element={<div>Página de Notificações em desenvolvimento</div>} />
              <Route path="/relatorios" element={<div>Página de Relatórios em desenvolvimento</div>} />
              <Route path="/configuracoes" element={<div>Página de Configurações em desenvolvimento</div>} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Layout>
        </BrowserRouter>
      </RentalProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
