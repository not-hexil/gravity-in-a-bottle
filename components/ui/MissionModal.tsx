'use client';

import React, { useEffect } from 'react';
import { MissionModalData } from '@/lib/game';

interface MissionModalProps {
  isOpen: boolean;
  data: MissionModalData | null;
  onClose: () => void;
  onReturnToTown?: () => void;
}

export default function MissionModal({
  isOpen,
  data,
  onClose,
  onReturnToTown,
}: MissionModalProps) {
  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !data) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="mission-modal-title"
    >
      <div className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl border-2 border-amber-500/70 bg-slate-900 p-6 text-slate-100 shadow-2xl">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-700 pb-4">
          <div>
            <span className="inline-block rounded bg-emerald-500/20 px-2 py-0.5 font-mono text-xs font-semibold tracking-wider text-emerald-300">
              ★ FULL MISSION ARCHIVE UNLOCKED (3 / 3 STAGES)
            </span>
            <h2
              id="mission-modal-title"
              className="mt-1 font-mono text-2xl font-bold tracking-tight text-white"
            >
              {data.title}
            </h2>
            <p className="text-sm text-slate-400">{data.subtitle}</p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-1 font-mono text-sm text-slate-300 transition hover:border-amber-400 hover:text-white"
          >
            ESC
          </button>
        </div>

        {data.imageUrl && (
          <figure className="mt-4 overflow-hidden rounded-lg border border-slate-700 bg-slate-950">
            <img
              src={data.imageUrl}
              alt={data.imageCaption || data.title}
              className="h-48 w-full object-cover"
            />
            {data.imageCaption && (
              <figcaption className="px-3 py-1.5 font-mono text-[11px] text-slate-400">
                {data.imageCaption}
              </figcaption>
            )}
          </figure>
        )}

        {/* Key Stats Bar */}
        <div className="my-4 grid grid-cols-3 gap-3 rounded-lg border border-slate-800 bg-slate-950/70 p-3">
          {data.stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="font-mono text-[11px] uppercase tracking-wider text-slate-400">
                {stat.label}
              </div>
              <div className="mt-0.5 font-mono text-sm font-bold text-amber-300">
                {stat.value}
              </div>
            </div>
          ))}
        </div>

        {/* All 3 Accumulated Historical Paragraphs */}
        <div className="space-y-3 text-sm leading-relaxed text-slate-200">
          {data.paragraphs.map((paragraph, idx) => (
            <div
              key={idx}
              className="rounded-lg border border-slate-800 bg-slate-950/50 p-3"
            >
              <span className="mb-1 block font-mono text-[10px] font-bold uppercase text-amber-400">
                TELEMETRY PACKET 0{idx + 1}
              </span>
              <p>{paragraph}</p>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="mt-6 flex flex-wrap items-center justify-end gap-3 border-t border-slate-800 pt-4">
          <button
            onClick={onClose}
            className="rounded-lg border border-slate-600 bg-slate-800 px-4 py-2 font-mono text-xs font-semibold text-slate-200 transition hover:bg-slate-700"
          >
            REPLAY MISSION
          </button>
          {onReturnToTown && (
            <button
              onClick={onReturnToTown}
              className="rounded-lg bg-amber-500 px-5 py-2 font-mono text-xs font-bold text-slate-950 transition hover:bg-amber-400"
            >
              RETURN TO SOLAR SYSTEM
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
