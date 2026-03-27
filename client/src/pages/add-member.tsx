import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertMemberSchema, addMemberSchema } from "@shared/schema";
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
  FormMessage,
} from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronLeft } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";

export default function AddMember() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();

  const form = useForm({
    resolver: zodResolver(addMemberSchema),
    defaultValues: {
      serialNumber: "",
      name: "",
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/members", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/members"] });
      toast({ title: "Success", description: "Member added successfully" });
      setLocation("/members");
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
          <Link href="/members">
            <Button
              variant="ghost"
              size="icon"
              className="hover:bg-[var(--color-primary)]/10 text-[var(--text-secondary)] hover:text-[var(--color-primary)] h-9 w-9 sm:h-10 sm:w-10 transition-colors"
            >
              <ChevronLeft className="h-5 w-5 sm:h-6 sm:w-6" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[var(--color-secondary)]">
              Add New Member
            </h1>
            <p className="text-[var(--text-secondary)] text-xs sm:text-sm mt-1">
              Welcome a new family member
            </p>
          </div>
        </div>

        {/* Form Card */}
        <Card className="bg-[var(--bg-primary)] border border-[var(--border-color)] transition-colors duration-200">
          <CardHeader className="border-b border-[var(--border-color)] pb-4 sm:pb-6 px-4 sm:px-6 pt-4 sm:pt-6">
            <CardTitle className="text-[var(--text-primary)] text-lg sm:text-2xl">
              Member Details
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 sm:pt-8 px-4 sm:px-6 pb-4 sm:pb-6">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit((data) => mutation.mutate(data))}
                className="space-y-4 sm:space-y-6"
              >
                <FormField
                  control={form.control}
                  name="serialNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[var(--text-secondary)] text-xs sm:text-sm uppercase tracking-wider">
                        Member ID <span className="text-red-400">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="e.g., MEM-001"
                          className="bg-[var(--bg-tertiary)] border-[var(--border-color)] text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)]/20 h-10 sm:h-11 text-sm sm:text-base transition-colors duration-200"
                        />
                      </FormControl>
                      <FormMessage className="text-xs text-red-400" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[var(--text-secondary)] text-xs sm:text-sm uppercase tracking-wider">
                        Full Name <span className="text-red-400">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Enter member's name"
                          className="bg-[var(--bg-tertiary)] border-[var(--border-color)] text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)]/20 h-10 sm:h-11 text-sm sm:text-base transition-colors duration-200"
                        />
                      </FormControl>
                      <FormMessage className="text-xs text-red-400" />
                    </FormItem>
                  )}
                />

                <div className="pt-3 sm:pt-6 flex flex-col-reverse sm:flex-row gap-2 sm:gap-3">
                  <Link href="/members" className="w-full sm:w-auto">
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full sm:w-auto border-[var(--border-color)] hover:border-[var(--color-primary)] text-[var(--text-secondary)] h-10 sm:h-11 text-sm sm:text-base transition-colors"
                    >
                      Cancel
                    </Button>
                  </Link>
                  <Button
                    type="submit"
                    disabled={mutation.isPending}
                    className="flex-1 sm:flex-none font-semibold h-10 sm:h-11 text-sm sm:text-base transition-all duration-200"
                    style={{
                      backgroundColor: "var(--color-secondary)",
                      color: "var(--text-primary)",
                    }}
                  >
                    {mutation.isPending ? "Adding..." : "Add Member"}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
