import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import User from '@/models/User';
import dbConnect from '@/lib/dbConnect';

const JWT_SECRET = process.env.JWT_SECRET || 'otp_secret_key';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const { password, token } = await req.json();
    if (!password || !token) {
      return NextResponse.json({ message: 'Thiếu thông tin.' }, { status: 400 });
    }
    
    // Kiểm tra độ dài mật khẩu
    if (password.length < 6 || password.length > 60) {
      return NextResponse.json({ message: 'Mật khẩu phải có từ 6 đến 60 ký tự.' }, { status: 400 });
    }
    let payload: any;
    try {
      payload = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      return NextResponse.json({ message: 'Token không hợp lệ hoặc đã hết hạn.' }, { status: 400 });
    }
    const user = await User.findOne({ email: payload.email });
    if (!user) {
      return NextResponse.json({ message: 'Tài khoản không tồn tại.' }, { status: 404 });
    }
    const hashed = await bcrypt.hash(password, 10);
    user.password = hashed;
    await user.save();
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ message: 'Lỗi server, vui lòng thử lại.' }, { status: 500 });
  }
} 