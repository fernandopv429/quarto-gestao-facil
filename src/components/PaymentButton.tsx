
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import { CreditCard, ExternalLink, RefreshCw } from 'lucide-react';
import { mercadoPagoService } from '@/services/mercadoPagoService';

interface PaymentButtonProps {
  cobrancaId: string;
  valor: number;
  descricao: string;
  inquilino: {
    nome: string;
    email: string;
  };
  onPaymentStatusChange?: (status: string) => void;
}

export const PaymentButton: React.FC<PaymentButtonProps> = ({
  cobrancaId,
  valor,
  descricao,
  inquilino,
  onPaymentStatusChange
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [paymentLink, setPaymentLink] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const createPaymentLink = async () => {
    if (!mercadoPagoService.isConfigured()) {
      toast.error('Mercado Pago não configurado. Verifique as credenciais nas configurações.');
      return;
    }

    setIsLoading(true);
    try {
      const preference = await mercadoPagoService.createPaymentPreference(
        cobrancaId,
        valor,
        descricao,
        inquilino
      );

      if (preference) {
        setPaymentLink(preference.init_point);
        setIsDialogOpen(true);
        toast.success('Link de pagamento criado com sucesso!');
      }
    } catch (error) {
      console.error('Erro ao criar link de pagamento:', error);
      toast.error('Erro ao criar link de pagamento. Verifique as credenciais.');
    } finally {
      setIsLoading(false);
    }
  };

  const checkPaymentStatus = async () => {
    if (!mercadoPagoService.isConfigured()) return;

    try {
      const payments = await mercadoPagoService.searchPaymentsByExternalReference(cobrancaId);
      
      if (payments.length > 0) {
        const latestPayment = payments[0];
        
        if (latestPayment.status === 'approved') {
          toast.success('Pagamento confirmado!');
          onPaymentStatusChange?.('pago');
        } else if (latestPayment.status === 'pending') {
          toast.info('Pagamento pendente');
          onPaymentStatusChange?.('pendente');
        } else if (latestPayment.status === 'rejected') {
          toast.error('Pagamento rejeitado');
          onPaymentStatusChange?.('cancelado');
        }
      }
    } catch (error) {
      console.error('Erro ao verificar status:', error);
      toast.error('Erro ao verificar status do pagamento');
    }
  };

  const openPaymentLink = () => {
    if (paymentLink) {
      window.open(paymentLink, '_blank');
    }
  };

  if (!mercadoPagoService.isConfigured()) {
    return (
      <Button variant="outline" disabled>
        <CreditCard className="mr-2 h-4 w-4" />
        MP não configurado
      </Button>
    );
  }

  return (
    <>
      <div className="flex space-x-2">
        <Button onClick={createPaymentLink} disabled={isLoading}>
          <CreditCard className="mr-2 h-4 w-4" />
          {isLoading ? 'Gerando...' : 'Gerar Pagamento'}
        </Button>
        
        <Button variant="outline" onClick={checkPaymentStatus}>
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Link de Pagamento Criado</DialogTitle>
          </DialogHeader>
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600">Valor:</p>
                  <p className="font-semibold">R$ {valor.toFixed(2)}</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-600">Descrição:</p>
                  <p>{descricao}</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-600">Inquilino:</p>
                  <p>{inquilino.nome} ({inquilino.email})</p>
                </div>
                
                <Button onClick={openPaymentLink} className="w-full">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Abrir Link de Pagamento
                </Button>
                
                <p className="text-xs text-gray-500 text-center">
                  O inquilino pode usar este link para efetuar o pagamento
                </p>
              </div>
            </CardContent>
          </Card>
        </DialogContent>
      </Dialog>
    </>
  );
};
