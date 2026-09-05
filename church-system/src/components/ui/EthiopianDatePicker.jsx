'use client';

import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon } from 'lucide-react';
import {
  ETHIOPIAN_MONTHS,
  gregorianToEthiopic,
  ethiopicToGregorian,
  getDaysInEthiopianMonth,
  getEthiopianToday,
} from '../../utils/ethiopianDate';

/**
 * EthiopianDatePicker component
 * Allows selecting Year, Month, and Day in Ethiopian Calendar (ዓ.ም.)
 * Outputs standard ISO date string (YYYY-MM-DD) or Ethiopian string via onChange
 */
export const EthiopianDatePicker = ({
  value,
  onChange,
  label = 'የትውልድ ቀን በኢትዮጵያ የቀን አቆጣጠር (Date of Birth - Ethiopian Calendar)',
  minYear = 1940,
  maxYear,
  required = false,
  error = '',
  disabled = false,
}) => {
  const currentEthYear = getEthiopianToday().year || 2018;
  const effectiveMaxYear = maxYear || currentEthYear;

  // Initialize internal Ethiopian state
  const [ethYear, setEthYear] = useState('');
  const [ethMonth, setEthMonth] = useState('');
  const [ethDay, setEthDay] = useState('');

  // Synchronize when value changes externally
  useEffect(() => {
    if (value) {
      const eth = gregorianToEthiopic(value);
      if (eth) {
        setEthYear(String(eth.year));
        setEthMonth(String(eth.month));
        setEthDay(String(eth.day));
      }
    } else {
      setEthYear('');
      setEthMonth('');
      setEthDay('');
    }
  }, [value]);

  const handleDateChange = (newYear, newMonth, newDay) => {
    if (newYear && newMonth && newDay) {
      const gDate = ethiopicToGregorian(newYear, newMonth, newDay);
      if (gDate && !isNaN(gDate.getTime())) {
        const iso = gDate.toISOString().split('T')[0];
        if (onChange) onChange(iso);
      }
    } else if (!newYear && !newMonth && !newDay) {
      if (onChange) onChange('');
    }
  };

  const handleYearChange = (e) => {
    const val = e.target.value;
    setEthYear(val);
    handleDateChange(val, ethMonth, ethDay);
  };

  const handleMonthChange = (e) => {
    const val = e.target.value;
    setEthMonth(val);
    // adjust day if pagume was selected and day > 5/6
    let adjustedDay = ethDay;
    if (ethYear && val) {
      const maxDays = getDaysInEthiopianMonth(ethYear, val);
      if (parseInt(ethDay, 10) > maxDays) {
        adjustedDay = String(maxDays);
        setEthDay(adjustedDay);
      }
    }
    handleDateChange(ethYear, val, adjustedDay);
  };

  const handleDayChange = (e) => {
    const val = e.target.value;
    setEthDay(val);
    handleDateChange(ethYear, ethMonth, val);
  };

  // Generate Year options (descending from current year)
  const years = [];
  for (let y = effectiveMaxYear; y >= minYear; y--) {
    years.push(y);
  }

  // Generate Day options based on selected Month and Year
  const maxDays = ethYear && ethMonth ? getDaysInEthiopianMonth(ethYear, ethMonth) : 30;
  const days = [];
  for (let d = 1; d <= maxDays; d++) {
    days.push(d);
  }

  const selectClass =
    'w-full px-3 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1657b8]/20 focus:border-[#1657b8] transition-all text-slate-800 text-sm font-medium';

  return (
    <div className="space-y-1.5">
      {label && (
        <label className="flex items-center gap-1.5 text-sm font-semibold text-slate-700">
          <CalendarIcon className="w-4 h-4 text-[#1657b8]" />
          <span>{label}</span>
          {required && <span className="text-rose-500">*</span>}
        </label>
      )}

      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        {/* Day Select */}
        <div>
          <select
            value={ethDay}
            onChange={handleDayChange}
            disabled={disabled}
            className={`${selectClass} ${error ? 'border-rose-400' : ''}`}
          >
            <option value="">ቀን (Day)</option>
            {days.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>

        {/* Month Select */}
        <div>
          <select
            value={ethMonth}
            onChange={handleMonthChange}
            disabled={disabled}
            className={`${selectClass} ${error ? 'border-rose-400' : ''}`}
          >
            <option value="">ወር (Month)</option>
            {ETHIOPIAN_MONTHS.map((m) => (
              <option key={m.index} value={m.index}>
                {m.name} ({m.en})
              </option>
            ))}
          </select>
        </div>

        {/* Year Select */}
        <div>
          <select
            value={ethYear}
            onChange={handleYearChange}
            disabled={disabled}
            className={`${selectClass} ${error ? 'border-rose-400' : ''}`}
          >
            <option value="">ዓመት (Year)</option>
            {years.map((y) => (
              <option key={y} value={y}>
                {y} ዓ.ም.
              </option>
            ))}
          </select>
        </div>
      </div>

      {ethYear && ethMonth && ethDay && (
        <p className="text-xs text-[#1657b8] font-medium pl-1">
          ✓ የተመረጠው ቀን፡{' '}
          <span className="font-bold">
            {ETHIOPIAN_MONTHS.find((m) => m.index === parseInt(ethMonth, 10))?.name} {ethDay} ቀን {ethYear} ዓ.ም.
          </span>
        </p>
      )}

      {error && <p className="text-[11px] text-rose-500 font-medium pl-1">{error}</p>}
    </div>
  );
};

export default EthiopianDatePicker;
