import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { WorkDay } from "@shared/schema";

interface WorkCalendarProps {
  memberId: number;
}

export default function WorkCalendar({ memberId }: WorkCalendarProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [currentDate, setCurrentDate] = useState(new Date());

  const monthYear = currentDate.toISOString().slice(0, 7); // YYYY-MM format

  // Fetch work days for the month
  const { data: workDays = [] } = useQuery<WorkDay[]>({
    queryKey: [`/api/work-days?memberId=${memberId}&monthYear=${monthYear}`],
  });

  // Mutation for toggling work day
  const toggleMutation = useMutation({
    mutationFn: async (data: { date: string; isWorkDay: boolean }) => {
      const res = await apiRequest("POST", "/api/work-days", {
        ...data,
        memberId,
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [
          `/api/work-days?memberId=${memberId}&monthYear=${monthYear}`,
        ],
      });
      toast({
        title: "Success",
        description: "Work day updated",
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

  // Get work day status for a specific date
  const getWorkDayStatus = (date: string): boolean => {
    const workDay = (workDays as WorkDay[]).find((wd) => wd.date === date);
    return workDay ? workDay.isWorkDay === "true" : false;
  };

  // Handle day click
  const handleDayClick = (day: number) => {
    const date = `${monthYear}-${String(day).padStart(2, "0")}`;
    const currentStatus = getWorkDayStatus(date);
    toggleMutation.mutate({ date, isWorkDay: !currentStatus });
  };

  // Get calendar days for the month
  const getDaysInMonth = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    // Add empty cells for days before month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    // Add days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }
    return days;
  };

  const moveMonth = (offset: number) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + offset);
    setCurrentDate(newDate);
  };

  const days = getDaysInMonth();
  const monthName = currentDate.toLocaleString("default", { month: "long" });
  const year = currentDate.getFullYear();

  return (
    <div className="w-full">
      {/* Month Header */}
      <div className="flex items-center justify-between mb-6">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => moveMonth(-1)}
          className="hover:bg-emerald-500/10 text-slate-400 hover:text-emerald-400"
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <h2 className="text-xl sm:text-2xl font-bold text-white min-w-48 text-center">
          {monthName} {year}
        </h2>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => moveMonth(1)}
          className="hover:bg-emerald-500/10 text-slate-400 hover:text-emerald-400"
        >
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-2">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <div
            key={day}
            className="text-center text-xs sm:text-sm font-semibold text-slate-400 py-2"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1 sm:gap-2">
        {days.map((day, index) => {
          if (day === null) {
            return (
              <div
                key={`empty-${index}`}
                className="aspect-square bg-slate-900/50 rounded-lg"
              />
            );
          }

          const date = `${monthYear}-${String(day).padStart(2, "0")}`;
          const isWorkDay = getWorkDayStatus(date);
          const isLoading = toggleMutation.isPending;

          return (
            <button
              key={day}
              onClick={() => handleDayClick(day)}
              disabled={isLoading}
              className={`
                aspect-square rounded-lg font-semibold text-xs sm:text-sm
                transition-all duration-300 cursor-pointer
                flex items-center justify-center
                ${
                  isWorkDay
                    ? "bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-lg shadow-emerald-500/30 hover:from-emerald-600 hover:to-emerald-700"
                    : "bg-slate-700 text-slate-300 hover:bg-slate-600"
                }
                ${isLoading ? "opacity-50" : ""}
              `}
            >
              {day}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex gap-4 sm:gap-6 justify-center mt-6">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 sm:w-5 sm:h-5 rounded bg-gradient-to-br from-emerald-500 to-emerald-600"></div>
          <span className="text-xs sm:text-sm text-slate-400">Work Day</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 sm:w-5 sm:h-5 rounded bg-slate-700"></div>
          <span className="text-xs sm:text-sm text-slate-400">
            Non-Work Day
          </span>
        </div>
      </div>
    </div>
  );
}
