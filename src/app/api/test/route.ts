import { NextRequest, NextResponse } from 'next/server';
import { handleCors, corsHeaders } from '@/lib/cors';

export async function GET(request: NextRequest) {
  // Handle CORS
  const corsResponse = handleCors(request);
  if (corsResponse) return corsResponse;

  try {
    const testInfo = {
      status: 'success',
      message: 'Server is working correctly',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      environmentVariables: {
        hasBeUrl: !!process.env.BE_URL,
        hasJwtSecret: !!process.env.JWT_SECRET,
        hasAuthSecret: !!process.env.AUTH_SECRET,
        hasMongoUri: !!process.env.MONGODB_URI,
      }
    };

    return NextResponse.json(testInfo, { headers: corsHeaders() });
  } catch (error) {
    console.error('Test endpoint error:', error);
    return NextResponse.json({
      status: 'error',
      message: 'Test endpoint failed',
      timestamp: new Date().toISOString()
    }, { 
      status: 500,
      headers: corsHeaders()
    });
  }
} 