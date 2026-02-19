import { createClient } from '@/lib/supabase/server';
import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Plus,
  FileText,
  Calendar,
  DollarSign,
  Percent,
  Building2,
} from 'lucide-react';
import { Button, Card, CardContent, CardHeader, CardTitle, Badge } from '@/components/ui';
import { formatCurrency, formatPercent, calculateNetChangeOrders } from '@/lib/calculations';
import type { Project, ScheduleOfValuesItem, ChangeOrder, PayApplication } from '@/lib/types';

interface Props {
  params: { id: string };
}

async function getProjectData(projectId: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

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

  // Get pay applications
  const { data: payApps } = await supabase
    .from('pay_applications')
    .select('*')
    .eq('project_id', projectId)
    .order('application_number', { ascending: false });

  return {
    project: project as Project,
    sovItems: (sovItems || []) as ScheduleOfValuesItem[],
    changeOrders: (changeOrders || []) as ChangeOrder[],
    payApps: (payApps || []) as PayApplication[],
  };
}

export default async function ProjectDetailPage({ params }: Props) {
  const { project, sovItems, changeOrders, payApps } = await getProjectData(params.id);

  const netChangeOrders = calculateNetChangeOrders(changeOrders);
  const contractSumToDate = project.original_contract_sum + netChangeOrders;
  const sovTotal = sovItems.reduce((sum, item) => sum + item.scheduled_value, 0);

  // Get latest pay app stats
  const latestPayApp = payApps[0];
  const totalBilled = latestPayApp?.total_earned_less_retainage || 0;
  const percentComplete = contractSumToDate > 0 ? totalBilled / contractSumToDate : 0;

  const statusVariant = {
    active: 'success' as const,
    completed: 'info' as const,
    archived: 'default' as const,
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <Link
          href="/projects"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-navy-900 mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Projects
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-navy-900">
                {project.project_name}
              </h1>
              <Badge variant={statusVariant[project.status]}>
                {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
              </Badge>
            </div>
            {project.project_number && (
              <p className="text-gray-600">#{project.project_number}</p>
            )}
            <p className="text-gray-600 mt-1">{project.gc_name}</p>
          </div>

          <div className="flex gap-3">
            <Link href={`/projects/${project.id}/pay-app/new`}>
              <Button leftIcon={<Plus className="h-4 w-4" />}>
                Create Pay App
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-navy-100 rounded-full flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-navy-600" />
              </div>
              <div>
                <p className="text-xs text-gray-600">Contract Sum</p>
                <p className="text-lg font-bold text-navy-900 font-mono">
                  {formatCurrency(contractSumToDate)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <FileText className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-xs text-gray-600">Total Billed</p>
                <p className="text-lg font-bold text-navy-900 font-mono">
                  {formatCurrency(totalBilled)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                <Percent className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-xs text-gray-600">% Complete</p>
                <p className="text-lg font-bold text-navy-900">
                  {formatPercent(percentComplete, 1)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <Calendar className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-gray-600">Billing Day</p>
                <p className="text-lg font-bold text-navy-900">
                  {project.billing_day}
                  {project.billing_day === 1
                    ? 'st'
                    : project.billing_day === 2
                    ? 'nd'
                    : project.billing_day === 3
                    ? 'rd'
                    : 'th'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Schedule of Values */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Schedule of Values</CardTitle>
            <span className="text-sm text-gray-600">
              {sovItems.length} line items
            </span>
          </CardHeader>
          <div className="px-6 pb-6">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left font-semibold text-gray-600 pb-2">
                      Item
                    </th>
                    <th className="text-left font-semibold text-gray-600 pb-2">
                      Description
                    </th>
                    <th className="text-right font-semibold text-gray-600 pb-2">
                      Value
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {sovItems.slice(0, 5).map((item) => (
                    <tr key={item.id}>
                      <td className="py-2 text-gray-600">{item.item_number}</td>
                      <td className="py-2">{item.description}</td>
                      <td className="py-2 text-right font-mono">
                        {formatCurrency(item.scheduled_value)}
                      </td>
                    </tr>
                  ))}
                  {sovItems.length > 5 && (
                    <tr>
                      <td colSpan={3} className="py-2 text-center text-gray-500">
                        +{sovItems.length - 5} more items
                      </td>
                    </tr>
                  )}
                </tbody>
                <tfoot>
                  <tr className="border-t border-gray-300">
                    <td colSpan={2} className="py-2 font-semibold">
                      Total
                    </td>
                    <td className="py-2 text-right font-mono font-bold">
                      {formatCurrency(sovTotal)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </Card>

        {/* Change Orders */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Change Orders</CardTitle>
            <Link href={`/projects/${project.id}/change-orders`}>
              <Button variant="ghost" size="sm" leftIcon={<Plus className="h-4 w-4" />}>
                Add
              </Button>
            </Link>
          </CardHeader>
          <div className="px-6 pb-6">
            {changeOrders.length === 0 ? (
              <p className="text-gray-500 text-sm py-4 text-center">
                No change orders yet
              </p>
            ) : (
              <div className="space-y-3">
                {changeOrders.slice(0, 4).map((co) => (
                  <div
                    key={co.id}
                    className="flex items-center justify-between py-2 border-b border-gray-100"
                  >
                    <div>
                      <p className="font-medium">CO #{co.co_number}</p>
                      <p className="text-sm text-gray-600">{co.description}</p>
                    </div>
                    <div className="text-right">
                      <p
                        className={`font-mono font-medium ${
                          co.amount >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}
                      >
                        {co.amount >= 0 ? '+' : ''}
                        {formatCurrency(co.amount)}
                      </p>
                      <Badge
                        variant={
                          co.status === 'approved'
                            ? 'success'
                            : co.status === 'pending'
                            ? 'warning'
                            : 'error'
                        }
                        size="sm"
                      >
                        {co.status}
                      </Badge>
                    </div>
                  </div>
                ))}
                {changeOrders.length > 4 && (
                  <Link
                    href={`/projects/${project.id}/change-orders`}
                    className="block text-center text-sm text-construction-500 hover:underline py-2"
                  >
                    View all {changeOrders.length} change orders
                  </Link>
                )}
              </div>
            )}

            {changeOrders.length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-200 flex justify-between">
                <span className="font-semibold">Net Change Orders:</span>
                <span
                  className={`font-mono font-bold ${
                    netChangeOrders >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {netChangeOrders >= 0 ? '+' : ''}
                  {formatCurrency(netChangeOrders)}
                </span>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Pay Applications */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Pay Applications</CardTitle>
          <Link href={`/projects/${project.id}/pay-app/new`}>
            <Button size="sm" leftIcon={<Plus className="h-4 w-4" />}>
              New Pay App
            </Button>
          </Link>
        </CardHeader>
        <div className="px-6 pb-6">
          {payApps.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600 mb-4">No pay applications yet</p>
              <Link href={`/projects/${project.id}/pay-app/new`}>
                <Button leftIcon={<Plus className="h-4 w-4" />}>
                  Create Your First Pay App
                </Button>
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left font-semibold text-gray-600 pb-3">
                      App #
                    </th>
                    <th className="text-left font-semibold text-gray-600 pb-3">
                      Period
                    </th>
                    <th className="text-right font-semibold text-gray-600 pb-3">
                      Amount Due
                    </th>
                    <th className="text-center font-semibold text-gray-600 pb-3">
                      Status
                    </th>
                    <th className="text-right font-semibold text-gray-600 pb-3">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {payApps.map((app) => (
                    <tr key={app.id}>
                      <td className="py-3 font-medium">#{app.application_number}</td>
                      <td className="py-3 text-gray-600">
                        {new Date(app.period_from).toLocaleDateString()} –{' '}
                        {new Date(app.period_to).toLocaleDateString()}
                      </td>
                      <td className="py-3 text-right font-mono font-medium">
                        {formatCurrency(app.current_payment_due)}
                      </td>
                      <td className="py-3 text-center">
                        <Badge
                          variant={
                            app.status === 'paid'
                              ? 'success'
                              : app.status === 'submitted'
                              ? 'warning'
                              : 'default'
                          }
                        >
                          {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                        </Badge>
                      </td>
                      <td className="py-3 text-right">
                        <Link
                          href={`/projects/${project.id}/pay-app/${app.id}`}
                          className="text-construction-500 hover:underline"
                        >
                          {app.status === 'draft' ? 'Edit' : 'View'}
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </Card>

      {/* Project Info */}
      <Card>
        <CardHeader>
          <CardTitle>Project Details</CardTitle>
        </CardHeader>
        <div className="px-6 pb-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-sm font-semibold text-gray-600 mb-2">
                Project Information
              </h4>
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-gray-600">Address</dt>
                  <dd className="text-right">{project.project_address}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-600">Owner</dt>
                  <dd>{project.owner_name}</dd>
                </div>
                {project.architect_name && (
                  <div className="flex justify-between">
                    <dt className="text-gray-600">Architect</dt>
                    <dd>{project.architect_name}</dd>
                  </div>
                )}
                <div className="flex justify-between">
                  <dt className="text-gray-600">General Contractor</dt>
                  <dd>{project.gc_name}</dd>
                </div>
              </dl>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-600 mb-2">
                Contract Details
              </h4>
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-gray-600">Contract Date</dt>
                  <dd>{new Date(project.contract_date).toLocaleDateString()}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-600">Original Contract Sum</dt>
                  <dd className="font-mono">
                    {formatCurrency(project.original_contract_sum)}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-600">Retainage (Work)</dt>
                  <dd>{formatPercent(project.retainage_rate_work, 0)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-600">Retainage (Stored)</dt>
                  <dd>{formatPercent(project.retainage_rate_stored, 0)}</dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
