'use client';

import { formatCurrency } from '@/lib/calculations';
import { Card, CardContent } from '@/components/ui';
import type { G702Summary as G702SummaryType } from '@/lib/types';

interface G702SummaryProps {
  summary: G702SummaryType;
}

export function G702Summary({ summary }: G702SummaryProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-navy-900">
        G702 Summary — Application for Payment
      </h3>

      <div className="bg-gray-50 rounded-lg p-4 space-y-3">
        {/* Line 1 */}
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">
            1. Original Contract Sum
          </span>
          <span className="font-mono font-medium">
            {formatCurrency(summary.line1_original_contract_sum)}
          </span>
        </div>

        {/* Line 2 */}
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">
            2. Net Change by Change Orders
          </span>
          <span
            className={`font-mono font-medium ${
              summary.line2_net_change_orders !== 0
                ? summary.line2_net_change_orders > 0
                  ? 'text-green-600'
                  : 'text-red-600'
                : ''
            }`}
          >
            {summary.line2_net_change_orders >= 0 ? '+' : ''}
            {formatCurrency(summary.line2_net_change_orders)}
          </span>
        </div>

        {/* Line 3 */}
        <div className="flex justify-between text-sm border-t pt-3">
          <span className="font-medium text-navy-900">
            3. Contract Sum to Date (Line 1 + 2)
          </span>
          <span className="font-mono font-semibold text-navy-900">
            {formatCurrency(summary.line3_contract_sum_to_date)}
          </span>
        </div>

        {/* Line 4 */}
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">
            4. Total Completed & Stored to Date
          </span>
          <span className="font-mono font-medium">
            {formatCurrency(summary.line4_total_completed_and_stored)}
          </span>
        </div>

        {/* Line 5 - Retainage */}
        <div className="pl-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">
              5a. Retainage on Completed Work
            </span>
            <span className="font-mono">
              {formatCurrency(summary.line5a_retainage_on_completed)}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">
              5b. Retainage on Stored Materials
            </span>
            <span className="font-mono">
              {formatCurrency(summary.line5b_retainage_on_stored)}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">
              5c. Total Retainage (5a + 5b)
            </span>
            <span className="font-mono font-medium">
              {formatCurrency(summary.line5c_total_retainage)}
            </span>
          </div>
        </div>

        {/* Line 6 */}
        <div className="flex justify-between text-sm border-t pt-3">
          <span className="font-medium text-navy-900">
            6. Total Earned Less Retainage (4 − 5c)
          </span>
          <span className="font-mono font-semibold text-navy-900">
            {formatCurrency(summary.line6_total_earned_less_retainage)}
          </span>
        </div>

        {/* Line 7 */}
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">
            7. Less Previous Certificates for Payment
          </span>
          <span className="font-mono font-medium">
            {formatCurrency(summary.line7_less_previous_certificates)}
          </span>
        </div>

        {/* Line 8 - THE NUMBER */}
        <Card className="!mt-4 border-2 border-construction-500 bg-construction-50">
          <CardContent className="py-4">
            <div className="flex justify-between items-center">
              <span className="text-lg font-bold text-navy-900">
                8. CURRENT PAYMENT DUE
              </span>
              <span className="text-2xl font-bold font-mono text-construction-600">
                {formatCurrency(summary.line8_current_payment_due)}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Line 9 */}
        <div className="flex justify-between text-sm pt-2">
          <span className="text-gray-600">
            9. Balance to Finish Including Retainage
          </span>
          <span className="font-mono font-medium">
            {formatCurrency(summary.line9_balance_to_finish_plus_retainage)}
          </span>
        </div>
      </div>
    </div>
  );
}
