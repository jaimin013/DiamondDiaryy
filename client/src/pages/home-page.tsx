import { useAuth } from "@/hooks/use-auth";
import { useTranslation } from "react-i18next";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { UserPlus, Users, Eye, Settings, LogOut, Package } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";

export default function HomePage() {
  const { t } = useTranslation();
  const { logoutMutation } = useAuth();

  const menuItems = [
    {
      path: "/members",
      label: t("Members"),
      icon: Users,
      desc: t("Manage all family members"),
    },
    {
      path: "/add-member",
      label: t("Add Member"),
      icon: UserPlus,
      desc: t("Welcome a new member"),
    },
    {
      path: "/view-diamonds",
      label: t("All Diamonds"),
      icon: Eye,
      desc: t("View complete collection"),
    },
    {
      path: "/diamond-prices",
      label: t("Price Tiers"),
      icon: Package,
      desc: t("Configure price categories"),
    },
    {
      path: "/settings",
      label: t("Settings"),
      icon: Settings,
      desc: t("Preferences & language"),
    },
  ];

  return (
    <div className="min-h-screen bg-[var(--bg-secondary)] transition-colors duration-200">
      <div className="max-w-6xl mx-auto p-3 sm:p-4 md:p-6 lg:p-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 sm:mb-10 md:mb-12 gap-4">
          <div className="flex-1">
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-[var(--color-secondary)] mb-2">
              {t("Diamond Diary")}
            </h1>
            <p className="text-[var(--text-secondary)] text-xs sm:text-sm md:text-base">
              {t("Manage your precious collection")}
            </p>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <ThemeToggle />
            <Button
              variant="outline"
              size="sm"
              className="border-red-500/50 dark:border-red-400/50 hover:bg-red-500/10 dark:hover:bg-red-400/10 text-red-400 dark:text-red-600 hover:text-red-300 dark:hover:text-red-700 transition-all gap-2 text-xs sm:text-sm h-9 sm:h-10 md:h-11"
              onClick={() => logoutMutation.mutate()}
            >
              <LogOut className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">{t("Logout")}</span>
              <span className="sm:hidden">{t("Out")}</span>
            </Button>
          </div>
        </div>

        {/* Menu Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-5 lg:gap-6">
          {menuItems.map((item) => (
            <Link key={item.path} href={item.path}>
              <Card className="group relative p-4 sm:p-5 md:p-6 bg-[var(--bg-primary)] border border-[var(--border-color)] hover:border-[var(--color-primary)] hover:shadow-lg transition-all duration-300 cursor-pointer overflow-hidden active:scale-95 sm:active:scale-100">
                {/* Gradient overlay on hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-primary)]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                <div className="relative space-y-2 sm:space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="p-2 sm:p-3 rounded-lg bg-[var(--color-primary)]/10 group-hover:bg-[var(--color-primary)]/20 transition-colors">
                      <item.icon className="h-5 w-5 sm:h-6 sm:w-6 text-[var(--color-primary)]" />
                    </div>
                    <div className="text-[var(--color-primary)]/0 group-hover:text-[var(--color-primary)] transition-colors text-lg sm:text-xl">
                      →
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-base sm:text-lg text-[var(--text-primary)]">
                      {item.label}
                    </h3>
                    <p className="text-xs sm:text-sm text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] transition-colors">
                      {item.desc}
                    </p>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
