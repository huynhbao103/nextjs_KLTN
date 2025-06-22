'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Calendar, ChevronLeft, ChevronRight, X, ChevronUp, ChevronDown } from 'lucide-react';
import { Button } from './button';
import { Input } from './input';
import { motion, AnimatePresence } from 'framer-motion';

interface DatePickerProps {
  value: string;
  onChange: (date: string) => void;
  placeholder?: string;
  className?: string;
  error?: boolean;
}

const months = [
  'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
  'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'
];

const daysOfWeek = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

export function DatePicker({ value, onChange, placeholder = "Chọn ngày sinh", className = "", error = false }: DatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(value ? new Date(value) : null);
  const [showYearPicker, setShowYearPicker] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);

  console.log('DatePicker props:', { value, onChange, placeholder, className, error }); // Debug log

  // Close picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setShowYearPicker(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  // Initialize current date to selected date if available
  useEffect(() => {
    console.log('DatePicker useEffect - value:', value); // Debug log
    if (value) {
      try {
        // If it's already in YYYY-MM-DD format, parse it as local date
        if (typeof value === 'string' && value.match(/^\d{4}-\d{2}-\d{2}$/)) {
          const [year, month, day] = value.split('-').map(Number);
          const date = new Date(year, month - 1, day); // month is 0-indexed
          console.log('DatePicker parsed local date:', date); // Debug log
          if (!isNaN(date.getTime())) {
            setCurrentDate(date);
            setSelectedDate(date);
          }
        } else {
          // Fallback to regular parsing
          const date = new Date(value);
          console.log('DatePicker parsed date:', date); // Debug log
          if (!isNaN(date.getTime())) {
            setCurrentDate(date);
            setSelectedDate(date);
          }
        }
      } catch (error) {
        console.error('DatePicker error parsing date:', error); // Debug log
      }
    }
  }, [value]);

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();

    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDay; i++) {
      days.push(null);
    }

    // Add days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }

    return days;
  };

  const handleDateSelect = (date: Date) => {
    console.log('DatePicker handleDateSelect:', date); // Debug log
    setSelectedDate(date);
    
    // Create date string in YYYY-MM-DD format using local date
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const dateString = `${year}-${month}-${day}`;
    
    console.log('DatePicker dateString:', dateString); // Debug log
    
    // Prevent any default behavior that might cause refresh
    setTimeout(() => {
      onChange(dateString);
    }, 0);
    
    setIsOpen(false);
    setShowYearPicker(false);
  };

  const handlePreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const handlePreviousYear = () => {
    setCurrentDate(new Date(currentDate.getFullYear() - 1, currentDate.getMonth(), 1));
  };

  const handleNextYear = () => {
    setCurrentDate(new Date(currentDate.getFullYear() + 1, currentDate.getMonth(), 1));
  };

  const handleYearSelect = (year: number) => {
    setCurrentDate(new Date(year, currentDate.getMonth(), 1));
    setShowYearPicker(false);
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isSelected = (date: Date) => {
    return selectedDate && date.toDateString() === selectedDate.toDateString();
  };

  const isDisabled = (date: Date) => {
    const today = new Date();
    const minDate = new Date(today.getFullYear() - 100, today.getMonth(), today.getDate());
    const maxDate = new Date(today.getFullYear() - 13, today.getMonth(), today.getDate());
    return date < minDate || date > maxDate;
  };

  const formatDisplayDate = (dateString: string) => {
    console.log('DatePicker formatDisplayDate input:', dateString); // Debug log
    if (!dateString) return '';
    try {
      // If it's in YYYY-MM-DD format, parse as local date
      if (typeof dateString === 'string' && dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
        const [year, month, day] = dateString.split('-').map(Number);
        const date = new Date(year, month - 1, day); // month is 0-indexed
        if (isNaN(date.getTime())) {
          console.log('DatePicker formatDisplayDate - invalid date'); // Debug log
          return '';
        }
        const formatted = date.toLocaleDateString('vi-VN', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        });
        console.log('DatePicker formatDisplayDate output:', formatted); // Debug log
        return formatted;
      } else {
        // Fallback to regular parsing
        const date = new Date(dateString);
        if (isNaN(date.getTime())) {
          console.log('DatePicker formatDisplayDate - invalid date'); // Debug log
          return '';
        }
        const formatted = date.toLocaleDateString('vi-VN', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        });
        console.log('DatePicker formatDisplayDate output:', formatted); // Debug log
        return formatted;
      }
    } catch (error) {
      console.error('DatePicker formatDisplayDate error:', error); // Debug log
      return '';
    }
  };

  const generateYearRange = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let year = currentYear - 13; year >= currentYear - 100; year--) {
      years.push(year);
    }
    return years;
  };

  const days = getDaysInMonth(currentDate);
  const years = generateYearRange();

  return (
    <div className="relative" ref={pickerRef}>
      <div className="relative">
        <Input
          value={formatDisplayDate(value)}
          placeholder={placeholder}
          readOnly
          onClick={() => setIsOpen(!isOpen)}
          className={`cursor-pointer pr-10 placeholder:text-gray-500 dark:placeholder:text-gray-400 ${error ? 'border-red-500' : ''} ${className}`}
        />
        <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full left-0 mt-1 z-50 bg-white dark:bg-gray-900 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 p-4 min-w-[320px]"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handlePreviousMonth();
                }}
                className="h-8 w-8 p-0 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setShowYearPicker(!showYearPicker);
                  }}
                  className="text-sm font-semibold text-gray-900 dark:text-white hover:bg-orange-50 dark:hover:bg-orange-900/20 px-3 py-1 rounded-md transition-colors"
                >
                  {months[currentDate.getMonth()]}
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setShowYearPicker(!showYearPicker);
                  }}
                  className="text-sm font-semibold text-gray-900 dark:text-white hover:bg-orange-50 dark:hover:bg-orange-900/20 px-3 py-1 rounded-md transition-colors flex items-center gap-1"
                >
                  {currentDate.getFullYear()}
                  {showYearPicker ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                </button>
              </div>
              
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleNextMonth();
                }}
                className="h-8 w-8 p-0 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            {/* Year Picker */}
            <AnimatePresence>
              {showYearPicker && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="mb-4 border-t border-gray-200 dark:border-gray-700 pt-4"
                >
                  <div className="flex items-center justify-between mb-3">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handlePreviousYear();
                      }}
                      className="h-6 w-6 p-0 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300"
                    >
                      <ChevronLeft className="h-3 w-3" />
                    </Button>
                    <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                      Chọn năm
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleNextYear();
                      }}
                      className="h-6 w-6 p-0 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300"
                    >
                      <ChevronRight className="h-3 w-3" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-4 gap-2 max-h-32 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent">
                    {years.map((year) => (
                      <button
                        key={year}
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleYearSelect(year);
                        }}
                        className={`
                          px-3 py-2 text-xs font-medium rounded-md transition-all duration-200
                          ${currentDate.getFullYear() === year 
                            ? 'bg-orange-500 text-white shadow-md' 
                            : 'text-gray-700 dark:text-gray-300 hover:bg-orange-50 dark:hover:bg-orange-900/20 hover:text-orange-700 dark:hover:text-orange-300'
                          }
                        `}
                      >
                        {year}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Days of week */}
            <div className="grid grid-cols-7 gap-1 mb-3">
              {daysOfWeek.map((day) => (
                <div
                  key={day}
                  className="h-8 flex items-center justify-center text-xs font-semibold text-gray-500 dark:text-gray-400"
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar grid */}
            <div className="grid grid-cols-7 gap-1">
              {days.map((date, index) => (
                <div key={index} className="h-8">
                  {date ? (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        if (!isDisabled(date)) {
                          handleDateSelect(date);
                        }
                      }}
                      disabled={isDisabled(date)}
                      className={`
                        w-full h-full rounded-md text-sm font-medium transition-all duration-200
                        ${isSelected(date) 
                          ? 'bg-orange-500 text-white shadow-md' 
                          : isToday(date)
                          ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300 border border-orange-200 dark:border-orange-700'
                          : 'text-gray-700 dark:text-gray-300 hover:bg-orange-50 dark:hover:bg-orange-900/20 hover:text-orange-700 dark:hover:text-orange-300'
                        }
                        ${isDisabled(date) 
                          ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed' 
                          : 'cursor-pointer'
                        }
                      `}
                    >
                      {date.getDate()}
                    </button>
                  ) : (
                    <div className="h-8" />
                  )}
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="flex justify-between items-center mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
              <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                Tuổi từ 13-100
              </span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsOpen(false);
                  setShowYearPicker(false);
                }}
                className="h-6 w-6 p-0 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
} 