import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTranslation } from "react-i18next";
import { Globe } from "lucide-react";
import { useEffect, useState } from "react";

export function LanguageSelect() {
  const { i18n } = useTranslation();
  const [currentLanguage, setCurrentLanguage] = useState(i18n.language);

  useEffect(() => {
    setCurrentLanguage(i18n.language);
  }, [i18n.language]);

  const handleLanguageChange = (value: string) => {
    i18n.changeLanguage(value);
    localStorage.setItem("language", value);
    setCurrentLanguage(value);
  };

  return (
    <Select value={currentLanguage} onValueChange={handleLanguageChange}>
      <SelectTrigger className="w-fit gap-2 bg-slate-800 dark:bg-white border-slate-700 dark:border-slate-300 text-slate-300 dark:text-slate-900 hover:border-emerald-500 hover:text-emerald-400 dark:hover:text-emerald-600 transition-colors duration-200">
        <Globe className="h-4 w-4" />
        <SelectValue />
      </SelectTrigger>
      <SelectContent className="bg-slate-800 dark:bg-white border-slate-700 dark:border-slate-300 text-white dark:text-slate-900">
        <SelectItem
          value="en"
          className="focus:bg-emerald-500/20 dark:focus:bg-emerald-600/20 focus:text-emerald-300 dark:focus:text-emerald-600"
        >
          🇬🇧 English
        </SelectItem>
        <SelectItem
          value="gu"
          className="focus:bg-emerald-500/20 dark:focus:bg-emerald-600/20 focus:text-emerald-300 dark:focus:text-emerald-600"
        >
          🇮🇳 ગુજરાતી
        </SelectItem>
      </SelectContent>
    </Select>
  );
}
