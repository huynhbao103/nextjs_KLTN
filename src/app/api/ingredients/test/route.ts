import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Ingredient from '@/models/Ingredient';

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    
    // Tạo ingredient test với ID dạng number
    const testIngredient = new Ingredient({
      id: Date.now(), // Sử dụng timestamp làm ID
      name: 'Nguyên liệu test',
      category: 'Test category',
      description: 'Mô tả test'
    });

    await testIngredient.save();

    return NextResponse.json({
      success: true,
      data: testIngredient,
      message: 'Test ingredient created successfully'
    });
  } catch (error) {
    console.error('Error creating test ingredient:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
