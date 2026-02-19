import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import {
  Plus,
  Calendar,
  DollarSign,
  Clock,
  FileText,
  ArrowRight,
} from 'lucide-react';
import { Button, Card, CardContent, Badge } from '@/components/ui';
import { formatCurrency, getNextBillingDate, getDaysUntilBilling } from '@/lib/calculations';
import type { Project, PayApplication } from '@/lib/types';

async function getDashboardData() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Get user profile
  const { data: profile } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single();

  // Get active projects with latest pay app
  const { data: projects } = await supabase
    .from('projects')
    .select('*')
    .eq('user_id', user.id)
    .eq('status', 'active')
    .order('created_at', { ascending: false });

  // Get all pay applications for stats
  const { data: payApps } = await supabase
    .from('pay_applications')
    .select('*, projects!inner(*)')
    .eq('projects.user_id', user.id);

  return { profile, projects: projects || [], payApps: payApps || [] };
}

export default async function DashboardPage() {
  const { profile, projects, payApps } = await getDashboardData();

  // Calculate stats
  const totalBilledThisMonth = payApps
    .filter((app: PayApplication) => {
      const submittedDate = app.submitted_at ? new Date(app.submitted_at) : null;
      if (!submittedDate) return false;
      const now = new Date();
      return (
        submittedDate.getMonth() === now.getMonth() &&
        submittedDate.getFullYear() === now.getFullYear()
      );
    })
    .reduce((sum: number, app: PayApplication) => sum + app.current_payment_due, 0);

  const totalOutstanding = payApps
    .filter((app: PayApplication) => app.status === 'submitted')
    .reduce((sum: number, app: PayApplication) => sum + app.current_payment_due, 0);

  const totalRetainage = payApps
    .filter((app: PayApplication) => app.status !== 'paid')
    .reduce((sum: number, app: PayApplication) => sum + app.total_retainage, 0);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy-900">
            Welcome back{profile?.company_name ? `, ${profile.company_name}` : ''}
          </h1>
          <p className="text-gray-600 mt-1">
            Here&apos;s what&apos;s happening with your projects.
          </p>
        </div>
        <Link href="/projects/new">
          <Button leftIcon={<Plus className="h-4 w-4" />}>New Project</Button>
        </Link>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="py-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Billed This Month</p>
                <p className="text-2xl font-bold text-navy-900">
                  {formatCurrency(totalBilledThisMonth)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="py-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
                <Clock className="h-6 w-6 text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Outstanding</p>
                <p className="text-2xl font-bold text-navy-900">
                  {formatCurrency(totalOutstanding)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="py-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Retainage Held</p>
                <p className="text-2xl font-bold text-navy-900">
                  {formatCurrency(totalRetainage)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Active Projects */}
      <div>
        <h2 className="text-lg font-semibold text-navy-900 mb-4">
          Active Projects
        </h2>

        {projects.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-navy-900 mb-2">
                No projects yet
              </h3>
              <p className="text-gray-600 mb-6">
                Create your first project to start generating pay applications.
              </p>
              <Link href="/projects/new">
                <Button leftIcon={<Plus className="h-4 w-4" />}>
                  Create Your First Project
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {projects.map((project: Project) => {
              const daysUntilBilling = getDaysUntilBilling(project.billing_day);
              const nextBillingDate = getNextBillingDate(project.billing_day);

              return (
                <Link key={project.id} href={`/projects/${project.id}`}>
                  <Card hover className="h-full">
                    <CardContent className="py-5">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-semibold text-navy-900">
                            {project.project_name}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {project.gc_name}
                          </p>
                        </div>
                        <Badge
                          variant={daysUntilBilling <= 7 ? 'warning' : 'default'}
                        >
                          {daysUntilBilling} days
                        </Badge>
                      </div>

                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Contract Sum</span>
                          <span className="font-medium font-mono">
                            {formatCurrency(project.original_contract_sum)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Next Billing</span>
                          <span className="font-medium">
                            {nextBillingDate.toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                            })}
                          </span>
                        </div>
                      </div>

                      <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center">
                        <span className="text-sm text-construction-500 font-medium flex items-center gap-1">
                          Create Pay App
                          <ArrowRight className="h-4 w-4" />
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {/* Upcoming Deadlines */}
      {projects.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-navy-900 mb-4">
            Upcoming Deadlines
          </h2>
          <Card>
            <div className="divide-y divide-gray-100">
              {projects
                .sort(
                  (a: Project, b: Project) =>
                    getDaysUntilBilling(a.billing_day) -
                    getDaysUntilBilling(b.billing_day)
                )
                .slice(0, 5)
                .map((project: Project) => {
                  const daysUntilBilling = getDaysUntilBilling(project.billing_day);
                  const nextBillingDate = getNextBillingDate(project.billing_day);

                  return (
                    <div
                      key={project.id}
                      className="flex items-center justify-between px-6 py-4"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-navy-100 rounded-full flex items-center justify-center">
                          <Calendar className="h-5 w-5 text-navy-600" />
                        </div>
                        <div>
                          <p className="font-medium text-navy-900">
                            {project.project_name}
                          </p>
                          <p className="text-sm text-gray-600">
                            Pay app due{' '}
                            {nextBillingDate.toLocaleDateString('en-US', {
                              weekday: 'long',
                              month: 'long',
                              day: 'numeric',
                            })}
                          </p>
                        </div>
                      </div>
                      <Badge
                        variant={
                          daysUntilBilling <= 3
                            ? 'error'
                            : daysUntilBilling <= 7
                            ? 'warning'
                            : 'default'
                        }
                      >
                        {daysUntilBilling === 0
                          ? 'Today'
                          : daysUntilBilling === 1
                          ? 'Tomorrow'
                          : `${daysUntilBilling} days`}
                      </Badge>
                    </div>
                  );
                })}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
