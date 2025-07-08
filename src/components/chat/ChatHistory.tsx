import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { MessageSquare, Clock, Trash2, MoreVertical } from 'lucide-react';

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
        // Sắp xếp chat mới nhất lên đầu
        const sortedChats = (data.chats || []).sort((a: ChatHistoryItem, b: ChatHistoryItem) => 
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        );
        setChats(sortedChats);
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
            <div key={i} className="h-20 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-center">
        <p className="text-red-500 text-lg">{error}</p>
        <button
          onClick={fetchChatHistory}
          className="mt-2 px-4 py-2 bg-orange-primary text-white-primary rounded-lg hover:bg-orange-primary/90 transition-colors"
        >
          Thử lại
        </button>
      </div>
    );
  }

  if (chats.length === 0) {
    return (
      <div className="p-6 text-center">
        <div className="text-brown-primary/60 dark:text-dark-text-secondary">
          <MessageSquare className="w-12 h-12 mx-auto mb-3 text-orange-primary/50" />
          <p className="text-sm font-medium">Chưa có cuộc trò chuyện nào</p>
          <p className="text-xs mt-2">Bắt đầu cuộc trò chuyện mới để xem lịch sử ở đây</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-3">
      <div className="space-y-2">
        {chats.map((chat) => (
          <div
            key={chat._id}
            className={`group relative p-4 rounded-xl cursor-pointer transition-all duration-300 border-2 ${
              currentChatId === chat._id
                ? 'bg-gradient-to-r from-orange-primary/10 to-green-primary/10 border-orange-primary/30 dark:border-orange-primary/50 shadow-lg'
                : 'bg-white-primary dark:bg-dark-card border-gray-200 dark:border-gray-700 hover:border-orange-primary/30 dark:hover:border-orange-primary/30 hover:shadow-md'
            }`}
            onClick={() => onSelectChat(chat)}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <MessageSquare className={`w-4 h-4 ${
                    currentChatId === chat._id 
                      ? 'text-orange-primary' 
                      : 'text-brown-primary/60 dark:text-dark-text-secondary'
                  }`} />
                  <h3 className={`text-lg font-semibold truncate ${
                    currentChatId === chat._id
                      ? 'text-orange-primary dark:text-orange-primary'
                      : 'text-brown-primary dark:text-dark-text'
                  }`}>
                    {chat.title || 'Cuộc trò chuyện mới'}
                  </h3>
                </div>
                
                <div className="flex items-center gap-2 text-xs text-brown-primary/60 dark:text-dark-text-secondary">
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-orange-primary/60"></span>
                    {chat.messages.length} tin nhắn
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {formatDate(chat.updatedAt)}
                  </span>
                </div>
              </div>
              
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  deleteChat(chat._id);
                }}
                className="opacity-0 group-hover:opacity-100 ml-2 p-2 text-brown-primary/40 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200 rounded-lg"
                title="Xóa cuộc trò chuyện"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ChatHistory; 