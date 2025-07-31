import React, { useState } from 'react';
import { useSession } from 'next-auth/react';
import ChatHistory from './ChatHistory';
import { Plus, X, MessageSquare, User } from 'lucide-react';

interface ChatHistoryItem {
  _id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  sessionId?: string;
  messages: Array<{
    id: number;
    text: string;
    isUser: boolean;
    timestamp: string;
  }>;
}

interface ChatSidebarProps {
  onSelectChat: (chat: ChatHistoryItem) => void;
  onNewChat: () => void;
  currentChatId?: string;
  isOpen: boolean;
  onClose: () => void;
}

const ChatSidebar: React.FC<ChatSidebarProps> = ({
  onSelectChat,
  onNewChat,
  currentChatId,
  isOpen,
  onClose
}) => {
  const { data: session } = useSession();

  if (!session?.user) {
    return null;
  }

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 lg:hidden z-40 backdrop-blur-sm"
          onClick={onClose}
        />
      )}

      {/* Sidebar - Fixed on both desktop and mobile */}
      <div
        className={`fixed top-24 left-0 z-50 w-80 h-[calc(100vh-6rem)] bg-white-primary dark:bg-dark-card border-r border-gray-200 dark:border-gray-700 shadow-xl transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-orange-primary/5 to-green-primary/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-8 rounded-lg bg-gradient-to-br from-orange-primary  to-orange-600 flex items-center justify-center">
              <MessageSquare className="w-4 h-4 text-white-primary" />
            </div>
            <h2 className="text-lg font-bold text-brown-primary dark:text-dark-text">
              Lịch sử gợi ý
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onNewChat}
              className="p-2 text-brown-primary/60 hover:text-orange-primary dark:text-dark-text-secondary dark:hover:text-orange-primary transition-colors rounded-lg hover:bg-orange-primary/10"
              title="Cuộc trò chuyện mới"
            >
              <Plus className="w-5 h-5" />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-brown-primary/60 hover:text-brown-primary dark:text-dark-text-secondary dark:hover:text-dark-text transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 lg:hidden"
              title="Đóng"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* User info */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-cream-primary/30 to-white-primary/30 dark:from-dark-bg/30 dark:to-dark-card/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-primary to-green-primary rounded-full flex items-center justify-center text-white-primary font-bold shadow-lg">
              {session.user.image ? (
                <img 
                  src={session.user.image} 
                  alt={session.user.name || 'User'} 
                  className="w-10 h-10 rounded-full object-cover border-2 border-white-primary"
                />
              ) : (
                <User className="w-5 h-5" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-lg font-semibold text-brown-primary dark:text-dark-text truncate">
                {session.user.name || 'Người dùng'}
              </p>
              <p className="text-xs text-brown-primary/60 dark:text-dark-text-secondary truncate">
                {session.user.email}
              </p>
            </div>
          </div>
        </div>

        {/* Chat history */}
        <div className="flex-1 overflow-y-auto h-[calc(100vh-280px)] scrollbar-thin scrollbar-thumb-orange-primary/30 scrollbar-track-transparent hover:scrollbar-thumb-orange-primary/50">
          <ChatHistory
            onSelectChat={onSelectChat}
            currentChatId={currentChatId}
          />
        </div>
        
        {/* Footer */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gradient-to-r from-cream-primary/20 to-white-primary/20 dark:from-dark-bg/20 dark:to-dark-card/20">
          <div className="text-center">
            <p className="text-xs text-brown-primary/50 dark:text-dark-text-secondary">
              💡 Bạn có thể xóa cuộc trò chuyện bằng cách hover và click vào icon thùng rác
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default ChatSidebar; 