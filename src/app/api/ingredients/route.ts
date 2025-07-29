import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Ingredient from '@/models/Ingredient';
export const dynamic = 'force-dynamic';


// GET - Lấy danh sách ingredients
export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const active = searchParams.get('active') || 'true';

    let query: any = {};
    
    // Filter by active status
    if (active === 'true') {
      query.is_active = true;
    }
    
    // Tìm kiếm theo tên
    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }

    const ingredients = await Ingredient.find(query)
      .sort({ name: 1 })
      .lean();

    return NextResponse.json({
      success: true,
      data: ingredients
    });
  } catch (error) {
    console.error('Error fetching ingredients:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
} 