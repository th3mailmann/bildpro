'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, FileText, Download, Eye } from 'lucide-react';
import { Button, Input, Card, CardContent, Alert, Modal } from '@/components/ui';
import { G703Table } from '@/components/G703Table';
import { G702Summary } from '@/components/G702Summary';
import { createClient } from '@/lib/supabase/client';
import {
  calculateG703Totals,
  calculateG702Summary,
  calculateRemainingBalance,
  validatePayApplication,
  getDefaultPayAppPeriod,
} from '@/lib/calculations';
import { generatePayAppPDF } from '@/lib/pdf/generator';
import toast from 'react-hot-toast';
import type {
  Project,
  ScheduleOfValuesItem,
  ChangeOrder,
  PayApplication,
  PayAppLineItemInput,
  G702Summary as G702SummaryType,
  SubscriptionTier,
} from '@/lib/types';

interface NewPayAppClientProps {
  project: Project;
  sovItems: ScheduleOfValuesItem[];
  changeOrders: ChangeOrder[];
  previousPayApps: PayApplication[];
  lastPayAppLineItems: Array<{
    sov_id: string;
    work_completed_previous: number;
    work_completed_this_period: number;
    materials_stored: number;
    total_completed_and_stored: number;
  }>;
  subscriptionTier: SubscriptionTier;
  companyName: string;
  companyAddress: string;
  companyLogoUrl: string | null;
}

export default function NewPayAppClient({
  project,
  sovItems,
  changeOrders,
  previousPayApps,
  lastPayAppLineItems,
  subscriptionTier,
  companyName,
  companyAddress,
  companyLogoUrl,
}: NewPayAppClientProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  // Form state
  const nextAppNumber = previousPayApps.length > 0 
    ? Math.max(...previousPayApps.map(p => p.application_number)) + 1 
    : 1;
  
  const defaultPeriod = getDefaultPayAppPeriod(
    previousPayApps.length > 0 ? previousPayApps[0] : null,
    project.contract_date,
    project.billing_day
  );

  const [applicationNumber, setApplicationNumber] = useState(nextAppNumber);
  const [periodFrom, setPeriodFrom] = useState(defaultPeriod.periodFrom);
  const [periodTo, setPeriodTo] = useState(defaultPeriod.periodTo);

  // Initialize line items with carried-forward data
  const [lineItems, setLineItems] = useState<PayAppLineItemInput[]>(() => {
    return sovItems.map((sov) => {
      // Find previous billing data for this SOV item
      const prevData = lastPayAppLineItems.find((li) => li.sov_id === sov.id);
      
      // Previous work is the total completed from the last pay app
      const workCompletedPrevious = prevData?.total_completed_and_stored || 0;

      return {
        sov_id: sov.id,
        item_number: sov.item_number,
        description: sov.description,
        scheduled_value: sov.scheduled_value,
        work_completed_previous: workCompletedPrevious,
        work_completed_this_period: 0,
        materials_stored: 0,
      };
    });
  });

  // Calculate G703 totals
  const g703Totals = calculateG703Totals(lineItems);

  // Calculate G702 summary
  const g702Summary: G702SummaryType = calculateG702Summary(
    project.original_contract_sum,
    changeOrders,
    g703Totals,
    project.retainage_rate_work,
    project.retainage_rate_stored,
    previousPayApps.filter((p) => p.application_number < applicationNumber)
  );

  // Validation
  const validation = validatePayApplication(lineItems, g702Summary, g703Totals);

  // Handle line item changes
  const handleLineItemChange = useCallback(
    (index: number, field: keyof PayAppLineItemInput, value: number) => {
      setLineItems((prev) => {
        const updated = [...prev];
        updated[index] = { ...updated[index], [field]: value };
        return updated;
      });
    },
    []
  );

  // Mark line item as 100% complete
  const handleMarkComplete = useCallback((index: number) => {
    setLineItems((prev) => {
      const updated = [...prev];
      const item = updated[index];
      const remaining = calculateRemainingBalance(
        item.scheduled_value,
        item.work_completed_previous,
        item.materials_stored
      );
      updated[index] = {
        ...item,
        work_completed_this_period: remaining,
      };
      return updated;
    });
  }, []);

  // Bill all remaining
  const handleBillRemaining = () => {
    setLineItems((prev) =>
      prev.map((item) => {
        const remaining = calculateRemainingBalance(
          item.scheduled_value,
          item.work_completed_previous,
          item.materials_stored
        );
        return {
          ...item,
          work_completed_this_period: remaining > 0 ? remaining : 0,
        };
      })
    );
  };

  // Save draft
  const handleSaveDraft = async () => {
    setIsSubmitting(true);
    try {
      await savePayApplication('draft');
      toast.success('Draft saved successfully');
    } catch (error) {
      console.error('Error saving draft:', error);
      toast.error('Failed to save draft');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Generate PDF
  const handleGeneratePDF = async () => {
    if (!validation.isValid) {
      toast.error('Please fix validation errors before generating PDF');
      return;
    }

    setIsSubmitting(true);
    try {
      // Save the pay app first
      const payAppId = await savePayApplication('submitted');
      
      // Generate PDF
      await generatePayAppPDF({
        project,
        applicationNumber,
        periodFrom,
        periodTo,
        lineItems,
        g702Summary,
        g703Totals,
        changeOrders: changeOrders.filter((co) => co.status === 'approved'),
        isPro: subscriptionTier !== 'free',
        companyName,
        companyAddress,
        companyLogoUrl: companyLogoUrl || undefined,
      });

      toast.success('PDF generated successfully');
      router.push(`/projects/${project.id}`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Failed to generate PDF');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Save pay application to database
  const savePayApplication = async (status: 'draft' | 'submitted'): Promise<string> => {
    const supabase = createClient();

    // Calculate all line item values
    const lineItemsWithCalculations = lineItems.map((item) => {
      const totalCompleted =
        item.work_completed_previous +
        item.work_completed_this_period +
        item.materials_stored;
      const percentComplete =
        item.scheduled_value > 0 ? totalCompleted / item.scheduled_value : 0;
      const balanceToFinish = item.scheduled_value - totalCompleted;
      const retainage =
        (item.work_completed_previous + item.work_completed_this_period) *
          project.retainage_rate_work +
        item.materials_stored * project.retainage_rate_stored;

      return {
        ...item,
        total_completed_and_stored: totalCompleted,
        percent_complete: percentComplete,
        balance_to_finish: balanceToFinish,
        retainage,
      };
    });

    // Create pay application
    const { data: payApp, error: payAppError } = await supabase
      .from('pay_applications')
      .insert({
        project_id: project.id,
        application_number: applicationNumber,
        period_from: periodFrom,
        period_to: periodTo,
        status,
        original_contract_sum: g702Summary.line1_original_contract_sum,
        net_change_orders: g702Summary.line2_net_change_orders,
        contract_sum_to_date: g702Summary.line3_contract_sum_to_date,
        total_completed_and_stored: g702Summary.line4_total_completed_and_stored,
        retainage_on_completed: g702Summary.line5a_retainage_on_completed,
        retainage_on_stored: g702Summary.line5b_retainage_on_stored,
        total_retainage: g702Summary.line5c_total_retainage,
        total_earned_less_retainage: g702Summary.line6_total_earned_less_retainage,
        less_previous_certificates: g702Summary.line7_less_previous_certificates,
        current_payment_due: g702Summary.line8_current_payment_due,
        balance_to_finish: g702Summary.line9_balance_to_finish_plus_retainage,
        submitted_at: status === 'submitted' ? new Date().toISOString() : null,
      })
      .select()
      .single();

    if (payAppError) {
      throw payAppError;
    }

    // Create line items
    const lineItemsData = lineItemsWithCalculations.map((item) => ({
      pay_application_id: payApp.id,
      sov_id: item.sov_id,
      item_number: item.item_number,
      description: item.description,
      scheduled_value: item.scheduled_value,
      work_completed_previous: item.work_completed_previous,
      work_completed_this_period: item.work_completed_this_period,
      materials_stored: item.materials_stored,
      total_completed_and_stored: item.total_completed_and_stored,
      percent_complete: item.percent_complete,
      balance_to_finish: item.balance_to_finish,
      retainage: item.retainage,
    }));

    const { error: lineItemsError } = await supabase
      .from('pay_app_line_items')
      .insert(lineItemsData);

    if (lineItemsError) {
      throw lineItemsError;
    }

    return payApp.id;
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <Link
          href={`/projects/${project.id}`}
          className="inline-flex items-center gap-2 text-gray-600 hover:text-navy-900 mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to {project.project_name}
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-navy-900">
              Pay Application #{applicationNumber}
            </h1>
            <p className="text-gray-600 mt-1">{project.project_name}</p>
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={handleSaveDraft}
              isLoading={isSubmitting}
              leftIcon={<Save className="h-4 w-4" />}
            >
              Save Draft
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowPreview(true)}
              leftIcon={<Eye className="h-4 w-4" />}
            >
              Preview
            </Button>
            <Button
              onClick={handleGeneratePDF}
              isLoading={isSubmitting}
              disabled={!validation.isValid}
              leftIcon={<Download className="h-4 w-4" />}
            >
              Generate PDF
            </Button>
          </div>
        </div>
      </div>

      {/* Validation Messages */}
      {validation.errors.length > 0 && (
        <Alert type="error">
          <ul className="list-disc list-inside space-y-1">
            {validation.errors.map((error, i) => (
              <li key={i}>{error.message}</li>
            ))}
          </ul>
        </Alert>
      )}

      {validation.warnings.length > 0 && (
        <Alert type="warning">
          <ul className="list-disc list-inside space-y-1">
            {validation.warnings.map((warning, i) => (
              <li key={i}>{warning.message}</li>
            ))}
          </ul>
        </Alert>
      )}

      {/* Pay App Header */}
      <Card>
        <CardContent className="py-6">
          <div className="grid gap-6 md:grid-cols-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Application No.
              </label>
              <Input
                type="number"
                value={applicationNumber}
                onChange={(e) => setApplicationNumber(parseInt(e.target.value) || 1)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Period From
              </label>
              <Input
                type="date"
                value={periodFrom}
                onChange={(e) => setPeriodFrom(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Period To
              </label>
              <Input
                type="date"
                value={periodTo}
                onChange={(e) => setPeriodTo(e.target.value)}
              />
            </div>
            <div className="flex items-end">
              <Button variant="outline" size="sm" onClick={handleBillRemaining}>
                Bill All Remaining
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* G703 Table */}
      <div>
        <h2 className="text-lg font-semibold text-navy-900 mb-4">
          G703 Continuation Sheet — Work Completed
        </h2>
        <G703Table
          lineItems={lineItems}
          onLineItemChange={handleLineItemChange}
          onMarkComplete={handleMarkComplete}
        />
        <p className="text-sm text-gray-500 mt-2">
          💡 Tip: Tab key moves down Column E for fast data entry. Click &ldquo;100%&rdquo; to bill remaining balance.
        </p>
      </div>

      {/* G702 Summary */}
      <G702Summary summary={g702Summary} />

      {/* Preview Modal */}
      <Modal
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
        title="Pay Application Preview"
        size="xl"
      >
        <div className="space-y-6">
          <G702Summary summary={g702Summary} />
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setShowPreview(false)}>
              Close
            </Button>
            <Button
              onClick={() => {
                setShowPreview(false);
                handleGeneratePDF();
              }}
              disabled={!validation.isValid}
              leftIcon={<Download className="h-4 w-4" />}
            >
              Generate PDF
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
