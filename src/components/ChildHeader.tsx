import { ArrowLeft, Phone, Settings, ShieldCheck, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface ChildHeaderProps {
  childName: string;
  onHomeClick: () => void;
  onEmergencyCall: () => void;
  onParentMode: () => void;
  showEmergencyButton?: boolean;
  title?: string;
  subtitle?: string;
}

export default function ChildHeader({
  childName,
  onHomeClick,
  onEmergencyCall,
  onParentMode,
  showEmergencyButton = true,
  title,
  subtitle
}: ChildHeaderProps) {
  return (
    <header className="bg-white/90 backdrop-blur-sm border-b-4 border-rainbow shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={onHomeClick}
              className="p-2 hover:bg-blue-100"
            >
              <ArrowLeft className="h-5 w-5 text-blue-600" />
            </Button>
            
            <img 
              src="/lovable-uploads/3c6d677b-f566-47d7-8a38-d8f86401741b.png" 
              alt="Kaka Logo" 
              className="h-8 w-16 object-contain animate-bounce-gentle"
            />
            
            <div>
              <h1 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                {title || "Kaka"} 
                <Star className="h-4 w-4 text-yellow-500" />
              </h1>
              <p className="text-sm text-gray-600">
                {subtitle || `${childName} sedang belajar`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Safety indicator */}
            <div className="hidden sm:flex items-center gap-1 bg-green-50 text-green-700 px-2 py-1 rounded-full text-xs">
              <ShieldCheck className="h-3 w-3" />
              <span>Aman</span>
            </div>

            {/* Emergency call button */}
            {showEmergencyButton && (
              <Button
                variant="outline"
                size="sm"
                onClick={onEmergencyCall}
                className="bg-red-100 hover:bg-red-200 text-red-600 border-red-200 flex items-center gap-1 animate-pulse"
              >
                <Phone className="h-4 w-4" />
                <span className="hidden sm:inline">Panggil Ayah/Ibu</span>
              </Button>
            )}

            {/* Parent mode access */}
            <Button
              variant="ghost"
              size="sm"
              onClick={onParentMode}
              className="p-2 hover:bg-gray-100"
            >
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}