import { useState, useEffect } from 'react';

interface WeatherData {
  main: {
    temp: number;
    humidity: number;
    pressure: number;
  };
  weather: Array<{
    main: string;
    description: string;
    icon: string;
  }>;
  name: string;
}

interface UseWeatherReturn {
  data: WeatherData | null;
  loading: boolean;
  error: string | null;
}

// Cache cho weather data
const weatherCache = new Map();
const CACHE_DURATION = 10 * 60 * 1000; // 10 phút

export const useWeather = (lat: number | undefined, lon: number | undefined): UseWeatherReturn => {
  const [data, setData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!lat || !lon) {
      setData(null);
      setError(null);
      return;
    }

    const fetchWeather = async () => {
      const cacheKey = `${lat}_${lon}`;
      const cached = weatherCache.get(cacheKey);
      
      // Kiểm tra cache trước
      if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        setData(cached.data);
        setLoading(false);
        setError(null);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/weather?lat=${lat}&lon=${lon}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch weather data');
        }

        const weatherData = await response.json();
        
        if (weatherData.success) {
          // Cache kết quả
          weatherCache.set(cacheKey, {
            data: weatherData.data,
            timestamp: Date.now()
          });
          
          setData(weatherData.data);
        } else {
          throw new Error(weatherData.error || 'Failed to fetch weather data');
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
        setError(errorMessage);
        setData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchWeather();
  }, [lat, lon]);

  return { data, loading, error };
}; 