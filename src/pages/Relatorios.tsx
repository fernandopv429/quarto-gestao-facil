
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { FileText, Download, DollarSign, TrendingUp, TrendingDown, Calendar } from 'lucide-react';

export const Relatorios = () => {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  const [selectedMonth, setSelectedMonth] = useState('');

  // Relatório de receitas mensais
  const { data: receitasMensais } = useQuery({
    queryKey: ['receitas-mensais', selectedYear],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cobrancas')
        .select('data_pagamento, valor, mes_referencia')
        .eq('status', 'pago')
        .gte('data_pagamento', `${selectedYear}-01-01`)
        .lte('data_pagamento', `${selectedYear}-12-31`);
      
      if (error) throw error;

      // Agrupar por mês
      const receitasPorMes = data.reduce((acc: any, cobranca) => {
        const mes = cobranca.data_pagamento?.substring(0, 7) || cobranca.mes_referencia;
        acc[mes] = (acc[mes] || 0) + cobranca.valor;
        return acc;
      }, {});

      return Object.entries(receitasPorMes).map(([mes, valor]) => ({
        mes,
        valor: Number(valor)
      })).sort((a, b) => a.mes.localeCompare(b.mes));
    }
  });

  // Relatório de despesas mensais
  const { data: despesasMensais } = useQuery({
    queryKey: ['despesas-mensais', selectedYear],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('despesas')
        .select('data, valor, tipo')
        .gte('data', `${selectedYear}-01-01`)
        .lte('data', `${selectedYear}-12-31`);
      
      if (error) throw error;

      // Agrupar por mês
      const despesasPorMes = data.reduce((acc: any, despesa) => {
        const mes = despesa.data.substring(0, 7);
        acc[mes] = (acc[mes] || 0) + despesa.valor;
        return acc;
      }, {});

      return Object.entries(despesasPorMes).map(([mes, valor]) => ({
        mes,
        valor: Number(valor)
      })).sort((a, b) => a.mes.localeCompare(b.mes));
    }
  });

  // Relatório de despesas por tipo
  const { data: despesasPorTipo } = useQuery({
    queryKey: ['despesas-por-tipo', selectedYear],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('despesas')
        .select('tipo, valor')
        .gte('data', `${selectedYear}-01-01`)
        .lte('data', `${selectedYear}-12-31`);
      
      if (error) throw error;

      const despesasPorTipo = data.reduce((acc: any, despesa) => {
        acc[despesa.tipo] = (acc[despesa.tipo] || 0) + despesa.valor;
        return acc;
      }, {});

      return Object.entries(despesasPorTipo).map(([tipo, valor]) => ({
        tipo,
        valor: Number(valor)
      }));
    }
  });

  // Relatório de status de quartos
  const { data: statusQuartos } = useQuery({
    queryKey: ['status-quartos'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('quartos')
        .select('status');
      
      if (error) throw error;

      const statusCount = data.reduce((acc: any, quarto) => {
        acc[quarto.status] = (acc[quarto.status] || 0) + 1;
        return acc;
      }, {});

      return Object.entries(statusCount).map(([status, count]) => ({
        status,
        count: Number(count)
      }));
    }
  });

  // Estatísticas gerais
  const { data: estatisticas } = useQuery({
    queryKey: ['estatisticas', selectedYear, selectedMonth],
    queryFn: async () => {
      const startDate = selectedMonth ? `${selectedYear}-${selectedMonth}-01` : `${selectedYear}-01-01`;
      const endDate = selectedMonth ? 
        `${selectedYear}-${selectedMonth}-31` : 
        `${selectedYear}-12-31`;

      // Total de receitas
      const { data: receitas } = await supabase
        .from('cobrancas')
        .select('valor')
        .eq('status', 'pago')
        .gte('data_pagamento', startDate)
        .lte('data_pagamento', endDate);

      // Total de despesas
      const { data: despesas } = await supabase
        .from('despesas')
        .select('valor')
        .gte('data', startDate)
        .lte('data', endDate);

      // Cobranças pendentes
      const { data: cobrancasPendentes } = await supabase
        .from('cobrancas')
        .select('valor')
        .eq('status', 'pendente');

      // Inquilinos ativos
      const { data: inquilinosAtivos } = await supabase
        .from('inquilinos')
        .select('id')
        .eq('status', 'ativo');

      const totalReceitas = receitas?.reduce((sum, r) => sum + r.valor, 0) || 0;
      const totalDespesas = despesas?.reduce((sum, d) => sum + d.valor, 0) || 0;
      const totalPendente = cobrancasPendentes?.reduce((sum, c) => sum + c.valor, 0) || 0;

      return {
        totalReceitas,
        totalDespesas,
        lucroLiquido: totalReceitas - totalDespesas,
        totalPendente,
        inquilinosAtivos: inquilinosAtivos?.length || 0
      };
    }
  });

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  const getTipoLabel = (tipo: string) => {
    const labels: { [key: string]: string } = {
      agua: 'Água',
      luz: 'Luz',
      gas: 'Gás',
      internet: 'Internet',
      manutencao: 'Manutenção',
      limpeza: 'Limpeza',
      outros: 'Outros'
    };
    return labels[tipo] || tipo;
  };

  const getStatusLabel = (status: string) => {
    const labels: { [key: string]: string } = {
      disponivel: 'Disponível',
      ocupado: 'Ocupado',
      manutencao: 'Manutenção'
    };
    return labels[status] || status;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Relatórios</h1>
        <div className="flex space-x-4">
          <div>
            <Label htmlFor="year">Ano</Label>
            <Select value={selectedYear} onValueChange={setSelectedYear}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 5 }, (_, i) => {
                  const year = new Date().getFullYear() - i;
                  return (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="month">Mês (opcional)</Label>
            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Todos os meses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todos os meses</SelectItem>
                {Array.from({ length: 12 }, (_, i) => {
                  const month = String(i + 1).padStart(2, '0');
                  const monthName = new Date(2000, i, 1).toLocaleDateString('pt-BR', { month: 'long' });
                  return (
                    <SelectItem key={month} value={month}>
                      {monthName}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receitas</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              R$ {estatisticas?.totalReceitas.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) || '0,00'}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Despesas</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              R$ {estatisticas?.totalDespesas.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) || '0,00'}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Lucro Líquido</CardTitle>
            <DollarSign className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${(estatisticas?.lucroLiquido || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              R$ {estatisticas?.lucroLiquido.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) || '0,00'}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendente</CardTitle>
            <Calendar className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              R$ {estatisticas?.totalPendente.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) || '0,00'}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inquilinos Ativos</CardTitle>
            <FileText className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {estatisticas?.inquilinosAtivos || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Receitas vs Despesas */}
        <Card>
          <CardHeader>
            <CardTitle>Receitas vs Despesas ({selectedYear})</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={receitasMensais?.map(receita => ({
                mes: receita.mes,
                receitas: receita.valor,
                despesas: despesasMensais?.find(d => d.mes === receita.mes)?.valor || 0
              }))}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="mes" />
                <YAxis />
                <Tooltip formatter={(value: number) => `R$ ${value.toFixed(2)}`} />
                <Bar dataKey="receitas" fill="#10B981" name="Receitas" />
                <Bar dataKey="despesas" fill="#EF4444" name="Despesas" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Despesas por Tipo */}
        <Card>
          <CardHeader>
            <CardTitle>Despesas por Tipo ({selectedYear})</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={despesasPorTipo}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ tipo, percent }) => `${getTipoLabel(tipo)} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="valor"
                >
                  {despesasPorTipo?.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => `R$ ${value.toFixed(2)}`} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Status dos Quartos */}
        <Card>
          <CardHeader>
            <CardTitle>Status dos Quartos</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusQuartos}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ status, percent }) => `${getStatusLabel(status)} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {statusQuartos?.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Evolução do Lucro */}
        <Card>
          <CardHeader>
            <CardTitle>Evolução do Lucro ({selectedYear})</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={receitasMensais?.map(receita => ({
                mes: receita.mes,
                lucro: receita.valor - (despesasMensais?.find(d => d.mes === receita.mes)?.valor || 0)
              }))}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="mes" />
                <YAxis />
                <Tooltip formatter={(value: number) => `R$ ${value.toFixed(2)}`} />
                <Line type="monotone" dataKey="lucro" stroke="#8884d8" strokeWidth={2} name="Lucro" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
