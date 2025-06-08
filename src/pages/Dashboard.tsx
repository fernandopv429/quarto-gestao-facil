
import React from 'react';
import { useRental } from '@/contexts/RentalContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { 
  DollarSign, 
  TrendingUp, 
  Home, 
  Users, 
  AlertCircle, 
  Calendar,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  BarChart3
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const Dashboard: React.FC = () => {
  const { dashboardData, loading, quartos, inquilinos, cobrancas } = useRental();

  if (loading || !dashboardData) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="h-4 bg-muted rounded w-20"></div>
                <div className="h-4 w-4 bg-muted rounded"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-muted rounded w-24 mb-2"></div>
                <div className="h-3 bg-muted rounded w-32"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const cobrancasVencendoHoje = cobrancas.filter(c => {
    const hoje = new Date();
    const vencimento = new Date(c.dataVencimento);
    return vencimento.toDateString() === hoje.toDateString() && c.status === 'pendente';
  });

  const totalQuartos = quartos.length;
  const ocupacaoPercentual = totalQuartos > 0 ? (dashboardData.quartosAlugados / totalQuartos) * 100 : 0;

  return (
    <div className="space-y-6 fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">
            Visão geral do seu negócio de aluguel de quartos
          </p>
        </div>
        <div className="flex gap-2">
          <Link to="/cobrancas">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nova Cobrança
            </Button>
          </Link>
        </div>
      </div>

      {/* Alertas */}
      {cobrancasVencendoHoje.length > 0 && (
        <Card className="border-warning-200 bg-warning-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-warning-700">
              <AlertCircle className="h-5 w-5" />
              Cobranças Vencendo Hoje
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-warning-600">
              Você tem {cobrancasVencendoHoje.length} cobrança(s) vencendo hoje.
            </p>
            <Link to="/cobrancas">
              <Button variant="outline" size="sm" className="mt-2">
                Ver Cobranças
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Cards de Métricas */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receita do Mês</CardTitle>
            <DollarSign className="h-4 w-4 text-success-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success-600">
              R$ {dashboardData.totalRecebidoMes.toLocaleString('pt-BR')}
            </div>
            <div className="flex items-center text-xs text-muted-foreground">
              <ArrowUpRight className="h-3 w-3 mr-1 text-success-600" />
              +12% em relação ao mês anterior
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Despesas do Mês</CardTitle>
            <TrendingUp className="h-4 w-4 text-danger-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-danger-600">
              R$ {dashboardData.totalDespesasMes.toLocaleString('pt-BR')}
            </div>
            <div className="flex items-center text-xs text-muted-foreground">
              <ArrowDownRight className="h-3 w-3 mr-1 text-danger-600" />
              -5% em relação ao mês anterior
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Lucro Líquido</CardTitle>
            <DollarSign className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${dashboardData.lucroLiquido >= 0 ? 'text-success-600' : 'text-danger-600'}`}>
              R$ {dashboardData.lucroLiquido.toLocaleString('pt-BR')}
            </div>
            <div className="flex items-center text-xs text-muted-foreground">
              Margem: {dashboardData.totalRecebidoMes > 0 ? 
                ((dashboardData.lucroLiquido / dashboardData.totalRecebidoMes) * 100).toFixed(1) : 0}%
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ocupação</CardTitle>
            <Home className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {dashboardData.quartosAlugados}/{totalQuartos}
            </div>
            <div className="mt-2">
              <Progress value={ocupacaoPercentual} className="h-2" />
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {ocupacaoPercentual.toFixed(0)}% de ocupação
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Receita vs Despesas (6 meses)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={dashboardData.receitaMensal.map((receita, index) => ({
                mes: receita.mes,
                receita: receita.valor,
                despesa: dashboardData.despesaMensal[index]?.valor || 0
              }))}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="mes" />
                <YAxis />
                <Tooltip 
                  formatter={(value: number) => [`R$ ${value.toLocaleString('pt-BR')}`, '']}
                  labelFormatter={(label) => `Mês: ${label}`}
                />
                <Line type="monotone" dataKey="receita" stroke="#22c55e" strokeWidth={2} name="Receita" />
                <Line type="monotone" dataKey="despesa" stroke="#ef4444" strokeWidth={2} name="Despesa" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Lucro Mensal
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dashboardData.receitaMensal.map((receita, index) => ({
                mes: receita.mes,
                lucro: receita.valor - (dashboardData.despesaMensal[index]?.valor || 0)
              }))}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="mes" />
                <YAxis />
                <Tooltip 
                  formatter={(value: number) => [`R$ ${value.toLocaleString('pt-BR')}`, 'Lucro']}
                  labelFormatter={(label) => `Mês: ${label}`}
                />
                <Bar dataKey="lucro" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Resumo Rápido */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Inquilinos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">Total de inquilinos:</span>
                <Badge variant="outline">{inquilinos.length}</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Inadimplentes:</span>
                <Badge variant={dashboardData.inquilinosInadimplentes > 0 ? "destructive" : "secondary"}>
                  {dashboardData.inquilinosInadimplentes}
                </Badge>
              </div>
            </div>
            <Link to="/inquilinos">
              <Button variant="outline" size="sm" className="w-full mt-4">
                Gerenciar Inquilinos
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Home className="h-5 w-5" />
              Quartos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">Alugados:</span>
                <Badge variant="default">{dashboardData.quartosAlugados}</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Disponíveis:</span>
                <Badge variant="secondary">{dashboardData.quartosDisponiveis}</Badge>
              </div>
            </div>
            <Link to="/quartos">
              <Button variant="outline" size="sm" className="w-full mt-4">
                Gerenciar Quartos
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Próximos Vencimentos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {cobrancas
                .filter(c => c.status === 'pendente')
                .sort((a, b) => new Date(a.dataVencimento).getTime() - new Date(b.dataVencimento).getTime())
                .slice(0, 3)
                .map(cobranca => {
                  const inquilino = inquilinos.find(i => i.id === cobranca.inquilinoId);
                  return (
                    <div key={cobranca.id} className="flex justify-between items-center text-sm">
                      <span className="truncate">{inquilino?.nome}</span>
                      <span className="text-muted-foreground">
                        {new Date(cobranca.dataVencimento).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                  );
                })
              }
            </div>
            <Link to="/cobrancas">
              <Button variant="outline" size="sm" className="w-full mt-4">
                Ver Todas as Cobranças
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
