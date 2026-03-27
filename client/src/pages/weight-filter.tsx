import { useTranslation } from "react-i18next";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertWeightFilterSchema } from "@shared/schema";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
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
import { ChevronLeft, Plus, Trash2 } from "lucide-react";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";

export default function WeightFilter() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: weightFilter } = useQuery<{
    ranges: { from: number; to: number; price: number }[];
  }>({
    queryKey: ["/api/weight-filters"],
  });

  const form = useForm({
    resolver: zodResolver(insertWeightFilterSchema),
    defaultValues: {
      ranges: weightFilter?.ranges ?? [{ from: 0, to: 0, price: 0 }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "ranges",
  });

  const mutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/weight-filters", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/weight-filters"] });
      toast({
        title: "Success",
        description: "Weight filters saved successfully",
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

  return (
    <div className="min-h-screen bg-[var(--bg-secondary)] text-[var(--text-primary)] transition-colors duration-200 p-4">
      <div className="flex items-center mb-4">
        <Link href="/">
          <Button
            variant="ghost"
            size="icon"
            className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>
        </Link>
        <h1 className="text-xl font-bold text-[var(--text-primary)]">
          {t("weight.filter")}
        </h1>
      </div>

      <Card className="bg-[var(--bg-primary)] border border-[var(--border-color)] transition-colors">
        <CardHeader className="border-b border-[var(--border-color)]">
          <CardTitle className="text-[var(--text-primary)]">
            {t("weight.filter")}
          </CardTitle>
        </CardHeader>
        <CardContent className="bg-[var(--bg-secondary)]">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit((data) => mutation.mutate(data))}
              className="space-y-4"
            >
              {fields.map((field, index) => (
                <div key={field.id} className="flex gap-2 items-end">
                  <div className="flex-1">
                    <FormLabel className="text-[var(--text-secondary)]">
                      {t("from")}
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        {...form.register(`ranges.${index}.from`)}
                        className="bg-[var(--bg-primary)] border-[var(--border-color)] text-[var(--text-primary)] focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)]/50 transition-colors"
                      />
                    </FormControl>
                  </div>
                  <div className="flex-1">
                    <FormLabel className="text-[var(--text-secondary)]">
                      {t("to")}
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        {...form.register(`ranges.${index}.to`)}
                        className="bg-[var(--bg-primary)] border-[var(--border-color)] text-[var(--text-primary)] focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)]/50 transition-colors"
                      />
                    </FormControl>
                  </div>
                  <div className="flex-1">
                    <FormLabel className="text-[var(--text-secondary)]">
                      {t("price")}
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        {...form.register(`ranges.${index}.price`)}
                        className="bg-[var(--bg-primary)] border-[var(--border-color)] text-[var(--text-primary)] focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)]/50 transition-colors"
                      />
                    </FormControl>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => remove(index)}
                    disabled={fields.length === 1}
                    className="text-[var(--text-secondary)] hover:text-[var(--color-secondary)] transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}

              <Button
                type="button"
                variant="outline"
                className="w-full border-[var(--border-color)] hover:border-[var(--color-primary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                onClick={() => append({ from: 0, to: 0, price: 0 })}
              >
                <Plus className="h-4 w-4 mr-2" />
                {t("Add Range")}
              </Button>

              <Button
                type="submit"
                className="w-full transition-colors"
                style={{
                  backgroundColor: "var(--color-secondary)",
                  color: "var(--text-primary)",
                }}
                disabled={mutation.isPending}
              >
                {t("save")}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
