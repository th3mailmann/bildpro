import { createClient } from '@/lib/supabase/server';
import { redirect, notFound } from 'next/navigation';
import NewPayAppClient from '@/components/NewPayAppClient';
import type { Project, ScheduleOfValuesItem, ChangeOrder, PayApplication, SubscriptionTier } from '@/lib/types';

interface Props {
  params: { id: string };
}

async function getPayAppData(projectId: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Get user profile for subscription info
  const { data: profile } = await supabase
    .from('users')
    .select('subscription_tier, company_name, company_address, company_logo_url')
    .eq('id', user.id)
    .single();

  // Get project
  const { data: project, error } = await supabase
    .from('projects')
    .select('*')
    .eq('id', projectId)
    .eq('user_id', user.id)
    .single();

  if (error || !project) {
    notFound();
  }

  // Get SOV items
  const { data: sovItems } = await supabase
    .from('schedule_of_values')
    .select('*')
    .eq('project_id', projectId)
    .order('sort_order');

  // Get change orders
  const { data: changeOrders } = await supabase
    .from('change_orders')
    .select('*')
    .eq('project_id', projectId)
    .order('co_number');

  // Get all previous pay applications
  const { data: payApps } = await supabase
    .from('pay_applications')
    .select('*')
    .eq('project_id', projectId)
    .order('application_number', { ascending: false });

  // Get line items from the last pay app (for carry-forward)
  let lastPayAppLineItems: Array<{
    sov_id: string;
    work_completed_previous: number;
    work_completed_this_period: number;
    materials_stored: number;
    total_completed_and_stored: number;
  }> = [];

  if (payApps && payApps.length > 0) {
    const lastPayApp = payApps[0];
    const { data: lineItems } = await supabase
      .from('pay_app_line_items')
      .select('sov_id, work_completed_previous, work_completed_this_period, materials_stored, total_completed_and_stored')
      .eq('pay_application_id', lastPayApp.id);

    if (lineItems) {
      lastPayAppLineItems = lineItems;
    }
  }

  return {
    project: project as Project,
    sovItems: (sovItems || []) as ScheduleOfValuesItem[],
    changeOrders: (changeOrders || []) as ChangeOrder[],
    previousPayApps: (payApps || []) as PayApplication[],
    lastPayAppLineItems,
    subscriptionTier: (profile?.subscription_tier || 'free') as SubscriptionTier,
    companyName: profile?.company_name || '',
    companyAddress: profile?.company_address || '',
    companyLogoUrl: profile?.company_logo_url || null,
  };
}

export default async function NewPayAppPage({ params }: Props) {
  const data = await getPayAppData(params.id);

  return <NewPayAppClient {...data} />;
}
