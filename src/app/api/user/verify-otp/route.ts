import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { auth } from '@/auth';

const JWT_SECRET = process.env.JWT_SECRET || 'otp_secret_key';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const { otp, token } = await req.json();
    if (!otp || !token) {
      return NextResponse.json({ message: 'Thiếu thông tin.' }, { status: 400 });
    }
    let payload: any;
    try {
      payload = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      return NextResponse.json({ message: 'Mã OTP không hợp lệ hoặc đã hết hạn.' }, { status: 400 });
    }
    if (payload.otp !== otp) {
      return NextResponse.json({ message: 'Mã OTP không đúng.' }, { status: 400 });
    }
    // OTP đúng và còn hạn
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ message: 'Lỗi server, vui lòng thử lại.' }, { status: 500 });
  }
} 