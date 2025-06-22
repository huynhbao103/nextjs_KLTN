import { useState, useEffect, useCallback } from 'react';
import { WeatherData, WeatherState, WeatherApiResponse } from '@/types/weather';
import { getCachedWeatherData, getCachedAddressFromCoords, getCoordsFromAddress } from '@/lib/weatherApi';

export function useWeather(lat?: number, lon?: number) {
  const [state, setState] = useState<WeatherState>({
    data: null,
    loading: false,
    error: null
  });

  // Lấy thông tin thời tiết
  const fetchWeather = useCallback(async (latitude: number, longitude: number) => {
    setState(prev => ({
      ...prev,
      loading: true,
      error: null
    }));

    try {
      // Lấy dữ liệu thời tiết từ BE API
      const weatherResponse: WeatherApiResponse = await getCachedWeatherData(latitude, longitude);
      
      console.log('Weather response received:', weatherResponse);
      
      // Validate response
      if (!weatherResponse || !weatherResponse.location || !weatherResponse.current) {
        console.error('Invalid weather response:', weatherResponse);
        throw new Error('Invalid weather data received from API');
      }
      
      // Lấy địa chỉ chi tiết từ reverse geocoding
      let address = weatherResponse.location.name;
      try {
        const addressData = await getCachedAddressFromCoords(latitude, longitude);
        console.log('Address data received:', addressData);
        // Ưu tiên địa chỉ chi tiết từ reverse geocoding
        if (addressData.display_name && addressData.display_name !== 'Unknown Location') {
          address = addressData.display_name;
        }
      } catch (addressError) {
        console.warn('Failed to get detailed address:', addressError);
        // Fallback về tên từ OpenWeatherMap nếu không lấy được địa chỉ chi tiết
        if (!address || address === 'Unknown Location') {
          address = `Location (${latitude}, ${longitude})`;
        }
      }

      // Chuyển đổi dữ liệu sang format mong muốn
      const weatherData: WeatherData = {
        location: {
          name: address,
          country: weatherResponse.location.country || '',
          region: weatherResponse.location.region || '',
          lat: weatherResponse.location.lat || latitude,
          lon: weatherResponse.location.lon || longitude,
          timezone: weatherResponse.location.timezone || '',
          localtime: weatherResponse.location.localtime || new Date().toISOString()
        },
        current: {
          temp_c: weatherResponse.current.temp_c || 0,
          temp_f: weatherResponse.current.temp_f || 0,
          condition: {
            text: weatherResponse.current.condition?.text || 'Unknown',
            icon: weatherResponse.current.condition?.icon || '',
            code: weatherResponse.current.condition?.code || 0
          },
          humidity: weatherResponse.current.humidity || 0,
          wind_kph: weatherResponse.current.wind_kph || 0,
          wind_mph: weatherResponse.current.wind_mph || 0,
          wind_dir: weatherResponse.current.wind_dir || 'N',
          pressure_mb: weatherResponse.current.pressure_mb || 0,
          feelslike_c: weatherResponse.current.feelslike_c || weatherResponse.current.temp_c || 0,
          feelslike_f: weatherResponse.current.feelslike_f || weatherResponse.current.temp_f || 0,
          uv: weatherResponse.current.uv || 0,
          visibility_km: weatherResponse.current.visibility_km || 0,
          last_updated: weatherResponse.current.last_updated || new Date().toISOString(),
          vis_km: weatherResponse.current.vis_km || weatherResponse.current.visibility_km || 0
        },
        forecast: weatherResponse.forecast?.forecastday || []
      };

      setState({
        data: weatherData,
        loading: false,
        error: null
      });

    } catch (error) {
      console.error('Error fetching weather:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Có lỗi xảy ra khi lấy thông tin thời tiết'
      }));
    }
  }, []);

  // Lấy thông tin thời tiết với tọa độ
  const getWeatherByCoords = useCallback((latitude: number, longitude: number) => {
    if (latitude && longitude) {
      fetchWeather(latitude, longitude);
    }
  }, [fetchWeather]);

  // Refresh thông tin thời tiết
  const refresh = useCallback(() => {
    if (lat && lon) {
      fetchWeather(lat, lon);
    }
  }, [lat, lon, fetchWeather]);

  // Clear data
  const clear = useCallback(() => {
    setState({
      data: null,
      loading: false,
      error: null
    });
  }, []);

  // Tự động lấy thông tin thời tiết khi có tọa độ
  useEffect(() => {
    if (lat && lon) {
      fetchWeather(lat, lon);
    }
  }, [lat, lon]);

  return {
    ...state,
    getWeatherByCoords,
    refresh,
    clear
  };
}

// Hook để lấy thông tin thời tiết từ địa chỉ
export function useWeatherByAddress() {
  const [state, setState] = useState<WeatherState>({
    data: null,
    loading: false,
    error: null
  });

  const [searchAddress, setSearchAddress] = useState<string>('');

  const searchWeatherByAddress = useCallback(async (address: string) => {
    if (!address.trim()) {
      setState(prev => ({
        ...prev,
        error: 'Vui lòng nhập địa chỉ'
      }));
      return;
    }

    setState(prev => ({
      ...prev,
      loading: true,
      error: null
    }));

    try {
      // Sử dụng BE API để tìm kiếm địa chỉ và lấy thời tiết
      const url = `/api/weather?address=${encodeURIComponent(address)}`;
      
      const response = await fetch(url);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Weather API error: ${response.status} ${response.statusText}`);
      }
      
      const weatherResponse: WeatherApiResponse = await response.json();

      // Validate response
      if (!weatherResponse || !weatherResponse.location || !weatherResponse.current) {
        throw new Error('Invalid weather data received from API');
      }

      // Chuyển đổi dữ liệu
      const weatherData: WeatherData = {
        location: {
          name: weatherResponse.location.name || address,
          country: weatherResponse.location.country || '',
          region: weatherResponse.location.region || '',
          lat: weatherResponse.location.lat || 0,
          lon: weatherResponse.location.lon || 0,
          timezone: weatherResponse.location.timezone || '',
          localtime: weatherResponse.location.localtime || new Date().toISOString()
        },
        current: {
          temp_c: weatherResponse.current.temp_c || 0,
          temp_f: weatherResponse.current.temp_f || 0,
          condition: {
            text: weatherResponse.current.condition?.text || 'Unknown',
            icon: weatherResponse.current.condition?.icon || '',
            code: weatherResponse.current.condition?.code || 0
          },
          humidity: weatherResponse.current.humidity || 0,
          wind_kph: weatherResponse.current.wind_kph || 0,
          wind_mph: weatherResponse.current.wind_mph || 0,
          wind_dir: weatherResponse.current.wind_dir || 'N',
          pressure_mb: weatherResponse.current.pressure_mb || 0,
          feelslike_c: weatherResponse.current.feelslike_c || weatherResponse.current.temp_c || 0,
          feelslike_f: weatherResponse.current.feelslike_f || weatherResponse.current.temp_f || 0,
          uv: weatherResponse.current.uv || 0,
          visibility_km: weatherResponse.current.visibility_km || 0,
          last_updated: weatherResponse.current.last_updated || new Date().toISOString(),
          vis_km: weatherResponse.current.vis_km || weatherResponse.current.visibility_km || 0
        }
      };

      setState({
        data: weatherData,
        loading: false,
        error: null
      });
      setSearchAddress(address);

    } catch (error) {
      console.error('Error searching weather by address:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Không tìm thấy địa chỉ hoặc có lỗi xảy ra'
      }));
    }
  }, []);

  const clear = useCallback(() => {
    setState({
      data: null,
      loading: false,
      error: null
    });
    setSearchAddress('');
  }, []);

  return {
    ...state,
    searchAddress,
    searchWeatherByAddress,
    clear
  };
} 