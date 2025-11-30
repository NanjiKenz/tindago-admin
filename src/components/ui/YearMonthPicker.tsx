/**
 * YearMonthPicker Component
 * 
 * A hierarchical date picker that allows users to:
 * 1. Select a year from a dropdown
 * 2. Select a month within that year from a second dropdown
 */

'use client';

import React, { useState, useEffect } from 'react';

interface YearMonthPickerProps {
  value: string; // Format: "Month Year" (e.g., "November 2025")
  onChange: (value: string) => void;
  yearsBack?: number; // How many years back to show (default: 3)
}

export const YearMonthPicker: React.FC<YearMonthPickerProps> = ({
  value,
  onChange,
  yearsBack = 3
}) => {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Parse current value to get year and month
  const parseValue = (val: string) => {
    const parts = val.split(' ');
    return {
      month: parts[0] || months[new Date().getMonth()],
      year: parseInt(parts[1]) || new Date().getFullYear()
    };
  };

  const { month: initialMonth, year: initialYear } = parseValue(value);
  const [selectedYear, setSelectedYear] = useState<number>(initialYear);
  const [selectedMonth, setSelectedMonth] = useState<string>(initialMonth);

  // Update local state when value prop changes
  useEffect(() => {
    const { month, year } = parseValue(value);
    setSelectedYear(year);
    setSelectedMonth(month);
  }, [value]);

  // Generate array of years
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth();
  const years = Array.from({ length: yearsBack }, (_, i) => currentYear - i);

  // Get available months for selected year
  const getAvailableMonths = (year: number) => {
    if (year === currentYear) {
      // For current year, only show months up to current month
      return months.slice(0, currentMonth + 1);
    }
    // For past years, show all months
    return months;
  };

  const availableMonths = getAvailableMonths(selectedYear);

  // Handle year change
  const handleYearChange = (year: number) => {
    setSelectedYear(year);
    
    // Check if current selected month is available in the new year
    const newAvailableMonths = getAvailableMonths(year);
    let newMonth = selectedMonth;
    
    if (!newAvailableMonths.includes(selectedMonth)) {
      // If current month is not available, select the latest available month
      newMonth = newAvailableMonths[newAvailableMonths.length - 1];
      setSelectedMonth(newMonth);
    }
    
    onChange(`${newMonth} ${year}`);
  };

  // Handle month change
  const handleMonthChange = (month: string) => {
    setSelectedMonth(month);
    onChange(`${month} ${selectedYear}`);
  };

  const dropdownStyle = {
    padding: '12px 16px',
    borderRadius: '12px',
    border: '1px solid rgba(0, 0, 0, 0.1)',
    backgroundColor: '#FFFFFF',
    fontFamily: 'Clash Grotesk Variable',
    fontSize: '14px',
    fontWeight: 500,
    color: '#1E1E1E',
    outline: 'none',
    cursor: 'pointer'
  };

  return (
    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
      {/* Year Selector */}
      <div style={{ position: 'relative' }}>
        <select
          value={selectedYear}
          onChange={(e) => handleYearChange(parseInt(e.target.value))}
          className="appearance-none focus:outline-none"
          style={{
            ...dropdownStyle,
            minWidth: '120px',
            paddingRight: '36px'
          }}
        >
          {years.map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>
        <div
          style={{
            position: 'absolute',
            right: '12px',
            top: '50%',
            transform: 'translateY(-50%)',
            pointerEvents: 'none'
          }}
        >
          <svg width="10" height="6" viewBox="0 0 10 6" fill="none">
            <path d="M1 1L5 5L9 1" stroke="#1E1E1E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      </div>

      {/* Month Selector */}
      <div style={{ position: 'relative' }}>
        <select
          value={selectedMonth}
          onChange={(e) => handleMonthChange(e.target.value)}
          className="appearance-none focus:outline-none"
          style={{
            ...dropdownStyle,
            minWidth: '140px',
            paddingRight: '36px'
          }}
        >
          {availableMonths.map((month) => (
            <option key={month} value={month}>
              {month}
            </option>
          ))}
        </select>
        <div
          style={{
            position: 'absolute',
            right: '12px',
            top: '50%',
            transform: 'translateY(-50%)',
            pointerEvents: 'none'
          }}
        >
          <svg width="10" height="6" viewBox="0 0 10 6" fill="none">
            <path d="M1 1L5 5L9 1" stroke="#1E1E1E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      </div>
    </div>
  );
};
