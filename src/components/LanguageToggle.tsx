import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import { Globe } from "lucide-react";

export function LanguageToggle() {
  const { i18n } = useTranslation();

  const toggleLanguage = () => {
    const newLang = i18n.language === 'id' ? 'en' : 'id';
    i18n.changeLanguage(newLang);
  };

  const currentLang = i18n.language === 'id' ? 'ID' : 'EN';
  const currentCountry = i18n.language === 'id' ? 'ID' : 'US';

  return (
    <Button
      onClick={toggleLanguage}
      variant="outline"
      size="sm"
      className="flex items-center gap-2 h-9 px-3 rounded-full border-border/50 hover:border-primary/50 transition-colors"
    >
      <Globe className="h-4 w-4 text-muted-foreground" />
      <span className="text-sm font-medium">
        {currentCountry} {currentLang}
      </span>
    </Button>
  );
}