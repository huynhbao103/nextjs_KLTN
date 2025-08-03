import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    // Get all users with basic info
    const users = await User.find({}, {
      _id: 1,
      name: 1,
      email: 1,
      role: 1,
      allergies: 1,
      providers: 1,
      createdAt: 1,
      updatedAt: 1
    }).sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      users: users
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
} 