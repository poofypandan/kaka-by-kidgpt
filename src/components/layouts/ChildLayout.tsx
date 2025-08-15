import { ReactNode, useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useUserRole } from '@/hooks/useUserRole';
import { 
  MessageCircle, 
  Gamepad2, 
  BookOpen, 
  Phone,
  Clock,
  Home,
  Heart
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

interface ChildLayoutProps {
  children: ReactNode;
}

export function ChildLayout({ children }: ChildLayoutProps) {
  const { familyMember, family } = useUserRole();
  const location = useLocation();
  const navigate = useNavigate();
  const [timeRemaining, setTimeRemaining] = useState(45); // minutes
  const [timeUsed, setTimeUsed] = useState(15); // minutes

  const navigationItems = [
    {
      name: 'Chat dengan Kaka',
      href: '/chat',
      icon: MessageCircle,
      color: 'from-blue-400 to-blue-600'
    },
    {
      name: 'Permainan',
      href: '/games',
      icon: Gamepad2,
      color: 'from-green-400 to-green-600'
    },
    {
      name: 'Cerita',
      href: '/stories',
      icon: BookOpen,
      color: 'from-purple-400 to-purple-600'
    },
    {
      name: 'Beranda',
      href: '/child-dashboard',
      icon: Home,
      color: 'from-orange-400 to-orange-600'
    }
  ];

  const dailyLimit = familyMember?.daily_time_limit || 60;
  const progressPercentage = (timeUsed / dailyLimit) * 100;

  const handleEmergencyContact = () => {
    // TODO: Implement emergency contact functionality
    navigate('/emergency-contact');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-orange-50 to-red-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-orange-200 p-4">
        <div className="flex items-center justify-between">
          {/* Kaka Avatar and Greeting */}
          <div className="flex items-center space-x-3">
            <div className="relative">
              <Avatar className="w-12 h-12 border-2 border-orange-300">
                <AvatarFallback className="bg-gradient-to-br from-orange-400 to-red-500 text-white font-bold">
                  🐨
                </AvatarFallback>
              </Avatar>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white" />
            </div>
            <div>
              <p className="text-lg font-bold text-orange-800">
                Halo, {familyMember?.name || 'Adik'}! 👋
              </p>
              <p className="text-sm text-orange-600">
                Kaka siap bermain denganmu!
              </p>
            </div>
          </div>

          {/* Emergency Contact Button */}
          <Button 
            variant="outline"
            size="sm"
            className="border-red-300 text-red-600 hover:bg-red-50"
            onClick={handleEmergencyContact}
          >
            <Phone className="h-4 w-4 mr-2" />
            Hubungi Ayah/Ibu
          </Button>
        </div>

        {/* Time Remaining Indicator */}
        <Card className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-blue-600" />
              <span className="font-medium text-blue-800">Waktu Bermain</span>
            </div>
            <span className="text-lg font-bold text-blue-800">
              {timeRemaining} menit tersisa
            </span>
          </div>
          <Progress 
            value={progressPercentage} 
            className="h-2 bg-blue-100"
          />
          <p className="text-xs text-blue-600 mt-1">
            Sudah bermain {timeUsed} menit dari {dailyLimit} menit hari ini
          </p>
        </Card>
      </header>

      {/* Navigation */}
      <nav className="p-4">
        <div className="grid grid-cols-2 gap-4">
          {navigationItems.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                className="block"
              >
                <Card className={`
                  p-6 transition-all duration-200 hover:scale-105 cursor-pointer
                  ${isActive 
                    ? `bg-gradient-to-br ${item.color} text-white shadow-lg` 
                    : 'bg-white hover:shadow-lg border-2 border-orange-100 hover:border-orange-200'
                  }
                `}>
                  <div className="flex flex-col items-center space-y-3">
                    <div className={`
                      p-3 rounded-full
                      ${isActive 
                        ? 'bg-white/20' 
                        : `bg-gradient-to-br ${item.color}`
                      }
                    `}>
                      <item.icon className={`
                        h-8 w-8
                        ${isActive ? 'text-white' : 'text-white'}
                      `} />
                    </div>
                    <span className={`
                      font-bold text-center text-sm
                      ${isActive ? 'text-white' : 'text-gray-700'}
                    `}>
                      {item.name}
                    </span>
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Main content */}
      <main className="px-4 pb-6">
        {children}
      </main>

      {/* Floating Kaka Helper */}
      <div className="fixed bottom-6 right-6 z-50">
        <Button 
          size="lg"
          className="rounded-full w-16 h-16 bg-gradient-to-br from-orange-400 to-red-500 hover:from-orange-500 hover:to-red-600 shadow-lg"
          onClick={() => navigate('/chat')}
        >
          <Heart className="h-6 w-6 text-white" />
        </Button>
      </div>
    </div>
  );
}