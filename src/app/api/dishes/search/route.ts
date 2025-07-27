import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Dish from '@/models/Dish';

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();
    
    const { searchParams } = new URL(request.url);
    const name = searchParams.get('name');
    
    if (!name) {
      return NextResponse.json(
        { error: 'Tên món ăn là bắt buộc' },
        { status: 400 }
      );
    }

    // Tìm món ăn theo tên (không phân biệt hoa thường)
    const dish = await Dish.findOne({
      name: { $regex: new RegExp(name, 'i') }
    });

    if (!dish) {
      return NextResponse.json(
        { error: 'Không tìm thấy món ăn' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      dish: {
        id: dish._id,
        neo4j_id: dish.neo4j_id,
        name: dish.name,
        ingredients: dish.ingredients,
        instructions: dish.instructions,
        source: dish.source
      }
    });

  } catch (error) {
    console.error('Error searching dish:', error);
    return NextResponse.json(
      { error: 'Lỗi server khi tìm kiếm món ăn' },
      { status: 500 }
    );
  }
} 