import { NextRequest, NextResponse } from 'next/server';
import { handleCors, corsHeaders } from '@/lib/cors';
import axios from 'axios';

export async function GET(request: NextRequest) {
  // Handle CORS
  const corsResponse = handleCors(request);
  if (corsResponse) return corsResponse;

  try {
    const BE_URL = process.env.BE_URL || 'http://localhost:8000/api';
    
    const debugInfo = {
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      beUrl: BE_URL,
      environmentVariables: {
        hasBeUrl: !!process.env.BE_URL,
        hasJwtSecret: !!process.env.JWT_SECRET,
        hasAuthSecret: !!process.env.AUTH_SECRET,
        hasMongoUri: !!process.env.MONGODB_URI,
      },
      backendTest: null as any
    };

    // Test backend connectivity
    try {
      console.log('Testing backend connectivity to:', BE_URL);
      const response = await axios.get(`${BE_URL}/health`, {
        timeout: 10000
      });
      debugInfo.backendTest = {
        status: 'success',
        statusCode: response.status,
        data: response.data
      };
    } catch (backendError: any) {
      console.error('Backend connectivity test failed:', backendError.message);
      debugInfo.backendTest = {
        status: 'error',
        error: backendError.message,
        code: backendError.code,
        response: backendError.response?.data,
        statusCode: backendError.response?.status
      };
    }

    return NextResponse.json(debugInfo, { headers: corsHeaders() });
  } catch (error) {
    console.error('Debug endpoint error:', error);
    return NextResponse.json({
      error: 'Debug endpoint failed',
      timestamp: new Date().toISOString()
    }, { 
      status: 500,
      headers: corsHeaders()
    });
  }
} 