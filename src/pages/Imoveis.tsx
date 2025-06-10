
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Plus, Edit, Trash2, MapPin } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface ImovelLocal {
  id: string;
  nome: string;
  endereco: {
    rua: string;
    numero: string;
    bairro: string;
    cidade: string;
    cep: string;
    estado: string;
  };
  foto?: string;
  organization_id?: string;
  created_at: string;
  updated_at: string;
}

export const Imoveis = () => {
  const { profile } = useAuth();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingImovel, setEditingImovel] = useState<ImovelLocal | null>(null);
  const [formData, setFormData] = useState({
    nome: '',
    rua: '',
    numero: '',
    bairro: '',
    cidade: '',
    cep: '',
    estado: '',
    foto: ''
  });

  const queryClient = useQueryClient();

  const { data: imoveis, isLoading } = useQuery({
    queryKey: ['imoveis'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('imoveis')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // Converter os dados do Supabase para o formato local
      return data.map(item => ({
        ...item,
        endereco: item.endereco as {
          rua: string;
          numero: string;
          bairro: string;
          cidade: string;
          cep: string;
          estado: string;
        }
      })) as ImovelLocal[];
    }
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const { error } = await supabase
        .from('imoveis')
        .insert({
          nome: data.nome,
          endereco: {
            rua: data.rua,
            numero: data.numero,
            bairro: data.bairro,
            cidade: data.cidade,
            cep: data.cep,
            estado: data.estado
          },
          foto: data.foto || null,
          organization_id: profile?.organization_id
        });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['imoveis'] });
      setIsDialogOpen(false);
      resetForm();
      toast.success('Imóvel criado com sucesso!');
    },
    onError: (error) => {
      toast.error('Erro ao criar imóvel: ' + error.message);
    }
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: typeof formData }) => {
      const { error } = await supabase
        .from('imoveis')
        .update({
          nome: data.nome,
          endereco: {
            rua: data.rua,
            numero: data.numero,
            bairro: data.bairro,
            cidade: data.cidade,
            cep: data.cep,
            estado: data.estado
          },
          foto: data.foto || null
        })
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['imoveis'] });
      setIsDialogOpen(false);
      setEditingImovel(null);
      resetForm();
      toast.success('Imóvel atualizado com sucesso!');
    },
    onError: (error) => {
      toast.error('Erro ao atualizar imóvel: ' + error.message);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('imoveis')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['imoveis'] });
      toast.success('Imóvel excluído com sucesso!');
    },
    onError: (error) => {
      toast.error('Erro ao excluir imóvel: ' + error.message);
    }
  });

  const resetForm = () => {
    setFormData({
      nome: '',
      rua: '',
      numero: '',
      bairro: '',
      cidade: '',
      cep: '',
      estado: '',
      foto: ''
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingImovel) {
      updateMutation.mutate({ id: editingImovel.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleEdit = (imovel: ImovelLocal) => {
    setEditingImovel(imovel);
    setFormData({
      nome: imovel.nome,
      rua: imovel.endereco.rua,
      numero: imovel.endereco.numero,
      bairro: imovel.endereco.bairro,
      cidade: imovel.endereco.cidade,
      cep: imovel.endereco.cep,
      estado: imovel.endereco.estado,
      foto: imovel.foto || ''
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja excluir este imóvel?')) {
      deleteMutation.mutate(id);
    }
  };

  if (isLoading) {
    return <div className="flex justify-center p-8">Carregando...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Imóveis</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => { setEditingImovel(null); resetForm(); }}>
              <Plus className="mr-2 h-4 w-4" />
              Novo Imóvel
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingImovel ? 'Editar Imóvel' : 'Novo Imóvel'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="nome">Nome do Imóvel</Label>
                <Input
                  id="nome"
                  value={formData.nome}
                  onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="rua">Rua</Label>
                  <Input
                    id="rua"
                    value={formData.rua}
                    onChange={(e) => setFormData(prev => ({ ...prev, rua: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="numero">Número</Label>
                  <Input
                    id="numero"
                    value={formData.numero}
                    onChange={(e) => setFormData(prev => ({ ...prev, numero: e.target.value }))}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="bairro">Bairro</Label>
                  <Input
                    id="bairro"
                    value={formData.bairro}
                    onChange={(e) => setFormData(prev => ({ ...prev, bairro: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="cidade">Cidade</Label>
                  <Input
                    id="cidade"
                    value={formData.cidade}
                    onChange={(e) => setFormData(prev => ({ ...prev, cidade: e.target.value }))}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="cep">CEP</Label>
                  <Input
                    id="cep"
                    value={formData.cep}
                    onChange={(e) => setFormData(prev => ({ ...prev, cep: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="estado">Estado</Label>
                  <Input
                    id="estado"
                    value={formData.estado}
                    onChange={(e) => setFormData(prev => ({ ...prev, estado: e.target.value }))}
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="foto">URL da Foto (opcional)</Label>
                <Input
                  id="foto"
                  value={formData.foto}
                  onChange={(e) => setFormData(prev => ({ ...prev, foto: e.target.value }))}
                  placeholder="https://exemplo.com/foto.jpg"
                />
              </div>

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                  {editingImovel ? 'Atualizar' : 'Criar'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {imoveis?.map((imovel) => (
          <Card key={imovel.id}>
            <CardHeader>
              <CardTitle className="flex justify-between items-start">
                <span>{imovel.nome}</span>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" onClick={() => handleEdit(imovel)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleDelete(imovel.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {imovel.foto && (
                <img src={imovel.foto} alt={imovel.nome} className="w-full h-32 object-cover rounded mb-4" />
              )}
              <div className="flex items-start space-x-2">
                <MapPin className="h-4 w-4 mt-1 text-gray-500" />
                <div className="text-sm text-gray-600">
                  <p>{imovel.endereco.rua}, {imovel.endereco.numero}</p>
                  <p>{imovel.endereco.bairro}</p>
                  <p>{imovel.endereco.cidade}, {imovel.endereco.estado}</p>
                  <p>CEP: {imovel.endereco.cep}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {imoveis?.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">Nenhum imóvel cadastrado ainda.</p>
        </div>
      )}
    </div>
  );
};
