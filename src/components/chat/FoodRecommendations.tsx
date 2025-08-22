import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ChefHat, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import DishDetailModal from './DishDetailModal';

interface Dish {
  id: string;
  neo4j_id: string;
  name: string;
  ingredients: string[];
  instructions: string[];
  source: string;
}

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

interface FoodRecommendationsProps {
  message: string;
  onSelectFood?: (food: string) => void;
  foods?: Food[]; // Thêm foods array
  user_info?: any;
  selected_cooking_methods?: string[];
}

const FoodRecommendations: React.FC<FoodRecommendationsProps> = ({ message, onSelectFood, foods, user_info, selected_cooking_methods }) => {
  const [currentPage, setCurrentPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [selectedDish, setSelectedDish] = useState<Dish | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Sử dụng foods array trực tiếp thay vì parse message
  const foodList = foods || [];
  const itemsPerPage = 6; // Hiển thị 6 món mỗi lần
  const totalPages = Math.ceil(foodList.length / itemsPerPage);
  
  // Helper: build compact pagination items with ellipses
  const getPaginationItems = () => {
    const items: (number | string)[] = [];
    if (totalPages <= 7) {
      for (let i = 0; i < totalPages; i++) items.push(i);
      return items;
    }
    // Always show first
    items.push(0);
    // Left ellipsis
    if (currentPage > 3) items.push('left-ellipsis');
    // Middle range
    const start = Math.max(1, currentPage - 1);
    const end = Math.min(totalPages - 2, currentPage + 1);
    for (let i = start; i <= end; i++) items.push(i);
    // Right ellipsis
    if (currentPage < totalPages - 4) items.push('right-ellipsis');
    // Always show last
    items.push(totalPages - 1);
    return items;
  };

  // Tính toán món ăn cần hiển thị cho trang hiện tại
  const startIndex = currentPage * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const displayedFoods = foodList.slice(startIndex, endIndex);

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

  // Hàm chuyển trang
  const goToPage = (page: number) => {
    if (page >= 0 && page < totalPages) {
      setCurrentPage(page);
    }
  };

  // Hàm chuyển trang tiếp theo
  const nextPage = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage(currentPage + 1);
    }
  };

  // Hàm chuyển trang trước đó
  const prevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
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
              key={food.id || index}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              onClick={() => handleFoodClick(food.name)}
              disabled={loading}
              className="px-6 py-4 bg-gradient-to-r from-orange-400 via-orange-500 to-red-500 text-white rounded-2xl font-bold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 text-center text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 border-0"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Đang tải...
                </>
              ) : (
                <div className="text-center">
                  <div className="font-bold">{food.name}</div>
                  {food.cook_method && (
                    <div className="text-xs mt-1 opacity-90">
                      {food.cook_method}
                    </div>
                  )}
                </div>
              )}
            </motion.button>
          ))}
        </div>
        
        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-4 mt-6">
            {/* Previous Button */}
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.5 }}
              onClick={prevPage}
              disabled={currentPage === 0}
              className="flex items-center gap-2 px-4 py-2 text-sm text-orange-primary dark:text-orange-primary hover:text-orange-primary/80 dark:hover:text-orange-primary/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
              Trước
            </motion.button>
            
            {/* Page Numbers - compact, no-wrap, horizontal scroll if overflow */}
            <div className="flex max-w-full overflow-x-auto no-scrollbar">
              <div className="flex items-center gap-2 whitespace-nowrap px-2">
                {getPaginationItems().map((item, index) => {
                  if (typeof item === 'string') {
                    return (
                      <span key={`${item}-${index}`} className="px-2 text-sm text-gray-500">…</span>
                    );
                  }
                  const pageIndex = item as number;
                  const isActive = currentPage === pageIndex;
                  return (
                    <motion.button
                      key={pageIndex}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3, delay: 0.6 + index * 0.05 }}
                      onClick={() => goToPage(pageIndex)}
                      className={`px-3 py-2 text-sm rounded-lg transition-all ${
                        isActive
                          ? 'bg-orange-primary text-white shadow-lg'
                          : 'text-orange-primary dark:text-orange-primary hover:bg-orange-100 dark:hover:bg-orange-900/20'
                      }`}
                    >
                      {pageIndex + 1}
                    </motion.button>
                  );
                })}
              </div>
            </div>
            
            {/* Next Button */}
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.5 }}
              onClick={nextPage}
              disabled={currentPage === totalPages - 1}
              className="flex items-center gap-2 px-4 py-2 text-sm text-orange-primary dark:text-orange-primary hover:text-orange-primary/80 dark:hover:text-orange-primary/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Tiếp
              <ChevronRight className="w-4 h-4" />
            </motion.button>
          </div>
        )}
        
        <div className="text-sm text-gray-600 dark:text-gray-400 mt-6 text-center font-medium">
          Trang {currentPage + 1} / {totalPages} • Tổng cộng: <span className="font-bold text-orange-600 dark:text-orange-400">{foodList.length}</span> món ăn
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