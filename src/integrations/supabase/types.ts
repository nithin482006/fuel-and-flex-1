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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      diary_entries: {
        Row: {
          calories: number
          carbs: number
          created_at: string
          entry_date: string
          fat: number
          fiber: number
          food_id: string | null
          food_name: string
          id: string
          is_favorite: boolean
          meal_type: string
          protein: number
          quantity: number
          serving_size: number
          serving_unit: string
          user_food_id: string | null
          user_id: string
        }
        Insert: {
          calories?: number
          carbs?: number
          created_at?: string
          entry_date?: string
          fat?: number
          fiber?: number
          food_id?: string | null
          food_name: string
          id?: string
          is_favorite?: boolean
          meal_type: string
          protein?: number
          quantity?: number
          serving_size?: number
          serving_unit?: string
          user_food_id?: string | null
          user_id: string
        }
        Update: {
          calories?: number
          carbs?: number
          created_at?: string
          entry_date?: string
          fat?: number
          fiber?: number
          food_id?: string | null
          food_name?: string
          id?: string
          is_favorite?: boolean
          meal_type?: string
          protein?: number
          quantity?: number
          serving_size?: number
          serving_unit?: string
          user_food_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "diary_entries_food_id_fkey"
            columns: ["food_id"]
            isOneToOne: false
            referencedRelation: "foods"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "diary_entries_user_food_id_fkey"
            columns: ["user_food_id"]
            isOneToOne: false
            referencedRelation: "user_foods"
            referencedColumns: ["id"]
          },
        ]
      }
      foods: {
        Row: {
          barcode: string | null
          brand: string | null
          calories: number
          carbs: number
          category: string
          created_at: string
          fat: number
          fiber: number
          id: string
          name: string
          protein: number
          serving_size: number
          serving_unit: string
          sodium: number | null
          sugar: number | null
        }
        Insert: {
          barcode?: string | null
          brand?: string | null
          calories?: number
          carbs?: number
          category: string
          created_at?: string
          fat?: number
          fiber?: number
          id?: string
          name: string
          protein?: number
          serving_size?: number
          serving_unit?: string
          sodium?: number | null
          sugar?: number | null
        }
        Update: {
          barcode?: string | null
          brand?: string | null
          calories?: number
          carbs?: number
          category?: string
          created_at?: string
          fat?: number
          fiber?: number
          id?: string
          name?: string
          protein?: number
          serving_size?: number
          serving_unit?: string
          sodium?: number | null
          sugar?: number | null
        }
        Relationships: []
      }
      nutrition_goals: {
        Row: {
          calorie_goal: number
          carb_goal: number
          created_at: string
          fat_goal: number
          fiber_goal: number
          goal_type: string
          id: string
          is_custom: boolean
          protein_goal: number
          updated_at: string
          user_id: string
          water_goal_ml: number
        }
        Insert: {
          calorie_goal?: number
          carb_goal?: number
          created_at?: string
          fat_goal?: number
          fiber_goal?: number
          goal_type?: string
          id?: string
          is_custom?: boolean
          protein_goal?: number
          updated_at?: string
          user_id: string
          water_goal_ml?: number
        }
        Update: {
          calorie_goal?: number
          carb_goal?: number
          created_at?: string
          fat_goal?: number
          fiber_goal?: number
          goal_type?: string
          id?: string
          is_custom?: boolean
          protein_goal?: number
          updated_at?: string
          user_id?: string
          water_goal_ml?: number
        }
        Relationships: []
      }
      profiles: {
        Row: {
          activity_level: string | null
          age: number | null
          bmi: number | null
          bmi_category: string | null
          created_at: string
          fitness_goal: string | null
          full_name: string | null
          gender: string | null
          height_cm: number | null
          id: string
          onboarding_completed: boolean
          starting_weight_kg: number | null
          target_weight: number | null
          target_weight_kg: number | null
          updated_at: string
          user_id: string
          weight_kg: number | null
        }
        Insert: {
          activity_level?: string | null
          age?: number | null
          bmi?: number | null
          bmi_category?: string | null
          created_at?: string
          fitness_goal?: string | null
          full_name?: string | null
          gender?: string | null
          height_cm?: number | null
          id?: string
          onboarding_completed?: boolean
          starting_weight_kg?: number | null
          target_weight?: number | null
          target_weight_kg?: number | null
          updated_at?: string
          user_id: string
          weight_kg?: number | null
        }
        Update: {
          activity_level?: string | null
          age?: number | null
          bmi?: number | null
          bmi_category?: string | null
          created_at?: string
          fitness_goal?: string | null
          full_name?: string | null
          gender?: string | null
          height_cm?: number | null
          id?: string
          onboarding_completed?: boolean
          starting_weight_kg?: number | null
          target_weight?: number | null
          target_weight_kg?: number | null
          updated_at?: string
          user_id?: string
          weight_kg?: number | null
        }
        Relationships: []
      }
      user_foods: {
        Row: {
          brand: string | null
          calories: number
          carbs: number
          category: string | null
          created_at: string
          fat: number
          fiber: number
          id: string
          is_favorite: boolean
          name: string
          protein: number
          serving_size: number
          serving_unit: string
          user_id: string
        }
        Insert: {
          brand?: string | null
          calories?: number
          carbs?: number
          category?: string | null
          created_at?: string
          fat?: number
          fiber?: number
          id?: string
          is_favorite?: boolean
          name: string
          protein?: number
          serving_size?: number
          serving_unit?: string
          user_id: string
        }
        Update: {
          brand?: string | null
          calories?: number
          carbs?: number
          category?: string | null
          created_at?: string
          fat?: number
          fiber?: number
          id?: string
          is_favorite?: boolean
          name?: string
          protein?: number
          serving_size?: number
          serving_unit?: string
          user_id?: string
        }
        Relationships: []
      }
      water_logs: {
        Row: {
          amount_ml: number
          created_at: string
          id: string
          log_date: string
          note: string | null
          user_id: string
        }
        Insert: {
          amount_ml: number
          created_at?: string
          id?: string
          log_date?: string
          note?: string | null
          user_id: string
        }
        Update: {
          amount_ml?: number
          created_at?: string
          id?: string
          log_date?: string
          note?: string | null
          user_id?: string
        }
        Relationships: []
      }
      weight_history: {
        Row: {
          bmi: number | null
          id: string
          recorded_at: string
          user_id: string
          weight_kg: number
        }
        Insert: {
          bmi?: number | null
          id?: string
          recorded_at?: string
          user_id: string
          weight_kg: number
        }
        Update: {
          bmi?: number | null
          id?: string
          recorded_at?: string
          user_id?: string
          weight_kg?: number
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
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
