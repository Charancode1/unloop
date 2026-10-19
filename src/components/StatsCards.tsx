"use client";

import React from "react";
import { Flame, Trophy, CalendarCheck2, TrendingUp } from "lucide-react";
import { StreakStats } from "../lib/types";

interface StatsCardsProps {
  stats: StreakStats;
  selectedYear: number;
}

export function StatsCards({ stats, selectedYear }: StatsCardsProps) {
  const isCurrentYear = selectedYear === new Date().getFullYear();

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
      {/* 1. Total Successful Days */}
      <div className="rounded-xl bg-[#11141e] border border-white/[0.08] p-4 sm:p-5 relative overflow-hidden group hover:border-white/[0.15] transition-all">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-zinc-400">Total Clean Days</span>
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <CalendarCheck2 className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline gap-1.5">
          <span className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            {stats.totalDays}
          </span>
          <span className="text-xs text-zinc-400 font-medium">days</span>
        </div>
        <p className="mt-1 text-[11px] text-zinc-400 truncate">
          All-time reclaimed days
        </p>
      </div>

      {/* 2. Current Streak */}
      <div className="rounded-xl bg-[#11141e] border border-white/[0.08] p-4 sm:p-5 relative overflow-hidden group hover:border-white/[0.15] transition-all">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-zinc-400">Current Streak</span>
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
        <p className="mt-1 text-[11px] text-zinc-400 truncate">
          {stats.currentStreak > 0
            ? stats.todayStatus
              ? "Continued today"
              : "Check in today to maintain"
            : "Ready for day 1"}
        </p>
      </div>

      {/* 3. Best Streak */}
      <div className="rounded-xl bg-[#11141e] border border-white/[0.08] p-4 sm:p-5 relative overflow-hidden group hover:border-white/[0.15] transition-all">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-zinc-400">Best Streak</span>
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
        <p className="mt-1 text-[11px] text-zinc-400 truncate">
          Longest unbroken streak
        </p>
      </div>

      {/* 4. Year Consistency Rate */}
      <div className="rounded-xl bg-[#11141e] border border-white/[0.08] p-4 sm:p-5 relative overflow-hidden group hover:border-white/[0.15] transition-all">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-zinc-400">
            {selectedYear} Success Rate
          </span>
          <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
            <TrendingUp className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline gap-1.5">
          <span className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            {stats.successRate}%
          </span>
        </div>
        <div className="mt-2 w-full bg-zinc-800/80 rounded-full h-1.5 overflow-hidden">
          <div
            className="bg-gradient-to-r from-emerald-500 to-emerald-400 h-full rounded-full transition-all duration-500"
            style={{ width: `${Math.min(100, Math.max(0, stats.successRate))}%` }}
          />
        </div>
        <p className="mt-1.5 text-[10px] text-zinc-400">
          {isCurrentYear
            ? `${stats.totalTrackedDays} days elapsed this year`
            : `Full year tracking for ${selectedYear}`}
        </p>
      </div>
    </div>
  );
}
