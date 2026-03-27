import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { Member } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { Link, useRoute } from "wouter";
import { MemberCalendar } from "@/components/member-calendar";
import { apiRequest } from "@/lib/queryClient";

export default function MemberCalendarPage() {
  const { t } = useTranslation();
  const [, params] = useRoute("/member/:id/calendar");
  const memberId = params ? parseInt(params.id) : null;

  console.log(
    "MemberCalendarPage loaded with memberId:",
    memberId,
    "params:",
    params,
  );

  // Fetch member data with proper queryFn
  const { data: member, isLoading } = useQuery<Member>({
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
    enabled: !!memberId && memberId > 0,
  });

  if (!memberId || memberId <= 0) {
    return (
      <div className="min-h-screen bg-[var(--bg-secondary)] text-[var(--text-primary)] transition-colors duration-200 p-3 sm:p-4 md:p-6 lg:p-8">
        <div className="max-w-4xl mx-auto">
          <p style={{ color: "var(--color-error)" }}>
            Invalid member ID: {memberId}
          </p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[var(--bg-secondary)] text-[var(--text-primary)] transition-colors duration-200 p-3 sm:p-4 md:p-6 lg:p-8 flex items-center justify-center">
        <p className="text-[var(--text-secondary)]">
          Loading calendar for member {memberId}...
        </p>
      </div>
    );
  }

  if (!member) {
    return (
      <div className="min-h-screen bg-[var(--bg-secondary)] text-[var(--text-primary)] transition-colors duration-200 p-3 sm:p-4 md:p-6 lg:p-8">
        <div className="max-w-4xl mx-auto">
          <p className="text-[var(--text-secondary)]">
            Member not found (ID: {memberId})
          </p>
        </div>
      </div>
    );
  }

  console.log("Member loaded:", member);

  return (
    <div className="min-h-screen bg-[var(--bg-secondary)] text-[var(--text-primary)] transition-colors duration-200 p-3 sm:p-4 md:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
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
            <h1 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)]">
              Work Schedule Calendar
            </h1>
            <p className="text-[var(--text-secondary)] text-xs sm:text-sm mt-1">
              {member.name} (ID: {member.id})
            </p>
          </div>
        </div>

        {/* Calendar Component - Pass both id and name */}
        {member.id && (
          <MemberCalendar memberId={member.id} memberName={member.name} />
        )}
      </div>
    </div>
  );
}
