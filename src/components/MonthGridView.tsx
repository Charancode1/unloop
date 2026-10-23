"use client";

import React, { useState } from "react";
import { CheckInStore } from "../lib/types";
import { generateMonthGrid, getTodayKey, formatFriendlyDate } from "../lib/dates";
import { ChevronLeft, ChevronRight, Check } from "lucide-react";

interface MonthGridViewProps {
  checkIns: CheckInStore;
  onToggleDay: (dateKey: string) => void;
  initialYear: number;
  initialMonth?: number;
}

export function MonthGridView({
  checkIns,
  onToggleDay,
  initialYear,
  initialMonth,
}: MonthGridViewProps) {
  const today = new Date();
  const [viewYear, setViewYear] = useState(initialYear);
  const [viewMonth, setViewMonth] = useState(
    initialMonth !== undefined ? initialMonth : today.getMonth()
  );

  const todayKey = getTodayKey();
  const monthData = generateMonthGrid(viewYear, viewMonth, checkIns);

  const handlePrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((prev) => prev - 1);
    } else {
      setViewMonth((prev) => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((prev) => prev + 1);
    } else {
      setViewMonth((prev) => prev + 1);
    }
  };

  const handleJumpToCurrent = () => {
    setViewYear(today.getFullYear());
    setViewMonth(today.getMonth());
  };

  // Calculate clean count for this month
  const totalDaysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const monthPrefix = `${viewYear}-${String(viewMonth + 1).padStart(2, "0")}-`;
  const cleanDaysInMonth = Object.entries(checkIns).filter(
    ([k, val]) => val && k.startsWith(monthPrefix)
  ).length;

  const weekdayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div className="rounded-2xl bg-white dark:bg-[#0f121a] border border-slate-200/90 dark:border-white/[0.08] p-5 sm:p-6 shadow-sm dark:shadow-xl transition-all">
      {/* Header with navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight transition-colors">
              {monthData.monthName} {monthData.year}
            </h3>
            <span className="px-2 py-0.5 text-xs font-semibold rounded-md bg-emerald-50 dark:bg-emerald-500/15 border border-emerald-200 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-400 transition-colors">
              {cleanDaysInMonth} / {totalDaysInMonth} days
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5 transition-colors">
            Detailed monthly calendar view &bull; Browse previous or current months
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={handleJumpToCurrent}
            className="px-2.5 py-1.5 text-xs font-medium rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 border border-slate-200 hover:border-slate-300 dark:bg-[#161a24] dark:hover:bg-zinc-800 dark:text-zinc-300 dark:border-white/[0.06] transition-colors shadow-xs dark:shadow-none cursor-pointer"
          >
            This Month
          </button>
          <div className="flex items-center bg-slate-100 dark:bg-[#131620] border border-slate-200 dark:border-white/[0.08] rounded-lg p-0.5 transition-colors shadow-xs dark:shadow-none">
            <button
              onClick={handlePrevMonth}
              type="button"
              className="p-1 rounded text-slate-500 hover:text-slate-900 hover:bg-slate-200/60 dark:text-zinc-400 dark:hover:text-white dark:hover:bg-white/[0.06] transition-colors cursor-pointer"
              title="Previous month"
              aria-label="Previous month"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-2 text-xs font-semibold text-slate-800 dark:text-zinc-300">
              {monthData.monthName.slice(0, 3)}
            </span>
            <button
              onClick={handleNextMonth}
              type="button"
              className="p-1 rounded text-slate-500 hover:text-slate-900 hover:bg-slate-200/60 dark:text-zinc-400 dark:hover:text-white dark:hover:bg-white/[0.06] transition-colors cursor-pointer"
              title="Next month"
              aria-label="Next month"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 gap-1.5 sm:gap-2 mb-2 text-center text-xs font-semibold text-slate-500 dark:text-zinc-400">
        {weekdayNames.map((name) => (
          <div key={name} className="py-1">
            {name}
          </div>
        ))}
      </div>

      {/* Days grid */}
      <div className="space-y-1.5 sm:space-y-2">
        {monthData.weeks.map((week, wIdx) => (
          <div key={`week-${wIdx}`} className="grid grid-cols-7 gap-1.5 sm:gap-2">
            {week.map((day, dIdx) => {
              if (!day) {
                return (
                  <div
                    key={`empty-${wIdx}-${dIdx}`}
                    className="h-11 sm:h-14 rounded-xl bg-transparent opacity-0"
                  />
                );
              }

              const isToday = day.dateKey === todayKey;
              const isFuture = day.isFuture;
              const isSuccessful = day.isSuccessful;

              let cellStyle =
                "h-11 sm:h-14 rounded-xl p-1.5 sm:p-2 flex flex-col justify-between items-start transition-all cursor-pointer relative ";

              if (isFuture) {
                cellStyle +=
                  "bg-slate-100/50 dark:bg-[#12151e]/40 border border-slate-200/50 dark:border-white/[0.02] opacity-40 dark:opacity-30 cursor-not-allowed";
              } else if (isSuccessful) {
                cellStyle +=
                  "bg-gradient-to-br from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 border border-emerald-400/50 text-white shadow-xs dark:shadow-[0_0_12px_rgba(16,185,129,0.25)]";
              } else {
                cellStyle +=
                  "bg-slate-50 hover:bg-slate-100 border border-slate-200/80 text-slate-700 dark:bg-[#141822] dark:hover:bg-[#1c2230] dark:border-white/[0.05] dark:text-zinc-300";
              }

              if (isToday) {
                cellStyle +=
                  " ring-2 ring-emerald-500 dark:ring-emerald-400 ring-offset-2 ring-offset-white dark:ring-offset-[#0f121a]";
              }

              return (
                <button
                  key={day.dateKey}
                  type="button"
                  disabled={isFuture}
                  onClick={() => !isFuture && onToggleDay(day.dateKey)}
                  className={cellStyle}
                  title={`${formatFriendlyDate(day.dateKey)}: ${
                    isSuccessful ? "Loop Broken / Clean" : "Unmarked"
                  }`}
                >
                  <span
                    className={`text-xs font-bold leading-none ${
                      isSuccessful
                        ? "text-emerald-50"
                        : isToday
                        ? "text-emerald-600 dark:text-emerald-400 font-extrabold"
                        : "text-slate-600 dark:text-zinc-400"
                    }`}
                  >
                    {day.dayOfMonth}
                  </span>

                  {isSuccessful ? (
                    <span className="self-end inline-flex items-center justify-center w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-white/20 text-white">
                      <Check className="w-2.5 h-2.5 sm:w-3 sm:h-3 stroke-[3]" />
                    </span>
                  ) : isToday ? (
                    <span className="self-end text-[9px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-tighter">
                      Today
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
