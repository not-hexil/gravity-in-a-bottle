'use client';

import React, { useEffect } from 'react';
import { MissionInstructionData } from '@/lib/game';

interface InstructionModalProps {
  isOpen: boolean;
  isInitialStart: boolean;
  data: MissionInstructionData;
  onResumeOrStart: () => void;
  onRestart?: () => void;
}

export default function InstructionModal({
  isOpen,
  isInitialStart,
  data,
  onResumeOrStart,
  onRestart,
}: InstructionModalProps) {
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        e.stopPropagation();
        onResumeOrStart();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, onResumeOrStart]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-xl border-4 border-slate-700 bg-slate-900 p-6 text-slate-100 shadow-2xl">
        {/* Status Badge */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <span className="rounded bg-amber-500/20 px-2.5 py-0.5 font-mono text-xs font-bold uppercase tracking-wider text-amber-400">
            {isInitialStart ? 'MISSION BRIEFING' : 'SIMULATION PAUSED'}
          </span>
          <span className="font-mono text-[11px] text-slate-400">{data.targetWorld}</span>
        </div>

        {/* Title & Objective */}
        <h2 className="mt-3 font-mono text-xl font-bold text-white">{data.missionTitle}</h2>
        <p className="mt-2 text-sm leading-relaxed text-slate-300">{data.objective}</p>

        {/* Controls Table */}
        <div className="mt-4 rounded-lg border border-slate-800 bg-slate-950/80 p-3.5">
          <p className="mb-2 font-mono text-[11px] font-bold uppercase tracking-wider text-sky-400">
            FLIGHT CONTROLS
          </p>
          <div className="space-y-2">
            {data.controls.map((ctrl, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between gap-3 font-mono text-xs"
              >
                <span className="shrink-0 rounded border border-slate-700 bg-slate-800 px-2 py-0.5 font-bold text-amber-300">
                  {ctrl.key}
                </span>
                <span className="text-right text-slate-300">{ctrl.action}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Mission Tips */}
        <div className="mt-4 space-y-1.5">
          <p className="font-mono text-[11px] font-bold uppercase tracking-wider text-emerald-400">
            TELEMETRY NOTES
          </p>
          <ul className="list-inside list-disc space-y-1 text-xs text-slate-400">
            {data.tips.map((tip, idx) => (
              <li key={idx}>{tip}</li>
            ))}
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex flex-wrap items-center justify-end gap-3 border-t border-slate-800 pt-4">
          {!isInitialStart && onRestart && (
            <button
              onClick={onRestart}
              className="rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 font-mono text-xs font-bold text-slate-200 transition hover:border-amber-400 hover:text-white"
            >
              RESTART MISSION
            </button>
          )}
          <button
            onClick={onResumeOrStart}
            className="rounded-lg bg-amber-500 px-5 py-2 font-mono text-xs font-bold text-slate-950 transition hover:bg-amber-400"
          >
            {isInitialStart ? 'LAUNCH MISSION [ENTER]' : 'RESUME MISSION [P / ESC]'}
          </button>
        </div>
      </div>
    </div>
  );
}
