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
      bank_connections: {
        Row: {
          account_name: string | null
          account_number: string | null
          account_type: string | null
          balance: number | null
          bank_code: string | null
          bank_name: string | null
          created_at: string | null
          currency: string | null
          id: string
          last_sync_at: string | null
          mono_id: string
          status: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          account_name?: string | null
          account_number?: string | null
          account_type?: string | null
          balance?: number | null
          bank_code?: string | null
          bank_name?: string | null
          created_at?: string | null
          currency?: string | null
          id?: string
          last_sync_at?: string | null
          mono_id: string
          status?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          account_name?: string | null
          account_number?: string | null
          account_type?: string | null
          balance?: number | null
          bank_code?: string | null
          bank_name?: string | null
          created_at?: string | null
          currency?: string | null
          id?: string
          last_sync_at?: string | null
          mono_id?: string
          status?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bank_connections_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      bank_transactions: {
        Row: {
          amount: number
          balance_after: number | null
          bank_connection_id: string | null
          category: string | null
          classification_confidence: number | null
          classification_reasoning: string | null
          classification_source: string | null
          created_at: string | null
          description: string
          id: string
          mono_id: string | null
          needs_review: boolean | null
          raw_data: Json | null
          transaction_date: string
          type: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          amount: number
          balance_after?: number | null
          bank_connection_id?: string | null
          category?: string | null
          classification_confidence?: number | null
          classification_reasoning?: string | null
          classification_source?: string | null
          created_at?: string | null
          description: string
          id?: string
          mono_id?: string | null
          needs_review?: boolean | null
          raw_data?: Json | null
          transaction_date: string
          type: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          balance_after?: number | null
          bank_connection_id?: string | null
          category?: string | null
          classification_confidence?: number | null
          classification_reasoning?: string | null
          classification_source?: string | null
          created_at?: string | null
          description?: string
          id?: string
          mono_id?: string | null
          needs_review?: boolean | null
          raw_data?: Json | null
          transaction_date?: string
          type?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bank_transactions_bank_connection_id_fkey"
            columns: ["bank_connection_id"]
            isOneToOne: false
            referencedRelation: "bank_connections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bank_transactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      compliance_change_log: {
        Row: {
          change_reason: string | null
          change_type: string
          changed_by: string | null
          created_at: string | null
          entity_id: string
          entity_type: string
          id: string
          new_values: Json | null
          old_values: Json | null
          source_document_id: string | null
        }
        Insert: {
          change_reason?: string | null
          change_type: string
          changed_by?: string | null
          created_at?: string | null
          entity_id: string
          entity_type: string
          id?: string
          new_values?: Json | null
          old_values?: Json | null
          source_document_id?: string | null
        }
        Update: {
          change_reason?: string | null
          change_type?: string
          changed_by?: string | null
          created_at?: string | null
          entity_id?: string
          entity_type?: string
          id?: string
          new_values?: Json | null
          old_values?: Json | null
          source_document_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "compliance_change_log_source_document_id_fkey"
            columns: ["source_document_id"]
            isOneToOne: false
            referencedRelation: "legal_documents"
            referencedColumns: ["id"]
          },
        ]
      }
      compliance_extraction_gaps: {
        Row: {
          actual_value: Json | null
          circular_quote: string | null
          created_at: string | null
          document_id: string
          expected_value: Json | null
          fix_description: string | null
          fix_time_minutes: number | null
          fix_type: string | null
          fixed_at: string | null
          fixed_by: string | null
          gap_category: string
          gap_description: string
          id: string
          is_recurring: boolean | null
          occurrence_count: number | null
          priority: string | null
          related_gap_ids: string[] | null
          review_time_minutes: number | null
          rule_id: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          actual_value?: Json | null
          circular_quote?: string | null
          created_at?: string | null
          document_id: string
          expected_value?: Json | null
          fix_description?: string | null
          fix_time_minutes?: number | null
          fix_type?: string | null
          fixed_at?: string | null
          fixed_by?: string | null
          gap_category: string
          gap_description: string
          id?: string
          is_recurring?: boolean | null
          occurrence_count?: number | null
          priority?: string | null
          related_gap_ids?: string[] | null
          review_time_minutes?: number | null
          rule_id?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          actual_value?: Json | null
          circular_quote?: string | null
          created_at?: string | null
          document_id?: string
          expected_value?: Json | null
          fix_description?: string | null
          fix_time_minutes?: number | null
          fix_type?: string | null
          fixed_at?: string | null
          fixed_by?: string | null
          gap_category?: string
          gap_description?: string
          id?: string
          is_recurring?: boolean | null
          occurrence_count?: number | null
          priority?: string | null
          related_gap_ids?: string[] | null
          review_time_minutes?: number | null
          rule_id?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "compliance_extraction_gaps_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "legal_documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "compliance_extraction_gaps_rule_id_fkey"
            columns: ["rule_id"]
            isOneToOne: false
            referencedRelation: "compliance_rules"
            referencedColumns: ["id"]
          },
        ]
      }
      compliance_extraction_metrics: {
        Row: {
          ai_extraction_seconds: number | null
          document_id: string
          extraction_accuracy_percent: number | null
          gaps_found: number | null
          high_priority_gaps: number | null
          id: string
          manual_review_minutes: number | null
          measured_at: string | null
          provisions_extracted: number
          rules_generated: number
        }
        Insert: {
          ai_extraction_seconds?: number | null
          document_id: string
          extraction_accuracy_percent?: number | null
          gaps_found?: number | null
          high_priority_gaps?: number | null
          id?: string
          manual_review_minutes?: number | null
          measured_at?: string | null
          provisions_extracted: number
          rules_generated: number
        }
        Update: {
          ai_extraction_seconds?: number | null
          document_id?: string
          extraction_accuracy_percent?: number | null
          gaps_found?: number | null
          high_priority_gaps?: number | null
          id?: string
          manual_review_minutes?: number | null
          measured_at?: string | null
          provisions_extracted?: number
          rules_generated?: number
        }
        Relationships: [
          {
            foreignKeyName: "compliance_extraction_metrics_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "legal_documents"
            referencedColumns: ["id"]
          },
        ]
      }
      compliance_gap_patterns: {
        Row: {
          circulars_affected: string[] | null
          claude_code_prompt: string | null
          created_at: string | null
          description: string
          example_circular_quote: string | null
          fix_implementation_status: string | null
          fix_pr_url: string | null
          gap_category: string
          id: string
          last_seen_at: string | null
          pattern_name: string
          suggested_fix_type: string | null
          total_occurrences: number | null
          updated_at: string | null
        }
        Insert: {
          circulars_affected?: string[] | null
          claude_code_prompt?: string | null
          created_at?: string | null
          description: string
          example_circular_quote?: string | null
          fix_implementation_status?: string | null
          fix_pr_url?: string | null
          gap_category: string
          id?: string
          last_seen_at?: string | null
          pattern_name: string
          suggested_fix_type?: string | null
          total_occurrences?: number | null
          updated_at?: string | null
        }
        Update: {
          circulars_affected?: string[] | null
          claude_code_prompt?: string | null
          created_at?: string | null
          description?: string
          example_circular_quote?: string | null
          fix_implementation_status?: string | null
          fix_pr_url?: string | null
          gap_category?: string
          id?: string
          last_seen_at?: string | null
          pattern_name?: string
          suggested_fix_type?: string | null
          total_occurrences?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      compliance_notifications: {
        Row: {
          created_at: string | null
          id: string
          is_read: boolean | null
          message: string
          metadata: Json | null
          notification_type: string
          severity: string | null
          title: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message: string
          metadata?: Json | null
          notification_type: string
          severity?: string | null
          title: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message?: string
          metadata?: Json | null
          notification_type?: string
          severity?: string | null
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "compliance_notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      compliance_rules: {
        Row: {
          applies_to_filing: boolean | null
          applies_to_transactions: boolean | null
          conditions: Json
          created_at: string | null
          document_id: string | null
          effective_from: string | null
          effective_until: string | null
          id: string
          is_active: boolean | null
          outcome: Json
          provision_id: string | null
          rule_name: string
          rule_type: string
          updated_at: string | null
          validation_status: string | null
        }
        Insert: {
          applies_to_filing?: boolean | null
          applies_to_transactions?: boolean | null
          conditions: Json
          created_at?: string | null
          document_id?: string | null
          effective_from?: string | null
          effective_until?: string | null
          id?: string
          is_active?: boolean | null
          outcome: Json
          provision_id?: string | null
          rule_name: string
          rule_type: string
          updated_at?: string | null
          validation_status?: string | null
        }
        Update: {
          applies_to_filing?: boolean | null
          applies_to_transactions?: boolean | null
          conditions?: Json
          created_at?: string | null
          document_id?: string | null
          effective_from?: string | null
          effective_until?: string | null
          id?: string
          is_active?: boolean | null
          outcome?: Json
          provision_id?: string | null
          rule_name?: string
          rule_type?: string
          updated_at?: string | null
          validation_status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "compliance_rules_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "legal_documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "compliance_rules_provision_id_fkey"
            columns: ["provision_id"]
            isOneToOne: false
            referencedRelation: "legal_provisions"
            referencedColumns: ["id"]
          },
        ]
      }
      education_articles: {
        Row: {
          author_id: string | null
          category: string
          content: string | null
          created_at: string | null
          description: string | null
          difficulty: string | null
          id: string
          is_published: boolean | null
          published_at: string | null
          read_time: string | null
          slug: string
          tags: string[] | null
          title: string
          updated_at: string | null
          view_count: number | null
        }
        Insert: {
          author_id?: string | null
          category: string
          content?: string | null
          created_at?: string | null
          description?: string | null
          difficulty?: string | null
          id?: string
          is_published?: boolean | null
          published_at?: string | null
          read_time?: string | null
          slug: string
          tags?: string[] | null
          title: string
          updated_at?: string | null
          view_count?: number | null
        }
        Update: {
          author_id?: string | null
          category?: string
          content?: string | null
          created_at?: string | null
          description?: string | null
          difficulty?: string | null
          id?: string
          is_published?: boolean | null
          published_at?: string | null
          read_time?: string | null
          slug?: string
          tags?: string[] | null
          title?: string
          updated_at?: string | null
          view_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "education_articles_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      legal_documents: {
        Row: {
          affected_taxpayers: string[] | null
          created_at: string | null
          document_type: string
          effective_date: string | null
          extracted_text: string | null
          id: string
          key_provisions: string[] | null
          official_reference: string | null
          original_file_url: string | null
          publication_date: string | null
          regulatory_body_id: string | null
          repeal_date: string | null
          review_notes: string | null
          review_status: string | null
          reviewed_by: string | null
          status: string | null
          summary: string | null
          supersedes_id: string | null
          tax_types: string[] | null
          title: string
          updated_at: string | null
          uploaded_by: string | null
          version: string
        }
        Insert: {
          affected_taxpayers?: string[] | null
          created_at?: string | null
          document_type: string
          effective_date?: string | null
          extracted_text?: string | null
          id?: string
          key_provisions?: string[] | null
          official_reference?: string | null
          original_file_url?: string | null
          publication_date?: string | null
          regulatory_body_id?: string | null
          repeal_date?: string | null
          review_notes?: string | null
          review_status?: string | null
          reviewed_by?: string | null
          status?: string | null
          summary?: string | null
          supersedes_id?: string | null
          tax_types?: string[] | null
          title: string
          updated_at?: string | null
          uploaded_by?: string | null
          version?: string
        }
        Update: {
          affected_taxpayers?: string[] | null
          created_at?: string | null
          document_type?: string
          effective_date?: string | null
          extracted_text?: string | null
          id?: string
          key_provisions?: string[] | null
          official_reference?: string | null
          original_file_url?: string | null
          publication_date?: string | null
          regulatory_body_id?: string | null
          repeal_date?: string | null
          review_notes?: string | null
          review_status?: string | null
          reviewed_by?: string | null
          status?: string | null
          summary?: string | null
          supersedes_id?: string | null
          tax_types?: string[] | null
          title?: string
          updated_at?: string | null
          uploaded_by?: string | null
          version?: string
        }
        Relationships: [
          {
            foreignKeyName: "legal_documents_regulatory_body_id_fkey"
            columns: ["regulatory_body_id"]
            isOneToOne: false
            referencedRelation: "regulatory_bodies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "legal_documents_supersedes_id_fkey"
            columns: ["supersedes_id"]
            isOneToOne: false
            referencedRelation: "legal_documents"
            referencedColumns: ["id"]
          },
        ]
      }
      legal_provisions: {
        Row: {
          applies_to: string[] | null
          created_at: string | null
          document_id: string
          id: string
          plain_language_summary: string | null
          provision_text: string
          provision_type: string | null
          section_number: string | null
          tax_impact: string | null
          title: string | null
        }
        Insert: {
          applies_to?: string[] | null
          created_at?: string | null
          document_id: string
          id?: string
          plain_language_summary?: string | null
          provision_text: string
          provision_type?: string | null
          section_number?: string | null
          tax_impact?: string | null
          title?: string | null
        }
        Update: {
          applies_to?: string[] | null
          created_at?: string | null
          document_id?: string
          id?: string
          plain_language_summary?: string | null
          provision_text?: string
          provision_type?: string | null
          section_number?: string | null
          tax_impact?: string | null
          title?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "legal_provisions_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "legal_documents"
            referencedColumns: ["id"]
          },
        ]
      }
      regulatory_bodies: {
        Row: {
          active: boolean | null
          authority_scope: string[] | null
          code: string
          created_at: string | null
          full_name: string
          id: string
          jurisdiction: string | null
          previous_names: string[] | null
          website_url: string | null
        }
        Insert: {
          active?: boolean | null
          authority_scope?: string[] | null
          code: string
          created_at?: string | null
          full_name: string
          id?: string
          jurisdiction?: string | null
          previous_names?: string[] | null
          website_url?: string | null
        }
        Update: {
          active?: boolean | null
          authority_scope?: string[] | null
          code?: string
          created_at?: string | null
          full_name?: string
          id?: string
          jurisdiction?: string | null
          previous_names?: string[] | null
          website_url?: string | null
        }
        Relationships: []
      }
      system_logs: {
        Row: {
          category: string
          created_at: string | null
          id: string
          ip_address: string | null
          level: string
          message: string
          metadata: Json | null
          session_id: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          category: string
          created_at?: string | null
          id?: string
          ip_address?: string | null
          level: string
          message: string
          metadata?: Json | null
          session_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          category?: string
          created_at?: string | null
          id?: string
          ip_address?: string | null
          level?: string
          message?: string
          metadata?: Json | null
          session_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "system_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      tax_filings: {
        Row: {
          amount: number | null
          created_at: string | null
          due_date: string
          filed_at: string | null
          filing_type: string
          id: string
          period_end: string
          period_start: string
          status: string | null
          tax_profile_id: string | null
          user_id: string
        }
        Insert: {
          amount?: number | null
          created_at?: string | null
          due_date: string
          filed_at?: string | null
          filing_type: string
          id?: string
          period_end: string
          period_start: string
          status?: string | null
          tax_profile_id?: string | null
          user_id: string
        }
        Update: {
          amount?: number | null
          created_at?: string | null
          due_date?: string
          filed_at?: string | null
          filing_type?: string
          id?: string
          period_end?: string
          period_start?: string
          status?: string | null
          tax_profile_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tax_filings_tax_profile_id_fkey"
            columns: ["tax_profile_id"]
            isOneToOne: false
            referencedRelation: "tax_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tax_filings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      tax_profiles: {
        Row: {
          business_type: string | null
          completed_at: string | null
          compliance_score: number | null
          created_at: string | null
          estimated_annual_income: number | null
          estimated_tax_liability: number | null
          id: string
          tax_year: number
          tin: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          business_type?: string | null
          completed_at?: string | null
          compliance_score?: number | null
          created_at?: string | null
          estimated_annual_income?: number | null
          estimated_tax_liability?: number | null
          id?: string
          tax_year: number
          tin?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          business_type?: string | null
          completed_at?: string | null
          compliance_score?: number | null
          created_at?: string | null
          estimated_annual_income?: number | null
          estimated_tax_liability?: number | null
          id?: string
          tax_year?: number
          tin?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tax_profiles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      team_members: {
        Row: {
          created_at: string | null
          email: string
          id: string
          invite_token: string | null
          invited_by: string | null
          joined_at: string | null
          role: string
          status: string
          team_id: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: string
          invite_token?: string | null
          invited_by?: string | null
          joined_at?: string | null
          role: string
          status?: string
          team_id: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          invite_token?: string | null
          invited_by?: string | null
          joined_at?: string | null
          role?: string
          status?: string
          team_id?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "team_members_invited_by_fkey"
            columns: ["invited_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "team_members_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "team_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      teams: {
        Row: {
          created_at: string | null
          id: string
          name: string
          owner_id: string
          subscription_tier: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          owner_id: string
          subscription_tier?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          owner_id?: string
          subscription_tier?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "teams_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      telegram_connections: {
        Row: {
          chat_id: string
          connected_at: string | null
          created_at: string | null
          first_name: string | null
          id: string
          is_active: boolean | null
          telegram_id: string
          updated_at: string | null
          user_id: string
          username: string | null
        }
        Insert: {
          chat_id: string
          connected_at?: string | null
          created_at?: string | null
          first_name?: string | null
          id?: string
          is_active?: boolean | null
          telegram_id: string
          updated_at?: string | null
          user_id: string
          username?: string | null
        }
        Update: {
          chat_id?: string
          connected_at?: string | null
          created_at?: string | null
          first_name?: string | null
          id?: string
          is_active?: boolean | null
          telegram_id?: string
          updated_at?: string | null
          user_id?: string
          username?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "telegram_connections_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      telegram_tokens: {
        Row: {
          created_at: string | null
          expires_at: string
          id: string
          token: string
          used: boolean | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          expires_at: string
          id?: string
          token: string
          used?: boolean | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          expires_at?: string
          id?: string
          token?: string
          used?: boolean | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "telegram_tokens_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      transaction_patterns: {
        Row: {
          category: string
          confidence: number | null
          created_at: string | null
          created_by: string | null
          id: string
          is_active: boolean | null
          last_matched_at: string | null
          match_count: number | null
          merchant_type: string | null
          pattern: string
          pattern_type: string | null
          priority: number | null
          source: string | null
          subcategory: string | null
          updated_at: string | null
        }
        Insert: {
          category: string
          confidence?: number | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          last_matched_at?: string | null
          match_count?: number | null
          merchant_type?: string | null
          pattern: string
          pattern_type?: string | null
          priority?: number | null
          source?: string | null
          subcategory?: string | null
          updated_at?: string | null
        }
        Update: {
          category?: string
          confidence?: number | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          last_matched_at?: string | null
          match_count?: number | null
          merchant_type?: string | null
          pattern?: string
          pattern_type?: string | null
          priority?: number | null
          source?: string | null
          subcategory?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "transaction_patterns_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          auth_user_id: string | null
          avatar_url: string | null
          created_at: string | null
          email: string
          full_name: string | null
          id: string
          migrated_from_v1: boolean | null
          onboarding_complete: boolean | null
          phone: string | null
          updated_at: string | null
          v1_id: string | null
        }
        Insert: {
          auth_user_id?: string | null
          avatar_url?: string | null
          created_at?: string | null
          email: string
          full_name?: string | null
          id?: string
          migrated_from_v1?: boolean | null
          onboarding_complete?: boolean | null
          phone?: string | null
          updated_at?: string | null
          v1_id?: string | null
        }
        Update: {
          auth_user_id?: string | null
          avatar_url?: string | null
          created_at?: string | null
          email?: string
          full_name?: string | null
          id?: string
          migrated_from_v1?: boolean | null
          onboarding_complete?: boolean | null
          phone?: string | null
          updated_at?: string | null
          v1_id?: string | null
        }
        Relationships: []
      }
      whatsapp_connections: {
        Row: {
          connected_at: string | null
          created_at: string | null
          id: string
          is_active: boolean | null
          phone_number: string
          updated_at: string | null
          user_id: string
          verified: boolean | null
          whatsapp_id: string | null
        }
        Insert: {
          connected_at?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          phone_number: string
          updated_at?: string | null
          user_id: string
          verified?: boolean | null
          whatsapp_id?: string | null
        }
        Update: {
          connected_at?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          phone_number?: string
          updated_at?: string | null
          user_id?: string
          verified?: boolean | null
          whatsapp_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "whatsapp_connections_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: { Args: { _role: string; _user_id: string }; Returns: boolean }
      show_limit: { Args: never; Returns: number }
      show_trgm: { Args: { "": string }; Returns: string[] }
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
