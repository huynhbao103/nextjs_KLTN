'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Utensils, X, Soup, Salad, Flame, Droplets, EggFried, Drumstick, ChefHat, Wheat, Cake, Wind, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface Prompt {
  message?: string;
  options?: string[];
}

interface PreferenceModalProps {
  open: boolean;
  onConfirm: (ingredients: string[], methods: string[], allergies: string[]) => void;
  onCancel: () => void;
  ingredientPrompt?: Prompt; // Added ingredient prompt
  cookingMethodPrompt?: Prompt;
  allergyPrompt?: Prompt;
  defaultMethods?: string[];
  defaultAllergies?: string[];
}

const cookingMethodIcons: Record<string, { icon: JSX.Element; bgColor: string }> = {
  'Gỏi': { icon: <Salad className="w-6 h-6 text-green-600" />, bgColor: 'bg-green-100 dark:bg-green-900/20' },
  'Luộc': { icon: <Droplets className="w-6 h-6 text-blue-500" />, bgColor: 'bg-blue-100 dark:bg-blue-900/20' },
  'Súp': { icon: <Soup className="w-6 h-6 text-orange-500" />, bgColor: 'bg-orange-100 dark:bg-orange-900/20' },
  'Nướng': { icon: <Flame className="w-6 h-6 text-red-500" />, bgColor: 'bg-red-100 dark:bg-red-900/20' },
  'Hấp': { icon: <Wind className="w-6 h-6 text-gray-500" />, bgColor: 'bg-gray-100 dark:bg-gray-900/20' },
  'Chiên': { icon: <EggFried className="w-6 h-6 text-yellow-500" />, bgColor: 'bg-yellow-100 dark:bg-yellow-900/20' },
  'Xào': { icon: <Drumstick className="w-6 h-6 text-amber-600" />, bgColor: 'bg-amber-100 dark:bg-amber-900/20' },
  'Nấu': { icon: <ChefHat className="w-6 h-6 text-purple-600" />, bgColor: 'bg-purple-100 dark:bg-purple-900/20' },
  'Hầm': { icon: <Soup className="w-6 h-6 text-stone-500" />, bgColor: 'bg-stone-100 dark:bg-stone-900/20' },
  'Quay': { icon: <Flame className="w-6 h-6 text-orange-600" />, bgColor: 'bg-orange-100 dark:bg-orange-900/20' },
  'Chè': { icon: <Cake className="w-6 h-6 text-pink-500" />, bgColor: 'bg-pink-100 dark:bg-pink-900/20' },
  'Salad': { icon: <Wheat className="w-6 h-6 text-lime-600" />, bgColor: 'bg-lime-100 dark:bg-lime-900/20' },
  'rim': { icon: <Utensils className="w-6 h-6 text-indigo-500" />, bgColor: 'bg-indigo-100 dark:bg-indigo-900/20' },
  'kho': { icon: <Utensils className="w-6 h-6 text-teal-500" />, bgColor: 'bg-teal-100 dark:bg-teal-900/20' },
  'nướng': { icon: <Flame className="w-6 h-6 text-red-600" />, bgColor: 'bg-red-100 dark:bg-red-900/20' },
  'súp': { icon: <Soup className="w-6 h-6 text-orange-600" />, bgColor: 'bg-orange-100 dark:bg-orange-900/20' },
  'nấu': { icon: <ChefHat className="w-6 h-6 text-purple-600" />, bgColor: 'bg-purple-100 dark:bg-purple-900/20' },
};

export default function PreferenceModal({
  open,
  onConfirm,
  onCancel,
  ingredientPrompt,
  cookingMethodPrompt,
  allergyPrompt,
  defaultMethods,
  defaultAllergies
}: PreferenceModalProps) {
  const [step, setStep] = useState(1);
  const [selectedIngredients, setSelectedIngredients] = useState<string[]>([]);
  const [selectedMethods, setSelectedMethods] = useState<string[]>(defaultMethods || []);
  const [selectedAllergies, setSelectedAllergies] = useState<string[]>(defaultAllergies || []);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (open) {
      setStep(1);
      setSelectedIngredients([]);
      setSelectedMethods(defaultMethods || []);
      setSelectedAllergies(defaultAllergies || []);
      setSearchTerm('');
    }
  }, [open, defaultMethods, defaultAllergies]);

  const filteredIngredients = useMemo(() =>
    ingredientPrompt?.options?.filter(option =>
      option.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [],
    [ingredientPrompt?.options, searchTerm]
  );

  const toggleSelection = (item: string, list: string[], setList: React.Dispatch<React.SetStateAction<string[]>>) => {
    setList(prev =>
      prev.includes(item)
        ? prev.filter(i => i !== item)
        : [...prev, item]
    );
  };

  const handleNext = () => {
    if (selectedIngredients.length > 0) {
      setStep(2);
      setSearchTerm('');
    }
  };

  const handleBack = () => {
    setStep(1);
  };

  const handleConfirm = () => {
    const methodsToSend = selectedMethods.length > 0 ? selectedMethods : (cookingMethodPrompt?.options || []);
    onConfirm(selectedIngredients, methodsToSend, selectedAllergies);
  };

  const getStepTitle = () => {
    switch (step) {
      case 1: return "Bước 1: Chọn Nguyên Liệu";
      case 2: return "Bước 2: Chọn Phương Pháp Chế Biến";
      default: return "Chọn Tùy Chọn";
    }
  };

  const getStepMessage = () => {
    switch (step) {
      case 1: return ingredientPrompt?.message || "Hãy chọn các nguyên liệu bạn muốn sử dụng:";
      case 2: return cookingMethodPrompt?.message || "Chọn phương pháp nấu để có gợi ý phù hợp nhất!";
      default: return "";
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50 p-4"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 40 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 40 }}
            transition={{ type: 'spring', damping: 24, stiffness: 300 }}
            className="bg-white-primary dark:bg-dark-card p-6 rounded-3xl shadow-2xl max-w-4xl w-full border border-gray-200 dark:border-gray-700 relative max-h-[90vh] flex flex-col"
          >
            <button onClick={onCancel} className="absolute top-4 right-4 text-gray-400 hover:text-red-500 transition-colors" aria-label="Đóng">
              <X className="w-6 h-6" />
            </button>
            
            <div className="text-center mb-6">
              <h2 className="text-3xl font-bold text-brown-primary dark:text-dark-text mb-2">
                {getStepTitle()}
              </h2>
              <p className="text-brown-primary/70 dark:text-dark-text-secondary">
                {getStepMessage()}
              </p>
            </div>

            <div className="flex-grow overflow-y-auto px-2">
              <AnimatePresence mode="wait">
                {step === 1 && (
                  <motion.div key="step1" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
                    <div className="relative mb-4">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <Input 
                        placeholder="Tìm kiếm nguyên liệu..." 
                        value={searchTerm} 
                        onChange={(e) => setSearchTerm(e.target.value)} 
                        className="pl-10"
                      />
                    </div>
                    <div className="max-h-[50vh] overflow-y-auto pr-2 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                      {filteredIngredients.map(ing => (
                        <button
                          key={ing}
                          onClick={() => toggleSelection(ing, selectedIngredients, setSelectedIngredients)}
                          className={`p-3 text-sm rounded-lg text-center transition ${
                            selectedIngredients.includes(ing) 
                              ? 'bg-orange-primary text-white shadow-md' 
                              : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {ing}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}

                {step === 2 && (
                  <motion.div key="step2" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
                    <div className="max-h-[60vh] overflow-y-auto pr-2 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                      {cookingMethodPrompt?.options?.map((method) => {
                        const isSelected = selectedMethods.includes(method);
                        const methodIcon = cookingMethodIcons[method] || { 
                          icon: <Utensils className="w-6 h-6 text-gray-500" />, 
                          bgColor: 'bg-gray-100 dark:bg-gray-800/20' 
                        };
                        return (
                          <button
                            key={method}
                            onClick={() => toggleSelection(method, selectedMethods, setSelectedMethods)}
                            className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all duration-300 group focus:outline-none focus:ring-2 focus:ring-orange-primary/60 min-h-[80px] ${
                              isSelected
                                ? 'border-orange-primary bg-orange-primary/10 dark:bg-orange-primary/20'
                                : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-dark-card hover:border-orange-primary dark:hover:border-orange-primary'
                            }`}
                            type="button"
                          >
                            <span className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${methodIcon.bgColor}`}>
                              {methodIcon.icon}
                            </span>
                            <span className={`font-medium text-sm text-center ${
                              isSelected 
                                ? 'text-orange-primary' 
                                : 'text-brown-primary dark:text-dark-text-secondary group-hover:text-orange-primary dark:group-hover:text-orange-primary'
                            }`}>
                              {method}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            <div className="flex justify-center items-center gap-4 mt-6 pt-6 border-t dark:border-gray-700">
              {step === 2 && (
                <Button variant="outline" onClick={handleBack}>
                  Quay Lại
                </Button>
              )}
              
              {step === 1 ? (
                <Button 
                  onClick={handleNext} 
                  disabled={selectedIngredients.length === 0}
                  className="px-8 py-3 bg-gradient-to-r from-orange-400 to-pink-400 text-white-primary rounded-lg text-lg font-semibold shadow-lg hover:from-orange-500 hover:to-pink-500 transition-all"
                >
                  Tiếp Tục ({selectedIngredients.length})
                </Button>
              ) : (
                <Button 
                  onClick={handleConfirm}
                  className="px-8 py-3 bg-gradient-to-r from-orange-400 to-pink-400 text-white-primary rounded-lg text-lg font-semibold shadow-lg hover:from-orange-500 hover:to-pink-500 transition-all"
                >
                  Xác nhận
                </Button>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
