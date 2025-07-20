// app/page.js (hoặc pages/index.js nếu dùng Pages Router)
'use client'; // Chỉ định đây là Client Component nếu dùng App Router

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import ChatWindow from '@/components/chat/ChatWindow';
import MessageBubble from '@/components/chat/MessageBubble';
import ChatInput from '@/components/chat/ChatInput';
import ChatSidebar from '@/components/chat/ChatSidebar';
import QuickQuestions from '@/components/chat/QuickQuestions';
import AIStatus from '@/components/chat/AIStatus';
import Header from '@/components/header/page';
import { useAI } from '@/hooks/useAI';
import { Sparkles } from 'lucide-react';
import axios from 'axios';
import PreferenceModal from '@/components/chat/PreferenceModal';
import { useWeatherContext } from '@/hooks/useWeatherContext';
import { useTimeOfDay } from '@/hooks/useTimeOfDay';
import { useWeather } from '@/hooks/useWeather';
import { useGeolocation } from '@/hooks/useGeolocation';
import AnalysisStep from '@/components/chat/AnalysisStep'; // Import the new component

// Define message types
interface Message {
  id: number;
  text: string;
  isUser: boolean;
  timestamp: string;
  type?: 'message' | 'analysis';
  step?: string; // For analysis steps
}

interface ChatHistoryItem {
  _id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  sessionId?: string;
  messages: Message[];
}

// Add a specific type for the prompt structure from the API
interface Prompt {
  message?: string;
  options?: string[];
  // emotions?: string[]; // No longer needed
}

// Hàm xác định buổi trong ngày theo giờ local
function getTimeOfDay(): 'sáng' | 'trưa' | 'chiều' | 'tối' {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 11) return 'sáng';
  if (hour >= 11 && hour < 14) return 'trưa';
  if (hour >= 14 && hour < 18) return 'chiều';
  return 'tối';
}

export default function HomePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { sendMessage, isLoading: aiLoading, error: aiError, clearError } = useAI();
  
  const [messages, setMessages] = useState<Message[]>([
    { id: 1, text: "Xin chào! Tôi có thể giúp gì cho bạn hôm nay? 😊", isUser: false, timestamp: new Date().toISOString(), type: 'message' },
  ]);

  const [isTyping, setIsTyping] = useState(false);
  const [showQuickQuestions, setShowQuickQuestions] = useState(true);
  const [currentChatId, setCurrentChatId] = useState<string | undefined>();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [autoSave, setAutoSave] = useState(true);
  const [saveTimeout, setSaveTimeout] = useState<NodeJS.Timeout | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // State for the new prompt structure
  const [preferencePrompt, setPreferencePrompt] = useState<null | {
    // emotionPrompt?: Prompt; // No longer needed
    cookingMethodPrompt?: Prompt;
  }>();
  const [showPreferenceModal, setShowPreferenceModal] = useState(false);
  const [showContinueButton, setShowContinueButton] = useState(false); // New state

  // State for session ID
  const [sessionId, setSessionId] = useState<string | null>(null);

  // Geolocation and Weather hooks
  const { position, error: geoError, loading: geoLoading } = useGeolocation();
  const lat = position?.coords.latitude;
  const lon = position?.coords.longitude;
  const { data: weatherData, loading: weatherLoading, error: weatherError } = useWeather(lat, lon);
  
  const temp = weatherData?.main?.temp;
  const weatherContext = useWeatherContext(temp);
  const timeOfDay = useTimeOfDay();

  // Authentication check
  useEffect(() => {
    if (status === 'loading') return;
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  // Rewritten for the new 2-step flow
  const processUserMessage = async (question: string) => {
    // Sanitize and prepare data before sending
    const weather = weatherContext?.name?.trim() || null;
    const timeOfDayStr = timeOfDay?.trim() || null;
    const sanitizedQuestion = question.trim();

    try {
      // FE now calls its own API route, which handles auth
      const response = await fetch('/api/ai/langgraph/process', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          // No Authorization header needed here anymore
        },
        body: JSON.stringify({
          question: sanitizedQuestion,
          weather,
          time_of_day: timeOfDayStr,
          session_id: "", 
        }),
      });

      let data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to process initial request');

      if (typeof data.message === 'string') {
        try {
          const parsedMessage = JSON.parse(data.message);
          if (parsedMessage && parsedMessage.status) data = parsedMessage;
        } catch (e) { /* Not a JSON string, proceed */ }
      }

      if (data.status === 'analysis_complete' && data.analysis_steps) {
        if (Array.isArray(data.analysis_steps) && data.analysis_steps.length > 0) {
          const analysisMessages: Message[] = data.analysis_steps.map((step: any) => ({
            id: Date.now() + Math.random(),
            text: step.message,
            isUser: false,
            timestamp: new Date().toISOString(),
            type: 'analysis',
            step: step.step,
          }));
          setMessages(prev => [...prev, ...analysisMessages]);
        }

        if (data.session_id) setSessionId(data.session_id);

        // 3. Prepare and show the preference modal
        if (data.cooking_method_prompt) {
          setPreferencePrompt({
            // emotionPrompt: data.emotion_prompt, // No longer needed
            cookingMethodPrompt: data.cooking_method_prompt,
          });
          // Don't show modal immediately, show continue button instead
          setShowContinueButton(true);
        }
        return;
      }
      
      if (data.message) {
        setMessages(prev => [...prev, {
          id: Date.now(),
          text: `[DEBUG] Fallback: ${typeof data.message === 'object' ? JSON.stringify(data.message) : data.message}`,
          isUser: false,
          timestamp: new Date().toISOString(),
          type: 'message'
        }]);
      }

    } catch (error: any) {
      console.error('Error in processUserMessage:', error);
      setMessages(prev => [...prev, {
        id: Date.now(),
        text: `Lỗi: ${error.message}`,
        isUser: false,
        timestamp: new Date().toISOString(),
        type: 'message'
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  const sendPreferencesToBackend = async (methods: string[]) => { // Removed emotion
    if (!sessionId) {
      console.error('Cannot send preferences without a session ID.');
      setMessages(prev => [...prev, {
        id: Date.now(),
        text: 'Lỗi: Mất phiên làm việc. Vui lòng thử lại từ đầu.',
        isUser: false,
        timestamp: new Date().toISOString(),
        type: 'message'
      }]);
      return;
    }

    try {
      // FE calls its own API route
      const response = await axios.post('/api/ai/langgraph/process-cooking', {
        session_id: sessionId,
        cooking_methods: methods,
      }
      // No headers needed here anymore, the API route handles it
      );
      
      const data = response.data;
      if (data.status === 'success' && data.message) {
        setMessages(prev => [...prev, {
          id: Date.now(),
          text: data.message,
          isUser: false,
          timestamp: new Date().toISOString(),
          type: 'message'
        }]);
      } else {
        setMessages(prev => [...prev, {
          id: Date.now(),
          text: data.message || "Không tìm thấy món ăn nào phù hợp.",
          isUser: false,
          timestamp: new Date().toISOString(),
          type: 'message'
        }]);
      }
    } catch (error) {
      console.error('Error in sendPreferencesToBackend:', error);
      setMessages(prev => [...prev, {
        id: Date.now(),
        text: "Có lỗi xảy ra khi xử lý lựa chọn của bạn.",
        isUser: false,
        timestamp: new Date().toISOString(),
        type: 'message'
      }]);
    }
  };

  const handlePreferenceConfirm = async (methods: string[]) => { // Removed emotion
    setShowPreferenceModal(false);
    setIsTyping(true);
    await sendPreferencesToBackend(methods); // Removed emotion
    setIsTyping(false);
  };

  const handlePreferenceCancel = async () => {
    setShowPreferenceModal(false);
    setShowContinueButton(false); // Also hide on cancel
    const defaultMethods = preferencePrompt?.cookingMethodPrompt?.options || ['Hấp', 'Luộc'];
    
    setMessages(prev => [...prev, {
      id: Date.now(),
      text: `Bạn đã không chọn. Hệ thống sẽ tiếp tục với lựa chọn mặc định...`,
      isUser: false,
      timestamp: new Date().toISOString(),
      type: 'message'
    }]);

    setIsTyping(true);
    await sendPreferencesToBackend(defaultMethods); // Removed emotion
    setIsTyping(false);
  };
  
  const handleSendMessage = async (text: string) => {
    setShowQuickQuestions(false);
    setShowContinueButton(false); // Hide button on new message
    const newUserMessage: Message = {
      id: Date.now(),
      text: text,
      isUser: true,
      timestamp: new Date().toISOString(),
      type: 'message',
    };
    setMessages(prev => [...prev, newUserMessage]);
    setIsTyping(true);
    await processUserMessage(text);
  };
  
  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen font-sans bg-cream-primary dark:bg-dark-bg">
      <Header />
      <ChatSidebar
        onSelectChat={(chat) => {
          setCurrentChatId(chat._id);
          setMessages(chat.messages);
          setSessionId(chat.sessionId || null);
          setShowQuickQuestions(false);
          setSidebarOpen(false);
        }}
        onNewChat={() => {
          setCurrentChatId(undefined);
          setSessionId(null);
          setMessages([{ id: 1, text: "Xin chào! Tôi có thể giúp gì cho bạn hôm nay? 😊", isUser: false, timestamp: new Date().toISOString(), type: 'message' }]);
          setShowQuickQuestions(true);
          setSidebarOpen(false);
        }}
        currentChatId={currentChatId}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      <div className="flex-1 flex flex-col lg:ml-80">
        <div className="flex items-center justify-between p-6 bg-white-primary/80 dark:bg-dark-card/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2">
              <Sparkles className="w-6 h-6" />
            </button>
            <h1 className="text-xl font-bold">TastyMind</h1>
          </div>
        </div>
        <div className="flex-1 bg-gradient-to-b from-white-primary/50 to-cream-primary/30 dark:from-dark-card/50 dark:to-dark-bg/30">
          <ChatWindow>
            <AnimatePresence>
              {messages.map((msg, index) => (
                <div key={msg.id}>
                  {msg.type === 'analysis' ? (
                    <AnalysisStep step={msg.step || 'default'} message={msg.text} />
                  ) : (
                    <MessageBubble message={msg.text} isUser={msg.isUser} onSelectFood={(food) => handleSendMessage(`Tôi muốn tìm hiểu thêm về món ${food}`)} />
                  )}
                </div>
              ))}
            </AnimatePresence>
            {isTyping && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex justify-start">
                <div className="flex items-end gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-primary to-green-primary flex items-center justify-center text-white-primary shadow-lg font-bold">AI</div>
                  <div className="px-6 py-4 rounded-2xl bg-white-primary dark:bg-dark-card border shadow-lg">
                    <div className="flex space-x-2">
                      <div className="w-3 h-3 bg-orange-primary rounded-full animate-bounce"></div>
                      <div className="w-3 h-3 bg-orange-primary rounded-full animate-bounce [animation-delay:0.1s]"></div>
                      <div className="w-3 h-3 bg-orange-primary rounded-full animate-bounce [animation-delay:0.2s]"></div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
            <QuickQuestions onSelectQuestion={handleSendMessage} isVisible={showQuickQuestions && messages.length <= 1} />
            
            {/* New Continue Button */}
            {showContinueButton && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex justify-center p-4">
                <button
                  onClick={() => {
                    setShowContinueButton(false);
                    setShowPreferenceModal(true);
                  }}
                  className="px-6 py-3 bg-gradient-to-r from-orange-primary to-green-primary text-white-primary rounded-lg font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
                >
                  Tiếp tục
                </button>
              </motion.div>
            )}
          </ChatWindow>
        </div>
        <div className='bg-white-primary/80 dark:bg-dark-card/80 backdrop-blur-sm border-t border-gray-200 dark:border-gray-700'>
          <ChatInput onSendMessage={handleSendMessage} />
        </div>
      </div>
      <AIStatus isLoading={aiLoading} error={aiError} onClearError={clearError} />
      <AnimatePresence>
        {showPreferenceModal && preferencePrompt && (
          <PreferenceModal
            open={showPreferenceModal}
            // emotionPrompt={preferencePrompt.emotionPrompt} // No longer needed
            cookingMethodPrompt={preferencePrompt.cookingMethodPrompt}
            onConfirm={handlePreferenceConfirm}
            onCancel={handlePreferenceCancel}
          />
        )}
      </AnimatePresence>
    </div>
  );
}