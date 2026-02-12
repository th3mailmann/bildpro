/**
 * BildPro Calculation Engine
 * 
 * THIS IS THE MOST CRITICAL FILE IN THE ENTIRE APPLICATION.
 * All G702/G703 calculations must be defined here and nowhere else.
 * Every formula must match the AIA standard exactly.
 * 
 * DO NOT duplicate these calculations elsewhere in the codebase.
 */

import type {
  PayAppLineItemInput,
  G702Summary,
  G703Totals,
  ValidationResult,
  ValidationError,
  ValidationWarning,
  ChangeOrder,
  PayApplication,
} from './types';

/**
 * Round to 2 decimal places (currency)
 */
export function roundCurrency(value: number): number {
  return Math.round(value * 100) / 100;
}

/**
 * Round to 4 decimal places (percentages stored as decimals)
 */
export function roundPercentage(value: number): number {
  return Math.round(value * 10000) / 10000;
}

/**
 * Format number as currency string
 */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

/**
 * Format decimal as percentage string
 */
export function formatPercent(value: number, decimals: number = 2): string {
  return `${(value * 100).toFixed(decimals)}%`;
}

/**
 * Parse currency input string to number
 */
export function parseCurrencyInput(value: string): number {
  // Remove currency symbols, commas, and spaces
  const cleaned = value.replace(/[$,\s]/g, '');
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : roundCurrency(parsed);
}

/**
 * Parse percentage input (e.g., "10" or "10%") to decimal (0.10)
 */
export function parsePercentageInput(value: string): number {
  const cleaned = value.replace(/%/g, '').trim();
  const parsed = parseFloat(cleaned);
  if (isNaN(parsed)) return 0;
  // Convert from percentage to decimal
  return roundPercentage(parsed / 100);
}

// =============================================================================
// G703 LINE ITEM CALCULATIONS
// =============================================================================

/**
 * Calculate Column G: Total Completed and Stored to Date
 * Formula: G = D + E + F
 */
export function calcTotalCompletedAndStored(
  workCompletedPrevious: number, // D
  workCompletedThisPeriod: number, // E
  materialsStored: number // F
): number {
  return roundCurrency(workCompletedPrevious + workCompletedThisPeriod + materialsStored);
}

/**
 * Calculate Column H: Percent Complete
 * Formula: H = G / C
 */
export function calcPercentComplete(
  totalCompletedAndStored: number, // G
  scheduledValue: number // C
): number {
  if (scheduledValue === 0) return 0;
  return roundPercentage(totalCompletedAndStored / scheduledValue);
}

/**
 * Calculate Column I: Balance to Finish
 * Formula: I = C - G
 */
export function calcBalanceToFinish(
  scheduledValue: number, // C
  totalCompletedAndStored: number // G
): number {
  return roundCurrency(scheduledValue - totalCompletedAndStored);
}

/**
 * Calculate retainage for a single line item
 */
export function calcLineItemRetainage(
  workCompletedPrevious: number,
  workCompletedThisPeriod: number,
  materialsStored: number,
  retainageRateWork: number,
  retainageRateStored: number
): number {
  const workRetainage = (workCompletedPrevious + workCompletedThisPeriod) * retainageRateWork;
  const storedRetainage = materialsStored * retainageRateStored;
  return roundCurrency(workRetainage + storedRetainage);
}

/**
 * Calculate all derived fields for a single G703 line item
 */
export function calculateLineItem(
  input: PayAppLineItemInput,
  retainageRateWork: number,
  retainageRateStored: number
): {
  total_completed_and_stored: number;
  percent_complete: number;
  balance_to_finish: number;
  retainage: number;
} {
  const total_completed_and_stored = calcTotalCompletedAndStored(
    input.work_completed_previous,
    input.work_completed_this_period,
    input.materials_stored
  );

  const percent_complete = calcPercentComplete(
    total_completed_and_stored,
    input.scheduled_value
  );

  const balance_to_finish = calcBalanceToFinish(
    input.scheduled_value,
    total_completed_and_stored
  );

  const retainage = calcLineItemRetainage(
    input.work_completed_previous,
    input.work_completed_this_period,
    input.materials_stored,
    retainageRateWork,
    retainageRateStored
  );

  return {
    total_completed_and_stored,
    percent_complete,
    balance_to_finish,
    retainage,
  };
}

// =============================================================================
// G703 TOTALS (Column Sums)
// =============================================================================

/**
 * Calculate all G703 column totals
 */
export function calculateG703Totals(lineItems: PayAppLineItemInput[]): G703Totals {
  const totals = lineItems.reduce(
    (acc, item) => {
      const totalCompletedAndStored = calcTotalCompletedAndStored(
        item.work_completed_previous,
        item.work_completed_this_period,
        item.materials_stored
      );

      return {
        total_scheduled_value: acc.total_scheduled_value + item.scheduled_value,
        total_work_previous: acc.total_work_previous + item.work_completed_previous,
        total_work_this_period: acc.total_work_this_period + item.work_completed_this_period,
        total_materials_stored: acc.total_materials_stored + item.materials_stored,
        total_completed_and_stored: acc.total_completed_and_stored + totalCompletedAndStored,
        total_balance_to_finish: acc.total_balance_to_finish + (item.scheduled_value - totalCompletedAndStored),
      };
    },
    {
      total_scheduled_value: 0,
      total_work_previous: 0,
      total_work_this_period: 0,
      total_materials_stored: 0,
      total_completed_and_stored: 0,
      total_balance_to_finish: 0,
    }
  );

  return {
    total_scheduled_value: roundCurrency(totals.total_scheduled_value),
    total_work_previous: roundCurrency(totals.total_work_previous),
    total_work_this_period: roundCurrency(totals.total_work_this_period),
    total_materials_stored: roundCurrency(totals.total_materials_stored),
    total_completed_and_stored: roundCurrency(totals.total_completed_and_stored),
    total_balance_to_finish: roundCurrency(totals.total_balance_to_finish),
  };
}

// =============================================================================
// G702 SUMMARY CALCULATIONS
// =============================================================================

/**
 * Calculate net change orders (sum of approved COs)
 */
export function calculateNetChangeOrders(changeOrders: ChangeOrder[]): number {
  const total = changeOrders
    .filter((co) => co.status === 'approved')
    .reduce((sum, co) => sum + co.amount, 0);
  return roundCurrency(total);
}

/**
 * Calculate less previous certificates (sum of prior pay apps' total earned less retainage)
 */
export function calculateLessPreviousCertificates(
  previousPayApps: PayApplication[]
): number {
  const total = previousPayApps.reduce(
    (sum, app) => sum + app.total_earned_less_retainage,
    0
  );
  return roundCurrency(total);
}

/**
 * Calculate complete G702 summary from G703 data
 * This is the main calculation function that ties everything together
 */
export function calculateG702Summary(
  originalContractSum: number,
  changeOrders: ChangeOrder[],
  g703Totals: G703Totals,
  retainageRateWork: number,
  retainageRateStored: number,
  previousPayApps: PayApplication[]
): G702Summary {
  // Line 1: Original Contract Sum
  const line1 = roundCurrency(originalContractSum);

  // Line 2: Net Change by Change Orders
  const line2 = calculateNetChangeOrders(changeOrders);

  // Line 3: Contract Sum to Date (Line 1 + Line 2)
  const line3 = roundCurrency(line1 + line2);

  // Line 4: Total Completed and Stored to Date (from G703)
  const line4 = g703Totals.total_completed_and_stored;

  // Line 5a: Retainage on Completed Work
  // (Total work previous + Total work this period) × retainage rate
  const completedWork = g703Totals.total_work_previous + g703Totals.total_work_this_period;
  const line5a = roundCurrency(completedWork * retainageRateWork);

  // Line 5b: Retainage on Stored Materials
  const line5b = roundCurrency(g703Totals.total_materials_stored * retainageRateStored);

  // Line 5c: Total Retainage (5a + 5b)
  const line5c = roundCurrency(line5a + line5b);

  // Line 6: Total Earned Less Retainage (Line 4 - Line 5c)
  const line6 = roundCurrency(line4 - line5c);

  // Line 7: Less Previous Certificates for Payment
  const line7 = calculateLessPreviousCertificates(previousPayApps);

  // Line 8: Current Payment Due (Line 6 - Line 7) - THE NUMBER
  const line8 = roundCurrency(line6 - line7);

  // Line 9: Balance to Finish Including Retainage (Line 3 - Line 4 + Line 5c)
  const line9 = roundCurrency(line3 - line4 + line5c);

  return {
    line1_original_contract_sum: line1,
    line2_net_change_orders: line2,
    line3_contract_sum_to_date: line3,
    line4_total_completed_and_stored: line4,
    line5a_retainage_on_completed: line5a,
    line5b_retainage_on_stored: line5b,
    line5c_total_retainage: line5c,
    line6_total_earned_less_retainage: line6,
    line7_less_previous_certificates: line7,
    line8_current_payment_due: line8,
    line9_balance_to_finish_plus_retainage: line9,
  };
}

// =============================================================================
// VALIDATION
// =============================================================================

/**
 * Validate pay application before PDF generation
 */
export function validatePayApplication(
  lineItems: PayAppLineItemInput[],
  g702Summary: G702Summary,
  g703Totals: G703Totals
): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];

  // Rule 1: SOV total must equal contract sum to date
  const sovTotal = g703Totals.total_scheduled_value;
  const contractSum = g702Summary.line3_contract_sum_to_date;
  
  if (Math.abs(sovTotal - contractSum) > 0.01) {
    errors.push({
      field: 'schedule_of_values',
      message: `Your Schedule of Values total (${formatCurrency(sovTotal)}) does not match the contract sum (${formatCurrency(contractSum)}). Add change orders to the SOV or adjust line items.`,
    });
  }

  // Rule 2: Check for overbilling on individual line items
  lineItems.forEach((item) => {
    const totalCompleted = calcTotalCompletedAndStored(
      item.work_completed_previous,
      item.work_completed_this_period,
      item.materials_stored
    );

    if (totalCompleted > item.scheduled_value + 0.01) {
      warnings.push({
        field: 'line_item',
        lineItem: item.item_number,
        message: `Line item ${item.item_number} billed (${formatCurrency(totalCompleted)}) exceeds scheduled value (${formatCurrency(item.scheduled_value)}).`,
        canOverride: true,
      });
    }
  });

  // Rule 3: Verify Line 4 matches G703 total (system check)
  if (Math.abs(g702Summary.line4_total_completed_and_stored - g703Totals.total_completed_and_stored) > 0.01) {
    errors.push({
      field: 'calculation_mismatch',
      message: 'Internal calculation error: G702 Line 4 does not match G703 total. Please contact support.',
    });
  }

  // Rule 4: Current payment due cannot be negative
  if (g702Summary.line8_current_payment_due < -0.01) {
    warnings.push({
      field: 'current_payment_due',
      message: `Current payment due is negative (${formatCurrency(g702Summary.line8_current_payment_due)}). This may indicate overbilling in a previous period. Please review.`,
      canOverride: true,
    });
  }

  // Rule 5: Check for negative values in user inputs
  lineItems.forEach((item) => {
    if (item.work_completed_this_period < 0) {
      errors.push({
        field: 'work_completed_this_period',
        lineItem: item.item_number,
        message: `Line item ${item.item_number} has a negative value for work completed this period.`,
      });
    }
    if (item.materials_stored < 0) {
      errors.push({
        field: 'materials_stored',
        lineItem: item.item_number,
        message: `Line item ${item.item_number} has a negative value for materials stored.`,
      });
    }
  });

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

// =============================================================================
// UTILITY CALCULATIONS
// =============================================================================

/**
 * Calculate the next billing date based on billing_day
 */
export function getNextBillingDate(billingDay: number): Date {
  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();
  
  // Try this month first
  let nextDate = new Date(currentYear, currentMonth, billingDay);
  
  // If we've passed the billing day this month, go to next month
  if (nextDate <= today) {
    nextDate = new Date(currentYear, currentMonth + 1, billingDay);
  }
  
  return nextDate;
}

/**
 * Calculate days until next billing date
 */
export function getDaysUntilBilling(billingDay: number): number {
  const today = new Date();
  const nextDate = getNextBillingDate(billingDay);
  const diffTime = nextDate.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Calculate project percent complete
 */
export function calculateProjectPercentComplete(
  totalCompleted: number,
  contractSum: number
): number {
  if (contractSum === 0) return 0;
  return roundPercentage(totalCompleted / contractSum);
}

/**
 * Get default period dates for a new pay application
 */
export function getDefaultPayAppPeriod(
  lastPayApp: PayApplication | null,
  contractDate: string,
  billingDay: number
): { periodFrom: string; periodTo: string } {
  const today = new Date();
  
  let periodFrom: Date;
  
  if (lastPayApp) {
    // Day after previous period_to
    periodFrom = new Date(lastPayApp.period_to);
    periodFrom.setDate(periodFrom.getDate() + 1);
  } else {
    // Contract date if first pay app
    periodFrom = new Date(contractDate);
  }
  
  // Period to is the billing day of current month (or next if we've passed it)
  let periodTo = new Date(today.getFullYear(), today.getMonth(), billingDay);
  if (periodTo < periodFrom) {
    periodTo = new Date(today.getFullYear(), today.getMonth() + 1, billingDay);
  }
  
  return {
    periodFrom: periodFrom.toISOString().split('T')[0],
    periodTo: periodTo.toISOString().split('T')[0],
  };
}

/**
 * Calculate remaining balance for a line item (for "Bill Remaining" functionality)
 */
export function calculateRemainingBalance(
  scheduledValue: number,
  workCompletedPrevious: number,
  materialsStored: number
): number {
  return roundCurrency(scheduledValue - workCompletedPrevious - materialsStored);
}
