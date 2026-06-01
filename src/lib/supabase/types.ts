export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      conversation_participants: {
        Row: {
          conversation_id: string;
          user_id: string;
        };
        Insert: {
          conversation_id: string;
          user_id: string;
        };
        Update: {
          conversation_id?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "conversation_participants_conversation_id_fkey";
            columns: ["conversation_id"];
            isOneToOne: false;
            referencedRelation: "conversations";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "conversation_participants_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      conversations: {
        Row: {
          created_at: string;
          id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
        };
        Update: {
          created_at?: string;
          id?: string;
        };
        Relationships: [];
      };
      learning_requests: {
        Row: {
          created_at: string;
          id: string;
          message: string | null;
          receiver_id: string;
          sender_id: string;
          skill_id: string;
          status: Database["public"]["Enums"]["learning_request_status"];
        };
        Insert: {
          created_at?: string;
          id?: string;
          message?: string | null;
          receiver_id: string;
          sender_id: string;
          skill_id: string;
          status?: Database["public"]["Enums"]["learning_request_status"];
        };
        Update: {
          created_at?: string;
          id?: string;
          message?: string | null;
          receiver_id?: string;
          sender_id?: string;
          skill_id?: string;
          status?: Database["public"]["Enums"]["learning_request_status"];
        };
        Relationships: [
          {
            foreignKeyName: "learning_requests_receiver_id_fkey";
            columns: ["receiver_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "learning_requests_sender_id_fkey";
            columns: ["sender_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "learning_requests_skill_id_fkey";
            columns: ["skill_id"];
            isOneToOne: false;
            referencedRelation: "skills";
            referencedColumns: ["id"];
          },
        ];
      };
      matches: {
        Row: {
          compatibility_score: number;
          created_at: string;
          id: string;
          learner_id: string;
          mentor_id: string;
          status: Database["public"]["Enums"]["match_status"];
        };
        Insert: {
          compatibility_score: number;
          created_at?: string;
          id?: string;
          learner_id: string;
          mentor_id: string;
          status?: Database["public"]["Enums"]["match_status"];
        };
        Update: {
          compatibility_score?: number;
          created_at?: string;
          id?: string;
          learner_id?: string;
          mentor_id?: string;
          status?: Database["public"]["Enums"]["match_status"];
        };
        Relationships: [
          {
            foreignKeyName: "matches_learner_id_fkey";
            columns: ["learner_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "matches_mentor_id_fkey";
            columns: ["mentor_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      messages: {
        Row: {
          content: string;
          conversation_id: string;
          created_at: string;
          id: string;
          sender_id: string;
        };
        Insert: {
          content: string;
          conversation_id: string;
          created_at?: string;
          id?: string;
          sender_id: string;
        };
        Update: {
          content?: string;
          conversation_id?: string;
          created_at?: string;
          id?: string;
          sender_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey";
            columns: ["conversation_id"];
            isOneToOne: false;
            referencedRelation: "conversations";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "messages_sender_id_fkey";
            columns: ["sender_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      profiles: {
        Row: {
          availability: string | null;
          avatar_url: string | null;
          bio: string | null;
          created_at: string;
          full_name: string | null;
          id: string;
          location: string | null;
          rating_average: number;
          rating_count: number;
          updated_at: string;
          username: string | null;
        };
        Insert: {
          availability?: string | null;
          avatar_url?: string | null;
          bio?: string | null;
          created_at?: string;
          full_name?: string | null;
          id: string;
          location?: string | null;
          rating_average?: number;
          rating_count?: number;
          updated_at?: string;
          username?: string | null;
        };
        Update: {
          availability?: string | null;
          avatar_url?: string | null;
          bio?: string | null;
          created_at?: string;
          full_name?: string | null;
          id?: string;
          location?: string | null;
          rating_average?: number;
          rating_count?: number;
          updated_at?: string;
          username?: string | null;
        };
        Relationships: [];
      };
      reviews: {
        Row: {
          comment: string | null;
          created_at: string;
          id: string;
          rating: number;
          reviewee_id: string;
          reviewer_id: string;
          session_id: string;
        };
        Insert: {
          comment?: string | null;
          created_at?: string;
          id?: string;
          rating: number;
          reviewee_id: string;
          reviewer_id: string;
          session_id: string;
        };
        Update: {
          comment?: string | null;
          created_at?: string;
          id?: string;
          rating?: number;
          reviewee_id?: string;
          reviewer_id?: string;
          session_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "reviews_reviewee_id_fkey";
            columns: ["reviewee_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "reviews_reviewer_id_fkey";
            columns: ["reviewer_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "reviews_session_id_fkey";
            columns: ["session_id"];
            isOneToOne: false;
            referencedRelation: "sessions";
            referencedColumns: ["id"];
          },
        ];
      };
      sessions: {
        Row: {
          created_at: string;
          id: string;
          learner_id: string;
          mentor_id: string;
          scheduled_end: string;
          scheduled_start: string;
          skill_id: string;
          status: Database["public"]["Enums"]["session_status"];
        };
        Insert: {
          created_at?: string;
          id?: string;
          learner_id: string;
          mentor_id: string;
          scheduled_end: string;
          scheduled_start: string;
          skill_id: string;
          status?: Database["public"]["Enums"]["session_status"];
        };
        Update: {
          created_at?: string;
          id?: string;
          learner_id?: string;
          mentor_id?: string;
          scheduled_end?: string;
          scheduled_start?: string;
          skill_id?: string;
          status?: Database["public"]["Enums"]["session_status"];
        };
        Relationships: [
          {
            foreignKeyName: "sessions_learner_id_fkey";
            columns: ["learner_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "sessions_mentor_id_fkey";
            columns: ["mentor_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "sessions_skill_id_fkey";
            columns: ["skill_id"];
            isOneToOne: false;
            referencedRelation: "skills";
            referencedColumns: ["id"];
          },
        ];
      };
      skills: {
        Row: {
          created_at: string;
          id: string;
          name: string;
          slug: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          name: string;
          slug: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          name?: string;
          slug?: string;
        };
        Relationships: [];
      };
      user_learning_skills: {
        Row: {
          created_at: string;
          id: string;
          skill_id: string;
          target_level: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          skill_id: string;
          target_level: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          skill_id?: string;
          target_level?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "user_learning_skills_skill_id_fkey";
            columns: ["skill_id"];
            isOneToOne: false;
            referencedRelation: "skills";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "user_learning_skills_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      user_teaching_skills: {
        Row: {
          created_at: string;
          experience_level: string;
          id: string;
          skill_id: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          experience_level: string;
          id?: string;
          skill_id: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          experience_level?: string;
          id?: string;
          skill_id?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "user_teaching_skills_skill_id_fkey";
            columns: ["skill_id"];
            isOneToOne: false;
            referencedRelation: "skills";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "user_teaching_skills_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: Record<string, never>;
    Functions: {
      handle_new_user_profile: {
        Args: Record<PropertyKey, never>;
        Returns: unknown;
      };
      is_conversation_participant: {
        Args: {
          conversation_uuid: string;
          user_uuid: string;
        };
        Returns: boolean;
      };
      set_updated_at: {
        Args: Record<PropertyKey, never>;
        Returns: unknown;
      };
    };
    Enums: {
      learning_request_status: "pending" | "accepted" | "rejected" | "cancelled";
      match_status: "pending" | "accepted" | "rejected";
      session_status: "scheduled" | "completed" | "cancelled";
    };
    CompositeTypes: Record<string, never>;
  };
};

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (Database["public"]["Tables"] & Database["public"]["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer Row;
    }
    ? Row
    : never
  : PublicTableNameOrOptions extends keyof (Database["public"]["Tables"] &
        Database["public"]["Views"])
    ? (Database["public"]["Tables"] &
        Database["public"]["Views"])[PublicTableNameOrOptions] extends {
        Row: infer Row;
      }
      ? Row
      : never
    : never;

export type TablesInsert<
  PublicTableNameOrOptions extends keyof Database["public"]["Tables"] | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer Insert;
    }
    ? Insert
    : never
  : PublicTableNameOrOptions extends keyof Database["public"]["Tables"]
    ? Database["public"]["Tables"][PublicTableNameOrOptions] extends { Insert: infer Insert }
      ? Insert
      : never
    : never;

export type TablesUpdate<
  PublicTableNameOrOptions extends keyof Database["public"]["Tables"] | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer Update;
    }
    ? Update
    : never
  : PublicTableNameOrOptions extends keyof Database["public"]["Tables"]
    ? Database["public"]["Tables"][PublicTableNameOrOptions] extends { Update: infer Update }
      ? Update
      : never
    : never;

export type Enums<
  PublicEnumNameOrOptions extends keyof Database["public"]["Enums"] | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof Database["public"]["Enums"]
    ? Database["public"]["Enums"][PublicEnumNameOrOptions]
    : never;
