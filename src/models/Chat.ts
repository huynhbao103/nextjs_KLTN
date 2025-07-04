import mongoose, { Schema, Document } from 'mongoose';

export interface IChat extends Document {
  userId: string;
  title: string;
  messages: Array<{
    id: number;
    text: string;
    isUser: boolean;
    timestamp: string | Date;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

const ChatSchema: Schema = new Schema({
  userId: {
    type: String,
    required: true,
    index: true
  },
  title: {
    type: String,
    required: true,
    default: 'Cuộc trò chuyện mới'
  },
  messages: [{
    id: {
      type: Number,
      required: true
    },
    text: {
      type: String,
      required: true
    },
    isUser: {
      type: Boolean,
      required: true
    },
    timestamp: {
      type: Schema.Types.Mixed, // Chấp nhận cả string và Date
      default: Date.now
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field before saving
ChatSchema.pre('save', function(next) {
  (this as any).updatedAt = new Date();
  next();
});

// Auto-generate title from first user message if not provided
ChatSchema.pre('save', function(next) {
  const chatDoc = this as any;
  if (chatDoc.isNew && chatDoc.title === 'Cuộc trò chuyện mới') {
    const firstUserMessage = chatDoc.messages.find((msg: any) => msg.isUser);
    if (firstUserMessage) {
      // Truncate to 50 characters for title
      chatDoc.title = firstUserMessage.text.length > 50 
        ? firstUserMessage.text.substring(0, 50) + '...'
        : firstUserMessage.text;
    }
  }
  next();
});

export default mongoose.models.Chat || mongoose.model<IChat>('Chat', ChatSchema); 