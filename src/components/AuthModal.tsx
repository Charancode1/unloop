"use client";

import React, { useState } from "react";
import { X, Lock, Mail, AlertCircle, CheckCircle2, Cloud, Sparkles, Eye, EyeOff } from "lucide-react";
import { getSupabase, isSupabaseConfigured } from "../lib/supabase";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: () => void;
}

export function AuthModal({ isOpen, onClose, onAuthSuccess }: AuthModalProps) {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const configured = isSupabaseConfigured();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!configured) {
      setErrorMessage("Supabase is not configured yet. Add your credentials to .env.local first.");
      return;
    }

    if (!email || !password) {
      setErrorMessage("Please enter both email and password.");
      return;
    }

    if (password.length < 6) {
      setErrorMessage("Password must be at least 6 characters.");
      return;
    }

    const supabase = getSupabase();
    if (!supabase) return;

    setLoading(true);

    try {
      if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          throw error;
        }

        setSuccessMessage("Signed in successfully!");
        setTimeout(() => {
          onAuthSuccess();
          onClose();
        }, 600);
      } else {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        });

        if (error) {
          throw error;
        }

        // If user is returned and session exists, they are immediately signed in
        if (data.session) {
          setSuccessMessage("Account created & signed in!");
          setTimeout(() => {
            onAuthSuccess();
            onClose();
          }, 600);
        } else {
          // If email confirmation is required by Supabase settings
          setSuccessMessage(
            "Account created! If your Supabase project requires email confirmation, check your inbox."
          );
          setTimeout(() => {
            onAuthSuccess();
            onClose();
          }, 2000);
        }
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Authentication failed.";
      setErrorMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md rounded-2xl bg-[#11141e] border border-white/[0.1] shadow-2xl p-6 relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          type="button"
          className="absolute top-5 right-5 p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-white/[0.06] transition-colors"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center">
            <Cloud className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white tracking-tight">
              Cross-Device Cloud Sync
            </h3>
            <p className="text-xs text-zinc-400">
              Access your green squares on desktop and mobile
            </p>
          </div>
        </div>

        {/* Setup Notice if not configured */}
        {!configured && (
          <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-200 leading-relaxed mb-5">
            <strong className="block font-semibold mb-1 text-amber-300">
              Supabase Setup Required
            </strong>
            To enable cloud sync across your devices, connect your Supabase project credentials in <code className="bg-black/40 px-1 py-0.5 rounded font-mono text-[11px]">.env.local</code>.
          </div>
        )}

        {/* Tab switchers: Sign In vs Sign Up */}
        <div className="flex bg-[#161a25] p-1 rounded-xl border border-white/[0.05] mb-5">
          <button
            type="button"
            onClick={() => {
              setMode("signin");
              setErrorMessage(null);
            }}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
              mode === "signin"
                ? "bg-zinc-800 text-white shadow-sm"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setMode("signup");
              setErrorMessage(null);
            }}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
              mode === "signup"
                ? "bg-zinc-800 text-white shadow-sm"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-zinc-400 absolute left-3 top-3 pointer-events-none" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full bg-[#141824] border border-white/[0.08] focus:border-emerald-500/50 rounded-xl pl-9 pr-3 py-2 text-xs sm:text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-zinc-400 absolute left-3 top-3 pointer-events-none" />
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#141824] border border-white/[0.08] focus:border-emerald-500/50 rounded-xl pl-9 pr-10 py-2 text-xs sm:text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-zinc-400 hover:text-zinc-200"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <span className="text-[11px] text-zinc-400 mt-1 block">
              Minimum 6 characters
            </span>
          </div>

          {/* Feedback messages */}
          {errorMessage && (
            <div className="p-3 rounded-xl bg-red-950/30 border border-red-500/30 text-red-200 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-500/30 text-emerald-200 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Submit button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-semibold text-xs sm:text-sm shadow-[0_0_20px_rgba(16,185,129,0.25)] transition-all disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
          >
            {loading ? (
              <span>Connecting...</span>
            ) : mode === "signin" ? (
              <>
                <Lock className="w-4 h-4" />
                <span>Sign In to Sync</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Create Private Account</span>
              </>
            )}
          </button>
        </form>

        {/* Privacy Note */}
        <div className="mt-5 pt-4 border-t border-white/[0.06] text-center text-[11px] text-zinc-400">
          Your account only stores dates you won. No habit names, descriptions, or personal questions are ever asked or saved.
        </div>
      </div>
    </div>
  );
}
