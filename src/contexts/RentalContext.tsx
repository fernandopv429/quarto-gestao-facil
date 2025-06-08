
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Imovel, Quarto, Inquilino, Cobranca, Despesa, DashboardData } from '@/types/rental';

interface RentalContextType {
  imoveis: Imovel[];
  quartos: Quarto[];
  inquilinos: Inquilino[];
  cobrancas: Cobranca[];
  despesas: Despesa[];
  dashboardData: DashboardData | null;
  loading: boolean;
  
  // Ações
  addImovel: (imovel: Omit<Imovel, 'id' | 'createdAt' | 'updatedAt' | 'quartos'>) => void;
  updateImovel: (id: string, data: Partial<Imovel>) => void;
  deleteImovel: (id: string) => void;
  
  addQuarto: (quarto: Omit<Quarto, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateQuarto: (id: string, data: Partial<Quarto>) => void;
  deleteQuarto: (id: string) => void;
  
  addInquilino: (inquilino: Omit<Inquilino, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateInquilino: (id: string, data: Partial<Inquilino>) => void;
  deleteInquilino: (id: string) => void;
  
  addCobranca: (cobranca: Omit<Cobranca, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateCobranca: (id: string, data: Partial<Cobranca>) => void;
  
  addDespesa: (despesa: Omit<Despesa, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateDespesa: (id: string, data: Partial<Despesa>) => void;
  deleteDespesa: (id: string) => void;
  
  loadDashboardData: () => void;
}

const RentalContext = createContext<RentalContextType | undefined>(undefined);

export const useRental = () => {
  const context = useContext(RentalContext);
  if (!context) {
    throw new Error('useRental deve ser usado dentro de um RentalProvider');
  }
  return context;
};

// Dados mockados para demonstração
const mockData = {
  imoveis: [
    {
      id: '1',
      nome: 'Casa Vila Madalena',
      endereco: {
        rua: 'Rua Harmonia',
        numero: '123',
        bairro: 'Vila Madalena',
        cidade: 'São Paulo',
        cep: '05435-000',
        estado: 'SP'
      },
      foto: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
      quartos: [],
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ] as Imovel[],
  
  quartos: [
    {
      id: '1',
      imovelId: '1',
      nome: 'Quarto 1',
      valorMensal: 800,
      status: 'ocupado' as const,
      observacoes: 'Quarto amplo com varanda',
      mobiliado: true,
      suite: false,
      inquilinoAtual: '1',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: '2',
      imovelId: '1',
      nome: 'Quarto 2',
      valorMensal: 750,
      status: 'disponivel' as const,
      observacoes: 'Quarto com armário embutido',
      mobiliado: true,
      suite: false,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ] as Quarto[],
  
  inquilinos: [
    {
      id: '1',
      nome: 'João Silva',
      cpf: '123.456.789-00',
      rg: '12.345.678-9',
      telefone: '(11) 99999-9999',
      email: 'joao@email.com',
      quartoId: '1',
      dataEntrada: new Date('2024-01-01'),
      status: 'ativo' as const,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ] as Inquilino[],
  
  cobrancas: [
    {
      id: '1',
      inquilinoId: '1',
      quartoId: '1',
      valor: 800,
      valorOriginal: 800,
      mesReferencia: '2024-06',
      dataVencimento: new Date('2024-06-10'),
      status: 'pago' as const,
      metodoPagamento: 'pix' as const,
      dataPagamento: new Date('2024-06-08'),
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: '2',
      inquilinoId: '1',
      quartoId: '1',
      valor: 800,
      valorOriginal: 800,
      mesReferencia: '2024-07',
      dataVencimento: new Date('2024-07-10'),
      status: 'pendente' as const,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ] as Cobranca[],
  
  despesas: [
    {
      id: '1',
      imovelId: '1',
      tipo: 'luz' as const,
      descricao: 'Conta de energia elétrica',
      valor: 150,
      data: new Date('2024-06-15'),
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: '2',
      imovelId: '1',
      tipo: 'agua' as const,
      descricao: 'Conta de água',
      valor: 80,
      data: new Date('2024-06-20'),
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ] as Despesa[]
};

export const RentalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [imoveis, setImoveis] = useState<Imovel[]>(mockData.imoveis);
  const [quartos, setQuartos] = useState<Quarto[]>(mockData.quartos);
  const [inquilinos, setInquilinos] = useState<Inquilino[]>(mockData.inquilinos);
  const [cobrancas, setCobrancas] = useState<Cobranca[]>(mockData.cobrancas);
  const [despesas, setDespesas] = useState<Despesa[]>(mockData.despesas);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(false);

  const generateId = () => Math.random().toString(36).substr(2, 9);

  const addImovel = (imovelData: Omit<Imovel, 'id' | 'createdAt' | 'updatedAt' | 'quartos'>) => {
    const novoImovel: Imovel = {
      ...imovelData,
      id: generateId(),
      quartos: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };
    setImoveis(prev => [...prev, novoImovel]);
  };

  const updateImovel = (id: string, data: Partial<Imovel>) => {
    setImoveis(prev => prev.map(imovel => 
      imovel.id === id ? { ...imovel, ...data, updatedAt: new Date() } : imovel
    ));
  };

  const deleteImovel = (id: string) => {
    setImoveis(prev => prev.filter(imovel => imovel.id !== id));
    setQuartos(prev => prev.filter(quarto => quarto.imovelId !== id));
  };

  const addQuarto = (quartoData: Omit<Quarto, 'id' | 'createdAt' | 'updatedAt'>) => {
    const novoQuarto: Quarto = {
      ...quartoData,
      id: generateId(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    setQuartos(prev => [...prev, novoQuarto]);
  };

  const updateQuarto = (id: string, data: Partial<Quarto>) => {
    setQuartos(prev => prev.map(quarto => 
      quarto.id === id ? { ...quarto, ...data, updatedAt: new Date() } : quarto
    ));
  };

  const deleteQuarto = (id: string) => {
    setQuartos(prev => prev.filter(quarto => quarto.id !== id));
  };

  const addInquilino = (inquilinoData: Omit<Inquilino, 'id' | 'createdAt' | 'updatedAt'>) => {
    const novoInquilino: Inquilino = {
      ...inquilinoData,
      id: generateId(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    setInquilinos(prev => [...prev, novoInquilino]);
    
    // Atualizar status do quarto para ocupado
    updateQuarto(inquilinoData.quartoId, { 
      status: 'ocupado',
      inquilinoAtual: novoInquilino.id
    });
  };

  const updateInquilino = (id: string, data: Partial<Inquilino>) => {
    setInquilinos(prev => prev.map(inquilino => 
      inquilino.id === id ? { ...inquilino, ...data, updatedAt: new Date() } : inquilino
    ));
  };

  const deleteInquilino = (id: string) => {
    const inquilino = inquilinos.find(i => i.id === id);
    if (inquilino) {
      updateQuarto(inquilino.quartoId, { 
        status: 'disponivel',
        inquilinoAtual: undefined
      });
    }
    setInquilinos(prev => prev.filter(inquilino => inquilino.id !== id));
  };

  const addCobranca = (cobrancaData: Omit<Cobranca, 'id' | 'createdAt' | 'updatedAt'>) => {
    const novaCobranca: Cobranca = {
      ...cobrancaData,
      id: generateId(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    setCobrancas(prev => [...prev, novaCobranca]);
  };

  const updateCobranca = (id: string, data: Partial<Cobranca>) => {
    setCobrancas(prev => prev.map(cobranca => 
      cobranca.id === id ? { ...cobranca, ...data, updatedAt: new Date() } : cobranca
    ));
  };

  const addDespesa = (despesaData: Omit<Despesa, 'id' | 'createdAt' | 'updatedAt'>) => {
    const novaDespesa: Despesa = {
      ...despesaData,
      id: generateId(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    setDespesas(prev => [...prev, novaDespesa]);
  };

  const updateDespesa = (id: string, data: Partial<Despesa>) => {
    setDespesas(prev => prev.map(despesa => 
      despesa.id === id ? { ...despesa, ...data, updatedAt: new Date() } : despesa
    ));
  };

  const deleteDespesa = (id: string) => {
    setDespesas(prev => prev.filter(despesa => despesa.id !== id));
  };

  const loadDashboardData = () => {
    setLoading(true);
    
    // Simular carregamento de dados
    setTimeout(() => {
      const hoje = new Date();
      const mesAtual = hoje.getMonth();
      const anoAtual = hoje.getFullYear();
      
      const cobrancasMesAtual = cobrancas.filter(c => {
        const dataCobranca = new Date(c.dataVencimento);
        return dataCobranca.getMonth() === mesAtual && dataCobranca.getFullYear() === anoAtual;
      });
      
      const despesasMesAtual = despesas.filter(d => {
        const dataDespesa = new Date(d.data);
        return dataDespesa.getMonth() === mesAtual && dataDespesa.getFullYear() === anoAtual;
      });
      
      const totalRecebidoMes = cobrancasMesAtual
        .filter(c => c.status === 'pago')
        .reduce((total, c) => total + c.valor, 0);
      
      const totalDespesasMes = despesasMesAtual
        .reduce((total, d) => total + d.valor, 0);
      
      const lucroLiquido = totalRecebidoMes - totalDespesasMes;
      
      const quartosAlugados = quartos.filter(q => q.status === 'ocupado').length;
      const quartosDisponiveis = quartos.filter(q => q.status === 'disponivel').length;
      
      const inquilinosInadimplentes = cobrancas.filter(c => c.status === 'atrasado').length;
      
      // Dados dos últimos 6 meses para gráficos
      const receitaMensal = [];
      const despesaMensal = [];
      
      for (let i = 5; i >= 0; i--) {
        const data = new Date(anoAtual, mesAtual - i, 1);
        const mesAno = `${data.getFullYear()}-${(data.getMonth() + 1).toString().padStart(2, '0')}`;
        
        const receitaMes = cobrancas
          .filter(c => c.mesReferencia === mesAno && c.status === 'pago')
          .reduce((total, c) => total + c.valor, 0);
        
        const despesaMes = despesas
          .filter(d => {
            const dataDespesa = new Date(d.data);
            return dataDespesa.getMonth() === data.getMonth() && 
                   dataDespesa.getFullYear() === data.getFullYear();
          })
          .reduce((total, d) => total + d.valor, 0);
        
        receitaMensal.push({ mes: mesAno, valor: receitaMes });
        despesaMensal.push({ mes: mesAno, valor: despesaMes });
      }
      
      setDashboardData({
        totalRecebidoMes,
        totalDespesasMes,
        lucroLiquido,
        quartosAlugados,
        quartosDisponiveis,
        inquilinosInadimplentes,
        receitaMensal,
        despesaMensal
      });
      
      setLoading(false);
    }, 1000);
  };

  useEffect(() => {
    loadDashboardData();
  }, [cobrancas, despesas, quartos]);

  return (
    <RentalContext.Provider value={{
      imoveis,
      quartos,
      inquilinos,
      cobrancas,
      despesas,
      dashboardData,
      loading,
      addImovel,
      updateImovel,
      deleteImovel,
      addQuarto,
      updateQuarto,
      deleteQuarto,
      addInquilino,
      updateInquilino,
      deleteInquilino,
      addCobranca,
      updateCobranca,
      addDespesa,
      updateDespesa,
      deleteDespesa,
      loadDashboardData
    }}>
      {children}
    </RentalContext.Provider>
  );
};
