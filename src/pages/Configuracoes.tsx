import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { Settings, Bell, Mail, Smartphone, Database, Shield, Download, Upload } from 'lucide-react';
import { MercadoPagoConfig } from '@/components/MercadoPagoConfig';

export const Configuracoes = () => {
  const [configs, setConfigs] = useState({
    empresa: {
      nome: 'RentControl',
      endereco: '',
      telefone: '',
      email: '',
      cnpj: ''
    },
    notificacoes: {
      emailVencimento: true,
      whatsappVencimento: true,
      emailPagamento: true,
      whatsappPagamento: true,
      diasAntesVencimento: 3
    },
    sistema: {
      backupAutomatico: true,
      intervaloDias: 7,
      manterHistorico: 365
    }
  });

  const handleSave = () => {
    localStorage.setItem('rentcontrol-configs', JSON.stringify(configs));
    toast.success('Configurações salvas com sucesso!');
  };

  const handleExportData = () => {
    const data = {
      exportDate: new Date().toISOString(),
      configs: configs,
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rentcontrol-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success('Dados exportados com sucesso!');
  };

  const handleImportData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        if (data.configs) {
          setConfigs(data.configs);
          toast.success('Dados importados com sucesso!');
        }
      } catch (error) {
        toast.error('Erro ao importar dados. Verifique o arquivo.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <Settings className="h-8 w-8" />
        <h1 className="text-3xl font-bold">Configurações</h1>
      </div>

      <Tabs defaultValue="empresa" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="empresa">Empresa</TabsTrigger>
          <TabsTrigger value="notificacoes">Notificações</TabsTrigger>
          <TabsTrigger value="pagamentos">Pagamentos</TabsTrigger>
          <TabsTrigger value="sistema">Sistema</TabsTrigger>
        </TabsList>

        <TabsContent value="empresa">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Database className="h-5 w-5" />
                <span>Informações da Empresa</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="nome-empresa">Nome da Empresa</Label>
                  <Input
                    id="nome-empresa"
                    value={configs.empresa.nome}
                    onChange={(e) => setConfigs(prev => ({
                      ...prev,
                      empresa: { ...prev.empresa, nome: e.target.value }
                    }))}
                  />
                </div>
                <div>
                  <Label htmlFor="cnpj">CNPJ</Label>
                  <Input
                    id="cnpj"
                    value={configs.empresa.cnpj}
                    onChange={(e) => setConfigs(prev => ({
                      ...prev,
                      empresa: { ...prev.empresa, cnpj: e.target.value }
                    }))}
                    placeholder="00.000.000/0000-00"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="endereco">Endereço</Label>
                <Textarea
                  id="endereco"
                  value={configs.empresa.endereco}
                  onChange={(e) => setConfigs(prev => ({
                    ...prev,
                    empresa: { ...prev.empresa, endereco: e.target.value }
                  }))}
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="telefone-empresa">Telefone</Label>
                  <Input
                    id="telefone-empresa"
                    value={configs.empresa.telefone}
                    onChange={(e) => setConfigs(prev => ({
                      ...prev,
                      empresa: { ...prev.empresa, telefone: e.target.value }
                    }))}
                    placeholder="(11) 99999-9999"
                  />
                </div>
                <div>
                  <Label htmlFor="email-empresa">Email</Label>
                  <Input
                    id="email-empresa"
                    type="email"
                    value={configs.empresa.email}
                    onChange={(e) => setConfigs(prev => ({
                      ...prev,
                      empresa: { ...prev.empresa, email: e.target.value }
                    }))}
                    placeholder="contato@empresa.com"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notificacoes">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Bell className="h-5 w-5" />
                <span>Notificações</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="dias-antes">Notificar quantos dias antes do vencimento</Label>
                <Input
                  id="dias-antes"
                  type="number"
                  value={configs.notificacoes.diasAntesVencimento}
                  onChange={(e) => setConfigs(prev => ({
                    ...prev,
                    notificacoes: { ...prev.notificacoes, diasAntesVencimento: parseInt(e.target.value) }
                  }))}
                  className="w-32"
                />
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="text-lg font-semibold flex items-center space-x-2">
                  <Mail className="h-4 w-4" />
                  <span>Notificações por Email</span>
                </h4>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="email-vencimento">Notificar vencimentos por email</Label>
                    <p className="text-sm text-gray-600">Enviar lembretes de vencimento para inquilinos</p>
                  </div>
                  <Switch
                    id="email-vencimento"
                    checked={configs.notificacoes.emailVencimento}
                    onCheckedChange={(checked) => setConfigs(prev => ({
                      ...prev,
                      notificacoes: { ...prev.notificacoes, emailVencimento: checked }
                    }))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="email-pagamento">Confirmar pagamentos por email</Label>
                    <p className="text-sm text-gray-600">Enviar confirmação de pagamento recebido</p>
                  </div>
                  <Switch
                    id="email-pagamento"
                    checked={configs.notificacoes.emailPagamento}
                    onCheckedChange={(checked) => setConfigs(prev => ({
                      ...prev,
                      notificacoes: { ...prev.notificacoes, emailPagamento: checked }
                    }))}
                  />
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="text-lg font-semibold flex items-center space-x-2">
                  <Smartphone className="h-4 w-4" />
                  <span>Notificações por WhatsApp</span>
                </h4>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="whatsapp-vencimento">Notificar vencimentos por WhatsApp</Label>
                    <p className="text-sm text-gray-600">Enviar lembretes de vencimento para inquilinos</p>
                  </div>
                  <Switch
                    id="whatsapp-vencimento"
                    checked={configs.notificacoes.whatsappVencimento}
                    onCheckedChange={(checked) => setConfigs(prev => ({
                      ...prev,
                      notificacoes: { ...prev.notificacoes, whatsappVencimento: checked }
                    }))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="whatsapp-pagamento">Confirmar pagamentos por WhatsApp</Label>
                    <p className="text-sm text-gray-600">Enviar confirmação de pagamento recebido</p>
                  </div>
                  <Switch
                    id="whatsapp-pagamento"
                    checked={configs.notificacoes.whatsappPagamento}
                    onCheckedChange={(checked) => setConfigs(prev => ({
                      ...prev,
                      notificacoes: { ...prev.notificacoes, whatsappPagamento: checked }
                    }))}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pagamentos">
          <MercadoPagoConfig />
        </TabsContent>

        <TabsContent value="sistema">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="h-5 w-5" />
                <span>Sistema e Backup</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="backup-automatico">Backup automático</Label>
                  <p className="text-sm text-gray-600">Realizar backup automático dos dados</p>
                </div>
                <Switch
                  id="backup-automatico"
                  checked={configs.sistema.backupAutomatico}
                  onCheckedChange={(checked) => setConfigs(prev => ({
                    ...prev,
                    sistema: { ...prev.sistema, backupAutomatico: checked }
                  }))}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="intervalo-backup">Intervalo do backup (dias)</Label>
                  <Input
                    id="intervalo-backup"
                    type="number"
                    value={configs.sistema.intervaloDias}
                    onChange={(e) => setConfigs(prev => ({
                      ...prev,
                      sistema: { ...prev.sistema, intervaloDias: parseInt(e.target.value) }
                    }))}
                  />
                </div>
                <div>
                  <Label htmlFor="manter-historico">Manter histórico (dias)</Label>
                  <Input
                    id="manter-historico"
                    type="number"
                    value={configs.sistema.manterHistorico}
                    onChange={(e) => setConfigs(prev => ({
                      ...prev,
                      sistema: { ...prev.sistema, manterHistorico: parseInt(e.target.value) }
                    }))}
                  />
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="text-lg font-semibold">Backup Manual</h4>
                
                <div className="flex space-x-4">
                  <Button onClick={handleExportData} className="flex items-center space-x-2">
                    <Download className="h-4 w-4" />
                    <span>Exportar Dados</span>
                  </Button>
                  
                  <div>
                    <input
                      type="file"
                      accept=".json"
                      onChange={handleImportData}
                      style={{ display: 'none' }}
                      id="import-file"
                    />
                    <Button 
                      variant="outline" 
                      onClick={() => document.getElementById('import-file')?.click()}
                      className="flex items-center space-x-2"
                    >
                      <Upload className="h-4 w-4" />
                      <span>Importar Dados</span>
                    </Button>
                  </div>
                </div>
                
                <p className="text-sm text-gray-600">
                  Use o backup para salvar seus dados ou restaurar de um backup anterior.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end">
        <Button onClick={handleSave} size="lg" className="flex items-center space-x-2">
          <Settings className="h-4 w-4" />
          <span>Salvar Configurações</span>
        </Button>
      </div>
    </div>
  );
};
