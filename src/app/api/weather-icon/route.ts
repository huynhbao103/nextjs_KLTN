import { NextRequest, NextResponse } from 'next/server';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const icon = searchParams.get('icon');

    if (!icon) {
      return NextResponse.json(
        { error: 'Missing icon parameter' },
        { status: 400 }
      );
    }

    // Fetch icon from OpenWeatherMap
    const iconUrl = `https://openweathermap.org/img/wn/${icon}@2x.png`;
    
    const response = await fetch(iconUrl);
    
    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch icon' },
        { status: 404 }
      );
    }

    // Get the image data
    const imageBuffer = await response.arrayBuffer();
    
    // Return the image with proper headers
    return new NextResponse(imageBuffer, {
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=86400', // Cache for 24 hours
        'Access-Control-Allow-Origin': '*',
      },
    });

  } catch (error) {
    console.error('Weather icon API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 