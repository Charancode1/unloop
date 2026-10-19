"use client";

import React, { useRef, useState, useEffect, useMemo } from "react";
import { CheckInStore, DayInfo } from "../lib/types";
import { generateYearGrid, getTodayKey, formatFriendlyDate } from "../lib/dates";
import { Check, Info, ArrowRight } from "lucide-react";

interface ContributionHeatmapProps {
  year: number;
  checkIns: CheckInStore;
  onToggleDay: (dateKey: string) => void;
}

export function ContributionHeatmap({
  year,
  checkIns,
  onToggleDay,
}: ContributionHeatmapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const todayKey = getTodayKey();
  const [hoveredDay, setHoveredDay] = useState<{
    day: DayInfo;
    x: number;
    y: number;
  } | null>(null);

  const columns = useMemo(() => {
    return generateYearGrid(year, checkIns);
  }, [year, checkIns]);

  // Auto-scroll towards today or current month on initial mount / year change
  useEffect(() => {
    if (containerRef.current) {
      const todayEl = containerRef.current.querySelector("[data-today='true']");
      if (todayEl) {
        todayEl.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
      } else {
        containerRef.current.scrollLeft = 0;
      }
    }
  }, [year]);

  const handleCellClick = (day: DayInfo | null) => {
    if (!day) return;
    if (day.isFuture) return;
    onToggleDay(day.dateKey);
  };

  const dayLabels = [
    { label: "Sun", show: false },
    { label: "Mon", show: true },
    { label: "Tue", show: false },
    { label: "Wed", show: true },
    { label: "Thu", show: false },
    { label: "Fri", show: true },
    { label: "Sat", show: false },
  ];

  // Count successes in this year
  const yearSuccessCount = Object.entries(checkIns).filter(
    ([key, success]) => success && key.startsWith(`${year}-`)
  ).length;

  return (
    <section className="rounded-2xl bg-[#0f121a] border border-white/[0.08] p-5 sm:p-6 shadow-xl relative">
      {/* Header of Heatmap Card */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
              {year} Daily Progress Calendar
            </h3>
            <span className="px-2 py-0.5 text-xs font-semibold rounded-md bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
              {yearSuccessCount} {yearSuccessCount === 1 ? "day" : "days"} won
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-0.5">
            Inspired by GitHub&apos;s contribution grid &bull; Click any day to log or adjust past progress
          </p>
        </div>

        {/* Quick jump to today button */}
        <button
          type="button"
          onClick={() => {
            const todayEl = containerRef.current?.querySelector("[data-today='true']");
            todayEl?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
          }}
          className="self-start sm:self-auto inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-[#161a24] hover:bg-zinc-800 text-zinc-300 border border-white/[0.06] transition-colors"
        >
          <span>Jump to Today</span>
          <ArrowRight className="w-3 h-3 text-emerald-400" />
        </button>
      </div>

      {/* Heatmap Grid Wrapper with sleek custom scrollbar */}
      <div
        ref={containerRef}
        className="overflow-x-auto pb-4 pt-1 px-1 focus:outline-none"
        tabIndex={0}
      >
        <div className="inline-flex flex-col min-w-[760px] select-none">
          {/* Month Labels row */}
          <div className="flex ml-8 mb-1.5 text-[11px] font-semibold text-zinc-400">
            {columns.map((col, idx) => (
              <div
                key={`month-${col.weekIndex}-${idx}`}
                className="w-[15px] mr-[3px] text-left shrink-0"
              >
                {col.monthLabel && (
                  <span className="whitespace-nowrap -ml-0.5 text-zinc-300 font-medium">
                    {col.monthLabel}
                  </span>
                )}
              </div>
            ))}
          </div>

          {/* Grid rows with Day of Week labels on left */}
          <div className="flex">
            {/* Day of Week Labels (Mon, Wed, Fri) */}
            <div className="flex flex-col justify-between w-8 shrink-0 pr-2 py-0.5 text-[10px] font-medium text-zinc-400">
              {dayLabels.map((item, idx) => (
                <div key={idx} className="h-[15px] flex items-center leading-none">
                  {item.show ? item.label : ""}
                </div>
              ))}
            </div>

            {/* 53 Week Columns */}
            <div className="flex gap-[3px]">
              {columns.map((col) => (
                <div key={`col-${col.weekIndex}`} className="flex flex-col gap-[3px]">
                  {col.days.map((day, dayIndex) => {
                    if (!day) {
                      return (
                        <div
                          key={`empty-${col.weekIndex}-${dayIndex}`}
                          className="w-[15px] h-[15px] opacity-0"
                        />
                      );
                    }

                    const isToday = day.dateKey === todayKey;
                    const isFuture = day.isFuture;
                    const isSuccessful = day.isSuccessful;

                    // Compute styling based on state
                    let cellClasses = "w-[15px] h-[15px] rounded-[3px] transition-all ";

                    if (isFuture) {
                      cellClasses += "bg-[#161b22] border border-[#30363d] cursor-not-allowed";
                    } else if (isSuccessful) {
                      cellClasses +=
                        "bg-emerald-500 hover:bg-emerald-400 border border-emerald-400/50 shadow-[0_0_6px_rgba(16,185,129,0.35)] cursor-pointer";
                    } else {
                      cellClasses +=
                        "bg-[#161b22] hover:bg-[#1f242c] border border-[#30363d] hover:border-[#484f58] cursor-pointer";
                    }

                    if (isToday) {
                      cellClasses += " ring-2 ring-emerald-400 ring-offset-1 ring-offset-[#0f121a]";
                    }

                    return (
                      <button
                        key={day.dateKey}
                        type="button"
                        data-today={isToday ? "true" : "false"}
                        onClick={() => handleCellClick(day)}
                        onMouseEnter={(e) => {
                          const rect = e.currentTarget.getBoundingClientRect();
                          setHoveredDay({
                            day,
                            x: rect.left + rect.width / 2,
                            y: rect.top,
                          });
                        }}
                        onMouseLeave={() => setHoveredDay(null)}
                        className={cellClasses}
                        aria-label={`${formatFriendlyDate(day.dateKey)}: ${
                          isSuccessful ? "Clean / Loop broken" : "Unmarked"
                        }`}
                      />
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Floating Tooltip */}
      {hoveredDay && (
        <div
          className="fixed pointer-events-none z-50 transform -translate-x-1/2 -translate-y-full -mt-2 px-3 py-1.5 rounded-lg bg-zinc-900/95 border border-white/[0.15] text-xs text-white shadow-2xl backdrop-blur-md"
          style={{
            left: `${hoveredDay.x}px`,
            top: `${hoveredDay.y}px`,
          }}
        >
          <div className="font-semibold text-zinc-100 flex items-center gap-1.5">
            <span>{formatFriendlyDate(hoveredDay.day.dateKey)}</span>
            {hoveredDay.day.isToday && (
              <span className="text-[10px] text-emerald-400 font-bold uppercase">(Today)</span>
            )}
          </div>
          <div className="text-[11px] text-zinc-300 mt-0.5 flex items-center gap-1.5">
            {hoveredDay.day.isFuture ? (
              <span className="text-zinc-400">Future date</span>
            ) : hoveredDay.day.isSuccessful ? (
              <span className="text-emerald-400 font-medium flex items-center gap-1">
                <Check className="w-3 h-3 stroke-[3]" />
                Loop broken &bull; Clean day
              </span>
            ) : (
              <span className="text-zinc-400">Unmarked &bull; Click to mark clean</span>
            )}
          </div>
        </div>
      )}

      {/* Heatmap Footer: Legend & Guidelines */}
      <div className="mt-4 pt-3 border-t border-white/[0.06] flex flex-wrap items-center justify-between gap-3 text-xs text-zinc-400">
        <div className="flex items-center gap-2">
          <Info className="w-3.5 h-3.5 text-zinc-400" />
          <span>Click any square to toggle or correct that day&apos;s record.</span>
        </div>

        {/* GitHub style legend */}
        <div className="flex items-center gap-2">
          <span className="text-[11px]">Less</span>
          <div className="flex gap-1 items-center">
            {/* Unmarked */}
            <div
              className="w-3 h-3 rounded-[2px] bg-[#161b22] border border-[#30363d]"
              title="Unmarked / Not clean"
            />
            {/* Faint emerald */}
            <div
              className="w-3 h-3 rounded-[2px] bg-emerald-900/60 border border-emerald-800/40"
              title="Starting out"
            />
            {/* Medium emerald */}
            <div
              className="w-3 h-3 rounded-[2px] bg-emerald-600 border border-emerald-500/50"
              title="Clean"
            />
            {/* Vibrant emerald */}
            <div
              className="w-3 h-3 rounded-[2px] bg-emerald-400 border border-emerald-300 shadow-[0_0_5px_rgba(52,211,153,0.5)]"
              title="Clean & Today"
            />
          </div>
          <span className="text-[11px]">More</span>
        </div>
      </div>
    </section>
  );
}
