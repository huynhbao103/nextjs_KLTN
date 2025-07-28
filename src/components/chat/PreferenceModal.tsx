import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Utensils, X, Soup, Salad, Flame, Droplets, EggFried, Drumstick, ChefHat, Wheat, Cake, Wind } from 'lucide-react';

// Re-defined Prompt interface for clarity
interface Prompt {
  message?: string;
  options?: string[];
}

interface PreferenceModalProps {
  open: boolean;
  onConfirm: (methods: string[], allergies: string[]) => void; // Added allergies parameter
  onCancel: () => void;
  cookingMethodPrompt?: Prompt;
  allergyPrompt?: Prompt; // Added allergy prompt
  defaultMethods?: string[];
  defaultAllergies?: string[]; // Added default allergies
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
};



export default function PreferenceModal({
  open,
  onConfirm,
  onCancel,
  cookingMethodPrompt,
  allergyPrompt,
  defaultMethods,
  defaultAllergies
}: PreferenceModalProps) {
  const methods = cookingMethodPrompt?.options || [];
  
  const [selectedMethods, setSelectedMethods] = useState<string[]>(defaultMethods || []);
  const [selectedAllergies, setSelectedAllergies] = useState<string[]>(defaultAllergies || []);

  const toggleMethod = (method: string) => {
    setSelectedMethods((prev) =>
      prev.includes(method) ? prev.filter((m) => m !== method) : [...prev, method]
    );
  };

  const handleConfirm = () => {
    // If no cooking methods are selected, send all available methods as default
    const methodsToSend = selectedMethods.length > 0 ? selectedMethods : methods;
    // Send empty allergies array
    onConfirm(methodsToSend, []);
  };

  // Reset state when modal opens/closes
  React.useEffect(() => {
    if (open) {
      setSelectedMethods(defaultMethods || []);
    }
  }, [open, defaultMethods]);

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
            className="bg-white-primary dark:bg-dark-card p-8 rounded-3xl shadow-2xl max-w-4xl w-full border border-gray-200 dark:border-gray-700 relative max-h-[90vh] overflow-y-auto"
          >
            {/* Close button */}
            <button
              onClick={onCancel}
              className="absolute top-4 right-4 text-gray-400 hover:text-red-500 transition-colors"
              aria-label="Đóng"
            >
              <X className="w-6 h-6" />
            </button>
            
            {/* Header */}
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-brown-primary dark:text-dark-text mb-2">
                Cá nhân hóa trải nghiệm
              </h2>
              <p className="text-brown-primary/70 dark:text-dark-text-secondary">
                Chọn phương pháp nấu để có gợi ý phù hợp nhất!
              </p>
            </div>

            <div className="grid grid-cols-1 gap-8 mb-8">
              {/* Cooking method selection */}
              <div>
                <h3 className="text-lg font-semibold mb-4 text-brown-primary dark:text-dark-text">
                  {cookingMethodPrompt?.message || 'Chọn phương pháp nấu'}
                </h3>
                                 {methods.length > 0 && (
                   <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                     {methods.map((method) => {
                       const isSelected = selectedMethods.includes(method);
                       const methodIcon = cookingMethodIcons[method] || { icon: <Utensils className="w-6 h-6 text-gray-500" />, bgColor: 'bg-gray-100 dark:bg-gray-800/20' };
                       return (
                         <button
                           key={method}
                           className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all duration-300 group focus:outline-none focus:ring-2 focus:ring-orange-primary/60 min-h-[80px] ${
                             isSelected
                               ? 'border-orange-primary bg-orange-primary/10 dark:bg-orange-primary/20'
                               : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-dark-card hover:border-orange-primary dark:hover:border-orange-primary'
                           }`}
                           onClick={() => toggleMethod(method)}
                           type="button"
                         >
                           <span className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${methodIcon.bgColor}`}>
                             {methodIcon.icon}
                           </span>
                           <span className={`font-medium text-sm text-center ${isSelected ? 'text-orange-primary' : 'text-brown-primary dark:text-dark-text-secondary group-hover:text-orange-primary dark:group-hover:text-orange-primary'}`}>
                             {method}
                           </span>
                         </button>
                       );
                     })}
                   </div>
                 )}
              </div>
            </div>
            
            {/* Action buttons */}
            <div className="flex justify-center gap-4 mt-8">
              <button
                onClick={handleConfirm}
                className="px-8 py-3 bg-gradient-to-r from-orange-400 to-pink-400 text-white-primary rounded-lg text-lg font-semibold shadow-lg hover:from-orange-500 hover:to-pink-500 transition-all"
              >
                Xác nhận
              </button>
              <button
                onClick={onCancel}
                className="px-8 py-3 text-brown-primary/60 dark:text-dark-text-secondary hover:text-brown-primary dark:hover:text-dark-text text-lg font-semibold transition-colors"
              >
                Hủy
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
