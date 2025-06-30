import { WeatherApiResponse, GeocodeResponse } from '@/types/weather';

const WEATHER_API_BASE_URL = '/api/weather';
const GEOCODE_API_BASE_URL = '/api/geocode';

export async function getWeatherData(lat: number, lon: number): Promise<WeatherApiResponse> {
  const url = `${WEATHER_API_BASE_URL}?lat=${lat}&lon=${lon}`;
  
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error(`Weather API error: ${response.status} ${response.statusText}`);
  }
  
  return response.json();
}

export async function getWeatherForecast(lat: number, lon: number, days: number = 3): Promise<WeatherApiResponse> {
  const url = `${WEATHER_API_BASE_URL}?lat=${lat}&lon=${lon}&days=${days}`;
  
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error(`Weather API error: ${response.status} ${response.statusText}`);
  }
  
  return response.json();
}

export async function getGeocodeData(query: string): Promise<GeocodeResponse[]> {
  const url = `${GEOCODE_API_BASE_URL}?q=${encodeURIComponent(query)}`;
  
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error(`Geocode API error: ${response.status} ${response.statusText}`);
  }
  
  return response.json();
}

export async function getWeatherByLocation(location: string): Promise<WeatherApiResponse> {
  try {
    // First get coordinates from location name
    const geocodeData = await getGeocodeData(location);
    
    if (geocodeData.length === 0) {
      throw new Error('Location not found');
    }
    
    const { lat, lon } = geocodeData[0];
    
    // Then get weather data using coordinates
    return await getWeatherData(lat, lon);
  } catch (error) {
    console.error('Error fetching weather by location:', error);
    throw error;
  }
}

// Cache implementation for weather data
class WeatherCache {
  private cache = new Map<string, { data: any; timestamp: number }>();
  private readonly TTL = 10 * 60 * 1000; // 10 minutes

  set(key: string, data: any): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  get<T>(key: string): T | null {
    const item = this.cache.get(key);
    
    if (!item) {
      return null;
    }
    
    if (Date.now() - item.timestamp > this.TTL) {
      this.cache.delete(key);
      return null;
    }
    
    return item.data as T;
  }

  clear(): void {
    this.cache.clear();
  }
}

export const weatherCache = new WeatherCache();

// Cached versions of the API functions
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

export async function getCachedGeocodeData(query: string): Promise<GeocodeResponse[]> {
  const cacheKey = `geocode_${query}`;
  const cached = weatherCache.get<GeocodeResponse[]>(cacheKey);
  
  if (cached) {
    return cached;
  }
  
  const data = await getGeocodeData(query);
  weatherCache.set(cacheKey, data);
  return data;
} 