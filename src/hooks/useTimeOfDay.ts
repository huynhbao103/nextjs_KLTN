import { useMemo } from 'react';

export type TimeOfDay = 'sáng' | 'trưa' | 'chiều' | 'tối';

export function useTimeOfDay(): TimeOfDay {
  return useMemo(() => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 11) return 'sáng';
    if (hour >= 11 && hour < 14) return 'trưa';
    if (hour >= 14 && hour < 18) return 'chiều';
    return 'tối';
  }, []);
} 