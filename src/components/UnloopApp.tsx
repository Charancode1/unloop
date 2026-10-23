"use client";

import React, { useState, useMemo, useEffect, useSyncExternalStore, useCallback } from "react";
import type { User } from "@supabase/supabase-js";
import { Header } from "./Header";
import { CheckInHero } from "./CheckInHero";
import { StatsCards } from "./StatsCards";
import { ContributionHeatmap } from "./ContributionHeatmap";
import { MonthGridView } from "./MonthGridView";
import { MilestonesCard } from "./MilestonesCard";
import { DataManagementModal } from "./DataManagementModal";
import { AuthModal } from "./AuthModal";
import { CheckInStore } from "../lib/types";
import {
  saveCheckIns,
  generateSampleData,
  subscribeCheckIns,
  getCheckInsSnapshot,
  getServerSnapshot,
  loadCheckIns,
} from "../lib/storage";
import { calculateStreakStats, getTodayKey } from "../lib/dates";
import { getSupabase } from "../lib/supabase";
import {
  fetchCloudCheckIns,
  upsertCloudCheckIn,
  migrateLocalCheckInsToCloud,
  subscribeToCloudChanges,
} from "../lib/sync";
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

  // Supabase Auth and Sync State
  const [user, setUser] = useState<User | null>(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  // Default to current year
  const systemYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState<number>(systemYear);
  const [viewMode, setViewMode] = useState<"heatmap" | "month">("heatmap");
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Load cloud data and perform safe one-time migration if local data exists
  const loadCloudData = useCallback(async (userId: string) => {
    setIsSyncing(true);
    try {
      const local = loadCheckIns();
      const localKeys = Object.keys(local).filter((k) => local[k]);
      const cloud = await fetchCloudCheckIns(userId);

      // Safe migration: if user has local records not yet in cloud, upload them
      if (localKeys.length > 0 && cloud) {
        const missingInCloud = localKeys.filter((k) => !cloud[k]);
        if (missingInCloud.length > 0) {
          const { mergedStore } = await migrateLocalCheckInsToCloud(userId, local);
          saveCheckIns(mergedStore);
          return;
        }
      }

      if (cloud) {
        saveCheckIns(cloud);
      }
    } catch (err) {
      console.warn("Could not load cloud data, operating on cached store:", err);
    } finally {
      setIsSyncing(false);
    }
  }, []);

  // Listen to Supabase Auth state changes
  useEffect(() => {
    const supabase = getSupabase();
    if (!supabase) return;

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
        loadCloudData(session.user.id);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(session.user);
        loadCloudData(session.user.id);
      } else {
        setUser(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [loadCloudData]);

  // Real-time synchronization and window focus refresh across devices
  useEffect(() => {
    if (!user) return;

    // 1. Subscribe to Supabase Realtime channel
    const unsubscribeRealtime = subscribeToCloudChanges(
      user.id,
      (dateKey, isSuccessful) => {
        if (!isSampleActive) {
          const current = getCheckInsSnapshot();
          const updated = { ...current, [dateKey]: isSuccessful };
          saveCheckIns(updated);
        }
      }
    );

    // 2. Refresh on window focus or visibility change (e.g. mobile tab wake)
    const handleFocus = async () => {
      if (document.visibilityState === "visible") {
        setIsSyncing(true);
        try {
          const cloudData = await fetchCloudCheckIns(user.id);
          if (cloudData && !isSampleActive) {
            saveCheckIns(cloudData);
          }
        } catch (err) {
          console.warn("Auto-sync refresh paused:", err);
        } finally {
          setIsSyncing(false);
        }
      }
    };

    window.addEventListener("focus", handleFocus);
    window.addEventListener("visibilitychange", handleFocus);

    return () => {
      unsubscribeRealtime();
      window.removeEventListener("focus", handleFocus);
      window.removeEventListener("visibilitychange", handleFocus);
    };
  }, [user, isSampleActive]);

  // Toggle today's status
  const handleToggleToday = async (status: boolean) => {
    const todayKey = getTodayKey();
    if (isSampleActive && sampleCheckIns) {
      setSampleCheckIns({ ...sampleCheckIns, [todayKey]: status });
    } else {
      // Optimistic local update
      const updated = { ...storedCheckIns, [todayKey]: status };
      saveCheckIns(updated);

      // Cloud sync if authenticated
      if (user) {
        setIsSyncing(true);
        try {
          await upsertCloudCheckIn(user.id, todayKey, status);
        } catch (err) {
          console.error("Cloud sync failed for today:", err);
        } finally {
          setIsSyncing(false);
        }
      }
    }
  };

  // Toggle any day
  const handleToggleDay = async (dateKey: string) => {
    const current = !!checkIns[dateKey];
    const newStatus = !current;
    if (isSampleActive && sampleCheckIns) {
      setSampleCheckIns({ ...sampleCheckIns, [dateKey]: newStatus });
    } else {
      // Optimistic local update
      const updated = { ...storedCheckIns, [dateKey]: newStatus };
      saveCheckIns(updated);

      // Cloud sync if authenticated
      if (user) {
        setIsSyncing(true);
        try {
          await upsertCloudCheckIn(user.id, dateKey, newStatus);
        } catch (err) {
          console.error("Cloud sync failed for date:", err);
        } finally {
          setIsSyncing(false);
        }
      }
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

  const handleDataChanged = async (newData: CheckInStore) => {
    setSampleCheckIns(null);
    saveCheckIns(newData);
    if (user) {
      setIsSyncing(true);
      try {
        await migrateLocalCheckInsToCloud(user.id, newData);
      } finally {
        setIsSyncing(false);
      }
    }
  };

  const handleSignOut = async () => {
    const supabase = getSupabase();
    if (supabase) {
      await supabase.auth.signOut();
    }
    setUser(null);
  };

  const handleMigrateToCloud = async () => {
    if (!user) return;
    setIsSyncing(true);
    try {
      const current = getCheckInsSnapshot();
      const { mergedStore } = await migrateLocalCheckInsToCloud(user.id, current);
      saveCheckIns(mergedStore);
    } finally {
      setIsSyncing(false);
    }
  };

  // Streak & Statistics calculation
  const stats = useMemo(() => {
    return calculateStreakStats(checkIns, selectedYear);
  }, [checkIns, selectedYear]);

  const todayKey = getTodayKey();
  const isTodaySuccessful = !!checkIns[todayKey];

  const availableYears = [systemYear - 2, systemYear - 1, systemYear, systemYear + 1];

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 dark:bg-[#090a0f] dark:text-zinc-100 flex flex-col font-sans transition-colors duration-150">
      {/* Header with Theme Toggle & Cloud Sync */}
      <Header
        currentYear={selectedYear}
        availableYears={availableYears}
        onSelectYear={setSelectedYear}
        onOpenSettings={() => setIsSettingsOpen(true)}
        isSampleActive={isSampleActive}
        onToggleSample={handleToggleSample}
        userEmail={user?.email || null}
        onOpenAuth={() => setIsAuthOpen(true)}
        onSignOut={handleSignOut}
        isSyncing={isSyncing}
      />

      {/* Main Content */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        {/* Sample Mode Notice (if active) */}
        {isSampleActive && (
          <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 flex items-center justify-between text-xs text-emerald-800 dark:text-emerald-300 transition-colors">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-ping" />
              <span>
                <strong>Demo Preview Active:</strong> You are viewing sample progress. Your actual data is safely preserved.
              </span>
            </div>
            <button
              onClick={handleToggleSample}
              type="button"
              className="px-2.5 py-1 rounded-md bg-emerald-600 hover:bg-emerald-500 dark:bg-emerald-500/20 dark:hover:bg-emerald-500/30 font-semibold text-white transition-colors cursor-pointer"
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
        <StatsCards stats={stats} />

        {/* View Mode Switcher: Year Heatmap vs Month Grid */}
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-[#121520] border border-slate-200/80 dark:border-white/[0.06] rounded-xl transition-colors">
            <button
              id="view-heatmap-btn"
              type="button"
              onClick={() => setViewMode("heatmap")}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                viewMode === "heatmap"
                  ? "bg-white dark:bg-zinc-800 text-slate-900 dark:text-white shadow-xs dark:shadow-sm"
                  : "text-slate-500 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-zinc-200"
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Year Heatmap</span>
            </button>
            <button
              id="view-month-btn"
              type="button"
              onClick={() => setViewMode("month")}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                viewMode === "month"
                  ? "bg-white dark:bg-zinc-800 text-slate-900 dark:text-white shadow-xs dark:shadow-sm"
                  : "text-slate-500 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-zinc-200"
              }`}
            >
              <CalendarIcon className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Month Calendar</span>
            </button>
          </div>

          <span className="text-xs text-slate-500 dark:text-zinc-400 hidden sm:inline transition-colors">
            Active Year: <strong className="text-slate-800 dark:text-zinc-200 font-semibold">{selectedYear}</strong>
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
      <footer className="border-t border-slate-200/80 dark:border-white/[0.06] py-8 text-center text-xs text-slate-500 dark:text-zinc-400 mt-12 bg-slate-100/60 dark:bg-[#08090d] transition-colors">
        <div className="max-w-6xl mx-auto px-4 space-y-2">
          <div className="flex items-center justify-center gap-1.5 text-slate-700 dark:text-zinc-400 font-medium">
            <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-500" />
            <span>Unloop &bull; Absolute Privacy by Design</span>
          </div>
          <p className="text-slate-500 dark:text-zinc-400 max-w-md mx-auto">
            No habits disclosed. Zero tracking cookies. End-to-end user-isolated records.
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
        userId={user?.id || null}
        userEmail={user?.email || null}
        onMigrateToCloud={handleMigrateToCloud}
      />

      {/* Authentication & Cloud Sync Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onAuthSuccess={() => {
          const supabase = getSupabase();
          if (supabase) {
            supabase.auth.getUser().then(({ data: { user } }) => {
              if (user) {
                setUser(user);
                loadCloudData(user.id);
              }
            });
          }
        }}
      />
    </div>
  );
}
