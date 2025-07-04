import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import axios from 'axios';
import jwt from 'jsonwebtoken';

const BE_URL = process.env.NEXT_PUBLIC_BE_URL || 'http://localhost:8000/api';
const JWT_SECRET = process.env.JWT_SECRET || '';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { emotion, session_id } = await request.json();
    if (!emotion || !session_id) {
      return NextResponse.json({ error: 'Emotion and session_id are required' }, { status: 400 });
    }

    // Create JWT token for the backend
    const tokenPayload = {
      user_id: session.user.id,
      email: session.user.email,
      name: session.user.name,
    };
    const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: '1h' });

    // Call the backend service
    const response = await axios.post(
      `${BE_URL}/langgraph/process-emotion`,
      { emotion, session_id },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      }
    );

    return NextResponse.json(response.data);

  } catch (error: any) {
    console.error('Error processing emotion:', error);
    if (error.response) {
      return NextResponse.json(
        { error: 'Backend error', details: error.response.data },
        { status: error.response.status }
      );
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 