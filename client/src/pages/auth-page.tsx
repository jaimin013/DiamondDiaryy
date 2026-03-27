import { useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema } from "@shared/schema";
import { useTranslation } from "react-i18next";
import { LanguageSelect } from "@/components/language-select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLocation } from "wouter";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Package, LogIn, UserPlus } from "lucide-react";

export default function AuthPage() {
  const { t } = useTranslation();
  const [, setLocation] = useLocation();
  const { user, loginMutation, registerMutation } = useAuth();
  const { toast } = useToast();

  const loginForm = useForm({
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const registerForm = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      password: "",
      name: "",
      email: "",
      language: "en",
      notificationTime: "07:00",
      notificationsEnabled: "true",
    },
  });

  useEffect(() => {
    if (user) {
      setLocation("/");
    }
  }, [user, setLocation]);

  if (user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[var(--bg-secondary)] flex flex-col items-center justify-center p-3 sm:p-4 md:p-6 transition-colors duration-200">
      {/* Background decoration - hide on tiny screens */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-48 h-48 sm:w-96 sm:h-96 bg-[var(--color-primary)]/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-48 h-48 sm:w-96 sm:h-96 bg-[var(--color-primary)]/5 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Language selector and header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8 gap-3">
          <div>
            <h2 className="text-xs sm:text-sm text-[var(--text-secondary)] uppercase tracking-widest font-semibold">
              Welcome Back
            </h2>
          </div>
          <LanguageSelect />
        </div>

        {/* Main card */}
        <Card className="bg-[var(--bg-primary)] border border-[var(--border-color)] shadow-2xl transition-colors duration-200">
          {/* Header */}
          <div className="bg-gradient-to-r from-[var(--color-secondary)]/10 to-transparent border-b border-[var(--border-color)] px-4 sm:px-6 py-6 sm:py-8">
            <div className="flex items-center gap-2 sm:gap-3 mb-2">
              <div
                className="p-2 sm:p-3 rounded-lg"
                style={{
                  backgroundImage: `linear-gradient(135deg, var(--color-secondary) 0%, var(--color-secondary) 100%)`,
                }}
              >
                <Package className="h-5 w-5 sm:h-6 sm:w-6 text-[var(--text-primary)]" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-[var(--color-secondary)]">
                Diamond Diary
              </h1>
            </div>
            <p className="text-[var(--text-secondary)] text-xs sm:text-sm">
              Manage your precious collection
            </p>
          </div>

          <CardContent className="p-4 sm:p-8">
            <Tabs defaultValue="login" className="w-full">
              <TabsList
                className="grid w-full grid-cols-2 gap-1 sm:gap-0"
                style={{
                  backgroundColor: "var(--bg-tertiary)",
                  borderColor: "var(--border-color)",
                  borderWidth: "1px",
                }}
              >
                <TabsTrigger
                  value="login"
                  className="gap-1 sm:gap-2 transition-all text-xs sm:text-sm py-2"
                  style={{
                    background: "transparent",
                    color: "var(--text-secondary)",
                  }}
                >
                  <LogIn className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="hidden sm:inline">{t("login")}</span>
                  <span className="sm:hidden">Sign In</span>
                </TabsTrigger>
                <TabsTrigger
                  value="register"
                  className="gap-1 sm:gap-2 transition-all text-xs sm:text-sm py-2"
                  style={{
                    background: "transparent",
                    color: "var(--text-secondary)",
                  }}
                >
                  <UserPlus className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="hidden sm:inline">{t("register")}</span>
                  <span className="sm:hidden">Register</span>
                </TabsTrigger>
              </TabsList>

              {/* Login Tab */}
              <TabsContent
                value="login"
                className="space-y-3 sm:space-y-6 mt-6 sm:mt-8"
              >
                <Form {...loginForm}>
                  <form
                    onSubmit={loginForm.handleSubmit((data) =>
                      loginMutation.mutate(data),
                    )}
                    className="space-y-3 sm:space-y-4"
                  >
                    <FormField
                      control={loginForm.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel
                            className="text-xs sm:text-sm uppercase tracking-wider"
                            style={{ color: "var(--text-primary)" }}
                          >
                            {t("username")}
                          </FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="Enter your username"
                              className="h-10 sm:h-11 text-sm sm:text-base"
                              style={{
                                backgroundColor: "var(--bg-tertiary)",
                                borderColor: "var(--border-color)",
                                color: "var(--text-primary)",
                              }}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={loginForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel
                            className="text-xs sm:text-sm uppercase tracking-wider"
                            style={{ color: "var(--text-primary)" }}
                          >
                            {t("password")}
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="password"
                              {...field}
                              placeholder="Enter your password"
                              className="h-10 sm:h-11 text-sm sm:text-base"
                              style={{
                                backgroundColor: "var(--bg-tertiary)",
                                borderColor: "var(--border-color)",
                                color: "var(--text-primary)",
                              }}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <Button
                      type="submit"
                      className="w-full h-10 sm:h-11 text-white font-semibold text-base sm:text-lg mt-4 sm:mt-6"
                      style={{
                        backgroundColor: "var(--color-secondary)",
                        color: "var(--text-primary)",
                      }}
                      disabled={loginMutation.isPending}
                    >
                      {loginMutation.isPending ? "Signing in..." : "Sign In"}
                    </Button>
                  </form>
                </Form>
              </TabsContent>

              {/* Register Tab */}
              <TabsContent
                value="register"
                className="space-y-3 sm:space-y-6 mt-6 sm:mt-8"
              >
                <Form {...registerForm}>
                  <form
                    onSubmit={registerForm.handleSubmit((data) =>
                      registerMutation.mutate(data),
                    )}
                    className="space-y-3 sm:space-y-4"
                  >
                    <FormField
                      control={registerForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel
                            className="text-xs sm:text-sm uppercase tracking-wider"
                            style={{ color: "var(--text-primary)" }}
                          >
                            {t("name")}
                          </FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="Full name"
                              className="h-10 sm:h-11 text-sm sm:text-base"
                              style={{
                                backgroundColor: "var(--bg-tertiary)",
                                borderColor: "var(--border-color)",
                                color: "var(--text-primary)",
                              }}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={registerForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel
                            className="text-xs sm:text-sm uppercase tracking-wider"
                            style={{ color: "var(--text-primary)" }}
                          >
                            {t("email")}
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="email"
                              {...field}
                              placeholder="Email address"
                              className="h-10 sm:h-11 text-sm sm:text-base"
                              style={{
                                backgroundColor: "var(--bg-tertiary)",
                                borderColor: "var(--border-color)",
                                color: "var(--text-primary)",
                              }}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={registerForm.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel
                            className="text-xs sm:text-sm uppercase tracking-wider"
                            style={{ color: "var(--text-primary)" }}
                          >
                            {t("username")}
                          </FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="Choose username"
                              className="h-10 sm:h-11 text-sm sm:text-base"
                              style={{
                                backgroundColor: "var(--bg-tertiary)",
                                borderColor: "var(--border-color)",
                                color: "var(--text-primary)",
                              }}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={registerForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel
                            className="text-xs sm:text-sm uppercase tracking-wider"
                            style={{ color: "var(--text-primary)" }}
                          >
                            {t("password")}
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="password"
                              {...field}
                              placeholder="Min 6 characters"
                              className="h-10 sm:h-11 text-sm sm:text-base"
                              style={{
                                backgroundColor: "var(--bg-tertiary)",
                                borderColor: "var(--border-color)",
                                color: "var(--text-primary)",
                              }}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <Button
                      type="submit"
                      className="w-full h-10 sm:h-11 text-white font-semibold text-base sm:text-lg mt-4 sm:mt-6"
                      style={{
                        backgroundColor: "var(--color-secondary)",
                        color: "var(--text-primary)",
                      }}
                      disabled={registerMutation.isPending}
                    >
                      {registerMutation.isPending
                        ? "Creating account..."
                        : "Create Account"}
                    </Button>
                  </form>
                </Form>
                <p
                  className="text-xs sm:text-sm text-center mt-3 sm:mt-4"
                  style={{ color: "var(--text-secondary)" }}
                >
                  By registering, you agree to manage your diamond collection
                  securely
                </p>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
