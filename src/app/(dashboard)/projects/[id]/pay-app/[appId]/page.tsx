'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Button, Card, CardContent, CardHeader, CardTitle, Badge, Alert } from '@/components/ui';
import { ArrowLeft, Download, FileText, CheckCircle } from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';
import { 
  Project, 
  PayApplication, 
  PayAppLineItem, 
  ScheduleOfValuesItem,
  PayAppLineItemInput,
  G703Totals,
  ChangeOrder,
} from '@/lib/types';
import { calculateG703Totals, calculateG702Summary } from '@/lib/calculations';
import { generatePayAppPDF } from '@/lib/pdf/generator';
import { G702Summary } from '@/components/G702Summary';

export default function ViewPayAppPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;
  const payAppId = params.appId as string;
  const supabase = createClient();

  const [project, setProject] = useState<Project | null>(null);
  const [payApp, setPayApp] = useState<PayApplication | null>(null);
  const [lineItems, setLineItems] = useState<PayAppLineItemInput[]>([]);
  const [loading, setLoading] = useState(true);
  const [generatingPDF, setGeneratingPDF] = useState(false);

  useEffect(() => {
    fetchData();
  }, [projectId, payAppId]);

  async function fetchData() {
    try {
      // Fetch project
      const { data: projectData, error: projectError } = await supabase
        .from('projects')
        .select('*')
        .eq('id', projectId)
        .single();

      if (projectError) throw projectError;
      setProject(projectData);

      // Fetch pay application
      const { data: appData, error: appError } = await supabase
        .from('pay_applications')
        .select('*')
        .eq('id', payAppId)
        .single();

      if (appError) throw appError;
      setPayApp(appData);

      // Fetch Schedule of Values
      const { data: sovData, error: sovError } = await supabase
        .from('schedule_of_values')
        .select('*')
        .eq('project_id', projectId)
        .order('sort_order', { ascending: true });

      if (sovError) throw sovError;

      // Fetch pay app line items
      const { data: lineItemData, error: lineError } = await supabase
        .from('pay_app_line_items')
        .select('*')
        .eq('pay_application_id', payAppId)
        .order('created_at', { ascending: true });

      if (lineError) throw lineError;

      // Build line items from data
      const items: PayAppLineItemInput[] = (sovData || []).map((sov: ScheduleOfValuesItem) => {
        const lineItem = (lineItemData || []).find(
          (li: PayAppLineItem) => li.sov_id === sov.id
        );
        
        return {
          sov_id: sov.id,
          item_number: sov.item_number,
          description: sov.description,
          scheduled_value: sov.scheduled_value,
          work_completed_previous: lineItem?.work_completed_previous || 0,
          work_completed_this_period: lineItem?.work_completed_this_period || 0,
          materials_stored: lineItem?.materials_stored || 0,
        };
      });

      setLineItems(items);
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleDownloadPDF() {
    if (!project || !payApp || lineItems.length === 0) return;

    setGeneratingPDF(true);

    try {
      const g703Totals = calculateG703Totals(lineItems);
      
      // Fetch change orders for PDF
      const { data: changeOrders } = await supabase
        .from('change_orders')
        .select('*')
        .eq('project_id', projectId)
        .eq('status', 'approved');

      // Fetch previous pay apps
      const { data: previousPayApps } = await supabase
        .from('pay_applications')
        .select('*')
        .eq('project_id', projectId)
        .lt('application_number', payApp.application_number)
        .neq('status', 'draft');

      const g702Summary = calculateG702Summary(
        project.original_contract_sum,
        (changeOrders || []) as ChangeOrder[],
        g703Totals,
        project.retainage_rate_work,
        project.retainage_rate_stored,
        (previousPayApps || []) as PayApplication[]
      );

      // Generate PDF
      await generatePayAppPDF({
        project,
        applicationNumber: payApp.application_number,
        periodFrom: payApp.period_from,
        periodTo: payApp.period_to,
        lineItems,
        g702Summary,
        g703Totals,
        changeOrders: (changeOrders || []) as ChangeOrder[],
        isPro: true, // TODO: Get from user subscription
      });
    } catch (err) {
      console.error('Error generating PDF:', err);
    } finally {
      setGeneratingPDF(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-construction-500"></div>
      </div>
    );
  }

  if (!project || !payApp) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Pay application not found.</p>
        <Link href={`/projects/${projectId}`}>
          <Button variant="outline" className="mt-4">
            Back to Project
          </Button>
        </Link>
      </div>
    );
  }

  const g703Totals = calculateG703Totals(lineItems);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href={`/projects/${projectId}`}>
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Project
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-navy-900">
              Pay Application #{payApp.application_number}
            </h1>
            <p className="text-gray-600">{project.project_name}</p>
          </div>
          <Badge
            variant={
              payApp.status === 'paid'
                ? 'success'
                : 'warning'
            }
          >
            {payApp.status.charAt(0).toUpperCase() + payApp.status.slice(1)}
          </Badge>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={handleDownloadPDF} isLoading={generatingPDF}>
            <Download className="h-4 w-4 mr-2" />
            Download PDF
          </Button>
        </div>
      </div>

      {/* Status Alert */}
      {payApp.status !== 'draft' && (
        <Alert type="info">
          <CheckCircle className="h-4 w-4" />
          <span>
            This pay application was submitted on {formatDate(payApp.submitted_at || payApp.created_at)}.
            Submitted applications cannot be edited.
          </span>
        </Alert>
      )}

      {/* Application Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Application Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-4 gap-6">
            <div>
              <p className="text-sm text-gray-600">Application Number</p>
              <p className="text-lg font-semibold text-navy-900">{payApp.application_number}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Period To</p>
              <p className="text-lg font-semibold text-navy-900">{formatDate(payApp.period_to)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Amount Requested</p>
              <p className="text-lg font-semibold text-navy-900">
                {formatCurrency(payApp.current_payment_due)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Status</p>
              <Badge
                variant={
                  payApp.status === 'paid'
                    ? 'success'
                    : 'warning'
                }
                className="mt-1"
              >
                {payApp.status.charAt(0).toUpperCase() + payApp.status.slice(1)}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* G702 Summary (read-only) - use stored values */}
      <G702Summary summary={{
        line1_original_contract_sum: payApp.original_contract_sum,
        line2_net_change_orders: payApp.net_change_orders,
        line3_contract_sum_to_date: payApp.contract_sum_to_date,
        line4_total_completed_and_stored: payApp.total_completed_and_stored,
        line5a_retainage_on_completed: payApp.retainage_on_completed,
        line5b_retainage_on_stored: payApp.retainage_on_stored,
        line5c_total_retainage: payApp.total_retainage,
        line6_total_earned_less_retainage: payApp.total_earned_less_retainage,
        line7_less_previous_certificates: payApp.less_previous_certificates,
        line8_current_payment_due: payApp.current_payment_due,
        line9_balance_to_finish_plus_retainage: payApp.balance_to_finish,
      }} />

      {/* G703 Table (read-only) */}
      <Card>
        <CardHeader>
          <CardTitle>G703 Continuation Sheet - Schedule of Values</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-100 border-b">
                  <th className="text-left py-3 px-2 font-semibold text-gray-700 w-16">A</th>
                  <th className="text-left py-3 px-2 font-semibold text-gray-700">B</th>
                  <th className="text-right py-3 px-2 font-semibold text-gray-700 w-28">C</th>
                  <th className="text-right py-3 px-2 font-semibold text-gray-700 w-28">D</th>
                  <th className="text-right py-3 px-2 font-semibold text-gray-700 w-28">E</th>
                  <th className="text-right py-3 px-2 font-semibold text-gray-700 w-28">F</th>
                  <th className="text-right py-3 px-2 font-semibold text-gray-700 w-28">G</th>
                  <th className="text-right py-3 px-2 font-semibold text-gray-700 w-20">H</th>
                  <th className="text-right py-3 px-2 font-semibold text-gray-700 w-28">I</th>
                </tr>
                <tr className="bg-gray-50 border-b text-xs">
                  <th className="text-left py-2 px-2 font-normal text-gray-600">Item No.</th>
                  <th className="text-left py-2 px-2 font-normal text-gray-600">Description</th>
                  <th className="text-right py-2 px-2 font-normal text-gray-600">Scheduled Value</th>
                  <th className="text-right py-2 px-2 font-normal text-gray-600">Previous Apps</th>
                  <th className="text-right py-2 px-2 font-normal text-gray-600">This Period</th>
                  <th className="text-right py-2 px-2 font-normal text-gray-600">Stored</th>
                  <th className="text-right py-2 px-2 font-normal text-gray-600">Total (D+E+F)</th>
                  <th className="text-right py-2 px-2 font-normal text-gray-600">%</th>
                  <th className="text-right py-2 px-2 font-normal text-gray-600">Balance</th>
                </tr>
              </thead>
              <tbody>
                {lineItems.map((item) => {
                  const totalCompleted = item.work_completed_previous + item.work_completed_this_period + item.materials_stored;
                  const percentComplete = item.scheduled_value > 0 
                    ? ((totalCompleted / item.scheduled_value) * 100).toFixed(1) 
                    : '0.0';
                  const balance = item.scheduled_value - totalCompleted;

                  return (
                    <tr key={item.sov_id} className="border-b hover:bg-gray-50">
                      <td className="py-2 px-2">{item.item_number}</td>
                      <td className="py-2 px-2">{item.description}</td>
                      <td className="py-2 px-2 text-right">{formatCurrency(item.scheduled_value)}</td>
                      <td className="py-2 px-2 text-right">{formatCurrency(item.work_completed_previous)}</td>
                      <td className="py-2 px-2 text-right font-medium">{formatCurrency(item.work_completed_this_period)}</td>
                      <td className="py-2 px-2 text-right">{formatCurrency(item.materials_stored)}</td>
                      <td className="py-2 px-2 text-right font-medium">{formatCurrency(totalCompleted)}</td>
                      <td className="py-2 px-2 text-right">{percentComplete}%</td>
                      <td className="py-2 px-2 text-right">{formatCurrency(balance)}</td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="bg-gray-100 font-semibold">
                  <td className="py-3 px-2" colSpan={2}>TOTALS</td>
                  <td className="py-3 px-2 text-right">{formatCurrency(g703Totals.total_scheduled_value)}</td>
                  <td className="py-3 px-2 text-right">{formatCurrency(g703Totals.total_work_previous)}</td>
                  <td className="py-3 px-2 text-right">{formatCurrency(g703Totals.total_work_this_period)}</td>
                  <td className="py-3 px-2 text-right">{formatCurrency(g703Totals.total_materials_stored)}</td>
                  <td className="py-3 px-2 text-right">{formatCurrency(g703Totals.total_completed_and_stored)}</td>
                  <td className="py-3 px-2 text-right">
                    {g703Totals.total_scheduled_value > 0 
                      ? ((g703Totals.total_completed_and_stored / g703Totals.total_scheduled_value) * 100).toFixed(1) 
                      : '0.0'}%
                  </td>
                  <td className="py-3 px-2 text-right">{formatCurrency(g703Totals.total_balance_to_finish)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
