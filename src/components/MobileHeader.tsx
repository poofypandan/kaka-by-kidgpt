import { Button } from "@/components/ui/button";
import { LanguageToggle } from "@/components/LanguageToggle";
import { Menu, ArrowLeft } from "lucide-react";
import { useTranslation } from "react-i18next";
import { TouchOptimized } from "./TouchOptimized";

interface MobileHeaderProps {
  title: string;
  onBack?: () => void;
  onMenu?: () => void;
  showBack?: boolean;
  showMenu?: boolean;
}

export function MobileHeader({ 
  title, 
  onBack, 
  onMenu, 
  showBack = false, 
  showMenu = false 
}: MobileHeaderProps) {
  const { t } = useTranslation();

  return (
    <TouchOptimized>
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="flex justify-between items-center h-16 px-4">
          <div className="flex items-center space-x-3">
            {showBack && onBack && (
              <Button
                onClick={onBack}
                variant="ghost"
                size="sm"
                className="h-12 w-12 touch-target"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
            )}
            {showMenu && onMenu && (
              <Button
                onClick={onMenu}
                variant="ghost"
                size="sm"
                className="h-12 w-12 touch-target"
              >
                <Menu className="h-5 w-5" />
              </Button>
            )}
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-lg font-bold text-primary-foreground">
                🐨
              </div>
              <h1 className="text-lg font-bold text-primary">{title}</h1>
            </div>
          </div>
          
          <LanguageToggle />
        </div>
      </header>
    </TouchOptimized>
  );
}