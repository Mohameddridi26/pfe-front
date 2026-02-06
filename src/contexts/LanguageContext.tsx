import { createContext, useContext, useEffect, useState, ReactNode } from "react";

export type Language = "fr" | "en" | "ar";

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  fr: {
    // Navigation
    "nav.accueil": "Accueil",
    "nav.services": "Services",
    "nav.tarifs": "Tarifs",
    "nav.planning": "Planning",
    "nav.admin": "Admin",
    "nav.abonnements": "Abonnements",
    "nav.espace_membre": "Espace Membre",
    "nav.connexion": "Connexion",
    "nav.deconnexion": "Déconnexion",
    "nav.parametres": "Paramètres",
    // Paramètres
    "settings.title": "Paramètres",
    "settings.theme": "Thème",
    "settings.theme.light": "Clair",
    "settings.theme.dark": "Sombre",
    "settings.theme.system": "Système",
    "settings.language": "Langue",
    "settings.language.fr": "Français",
    "settings.language.en": "English",
    "settings.language.ar": "العربية",
    "settings.notifications": "Notifications",
    "settings.notifications.enable": "Activer les notifications",
    "settings.accessibility": "Accessibilité",
    "settings.accessibility.high_contrast": "Contraste élevé",
  },
  en: {
    // Navigation
    "nav.accueil": "Home",
    "nav.services": "Services",
    "nav.tarifs": "Pricing",
    "nav.planning": "Schedule",
    "nav.admin": "Admin",
    "nav.abonnements": "Subscriptions",
    "nav.espace_membre": "Member Area",
    "nav.connexion": "Login",
    "nav.deconnexion": "Logout",
    "nav.parametres": "Settings",
    // Paramètres
    "settings.title": "Settings",
    "settings.theme": "Theme",
    "settings.theme.light": "Light",
    "settings.theme.dark": "Dark",
    "settings.theme.system": "System",
    "settings.language": "Language",
    "settings.language.fr": "Français",
    "settings.language.en": "English",
    "settings.language.ar": "العربية",
    "settings.notifications": "Notifications",
    "settings.notifications.enable": "Enable notifications",
    "settings.accessibility": "Accessibility",
    "settings.accessibility.high_contrast": "High contrast",
  },
  ar: {
    // Navigation
    "nav.accueil": "الرئيسية",
    "nav.services": "الخدمات",
    "nav.tarifs": "الأسعار",
    "nav.planning": "الجدول",
    "nav.admin": "الإدارة",
    "nav.abonnements": "الاشتراكات",
    "nav.espace_membre": "مساحة العضو",
    "nav.connexion": "تسجيل الدخول",
    "nav.deconnexion": "تسجيل الخروج",
    "nav.parametres": "الإعدادات",
    // Paramètres
    "settings.title": "الإعدادات",
    "settings.theme": "المظهر",
    "settings.theme.light": "فاتح",
    "settings.theme.dark": "داكن",
    "settings.theme.system": "النظام",
    "settings.language": "اللغة",
    "settings.language.fr": "Français",
    "settings.language.en": "English",
    "settings.language.ar": "العربية",
    "settings.notifications": "الإشعارات",
    "settings.notifications.enable": "تفعيل الإشعارات",
    "settings.accessibility": "إمكانية الوصول",
    "settings.accessibility.high_contrast": "تباين عالي",
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const stored = localStorage.getItem("fitzone_language");
    return (stored as Language) || "fr";
  });

  useEffect(() => {
    localStorage.setItem("fitzone_language", language);
    document.documentElement.lang = language;
    document.documentElement.dir = language === "ar" ? "rtl" : "ltr";
  }, [language]);

  const setLanguage = (newLanguage: Language) => {
    setLanguageState(newLanguage);
  };

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};
