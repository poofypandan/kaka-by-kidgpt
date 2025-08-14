import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { Mic, Send, Home, Settings } from 'lucide-react';
import { FloatingKoala, WavingKoala, TwinkleStar, FloatingHeart } from '@/components/KoalaCharacters';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'kaka';
  timestamp: Date;
}

export default function Chat() {
  const { user, loading } = useAuth();
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: 'Halo! Aku Kaka! 🐨 Ada yang ingin kamu tanyakan hari ini?',
      sender: 'kaka',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isKakaSpeaking, setIsKakaSpeaking] = useState(false);
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
    setInputMessage('');
    setIsKakaSpeaking(true);

    // Simulate Kaka's response
    setTimeout(() => {
      const kakaResponses = [
        "Pertanyaan yang bagus! 🌟 Aku senang bisa membantu kamu belajar!",
        "Wah, kamu anak yang pintar! 🎉 Mari kita jelajahi topik ini bersama!",
        "Aku suka sekali dengan rasa ingin tahu kamu! 🤗 Ayo kita pelajari lebih lanjut!",
        "Hebat! Kamu sudah bertanya hal yang sangat menarik! 🚀",
        "Kamu tahu tidak? Pertanyaan seperti ini yang membuat belajar jadi menyenangkan! ✨"
      ];

      const randomResponse = kakaResponses[Math.floor(Math.random() * kakaResponses.length)];
      
      const kakaMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: randomResponse,
        sender: 'kaka',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, kakaMessage]);
      setIsKakaSpeaking(false);
    }, 1000 + Math.random() * 2000);
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
                <p className="text-sm text-gray-600">Sahabat belajar terbaik!</p>
              </div>
            </div>
            <div className="flex space-x-2">
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
                      ? 'bg-gradient-indonesia text-white shadow-red-soft'
                      : 'bg-white-indonesia border-2 border-red-indonesia/20 shadow-soft'
                  }`}>
                    <p className={`text-base leading-relaxed ${
                      message.sender === 'kaka' ? 'text-white' : 'text-gray-800'
                    }`}>
                      {message.content}
                    </p>
                    <p className={`text-xs mt-2 ${
                      message.sender === 'kaka' ? 'text-white/80' : 'text-gray-500'
                    }`}>
                      {message.timestamp.toLocaleTimeString('id-ID', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </p>
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
                  <Card className="bg-gradient-indonesia text-white p-4 shadow-red-soft">
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
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ketik pesan atau tekan tombol mikrofon untuk bicara..."
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
            <p className="text-sm text-gray-600">
              💡 Tips: Tanya apa saja tentang pelajaran, hobi, atau hal menarik lainnya!
            </p>
          </div>
        </div>
      </div>

      {/* Floating Koala Helper */}
      <FloatingKoala className="absolute bottom-20 right-6 z-20 hidden lg:block" />
    </div>
  );
}