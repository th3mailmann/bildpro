'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Button, Card, CardContent, CardHeader, CardTitle, Badge, Modal, Input, Alert } from '@/components/ui';
import { ArrowLeft, Plus, FileText, Edit2, Trash2, AlertCircle } from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';
import { ChangeOrder, Project, ChangeOrderStatus } from '@/lib/types';

export default function ChangeOrdersPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;
  const supabase = createClient();

  const [project, setProject] = useState<Project | null>(null);
  const [changeOrders, setChangeOrders] = useState<ChangeOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCO, setEditingCO] = useState<ChangeOrder | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Form state
  const [formData, setFormData] = useState({
    co_number: '',
    description: '',
    amount: '',
    status: 'pending' as ChangeOrderStatus,
    date_approved: '',
  });

  useEffect(() => {
    fetchData();
  }, [projectId]);

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

      // Fetch change orders
      const { data: coData, error: coError } = await supabase
        .from('change_orders')
        .select('*')
        .eq('project_id', projectId)
        .order('co_number', { ascending: true });

      if (coError) throw coError;
      setChangeOrders(coData || []);
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  }

  function openAddModal() {
    setEditingCO(null);
    // Suggest next CO number
    const nextNumber = changeOrders.length > 0 
      ? Math.max(...changeOrders.map(co => co.co_number)) + 1
      : 1;
    setFormData({
      co_number: nextNumber.toString(),
      description: '',
      amount: '',
      status: 'pending',
      date_approved: '',
    });
    setError('');
    setIsModalOpen(true);
  }

  function openEditModal(co: ChangeOrder) {
    setEditingCO(co);
    setFormData({
      co_number: co.co_number.toString(),
      description: co.description,
      amount: co.amount.toString(),
      status: co.status,
      date_approved: co.date_approved || '',
    });
    setError('');
    setIsModalOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSaving(true);

    const coData = {
      project_id: projectId,
      co_number: parseInt(formData.co_number) || 1,
      description: formData.description,
      amount: parseFloat(formData.amount) || 0,
      status: formData.status,
      date_approved: formData.status === 'approved' && formData.date_approved 
        ? formData.date_approved 
        : null,
    };

    try {
      if (editingCO) {
        // Update existing
        const { error } = await supabase
          .from('change_orders')
          .update(coData)
          .eq('id', editingCO.id);

        if (error) throw error;
      } else {
        // Insert new
        const { error } = await supabase
          .from('change_orders')
          .insert(coData);

        if (error) throw error;
      }

      setIsModalOpen(false);
      fetchData();
    } catch (err: any) {
      console.error('Error saving change order:', err);
      setError(err.message || 'Failed to save change order');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(co: ChangeOrder) {
    if (!confirm(`Are you sure you want to delete CO #${co.co_number}?`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('change_orders')
        .delete()
        .eq('id', co.id);

      if (error) throw error;
      fetchData();
    } catch (err) {
      console.error('Error deleting change order:', err);
    }
  }

  // Calculate totals
  const approvedTotal = changeOrders
    .filter(co => co.status === 'approved')
    .reduce((sum, co) => sum + co.amount, 0);

  const pendingTotal = changeOrders
    .filter(co => co.status === 'pending')
    .reduce((sum, co) => sum + co.amount, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-construction-500"></div>
      </div>
    );
  }

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
            <h1 className="text-2xl font-bold text-navy-900">Change Orders</h1>
            <p className="text-gray-600">{project?.project_name}</p>
          </div>
        </div>
        <Button onClick={openAddModal}>
          <Plus className="h-4 w-4 mr-2" />
          Add Change Order
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="py-4">
            <p className="text-sm text-gray-600">Original Contract</p>
            <p className="text-2xl font-bold text-navy-900">
              {formatCurrency(project?.original_contract_sum || 0)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4">
            <p className="text-sm text-gray-600">Approved Changes</p>
            <p className={`text-2xl font-bold ${approvedTotal >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {approvedTotal >= 0 ? '+' : ''}{formatCurrency(approvedTotal)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4">
            <p className="text-sm text-gray-600">Current Contract Sum</p>
            <p className="text-2xl font-bold text-navy-900">
              {formatCurrency((project?.original_contract_sum || 0) + approvedTotal)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Pending Alert */}
      {pendingTotal !== 0 && (
        <Alert type="warning">
          You have {formatCurrency(Math.abs(pendingTotal))} in pending change orders.
        </Alert>
      )}

      {/* Change Orders Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Change Orders</CardTitle>
        </CardHeader>
        <CardContent>
          {changeOrders.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No change orders yet.</p>
              <p className="text-sm text-gray-500 mb-4">
                Click &quot;Add Change Order&quot; to create one.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">CO #</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Description</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Amount</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Date Approved</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {changeOrders.map((co) => (
                    <tr key={co.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4 font-medium">{co.co_number}</td>
                      <td className="py-3 px-4">{co.description}</td>
                      <td className={`py-3 px-4 font-medium ${co.amount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {co.amount >= 0 ? '+' : ''}{formatCurrency(co.amount)}
                      </td>
                      <td className="py-3 px-4">
                        <Badge
                          variant={
                            co.status === 'approved' 
                              ? 'success' 
                              : co.status === 'rejected' 
                                ? 'error' 
                                : 'warning'
                          }
                        >
                          {co.status.charAt(0).toUpperCase() + co.status.slice(1)}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-gray-600">
                        {co.date_approved ? formatDate(co.date_approved) : '-'}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => openEditModal(co)}
                            className="p-1 text-gray-400 hover:text-navy-600"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(co)}
                            className="p-1 text-gray-400 hover:text-red-600"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingCO ? 'Edit Change Order' : 'Add Change Order'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert type="error">
              {error}
            </Alert>
          )}

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="CO Number"
              value={formData.co_number}
              onChange={(e) => setFormData({ ...formData, co_number: e.target.value })}
              required
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  status: e.target.value as ChangeOrderStatus,
                  date_approved: e.target.value === 'approved' && !formData.date_approved 
                    ? new Date().toISOString().split('T')[0]
                    : formData.date_approved
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-construction-500 focus:border-construction-500"
              >
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>

          <Input
            label="Description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            required
          />

          <Input
            label="Amount (use negative for deductions)"
            type="number"
            step="0.01"
            value={formData.amount}
            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
            required
          />

          {formData.status === 'approved' && (
            <Input
              label="Date Approved"
              type="date"
              value={formData.date_approved}
              onChange={(e) => setFormData({ ...formData, date_approved: e.target.value })}
            />
          )}

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" isLoading={saving}>
              {editingCO ? 'Update' : 'Add'} Change Order
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
