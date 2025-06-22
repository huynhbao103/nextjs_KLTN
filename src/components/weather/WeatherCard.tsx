'use client';

import React from 'react';
import { WeatherData } from '@/types/weather';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw, MapPin, Thermometer, Droplets, Wind, Eye } from 'lucide-react';

interface WeatherCardProps {
  weatherData: WeatherData;
  onRefresh?: () => void;
  loading?: boolean;
}

export function WeatherCard({ weatherData, onRefresh, loading = false }: WeatherCardProps) {
  const { location, current } = weatherData;

  const formatTime = (timeString: string) => {
    const date = new Date(timeString);
    return date.toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getWeatherIcon = (conditionCode: number, iconCode?: string) => {
    // Nếu có icon code từ OpenWeatherMap, sử dụng nó
    if (iconCode) {
      return `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
    }

    // Fallback cho condition codes
    const iconMap: { [key: number]: string } = {
      200: '⛈️', // Thunderstorm
      201: '⛈️',
      202: '⛈️',
      210: '⛈️',
      211: '⛈️',
      212: '⛈️',
      221: '⛈️',
      230: '⛈️',
      231: '⛈️',
      232: '⛈️',
      300: '🌧️', // Drizzle
      301: '🌧️',
      302: '🌧️',
      310: '🌧️',
      311: '🌧️',
      312: '🌧️',
      313: '🌧️',
      314: '🌧️',
      321: '🌧️',
      500: '🌧️', // Rain
      501: '🌧️',
      502: '🌧️',
      503: '🌧️',
      504: '🌧️',
      511: '🌨️',
      520: '🌧️',
      521: '🌧️',
      522: '🌧️',
      531: '🌧️',
      600: '🌨️', // Snow
      601: '🌨️',
      602: '🌨️',
      611: '🌨️',
      612: '🌨️',
      613: '🌨️',
      615: '🌨️',
      616: '🌨️',
      620: '🌨️',
      621: '🌨️',
      622: '🌨️',
      701: '🌫️', // Atmosphere
      711: '🌫️',
      721: '🌫️',
      731: '🌫️',
      741: '🌫️',
      751: '🌫️',
      761: '🌫️',
      762: '🌫️',
      771: '🌫️',
      781: '🌫️',
      800: '☀️', // Clear
      801: '⛅', // Few clouds
      802: '☁️', // Scattered clouds
      803: '☁️', // Broken clouds
      804: '☁️', // Overcast clouds
    };

    return iconMap[conditionCode] || '🌤️';
  };

  const isIconUrl = (icon: string) => {
    return icon.startsWith('http');
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <MapPin className="h-4 w-4 text-blue-500" />
            {location.name}
          </CardTitle>
          {onRefresh && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onRefresh}
              disabled={loading}
              className="h-8 w-8 p-0"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          )}
        </div>
        <p className="text-sm text-muted-foreground">
          {location.country} • Cập nhật lúc {formatTime(current.last_updated)}
        </p>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Current Temperature */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <span className="text-4xl font-bold">
              {Math.round(current.temp_c)}°C
            </span>
            {current.condition.icon ? (
              <img 
                src={current.condition.icon} 
                alt={current.condition.text}
                className="w-12 h-12"
                onLoad={() => console.log('Icon loaded successfully:', current.condition.icon)}
                onError={(e) => {
                  console.error('Icon failed to load:', current.condition.icon);
                  // Fallback to emoji if image fails to load
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  const fallback = document.createElement('span');
                  fallback.className = 'text-2xl';
                  fallback.textContent = getWeatherIcon(current.condition.code);
                  target.parentNode?.insertBefore(fallback, target);
                }}
              />
            ) : (
              <span className="text-2xl">
                {getWeatherIcon(current.condition.code)}
              </span>
            )}
          </div>
          <p className="text-lg text-muted-foreground">
            {current.condition.text}
          </p>
          <p className="text-sm text-muted-foreground">
            Cảm giác như {Math.round(current.feelslike_c)}°C
          </p>
        </div>

        {/* Weather Details Grid */}
        <div className="grid grid-cols-2 gap-4 pt-4 border-t">
          <div className="flex items-center gap-2">
            <Thermometer className="h-4 w-4 text-red-500" />
            <div>
              <p className="text-sm font-medium">Nhiệt độ</p>
              <p className="text-xs text-muted-foreground">
                {Math.round(current.temp_c)}°C / {Math.round(current.temp_f)}°F
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Droplets className="h-4 w-4 text-blue-500" />
            <div>
              <p className="text-sm font-medium">Độ ẩm</p>
              <p className="text-xs text-muted-foreground">{current.humidity}%</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Wind className="h-4 w-4 text-gray-500" />
            <div>
              <p className="text-sm font-medium">Gió</p>
              <p className="text-xs text-muted-foreground">
                {Math.round(current.wind_kph)} km/h {current.wind_dir}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Eye className="h-4 w-4 text-purple-500" />
            <div>
              <p className="text-sm font-medium">Tầm nhìn</p>
              <p className="text-xs text-muted-foreground">
                {Math.round(current.visibility_km)} km
              </p>
            </div>
          </div>
        </div>

        {/* Additional Info */}
        <div className="pt-4 border-t">
          <div className="flex justify-between text-sm">
            <span>Áp suất: {current.pressure_mb} mb</span>
            <span>UV: {current.uv}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 