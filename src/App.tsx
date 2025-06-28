
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { RentalProvider } from "./contexts/RentalContext";
import { Layout } from "./components/Layout";
import { Dashboard } from "./pages/Dashboard";
import { Imoveis } from "./pages/Imoveis";
import { Quartos } from "./pages/Quartos";
import { Inquilinos } from "./pages/Inquilinos";
import { Cobrancas } from "./pages/Cobrancas";
import { Despesas } from "./pages/Despesas";
import { Notificacoes } from "./pages/Notificacoes";
import { Relatorios } from "./pages/Relatorios";
import { Configuracoes } from "./pages/Configuracoes";
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
              <Route path="/imoveis" element={<Imoveis />} />
              <Route path="/quartos" element={<Quartos />} />
              <Route path="/inquilinos" element={<Inquilinos />} />
              <Route path="/cobrancas" element={<Cobrancas />} />
              <Route path="/despesas" element={<Despesas />} />
              <Route path="/notificacoes" element={<Notificacoes />} />
              <Route path="/relatorios" element={<Relatorios />} />
              <Route path="/configuracoes" element={<Configuracoes />} />
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
