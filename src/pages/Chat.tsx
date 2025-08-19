import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from 'react-i18next';
import { LanguageToggle } from '@/components/LanguageToggle';
import { Mic, Send, Home, Settings, Shield, AlertTriangle } from 'lucide-react';
import { FloatingKoala, WavingKoala, TwinkleStar, FloatingHeart } from '@/components/KoalaCharacters';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { quickSafetyCheck, shouldWarnUser, getSafetyWarningMessage } from '@/lib/contentFilter';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'kaka';
  timestamp: Date;
  safetyScore?: number;
  filtered?: boolean;
}

export default function Chat() {
  const { user, loading } = useAuth();
  const { toast } = useToast();
  const { t } = useTranslation();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: t('chat.welcome'),
      sender: 'kaka',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isKakaSpeaking, setIsKakaSpeaking] = useState(false);
  const [showSafetyWarning, setShowSafetyWarning] = useState(false);
  const [safetyWarningMessage, setSafetyWarningMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-indonesia">
        <div className="text-center">
          <FloatingKoala className="mx-auto mb-4" />
          <p className="text-lg text-muted-foreground">Memuat chat...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputMessage,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const currentMessage = inputMessage;
    setInputMessage('');
    setIsKakaSpeaking(true);

    try {
      console.log('🔄 Sending to Kaka:', currentMessage);

      const { data, error } = await supabase.functions.invoke('kaka-chat', {
        body: { 
          message: currentMessage,
          childId: user?.id || 'test-user'
        }
      });

      console.log('📨 Supabase response:', { data, error });

      if (error) {
        console.error('❌ Supabase error:', error);
        throw new Error(`Supabase: ${error.message}`);
      }

      if (!data || !data.response) {
        console.error('❌ No response data:', data);
        throw new Error('No response from Kaka');
      }

      const kakaMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: data.response,
        sender: 'kaka',
        timestamp: new Date(),
        safetyScore: data.safetyScore,
        filtered: data.filtered
      };

      setMessages(prev => [...prev, kakaMessage]);

      if (data.filtered) {
        toast({
          title: "🛡️ Pesan Aman",
          description: "Kaka memastikan percakapan tetap aman!",
        });
      }

      console.log('✅ Message handled successfully');

    } catch (error: any) {
      console.error('💥 Chat error:', error);

      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: `Maaf, ada masalah teknis: ${error.message}. Tim akan segera memperbaiki! 🔧`,
        sender: 'kaka',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);

      toast({
        title: "❌ Error Teknis",
        description: error.message || "Koneksi bermasalah. Coba lagi ya!",
        variant: "destructive",
      });
    } finally {
      setIsKakaSpeaking(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.start();
      setIsRecording(true);

      toast({
        title: "🎤 Merekam suara",
        description: "Bicara sekarang! Tekan sekali lagi untuk selesai.",
      });

      mediaRecorder.onstop = () => {
        stream.getTracks().forEach(track => track.stop());
        setIsRecording(false);
        // Here you would normally process the audio
        toast({
          title: "✨ Suara diproses",
          description: "Kaka sedang mendengarkan...",
        });
      };
    } catch (error) {
      toast({
        title: "Oops!",
        description: "Tidak bisa mengakses mikrofon. Coba ketik saja ya!",
        variant: "destructive"
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
    }
  };

  const handleVoiceInput = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-indonesia relative overflow-hidden">
      {/* Animated Background Elements */}
      <TwinkleStar className="absolute top-8 left-8 z-0" style={{ animationDelay: '0s' }} />
      <TwinkleStar className="absolute top-20 right-12 z-0" style={{ animationDelay: '1.5s' }} />
      <FloatingHeart className="absolute top-32 right-1/4 z-0" style={{ animationDelay: '0.8s' }} />
      <FloatingHeart className="absolute bottom-32 left-1/4 z-0" style={{ animationDelay: '2s' }} />

      {/* Header */}
      <header className="relative z-10 bg-white/90 backdrop-blur-sm border-b-2 border-red-indonesia/20 shadow-soft">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-gradient-indonesia flex items-center justify-center">
                <span className="text-lg">🐨</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-red-indonesia">Kaka by KidGPT</h1>
                <p className="text-sm" style={{ color: 'hsl(var(--text-secondary))' }}>Sahabat belajar terbaik!</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <LanguageToggle />
              <Button variant="ghost" size="sm" className="text-red-indonesia">
                <Settings className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" className="text-red-indonesia">
                <Home className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Chat Container */}
      <div className="relative z-10 max-w-4xl mx-auto h-[calc(100vh-120px)] flex flex-col">
        {/* Messages Area */}
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {messages.map((message, index) => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex items-start space-x-3 max-w-[80%] ${message.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                  {/* Avatar */}
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                    message.sender === 'kaka' 
                      ? 'bg-gradient-indonesia' 
                      : 'bg-white-indonesia'
                  }`}>
                    {message.sender === 'kaka' ? (
                      <span className="text-lg">🐨</span>
                    ) : (
                      <span className="text-lg">👦</span>
                    )}
                  </div>

                   {/* Message Bubble */}
                   <Card className={`p-4 max-w-full ${
                     message.sender === 'kaka'
                       ? 'shadow-red-soft'
                       : 'border-2 border-red-indonesia/20 shadow-soft'
                   }`} style={{
                     background: message.sender === 'kaka' 
                       ? 'var(--gradient-indonesia)'
                       : 'var(--gradient-user-message)'
                   }}>
                     <div className="flex items-start justify-between">
                       <p className={`text-base leading-relaxed flex-1 ${
                         message.sender === 'kaka' ? 'text-white' : ''
                       }`} style={{
                         color: message.sender === 'kaka' ? 'hsl(var(--text-light))' : 'hsl(var(--text-primary))'
                       }}>
                         {message.content}
                       </p>
                       {/* Safety indicator */}
                       {message.filtered && (
                         <Shield className={`h-4 w-4 ml-2 flex-shrink-0 ${
                           message.sender === 'kaka' ? 'text-white/80' : 'text-blue-500'
                         }`} />
                       )}
                     </div>
                       <div className="flex items-center justify-between mt-2">
                         <p className="text-xs" style={{
                           color: message.sender === 'kaka' ? 'hsl(var(--text-light) / 0.8)' : 'hsl(var(--text-muted))'
                         }}>
                         {message.timestamp.toLocaleTimeString('id-ID', { 
                           hour: '2-digit', 
                           minute: '2-digit' 
                         })}
                       </p>
                         {/* Safety score indicator (development only) */}
                         {process.env.NODE_ENV === 'development' && message.safetyScore && (
                           <span className="text-xs" style={{
                             color: message.sender === 'kaka' ? 'hsl(var(--text-light) / 0.6)' : 'hsl(var(--text-muted))'
                           }}>
                           Safety: {message.safetyScore}
                         </span>
                       )}
                     </div>
                   </Card>
                </div>
              </div>
            ))}
            
            {/* Kaka typing indicator */}
            {isKakaSpeaking && (
              <div className="flex justify-start">
                <div className="flex items-start space-x-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-indonesia flex items-center justify-center">
                    <WavingKoala />
                  </div>
                   <Card className="p-4 shadow-red-soft" style={{ 
                     background: 'var(--gradient-indonesia)',
                     color: 'hsl(var(--text-light))'
                   }}>
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                      <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                  </Card>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Input Area */}
        <div className="p-4 bg-white/95 backdrop-blur-sm border-t-2 border-red-indonesia/20">
          {/* Safety Warning */}
          {showSafetyWarning && (
            <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start space-x-3">
              <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-yellow-800 font-medium">{t('chat.safetyWarningTitle')}</p>
                <p className="text-sm text-yellow-700 mt-1">{safetyWarningMessage}</p>
                <div className="flex space-x-2 mt-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setInputMessage('');
                      setShowSafetyWarning(false);
                    }}
                    className="text-yellow-700 border-yellow-300 hover:bg-yellow-100"
                  >
                    {t('chat.deleteMessage')}
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => setShowSafetyWarning(false)}
                    className="bg-yellow-600 hover:bg-yellow-700 text-white"
                  >
                    {t('chat.continue')}
                  </Button>
                </div>
              </div>
            </div>
          )}

          <div className="flex space-x-3">
            {/* Voice Input Button */}
            <Button
              size="lg"
              onClick={handleVoiceInput}
              className={`flex-shrink-0 w-14 h-14 rounded-full shadow-lg transition-all duration-200 ${
                isRecording 
                  ? 'bg-red-500 hover:bg-red-600 animate-pulse' 
                  : 'bg-gradient-indonesia hover:opacity-90 hover:scale-105'
              }`}
            >
              <Mic className={`h-6 w-6 text-white ${isRecording ? 'animate-pulse' : ''}`} />
            </Button>

            {/* Text Input */}
            <div className="flex-1 flex space-x-3">
              <Input
                value={inputMessage}
                onChange={(e) => {
                  setInputMessage(e.target.value);
                  // Reset safety warning when user starts typing again
                  if (showSafetyWarning) {
                    setShowSafetyWarning(false);
                  }
                }}
                onKeyPress={handleKeyPress}
                placeholder={t('chat.voicePlaceholder')}
                className="kid-friendly-input-large text-lg"
                disabled={isRecording}
              />
              
              <Button
                size="lg"
                onClick={handleSendMessage}
                disabled={!inputMessage.trim()}
                className="bg-gold-indonesia hover:bg-gold-indonesia/90 text-red-indonesia font-bold px-6 h-14 rounded-xl shadow-lg hover:scale-105 transition-all duration-200"
              >
                <Send className="h-5 w-5" />
              </Button>
            </div>
          </div>
          
          <div className="mt-3 text-center">
            <div className="flex items-center justify-center space-x-2 text-sm" style={{ color: 'hsl(var(--text-secondary))' }}>
              <Shield className="h-4 w-4 text-blue-500" />
              <p>{t('chat.tip')}</p>
            </div>
            <p className="text-xs mt-1" style={{ color: 'hsl(var(--text-muted))' }}>
              {t('chat.safetyNote')}
            </p>
          </div>
        </div>
      </div>

      {/* Floating Koala Helper */}
      <FloatingKoala className="absolute bottom-20 right-6 z-20 hidden lg:block" />
    </div>
  );
}