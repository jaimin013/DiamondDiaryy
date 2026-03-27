import React, { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { apiRequest } from "@/lib/queryClient";

interface MemberCalendarProps {
  memberId: number;
  memberName: string;
}

interface DayDetails {
  date: string;
  entries: any[];
  isWorkDay: boolean;
}

export function MemberCalendar({ memberId, memberName }: MemberCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<DayDetails | null>(null);

  const monthYear = useMemo(
    () => currentDate.toISOString().slice(0, 7),
    [currentDate],
  );

  // Fetch all diamonds for the member to determine work days
  const {
    data: allDiamonds = [],
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ["/api/diamonds", memberId],
    queryFn: async () => {
      // Validate memberId
      if (!memberId || memberId <= 0) {
        console.error("Invalid memberId:", memberId);
        return [];
      }

      try {
        const url = `/api/diamonds?memberId=${memberId}`;
        console.log("Fetching diamonds for memberId:", memberId, "URL:", url);

        const res = await apiRequest("GET", url);
        const data = await res.json();

        console.log("Diamonds fetched for memberId", memberId, ":", data);
        return data;
      } catch (error) {
        console.error(
          "Error fetching diamonds for memberId",
          memberId,
          ":",
          error,
        );
        return [];
      }
    },
    enabled: !!memberId && memberId > 0,
    staleTime: 0,
    refetchOnMount: "stale",
    refetchOnWindowFocus: false,
  });

  // Refetch when memberId changes - with validation
  React.useEffect(() => {
    if (memberId && memberId > 0) {
      console.log("MemberId changed to:", memberId, "Triggering refetch");
      refetch();
    }
  }, [memberId, refetch]);

  // Filter diamonds for current month AND verify they belong to THIS member
  const monthDiamonds = useMemo(() => {
    const filtered = allDiamonds.filter((d: any) => {
      // Verify memberId matches (critical for data isolation)
      if (d.memberId !== memberId) {
        console.warn(
          "Filtering out diamond with wrong memberId. Expected:",
          memberId,
          "Got:",
          d.memberId,
        );
        return false;
      }

      // Ensure date is in YYYY-MM-DD format
      const diamondDate = typeof d.date === "string" ? d.date : "";
      return diamondDate.startsWith(monthYear);
    });

    console.log(
      "Month diamonds for memberId",
      memberId,
      "in",
      monthYear,
      ":",
      filtered,
    );
    return filtered;
  }, [allDiamonds, monthYear, memberId]);

  // Group diamonds by date
  const diamondsByDate = useMemo(() => {
    const grouped: Record<string, any[]> = {};
    monthDiamonds.forEach((diamond: any) => {
      const date = diamond.date;
      if (!grouped[date]) grouped[date] = [];
      grouped[date].push(diamond);
    });

    console.log("Diamonds by date for memberId", memberId, ":", grouped);
    return grouped;
  }, [monthDiamonds, memberId]);

  // Get days in current month
  const daysInMonth = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    return new Date(year, month + 1, 0).getDate();
  }, [currentDate]);

  const firstDayOfMonth = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    return new Date(year, month, 1).getDay();
  }, [currentDate]);

  const handlePrevMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1),
    );
  };

  const handleNextMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1),
    );
  };

  const handleDayClick = (day: number) => {
    const dateKey = `${monthYear}-${String(day).padStart(2, "0")}`;
    const entries = diamondsByDate[dateKey] || [];
    const isWorkDay = entries.length > 0;

    setSelectedDay({
      date: dateKey,
      entries,
      isWorkDay,
    });
  };

  const isToday = (day: number): boolean => {
    const today = new Date();
    return (
      day === today.getDate() &&
      currentDate.getMonth() === today.getMonth() &&
      currentDate.getFullYear() === today.getFullYear()
    );
  };

  // Create array for calendar grid
  const calendarDays = useMemo(() => {
    const days = [];
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(null);
    }
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }
    return days;
  }, [firstDayOfMonth, daysInMonth]);

  return (
    <div className="w-full">
      <Card className="bg-gradient-to-br from-slate-800 to-slate-800/50 border border-slate-700/50">
        <CardHeader className="border-b border-slate-700/50 pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg sm:text-xl text-white">
                Member Calendar
              </CardTitle>
              <p className="text-slate-400 text-xs sm:text-sm mt-1">
                {memberName} (ID: {memberId})
              </p>
              <p className="text-slate-500 text-xs mt-2">
                Total work entries: {allDiamonds.length} | This month:{" "}
                {Object.keys(diamondsByDate).length} days
              </p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-6">
          {/* Month/Year Header */}
          <div className="flex items-center justify-between mb-6">
            <Button
              variant="ghost"
              size="sm"
              onClick={handlePrevMonth}
              className="hover:bg-slate-700 text-slate-300 hover:text-slate-100"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>

            <h2 className="text-lg sm:text-xl font-bold text-white min-w-48 text-center">
              {currentDate.toLocaleDateString("en-US", {
                month: "long",
                year: "numeric",
              })}
            </h2>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleNextMonth}
              className="hover:bg-slate-700 text-slate-300 hover:text-slate-100"
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>

          {/* Day names */}
          <div className="grid grid-cols-7 gap-2 mb-2">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
              (dayName) => (
                <div
                  key={dayName}
                  className="text-center text-xs sm:text-sm font-semibold text-slate-400 py-2"
                >
                  {dayName}
                </div>
              ),
            )}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-2">
            {calendarDays.map((day, index) => {
              if (day === null) {
                return (
                  <div
                    key={`empty-${index}`}
                    className="aspect-square rounded-lg bg-slate-900/50"
                  />
                );
              }

              const dateKey = `${monthYear}-${String(day).padStart(2, "0")}`;
              const dayEntries = diamondsByDate[dateKey] || [];
              const isWorkDay = dayEntries.length > 0;
              const todayFlag = isToday(day);

              return (
                <button
                  key={day}
                  onClick={() => handleDayClick(day)}
                  className={`
                    aspect-square rounded-lg font-semibold text-sm sm:text-base
                    flex items-center justify-center transition-all duration-200
                    ${
                      isWorkDay
                        ? "bg-gradient-to-br from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white shadow-lg hover:shadow-emerald-500/25"
                        : "bg-gradient-to-br from-red-500/20 to-red-600/20 hover:from-red-500/30 hover:to-red-600/30 text-red-300 hover:text-red-200 border border-red-500/30"
                    }
                    ${todayFlag ? "ring-2 ring-yellow-400 ring-offset-2 ring-offset-slate-800" : ""}
                    hover:scale-105
                  `}
                  title={
                    isWorkDay
                      ? `${dayEntries.length} work entry(ies)`
                      : "No work"
                  }
                >
                  {day}
                </button>
              );
            })}
          </div>

          {/* Legend */}
          <div className="mt-6 pt-4 border-t border-slate-700/50">
            <div className="flex flex-col sm:flex-row gap-4 text-xs sm:text-sm">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-gradient-to-r from-emerald-500 to-emerald-600" />
                <span className="text-slate-300">Work Day</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-red-500/30 border border-red-500/50" />
                <span className="text-slate-300">Non-Work Day</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded ring-2 ring-yellow-400" />
                <span className="text-slate-300">Today</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Day details modal */}
      <Dialog
        open={!!selectedDay}
        onOpenChange={(open) => !open && setSelectedDay(null)}
      >
        <DialogContent className="bg-gradient-to-br from-slate-800 to-slate-800/50 border border-slate-700/50 text-white">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl">
              {selectedDay &&
                new Date(selectedDay.date).toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
            </DialogTitle>
          </DialogHeader>

          <div className="mt-4">
            {selectedDay?.isWorkDay ? (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-emerald-500" />
                  <span className="text-sm text-emerald-300 font-medium">
                    Work Day ({selectedDay.entries.length} entry/entries)
                  </span>
                </div>

                <div className="space-y-3 max-h-72 overflow-y-auto">
                  {selectedDay.entries.map((entry, i) => (
                    <div
                      key={i}
                      className="p-3 bg-slate-900/50 rounded-lg border border-slate-700/50 text-xs sm:text-sm"
                    >
                      <div className="flex justify-between items-start gap-2 mb-2">
                        <span className="font-semibold text-emerald-400">
                          Entry {i + 1}
                        </span>
                      </div>
                      <div className="space-y-1 text-slate-300">
                        <p>
                          <span className="text-slate-400">Weight:</span>{" "}
                          {entry.weightFrom} → {entry.weightTo} (Qty:{" "}
                          {entry.quantity})
                        </p>
                        <p>
                          <span className="text-slate-400">Price:</span> $
                          {entry.price.toFixed(2)}/unit
                        </p>
                        <p>
                          <span className="text-slate-400">Total:</span>{" "}
                          <span className="text-emerald-400 font-semibold">
                            ${entry.total.toFixed(2)}
                          </span>
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <span className="text-sm text-red-300 font-medium">
                    Non-Work Day
                  </span>
                </div>
                <p className="text-sm text-slate-400">
                  No work entries recorded for this day.
                </p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
