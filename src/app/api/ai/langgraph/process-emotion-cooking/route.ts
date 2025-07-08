import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import axios from 'axios';
import jwt from 'jsonwebtoken';

const BE_URL = process.env.BE_URL || 'http://localhost:8000/api';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { session_id, emotion, cooking_methods } = await request.json();
    if (!session_id || !emotion || !cooking_methods) {
      return NextResponse.json({ error: 'session_id, emotion, and cooking_methods are required' }, { status: 400 });
    }

    // Debug info
    console.log('=== AI API Debug Info ===');
    console.log('Sending to backend:', { session_id, emotion, cooking_methods });
    console.log('Backend URL:', BE_URL);
    console.log('User ID:', session.user.id);
    console.log('User Email:', session.user.email);
    console.log('User Name:', session.user.name);

    // Tạo JWT token cho backend
    const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
    const tokenPayload = {
      user_id: session.user.id,
      email: session.user.email,
      name: session.user.name
    };
    const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: '1h' });

    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      console.log('JWT Token verified locally:', decoded);
    } catch (verifyError) {
      console.error('JWT Token verification failed locally:', verifyError);
    }

    const requestBody = { session_id, emotion, cooking_methods };
    const requestHeaders = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };

    const response = await axios.post(
      `${BE_URL}/langgraph/process-emotion-cooking`,
      requestBody,
      { headers: requestHeaders }
    );

    console.log('Backend response:', response.data);

    // Xử lý response từ backend
    let aiResponse = '';
    if (response.data) {
      if (typeof response.data === 'string') {
        aiResponse = response.data;
      } else if (response.data.result) {
        aiResponse = response.data.result;
      } else if (response.data.response) {
        aiResponse = response.data.response;
      } else if (response.data.answer) {
        aiResponse = response.data.answer;
      } else if (response.data.message) {
        aiResponse = response.data.message;
      } else {
        aiResponse = JSON.stringify(response.data);
      }
    }

    return NextResponse.json({
      result: aiResponse,
      timestamp: new Date().toISOString(),
      backendData: response.data
    });

  } catch (error: any) {
    if (error.code === 'ECONNREFUSED') {
      console.error('Connection refused - Backend not available');
      return NextResponse.json({
        error: 'Backend service is not available',
        response: 'Xin lỗi, dịch vụ backend hiện không khả dụng. Vui lòng thử lại sau.'
      }, { status: 503 });
    }

    if (error.response) {
      return NextResponse.json({
        error: 'Backend error',
        response: error.response.data?.message || error.response.data?.detail || 'Có lỗi xảy ra từ backend',
        status: error.response.status,
        details: error.response.data
      }, { status: error.response.status });
    }

    console.error('=== End Error Details ===');
    return NextResponse.json({
      error: 'Internal server error',
      response: 'Xin lỗi, tôi gặp vấn đề kỹ thuật. Vui lòng thử lại sau.'
    }, { status: 500 });
  }
} 