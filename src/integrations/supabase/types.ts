export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      cobrancas: {
        Row: {
          comprovante_pagamento: string | null
          created_at: string
          data_pagamento: string | null
          data_vencimento: string
          desconto: number | null
          id: string
          inquilino_id: string
          mes_referencia: string
          metodo_pagamento: string | null
          observacoes: string | null
          organization_id: string | null
          pix_id: string | null
          quarto_id: string
          status: string
          updated_at: string
          valor: number
          valor_original: number
        }
        Insert: {
          comprovante_pagamento?: string | null
          created_at?: string
          data_pagamento?: string | null
          data_vencimento: string
          desconto?: number | null
          id?: string
          inquilino_id: string
          mes_referencia: string
          metodo_pagamento?: string | null
          observacoes?: string | null
          organization_id?: string | null
          pix_id?: string | null
          quarto_id: string
          status: string
          updated_at?: string
          valor: number
          valor_original: number
        }
        Update: {
          comprovante_pagamento?: string | null
          created_at?: string
          data_pagamento?: string | null
          data_vencimento?: string
          desconto?: number | null
          id?: string
          inquilino_id?: string
          mes_referencia?: string
          metodo_pagamento?: string | null
          observacoes?: string | null
          organization_id?: string | null
          pix_id?: string | null
          quarto_id?: string
          status?: string
          updated_at?: string
          valor?: number
          valor_original?: number
        }
        Relationships: [
          {
            foreignKeyName: "cobrancas_inquilino_id_fkey"
            columns: ["inquilino_id"]
            isOneToOne: false
            referencedRelation: "inquilinos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cobrancas_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cobrancas_quarto_id_fkey"
            columns: ["quarto_id"]
            isOneToOne: false
            referencedRelation: "quartos"
            referencedColumns: ["id"]
          },
        ]
      }
      despesas: {
        Row: {
          comprovante: string | null
          created_at: string
          data: string
          descricao: string
          id: string
          imovel_id: string
          observacoes: string | null
          organization_id: string | null
          tipo: string
          updated_at: string
          valor: number
        }
        Insert: {
          comprovante?: string | null
          created_at?: string
          data: string
          descricao: string
          id?: string
          imovel_id: string
          observacoes?: string | null
          organization_id?: string | null
          tipo: string
          updated_at?: string
          valor: number
        }
        Update: {
          comprovante?: string | null
          created_at?: string
          data?: string
          descricao?: string
          id?: string
          imovel_id?: string
          observacoes?: string | null
          organization_id?: string | null
          tipo?: string
          updated_at?: string
          valor?: number
        }
        Relationships: [
          {
            foreignKeyName: "despesas_imovel_id_fkey"
            columns: ["imovel_id"]
            isOneToOne: false
            referencedRelation: "imoveis"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "despesas_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      imoveis: {
        Row: {
          created_at: string
          endereco: Json
          foto: string | null
          id: string
          nome: string
          organization_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          endereco: Json
          foto?: string | null
          id?: string
          nome: string
          organization_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          endereco?: Json
          foto?: string | null
          id?: string
          nome?: string
          organization_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "imoveis_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      inquilinos: {
        Row: {
          cpf: string
          created_at: string
          data_entrada: string
          data_saida: string | null
          email: string
          id: string
          nome: string
          observacoes: string | null
          organization_id: string | null
          quarto_id: string | null
          rg: string
          status: string
          telefone: string
          updated_at: string
        }
        Insert: {
          cpf: string
          created_at?: string
          data_entrada: string
          data_saida?: string | null
          email: string
          id?: string
          nome: string
          observacoes?: string | null
          organization_id?: string | null
          quarto_id?: string | null
          rg: string
          status: string
          telefone: string
          updated_at?: string
        }
        Update: {
          cpf?: string
          created_at?: string
          data_entrada?: string
          data_saida?: string | null
          email?: string
          id?: string
          nome?: string
          observacoes?: string | null
          organization_id?: string | null
          quarto_id?: string | null
          rg?: string
          status?: string
          telefone?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "inquilinos_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inquilinos_quarto_id_fkey"
            columns: ["quarto_id"]
            isOneToOne: false
            referencedRelation: "quartos"
            referencedColumns: ["id"]
          },
        ]
      }
      notificacoes: {
        Row: {
          cobranca_id: string | null
          data_envio: string
          destinatario: string
          id: string
          inquilino_id: string | null
          mensagem: string
          organization_id: string | null
          status: string
          tipo: string
        }
        Insert: {
          cobranca_id?: string | null
          data_envio?: string
          destinatario: string
          id?: string
          inquilino_id?: string | null
          mensagem: string
          organization_id?: string | null
          status: string
          tipo: string
        }
        Update: {
          cobranca_id?: string | null
          data_envio?: string
          destinatario?: string
          id?: string
          inquilino_id?: string | null
          mensagem?: string
          organization_id?: string | null
          status?: string
          tipo?: string
        }
        Relationships: [
          {
            foreignKeyName: "notificacoes_cobranca_id_fkey"
            columns: ["cobranca_id"]
            isOneToOne: false
            referencedRelation: "cobrancas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notificacoes_inquilino_id_fkey"
            columns: ["inquilino_id"]
            isOneToOne: false
            referencedRelation: "inquilinos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notificacoes_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          created_at: string | null
          email: string
          id: string
          name: string
          plan: string
          status: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: string
          name: string
          plan?: string
          status?: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          name?: string
          plan?: string
          status?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string | null
          email: string
          id: string
          name: string
          organization_id: string | null
          updated_at: string | null
          user_type: Database["public"]["Enums"]["user_type"]
        }
        Insert: {
          created_at?: string | null
          email: string
          id: string
          name: string
          organization_id?: string | null
          updated_at?: string | null
          user_type?: Database["public"]["Enums"]["user_type"]
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          name?: string
          organization_id?: string | null
          updated_at?: string | null
          user_type?: Database["public"]["Enums"]["user_type"]
        }
        Relationships: [
          {
            foreignKeyName: "profiles_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      quartos: {
        Row: {
          created_at: string
          id: string
          imovel_id: string
          inquilino_atual: string | null
          mobiliado: boolean | null
          nome: string
          observacoes: string | null
          organization_id: string | null
          status: string
          suite: boolean | null
          updated_at: string
          valor_mensal: number
        }
        Insert: {
          created_at?: string
          id?: string
          imovel_id: string
          inquilino_atual?: string | null
          mobiliado?: boolean | null
          nome: string
          observacoes?: string | null
          organization_id?: string | null
          status: string
          suite?: boolean | null
          updated_at?: string
          valor_mensal: number
        }
        Update: {
          created_at?: string
          id?: string
          imovel_id?: string
          inquilino_atual?: string | null
          mobiliado?: boolean | null
          nome?: string
          observacoes?: string | null
          organization_id?: string | null
          status?: string
          suite?: boolean | null
          updated_at?: string
          valor_mensal?: number
        }
        Relationships: [
          {
            foreignKeyName: "quartos_imovel_id_fkey"
            columns: ["imovel_id"]
            isOneToOne: false
            referencedRelation: "imoveis"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quartos_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      user_type: "admin" | "tenant" | "user"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      user_type: ["admin", "tenant", "user"],
    },
  },
} as const
