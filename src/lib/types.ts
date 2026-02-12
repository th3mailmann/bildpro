// BildPro Type Definitions
// These types match the database schema exactly

export type SubscriptionTier = 'free' | 'pro' | 'business';
export type ProjectStatus = 'active' | 'completed' | 'archived';
export type ChangeOrderStatus = 'pending' | 'approved' | 'rejected';
export type PayAppStatus = 'draft' | 'submitted' | 'paid';

export interface User {
  id: string;
  email: string;
  company_name: string | null;
  company_address: string | null;
  company_phone: string | null;
  company_logo_url: string | null;
  subscription_tier: SubscriptionTier;
  stripe_customer_id: string | null;
  created_at: string;
}

export interface Project {
  id: string;
  user_id: string;
  project_name: string;
  project_number: string | null;
  project_address: string;
  owner_name: string;
  architect_name: string | null;
  gc_name: string;
  gc_contact_email: string | null;
  original_contract_sum: number;
  contract_date: string;
  retainage_rate_work: number; // e.g., 0.10 for 10%
  retainage_rate_stored: number;
  billing_day: number; // 1-28
  status: ProjectStatus;
  created_at: string;
  updated_at: string;
}

export interface ScheduleOfValuesItem {
  id: string;
  project_id: string;
  item_number: string;
  description: string;
  scheduled_value: number;
  sort_order: number;
  is_from_change_order: boolean;
  change_order_id: string | null;
  created_at: string;
}

export interface ChangeOrder {
  id: string;
  project_id: string;
  co_number: number;
  description: string;
  amount: number; // Positive for additions, negative for deductions
  date_approved: string;
  status: ChangeOrderStatus;
  created_at: string;
}

export interface PayApplication {
  id: string;
  project_id: string;
  application_number: number;
  period_from: string;
  period_to: string;
  status: PayAppStatus;
  // Snapshot values at time of generation
  original_contract_sum: number;
  net_change_orders: number;
  contract_sum_to_date: number;
  total_completed_and_stored: number;
  retainage_on_completed: number;
  retainage_on_stored: number;
  total_retainage: number;
  total_earned_less_retainage: number;
  less_previous_certificates: number;
  current_payment_due: number;
  balance_to_finish: number;
  created_at: string;
  submitted_at: string | null;
}

export interface PayAppLineItem {
  id: string;
  pay_application_id: string;
  sov_id: string;
  item_number: string;
  description: string;
  scheduled_value: number; // Column C
  work_completed_previous: number; // Column D
  work_completed_this_period: number; // Column E (USER INPUT)
  materials_stored: number; // Column F (USER INPUT)
  total_completed_and_stored: number; // Column G = D + E + F
  percent_complete: number; // Column H = G / C
  balance_to_finish: number; // Column I = C - G
  retainage: number;
}

// Form input types for creating/editing
export interface ProjectFormData {
  project_name: string;
  project_number: string;
  project_address: string;
  owner_name: string;
  architect_name: string;
  gc_name: string;
  gc_contact_email: string;
  contract_date: string;
  billing_day: number;
  original_contract_sum: number;
  retainage_rate_work: number;
  retainage_rate_stored: number;
}

export interface SOVLineItemInput {
  id?: string;
  item_number: string;
  description: string;
  scheduled_value: number;
  sort_order: number;
}

export interface ChangeOrderFormData {
  description: string;
  amount: number;
  date_approved: string;
  status: ChangeOrderStatus;
  add_as_sov_line: boolean;
}

export interface PayAppLineItemInput {
  sov_id: string;
  item_number: string;
  description: string;
  scheduled_value: number;
  work_completed_previous: number;
  work_completed_this_period: number;
  materials_stored: number;
}

// Calculated summary for G702
export interface G702Summary {
  line1_original_contract_sum: number;
  line2_net_change_orders: number;
  line3_contract_sum_to_date: number;
  line4_total_completed_and_stored: number;
  line5a_retainage_on_completed: number;
  line5b_retainage_on_stored: number;
  line5c_total_retainage: number;
  line6_total_earned_less_retainage: number;
  line7_less_previous_certificates: number;
  line8_current_payment_due: number;
  line9_balance_to_finish_plus_retainage: number;
}

// G703 totals
export interface G703Totals {
  total_scheduled_value: number; // Sum of Column C
  total_work_previous: number; // Sum of Column D
  total_work_this_period: number; // Sum of Column E
  total_materials_stored: number; // Sum of Column F
  total_completed_and_stored: number; // Sum of Column G
  total_balance_to_finish: number; // Sum of Column I
}

// Validation result
export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

export interface ValidationError {
  field: string;
  message: string;
  lineItem?: string;
}

export interface ValidationWarning {
  field: string;
  message: string;
  lineItem?: string;
  canOverride: boolean;
}

// Dashboard stats
export interface DashboardStats {
  total_billed_this_month: number;
  total_outstanding: number;
  total_retainage_held: number;
  active_project_count: number;
}

// Project with computed fields for display
export interface ProjectWithStats extends Project {
  total_billed: number;
  current_contract_sum: number;
  percent_complete: number;
  last_pay_app?: PayApplication;
  next_billing_date: string;
}
