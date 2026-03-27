import { useTranslation } from "react-i18next";
import { useAuth } from "@/hooks/use-auth";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertUserSchema } from "@shared/schema";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronLeft, Settings } from "lucide-react";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { Switch } from "@/components/ui/switch";
import { LanguageSelect } from "@/components/language-select";
import { ThemeToggle } from "@/components/theme-toggle";

export default function SettingsPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm({
    resolver: zodResolver(insertUserSchema.partial()),
    defaultValues: {
      name: user?.name || "",
      email: user?.email || "",
      notificationTime: user?.notificationTime || "07:00",
      notificationsEnabled: user?.notificationsEnabled || "true",
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("PATCH", "/api/settings", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      toast({ title: "Success", description: "Settings updated successfully" });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return (
    <div className="min-h-screen bg-[var(--bg-secondary)] transition-colors duration-200">
      <div className="max-w-2xl mx-auto p-3 sm:p-4 md:p-6 lg:p-8">
        {/* Header */}
        <div className="flex items-start sm:items-center gap-2 sm:gap-4 mb-8 sm:mb-10 md:mb-12">
          <Link href="/">
            <Button
              variant="ghost"
              size="icon"
              className="hover:bg-[var(--color-primary)]/10 text-[var(--text-secondary)] hover:text-[var(--color-primary)] h-9 w-9 sm:h-10 sm:w-10 transition-colors"
            >
              <ChevronLeft className="h-5 w-5 sm:h-6 sm:w-6" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[var(--color-primary)] flex items-center gap-2">
              <Settings className="h-6 w-6 sm:h-8 sm:w-8" />
              {t("Settings")}
            </h1>
            <p className="text-[var(--text-secondary)] text-xs sm:text-sm mt-1">
              {t("Manage your preferences")}
            </p>
          </div>
        </div>

        <div className="space-y-4 sm:space-y-6">
          {/* Theme Card */}
          <Card className="bg-[var(--bg-primary)] border border-[var(--border-color)] transition-colors duration-200">
            <CardHeader className="border-b border-[var(--border-color)] px-4 sm:px-6 py-4 sm:py-6">
              <CardTitle className="text-lg sm:text-xl text-[var(--text-primary)]">
                {t("theme")}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 sm:pt-6 px-4 sm:px-6 pb-4 sm:pb-6">
              <div className="flex items-center justify-between">
                <span className="text-[var(--text-secondary)] text-sm sm:text-base">
                  {t("Dark Mode")} / {t("Light Mode")}
                </span>
                <ThemeToggle />
              </div>
            </CardContent>
          </Card>

          {/* Language Card */}
          <Card className="bg-[var(--bg-primary)] border border-[var(--border-color)] transition-colors duration-200">
            <CardHeader className="border-b border-[var(--border-color)] px-4 sm:px-6 py-4 sm:py-6">
              <CardTitle className="text-lg sm:text-xl text-[var(--text-primary)]">
                {t("language")}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 sm:pt-6 px-4 sm:px-6 pb-4 sm:pb-6">
              <LanguageSelect />
            </CardContent>
          </Card>

          {/* Settings Card */}
          <Card className="bg-[var(--bg-primary)] border border-[var(--border-color)] transition-colors duration-200">
            <CardHeader className="border-b border-[var(--border-color)] px-4 sm:px-6 py-4 sm:py-6">
              <CardTitle className="text-lg sm:text-xl text-[var(--text-primary)]">
                {t("Profile & Notifications")}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 sm:pt-6 px-4 sm:px-6 pb-4 sm:pb-6">
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit((data) => mutation.mutate(data))}
                  className="space-y-3 sm:space-y-4"
                >
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[var(--text-secondary)] text-xs sm:text-sm uppercase tracking-wider">
                          {t("Name")}
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="Your name"
                            className="bg-[var(--bg-tertiary)] border-[var(--border-color)] text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)]/20 h-10 sm:h-11 text-sm sm:text-base transition-colors duration-200"
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[var(--text-secondary)] text-xs sm:text-sm uppercase tracking-wider">
                          {t("email")}
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            {...field}
                            placeholder="your@email.com"
                            className="bg-[var(--bg-tertiary)] border-[var(--border-color)] text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)]/20 h-10 sm:h-11 text-sm sm:text-base transition-colors duration-200"
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="notificationTime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[var(--text-secondary)] text-xs sm:text-sm uppercase tracking-wider">
                          {t("Notification Time")}
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="time"
                            {...field}
                            className="bg-[var(--bg-tertiary)] border-[var(--border-color)] text-[var(--text-primary)] focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)]/20 h-10 sm:h-11 text-sm sm:text-base transition-colors duration-200"
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="notificationsEnabled"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between p-3 sm:p-4 border border-[var(--border-color)] rounded-lg bg-[var(--bg-tertiary)] transition-colors duration-200">
                        <FormLabel className="text-[var(--text-secondary)] text-xs sm:text-sm uppercase tracking-wider mg-0">
                          {t("Enable Notifications")}
                        </FormLabel>
                        <FormControl>
                          <Switch
                            checked={field.value === "true"}
                            onCheckedChange={(checked) =>
                              field.onChange(checked ? "true" : "false")
                            }
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 dark:from-emerald-600 dark:to-emerald-700 dark:hover:from-emerald-700 dark:hover:to-emerald-800 text-white font-semibold h-10 sm:h-11 text-sm sm:text-base transition-colors duration-200"
                    disabled={mutation.isPending}
                  >
                    {mutation.isPending ? "Saving..." : "Save Settings"}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
