import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import axios from 'axios';
import jwt from 'jsonwebtoken';

const BE_URL = process.env.BE_URL || 'http://localhost:8000/api';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { message, session_id } = await request.json();
    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    console.log('=== Classify Intent API Debug Info ===');
    console.log('Message to classify:', message);
    console.log('Session ID:', session_id);
    console.log('Backend URL:', BE_URL);
    console.log('User ID:', session.user.id);
    console.log('User Email:', session.user.email);

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

    console.log('Sending to langgraph classify-intent endpoint');
    console.log('Request body:', requestBody);

    const response = await axios.post(
      `${BE_URL}/langgraph/classify-intent`,
      requestBody,
      { headers: requestHeaders }
    );

    console.log('Backend classify-intent response:', response.data);

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

    console.log('Classified intent:', intent);

    return NextResponse.json({
      intent: intent,
      timestamp: new Date().toISOString(),
      backendData: response.data
    });

  } catch (error: any) {
    if (error.code === 'ECONNREFUSED') {
      console.error('Connection refused - Backend not available');
      return NextResponse.json({
        error: 'Backend service is not available',
        intent: 'other' // fallback intent
      }, { status: 503 });
    }
    
    if (error.response) {
      console.error('Backend classify-intent error:', error.response.data);
      return NextResponse.json({
        error: 'Backend error',
        intent: 'other', // fallback intent
        status: error.response.status,
        details: error.response.data
      }, { status: error.response.status });
    }

    console.error('Classify intent error:', error);
    return NextResponse.json({
      error: 'Internal server error',
      intent: 'other' // fallback intent
    }, { status: 500 });
  }
} 