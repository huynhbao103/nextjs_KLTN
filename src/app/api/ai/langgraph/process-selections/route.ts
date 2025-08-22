import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import axios from 'axios';
import jwt from 'jsonwebtoken';
import { handleCors, corsHeaders } from '@/lib/cors';

const BE_URL = process.env.BE_URL || 'http://localhost:8000/api';

export async function POST(request: NextRequest) {
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
    const { session_id, ingredients, cooking_methods } = body;

    if (!session_id || !cooking_methods) {
        return NextResponse.json({ error: 'Missing required fields: session_id and cooking_methods are required.' }, { 
            status: 400,
            headers: corsHeaders() 
        });
    }

    // ingredients có thể là mảng rỗng (để xem tất cả món ăn)
    if (!Array.isArray(ingredients)) {
        return NextResponse.json({ error: 'ingredients must be an array (can be empty to see all dishes).' }, { 
            status: 400,
            headers: corsHeaders() 
        });
    }

    const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
    
    const tokenPayload = { 
      user_id: session.user.id,
      email: session.user.email,
      name: session.user.name 
    };
    
    const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: '1h' });

    const response = await axios.post(
      `${BE_URL}/langgraph/process-selections`,
      {
        session_id,
        ingredients,
        cooking_methods,
      },
      { 
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        timeout: 30000 
      }
    );

    return NextResponse.json(response.data, { headers: corsHeaders() });

  } catch (error: any) {
    console.error('Error in /api/ai/langgraph/process-selections:', error.message);
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
