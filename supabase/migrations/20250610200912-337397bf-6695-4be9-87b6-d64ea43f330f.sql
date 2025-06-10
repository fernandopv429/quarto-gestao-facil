
-- Criar enum para tipos de usuário
CREATE TYPE user_type AS ENUM ('admin', 'tenant', 'user');

-- Criar tabela de organizações (empresas que alugam o sistema)
CREATE TABLE public.organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  plan TEXT NOT NULL DEFAULT 'basic',
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Criar tabela de perfis de usuário
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_type user_type NOT NULL DEFAULT 'user',
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Habilitar RLS em todas as tabelas
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para organizations (apenas admins podem ver todas)
CREATE POLICY "Admins can view all organizations"
  ON public.organizations FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.user_type = 'admin'
    )
  );

CREATE POLICY "Admins can manage all organizations"
  ON public.organizations FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.user_type = 'admin'
    )
  );

-- Políticas RLS para profiles
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (id = auth.uid());

CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid()
      AND p.user_type = 'admin'
    )
  );

CREATE POLICY "Admins can manage all profiles"
  ON public.profiles FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid()
      AND p.user_type = 'admin'
    )
  );

-- Atualizar políticas RLS das tabelas existentes para incluir isolamento por organização
ALTER TABLE public.imoveis ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage their organization's imoveis" ON public.imoveis;
CREATE POLICY "Users can manage their organization's imoveis"
  ON public.imoveis FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND (
        profiles.user_type = 'admin' OR
        profiles.organization_id IN (
          SELECT p.organization_id FROM public.profiles p WHERE p.id = auth.uid()
        )
      )
    )
  );

ALTER TABLE public.quartos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage their organization's quartos" ON public.quartos;
CREATE POLICY "Users can manage their organization's quartos"
  ON public.quartos FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND (
        profiles.user_type = 'admin' OR
        profiles.organization_id IN (
          SELECT p.organization_id FROM public.profiles p WHERE p.id = auth.uid()
        )
      )
    )
  );

ALTER TABLE public.inquilinos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage their organization's inquilinos" ON public.inquilinos;
CREATE POLICY "Users can manage their organization's inquilinos"
  ON public.inquilinos FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND (
        profiles.user_type = 'admin' OR
        profiles.organization_id IN (
          SELECT p.organization_id FROM public.profiles p WHERE p.id = auth.uid()
        )
      )
    )
  );

ALTER TABLE public.cobrancas ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage their organization's cobrancas" ON public.cobrancas;
CREATE POLICY "Users can manage their organization's cobrancas"
  ON public.cobrancas FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND (
        profiles.user_type = 'admin' OR
        profiles.organization_id IN (
          SELECT p.organization_id FROM public.profiles p WHERE p.id = auth.uid()
        )
      )
    )
  );

ALTER TABLE public.despesas ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage their organization's despesas" ON public.despesas;
CREATE POLICY "Users can manage their organization's despesas"
  ON public.despesas FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND (
        profiles.user_type = 'admin' OR
        profiles.organization_id IN (
          SELECT p.organization_id FROM public.profiles p WHERE p.id = auth.uid()
        )
      )
    )
  );

ALTER TABLE public.notificacoes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage their organization's notificacoes" ON public.notificacoes;
CREATE POLICY "Users can manage their organization's notificacoes"
  ON public.notificacoes FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND (
        profiles.user_type = 'admin' OR
        profiles.organization_id IN (
          SELECT p.organization_id FROM public.profiles p WHERE p.id = auth.uid()
        )
      )
    )
  );

-- Adicionar organization_id às tabelas existentes para isolamento de dados
ALTER TABLE public.imoveis ADD COLUMN organization_id UUID REFERENCES public.organizations(id);
ALTER TABLE public.quartos ADD COLUMN organization_id UUID REFERENCES public.organizations(id);
ALTER TABLE public.inquilinos ADD COLUMN organization_id UUID REFERENCES public.organizations(id);
ALTER TABLE public.cobrancas ADD COLUMN organization_id UUID REFERENCES public.organizations(id);
ALTER TABLE public.despesas ADD COLUMN organization_id UUID REFERENCES public.organizations(id);
ALTER TABLE public.notificacoes ADD COLUMN organization_id UUID REFERENCES public.organizations(id);

-- Função para criar perfil automaticamente quando usuário se registra
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email, user_type)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.email,
    'user'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para criar perfil automaticamente
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_organizations_updated_at
    BEFORE UPDATE ON public.organizations
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
