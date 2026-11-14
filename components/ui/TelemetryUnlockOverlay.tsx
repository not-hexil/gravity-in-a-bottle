'use client';

import React, { useEffect } from 'react';

interface TelemetryUnlockOverlayProps {
  isOpen: boolean;
  stageCompleted: number;
  totalStages: number;
  unlockedParagraphs: string[];
  imageUrl?: string;
  imageCaption?: string;
  unlockedCapabilityName: string;
  unlockedCapabilityDesc: string;
  onContinue: () => void;
}

export default function TelemetryUnlockOverlay({
  isOpen,
  stageCompleted,
  totalStages,
  unlockedParagraphs,
  imageUrl,
  imageCaption,
  unlockedCapabilityName,
  unlockedCapabilityDesc,
  onContinue,
}: TelemetryUnlockOverlayProps) {
  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        e.stopPropagation();
        onContinue();
      }
    };
    window.addEventListener('keydown', onKeyDown, true);
    return () => window.removeEventListener('keydown', onKeyDown, true);
  }, [isOpen, onContinue]);

  if (!isOpen) return null;

  return (
    <div className="absolute inset-0 z-20 flex items-center justify-center bg-slate-950/92 p-4 backdrop-blur-xs">
      <div className="max-h-[92%] w-full max-w-lg overflow-y-auto rounded-xl border-2 border-amber-500/70 bg-slate-900 p-5 text-left shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2.5 font-mono text-xs">
          <span className="font-bold text-emerald-400">
            ✓ STAGE {stageCompleted} / {totalStages} TELEMETRY DECODED
          </span>
          <span className="rounded bg-amber-500/20 px-2 py-0.5 text-[10px] font-bold text-amber-300">
            HARDWARE UPGRADE
          </span>
        </div>

        {imageUrl && (
          <figure className="mt-3 overflow-hidden rounded-lg border border-slate-700 bg-slate-950">
            <img
              src={imageUrl}
              alt={imageCaption || 'Mission telemetry archive'}
              className="h-32 w-full object-cover"
            />
            {imageCaption && (
              <figcaption className="px-3 py-1 font-mono text-[10px] text-slate-400">
                {imageCaption}
              </figcaption>
            )}
          </figure>
        )}

        <div className="mt-3 space-y-2.5">
          {unlockedParagraphs.map((text, idx) => {
            const isNewest = idx === unlockedParagraphs.length - 1;
            return (
              <div
                key={idx}
                className={`rounded-lg border p-2.5 text-xs leading-relaxed ${
                  isNewest
                    ? 'border-amber-400/50 bg-slate-800/90 text-slate-100'
                    : 'border-slate-800 bg-slate-950/60 text-slate-400'
                }`}
              >
                <span className="mb-1 block font-mono text-[10px] font-bold uppercase text-amber-400">
                  {isNewest
                    ? `▶ NEW DATA PACKET [STAGE ${idx + 1}]`
                    : `✓ ARCHIVED PACKET [STAGE ${idx + 1}]`}
                </span>
                {text}
              </div>
            );
          })}
        </div>

        <div className="mt-4 rounded-lg border border-sky-500/40 bg-sky-950/40 p-3">
          <p className="font-mono text-[11px] font-bold uppercase tracking-wider text-sky-300">
            ⚡ BOOST UNLOCKED: {unlockedCapabilityName}
          </p>
          <p className="mt-1 text-xs text-slate-300">{unlockedCapabilityDesc}</p>
        </div>

        <button
          onClick={onContinue}
          className="mt-5 w-full rounded-lg bg-amber-500 py-2.5 font-mono text-xs font-extrabold tracking-wider text-slate-950 transition hover:bg-amber-400"
        >
          ENGAGE STAGE {stageCompleted + 1} [SPACE / ENTER] →
        </button>
      </div>
    </div>
  );
}
