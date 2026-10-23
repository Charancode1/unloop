"use client";

import React, { useState } from "react";
import { CheckCircle2, RotateCcw, Sparkles, Check } from "lucide-react";
import confetti from "canvas-confetti";
import { formatFriendlyDate, getTodayKey } from "../lib/dates";

interface CheckInHeroProps {
  isTodaySuccessful: boolean;
  onToggleToday: (status: boolean) => void;
  currentStreak: number;
}

export function CheckInHero({
  isTodaySuccessful,
  onToggleToday,
  currentStreak,
}: CheckInHeroProps) {
  const todayKey = getTodayKey();
  const formattedToday = formatFriendlyDate(todayKey);
  const [animating, setAnimating] = useState(false);

  const handleMarkSuccessful = () => {
    setAnimating(true);

    // Trigger celebratory confetti burst
    try {
      confetti({
        particleCount: 65,
        spread: 60,
        origin: { y: 0.75 },
        colors: ["#10b981", "#34d399", "#059669", "#6ee7b7", "#ffffff"],
      });
    } catch {
      // Ignore if canvas-confetti is unavailable
    }

    onToggleToday(true);
    setTimeout(() => setAnimating(false), 600);
  };

  const handleUndo = () => {
    onToggleToday(false);
  };

  return (
    <section className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-white to-slate-50/90 dark:bg-gradient-to-b dark:from-[#131722] dark:to-[#0e111a] border border-slate-200/90 dark:border-white/[0.08] p-5 sm:p-7 shadow-sm dark:shadow-xl transition-all">
      {/* Background emerald ambient blur */}
      <div className="pointer-events-none absolute -top-16 -right-16 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl" />
      <div className="pointer-events-none absolute -bottom-16 -left-16 w-64 h-64 bg-emerald-100/40 dark:bg-emerald-950/20 rounded-full blur-3xl" />

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        {/* Left: Today's date and headline */}
        <div className="space-y-2 max-w-xl">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold tracking-wider uppercase text-slate-500 dark:text-zinc-400">
              Daily Check-in
            </span>
            <span className="text-slate-300 dark:text-zinc-600">&bull;</span>
            <span className="text-xs text-slate-600 dark:text-zinc-400 font-medium">{formattedToday}</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white transition-colors">
            {isTodaySuccessful ? (
              <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
                Today Reclaimed
                <Sparkles className="w-5 h-5 inline text-emerald-500 dark:text-emerald-300" />
              </span>
            ) : (
              "Break the loop for today."
            )}
          </h2>

          <p className="text-sm text-slate-600 dark:text-zinc-300/90 leading-relaxed transition-colors">
            {isTodaySuccessful
              ? "You held your ground today. Another green square logged. No explanation required."
              : "No habit name. No public feed. Just an honest daily commitment to yourself."}
          </p>

          {currentStreak > 0 && (
            <div className="inline-flex items-center gap-1.5 pt-1 text-xs text-emerald-700 dark:text-emerald-400/90 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse" />
              Current streak: <strong className="font-bold text-slate-900 dark:text-white">{currentStreak} {currentStreak === 1 ? "day" : "days"}</strong>
            </div>
          )}
        </div>

        {/* Right: Check-in & Undo actions */}
        <div className="flex flex-col sm:flex-row md:flex-col items-stretch sm:items-center md:items-end gap-3 shrink-0">
          {!isTodaySuccessful ? (
            <button
              id="check-in-btn"
              onClick={handleMarkSuccessful}
              type="button"
              className={`group relative flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_30px_rgba(16,185,129,0.45)] active:scale-[0.98] transition-all cursor-pointer ${
                animating ? "scale-105 ring-2 ring-emerald-300" : ""
              }`}
            >
              <CheckCircle2 className="w-5 h-5 text-emerald-100 group-hover:scale-110 transition-transform" />
              <span>Mark Today as Successful</span>
            </button>
          ) : (
            <div className="flex flex-col sm:flex-row items-center gap-2.5 w-full sm:w-auto">
              <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-500/15 border border-emerald-200 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-sm font-semibold shadow-xs dark:shadow-[0_0_15px_rgba(16,185,129,0.15)] transition-colors">
                <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 stroke-[3]" />
                <span>Marked Clean Today</span>
              </div>

              <button
                id="undo-today-btn"
                onClick={handleUndo}
                type="button"
                className="flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-300/80 text-xs font-medium text-slate-600 hover:text-slate-900 dark:bg-zinc-900/80 dark:hover:bg-zinc-800 dark:border-zinc-700/60 dark:text-zinc-400 dark:hover:text-zinc-200 transition-colors cursor-pointer shadow-xs dark:shadow-none"
                title="Undo or correct today's check-in status"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Undo Today</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
