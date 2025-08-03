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
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { 
        status: 401,
        headers: corsHeaders()
      });
    }

    const body = await request.json();

    // Create JWT token for the backend
    const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
    
    const tokenPayload = { 
      user_id: session.user.id,
      email: session.user.email,
      name: session.user.name 
    };
    
    const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: '1h' });



    // Forward the request to the backend
    const response = await axios.post(
      `${BE_URL}/langgraph/process-cooking`,
      body,
      { 
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        timeout: 30000 // 30 second timeout
      }
    );

    return NextResponse.json(response.data, { headers: corsHeaders() });

  } catch (error: any) {
    console.error('Error in /api/ai/langgraph/process-cooking:', error.message);
    console.error('Error details:', {
      code: error.code,
      response: error.response?.data,
      status: error.response?.status
    });
    
    if (error.response) {
      return NextResponse.json(error.response.data, { 
        status: error.response.status,
        headers: corsHeaders()
      });
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { 
      status: 500,
      headers: corsHeaders()
    });
  }
} 