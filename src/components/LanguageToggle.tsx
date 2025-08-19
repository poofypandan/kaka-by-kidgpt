import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import { Globe } from "lucide-react";

export function LanguageToggle() {
  const { i18n } = useTranslation();

  const toggleLanguage = () => {
    const newLang = i18n.language === 'id' ? 'en' : 'id';
    i18n.changeLanguage(newLang);
  };

  return (
    <Button
      onClick={toggleLanguage}
      variant="ghost"
      size="sm"
      className="flex items-center gap-2 h-12 px-3 md:px-4"
    >
      <Globe className="h-4 w-4" />
      <span className="text-lg">
        {i18n.language === 'id' ? '🇮🇩' : '🇺🇸'}
      </span>
      <span className="hidden md:inline-block">
        {i18n.language === 'id' ? 'ID' : 'EN'}
      </span>
    </Button>
  );
}