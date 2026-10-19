"use client";

import React from "react";
import { ShieldCheck, ChevronLeft, ChevronRight, SlidersHorizontal, Sparkles } from "lucide-react";
import { UnloopLogo } from "./UnloopLogo";

interface HeaderProps {
  currentYear: number;
  availableYears: number[];
  onSelectYear: (year: number) => void;
  onOpenSettings: () => void;
  isSampleActive: boolean;
  onToggleSample: () => void;
}

export function Header({
  currentYear,
  availableYears,
  onSelectYear,
  onOpenSettings,
  isSampleActive,
  onToggleSample,
}: HeaderProps) {
  const systemYear = new Date().getFullYear();

  return (
    <header className="border-b border-white/[0.08] bg-[#0c0e15]/80 backdrop-blur-md sticky top-0 z-30">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3.5 flex flex-wrap items-center justify-between gap-4">
        {/* Logo & Tagline */}
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500/20 to-emerald-950 border border-emerald-500/40 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.25)]">
            {/* New Unloop brand symbol */}
            <UnloopLogo size={22} />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping opacity-60" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-1.5">
                Unloop
              </h1>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-medium tracking-wide text-emerald-400/90 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
                <ShieldCheck className="w-3 h-3 text-emerald-400" />
                100% Private
              </span>
            </div>
            <p className="text-xs text-zinc-400 hidden sm:block">
              Daily habit-breaking tracker &bull; Zero disclosure
            </p>
          </div>
        </div>

        {/* Year Navigator & Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Sample preview toggle */}
          <button
            onClick={onToggleSample}
            type="button"
            className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg border transition-all ${
              isSampleActive
                ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.2)]"
                : "bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700"
            }`}
            title="Preview calendar with realistic habit-breaking progress"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span className="hidden md:inline">{isSampleActive ? "Preview Active" : "Preview Demo"}</span>
          </button>

          {/* Year selector */}
          <div className="flex items-center bg-[#131620] border border-white/[0.08] rounded-lg p-0.5">
            <button
              onClick={() => onSelectYear(currentYear - 1)}
              type="button"
              className="p-1 rounded text-zinc-400 hover:text-white hover:bg-white/[0.06] transition-colors"
              title="Previous year"
              aria-label="Previous year"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <select
              value={currentYear}
              onChange={(e) => onSelectYear(Number(e.target.value))}
              className="bg-transparent text-xs font-semibold text-zinc-200 px-2 py-1 focus:outline-none cursor-pointer"
            >
              {availableYears.map((yr) => (
                <option key={yr} value={yr} className="bg-[#131620] text-zinc-200">
                  {yr} {yr === systemYear ? "(This Year)" : ""}
                </option>
              ))}
            </select>

            <button
              onClick={() => onSelectYear(currentYear + 1)}
              type="button"
              className="p-1 rounded text-zinc-400 hover:text-white hover:bg-white/[0.06] transition-colors"
              title="Next year"
              aria-label="Next year"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Settings / Backup */}
          <button
            onClick={onOpenSettings}
            type="button"
            className="p-2 rounded-lg bg-[#131620] border border-white/[0.08] text-zinc-400 hover:text-white hover:border-zinc-700 transition-colors"
            title="Manage private data (Backup, Restore, Reset)"
            aria-label="Settings and Data Management"
          >
            <SlidersHorizontal className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
