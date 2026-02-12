'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, Plus, Trash2, GripVertical } from 'lucide-react';
import { Button, Input, CurrencyInput, Card, CardContent, Alert } from '@/components/ui';
import { createClient } from '@/lib/supabase/client';
import { formatCurrency, parseCurrencyInput, parsePercentageInput } from '@/lib/calculations';
import toast from 'react-hot-toast';
import type { ProjectFormData, SOVLineItemInput } from '@/lib/types';

type Step = 'project' | 'contract' | 'sov';

const defaultFormData: ProjectFormData = {
  project_name: '',
  project_number: '',
  project_address: '',
  owner_name: '',
  architect_name: '',
  gc_name: '',
  gc_contact_email: '',
  contract_date: new Date().toISOString().split('T')[0],
  billing_day: 25,
  original_contract_sum: 0,
  retainage_rate_work: 0.10,
  retainage_rate_stored: 0.10,
};

export default function NewProjectPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>('project');
  const [formData, setFormData] = useState<ProjectFormData>(defaultFormData);
  const [sovItems, setSovItems] = useState<SOVLineItemInput[]>([
    { item_number: '1', description: '', scheduled_value: 0, sort_order: 0 },
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const updateFormData = (field: keyof ProjectFormData, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const validateStep = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (step === 'project') {
      if (!formData.project_name.trim()) {
        newErrors.project_name = 'Project name is required';
      }
      if (!formData.project_address.trim()) {
        newErrors.project_address = 'Project address is required';
      }
      if (!formData.owner_name.trim()) {
        newErrors.owner_name = 'Owner name is required';
      }
      if (!formData.gc_name.trim()) {
        newErrors.gc_name = 'General contractor is required';
      }
      if (!formData.contract_date) {
        newErrors.contract_date = 'Contract date is required';
      }
    }

    if (step === 'contract') {
      if (formData.original_contract_sum <= 0) {
        newErrors.original_contract_sum = 'Contract sum must be greater than 0';
      }
    }

    if (step === 'sov') {
      const hasEmptyItems = sovItems.some(
        (item) => !item.description.trim() || item.scheduled_value <= 0
      );
      if (hasEmptyItems) {
        newErrors.sov = 'All line items must have a description and value';
      }

      const sovTotal = sovItems.reduce((sum, item) => sum + item.scheduled_value, 0);
      if (Math.abs(sovTotal - formData.original_contract_sum) > 0.01) {
        newErrors.sov_total = `SOV total (${formatCurrency(sovTotal)}) must match contract sum (${formatCurrency(formData.original_contract_sum)})`;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (!validateStep()) return;

    if (step === 'project') setStep('contract');
    else if (step === 'contract') setStep('sov');
  };

  const handleBack = () => {
    if (step === 'contract') setStep('project');
    else if (step === 'sov') setStep('contract');
  };

  const addSovItem = () => {
    const nextNumber = (sovItems.length + 1).toString();
    setSovItems([
      ...sovItems,
      {
        item_number: nextNumber,
        description: '',
        scheduled_value: 0,
        sort_order: sovItems.length,
      },
    ]);
  };

  const removeSovItem = (index: number) => {
    if (sovItems.length <= 1) return;
    setSovItems(sovItems.filter((_, i) => i !== index));
  };

  const updateSovItem = (
    index: number,
    field: keyof SOVLineItemInput,
    value: string | number
  ) => {
    const updated = [...sovItems];
    updated[index] = { ...updated[index], [field]: value };
    setSovItems(updated);
    setErrors((prev) => ({ ...prev, sov: '', sov_total: '' }));
  };

  const handleSubmit = async () => {
    if (!validateStep()) return;

    setIsSubmitting(true);

    try {
      const supabase = createClient();

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        toast.error('Please log in to create a project');
        router.push('/login');
        return;
      }

      // Create project
      const { data: project, error: projectError } = await supabase
        .from('projects')
        .insert({
          user_id: user.id,
          project_name: formData.project_name,
          project_number: formData.project_number || null,
          project_address: formData.project_address,
          owner_name: formData.owner_name,
          architect_name: formData.architect_name || null,
          gc_name: formData.gc_name,
          gc_contact_email: formData.gc_contact_email || null,
          contract_date: formData.contract_date,
          billing_day: formData.billing_day,
          original_contract_sum: formData.original_contract_sum,
          retainage_rate_work: formData.retainage_rate_work,
          retainage_rate_stored: formData.retainage_rate_stored,
        })
        .select()
        .single();

      if (projectError) {
        console.error('Project creation error:', projectError);
        toast.error('Failed to create project');
        return;
      }

      // Create SOV items
      const sovData = sovItems.map((item, index) => ({
        project_id: project.id,
        item_number: item.item_number,
        description: item.description,
        scheduled_value: item.scheduled_value,
        sort_order: index,
        is_from_change_order: false,
      }));

      const { error: sovError } = await supabase
        .from('schedule_of_values')
        .insert(sovData);

      if (sovError) {
        console.error('SOV creation error:', sovError);
        toast.error('Failed to create Schedule of Values');
        return;
      }

      toast.success('Project created successfully!');
      router.push(`/projects/${project.id}`);
    } catch (error) {
      console.error('Error creating project:', error);
      toast.error('An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const sovTotal = sovItems.reduce((sum, item) => sum + item.scheduled_value, 0);
  const sovMismatch = Math.abs(sovTotal - formData.original_contract_sum) > 0.01;

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/projects"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-navy-900 mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Projects
        </Link>
        <h1 className="text-2xl font-bold text-navy-900">New Project</h1>
        <p className="text-gray-600 mt-1">
          Set up your project details and Schedule of Values.
        </p>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center gap-4 mb-8">
        {[
          { key: 'project', label: '1. Project Info' },
          { key: 'contract', label: '2. Contract' },
          { key: 'sov', label: '3. Schedule of Values' },
        ].map((s, i) => (
          <div key={s.key} className="flex items-center gap-2">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step === s.key
                  ? 'bg-navy-900 text-white'
                  : i < ['project', 'contract', 'sov'].indexOf(step)
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-200 text-gray-600'
              }`}
            >
              {i + 1}
            </div>
            <span
              className={`text-sm ${
                step === s.key ? 'font-medium text-navy-900' : 'text-gray-600'
              }`}
            >
              {s.label}
            </span>
            {i < 2 && <div className="w-8 h-px bg-gray-300" />}
          </div>
        ))}
      </div>

      {/* Step 1: Project Information */}
      {step === 'project' && (
        <Card>
          <CardContent className="py-6">
            <h2 className="text-lg font-semibold text-navy-900 mb-6">
              Project Information
            </h2>
            <div className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <Input
                  label="Project Name"
                  value={formData.project_name}
                  onChange={(e) => updateFormData('project_name', e.target.value)}
                  placeholder="e.g., Lincoln Park Renovation"
                  error={errors.project_name}
                  required
                />
                <Input
                  label="Project Number"
                  value={formData.project_number}
                  onChange={(e) => updateFormData('project_number', e.target.value)}
                  placeholder="Your internal reference"
                />
              </div>

              <Input
                label="Project Address"
                value={formData.project_address}
                onChange={(e) => updateFormData('project_address', e.target.value)}
                placeholder="123 Main St, City, State ZIP"
                error={errors.project_address}
                required
              />

              <div className="grid gap-6 md:grid-cols-2">
                <Input
                  label="Owner Name"
                  value={formData.owner_name}
                  onChange={(e) => updateFormData('owner_name', e.target.value)}
                  placeholder="Property owner"
                  error={errors.owner_name}
                  required
                />
                <Input
                  label="Architect Name"
                  value={formData.architect_name}
                  onChange={(e) => updateFormData('architect_name', e.target.value)}
                  placeholder="Architect/engineer of record"
                />
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <Input
                  label="General Contractor"
                  value={formData.gc_name}
                  onChange={(e) => updateFormData('gc_name', e.target.value)}
                  placeholder="Who you're billing"
                  error={errors.gc_name}
                  required
                />
                <Input
                  label="GC Contact Email"
                  type="email"
                  value={formData.gc_contact_email}
                  onChange={(e) => updateFormData('gc_contact_email', e.target.value)}
                  placeholder="contact@gc.com"
                />
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <Input
                  label="Contract Date"
                  type="date"
                  value={formData.contract_date}
                  onChange={(e) => updateFormData('contract_date', e.target.value)}
                  error={errors.contract_date}
                  required
                />
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Monthly Billing Day
                  </label>
                  <select
                    value={formData.billing_day}
                    onChange={(e) =>
                      updateFormData('billing_day', parseInt(e.target.value))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-navy-500 focus:border-transparent"
                  >
                    {Array.from({ length: 28 }, (_, i) => i + 1).map((day) => (
                      <option key={day} value={day}>
                        {day}
                        {day === 1
                          ? 'st'
                          : day === 2
                          ? 'nd'
                          : day === 3
                          ? 'rd'
                          : 'th'}{' '}
                        of each month
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="flex justify-end mt-8">
              <Button onClick={handleNext} rightIcon={<ArrowRight className="h-4 w-4" />}>
                Continue
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Contract Information */}
      {step === 'contract' && (
        <Card>
          <CardContent className="py-6">
            <h2 className="text-lg font-semibold text-navy-900 mb-6">
              Contract Information
            </h2>
            <div className="space-y-6">
              <CurrencyInput
                label="Original Contract Sum"
                value={formData.original_contract_sum}
                onChange={(value) => updateFormData('original_contract_sum', value)}
                error={errors.original_contract_sum}
              />

              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Retainage Rate (Work Completed)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min="0"
                      max="20"
                      step="0.5"
                      value={(formData.retainage_rate_work * 100).toString()}
                      onChange={(e) =>
                        updateFormData(
                          'retainage_rate_work',
                          parseFloat(e.target.value) / 100
                        )
                      }
                      className="w-full px-3 py-2 pr-8 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-navy-500 focus:border-transparent"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
                      %
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    Standard is 10%. Range: 0-20%
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Retainage Rate (Materials Stored)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min="0"
                      max="20"
                      step="0.5"
                      value={(formData.retainage_rate_stored * 100).toString()}
                      onChange={(e) =>
                        updateFormData(
                          'retainage_rate_stored',
                          parseFloat(e.target.value) / 100
                        )
                      }
                      className="w-full px-3 py-2 pr-8 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-navy-500 focus:border-transparent"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
                      %
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    Often same as work completed
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-between mt-8">
              <Button variant="outline" onClick={handleBack}>
                Back
              </Button>
              <Button onClick={handleNext} rightIcon={<ArrowRight className="h-4 w-4" />}>
                Continue
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Schedule of Values */}
      {step === 'sov' && (
        <Card>
          <CardContent className="py-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-semibold text-navy-900">
                  Schedule of Values
                </h2>
                <p className="text-sm text-gray-600">
                  Break down your contract into billable line items.
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={addSovItem}
                leftIcon={<Plus className="h-4 w-4" />}
              >
                Add Line
              </Button>
            </div>

            {errors.sov && (
              <Alert type="error" className="mb-4">
                {errors.sov}
              </Alert>
            )}

            {errors.sov_total && (
              <Alert type="warning" className="mb-4">
                {errors.sov_total}
              </Alert>
            )}

            {/* SOV Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left text-xs font-semibold text-gray-600 pb-3 w-16">
                      Item #
                    </th>
                    <th className="text-left text-xs font-semibold text-gray-600 pb-3">
                      Description of Work
                    </th>
                    <th className="text-right text-xs font-semibold text-gray-600 pb-3 w-40">
                      Scheduled Value
                    </th>
                    <th className="w-10"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {sovItems.map((item, index) => (
                    <tr key={index} className="group">
                      <td className="py-2 pr-2">
                        <input
                          type="text"
                          value={item.item_number}
                          onChange={(e) =>
                            updateSovItem(index, 'item_number', e.target.value)
                          }
                          className="w-14 px-2 py-1.5 border border-gray-200 rounded text-sm focus:outline-none focus:ring-2 focus:ring-navy-500"
                        />
                      </td>
                      <td className="py-2 pr-2">
                        <input
                          type="text"
                          value={item.description}
                          onChange={(e) =>
                            updateSovItem(index, 'description', e.target.value)
                          }
                          placeholder="e.g., General Conditions"
                          className="w-full px-2 py-1.5 border border-gray-200 rounded text-sm focus:outline-none focus:ring-2 focus:ring-navy-500"
                        />
                      </td>
                      <td className="py-2 pr-2">
                        <CurrencyInput
                          value={item.scheduled_value}
                          onChange={(value) =>
                            updateSovItem(index, 'scheduled_value', value)
                          }
                          className="text-sm py-1.5"
                        />
                      </td>
                      <td className="py-2">
                        <button
                          onClick={() => removeSovItem(index)}
                          disabled={sovItems.length <= 1}
                          className="p-1 text-gray-400 hover:text-red-500 disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-gray-300">
                    <td colSpan={2} className="py-3 text-right font-semibold text-navy-900">
                      Total:
                    </td>
                    <td
                      className={`py-3 text-right font-mono font-bold ${
                        sovMismatch ? 'text-red-600' : 'text-navy-900'
                      }`}
                    >
                      {formatCurrency(sovTotal)}
                    </td>
                    <td></td>
                  </tr>
                  <tr>
                    <td colSpan={2} className="py-1 text-right text-sm text-gray-600">
                      Contract Sum:
                    </td>
                    <td className="py-1 text-right font-mono text-sm text-gray-600">
                      {formatCurrency(formData.original_contract_sum)}
                    </td>
                    <td></td>
                  </tr>
                  {sovMismatch && (
                    <tr>
                      <td colSpan={2} className="py-1 text-right text-sm text-red-600">
                        Difference:
                      </td>
                      <td className="py-1 text-right font-mono text-sm text-red-600">
                        {formatCurrency(sovTotal - formData.original_contract_sum)}
                      </td>
                      <td></td>
                    </tr>
                  )}
                </tfoot>
              </table>
            </div>

            <div className="flex justify-between mt-8">
              <Button variant="outline" onClick={handleBack}>
                Back
              </Button>
              <Button
                onClick={handleSubmit}
                isLoading={isSubmitting}
                disabled={sovMismatch}
              >
                Create Project
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
