// components/MessageBubble.js
import React from 'react';
import { useSession } from 'next-auth/react';
import { motion } from 'framer-motion';
import { User, Bot } from 'lucide-react';
import FoodRecommendations from './FoodRecommendations';
import Avatar from '@/components/ui/avatar';

interface Food {
  name: string;
  id: string;
  description?: string | null;
  category: string;
  cook_method: string;
  diet: string;
  bmi_category: string;
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
}

interface MessageBubbleProps {
  message: string;
  isUser: boolean;
  onSelectFood?: (food: string) => void;
  foods?: Food[]; // Thêm foods array
  user_info?: any;
  selected_cooking_methods?: string[];
}

const MessageBubble = ({ message, isUser, onSelectFood, foods, user_info, selected_cooking_methods }: MessageBubbleProps) => {
  const { data: session } = useSession();

  const getUserAvatar = () => {
    if (isUser && session?.user) {
      return (
        <Avatar 
          src={session.user.image}
          alt={session.user.name || 'User'}
          size="md"
          className="border-2 border-orange-primary/30 shadow-lg"
        />
      );
    }
    return '';
  };

  // Check if message contains food recommendations - dựa vào foods array
  const hasFoodRecommendations = foods && foods.length > 0;

  // Get display message - show AI message if there are food recommendations
  const getDisplayMessage = () => {
    if (hasFoodRecommendations) {
      return message; // Hiển thị message từ AI thay vì text cứng
    }
    return message;
  };

  return (
    <motion.div 
      className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-6`}
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ 
        duration: 0.3,
        ease: "easeOut"
      }}
    >
      <div className={`flex ${isUser ? 'flex-row-reverse' : 'flex-row'} items-end gap-2 max-w-4xl lg:max-w-5xl xl:max-w-6xl`}>
        {/* Avatar */}
        <motion.div 
          className={`w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold ${
            isUser 
              ? '' 
              : ''
          }`}
          whileHover={{ scale: 1.1 }}
          transition={{ duration: 0.2 }}
        >
          {isUser ? getUserAvatar() : "" }
          {/* <Bot className="w-6 h-6" />} */}
        </motion.div>
        
        {/* Message bubble */}
        <motion.div
          className={`px-6 py-4 backdrop-blur-sm ${
            isUser
              ? 'bg-gradient-to-br from-orange-primary/10 to-green-primary/10 dark:from-orange-primary/20 dark:to-green-primary/20 border border-orange-primary/20 dark:border-orange-primary/10 rounded-2xl rounded-bl-md shadow-lg max-w-sm lg:max-w-md'
              : 'bg-gradient-to-br from-white-primary/80 to-cream-primary/60 dark:from-dark-card/80 dark:to-dark-bg/60 border border-orange-primary/20 dark:border-orange-primary/10 rounded-2xl rounded-br-md shadow-lg text-brown-primary dark:text-dark-text max-w-2xl lg:max-w-3xl'
          } transition-all duration-300 hover:shadow-xl hover:scale-105`}
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.2 }}
        >
          <p className="text-lg whitespace-pre-wrap break-words font-medium leading-relaxed">
            {getDisplayMessage()}
          </p>
          
          {/* Food Recommendations */}
          {!isUser && hasFoodRecommendations && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              transition={{ delay: 0.2, duration: 0.3 }}
              className="mt-4"
            >
              <FoodRecommendations 
                message={message} 
                onSelectFood={onSelectFood}
                foods={foods}
                user_info={user_info}
                selected_cooking_methods={selected_cooking_methods}
              />
            </motion.div>
          )}
        </motion.div>
        
        {/* Time indicator */}
        <div className={`text-xs text-brown-primary/60 dark:text-dark-text-secondary ${isUser ? 'text-right' : 'text-left'} opacity-80 flex-shrink-0 min-w-[60px]`}>
          {new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
    </motion.div>
  );
};

export default MessageBubble;