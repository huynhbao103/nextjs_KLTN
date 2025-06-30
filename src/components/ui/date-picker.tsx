'use client';

import React, { useState, useEffect } from 'react';
import { Calendar, ChevronDown } from 'lucide-react';
import { format, parseISO, isValid } from 'date-fns';
import { vi } from 'date-fns/locale';

interface DatePickerProps {
  value?: string;
  onChange?: (date: string) => void;
  placeholder?: string;
  className?: string;
  error?: string;
}

export default function DatePicker({ 
  value, 
  onChange, 
  placeholder = "Chọn ngày sinh", 
  className = "",
  error 
}: DatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [displayValue, setDisplayValue] = useState('');
  const [showYearPicker, setShowYearPicker] = useState(false);

  // Parse initial value
  useEffect(() => {
    if (value) {
      let date: Date | null = null;
      
      // Try parsing as ISO string first
      if (value.includes('T') || value.includes('Z')) {
        date = parseISO(value);
      } else {
        // Try parsing as local date string
        date = new Date(value);
      }
      
      if (isValid(date)) {
        setSelectedDate(date);
        setDisplayValue(format(date, 'dd/MM/yyyy', { locale: vi }));
      }
    }
  }, [value]);

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    const dateString = format(date, 'yyyy-MM-dd');
    setDisplayValue(format(date, 'dd/MM/yyyy', { locale: vi }));
    setIsOpen(false);
    setShowYearPicker(false);
    onChange?.(dateString);
  };

  const formatDisplayDate = (dateString: string): string => {
    try {
      let date: Date;
      
      // Try parsing as ISO string first
      if (dateString.includes('T') || dateString.includes('Z')) {
        date = parseISO(dateString);
      } else {
        // Try parsing as local date string
        date = new Date(dateString);
      }
      
      if (isValid(date)) {
        return format(date, 'dd/MM/yyyy', { locale: vi });
      }
    } catch (error) {
      // Return original string if parsing fails
    }
    
    return dateString;
  };

  const generateCalendarDays = () => {
    if (!selectedDate) return [];
    
    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    const days = [];
    const currentDate = new Date(startDate);
    
    while (currentDate <= lastDay || currentDate.getDay() !== 0) {
      days.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return days;
  };

  const getMonthName = (date: Date) => {
    return format(date, 'MMMM yyyy', { locale: vi });
  };

  const goToPreviousMonth = () => {
    if (selectedDate) {
      const newDate = new Date(selectedDate);
      newDate.setMonth(newDate.getMonth() - 1);
      setSelectedDate(newDate);
    }
  };

  const goToNextMonth = () => {
    if (selectedDate) {
      const newDate = new Date(selectedDate);
      newDate.setMonth(newDate.getMonth() + 1);
      setSelectedDate(newDate);
    }
  };

  const selectYear = (year: number) => {
    if (selectedDate) {
      const newDate = new Date(selectedDate);
      newDate.setFullYear(year);
      setSelectedDate(newDate);
    } else {
      setSelectedDate(new Date(year, new Date().getMonth(), 1));
    }
    setShowYearPicker(false);
  };

  const generateYearList = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let year = currentYear; year >= 1950; year--) {
      years.push(year);
    }
    return years;
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isSelected = (date: Date) => {
    return selectedDate && date.toDateString() === selectedDate.toDateString();
  };

  const isCurrentMonth = (date: Date) => {
    return selectedDate && date.getMonth() === selectedDate.getMonth();
  };

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <input
          type="text"
          value={displayValue}
          placeholder={placeholder}
          readOnly
          onClick={() => setIsOpen(!isOpen)}
          className={`w-full px-4 py-3 pr-12 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
            error 
              ? 'border-red-500 bg-red-50' 
              : 'border-gray-300 bg-white hover:border-gray-400'
          }`}
        />
        <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
      </div>

      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
      
      {isOpen && (
        <div className="absolute z-50 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg p-4 min-w-[280px]">
          {showYearPicker ? (
            // Year Picker
            <div>
              <div className="flex items-center justify-between mb-4">
                <button
                  onClick={() => setShowYearPicker(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <h3 className="text-lg font-semibold text-gray-900">Chọn năm</h3>
                <div className="w-10"></div>
              </div>
              <div className="grid grid-cols-3 gap-2 max-h-60 overflow-y-auto">
                {generateYearList().map((year) => (
                  <button
                    key={year}
                    onClick={() => selectYear(year)}
                    className={`p-2 text-sm rounded-lg transition-colors ${
                      selectedDate && selectedDate.getFullYear() === year
                        ? 'bg-blue-600 text-white font-semibold'
                        : 'hover:bg-gray-100 text-gray-900'
                    }`}
                  >
                    {year}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            // Calendar View
            <>
              {/* Calendar Header */}
              <div className="flex items-center justify-between mb-4">
                <button
                  onClick={goToPreviousMonth}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                
                <button
                  onClick={() => setShowYearPicker(true)}
                  className="flex items-center gap-1 px-3 py-1 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <h3 className="text-lg font-semibold text-gray-900 capitalize">
                    {selectedDate ? getMonthName(selectedDate) : 'Chọn tháng'}
                  </h3>
                  <ChevronDown className="w-4 h-4 text-gray-500" />
                </button>
                
                <button
                  onClick={goToNextMonth}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
              
              {/* Day Headers */}
              <div className="grid grid-cols-7 gap-1 mb-2">
                {['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'].map((day) => (
                  <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar Days */}
              <div className="grid grid-cols-7 gap-1">
                {generateCalendarDays().map((date, index) => (
                  <button
                    key={index}
                    onClick={() => handleDateSelect(date)}
                    className={`p-2 text-sm rounded-lg transition-colors ${
                      isToday(date)
                        ? 'bg-blue-100 text-blue-600 font-semibold'
                        : isSelected(date)
                        ? 'bg-blue-600 text-white font-semibold'
                        : isCurrentMonth(date)
                        ? 'hover:bg-gray-100 text-gray-900'
                        : 'text-gray-400'
                    }`}
                  >
                    {date.getDate()}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
} 