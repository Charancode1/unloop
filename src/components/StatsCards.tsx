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
      <div className="rounded-xl bg-[#11141e] border border-white/[0.08] p-4 sm:p-5 relative overflow-hidden group hover:border-white/[0.15] transition-all">
        <div className="flex items-center justify-between">
          <span className="text-xs sm:text-sm font-medium text-zinc-400">Current Streak</span>
          <div
            className={`w-8 h-8 rounded-lg border flex items-center justify-center ${
              stats.currentStreak > 0
                ? "bg-amber-500/10 border-amber-500/30 text-amber-400"
                : "bg-zinc-800/40 border-zinc-700/50 text-zinc-400"
            }`}
          >
            <Flame className={`w-4 h-4 ${stats.currentStreak > 0 ? "fill-amber-400/20" : ""}`} />
          </div>
        </div>
        <div className="mt-3 flex items-baseline gap-1.5">
          <span className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            {stats.currentStreak}
          </span>
          <span className="text-xs text-zinc-400 font-medium">days</span>
        </div>
        <p className="mt-1 text-[11px] sm:text-xs text-zinc-400 truncate">
          {stats.currentStreak > 0
            ? stats.todayStatus
              ? "Continued today"
              : "Check in today to maintain"
            : "Ready for day 1"}
        </p>
      </div>

      {/* 2. Best Streak */}
      <div className="rounded-xl bg-[#11141e] border border-white/[0.08] p-4 sm:p-5 relative overflow-hidden group hover:border-white/[0.15] transition-all">
        <div className="flex items-center justify-between">
          <span className="text-xs sm:text-sm font-medium text-zinc-400">Best Streak</span>
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <Trophy className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline gap-1.5">
          <span className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            {stats.bestStreak}
          </span>
          <span className="text-xs text-zinc-400 font-medium">days</span>
        </div>
        <p className="mt-1 text-[11px] sm:text-xs text-zinc-400 truncate">
          Longest unbroken streak
        </p>
      </div>
    </div>
  );
}
