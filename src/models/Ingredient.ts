import mongoose, { Schema, Document } from 'mongoose';

export interface IIngredient extends Document {
  id: number;           // Giữ nguyên là number để tương thích với database cũ
  name: string;
  category?: string;    // Thêm field category
  description?: string; // Thêm field description
  created_at: Date;
  updated_at: Date;
}

const IngredientSchema: Schema = new Schema({
  id: {
    type: Number,       // Giữ nguyên là Number để tương thích với database cũ
    required: true,
    unique: true,
    index: true
  },
  name: {
    type: String,
    required: true,
    index: true
  },
  category: {           // Thêm field category
    type: String,
    required: false,
    default: ''
  },
  description: {        // Thêm field description
    type: String,
    required: false,
    default: ''
  },
  created_at: {
    type: Date,
    default: Date.now
  },
  updated_at: {
    type: Date,
    default: Date.now
  },

}, {
  timestamps: { 
    createdAt: 'created_at', 
    updatedAt: 'updated_at' 
  }
});

// Tạo index cho tìm kiếm
IngredientSchema.index({ name: 'text' });

// Middleware để tự động cập nhật updated_at
IngredientSchema.pre('save', function(next) {
  try {
    (this as any).updated_at = new Date();
    next();
  } catch (error) {
    console.error('Error in pre-save middleware:', error);
    next(error instanceof Error ? error : new Error('Unknown error'));
  }
});

export default mongoose.models.Ingredient || mongoose.model<IIngredient>('Ingredient', IngredientSchema); 