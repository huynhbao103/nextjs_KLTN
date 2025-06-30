import { NextRequest, NextResponse } from 'next/server';

const GEOCODE_API_KEY = process.env.GEOCODE_API_KEY;
const GEOCODE_API_BASE_URL = 'https://api.opencagedata.com/geocode/v1';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q');

    if (!q) {
      return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 });
    }

    if (!GEOCODE_API_KEY) {
      return NextResponse.json({ error: 'Geocode API key not configured' }, { status: 500 });
    }

    const url = `${GEOCODE_API_BASE_URL}/json?q=${encodeURIComponent(q)}&key=${GEOCODE_API_KEY}&limit=5`;

    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Geocode API error: ${response.status}`);
    }

    const data = await response.json();
    
    // Transform the response to match our interface
    const results = data.results.map((result: any) => ({
      name: result.formatted,
      lat: result.geometry.lat,
      lon: result.geometry.lng,
      country: result.components.country || '',
      state: result.components.state || ''
    }));
    
    return NextResponse.json(results);
  } catch (error) {
    console.error('Geocode API Error:', error);
    return NextResponse.json({ error: 'Failed to fetch geocode data' }, { status: 500 });
  }
} 