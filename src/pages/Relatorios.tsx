
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { DollarSign, TrendingUp, Users, Home } from 'lucide-react';

export const Relatorios = () => {
  const [periodoSelecionado, setPeriodoSelecionado] = useState('mes_atual');

  const { data: resumoFinanceiro } = useQuery({
    queryKey: ['resumo-financeiro', periodoSelecionado],
    queryFn: async () => {
      // Calcular data de início baseado no período
      const hoje = new Date();
      let dataInicio = new Date();
      
      switch (periodoSelecionado) {
        case 'mes_atual':
          dataInicio = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
          break;
        case 'mes_anterior':
          dataInicio = new Date(hoje.getFullYear(), hoje.getMonth() - 1, 1);
          break;
        case 'ultimos_3_meses':
          dataInicio = new Date(hoje.getFullYear(), hoje.getMonth() - 3, 1);
          break;
        case 'ano_atual':
          dataInicio = new Date(hoje.getFullYear(), 0, 1);
          break;
      }

      // Buscar receitas
      const { data: receitas } = await supabase
        .from('cobrancas')
        .select('valor')
        .eq('status', 'pago')
        .gte('data_pagamento', dataInicio.toISOString().split('T')[0]);

      // Buscar despesas
      const { data: despesas } = await supabase
        .from('despesas')
        .select('valor')
        .gte('data', dataInicio.toISOString().split('T')[0]);

      const totalReceitas = receitas?.reduce((acc, r) => acc + r.valor, 0) || 0;
      const totalDespesas = despesas?.reduce((acc, d) => acc + d.valor, 0) || 0;

      return {
        receitas: totalReceitas,
        despesas: totalDespesas,
        lucro: totalReceitas - totalDespesas
      };
    }
  });

  const { data: estatisticas } = useQuery({
    queryKey: ['estatisticas'],
    queryFn: async () => {
      const { data: imoveis } = await supabase.from('imoveis').select('id');
      const { data: quartos } = await supabase.from('quartos').select('id, status');
      const { data: inquilinos } = await supabase.from('inquilinos').select('id').eq('status', 'ativo');
      const { data: cobrancasPendentes } = await supabase.from('cobrancas').select('id').eq('status', 'pendente');

      const quartosOcupados = quartos?.filter(q => q.status === 'ocupado').length || 0;
      const totalQuartos = quartos?.length || 0;
      const taxaOcupacao = totalQuartos > 0 ? (quartosOcupados / totalQuartos) * 100 : 0;

      return {
        totalImoveis: imoveis?.length || 0,
        totalQuartos,
        quartosOcupados,
        taxaOcupacao,
        inquilinosAtivos: inquilinos?.length || 0,
        cobrancasPendentes: cobrancasPendentes?.length || 0
      };
    }
  });

  const { data: receitasPorMes } = useQuery({
    queryKey: ['receitas-por-mes'],
    queryFn: async () => {
      const { data } = await supabase
        .from('cobrancas')
        .select('valor, data_pagamento')
        .eq('status', 'pago')
        .not('data_pagamento', 'is', null)
        .order('data_pagamento');

      const receitasPorMes: { [key: string]: number } = {};
      
      data?.forEach(cobranca => {
        if (cobranca.data_pagamento) {
          const mes = new Date(cobranca.data_pagamento).toLocaleDateString('pt-BR', { 
            year: 'numeric', 
            month: 'short' 
          });
          receitasPorMes[mes] = (receitasPorMes[mes] || 0) + cobranca.valor;
        }
      });

      return Object.entries(receitasPorMes).map(([mes, valor]) => ({
        mes,
        valor
      }));
    }
  });

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Relatórios</h1>
        <Select value={periodoSelecionado} onValueChange={setPeriodoSelecionado}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Selecione o período" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="mes_atual">Mês Atual</SelectItem>
            <SelectItem value="mes_anterior">Mês Anterior</SelectItem>
            <SelectItem value="ultimos_3_meses">Últimos 3 Meses</SelectItem>
            <SelectItem value="ano_atual">Ano Atual</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receitas</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              R$ {resumoFinanceiro?.receitas.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) || '0,00'}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Despesas</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              R$ {resumoFinanceiro?.despesas.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) || '0,00'}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Lucro Líquido</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${(resumoFinanceiro?.lucro || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              R$ {resumoFinanceiro?.lucro.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) || '0,00'}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Ocupação</CardTitle>
            <Home className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {estatisticas?.taxaOcupacao.toFixed(1) || 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              {estatisticas?.quartosOcupados || 0} de {estatisticas?.totalQuartos || 0} quartos
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Estatísticas Gerais */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Imóveis Cadastrados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{estatisticas?.totalImoveis || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Inquilinos Ativos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{estatisticas?.inquilinosAtivos || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Cobranças Pendentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-600">{estatisticas?.cobrancasPendentes || 0}</div>
          </CardContent>
        </Card>
      </div>

      {/* Gráfico de Receitas por Mês */}
      <Card>
        <CardHeader>
          <CardTitle>Receitas por Mês</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={receitasPorMes}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="mes" />
              <YAxis />
              <Tooltip formatter={(value) => [`R$ ${Number(value).toFixed(2)}`, 'Receita']} />
              <Legend />
              <Bar dataKey="valor" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};
