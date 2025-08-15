import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Send, AlertTriangle, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

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
  flagged: boolean;
  flag_reason?: string;
}

const ChildChat = () => {
  const { childId } = useParams();
  const navigate = useNavigate();
  const [child, setChild] = useState<Child | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadChildAndMessages = async () => {
    if (!childId) return;

    try {
      setLoading(true);
      
      // Load child data
      const { data: childData, error: childError } = await supabase
        .from('children')
        .select('*')
        .eq('id', childId)
        .single();

      if (childError) {
        console.error('Error loading child:', childError);
        toast.error('Gagal memuat data anak');
        return;
      }

      setChild(childData);

      // Load existing messages
      const { data: messageData, error: messageError } = await supabase
        .from('messages')
        .select('*')
        .eq('child_id', childId)
        .order('created_at', { ascending: true });

      if (!messageError && messageData) {
        const formattedMessages = messageData.map(msg => ({
          id: msg.id,
          content: msg.content,
          role: msg.role as 'user' | 'assistant',
          created_at: msg.created_at,
          flagged: msg.flagged,
          flag_reason: msg.flag_reason
        }));
        setMessages(formattedMessages);
      }

    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Gagal memuat data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadChildAndMessages();
  }, [childId]);

  const sendMessage = async () => {
    if (!inputMessage.trim() || !child || sending) return;

    try {
      setSending(true);
      
      // Add user message to UI immediately
      const userMessage: Message = {
        id: `temp-${Date.now()}`,
        content: inputMessage,
        role: 'user',
        created_at: new Date().toISOString(),
        flagged: false
      };

      setMessages(prev => [...prev, userMessage]);
      setInputMessage('');

      // Save user message to database
      const { data: savedUserMessage, error: userMessageError } = await supabase
        .from('messages')
        .insert({
          child_id: childId,
          content: inputMessage,
          role: 'user',
          status: 'sent'
        })
        .select()
        .single();

      if (userMessageError) {
        console.error('Error saving user message:', userMessageError);
        toast.error('Gagal mengirim pesan');
        return;
      }

      // Call Kaka AI through edge function
      const { data: aiResponse, error: aiError } = await supabase.functions.invoke('kaka-chat', {
        body: {
          message: inputMessage,
          childId: childId,
          childGrade: child.grade,
          childName: child.first_name
        }
      });

      if (aiError) {
        console.error('Error calling AI:', aiError);
        toast.error('Kaka sedang tidak bisa merespons, coba lagi nanti');
        return;
      }

      // Add AI response to UI
      const aiMessage: Message = {
        id: `ai-${Date.now()}`,
        content: aiResponse.message || 'Maaf, Kaka tidak bisa merespons sekarang.',
        role: 'assistant',
        created_at: new Date().toISOString(),
        flagged: aiResponse.flagged || false,
        flag_reason: aiResponse.flag_reason
      };

      // Update messages with properly formatted data
      const formattedSavedMessage: Message = {
        id: savedUserMessage.id,
        content: savedUserMessage.content,
        role: savedUserMessage.role as 'user' | 'assistant',
        created_at: savedUserMessage.created_at,
        flagged: savedUserMessage.flagged,
        flag_reason: savedUserMessage.flag_reason
      };
      
      setMessages(prev => [...prev.filter(m => m.id !== userMessage.id), formattedSavedMessage, aiMessage]);

      // Save AI response to database
      await supabase
        .from('messages')
        .insert({
          child_id: childId,
          content: aiMessage.content,
          role: 'assistant',
          status: 'sent',
          flagged: aiMessage.flagged,
          flag_reason: aiMessage.flag_reason
        });

    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Gagal mengirim pesan');
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleEmergencyContact = () => {
    toast.success('Sedang menghubungi orang tua...');
    navigate('/family-dashboard');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Menyiapkan chat dengan Kaka...</p>
        </div>
      </div>
    );
  }

  if (!child) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-muted-foreground mb-4">Profil anak tidak ditemukan</p>
          <Button onClick={() => navigate('/family-dashboard')} variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Kembali ke Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-blue-200 px-4 py-3 shadow-sm">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(`/child/${childId}`)}
              className="text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <Avatar className="h-10 w-10">
              <AvatarFallback className="bg-gradient-to-br from-blue-400 to-indigo-400 text-white font-bold">
                🤖
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="font-semibold text-gray-800">Kaka AI</h1>
              <p className="text-sm text-muted-foreground">
                Chat dengan {child.first_name}
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleEmergencyContact}
            className="text-red-600 border-red-300 hover:bg-red-50"
          >
            <AlertTriangle className="mr-2 h-4 w-4" />
            Panggil Orang Tua
          </Button>
        </div>
      </div>

      {/* Welcome Message */}
      {messages.length === 0 && (
        <div className="max-w-4xl mx-auto px-4 py-6">
          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="p-6 text-center">
              <div className="text-6xl mb-4">🤖</div>
              <h2 className="text-2xl font-bold text-blue-800 mb-2">
                Halo, {child.first_name}! 👋
              </h2>
              <p className="text-blue-700 mb-4">
                Aku Kaka, teman belajar dan bermain yang seru! Aku bisa membantu kamu dengan:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-blue-600">
                <div className="flex items-center space-x-2">
                  <span>📚</span>
                  <span>Belajar mata pelajaran sekolah</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span>🎮</span>
                  <span>Bermain teka-teki dan kuis</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span>💡</span>
                  <span>Menjawab pertanyaan</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span>🎨</span>
                  <span>Berkreasi dan bercerita</span>
                </div>
              </div>
              <p className="text-blue-700 mt-4">
                Ayo mulai chat! Ketik pesan di bawah ini. 💬
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        <div className="max-w-4xl mx-auto space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-xs md:max-w-md lg:max-w-lg ${
                message.role === 'user' ? 'order-2' : 'order-1'
              }`}>
                {message.role === 'assistant' && (
                  <div className="flex items-center space-x-2 mb-1">
                    <Avatar className="h-6 w-6">
                      <AvatarFallback className="bg-blue-500 text-white text-xs">
                        🤖
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium text-gray-600">Kaka</span>
                  </div>
                )}
                <div className={`rounded-lg px-4 py-2 ${
                  message.role === 'user'
                    ? 'bg-blue-500 text-white'
                    : 'bg-white border border-gray-200'
                }`}>
                  <p className="text-sm md:text-base">{message.content}</p>
                  {message.flagged && (
                    <div className="mt-2">
                      <Badge variant="outline" className="text-yellow-600 border-yellow-300">
                        <AlertTriangle className="mr-1 h-3 w-3" />
                        Ditandai untuk ditinjau
                      </Badge>
                    </div>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-1 px-2">
                  {new Date(message.created_at).toLocaleTimeString('id-ID', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className="bg-white border-t border-gray-200 px-4 py-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex space-x-3">
            <Input
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={`Ketik pesan untuk Kaka...`}
              className="flex-1 border-gray-300 focus:border-blue-500"
              disabled={sending}
            />
            <Button
              onClick={sendMessage}
              disabled={!inputMessage.trim() || sending}
              className="bg-blue-500 hover:bg-blue-600 text-white"
            >
              {sending ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
          <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
            <span>
              Waktu tersisa: {Math.max(0, child.daily_limit_min - child.used_today_min)} menit
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/family-dashboard')}
              className="text-xs"
            >
              <Home className="mr-1 h-3 w-3" />
              Dashboard
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChildChat;