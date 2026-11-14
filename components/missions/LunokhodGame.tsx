'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  playWaypointPing,
  playRoverDrivePulse,
  playProbeCollected,
  playMissionCompleteFanfare,
} from '@/utils/soundEffects';

interface LunokhodGameProps {
  isPaused: boolean;
  onComplete: () => void;
}

interface ProbeBeacon {
  id: number;
  x: number;
  y: number;
  collected: boolean;
}

interface Crater {
  x: number;
  y: number;
  r: number;
}

const CANVAS_W = 640;
const CANVAS_H = 480;
const TOTAL_PROBES = 5;

const CRATERS: Crater[] = [
  { x: 130, y: 110, r: 34 },
  { x: 480, y: 95, r: 28 },
  { x: 310, y: 230, r: 42 },
  { x: 150, y: 360, r: 30 },
  { x: 510, y: 350, r: 36 },
  { x: 380, y: 130, r: 20 },
  { x: 220, y: 290, r: 18 },
];

function createInitialSimState() {
  return {
    roverX: 90,
    roverY: 240,
    angle: 0,
    targetX: null as number | null,
    targetY: null as number | null,
    tracks: [] as { x: number; y: number; angle: number }[],
    probes: [
      { id: 1, x: 210, y: 95, collected: false },
      { id: 2, x: 540, y: 175, collected: false },
      { id: 3, x: 310, y: 375, collected: false },
      { id: 4, x: 535, y: 415, collected: false },
      { id: 5, x: 115, y: 415, collected: false },
    ] as ProbeBeacon[],
    keys: { up: false, down: false, left: false, right: false },
    tick: 0,
  };
}

export default function LunokhodGame({ isPaused, onComplete }: LunokhodGameProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const completedRef = useRef(false);

  const [collectedCount, setCollectedCount] = useState(0);
  const [completed, setCompleted] = useState(false);

  const simRef = useRef(createInitialSimState());

  const handleReset = useCallback(() => {
    completedRef.current = false;
    simRef.current = createInitialSimState();
    setCollectedCount(0);
    setCompleted(false);
  }, []);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (isPaused) return;
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
        e.preventDefault();
      }
      if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') simRef.current.keys.up = true;
      if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') simRef.current.keys.down = true;
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') simRef.current.keys.left = true;
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D')
        simRef.current.keys.right = true;
      if (e.key === ' ') {
        playWaypointPing();
      }
    };

    const onKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') simRef.current.keys.up = false;
      if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') simRef.current.keys.down = false;
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') simRef.current.keys.left = false;
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D')
        simRef.current.keys.right = false;
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, [isPaused]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;

    const loop = () => {
      const s = simRef.current;

      if (!isPaused && !completedRef.current) {
        s.tick++;

        let dx = 0;
        let dy = 0;
        if (s.keys.up) dy -= 1;
        if (s.keys.down) dy += 1;
        if (s.keys.left) dx -= 1;
        if (s.keys.right) dx += 1;

        let isMoving = false;

        if (dx !== 0 || dy !== 0) {
          isMoving = true;
          s.targetX = null;
          s.targetY = null;
          const len = Math.hypot(dx, dy);
          const speed = 3.2;
          s.roverX += (dx / len) * speed;
          s.roverY += (dy / len) * speed;
          s.angle = Math.atan2(dy, dx);

          if (s.tick % 4 === 0) {
            s.tracks.push({ x: s.roverX, y: s.roverY, angle: s.angle });
            if (s.tracks.length > 90) s.tracks.shift();
          }
        } else if (s.targetX !== null && s.targetY !== null) {
          const tdx = s.targetX - s.roverX;
          const tdy = s.targetY - s.roverY;
          const dist = Math.hypot(tdx, tdy);
          if (dist > 4) {
            isMoving = true;
            const speed = 3.2;
            s.roverX += (tdx / dist) * speed;
            s.roverY += (tdy / dist) * speed;
            s.angle = Math.atan2(tdy, tdx);

            if (s.tick % 4 === 0) {
              s.tracks.push({ x: s.roverX, y: s.roverY, angle: s.angle });
              if (s.tracks.length > 90) s.tracks.shift();
            }
          } else {
            s.targetX = null;
            s.targetY = null;
          }
        }

        if (isMoving && s.tick % 9 === 0) {
          playRoverDrivePulse();
        }

        s.roverX = Math.max(28, Math.min(CANVAS_W - 28, s.roverX));
        s.roverY = Math.max(28, Math.min(CANVAS_H - 28, s.roverY));

        let newlyCollected = false;
        for (const p of s.probes) {
          if (!p.collected && Math.hypot(s.roverX - p.x, s.roverY - p.y) < 30) {
            p.collected = true;
            newlyCollected = true;
          }
        }

        if (newlyCollected) {
          const count = s.probes.filter((p) => p.collected).length;
          setCollectedCount(count);
          if (count === TOTAL_PROBES && !completedRef.current) {
            completedRef.current = true;
            playMissionCompleteFanfare();
            setCompleted(true);
            setTimeout(() => onComplete(), 800);
          } else {
            playProbeCollected(count);
          }
        }
      }

      // Draw
      ctx.fillStyle = '#475569';
      ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

      ctx.fillStyle = '#334155';
      for (let gx = 16; gx < CANVAS_W; gx += 32) {
        for (let gy = 16; gy < CANVAS_H; gy += 32) {
          if ((gx + gy) % 64 === 0) ctx.fillRect(gx, gy, 3, 3);
        }
      }

      for (const c of CRATERS) {
        ctx.fillStyle = '#334155';
        ctx.beginPath();
        ctx.arc(c.x, c.y, c.r, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = '#64748B';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(c.x, c.y, c.r, Math.PI * 0.15, Math.PI * 1.15);
        ctx.stroke();
      }

      for (let i = 0; i < s.tracks.length; i++) {
        const t = s.tracks[i];
        ctx.save();
        ctx.translate(t.x, t.y);
        ctx.rotate(t.angle);
        ctx.fillStyle = `rgba(30, 41, 59, ${(i / s.tracks.length) * 0.5})`;
        ctx.fillRect(-4, -12, 4, 4);
        ctx.fillRect(-4, 8, 4, 4);
        ctx.restore();
      }

      if (s.targetX !== null && s.targetY !== null) {
        ctx.strokeStyle = '#38BDF8';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(s.targetX, s.targetY, 8 + Math.sin(s.tick * 0.15) * 3, 0, Math.PI * 2);
        ctx.stroke();
      }

      for (const p of s.probes) {
        if (p.collected) continue;
        const pulse = Math.sin(s.tick * 0.08 + p.id) * 4;

        ctx.strokeStyle = 'rgba(250, 204, 21, 0.45)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 16 + pulse, 0, Math.PI * 2);
        ctx.stroke();

        ctx.fillStyle = '#FACC15';
        ctx.beginPath();
        ctx.arc(p.x, p.y, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#0F172A';
        ctx.beginPath();
        ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.save();
      ctx.translate(s.roverX, s.roverY);
      ctx.rotate(s.angle);

      ctx.fillStyle = '#0F172A';
      for (const wx of [-14, -5, 5, 14]) {
        ctx.fillRect(wx - 3, -16, 6, 4);
        ctx.fillRect(wx - 3, 12, 6, 4);
      }

      ctx.fillStyle = '#E2E8F0';
      ctx.beginPath();
      ctx.ellipse(0, 0, 18, 13, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#1E293B';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.fillStyle = '#1D4ED8';
      ctx.fillRect(-14, -9, 14, 18);
      ctx.strokeStyle = '#93C5FD';
      ctx.lineWidth = 1;
      ctx.strokeRect(-14, -9, 14, 18);

      ctx.fillStyle = '#38BDF8';
      ctx.fillRect(12, -6, 4, 4);
      ctx.fillRect(12, 2, 4, 4);

      ctx.restore();

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [isPaused, onComplete]);

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isPaused) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    simRef.current.targetX = (e.clientX - rect.left) * scaleX;
    simRef.current.targetY = (e.clientY - rect.top) * scaleY;
    playWaypointPing();
  };

  return (
    <div className="flex flex-col items-center">
      <div className="mb-3 flex w-full max-w-[640px] items-center justify-between rounded-lg border border-slate-800 bg-slate-900 px-4 py-2.5 font-mono text-xs">
        <span className="text-slate-300">
          SECTOR: <strong className="text-white">MARE IMBRIUM</strong>
        </span>
        <span className="font-bold text-amber-400">
          PROBES RECOVERED: {collectedCount} / {TOTAL_PROBES}
        </span>
        <button
          onClick={handleReset}
          className="rounded border border-slate-700 bg-slate-800 px-2.5 py-1 text-[11px] text-slate-300 hover:border-amber-400 hover:text-white"
        >
          RESET
        </button>
      </div>

      <div className="relative overflow-hidden rounded-xl border-4 border-slate-700 bg-slate-950 shadow-2xl">
        <canvas
          ref={canvasRef}
          width={CANVAS_W}
          height={CANVAS_H}
          onClick={handleCanvasClick}
          className="block max-w-full cursor-crosshair"
        />

        {completed && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-emerald-950/80 p-6 text-center backdrop-blur-xs">
            <p className="animate-pulse font-mono text-lg font-bold tracking-wider text-emerald-300">
              ALL 5 LUNAR PROBES COLLECTED!
            </p>
            <p className="mt-1 font-mono text-xs text-emerald-100">
              Loading mission dossier...
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
