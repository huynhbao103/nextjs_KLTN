import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

interface ChatHistoryItem {
  _id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messages: Array<{
    id: number;
    text: string;
    isUser: boolean;
    timestamp: string;
  }>;
}

interface ChatHistoryProps {
  onSelectChat: (chat: ChatHistoryItem) => void;
  currentChatId?: string;
}

const ChatHistory: React.FC<ChatHistoryProps> = ({ onSelectChat, currentChatId }) => {
  const { data: session } = useSession();
  const [chats, setChats] = useState<ChatHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (session?.user?.email) {
      fetchChatHistory();
    }
  }, [session]);

  const fetchChatHistory = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/chat');
      if (response.ok) {
        const data = await response.json();
        setChats(data.chats || []);
      } else {
        setError('Không thể tải lịch sử chat');
      }
    } catch (error) {
      setError('Đã xảy ra lỗi khi tải lịch sử');
    } finally {
      setLoading(false);
    }
  };

  const deleteChat = async (chatId: string) => {
    if (!confirm('Bạn có chắc muốn xóa cuộc trò chuyện này?')) {
      return;
    }

    try {
      const response = await fetch(`/api/chat?id=${chatId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setChats(chats.filter(chat => chat._id !== chatId));
      } else {
        alert('Không thể xóa cuộc trò chuyện');
      }
    } catch (error) {
      alert('Đã xảy ra lỗi khi xóa');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 168) { // 7 days
      return date.toLocaleDateString('vi-VN', { weekday: 'short' });
    } else {
      return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
    }
  };

  if (loading) {
    return (
      <div className="p-4">
        <div className="animate-pulse space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-center">
        <p className="text-red-500 text-sm">{error}</p>
        <button
          onClick={fetchChatHistory}
          className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          Thử lại
        </button>
      </div>
    );
  }

  if (chats.length === 0) {
    return (
      <div className="p-4 text-center">
        <div className="text-gray-500 dark:text-gray-400">
          <svg className="w-12 h-12 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          <p className="text-sm">Chưa có cuộc trò chuyện nào</p>
          <p className="text-xs mt-1">Bắt đầu cuộc trò chuyện mới để xem lịch sử ở đây</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-2">
      <div className="space-y-2">
        {chats.map((chat) => (
          <div
            key={chat._id}
            className={`group relative p-3 rounded-lg cursor-pointer transition-all duration-200 ${
              currentChatId === chat._id
                ? 'bg-blue-100 dark:bg-blue-900 border border-blue-300 dark:border-blue-600'
                : 'bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700'
            }`}
            onClick={() => onSelectChat(chat)}
          >
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                  {chat.title}
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {chat.messages.length} tin nhắn • {formatDate(chat.updatedAt)}
                </p>
              </div>
              
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  deleteChat(chat._id);
                }}
                className="opacity-0 group-hover:opacity-100 ml-2 p-1 text-gray-400 hover:text-red-500 transition-all duration-200"
                title="Xóa cuộc trò chuyện"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ChatHistory; 