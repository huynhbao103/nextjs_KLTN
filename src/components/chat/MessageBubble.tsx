// components/MessageBubble.js
import React from 'react';
import { useSession } from 'next-auth/react';
import FoodRecommendations from './FoodRecommendations';

interface MessageBubbleProps {
  message: string;
  isUser: boolean;
  onSelectFood?: (food: string) => void;
}

const MessageBubble = ({ message, isUser, onSelectFood }: MessageBubbleProps) => {
  const { data: session } = useSession();

  const getUserAvatar = () => {
    if (isUser && session?.user) {
      // Nếu có avatar image thì hiển thị
      if (session.user.image) {
        return (
          <img 
            src={session.user.image} 
            alt={session.user.name || 'User'} 
            className="w-10 h-10 rounded-full object-cover border-2 border-white-primary dark:border-dark-card shadow-lg"
          />
        );
      }
      // Nếu không có image thì hiển thị chữ cái đầu
      return (
        <span className="text-white-primary font-bold">
          {session.user.name?.[0] || session.user.email?.[0] || 'U'}
        </span>
      );
    }
    return '';
  };

  // Check if message contains food recommendations
  const hasFoodRecommendations = message.includes('Danh sách món ăn phù hợp:');

  // Get display message - show short message if there are food recommendations
  const getDisplayMessage = () => {
    if (hasFoodRecommendations) {
      return "Tôi đã tìm thấy những món ăn!";
    }
    return message;
  };

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} animate-in fade-in-0 slide-in-from-bottom-2 duration-300 mb-4`}>
      <div className={`flex ${isUser ? 'flex-row-reverse' : 'flex-row'} items-end gap-3 max-w-3xl lg:max-w-4xl xl:max-w-5xl`}>
        {/* Avatar */}
        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 shadow-lg ${
          isUser 
            ? 'bg-gradient-to-br from-orange-primary to-green-primary text-white-primary' 
            : 'hidden'
        }`}>
          {isUser ? getUserAvatar() : ''}
        </div>
        
        {/* Message bubble */}
        <div
          className={`px-6 py-4 backdrop-blur-sm ${
            isUser
              ? 'bg-white-primary dark:bg-dark-card dark:text-dark-text border border-gray-200 dark:border-gray-700 rounded-2xl rounded-bl-md shadow-lg max-w-sm lg:max-w-md'
              : 'text-brown-primary dark:text-dark-text max-w-2xl lg:max-w-3xl'
          } transition-all duration-200 hover:shadow-xl`}
        >
          <p className="text-lg whitespace-pre-wrap break-words font-medium leading-relaxed">{getDisplayMessage()}</p>
          
          {/* Food Recommendations */}
          {!isUser && hasFoodRecommendations && (
            <FoodRecommendations 
              message={message} 
              onSelectFood={onSelectFood}
            />
          )}
        </div>
        
        {/* Time indicator */}
        <div className={`text-xs text-brown-primary/60 dark:text-dark-text-secondary ${isUser ? 'text-right' : 'text-left'} opacity-80 flex-shrink-0`}>
          {new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;