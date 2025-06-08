
interface MercadoPagoCredentials {
  publicKey: string;
  accessToken: string;
  webhookUrl?: string;
}

interface PaymentPreference {
  items: Array<{
    title: string;
    quantity: number;
    unit_price: number;
    currency_id: string;
  }>;
  payer: {
    name: string;
    email: string;
  };
  external_reference: string;
  notification_url?: string;
  back_urls: {
    success: string;
    failure: string;
    pending: string;
  };
  auto_return: string;
}

interface PaymentStatus {
  id: string;
  status: 'pending' | 'approved' | 'authorized' | 'in_process' | 'in_mediation' | 'rejected' | 'cancelled' | 'refunded' | 'charged_back';
  status_detail: string;
  external_reference: string;
  transaction_amount: number;
  date_approved?: string;
  payment_method_id: string;
}

class MercadoPagoService {
  private getCredentials(): MercadoPagoCredentials | null {
    const stored = localStorage.getItem('mercadopago-credentials');
    if (!stored) return null;
    
    const credentials = JSON.parse(stored);
    if (!credentials.publicKey || !credentials.accessToken) return null;
    
    return credentials;
  }

  async createPaymentPreference(
    cobrancaId: string,
    valor: number,
    descricao: string,
    inquilino: { nome: string; email: string }
  ): Promise<{ init_point: string; id: string } | null> {
    const credentials = this.getCredentials();
    if (!credentials) {
      throw new Error('Credenciais do Mercado Pago não configuradas');
    }

    const baseUrl = window.location.origin;
    
    const preference: PaymentPreference = {
      items: [
        {
          title: descricao,
          quantity: 1,
          unit_price: valor,
          currency_id: 'BRL'
        }
      ],
      payer: {
        name: inquilino.nome,
        email: inquilino.email
      },
      external_reference: cobrancaId,
      notification_url: credentials.webhookUrl,
      back_urls: {
        success: `${baseUrl}/pagamento/sucesso`,
        failure: `${baseUrl}/pagamento/falha`,
        pending: `${baseUrl}/pagamento/pendente`
      },
      auto_return: 'approved'
    };

    try {
      const response = await fetch('https://api.mercadopago.com/checkout/preferences', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${credentials.accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(preference)
      });

      if (!response.ok) {
        throw new Error(`Erro na API do Mercado Pago: ${response.status}`);
      }

      const result = await response.json();
      return {
        init_point: result.init_point,
        id: result.id
      };
    } catch (error) {
      console.error('Erro ao criar preferência de pagamento:', error);
      throw error;
    }
  }

  async getPaymentStatus(paymentId: string): Promise<PaymentStatus | null> {
    const credentials = this.getCredentials();
    if (!credentials) {
      throw new Error('Credenciais do Mercado Pago não configuradas');
    }

    try {
      const response = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${credentials.accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Erro na API do Mercado Pago: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Erro ao buscar status do pagamento:', error);
      throw error;
    }
  }

  async searchPaymentsByExternalReference(externalReference: string): Promise<PaymentStatus[]> {
    const credentials = this.getCredentials();
    if (!credentials) {
      throw new Error('Credenciais do Mercado Pago não configuradas');
    }

    try {
      const response = await fetch(
        `https://api.mercadopago.com/v1/payments/search?external_reference=${externalReference}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${credentials.accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) {
        throw new Error(`Erro na API do Mercado Pago: ${response.status}`);
      }

      const result = await response.json();
      return result.results || [];
    } catch (error) {
      console.error('Erro ao buscar pagamentos:', error);
      throw error;
    }
  }

  isConfigured(): boolean {
    return this.getCredentials() !== null;
  }
}

export const mercadoPagoService = new MercadoPagoService();
