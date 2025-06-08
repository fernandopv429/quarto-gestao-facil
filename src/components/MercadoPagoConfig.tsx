
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { CreditCard, Key } from 'lucide-react';

interface MercadoPagoCredentials {
  publicKey: string;
  accessToken: string;
  webhookUrl?: string;
}

export const MercadoPagoConfig = () => {
  const [credentials, setCredentials] = useState<MercadoPagoCredentials>(() => {
    const stored = localStorage.getItem('mercadopago-credentials');
    return stored ? JSON.parse(stored) : {
      publicKey: '',
      accessToken: '',
      webhookUrl: ''
    };
  });

  const handleSave = () => {
    if (!credentials.publicKey || !credentials.accessToken) {
      toast.error('Por favor, preencha todas as credenciais obrigatórias');
      return;
    }

    localStorage.setItem('mercadopago-credentials', JSON.stringify(credentials));
    toast.success('Credenciais do Mercado Pago salvas com sucesso!');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <CreditCard className="h-5 w-5" />
          <span>Configurações do Mercado Pago</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="public-key">Chave Pública (Public Key)</Label>
          <Input
            id="public-key"
            value={credentials.publicKey}
            onChange={(e) => setCredentials(prev => ({ ...prev, publicKey: e.target.value }))}
            placeholder="TEST-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
          />
          <p className="text-sm text-gray-600 mt-1">
            Chave pública para processar pagamentos (começa com TEST- para ambiente de testes)
          </p>
        </div>

        <div>
          <Label htmlFor="access-token">Access Token</Label>
          <Input
            id="access-token"
            type="password"
            value={credentials.accessToken}
            onChange={(e) => setCredentials(prev => ({ ...prev, accessToken: e.target.value }))}
            placeholder="TEST-xxxxxxxxxxxxxxxx-xxxxxx-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx-xxxxxxxxx"
          />
          <p className="text-sm text-gray-600 mt-1">
            Token de acesso para criar preferências de pagamento
          </p>
        </div>

        <div>
          <Label htmlFor="webhook-url">URL do Webhook (Opcional)</Label>
          <Input
            id="webhook-url"
            value={credentials.webhookUrl}
            onChange={(e) => setCredentials(prev => ({ ...prev, webhookUrl: e.target.value }))}
            placeholder="https://seu-dominio.com/webhook/mercadopago"
          />
          <p className="text-sm text-gray-600 mt-1">
            URL para receber notificações de pagamento automaticamente
          </p>
        </div>

        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="font-semibold text-blue-800 mb-2">Como obter as credenciais:</h4>
          <ol className="text-sm text-blue-700 space-y-1">
            <li>1. Acesse sua conta no Mercado Pago</li>
            <li>2. Vá em "Seu negócio" → "Configurações" → "Credenciais"</li>
            <li>3. Copie a Public Key e o Access Token</li>
            <li>4. Para testes, use as credenciais que começam com "TEST-"</li>
          </ol>
        </div>

        <Button onClick={handleSave} className="w-full">
          <Key className="mr-2 h-4 w-4" />
          Salvar Credenciais
        </Button>
      </CardContent>
    </Card>
  );
};
