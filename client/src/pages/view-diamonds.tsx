import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { Diamond, Member } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronLeft, FileDown, X } from "lucide-react";
import { Link, useRoute } from "wouter";
import { format } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DiamondPDF } from "@/components/diamond-pdf";
import { useState, useMemo } from "react";
import { apiRequest } from "@/lib/queryClient";

export default function ViewDiamonds() {
  const { t } = useTranslation();
  const [showPDF, setShowPDF] = useState(false);
  const [selectedMemberId, setSelectedMemberId] = useState<number | null>(null);
  const [, params] = useRoute("/member/:id/view");
  const memberId = params ? parseInt(params.id) : undefined;

  // If viewing from member page, use that member; otherwise allow filtering
  const filterMemberId = memberId || selectedMemberId;

  const { data: diamonds } = useQuery<Diamond[]>({
    queryKey: ["/api/diamonds", filterMemberId],
    queryFn: async () => {
      try {
        const res = await apiRequest(
          "GET",
          `/api/diamonds${filterMemberId ? `?memberId=${filterMemberId}` : ""}`,
        );
        return await res.json();
      } catch (error) {
        console.error("Error fetching diamonds:", error);
        return [];
      }
    },
  });

  // Fetch all members for the filter dropdown
  const { data: allMembers = [] } = useQuery<Member[]>({
    queryKey: ["/api/members"],
    queryFn: async () => {
      try {
        const res = await apiRequest("GET", "/api/members");
        return await res.json();
      } catch (error) {
        console.error("Error fetching members:", error);
        return [];
      }
    },
    // Always fetch all members for filtering options
  });

  // Fetch specific member if viewing from member page
  const { data: member } = useQuery<Member>({
    queryKey: ["/api/members", memberId],
    queryFn: async () => {
      try {
        const res = await apiRequest("GET", `/api/members/${memberId}`);
        return await res.json();
      } catch (error) {
        console.error("Error fetching member:", error);
        throw error;
      }
    },
    enabled: !!memberId,
  });

  // Get selected member object for display and PDF
  const displayMember = useMemo(() => {
    if (memberId) return member;
    if (selectedMemberId) {
      return allMembers.find((m) => m.id === selectedMemberId);
    }
    return null;
  }, [memberId, member, selectedMemberId, allMembers]);

  // Create a map of member IDs to names for quick lookup
  const memberMap = allMembers.reduce(
    (acc, m) => ({
      ...acc,
      [m.id]: m.name,
    }),
    {} as Record<number, string>,
  );

  // Calculate totals based on filtered diamonds
  const totalDiamonds =
    diamonds?.reduce((acc, d) => acc + (Number(d.quantity) || 0), 0) || 0;
  const totalAmount =
    diamonds?.reduce((acc, d) => acc + (Number(d.total) || 0), 0) || 0;

  return (
    <div className="min-h-screen bg-[var(--bg-secondary)] text-[var(--text-primary)] transition-colors duration-200 p-3 sm:p-4 md:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 mb-6 sm:mb-8 md:mb-10">
          <div className="flex items-start sm:items-center gap-2 sm:gap-4">
            <Link href={memberId ? "/members" : "/"}>
              <Button
                variant="ghost"
                size="icon"
                className="hover:bg-[var(--color-primary)]/10 text-[var(--text-secondary)] hover:text-[var(--color-primary)] h-9 w-9 sm:h-10 sm:w-10 transition-colors"
              >
                <ChevronLeft className="h-5 w-5 sm:h-6 sm:w-6" />
              </Button>
            </Link>
            <h1 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)]">
              {memberId ? `${member?.name}'s Diamonds` : "All Diamonds"}
            </h1>
          </div>
          <Button
            onClick={() => setShowPDF(true)}
            className="w-full sm:w-auto gap-2 h-10 sm:h-11 text-sm sm:text-base transition-colors"
            style={{
              backgroundColor: "var(--color-secondary)",
              color: "var(--text-primary)",
            }}
          >
            <FileDown className="h-4 w-4" />
            <span className="hidden sm:inline">Export PDF</span>
            <span className="sm:hidden">PDF</span>
          </Button>
        </div>

        {/* Member Filter - Only show when not viewing from member page */}
        {!memberId && (
          <div className="mb-6 p-4 sm:p-6 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg transition-colors">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
              <label className="text-[var(--text-secondary)] font-medium text-sm sm:text-base">
                Filter by Member:
              </label>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <select
                  value={selectedMemberId || ""}
                  onChange={(e) =>
                    setSelectedMemberId(
                      e.target.value ? parseInt(e.target.value) : null,
                    )
                  }
                  className="flex-1 sm:flex-none px-3 sm:px-4 py-2 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border-color)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)]/50 text-sm sm:text-base transition-colors"
                >
                  <option value="">All Members</option>
                  {allMembers.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name}
                    </option>
                  ))}
                </select>
                {selectedMemberId && (
                  <button
                    onClick={() => setSelectedMemberId(null)}
                    className="p-2 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-slate-200 transition-colors"
                    title="Clear filter"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
            {selectedMemberId && (
              <p className="mt-3 text-[var(--text-secondary)] text-xs sm:text-sm">
                Showing data for:{" "}
                <span className="font-semibold text-[var(--color-secondary)]">
                  {displayMember?.name}
                </span>
              </p>
            )}
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 md:gap-6 mb-6 sm:mb-8">
          <Card className="bg-[var(--bg-primary)] border border-[var(--border-color)] transition-colors">
            <CardContent className="pt-4 sm:pt-6">
              <div className="space-y-2">
                <p className="text-[var(--text-secondary)] text-xs sm:text-sm uppercase tracking-wider">
                  {selectedMemberId
                    ? `${displayMember?.name} - Total Diamonds`
                    : "Total Diamonds"}
                </p>
                <p className="text-3xl sm:text-4xl font-bold text-[var(--color-secondary)]">
                  {totalDiamonds.toFixed(0)}
                </p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-[var(--bg-primary)] border border-[var(--border-color)] transition-colors">
            <CardContent className="pt-4 sm:pt-6">
              <div className="space-y-2">
                <p className="text-[var(--text-secondary)] text-xs sm:text-sm uppercase tracking-wider">
                  {selectedMemberId
                    ? `${displayMember?.name} - Total Amount`
                    : "Total Amount"}
                </p>
                <p className="text-3xl sm:text-4xl font-bold text-[var(--color-secondary)]">
                  ₹{totalAmount.toFixed(0)}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Diamonds Table/List */}
        <Card className="bg-[var(--bg-primary)] border border-[var(--border-color)] overflow-hidden transition-colors">
          <CardHeader className="border-b border-[var(--border-color)] px-4 sm:px-6 py-4 sm:py-6">
            <CardTitle className="text-lg sm:text-xl md:text-2xl text-[var(--text-primary)]">
              Diamond Records
              {selectedMemberId && (
                <span className="text-[var(--color-secondary)] text-sm sm:text-base ml-2">
                  ({displayMember?.name})
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-b border-[var(--border-color)] hover:bg-transparent">
                    <TableHead className="text-[var(--text-secondary)] h-12 px-4">
                      Date
                    </TableHead>
                    {!memberId && !selectedMemberId && (
                      <TableHead className="text-[var(--text-secondary)] h-12 px-4">
                        Member
                      </TableHead>
                    )}
                    <TableHead className="text-[var(--text-secondary)] h-12 px-4">
                      From
                    </TableHead>
                    <TableHead className="text-[var(--text-secondary)] h-12 px-4">
                      To
                    </TableHead>
                    <TableHead className="text-[var(--text-secondary)] h-12 px-4">
                      Price
                    </TableHead>
                    <TableHead className="text-[var(--text-secondary)] h-12 px-4">
                      Qty
                    </TableHead>
                    <TableHead className="text-[var(--text-secondary)] h-12 px-4">
                      Total
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {diamonds && diamonds.length > 0 ? (
                    diamonds.map((diamond) => (
                      <TableRow
                        key={diamond.id}
                        className="border-b border-[var(--border-color)]/30 hover:bg-[var(--bg-tertiary)]/50 transition-colors"
                      >
                        <TableCell className="text-[var(--text-secondary)] h-12 px-4">
                          {format(new Date(diamond.date), "dd/MM/yyyy")}
                        </TableCell>
                        {!memberId && !selectedMemberId && (
                          <TableCell className="text-[var(--text-secondary)] h-12 px-4">
                            {memberMap[diamond.memberId] || diamond.memberId}
                          </TableCell>
                        )}
                        <TableCell className="text-[var(--text-secondary)] h-12 px-4">
                          {Number(diamond.weightFrom).toFixed(2)}
                        </TableCell>
                        <TableCell className="text-[var(--text-secondary)] h-12 px-4">
                          {Number(diamond.weightTo).toFixed(2)}
                        </TableCell>
                        <TableCell className="text-[var(--text-secondary)] h-12 px-4">
                          ₹{Number(diamond.price).toFixed(0)}
                        </TableCell>
                        <TableCell className="text-[var(--text-secondary)] h-12 px-4">
                          {Number(diamond.quantity).toFixed(2)}
                        </TableCell>
                        <TableCell className="text-[var(--color-secondary)] font-semibold h-12 px-4">
                          ₹{Number(diamond.total).toFixed(0)}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={!memberId && !selectedMemberId ? 7 : 6}
                        className="text-center py-8 text-[var(--text-secondary)]"
                      >
                        {selectedMemberId
                          ? `No diamonds recorded for ${displayMember?.name}`
                          : "No diamonds recorded yet"}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden space-y-2 p-4 sm:p-6">
              {diamonds && diamonds.length > 0 ? (
                diamonds.map((diamond) => (
                  <div
                    key={diamond.id}
                    className="bg-[var(--bg-tertiary)]/50 border border-[var(--border-color)] rounded-lg p-3 sm:p-4 space-y-2 transition-colors"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-[var(--text-secondary)]  text-xs uppercase tracking-wider">
                          Date
                        </p>
                        <p className="text-[var(--text-primary)] text-sm font-semibold">
                          {format(new Date(diamond.date), "dd/MM/yyyy")}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-[var(--text-secondary)] text-xs uppercase tracking-wider">
                          Total
                        </p>
                        <p className="text-[var(--color-secondary)] text-lg font-bold">
                          ₹{Number(diamond.total).toFixed(0)}
                        </p>
                      </div>
                    </div>

                    <div className="border-t border-slate-700/50 pt-2 grid grid-cols-2 gap-2">
                      <div>
                        <p className="text-slate-400 text-xs">Weight</p>
                        <p className="text-slate-300 text-sm">
                          {Number(diamond.weightFrom).toFixed(2)} -{" "}
                          {Number(diamond.weightTo).toFixed(2)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-slate-400 text-xs">Price/Qty</p>
                        <p className="text-slate-300 text-sm">
                          ₹{Number(diamond.price).toFixed(0)} ×{" "}
                          {Number(diamond.quantity).toFixed(2)}
                        </p>
                      </div>
                    </div>

                    {!memberId && !selectedMemberId && (
                      <div className="pt-2 border-t border-slate-700/50">
                        <p className="text-slate-400 text-xs uppercase tracking-wider">
                          Member
                        </p>
                        <p className="text-white text-sm">
                          {memberMap[diamond.memberId] || diamond.memberId}
                        </p>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <p className="text-[var(--text-secondary)] text-sm">
                    {selectedMemberId
                      ? `No diamonds recorded for ${displayMember?.name}`
                      : "No diamonds recorded yet"}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {showPDF && diamonds && (
        <DiamondPDF
          diamonds={diamonds}
          member={displayMember}
          members={allMembers}
          onClose={() => setShowPDF(false)}
        />
      )}
    </div>
  );
}
