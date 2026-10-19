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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-lg rounded-2xl bg-[#11141e] border border-white/[0.1] shadow-2xl p-6 relative max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          type="button"
          className="absolute top-5 right-5 p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-white/[0.06] transition-colors"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white tracking-tight">
              Privacy &amp; Data Sovereignty
            </h3>
            <p className="text-xs text-zinc-400">
              Your tracking data belongs entirely to you
            </p>
          </div>
        </div>

        {/* Account Sync status if logged in */}
        {userId && (
          <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-300 leading-relaxed mb-4 flex items-center justify-between gap-3">
            <div>
              <strong className="block font-semibold text-emerald-200">
                Cloud Sync Active
              </strong>
              <span className="text-zinc-400">Signed in as {userEmail}</span>
            </div>
            {onMigrateToCloud && (
              <button
                type="button"
                onClick={handleSyncToCloud}
                disabled={isMigrating}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs transition-colors disabled:opacity-50 shrink-0"
              >
                <CloudUpload className="w-3.5 h-3.5" />
                <span>{isMigrating ? "Syncing..." : "Sync Local"}</span>
              </button>
            )}
          </div>
        )}

        {/* Privacy Note */}
        <div className="p-3.5 rounded-xl bg-[#161a25] border border-white/[0.06] text-xs text-zinc-300 leading-relaxed mb-6">
          <strong className="text-emerald-400 block mb-1">Zero-Disclosure Guarantee:</strong>
          Unloop never asks what habit you are conquering. Check-ins are identified only by date and status. No habit names, descriptions, or personal questionnaires exist in the code or database.
        </div>

        {/* Actions list */}
        <div className="space-y-3">
          {/* Export button */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-[#141824] border border-white/[0.05]">
            <div>
              <div className="text-sm font-semibold text-white">Export Private Backup</div>
              <div className="text-xs text-zinc-400">Download a JSON file of all check-ins</div>
            </div>
            <button
              onClick={handleExport}
              type="button"
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-zinc-200 transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              <span>Download</span>
            </button>
          </div>

          {/* Import button */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-[#141824] border border-white/[0.05]">
            <div>
              <div className="text-sm font-semibold text-white">Restore from Backup</div>
              <div className="text-xs text-zinc-400">Import a previously downloaded JSON file</div>
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
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-zinc-200 transition-colors"
              >
                <Upload className="w-3.5 h-3.5 text-emerald-400" />
                <span>Upload</span>
              </button>
            </div>
          </div>

          {/* Load Sample Data */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-[#141824] border border-white/[0.05]">
            <div>
              <div className="text-sm font-semibold text-white">Load Demo Calendar</div>
              <div className="text-xs text-zinc-400">Populate realistic habit-breaking history</div>
            </div>
            <button
              onClick={() => {
                onLoadSample();
                showFeedback("Loaded realistic demo habit-breaking data.");
              }}
              type="button"
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-emerald-950/40 hover:bg-emerald-900/60 border border-emerald-500/30 text-xs font-semibold text-emerald-300 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5 text-emerald-400" />
              <span>Load Demo</span>
            </button>
          </div>

          {/* Reset / Wipe */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-red-950/20 border border-red-500/20">
            <div>
              <div className="text-sm font-semibold text-red-200">Clear All Records</div>
              <div className="text-xs text-zinc-400">Permanently wipe your local tracking data</div>
            </div>
            <button
              onClick={handleReset}
              type="button"
              className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                confirmReset
                  ? "bg-red-600 text-white animate-pulse"
                  : "bg-red-900/30 hover:bg-red-900/50 border border-red-500/30 text-red-300"
              }`}
            >
              {confirmReset ? (
                <>
                  <AlertTriangle className="w-3.5 h-3.5 text-white" />
                  <span>Confirm Wipe</span>
                </>
              ) : (
                <>
                  <Trash2 className="w-3.5 h-3.5 text-red-400" />
                  <span>Clear Data</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Feedback message banner */}
        {feedbackMessage && (
          <div className="mt-4 p-2.5 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-medium flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-400" />
            <span>{feedbackMessage}</span>
          </div>
        )}

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            type="button"
            className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-white transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
