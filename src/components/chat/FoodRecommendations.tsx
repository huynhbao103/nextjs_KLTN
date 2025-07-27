import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ChefHat, Plus, Loader2 } from 'lucide-react';
import DishDetailModal from './DishDetailModal';

interface Dish {
  id: string;
  neo4j_id: string;
  name: string;
  ingredients: string[];
  instructions: string[];
  source: string;
}

interface FoodRecommendationsProps {
  message: string;
  onSelectFood?: (food: string) => void;
}

const FoodRecommendations: React.FC<FoodRecommendationsProps> = ({ message, onSelectFood }) => {
  const [showAll, setShowAll] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedDish, setSelectedDish] = useState<Dish | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Parse food list from message
  const parseFoodList = (message: string) => {
    // Extract food items from the message - support multiple formats
    let foodMatch = message.match(/Đây là những món ăn phù hợp với yêu cầu của bạn:\s*(.+?)(?:\s*\|\s*Tổng cộng:|$)/);
    if (!foodMatch) {
      // Fallback to old format
      foodMatch = message.match(/Danh sách món ăn phù hợp:\s*(.+?)(?:\s*\|\s*Tổng cộng:|$)/);
    }
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

  // Hàm xử lý khi bấm vào món ăn
  const handleFoodClick = async (foodName: string) => {
    try {
      setLoading(true);
      
      // Gọi API để lấy thông tin chi tiết món ăn
      const response = await fetch(`/api/dishes/search?name=${encodeURIComponent(foodName)}`);
      
      if (!response.ok) {
        throw new Error('Không thể tìm thấy thông tin món ăn');
      }
      
      const data = await response.json();
      
      if (data.success && data.dish) {
        setSelectedDish(data.dish);
        setIsModalOpen(true);
      } else {
        alert('Không tìm thấy thông tin chi tiết cho món ăn này');
      }
    } catch (error) {
      console.error('Error fetching dish details:', error);
      alert('Có lỗi xảy ra khi tải thông tin món ăn');
    } finally {
      setLoading(false);
    }
  };



  if (foodList.length === 0) {
    return null;
  }

    return (
    <>
      <div className="mt-6 p-6 bg-gradient-to-br from-orange-50 via-yellow-50 to-red-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 rounded-3xl border border-orange-200 dark:border-orange-800 shadow-lg">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-gradient-to-r from-orange-400 to-red-500 rounded-xl shadow-lg">
            <ChefHat className="w-5 h-5 text-white" />
          </div>
          <span className="text-lg font-bold text-gray-800 dark:text-white">Đây là những món ăn phù hợp với bạn:</span>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {displayedFoods.map((food, index) => (
            <motion.button
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              onClick={() => handleFoodClick(food)}
              disabled={loading}
              className="px-6 py-4 bg-gradient-to-r from-orange-400 via-orange-500 to-red-500 text-white rounded-2xl font-bold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 text-center text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 border-0"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Đang tải...
                </>
              ) : (
                food
              )}
            </motion.button>
          ))}
        </div>
        
        {hasMore && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.5 }}
            onClick={() => setShowAll(!showAll)}
            className="flex items-center gap-2 px-4 py-2 text-sm text-orange-primary dark:text-orange-primary hover:text-orange-primary/80 dark:hover:text-orange-primary/80 transition-colors mt-4"
          >
            <Plus className="w-4 h-4" />
            {showAll ? 'Thu gọn' : `Xem thêm ${foodList.length - initialCount} món`}
          </motion.button>
        )}
        
        <div className="text-sm text-gray-600 dark:text-gray-400 mt-6 text-center font-medium">
          Tổng cộng: <span className="font-bold text-orange-600 dark:text-orange-400">{foodList.length}</span> món ăn
        </div>
      </div>

      {/* Dish Detail Modal */}
      <DishDetailModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedDish(null);
        }}
        dish={selectedDish}
      />
    </>
  );
};

export default FoodRecommendations; 