import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChefHat } from 'lucide-react';

interface Dish {
  id: string;
  neo4j_id: string;
  name: string;
  ingredients: string[];
  instructions: string[];
  source: string;
  image?: string;
}

interface DishDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  dish: Dish | null;
}

const DishDetailModal: React.FC<DishDetailModalProps> = ({ isOpen, onClose, dish }) => {
  if (!dish) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.97, opacity: 0, y: 24 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.97, opacity: 0, y: 24 }}
            transition={{ type: 'spring', damping: 22, stiffness: 320 }}
            className="bg-white dark:bg-neutral-900 rounded-2xl shadow-xl max-w-2xl w-full mx-2 p-0 flex flex-col relative"
            onClick={e => e.stopPropagation()}
          >
            {/* Nút đóng */}
            <button
              onClick={onClose}
              className="absolute top-3 right-3 text-gray-400 hover:text-red-400 p-2 rounded-full"
              aria-label="Đóng"
            >
              <X className="w-6 h-6" />
            </button>
            {/* Header */}
            <div className="pt-8 pb-4 px-6 text-center">
              <h2 className="text-2xl font-bold flex items-center justify-center gap-2 text-neutral-900 dark:text-white">
                <ChefHat className="w-7 h-7 text-orange-400 dark:text-orange-300" />
                {dish.name}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Công thức chi tiết</p>
            </div>
            {/* Nội dung */}
            <div className="px-6 pb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Nguyên liệu */}
                <div>
                  <h3 className="font-semibold text-neutral-800 dark:text-white mb-2">Nguyên liệu</h3>
                  <ul className="space-y-2">
                    {dish.ingredients.map((ingredient, idx) => (
                      <li key={idx} className="text-sm text-neutral-700 dark:text-gray-200 border-b border-gray-100 dark:border-neutral-800 last:border-0 py-1">
                        {ingredient}
                      </li>
                    ))}
                  </ul>
                </div>
                {/* Hướng dẫn */}
                <div>
                  <h3 className="font-semibold text-neutral-800 dark:text-white mb-2">Hướng dẫn</h3>
                  <ol className="space-y-2 list-decimal list-inside">
                    {dish.instructions.map((step, idx) => (
                      <li key={idx} className="text-sm text-neutral-700 dark:text-gray-200 border-b border-gray-100 dark:border-neutral-800 last:border-0 py-1">
                        {step}
                      </li>
                    ))}
                  </ol>
                </div>
              </div>
            </div>
            {/* Footer */}
            <div className="px-6 pb-4 pt-2 text-xs text-gray-400 dark:text-gray-500 text-center border-t border-gray-100 dark:border-neutral-800">
              ID: {dish.neo4j_id} &nbsp; | &nbsp; Nguồn: {dish.source}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default DishDetailModal; 