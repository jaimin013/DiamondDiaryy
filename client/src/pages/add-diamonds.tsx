import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient, useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, getQueryFn } from "@/lib/queryClient";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChevronLeft, Plus } from "lucide-react";
import { Link, useRoute } from "wouter";
import { useToast } from "@/hooks/use-toast";
import React from "react";
import { z } from "zod";

// Schema for quick diamond entry
const quickDiamondSchema = z.object({
  date: z.string().min(1, "Date is required"),
  diamondPriceId: z.string().min(1, "Please select a diamond type"),
  quantity: z.number().min(0.01, "Quantity must be greater than 0"),
});

export default function AddDiamonds() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, params] = useRoute("/member/:id/add-diamonds");
  const memberId = params ? parseInt(params.id) : null;

  // Fetch diamond prices
  const { data: diamondPrices = [] } = useQuery({
    queryKey: ["/api/diamond-prices"],
    queryFn: getQueryFn({ on401: "throw" }),
  });

  const form = useForm({
    resolver: zodResolver(quickDiamondSchema),
    defaultValues: {
      date: new Date().toISOString().split("T")[0],
      diamondPriceId: "",
      quantity: 0,
    },
  });

  const selectedPriceId = form.watch("diamondPriceId");
  const quantity = form.watch("quantity");

  // Get the selected diamond price details
  const selectedPrice = diamondPrices.find(
    (p: any) => p.id === parseInt(selectedPriceId),
  );
  const total = selectedPrice ? selectedPrice.price * (quantity || 0) : 0;

  const mutation = useMutation({
    mutationFn: async (data: any) => {
      if (!memberId) throw new Error("Member ID is required");
      if (!selectedPrice) throw new Error("Invalid diamond price selected");

      const formattedData = {
        date: data.date,
        memberId,
        weightFrom: selectedPrice.weightFrom,
        weightTo: selectedPrice.weightTo,
        price: selectedPrice.price,
        quantity: Number(data.quantity),
        total: parseFloat(total.toFixed(2)),
      };

      const res = await apiRequest("POST", "/api/diamonds", formattedData);
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Failed to save: ${errorText}`);
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/diamonds"] });
      toast({
        title: "Success",
        description: "Diamond entry added successfully",
      });
      form.reset({
        date: new Date().toISOString().split("T")[0],
        diamondPriceId: "",
        quantity: 0,
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return (
    <div className="min-h-screen bg-[var(--bg-secondary)] text-[var(--text-primary)] transition-colors duration-200 p-3 sm:p-4 md:p-6 lg:p-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 mb-8 sm:mb-10 md:mb-12">
          <div className="flex items-start sm:items-center gap-2 sm:gap-4 flex-1">
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
              <h1 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)]">
                Add Diamond
              </h1>
              <p className="text-[var(--text-secondary)] text-xs sm:text-sm mt-1">
                Quick entry with price tiers
              </p>
            </div>
          </div>
          <Link href="/diamond-prices" className="w-full sm:w-auto">
            <Button
              className="w-full sm:w-auto gap-2 h-10 sm:h-11 text-sm sm:text-base transition-colors"
              style={{
                backgroundColor: "var(--color-secondary)",
                color: "var(--text-primary)",
              }}
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Manage Prices</span>
              <span className="sm:hidden">Prices</span>
            </Button>
          </Link>
        </div>

        {/* Main Card */}
        <Card className="bg-[var(--bg-primary)] border border-[var(--border-color)] transition-colors">
          <CardHeader className="border-b border-[var(--border-color)] pb-4 sm:pb-6 px-4 sm:px-6 pt-4 sm:pt-6">
            <CardTitle className="text-[var(--text-primary)] text-lg sm:text-2xl">
              Diamond Entry
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 sm:pt-8 px-4 sm:px-6 pb-4 sm:pb-6">
            {diamondPrices.length === 0 ? (
              <div className="text-center py-8 sm:py-12">
                <p className="text-[var(--text-secondary)] mb-2 sm:mb-4 text-base sm:text-lg">
                  No diamond prices configured
                </p>
                <p className="text-[var(--text-secondary)]/70 text-xs sm:text-sm mb-4 sm:mb-6">
                  You need to create price tiers first
                </p>
                <Link href="/diamond-prices">
                  <Button
                    className="gap-2 h-10 sm:h-11 text-sm sm:text-base transition-colors"
                    style={{
                      backgroundColor: "var(--color-secondary)",
                      color: "var(--text-primary)",
                    }}
                  >
                    <Plus className="h-4 w-4" />
                    Create Your First Price
                  </Button>
                </Link>
              </div>
            ) : (
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit((data) => mutation.mutate(data))}
                  className="space-y-4 sm:space-y-6"
                >
                  {/* Date Field */}
                  <FormField
                    control={form.control}
                    name="date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[var(--text-secondary)] text-xs sm:text-sm uppercase tracking-wider">
                          Date
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="date"
                            {...field}
                            className="bg-[var(--bg-tertiary)] border-[var(--border-color)] text-[var(--text-primary)] focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)]/50 h-10 sm:h-11 text-sm sm:text-base transition-colors"
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  {/* Diamond Type Selection */}
                  <FormField
                    control={form.control}
                    name="diamondPriceId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[var(--text-secondary)] text-xs sm:text-sm uppercase tracking-wider">
                          Select Diamond Type
                        </FormLabel>
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <FormControl>
                            <SelectTrigger className="bg-[var(--bg-tertiary)] border-[var(--border-color)] text-[var(--text-primary)] focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)]/50 h-10 sm:h-11 text-sm sm:text-base transition-colors">
                              <SelectValue placeholder="Choose a type..." />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="bg-[var(--bg-primary)] border-[var(--border-color)]">
                            {diamondPrices.map((price: any) => (
                              <SelectItem
                                key={price.id}
                                value={price.id.toString()}
                                className="text-white focus:bg-emerald-500/20 text-sm sm:text-base"
                              >
                                {price.name} ({price.weightFrom} -{" "}
                                {price.weightTo}) @ ₹{price.price}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />

                  {/* Selected Price Details */}
                  {selectedPrice && (
                    <div className="p-3 sm:p-4 bg-gradient-to-r from-emerald-500/10 to-emerald-500/5 border border-emerald-500/30 rounded-lg space-y-2">
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-start gap-2">
                        <div className="flex-1">
                          <p className="text-emerald-300 text-xs sm:text-sm uppercase tracking-wider font-semibold">
                            {selectedPrice.name}
                          </p>
                          <p className="text-slate-300 text-xs sm:text-sm mt-1">
                            Weight: {selectedPrice.weightFrom} -{" "}
                            {selectedPrice.weightTo}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-slate-400 text-xs uppercase">
                            Price/Unit
                          </p>
                          <p className="text-xl sm:text-2xl font-bold text-emerald-400">
                            ₹{selectedPrice.price}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Quantity Field */}
                  <FormField
                    control={form.control}
                    name="quantity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[var(--text-secondary)] text-xs sm:text-sm uppercase tracking-wider">
                          Quantity
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            placeholder="Enter quantity"
                            {...field}
                            onChange={(e) =>
                              field.onChange(
                                e.target.value ? Number(e.target.value) : 0,
                              )
                            }
                            className="bg-[var(--bg-tertiary)] border-[var(--border-color)] text-[var(--text-primary)] placeholder-[var(--text-secondary)]/50 focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)]/50 h-10 sm:h-11 text-sm sm:text-base transition-colors"
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  {/* Total */}
                  <div className="p-3 sm:p-4 bg-[var(--bg-primary)] rounded-lg border border-[var(--border-color)] transition-colors">
                    <div className="text-[var(--text-secondary)]/70 text-xs uppercase tracking-wider mb-1">
                      Total Amount
                    </div>
                    <div className="text-3xl sm:text-4xl font-bold text-[var(--color-secondary)]">
                      ₹{total.toFixed(2)}
                    </div>
                  </div>

                  {/* Buttons */}
                  <div className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-3 pt-3 sm:pt-6">
                    <Link href="/members" className="w-full sm:w-1/3">
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full border-[var(--border-color)] hover:border-[var(--color-primary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] h-10 sm:h-11 text-sm sm:text-base transition-colors"
                      >
                        Cancel
                      </Button>
                    </Link>
                    <Button
                      type="submit"
                      className="flex-1 sm:flex-1 font-semibold h-10 sm:h-11 text-sm sm:text-base transition-colors"
                      style={{
                        backgroundColor: "var(--color-secondary)",
                        color: "var(--text-primary)",
                      }}
                      disabled={mutation.isPending || !selectedPrice}
                    >
                      {mutation.isPending ? "Adding..." : "Add Diamond"}
                    </Button>
                  </div>
                </form>
              </Form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
