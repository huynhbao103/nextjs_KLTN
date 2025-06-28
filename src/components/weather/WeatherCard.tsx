'use client';

import React from 'react';
import { WeatherData, SessionWeatherData } from '@/types/weather';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw, MapPin, Thermometer, Cloud } from 'lucide-react';

interface WeatherCardProps {
  weatherData?: WeatherData | SessionWeatherData;
  onRefresh?: () => void;
  loading?: boolean;
  isSessionData?: boolean; // Flag để phân biệt loại data
}

export function WeatherCard({ 
  weatherData, 
  onRefresh, 
  loading = false,
  isSessionData = false 
}: WeatherCardProps) {
  if (!weatherData) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="p-6 text-center">
          <p className="text-gray-500">Không có dữ liệu thời tiết</p>
        </CardContent>
      </Card>
    );
  }

  // Kiểm tra xem có phải session data không (chỉ có current, không có location)
  const isSessionDataFormat = !('location' in weatherData) || !weatherData.location;
  const current = weatherData.current;

  // Nếu là session data, chỉ hiển thị thời tiết hiện tại
  if (isSessionDataFormat) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-semibold flex items-center gap-2">
              <Cloud className="h-5 w-5 text-blue-500" />
              Thời tiết hiện tại
            </CardTitle>
            {onRefresh && (
              <Button
                variant="outline"
                size="sm"
                onClick={onRefresh}
                disabled={loading}
                className="ml-auto"
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              </Button>
            )}
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Nhiệt độ chính */}
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Thermometer className="h-6 w-6 text-red-500" />
              <span className="text-3xl font-bold">
                {Math.round(current.temp_c)}°C
              </span>
            </div>
            <p className="text-sm text-gray-600">
              Cảm giác như {Math.round(current.feelslike_c)}°C
            </p>
          </div>

          {/* Điều kiện thời tiết */}
          <div className="flex items-center justify-center gap-3">
            {current.condition.icon && (
              <img
                src={current.condition.icon}
                alt={current.condition.text}
                className="w-12 h-12"
              />
            )}
            <div className="text-center">
              <p className="font-medium">{current.condition.text}</p>
              <p className="text-sm text-gray-600">
                Cập nhật: {new Date(current.last_updated).toLocaleTimeString('vi-VN')}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Nếu là WeatherData đầy đủ, hiển thị như cũ
  const location = weatherData.location;

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-semibold flex items-center gap-2">
            <MapPin className="h-5 w-5 text-blue-500" />
            {location.name}
          </CardTitle>
          {onRefresh && (
            <Button
              variant="outline"
              size="sm"
              onClick={onRefresh}
              disabled={loading}
              className="ml-auto"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          )}
        </div>
        {location.country && (
          <p className="text-sm text-gray-600">
            {location.region && `${location.region}, `}{location.country}
          </p>
        )}
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Nhiệt độ chính */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Thermometer className="h-6 w-6 text-red-500" />
            <span className="text-3xl font-bold">
              {Math.round(current.temp_c)}°C
            </span>
          </div>
          <p className="text-sm text-gray-600">
            Cảm giác như {Math.round(current.feelslike_c)}°C
          </p>
        </div>

        {/* Điều kiện thời tiết */}
        <div className="flex items-center justify-center gap-3">
          {current.condition.icon && (
            <img
              src={current.condition.icon}
              alt={current.condition.text}
              className="w-12 h-12"
            />
          )}
          <div className="text-center">
            <p className="font-medium">{current.condition.text}</p>
            <p className="text-sm text-gray-600">
              Cập nhật: {new Date(current.last_updated).toLocaleTimeString('vi-VN')}
            </p>
          </div>
        </div>

        {/* Thông tin bổ sung (chỉ hiển thị nếu không phải session data) */}
        {!isSessionData && 'humidity' in current && (
          <div className="grid grid-cols-2 gap-4 pt-4 border-t">
            <div className="text-center">
              <p className="text-sm text-gray-600">Độ ẩm</p>
              <p className="font-semibold">{current.humidity}%</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600">Gió</p>
              <p className="font-semibold">{current.wind_kph} km/h</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 