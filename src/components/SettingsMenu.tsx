import { Settings, Moon, Sun, Monitor, Globe, Bell, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";
import { useTheme } from "@/contexts/ThemeContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useState, useEffect } from "react";

const SettingsMenu = () => {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage();
  const [notificationsEnabled, setNotificationsEnabled] = useState(() => {
    return localStorage.getItem("fitzone_notifications") === "true";
  });
  const [highContrast, setHighContrast] = useState(() => {
    const stored = localStorage.getItem("fitzone_high_contrast") === "true";
    if (stored) {
      document.documentElement.classList.add("high-contrast");
    }
    return stored;
  });

  useEffect(() => {
    if (highContrast) {
      document.documentElement.classList.add("high-contrast");
    } else {
      document.documentElement.classList.remove("high-contrast");
    }
  }, [highContrast]);

  const handleNotificationsToggle = (checked: boolean) => {
    setNotificationsEnabled(checked);
    localStorage.setItem("fitzone_notifications", checked.toString());
    if (checked && "Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  };

  const handleHighContrastToggle = (checked: boolean) => {
    setHighContrast(checked);
    localStorage.setItem("fitzone_high_contrast", checked.toString());
    document.documentElement.classList.toggle("high-contrast", checked);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center gap-2">
          <Settings className="w-4 h-4" />
          <span className="hidden sm:inline">{t("nav.parametres")}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end">
        <DropdownMenuLabel>{t("settings.title")}</DropdownMenuLabel>
        <DropdownMenuSeparator />

        {/* Thème */}
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            {resolvedTheme === "dark" ? (
              <Moon className="mr-2 h-4 w-4" />
            ) : (
              <Sun className="mr-2 h-4 w-4" />
            )}
            <span>{t("settings.theme")}</span>
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            <DropdownMenuRadioGroup value={theme} onValueChange={(value) => setTheme(value as "light" | "dark" | "system")}>
              <DropdownMenuRadioItem value="light">
                <Sun className="mr-2 h-4 w-4" />
                {t("settings.theme.light")}
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="dark">
                <Moon className="mr-2 h-4 w-4" />
                {t("settings.theme.dark")}
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="system">
                <Monitor className="mr-2 h-4 w-4" />
                {t("settings.theme.system")}
              </DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
          </DropdownMenuSubContent>
        </DropdownMenuSub>

        {/* Langue */}
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <Globe className="mr-2 h-4 w-4" />
            <span>{t("settings.language")}</span>
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            <DropdownMenuRadioGroup value={language} onValueChange={(value) => setLanguage(value as "fr" | "en" | "ar")}>
              <DropdownMenuRadioItem value="fr">
                🇫🇷 {t("settings.language.fr")}
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="en">
                🇬🇧 {t("settings.language.en")}
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="ar">
                🇹🇳 {t("settings.language.ar")}
              </DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
          </DropdownMenuSubContent>
        </DropdownMenuSub>

        <DropdownMenuSeparator />

        {/* Notifications */}
        <DropdownMenuGroup>
          <DropdownMenuCheckboxItem
            checked={notificationsEnabled}
            onCheckedChange={handleNotificationsToggle}
          >
            <Bell className="mr-2 h-4 w-4" />
            {t("settings.notifications.enable")}
          </DropdownMenuCheckboxItem>
        </DropdownMenuGroup>

        {/* Accessibilité */}
        <DropdownMenuGroup>
          <DropdownMenuCheckboxItem
            checked={highContrast}
            onCheckedChange={handleHighContrastToggle}
          >
            <Eye className="mr-2 h-4 w-4" />
            {t("settings.accessibility.high_contrast")}
          </DropdownMenuCheckboxItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default SettingsMenu;
