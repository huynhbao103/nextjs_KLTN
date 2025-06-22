import { NextRequest, NextResponse } from 'next/server';

// Cache in memory (trong production nên dùng Redis)
const weatherCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes

// Rate limiting (trong production nên dùng Redis)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 30; // 30 requests per minute

// Helper function để lấy client IP
function getClientIP(request: NextRequest): string {
  return request.headers.get('x-forwarded-for')?.split(',')[0] || 
         request.headers.get('x-real-ip') || 
         'unknown';
}

// Rate limiting check
function checkRateLimit(clientIP: string): boolean {
  const now = Date.now();
  const clientData = rateLimitMap.get(clientIP);
  
  if (!clientData || now > clientData.resetTime) {
    rateLimitMap.set(clientIP, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return true;
  }
  
  if (clientData.count >= RATE_LIMIT_MAX_REQUESTS) {
    return false;
  }
  
  clientData.count++;
  return true;
}

// Cache helper
function getCachedData(key: string): any | null {
  const cached = weatherCache.get(key);
  if (!cached) return null;
  
  if (Date.now() - cached.timestamp > CACHE_DURATION) {
    weatherCache.delete(key);
    return null;
  }
  
  return cached.data;
}

function setCachedData(key: string, data: any): void {
  weatherCache.set(key, {
    data,
    timestamp: Date.now()
  });
}

// Convert OpenWeatherMap data to our format
function convertOpenWeatherMapData(weatherData: any, forecastData?: any) {
  const current = weatherData;
  
  // Safe access to nested properties
  const locationName = current?.name || 'Unknown Location';
  const country = current?.sys?.country || '';
  const latitude = current?.coord?.lat || 0;
  const longitude = current?.coord?.lon || 0;
  const timezone = current?.timezone || 0;
  
  const tempC = current?.main?.temp || 0;
  const tempF = (tempC * 9/5) + 32;
  const feelsLikeC = current?.main?.feels_like || tempC;
  const feelsLikeF = (feelsLikeC * 9/5) + 32;
  const humidity = current?.main?.humidity || 0;
  const pressure = current?.main?.pressure || 0;
  
  const windSpeed = current?.wind?.speed || 0;
  const windDeg = current?.wind?.deg || 0;
  const windKph = windSpeed * 3.6;
  const windMph = windSpeed * 2.237;
  
  const visibility = current?.visibility || 0;
  const visibilityKm = visibility / 1000;
  
  const weatherCondition = current?.weather?.[0] || {};
  const conditionText = weatherCondition.description || 'Unknown';
  const conditionIcon = weatherCondition.icon ? `/api/weather-icon?icon=${weatherCondition.icon}` : '';
  const conditionCode = weatherCondition.id || 0;
  
  return {
    location: {
      name: locationName,
      country: country,
      region: '',
      lat: latitude,
      lon: longitude,
      timezone: timezone,
      localtime: new Date().toISOString()
    },
    current: {
      temp_c: tempC,
      temp_f: tempF,
      condition: {
        text: conditionText,
        icon: conditionIcon,
        code: conditionCode
      },
      humidity: humidity,
      wind_kph: windKph,
      wind_mph: windMph,
      wind_dir: getWindDirection(windDeg),
      pressure_mb: pressure,
      feelslike_c: feelsLikeC,
      feelslike_f: feelsLikeF,
      uv: 0, // OpenWeatherMap doesn't provide UV in free tier
      visibility_km: visibilityKm,
      last_updated: new Date().toISOString(),
      vis_km: visibilityKm
    },
    forecast: {
      forecastday: forecastData ? convertForecastData(forecastData) : []
    }
  };
}

function convertForecastData(forecastData: any) {
  if (!forecastData?.list || !Array.isArray(forecastData.list)) {
    console.warn('Invalid forecast data structure:', forecastData);
    return [];
  }
  
  // Group by day
  const dailyData = new Map();
  
  forecastData.list.forEach((item: any) => {
    if (!item?.dt || !item?.main || !item?.weather?.[0]) {
      console.warn('Invalid forecast item:', item);
      return;
    }
    
    const date = new Date(item.dt * 1000).toDateString();
    if (!dailyData.has(date)) {
      dailyData.set(date, {
        date: new Date(item.dt * 1000).toISOString().split('T')[0],
        day: {
          maxtemp_c: item.main.temp_max || 0,
          maxtemp_f: ((item.main.temp_max || 0) * 9/5) + 32,
          mintemp_c: item.main.temp_min || 0,
          mintemp_f: ((item.main.temp_min || 0) * 9/5) + 32,
          avgtemp_c: item.main.temp || 0,
          avgtemp_f: ((item.main.temp || 0) * 9/5) + 32,
          maxwind_kph: (item.wind?.speed || 0) * 3.6,
          maxwind_mph: (item.wind?.speed || 0) * 2.237,
          totalprecip_mm: item.rain?.['3h'] || 0,
          totalprecip_in: ((item.rain?.['3h'] || 0) / 25.4),
          avghumidity: item.main.humidity || 0,
          condition: {
            text: item.weather[0].description || 'Unknown',
            icon: item.weather[0].icon ? `/api/weather-icon?icon=${item.weather[0].icon}` : '',
            code: item.weather[0].id || 0
          },
          uv: 0
        },
        hour: []
      });
    }
    
    dailyData.get(date).hour.push({
      time: new Date(item.dt * 1000).toISOString(),
      temp_c: item.main.temp || 0,
      temp_f: ((item.main.temp || 0) * 9/5) + 32,
      condition: {
        text: item.weather[0].description || 'Unknown',
        icon: item.weather[0].icon ? `/api/weather-icon?icon=${item.weather[0].icon}` : '',
        code: item.weather[0].id || 0
      },
      wind_kph: (item.wind?.speed || 0) * 3.6,
      wind_mph: (item.wind?.speed || 0) * 2.237,
      wind_dir: getWindDirection(item.wind?.deg || 0),
      pressure_mb: item.main.pressure || 0,
      precip_mm: item.rain?.['3h'] || 0,
      precip_in: ((item.rain?.['3h'] || 0) / 25.4),
      humidity: item.main.humidity || 0,
      cloud: item.clouds?.all || 0,
      feelslike_c: item.main.feels_like || item.main.temp || 0,
      feelslike_f: ((item.main.feels_like || item.main.temp || 0) * 9/5) + 32,
      chance_of_rain: 0,
      chance_of_snow: 0,
      vis_km: (item.visibility || 0) / 1000,
      vis_miles: (item.visibility || 0) / 1609.34,
      uv: 0
    });
  });
  
  return Array.from(dailyData.values());
}

function getWindDirection(degrees: number): string {
  const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  const index = Math.round(degrees / 22.5) % 16;
  return directions[index];
}

export async function GET(request: NextRequest) {
  try {
    // Rate limiting check
    const clientIP = getClientIP(request);
    if (!checkRateLimit(clientIP)) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again later.' },
        { status: 429 }
      );
    }

    const { searchParams } = new URL(request.url);
    const lat = searchParams.get('lat');
    const lon = searchParams.get('lon');
    const days = searchParams.get('days');
    const address = searchParams.get('address');

    console.log('Weather API request:', { lat, lon, days, address });

    // Xử lý tìm kiếm theo địa chỉ
    if (address) {
      const cacheKey = `weather_address_${address}`;
      const cached = getCachedData(cacheKey);
      
      if (cached) {
        console.log('Returning cached address weather data');
        return NextResponse.json(cached);
      }

      // Gọi OpenWeatherMap với địa chỉ
      const apiKey = process.env.WEATHER_API_KEY ;
      
      if (!apiKey) {
        console.error('Weather API key is not configured');
        return NextResponse.json(
          { error: 'Weather API key is not configured' },
          { status: 500 }
        );
      }

      const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(address)}&appid=${apiKey}&units=metric&lang=vi`;
      console.log('Calling OpenWeatherMap with address:', url);
      
      const response = await fetch(url);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('OpenWeatherMap error:', response.status, errorText);
        throw new Error(`OpenWeatherMap error: ${response.status} ${response.statusText} - ${errorText}`);
      }
      
      const data = await response.json();
      console.log('OpenWeatherMap response received:', data);
      
      // Validate response data
      if (!data || typeof data !== 'object') {
        throw new Error('Invalid response from OpenWeatherMap API');
      }
      
      const convertedData = convertOpenWeatherMapData(data);
      setCachedData(cacheKey, convertedData);
      
      return NextResponse.json(convertedData);
    }

    // Xử lý tìm kiếm theo tọa độ
    if (!lat || !lon) {
      return NextResponse.json(
        { error: 'Missing latitude or longitude parameters' },
        { status: 400 }
      );
    }

    const latitude = parseFloat(lat);
    const longitude = parseFloat(lon);
    const forecastDays = days ? parseInt(days) : 3;

    if (isNaN(latitude) || isNaN(longitude)) {
      return NextResponse.json(
        { error: 'Invalid latitude or longitude values' },
        { status: 400 }
      );
    }

    // Check cache cho weather data
    const weatherCacheKey = `weather_${latitude}_${longitude}`;
    const cachedWeather = getCachedData(weatherCacheKey);
    
    if (cachedWeather) {
      console.log('Returning cached weather data');
      return NextResponse.json(cachedWeather);
    }

    // Gọi external API
    const apiKey = process.env.WEATHER_API_KEY || "b6bd7b2942f4b524dd696aaa422d707b";
    
    if (!apiKey) {
      console.error('Weather API key is not configured');
      return NextResponse.json(
        { error: 'Weather API key is not configured' },
        { status: 500 }
      );
    }

    console.log('API Key found, calling OpenWeatherMap APIs...');

    // Lấy current weather và forecast từ OpenWeatherMap
    const currentUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=metric&lang=vi`;
    const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=metric&lang=vi&cnt=${forecastDays * 8}`; // 8 data points per day
    
    console.log('Calling current weather API:', currentUrl);
    console.log('Calling forecast API:', forecastUrl);

    const [currentResponse, forecastResponse] = await Promise.all([
      fetch(currentUrl),
      fetch(forecastUrl)
    ]);

    console.log('API responses received:', {
      current: currentResponse.status,
      forecast: forecastResponse.status
    });

    if (!currentResponse.ok) {
      const errorText = await currentResponse.text();
      console.error('Current weather API error:', currentResponse.status, errorText);
      throw new Error(`Current weather API error: ${currentResponse.status} ${currentResponse.statusText} - ${errorText}`);
    }

    if (!forecastResponse.ok) {
      const errorText = await forecastResponse.text();
      console.error('Forecast API error:', forecastResponse.status, errorText);
      throw new Error(`Forecast API error: ${forecastResponse.status} ${forecastResponse.statusText} - ${errorText}`);
    }

    const [currentData, forecastData] = await Promise.all([
      currentResponse.json(),
      forecastResponse.json()
    ]);

    console.log('Weather data parsed successfully');
    console.log('Current data sample:', {
      name: currentData?.name,
      main: currentData?.main,
      weather: currentData?.weather
    });

    // Validate response data
    if (!currentData || typeof currentData !== 'object') {
      throw new Error('Invalid current weather response from OpenWeatherMap API');
    }

    // Convert OpenWeatherMap data to our format
    const combinedData = convertOpenWeatherMapData(currentData, forecastData);

    // Cache the result
    setCachedData(weatherCacheKey, combinedData);

    return NextResponse.json(combinedData);

  } catch (error) {
    console.error('Weather API error:', error);
    
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 