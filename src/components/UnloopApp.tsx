"use client";

import React, { useState, useMemo, useSyncExternalStore } from "react";
import { Header } from "./Header";
import { CheckInHero } from "./CheckInHero";
import { StatsCards } from "./StatsCards";
import { ContributionHeatmap } from "./ContributionHeatmap";
import { MonthGridView } from "./MonthGridView";
import { MilestonesCard } from "./MilestonesCard";
import { DataManagementModal } from "./DataManagementModal";
import { CheckInStore } from "../lib/types";
import {
  saveCheckIns,
  generateSampleData,
  subscribeCheckIns,
  getCheckInsSnapshot,
  getServerSnapshot,
} from "../lib/storage";
import { calculateStreakStats, getTodayKey } from "../lib/dates";
import { LayoutGrid, Calendar as CalendarIcon, ShieldCheck } from "lucide-react";

export function UnloopApp() {
  const storedCheckIns = useSyncExternalStore(
    subscribeCheckIns,
    getCheckInsSnapshot,
    getServerSnapshot
  );

  const [sampleCheckIns, setSampleCheckIns] = useState<CheckInStore | null>(null);

  // Active checkIns: either sample data or real stored checkIns
  const checkIns = sampleCheckIns || storedCheckIns;
  const isSampleActive = sampleCheckIns !== null;

  // Default to current year
  const systemYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState<number>(systemYear);
  const [viewMode, setViewMode] = useState<"heatmap" | "month">("heatmap");
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Toggle today's status
  const handleToggleToday = (status: boolean) => {
    const todayKey = getTodayKey();
    if (isSampleActive && sampleCheckIns) {
      setSampleCheckIns({ ...sampleCheckIns, [todayKey]: status });
    } else {
      const updated = { ...storedCheckIns, [todayKey]: status };
      saveCheckIns(updated);
    }
  };

  // Toggle any day
  const handleToggleDay = (dateKey: string) => {
    const current = !!checkIns[dateKey];
    if (isSampleActive && sampleCheckIns) {
      setSampleCheckIns({ ...sampleCheckIns, [dateKey]: !current });
    } else {
      const updated = { ...storedCheckIns, [dateKey]: !current };
      saveCheckIns(updated);
    }
  };

  // Toggle demo sample data
  const handleToggleSample = () => {
    if (isSampleActive) {
      setSampleCheckIns(null);
    } else {
      const sample = generateSampleData();
      setSampleCheckIns(sample);
    }
  };

  const handleDataChanged = (newData: CheckInStore) => {
    setSampleCheckIns(null);
    saveCheckIns(newData);
  };

  // Streak & Statistics calculation
  const stats = useMemo(() => {
    return calculateStreakStats(checkIns, selectedYear);
  }, [checkIns, selectedYear]);

  const todayKey = getTodayKey();
  const isTodaySuccessful = !!checkIns[todayKey];

  const availableYears = [systemYear - 2, systemYear - 1, systemYear, systemYear + 1];

  return (
    <div className="min-h-screen bg-[#090a0f] text-zinc-100 flex flex-col font-sans">
      {/* Header */}
      <Header
        currentYear={selectedYear}
        availableYears={availableYears}
        onSelectYear={setSelectedYear}
        onOpenSettings={() => setIsSettingsOpen(true)}
        isSampleActive={isSampleActive}
        onToggleSample={handleToggleSample}
      />

      {/* Main Content */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        {/* Sample Mode Notice (if active) */}
        {isSampleActive && (
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between text-xs text-emerald-300">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>
                <strong>Demo Preview Active:</strong> You are viewing sample progress. Your actual data is safely preserved.
              </span>
            </div>
            <button
              onClick={handleToggleSample}
              type="button"
              className="px-2.5 py-1 rounded-md bg-emerald-500/20 hover:bg-emerald-500/30 font-semibold text-white transition-colors cursor-pointer"
            >
              Exit Demo
            </button>
          </div>
        )}

        {/* 1. Daily Check-in Hero */}
        <CheckInHero
          isTodaySuccessful={isTodaySuccessful}
          onToggleToday={handleToggleToday}
          currentStreak={stats.currentStreak}
        />

        {/* 2. Key Metrics & Streak Stats */}
        <StatsCards stats={stats} selectedYear={selectedYear} />

        {/* View Mode Switcher: Year Heatmap vs Month Grid */}
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-1.5 p-1 bg-[#121520] border border-white/[0.06] rounded-xl">
            <button
              type="button"
              onClick={() => setViewMode("heatmap")}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                viewMode === "heatmap"
                  ? "bg-zinc-800 text-white shadow-sm"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5 text-emerald-400" />
              <span>Year Heatmap</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode("month")}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                viewMode === "month"
                  ? "bg-zinc-800 text-white shadow-sm"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              <CalendarIcon className="w-3.5 h-3.5 text-emerald-400" />
              <span>Month Calendar</span>
            </button>
          </div>

          <span className="text-xs text-zinc-400 hidden sm:inline">
            Active Year: <strong className="text-zinc-200 font-semibold">{selectedYear}</strong>
          </span>
        </div>

        {/* 3. Heatmap or Month Grid View */}
        {viewMode === "heatmap" ? (
          <ContributionHeatmap
            year={selectedYear}
            checkIns={checkIns}
            onToggleDay={handleToggleDay}
          />
        ) : (
          <MonthGridView
            initialYear={selectedYear}
            checkIns={checkIns}
            onToggleDay={handleToggleDay}
          />
        )}

        {/* 4. Milestones Track */}
        <MilestonesCard
          bestStreak={stats.bestStreak}
          currentStreak={stats.currentStreak}
        />
      </main>

      {/* Footer */}
      <footer className="border-t border-white/[0.06] py-8 text-center text-xs text-zinc-400 mt-12 bg-[#08090d]">
        <div className="max-w-6xl mx-auto px-4 space-y-2">
          <div className="flex items-center justify-center gap-1.5 text-zinc-400 font-medium">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>Unloop &bull; Absolute Privacy by Design</span>
          </div>
          <p className="text-zinc-400 max-w-md mx-auto">
            No habits disclosed. No accounts created. No cloud tracking.
            Every green square is yours alone.
          </p>
        </div>
      </footer>

      {/* Data Sovereignty & Backup Modal */}
      <DataManagementModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onDataChanged={handleDataChanged}
        onLoadSample={() => {
          const sample = generateSampleData();
          setSampleCheckIns(sample);
          setIsSettingsOpen(false);
        }}
      />
    </div>
  );
}
