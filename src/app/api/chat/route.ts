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
      .select('title createdAt updatedAt messages sessionId')
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

    const { chatId, messages, title, sessionId } = await request.json();

    console.log('=== Chat API Debug ===');
    console.log('Received sessionId:', sessionId);
    console.log('ChatId:', chatId);
    console.log('Messages count:', messages?.length);

    if (chatId) {
      // Cập nhật chat hiện tại
      const updateFields: any = {
        messages,
        title: title || 'Cuộc trò chuyện mới',
        updatedAt: new Date()
      };
      if (sessionId) updateFields.sessionId = sessionId;
      console.log('Update fields:', updateFields);
      console.log('Update query:', { _id: chatId, userId: session.user.email });
      const updatedChat = await Chat.findOneAndUpdate(
        { _id: chatId, userId: session.user.email },
        updateFields,
        { new: true }
      );
      if (!updatedChat) {
        return NextResponse.json({ error: 'Chat not found' }, { status: 404 });
      }
      console.log('Updated chat sessionId:', updatedChat.sessionId);
      console.log('Updated chat full data:', updatedChat.toObject());
      return NextResponse.json({ 
        chat: updatedChat,
        debug: {
          sessionId: updatedChat.sessionId,
          receivedSessionId: sessionId
        }
      });
    } else {
      // Tạo chat mới
      console.log('Creating new chat with sessionId:', sessionId);
      const chatData = {
        userId: session.user.email,
        title: title || 'Cuộc trò chuyện mới',
        messages,
        sessionId: sessionId || null
      };
      console.log('New chat data:', chatData);
      const newChat = new Chat(chatData);

      await newChat.save();
      console.log('New chat saved with sessionId:', newChat.sessionId);
      console.log('New chat full data:', newChat.toObject());
      return NextResponse.json({ 
        chat: newChat, 
        debug: {
          sessionId: newChat.sessionId,
          receivedSessionId: sessionId
        }
      }, { status: 201 });
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