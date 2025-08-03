import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import User from '@/models/User';
import dbConnect from '@/lib/dbConnect';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const { name, email, password } = await req.json();

    // Kiểm tra độ dài mật khẩu
    if (!password || password.length < 6 || password.length > 60) {
      return NextResponse.json(
        { error: 'Mật khẩu phải có từ 6 đến 60 ký tự' },
        { status: 400 }
      );
    }

    // Kiểm tra email đã tồn tại chưa
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { error: 'Email đã được sử dụng' },
        { status: 400 }
      );
    }

    // Mã hóa mật khẩu
    const hashedPassword = await bcrypt.hash(password, 10);


    // Tạo user mới
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    // Không trả về mật khẩu trong response
    const { password: _, ...userWithoutPassword } = user.toObject();

    return NextResponse.json(userWithoutPassword, { status: 201 });
  } catch (error) {
    console.error('Error in registration:', error);
    return NextResponse.json(
      { error: 'Đăng ký thất bại' },
      { status: 500 }
    );
  }
} 