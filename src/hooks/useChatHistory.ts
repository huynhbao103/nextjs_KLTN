import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

interface ChatMessage {
  id: number;
  text: string;
  isUser: boolean;
  timestamp?: Date;
}

interface ChatHistoryItem {
  _id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messages: ChatMessage[];
}

export const useChatHistory = () => {
  const { data: session } = useSession();
  const [chats, setChats] = useState<ChatHistoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch chat history
  const fetchChatHistory = async () => {
    if (!session?.user?.email) return;

    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/chat');
      
      if (response.ok) {
        const data = await response.json();
        setChats(data.chats || []);
      } else {
        setError('Không thể tải lịch sử gợi ý');
      }
    } catch (error) {
      setError('Đã xảy ra lỗi khi tải lịch sử');
    } finally {
      setLoading(false);
    }
  };

  // Save chat
  const saveChat = async (messages: ChatMessage[], chatId?: string, title?: string) => {
    if (!session?.user?.email) return null;

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chatId,
          messages,
          title,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        // Refresh chat history
        await fetchChatHistory();
        return data.chat;
      } else {
        throw new Error('Không thể lưu chat');
      }
    } catch (error) {
      console.error('Error saving chat:', error);
      throw error;
    }
  };

  // Delete chat
  const deleteChat = async (chatId: string) => {
    if (!session?.user?.email) return false;

    try {
      const response = await fetch(`/api/chat?id=${chatId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setChats(chats.filter(chat => chat._id !== chatId));
        return true;
      } else {
        throw new Error('Không thể xóa chat');
      }
    } catch (error) {
      console.error('Error deleting chat:', error);
      return false;
    }
  };

  // Auto-save chat
  const autoSaveChat = async (messages: ChatMessage[], chatId?: string) => {
    if (!session?.user?.email || messages.length <= 1) return;

    try {
      await saveChat(messages, chatId);
    } catch (error) {
      console.error('Auto-save failed:', error);
    }
  };

  // Load chat by ID
  const loadChat = (chatId: string) => {
    return chats.find(chat => chat._id === chatId);
  };

  // Get chat title
  const getChatTitle = (messages: ChatMessage[]) => {
    const firstUserMessage = messages.find(msg => msg.isUser);
    if (firstUserMessage) {
      return firstUserMessage.text.length > 50 
        ? firstUserMessage.text.substring(0, 50) + '...'
        : firstUserMessage.text;
    }
    return 'Cuộc trò chuyện mới';
  };

  // Refresh chat history
  useEffect(() => {
    if (session?.user?.email) {
      fetchChatHistory();
    }
  }, [session]);

  return {
    chats,
    loading,
    error,
    fetchChatHistory,
    saveChat,
    deleteChat,
    autoSaveChat,
    loadChat,
    getChatTitle,
  };
}; 