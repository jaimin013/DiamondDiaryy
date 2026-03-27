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
      <Card
        className="rounded-lg border transition-colors"
        style={{
          background: `linear-gradient(to bottom right, var(--bg-primary), color-mix(in srgb, var(--bg-primary) 80%, transparent))`,
          borderColor: "var(--border-color)",
        }}
      >
        <CardHeader
          className="border-b pb-4"
          style={{
            borderColor: "var(--border-color)",
          }}
        >
          <div className="flex items-center justify-between">
            <div>
              <CardTitle
                className="text-lg sm:text-xl"
                style={{ color: "var(--text-primary)" }}
              >
                Member Calendar
              </CardTitle>
              <p
                className="text-xs sm:text-sm mt-1"
                style={{ color: "var(--text-secondary)" }}
              >
                {memberName} (ID: {memberId})
              </p>
              <p
                className="text-xs mt-2"
                style={{ color: "var(--text-tertiary)" }}
              >
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
              className="hover:bg-opacity-20 transition-colors"
              style={{
                color: "var(--text-secondary)",
              }}
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>

            <h2
              className="text-lg sm:text-xl font-bold min-w-48 text-center"
              style={{ color: "var(--text-primary)" }}
            >
              {currentDate.toLocaleDateString("en-US", {
                month: "long",
                year: "numeric",
              })}
            </h2>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleNextMonth}
              className="hover:bg-opacity-20 transition-colors"
              style={{
                color: "var(--text-secondary)",
              }}
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
                  className="text-center text-xs sm:text-sm font-semibold py-2"
                  style={{ color: "var(--text-secondary)" }}
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
                    className="aspect-square rounded-lg"
                    style={{
                      backgroundColor: "rgba(13, 115, 119, 0.1)",
                    }}
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
                  className="aspect-square rounded-lg font-semibold text-sm sm:text-base flex items-center justify-center transition-all duration-200 hover:scale-105"
                  style={{
                    backgroundColor: isWorkDay
                      ? "var(--color-primary)"
                      : "rgba(239, 68, 68, 0.15)",
                    color: isWorkDay ? "#ffffff" : "rgba(239, 68, 68, 0.7)",
                    border: isWorkDay
                      ? "none"
                      : "1px solid rgba(239, 68, 68, 0.3)",
                    boxShadow: isWorkDay
                      ? "0 8px 16px rgba(13, 115, 119, 0.2)"
                      : "none",
                    outline: todayFlag
                      ? `2px solid var(--color-secondary)`
                      : "none",
                    outlineOffset: todayFlag ? "2px" : "0",
                  }}
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
          <div
            className="mt-6 pt-4 border-t"
            style={{
              borderColor: "var(--border-color)",
            }}
          >
            <div className="flex flex-col sm:flex-row gap-4 text-xs sm:text-sm">
              <div className="flex items-center gap-2">
                <div
                  className="w-4 h-4 rounded"
                  style={{ backgroundColor: "var(--color-primary)" }}
                />
                <span style={{ color: "var(--text-secondary)" }}>Work Day</span>
              </div>
              <div className="flex items-center gap-2">
                <div
                  className="w-4 h-4 rounded border"
                  style={{
                    backgroundColor: "rgba(239, 68, 68, 0.15)",
                    borderColor: "rgba(239, 68, 68, 0.3)",
                  }}
                />
                <span style={{ color: "var(--text-secondary)" }}>
                  Non-Work Day
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div
                  className="w-4 h-4 rounded"
                  style={{
                    border: `2px solid var(--color-secondary)`,
                  }}
                />
                <span style={{ color: "var(--text-secondary)" }}>Today</span>
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
        <DialogContent
          className="border shadow-2xl max-w-md"
          style={{
            background: "var(--bg-primary)",
            borderColor: "var(--border-color)",
            color: "var(--text-primary)",
          }}
        >
          <DialogHeader
            className="border-b pb-4"
            style={{
              borderColor: "var(--border-color)",
            }}
          >
            <DialogTitle
              className="text-lg sm:text-xl font-bold"
              style={{
                color: "var(--color-primary)",
              }}
            >
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
                <div
                  className="flex items-center gap-3 p-3 rounded-lg border transition-all"
                  style={{
                    backgroundColor: "var(--bg-secondary)",
                    borderColor: "var(--border-color)",
                  }}
                >
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{
                      background: "var(--color-primary)",
                    }}
                  />
                  <span
                    className="text-sm font-medium"
                    style={{
                      color: "var(--color-primary)",
                    }}
                  >
                    Work Day — {selectedDay.entries.length} entry/entries
                  </span>
                </div>

                <div className="space-y-3 max-h-72 overflow-y-auto pr-2">
                  {selectedDay.entries.map((entry, i) => (
                    <div
                      key={i}
                      className="p-4 rounded-lg border transition-all duration-200 space-y-3"
                      style={{
                        backgroundColor: "var(--bg-secondary)",
                        borderColor: "var(--border-color)",
                      }}
                    >
                      <div className="flex justify-between items-start gap-2">
                        <span
                          className="font-bold"
                          style={{
                            color: "var(--color-primary)",
                          }}
                        >
                          Entry {i + 1}
                        </span>
                        <span
                          className="text-xs px-2 py-1 rounded-full border"
                          style={{
                            backgroundColor: "var(--bg-tertiary)",
                            color: "var(--color-primary)",
                            borderColor: "var(--border-color)",
                          }}
                        >
                          Completed
                        </span>
                      </div>

                      <div
                        className="space-y-2"
                        style={{ color: "var(--text-secondary)" }}
                      >
                        <div
                          className="flex justify-between items-center p-2 rounded border"
                          style={{
                            backgroundColor: "var(--bg-tertiary)",
                            borderColor: "var(--border-color)",
                          }}
                        >
                          <span>Weight:</span>
                          <span
                            className="font-semibold"
                            style={{
                              color: "var(--color-primary)",
                            }}
                          >
                            {entry.weightFrom} → {entry.weightTo} (Qty:{" "}
                            {entry.quantity})
                          </span>
                        </div>

                        <div
                          className="flex justify-between items-center p-2 rounded border"
                          style={{
                            backgroundColor: "var(--bg-tertiary)",
                            borderColor: "var(--border-color)",
                          }}
                        >
                          <span>Price/Unit:</span>
                          <span
                            className="font-semibold"
                            style={{
                              color: "var(--color-secondary)",
                            }}
                          >
                            ₹{entry.price.toFixed(2)}
                          </span>
                        </div>

                        <div
                          className="flex justify-between items-center p-3 rounded border"
                          style={{
                            backgroundColor: "var(--bg-secondary)",
                            borderColor: "var(--border-color)",
                          }}
                        >
                          <span style={{ color: "var(--text-primary)" }}>
                            Total :
                          </span>
                          <span
                            className="font-bold text-lg"
                            style={{
                              color: "var(--color-primary)",
                            }}
                          >
                            ₹{entry.total.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div
                  className="flex items-center gap-3 p-3 rounded-lg border"
                  style={{
                    backgroundColor: "var(--bg-secondary)",
                    borderColor: "var(--border-color)",
                  }}
                >
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{
                      backgroundColor: "var(--color-error)",
                    }}
                  />
                  <span
                    style={{ color: "var(--color-error)" }}
                    className="text-sm font-medium"
                  >
                    Non-Work Day
                  </span>
                </div>
                <p
                  className="text-sm text-center py-4"
                  style={{ color: "var(--text-secondary)" }}
                >
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
