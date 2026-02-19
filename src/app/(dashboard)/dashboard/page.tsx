import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Button, Card, CardContent, Badge } from '@/components/ui';
import { Building2, Users, FileText, Plus, Calendar, DollarSign, Clock, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { formatCurrency, getNextBillingDate, getDaysUntilBilling } from '@/lib/calculations';
import type { Project, PayApplication } from '@/lib/types';

async function getDashboardData() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Get user profile
  const { data: profile } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single();

  // Get active projects
  const { data: projects } = await supabase
    .from('projects')
    .select('*')
    .eq('user_id', user.id)
    .eq('status', 'active')
    .order('created_at', { ascending: false });

  // Get recent pay applications
  const { data: payApps } = await supabase
    .from('pay_applications')
    .select('*, projects!inner(*)')
    .eq('projects.user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(5);

  return {
    profile,
    projects: projects || [],
    payApps: payApps || [],
    user
  };
}

export default async function DashboardPage() {
  const { profile, projects, payApps } = await getDashboardData();

  const totalProjectValue = projects.reduce((acc, p) => acc + (p.contract_value || 0), 0);
  const totalBilled = payApps.reduce((acc, p) => acc + (p.total_completed_to_date || 0), 0);

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-navy-900">Welcome back, {profile?.full_name || 'User'}</h1>
          <p className="text-gray-500">Here's what's happening with your projects today.</p>
        </div>
        <Link href="/projects/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Project
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-navy-50 rounded-lg">
                <Building2 className="h-6 w-6 text-navy-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Active Projects</p>
                <p className="text-2xl font-bold text-navy-900">{projects.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-construction-50 rounded-lg">
                <DollarSign className="h-6 w-6 text-construction-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Contract Value</p>
                <p className="text-2xl font-bold text-navy-900">{formatCurrency(totalProjectValue)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-50 rounded-lg">
                <FileText className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Billed</p>
                <p className="text-2xl font-bold text-navy-900">{formatCurrency(totalBilled)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-50 rounded-lg">
                <Calendar className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Next Billing Cycle</p>
                <p className="text-2xl font-bold text-navy-900">{getDaysUntilBilling(25)} days</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-navy-900">Recent Projects</h2>
            <Link href="/projects" className="text-sm text-construction-500 hover:text-construction-600 font-medium">
              View all
            </Link>
          </div>
          <div className="space-y-4">
            {projects.slice(0, 3).map((project) => (
              <Card key={project.id} className="hover:border-construction-300 transition-colors">
                <CardContent className="p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-bold text-navy-900">{project.name}</h3>
                      <p className="text-sm text-gray-500">{project.location}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-navy-900">{formatCurrency(project.contract_value)}</p>
                      <Badge variant="outline" className="mt-1">
                        {project.status}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-navy-900">Recent Pay Applications</h2>
            <Link href="/pay-applications" className="text-sm text-construction-500 hover:text-construction-600 font-medium">
              View all
            </Link>
          </div>
          <div className="space-y-4">
            {payApps.map((app) => (
              <Card key={app.id} className="hover:border-construction-300 transition-colors">
                <CardContent className="p-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gray-100 rounded">
                        <FileText className="h-5 w-5 text-gray-500" />
                      </div>
                      <div>
                        <h3 className="font-bold text-navy-900">App #{app.application_number}</h3>
                        <p className="text-sm text-gray-500">{app.projects?.name}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-navy-900">{formatCurrency(app.total_completed_to_date)}</p>
                      <div className="flex items-center gap-1 mt-1 text-xs text-gray-500">
                        <Clock className="h-3 w-3" />
                        {new Date(app.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

