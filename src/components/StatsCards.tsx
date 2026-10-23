"use client";

import React from "react";
import { Flame, Trophy } from "lucide-react";
import { StreakStats } from "../lib/types";

interface StatsCardsProps {
  stats: StreakStats;
}

export function StatsCards({ stats }: StatsCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
      {/* 1. Current Streak */}
      <div className="rounded-xl bg-white dark:bg-[#11141e] border border-slate-200/90 dark:border-white/[0.08] p-4 sm:p-5 relative overflow-hidden group hover:border-slate-300 dark:hover:border-white/[0.15] shadow-xs dark:shadow-none transition-all">
        <div className="flex items-center justify-between">
          <span className="text-xs sm:text-sm font-medium text-slate-500 dark:text-zinc-400">Current Streak</span>
          <div
            className={`w-8 h-8 rounded-lg border flex items-center justify-center transition-colors ${
              stats.currentStreak > 0
                ? "bg-amber-50 border-amber-200 text-amber-600 dark:bg-amber-500/10 dark:border-amber-500/30 dark:text-amber-400"
                : "bg-slate-100 border-slate-200 text-slate-400 dark:bg-zinc-800/40 dark:border-zinc-700/50 dark:text-zinc-400"
            }`}
          >
            <Flame className={`w-4 h-4 ${stats.currentStreak > 0 ? "fill-amber-500/20 dark:fill-amber-400/20" : ""}`} />
          </div>
        </div>
        <div className="mt-3 flex items-baseline gap-1.5">
          <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight transition-colors">
            {stats.currentStreak}
          </span>
          <span className="text-xs text-slate-500 dark:text-zinc-400 font-medium">days</span>
        </div>
        <p className="mt-1 text-[11px] sm:text-xs text-slate-500 dark:text-zinc-400 truncate">
          {stats.currentStreak > 0
            ? stats.todayStatus
              ? "Continued today"
              : "Check in today to maintain"
            : "Ready for day 1"}
        </p>
      </div>

      {/* 2. Best Streak */}
      <div className="rounded-xl bg-white dark:bg-[#11141e] border border-slate-200/90 dark:border-white/[0.08] p-4 sm:p-5 relative overflow-hidden group hover:border-slate-300 dark:hover:border-white/[0.15] shadow-xs dark:shadow-none transition-all">
        <div className="flex items-center justify-between">
          <span className="text-xs sm:text-sm font-medium text-slate-500 dark:text-zinc-400">Best Streak</span>
          <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400 transition-colors">
            <Trophy className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline gap-1.5">
          <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight transition-colors">
            {stats.bestStreak}
          </span>
          <span className="text-xs text-slate-500 dark:text-zinc-400 font-medium">days</span>
        </div>
        <p className="mt-1 text-[11px] sm:text-xs text-slate-500 dark:text-zinc-400 truncate">
          Longest unbroken streak
        </p>
      </div>
    </div>
  );
}
