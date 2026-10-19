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
    <section className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-[#131722] to-[#0e111a] border border-white/[0.08] p-5 sm:p-7 shadow-xl">
      {/* Background emerald ambient blur */}
      <div className="pointer-events-none absolute -top-16 -right-16 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl" />
      <div className="pointer-events-none absolute -bottom-16 -left-16 w-64 h-64 bg-emerald-950/20 rounded-full blur-3xl" />

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        {/* Left: Today's date and headline */}
        <div className="space-y-2 max-w-xl">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold tracking-wider uppercase text-zinc-400">
              Daily Check-in
            </span>
            <span className="text-zinc-600">&bull;</span>
            <span className="text-xs text-zinc-400 font-medium">{formattedToday}</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            {isTodaySuccessful ? (
              <span className="text-emerald-400 flex items-center gap-2">
                Today Reclaimed
                <Sparkles className="w-5 h-5 inline text-emerald-300" />
              </span>
            ) : (
              "Break the loop for today."
            )}
          </h2>

          <p className="text-sm text-zinc-300/90 leading-relaxed">
            {isTodaySuccessful
              ? "You held your ground today. Another green square logged. No explanation required."
              : "No habit name. No public feed. Just an honest daily commitment to yourself."}
          </p>

          {currentStreak > 0 && (
            <div className="inline-flex items-center gap-1.5 pt-1 text-xs text-emerald-400/90 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Current streak: <strong className="font-bold text-white">{currentStreak} {currentStreak === 1 ? "day" : "days"}</strong>
            </div>
          )}
        </div>

        {/* Right: Check-in & Undo actions */}
        <div className="flex flex-col sm:flex-row md:flex-col items-stretch sm:items-center md:items-end gap-3 shrink-0">
          {!isTodaySuccessful ? (
            <button
              onClick={handleMarkSuccessful}
              type="button"
              className={`group relative flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 shadow-[0_0_25px_rgba(16,185,129,0.35)] hover:shadow-[0_0_35px_rgba(16,185,129,0.5)] active:scale-[0.98] transition-all cursor-pointer ${
                animating ? "scale-105 ring-2 ring-emerald-300" : ""
              }`}
            >
              <CheckCircle2 className="w-5 h-5 text-emerald-100 group-hover:scale-110 transition-transform" />
              <span>Mark Today as Successful</span>
            </button>
          ) : (
            <div className="flex flex-col sm:flex-row items-center gap-2.5 w-full sm:w-auto">
              <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-sm font-semibold shadow-[0_0_15px_rgba(16,185,129,0.15)]">
                <Check className="w-4 h-4 text-emerald-400 stroke-[3]" />
                <span>Marked Clean Today</span>
              </div>

              <button
                onClick={handleUndo}
                type="button"
                className="flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-700/60 text-xs font-medium text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer"
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
