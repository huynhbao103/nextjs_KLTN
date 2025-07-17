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

    const { message, weather, time_of_day, session_id } = await request.json();
    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    console.log('=== AI API Debug Info ===');
    console.log('Sending message to backend:', message);
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

    console.log("token tesst postman", token);
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      console.log('JWT Token verified locally:', decoded);
    } catch (verifyError) {
      console.error('JWT Token verification failed locally:', verifyError);
    }

    // Luôn gửi đến /process endpoint (bước 1)
    const endpoint = '/langgraph/process';
    const requestBody: any = { question: message };
    if (weather) requestBody.weather = weather;
    if (time_of_day) requestBody.time_of_day = time_of_day;
    if (session_id) requestBody.session_id = session_id;
    
    const requestHeaders = { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };

    console.log('Using endpoint:', endpoint);
    console.log('Request body:', requestBody);

    const response = await axios.post(
      `${BE_URL}${endpoint}`,
      requestBody,
      { headers: requestHeaders }
    );

    console.log('Backend response:', response.data);

    // Xử lý response từ backend
    let aiResponse = '';
    if (response.data) {
      // Nếu backend trả về trực tiếp string
      if (typeof response.data === 'string') {
        aiResponse = response.data;
      }
      // Nếu backend trả về object có field response
      else if (response.data.response) {
        aiResponse = response.data.response;
      }
      // Nếu backend trả về object có field answer
      else if (response.data.answer) {
        aiResponse = response.data.answer;
      }
      // Nếu backend trả về object có field message
      else if (response.data.message) {
        aiResponse = response.data.message;
      }
      // Nếu backend trả về object khác, convert to string
      else {
        aiResponse = JSON.stringify(response.data);
      }
    }

    return NextResponse.json({
      status: 'success',
      message: aiResponse,
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