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
import { Plus, Edit, Trash2, Receipt, Calendar } from 'lucide-react';

interface Despesa {
  id: string;
  imovel_id: string;
  tipo: 'agua' | 'luz' | 'gas' | 'internet' | 'manutencao' | 'limpeza' | 'outros';
  descricao: string;
  valor: number;
  data: string;
  comprovante?: string;
  observacoes?: string;
  created_at: string;
  updated_at: string;
  imoveis?: { nome: string };
}

export const Despesas = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingDespesa, setEditingDespesa] = useState<Despesa | null>(null);
  const [formData, setFormData] = useState({
    imovel_id: '',
    tipo: 'outros' as 'agua' | 'luz' | 'gas' | 'internet' | 'manutencao' | 'limpeza' | 'outros',
    descricao: '',
    valor: '',
    data: '',
    comprovante: '',
    observacoes: ''
  });

  const queryClient = useQueryClient();

  const { data: despesas, isLoading } = useQuery({
    queryKey: ['despesas'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('despesas')
        .select(`
          *,
          imoveis (nome)
        `)
        .order('data', { ascending: false });
      
      if (error) throw error;
      return data as Despesa[];
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
        .from('despesas')
        .insert({
          imovel_id: data.imovel_id,
          tipo: data.tipo,
          descricao: data.descricao,
          valor: parseFloat(data.valor),
          data: data.data,
          comprovante: data.comprovante || null,
          observacoes: data.observacoes || null
        });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['despesas'] });
      setIsDialogOpen(false);
      resetForm();
      toast.success('Despesa criada com sucesso!');
    },
    onError: (error) => {
      toast.error('Erro ao criar despesa: ' + error.message);
    }
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: typeof formData }) => {
      const { error } = await supabase
        .from('despesas')
        .update({
          imovel_id: data.imovel_id,
          tipo: data.tipo,
          descricao: data.descricao,
          valor: parseFloat(data.valor),
          data: data.data,
          comprovante: data.comprovante || null,
          observacoes: data.observacoes || null
        })
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['despesas'] });
      setIsDialogOpen(false);
      setEditingDespesa(null);
      resetForm();
      toast.success('Despesa atualizada com sucesso!');
    },
    onError: (error) => {
      toast.error('Erro ao atualizar despesa: ' + error.message);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('despesas')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['despesas'] });
      toast.success('Despesa excluída com sucesso!');
    },
    onError: (error) => {
      toast.error('Erro ao excluir despesa: ' + error.message);
    }
  });

  const resetForm = () => {
    setFormData({
      imovel_id: '',
      tipo: 'outros',
      descricao: '',
      valor: '',
      data: '',
      comprovante: '',
      observacoes: ''
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingDespesa) {
      updateMutation.mutate({ id: editingDespesa.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleEdit = (despesa: Despesa) => {
    setEditingDespesa(despesa);
    setFormData({
      imovel_id: despesa.imovel_id,
      tipo: despesa.tipo,
      descricao: despesa.descricao,
      valor: despesa.valor.toString(),
      data: despesa.data,
      comprovante: despesa.comprovante || '',
      observacoes: despesa.observacoes || ''
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta despesa?')) {
      deleteMutation.mutate(id);
    }
  };

  const getTipoColor = (tipo: string) => {
    switch (tipo) {
      case 'agua': return 'bg-blue-100 text-blue-800';
      case 'luz': return 'bg-yellow-100 text-yellow-800';
      case 'gas': return 'bg-orange-100 text-orange-800';
      case 'internet': return 'bg-purple-100 text-purple-800';
      case 'manutencao': return 'bg-red-100 text-red-800';
      case 'limpeza': return 'bg-green-100 text-green-800';
      case 'outros': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTipoLabel = (tipo: string) => {
    switch (tipo) {
      case 'agua': return 'Água';
      case 'luz': return 'Luz';
      case 'gas': return 'Gás';
      case 'internet': return 'Internet';
      case 'manutencao': return 'Manutenção';
      case 'limpeza': return 'Limpeza';
      case 'outros': return 'Outros';
      default: return tipo;
    }
  };

  if (isLoading) {
    return <div className="flex justify-center p-8">Carregando...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Despesas</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => { setEditingDespesa(null); resetForm(); }}>
              <Plus className="mr-2 h-4 w-4" />
              Nova Despesa
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingDespesa ? 'Editar Despesa' : 'Nova Despesa'}
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
                  <Label htmlFor="tipo">Tipo</Label>
                  <Select value={formData.tipo} onValueChange={(value: 'agua' | 'luz' | 'gas' | 'internet' | 'manutencao' | 'limpeza' | 'outros') => setFormData(prev => ({ ...prev, tipo: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="agua">Água</SelectItem>
                      <SelectItem value="luz">Luz</SelectItem>
                      <SelectItem value="gas">Gás</SelectItem>
                      <SelectItem value="internet">Internet</SelectItem>
                      <SelectItem value="manutencao">Manutenção</SelectItem>
                      <SelectItem value="limpeza">Limpeza</SelectItem>
                      <SelectItem value="outros">Outros</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="valor">Valor (R$)</Label>
                  <Input
                    id="valor"
                    type="number"
                    step="0.01"
                    value={formData.valor}
                    onChange={(e) => setFormData(prev => ({ ...prev, valor: e.target.value }))}
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="descricao">Descrição</Label>
                <Input
                  id="descricao"
                  value={formData.descricao}
                  onChange={(e) => setFormData(prev => ({ ...prev, descricao: e.target.value }))}
                  required
                />
              </div>

              <div>
                <Label htmlFor="data">Data</Label>
                <Input
                  id="data"
                  type="date"
                  value={formData.data}
                  onChange={(e) => setFormData(prev => ({ ...prev, data: e.target.value }))}
                  required
                />
              </div>

              <div>
                <Label htmlFor="comprovante">URL do Comprovante (opcional)</Label>
                <Input
                  id="comprovante"
                  value={formData.comprovante}
                  onChange={(e) => setFormData(prev => ({ ...prev, comprovante: e.target.value }))}
                  placeholder="https://exemplo.com/comprovante.pdf"
                />
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
                  {editingDespesa ? 'Atualizar' : 'Criar'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {despesas?.map((despesa) => (
          <Card key={despesa.id}>
            <CardHeader>
              <CardTitle className="flex justify-between items-start">
                <div className="flex items-center space-x-2">
                  <Receipt className="h-5 w-5" />
                  <span className="text-sm">{despesa.descricao}</span>
                </div>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" onClick={() => handleEdit(despesa)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleDelete(despesa.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-lg text-red-600">
                    R$ {despesa.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                  <Badge className={getTipoColor(despesa.tipo)}>
                    {getTipoLabel(despesa.tipo)}
                  </Badge>
                </div>

                <div className="text-sm">
                  <p><strong>Imóvel:</strong> {despesa.imoveis?.nome}</p>
                </div>

                <div className="flex items-center space-x-2 text-sm">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span>{new Date(despesa.data).toLocaleDateString('pt-BR')}</span>
                </div>

                {despesa.comprovante && (
                  <div className="text-sm">
                    <a 
                      href={despesa.comprovante} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      Ver comprovante
                    </a>
                  </div>
                )}

                {despesa.observacoes && (
                  <p className="text-sm text-gray-600">{despesa.observacoes}</p>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {despesas?.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">Nenhuma despesa cadastrada ainda.</p>
        </div>
      )}
    </div>
  );
};
