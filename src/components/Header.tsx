"use client";

import React from "react";
import {
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
  Sparkles,
  Cloud,
  LogOut,
  Loader2,
  Sun,
  Moon,
} from "lucide-react";
import { UnloopLogo } from "./UnloopLogo";
import { useTheme } from "../lib/theme";

interface HeaderProps {
  currentYear: number;
  availableYears: number[];
  onSelectYear: (year: number) => void;
  onOpenSettings: () => void;
  isSampleActive: boolean;
  onToggleSample: () => void;
  userEmail: string | null;
  onOpenAuth: () => void;
  onSignOut: () => void;
  isSyncing: boolean;
}

export function Header({
  currentYear,
  availableYears,
  onSelectYear,
  onOpenSettings,
  isSampleActive,
  onToggleSample,
  userEmail,
  onOpenAuth,
  onSignOut,
  isSyncing,
}: HeaderProps) {
  const systemYear = new Date().getFullYear();
  const { theme, toggleTheme, mounted } = useTheme();

  return (
    <header className="border-b border-slate-200/80 dark:border-white/[0.08] bg-white/80 dark:bg-[#0c0e15]/80 backdrop-blur-md sticky top-0 z-30 transition-colors duration-150">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3.5 flex flex-wrap items-center justify-between gap-4">
        {/* Logo & Tagline */}
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-emerald-50 dark:bg-gradient-to-br dark:from-emerald-500/20 dark:to-emerald-950 border border-emerald-200 dark:border-emerald-500/40 text-emerald-600 dark:text-emerald-400 shadow-sm dark:shadow-[0_0_15px_rgba(16,185,129,0.25)] transition-all">
            <UnloopLogo size={22} />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-ping opacity-60" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-1.5 transition-colors">
                Unloop
              </h1>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-medium tracking-wide text-emerald-700 dark:text-emerald-400/90 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 rounded-full transition-colors">
                <ShieldCheck className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                100% Private
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-zinc-400 hidden sm:block transition-colors">
              Daily habit-breaking tracker &bull; Zero disclosure
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Cloud Sync / Auth button */}
          {userEmail ? (
            <div className="flex items-center bg-slate-100 dark:bg-[#131620] border border-slate-200 dark:border-white/[0.08] rounded-lg p-0.5 transition-colors">
              <div
                className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs text-emerald-600 dark:text-emerald-400 font-medium"
                title={`Signed in as ${userEmail} (Sync active)`}
              >
                {isSyncing ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-600 dark:text-emerald-400" />
                ) : (
                  <Cloud className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                )}
                <span className="hidden sm:inline">Synced</span>
              </div>
              <button
                id="sign-out-btn"
                type="button"
                onClick={onSignOut}
                className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 dark:text-zinc-400 dark:hover:text-white dark:hover:bg-white/[0.06] transition-colors cursor-pointer"
                title={`Sign out (${userEmail})`}
                aria-label="Sign out"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              id="cloud-sync-btn"
              onClick={onOpenAuth}
              type="button"
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 border border-slate-200 hover:border-slate-300 dark:bg-[#131620] dark:hover:bg-zinc-800 dark:text-zinc-300 dark:border-white/[0.08] dark:hover:border-zinc-700 transition-colors cursor-pointer shadow-xs dark:shadow-none"
              title="Sign in to sync your progress across desktop and mobile"
            >
              <Cloud className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span className="hidden sm:inline">Cloud Sync</span>
            </button>
          )}

          {/* Sample preview toggle */}
          <button
            id="preview-demo-btn"
            onClick={onToggleSample}
            type="button"
            className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg border transition-all cursor-pointer ${
              isSampleActive
                ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-700 dark:text-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.2)]"
                : "bg-slate-100 hover:bg-slate-200 border-slate-200 hover:border-slate-300 text-slate-600 hover:text-slate-900 dark:bg-zinc-900/60 dark:border-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200 dark:hover:border-zinc-700 shadow-xs dark:shadow-none"
            }`}
            title="Preview calendar with realistic habit-breaking progress"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span className="hidden md:inline">{isSampleActive ? "Preview Active" : "Preview Demo"}</span>
          </button>

          {/* Year selector */}
          <div className="flex items-center bg-slate-100 dark:bg-[#131620] border border-slate-200 dark:border-white/[0.08] rounded-lg p-0.5 transition-colors shadow-xs dark:shadow-none">
            <button
              id="prev-year-btn"
              onClick={() => onSelectYear(currentYear - 1)}
              type="button"
              className="p-1 rounded text-slate-500 hover:text-slate-900 hover:bg-slate-200/60 dark:text-zinc-400 dark:hover:text-white dark:hover:bg-white/[0.06] transition-colors cursor-pointer"
              title="Previous year"
              aria-label="Previous year"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <select
              id="year-select"
              value={currentYear}
              onChange={(e) => onSelectYear(Number(e.target.value))}
              className="bg-transparent text-xs font-semibold text-slate-800 dark:text-zinc-200 px-2 py-1 focus:outline-none cursor-pointer"
            >
              {availableYears.map((yr) => (
                <option key={yr} value={yr} className="bg-white dark:bg-[#131620] text-slate-800 dark:text-zinc-200">
                  {yr} {yr === systemYear ? "(This Year)" : ""}
                </option>
              ))}
            </select>

            <button
              id="next-year-btn"
              onClick={() => onSelectYear(currentYear + 1)}
              type="button"
              className="p-1 rounded text-slate-500 hover:text-slate-900 hover:bg-slate-200/60 dark:text-zinc-400 dark:hover:text-white dark:hover:bg-white/[0.06] transition-colors cursor-pointer"
              title="Next year"
              aria-label="Next year"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Theme Toggle Button */}
          <button
            id="theme-toggle-btn"
            onClick={toggleTheme}
            type="button"
            className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-200 hover:border-slate-300 text-slate-600 hover:text-slate-900 dark:bg-[#131620] dark:hover:bg-zinc-800 dark:border-white/[0.08] dark:hover:border-zinc-700 dark:text-zinc-400 dark:hover:text-white transition-all cursor-pointer shadow-xs dark:shadow-none"
            title={mounted && theme === "light" ? "Switch to Dark Mode" : "Switch to Light Mode"}
            aria-label={mounted && theme === "light" ? "Switch to Dark Mode" : "Switch to Light Mode"}
          >
            {mounted && theme === "light" ? (
              <Moon className="w-4 h-4 text-slate-700 transition-transform duration-200 hover:-rotate-12" />
            ) : (
              <Sun className="w-4 h-4 text-amber-400 transition-transform duration-200 hover:rotate-45" />
            )}
          </button>

          {/* Settings / Backup */}
          <button
            id="settings-btn"
            onClick={onOpenSettings}
            type="button"
            className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-200 hover:border-slate-300 text-slate-600 hover:text-slate-900 dark:bg-[#131620] dark:border-white/[0.08] dark:text-zinc-400 dark:hover:text-white dark:hover:border-zinc-700 transition-colors cursor-pointer shadow-xs dark:shadow-none"
            title="Manage private data (Backup, Restore, Sync)"
            aria-label="Settings and Data Management"
          >
            <SlidersHorizontal className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
