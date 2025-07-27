import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Dish from '@/models/Dish';

// GET - Lấy danh sách dishes
export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search') || '';
    const skip = (page - 1) * limit;

    let query: any = {};
    
    // Tìm kiếm theo tên hoặc ingredients
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { ingredients: { $regex: search, $options: 'i' } }
      ];
    }

    const [dishes, total] = await Promise.all([
      Dish.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Dish.countDocuments(query)
    ]);

    return NextResponse.json({
      success: true,
      data: dishes,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching dishes:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Tạo dish mới
export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    
    const body = await request.json();
    const { neo4j_id, name, ingredients, instructions, source } = body;

    // Validate required fields
    if (!neo4j_id || !name || !ingredients || !Array.isArray(ingredients)) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if neo4j_id already exists
    const existingDish = await Dish.findOne({ neo4j_id });
    if (existingDish) {
      return NextResponse.json(
        { success: false, error: 'Dish with this neo4j_id already exists' },
        { status: 400 }
      );
    }

    const dish = await Dish.create({
      neo4j_id,
      name,
      ingredients,
      instructions: instructions || [],
      source: source || 'neo4j_migration'
    });

    return NextResponse.json({
      success: true,
      data: dish
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating dish:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
} 