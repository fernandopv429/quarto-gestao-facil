
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
import { Plus, Edit, Trash2, MessageSquare, Send, AlertCircle, CheckCircle, Clock } from 'lucide-react';

interface Notificacao {
  id: string;
  tipo: 'vencimento' | 'pagamento_confirmado' | 'pagamento_atrasado';
  destinatario: string;
  mensagem: string;
  data_envio: string;
  status: 'enviado' | 'erro' | 'pendente';
  cobranca_id?: string;
  inquilino_id?: string;
  inquilinos?: { nome: string };
  cobrancas?: { mes_referencia: string; valor: number };
}

export const Notificacoes = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingNotificacao, setEditingNotificacao] = useState<Notificacao | null>(null);
  const [formData, setFormData] = useState({
    tipo: 'vencimento' as const,
    destinatario: '',
    mensagem: '',
    status: 'pendente' as const,
    cobranca_id: '',
    inquilino_id: ''
  });

  const queryClient = useQueryClient();

  const { data: notificacoes, isLoading } = useQuery({
    queryKey: ['notificacoes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('notificacoes')
        .select(`
          *,
          inquilinos (nome),
          cobrancas (mes_referencia, valor)
        `)
        .order('data_envio', { ascending: false });
      
      if (error) throw error;
      return data as Notificacao[];
    }
  });

  const { data: inquilinos } = useQuery({
    queryKey: ['inquilinos-select'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('inquilinos')
        .select('id, nome, telefone, email')
        .eq('status', 'ativo')
        .order('nome');
      
      if (error) throw error;
      return data;
    }
  });

  const { data: cobrancas } = useQuery({
    queryKey: ['cobrancas-select'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cobrancas')
        .select(`
          id, 
          mes_referencia, 
          valor,
          inquilinos (nome)
        `)
        .order('mes_referencia', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const { error } = await supabase
        .from('notificacoes')
        .insert({
          tipo: data.tipo,
          destinatario: data.destinatario,
          mensagem: data.mensagem,
          status: data.status,
          cobranca_id: data.cobranca_id || null,
          inquilino_id: data.inquilino_id || null
        });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notificacoes'] });
      setIsDialogOpen(false);
      resetForm();
      toast.success('Notificação criada com sucesso!');
    },
    onError: (error) => {
      toast.error('Erro ao criar notificação: ' + error.message);
    }
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: typeof formData }) => {
      const { error } = await supabase
        .from('notificacoes')
        .update({
          tipo: data.tipo,
          destinatario: data.destinatario,
          mensagem: data.mensagem,
          status: data.status,
          cobranca_id: data.cobranca_id || null,
          inquilino_id: data.inquilino_id || null
        })
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notificacoes'] });
      setIsDialogOpen(false);
      setEditingNotificacao(null);
      resetForm();
      toast.success('Notificação atualizada com sucesso!');
    },
    onError: (error) => {
      toast.error('Erro ao atualizar notificação: ' + error.message);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('notificacoes')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notificacoes'] });
      toast.success('Notificação excluída com sucesso!');
    },
    onError: (error) => {
      toast.error('Erro ao excluir notificação: ' + error.message);
    }
  });

  const resetForm = () => {
    setFormData({
      tipo: 'vencimento',
      destinatario: '',
      mensagem: '',
      status: 'pendente',
      cobranca_id: '',
      inquilino_id: ''
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingNotificacao) {
      updateMutation.mutate({ id: editingNotificacao.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleEdit = (notificacao: Notificacao) => {
    setEditingNotificacao(notificacao);
    setFormData({
      tipo: notificacao.tipo,
      destinatario: notificacao.destinatario,
      mensagem: notificacao.mensagem,
      status: notificacao.status,
      cobranca_id: notificacao.cobranca_id || '',
      inquilino_id: notificacao.inquilino_id || ''
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta notificação?')) {
      deleteMutation.mutate(id);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'enviado': return <CheckCircle className="h-4 w-4" />;
      case 'erro': return <AlertCircle className="h-4 w-4" />;
      case 'pendente': return <Clock className="h-4 w-4" />;
      default: return <MessageSquare className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'enviado': return 'bg-green-100 text-green-800';
      case 'erro': return 'bg-red-100 text-red-800';
      case 'pendente': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'enviado': return 'Enviado';
      case 'erro': return 'Erro';
      case 'pendente': return 'Pendente';
      default: return status;
    }
  };

  const getTipoColor = (tipo: string) => {
    switch (tipo) {
      case 'vencimento': return 'bg-orange-100 text-orange-800';
      case 'pagamento_confirmado': return 'bg-green-100 text-green-800';
      case 'pagamento_atrasado': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTipoLabel = (tipo: string) => {
    switch (tipo) {
      case 'vencimento': return 'Vencimento';
      case 'pagamento_confirmado': return 'Pagamento Confirmado';
      case 'pagamento_atrasado': return 'Pagamento Atrasado';
      default: return tipo;
    }
  };

  if (isLoading) {
    return <div className="flex justify-center p-8">Carregando...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Notificações</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => { setEditingNotificacao(null); resetForm(); }}>
              <Plus className="mr-2 h-4 w-4" />
              Nova Notificação
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingNotificacao ? 'Editar Notificação' : 'Nova Notificação'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="tipo">Tipo</Label>
                  <Select value={formData.tipo} onValueChange={(value: any) => setFormData(prev => ({ ...prev, tipo: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="vencimento">Vencimento</SelectItem>
                      <SelectItem value="pagamento_confirmado">Pagamento Confirmado</SelectItem>
                      <SelectItem value="pagamento_atrasado">Pagamento Atrasado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select value={formData.status} onValueChange={(value: any) => setFormData(prev => ({ ...prev, status: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pendente">Pendente</SelectItem>
                      <SelectItem value="enviado">Enviado</SelectItem>
                      <SelectItem value="erro">Erro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="destinatario">Destinatário (telefone ou email)</Label>
                <Input
                  id="destinatario"
                  value={formData.destinatario}
                  onChange={(e) => setFormData(prev => ({ ...prev, destinatario: e.target.value }))}
                  placeholder="(11) 99999-9999 ou email@exemplo.com"
                  required
                />
              </div>

              <div>
                <Label htmlFor="inquilino_id">Inquilino (opcional)</Label>
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
                <Label htmlFor="cobranca_id">Cobrança relacionada (opcional)</Label>
                <Select value={formData.cobranca_id} onValueChange={(value) => setFormData(prev => ({ ...prev, cobranca_id: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma cobrança" />
                  </SelectTrigger>
                  <SelectContent>
                    {cobrancas?.map((cobranca) => (
                      <SelectItem key={cobranca.id} value={cobranca.id}>
                        {cobranca.mes_referencia} - R$ {cobranca.valor.toFixed(2)} - {cobranca.inquilinos?.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="mensagem">Mensagem</Label>
                <Textarea
                  id="mensagem"
                  value={formData.mensagem}
                  onChange={(e) => setFormData(prev => ({ ...prev, mensagem: e.target.value }))}
                  rows={4}
                  required
                />
              </div>

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                  {editingNotificacao ? 'Atualizar' : 'Criar'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {notificacoes?.map((notificacao) => (
          <Card key={notificacao.id}>
            <CardHeader>
              <CardTitle className="flex justify-between items-start">
                <div className="flex items-center space-x-2">
                  <MessageSquare className="h-5 w-5" />
                  <span className="text-sm">{notificacao.destinatario}</span>
                </div>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" onClick={() => handleEdit(notificacao)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleDelete(notificacao.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <Badge className={getTipoColor(notificacao.tipo)}>
                    {getTipoLabel(notificacao.tipo)}
                  </Badge>
                  <Badge className={getStatusColor(notificacao.status)}>
                    <div className="flex items-center space-x-1">
                      {getStatusIcon(notificacao.status)}
                      <span>{getStatusLabel(notificacao.status)}</span>
                    </div>
                  </Badge>
                </div>

                {notificacao.inquilinos && (
                  <div className="text-sm">
                    <p><strong>Inquilino:</strong> {notificacao.inquilinos.nome}</p>
                  </div>
                )}

                {notificacao.cobrancas && (
                  <div className="text-sm">
                    <p><strong>Cobrança:</strong> {notificacao.cobrancas.mes_referencia}</p>
                    <p><strong>Valor:</strong> R$ {notificacao.cobrancas.valor.toFixed(2)}</p>
                  </div>
                )}

                <div className="text-sm">
                  <p><strong>Data de envio:</strong> {new Date(notificacao.data_envio).toLocaleString('pt-BR')}</p>
                </div>

                <div className="text-sm bg-gray-50 p-3 rounded">
                  <p className="font-medium">Mensagem:</p>
                  <p className="mt-1">{notificacao.mensagem}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {notificacoes?.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">Nenhuma notificação cadastrada ainda.</p>
        </div>
      )}
    </div>
  );
};
