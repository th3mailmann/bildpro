'use client';

import React, { forwardRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { formatCurrency, parseCurrencyInput } from '@/lib/calculations';

interface CurrencyInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'> {
  label?: string;
  error?: string;
  value: number;
  onChange: (value: number) => void;
}

const CurrencyInput = forwardRef<HTMLInputElement, CurrencyInputProps>(
  ({ className, label, error, value, onChange, id, onBlur, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');
    const [displayValue, setDisplayValue] = useState(
      value === 0 ? '' : formatCurrency(value).replace('$', '')
    );
    const [isFocused, setIsFocused] = useState(false);

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(true);
      // Show raw number on focus for easier editing
      setDisplayValue(value === 0 ? '' : value.toString());
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(false);
      const parsed = parseCurrencyInput(displayValue);
      onChange(parsed);
      setDisplayValue(parsed === 0 ? '' : formatCurrency(parsed).replace('$', ''));
      onBlur?.(e);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const rawValue = e.target.value;
      // Allow only numbers, decimal point, and minus
      const cleaned = rawValue.replace(/[^0-9.-]/g, '');
      setDisplayValue(cleaned);
    };

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            {label}
          </label>
        )}
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
            $
          </span>
          <input
            ref={ref}
            id={inputId}
            type="text"
            inputMode="decimal"
            className={cn(
              'w-full pl-7 pr-3 py-2 border border-gray-300 rounded-lg shadow-sm',
              'text-right font-mono',
              'placeholder:text-gray-400',
              'focus:outline-none focus:ring-2 focus:ring-navy-500 focus:border-transparent',
              'disabled:bg-gray-100 disabled:cursor-not-allowed',
              error && 'border-red-500 focus:ring-red-500',
              className
            )}
            value={displayValue}
            onChange={handleChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            placeholder="0.00"
            {...props}
          />
        </div>
        {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
      </div>
    );
  }
);

CurrencyInput.displayName = 'CurrencyInput';

export { CurrencyInput };
