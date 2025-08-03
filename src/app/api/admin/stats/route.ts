import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import Dish from '@/models/Dish';
import Ingredient from '@/models/Ingredient';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    // Get counts
    const userCount = await User.countDocuments();
    const dishCount = await Dish.countDocuments();
    const ingredientCount = await Ingredient.countDocuments();

    return NextResponse.json({
      success: true,
      stats: {
        totalUsers: userCount,
        totalDishes: dishCount,
        totalIngredients: ingredientCount
      }
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
} 