"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

interface Ingredient {
  _id?: string;
  id?: number;
  name: string;
  createdAt?: string;
  updatedAt?: string;
}

interface IngredientModalProps {
  isOpen: boolean;
  onClose: () => void;
  ingredient?: Ingredient | null;
  onSave: (ingredient: Ingredient) => void;
  isViewMode?: boolean;
}

export default function IngredientModal({ isOpen, onClose, ingredient, onSave, isViewMode = false }: IngredientModalProps) {
  const [formData, setFormData] = useState<Ingredient>({
    name: ''
  });

  useEffect(() => {
    if (ingredient) {
      setFormData({
        ...ingredient
      });
    } else {
      setFormData({
        name: ''
      });
    }
  }, [ingredient]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white-primary dark:bg-dark-card rounded-xl shadow-xl max-w-md w-full"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-brown-primary dark:text-dark-text">
                  {isViewMode ? 'Chi tiết nguyên liệu' : ingredient ? 'Chỉnh sửa nguyên liệu' : 'Thêm nguyên liệu mới'}
                </h2>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-brown-primary/10 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Tên nguyên liệu */}
                <div>
                  <label className="block text-sm font-medium text-brown-primary dark:text-dark-text mb-2">
                    Tên nguyên liệu *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    disabled={isViewMode}
                    className="w-full px-4 py-3 border border-brown-primary/20 rounded-lg bg-white-primary dark:bg-dark-card text-brown-primary dark:text-dark-text placeholder-brown-primary/50 focus:outline-none focus:ring-2 focus:ring-orange-primary focus:border-transparent disabled:opacity-50"
                    placeholder="Nhập tên nguyên liệu..."
                    required
                  />
                </div>

                {/* Buttons */}
                <div className="flex gap-3 pt-4">
                  {!isViewMode && (
                    <button
                      type="submit"
                      className="flex-1 bg-orange-primary hover:bg-orange-primary/90 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
                    >
                      {ingredient ? 'Cập nhật' : 'Thêm mới'}
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 bg-brown-primary/10 hover:bg-brown-primary/20 text-brown-primary font-semibold py-3 px-6 rounded-lg transition-colors"
                  >
                    {isViewMode ? 'Đóng' : 'Hủy'}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
} 