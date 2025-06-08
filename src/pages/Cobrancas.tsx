
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Plus, Edit, Trash2, CreditCard, Calendar } from 'lucide-react';

interface Cobranca {
  id: string;
  inquilino_id: string;
  quarto_id: string;
  valor: number;
  valor_original: number;
  desconto?: number;
  mes_referencia: string;
  data_vencimento: string;
  data_pagamento?: string;
  status: 'pendente' | 'pago' | 'atrasado' | 'cancelado';
  metodo_pagamento?: string;
  pix_id?: string;
  comprovante_pagamento?: string;
  observacoes?: string;
  created_at: string;
  updated_at: string;
  inquilinos?: { nome: string };
  quartos?: { nome: string; imoveis?: { nome: string } };
}

export const Cobrancas = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCobranca, setEditingCobranca] = useState<Cobranca | null>(null);
  const [formData, setFormData] = useState({
    inquilino_id: '',
    quarto_id: '',
    valor_original: '',
    desconto: '',
    mes_referencia: '',
    data_vencimento: '',
    data_pagamento: '',
    status: 'pendente' as const,
    metodo_pagamento: '',
    observacoes: ''
  });

  const queryClient = useQueryClient();

  const { data: cobrancas, isLoading } = useQuery({
    queryKey: ['cobrancas'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cobrancas')
        .select(`
          *,
          inquilinos (nome),
          quartos (
            nome,
            imoveis (nome)
          )
        `)
        .order('data_vencimento', { ascending: false });
      
      if (error) throw error;
      return data as Cobranca[];
    }
  });

  const { data: inquilinos } = useQuery({
    queryKey: ['inquilinos-select'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('inquilinos')
        .select('id, nome')
        .eq('status', 'ativo')
        .order('nome');
      
      if (error) throw error;
      return data;
    }
  });

  const { data: quartos } = useQuery({
    queryKey: ['quartos-select'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('quartos')
        .select(`
          id, 
          nome,
          imoveis (nome)
        `)
        .order('nome');
      
      if (error) throw error;
      return data;
    }
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const valorOriginal = parseFloat(data.valor_original);
      const desconto = data.desconto ? parseFloat(data.desconto) : 0;
      const valor = valorOriginal - desconto;

      const { error } = await supabase
        .from('cobrancas')
        .insert({
          inquilino_id: data.inquilino_id,
          quarto_id: data.quarto_id,
          valor_original: valorOriginal,
          desconto: desconto || null,
          valor: valor,
          mes_referencia: data.mes_referencia,
          data_vencimento: data.data_vencimento,
          data_pagamento: data.data_pagamento || null,
          status: data.status,
          metodo_pagamento: data.metodo_pagamento || null,
          observacoes: data.observacoes || null
        });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cobrancas'] });
      setIsDialogOpen(false);
      resetForm();
      toast.success('Cobrança criada com sucesso!');
    },
    onError: (error) => {
      toast.error('Erro ao criar cobrança: ' + error.message);
    }
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: typeof formData }) => {
      const valorOriginal = parseFloat(data.valor_original);
      const desconto = data.desconto ? parseFloat(data.desconto) : 0;
      const valor = valorOriginal - desconto;

      const { error } = await supabase
        .from('cobrancas')
        .update({
          inquilino_id: data.inquilino_id,
          quarto_id: data.quarto_id,
          valor_original: valorOriginal,
          desconto: desconto || null,
          valor: valor,
          mes_referencia: data.mes_referencia,
          data_vencimento: data.data_vencimento,
          data_pagamento: data.data_pagamento || null,
          status: data.status,
          metodo_pagamento: data.metodo_pagamento || null,
          observacoes: data.observacoes || null
        })
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cobrancas'] });
      setIsDialogOpen(false);
      setEditingCobranca(null);
      resetForm();
      toast.success('Cobrança atualizada com sucesso!');
    },
    onError: (error) => {
      toast.error('Erro ao atualizar cobrança: ' + error.message);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('cobrancas')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cobrancas'] });
      toast.success('Cobrança excluída com sucesso!');
    },
    onError: (error) => {
      toast.error('Erro ao excluir cobrança: ' + error.message);
    }
  });

  const resetForm = () => {
    setFormData({
      inquilino_id: '',
      quarto_id: '',
      valor_original: '',
      desconto: '',
      mes_referencia: '',
      data_vencimento: '',
      data_pagamento: '',
      status: 'pendente',
      metodo_pagamento: '',
      observacoes: ''
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingCobranca) {
      updateMutation.mutate({ id: editingCobranca.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleEdit = (cobranca: Cobranca) => {
    setEditingCobranca(cobranca);
    setFormData({
      inquilino_id: cobranca.inquilino_id,
      quarto_id: cobranca.quarto_id,
      valor_original: cobranca.valor_original.toString(),
      desconto: cobranca.desconto?.toString() || '',
      mes_referencia: cobranca.mes_referencia,
      data_vencimento: cobranca.data_vencimento,
      data_pagamento: cobranca.data_pagamento || '',
      status: cobranca.status,
      metodo_pagamento: cobranca.metodo_pagamento || '',
      observacoes: cobranca.observacoes || ''
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta cobrança?')) {
      deleteMutation.mutate(id);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pago': return 'bg-green-100 text-green-800';
      case 'pendente': return 'bg-yellow-100 text-yellow-800';
      case 'atrasado': return 'bg-red-100 text-red-800';
      case 'cancelado': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pago': return 'Pago';
      case 'pendente': return 'Pendente';
      case 'atrasado': return 'Atrasado';
      case 'cancelado': return 'Cancelado';
      default: return status;
    }
  };

  if (isLoading) {
    return <div className="flex justify-center p-8">Carregando...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Cobranças</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => { setEditingCobranca(null); resetForm(); }}>
              <Plus className="mr-2 h-4 w-4" />
              Nova Cobrança
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingCobranca ? 'Editar Cobrança' : 'Nova Cobrança'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="inquilino_id">Inquilino</Label>
                  <Select value={formData.inquilino_id} onValueChange={(value) => setFormData(prev => ({ ...prev, inquilino_id: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um inquilino" />
                    </SelectTrigger>
                    <SelectContent>
                      {inquilinos?.map((inquilino) => (
                        <SelectItem key={inquilino.id} value={inquilino.id}>
                          {inquilino.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="quarto_id">Quarto</Label>
                  <Select value={formData.quarto_id} onValueChange={(value) => setFormData(prev => ({ ...prev, quarto_id: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um quarto" />
                    </SelectTrigger>
                    <SelectContent>
                      {quartos?.map((quarto) => (
                        <SelectItem key={quarto.id} value={quarto.id}>
                          {quarto.nome} - {quarto.imoveis?.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="valor_original">Valor Original (R$)</Label>
                  <Input
                    id="valor_original"
                    type="number"
                    step="0.01"
                    value={formData.valor_original}
                    onChange={(e) => setFormData(prev => ({ ...prev, valor_original: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="desconto">Desconto (R$)</Label>
                  <Input
                    id="desconto"
                    type="number"
                    step="0.01"
                    value={formData.desconto}
                    onChange={(e) => setFormData(prev => ({ ...prev, desconto: e.target.value }))}
                  />
                </div>
                <div>
                  <Label>Valor Final</Label>
                  <div className="p-2 bg-gray-100 rounded text-center font-semibold">
                    R$ {((parseFloat(formData.valor_original) || 0) - (parseFloat(formData.desconto) || 0)).toFixed(2)}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="mes_referencia">Mês de Referência (YYYY-MM)</Label>
                  <Input
                    id="mes_referencia"
                    type="month"
                    value={formData.mes_referencia}
                    onChange={(e) => setFormData(prev => ({ ...prev, mes_referencia: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="data_vencimento">Data de Vencimento</Label>
                  <Input
                    id="data_vencimento"
                    type="date"
                    value={formData.data_vencimento}
                    onChange={(e) => setFormData(prev => ({ ...prev, data_vencimento: e.target.value }))}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select value={formData.status} onValueChange={(value: any) => setFormData(prev => ({ ...prev, status: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pendente">Pendente</SelectItem>
                      <SelectItem value="pago">Pago</SelectItem>
                      <SelectItem value="atrasado">Atrasado</SelectItem>
                      <SelectItem value="cancelado">Cancelado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="data_pagamento">Data de Pagamento</Label>
                  <Input
                    id="data_pagamento"
                    type="date"
                    value={formData.data_pagamento}
                    onChange={(e) => setFormData(prev => ({ ...prev, data_pagamento: e.target.value }))}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="metodo_pagamento">Método de Pagamento</Label>
                <Select value={formData.metodo_pagamento} onValueChange={(value) => setFormData(prev => ({ ...prev, metodo_pagamento: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o método" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pix">PIX</SelectItem>
                    <SelectItem value="transferencia">Transferência</SelectItem>
                    <SelectItem value="dinheiro">Dinheiro</SelectItem>
                    <SelectItem value="cartao">Cartão</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="observacoes">Observações</Label>
                <Textarea
                  id="observacoes"
                  value={formData.observacoes}
                  onChange={(e) => setFormData(prev => ({ ...prev, observacoes: e.target.value }))}
                  rows={3}
                />
              </div>

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                  {editingCobranca ? 'Atualizar' : 'Criar'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cobrancas?.map((cobranca) => (
          <Card key={cobranca.id}>
            <CardHeader>
              <CardTitle className="flex justify-between items-start">
                <div className="flex items-center space-x-2">
                  <CreditCard className="h-5 w-5" />
                  <span className="text-sm">{cobranca.mes_referencia}</span>
                </div>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" onClick={() => handleEdit(cobranca)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleDelete(cobranca.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-lg">
                    R$ {cobranca.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                  <Badge className={getStatusColor(cobranca.status)}>
                    {getStatusLabel(cobranca.status)}
                  </Badge>
                </div>

                <div className="text-sm space-y-1">
                  <p><strong>Inquilino:</strong> {cobranca.inquilinos?.nome}</p>
                  <p><strong>Quarto:</strong> {cobranca.quartos?.nome}</p>
                  {cobranca.quartos?.imoveis && (
                    <p><strong>Imóvel:</strong> {cobranca.quartos.imoveis.nome}</p>
                  )}
                </div>

                <div className="flex items-center space-x-2 text-sm">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span>Vence em {new Date(cobranca.data_vencimento).toLocaleDateString('pt-BR')}</span>
                </div>

                {cobranca.data_pagamento && (
                  <div className="text-sm text-green-600">
                    <p>Pago em {new Date(cobranca.data_pagamento).toLocaleDateString('pt-BR')}</p>
                  </div>
                )}

                {cobranca.desconto && cobranca.desconto > 0 && (
                  <div className="text-sm">
                    <p>Valor original: R$ {cobranca.valor_original.toFixed(2)}</p>
                    <p className="text-green-600">Desconto: R$ {cobranca.desconto.toFixed(2)}</p>
                  </div>
                )}

                {cobranca.metodo_pagamento && (
                  <Badge variant="outline">
                    {cobranca.metodo_pagamento.toUpperCase()}
                  </Badge>
                )}

                {cobranca.observacoes && (
                  <p className="text-sm text-gray-600">{cobranca.observacoes}</p>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {cobrancas?.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">Nenhuma cobrança cadastrada ainda.</p>
        </div>
      )}
    </div>
  );
};
