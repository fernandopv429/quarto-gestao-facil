
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Home,
  Building2,
  Bed,
  Users,
  CreditCard,
  Receipt,
  MessageSquare,
  BarChart3,
  Settings
} from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter
} from "@/components/ui/sidebar";

const menuItems = [
  {
    title: "Dashboard",
    url: "/",
    icon: Home,
  },
  {
    title: "Imóveis",
    url: "/imoveis",
    icon: Building2,
  },
  {
    title: "Quartos",
    url: "/quartos",
    icon: Bed,
  },
  {
    title: "Inquilinos",
    url: "/inquilinos",
    icon: Users,
  },
  {
    title: "Cobranças",
    url: "/cobrancas",
    icon: CreditCard,
  },
  {
    title: "Despesas",
    url: "/despesas",
    icon: Receipt,
  },
  {
    title: "Notificações",
    url: "/notificacoes",
    icon: MessageSquare,
  },
  {
    title: "Relatórios",
    url: "/relatorios",
    icon: BarChart3,
  },
  {
    title: "Configurações",
    url: "/configuracoes",
    icon: Settings,
  },
];

export function AppSidebar() {
  const location = useLocation();

  return (
    <Sidebar>
      <SidebarHeader className="border-b px-6 py-4">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
            <Building2 className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-sidebar-foreground">RentControl</h2>
            <p className="text-sm text-sidebar-foreground/60">Gestão de Aluguéis</p>
          </div>
        </div>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu Principal</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild 
                    isActive={location.pathname === item.url}
                  >
                    <Link to={item.url} className="flex items-center gap-3">
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      
      <SidebarFooter className="border-t px-6 py-4">
        <div className="text-xs text-sidebar-foreground/60">
          <p>© 2024 RentControl</p>
          <p>Versão 1.0.0</p>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
