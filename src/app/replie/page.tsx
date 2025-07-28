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
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

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
    allergyPrompt?: Prompt; // Added allergy prompt
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

  // Modal hỏi context filter
  const [showContextFilterModal, setShowContextFilterModal] = useState(false);
  const [pendingQuestion, setPendingQuestion] = useState<string | null>(null);
  const [pendingWeather, setPendingWeather] = useState<string | null>(null);
  const [pendingTimeOfDay, setPendingTimeOfDay] = useState<string | null>(null);
  const [pendingIgnoreContext, setPendingIgnoreContext] = useState<boolean | null>(null);

  // Authentication check
  useEffect(() => {
    if (status === 'loading') return;
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  // Auto-save functionality
  const saveChatToDatabase = async (chatData: {
    title?: string;
    messages: Message[];
    sessionId?: string | null;
  }) => {
    if (!session?.user?.email) return;
    
    setIsSaving(true);
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chatId: currentChatId, // Include chatId if exists for updates
          title: chatData.title || 'Cuộc trò chuyện mới',
          messages: chatData.messages,
          sessionId: chatData.sessionId,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setCurrentChatId(data.chat._id);
        setLastSaved(new Date());
        console.log('Chat saved successfully:', {
          chatId: data.chat._id,
          title: data.chat.title,
          messagesCount: data.chat.messages.length,
          sessionId: data.chat.sessionId
        });
      } else {
        console.error('Failed to save chat');
      }
    } catch (error) {
      console.error('Error saving chat:', error);
    } finally {
      setIsSaving(false);
    }
  };

  // Auto-save effect
  useEffect(() => {
    if (!autoSave || messages.length <= 1) return;

    // Clear existing timeout
    if (saveTimeout) {
      clearTimeout(saveTimeout);
    }

    // Set new timeout for auto-save
    const timeout = setTimeout(() => {
      const title = messages.find(msg => msg.isUser)?.text?.slice(0, 50) || 'Cuộc trò chuyện mới';
      saveChatToDatabase({
        title,
        messages,
        sessionId,
      });
    }, 2000); // Auto-save after 2 seconds of inactivity

    setSaveTimeout(timeout);

    return () => {
      if (timeout) clearTimeout(timeout);
    };
  }, [messages, autoSave, sessionId]);

  // Immediate save when sessionId changes (after AI response)
  useEffect(() => {
    if (!autoSave || messages.length <= 1 || !sessionId) return;
    
    // Save immediately when sessionId is set (after AI analysis)
    const title = messages.find(msg => msg.isUser)?.text?.slice(0, 50) || 'Cuộc trò chuyện mới';
    saveChatToDatabase({
      title,
      messages,
      sessionId,
    });
  }, [sessionId, autoSave]);

  // Force save when messages change significantly (more than 2 messages)
  useEffect(() => {
    if (!autoSave || messages.length <= 2) return;
    
    // Only save if we haven't saved recently (within last 30 seconds)
    const now = new Date();
    if (lastSaved && (now.getTime() - lastSaved.getTime()) < 30000) {
      return;
    }
    
    // Save when we have substantial conversation
    const title = messages.find(msg => msg.isUser)?.text?.slice(0, 50) || 'Cuộc trò chuyện mới';
    saveChatToDatabase({
      title,
      messages,
      sessionId,
    });
  }, [messages.length, autoSave, lastSaved]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (saveTimeout) {
        clearTimeout(saveTimeout);
      }
    };
  }, [saveTimeout]);

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
        if (data.cooking_method_prompt || data.allergy_prompt) {
          setPreferencePrompt({
            // emotionPrompt: data.emotion_prompt, // No longer needed
            cookingMethodPrompt: data.cooking_method_prompt,
            allergyPrompt: data.allergy_prompt, // Added allergy prompt
          });
          // Don't show modal immediately, show continue button instead
          setShowContinueButton(true);
        }
        return;
      }
      
      if (data.message) {
        setMessages(prev => [...prev, {
          id: Date.now(),
          text: ` ${typeof data.message === 'object' ? JSON.stringify(data.message) : data.message}`,
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

  // Hàm gọi API với ignore_context_filter
  const processUserMessageWithContextFilter = async (
    question: string,
    weather: string | null,
    timeOfDayStr: string | null,
    ignoreContext: boolean
  ) => {
    try {
      const body: any = {
        question: question.trim(),
        weather,
        time_of_day: timeOfDayStr,
        session_id: '',
      };
      if (ignoreContext) body.ignore_context_filter = true;
      const response = await fetch('/api/ai/langgraph/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
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
        if (data.cooking_method_prompt) {
          setPreferencePrompt({ cookingMethodPrompt: data.cooking_method_prompt });
          setShowContinueButton(true);
        }
        return;
      }
      if (data.message) {
        setMessages(prev => [...prev, {
          id: Date.now(),
          text: ` ${typeof data.message === 'object' ? JSON.stringify(data.message) : data.message}`,
          isUser: false,
          timestamp: new Date().toISOString(),
          type: 'message'
        }]);
      }
    } catch (error: any) {
      console.error('Error in processUserMessageWithContextFilter:', error);
      setMessages(prev => [...prev, {
        id: Date.now(),
        text: `Lỗi: ${error.message}`,
        isUser: false,
        timestamp: new Date().toISOString(),
        type: 'message'
      }]);
    }
  };

  const sendPreferencesToBackend = async (methods: string[], allergies: string[]) => { // Added allergies parameter
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
        allergies: allergies, // Added allergies
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

  const handlePreferenceConfirm = async (methods: string[], allergies: string[]) => { // Added allergies parameter
    setShowPreferenceModal(false);
    setIsTyping(true);
    await sendPreferencesToBackend(methods, allergies); // Added allergies
    setIsTyping(false);
  };

  const handlePreferenceCancel = async () => {
    setShowPreferenceModal(false);
    setShowContinueButton(false); // Also hide on cancel
    const defaultMethods = preferencePrompt?.cookingMethodPrompt?.options || ['Hấp', 'Luộc'];
    const defaultAllergies: string[] = []; // Default to no allergies
    
    setMessages(prev => [...prev, {
      id: Date.now(),
      text: `Bạn đã không chọn. Hệ thống sẽ tiếp tục với lựa chọn mặc định...`,
      isUser: false,
      timestamp: new Date().toISOString(),
      type: 'message'
    }]);

    setIsTyping(true);
    await sendPreferencesToBackend(defaultMethods, defaultAllergies); // Added allergies
    setIsTyping(false);
  };
  
  // Sửa handleSendMessage để show modal context filter
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
    // Nếu đã có sessionId thì gửi thẳng, không hiện modal nữa
    if (sessionId) {
      setIsTyping(true);
      await processUserMessageWithContextFilter(
        text,
        weatherContext?.name?.trim() || null,
        timeOfDay?.trim() || null,
        false // luôn dùng context khi đã có session
      );
      setIsTyping(false);
      return;
    }
    // Lưu lại pending question và context, show modal
    setPendingQuestion(text);
    setPendingWeather(weatherContext?.name?.trim() || null);
    setPendingTimeOfDay(timeOfDay?.trim() || null);
    setShowContextFilterModal(true);
  };

  // Hàm xử lý sau khi user chọn context filter
  const handleContextFilterChoice = async (ignoreContext: boolean) => {
    setShowContextFilterModal(false);
    setIsTyping(true);
    // Gọi processUserMessage với ignore_context_filter
    await processUserMessageWithContextFilter(
      pendingQuestion || '',
      pendingWeather,
      pendingTimeOfDay,
      ignoreContext
    );
    setIsTyping(false);
    setPendingQuestion(null);
    setPendingWeather(null);
    setPendingTimeOfDay(null);
    setPendingIgnoreContext(null);
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
        <div className="flex-1 bg-gradient-to-b from-white-primary/50 to-cream-primary/30 dark:from-dark-card/50 dark:to-dark-bg/30">
          <ChatWindow>
            <AnimatePresence>
              {messages.map((msg, index) => (
                <div key={msg.id}>
                  {msg.type === 'analysis' ? (
                    <AnalysisStep step={msg.step || 'default'} message={msg.text} />
                  ) : (
                    <MessageBubble 
                      message={msg.text} 
                      isUser={msg.isUser} 
                      onSelectFood={(food) => handleSendMessage(`Tôi muốn tìm hiểu thêm về món ${food}`)}
                    />
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
            allergyPrompt={preferencePrompt.allergyPrompt} // Added allergy prompt
            defaultAllergies={session?.user?.allergies || []} // Pass user allergies as defaults
            onConfirm={handlePreferenceConfirm}
            onCancel={handlePreferenceCancel}
          />
        )}
      </AnimatePresence>
      {/* Modal hỏi context filter */}
      <AnimatePresence>
        {showContextFilterModal && (
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
              className="bg-white-primary dark:bg-dark-card p-8 rounded-3xl shadow-2xl max-w-md w-full border border-gray-200 dark:border-gray-700 relative"
            >
              <CardHeader className="text-center mb-4">
                <CardTitle className="text-2xl font-bold text-brown-primary dark:text-dark-text mb-2">
                  Bạn muốn cá nhân hóa gợi ý món ăn?
                </CardTitle>
                <CardContent>
                  <p className="text-brown-primary/70 dark:text-dark-text-secondary text-base">
                    Thời tiết giúp cá nhân hóa gợi ý món ăn dựa trên thời điểm hiện tại của bạn để lọc ra các cách chế biến phù hợp<br/>
                    Bạn có muốn dùng thêm thời tiết để lọc món ăn không?
                  </p>
                </CardContent>
              </CardHeader>
              <CardFooter className="flex justify-center gap-4 mt-6">
                <Button
                  onClick={() => handleContextFilterChoice(false)}
                  className="px-3 py-3 bg-gradient-to-r from-orange-400 to-green-400 text-white-primary rounded-lg text-lg font-semibold shadow-lg hover:from-orange-500 hover:to-green-500 transition-all"
                >
                  Có, dùng thời tiết
                </Button>
                <Button
                  onClick={() => handleContextFilterChoice(true)}
                  variant="outline"
                  className="px-3 py-3 text-brown-primary/80 dark:text-dark-text-secondary hover:text-brown-primary dark:hover:text-dark-text text-lg font-semibold border"
                >
                  Không, bỏ qua thời tiết
                </Button>
              </CardFooter>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}