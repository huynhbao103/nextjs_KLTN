import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import dbConnect from '@/lib/dbConnect';
import Chat from '@/models/Chat';

// GET - Lấy danh sách chat history
export async function GET() {
  try {
    await dbConnect();
    
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const chats = await Chat.find({ userId: session.user.email })
      .select('title createdAt updatedAt messages')
      .sort({ updatedAt: -1 })
      .limit(50);

    return NextResponse.json({ chats });
  } catch (error) {
    console.error('Error fetching chat history:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Lưu chat mới hoặc cập nhật chat hiện tại
export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { chatId, messages, title } = await request.json();

    if (chatId) {
      // Cập nhật chat hiện tại
      const updatedChat = await Chat.findOneAndUpdate(
        { _id: chatId, userId: session.user.email },
        { 
          messages,
          title: title || 'Cuộc trò chuyện mới',
          updatedAt: new Date()
        },
        { new: true }
      );

      if (!updatedChat) {
        return NextResponse.json({ error: 'Chat not found' }, { status: 404 });
      }

      return NextResponse.json({ chat: updatedChat });
    } else {
      // Tạo chat mới
      const newChat = new Chat({
        userId: session.user.email,
        title: title || 'Cuộc trò chuyện mới',
        messages
      });

      await newChat.save();
      return NextResponse.json({ chat: newChat }, { status: 201 });
    }
  } catch (error) {
    console.error('Error saving chat:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE - Xóa chat
export async function DELETE(request: NextRequest) {
  try {
    await dbConnect();
    
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const chatId = searchParams.get('id');

    if (!chatId) {
      return NextResponse.json({ error: 'Chat ID is required' }, { status: 400 });
    }

    const deletedChat = await Chat.findOneAndDelete({
      _id: chatId,
      userId: session.user.email
    });

    if (!deletedChat) {
      return NextResponse.json({ error: 'Chat not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Chat deleted successfully' });
  } catch (error) {
    console.error('Error deleting chat:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 