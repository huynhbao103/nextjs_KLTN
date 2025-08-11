"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, Plus, Trash2, ChevronUp, ChevronDown } from 'lucide-react';

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
  const [bulkIngredients, setBulkIngredients] = useState('');
  const [editingIngredientIndex, setEditingIngredientIndex] = useState<number | null>(null);
  const [editingIngredientValue, setEditingIngredientValue] = useState('');
  // Bulk instructions input
  const [bulkInstructions, setBulkInstructions] = useState('');

  // Move instruction up/down
  const moveInstruction = (fromIndex: number, toIndex: number) => {
    const currentInstructions = formData.instructions || [];
    if (toIndex < 0 || toIndex >= currentInstructions.length) return;

    const newInstructions = [...currentInstructions];
    const [moved] = newInstructions.splice(fromIndex, 1);
    newInstructions.splice(toIndex, 0, moved);

    setFormData(prev => ({ ...prev, instructions: newInstructions }));
  };

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

  const startEditIngredient = (index: number, value: string) => {
    setEditingIngredientIndex(index);
    setEditingIngredientValue(value);
  };

  const saveEditIngredient = (index: number) => {
    if (editingIngredientValue.trim()) {
      setFormData(prev => ({
        ...prev,
        ingredients: prev.ingredients.map((ingredient, i) => 
          i === index ? editingIngredientValue.trim() : ingredient
        )
      }));
    }
    setEditingIngredientIndex(null);
    setEditingIngredientValue('');
  };

  const cancelEditIngredient = () => {
    setEditingIngredientIndex(null);
    setEditingIngredientValue('');
  };

  const addBulkIngredients = () => {
    if (bulkIngredients.trim()) {
      // Tách theo cả dấu phẩy và xuống dòng
      const ingredientsList = bulkIngredients
        .split(/[,\.\n]/) // Tách theo dấu phẩy, chấm hoặc xuống dòng
        .map(ingredient => ingredient.trim())
        .filter(ingredient => ingredient && !formData.ingredients.includes(ingredient));
      
      if (ingredientsList.length > 0) {
        setFormData(prev => ({
          ...prev,
          ingredients: [...prev.ingredients, ...ingredientsList]
        }));
        setBulkIngredients('');
      }
    }
  };

  const moveIngredient = (fromIndex: number, toIndex: number) => {
    const newIngredients = [...formData.ingredients];
    const [movedIngredient] = newIngredients.splice(fromIndex, 1);
    newIngredients.splice(toIndex, 0, movedIngredient);
    setFormData(prev => ({ ...prev, ingredients: newIngredients }));
  };

  // Bulk add instructions
  const addBulkInstructions = () => {
    if (bulkInstructions.trim()) {
      const instructionsList = bulkInstructions
        .split(/[,\.\n]/)
        .map(item => item.trim())
        .filter(item => item);

      if (instructionsList.length > 0) {
        setFormData(prev => ({
          ...prev,
          instructions: [...(prev.instructions || []), ...instructionsList]
        }));
        setBulkInstructions('');
      }
    }
  };

  const clearInstructions = () => {
    setFormData(prev => ({ ...prev, instructions: [] }));
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

                {/* Nguồn dữ liệu - ẩn */}
                <div className="hidden" />

                {/* Nguyên liệu */}
                <div>
                  <label className="block text-sm font-medium text-brown-primary dark:text-dark-text mb-2">
                    Nguyên liệu * ({formData.ingredients.length})
                  </label>
                  
                  {/* Bulk Add */}
                  {!isViewMode && (
                    <div className="mb-4 p-3 bg-orange-primary/5 rounded-lg border border-orange-primary/20">
                                             <label className="block text-sm font-medium text-orange-primary mb-2">
                         Thêm nhiều nguyên liệu cùng lúc (mỗi dòng một nguyên liệu hoặc phân cách bằng dấu phẩy)
                       </label>
                                             <div className="flex gap-2">
                         <textarea
                           value={bulkIngredients}
                           onChange={(e) => setBulkIngredients(e.target.value)}
                           placeholder="Ví dụ:&#10;thịt bò&#10;hành tây&#10;cà chua&#10;dầu ăn"
                           rows={4}
                           className="flex-1 px-3 py-2 border border-orange-primary/20 rounded-lg bg-white-primary dark:bg-dark-card text-orange-primary focus:outline-none focus:ring-2 focus:ring-orange-primary resize-none"
                                                      onKeyDown={(e) => {
                             if (e.key === 'Enter' && e.ctrlKey) {
                               e.preventDefault();
                               addBulkIngredients();
                             }
                           }}
                         />
                         <button
                           type="button"
                           onClick={addBulkIngredients}
                           className="px-4 py-2 bg-orange-primary text-white-primary rounded-lg hover:bg-orange-primary/90 transition-colors"
                         >
                           Thêm
                         </button>
                       </div>
                       <p className="text-xs text-orange-primary/70 mt-2">
                         💡 Mỗi dòng một nguyên liệu, hoặc dùng Ctrl+Enter để thêm nhanh
                       </p>
                    </div>
                  )}

                  {/* Ingredients List */}
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {formData.ingredients.map((ingredient, index) => (
                      <div key={index} className="flex items-center gap-2 group">
                        {/* Drag Handle */}
                        {!isViewMode && (
                          <div className="text-brown-primary/40 hover:text-brown-primary/60 cursor-move">
                            ⋮⋮
                          </div>
                        )}
                        
                        {/* Ingredient Display/Edit */}
                        {editingIngredientIndex === index ? (
                          <div className="flex-1 flex gap-2">
                            <input
                              type="text"
                              value={editingIngredientValue}
                              onChange={(e) => setEditingIngredientValue(e.target.value)}
                              className="flex-1 px-3 py-2 border border-orange-primary/30 rounded-lg bg-white-primary dark:bg-dark-card text-brown-primary dark:text-dark-text focus:outline-none focus:ring-2 focus:ring-orange-primary"
                              onKeyPress={(e) => e.key === 'Enter' && saveEditIngredient(index)}
                              autoFocus
                            />
                            <button
                              type="button"
                              onClick={() => saveEditIngredient(index)}
                              className="px-3 py-2 bg-green-500 text-white-primary rounded-lg hover:bg-green-600 transition-colors"
                            >
                              ✓
                            </button>
                            <button
                              type="button"
                              onClick={cancelEditIngredient}
                              className="px-3 py-2 bg-gray-500 text-white-primary rounded-lg hover:bg-gray-600 transition-colors"
                            >
                              ✕
                            </button>
                          </div>
                        ) : (
                          <span
                            className="flex-1 px-3 py-2 bg-brown-primary/5 rounded-lg text-brown-primary dark:text-dark-text cursor-pointer hover:bg-brown-primary/10 transition-colors"
                            onDoubleClick={() => startEditIngredient(index, ingredient)}
                          >
                            {ingredient}
                          </span>
                        )}
                        
                        {/* Action Buttons */}
                        {!isViewMode && (
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              type="button"
                              onClick={() => moveIngredient(index, index - 1)}
                              className="p-2 text-gray-500 hover:bg-gray-500/10 rounded-lg transition-colors"
                              title="Di chuyển lên"
                              disabled={index === 0}
                            >
                              <ChevronUp className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => moveIngredient(index, index + 1)}
                              className="p-2 text-gray-500 hover:bg-gray-500/10 rounded-lg transition-colors"
                              title="Di chuyển xuống"
                              disabled={index === formData.ingredients.length - 1}
                            >
                              <ChevronDown className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => startEditIngredient(index, ingredient)}
                              className="p-2 text-blue-500 hover:bg-blue-500/10 rounded-lg transition-colors"
                              title="Sửa"
                            >
                              ✏️
                            </button>
                            <button
                              type="button"
                              onClick={() => removeIngredient(index)}
                              className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                              title="Xóa"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Single Add */}
                  {!isViewMode && (
                    <div className="mt-3 flex gap-2">
                      <input
                        type="text"
                        value={newIngredient}
                        onChange={(e) => setNewIngredient(e.target.value)}
                        placeholder="Thêm nguyên liệu đơn lẻ..."
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

                  {/* Quick Actions */}
                  {!isViewMode && formData.ingredients.length > 0 && (
                    <div className="mt-3 flex gap-2 text-sm">
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, ingredients: [] }))}
                        className="text-red-500 hover:text-red-600 transition-colors"
                      >
                        Xóa tất cả
                      </button>
                      <span className="text-brown-primary/50">|</span>
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, ingredients: [...prev.ingredients].sort() }))}
                        className="text-blue-500 hover:text-blue-600 transition-colors"
                      >
                        Sắp xếp A-Z
                      </button>
                    </div>
                  )}
                </div>

                {/* Hướng dẫn */}
                <div>
                  <label className="block text-sm font-medium text-brown-primary dark:text-dark-text mb-2">
                    Hướng dẫn nấu
                  </label>
                  {/* Bulk add instructions */}
                  {!isViewMode && (
                    <div className="mb-4 p-3 bg-blue-500/5 rounded-lg border border-blue-500/20">
                      <label className="block text-sm font-medium text-blue-500 mb-2">
                        Thêm nhiều bước cùng lúc (mỗi dòng hoặc dấu phẩy)
                      </label>
                      <div className="flex gap-2">
                        <textarea
                          value={bulkInstructions}
                          onChange={(e) => setBulkInstructions(e.target.value)}
                          placeholder="Ví dụ:&#10;Ướp thịt 10 phút&#10;Xào hành, tỏi cho thơm&#10;Cho thịt vào đảo đều"
                          rows={4}
                          className="flex-1 px-3 py-2 border border-blue-500/20 rounded-lg bg-white-primary dark:bg-dark-card text-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && e.ctrlKey) {
                              e.preventDefault();
                              addBulkInstructions();
                            }
                          }}
                        />
                        <button
                          type="button"
                          onClick={addBulkInstructions}
                          className="px-4 py-2 bg-blue-500 text-white-primary rounded-lg hover:bg-blue-600 transition-colors"
                        >
                          Thêm
                        </button>
                      </div>
                      <p className="text-xs text-blue-500/70 mt-2">💡 Ctrl+Enter để thêm nhanh</p>
                    </div>
                  )}
                  <div className="space-y-2">
                    {formData.instructions?.map((instruction, index) => (
                      <div key={index} className="flex items-center gap-2 group">
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
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              type="button"
                              onClick={() => moveInstruction(index, index - 1)}
                              className="p-2 text-gray-500 hover:bg-gray-500/10 rounded-lg transition-colors"
                              title="Di chuyển lên"
                              disabled={index === 0}
                            >
                              <ChevronUp className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => moveInstruction(index, index + 1)}
                              className="p-2 text-gray-500 hover:bg-gray-500/10 rounded-lg transition-colors"
                              title="Di chuyển xuống"
                              disabled={index === (formData.instructions?.length || 0) - 1}
                            >
                              <ChevronDown className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => removeInstruction(index)}
                              className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                              title="Xóa"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
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
                  {/* quick actions */}
                  {!isViewMode && formData.instructions && formData.instructions.length > 0 && (
                    <div className="mt-3 flex gap-2 text-sm">
                      <button
                        type="button"
                        onClick={clearInstructions}
                        className="text-red-500 hover:text-red-600 transition-colors"
                      >
                        Xóa tất cả bước
                      </button>
                    </div>
                  )}
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