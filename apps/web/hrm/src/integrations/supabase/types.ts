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
      advance_request_employees: {
        Row: {
          advance_amount: number
          company_id: string
          created_at: string
          department: string | null
          employee_code: string
          employee_id: string | null
          employee_name: string
          id: string
          note: string | null
          position: string | null
          request_id: string
          updated_at: string
        }
        Insert: {
          advance_amount?: number
          company_id: string
          created_at?: string
          department?: string | null
          employee_code: string
          employee_id?: string | null
          employee_name: string
          id?: string
          note?: string | null
          position?: string | null
          request_id: string
          updated_at?: string
        }
        Update: {
          advance_amount?: number
          company_id?: string
          created_at?: string
          department?: string | null
          employee_code?: string
          employee_id?: string | null
          employee_name?: string
          id?: string
          note?: string | null
          position?: string | null
          request_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "advance_request_employees_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "advance_request_employees_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "platform_companies_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "advance_request_employees_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "advance_request_employees_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "advance_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      advance_requests: {
        Row: {
          approval_steps: Json | null
          company_id: string
          created_at: string
          created_by: string | null
          current_approval_level: number | null
          department: string | null
          employee_count: number | null
          id: string
          name: string
          position: string | null
          salary_period: string
          status: string
          total_amount: number | null
          updated_at: string
        }
        Insert: {
          approval_steps?: Json | null
          company_id: string
          created_at?: string
          created_by?: string | null
          current_approval_level?: number | null
          department?: string | null
          employee_count?: number | null
          id?: string
          name: string
          position?: string | null
          salary_period: string
          status?: string
          total_amount?: number | null
          updated_at?: string
        }
        Update: {
          approval_steps?: Json | null
          company_id?: string
          created_at?: string
          created_by?: string | null
          current_approval_level?: number | null
          department?: string | null
          employee_count?: number | null
          id?: string
          name?: string
          position?: string | null
          salary_period?: string
          status?: string
          total_amount?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "advance_requests_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "advance_requests_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "platform_companies_view"
            referencedColumns: ["id"]
          },
        ]
      }
      attendance_records: {
        Row: {
          actual_hours: number | null
          approved_at: string | null
          approved_by: string | null
          attendance_date: string
          attendance_type: string | null
          check_in_device: string | null
          check_in_location: string | null
          check_in_time: string | null
          check_out_device: string | null
          check_out_location: string | null
          check_out_time: string | null
          company_id: string
          created_at: string
          department: string | null
          early_leave_minutes: number | null
          employee_code: string
          employee_id: string
          employee_name: string
          id: string
          late_minutes: number | null
          leave_request_id: string | null
          leave_type: string | null
          notes: string | null
          overtime_hours: number | null
          scheduled_hours: number | null
          status: string
          updated_at: string
        }
        Insert: {
          actual_hours?: number | null
          approved_at?: string | null
          approved_by?: string | null
          attendance_date: string
          attendance_type?: string | null
          check_in_device?: string | null
          check_in_location?: string | null
          check_in_time?: string | null
          check_out_device?: string | null
          check_out_location?: string | null
          check_out_time?: string | null
          company_id: string
          created_at?: string
          department?: string | null
          early_leave_minutes?: number | null
          employee_code: string
          employee_id: string
          employee_name: string
          id?: string
          late_minutes?: number | null
          leave_request_id?: string | null
          leave_type?: string | null
          notes?: string | null
          overtime_hours?: number | null
          scheduled_hours?: number | null
          status?: string
          updated_at?: string
        }
        Update: {
          actual_hours?: number | null
          approved_at?: string | null
          approved_by?: string | null
          attendance_date?: string
          attendance_type?: string | null
          check_in_device?: string | null
          check_in_location?: string | null
          check_in_time?: string | null
          check_out_device?: string | null
          check_out_location?: string | null
          check_out_time?: string | null
          company_id?: string
          created_at?: string
          department?: string | null
          early_leave_minutes?: number | null
          employee_code?: string
          employee_id?: string
          employee_name?: string
          id?: string
          late_minutes?: number | null
          leave_request_id?: string | null
          leave_type?: string | null
          notes?: string | null
          overtime_hours?: number | null
          scheduled_hours?: number | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "attendance_records_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      attendance_rules: {
        Row: {
          allow_multiple_checkin: boolean | null
          auto_checkout: boolean | null
          company_id: string
          created_at: string
          faceid_enabled: boolean | null
          gps_enabled: boolean | null
          gps_locations: Json | null
          hours_per_day: number | null
          id: string
          notify_late: boolean | null
          qr_enabled: boolean | null
          round_in_minutes: number | null
          round_out_minutes: number | null
          standard_days_per_month: number | null
          standard_type: string | null
          updated_at: string
          wifi_enabled: boolean | null
          work_days: string[] | null
          work_end_day: number | null
          work_start_day: number | null
        }
        Insert: {
          allow_multiple_checkin?: boolean | null
          auto_checkout?: boolean | null
          company_id: string
          created_at?: string
          faceid_enabled?: boolean | null
          gps_enabled?: boolean | null
          gps_locations?: Json | null
          hours_per_day?: number | null
          id?: string
          notify_late?: boolean | null
          qr_enabled?: boolean | null
          round_in_minutes?: number | null
          round_out_minutes?: number | null
          standard_days_per_month?: number | null
          standard_type?: string | null
          updated_at?: string
          wifi_enabled?: boolean | null
          work_days?: string[] | null
          work_end_day?: number | null
          work_start_day?: number | null
        }
        Update: {
          allow_multiple_checkin?: boolean | null
          auto_checkout?: boolean | null
          company_id?: string
          created_at?: string
          faceid_enabled?: boolean | null
          gps_enabled?: boolean | null
          gps_locations?: Json | null
          hours_per_day?: number | null
          id?: string
          notify_late?: boolean | null
          qr_enabled?: boolean | null
          round_in_minutes?: number | null
          round_out_minutes?: number | null
          standard_days_per_month?: number | null
          standard_type?: string | null
          updated_at?: string
          wifi_enabled?: boolean | null
          work_days?: string[] | null
          work_end_day?: number | null
          work_start_day?: number | null
        }
        Relationships: []
      }
      attendance_sheets: {
        Row: {
          attendance_type: string
          company_id: string
          created_at: string
          created_by: string | null
          department: string | null
          end_date: string
          id: string
          name: string
          notes: string | null
          positions: string | null
          standard_type: string
          start_date: string
          status: string
          updated_at: string
        }
        Insert: {
          attendance_type?: string
          company_id: string
          created_at?: string
          created_by?: string | null
          department?: string | null
          end_date: string
          id?: string
          name: string
          notes?: string | null
          positions?: string | null
          standard_type?: string
          start_date: string
          status?: string
          updated_at?: string
        }
        Update: {
          attendance_type?: string
          company_id?: string
          created_at?: string
          created_by?: string | null
          department?: string | null
          end_date?: string
          id?: string
          name?: string
          notes?: string | null
          positions?: string | null
          standard_type?: string
          start_date?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      attendance_update_requests: {
        Row: {
          approved_at: string | null
          approver_id: string | null
          approver_name: string | null
          attendance_date: string
          company_id: string
          created_at: string
          current_check_in: string | null
          current_check_out: string | null
          department: string | null
          employee_code: string
          employee_id: string
          employee_name: string
          evidence_url: string | null
          id: string
          notes: string | null
          position: string | null
          reason: string
          rejected_reason: string | null
          requested_check_in: string | null
          requested_check_out: string | null
          status: string
          update_type: string
          updated_at: string
        }
        Insert: {
          approved_at?: string | null
          approver_id?: string | null
          approver_name?: string | null
          attendance_date: string
          company_id: string
          created_at?: string
          current_check_in?: string | null
          current_check_out?: string | null
          department?: string | null
          employee_code: string
          employee_id: string
          employee_name: string
          evidence_url?: string | null
          id?: string
          notes?: string | null
          position?: string | null
          reason: string
          rejected_reason?: string | null
          requested_check_in?: string | null
          requested_check_out?: string | null
          status?: string
          update_type?: string
          updated_at?: string
        }
        Update: {
          approved_at?: string | null
          approver_id?: string | null
          approver_name?: string | null
          attendance_date?: string
          company_id?: string
          created_at?: string
          current_check_in?: string | null
          current_check_out?: string | null
          department?: string | null
          employee_code?: string
          employee_id?: string
          employee_name?: string
          evidence_url?: string | null
          id?: string
          notes?: string | null
          position?: string | null
          reason?: string
          rejected_reason?: string | null
          requested_check_in?: string | null
          requested_check_out?: string | null
          status?: string
          update_type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "attendance_update_requests_approver_id_fkey"
            columns: ["approver_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_update_requests_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_update_requests_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "platform_companies_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_update_requests_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      bonus_policies: {
        Row: {
          applied_departments: string[] | null
          applied_positions: string[] | null
          base_value: number | null
          calculation_method: string
          code: string
          company_id: string
          conditions: string[] | null
          created_at: string
          description: string | null
          effective_date: string
          expiry_date: string | null
          formula: string | null
          id: string
          last_paid_date: string | null
          name: string
          participant_count: number | null
          percentage_base: string | null
          status: string
          tiers: Json | null
          total_paid_amount: number | null
          type: string
          updated_at: string
        }
        Insert: {
          applied_departments?: string[] | null
          applied_positions?: string[] | null
          base_value?: number | null
          calculation_method?: string
          code: string
          company_id: string
          conditions?: string[] | null
          created_at?: string
          description?: string | null
          effective_date: string
          expiry_date?: string | null
          formula?: string | null
          id?: string
          last_paid_date?: string | null
          name: string
          participant_count?: number | null
          percentage_base?: string | null
          status?: string
          tiers?: Json | null
          total_paid_amount?: number | null
          type?: string
          updated_at?: string
        }
        Update: {
          applied_departments?: string[] | null
          applied_positions?: string[] | null
          base_value?: number | null
          calculation_method?: string
          code?: string
          company_id?: string
          conditions?: string[] | null
          created_at?: string
          description?: string | null
          effective_date?: string
          expiry_date?: string | null
          formula?: string | null
          id?: string
          last_paid_date?: string | null
          name?: string
          participant_count?: number | null
          percentage_base?: string | null
          status?: string
          tiers?: Json | null
          total_paid_amount?: number | null
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "bonus_policies_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bonus_policies_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "platform_companies_view"
            referencedColumns: ["id"]
          },
        ]
      }
      bonus_policy_participants: {
        Row: {
          company_id: string
          created_at: string
          department: string | null
          employee_code: string
          employee_id: string | null
          employee_name: string
          id: string
          join_date: string
          last_bonus_amount: number | null
          last_bonus_date: string | null
          policy_id: string
          position: string | null
          status: string
          updated_at: string
        }
        Insert: {
          company_id: string
          created_at?: string
          department?: string | null
          employee_code: string
          employee_id?: string | null
          employee_name: string
          id?: string
          join_date?: string
          last_bonus_amount?: number | null
          last_bonus_date?: string | null
          policy_id: string
          position?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          company_id?: string
          created_at?: string
          department?: string | null
          employee_code?: string
          employee_id?: string | null
          employee_name?: string
          id?: string
          join_date?: string
          last_bonus_amount?: number | null
          last_bonus_date?: string | null
          policy_id?: string
          position?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "bonus_policy_participants_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bonus_policy_participants_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "platform_companies_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bonus_policy_participants_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bonus_policy_participants_policy_id_fkey"
            columns: ["policy_id"]
            isOneToOne: false
            referencedRelation: "bonus_policies"
            referencedColumns: ["id"]
          },
        ]
      }
      business_trip_requests: {
        Row: {
          accommodation: string | null
          actual_cost: number | null
          advance_amount: number | null
          approved_at: string | null
          approver_id: string | null
          approver_name: string | null
          companions: string | null
          company_id: string
          contact_info: string | null
          created_at: string
          department: string | null
          destination: string
          employee_code: string
          employee_id: string
          employee_name: string
          end_date: string
          estimated_cost: number | null
          expense_report_url: string | null
          id: string
          notes: string | null
          position: string | null
          purpose: string
          rejected_reason: string | null
          start_date: string
          status: string
          total_days: number
          transportation: string | null
          updated_at: string
        }
        Insert: {
          accommodation?: string | null
          actual_cost?: number | null
          advance_amount?: number | null
          approved_at?: string | null
          approver_id?: string | null
          approver_name?: string | null
          companions?: string | null
          company_id: string
          contact_info?: string | null
          created_at?: string
          department?: string | null
          destination: string
          employee_code: string
          employee_id: string
          employee_name: string
          end_date: string
          estimated_cost?: number | null
          expense_report_url?: string | null
          id?: string
          notes?: string | null
          position?: string | null
          purpose: string
          rejected_reason?: string | null
          start_date: string
          status?: string
          total_days?: number
          transportation?: string | null
          updated_at?: string
        }
        Update: {
          accommodation?: string | null
          actual_cost?: number | null
          advance_amount?: number | null
          approved_at?: string | null
          approver_id?: string | null
          approver_name?: string | null
          companions?: string | null
          company_id?: string
          contact_info?: string | null
          created_at?: string
          department?: string | null
          destination?: string
          employee_code?: string
          employee_id?: string
          employee_name?: string
          end_date?: string
          estimated_cost?: number | null
          expense_report_url?: string | null
          id?: string
          notes?: string | null
          position?: string | null
          purpose?: string
          rejected_reason?: string | null
          start_date?: string
          status?: string
          total_days?: number
          transportation?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "business_trip_requests_approver_id_fkey"
            columns: ["approver_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "business_trip_requests_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "business_trip_requests_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "platform_companies_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "business_trip_requests_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      candidate_applications: {
        Row: {
          applied_date: string | null
          campaign_id: string | null
          candidate_id: string
          company_id: string
          created_at: string
          id: string
          interview_date: string | null
          interviewer: string | null
          job_posting_id: string
          notes: string | null
          rating: number | null
          salary_expectation: number | null
          stage: string | null
          updated_at: string
        }
        Insert: {
          applied_date?: string | null
          campaign_id?: string | null
          candidate_id: string
          company_id: string
          created_at?: string
          id?: string
          interview_date?: string | null
          interviewer?: string | null
          job_posting_id: string
          notes?: string | null
          rating?: number | null
          salary_expectation?: number | null
          stage?: string | null
          updated_at?: string
        }
        Update: {
          applied_date?: string | null
          campaign_id?: string | null
          candidate_id?: string
          company_id?: string
          created_at?: string
          id?: string
          interview_date?: string | null
          interviewer?: string | null
          job_posting_id?: string
          notes?: string | null
          rating?: number | null
          salary_expectation?: number | null
          stage?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "candidate_applications_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "recruitment_campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "candidate_applications_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "candidates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "candidate_applications_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "candidates_secure"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "candidate_applications_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "candidate_applications_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "platform_companies_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "candidate_applications_job_posting_id_fkey"
            columns: ["job_posting_id"]
            isOneToOne: false
            referencedRelation: "job_postings"
            referencedColumns: ["id"]
          },
        ]
      }
      candidate_evaluation_scores: {
        Row: {
          actual_score: number | null
          category: string
          created_at: string
          criterion_id: string | null
          criterion_name: string
          evaluation_id: string
          id: string
          notes: string | null
          required_score: number
          weight: number
        }
        Insert: {
          actual_score?: number | null
          category: string
          created_at?: string
          criterion_id?: string | null
          criterion_name: string
          evaluation_id: string
          id?: string
          notes?: string | null
          required_score: number
          weight: number
        }
        Update: {
          actual_score?: number | null
          category?: string
          created_at?: string
          criterion_id?: string | null
          criterion_name?: string
          evaluation_id?: string
          id?: string
          notes?: string | null
          required_score?: number
          weight?: number
        }
        Relationships: [
          {
            foreignKeyName: "candidate_evaluation_scores_criterion_id_fkey"
            columns: ["criterion_id"]
            isOneToOne: false
            referencedRelation: "evaluation_criteria"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "candidate_evaluation_scores_evaluation_id_fkey"
            columns: ["evaluation_id"]
            isOneToOne: false
            referencedRelation: "candidate_evaluations"
            referencedColumns: ["id"]
          },
        ]
      }
      candidate_evaluations: {
        Row: {
          candidate_id: string
          company_id: string
          created_at: string
          evaluator_email: string | null
          evaluator_name: string | null
          id: string
          interview_id: string | null
          overall_feedback: string | null
          recommendation: string | null
          result: string | null
          total_score: number | null
          updated_at: string
          weighted_score: number | null
        }
        Insert: {
          candidate_id: string
          company_id: string
          created_at?: string
          evaluator_email?: string | null
          evaluator_name?: string | null
          id?: string
          interview_id?: string | null
          overall_feedback?: string | null
          recommendation?: string | null
          result?: string | null
          total_score?: number | null
          updated_at?: string
          weighted_score?: number | null
        }
        Update: {
          candidate_id?: string
          company_id?: string
          created_at?: string
          evaluator_email?: string | null
          evaluator_name?: string | null
          id?: string
          interview_id?: string | null
          overall_feedback?: string | null
          recommendation?: string | null
          result?: string | null
          total_score?: number | null
          updated_at?: string
          weighted_score?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "candidate_evaluations_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "candidates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "candidate_evaluations_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "candidates_secure"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "candidate_evaluations_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "candidate_evaluations_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "platform_companies_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "candidate_evaluations_interview_id_fkey"
            columns: ["interview_id"]
            isOneToOne: false
            referencedRelation: "interviews"
            referencedColumns: ["id"]
          },
        ]
      }
      candidate_resume_files: {
        Row: {
          candidate_id: string
          company_id: string
          created_at: string
          file_size: string | null
          file_type: string | null
          file_url: string
          id: string
          name: string
          notes: string | null
          updated_at: string
        }
        Insert: {
          candidate_id: string
          company_id: string
          created_at?: string
          file_size?: string | null
          file_type?: string | null
          file_url: string
          id?: string
          name: string
          notes?: string | null
          updated_at?: string
        }
        Update: {
          candidate_id?: string
          company_id?: string
          created_at?: string
          file_size?: string | null
          file_type?: string | null
          file_url?: string
          id?: string
          name?: string
          notes?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "candidate_resume_files_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "candidates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "candidate_resume_files_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "candidates_secure"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "candidate_resume_files_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "candidate_resume_files_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "platform_companies_view"
            referencedColumns: ["id"]
          },
        ]
      }
      candidates: {
        Row: {
          applied_date: string | null
          avatar_url: string | null
          company_id: string
          created_at: string
          email: string
          ethnicity: string | null
          expected_start_date: string | null
          full_name: string
          height: string | null
          hometown: string | null
          id: string
          marital_status: string | null
          military_service: string | null
          nationality: string | null
          notes: string | null
          phone: string | null
          position: string | null
          rating: number | null
          religion: string | null
          source: string | null
          stage: string | null
          updated_at: string
          weight: string | null
        }
        Insert: {
          applied_date?: string | null
          avatar_url?: string | null
          company_id?: string
          created_at?: string
          email: string
          ethnicity?: string | null
          expected_start_date?: string | null
          full_name: string
          height?: string | null
          hometown?: string | null
          id?: string
          marital_status?: string | null
          military_service?: string | null
          nationality?: string | null
          notes?: string | null
          phone?: string | null
          position?: string | null
          rating?: number | null
          religion?: string | null
          source?: string | null
          stage?: string | null
          updated_at?: string
          weight?: string | null
        }
        Update: {
          applied_date?: string | null
          avatar_url?: string | null
          company_id?: string
          created_at?: string
          email?: string
          ethnicity?: string | null
          expected_start_date?: string | null
          full_name?: string
          height?: string | null
          hometown?: string | null
          id?: string
          marital_status?: string | null
          military_service?: string | null
          nationality?: string | null
          notes?: string | null
          phone?: string | null
          position?: string | null
          rating?: number | null
          religion?: string | null
          source?: string | null
          stage?: string | null
          updated_at?: string
          weight?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "candidates_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "candidates_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "platform_companies_view"
            referencedColumns: ["id"]
          },
        ]
      }
      companies: {
        Row: {
          address: string | null
          code: string | null
          created_at: string
          description: string | null
          email: string | null
          employee_count: number | null
          founded_date: string | null
          id: string
          industry: string | null
          logo_url: string | null
          name: string
          phone: string | null
          status: string
          tax_code: string | null
          updated_at: string
          website: string | null
        }
        Insert: {
          address?: string | null
          code?: string | null
          created_at?: string
          description?: string | null
          email?: string | null
          employee_count?: number | null
          founded_date?: string | null
          id?: string
          industry?: string | null
          logo_url?: string | null
          name: string
          phone?: string | null
          status?: string
          tax_code?: string | null
          updated_at?: string
          website?: string | null
        }
        Update: {
          address?: string | null
          code?: string | null
          created_at?: string
          description?: string | null
          email?: string | null
          employee_count?: number | null
          founded_date?: string | null
          id?: string
          industry?: string | null
          logo_url?: string | null
          name?: string
          phone?: string | null
          status?: string
          tax_code?: string | null
          updated_at?: string
          website?: string | null
        }
        Relationships: []
      }
      company_processes: {
        Row: {
          category: string | null
          code: string | null
          company_id: string
          content: string | null
          created_at: string
          created_by: string | null
          department: string | null
          description: string | null
          effective_date: string | null
          expiry_date: string | null
          file_urls: Json | null
          id: string
          issuing_authority: string | null
          name: string
          status: string
          steps: Json | null
          type: string
          updated_at: string
          version: number | null
        }
        Insert: {
          category?: string | null
          code?: string | null
          company_id: string
          content?: string | null
          created_at?: string
          created_by?: string | null
          department?: string | null
          description?: string | null
          effective_date?: string | null
          expiry_date?: string | null
          file_urls?: Json | null
          id?: string
          issuing_authority?: string | null
          name: string
          status?: string
          steps?: Json | null
          type?: string
          updated_at?: string
          version?: number | null
        }
        Update: {
          category?: string | null
          code?: string | null
          company_id?: string
          content?: string | null
          created_at?: string
          created_by?: string | null
          department?: string | null
          description?: string | null
          effective_date?: string | null
          expiry_date?: string | null
          file_urls?: Json | null
          id?: string
          issuing_authority?: string | null
          name?: string
          status?: string
          steps?: Json | null
          type?: string
          updated_at?: string
          version?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "company_processes_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "company_processes_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "platform_companies_view"
            referencedColumns: ["id"]
          },
        ]
      }
      company_subscriptions: {
        Row: {
          company_id: string
          created_at: string
          id: string
          max_employees: number
          plan_code: string
          plan_id: string | null
          status: string
          subscription_end_date: string | null
          subscription_start_date: string | null
          trial_end_date: string
          trial_start_date: string
          updated_at: string
        }
        Insert: {
          company_id: string
          created_at?: string
          id?: string
          max_employees?: number
          plan_code?: string
          plan_id?: string | null
          status?: string
          subscription_end_date?: string | null
          subscription_start_date?: string | null
          trial_end_date?: string
          trial_start_date?: string
          updated_at?: string
        }
        Update: {
          company_id?: string
          created_at?: string
          id?: string
          max_employees?: number
          plan_code?: string
          plan_id?: string | null
          status?: string
          subscription_end_date?: string | null
          subscription_start_date?: string | null
          trial_end_date?: string
          trial_start_date?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "company_subscriptions_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: true
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "company_subscriptions_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: true
            referencedRelation: "platform_companies_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "company_subscriptions_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "subscription_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      company_user_roles: {
        Row: {
          assigned_by: string | null
          company_id: string
          created_at: string | null
          id: string
          role_id: string
          user_id: string
        }
        Insert: {
          assigned_by?: string | null
          company_id: string
          created_at?: string | null
          id?: string
          role_id: string
          user_id: string
        }
        Update: {
          assigned_by?: string | null
          company_id?: string
          created_at?: string | null
          id?: string
          role_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "company_user_roles_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "company_user_roles_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "platform_companies_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "company_user_roles_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "system_roles"
            referencedColumns: ["id"]
          },
        ]
      }
      contracts: {
        Row: {
          company_id: string
          contract_code: string
          contract_type: string
          created_at: string
          created_by: string | null
          department: string | null
          effective_date: string | null
          employee_avatar: string | null
          employee_name: string
          expiry_date: string | null
          file_url: string | null
          id: string
          notes: string | null
          status: string
          updated_at: string
        }
        Insert: {
          company_id?: string
          contract_code: string
          contract_type?: string
          created_at?: string
          created_by?: string | null
          department?: string | null
          effective_date?: string | null
          employee_avatar?: string | null
          employee_name: string
          expiry_date?: string | null
          file_url?: string | null
          id?: string
          notes?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          company_id?: string
          contract_code?: string
          contract_type?: string
          created_at?: string
          created_by?: string | null
          department?: string | null
          effective_date?: string | null
          employee_avatar?: string | null
          employee_name?: string
          expiry_date?: string | null
          file_url?: string | null
          id?: string
          notes?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "contracts_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contracts_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "platform_companies_view"
            referencedColumns: ["id"]
          },
        ]
      }
      departments: {
        Row: {
          code: string | null
          company_id: string
          created_at: string
          description: string | null
          employee_count: number | null
          id: string
          level: number | null
          manager_email: string | null
          manager_name: string | null
          name: string
          parent_id: string | null
          sort_order: number | null
          status: string
          updated_at: string
        }
        Insert: {
          code?: string | null
          company_id: string
          created_at?: string
          description?: string | null
          employee_count?: number | null
          id?: string
          level?: number | null
          manager_email?: string | null
          manager_name?: string | null
          name: string
          parent_id?: string | null
          sort_order?: number | null
          status?: string
          updated_at?: string
        }
        Update: {
          code?: string | null
          company_id?: string
          created_at?: string
          description?: string | null
          employee_count?: number | null
          id?: string
          level?: number | null
          manager_email?: string | null
          manager_name?: string | null
          name?: string
          parent_id?: string | null
          sort_order?: number | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "departments_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "departments_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "platform_companies_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "departments_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
        ]
      }
      employee_assets: {
        Row: {
          asset_code: string
          asset_name: string
          assigned_date: string | null
          brand: string | null
          category: string
          company_id: string
          condition: string
          created_at: string
          employee_id: string
          id: string
          model: string | null
          notes: string | null
          return_date: string | null
          serial_number: string | null
          specifications: string | null
          status: string
          updated_at: string
          value: number
        }
        Insert: {
          asset_code: string
          asset_name: string
          assigned_date?: string | null
          brand?: string | null
          category?: string
          company_id: string
          condition?: string
          created_at?: string
          employee_id: string
          id?: string
          model?: string | null
          notes?: string | null
          return_date?: string | null
          serial_number?: string | null
          specifications?: string | null
          status?: string
          updated_at?: string
          value?: number
        }
        Update: {
          asset_code?: string
          asset_name?: string
          assigned_date?: string | null
          brand?: string | null
          category?: string
          company_id?: string
          condition?: string
          created_at?: string
          employee_id?: string
          id?: string
          model?: string | null
          notes?: string | null
          return_date?: string | null
          serial_number?: string | null
          specifications?: string | null
          status?: string
          updated_at?: string
          value?: number
        }
        Relationships: [
          {
            foreignKeyName: "employee_assets_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employee_assets_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "platform_companies_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employee_assets_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      employee_benefits: {
        Row: {
          category: string
          company_id: string
          created_at: string
          description: string | null
          employee_id: string
          end_date: string | null
          frequency: string
          id: string
          name: string
          start_date: string | null
          status: string
          unit: string
          updated_at: string
          value: number
        }
        Insert: {
          category?: string
          company_id: string
          created_at?: string
          description?: string | null
          employee_id: string
          end_date?: string | null
          frequency?: string
          id?: string
          name: string
          start_date?: string | null
          status?: string
          unit?: string
          updated_at?: string
          value?: number
        }
        Update: {
          category?: string
          company_id?: string
          created_at?: string
          description?: string | null
          employee_id?: string
          end_date?: string | null
          frequency?: string
          id?: string
          name?: string
          start_date?: string | null
          status?: string
          unit?: string
          updated_at?: string
          value?: number
        }
        Relationships: []
      }
      employee_certificates: {
        Row: {
          certificate_id: string | null
          company_id: string
          created_at: string
          employee_id: string
          expiry_date: string | null
          file_name: string | null
          file_url: string | null
          id: string
          issue_date: string | null
          issuing_org: string
          name: string
          notes: string | null
          score: string | null
          status: string
          updated_at: string
        }
        Insert: {
          certificate_id?: string | null
          company_id: string
          created_at?: string
          employee_id: string
          expiry_date?: string | null
          file_name?: string | null
          file_url?: string | null
          id?: string
          issue_date?: string | null
          issuing_org: string
          name: string
          notes?: string | null
          score?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          certificate_id?: string | null
          company_id?: string
          created_at?: string
          employee_id?: string
          expiry_date?: string | null
          file_name?: string | null
          file_url?: string | null
          id?: string
          issue_date?: string | null
          issuing_org?: string
          name?: string
          notes?: string | null
          score?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      employee_contracts: {
        Row: {
          company_id: string
          contract_code: string
          contract_type: string
          created_at: string
          created_by: string | null
          department: string | null
          effective_date: string | null
          employee_id: string
          expiry_date: string | null
          file_url: string | null
          id: string
          notes: string | null
          position: string | null
          probation_end_date: string | null
          probation_period: number | null
          renewed_from_id: string | null
          salary: number | null
          signer_name: string | null
          signer_position: string | null
          signing_date: string | null
          status: string
          updated_at: string
          work_location: string | null
        }
        Insert: {
          company_id: string
          contract_code: string
          contract_type?: string
          created_at?: string
          created_by?: string | null
          department?: string | null
          effective_date?: string | null
          employee_id: string
          expiry_date?: string | null
          file_url?: string | null
          id?: string
          notes?: string | null
          position?: string | null
          probation_end_date?: string | null
          probation_period?: number | null
          renewed_from_id?: string | null
          salary?: number | null
          signer_name?: string | null
          signer_position?: string | null
          signing_date?: string | null
          status?: string
          updated_at?: string
          work_location?: string | null
        }
        Update: {
          company_id?: string
          contract_code?: string
          contract_type?: string
          created_at?: string
          created_by?: string | null
          department?: string | null
          effective_date?: string | null
          employee_id?: string
          expiry_date?: string | null
          file_url?: string | null
          id?: string
          notes?: string | null
          position?: string | null
          probation_end_date?: string | null
          probation_period?: number | null
          renewed_from_id?: string | null
          salary?: number | null
          signer_name?: string | null
          signer_position?: string | null
          signing_date?: string | null
          status?: string
          updated_at?: string
          work_location?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "employee_contracts_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employee_contracts_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "platform_companies_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employee_contracts_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employee_contracts_renewed_from_id_fkey"
            columns: ["renewed_from_id"]
            isOneToOne: false
            referencedRelation: "employee_contracts"
            referencedColumns: ["id"]
          },
        ]
      }
      employee_degrees: {
        Row: {
          company_id: string
          created_at: string
          degree_number: string | null
          employee_id: string
          file_name: string | null
          file_url: string | null
          grade: string | null
          graduation_year: string | null
          id: string
          institution: string
          major: string
          name: string
          notes: string | null
          updated_at: string
        }
        Insert: {
          company_id: string
          created_at?: string
          degree_number?: string | null
          employee_id: string
          file_name?: string | null
          file_url?: string | null
          grade?: string | null
          graduation_year?: string | null
          id?: string
          institution: string
          major: string
          name: string
          notes?: string | null
          updated_at?: string
        }
        Update: {
          company_id?: string
          created_at?: string
          degree_number?: string | null
          employee_id?: string
          file_name?: string | null
          file_url?: string | null
          grade?: string | null
          graduation_year?: string | null
          id?: string
          institution?: string
          major?: string
          name?: string
          notes?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      employee_emergency_contacts: {
        Row: {
          company_id: string
          created_at: string
          employee_id: string
          id: string
          is_primary: boolean | null
          name: string
          notes: string | null
          phone: string
          relationship: string
          updated_at: string
        }
        Insert: {
          company_id: string
          created_at?: string
          employee_id: string
          id?: string
          is_primary?: boolean | null
          name: string
          notes?: string | null
          phone: string
          relationship: string
          updated_at?: string
        }
        Update: {
          company_id?: string
          created_at?: string
          employee_id?: string
          id?: string
          is_primary?: boolean | null
          name?: string
          notes?: string | null
          phone?: string
          relationship?: string
          updated_at?: string
        }
        Relationships: []
      }
      employee_face_data: {
        Row: {
          company_id: string
          created_at: string
          employee_id: string
          face_descriptor: Json
          face_image_url: string | null
          id: string
          updated_at: string
        }
        Insert: {
          company_id: string
          created_at?: string
          employee_id: string
          face_descriptor: Json
          face_image_url?: string | null
          id?: string
          updated_at?: string
        }
        Update: {
          company_id?: string
          created_at?: string
          employee_id?: string
          face_descriptor?: Json
          face_image_url?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "employee_face_data_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employee_face_data_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "platform_companies_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employee_face_data_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: true
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      employee_family_members: {
        Row: {
          address: string | null
          birth_year: string | null
          company_id: string
          created_at: string
          employee_id: string
          full_name: string
          id: string
          is_dependant: boolean | null
          notes: string | null
          occupation: string | null
          phone: string | null
          relationship: string
          updated_at: string
        }
        Insert: {
          address?: string | null
          birth_year?: string | null
          company_id: string
          created_at?: string
          employee_id: string
          full_name: string
          id?: string
          is_dependant?: boolean | null
          notes?: string | null
          occupation?: string | null
          phone?: string | null
          relationship: string
          updated_at?: string
        }
        Update: {
          address?: string | null
          birth_year?: string | null
          company_id?: string
          created_at?: string
          employee_id?: string
          full_name?: string
          id?: string
          is_dependant?: boolean | null
          notes?: string | null
          occupation?: string | null
          phone?: string | null
          relationship?: string
          updated_at?: string
        }
        Relationships: []
      }
      employee_history: {
        Row: {
          action: string
          changes: Json | null
          company_id: string
          created_at: string
          employee_id: string
          id: string
          performed_by: string | null
          performed_by_name: string | null
          reason: string | null
        }
        Insert: {
          action: string
          changes?: Json | null
          company_id: string
          created_at?: string
          employee_id: string
          id?: string
          performed_by?: string | null
          performed_by_name?: string | null
          reason?: string | null
        }
        Update: {
          action?: string
          changes?: Json | null
          company_id?: string
          created_at?: string
          employee_id?: string
          id?: string
          performed_by?: string | null
          performed_by_name?: string | null
          reason?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "employee_history_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employee_history_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "platform_companies_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employee_history_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      employee_insurances: {
        Row: {
          company_id: string
          contribution: number | null
          created_at: string
          employee_id: string
          employer_contribution: number | null
          end_date: string | null
          id: string
          notes: string | null
          policy_number: string | null
          provider: string
          start_date: string | null
          status: string
          type: string
          updated_at: string
        }
        Insert: {
          company_id: string
          contribution?: number | null
          created_at?: string
          employee_id: string
          employer_contribution?: number | null
          end_date?: string | null
          id?: string
          notes?: string | null
          policy_number?: string | null
          provider: string
          start_date?: string | null
          status?: string
          type?: string
          updated_at?: string
        }
        Update: {
          company_id?: string
          contribution?: number | null
          created_at?: string
          employee_id?: string
          employer_contribution?: number | null
          end_date?: string | null
          id?: string
          notes?: string | null
          policy_number?: string | null
          provider?: string
          start_date?: string | null
          status?: string
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      employee_kpis: {
        Row: {
          actual_value: number | null
          category: string
          company_id: string
          created_at: string
          employee_id: string
          id: string
          kpi_name: string
          notes: string | null
          period_end: string
          period_name: string
          period_start: string
          score: number | null
          status: string
          target_value: number
          unit: string | null
          updated_at: string
          weight: number
        }
        Insert: {
          actual_value?: number | null
          category?: string
          company_id: string
          created_at?: string
          employee_id: string
          id?: string
          kpi_name: string
          notes?: string | null
          period_end: string
          period_name: string
          period_start: string
          score?: number | null
          status?: string
          target_value?: number
          unit?: string | null
          updated_at?: string
          weight?: number
        }
        Update: {
          actual_value?: number | null
          category?: string
          company_id?: string
          created_at?: string
          employee_id?: string
          id?: string
          kpi_name?: string
          notes?: string | null
          period_end?: string
          period_name?: string
          period_start?: string
          score?: number | null
          status?: string
          target_value?: number
          unit?: string | null
          updated_at?: string
          weight?: number
        }
        Relationships: [
          {
            foreignKeyName: "employee_kpis_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employee_kpis_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "platform_companies_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employee_kpis_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      employee_resume_files: {
        Row: {
          company_id: string
          created_at: string
          employee_id: string
          file_size: string | null
          file_type: string | null
          file_url: string
          id: string
          name: string
          notes: string | null
          updated_at: string
        }
        Insert: {
          company_id: string
          created_at?: string
          employee_id: string
          file_size?: string | null
          file_type?: string | null
          file_url: string
          id?: string
          name: string
          notes?: string | null
          updated_at?: string
        }
        Update: {
          company_id?: string
          created_at?: string
          employee_id?: string
          file_size?: string | null
          file_type?: string | null
          file_url?: string
          id?: string
          name?: string
          notes?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      employee_salary_components: {
        Row: {
          company_id: string
          component_id: string
          created_at: string
          effective_from: string
          effective_to: string | null
          employee_id: string
          id: string
          notes: string | null
          updated_at: string
          value: number
        }
        Insert: {
          company_id: string
          component_id: string
          created_at?: string
          effective_from?: string
          effective_to?: string | null
          employee_id: string
          id?: string
          notes?: string | null
          updated_at?: string
          value?: number
        }
        Update: {
          company_id?: string
          component_id?: string
          created_at?: string
          effective_from?: string
          effective_to?: string | null
          employee_id?: string
          id?: string
          notes?: string | null
          updated_at?: string
          value?: number
        }
        Relationships: [
          {
            foreignKeyName: "employee_salary_components_component_id_fkey"
            columns: ["component_id"]
            isOneToOne: false
            referencedRelation: "salary_components"
            referencedColumns: ["id"]
          },
        ]
      }
      employee_salary_templates: {
        Row: {
          assigned_by: string | null
          company_id: string
          created_at: string
          effective_from: string
          effective_to: string | null
          employee_id: string
          id: string
          is_active: boolean | null
          notes: string | null
          template_id: string
          updated_at: string
        }
        Insert: {
          assigned_by?: string | null
          company_id: string
          created_at?: string
          effective_from?: string
          effective_to?: string | null
          employee_id: string
          id?: string
          is_active?: boolean | null
          notes?: string | null
          template_id: string
          updated_at?: string
        }
        Update: {
          assigned_by?: string | null
          company_id?: string
          created_at?: string
          effective_from?: string
          effective_to?: string | null
          employee_id?: string
          id?: string
          is_active?: boolean | null
          notes?: string | null
          template_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "employee_salary_templates_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employee_salary_templates_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "platform_companies_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employee_salary_templates_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employee_salary_templates_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "salary_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      employee_shift_assignments: {
        Row: {
          assignment_date: string
          company_id: string
          created_at: string
          employee_id: string
          id: string
          notes: string | null
          shift_id: string
          status: string
          updated_at: string
        }
        Insert: {
          assignment_date: string
          company_id: string
          created_at?: string
          employee_id: string
          id?: string
          notes?: string | null
          shift_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          assignment_date?: string
          company_id?: string
          created_at?: string
          employee_id?: string
          id?: string
          notes?: string | null
          shift_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "employee_shift_assignments_shift_id_fkey"
            columns: ["shift_id"]
            isOneToOne: false
            referencedRelation: "work_shifts"
            referencedColumns: ["id"]
          },
        ]
      }
      employee_skills: {
        Row: {
          category: string
          company_id: string
          created_at: string
          employee_id: string
          id: string
          level: number
          name: string
          notes: string | null
          updated_at: string
        }
        Insert: {
          category: string
          company_id: string
          created_at?: string
          employee_id: string
          id?: string
          level?: number
          name: string
          notes?: string | null
          updated_at?: string
        }
        Update: {
          category?: string
          company_id?: string
          created_at?: string
          employee_id?: string
          id?: string
          level?: number
          name?: string
          notes?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      employee_trainings: {
        Row: {
          category: string
          certificate_file_url: string | null
          certificate_number: string | null
          company_id: string
          cost: number | null
          created_at: string
          description: string | null
          duration: number | null
          duration_unit: string | null
          employee_id: string
          end_date: string | null
          id: string
          instructor: string | null
          location: string | null
          name: string
          paid_by: string | null
          progress: number | null
          provider: string | null
          score: number | null
          skills: string[] | null
          start_date: string | null
          status: string
          type: string
          updated_at: string
        }
        Insert: {
          category?: string
          certificate_file_url?: string | null
          certificate_number?: string | null
          company_id: string
          cost?: number | null
          created_at?: string
          description?: string | null
          duration?: number | null
          duration_unit?: string | null
          employee_id: string
          end_date?: string | null
          id?: string
          instructor?: string | null
          location?: string | null
          name: string
          paid_by?: string | null
          progress?: number | null
          provider?: string | null
          score?: number | null
          skills?: string[] | null
          start_date?: string | null
          status?: string
          type?: string
          updated_at?: string
        }
        Update: {
          category?: string
          certificate_file_url?: string | null
          certificate_number?: string | null
          company_id?: string
          cost?: number | null
          created_at?: string
          description?: string | null
          duration?: number | null
          duration_unit?: string | null
          employee_id?: string
          end_date?: string | null
          id?: string
          instructor?: string | null
          location?: string | null
          name?: string
          paid_by?: string | null
          progress?: number | null
          provider?: string | null
          score?: number | null
          skills?: string[] | null
          start_date?: string | null
          status?: string
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      employee_work_history: {
        Row: {
          company_id: string
          contract_code: string | null
          created_at: string
          department: string | null
          description: string | null
          employee_id: string
          event_date: string
          event_type: string
          id: string
          notes: string | null
          position: string | null
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          company_id: string
          contract_code?: string | null
          created_at?: string
          department?: string | null
          description?: string | null
          employee_id: string
          event_date: string
          event_type?: string
          id?: string
          notes?: string | null
          position?: string | null
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          company_id?: string
          contract_code?: string | null
          created_at?: string
          department?: string | null
          description?: string | null
          employee_id?: string
          event_date?: string
          event_type?: string
          id?: string
          notes?: string | null
          position?: string | null
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      employees: {
        Row: {
          avatar_url: string | null
          bank_account: string | null
          bank_name: string | null
          birth_date: string | null
          company_id: string
          created_at: string
          delete_reason: string | null
          deleted_at: string | null
          deleted_by: string | null
          department: string | null
          email: string | null
          emergency_contact: string | null
          emergency_phone: string | null
          employee_code: string
          employment_type: string | null
          end_date: string | null
          full_name: string
          gender: string | null
          health_insurance_number: string | null
          id: string
          id_issue_date: string | null
          id_issue_place: string | null
          id_number: string | null
          manager_id: string | null
          permanent_address: string | null
          phone: string | null
          position: string | null
          salary: number | null
          social_insurance_number: string | null
          start_date: string | null
          status: string
          tax_code: string | null
          temporary_address: string | null
          updated_at: string
          work_location: string | null
        }
        Insert: {
          avatar_url?: string | null
          bank_account?: string | null
          bank_name?: string | null
          birth_date?: string | null
          company_id: string
          created_at?: string
          delete_reason?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          department?: string | null
          email?: string | null
          emergency_contact?: string | null
          emergency_phone?: string | null
          employee_code: string
          employment_type?: string | null
          end_date?: string | null
          full_name: string
          gender?: string | null
          health_insurance_number?: string | null
          id?: string
          id_issue_date?: string | null
          id_issue_place?: string | null
          id_number?: string | null
          manager_id?: string | null
          permanent_address?: string | null
          phone?: string | null
          position?: string | null
          salary?: number | null
          social_insurance_number?: string | null
          start_date?: string | null
          status?: string
          tax_code?: string | null
          temporary_address?: string | null
          updated_at?: string
          work_location?: string | null
        }
        Update: {
          avatar_url?: string | null
          bank_account?: string | null
          bank_name?: string | null
          birth_date?: string | null
          company_id?: string
          created_at?: string
          delete_reason?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          department?: string | null
          email?: string | null
          emergency_contact?: string | null
          emergency_phone?: string | null
          employee_code?: string
          employment_type?: string | null
          end_date?: string | null
          full_name?: string
          gender?: string | null
          health_insurance_number?: string | null
          id?: string
          id_issue_date?: string | null
          id_issue_place?: string | null
          id_number?: string | null
          manager_id?: string | null
          permanent_address?: string | null
          phone?: string | null
          position?: string | null
          salary?: number | null
          social_insurance_number?: string | null
          start_date?: string | null
          status?: string
          tax_code?: string | null
          temporary_address?: string | null
          updated_at?: string
          work_location?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "employees_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employees_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "platform_companies_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employees_manager_id_fkey"
            columns: ["manager_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      evaluation_criteria: {
        Row: {
          category: string
          company_id: string
          created_at: string
          default_required_score: number
          id: string
          is_active: boolean | null
          name: string
          sort_order: number | null
          updated_at: string
          weight: number
        }
        Insert: {
          category: string
          company_id: string
          created_at?: string
          default_required_score?: number
          id?: string
          is_active?: boolean | null
          name: string
          sort_order?: number | null
          updated_at?: string
          weight?: number
        }
        Update: {
          category?: string
          company_id?: string
          created_at?: string
          default_required_score?: number
          id?: string
          is_active?: boolean | null
          name?: string
          sort_order?: number | null
          updated_at?: string
          weight?: number
        }
        Relationships: [
          {
            foreignKeyName: "evaluation_criteria_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "evaluation_criteria_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "platform_companies_view"
            referencedColumns: ["id"]
          },
        ]
      }
      guide_contents: {
        Row: {
          company_id: string | null
          created_at: string
          custom_content: string | null
          custom_title: string | null
          id: string
          image_urls: string[] | null
          section_id: string
          step_index: number | null
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          company_id?: string | null
          created_at?: string
          custom_content?: string | null
          custom_title?: string | null
          id?: string
          image_urls?: string[] | null
          section_id: string
          step_index?: number | null
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          company_id?: string | null
          created_at?: string
          custom_content?: string | null
          custom_title?: string | null
          id?: string
          image_urls?: string[] | null
          section_id?: string
          step_index?: number | null
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "guide_contents_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "guide_contents_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "platform_companies_view"
            referencedColumns: ["id"]
          },
        ]
      }
      headcount_proposals: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          company_id: string
          created_at: string
          current_headcount: number
          department: string
          expected_start_date: string | null
          id: string
          job_description: string | null
          justification: string | null
          notes: string | null
          position_name: string
          priority: string
          proposal_type: string
          rejected_reason: string | null
          requested_by: string
          requested_headcount: number
          requirements: string | null
          salary_budget_max: number | null
          salary_budget_min: number | null
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          company_id?: string
          created_at?: string
          current_headcount?: number
          department: string
          expected_start_date?: string | null
          id?: string
          job_description?: string | null
          justification?: string | null
          notes?: string | null
          position_name: string
          priority?: string
          proposal_type?: string
          rejected_reason?: string | null
          requested_by: string
          requested_headcount?: number
          requirements?: string | null
          salary_budget_max?: number | null
          salary_budget_min?: number | null
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          company_id?: string
          created_at?: string
          current_headcount?: number
          department?: string
          expected_start_date?: string | null
          id?: string
          job_description?: string | null
          justification?: string | null
          notes?: string | null
          position_name?: string
          priority?: string
          proposal_type?: string
          rejected_reason?: string | null
          requested_by?: string
          requested_headcount?: number
          requirements?: string | null
          salary_budget_max?: number | null
          salary_budget_min?: number | null
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "headcount_proposals_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "headcount_proposals_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "platform_companies_view"
            referencedColumns: ["id"]
          },
        ]
      }
      hr_decisions: {
        Row: {
          company_id: string
          content: string | null
          created_at: string
          created_by: string | null
          decision_code: string
          decision_type: string
          department: string | null
          effective_date: string | null
          employee_code: string | null
          employee_id: string | null
          employee_name: string
          expiry_date: string | null
          file_url: string | null
          id: string
          notes: string | null
          position: string | null
          signer_name: string | null
          signer_position: string | null
          signing_date: string | null
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          company_id: string
          content?: string | null
          created_at?: string
          created_by?: string | null
          decision_code: string
          decision_type?: string
          department?: string | null
          effective_date?: string | null
          employee_code?: string | null
          employee_id?: string | null
          employee_name: string
          expiry_date?: string | null
          file_url?: string | null
          id?: string
          notes?: string | null
          position?: string | null
          signer_name?: string | null
          signer_position?: string | null
          signing_date?: string | null
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          company_id?: string
          content?: string | null
          created_at?: string
          created_by?: string | null
          decision_code?: string
          decision_type?: string
          department?: string | null
          effective_date?: string | null
          employee_code?: string | null
          employee_id?: string | null
          employee_name?: string
          expiry_date?: string | null
          file_url?: string | null
          id?: string
          notes?: string | null
          position?: string | null
          signer_name?: string | null
          signer_position?: string | null
          signing_date?: string | null
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "hr_decisions_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hr_decisions_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "platform_companies_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hr_decisions_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      insurance: {
        Row: {
          base_salary: number | null
          company_id: string
          created_at: string
          created_by: string | null
          created_by_position: string | null
          department: string | null
          effective_date: string | null
          employee_avatar: string | null
          employee_code: string
          employee_id: string | null
          employee_name: string
          expiry_date: string | null
          health_insurance_number: string | null
          health_insurance_rate: number | null
          id: string
          insurance_type: string | null
          notes: string | null
          position: string | null
          social_insurance_number: string | null
          social_insurance_rate: number | null
          status: string
          unemployment_insurance_number: string | null
          unemployment_insurance_rate: number | null
          updated_at: string
        }
        Insert: {
          base_salary?: number | null
          company_id?: string
          created_at?: string
          created_by?: string | null
          created_by_position?: string | null
          department?: string | null
          effective_date?: string | null
          employee_avatar?: string | null
          employee_code: string
          employee_id?: string | null
          employee_name: string
          expiry_date?: string | null
          health_insurance_number?: string | null
          health_insurance_rate?: number | null
          id?: string
          insurance_type?: string | null
          notes?: string | null
          position?: string | null
          social_insurance_number?: string | null
          social_insurance_rate?: number | null
          status?: string
          unemployment_insurance_number?: string | null
          unemployment_insurance_rate?: number | null
          updated_at?: string
        }
        Update: {
          base_salary?: number | null
          company_id?: string
          created_at?: string
          created_by?: string | null
          created_by_position?: string | null
          department?: string | null
          effective_date?: string | null
          employee_avatar?: string | null
          employee_code?: string
          employee_id?: string | null
          employee_name?: string
          expiry_date?: string | null
          health_insurance_number?: string | null
          health_insurance_rate?: number | null
          id?: string
          insurance_type?: string | null
          notes?: string | null
          position?: string | null
          social_insurance_number?: string | null
          social_insurance_rate?: number | null
          status?: string
          unemployment_insurance_number?: string | null
          unemployment_insurance_rate?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "insurance_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "insurance_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "platform_companies_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "insurance_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      interviews: {
        Row: {
          candidate_email: string | null
          candidate_id: string | null
          candidate_name: string
          candidate_phone: string | null
          company_id: string
          created_at: string
          created_by: string | null
          duration_minutes: number | null
          feedback: string | null
          id: string
          interview_date: string
          interview_round: number | null
          interview_time: string
          interview_type: string | null
          interviewer_email: string | null
          interviewer_name: string | null
          job_posting_id: string | null
          location: string | null
          meeting_link: string | null
          next_steps: string | null
          notes: string | null
          position: string | null
          rating: number | null
          result: string | null
          status: string | null
          updated_at: string
        }
        Insert: {
          candidate_email?: string | null
          candidate_id?: string | null
          candidate_name: string
          candidate_phone?: string | null
          company_id: string
          created_at?: string
          created_by?: string | null
          duration_minutes?: number | null
          feedback?: string | null
          id?: string
          interview_date: string
          interview_round?: number | null
          interview_time: string
          interview_type?: string | null
          interviewer_email?: string | null
          interviewer_name?: string | null
          job_posting_id?: string | null
          location?: string | null
          meeting_link?: string | null
          next_steps?: string | null
          notes?: string | null
          position?: string | null
          rating?: number | null
          result?: string | null
          status?: string | null
          updated_at?: string
        }
        Update: {
          candidate_email?: string | null
          candidate_id?: string | null
          candidate_name?: string
          candidate_phone?: string | null
          company_id?: string
          created_at?: string
          created_by?: string | null
          duration_minutes?: number | null
          feedback?: string | null
          id?: string
          interview_date?: string
          interview_round?: number | null
          interview_time?: string
          interview_type?: string | null
          interviewer_email?: string | null
          interviewer_name?: string | null
          job_posting_id?: string | null
          location?: string | null
          meeting_link?: string | null
          next_steps?: string | null
          notes?: string | null
          position?: string | null
          rating?: number | null
          result?: string | null
          status?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "interviews_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "candidates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "interviews_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "candidates_secure"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "interviews_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "interviews_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "platform_companies_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "interviews_job_posting_id_fkey"
            columns: ["job_posting_id"]
            isOneToOne: false
            referencedRelation: "job_postings"
            referencedColumns: ["id"]
          },
        ]
      }
      job_postings: {
        Row: {
          applied_count: number | null
          benefits: string | null
          company_id: string
          created_at: string
          created_by: string | null
          deadline: string | null
          department: string | null
          description: string | null
          employment_type: string
          headcount: number
          id: string
          is_salary_visible: boolean | null
          position: string
          priority: string | null
          requirements: string | null
          salary_max: number | null
          salary_min: number | null
          source_proposal_id: string | null
          status: string
          tags: string[] | null
          title: string
          updated_at: string
          work_location: string | null
        }
        Insert: {
          applied_count?: number | null
          benefits?: string | null
          company_id: string
          created_at?: string
          created_by?: string | null
          deadline?: string | null
          department?: string | null
          description?: string | null
          employment_type?: string
          headcount?: number
          id?: string
          is_salary_visible?: boolean | null
          position: string
          priority?: string | null
          requirements?: string | null
          salary_max?: number | null
          salary_min?: number | null
          source_proposal_id?: string | null
          status?: string
          tags?: string[] | null
          title: string
          updated_at?: string
          work_location?: string | null
        }
        Update: {
          applied_count?: number | null
          benefits?: string | null
          company_id?: string
          created_at?: string
          created_by?: string | null
          deadline?: string | null
          department?: string | null
          description?: string | null
          employment_type?: string
          headcount?: number
          id?: string
          is_salary_visible?: boolean | null
          position?: string
          priority?: string | null
          requirements?: string | null
          salary_max?: number | null
          salary_min?: number | null
          source_proposal_id?: string | null
          status?: string
          tags?: string[] | null
          title?: string
          updated_at?: string
          work_location?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "job_postings_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_postings_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "platform_companies_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_postings_source_proposal_id_fkey"
            columns: ["source_proposal_id"]
            isOneToOne: false
            referencedRelation: "headcount_proposals"
            referencedColumns: ["id"]
          },
        ]
      }
      late_early_requests: {
        Row: {
          approved_at: string | null
          approver_id: string | null
          approver_name: string | null
          company_id: string
          created_at: string
          department: string | null
          early_minutes: number | null
          early_time: string | null
          employee_code: string
          employee_id: string
          employee_name: string
          id: string
          late_minutes: number | null
          late_time: string | null
          notes: string | null
          position: string | null
          reason: string
          rejected_reason: string | null
          request_date: string
          request_type: string
          status: string
          updated_at: string
        }
        Insert: {
          approved_at?: string | null
          approver_id?: string | null
          approver_name?: string | null
          company_id: string
          created_at?: string
          department?: string | null
          early_minutes?: number | null
          early_time?: string | null
          employee_code: string
          employee_id: string
          employee_name: string
          id?: string
          late_minutes?: number | null
          late_time?: string | null
          notes?: string | null
          position?: string | null
          reason: string
          rejected_reason?: string | null
          request_date: string
          request_type?: string
          status?: string
          updated_at?: string
        }
        Update: {
          approved_at?: string | null
          approver_id?: string | null
          approver_name?: string | null
          company_id?: string
          created_at?: string
          department?: string | null
          early_minutes?: number | null
          early_time?: string | null
          employee_code?: string
          employee_id?: string
          employee_name?: string
          id?: string
          late_minutes?: number | null
          late_time?: string | null
          notes?: string | null
          position?: string | null
          reason?: string
          rejected_reason?: string | null
          request_date?: string
          request_type?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "late_early_requests_approver_id_fkey"
            columns: ["approver_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "late_early_requests_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "late_early_requests_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "platform_companies_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "late_early_requests_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      leave_requests: {
        Row: {
          approved_at: string | null
          approver_id: string | null
          approver_name: string | null
          attachment_url: string | null
          company_id: string
          created_at: string
          department: string | null
          employee_code: string
          employee_id: string
          employee_name: string
          end_date: string
          handover_tasks: string | null
          handover_to: string | null
          id: string
          leave_type: string
          notes: string | null
          position: string | null
          reason: string | null
          rejected_reason: string | null
          start_date: string
          status: string
          total_days: number
          updated_at: string
        }
        Insert: {
          approved_at?: string | null
          approver_id?: string | null
          approver_name?: string | null
          attachment_url?: string | null
          company_id: string
          created_at?: string
          department?: string | null
          employee_code: string
          employee_id: string
          employee_name: string
          end_date: string
          handover_tasks?: string | null
          handover_to?: string | null
          id?: string
          leave_type?: string
          notes?: string | null
          position?: string | null
          reason?: string | null
          rejected_reason?: string | null
          start_date: string
          status?: string
          total_days?: number
          updated_at?: string
        }
        Update: {
          approved_at?: string | null
          approver_id?: string | null
          approver_name?: string | null
          attachment_url?: string | null
          company_id?: string
          created_at?: string
          department?: string | null
          employee_code?: string
          employee_id?: string
          employee_name?: string
          end_date?: string
          handover_tasks?: string | null
          handover_to?: string | null
          id?: string
          leave_type?: string
          notes?: string | null
          position?: string | null
          reason?: string | null
          rejected_reason?: string | null
          start_date?: string
          status?: string
          total_days?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "leave_requests_approver_id_fkey"
            columns: ["approver_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leave_requests_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leave_requests_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "platform_companies_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leave_requests_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      overtime_requests: {
        Row: {
          actual_hours: number | null
          approved_at: string | null
          approver_id: string | null
          approver_name: string | null
          coefficient: number | null
          company_id: string
          compensation_type: string | null
          created_at: string
          department: string | null
          employee_code: string
          employee_id: string
          employee_name: string
          end_time: string
          id: string
          notes: string | null
          overtime_date: string
          overtime_type: string
          position: string | null
          reason: string
          rejected_reason: string | null
          start_time: string
          status: string
          total_hours: number
          updated_at: string
        }
        Insert: {
          actual_hours?: number | null
          approved_at?: string | null
          approver_id?: string | null
          approver_name?: string | null
          coefficient?: number | null
          company_id: string
          compensation_type?: string | null
          created_at?: string
          department?: string | null
          employee_code: string
          employee_id: string
          employee_name: string
          end_time: string
          id?: string
          notes?: string | null
          overtime_date: string
          overtime_type?: string
          position?: string | null
          reason: string
          rejected_reason?: string | null
          start_time: string
          status?: string
          total_hours?: number
          updated_at?: string
        }
        Update: {
          actual_hours?: number | null
          approved_at?: string | null
          approver_id?: string | null
          approver_name?: string | null
          coefficient?: number | null
          company_id?: string
          compensation_type?: string | null
          created_at?: string
          department?: string | null
          employee_code?: string
          employee_id?: string
          employee_name?: string
          end_time?: string
          id?: string
          notes?: string | null
          overtime_date?: string
          overtime_type?: string
          position?: string | null
          reason?: string
          rejected_reason?: string | null
          start_time?: string
          status?: string
          total_hours?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "overtime_requests_approver_id_fkey"
            columns: ["approver_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "overtime_requests_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "overtime_requests_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "platform_companies_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "overtime_requests_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_batches: {
        Row: {
          bank_name: string | null
          company_id: string
          created_at: string
          created_by: string | null
          department: string | null
          employee_count: number | null
          id: string
          name: string
          paid_amount: number | null
          paid_count: number | null
          payment_date: string | null
          payment_method: string
          payroll_batch_id: string | null
          position: string | null
          processed_at: string | null
          processed_by: string | null
          salary_period: string
          status: string
          total_amount: number | null
          updated_at: string
        }
        Insert: {
          bank_name?: string | null
          company_id: string
          created_at?: string
          created_by?: string | null
          department?: string | null
          employee_count?: number | null
          id?: string
          name: string
          paid_amount?: number | null
          paid_count?: number | null
          payment_date?: string | null
          payment_method?: string
          payroll_batch_id?: string | null
          position?: string | null
          processed_at?: string | null
          processed_by?: string | null
          salary_period: string
          status?: string
          total_amount?: number | null
          updated_at?: string
        }
        Update: {
          bank_name?: string | null
          company_id?: string
          created_at?: string
          created_by?: string | null
          department?: string | null
          employee_count?: number | null
          id?: string
          name?: string
          paid_amount?: number | null
          paid_count?: number | null
          payment_date?: string | null
          payment_method?: string
          payroll_batch_id?: string | null
          position?: string | null
          processed_at?: string | null
          processed_by?: string | null
          salary_period?: string
          status?: string
          total_amount?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payment_batches_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_batches_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "platform_companies_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_batches_payroll_batch_id_fkey"
            columns: ["payroll_batch_id"]
            isOneToOne: false
            referencedRelation: "payroll_batches"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_records: {
        Row: {
          amount: number
          bank_account: string | null
          bank_name: string | null
          company_id: string
          created_at: string
          department: string | null
          employee_code: string
          employee_id: string | null
          employee_name: string
          id: string
          notes: string | null
          paid_at: string | null
          payment_batch_id: string
          payroll_record_id: string | null
          status: string
          transaction_ref: string | null
          updated_at: string
        }
        Insert: {
          amount?: number
          bank_account?: string | null
          bank_name?: string | null
          company_id: string
          created_at?: string
          department?: string | null
          employee_code: string
          employee_id?: string | null
          employee_name: string
          id?: string
          notes?: string | null
          paid_at?: string | null
          payment_batch_id: string
          payroll_record_id?: string | null
          status?: string
          transaction_ref?: string | null
          updated_at?: string
        }
        Update: {
          amount?: number
          bank_account?: string | null
          bank_name?: string | null
          company_id?: string
          created_at?: string
          department?: string | null
          employee_code?: string
          employee_id?: string | null
          employee_name?: string
          id?: string
          notes?: string | null
          paid_at?: string | null
          payment_batch_id?: string
          payroll_record_id?: string | null
          status?: string
          transaction_ref?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payment_records_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_records_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "platform_companies_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_records_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_records_payment_batch_id_fkey"
            columns: ["payment_batch_id"]
            isOneToOne: false
            referencedRelation: "payment_batches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_records_payroll_record_id_fkey"
            columns: ["payroll_record_id"]
            isOneToOne: false
            referencedRelation: "payroll_records"
            referencedColumns: ["id"]
          },
        ]
      }
      payroll_batches: {
        Row: {
          approval_steps: Json | null
          company_id: string
          created_at: string
          created_by: string | null
          current_approval_level: number | null
          department: string | null
          employee_count: number | null
          id: string
          locked_at: string | null
          locked_by: string | null
          name: string
          period_month: number
          period_year: number
          position: string | null
          salary_period: string
          status: string
          template_id: string | null
          total_deduction: number | null
          total_gross: number | null
          total_net: number | null
          updated_at: string
        }
        Insert: {
          approval_steps?: Json | null
          company_id: string
          created_at?: string
          created_by?: string | null
          current_approval_level?: number | null
          department?: string | null
          employee_count?: number | null
          id?: string
          locked_at?: string | null
          locked_by?: string | null
          name: string
          period_month: number
          period_year: number
          position?: string | null
          salary_period: string
          status?: string
          template_id?: string | null
          total_deduction?: number | null
          total_gross?: number | null
          total_net?: number | null
          updated_at?: string
        }
        Update: {
          approval_steps?: Json | null
          company_id?: string
          created_at?: string
          created_by?: string | null
          current_approval_level?: number | null
          department?: string | null
          employee_count?: number | null
          id?: string
          locked_at?: string | null
          locked_by?: string | null
          name?: string
          period_month?: number
          period_year?: number
          position?: string | null
          salary_period?: string
          status?: string
          template_id?: string | null
          total_deduction?: number | null
          total_gross?: number | null
          total_net?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payroll_batches_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payroll_batches_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "platform_companies_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payroll_batches_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "salary_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      payroll_records: {
        Row: {
          actual_work_days: number | null
          allowances: number | null
          base_salary: number | null
          batch_id: string
          bonus: number | null
          company_id: string
          component_values: Json | null
          created_at: string
          department: string | null
          employee_code: string
          employee_id: string | null
          employee_name: string
          gross_salary: number | null
          id: string
          insurance_deduction: number | null
          late_days: number | null
          leave_days: number | null
          net_salary: number | null
          notes: string | null
          other_deduction: number | null
          overtime: number | null
          overtime_hours: number | null
          position: string | null
          tax_deduction: number | null
          updated_at: string
          work_days: number | null
        }
        Insert: {
          actual_work_days?: number | null
          allowances?: number | null
          base_salary?: number | null
          batch_id: string
          bonus?: number | null
          company_id: string
          component_values?: Json | null
          created_at?: string
          department?: string | null
          employee_code: string
          employee_id?: string | null
          employee_name: string
          gross_salary?: number | null
          id?: string
          insurance_deduction?: number | null
          late_days?: number | null
          leave_days?: number | null
          net_salary?: number | null
          notes?: string | null
          other_deduction?: number | null
          overtime?: number | null
          overtime_hours?: number | null
          position?: string | null
          tax_deduction?: number | null
          updated_at?: string
          work_days?: number | null
        }
        Update: {
          actual_work_days?: number | null
          allowances?: number | null
          base_salary?: number | null
          batch_id?: string
          bonus?: number | null
          company_id?: string
          component_values?: Json | null
          created_at?: string
          department?: string | null
          employee_code?: string
          employee_id?: string | null
          employee_name?: string
          gross_salary?: number | null
          id?: string
          insurance_deduction?: number | null
          late_days?: number | null
          leave_days?: number | null
          net_salary?: number | null
          notes?: string | null
          other_deduction?: number | null
          overtime?: number | null
          overtime_hours?: number | null
          position?: string | null
          tax_deduction?: number | null
          updated_at?: string
          work_days?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "payroll_records_batch_id_fkey"
            columns: ["batch_id"]
            isOneToOne: false
            referencedRelation: "payroll_batches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payroll_records_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payroll_records_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "platform_companies_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payroll_records_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      permissions: {
        Row: {
          action: string
          created_at: string | null
          description: string | null
          id: string
          module: string
        }
        Insert: {
          action: string
          created_at?: string | null
          description?: string | null
          id?: string
          module: string
        }
        Update: {
          action?: string
          created_at?: string | null
          description?: string | null
          id?: string
          module?: string
        }
        Relationships: []
      }
      platform_admins: {
        Row: {
          email: string
          granted_at: string
          granted_by: string | null
          id: string
          user_id: string
        }
        Insert: {
          email: string
          granted_at?: string
          granted_by?: string | null
          id?: string
          user_id: string
        }
        Update: {
          email?: string
          granted_at?: string
          granted_by?: string | null
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          job_title: string | null
          onboarding_completed: boolean | null
          phone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          job_title?: string | null
          onboarding_completed?: boolean | null
          phone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          job_title?: string | null
          onboarding_completed?: boolean | null
          phone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      recruitment_campaigns: {
        Row: {
          company_id: string
          created_at: string
          created_by: string | null
          degree: string | null
          department: string | null
          description: string | null
          end_date: string | null
          evaluation_criteria: string | null
          follower_name: string | null
          id: string
          location: string | null
          major: string | null
          name: string
          owner_name: string | null
          position: string | null
          quantity: number | null
          requirements: string | null
          salary_level: string | null
          start_date: string
          status: string
          tags: string[] | null
          title: string | null
          updated_at: string
          work_type: string | null
        }
        Insert: {
          company_id: string
          created_at?: string
          created_by?: string | null
          degree?: string | null
          department?: string | null
          description?: string | null
          end_date?: string | null
          evaluation_criteria?: string | null
          follower_name?: string | null
          id?: string
          location?: string | null
          major?: string | null
          name: string
          owner_name?: string | null
          position?: string | null
          quantity?: number | null
          requirements?: string | null
          salary_level?: string | null
          start_date: string
          status?: string
          tags?: string[] | null
          title?: string | null
          updated_at?: string
          work_type?: string | null
        }
        Update: {
          company_id?: string
          created_at?: string
          created_by?: string | null
          degree?: string | null
          department?: string | null
          description?: string | null
          end_date?: string | null
          evaluation_criteria?: string | null
          follower_name?: string | null
          id?: string
          location?: string | null
          major?: string | null
          name?: string
          owner_name?: string | null
          position?: string | null
          quantity?: number | null
          requirements?: string | null
          salary_level?: string | null
          start_date?: string
          status?: string
          tags?: string[] | null
          title?: string | null
          updated_at?: string
          work_type?: string | null
        }
        Relationships: []
      }
      recruitment_plan_departments: {
        Row: {
          company_id: string
          created_at: string
          id: string
          name: string
          plan_id: string
          sort_order: number | null
          updated_at: string
        }
        Insert: {
          company_id: string
          created_at?: string
          id?: string
          name: string
          plan_id: string
          sort_order?: number | null
          updated_at?: string
        }
        Update: {
          company_id?: string
          created_at?: string
          id?: string
          name?: string
          plan_id?: string
          sort_order?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "recruitment_plan_departments_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recruitment_plan_departments_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "platform_companies_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recruitment_plan_departments_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "recruitment_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      recruitment_plan_positions: {
        Row: {
          company_id: string
          created_at: string
          department_id: string
          id: string
          months_data: Json
          name: string
          sort_order: number | null
          updated_at: string
        }
        Insert: {
          company_id: string
          created_at?: string
          department_id: string
          id?: string
          months_data?: Json
          name: string
          sort_order?: number | null
          updated_at?: string
        }
        Update: {
          company_id?: string
          created_at?: string
          department_id?: string
          id?: string
          months_data?: Json
          name?: string
          sort_order?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "recruitment_plan_positions_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recruitment_plan_positions_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "platform_companies_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recruitment_plan_positions_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "recruitment_plan_departments"
            referencedColumns: ["id"]
          },
        ]
      }
      recruitment_plans: {
        Row: {
          company_id: string
          created_at: string
          creator_id: string | null
          creator_name: string | null
          end_month: number
          id: string
          note: string | null
          start_month: number
          status: string
          title: string
          updated_at: string
          year: number
        }
        Insert: {
          company_id: string
          created_at?: string
          creator_id?: string | null
          creator_name?: string | null
          end_month?: number
          id?: string
          note?: string | null
          start_month?: number
          status?: string
          title: string
          updated_at?: string
          year?: number
        }
        Update: {
          company_id?: string
          created_at?: string
          creator_id?: string | null
          creator_name?: string | null
          end_month?: number
          id?: string
          note?: string | null
          start_month?: number
          status?: string
          title?: string
          updated_at?: string
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "recruitment_plans_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recruitment_plans_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "platform_companies_view"
            referencedColumns: ["id"]
          },
        ]
      }
      role_permissions: {
        Row: {
          created_at: string | null
          id: string
          permission_id: string
          role_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          permission_id: string
          role_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          permission_id?: string
          role_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "role_permissions_permission_id_fkey"
            columns: ["permission_id"]
            isOneToOne: false
            referencedRelation: "permissions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "role_permissions_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "system_roles"
            referencedColumns: ["id"]
          },
        ]
      }
      salary_component_categories: {
        Row: {
          code: string
          company_id: string
          created_at: string
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          sort_order: number | null
          updated_at: string
        }
        Insert: {
          code: string
          company_id: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          sort_order?: number | null
          updated_at?: string
        }
        Update: {
          code?: string
          company_id?: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          sort_order?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      salary_components: {
        Row: {
          applied_to: string | null
          category_id: string | null
          code: string
          company_id: string
          component_type: string
          created_at: string
          default_value: number | null
          description: string | null
          formula: string | null
          id: string
          is_active: boolean | null
          is_insurance_base: boolean | null
          is_taxable: boolean | null
          max_value: number | null
          min_value: number | null
          name: string
          nature: string
          sort_order: number | null
          updated_at: string
          value_type: string
        }
        Insert: {
          applied_to?: string | null
          category_id?: string | null
          code: string
          company_id: string
          component_type?: string
          created_at?: string
          default_value?: number | null
          description?: string | null
          formula?: string | null
          id?: string
          is_active?: boolean | null
          is_insurance_base?: boolean | null
          is_taxable?: boolean | null
          max_value?: number | null
          min_value?: number | null
          name: string
          nature?: string
          sort_order?: number | null
          updated_at?: string
          value_type?: string
        }
        Update: {
          applied_to?: string | null
          category_id?: string | null
          code?: string
          company_id?: string
          component_type?: string
          created_at?: string
          default_value?: number | null
          description?: string | null
          formula?: string | null
          id?: string
          is_active?: boolean | null
          is_insurance_base?: boolean | null
          is_taxable?: boolean | null
          max_value?: number | null
          min_value?: number | null
          name?: string
          nature?: string
          sort_order?: number | null
          updated_at?: string
          value_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "salary_components_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "salary_component_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      salary_template_components: {
        Row: {
          apply_insurance: boolean | null
          apply_tax: boolean | null
          component_id: string
          condition_formula: string | null
          created_at: string
          default_value: number | null
          description: string | null
          formula: string | null
          id: string
          is_editable: boolean | null
          is_required: boolean | null
          is_visible: boolean | null
          max_value: number | null
          min_value: number | null
          sort_order: number | null
          template_id: string
        }
        Insert: {
          apply_insurance?: boolean | null
          apply_tax?: boolean | null
          component_id: string
          condition_formula?: string | null
          created_at?: string
          default_value?: number | null
          description?: string | null
          formula?: string | null
          id?: string
          is_editable?: boolean | null
          is_required?: boolean | null
          is_visible?: boolean | null
          max_value?: number | null
          min_value?: number | null
          sort_order?: number | null
          template_id: string
        }
        Update: {
          apply_insurance?: boolean | null
          apply_tax?: boolean | null
          component_id?: string
          condition_formula?: string | null
          created_at?: string
          default_value?: number | null
          description?: string | null
          formula?: string | null
          id?: string
          is_editable?: boolean | null
          is_required?: boolean | null
          is_visible?: boolean | null
          max_value?: number | null
          min_value?: number | null
          sort_order?: number | null
          template_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "salary_template_components_component_id_fkey"
            columns: ["component_id"]
            isOneToOne: false
            referencedRelation: "salary_components"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "salary_template_components_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "salary_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      salary_templates: {
        Row: {
          applicable_departments: string[] | null
          applicable_employment_types: string[] | null
          applicable_positions: string[] | null
          code: string
          company_id: string
          created_at: string
          description: string | null
          effective_from: string | null
          effective_to: string | null
          id: string
          is_default: boolean | null
          name: string
          net_salary_formula: string | null
          notes: string | null
          parent_template_id: string | null
          status: string
          total_deduction_formula: string | null
          total_income_formula: string | null
          updated_at: string
          version: number | null
        }
        Insert: {
          applicable_departments?: string[] | null
          applicable_employment_types?: string[] | null
          applicable_positions?: string[] | null
          code: string
          company_id: string
          created_at?: string
          description?: string | null
          effective_from?: string | null
          effective_to?: string | null
          id?: string
          is_default?: boolean | null
          name: string
          net_salary_formula?: string | null
          notes?: string | null
          parent_template_id?: string | null
          status?: string
          total_deduction_formula?: string | null
          total_income_formula?: string | null
          updated_at?: string
          version?: number | null
        }
        Update: {
          applicable_departments?: string[] | null
          applicable_employment_types?: string[] | null
          applicable_positions?: string[] | null
          code?: string
          company_id?: string
          created_at?: string
          description?: string | null
          effective_from?: string | null
          effective_to?: string | null
          id?: string
          is_default?: boolean | null
          name?: string
          net_salary_formula?: string | null
          notes?: string | null
          parent_template_id?: string | null
          status?: string
          total_deduction_formula?: string | null
          total_income_formula?: string | null
          updated_at?: string
          version?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "salary_templates_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "salary_templates_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "platform_companies_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "salary_templates_parent_template_id_fkey"
            columns: ["parent_template_id"]
            isOneToOne: false
            referencedRelation: "salary_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      sales_data: {
        Row: {
          achievement_rate: number | null
          actual_sales: number | null
          bonus_amount: number | null
          commission_amount: number | null
          commission_rate: number | null
          company_id: string
          created_at: string
          customer_count: number | null
          department: string | null
          employee_code: string
          employee_id: string | null
          employee_name: string
          external_id: string | null
          id: string
          new_customer_count: number | null
          notes: string | null
          order_count: number | null
          period_month: number
          period_year: number
          position: string | null
          sales_target: number | null
          sync_source: string | null
          synced_at: string | null
          total_earnings: number | null
          updated_at: string
        }
        Insert: {
          achievement_rate?: number | null
          actual_sales?: number | null
          bonus_amount?: number | null
          commission_amount?: number | null
          commission_rate?: number | null
          company_id: string
          created_at?: string
          customer_count?: number | null
          department?: string | null
          employee_code: string
          employee_id?: string | null
          employee_name: string
          external_id?: string | null
          id?: string
          new_customer_count?: number | null
          notes?: string | null
          order_count?: number | null
          period_month: number
          period_year: number
          position?: string | null
          sales_target?: number | null
          sync_source?: string | null
          synced_at?: string | null
          total_earnings?: number | null
          updated_at?: string
        }
        Update: {
          achievement_rate?: number | null
          actual_sales?: number | null
          bonus_amount?: number | null
          commission_amount?: number | null
          commission_rate?: number | null
          company_id?: string
          created_at?: string
          customer_count?: number | null
          department?: string | null
          employee_code?: string
          employee_id?: string | null
          employee_name?: string
          external_id?: string | null
          id?: string
          new_customer_count?: number | null
          notes?: string | null
          order_count?: number | null
          period_month?: number
          period_year?: number
          position?: string | null
          sales_target?: number | null
          sync_source?: string | null
          synced_at?: string | null
          total_earnings?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "sales_data_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sales_data_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "platform_companies_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sales_data_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      service_requests: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          company_id: string
          created_at: string
          department: string | null
          employee_code: string | null
          employee_id: string | null
          employee_name: string
          id: string
          meal_date: string | null
          meal_quantity: number | null
          meal_type: string | null
          notes: string | null
          rejected_reason: string | null
          request_date: string
          service_type: string
          status: string
          supply_items: Json | null
          supply_urgency: string | null
          updated_at: string
          vehicle_date: string | null
          vehicle_destination: string | null
          vehicle_passengers: number | null
          vehicle_purpose: string | null
          vehicle_time_end: string | null
          vehicle_time_start: string | null
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          company_id: string
          created_at?: string
          department?: string | null
          employee_code?: string | null
          employee_id?: string | null
          employee_name: string
          id?: string
          meal_date?: string | null
          meal_quantity?: number | null
          meal_type?: string | null
          notes?: string | null
          rejected_reason?: string | null
          request_date?: string
          service_type: string
          status?: string
          supply_items?: Json | null
          supply_urgency?: string | null
          updated_at?: string
          vehicle_date?: string | null
          vehicle_destination?: string | null
          vehicle_passengers?: number | null
          vehicle_purpose?: string | null
          vehicle_time_end?: string | null
          vehicle_time_start?: string | null
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          company_id?: string
          created_at?: string
          department?: string | null
          employee_code?: string | null
          employee_id?: string | null
          employee_name?: string
          id?: string
          meal_date?: string | null
          meal_quantity?: number | null
          meal_type?: string | null
          notes?: string | null
          rejected_reason?: string | null
          request_date?: string
          service_type?: string
          status?: string
          supply_items?: Json | null
          supply_urgency?: string | null
          updated_at?: string
          vehicle_date?: string | null
          vehicle_destination?: string | null
          vehicle_passengers?: number | null
          vehicle_purpose?: string | null
          vehicle_time_end?: string | null
          vehicle_time_start?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "service_requests_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_requests_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "platform_companies_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_requests_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      shift_change_requests: {
        Row: {
          approved_at: string | null
          approver_id: string | null
          approver_name: string | null
          change_date: string
          change_type: string
          company_id: string
          created_at: string
          current_shift: string
          current_shift_time: string | null
          department: string | null
          employee_code: string
          employee_id: string
          employee_name: string
          id: string
          notes: string | null
          position: string | null
          reason: string
          rejected_reason: string | null
          requested_shift: string
          requested_shift_time: string | null
          status: string
          swap_with_employee_code: string | null
          swap_with_employee_id: string | null
          swap_with_employee_name: string | null
          updated_at: string
        }
        Insert: {
          approved_at?: string | null
          approver_id?: string | null
          approver_name?: string | null
          change_date: string
          change_type?: string
          company_id: string
          created_at?: string
          current_shift: string
          current_shift_time?: string | null
          department?: string | null
          employee_code: string
          employee_id: string
          employee_name: string
          id?: string
          notes?: string | null
          position?: string | null
          reason: string
          rejected_reason?: string | null
          requested_shift: string
          requested_shift_time?: string | null
          status?: string
          swap_with_employee_code?: string | null
          swap_with_employee_id?: string | null
          swap_with_employee_name?: string | null
          updated_at?: string
        }
        Update: {
          approved_at?: string | null
          approver_id?: string | null
          approver_name?: string | null
          change_date?: string
          change_type?: string
          company_id?: string
          created_at?: string
          current_shift?: string
          current_shift_time?: string | null
          department?: string | null
          employee_code?: string
          employee_id?: string
          employee_name?: string
          id?: string
          notes?: string | null
          position?: string | null
          reason?: string
          rejected_reason?: string | null
          requested_shift?: string
          requested_shift_time?: string | null
          status?: string
          swap_with_employee_code?: string | null
          swap_with_employee_id?: string | null
          swap_with_employee_name?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "shift_change_requests_approver_id_fkey"
            columns: ["approver_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shift_change_requests_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shift_change_requests_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "platform_companies_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shift_change_requests_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shift_change_requests_swap_with_employee_id_fkey"
            columns: ["swap_with_employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      subscription_plans: {
        Row: {
          code: string
          created_at: string
          currency: string
          description_en: string | null
          description_vi: string | null
          features_en: Json
          features_vi: Json
          id: string
          is_active: boolean
          is_popular: boolean
          max_employees: number
          name_en: string
          name_vi: string
          price_monthly: number
          price_yearly: number
          sort_order: number
          updated_at: string
        }
        Insert: {
          code: string
          created_at?: string
          currency?: string
          description_en?: string | null
          description_vi?: string | null
          features_en?: Json
          features_vi?: Json
          id?: string
          is_active?: boolean
          is_popular?: boolean
          max_employees?: number
          name_en: string
          name_vi: string
          price_monthly?: number
          price_yearly?: number
          sort_order?: number
          updated_at?: string
        }
        Update: {
          code?: string
          created_at?: string
          currency?: string
          description_en?: string | null
          description_vi?: string | null
          features_en?: Json
          features_vi?: Json
          id?: string
          is_active?: boolean
          is_popular?: boolean
          max_employees?: number
          name_en?: string
          name_vi?: string
          price_monthly?: number
          price_yearly?: number
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      system_announcements: {
        Row: {
          content: string
          created_at: string
          created_by: string | null
          created_by_email: string | null
          expires_at: string | null
          id: string
          is_active: boolean
          priority: string
          starts_at: string
          target: string
          target_company_ids: string[] | null
          title: string
          type: string
          updated_at: string
        }
        Insert: {
          content: string
          created_at?: string
          created_by?: string | null
          created_by_email?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean
          priority?: string
          starts_at?: string
          target?: string
          target_company_ids?: string[] | null
          title: string
          type?: string
          updated_at?: string
        }
        Update: {
          content?: string
          created_at?: string
          created_by?: string | null
          created_by_email?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean
          priority?: string
          starts_at?: string
          target?: string
          target_company_ids?: string[] | null
          title?: string
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      system_audit_logs: {
        Row: {
          action: string
          created_at: string
          details: Json | null
          entity_id: string | null
          entity_name: string | null
          entity_type: string | null
          id: string
          ip_address: string | null
          user_email: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          details?: Json | null
          entity_id?: string | null
          entity_name?: string | null
          entity_type?: string | null
          id?: string
          ip_address?: string | null
          user_email?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          details?: Json | null
          entity_id?: string | null
          entity_name?: string | null
          entity_type?: string | null
          id?: string
          ip_address?: string | null
          user_email?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      system_config: {
        Row: {
          category: string
          description: string | null
          id: string
          key: string
          updated_at: string
          updated_by: string | null
          value: Json
        }
        Insert: {
          category?: string
          description?: string | null
          id?: string
          key: string
          updated_at?: string
          updated_by?: string | null
          value?: Json
        }
        Update: {
          category?: string
          description?: string | null
          id?: string
          key?: string
          updated_at?: string
          updated_by?: string | null
          value?: Json
        }
        Relationships: []
      }
      system_roles: {
        Row: {
          code: string
          created_at: string | null
          description: string | null
          id: string
          level: number
          name: string
        }
        Insert: {
          code: string
          created_at?: string | null
          description?: string | null
          id?: string
          level?: number
          name: string
        }
        Update: {
          code?: string
          created_at?: string | null
          description?: string | null
          id?: string
          level?: number
          name?: string
        }
        Relationships: []
      }
      tasks: {
        Row: {
          assignee_avatar: string | null
          assignee_id: string | null
          assignee_name: string | null
          company_id: string
          completed_date: string | null
          created_at: string
          created_by: string | null
          department: string | null
          description: string | null
          due_date: string | null
          id: string
          meeting_platform: string | null
          meeting_url: string | null
          priority: string
          progress: number
          reporter_id: string | null
          reporter_name: string | null
          start_date: string | null
          status: string
          tags: string[] | null
          title: string
          updated_at: string
          work_mode: string
        }
        Insert: {
          assignee_avatar?: string | null
          assignee_id?: string | null
          assignee_name?: string | null
          company_id: string
          completed_date?: string | null
          created_at?: string
          created_by?: string | null
          department?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          meeting_platform?: string | null
          meeting_url?: string | null
          priority?: string
          progress?: number
          reporter_id?: string | null
          reporter_name?: string | null
          start_date?: string | null
          status?: string
          tags?: string[] | null
          title: string
          updated_at?: string
          work_mode?: string
        }
        Update: {
          assignee_avatar?: string | null
          assignee_id?: string | null
          assignee_name?: string | null
          company_id?: string
          completed_date?: string | null
          created_at?: string
          created_by?: string | null
          department?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          meeting_platform?: string | null
          meeting_url?: string | null
          priority?: string
          progress?: number
          reporter_id?: string | null
          reporter_name?: string | null
          start_date?: string | null
          status?: string
          tags?: string[] | null
          title?: string
          updated_at?: string
          work_mode?: string
        }
        Relationships: [
          {
            foreignKeyName: "tasks_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "platform_companies_view"
            referencedColumns: ["id"]
          },
        ]
      }
      tax_policy_participants: {
        Row: {
          company_id: string
          created_at: string
          created_by: string | null
          created_by_position: string | null
          department: string | null
          dependent_deduction: number | null
          dependents: number | null
          effective_date: string
          employee_code: string
          employee_id: string | null
          employee_name: string
          flat_rate: number | null
          id: string
          notes: string | null
          personal_deduction: number | null
          policy_name: string
          policy_type: string
          position: string | null
          status: string
          updated_at: string
        }
        Insert: {
          company_id: string
          created_at?: string
          created_by?: string | null
          created_by_position?: string | null
          department?: string | null
          dependent_deduction?: number | null
          dependents?: number | null
          effective_date: string
          employee_code: string
          employee_id?: string | null
          employee_name: string
          flat_rate?: number | null
          id?: string
          notes?: string | null
          personal_deduction?: number | null
          policy_name: string
          policy_type?: string
          position?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          company_id?: string
          created_at?: string
          created_by?: string | null
          created_by_position?: string | null
          department?: string | null
          dependent_deduction?: number | null
          dependents?: number | null
          effective_date?: string
          employee_code?: string
          employee_id?: string | null
          employee_name?: string
          flat_rate?: number | null
          id?: string
          notes?: string | null
          personal_deduction?: number | null
          policy_name?: string
          policy_type?: string
          position?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tax_policy_participants_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tax_policy_participants_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "platform_companies_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tax_policy_participants_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      tool_assignments: {
        Row: {
          approved_by: string | null
          assignment_date: string
          assignment_type: string
          company_id: string
          condition_on_assign: string | null
          condition_on_return: string | null
          created_at: string
          department: string | null
          employee_code: string | null
          employee_id: string | null
          employee_name: string
          id: string
          notes: string | null
          quantity: number | null
          return_date: string | null
          status: string
          tool_id: string
          updated_at: string
        }
        Insert: {
          approved_by?: string | null
          assignment_date?: string
          assignment_type?: string
          company_id: string
          condition_on_assign?: string | null
          condition_on_return?: string | null
          created_at?: string
          department?: string | null
          employee_code?: string | null
          employee_id?: string | null
          employee_name: string
          id?: string
          notes?: string | null
          quantity?: number | null
          return_date?: string | null
          status?: string
          tool_id: string
          updated_at?: string
        }
        Update: {
          approved_by?: string | null
          assignment_date?: string
          assignment_type?: string
          company_id?: string
          condition_on_assign?: string | null
          condition_on_return?: string | null
          created_at?: string
          department?: string | null
          employee_code?: string | null
          employee_id?: string | null
          employee_name?: string
          id?: string
          notes?: string | null
          quantity?: number | null
          return_date?: string | null
          status?: string
          tool_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tool_assignments_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tool_assignments_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "platform_companies_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tool_assignments_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tool_assignments_tool_id_fkey"
            columns: ["tool_id"]
            isOneToOne: false
            referencedRelation: "tools_equipment"
            referencedColumns: ["id"]
          },
        ]
      }
      tools_equipment: {
        Row: {
          available_quantity: number | null
          brand: string | null
          category: string | null
          code: string
          company_id: string
          condition: string | null
          created_at: string
          id: string
          location: string | null
          model: string | null
          name: string
          notes: string | null
          purchase_date: string | null
          purchase_price: number | null
          quantity: number | null
          serial_number: string | null
          specifications: string | null
          status: string
          unit: string | null
          updated_at: string
          warranty_expiry: string | null
        }
        Insert: {
          available_quantity?: number | null
          brand?: string | null
          category?: string | null
          code: string
          company_id: string
          condition?: string | null
          created_at?: string
          id?: string
          location?: string | null
          model?: string | null
          name: string
          notes?: string | null
          purchase_date?: string | null
          purchase_price?: number | null
          quantity?: number | null
          serial_number?: string | null
          specifications?: string | null
          status?: string
          unit?: string | null
          updated_at?: string
          warranty_expiry?: string | null
        }
        Update: {
          available_quantity?: number | null
          brand?: string | null
          category?: string | null
          code?: string
          company_id?: string
          condition?: string | null
          created_at?: string
          id?: string
          location?: string | null
          model?: string | null
          name?: string
          notes?: string | null
          purchase_date?: string | null
          purchase_price?: number | null
          quantity?: number | null
          serial_number?: string | null
          specifications?: string | null
          status?: string
          unit?: string | null
          updated_at?: string
          warranty_expiry?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tools_equipment_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tools_equipment_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "platform_companies_view"
            referencedColumns: ["id"]
          },
        ]
      }
      user_company_memberships: {
        Row: {
          avatar_url: string | null
          company_id: string
          created_at: string
          email: string | null
          employee_id: string | null
          full_name: string | null
          id: string
          invited_at: string | null
          invited_by: string | null
          is_primary: boolean | null
          role: string
          status: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          avatar_url?: string | null
          company_id: string
          created_at?: string
          email?: string | null
          employee_id?: string | null
          full_name?: string | null
          id?: string
          invited_at?: string | null
          invited_by?: string | null
          is_primary?: boolean | null
          role?: string
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          avatar_url?: string | null
          company_id?: string
          created_at?: string
          email?: string | null
          employee_id?: string | null
          full_name?: string | null
          id?: string
          invited_at?: string | null
          invited_by?: string | null
          is_primary?: boolean | null
          role?: string
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_company_memberships_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_company_memberships_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "platform_companies_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_company_memberships_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          company_id: string
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          updated_at: string
          user_id: string
        }
        Insert: {
          company_id: string
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string
          user_id: string
        }
        Update: {
          company_id?: string
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_roles_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "platform_companies_view"
            referencedColumns: ["id"]
          },
        ]
      }
      work_shifts: {
        Row: {
          break_end: string | null
          break_start: string | null
          code: string
          coefficient: number | null
          color: string | null
          company_id: string
          created_at: string
          department: string | null
          end_time: string
          id: string
          is_night_shift: boolean | null
          is_overtime_shift: boolean | null
          name: string
          notes: string | null
          start_time: string
          status: string
          updated_at: string
          work_hours: number | null
        }
        Insert: {
          break_end?: string | null
          break_start?: string | null
          code: string
          coefficient?: number | null
          color?: string | null
          company_id: string
          created_at?: string
          department?: string | null
          end_time?: string
          id?: string
          is_night_shift?: boolean | null
          is_overtime_shift?: boolean | null
          name: string
          notes?: string | null
          start_time?: string
          status?: string
          updated_at?: string
          work_hours?: number | null
        }
        Update: {
          break_end?: string | null
          break_start?: string | null
          code?: string
          coefficient?: number | null
          color?: string | null
          company_id?: string
          created_at?: string
          department?: string | null
          end_time?: string
          id?: string
          is_night_shift?: boolean | null
          is_overtime_shift?: boolean | null
          name?: string
          notes?: string | null
          start_time?: string
          status?: string
          updated_at?: string
          work_hours?: number | null
        }
        Relationships: []
      }
    }
    Views: {
      candidates_secure: {
        Row: {
          applied_date: string | null
          avatar_url: string | null
          company_id: string | null
          created_at: string | null
          email: string | null
          ethnicity: string | null
          expected_start_date: string | null
          full_name: string | null
          height: string | null
          hometown: string | null
          id: string | null
          marital_status: string | null
          military_service: string | null
          nationality: string | null
          notes: string | null
          phone: string | null
          position: string | null
          rating: number | null
          religion: string | null
          source: string | null
          stage: string | null
          updated_at: string | null
          weight: string | null
        }
        Insert: {
          applied_date?: string | null
          avatar_url?: string | null
          company_id?: string | null
          created_at?: string | null
          email?: never
          ethnicity?: string | null
          expected_start_date?: string | null
          full_name?: string | null
          height?: string | null
          hometown?: string | null
          id?: string | null
          marital_status?: string | null
          military_service?: string | null
          nationality?: string | null
          notes?: string | null
          phone?: never
          position?: string | null
          rating?: number | null
          religion?: string | null
          source?: string | null
          stage?: string | null
          updated_at?: string | null
          weight?: string | null
        }
        Update: {
          applied_date?: string | null
          avatar_url?: string | null
          company_id?: string | null
          created_at?: string | null
          email?: never
          ethnicity?: string | null
          expected_start_date?: string | null
          full_name?: string | null
          height?: string | null
          hometown?: string | null
          id?: string | null
          marital_status?: string | null
          military_service?: string | null
          nationality?: string | null
          notes?: string | null
          phone?: never
          position?: string | null
          rating?: number | null
          religion?: string | null
          source?: string | null
          stage?: string | null
          updated_at?: string | null
          weight?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "candidates_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "candidates_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "platform_companies_view"
            referencedColumns: ["id"]
          },
        ]
      }
      platform_companies_view: {
        Row: {
          active_employee_count: number | null
          address: string | null
          code: string | null
          created_at: string | null
          description: string | null
          email: string | null
          employee_count: number | null
          founded_date: string | null
          id: string | null
          industry: string | null
          logo_url: string | null
          member_count: number | null
          name: string | null
          phone: string | null
          status: string | null
          tax_code: string | null
          updated_at: string | null
          website: string | null
        }
        Insert: {
          active_employee_count?: never
          address?: string | null
          code?: string | null
          created_at?: string | null
          description?: string | null
          email?: string | null
          employee_count?: number | null
          founded_date?: string | null
          id?: string | null
          industry?: string | null
          logo_url?: string | null
          member_count?: never
          name?: string | null
          phone?: string | null
          status?: string | null
          tax_code?: string | null
          updated_at?: string | null
          website?: string | null
        }
        Update: {
          active_employee_count?: never
          address?: string | null
          code?: string | null
          created_at?: string | null
          description?: string | null
          email?: string | null
          employee_count?: number | null
          founded_date?: string | null
          id?: string | null
          industry?: string | null
          logo_url?: string | null
          member_count?: never
          name?: string | null
          phone?: string | null
          status?: string | null
          tax_code?: string | null
          updated_at?: string | null
          website?: string | null
        }
        Relationships: []
      }
      platform_subscriptions_view: {
        Row: {
          company_created_at: string | null
          company_id: string | null
          company_name: string | null
          company_status: string | null
          created_at: string | null
          id: string | null
          industry: string | null
          is_active: boolean | null
          max_employees: number | null
          plan_code: string | null
          plan_id: string | null
          plan_name_en: string | null
          plan_name_vi: string | null
          price_monthly: number | null
          subscription_end_date: string | null
          subscription_start_date: string | null
          subscription_status: string | null
          trial_days_remaining: number | null
          trial_end_date: string | null
          trial_start_date: string | null
          updated_at: string | null
        }
        Relationships: [
          {
            foreignKeyName: "company_subscriptions_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: true
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "company_subscriptions_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: true
            referencedRelation: "platform_companies_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "company_subscriptions_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "subscription_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      platform_users_view: {
        Row: {
          avatar_url: string | null
          company_count: number | null
          company_names: string | null
          created_at: string | null
          email: string | null
          full_name: string | null
          job_title: string | null
          onboarding_completed: boolean | null
          phone: string | null
          profile_id: string | null
          user_id: string | null
        }
        Insert: {
          avatar_url?: string | null
          company_count?: never
          company_names?: never
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          job_title?: string | null
          onboarding_completed?: boolean | null
          phone?: string | null
          profile_id?: string | null
          user_id?: string | null
        }
        Update: {
          avatar_url?: string | null
          company_count?: never
          company_names?: never
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          job_title?: string | null
          onboarding_completed?: boolean | null
          phone?: string | null
          profile_id?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      can_view_all_employees: {
        Args: { _company_id: string; _user_id: string }
        Returns: boolean
      }
      create_company_with_owner: {
        Args: {
          p_employee_count?: number
          p_industry?: string
          p_name: string
          p_phone?: string
          p_user_email?: string
          p_user_full_name?: string
          p_user_id?: string
          p_website?: string
        }
        Returns: string
      }
      get_all_company_admins: {
        Args: never
        Returns: {
          company_id: string
          created_at: string
          email: string
          full_name: string
          id: string
          role: string
          status: string
          user_id: string
        }[]
      }
      get_company_subscription: { Args: { _company_id: string }; Returns: Json }
      get_platform_stats: { Args: never; Returns: Json }
      get_user_company_ids: { Args: { _user_id: string }; Returns: string[] }
      get_user_employee_id: {
        Args: { _company_id: string; _user_id: string }
        Returns: string
      }
      get_user_permissions: {
        Args: { _company_id: string; _user_id: string }
        Returns: {
          action: string
          module: string
        }[]
      }
      get_user_role: {
        Args: { _company_id: string; _user_id: string }
        Returns: string
      }
      has_permission: {
        Args: {
          _action: string
          _company_id: string
          _module: string
          _user_id: string
        }
        Returns: boolean
      }
      has_recruitment_access: {
        Args: { _company_id: string; _user_id: string }
        Returns: boolean
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_any_company_admin: { Args: { _user_id: string }; Returns: boolean }
      is_company_admin: {
        Args: { _company_id: string; _user_id: string }
        Returns: boolean
      }
      is_platform_admin: { Args: { _user_id: string }; Returns: boolean }
      is_subscription_active: {
        Args: { _company_id: string }
        Returns: boolean
      }
      log_platform_audit: {
        Args: {
          _action: string
          _details?: Json
          _entity_id?: string
          _entity_name?: string
          _entity_type?: string
        }
        Returns: undefined
      }
      platform_admin_create_company: {
        Args: {
          p_address?: string
          p_email?: string
          p_industry?: string
          p_name: string
          p_phone?: string
          p_tax_code?: string
          p_website?: string
        }
        Returns: Json
      }
      update_expired_contracts: {
        Args: { p_company_id: string }
        Returns: number
      }
      update_expired_contracts_all: {
        Args: { p_company_id: string }
        Returns: Json
      }
      user_belongs_to_company: {
        Args: { _company_id: string; _user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "hr_manager" | "recruiter" | "manager" | "employee"
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
    Enums: {
      app_role: ["admin", "hr_manager", "recruiter", "manager", "employee"],
    },
  },
} as const
