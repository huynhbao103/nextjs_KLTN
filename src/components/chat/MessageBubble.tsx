// components/MessageBubble.js
import React from 'react';
import { useSession } from 'next-auth/react';

const MessageBubble = ({ message, isUser }: { message: string, isUser: boolean }) => {
  const { data: session } = useSession();

  const getUserAvatar = () => {
    if (isUser && session?.user) {
      // Nếu có avatar image thì hiển thị
      if (session.user.image) {
        return (
          <img 
            src={session.user.image} 
            alt={session.user.name || 'User'} 
            className="w-8 h-8 rounded-full object-cover"
          />
        );
      }
      // Nếu không có image thì hiển thị chữ cái đầu
      return session.user.name?.[0] || session.user.email?.[0] || 'U';
    }
    return 'AI';
  };

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} animate-in fade-in-0 slide-in-from-bottom-2 duration-300`}>
      <div className={`flex ${isUser ? 'flex-row-reverse' : 'flex-row'} items-end gap-2 max-w-xs lg:max-w-md xl:max-w-lg`}>
        {/* Avatar */}
        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0 ${
          isUser 
            ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg' 
            : 'bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-600 dark:to-gray-700 text-gray-700 dark:text-gray-300 shadow-md'
        }`}>
          {getUserAvatar()}
        </div>
        
        {/* Message bubble */}
        <div
          className={`px-4 py-3 rounded-2xl shadow-lg backdrop-blur-sm border ${
            isUser
              ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white border-blue-400 rounded-br-md'
              : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 border-gray-200 dark:border-gray-700 rounded-bl-md'
          } transition-all duration-200 hover:shadow-xl`}
        >
          <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">{message}</p>
        </div>
        
        {/* Time indicator */}
        <div className={`text-xs text-gray-500 dark:text-gray-400 ${isUser ? 'text-right' : 'text-left'} opacity-60`}>
          {new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;