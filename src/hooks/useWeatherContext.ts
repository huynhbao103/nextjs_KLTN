import { useMemo } from 'react';

export type WeatherContext = {
  name: string;
} | undefined;

export function useWeatherContext(temp: number | undefined): WeatherContext {
  return useMemo(() => {
    if (typeof temp !== 'number') return undefined;
    if (temp < 22) return { name: 'Lạnh' };
    if (temp <= 30) return { name: 'Bình thường' };
    return { name: 'Nóng' };
  }, [temp]);
} 