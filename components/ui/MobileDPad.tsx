'use client';

import React, { useRef } from 'react';
import { playMechKeyPress, playMechKeyRelease } from '@/lib/soundEffects';

interface MobileDPadProps {
  actionLabel: string;
  disabled?: boolean;
}

export default function MobileDPad({ actionLabel, disabled = false }: MobileDPadProps) {
  const activeKeysRef = useRef<Set<string>>(new Set());

  const pressKey = (key: string) => {
    if (disabled || activeKeysRef.current.has(key)) return;
    activeKeysRef.current.add(key);
    playMechKeyPress(key === ' ');
    window.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true }));
  };

  const releaseKey = (key: string) => {
    if (!activeKeysRef.current.has(key)) return;
    activeKeysRef.current.delete(key);
    playMechKeyRelease();
    window.dispatchEvent(new KeyboardEvent('keyup', { key, bubbles: true }));
  };

  const releaseAll = () => {
    if (activeKeysRef.current.size > 0) {
      playMechKeyRelease();
    }
    activeKeysRef.current.forEach((key) => {
      window.dispatchEvent(new KeyboardEvent('keyup', { key, bubbles: true }));
    });
    activeKeysRef.current.clear();
  };

  const dpadBtnClass =
    'flex h-12 w-12 select-none items-center justify-center rounded-lg border-2 border-slate-600 bg-slate-800 font-mono text-base font-bold text-slate-100 shadow-md active:scale-95 active:border-amber-400 active:bg-slate-700 touch-none';

  return (
    <div
      onTouchCancel={releaseAll}
      className="mt-4 flex w-full max-w-[640px] select-none items-center justify-between rounded-xl border-2 border-slate-800 bg-slate-900/95 px-6 py-4 shadow-xl md:hidden"
    >
      {/* Cross D-Pad */}
      <div className="grid grid-cols-3 grid-rows-3 gap-1">
        <div />
        <button
          type="button"
          aria-label="Up"
          onPointerDown={() => pressKey('ArrowUp')}
          onPointerUp={() => releaseKey('ArrowUp')}
          onPointerLeave={() => releaseKey('ArrowUp')}
          onPointerCancel={() => releaseKey('ArrowUp')}
          className={dpadBtnClass}
        >
          ▲
        </button>
        <div />

        <button
          type="button"
          aria-label="Left"
          onPointerDown={() => pressKey('ArrowLeft')}
          onPointerUp={() => releaseKey('ArrowLeft')}
          onPointerLeave={() => releaseKey('ArrowLeft')}
          onPointerCancel={() => releaseKey('ArrowLeft')}
          className={dpadBtnClass}
        >
          ◀
        </button>
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-slate-950/60">
          <div className="h-3 w-3 rounded-full bg-slate-700" />
        </div>
        <button
          type="button"
          aria-label="Right"
          onPointerDown={() => pressKey('ArrowRight')}
          onPointerUp={() => releaseKey('ArrowRight')}
          onPointerLeave={() => releaseKey('ArrowRight')}
          onPointerCancel={() => releaseKey('ArrowRight')}
          className={dpadBtnClass}
        >
          ▶
        </button>

        <div />
        <button
          type="button"
          aria-label="Down"
          onPointerDown={() => pressKey('ArrowDown')}
          onPointerUp={() => releaseKey('ArrowDown')}
          onPointerLeave={() => releaseKey('ArrowDown')}
          onPointerCancel={() => releaseKey('ArrowDown')}
          className={dpadBtnClass}
        >
          ▼
        </button>
        <div />
      </div>

      {/* Context-Aware Action Button (Spacebar) */}
      <div className="flex flex-col items-center gap-1.5">
        <button
          type="button"
          aria-label="Action"
          onPointerDown={() => pressKey(' ')}
          onPointerUp={() => releaseKey(' ')}
          onPointerLeave={() => releaseKey(' ')}
          onPointerCancel={() => releaseKey(' ')}
          className="flex h-16 w-16 touch-none select-none items-center justify-center rounded-full border-4 border-amber-300 bg-amber-500 px-1 text-center font-mono text-[11px] font-extrabold leading-tight tracking-wider text-slate-950 shadow-lg active:scale-95 active:bg-amber-400"
        >
          {actionLabel}
        </button>
        <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-slate-400">
          ACTION [A]
        </span>
      </div>
    </div>
  );
}
