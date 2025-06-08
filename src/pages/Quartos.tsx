import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Plus, Edit, Trash2, Bed } from 'lucide-react';

interface Quarto {
  id: string;
  imovel_id: string;
  nome: string;
  valor_mensal: number;
  status: 'disponivel' | 'ocupado' | 'manutencao';
  observacoes?: string;
  mobiliado: boolean;
  suite: boolean;
  inquilino_atual?: string;
  created_at: string;
  updated_at: string;
  imoveis?: { nome: string };
}

export const Quartos = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingQuarto, setEditingQuarto] = useState<Quarto | null>(null);
  const [formData, setFormData] = useState({
    imovel_id: '',
    nome: '',
    valor_mensal: '',
    status: 'disponivel' as 'disponivel' | 'ocupado' | 'manutencao',
    observacoes: '',
    mobiliado: false,
    suite: false
  });

  const queryClient = useQueryClient();

  const { data: quartos, isLoading } = useQuery({
    queryKey: ['quartos'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('quartos')
        .select(`
          *,
          imoveis (nome)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Quarto[];
    }
  });

  const { data: imoveis } = useQuery({
    queryKey: ['imoveis-select'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('imoveis')
        .select('id, nome')
        .order('nome');
      
      if (error) throw error;
      return data;
    }
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const { error } = await supabase
        .from('quartos')
        .insert({
          imovel_id: data.imovel_id,
          nome: data.nome,
          valor_mensal: parseFloat(data.valor_mensal),
          status: data.status,
          observacoes: data.observacoes || null,
          mobiliado: data.mobiliado,
          suite: data.suite
        });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quartos'] });
      setIsDialogOpen(false);
      resetForm();
      toast.success('Quarto criado com sucesso!');
    },
    onError: (error) => {
      toast.error('Erro ao criar quarto: ' + error.message);
    }
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: typeof formData }) => {
      const { error } = await supabase
        .from('quartos')
        .update({
          imovel_id: data.imovel_id,
          nome: data.nome,
          valor_mensal: parseFloat(data.valor_mensal),
          status: data.status,
          observacoes: data.observacoes || null,
          mobiliado: data.mobiliado,
          suite: data.suite
        })
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quartos'] });
      setIsDialogOpen(false);
      setEditingQuarto(null);
      resetForm();
      toast.success('Quarto atualizado com sucesso!');
    },
    onError: (error) => {
      toast.error('Erro ao atualizar quarto: ' + error.message);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('quartos')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quartos'] });
      toast.success('Quarto excluído com sucesso!');
    },
    onError: (error) => {
      toast.error('Erro ao excluir quarto: ' + error.message);
    }
  });

  const resetForm = () => {
    setFormData({
      imovel_id: '',
      nome: '',
      valor_mensal: '',
      status: 'disponivel',
      observacoes: '',
      mobiliado: false,
      suite: false
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingQuarto) {
      updateMutation.mutate({ id: editingQuarto.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleEdit = (quarto: Quarto) => {
    setEditingQuarto(quarto);
    setFormData({
      imovel_id: quarto.imovel_id,
      nome: quarto.nome,
      valor_mensal: quarto.valor_mensal.toString(),
      status: quarto.status,
      observacoes: quarto.observacoes || '',
      mobiliado: quarto.mobiliado,
      suite: quarto.suite
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja excluir este quarto?')) {
      deleteMutation.mutate(id);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'disponivel': return 'bg-green-100 text-green-800';
      case 'ocupado': return 'bg-red-100 text-red-800';
      case 'manutencao': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'disponivel': return 'Disponível';
      case 'ocupado': return 'Ocupado';
      case 'manutencao': return 'Manutenção';
      default: return status;
    }
  };

  if (isLoading) {
    return <div className="flex justify-center p-8">Carregando...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Quartos</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => { setEditingQuarto(null); resetForm(); }}>
              <Plus className="mr-2 h-4 w-4" />
              Novo Quarto
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingQuarto ? 'Editar Quarto' : 'Novo Quarto'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="imovel_id">Imóvel</Label>
                <Select value={formData.imovel_id} onValueChange={(value) => setFormData(prev => ({ ...prev, imovel_id: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um imóvel" />
                  </SelectTrigger>
                  <SelectContent>
                    {imoveis?.map((imovel) => (
                      <SelectItem key={imovel.id} value={imovel.id}>
                        {imovel.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="nome">Nome do Quarto</Label>
                  <Input
                    id="nome"
                    value={formData.nome}
                    onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="valor_mensal">Valor Mensal (R$)</Label>
                  <Input
                    id="valor_mensal"
                    type="number"
                    step="0.01"
                    value={formData.valor_mensal}
                    onChange={(e) => setFormData(prev => ({ ...prev, valor_mensal: e.target.value }))}
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="status">Status</Label>
                <Select value={formData.status} onValueChange={(value: 'disponivel' | 'ocupado' | 'manutencao') => setFormData(prev => ({ ...prev, status: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="disponivel">Disponível</SelectItem>
                    <SelectItem value="ocupado">Ocupado</SelectItem>
                    <SelectItem value="manutencao">Manutenção</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex space-x-6">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="mobiliado"
                    checked={formData.mobiliado}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, mobiliado: checked }))}
                  />
                  <Label htmlFor="mobiliado">Mobiliado</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="suite"
                    checked={formData.suite}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, suite: checked }))}
                  />
                  <Label htmlFor="suite">Suíte</Label>
                </div>
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
                  {editingQuarto ? 'Atualizar' : 'Criar'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {quartos?.map((quarto) => (
          <Card key={quarto.id}>
            <CardHeader>
              <CardTitle className="flex justify-between items-start">
                <div>
                  <div className="flex items-center space-x-2">
                    <Bed className="h-5 w-5" />
                    <span>{quarto.nome}</span>
                  </div>
                  <p className="text-sm font-normal text-gray-600 mt-1">
                    {quarto.imoveis?.nome}
                  </p>
                </div>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" onClick={() => handleEdit(quarto)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleDelete(quarto.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-lg">
                    R$ {quarto.valor_mensal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                  <Badge className={getStatusColor(quarto.status)}>
                    {getStatusLabel(quarto.status)}
                  </Badge>
                </div>
                
                <div className="flex space-x-4">
                  {quarto.mobiliado && (
                    <Badge variant="outline">Mobiliado</Badge>
                  )}
                  {quarto.suite && (
                    <Badge variant="outline">Suíte</Badge>
                  )}
                </div>

                {quarto.observacoes && (
                  <p className="text-sm text-gray-600">{quarto.observacoes}</p>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {quartos?.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">Nenhum quarto cadastrado ainda.</p>
        </div>
      )}
    </div>
  );
};
