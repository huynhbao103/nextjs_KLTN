import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Dish from '@/models/Dish';

// Cache cho dishes queries
const dishesCache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 phút

// GET - Lấy danh sách dishes
export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const search = searchParams.get('search') || '';
    const skip = (page - 1) * limit;

    // Tạo cache key
    const cacheKey = `dishes_${page}_${limit}_${search}`;
    const cached = dishesCache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return NextResponse.json(cached.data);
    }

    let query: any = {};
    
    // Tối ưu hóa query tìm kiếm
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { ingredients: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    // Sử dụng Promise.all để parallel queries
    const [dishes, total] = await Promise.all([
      Dish.find(query)
        .select('neo4j_id name ingredients instructions source createdAt updatedAt') // Include all necessary fields
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean()
        .exec(),
      Dish.countDocuments(query).exec()
    ]);

    const response = {
      success: true,
      data: dishes,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };

    // Cache kết quả
    dishesCache.set(cacheKey, {
      data: response,
      timestamp: Date.now()
    });

    return NextResponse.json(response);
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

    if (!name || !ingredients || !Array.isArray(ingredients)) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const dish = new Dish({
      neo4j_id,
      name,
      ingredients,
      instructions: instructions || [],
      source: source || 'manual'
    });

    await dish.save();

    // Clear cache khi có dish mới
    dishesCache.clear();

    return NextResponse.json({
      success: true,
      data: dish
    });
  } catch (error) {
    console.error('Error creating dish:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
} 