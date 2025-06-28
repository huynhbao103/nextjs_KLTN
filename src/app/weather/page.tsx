'use client';

import React, { useEffect, useState } from 'react';
import { useSessionStorage } from '@/utils/sessionStorage';
import { SessionWeatherData } from '@/types/weather';

// Force dynamic rendering to prevent prerendering issues
export const dynamic = 'force-dynamic';

export default function WeatherPage() {
  const [isClient, setIsClient] = useState(false);
  const { getWeather } = useSessionStorage();
  const [sessionWeather, setSessionWeather] = useState<SessionWeatherData | null>(null);

  // Fix hydration issue
  useEffect(() => {
    setIsClient(true);
    const weather = getWeather();
    setSessionWeather(weather);
  }, [getWeather]);

  // Don't render until client-side
  if (!isClient) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-center mb-8">Weather Information</h1>
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-8">Weather Information</h1>
      
      {sessionWeather && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4 text-center">Session Weather Data</h2>
          <div className="text-center">
            <p>Temperature: {Math.round(sessionWeather.current.temp_c)}°C</p>
            <p>Feels like: {Math.round(sessionWeather.current.feelslike_c)}°C</p>
            <p>Location: {sessionWeather.current.location.name}</p>
            <p>Condition: {sessionWeather.current.condition.text}</p>
          </div>
        </div>
      )}
      
      <p className="text-center text-gray-600">
        Weather page is working correctly.
      </p>
    </div>
  );
} 