import mongoose, { Schema, Document } from 'mongoose';

export interface IIngredient extends Document {
  id: number;
  name: string;
  created_at: Date;
  updated_at: Date;
}

const IngredientSchema: Schema = new Schema({
  id: {
    type: Number,
    required: true,
    unique: true,
    index: true
  },
  name: {
    type: String,
    required: true,
    index: true
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