"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, Plus, Trash2 } from 'lucide-react';

interface Dish {
  _id?: string;
  neo4j_id?: string;
  name: string;
  ingredients: string[];
  instructions?: string[];
  source?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface DishModalProps {
  isOpen: boolean;
  onClose: () => void;
  dish?: Dish | null;
  onSave: (dish: Dish) => void;
  ingredients: string[];
  isViewMode?: boolean;
}

export default function DishModal({ isOpen, onClose, dish, onSave, ingredients, isViewMode = false }: DishModalProps) {
  const [formData, setFormData] = useState<Dish>({
    name: '',
    ingredients: [],
    instructions: [''],
    source: 'manual'
  });
  const [newIngredient, setNewIngredient] = useState('');
  const [newInstruction, setNewInstruction] = useState('');

  useEffect(() => {
    if (dish) {
      setFormData({
        ...dish,
        instructions: dish.instructions?.length ? dish.instructions : ['']
      });
    } else {
      setFormData({
        name: '',
        ingredients: [],
        instructions: [''],
        source: 'manual'
      });
    }
  }, [dish]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanInstructions = formData.instructions?.filter(instruction => instruction.trim()) || [];
    onSave({
      ...formData,
      instructions: cleanInstructions
    });
  };

  const addIngredient = () => {
    if (newIngredient.trim() && !formData.ingredients.includes(newIngredient.trim())) {
      setFormData(prev => ({
        ...prev,
        ingredients: [...prev.ingredients, newIngredient.trim()]
      }));
      setNewIngredient('');
    }
  };

  const removeIngredient = (index: number) => {
    setFormData(prev => ({
      ...prev,
      ingredients: prev.ingredients.filter((_, i) => i !== index)
    }));
  };

  const addInstruction = () => {
    setFormData(prev => ({
      ...prev,
      instructions: [...(prev.instructions || []), '']
    }));
  };

  const updateInstruction = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      instructions: prev.instructions?.map((instruction, i) => 
        i === index ? value : instruction
      ) || []
    }));
  };

  const removeInstruction = (index: number) => {
    setFormData(prev => ({
      ...prev,
      instructions: prev.instructions?.filter((_, i) => i !== index) || []
    }));
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
            className="bg-white-primary dark:bg-dark-card rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                                 <h2 className="text-2xl font-bold text-brown-primary dark:text-dark-text">
                   {isViewMode ? 'Chi tiết món ăn' : dish ? 'Chỉnh sửa món ăn' : 'Thêm món ăn mới'}
                 </h2>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-brown-primary/10 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Tên món ăn */}
                <div>
                  <label className="block text-sm font-medium text-brown-primary dark:text-dark-text mb-2">
                    Tên món ăn *
                  </label>
                                     <input
                     type="text"
                     value={formData.name}
                     onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                     className="w-full px-3 py-2 border border-brown-primary/20 rounded-lg bg-white-primary dark:bg-dark-card text-brown-primary dark:text-dark-text focus:outline-none focus:ring-2 focus:ring-orange-primary"
                     required
                     disabled={isViewMode}
                   />
                </div>

                {/* Nguồn dữ liệu */}
                <div>
                  <label className="block text-sm font-medium text-brown-primary dark:text-dark-text mb-2">
                    Nguồn dữ liệu
                  </label>
                                     <input
                     type="text"
                     value={formData.source}
                     onChange={(e) => setFormData(prev => ({ ...prev, source: e.target.value }))}
                     className="w-full px-3 py-2 border border-brown-primary/20 rounded-lg bg-white-primary dark:bg-dark-card text-brown-primary dark:text-dark-text focus:outline-none focus:ring-2 focus:ring-orange-primary"
                     disabled={isViewMode}
                   />
                </div>

                {/* Nguyên liệu */}
                <div>
                  <label className="block text-sm font-medium text-brown-primary dark:text-dark-text mb-2">
                    Nguyên liệu *
                  </label>
                  <div className="space-y-2">
                    {formData.ingredients.map((ingredient, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <span className="flex-1 px-3 py-2 bg-brown-primary/5 rounded-lg text-brown-primary dark:text-dark-text">
                          {ingredient}
                        </span>
                                                 {!isViewMode && (
                           <button
                             type="button"
                             onClick={() => removeIngredient(index)}
                             className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                           >
                             <Trash2 className="w-4 h-4" />
                           </button>
                         )}
                      </div>
                    ))}
                                         {!isViewMode && (
                       <div className="flex gap-2">
                         <input
                           type="text"
                           value={newIngredient}
                           onChange={(e) => setNewIngredient(e.target.value)}
                           placeholder="Thêm nguyên liệu..."
                           className="flex-1 px-3 py-2 border border-brown-primary/20 rounded-lg bg-white-primary dark:bg-dark-card text-brown-primary dark:text-dark-text focus:outline-none focus:ring-2 focus:ring-orange-primary"
                           onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addIngredient())}
                         />
                         <button
                           type="button"
                           onClick={addIngredient}
                           className="px-4 py-2 bg-orange-primary text-white-primary rounded-lg hover:bg-orange-primary/90 transition-colors"
                         >
                           <Plus className="w-4 h-4" />
                         </button>
                       </div>
                     )}
                  </div>
                </div>

                {/* Hướng dẫn */}
                <div>
                  <label className="block text-sm font-medium text-brown-primary dark:text-dark-text mb-2">
                    Hướng dẫn nấu
                  </label>
                  <div className="space-y-2">
                    {formData.instructions?.map((instruction, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <span className="text-sm text-brown-primary/60 dark:text-dark-text-secondary w-6">
                          {index + 1}.
                        </span>
                                                 <input
                           type="text"
                           value={instruction}
                           onChange={(e) => updateInstruction(index, e.target.value)}
                           className="flex-1 px-3 py-2 border border-brown-primary/20 rounded-lg bg-white-primary dark:bg-dark-card text-brown-primary dark:text-dark-text focus:outline-none focus:ring-2 focus:ring-orange-primary"
                           disabled={isViewMode}
                         />
                         {!isViewMode && (
                           <button
                             type="button"
                             onClick={() => removeInstruction(index)}
                             className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                           >
                             <Trash2 className="w-4 h-4" />
                           </button>
                         )}
                      </div>
                    ))}
                                         {!isViewMode && (
                       <button
                         type="button"
                         onClick={addInstruction}
                         className="flex items-center gap-2 text-orange-primary hover:text-orange-primary/80 transition-colors"
                       >
                         <Plus className="w-4 h-4" />
                         Thêm bước
                       </button>
                     )}
                  </div>
                </div>

                                 {/* Buttons */}
                 <div className="flex justify-end gap-3 pt-4 border-t border-brown-primary/20">
                   <button
                     type="button"
                     onClick={onClose}
                     className="px-6 py-2 text-brown-primary dark:text-dark-text hover:bg-brown-primary/10 rounded-lg transition-colors"
                   >
                     {isViewMode ? 'Đóng' : 'Hủy'}
                   </button>
                   {!isViewMode && (
                     <button
                       type="submit"
                       className="px-6 py-2 bg-orange-primary text-white-primary rounded-lg hover:bg-orange-primary/90 transition-colors flex items-center gap-2"
                     >
                       <Save className="w-4 h-4" />
                       {dish ? 'Cập nhật' : 'Thêm món ăn'}
                     </button>
                   )}
                 </div>
              </form>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
} 