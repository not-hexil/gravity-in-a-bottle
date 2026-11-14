'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  playRotorPulse,
  playWaypointScanChime,
  playRockBump,
  playMissionCompleteFanfare,
} from '@/utils/soundEffects';

interface IngenuityGameProps {
  isPaused: boolean;
  onComplete: () => void;
}

interface Waypoint {
  id: number;
  x: number;
  y: number;
  scanned: boolean;
}

interface RockSpire {
  x: number;
  width: number;
  height: number;
}

const CANVAS_W = 640;
const CANVAS_H = 480;
const GROUND_Y = 415;

const SPIRES: RockSpire[] = [
  { x: 185, width: 34, height: 115 },
  { x: 325, width: 42, height: 155 },
  { x: 455, width: 34, height: 105 },
];

function createInitialSimState() {
  return {
    x: 75,
    y: GROUND_Y - 14,
    vx: 0,
    vy: 0,
    rotorAngle: 0,
    waypoints: [
      { id: 1, x: 185, y: 210, scanned: false },
      { id: 2, x: 325, y: 155, scanned: false },
      { id: 3, x: 455, y: 225, scanned: false },
    ] as Waypoint[],
    keys: { up: false, left: false, right: false },
    pointerThrust: false,
    tick: 0,
    lastBumpTick: -20,
  };
}

export default function IngenuityGame({ isPaused, onComplete }: IngenuityGameProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const completedRef = useRef(false);

  const [scannedCount, setScannedCount] = useState(0);
  const [statusText, setStatusText] = useState('SCAN 3 WAYPOINTS THEN LAND');
  const [completed, setCompleted] = useState(false);

  const simRef = useRef(createInitialSimState());

  const resetGame = useCallback(() => {
    completedRef.current = false;
    simRef.current = createInitialSimState();
    setScannedCount(0);
    setStatusText('SCAN 3 WAYPOINTS THEN LAND');
    setCompleted(false);
  }, []);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (isPaused) return;
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
        e.preventDefault();
      }
      if (e.key === ' ' || e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
        simRef.current.keys.up = true;
      }
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        simRef.current.keys.left = true;
      }
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        simRef.current.keys.right = true;
      }
    };

    const onKeyUp = (e: KeyboardEvent) => {
      if (e.key === ' ' || e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
        simRef.current.keys.up = false;
      }
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        simRef.current.keys.left = false;
      }
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        simRef.current.keys.right = false;
      }
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
      const thrusting = !isPaused && (s.keys.up || s.pointerThrust);

      if (!isPaused && !completedRef.current) {
        s.tick++;

        if (thrusting && s.tick % 5 === 0) {
          playRotorPulse();
        }

        const marsGravity = 0.14;
        const rotorLift = thrusting ? -0.31 : 0;
        s.vy += marsGravity + rotorLift;
        s.vy *= 0.94;

        if (s.keys.left) s.vx -= 0.22;
        if (s.keys.right) s.vx += 0.22;
        s.vx *= 0.91;

        s.x += s.vx;
        s.y += s.vy;

        const airborne = s.y < GROUND_Y - 15;
        s.rotorAngle += thrusting || airborne ? 0.65 : 0.08;

        s.x = Math.max(30, Math.min(CANVAS_W - 30, s.x));
        if (s.y < 32) {
          s.y = 32;
          s.vy = 0;
        }

        for (const spire of SPIRES) {
          const halfW = spire.width / 2 + 12;
          const topY = GROUND_Y - spire.height - 12;
          if (Math.abs(s.x - spire.x) < halfW && s.y > topY) {
            if (s.tick - s.lastBumpTick > 14) {
              playRockBump();
              s.lastBumpTick = s.tick;
            }
            if (s.y - s.vy <= topY) {
              s.y = topY;
              s.vy = -1.5;
            } else {
              s.vx = s.x < spire.x ? -2.6 : 2.6;
            }
          }
        }

        if (s.y >= GROUND_Y - 14) {
          s.y = GROUND_Y - 14;
          s.vy = 0;
          s.vx *= 0.75;

          const allScanned = s.waypoints.every((w) => w.scanned);
          const onTargetPad = Math.abs(s.x - 565) < 42;

          if (onTargetPad && allScanned && !completedRef.current) {
            completedRef.current = true;
            playMissionCompleteFanfare();
            setCompleted(true);
            setStatusText('TOUCHDOWN CONFIRMED!');
            setTimeout(() => onComplete(), 900);
          } else if (onTargetPad && !allScanned) {
            setStatusText('SCAN ALL 3 WAYPOINTS BEFORE LANDING!');
          }
        }

        let updated = false;
        for (const wp of s.waypoints) {
          if (!wp.scanned && Math.hypot(s.x - wp.x, s.y - wp.y) < 32) {
            wp.scanned = true;
            updated = true;
          }
        }

        if (updated) {
          const count = s.waypoints.filter((w) => w.scanned).length;
          playWaypointScanChime(count);
          setScannedCount(count);
          if (count === 3) {
            setStatusText('ALL SCANS COMPLETE — LAND ON TARGET PAD!');
          }
        }
      }

      // Draw
      const skyGrad = ctx.createLinearGradient(0, 0, 0, GROUND_Y);
      skyGrad.addColorStop(0, '#451A03');
      skyGrad.addColorStop(0.55, '#9A3412');
      skyGrad.addColorStop(1, '#EA580C');
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

      ctx.fillStyle = 'rgba(186, 230, 253, 0.25)';
      ctx.beginPath();
      ctx.arc(510, 85, 34, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#E0F2FE';
      ctx.beginPath();
      ctx.arc(510, 85, 14, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#7C2D12';
      ctx.beginPath();
      ctx.moveTo(0, GROUND_Y);
      ctx.lineTo(0, 315);
      ctx.lineTo(95, 290);
      ctx.lineTo(160, 290);
      ctx.lineTo(210, 325);
      ctx.lineTo(360, 325);
      ctx.lineTo(420, 280);
      ctx.lineTo(520, 280);
      ctx.lineTo(570, 320);
      ctx.lineTo(CANVAS_W, 310);
      ctx.lineTo(CANVAS_W, GROUND_Y);
      ctx.closePath();
      ctx.fill();

      for (const spire of SPIRES) {
        ctx.fillStyle = '#57200B';
        ctx.beginPath();
        ctx.moveTo(spire.x - spire.width / 2, GROUND_Y);
        ctx.lineTo(spire.x - spire.width / 4, GROUND_Y - spire.height);
        ctx.lineTo(spire.x + spire.width / 4, GROUND_Y - spire.height);
        ctx.lineTo(spire.x + spire.width / 2, GROUND_Y);
        ctx.closePath();
        ctx.fill();

        ctx.strokeStyle = '#C2410C';
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }

      ctx.fillStyle = '#B45309';
      ctx.fillRect(0, GROUND_Y, CANVAS_W, CANVAS_H - GROUND_Y);
      ctx.fillStyle = '#78350F';
      ctx.fillRect(0, GROUND_Y, CANVAS_W, 5);

      ctx.fillStyle = '#475569';
      ctx.fillRect(42, GROUND_Y - 2, 66, 6);
      ctx.fillStyle = '#CBD5E1';
      ctx.font = 'bold 9px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('START', 75, GROUND_Y + 18);

      const allScanned = s.waypoints.every((w) => w.scanned);
      ctx.fillStyle = allScanned ? '#10B981' : '#FACC15';
      ctx.fillRect(525, GROUND_Y - 3, 80, 7);
      ctx.fillStyle = allScanned ? '#6EE7B7' : '#FDE047';
      ctx.fillText('LANDING ZONE', 565, GROUND_Y + 18);

      for (const wp of s.waypoints) {
        if (wp.scanned) {
          ctx.strokeStyle = 'rgba(52, 211, 153, 0.45)';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(wp.x, wp.y, 14, 0, Math.PI * 2);
          ctx.stroke();
          continue;
        }

        const pulse = Math.sin(s.tick * 0.1 + wp.id) * 4;
        ctx.strokeStyle = '#38BDF8';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(wp.x, wp.y, 18 + pulse, 0, Math.PI * 2);
        ctx.stroke();

        ctx.fillStyle = 'rgba(56, 189, 248, 0.25)';
        ctx.beginPath();
        ctx.arc(wp.x, wp.y, 12, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#F8FAFC';
        ctx.font = 'bold 10px monospace';
        ctx.fillText(`SCAN ${wp.id}`, wp.x, wp.y + 3);
      }

      ctx.save();
      ctx.translate(s.x, s.y);
      ctx.rotate(s.vx * 0.06);

      ctx.strokeStyle = '#E2E8F0';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(-6, 4);
      ctx.lineTo(-14, 14);
      ctx.moveTo(6, 4);
      ctx.lineTo(14, 14);
      ctx.stroke();

      ctx.fillStyle = '#F59E0B';
      ctx.fillRect(-9, -4, 18, 10);
      ctx.strokeStyle = '#FEF08A';
      ctx.lineWidth = 1;
      ctx.strokeRect(-9, -4, 18, 10);

      ctx.fillStyle = '#CBD5E1';
      ctx.fillRect(-2, -16, 4, 12);

      ctx.fillStyle = '#1D4ED8';
      ctx.fillRect(-11, -18, 22, 3);

      const bladeSpan1 = Math.cos(s.rotorAngle) * 32;
      const bladeSpan2 = Math.sin(s.rotorAngle * 1.1) * 32;
      ctx.strokeStyle = '#F8FAFC';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(-bladeSpan1, -13);
      ctx.lineTo(bladeSpan1, -13);
      ctx.moveTo(-bladeSpan2, -9);
      ctx.lineTo(bladeSpan2, -9);
      ctx.stroke();

      if (thrusting && s.y > GROUND_Y - 70) {
        ctx.fillStyle = 'rgba(254, 215, 170, 0.35)';
        ctx.beginPath();
        ctx.ellipse(0, GROUND_Y - s.y, 26, 5, 0, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [isPaused, onComplete]);

  return (
    <div className="flex flex-col items-center">
      <div className="mb-3 flex w-full max-w-[640px] items-center justify-between rounded-lg border border-slate-800 bg-slate-900 px-4 py-2.5 font-mono text-xs">
        <span className="font-bold text-amber-400">SCANS: {scannedCount} / 3</span>
        <span className="text-slate-200">{statusText}</span>
        <button
          onClick={resetGame}
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
          onPointerDown={() => {
            if (!isPaused) simRef.current.pointerThrust = true;
          }}
          onPointerUp={() => (simRef.current.pointerThrust = false)}
          onPointerLeave={() => (simRef.current.pointerThrust = false)}
          className="block max-w-full cursor-pointer touch-none"
        />

        {completed && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-emerald-950/80 p-6 text-center backdrop-blur-xs">
            <p className="animate-pulse font-mono text-lg font-bold tracking-wider text-emerald-300">
              JEZERO CRATER FLIGHT COMPLETE!
            </p>
            <p className="mt-1 font-mono text-xs text-emerald-100">
              Loading Ingenuity mission dossier...
            </p>
          </div>
        )}
      </div>

      {/* Desktop-only button bar */}
      <div className="mt-3 hidden w-full max-w-[640px] items-center justify-between gap-2 md:flex">
        <div className="flex gap-2">
          <button
            onMouseDown={() => (simRef.current.keys.left = true)}
            onMouseUp={() => (simRef.current.keys.left = false)}
            onMouseLeave={() => (simRef.current.keys.left = false)}
            className="rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 font-mono text-xs font-bold text-white active:bg-slate-700"
          >
            ◀ LEFT
          </button>
          <button
            onMouseDown={() => (simRef.current.keys.right = true)}
            onMouseUp={() => (simRef.current.keys.right = false)}
            onMouseLeave={() => (simRef.current.keys.right = false)}
            className="rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 font-mono text-xs font-bold text-white active:bg-slate-700"
          >
            RIGHT ▶
          </button>
        </div>

        <button
          onMouseDown={() => (simRef.current.pointerThrust = true)}
          onMouseUp={() => (simRef.current.pointerThrust = false)}
          onMouseLeave={() => (simRef.current.pointerThrust = false)}
          className="rounded-lg bg-amber-500 px-5 py-2 font-mono text-xs font-bold text-slate-950 active:bg-amber-400"
        >
          HOLD ROTOR LIFT [SPACE / ↑]
        </button>
      </div>
    </div>
  );
}
