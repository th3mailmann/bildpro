-- BildPro Database Schema for Supabase
-- Run this in the Supabase SQL editor to set up your database

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum types
CREATE TYPE subscription_tier AS ENUM ('free', 'pro', 'business');
CREATE TYPE project_status AS ENUM ('active', 'completed', 'archived');
CREATE TYPE change_order_status AS ENUM ('pending', 'approved', 'rejected');
CREATE TYPE pay_app_status AS ENUM ('draft', 'submitted', 'paid');

-- ============================================================================
-- TABLES (ordered by dependencies)
-- ============================================================================

-- Users table (extends Supabase auth.users)
CREATE TABLE users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    company_name TEXT,
    company_address TEXT,
    company_phone TEXT,
    company_logo_url TEXT,
    subscription_tier subscription_tier DEFAULT 'free' NOT NULL,
    stripe_customer_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Projects table (depends on: users)
CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    project_name TEXT NOT NULL,
    project_number TEXT,
    project_address TEXT NOT NULL,
    owner_name TEXT NOT NULL,
    architect_name TEXT,
    gc_name TEXT NOT NULL,
    gc_contact_email TEXT,
    original_contract_sum DECIMAL(12, 2) NOT NULL,
    contract_date DATE NOT NULL,
    retainage_rate_work DECIMAL(5, 4) DEFAULT 0.10 NOT NULL,
    retainage_rate_stored DECIMAL(5, 4) DEFAULT 0.10 NOT NULL,
    billing_day INTEGER DEFAULT 25 NOT NULL CHECK (billing_day >= 1 AND billing_day <= 28),
    status project_status DEFAULT 'active' NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Change Orders (depends on: projects)
CREATE TABLE change_orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    co_number INTEGER NOT NULL,
    description TEXT NOT NULL,
    amount DECIMAL(12, 2) NOT NULL,
    date_approved DATE,
    status change_order_status DEFAULT 'pending' NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    UNIQUE(project_id, co_number)
);

-- Schedule of Values / G703 line items (depends on: projects, change_orders)
CREATE TABLE schedule_of_values (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    item_number TEXT NOT NULL,
    description TEXT NOT NULL,
    scheduled_value DECIMAL(12, 2) NOT NULL,
    sort_order INTEGER NOT NULL,
    is_from_change_order BOOLEAN DEFAULT FALSE NOT NULL,
    change_order_id UUID REFERENCES change_orders(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Pay Applications / G702 header (depends on: projects)
CREATE TABLE pay_applications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    application_number INTEGER NOT NULL,
    period_from DATE NOT NULL,
    period_to DATE NOT NULL,
    status pay_app_status DEFAULT 'draft' NOT NULL,
    -- Snapshot values
    original_contract_sum DECIMAL(12, 2) NOT NULL,
    net_change_orders DECIMAL(12, 2) NOT NULL,
    contract_sum_to_date DECIMAL(12, 2) NOT NULL,
    total_completed_and_stored DECIMAL(12, 2) NOT NULL,
    retainage_on_completed DECIMAL(12, 2) NOT NULL,
    retainage_on_stored DECIMAL(12, 2) NOT NULL,
    total_retainage DECIMAL(12, 2) NOT NULL,
    total_earned_less_retainage DECIMAL(12, 2) NOT NULL,
    less_previous_certificates DECIMAL(12, 2) NOT NULL,
    current_payment_due DECIMAL(12, 2) NOT NULL,
    balance_to_finish DECIMAL(12, 2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    submitted_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(project_id, application_number)
);

-- Pay Application Line Items / G703 rows (depends on: pay_applications, schedule_of_values)
CREATE TABLE pay_app_line_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    pay_application_id UUID NOT NULL REFERENCES pay_applications(id) ON DELETE CASCADE,
    sov_id UUID NOT NULL REFERENCES schedule_of_values(id) ON DELETE CASCADE,
    item_number TEXT NOT NULL,
    description TEXT NOT NULL,
    scheduled_value DECIMAL(12, 2) NOT NULL,
    work_completed_previous DECIMAL(12, 2) NOT NULL,
    work_completed_this_period DECIMAL(12, 2) NOT NULL,
    materials_stored DECIMAL(12, 2) NOT NULL,
    total_completed_and_stored DECIMAL(12, 2) NOT NULL,
    percent_complete DECIMAL(5, 4) NOT NULL,
    balance_to_finish DECIMAL(12, 2) NOT NULL,
    retainage DECIMAL(12, 2) NOT NULL
);

-- ============================================================================
-- INDEXES
-- ============================================================================

CREATE INDEX idx_projects_user_id ON projects(user_id);
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_change_orders_project_id ON change_orders(project_id);
CREATE INDEX idx_sov_project_id ON schedule_of_values(project_id);
CREATE INDEX idx_sov_sort_order ON schedule_of_values(project_id, sort_order);
CREATE INDEX idx_pay_applications_project_id ON pay_applications(project_id);
CREATE INDEX idx_pay_applications_status ON pay_applications(status);
CREATE INDEX idx_pay_app_line_items_pay_app_id ON pay_app_line_items(pay_application_id);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE change_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE schedule_of_values ENABLE ROW LEVEL SECURITY;
ALTER TABLE pay_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE pay_app_line_items ENABLE ROW LEVEL SECURITY;

-- Users: Users can only see/edit their own record
CREATE POLICY "Users can view own record" ON users
    FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own record" ON users
    FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own record" ON users
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Projects: Users can only access their own projects
CREATE POLICY "Users can view own projects" ON projects
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own projects" ON projects
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own projects" ON projects
    FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own projects" ON projects
    FOR DELETE USING (auth.uid() = user_id);

-- Change Orders: Access through project ownership
CREATE POLICY "Users can view own COs" ON change_orders
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM projects WHERE projects.id = change_orders.project_id AND projects.user_id = auth.uid())
    );
CREATE POLICY "Users can insert own COs" ON change_orders
    FOR INSERT WITH CHECK (
        EXISTS (SELECT 1 FROM projects WHERE projects.id = change_orders.project_id AND projects.user_id = auth.uid())
    );
CREATE POLICY "Users can update own COs" ON change_orders
    FOR UPDATE USING (
        EXISTS (SELECT 1 FROM projects WHERE projects.id = change_orders.project_id AND projects.user_id = auth.uid())
    );
CREATE POLICY "Users can delete own COs" ON change_orders
    FOR DELETE USING (
        EXISTS (SELECT 1 FROM projects WHERE projects.id = change_orders.project_id AND projects.user_id = auth.uid())
    );

-- Schedule of Values: Access through project ownership
CREATE POLICY "Users can view own SOV" ON schedule_of_values
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM projects WHERE projects.id = schedule_of_values.project_id AND projects.user_id = auth.uid())
    );
CREATE POLICY "Users can insert own SOV" ON schedule_of_values
    FOR INSERT WITH CHECK (
        EXISTS (SELECT 1 FROM projects WHERE projects.id = schedule_of_values.project_id AND projects.user_id = auth.uid())
    );
CREATE POLICY "Users can update own SOV" ON schedule_of_values
    FOR UPDATE USING (
        EXISTS (SELECT 1 FROM projects WHERE projects.id = schedule_of_values.project_id AND projects.user_id = auth.uid())
    );
CREATE POLICY "Users can delete own SOV" ON schedule_of_values
    FOR DELETE USING (
        EXISTS (SELECT 1 FROM projects WHERE projects.id = schedule_of_values.project_id AND projects.user_id = auth.uid())
    );

-- Pay Applications: Access through project ownership
CREATE POLICY "Users can view own pay apps" ON pay_applications
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM projects WHERE projects.id = pay_applications.project_id AND projects.user_id = auth.uid())
    );
CREATE POLICY "Users can insert own pay apps" ON pay_applications
    FOR INSERT WITH CHECK (
        EXISTS (SELECT 1 FROM projects WHERE projects.id = pay_applications.project_id AND projects.user_id = auth.uid())
    );
CREATE POLICY "Users can update own pay apps" ON pay_applications
    FOR UPDATE USING (
        EXISTS (SELECT 1 FROM projects WHERE projects.id = pay_applications.project_id AND projects.user_id = auth.uid())
    );
CREATE POLICY "Users can delete own pay apps" ON pay_applications
    FOR DELETE USING (
        EXISTS (SELECT 1 FROM projects WHERE projects.id = pay_applications.project_id AND projects.user_id = auth.uid())
    );

-- Pay App Line Items: Access through pay application → project ownership
CREATE POLICY "Users can view own line items" ON pay_app_line_items
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM pay_applications pa
            JOIN projects p ON p.id = pa.project_id
            WHERE pa.id = pay_app_line_items.pay_application_id AND p.user_id = auth.uid()
        )
    );
CREATE POLICY "Users can insert own line items" ON pay_app_line_items
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM pay_applications pa
            JOIN projects p ON p.id = pa.project_id
            WHERE pa.id = pay_app_line_items.pay_application_id AND p.user_id = auth.uid()
        )
    );
CREATE POLICY "Users can update own line items" ON pay_app_line_items
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM pay_applications pa
            JOIN projects p ON p.id = pa.project_id
            WHERE pa.id = pay_app_line_items.pay_application_id AND p.user_id = auth.uid()
        )
    );
CREATE POLICY "Users can delete own line items" ON pay_app_line_items
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM pay_applications pa
            JOIN projects p ON p.id = pa.project_id
            WHERE pa.id = pay_app_line_items.pay_application_id AND p.user_id = auth.uid()
        )
    );

-- ============================================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================================

-- Function to auto-create user record on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, email)
    VALUES (NEW.id, NEW.email);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user creation
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for projects updated_at
CREATE TRIGGER update_projects_updated_at
    BEFORE UPDATE ON projects
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
