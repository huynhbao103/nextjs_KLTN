import { WeatherApiResponse, GeocodeResponse } from '@/types/weather';

// API Configuration - Gọi BE API thay vì external API
const WEATHER_API_BASE_URL = '/api/weather';
const GEOCODING_API_BASE_URL = '/api/geocode';

// Lấy thông tin thời tiết từ BE API
export async function getWeatherData(lat: number, lon: number): Promise<WeatherApiResponse> {
  const url = `${WEATHER_API_BASE_URL}?lat=${lat}&lon=${lon}`;
  
  try {
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Weather API error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    return data; // Trả về toàn bộ data thay vì chỉ current
  } catch (error) {
    console.error('Error fetching weather data:', error);
    throw error;
  }
}

// Lấy dự báo thời tiết 3 ngày
export async function getWeatherForecast(lat: number, lon: number, days: number = 3): Promise<WeatherApiResponse> {
  const url = `${WEATHER_API_BASE_URL}?lat=${lat}&lon=${lon}&days=${days}`;
  
  try {
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Weather API error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    return data; // Trả về toàn bộ data thay vì chỉ forecast
  } catch (error) {
    console.error('Error fetching weather forecast:', error);
    throw error;
  }
}

// Chuyển đổi tọa độ thành địa chỉ (Reverse Geocoding)
export async function getAddressFromCoords(lat: number, lon: number): Promise<GeocodeResponse> {
  const url = `${GEOCODING_API_BASE_URL}?lat=${lat}&lon=${lon}`;
  
  try {
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Geocoding API error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching address:', error);
    throw error;
  }
}

// Tìm kiếm địa chỉ từ tên (Forward Geocoding)
export async function getCoordsFromAddress(address: string): Promise<GeocodeResponse[]> {
  const encodedAddress = encodeURIComponent(address);
  const url = `${GEOCODING_API_BASE_URL}?address=${encodedAddress}`;
  
  try {
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Geocoding API error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error searching address:', error);
    throw error;
  }
}

// Cache utilities
const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes

interface CacheItem<T> {
  data: T;
  timestamp: number;
}

class WeatherCache {
  private cache = new Map<string, CacheItem<any>>();

  set<T>(key: string, data: T): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  get<T>(key: string): T | null {
    const item = this.cache.get(key);
    if (!item) return null;
    
    if (Date.now() - item.timestamp > CACHE_DURATION) {
      this.cache.delete(key);
      return null;
    }
    
    return item.data;
  }

  clear(): void {
    this.cache.clear();
  }
}

export const weatherCache = new WeatherCache();

// Cached versions of API functions
export async function getCachedWeatherData(lat: number, lon: number): Promise<WeatherApiResponse> {
  const cacheKey = `weather_${lat}_${lon}`;
  const cached = weatherCache.get<WeatherApiResponse>(cacheKey);
  
  if (cached) {
    return cached;
  }
  
  const data = await getWeatherData(lat, lon);
  weatherCache.set(cacheKey, data);
  return data;
}

export async function getCachedAddressFromCoords(lat: number, lon: number): Promise<GeocodeResponse> {
  const cacheKey = `address_${lat}_${lon}`;
  const cached = weatherCache.get<GeocodeResponse>(cacheKey);
  
  if (cached) {
    return cached;
  }
  
  const data = await getAddressFromCoords(lat, lon);
  weatherCache.set(cacheKey, data);
  return data;
} 