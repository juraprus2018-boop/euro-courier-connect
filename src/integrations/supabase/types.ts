export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      aanvragen: {
        Row: {
          aflever_adres: string
          aflever_plaats: string
          aflever_postcode: string | null
          breedte_cm: number | null
          contact_bedrijf: string | null
          contact_email: string
          contact_naam: string
          contact_telefoon: string | null
          created_at: string
          datum: string | null
          gewicht_kg: number | null
          hoogte_cm: number | null
          id: string
          land_id: string | null
          lengte_cm: number | null
          omschrijving: string | null
          ophaal_adres: string
          ophaal_plaats: string
          ophaal_postcode: string | null
          opmerkingen: string | null
          route_id: string | null
          status: string
          tijd_voorkeur: string | null
          updated_at: string
          zending_type: string | null
        }
        Insert: {
          aflever_adres: string
          aflever_plaats: string
          aflever_postcode?: string | null
          breedte_cm?: number | null
          contact_bedrijf?: string | null
          contact_email: string
          contact_naam: string
          contact_telefoon?: string | null
          created_at?: string
          datum?: string | null
          gewicht_kg?: number | null
          hoogte_cm?: number | null
          id?: string
          land_id?: string | null
          lengte_cm?: number | null
          omschrijving?: string | null
          ophaal_adres: string
          ophaal_plaats: string
          ophaal_postcode?: string | null
          opmerkingen?: string | null
          route_id?: string | null
          status?: string
          tijd_voorkeur?: string | null
          updated_at?: string
          zending_type?: string | null
        }
        Update: {
          aflever_adres?: string
          aflever_plaats?: string
          aflever_postcode?: string | null
          breedte_cm?: number | null
          contact_bedrijf?: string | null
          contact_email?: string
          contact_naam?: string
          contact_telefoon?: string | null
          created_at?: string
          datum?: string | null
          gewicht_kg?: number | null
          hoogte_cm?: number | null
          id?: string
          land_id?: string | null
          lengte_cm?: number | null
          omschrijving?: string | null
          ophaal_adres?: string
          ophaal_plaats?: string
          ophaal_postcode?: string | null
          opmerkingen?: string | null
          route_id?: string | null
          status?: string
          tijd_voorkeur?: string | null
          updated_at?: string
          zending_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "aanvragen_land_id_fkey"
            columns: ["land_id"]
            isOneToOne: false
            referencedRelation: "landen"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "aanvragen_route_id_fkey"
            columns: ["route_id"]
            isOneToOne: false
            referencedRelation: "routes"
            referencedColumns: ["id"]
          },
        ]
      }
      admin_users: {
        Row: {
          created_at: string
          id: string
          role: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: string
          user_id?: string
        }
        Relationships: []
      }
      buitenland_steden: {
        Row: {
          created_at: string
          id: string
          land_id: string
          latitude: number | null
          longitude: number | null
          naam: string
          route_generatie_status: string
          slug: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          land_id: string
          latitude?: number | null
          longitude?: number | null
          naam: string
          route_generatie_status?: string
          slug: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          land_id?: string
          latitude?: number | null
          longitude?: number | null
          naam?: string
          route_generatie_status?: string
          slug?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "buitenland_steden_land_id_fkey"
            columns: ["land_id"]
            isOneToOne: false
            referencedRelation: "landen"
            referencedColumns: ["id"]
          },
        ]
      }
      instellingen: {
        Row: {
          beschrijving: string | null
          created_at: string
          id: string
          sleutel: string
          updated_at: string
          waarde: string
        }
        Insert: {
          beschrijving?: string | null
          created_at?: string
          id?: string
          sleutel: string
          updated_at?: string
          waarde: string
        }
        Update: {
          beschrijving?: string | null
          created_at?: string
          id?: string
          sleutel?: string
          updated_at?: string
          waarde?: string
        }
        Relationships: []
      }
      landen: {
        Row: {
          actief: boolean
          created_at: string
          domein: string | null
          faq: Json | null
          hero_afbeelding_url: string | null
          hero_subtitel: string | null
          hero_titel: string | null
          id: string
          km_tarief: number
          meta_description: string | null
          meta_title: string | null
          naam: string
          primary_color: string | null
          secondary_color: string | null
          slug: string
          sync_routes_enabled: boolean
          sync_routes_last_message: string | null
          sync_routes_last_run: string | null
          sync_routes_progress: number | null
          sync_routes_status: string | null
          sync_routes_total: number | null
          updated_at: string
        }
        Insert: {
          actief?: boolean
          created_at?: string
          domein?: string | null
          faq?: Json | null
          hero_afbeelding_url?: string | null
          hero_subtitel?: string | null
          hero_titel?: string | null
          id?: string
          km_tarief?: number
          meta_description?: string | null
          meta_title?: string | null
          naam: string
          primary_color?: string | null
          secondary_color?: string | null
          slug: string
          sync_routes_enabled?: boolean
          sync_routes_last_message?: string | null
          sync_routes_last_run?: string | null
          sync_routes_progress?: number | null
          sync_routes_status?: string | null
          sync_routes_total?: number | null
          updated_at?: string
        }
        Update: {
          actief?: boolean
          created_at?: string
          domein?: string | null
          faq?: Json | null
          hero_afbeelding_url?: string | null
          hero_subtitel?: string | null
          hero_titel?: string | null
          id?: string
          km_tarief?: number
          meta_description?: string | null
          meta_title?: string | null
          naam?: string
          primary_color?: string | null
          secondary_color?: string | null
          slug?: string
          sync_routes_enabled?: boolean
          sync_routes_last_message?: string | null
          sync_routes_last_run?: string | null
          sync_routes_progress?: number | null
          sync_routes_status?: string | null
          sync_routes_total?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      nl_plaatsen: {
        Row: {
          created_at: string
          gemeente: string | null
          id: string
          latitude: number | null
          longitude: number | null
          naam: string
          provincie: string | null
          slug: string
        }
        Insert: {
          created_at?: string
          gemeente?: string | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          naam: string
          provincie?: string | null
          slug: string
        }
        Update: {
          created_at?: string
          gemeente?: string | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          naam?: string
          provincie?: string | null
          slug?: string
        }
        Relationships: []
      }
      pagina_teksten: {
        Row: {
          created_at: string
          id: string
          inhoud: string | null
          land_id: string | null
          meta_description: string | null
          meta_title: string | null
          pagina_type: string
          subtitel: string | null
          titel: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          inhoud?: string | null
          land_id?: string | null
          meta_description?: string | null
          meta_title?: string | null
          pagina_type: string
          subtitel?: string | null
          titel?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          inhoud?: string | null
          land_id?: string | null
          meta_description?: string | null
          meta_title?: string | null
          pagina_type?: string
          subtitel?: string | null
          titel?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "pagina_teksten_land_id_fkey"
            columns: ["land_id"]
            isOneToOne: false
            referencedRelation: "landen"
            referencedColumns: ["id"]
          },
        ]
      }
      routes: {
        Row: {
          afstand_km: number
          buitenland_stad_id: string
          created_at: string
          geschatte_prijs: number
          id: string
          nl_plaats_id: string
          slug: string
        }
        Insert: {
          afstand_km: number
          buitenland_stad_id: string
          created_at?: string
          geschatte_prijs: number
          id?: string
          nl_plaats_id: string
          slug: string
        }
        Update: {
          afstand_km?: number
          buitenland_stad_id?: string
          created_at?: string
          geschatte_prijs?: number
          id?: string
          nl_plaats_id?: string
          slug?: string
        }
        Relationships: [
          {
            foreignKeyName: "routes_buitenland_stad_id_fkey"
            columns: ["buitenland_stad_id"]
            isOneToOne: false
            referencedRelation: "buitenland_steden"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "routes_nl_plaats_id_fkey"
            columns: ["nl_plaats_id"]
            isOneToOne: false
            referencedRelation: "nl_plaatsen"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_admin: { Args: { check_user_id: string }; Returns: boolean }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
