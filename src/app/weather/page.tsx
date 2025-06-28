'use client';

import React from 'react';
import { useSessionStorage } from '@/utils/sessionStorage';

export default function WeatherPage() {
  const { getWeather } = useSessionStorage();
  const sessionWeather = getWeather();

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