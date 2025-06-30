import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import jwt from 'jsonwebtoken';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
    
    const tokenPayload = { 
      user_id: session.user.id,
      email: session.user.email,
      name: session.user.name 
    };
    
    const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: '1h' });

    // Verify token locally
    const decoded = jwt.verify(token, JWT_SECRET);

    return NextResponse.json({
      success: true,
      user: {
        id: session.user.id,
        email: session.user.email,
        name: session.user.name
      },
      jwt: {
        secret: JWT_SECRET,
        payload: tokenPayload,
        token: token,
        decoded: decoded
      },
      environment: {
        JWT_SECRET: process.env.JWT_SECRET ? 'Set' : 'Not set',
        AUTH_SECRET: process.env.AUTH_SECRET ? 'Set' : 'Not set',
        NODE_ENV: process.env.NODE_ENV
      }
    });

  } catch (error: any) {
    console.error('JWT Test Error:', error);
    return NextResponse.json({
      error: 'JWT test failed',
      message: error.message,
      stack: error.stack
    }, { status: 500 });
  }
} 