import React, { useState } from 'react';
import { useSession } from 'next-auth/react';
import ChatHistory from './ChatHistory';

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
          className="fixed inset-0 bg-black bg-opacity-50 lg:hidden z-40"
          onClick={onClose}
        />
      )}

      {/* Sidebar - Fixed on both desktop and mobile */}
      <div
        className={`fixed top-24 left-0 z-50 w-80 h-[calc(100vh-6rem)] bg-white dark:bg-dark-card border-r border-gray-200 dark:border-gray-700 transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Lịch sử chat
          </h2>
          <div className="flex items-center gap-2">
            <button
              onClick={onNewChat}
              className="p-2 text-gray-500 hover:text-blue-500 dark:text-gray-400 dark:hover:text-blue-400 transition-colors"
              title="Cuộc trò chuyện mới"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors lg:hidden"
              title="Đóng"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* User info */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-medium">
              {session.user.name?.[0] || session.user.email?.[0] || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                {session.user.name || 'Người dùng'}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                {session.user.email}
              </p>
            </div>
          </div>
        </div>

        {/* Chat history */}
        <div className="flex-1 overflow-y-auto h-[calc(100vh-200px)]">
          <ChatHistory
            onSelectChat={onSelectChat}
            currentChatId={currentChatId}
          />
        </div>
      </div>
    </>
  );
};

export default ChatSidebar; 