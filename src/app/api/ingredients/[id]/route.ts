import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Ingredient from '@/models/Ingredient';

// GET - Lấy ingredient theo ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();
    
    const ingredient = await Ingredient.findById(params.id);
    
    if (!ingredient) {
      return NextResponse.json(
        { success: false, error: 'Ingredient not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: ingredient
    });
  } catch (error) {
    console.error('Error fetching ingredient:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT - Cập nhật ingredient
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();
    
    const body = await request.json();
    const { name, category, description } = body;

    if (!name) {
      return NextResponse.json(
        { success: false, error: 'Missing required field: name' },
        { status: 400 }
      );
    }

    const updateData: any = { 
      name: name.trim(),
      updated_at: new Date()
    };
    if (category !== undefined) updateData.category = category?.trim() || '';
    if (description !== undefined) updateData.description = description?.trim() || '';

    const ingredient = await Ingredient.findByIdAndUpdate(
      params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!ingredient) {
      return NextResponse.json(
        { success: false, error: 'Ingredient not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: ingredient
    });
  } catch (error) {
    console.error('Error updating ingredient:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE - Xóa ingredient
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();
    
    const ingredient = await Ingredient.findByIdAndDelete(params.id);
    
    if (!ingredient) {
      return NextResponse.json(
        { success: false, error: 'Ingredient not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Ingredient deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting ingredient:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
} 