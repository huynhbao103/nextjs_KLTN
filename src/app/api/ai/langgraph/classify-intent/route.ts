import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import axios from 'axios';
import jwt from 'jsonwebtoken';
import { handleCors, corsHeaders } from '@/lib/cors';

const BE_URL = process.env.BE_URL || 'http://localhost:8000/api';

export async function POST(request: NextRequest) {
  // Handle CORS
  const corsResponse = handleCors(request);
  if (corsResponse) return corsResponse;

  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { 
        status: 401,
        headers: corsHeaders()
      });
    }

    const { message, session_id } = await request.json();
    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { 
        status: 400,
        headers: corsHeaders()
      });
    }

    // Tạo JWT token cho backend
    const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
    
    const tokenPayload = { 
      user_id: session.user.id,
      email: session.user.email,
      name: session.user.name 
    };
    
    const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: '1h' });


    
    const requestBody = {
      message,
      session_id: session_id || null
    };
    
    const requestHeaders = { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };

    

    const response = await axios.post(
      `${BE_URL}/langgraph/classify-intent`,
      requestBody,
      { 
        headers: requestHeaders,
        timeout: 30000 // 30 second timeout
      }
    );

    

    // Xử lý response từ backend
    let intent = 'other'; // default intent
    if (response.data) {
      if (response.data.intent) {
        intent = response.data.intent;
      } else if (typeof response.data === 'string') {
        intent = response.data;
      }
    }

    // Validate intent
    const validIntents = ['dislike', 'select', 'like', 'question', 'other'];
    if (!validIntents.includes(intent)) {
      intent = 'other';
    }

    

    return NextResponse.json({
      intent: intent,
      timestamp: new Date().toISOString(),
      backendData: response.data
    }, { headers: corsHeaders() });

  } catch (error: any) {
    console.error('Error details:', {
      code: error.code,
      response: error.response?.data,
      status: error.response?.status
    });
    
    if (error.code === 'ECONNREFUSED') {
      console.error('Connection refused - Backend not available');
      return NextResponse.json({
        error: 'Backend service is not available',
        intent: 'other' // fallback intent
      }, { status: 503, headers: corsHeaders() });
    }
    
    if (error.response) {
      console.error('Backend classify-intent error:', error.response.data);
      return NextResponse.json({
        error: 'Backend error',
        intent: 'other', // fallback intent
        status: error.response.status,
        details: error.response.data
      }, { status: error.response.status, headers: corsHeaders() });
    }

    console.error('Classify intent error:', error);
    return NextResponse.json({
      error: 'Internal server error',
      intent: 'other' // fallback intent
    }, { status: 500, headers: corsHeaders() });
  }
} 