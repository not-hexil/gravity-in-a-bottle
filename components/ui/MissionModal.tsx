'use client';

import React from 'react';
import { MissionModalData } from '@/types/game';

interface MissionModalProps {
  isOpen: boolean;
  data: MissionModalData;
  onClose: () => void;
  onReturnToTown: () => void;
}

export default function MissionModal({
  isOpen,
  data,
  onClose,
  onReturnToTown,
}: MissionModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm">
      <div className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl border-4 border-slate-700 bg-slate-900 p-6 text-slate-100 shadow-2xl">
        {/* Header */}
        <div className="mb-4 border-b border-slate-800 pb-3">
          <span className="inline-block rounded bg-emerald-500/20 px-2.5 py-0.5 font-mono text-xs font-bold uppercase tracking-wider text-emerald-400">
            Mission Accomplished
          </span>
          <h2 className="mt-2 font-mono text-2xl font-bold text-white">{data.title}</h2>
          <p className="font-mono text-xs text-slate-400">{data.subtitle}</p>
        </div>

        {/* Single Feature Image Slot */}
        <div className="mb-5 overflow-hidden rounded-lg border border-slate-700 bg-slate-950">
          {/* Replace src in src/data/missions.ts with your real image path in /public/images/ */}
          <div className="flex aspect-video w-full flex-col items-center justify-center bg-gradient-to-br from-slate-800 via-slate-900 to-slate-950 p-6 text-center">
            <img
              src={data.imageUrl}
              alt={data.imageAlt}
              onError={(e) => {
                // Graceful visual fallback while stub image path is used
                (e.currentTarget as HTMLImageElement).style.display = 'none';
              }}
              className="max-h-64 w-full rounded object-cover"
            />
            <span className="mt-2 font-mono text-xs text-slate-400">
              [Image Placeholder: {data.imageUrl}]
            </span>
          </div>
        </div>

        {/* Three Paragraphs of Mission Lore / Data */}
        <div className="space-y-4 text-sm leading-relaxed text-slate-300">
          <p>{data.paragraphs[0]}</p>
          <p>{data.paragraphs[1]}</p>
          <p>{data.paragraphs[2]}</p>
        </div>

        {/* Footer Actions */}
        <div className="mt-6 flex flex-wrap justify-end gap-3 border-t border-slate-800 pt-4">
          <button
            onClick={onClose}
            className="rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 font-mono text-xs font-bold text-slate-200 hover:bg-slate-700"
          >
            REPLAY MINIGAME
          </button>
          <button
            onClick={onReturnToTown}
            className="rounded-lg bg-amber-500 px-5 py-2 font-mono text-xs font-bold text-slate-950 hover:bg-amber-400"
          >
            RETURN TO SPACE TOWN →
          </button>
        </div>
      </div>
    </div>
  );
}
