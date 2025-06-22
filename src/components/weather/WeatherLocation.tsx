'use client';

import React, { useEffect, useState } from 'react';
import { useGeolocation } from '@/hooks/useGeolocation';
import { useWeather, useWeatherByAddress } from '@/hooks/useWeather';
import { WeatherCard } from './WeatherCard';
import { LocationDisplay } from './LocationDisplay';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Cloud, MapPin, Search } from 'lucide-react';

export function WeatherLocation() {
  const [activeTab, setActiveTab] = useState<'current' | 'search'>('current');
  const [isClient, setIsClient] = useState(false);
  
  // Geolocation hook
  const {
    position,
    address,
    loading: locationLoading,
    error: locationError,
    getCurrentPosition,
    isSupported
  } = useGeolocation();

  // Weather hook for current location
  const {
    data: currentWeather,
    loading: weatherLoading,
    error: weatherError,
    refresh: refreshWeather
  } = useWeather(
    position?.coords.latitude,
    position?.coords.longitude
  );

  // Weather hook for address search
  const {
    data: searchWeather,
    loading: searchLoading,
    error: searchError,
    searchWeatherByAddress,
    clear: clearSearch
  } = useWeatherByAddress();

  // Fix hydration issue
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Auto-refresh weather when location changes
  useEffect(() => {
    if (position && !currentWeather) {
      refreshWeather();
    }
  }, [position, currentWeather, refreshWeather]);

  const handleRefreshLocation = () => {
    getCurrentPosition();
  };

  const handleSearchAddress = (address: string) => {
    searchWeatherByAddress(address);
  };

  const handleClearSearch = () => {
    clearSearch();
    setActiveTab('current');
  };

  const currentWeatherData = searchWeather || currentWeather;
  const isLoading = locationLoading || weatherLoading || searchLoading;
  const hasError = locationError || weatherError || searchError;

  // Don't render until client-side
  if (!isClient) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2 flex items-center justify-center gap-2">
            <Cloud className="h-8 w-8 text-blue-500" />
            Thông tin thời tiết
          </h1>
          <p className="text-muted-foreground">
            Đang tải...
          </p>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2 flex items-center justify-center gap-2">
          <Cloud className="h-8 w-8 text-blue-500" />
          Thông tin thời tiết
        </h1>
        <p className="text-muted-foreground">
          Xem thời tiết hiện tại tại vị trí của bạn
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={(value: string) => setActiveTab(value as 'current' | 'search')} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto">
          <TabsTrigger value="current" className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            Vị trí hiện tại
          </TabsTrigger>
          <TabsTrigger value="search" className="flex items-center gap-2">
            <Search className="h-4 w-4" />
            Tìm kiếm
          </TabsTrigger>
        </TabsList>

        <TabsContent value="current" className="space-y-6">
          {/* Location Display */}
          <LocationDisplay
            address={address}
            loading={locationLoading}
            error={locationError}
            onRefresh={handleRefreshLocation}
          />

          {/* Weather Display */}
          {currentWeather && (
            <WeatherCard
              weatherData={currentWeather}
              onRefresh={refreshWeather}
              loading={weatherLoading}
            />
          )}

          {/* Loading State */}
          {isLoading && !currentWeather && (
            <Card className="w-full max-w-md mx-auto">
              <CardContent className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                  <p className="text-muted-foreground">Đang tải thông tin thời tiết...</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Error State */}
          {hasError && !currentWeather && (
            <Card className="w-full max-w-md mx-auto">
              <CardContent className="py-8">
                <div className="text-center">
                  <div className="text-red-500 mb-4">
                    <svg className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Không thể tải thông tin</h3>
                  <p className="text-muted-foreground mb-4">
                    {hasError}
                  </p>
                  <div className="space-x-2">
                    <Button onClick={handleRefreshLocation} variant="outline">
                      Thử lại
                    </Button>
                    <Button onClick={() => setActiveTab('search')}>
                      Tìm kiếm địa chỉ khác
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Not Supported State */}
          {!isSupported && (
            <Card className="w-full max-w-md mx-auto">
              <CardContent className="py-8">
                <div className="text-center">
                  <div className="text-yellow-500 mb-4">
                    <svg className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Trình duyệt không hỗ trợ</h3>
                  <p className="text-muted-foreground mb-4">
                    Trình duyệt của bạn không hỗ trợ định vị địa lý. Vui lòng sử dụng tìm kiếm thủ công.
                  </p>
                  <Button onClick={() => setActiveTab('search')}>
                    Tìm kiếm địa chỉ
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="search" className="space-y-6">
          {/* Search Location Display */}
          <LocationDisplay
            address={searchWeather?.location.name || null}
            loading={searchLoading}
            error={searchError}
            onRefresh={() => {}} // No refresh for search
            onSearchAddress={handleSearchAddress}
            showSearch={true}
          />

          {/* Search Weather Display */}
          {searchWeather && (
            <div className="space-y-4">
              <WeatherCard
                weatherData={searchWeather}
                loading={searchLoading}
              />
              <div className="text-center">
                <Button onClick={handleClearSearch} variant="outline">
                  Xóa kết quả tìm kiếm
                </Button>
              </div>
            </div>
          )}

          {/* Search Instructions */}
          {!searchWeather && !searchLoading && (
            <Card className="w-full max-w-md mx-auto">
              <CardContent className="py-8">
                <div className="text-center">
                  <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Tìm kiếm thời tiết</h3>
                  <p className="text-muted-foreground">
                    Nhập tên thành phố, địa chỉ hoặc tọa độ để xem thời tiết
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
} 