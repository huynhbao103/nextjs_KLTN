import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const icon = searchParams.get('icon');

    if (!icon) {
      return NextResponse.json({ error: 'Icon parameter is required' }, { status: 400 });
    }

    // WeatherAPI.com icons are served from their CDN
    const iconUrl = `https:${icon}`;

    const response = await fetch(iconUrl);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch icon: ${response.status}`);
    }

    const imageBuffer = await response.arrayBuffer();
    
    return new NextResponse(imageBuffer, {
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
      },
    });
  } catch (error) {
    console.error('Weather Icon API Error:', error);
    return NextResponse.json({ error: 'Failed to fetch weather icon' }, { status: 500 });
  }
} 