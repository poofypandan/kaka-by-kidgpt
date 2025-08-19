import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { VoiceInput } from '@/components/VoiceInput';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { 
  MessageCircle, 
  Mic, 
  Phone, 
  Clock, 
  Home, 
  Star, 
  Book, 
  Gamepad2,
  Heart,
  Shield
} from 'lucide-react';

interface Child {
  id: string;
  first_name: string;
  grade: number;
  daily_limit_min: number;
  used_today_min: number;
}

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  created_at: string;
}

export default function ChildSafeInterface() {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [child, setChild] = useState<Child | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [currentActivity, setCurrentActivity] = useState<'chat' | 'stories' | 'games' | 'homework'>('chat');

  useEffect(() => {
    loadChildData();
    startTimeTracking();
  }, []);

  const loadChildData = async () => {
    if (!user) return;

    try {
      // Get child data - in a real app, this would be from the selected child
      const { data: childData, error } = await supabase
        .from('children')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) throw error;
      setChild(childData);
      setTimeRemaining(childData.daily_limit_min - childData.used_today_min);

      // Load recent messages
      const { data: messagesData } = await supabase
        .from('messages')
        .select('*')
        .eq('child_id', childData.id)
        .order('created_at', { ascending: true })
        .limit(20);

      if (messagesData) {
        setMessages(messagesData.map(msg => ({
          id: msg.id,
          content: msg.content,
          role: msg.role as 'user' | 'assistant',
          created_at: msg.created_at
        })));
      }
    } catch (error) {
      console.error('Error loading child data:', error);
    }
  };

  const startTimeTracking = () => {
    const interval = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          handleTimeUp();
          return 0;
        }
        return prev - 1;
      });
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  };

  const handleTimeUp = () => {
    toast.error('Waktu belajar hari ini sudah habis. Sampai jumpa besok!');
    setTimeout(() => {
      navigate('/');
    }, 3000);
  };

  const sendMessage = async () => {
    if (!inputValue.trim() || !child) return;

    const userMessage = {
      id: Math.random().toString(),
      content: inputValue,
      role: 'user' as const,
      created_at: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      // Call AI chat function
      const { data, error } = await supabase.functions.invoke('kaka-chat', {
        body: {
          message: inputValue,
          childId: child.id,
          grade: child.grade
        }
      });

      if (error) throw error;

      const assistantMessage = {
        id: Math.random().toString(),
        content: data.response,
        role: 'assistant' as const,
        created_at: new Date().toISOString()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Maaf, ada masalah. Coba lagi ya!');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmergencyCall = () => {
    toast.success('Memanggil orang tua...');
    // In a real app, this would trigger parent notification
  };

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}j ${mins}m` : `${mins}m`;
  };

  if (!child) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-yellow-100 to-orange-100">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-100 via-orange-50 to-pink-100">
      {/* Safe Header */}
      <header className="bg-white/90 backdrop-blur border-b-2 border-yellow-200 shadow-sm">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-400 to-orange-400 flex items-center justify-center">
                <span className="text-2xl">🐨</span>
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-800">Halo, {child.first_name}!</h1>
                <p className="text-sm text-gray-600">Mari belajar bersama Kaka</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
                <Clock className="h-3 w-3 mr-1" />
                {formatTime(timeRemaining)}
              </Badge>
              
              <Button
                onClick={handleEmergencyCall}
                size="sm"
                className="bg-red-500 hover:bg-red-600 text-white"
              >
                <Phone className="h-4 w-4 mr-1" />
                Panggil Mama/Papa
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Activity Selection */}
        <div className="mb-6">
          <div className="flex gap-2 overflow-x-auto pb-2">
            <Button
              variant={currentActivity === 'chat' ? 'default' : 'outline'}
              onClick={() => setCurrentActivity('chat')}
              className="flex-shrink-0"
            >
              <MessageCircle className="h-4 w-4 mr-2" />
              Chat
            </Button>
            <Button
              variant={currentActivity === 'stories' ? 'default' : 'outline'}
              onClick={() => setCurrentActivity('stories')}
              className="flex-shrink-0"
            >
              <Book className="h-4 w-4 mr-2" />
              Cerita
            </Button>
            <Button
              variant={currentActivity === 'games' ? 'default' : 'outline'}
              onClick={() => setCurrentActivity('games')}
              className="flex-shrink-0"
            >
              <Gamepad2 className="h-4 w-4 mr-2" />
              Permainan
            </Button>
            <Button
              variant={currentActivity === 'homework' ? 'default' : 'outline'}
              onClick={() => setCurrentActivity('homework')}
              className="flex-shrink-0"
            >
              <Star className="h-4 w-4 mr-2" />
              PR
            </Button>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Chat Interface */}
          <div className="lg:col-span-2">
            <Card className="h-[600px] flex flex-col">
              <CardContent className="flex-1 p-4 overflow-hidden">
                {/* Kaka Character */}
                <div className="text-center mb-4">
                  <div className="text-6xl">🐨</div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto space-y-4 mb-4 max-h-[400px]">
                  {messages.length === 0 && (
                    <div className="text-center py-8">
                      <div className="text-6xl mb-4">🐨</div>
                      <h3 className="text-lg font-semibold text-gray-700 mb-2">
                        Halo {child.first_name}!
                      </h3>
                      <p className="text-gray-600">
                        Aku Kaka, teman belajarmu. Apa yang ingin kita pelajari hari ini?
                      </p>
                    </div>
                  )}

                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[80%] p-3 rounded-2xl ${
                          message.role === 'user'
                            ? 'bg-blue-500 text-white'
                            : 'bg-white border-2 border-yellow-200'
                        }`}
                      >
                        {message.role === 'assistant' && (
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-xl">🐨</span>
                            <span className="text-sm font-medium text-gray-600">Kaka</span>
                          </div>
                        )}
                        <p className="text-sm">{message.content}</p>
                      </div>
                    </div>
                  ))}

                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="bg-white border-2 border-yellow-200 p-3 rounded-2xl">
                        <div className="flex items-center gap-2">
                          <span className="text-xl">🐨</span>
                          <div className="flex gap-1">
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Input Area */}
                <div className="flex gap-2">
                  <div className="flex-1 flex gap-2">
                    <input
                      type="text"
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                      placeholder="Ketik pesan kamu di sini..."
                      className="flex-1 p-3 border-2 border-yellow-200 rounded-xl focus:border-yellow-400 focus:outline-none text-base"
                      disabled={isLoading}
                    />
                    <VoiceInput onTranscription={setInputValue} />
                  </div>
                  <Button
                    onClick={sendMessage}
                    disabled={isLoading || !inputValue.trim()}
                    className="px-6 bg-yellow-400 hover:bg-yellow-500 text-yellow-900"
                  >
                    Kirim
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Safety Status */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Shield className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium">Status Keamanan</span>
                </div>
                <Badge variant="outline" className="bg-green-100 text-green-800">
                  Aman
                </Badge>
              </CardContent>
            </Card>

            {/* Achievements */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Star className="h-4 w-4 text-yellow-600" />
                  <span className="text-sm font-medium">Pencapaian Hari Ini</span>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">🏆</span>
                    <span className="text-sm">Belajar 30 menit</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xl">📚</span>
                    <span className="text-sm">5 pertanyaan dijawab</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Heart className="h-4 w-4 text-pink-600" />
                  <span className="text-sm font-medium">Aksi Cepat</span>
                </div>
                <div className="space-y-2">
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    🎯 Kuis Matematika
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    📖 Baca Cerita
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    🎨 Aktivitas Kreatif
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}