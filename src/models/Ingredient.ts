import mongoose, { Schema, Document } from 'mongoose';

export interface IIngredient extends Document {
  id: number;
  name: string;
  created_at: Date;
  updated_at: Date;
  is_active: boolean;
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
  is_active: {
    type: Boolean,
    default: true
  }
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
  (this as any).updated_at = new Date();
  next();
});

export default mongoose.models.Ingredient || mongoose.model<IIngredient>('Ingredient', IngredientSchema); 