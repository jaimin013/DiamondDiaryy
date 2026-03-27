import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { addDiamondPriceSchema } from "@shared/schema";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import { ChevronLeft, Trash2, Edit2, Package, Plus } from "lucide-react";
import { useState } from "react";

export default function DiamondPrices() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editingId, setEditingId] = useState<number | null>(null);

  const { data: prices = [] } = useQuery<any[]>({
    queryKey: ["/api/diamond-prices"],
    queryFn: getQueryFn({ on401: "throw" }),
  });

  const form = useForm({
    resolver: zodResolver(addDiamondPriceSchema),
    defaultValues: {
      name: "",
      weightFrom: 0,
      weightTo: 0,
      price: 0,
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/diamond-prices", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/diamond-prices"] });
      toast({
        title: "Success",
        description: "Diamond price added successfully",
      });
      form.reset();
      setEditingId(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest(
        "PUT",
        `/api/diamond-prices/${editingId}`,
        data,
      );
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/diamond-prices"] });
      toast({
        title: "Success",
        description: "Diamond price updated successfully",
      });
      form.reset();
      setEditingId(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest("DELETE", `/api/diamond-prices/${id}`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/diamond-prices"] });
      toast({
        title: "Success",
        description: "Diamond price deleted successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleEdit = (price: any) => {
    setEditingId(price.id);
    form.setValue("name", price.name);
    form.setValue("weightFrom", price.weightFrom);
    form.setValue("weightTo", price.weightTo);
    form.setValue("price", price.price);
  };

  const handleCancel = () => {
    setEditingId(null);
    form.reset();
  };

  const onSubmit = (data: any) => {
    if (editingId) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-secondary)] text-[var(--text-primary)] transition-colors duration-200 p-3 sm:p-4 md:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-start sm:items-center justify-between gap-3 sm:gap-4 mb-8 sm:mb-10 md:mb-12">
          <div className="flex items-start sm:items-center gap-2 sm:gap-4 flex-1">
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
              <h1 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)] flex items-center gap-2">
                <Package className="h-6 w-6 sm:h-8 sm:w-8 text-[var(--color-secondary)]" />
                <span className="hidden sm:inline">Diamond Price Tiers</span>
                <span className="sm:hidden">Prices</span>
              </h1>
              <p className="text-[var(--text-secondary)] text-xs sm:text-sm mt-1">
                Manage categories for quick entry
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-5 md:gap-6">
          {/* Form Section */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4 lg:top-8 bg-[var(--bg-primary)] border border-[var(--border-color)] transition-colors">
              <CardHeader className="bg-[var(--color-secondary)]/10 border-b border-[var(--border-color)] px-4 sm:px-6 py-4 sm:py-6">
                <CardTitle className="text-[var(--text-primary)] flex items-center gap-2 text-base sm:text-lg">
                  <Plus className="h-4 w-4 sm:h-5 sm:w-5 text-[var(--color-secondary)]" />
                  {editingId ? "Edit Tier" : "New Tier"}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 sm:pt-6 px-4 sm:px-6 pb-4 sm:pb-6">
                <Form {...form}>
                  <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-3 sm:space-y-4"
                  >
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-[var(--text-secondary)] text-xs uppercase tracking-wider">
                            Name
                          </FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="e.g., Small"
                              className="bg-[var(--bg-tertiary)] border-[var(--border-color)] text-[var(--text-primary)] placeholder-[var(--text-secondary)]/50 focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)]/50 h-10 sm:h-11 text-sm sm:text-base transition-colors"
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <FormField
                        control={form.control}
                        name="weightFrom"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-[var(--text-secondary)] text-xs uppercase tracking-wider">
                              From
                            </FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                step="0.1"
                                {...field}
                                onChange={(e) =>
                                  field.onChange(
                                    e.target.value
                                      ? parseFloat(e.target.value)
                                      : 0,
                                  )
                                }
                                value={field.value || ""}
                                placeholder="0.0"
                                className="bg-[var(--bg-tertiary)] border-[var(--border-color)] text-[var(--text-primary)] placeholder-[var(--text-secondary)]/50 focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)]/50 h-10 sm:h-11 text-sm sm:text-base transition-colors"
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="weightTo"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-[var(--text-secondary)] text-xs uppercase tracking-wider">
                              To
                            </FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                step="0.1"
                                {...field}
                                onChange={(e) =>
                                  field.onChange(
                                    e.target.value
                                      ? parseFloat(e.target.value)
                                      : 0,
                                  )
                                }
                                value={field.value || ""}
                                placeholder="0.0"
                                className="bg-[var(--bg-tertiary)] border-[var(--border-color)] text-[var(--text-primary)] placeholder-[var(--text-secondary)]/50 focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)]/50 h-10 sm:h-11 text-sm sm:text-base transition-colors"
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>
                    <FormField
                      control={form.control}
                      name="price"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-[var(--text-secondary)] text-xs uppercase tracking-wider">
                            Price/Unit (₹)
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.01"
                              {...field}
                              onChange={(e) =>
                                field.onChange(
                                  e.target.value
                                    ? parseFloat(e.target.value)
                                    : 0,
                                )
                              }
                              value={field.value || ""}
                              placeholder="0.00"
                              className="bg-[var(--bg-tertiary)] border-[var(--border-color)] text-[var(--text-primary)] placeholder-[var(--text-secondary)]/50 focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)]/50 h-10 sm:h-11 text-sm sm:text-base transition-colors"
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <div className="flex gap-2 pt-2 sm:pt-3">
                      <Button
                        type="submit"
                        className="flex-1 font-semibold h-10 sm:h-11 text-sm sm:text-base transition-colors"
                        style={{
                          backgroundColor: "var(--color-secondary)",
                          color: "var(--text-primary)",
                        }}
                        disabled={
                          createMutation.isPending || updateMutation.isPending
                        }
                      >
                        {editingId ? "Update" : "Add"}
                      </Button>
                      {editingId && (
                        <Button
                          type="button"
                          variant="outline"
                          className="border-[var(--border-color)] hover:border-[var(--color-primary)] h-10 sm:h-11 text-sm sm:text-base transition-colors"
                          onClick={handleCancel}
                        >
                          Cancel
                        </Button>
                      )}
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>

          {/* List Section */}
          <div className="lg:col-span-3">
            <Card className="bg-[var(--bg-primary)] border border-[var(--border-color)] transition-colors">
              <CardHeader className="border-b border-[var(--border-color)] pb-4 sm:pb-6 px-4 sm:px-6 pt-4 sm:pt-6">
                <CardTitle className="text-[var(--text-primary)] text-lg sm:text-2xl">
                  All Price Tiers ({prices.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 sm:pt-6 px-4 sm:px-6 pb-4 sm:pb-6">
                {prices.length === 0 ? (
                  <div className="text-center py-8 sm:py-12">
                    <Package className="h-10 w-10 sm:h-12 sm:w-12 mx-auto text-[var(--text-secondary)]/50 mb-3 sm:mb-4" />
                    <p className="text-[var(--text-secondary)] mb-2 sm:mb-4 text-sm sm:text-base">
                      No price tiers added yet
                    </p>
                    <p className="text-[var(--text-secondary)]/70 text-xs sm:text-sm">
                      Create your first tier to get started
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    {prices.map((price: any) => (
                      <div
                        key={price.id}
                        className="group p-3 sm:p-4 border border-[var(--border-color)] rounded-lg hover:border-[var(--color-secondary)]/50 hover:bg-[var(--bg-tertiary)]/50 transition-all duration-300"
                      >
                        <div className="flex items-start justify-between mb-2 sm:mb-3">
                          <div className="flex-1">
                            <h3 className="font-bold text-[var(--text-primary)] text-base sm:text-lg group-hover:text-[var(--color-secondary)] transition-colors line-clamp-1">
                              {price.name}
                            </h3>
                            <p className="text-[var(--text-secondary)] text-xs sm:text-sm mt-1">
                              {price.weightFrom} - {price.weightTo}
                            </p>
                          </div>
                          <div className="text-lg sm:text-2xl font-bold text-[var(--color-secondary)] ml-2">
                            ₹{price.price}
                          </div>
                        </div>
                        <div className="flex gap-2 pt-2 sm:pt-3 border-t border-[var(--border-color)]">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="flex-1 text-[var(--text-secondary)] hover:text-[var(--color-secondary)] hover:bg-[var(--color-secondary)]/10 h-9 text-xs sm:text-sm transition-colors"
                            onClick={() => handleEdit(price)}
                          >
                            <Edit2 className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                            <span className="hidden sm:inline">Edit</span>
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="flex-1 h-9 text-xs sm:text-sm transition-colors"
                            style={{ color: "var(--color-error)" }}
                            onClick={() => deleteMutation.mutate(price.id)}
                          >
                            <Trash2 className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                            <span className="hidden sm:inline">Delete</span>
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
