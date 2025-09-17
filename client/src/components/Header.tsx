import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Moon, Sun, Settings, User } from "lucide-react";

interface HeaderProps {
  businessName?: string;
  cashierName?: string;
  onOpenSettings?: () => void;
  className?: string;
}

export default function Header({ 
  businessName = "CashierPro", 
  cashierName = "Cashier",
  onOpenSettings 
}: HeaderProps) {
  const [isDark, setIsDark] = useState(true);

  const toggleTheme = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle("dark");
    console.log("Theme toggled:", !isDark ? "dark" : "light");
  };

  return (
    <header className="bg-card border-b border-card-border px-3 py-1" data-testid="header-main">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-sm">CP</span>
          </div>
          <div>
            <h1 className="text-base font-display font-semibold" data-testid="text-business-name">
              {businessName}
            </h1>
            <p className="text-xs text-muted-foreground">Sistema de peso y facturación</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium" data-testid="text-cashier-name">
              {cashierName}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="icon"
              variant="ghost"
              onClick={toggleTheme}
              data-testid="button-theme-toggle"
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </Button>

            <Button
              size="icon"
              variant="ghost"
              onClick={onOpenSettings}
              data-testid="button-settings"
            >
              <Settings className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}