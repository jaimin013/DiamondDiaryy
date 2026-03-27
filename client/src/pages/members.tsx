import { useTranslation } from "react-i18next";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Member } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  ChevronLeft,
  PlusCircle,
  Eye,
  Users,
  Edit2,
  Trash2,
  Calendar,
} from "lucide-react";
import { Link } from "wouter";
import React from "react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export default function Members() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = React.useState("");

  const { data: members } = useQuery<Member[]>({
    queryKey: ["/api/members"],
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest("DELETE", `/api/members/${id}`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/members"] });
      toast({
        title: "Success",
        description: "Member deleted successfully",
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

  const filteredMembers = members?.filter(
    (m) =>
      m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.serialNumber.includes(searchTerm),
  );

  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: "var(--bg-secondary)" }}
    >
      <div className="max-w-6xl mx-auto p-3 sm:p-4 md:p-6 lg:p-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 sm:mb-8 gap-3 sm:gap-4">
          <div className="flex items-start sm:items-center gap-2 sm:gap-4 w-full sm:w-auto">
            <Link href="/">
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 transition-all"
                style={{
                  color: "var(--text-secondary)",
                }}
              >
                <ChevronLeft className="h-5 w-5 sm:h-6 sm:w-6" />
              </Button>
            </Link>
            <div>
              <h1
                className="text-2xl sm:text-3xl font-bold"
                style={{ color: "var(--text-primary)" }}
              >
                {t("Family Members")}
              </h1>
              <p
                className="text-xs sm:text-sm mt-1"
                style={{ color: "var(--text-secondary)" }}
              >
                {filteredMembers?.length || 0} {t("Members")}
              </p>
            </div>
          </div>
          <Link href="/add-member" className="w-full sm:w-auto">
            <Button
              className="w-full sm:w-auto gap-2 h-10 sm:h-11 text-sm sm:text-base"
              style={{
                backgroundColor: "var(--color-primary)",
                color: "white",
              }}
            >
              <PlusCircle className="h-4 w-4" />
              <span className="hidden sm:inline">{t("Add Member")}</span>
              <span className="sm:hidden">{t("Add")}</span>
            </Button>
          </Link>
        </div>

        {/* Search Bar */}
        <div className="mb-5 sm:mb-6">
          <input
            type="text"
            placeholder={t("Search members...")}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 sm:px-4 py-2 sm:py-3 rounded-lg text-sm sm:text-base focus:outline-none transition-colors duration-200"
            style={{
              backgroundColor: "var(--bg-primary)",
              color: "var(--text-primary)",
              borderColor: "var(--border-color)",
              borderWidth: "1px",
            }}
          />
        </div>

        {/* Members Grid */}
        {filteredMembers && filteredMembers.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-5 lg:gap-6">
            {filteredMembers.map((member) => (
              <Card
                key={member.id}
                className="group relative p-4 sm:p-5 md:p-6 rounded-lg transition-all duration-300 overflow-hidden"
                style={{
                  backgroundColor: "var(--bg-primary)",
                  borderColor: "var(--border-color)",
                  borderWidth: "1px",
                  boxShadow: "0 1px 3px rgba(0, 0, 0, 0.08)",
                }}
              >
                <div className="relative space-y-3 sm:space-y-4">
                  <div>
                    <p
                      className="text-xs uppercase tracking-wider"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      {t("Member ID")}
                    </p>
                    <p
                      className="font-mono text-sm sm:text-base"
                      style={{ color: "var(--text-primary)" }}
                    >
                      #{member.serialNumber}
                    </p>
                  </div>

                  <div
                    style={{
                      borderColor: "var(--border-light)",
                      borderTopWidth: "1px",
                    }}
                    className="pt-3 sm:pt-4"
                  >
                    <h3
                      className="text-lg sm:text-xl font-bold group-hover:text-emerald-600 transition-colors line-clamp-2"
                      style={{ color: "var(--text-primary)" }}
                    >
                      {member.name}
                    </h3>
                  </div>

                  {/* Action Buttons */}
                  <div
                    className="flex flex-col gap-2 pt-3 sm:pt-4"
                    style={{
                      borderColor: "var(--border-light)",
                      borderTopWidth: "1px",
                    }}
                  >
                    {/* Primary Actions - Add & View */}
                    <div className="flex gap-2">
                      <Link
                        href={`/member/${member.id}/add-diamonds`}
                        className="flex-1"
                      >
                        <Button
                          variant="outline"
                          className="w-full h-9 sm:h-10 text-xs sm:text-sm transition-all"
                          style={{
                            borderColor: "var(--border-color)",
                            color: "var(--color-primary)",
                          }}
                        >
                          <PlusCircle className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                          <span className="hidden sm:inline">
                            {t("Add Diamond")}
                          </span>
                          <span className="sm:hidden">{t("Add")}</span>
                        </Button>
                      </Link>
                      <Link href={`/member/${member.id}/view`}>
                        <Button
                          variant="outline"
                          className="h-9 sm:h-10 text-xs sm:text-sm transition-all"
                          style={{
                            borderColor: "var(--border-color)",
                            color: "var(--color-primary)",
                          }}
                        >
                          <Eye className="h-3 w-3 sm:h-4 sm:w-4" />
                        </Button>
                      </Link>
                    </div>

                    {/* Secondary Actions - Edit & Delete */}
                    <div className="flex gap-2">
                      <Link
                        href={`/member/${member.id}/edit`}
                        className="flex-1"
                      >
                        <Button
                          variant="outline"
                          className="w-full h-9 sm:h-10 text-xs sm:text-sm transition-all"
                          style={{
                            borderColor: "var(--border-color)",
                            color: "var(--color-primary)",
                          }}
                        >
                          <Edit2 className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                          <span className="hidden sm:inline">{t("Edit")}</span>
                        </Button>
                      </Link>
                      <Button
                        variant="outline"
                        className="h-9 sm:h-10 text-xs sm:text-sm transition-all"
                        style={{
                          borderColor: "var(--border-color)",
                          color: "var(--color-error)",
                        }}
                        onClick={() => deleteMutation.mutate(member.id)}
                        disabled={deleteMutation.isPending}
                      >
                        <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                      </Button>
                    </div>

                    {/* Tertiary Actions - Calendar */}
                    <Link
                      href={`/member/${member.id}/calendar`}
                      className="w-full"
                    >
                      <Button
                        variant="outline"
                        className="w-full h-9 sm:h-10 text-xs sm:text-sm transition-all"
                        style={{
                          borderColor: "var(--border-color)",
                          color: "var(--color-secondary)",
                        }}
                      >
                        <Calendar className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                        <span className="hidden sm:inline">
                          {t("Work Schedule")}
                        </span>
                        <span className="sm:hidden">{t("Schedule")}</span>
                      </Button>
                    </Link>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card
            className="p-6 sm:p-8 md:p-12 text-center rounded-lg"
            style={{
              backgroundColor: "var(--bg-primary)",
              borderColor: "var(--border-color)",
              borderWidth: "1px",
              boxShadow: "0 1px 3px rgba(0, 0, 0, 0.08)",
            }}
          >
            <div style={{ color: "var(--text-secondary)" }} className="mb-4">
              <Users className="h-10 w-10 sm:h-12 sm:w-12 mx-auto opacity-50 mb-3 sm:mb-4" />
              <p
                className="text-base sm:text-lg font-medium"
                style={{ color: "var(--text-primary)" }}
              >
                {t("No members found")}
              </p>
              <p className="text-xs sm:text-sm mt-2">
                {t("Get started by adding your first family member")}
              </p>
            </div>
            <Link href="/add-member">
              <Button
                className="mt-4 gap-2 h-10 sm:h-11 text-sm sm:text-base"
                style={{
                  backgroundColor: "var(--color-primary)",
                  color: "white",
                }}
              >
                <PlusCircle className="h-4 w-4" />
                {t("Add First Member")}
              </Button>
            </Link>
          </Card>
        )}
      </div>
    </div>
  );
}
