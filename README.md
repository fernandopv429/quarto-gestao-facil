
# RentControl - Sistema de Controle de Aluguel de Quartos

## 📋 Sobre o Projeto

O RentControl é um sistema completo para gerenciamento de aluguel de quartos, desenvolvido para proprietários que precisam organizar e controlar múltiplos imóveis, quartos, inquilinos e cobranças de forma eficiente.

## 🚀 Funcionalidades Implementadas

### ✅ Versão Atual (1.0)
- **Dashboard Completo** com métricas financeiras e gráficos
- **Estrutura de Dados** completa com TypeScript
- **Layout Responsivo** com Sidebar navegável
- **Sistema de Contexto** para gerenciamento de estado
- **Dados Mockados** para demonstração

### 🔄 Próximas Implementações

#### 1. **Gestão de Imóveis**
- Cadastro completo de imóveis
- Upload de fotos
- Edição e remoção
- Associação com quartos

#### 2. **Gestão de Quartos**
- Cadastro de quartos por imóvel
- Status: disponível/ocupado/manutenção
- Configurações (mobiliado, suíte, etc.)
- Controle de valores

#### 3. **Gestão de Inquilinos**
- Cadastro completo com documentos
- Histórico de aluguéis
- Dados de contato
- Associação com quartos

#### 4. **Sistema de Cobranças**
- Geração automática de cobranças mensais
- Integração com PIX (Gerencianet/MercadoPago)
- Upload de comprovantes
- Controle de status (pago/pendente/atrasado)
- Sistema de desconto por pontualidade

#### 5. **Controle de Despesas**
- Categorização de despesas por tipo
- Associação com imóveis específicos
- Upload de comprovantes
- Relatórios mensais

#### 6. **Sistema de Notificações**
- Avisos de vencimento via WhatsApp
- Confirmação de recebimento
- Lembretes personalizáveis
- Integração com Twilio/Z-API

#### 7. **Relatórios e Analytics**
- Relatórios financeiros mensais/anuais
- Exportação em PDF
- Gráficos de performance
- Análise de inadimplência

## 🛠️ Tecnologias Utilizadas

### Frontend
- **React 18** com TypeScript
- **Tailwind CSS** para estilização
- **Shadcn/UI** para componentes
- **Recharts** para gráficos
- **React Router** para navegação
- **Lucide React** para ícones

### Gerenciamento de Estado
- **React Context API**
- **React Hooks** (useState, useEffect, useContext)

### Futuras Integrações
- **Supabase** para backend e banco de dados
- **Gerencianet/MercadoPago** para PIX
- **Twilio/Z-API** para WhatsApp
- **jsPDF** para relatórios PDF

## 📊 Estrutura de Dados

### Principais Entidades

```typescript
interface Imovel {
  id: string;
  nome: string;
  endereco: Endereco;
  foto?: string;
  quartos: Quarto[];
}

interface Quarto {
  id: string;
  imovelId: string;
  nome: string;
  valorMensal: number;
  status: 'disponivel' | 'ocupado' | 'manutencao';
  mobiliado: boolean;
  suite: boolean;
}

interface Inquilino {
  id: string;
  nome: string;
  cpf: string;
  telefone: string;
  email: string;
  quartoId: string;
  dataEntrada: Date;
  status: 'ativo' | 'inativo';
}

interface Cobranca {
  id: string;
  inquilinoId: string;
  quartoId: string;
  valor: number;
  mesReferencia: string;
  dataVencimento: Date;
  status: 'pendente' | 'pago' | 'atrasado';
  metodoPagamento?: string;
}
```

## 🎨 Design System

### Cores Principais
- **Primary**: Azul (#0ea5e9)
- **Success**: Verde (#22c55e) para receitas
- **Warning**: Amarelo (#f59e0b) para alertas
- **Danger**: Vermelho (#ef4444) para despesas

### Componentes
- Layout responsivo com sidebar
- Cards com hover effects
- Gradientes e animações
- Badges para status
- Progress bars para métricas

## 📱 Responsividade

O sistema é totalmente responsivo, funcionando em:
- Desktop (1200px+)
- Tablet (768px - 1199px)
- Mobile (320px - 767px)

## 🔄 Fluxo de Trabalho

### 1. Dashboard
- Visão geral das métricas
- Gráficos de receita vs despesas
- Alertas de vencimentos
- Status de ocupação

### 2. Gestão
- Cadastro de imóveis e quartos
- Registro de inquilinos
- Criação de cobranças
- Controle de despesas

### 3. Financeiro
- Acompanhamento de pagamentos
- Geração de PIX
- Controle de inadimplência
- Relatórios financeiros

### 4. Comunicação
- Notificações automáticas
- Lembretes de vencimento
- Confirmações de pagamento

## 🚀 Como Executar

```bash
# Instalar dependências
npm install

# Executar em desenvolvimento
npm run dev

# Build para produção
npm run build
```

## 📋 Próximos Passos

1. **Implementar páginas de CRUD** para cada entidade
2. **Integrar com Supabase** para persistência de dados
3. **Adicionar sistema de autenticação**
4. **Implementar integrações de pagamento PIX**
5. **Adicionar sistema de notificações WhatsApp**
6. **Criar relatórios em PDF**
7. **Implementar upload de arquivos**
8. **Adicionar testes unitários**

## 📞 Integrações Planejadas

### PIX (Gerencianet)
```javascript
// Exemplo de integração PIX
const criarCobrancaPix = async (valor, descricao) => {
  const cobranca = await gerencianet.pixCreateCharge({
    calendario: { expiracao: 86400 },
    valor: { original: valor.toFixed(2) },
    chave: 'sua-chave-pix',
    solicitacaoPagador: descricao
  });
  return cobranca;
};
```

### WhatsApp (Z-API)
```javascript
// Exemplo de envio WhatsApp
const enviarNotificacao = async (telefone, mensagem) => {
  await fetch('https://api.z-api.io/instances/SUA_INSTANCIA/token/SEU_TOKEN/send-text', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      phone: telefone,
      message: mensagem
    })
  });
};
```

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo LICENSE para mais detalhes.

---

**RentControl** - Transformando a gestão de aluguéis em uma experiência simples e eficiente! 🏠✨
