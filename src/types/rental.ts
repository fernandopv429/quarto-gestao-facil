
export interface Imovel {
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
  quartos: Quarto[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Quarto {
  id: string;
  imovelId: string;
  nome: string;
  valorMensal: number;
  status: 'disponivel' | 'ocupado' | 'manutencao';
  observacoes?: string;
  mobiliado: boolean;
  suite: boolean;
  inquilinoAtual?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Inquilino {
  id: string;
  nome: string;
  cpf: string;
  rg: string;
  telefone: string;
  email: string;
  quartoId: string;
  dataEntrada: Date;
  dataSaida?: Date;
  status: 'ativo' | 'inativo';
  observacoes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Cobranca {
  id: string;
  inquilinoId: string;
  quartoId: string;
  valor: number;
  valorOriginal: number;
  desconto?: number;
  mesReferencia: string; // YYYY-MM
  dataVencimento: Date;
  dataPagamento?: Date;
  status: 'pendente' | 'pago' | 'atrasado' | 'cancelado';
  metodoPagamento?: 'pix' | 'transferencia' | 'dinheiro' | 'cartao';
  pixId?: string;
  comprovantePagamento?: string;
  observacoes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Despesa {
  id: string;
  imovelId: string;
  tipo: 'agua' | 'luz' | 'gas' | 'internet' | 'manutencao' | 'limpeza' | 'outros';
  descricao: string;
  valor: number;
  data: Date;
  comprovante?: string;
  observacoes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Notificacao {
  id: string;
  tipo: 'vencimento' | 'pagamento_confirmado' | 'pagamento_atrasado';
  destinatario: string; // telefone ou email
  mensagem: string;
  dataEnvio: Date;
  status: 'enviado' | 'erro' | 'pendente';
  cobrancaId?: string;
  inquilinoId?: string;
}

export interface DashboardData {
  totalRecebidoMes: number;
  totalDespesasMes: number;
  lucroLiquido: number;
  quartosAlugados: number;
  quartosDisponiveis: number;
  inquilinosInadimplentes: number;
  receitaMensal: { mes: string; valor: number }[];
  despesaMensal: { mes: string; valor: number }[];
}

export interface PixPayment {
  txid: string;
  valor: number;
  chave: string;
  solicitacaoPagador: string;
  status: 'ativa' | 'concluida' | 'removida_pelo_usuario_recebedor';
  location: string;
  pixCopiaECola: string;
  qrCode: string;
}

export interface WhatsAppMessage {
  to: string;
  message: string;
  type: 'text' | 'image' | 'document';
  filename?: string;
  caption?: string;
}
