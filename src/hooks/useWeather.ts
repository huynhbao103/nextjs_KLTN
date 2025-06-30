import { useState, useEffect } from 'react';

export const useWeather = (lat?: number, lon?: number) => {
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!lat || !lon) {
      setData(null);
      setError(null);
      return;
    }

    const fetchWeather = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/weather?lat=${lat}&lon=${lon}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch weather data');
        }

        const weatherData = await response.json();
        setData(weatherData);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchWeather();
  }, [lat, lon]);

  return { data, loading, error };
}; 