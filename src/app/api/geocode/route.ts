import { NextRequest, NextResponse } from 'next/server';

// Cache in memory (trong production nên dùng Redis)
const geocodeCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour (geocoding data ít thay đổi)

// Rate limiting (trong production nên dùng Redis)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 50; // 50 requests per minute

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
  const cached = geocodeCache.get(key);
  if (!cached) return null;
  
  if (Date.now() - cached.timestamp > CACHE_DURATION) {
    geocodeCache.delete(key);
    return null;
  }
  
  return cached.data;
}

function setCachedData(key: string, data: any): void {
  geocodeCache.set(key, {
    data,
    timestamp: Date.now()
  });
}

// External geocoding API calls
async function getAddressFromCoords(lat: number, lon: number) {
  const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=10&addressdetails=1`;
  
  const response = await fetch(url, {
    headers: {
      'Accept-Language': 'vi,en',
      'User-Agent': 'WeatherApp/1.0'
    }
  });
  
  if (!response.ok) {
    throw new Error(`Geocoding API error: ${response.status} ${response.statusText}`);
  }
  
  return response.json();
}

async function getCoordsFromAddress(address: string) {
  const encodedAddress = encodeURIComponent(address);
  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodedAddress}&limit=5&addressdetails=1`;
  
  const response = await fetch(url, {
    headers: {
      'Accept-Language': 'vi,en',
      'User-Agent': 'WeatherApp/1.0'
    }
  });
  
  if (!response.ok) {
    throw new Error(`Geocoding API error: ${response.status} ${response.statusText}`);
  }
  
  return response.json();
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
    const address = searchParams.get('address');

    // Reverse geocoding (coordinates to address)
    if (lat && lon) {
      const latitude = parseFloat(lat);
      const longitude = parseFloat(lon);

      if (isNaN(latitude) || isNaN(longitude)) {
        return NextResponse.json(
          { error: 'Invalid latitude or longitude values' },
          { status: 400 }
        );
      }

      // Check cache
      const cacheKey = `geocode_reverse_${latitude}_${longitude}`;
      const cached = getCachedData(cacheKey);
      
      if (cached) {
        return NextResponse.json(cached);
      }

      // Call external API
      const addressData = await getAddressFromCoords(latitude, longitude);
      
      // Cache the result
      setCachedData(cacheKey, addressData);
      
      return NextResponse.json(addressData);
    }

    // Forward geocoding (address to coordinates)
    if (address) {
      // Check cache
      const cacheKey = `geocode_forward_${address}`;
      const cached = getCachedData(cacheKey);
      
      if (cached) {
        return NextResponse.json(cached);
      }

      // Call external API
      const coordinates = await getCoordsFromAddress(address);
      
      // Cache the result
      setCachedData(cacheKey, coordinates);
      
      return NextResponse.json(coordinates);
    }

    return NextResponse.json(
      { error: 'Missing parameters. Provide either lat/lon or address' },
      { status: 400 }
    );

  } catch (error) {
    console.error('Geocoding API error:', error);
    
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