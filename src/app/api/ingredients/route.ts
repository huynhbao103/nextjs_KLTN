import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Ingredient from '@/models/Ingredient';

export const dynamic = 'force-dynamic';

// Cache cho ingredients queries
const ingredientsCache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 phút

// GET - Lấy danh sách ingredients
export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const skip = (page - 1) * limit;

    // Tạo cache key
    const cacheKey = `ingredients_${page}_${limit}_${search}`;
    const cached = ingredientsCache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return NextResponse.json(cached.data);
    }

    let query: any = {};
    
    // Tối ưu hóa query tìm kiếm
    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }

    // Sử dụng Promise.all để parallel queries
    const [ingredients, total] = await Promise.all([
      Ingredient.find(query)
        .select('_id id name category description created_at updated_at') // Bao gồm tất cả fields cần thiết
        .sort({ name: 1 })
        .skip(skip)
        .limit(limit)
        .lean()
        .exec(),
      Ingredient.countDocuments(query).exec()
    ]);

    const response = {
      success: true,
      data: ingredients,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };

    // Cache kết quả
    ingredientsCache.set(cacheKey, {
      data: response,
      timestamp: Date.now()
    });

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching ingredients:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Tạo ingredient mới
export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    
    const body = await request.json();
    const { name, category, description } = body;

    if (!name) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Tạo ID dạng number để tương thích với database cũ
    let finalId = body.id;
    if (!finalId) {
      finalId = Date.now(); // Sử dụng timestamp làm ID
    }

    // Kiểm tra xem ID đã tồn tại chưa
    const existingIngredient = await Ingredient.findOne({ id: finalId });
    if (existingIngredient) {
      // Nếu ID đã tồn tại, tạo ID mới
      finalId = Date.now() + Math.floor(Math.random() * 1000);
    }

    const ingredient = new Ingredient({
      id: finalId,
      name: name.trim(),
      category: category?.trim() || '',
      description: description?.trim() || ''
    });

    await ingredient.save();

    // Clear cache khi có ingredient mới
    ingredientsCache.clear();

    return NextResponse.json({
      success: true,
      data: ingredient
    });
  } catch (error) {
    console.error('Error creating ingredient:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
} 