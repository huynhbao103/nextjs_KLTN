import mongoose, { Schema, Document } from 'mongoose';

export interface IDish extends Document {
  neo4j_id: string;
  name: string;
  ingredients: string[];
  instructions: string[];
  source: string;
  createdAt: Date;
  updatedAt: Date;
}

const DishSchema: Schema = new Schema({
  neo4j_id: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  name: {
    type: String,
    required: true,
    index: true
  },
  ingredients: [{
    type: String,
    required: true
  }],
  instructions: [{
    type: String,
    default: []
  }],
  source: {
    type: String,
    default: 'neo4j_migration'
  }
}, {
  timestamps: true
});

// Tạo index cho tìm kiếm
DishSchema.index({ name: 'text', ingredients: 'text' });

// Middleware để tự động cập nhật updatedAt
DishSchema.pre('save', function(next) {
  (this as any).updatedAt = new Date();
  next();
});

export default mongoose.models.Dish || mongoose.model<IDish>('Dish', DishSchema); 