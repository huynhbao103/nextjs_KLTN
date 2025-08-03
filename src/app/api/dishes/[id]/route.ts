import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Dish from '@/models/Dish';

// GET - Lấy dish theo ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();
    
    const dish = await Dish.findById(params.id).lean();
    
    if (!dish) {
      return NextResponse.json(
        { success: false, error: 'Dish not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: dish
    });
  } catch (error) {
    console.error('Error fetching dish:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT - Cập nhật dish
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();
    
    const body = await request.json();
    const { name, ingredients, instructions } = body;

    // Validate required fields
    if (!name || !ingredients || !Array.isArray(ingredients)) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: name and ingredients' },
        { status: 400 }
      );
    }

    const updatedDish = await Dish.findByIdAndUpdate(
      params.id,
      {
        name,
        ingredients,
        instructions: instructions || [],
        source: 'manual'
      },
      { new: true, runValidators: true }
    );

    if (!updatedDish) {
      return NextResponse.json(
        { success: false, error: 'Dish not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: updatedDish
    });
  } catch (error) {
    console.error('Error updating dish:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE - Xóa dish
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();
    
    const deletedDish = await Dish.findByIdAndDelete(params.id);
    
    if (!deletedDish) {
      return NextResponse.json(
        { success: false, error: 'Dish not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Dish deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting dish:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
} 