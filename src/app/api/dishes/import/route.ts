import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Dish from '@/models/Dish';

// POST - Import dishes từ backend Python
export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    
    const body = await request.json();
    const { dishes } = body;

    if (!Array.isArray(dishes)) {
      return NextResponse.json(
        { success: false, error: 'Invalid dishes data format' },
        { status: 400 }
      );
    }

    const results = {
      total: dishes.length,
      created: 0,
      updated: 0,
      errors: 0,
      errors_list: [] as string[]
    };

    for (const dishData of dishes) {
      try {
        // Validate required fields
        if (!dishData.neo4j_id || !dishData.name || !Array.isArray(dishData.ingredients)) {
          results.errors++;
          results.errors_list.push(`Invalid dish data: ${JSON.stringify(dishData)}`);
          continue;
        }

        // Check if dish already exists
        const existingDish = await Dish.findOne({ neo4j_id: dishData.neo4j_id });
        
        if (existingDish) {
          // Update existing dish
          await Dish.findByIdAndUpdate(existingDish._id, {
            name: dishData.name,
            ingredients: dishData.ingredients,
            instructions: dishData.instructions || [],
            source: dishData.source || 'neo4j_migration',
            updatedAt: new Date()
          });
          results.updated++;
        } else {
          // Create new dish
          await Dish.create({
            neo4j_id: dishData.neo4j_id,
            name: dishData.name,
            ingredients: dishData.ingredients,
            instructions: dishData.instructions || [],
            source: dishData.source || 'neo4j_migration'
          });
          results.created++;
        }
      } catch (error) {
        results.errors++;
        results.errors_list.push(`Error processing dish ${dishData.neo4j_id}: ${error}`);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Import completed',
      results
    });

  } catch (error) {
    console.error('Error importing dishes:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET - Lấy thống kê import
export async function GET() {
  try {
    await dbConnect();
    
    const totalDishes = await Dish.countDocuments({});
    const dishesBySource = await Dish.aggregate([
      { $group: { _id: '$source', count: { $sum: 1 } } }
    ]);

    return NextResponse.json({
      success: true,
      statistics: {
        totalDishes,
        dishesBySource
      }
    });
  } catch (error) {
    console.error('Error getting import statistics:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
} 