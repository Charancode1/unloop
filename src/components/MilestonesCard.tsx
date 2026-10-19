"use client";

import React from "react";
import { getMilestones } from "../lib/dates";
import { Award, CheckCircle2, Lock } from "lucide-react";

interface MilestonesCardProps {
  bestStreak: number;
  currentStreak: number;
}

export function MilestonesCard({ bestStreak, currentStreak }: MilestonesCardProps) {
  const milestones = getMilestones(bestStreak, currentStreak);
  const nextMilestone = milestones.find((m) => !m.reached) || milestones[milestones.length - 1];
  const daysRemaining = Math.max(0, nextMilestone.days - currentStreak);

  return (
    <section className="rounded-2xl bg-[#0f121a] border border-white/[0.08] p-5 sm:p-6 shadow-xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center gap-2">
              <Award className="w-5 h-5 text-emerald-400" />
              Sovereignty Milestones
            </h3>
          </div>
          <p className="text-xs text-zinc-400 mt-0.5">
            Key psychological benchmarks in breaking an automatic loop
          </p>
        </div>

        {/* Current target pill */}
        <div className="self-start sm:self-auto px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
          Target: {nextMilestone.days} Days &bull;{" "}
          {daysRemaining === 0 ? "Achieved!" : `${daysRemaining} days left`}
        </div>
      </div>

      {/* Progress Bar towards Next Milestone */}
      <div className="mb-6 p-4 rounded-xl bg-[#141824] border border-white/[0.05]">
        <div className="flex justify-between items-center text-xs font-medium mb-2">
          <span className="text-zinc-200">
            Next: <strong className="text-emerald-400">{nextMilestone.title}</strong> ({nextMilestone.days} days)
          </span>
          <span className="text-emerald-400 font-bold">{nextMilestone.progress}%</span>
        </div>
        <div className="w-full bg-zinc-800/80 rounded-full h-2.5 overflow-hidden">
          <div
            className="bg-gradient-to-r from-emerald-600 to-emerald-400 h-full rounded-full transition-all duration-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"
            style={{ width: `${nextMilestone.progress}%` }}
          />
        </div>
        <p className="text-[11px] text-zinc-400 mt-2 italic">
          &ldquo;{nextMilestone.description}&rdquo;
        </p>
      </div>

      {/* Grid of All Milestones */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5 sm:gap-3">
        {milestones.map((m) => {
          return (
            <div
              key={m.days}
              className={`p-3 rounded-xl border flex flex-col justify-between transition-all ${
                m.reached
                  ? "bg-emerald-950/20 border-emerald-500/40 text-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.15)]"
                  : "bg-[#12151f] border-white/[0.04] text-zinc-400 opacity-70"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold tracking-tight">
                  {m.days} {m.days === 1 ? "Day" : "Days"}
                </span>
                {m.reached ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                ) : (
                  <Lock className="w-3.5 h-3.5 text-zinc-400" />
                )}
              </div>
              <div className="mt-2 text-xs font-semibold text-zinc-200 truncate">
                {m.title}
              </div>
              <div className="mt-1 text-[10px] text-zinc-400 line-clamp-2">
                {m.description}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
