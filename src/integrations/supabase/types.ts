export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5";
  };
  public: {
    Tables: {
      eco_point_transactions: {
        Row: {
          created_at: string;
          handover_id: string | null;
          id: string;
          item_id: string | null;
          points: number;
          reason: string | null;
          status: Database["public"]["Enums"]["transaction_status"];
          transaction_type: Database["public"]["Enums"]["transaction_type"];
          user_id: string;
        };
        Insert: {
          created_at?: string;
          handover_id?: string | null;
          id?: string;
          item_id?: string | null;
          points: number;
          reason?: string | null;
          status?: Database["public"]["Enums"]["transaction_status"];
          transaction_type?: Database["public"]["Enums"]["transaction_type"];
          user_id: string;
        };
        Update: {
          created_at?: string;
          handover_id?: string | null;
          id?: string;
          item_id?: string | null;
          points?: number;
          reason?: string | null;
          status?: Database["public"]["Enums"]["transaction_status"];
          transaction_type?: Database["public"]["Enums"]["transaction_type"];
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "eco_point_transactions_handover_id_fkey";
            columns: ["handover_id"];
            isOneToOne: false;
            referencedRelation: "handovers";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "eco_point_transactions_handover_id_fkey";
            columns: ["handover_id"];
            isOneToOne: false;
            referencedRelation: "handovers_my";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "eco_point_transactions_item_id_fkey";
            columns: ["item_id"];
            isOneToOne: false;
            referencedRelation: "items";
            referencedColumns: ["id"];
          },
        ];
      };
      handover_points: {
        Row: {
          active: boolean;
          address: string;
          created_at: string;
          id: string;
          name: string;
          neighborhood: string;
          opening_hours: string;
          qr_enabled: boolean;
          staff_contact_internal: string | null;
          type: Database["public"]["Enums"]["handover_point_type"];
        };
        Insert: {
          active?: boolean;
          address: string;
          created_at?: string;
          id?: string;
          name: string;
          neighborhood: string;
          opening_hours?: string;
          qr_enabled?: boolean;
          staff_contact_internal?: string | null;
          type?: Database["public"]["Enums"]["handover_point_type"];
        };
        Update: {
          active?: boolean;
          address?: string;
          created_at?: string;
          id?: string;
          name?: string;
          neighborhood?: string;
          opening_hours?: string;
          qr_enabled?: boolean;
          staff_contact_internal?: string | null;
          type?: Database["public"]["Enums"]["handover_point_type"];
        };
        Relationships: [];
      };
      handovers: {
        Row: {
          completed_at: string | null;
          created_at: string;
          failure_reason: string | null;
          handover_point_id: string;
          id: string;
          item_id: string;
          owner_confirmed: boolean;
          owner_id: string;
          qr_code_owner: string;
          qr_code_receiver: string;
          receiver_confirmed: boolean;
          receiver_id: string;
          request_id: string | null;
          scheduled_window: string | null;
          security_code: string;
          staff_confirmed: boolean;
          status: Database["public"]["Enums"]["handover_status"];
        };
        Insert: {
          completed_at?: string | null;
          created_at?: string;
          failure_reason?: string | null;
          handover_point_id: string;
          id?: string;
          item_id: string;
          owner_confirmed?: boolean;
          owner_id: string;
          qr_code_owner: string;
          qr_code_receiver: string;
          receiver_confirmed?: boolean;
          receiver_id: string;
          request_id?: string | null;
          scheduled_window?: string | null;
          security_code: string;
          staff_confirmed?: boolean;
          status?: Database["public"]["Enums"]["handover_status"];
        };
        Update: {
          completed_at?: string | null;
          created_at?: string;
          failure_reason?: string | null;
          handover_point_id?: string;
          id?: string;
          item_id?: string;
          owner_confirmed?: boolean;
          owner_id?: string;
          qr_code_owner?: string;
          qr_code_receiver?: string;
          receiver_confirmed?: boolean;
          receiver_id?: string;
          request_id?: string | null;
          scheduled_window?: string | null;
          security_code?: string;
          staff_confirmed?: boolean;
          status?: Database["public"]["Enums"]["handover_status"];
        };
        Relationships: [
          {
            foreignKeyName: "handovers_handover_point_id_fkey";
            columns: ["handover_point_id"];
            isOneToOne: false;
            referencedRelation: "handover_points";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "handovers_item_id_fkey";
            columns: ["item_id"];
            isOneToOne: false;
            referencedRelation: "items";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "handovers_request_id_fkey";
            columns: ["request_id"];
            isOneToOne: false;
            referencedRelation: "requests";
            referencedColumns: ["id"];
          },
        ];
      };
      item_attributes: {
        Row: {
          attributes: Json;
          item_id: string;
          updated_at: string;
        };
        Insert: {
          attributes?: Json;
          item_id: string;
          updated_at?: string;
        };
        Update: {
          attributes?: Json;
          item_id?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "item_attributes_item_id_fkey";
            columns: ["item_id"];
            isOneToOne: true;
            referencedRelation: "items";
            referencedColumns: ["id"];
          },
        ];
      };
      items: {
        Row: {
          ai_risk_flag: string | null;
          category: Database["public"]["Enums"]["item_category"];
          condition: Database["public"]["Enums"]["item_condition"];
          created_at: string;
          description: string;
          eco_point_reward: number;
          handover_point_id: string | null;
          id: string;
          images: string[];
          moderation_note: string | null;
          moderation_status: Database["public"]["Enums"]["moderation_status"];
          neighborhood: string;
          owner_id: string;
          status: Database["public"]["Enums"]["item_status"];
          subcategory: string | null;
          title: string;
          updated_at: string;
        };
        Insert: {
          ai_risk_flag?: string | null;
          category: Database["public"]["Enums"]["item_category"];
          condition?: Database["public"]["Enums"]["item_condition"];
          created_at?: string;
          description?: string;
          eco_point_reward?: number;
          handover_point_id?: string | null;
          id?: string;
          images?: string[];
          moderation_note?: string | null;
          moderation_status?: Database["public"]["Enums"]["moderation_status"];
          neighborhood: string;
          owner_id: string;
          status?: Database["public"]["Enums"]["item_status"];
          subcategory?: string | null;
          title: string;
          updated_at?: string;
        };
        Update: {
          ai_risk_flag?: string | null;
          category?: Database["public"]["Enums"]["item_category"];
          condition?: Database["public"]["Enums"]["item_condition"];
          created_at?: string;
          description?: string;
          eco_point_reward?: number;
          handover_point_id?: string | null;
          id?: string;
          images?: string[];
          moderation_note?: string | null;
          moderation_status?: Database["public"]["Enums"]["moderation_status"];
          neighborhood?: string;
          owner_id?: string;
          status?: Database["public"]["Enums"]["item_status"];
          subcategory?: string | null;
          title?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "items_handover_point_id_fkey";
            columns: ["handover_point_id"];
            isOneToOne: false;
            referencedRelation: "handover_points";
            referencedColumns: ["id"];
          },
        ];
      };
      profiles: {
        Row: {
          age_range: string | null;
          completed_gives: number;
          completed_receives: number;
          created_at: string;
          eco_point_balance: number;
          email: string | null;
          esenler_connection_type: Database["public"]["Enums"]["esenler_connection"] | null;
          full_name: string;
          id: string;
          neighborhood: string | null;
          phone_optional: string | null;
          school_name: string | null;
          school_type: Database["public"]["Enums"]["school_type"] | null;
          trust_score: number;
          updated_at: string;
          verification_status: Database["public"]["Enums"]["verification_status"];
        };
        Insert: {
          age_range?: string | null;
          completed_gives?: number;
          completed_receives?: number;
          created_at?: string;
          eco_point_balance?: number;
          email?: string | null;
          esenler_connection_type?: Database["public"]["Enums"]["esenler_connection"] | null;
          full_name?: string;
          id: string;
          neighborhood?: string | null;
          phone_optional?: string | null;
          school_name?: string | null;
          school_type?: Database["public"]["Enums"]["school_type"] | null;
          trust_score?: number;
          updated_at?: string;
          verification_status?: Database["public"]["Enums"]["verification_status"];
        };
        Update: {
          age_range?: string | null;
          completed_gives?: number;
          completed_receives?: number;
          created_at?: string;
          eco_point_balance?: number;
          email?: string | null;
          esenler_connection_type?: Database["public"]["Enums"]["esenler_connection"] | null;
          full_name?: string;
          id?: string;
          neighborhood?: string | null;
          phone_optional?: string | null;
          school_name?: string | null;
          school_type?: Database["public"]["Enums"]["school_type"] | null;
          trust_score?: number;
          updated_at?: string;
          verification_status?: Database["public"]["Enums"]["verification_status"];
        };
        Relationships: [];
      };
      reports: {
        Row: {
          created_at: string;
          description: string | null;
          id: string;
          item_id: string | null;
          reason: Database["public"]["Enums"]["report_reason"];
          reported_user_id: string | null;
          reporter_id: string;
          resolved_at: string | null;
          status: Database["public"]["Enums"]["report_status"];
        };
        Insert: {
          created_at?: string;
          description?: string | null;
          id?: string;
          item_id?: string | null;
          reason: Database["public"]["Enums"]["report_reason"];
          reported_user_id?: string | null;
          reporter_id: string;
          resolved_at?: string | null;
          status?: Database["public"]["Enums"]["report_status"];
        };
        Update: {
          created_at?: string;
          description?: string | null;
          id?: string;
          item_id?: string | null;
          reason?: Database["public"]["Enums"]["report_reason"];
          reported_user_id?: string | null;
          reporter_id?: string;
          resolved_at?: string | null;
          status?: Database["public"]["Enums"]["report_status"];
        };
        Relationships: [
          {
            foreignKeyName: "reports_item_id_fkey";
            columns: ["item_id"];
            isOneToOne: false;
            referencedRelation: "items";
            referencedColumns: ["id"];
          },
        ];
      };
      requests: {
        Row: {
          created_at: string;
          id: string;
          item_id: string;
          note: string | null;
          owner_id: string;
          reason: string;
          requester_id: string;
          status: Database["public"]["Enums"]["request_status"];
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          item_id: string;
          note?: string | null;
          owner_id: string;
          reason: string;
          requester_id: string;
          status?: Database["public"]["Enums"]["request_status"];
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          item_id?: string;
          note?: string | null;
          owner_id?: string;
          reason?: string;
          requester_id?: string;
          status?: Database["public"]["Enums"]["request_status"];
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "requests_item_id_fkey";
            columns: ["item_id"];
            isOneToOne: false;
            referencedRelation: "items";
            referencedColumns: ["id"];
          },
        ];
      };
      user_roles: {
        Row: {
          created_at: string;
          id: string;
          role: Database["public"]["Enums"]["app_role"];
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          role: Database["public"]["Enums"]["app_role"];
          user_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          role?: Database["public"]["Enums"]["app_role"];
          user_id?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      handovers_my: {
        Row: {
          completed_at: string | null;
          created_at: string | null;
          failure_reason: string | null;
          handover_point_id: string | null;
          id: string | null;
          item_id: string | null;
          owner_confirmed: boolean | null;
          owner_id: string | null;
          qr_code_owner: string | null;
          qr_code_receiver: string | null;
          receiver_confirmed: boolean | null;
          receiver_id: string | null;
          request_id: string | null;
          scheduled_window: string | null;
          security_code: string | null;
          staff_confirmed: boolean | null;
          status: Database["public"]["Enums"]["handover_status"] | null;
        };
        Insert: {
          completed_at?: string | null;
          created_at?: string | null;
          failure_reason?: string | null;
          handover_point_id?: string | null;
          id?: string | null;
          item_id?: string | null;
          owner_confirmed?: boolean | null;
          owner_id?: string | null;
          qr_code_owner?: never;
          qr_code_receiver?: never;
          receiver_confirmed?: boolean | null;
          receiver_id?: string | null;
          request_id?: string | null;
          scheduled_window?: string | null;
          security_code?: never;
          staff_confirmed?: boolean | null;
          status?: Database["public"]["Enums"]["handover_status"] | null;
        };
        Update: {
          completed_at?: string | null;
          created_at?: string | null;
          failure_reason?: string | null;
          handover_point_id?: string | null;
          id?: string | null;
          item_id?: string | null;
          owner_confirmed?: boolean | null;
          owner_id?: string | null;
          qr_code_owner?: never;
          qr_code_receiver?: never;
          receiver_confirmed?: boolean | null;
          receiver_id?: string | null;
          request_id?: string | null;
          scheduled_window?: string | null;
          security_code?: never;
          staff_confirmed?: boolean | null;
          status?: Database["public"]["Enums"]["handover_status"] | null;
        };
        Relationships: [
          {
            foreignKeyName: "handovers_handover_point_id_fkey";
            columns: ["handover_point_id"];
            isOneToOne: false;
            referencedRelation: "handover_points";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "handovers_item_id_fkey";
            columns: ["item_id"];
            isOneToOne: false;
            referencedRelation: "items";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "handovers_request_id_fkey";
            columns: ["request_id"];
            isOneToOne: false;
            referencedRelation: "requests";
            referencedColumns: ["id"];
          },
        ];
      };
      profiles_public: {
        Row: {
          completed_gives: number | null;
          completed_receives: number | null;
          created_at: string | null;
          eco_point_balance: number | null;
          full_name: string | null;
          id: string | null;
          school_type: Database["public"]["Enums"]["school_type"] | null;
          trust_score: number | null;
          verification_status: Database["public"]["Enums"]["verification_status"] | null;
        };
        Insert: {
          completed_gives?: number | null;
          completed_receives?: number | null;
          created_at?: string | null;
          eco_point_balance?: number | null;
          full_name?: string | null;
          id?: string | null;
          school_type?: Database["public"]["Enums"]["school_type"] | null;
          trust_score?: number | null;
          verification_status?: Database["public"]["Enums"]["verification_status"] | null;
        };
        Update: {
          completed_gives?: number | null;
          completed_receives?: number | null;
          created_at?: string | null;
          eco_point_balance?: number | null;
          full_name?: string | null;
          id?: string | null;
          school_type?: Database["public"]["Enums"]["school_type"] | null;
          trust_score?: number | null;
          verification_status?: Database["public"]["Enums"]["verification_status"] | null;
        };
        Relationships: [];
      };
    };
    Functions: {
      calculate_eco_points: {
        Args: {
          _category: Database["public"]["Enums"]["item_category"];
          _condition: Database["public"]["Enums"]["item_condition"];
        };
        Returns: number;
      };
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"];
          _user_id: string;
        };
        Returns: boolean;
      };
      is_staff_or_above: { Args: { _user_id: string }; Returns: boolean };
      sync_profile_eco_balance: {
        Args: { _user_id: string };
        Returns: undefined;
      };
    };
    Enums: {
      app_role: "youth" | "verified_student" | "moderator" | "safe_point_staff" | "admin";
      esenler_connection: "residence" | "school" | "municipal_registry";
      handover_point_type:
        | "youth_center"
        | "library"
        | "service_point"
        | "cultural_center"
        | "sports_facility"
        | "other";
      handover_status:
        | "created"
        | "qr_ready"
        | "waiting_owner"
        | "waiting_receiver"
        | "waiting_staff"
        | "completed"
        | "failed"
        | "cancelled"
        | "expired";
      item_category:
        | "books"
        | "exam_prep"
        | "clothes"
        | "school_supplies"
        | "electronics"
        | "sports"
        | "dormitory"
        | "other";
      item_condition: "new" | "very_good" | "good" | "usable" | "needs_minor_repair";
      item_status:
        | "draft"
        | "pending_review"
        | "active"
        | "requested"
        | "reserved"
        | "qr_ready"
        | "completed"
        | "cancelled"
        | "rejected"
        | "removed";
      moderation_status: "pending" | "approved" | "rejected" | "needs_edit";
      report_reason:
        | "inappropriate"
        | "fake_listing"
        | "unsafe_behavior"
        | "not_as_described"
        | "commercial_attempt"
        | "duplicate"
        | "other";
      report_status: "open" | "reviewing" | "resolved" | "dismissed";
      request_status:
        | "pending"
        | "accepted"
        | "declined"
        | "expired"
        | "cancelled"
        | "converted_to_handover";
      school_type: "high_school" | "vocational_high_school" | "university" | "other";
      transaction_status: "pending" | "completed" | "synced_to_esenlink" | "failed";
      transaction_type:
        | "earned_from_giving"
        | "bonus"
        | "penalty"
        | "adjustment"
        | "integration_sync";
      verification_status: "unverified" | "pending" | "verified" | "rejected" | "suspended";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {
      app_role: ["youth", "verified_student", "moderator", "safe_point_staff", "admin"],
      esenler_connection: ["residence", "school", "municipal_registry"],
      handover_point_type: [
        "youth_center",
        "library",
        "service_point",
        "cultural_center",
        "sports_facility",
        "other",
      ],
      handover_status: [
        "created",
        "qr_ready",
        "waiting_owner",
        "waiting_receiver",
        "waiting_staff",
        "completed",
        "failed",
        "cancelled",
        "expired",
      ],
      item_category: [
        "books",
        "exam_prep",
        "clothes",
        "school_supplies",
        "electronics",
        "sports",
        "dormitory",
        "other",
      ],
      item_condition: ["new", "very_good", "good", "usable", "needs_minor_repair"],
      item_status: [
        "draft",
        "pending_review",
        "active",
        "requested",
        "reserved",
        "qr_ready",
        "completed",
        "cancelled",
        "rejected",
        "removed",
      ],
      moderation_status: ["pending", "approved", "rejected", "needs_edit"],
      report_reason: [
        "inappropriate",
        "fake_listing",
        "unsafe_behavior",
        "not_as_described",
        "commercial_attempt",
        "duplicate",
        "other",
      ],
      report_status: ["open", "reviewing", "resolved", "dismissed"],
      request_status: [
        "pending",
        "accepted",
        "declined",
        "expired",
        "cancelled",
        "converted_to_handover",
      ],
      school_type: ["high_school", "vocational_high_school", "university", "other"],
      transaction_status: ["pending", "completed", "synced_to_esenlink", "failed"],
      transaction_type: [
        "earned_from_giving",
        "bonus",
        "penalty",
        "adjustment",
        "integration_sync",
      ],
      verification_status: ["unverified", "pending", "verified", "rejected", "suspended"],
    },
  },
} as const;
