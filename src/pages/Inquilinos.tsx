
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
import { Plus, Edit, Trash2, User, Phone, Mail } from 'lucide-react';

interface Inquilino {
  id: string;
  nome: string;
  cpf: string;
  rg: string;
  telefone: string;
  email: string;
  quarto_id?: string;
  data_entrada: string;
  data_saida?: string;
  status: 'ativo' | 'inativo';
  observacoes?: string;
  created_at: string;
  updated_at: string;
  quartos?: { nome: string; imoveis?: { nome: string } };
}

export const Inquilinos = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingInquilino, setEditingInquilino] = useState<Inquilino | null>(null);
  const [formData, setFormData] = useState({
    nome: '',
    cpf: '',
    rg: '',
    telefone: '',
    email: '',
    quarto_id: '',
    data_entrada: '',
    data_saida: '',
    status: 'ativo' as const,
    observacoes: ''
  });

  const queryClient = useQueryClient();

  const { data: inquilinos, isLoading } = useQuery({
    queryKey: ['inquilinos'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('inquilinos')
        .select(`
          *,
          quartos (
            nome,
            imoveis (nome)
          )
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Inquilino[];
    }
  });

  const { data: quartosDisponiveis } = useQuery({
    queryKey: ['quartos-disponiveis'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('quartos')
        .select(`
          id, 
          nome,
          imoveis (nome)
        `)
        .eq('status', 'disponivel')
        .order('nome');
      
      if (error) throw error;
      return data;
    }
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const { error } = await supabase
        .from('inquilinos')
        .insert({
          nome: data.nome,
          cpf: data.cpf,
          rg: data.rg,
          telefone: data.telefone,
          email: data.email,
          quarto_id: data.quarto_id || null,
          data_entrada: data.data_entrada,
          data_saida: data.data_saida || null,
          status: data.status,
          observacoes: data.observacoes || null
        });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inquilinos'] });
      queryClient.invalidateQueries({ queryKey: ['quartos-disponiveis'] });
      setIsDialogOpen(false);
      resetForm();
      toast.success('Inquilino criado com sucesso!');
    },
    onError: (error) => {
      toast.error('Erro ao criar inquilino: ' + error.message);
    }
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: typeof formData }) => {
      const { error } = await supabase
        .from('inquilinos')
        .update({
          nome: data.nome,
          cpf: data.cpf,
          rg: data.rg,
          telefone: data.telefone,
          email: data.email,
          quarto_id: data.quarto_id || null,
          data_entrada: data.data_entrada,
          data_saida: data.data_saida || null,
          status: data.status,
          observacoes: data.observacoes || null
        })
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inquilinos'] });
      queryClient.invalidateQueries({ queryKey: ['quartos-disponiveis'] });
      setIsDialogOpen(false);
      setEditingInquilino(null);
      resetForm();
      toast.success('Inquilino atualizado com sucesso!');
    },
    onError: (error) => {
      toast.error('Erro ao atualizar inquilino: ' + error.message);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('inquilinos')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inquilinos'] });
      queryClient.invalidateQueries({ queryKey: ['quartos-disponiveis'] });
      toast.success('Inquilino excluído com sucesso!');
    },
    onError: (error) => {
      toast.error('Erro ao excluir inquilino: ' + error.message);
    }
  });

  const resetForm = () => {
    setFormData({
      nome: '',
      cpf: '',
      rg: '',
      telefone: '',
      email: '',
      quarto_id: '',
      data_entrada: '',
      data_saida: '',
      status: 'ativo',
      observacoes: ''
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingInquilino) {
      updateMutation.mutate({ id: editingInquilino.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleEdit = (inquilino: Inquilino) => {
    setEditingInquilino(inquilino);
    setFormData({
      nome: inquilino.nome,
      cpf: inquilino.cpf,
      rg: inquilino.rg,
      telefone: inquilino.telefone,
      email: inquilino.email,
      quarto_id: inquilino.quarto_id || '',
      data_entrada: inquilino.data_entrada,
      data_saida: inquilino.data_saida || '',
      status: inquilino.status,
      observacoes: inquilino.observacoes || ''
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja excluir este inquilino?')) {
      deleteMutation.mutate(id);
    }
  };

  if (isLoading) {
    return <div className="flex justify-center p-8">Carregando...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Inquilinos</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => { setEditingInquilino(null); resetForm(); }}>
              <Plus className="mr-2 h-4 w-4" />
              Novo Inquilino
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingInquilino ? 'Editar Inquilino' : 'Novo Inquilino'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="nome">Nome Completo</Label>
                <Input
                  id="nome"
                  value={formData.nome}
                  onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="cpf">CPF</Label>
                  <Input
                    id="cpf"
                    value={formData.cpf}
                    onChange={(e) => setFormData(prev => ({ ...prev, cpf: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="rg">RG</Label>
                  <Input
                    id="rg"
                    value={formData.rg}
                    onChange={(e) => setFormData(prev => ({ ...prev, rg: e.target.value }))}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="telefone">Telefone</Label>
                  <Input
                    id="telefone"
                    value={formData.telefone}
                    onChange={(e) => setFormData(prev => ({ ...prev, telefone: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="quarto_id">Quarto</Label>
                <Select value={formData.quarto_id} onValueChange={(value) => setFormData(prev => ({ ...prev, quarto_id: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um quarto (opcional)" />
                  </SelectTrigger>
                  <SelectContent>
                    {quartosDisponiveis?.map((quarto) => (
                      <SelectItem key={quarto.id} value={quarto.id}>
                        {quarto.nome} - {quarto.imoveis?.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="data_entrada">Data de Entrada</Label>
                  <Input
                    id="data_entrada"
                    type="date"
                    value={formData.data_entrada}
                    onChange={(e) => setFormData(prev => ({ ...prev, data_entrada: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="data_saida">Data de Saída (opcional)</Label>
                  <Input
                    id="data_saida"
                    type="date"
                    value={formData.data_saida}
                    onChange={(e) => setFormData(prev => ({ ...prev, data_saida: e.target.value }))}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="status">Status</Label>
                <Select value={formData.status} onValueChange={(value: any) => setFormData(prev => ({ ...prev, status: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ativo">Ativo</SelectItem>
                    <SelectItem value="inativo">Inativo</SelectItem>
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
                  {editingInquilino ? 'Atualizar' : 'Criar'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {inquilinos?.map((inquilino) => (
          <Card key={inquilino.id}>
            <CardHeader>
              <CardTitle className="flex justify-between items-start">
                <div className="flex items-center space-x-2">
                  <User className="h-5 w-5" />
                  <span>{inquilino.nome}</span>
                </div>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" onClick={() => handleEdit(inquilino)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleDelete(inquilino.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <Badge variant={inquilino.status === 'ativo' ? 'default' : 'secondary'}>
                    {inquilino.status === 'ativo' ? 'Ativo' : 'Inativo'}
                  </Badge>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center space-x-2">
                    <Phone className="h-4 w-4 text-gray-500" />
                    <span>{inquilino.telefone}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Mail className="h-4 w-4 text-gray-500" />
                    <span>{inquilino.email}</span>
                  </div>
                </div>

                <div className="text-sm">
                  <p><strong>CPF:</strong> {inquilino.cpf}</p>
                  <p><strong>RG:</strong> {inquilino.rg}</p>
                  <p><strong>Entrada:</strong> {new Date(inquilino.data_entrada).toLocaleDateString('pt-BR')}</p>
                  {inquilino.data_saida && (
                    <p><strong>Saída:</strong> {new Date(inquilino.data_saida).toLocaleDateString('pt-BR')}</p>
                  )}
                </div>

                {inquilino.quartos && (
                  <div className="text-sm">
                    <p><strong>Quarto:</strong> {inquilino.quartos.nome}</p>
                    {inquilino.quartos.imoveis && (
                      <p><strong>Imóvel:</strong> {inquilino.quartos.imoveis.nome}</p>
                    )}
                  </div>
                )}

                {inquilino.observacoes && (
                  <p className="text-sm text-gray-600">{inquilino.observacoes}</p>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {inquilinos?.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">Nenhum inquilino cadastrado ainda.</p>
        </div>
      )}
    </div>
  );
};
