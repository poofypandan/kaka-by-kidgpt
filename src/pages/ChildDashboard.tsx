import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserRole } from '@/hooks/useUserRole';
import { ChildLayout } from '@/components/layouts/ChildLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  MessageCircle, 
  Gamepad2, 
  BookOpen, 
  Star,
  Trophy,
  Clock,
  Heart,
  Sparkles
} from 'lucide-react';

export default function ChildDashboard() {
  const { familyMember } = useUserRole();
  const navigate = useNavigate();
  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) {
      setGreeting('Selamat pagi');
    } else if (hour < 17) {
      setGreeting('Selamat siang');
    } else {
      setGreeting('Selamat sore');
    }
  }, []);

  const activities = [
    {
      id: 'chat',
      title: 'Chat dengan Kaka',
      description: 'Ngobrol seru dengan Kaka yang pintar!',
      icon: MessageCircle,
      color: 'from-blue-400 to-blue-600',
      path: '/chat',
      featured: true
    },
    {
      id: 'games',
      title: 'Permainan Seru',
      description: 'Main game edukatif yang menyenangkan',
      icon: Gamepad2,
      color: 'from-green-400 to-green-600',
      path: '/games',
      featured: false
    },
    {
      id: 'stories',
      title: 'Cerita Menarik',
      description: 'Dengarkan cerita-cerita yang seru',
      icon: BookOpen,
      color: 'from-purple-400 to-purple-600',
      path: '/stories',
      featured: false
    }
  ];

  const achievements = [
    { title: 'Anak Rajin', icon: Star, color: 'text-yellow-500' },
    { title: 'Belajar 7 Hari', icon: Trophy, color: 'text-orange-500' },
    { title: 'Teman Baik', icon: Heart, color: 'text-pink-500' }
  ];

  return (
    <ChildLayout>
      <div className="space-y-6">
        {/* Welcome Section */}
        <Card className="p-6 bg-gradient-to-r from-orange-100 via-yellow-100 to-red-100 border-orange-200">
          <div className="text-center space-y-4">
            <div className="text-6xl">🐨</div>
            <div>
              <h1 className="text-2xl font-bold text-orange-800 mb-2">
                {greeting}, {familyMember?.name || 'Adik'}!
              </h1>
              <p className="text-orange-700">
                Kaka sudah menunggu untuk bermain denganmu hari ini! 
                Ayo kita belajar dan bermain bersama! ✨
              </p>
            </div>
          </div>
        </Card>

        {/* Featured Activity - Chat */}
        <Card className="p-6 bg-gradient-to-br from-blue-400 to-blue-600 text-white overflow-hidden relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-12 -translate-x-12" />
          
          <div className="relative">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-3 bg-white/20 rounded-full">
                <MessageCircle className="h-8 w-8" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Chat dengan Kaka</h2>
                <p className="text-blue-100">Kaka siap mengobrol denganmu!</p>
              </div>
            </div>
            
            <Button 
              size="lg"
              className="bg-white text-blue-600 hover:bg-blue-50 font-bold"
              onClick={() => navigate('/chat')}
            >
              <Sparkles className="h-5 w-5 mr-2" />
              Mulai Ngobrol Sekarang!
            </Button>
          </div>
        </Card>

        {/* Other Activities */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {activities.filter(activity => !activity.featured).map((activity) => (
            <Card 
              key={activity.id}
              className="p-6 cursor-pointer transition-all duration-200 hover:scale-105 hover:shadow-lg border-2 border-orange-100 hover:border-orange-200"
              onClick={() => navigate(activity.path)}
            >
              <div className="flex items-center space-x-4">
                <div className={`p-3 rounded-full bg-gradient-to-br ${activity.color}`}>
                  <activity.icon className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-800">{activity.title}</h3>
                  <p className="text-sm text-gray-600">{activity.description}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Achievements */}
        <Card className="p-6 bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200">
          <h3 className="font-bold text-orange-800 mb-4 flex items-center">
            <Trophy className="h-5 w-5 mr-2" />
            Pencapaianmu
          </h3>
          <div className="flex flex-wrap gap-2">
            {achievements.map((achievement, index) => (
              <Badge 
                key={index}
                variant="secondary" 
                className="flex items-center space-x-2 p-2 bg-white border border-orange-200"
              >
                <achievement.icon className={`h-4 w-4 ${achievement.color}`} />
                <span className="text-gray-700">{achievement.title}</span>
              </Badge>
            ))}
          </div>
        </Card>

        {/* Today's Goal */}
        <Card className="p-6 bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
          <h3 className="font-bold text-green-800 mb-3 flex items-center">
            <Star className="h-5 w-5 mr-2" />
            Target Hari Ini
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-green-700">Belajar 20 menit</span>
              <Badge className="bg-green-100 text-green-800">15/20 menit</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-green-700">Jawab 5 pertanyaan</span>
              <Badge className="bg-green-100 text-green-800">3/5 selesai</Badge>
            </div>
          </div>
        </Card>
      </div>
    </ChildLayout>
  );
}
