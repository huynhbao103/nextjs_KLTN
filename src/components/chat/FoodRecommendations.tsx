import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ChefHat, Plus } from 'lucide-react';

interface FoodRecommendationsProps {
  message: string;
  onSelectFood?: (food: string) => void;
}

const FoodRecommendations: React.FC<FoodRecommendationsProps> = ({ message, onSelectFood }) => {
  const [showAll, setShowAll] = useState(false);
  
  // Parse food list from message
  const parseFoodList = (message: string) => {
    // Extract food items from the message
    const foodMatch = message.match(/Danh sách món ăn phù hợp:\s*(.+?)(?:\s*\|\s*Tổng cộng:|$)/);
    if (!foodMatch) return [];
    
    const foodText = foodMatch[1];
    // Split by commas and clean up
    const foods = foodText
      .split(',')
      .map(food => food.trim())
      .filter(food => food && !food.includes('... và'))
      .map(food => food.replace(/^\d+\.\s*/, '')); // Remove numbering
    
    return foods;
  };

  const foodList = parseFoodList(message);
  const initialCount = 5;
  const displayedFoods = showAll ? foodList : foodList.slice(0, initialCount);
  const hasMore = foodList.length > initialCount;

  if (foodList.length === 0) {
    return null;
  }

  return (
    <div className="mt-4 space-y-3">
      <div className="flex items-center gap-2 text-sm text-brown-primary/70 dark:text-dark-text-secondary">
        <ChefHat className="w-4 h-4" />
        <span>Đây là những món ăn phù hợp với bạn:</span>
      </div>
      
      <div className="flex flex-wrap gap-2">
        {displayedFoods.map((food, index) => (
          <motion.button
            key={index}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            onClick={() => onSelectFood?.(food)}
            className="px-4 py-2 bg-gradient-to-r from-orange-primary/10 to-green-primary/10 border border-orange-primary/20 dark:border-orange-primary/30 rounded-full text-sm font-medium text-brown-primary dark:text-dark-text hover:from-orange-primary/20 hover:to-green-primary/20 hover:border-orange-primary/40 transition-all duration-200 shadow-sm hover:shadow-md"
          >
            {food}
          </motion.button>
        ))}
      </div>
      
      {hasMore && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.5 }}
          onClick={() => setShowAll(!showAll)}
          className="flex items-center gap-2 px-4 py-2 text-sm text-orange-primary dark:text-orange-primary hover:text-orange-primary/80 dark:hover:text-orange-primary/80 transition-colors"
        >
          <Plus className="w-4 h-4" />
          {showAll ? 'Thu gọn' : `Xem thêm ${foodList.length - initialCount} món`}
        </motion.button>
      )}
      
      <div className="text-xs text-brown-primary/50 dark:text-dark-text-secondary">
        Tổng cộng: {foodList.length} món ăn
      </div>
    </div>
  );
};

export default FoodRecommendations; 