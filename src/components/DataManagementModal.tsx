"use client";

import React, { useRef, useState } from "react";
import { X, Download, Upload, Trash2, Shield, AlertTriangle, Check, RefreshCw, CloudUpload } from "lucide-react";
import { exportData, importData, clearAllData } from "../lib/storage";
import { CheckInStore } from "../lib/types";

interface DataManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDataChanged: (newCheckIns: CheckInStore) => void;
  onLoadSample: () => void;
  userId?: string | null;
  userEmail?: string | null;
  onMigrateToCloud?: () => Promise<void>;
}

export function DataManagementModal({
  isOpen,
  onClose,
  onDataChanged,
  onLoadSample,
  userId,
  userEmail,
  onMigrateToCloud,
}: DataManagementModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [confirmReset, setConfirmReset] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const [isMigrating, setIsMigrating] = useState(false);

  if (!isOpen) return null;

  const showFeedback = (msg: string) => {
    setFeedbackMessage(msg);
    setTimeout(() => setFeedbackMessage(null), 3500);
  };

  const handleExport = () => {
    try {
      const dataStr = exportData();
      const blob = new Blob([dataStr], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      const dateStr = new Date().toISOString().slice(0, 10);
      link.href = url;
      link.download = `unloop-backup-${dateStr}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      showFeedback("Backup downloaded successfully.");
    } catch {
      showFeedback("Failed to export backup.");
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const restored = importData(content);
        onDataChanged(restored);
        showFeedback("Data restored successfully from backup.");
      } catch (err) {
        showFeedback(err instanceof Error ? err.message : "Invalid backup file.");
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleReset = () => {
    if (!confirmReset) {
      setConfirmReset(true);
      return;
    }
    clearAllData();
    onDataChanged({});
    setConfirmReset(false);
    showFeedback("All progress has been reset.");
  };

  const handleSyncToCloud = async () => {
    if (!onMigrateToCloud) return;
    setIsMigrating(true);
    try {
      await onMigrateToCloud();
      showFeedback("All local check-ins synced to your cloud account.");
    } catch {
      showFeedback("Sync failed. Check your network connection.");
    } finally {
      setIsMigrating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 dark:bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-[#11141e] border border-slate-200 dark:border-white/[0.1] shadow-2xl p-6 relative max-h-[90vh] overflow-y-auto transition-colors">
        {/* Close Button */}
        <button
          onClick={onClose}
          type="button"
          className="absolute top-5 right-5 p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:text-zinc-400 dark:hover:text-white dark:hover:bg-white/[0.06] transition-colors cursor-pointer"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-500/15 border border-emerald-200 dark:border-emerald-500/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center transition-colors">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight transition-colors">
              Privacy &amp; Data Sovereignty
            </h3>
            <p className="text-xs text-slate-500 dark:text-zinc-400 transition-colors">
              Your tracking data belongs entirely to you
            </p>
          </div>
        </div>

        {/* Account Sync status if logged in */}
        {userId && (
          <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 text-xs text-emerald-800 dark:text-emerald-300 leading-relaxed mb-4 flex items-center justify-between gap-3 transition-colors">
            <div>
              <strong className="block font-semibold text-emerald-900 dark:text-emerald-200">
                Cloud Sync Active
              </strong>
              <span className="text-slate-500 dark:text-zinc-400">Signed in as {userEmail}</span>
            </div>
            {onMigrateToCloud && (
              <button
                type="button"
                onClick={handleSyncToCloud}
                disabled={isMigrating}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs transition-colors disabled:opacity-50 shrink-0 cursor-pointer"
              >
                <CloudUpload className="w-3.5 h-3.5" />
                <span>{isMigrating ? "Syncing..." : "Sync Local"}</span>
              </button>
            )}
          </div>
        )}

        {/* Privacy Note */}
        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#161a25] border border-slate-200/80 dark:border-white/[0.06] text-xs text-slate-600 dark:text-zinc-300 leading-relaxed mb-6 transition-colors">
          <strong className="text-emerald-700 dark:text-emerald-400 block mb-1">Zero-Disclosure Guarantee:</strong>
          Unloop never asks what habit you are conquering. Check-ins are identified only by date and status. No habit names, descriptions, or personal questionnaires exist in the code or database.
        </div>

        {/* Actions list */}
        <div className="space-y-3">
          {/* Export button */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-[#141824] border border-slate-200/80 dark:border-white/[0.05] transition-colors">
            <div>
              <div className="text-sm font-semibold text-slate-900 dark:text-white">Export Private Backup</div>
              <div className="text-xs text-slate-500 dark:text-zinc-400">Download a JSON file of all check-ins</div>
            </div>
            <button
              onClick={handleExport}
              type="button"
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-200/80 hover:bg-slate-300/80 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-xs font-semibold text-slate-800 dark:text-zinc-200 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Download</span>
            </button>
          </div>

          {/* Import button */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-[#141824] border border-slate-200/80 dark:border-white/[0.05] transition-colors">
            <div>
              <div className="text-sm font-semibold text-slate-900 dark:text-white">Restore from Backup</div>
              <div className="text-xs text-slate-500 dark:text-zinc-400">Import a previously downloaded JSON file</div>
            </div>
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleFileChange}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                type="button"
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-200/80 hover:bg-slate-300/80 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-xs font-semibold text-slate-800 dark:text-zinc-200 transition-colors cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Upload</span>
              </button>
            </div>
          </div>

          {/* Load Sample Data */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-[#141824] border border-slate-200/80 dark:border-white/[0.05] transition-colors">
            <div>
              <div className="text-sm font-semibold text-slate-900 dark:text-white">Load Demo Calendar</div>
              <div className="text-xs text-slate-500 dark:text-zinc-400">Populate realistic habit-breaking history</div>
            </div>
            <button
              onClick={() => {
                onLoadSample();
                showFeedback("Loaded realistic demo habit-breaking data.");
              }}
              type="button"
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 dark:bg-emerald-950/40 dark:hover:bg-emerald-900/60 dark:border-emerald-500/30 text-xs font-semibold text-emerald-700 dark:text-emerald-300 transition-colors cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Load Demo</span>
            </button>
          </div>

          {/* Reset / Wipe */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-500/20 transition-colors">
            <div>
              <div className="text-sm font-semibold text-red-700 dark:text-red-200">Clear All Records</div>
              <div className="text-xs text-slate-500 dark:text-zinc-400">Permanently wipe your local tracking data</div>
            </div>
            <button
              onClick={handleReset}
              type="button"
              className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                confirmReset
                  ? "bg-red-600 text-white animate-pulse"
                  : "bg-red-100 hover:bg-red-200 border border-red-200 text-red-700 dark:bg-red-900/30 dark:hover:bg-red-900/50 dark:border-red-500/30 dark:text-red-300"
              }`}
            >
              {confirmReset ? (
                <>
                  <AlertTriangle className="w-3.5 h-3.5 text-white" />
                  <span>Confirm Wipe</span>
                </>
              ) : (
                <>
                  <Trash2 className="w-3.5 h-3.5 text-red-600 dark:text-red-400" />
                  <span>Clear Data</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Feedback message banner */}
        {feedbackMessage && (
          <div className="mt-4 p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-500/15 border border-emerald-200 dark:border-emerald-500/30 text-emerald-800 dark:text-emerald-300 text-xs font-medium flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>{feedbackMessage}</span>
          </div>
        )}

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            type="button"
            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-xs font-semibold dark:text-white transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
