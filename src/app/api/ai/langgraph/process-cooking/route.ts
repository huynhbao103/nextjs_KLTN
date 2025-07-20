import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import axios from 'axios';
import jwt from 'jsonwebtoken';

const BE_URL = process.env.BE_URL || 'http://localhost:8000/api';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
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
        }
      }
    );

    return NextResponse.json(response.data);

  } catch (error: any) {
    console.error('Error in /api/ai/langgraph/process-cooking:', error.message);
    if (error.response) {
      return NextResponse.json(error.response.data, { status: error.response.status });
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
} 