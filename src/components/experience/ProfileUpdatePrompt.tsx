'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { User, Clock, ArrowRight } from 'lucide-react';

interface ProfileUpdatePromptProps {
  userProfile: any;
  onUpdate: () => void;
  onSkip: () => void;
}

export function ProfileUpdatePrompt({ userProfile, onUpdate, onSkip }: ProfileUpdatePromptProps) {
  const lastUpdate = userProfile?.lastUpdateDate ? new Date(userProfile.lastUpdateDate) : null;
  const daysSinceUpdate = lastUpdate ? Math.floor((new Date().getTime() - lastUpdate.getTime()) / (1000 * 60 * 60 * 24)) : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex items-center justify-center min-h-[60vh] px-4"
    >
      <Card className="w-full max-w-md bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 shadow-lg dark:shadow-gray-900/20">
        <CardHeader className="text-center bg-gradient-to-r from-orange-50 to-orange-100 dark:from-gray-800 dark:to-gray-700 rounded-t-lg border-b border-gray-200 dark:border-gray-700">
          <div className="mx-auto w-16 h-16 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center mb-4">
            <User className="w-8 h-8 text-orange-600 dark:text-orange-400" />
          </div>
          <CardTitle className="text-xl font-bold text-brown-primary dark:text-orange-400">
            Chào mừng trở lại, {userProfile?.name || 'bạn'}!
          </CardTitle>
          <p className="text-brown-primary/70 dark:text-orange-300/80 text-sm">
            Thông tin của bạn đã được lưu trước đó
          </p>
        </CardHeader>
        
        <CardContent className="p-6 bg-white dark:bg-gray-900">
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <Clock className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-200">
                  Cập nhật lần cuối
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {lastUpdate ? lastUpdate.toLocaleDateString('vi-VN') : 'Chưa có'}
                  {daysSinceUpdate > 0 && ` (${daysSinceUpdate} ngày trước)`}
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-sm text-gray-600 dark:text-gray-300 text-center">
                Bạn có muốn cập nhật thông tin để có gợi ý chính xác hơn không?
              </p>
              
              <div className="flex gap-3">
                <Button
                  onClick={onUpdate}
                  className="flex-1 bg-orange-500 hover:bg-orange-600 text-white border-orange-500 hover:border-orange-600 transition-all duration-200"
                >
                  <User className="w-4 h-4 mr-2" />
                  Cập nhật thông tin
                </Button>
                
                <Button
                  onClick={onSkip}
                  variant="outline"
                  className="flex-1 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  <ArrowRight className="w-4 h-4 mr-2" />
                  Bỏ qua
                </Button>
              </div>
            </div>

            <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
              Bạn có thể cập nhật thông tin bất cứ lúc nào trong phần Hồ sơ
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
} 