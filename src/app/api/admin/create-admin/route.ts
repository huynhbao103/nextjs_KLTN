import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import bcrypt from 'bcryptjs';

export const dynamic = 'force-dynamic';

// POST - Tạo admin user
export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    
    const body = await request.json();
    const { email, password, name } = body;

    // Validation
    if (!email || !password || !name) {
      return NextResponse.json(
        { success: false, error: 'Email, password và name là bắt buộc' },
        { status: 400 }
      );
    }

    // Kiểm tra email đã tồn tại chưa
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { success: false, error: 'Email đã được sử dụng' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Tạo admin user
    const adminUser = new User({
      email,
      password: hashedPassword,
      name,
      role: 'admin',
      providers: ['credentials']
    });

    await adminUser.save();

    return NextResponse.json({
      success: true,
      message: 'Admin user đã được tạo thành công',
      user: {
        id: adminUser._id,
        email: adminUser.email,
        name: adminUser.name,
        role: adminUser.role
      }
    });
  } catch (error) {
    console.error('Error creating admin user:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
} 