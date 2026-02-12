'use client';

import { useCallback } from 'react';
import { cn } from '@/lib/utils';
import {
  formatCurrency,
  calcTotalCompletedAndStored,
  calcPercentComplete,
  calcBalanceToFinish,
} from '@/lib/calculations';
import type { PayAppLineItemInput } from '@/lib/types';

interface G703TableProps {
  lineItems: PayAppLineItemInput[];
  onLineItemChange: (index: number, field: keyof PayAppLineItemInput, value: number) => void;
  onMarkComplete: (index: number) => void;
}

export function G703Table({
  lineItems,
  onLineItemChange,
  onMarkComplete,
}: G703TableProps) {
  // Calculate totals
  const totals = lineItems.reduce(
    (acc, item) => {
      const totalCompleted = calcTotalCompletedAndStored(
        item.work_completed_previous,
        item.work_completed_this_period,
        item.materials_stored
      );
      return {
        scheduledValue: acc.scheduledValue + item.scheduled_value,
        workPrevious: acc.workPrevious + item.work_completed_previous,
        workThisPeriod: acc.workThisPeriod + item.work_completed_this_period,
        materialsStored: acc.materialsStored + item.materials_stored,
        totalCompleted: acc.totalCompleted + totalCompleted,
        balanceToFinish: acc.balanceToFinish + (item.scheduled_value - totalCompleted),
      };
    },
    {
      scheduledValue: 0,
      workPrevious: 0,
      workThisPeriod: 0,
      materialsStored: 0,
      totalCompleted: 0,
      balanceToFinish: 0,
    }
  );

  const handleInputChange = useCallback(
    (index: number, field: keyof PayAppLineItemInput, value: string) => {
      const numValue = parseFloat(value) || 0;
      onLineItemChange(index, field, numValue);
    },
    [onLineItemChange]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent, rowIndex: number, field: string) => {
      if (e.key === 'Tab' && !e.shiftKey && field === 'work_completed_this_period') {
        // Move to next row's work_completed_this_period
        const nextRow = document.querySelector(
          `[data-row="${rowIndex + 1}"][data-field="work_completed_this_period"]`
        ) as HTMLInputElement;
        if (nextRow) {
          e.preventDefault();
          nextRow.focus();
          nextRow.select();
        }
      }
    },
    []
  );

  return (
    <div className="overflow-x-auto border rounded-lg">
      <table className="g703-table w-full min-w-[900px]">
        <thead className="sticky top-0 z-10">
          <tr>
            <th className="text-center w-14">A<br/><span className="font-normal text-[10px]">Item #</span></th>
            <th className="text-left w-48">B<br/><span className="font-normal text-[10px]">Description</span></th>
            <th className="text-right w-28">C<br/><span className="font-normal text-[10px]">Scheduled Value</span></th>
            <th className="text-right w-28">D<br/><span className="font-normal text-[10px]">Previous Apps</span></th>
            <th className="text-right w-28 bg-blue-800">E<br/><span className="font-normal text-[10px]">This Period</span></th>
            <th className="text-right w-28 bg-blue-800">F<br/><span className="font-normal text-[10px]">Materials Stored</span></th>
            <th className="text-right w-28">G<br/><span className="font-normal text-[10px]">Total to Date</span></th>
            <th className="text-center w-20">H<br/><span className="font-normal text-[10px]">% Complete</span></th>
            <th className="text-right w-28">I<br/><span className="font-normal text-[10px]">Balance</span></th>
            <th className="w-20"></th>
          </tr>
        </thead>
        <tbody>
          {lineItems.map((item, index) => {
            const totalCompleted = calcTotalCompletedAndStored(
              item.work_completed_previous,
              item.work_completed_this_period,
              item.materials_stored
            );
            const percentComplete = calcPercentComplete(totalCompleted, item.scheduled_value);
            const balanceToFinish = calcBalanceToFinish(item.scheduled_value, totalCompleted);
            const isOverbilled = totalCompleted > item.scheduled_value + 0.01;

            return (
              <tr
                key={item.sov_id}
                className={cn(isOverbilled && 'bg-red-50')}
              >
                {/* A: Item Number */}
                <td className="text-center font-mono text-sm">{item.item_number}</td>

                {/* B: Description */}
                <td className="text-sm">{item.description}</td>

                {/* C: Scheduled Value */}
                <td className="text-right font-mono text-sm">
                  {formatCurrency(item.scheduled_value)}
                </td>

                {/* D: Work Completed Previous */}
                <td className="text-right font-mono text-sm text-gray-600">
                  {formatCurrency(item.work_completed_previous)}
                </td>

                {/* E: Work Completed This Period - USER INPUT */}
                <td className="user-input p-0">
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={item.work_completed_this_period || ''}
                    onChange={(e) =>
                      handleInputChange(index, 'work_completed_this_period', e.target.value)
                    }
                    onKeyDown={(e) => handleKeyDown(e, index, 'work_completed_this_period')}
                    data-row={index}
                    data-field="work_completed_this_period"
                    className="w-full h-full px-2 py-1.5 text-right font-mono text-sm border-0 bg-transparent focus:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
                    placeholder="0.00"
                  />
                </td>

                {/* F: Materials Stored - USER INPUT */}
                <td className="user-input p-0">
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={item.materials_stored || ''}
                    onChange={(e) =>
                      handleInputChange(index, 'materials_stored', e.target.value)
                    }
                    data-row={index}
                    data-field="materials_stored"
                    className="w-full h-full px-2 py-1.5 text-right font-mono text-sm border-0 bg-transparent focus:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
                    placeholder="0.00"
                  />
                </td>

                {/* G: Total Completed and Stored */}
                <td
                  className={cn(
                    'text-right font-mono text-sm font-medium',
                    isOverbilled && 'text-red-600'
                  )}
                >
                  {formatCurrency(totalCompleted)}
                </td>

                {/* H: Percent Complete */}
                <td
                  className={cn(
                    'text-center font-mono text-sm',
                    percentComplete >= 1
                      ? 'percent-danger'
                      : percentComplete >= 0.9
                      ? 'percent-warning'
                      : 'percent-normal'
                  )}
                >
                  {(Math.min(percentComplete, 1) * 100).toFixed(1)}%
                </td>

                {/* I: Balance to Finish */}
                <td
                  className={cn(
                    'text-right font-mono text-sm',
                    balanceToFinish < 0 && 'text-red-600'
                  )}
                >
                  {formatCurrency(balanceToFinish)}
                </td>

                {/* Actions */}
                <td className="text-center">
                  {balanceToFinish > 0.01 && (
                    <button
                      onClick={() => onMarkComplete(index)}
                      className="text-xs text-construction-500 hover:text-construction-600 hover:underline"
                      title="Bill remaining balance"
                    >
                      100%
                    </button>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
        <tfoot>
          <tr className="bg-gray-100 font-semibold">
            <td></td>
            <td className="text-right">GRAND TOTAL</td>
            <td className="text-right font-mono">{formatCurrency(totals.scheduledValue)}</td>
            <td className="text-right font-mono">{formatCurrency(totals.workPrevious)}</td>
            <td className="text-right font-mono bg-blue-50">{formatCurrency(totals.workThisPeriod)}</td>
            <td className="text-right font-mono bg-blue-50">{formatCurrency(totals.materialsStored)}</td>
            <td className="text-right font-mono">{formatCurrency(totals.totalCompleted)}</td>
            <td className="text-center font-mono">
              {totals.scheduledValue > 0
                ? ((totals.totalCompleted / totals.scheduledValue) * 100).toFixed(1)
                : 0}
              %
            </td>
            <td className="text-right font-mono">{formatCurrency(totals.balanceToFinish)}</td>
            <td></td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
