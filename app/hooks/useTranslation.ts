import { useEffect, useState } from 'react';
import en from '../types/en';
import zh from '../types/zh';
import ja from '../types/ja';

const resources = {
  en,
  zh,
  ja
} as const;

export default async function useTranslation() {
  const [language, setLanguage] = useState<string>('en');
  const WebApp = (await import('@twa-dev/sdk')).default;
  useEffect(() => {
    // Detect language from Telegram or browser
    const detectLanguage = () => {
    const language = WebApp.initDataUnsafe.user?.language_code;
      if (language) {
        const langCode = language.split('-')[0];
        return Object.keys(resources).includes(langCode) ? langCode : 'en';
      }
      return navigator.language.split('-')[0] || 'en';
    };
    
    setLanguage(detectLanguage());
  }, []);

  const t = (key: keyof typeof en) => {
    return resources[language as keyof typeof resources]?.[key] || en[key];
  };

  return { t, language, setLanguage };
}