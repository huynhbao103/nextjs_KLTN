'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useSessionStorage } from '@/utils/sessionStorage';

interface MoodOption {
  id: string;
  label: string;
  emoji: string;
  description: string;
}

const moodOptions: MoodOption[] = [
  { id: 'happy', label: 'Vui vẻ', emoji: '😊', description: 'Tâm trạng tốt, muốn ăn ngon' },
  { id: 'sad', label: 'Buồn', emoji: '😢', description: 'Cần món ăn an ủi' },
  { id: 'stressed', label: 'Căng thẳng', emoji: '😰', description: 'Cần món ăn thư giãn' },
  { id: 'excited', label: 'Hào hứng', emoji: '🤩', description: 'Muốn thử món mới' },
  { id: 'tired', label: 'Mệt mỏi', emoji: '😴', description: 'Cần món ăn bổ dưỡng' },
  { id: 'hungry', label: 'Đói', emoji: '🤤', description: 'Muốn ăn ngay lập tức' },
  { id: 'neutral', label: 'Bình thường', emoji: '😐', description: 'Không có gì đặc biệt' },
  { id: 'celebrating', label: 'Ăn mừng', emoji: '🎉', description: 'Có gì đó đặc biệt' }
];

interface MoodSelectionProps {
  onMoodSelected: (mood: string) => void;
  onBack?: () => void;
}

export function MoodSelection({ onMoodSelected, onBack }: MoodSelectionProps) {
  const [selectedMood, setSelectedMood] = useState<string>('');
  const { setMood } = useSessionStorage();

  const handleMoodSelect = (moodId: string) => {
    setSelectedMood(moodId);
  };

  const handleContinue = () => {
    if (selectedMood) {
      setMood(selectedMood);
      onMoodSelected(selectedMood);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold text-brown-primary dark:text-dark-text">
          Bạn đang cảm thấy thế nào?
        </CardTitle>
        <p className="text-brown-primary/70 dark:text-dark-text-secondary">
          Chọn tâm trạng hiện tại để chúng tôi gợi ý món ăn phù hợp
        </p>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {moodOptions.map((mood) => (
            <motion.div
              key={mood.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                variant={selectedMood === mood.id ? "default" : "outline"}
                className={`w-full h-24 flex flex-col items-center justify-center gap-2 p-4 ${
                  selectedMood === mood.id 
                    ? 'bg-orange-primary text-white border-orange-primary' 
                    : 'hover:border-orange-primary/50'
                }`}
                onClick={() => handleMoodSelect(mood.id)}
              >
                <span className="text-2xl">{mood.emoji}</span>
                <span className="text-sm font-medium text-brown-primary dark:text-dark-text">{mood.label}</span>
              </Button>
            </motion.div>
          ))}
        </div>

        {selectedMood && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center p-4 bg-orange-primary/10 rounded-lg"
          >
            <p className="text-brown-primary dark:text-dark-text">
              {moodOptions.find(m => m.id === selectedMood)?.description}
            </p>
          </motion.div>
        )}

        <div className="flex justify-between pt-4 gap-4">
          {onBack && (
            <Button variant="outline" className='w-1/2 bg-orange-primary/10 text-brown-primary dark:text-dark-text hover:bg-orange-primary/20' onClick={onBack}>
              Quay lại
            </Button>
          )}
          <Button 
            onClick={handleContinue}
            disabled={!selectedMood}
            className="ml-auto bg-orange-primary text-white hover:bg-orange-primary/80"
          >
            Tiếp tục
          </Button>
        </div>
      </CardContent>
    </Card>
  );
} 