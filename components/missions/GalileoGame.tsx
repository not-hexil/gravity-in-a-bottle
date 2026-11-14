'use client';

import React, { useEffect, useRef, useState } from 'react';
import {
  playTelemetryDataTick,
  playLightningZap,
  playMissionCompleteFanfare,
  playThrusterBurst,
} from '@/utils/soundEffects';

interface GalileoGameProps {
  isPaused: boolean;
  onComplete: () => void;
}

interface StormCell {
  x: number;
  y: number;
  vx: number;
  radius: number;
}

const CANVAS_W = 640;
const CANVAS_H = 480;

function createInitialSimState() {
  const storms: StormCell[] = Array.from({ length: 6 }, (_, i) => ({
    x: 80 + ((i * 97) % (CANVAS_W - 160)),
    y: 280 + i * 75,
    vx: (i % 2 === 0 ? 1 : -1) * (1.3 + (i % 3) * 0.35),
    radius: 22,
  }));

  return {
    probeX: CANVAS_W / 2,
    probeY: 210,
    vx: 0,
    beamX: CANVAS_W / 2,
    beamTargetX: CANVAS_W / 2 + 120,
    beamWidth: 110,
    telemetry: 0,
    stunTimer: 0,
    storms,
    keys: { left: false, right: false },
    pointerX: null as number | null,
    tick: 0,
  };
}

export default function GalileoGame({ isPaused, onComplete }: GalileoGameProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const completedRef = useRef(false);

  const [telemetry, setTelemetry] = useState(0);
  const [inBeam, setInBeam] = useState(true);
  const [completed, setCompleted] = useState(false);

  const simRef = useRef(createInitialSimState());

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (isPaused) return;
      if (['ArrowLeft', 'ArrowRight', ' '].includes(e.key)) e.preventDefault();
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') simRef.current.keys.left = true;
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D')
        simRef.current.keys.right = true;
    };

    const onKeyUp = (e: KeyboardEvent) => {
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

        if (Math.abs(s.beamX - s.beamTargetX) < 6) {
          s.beamTargetX = 95 + Math.random() * (CANVAS_W - 190);
        }
        s.beamX += Math.sign(s.beamTargetX - s.beamX) * 1.15;

        if (s.stunTimer > 0) {
          s.stunTimer--;
        } else {
          if (s.keys.left) s.vx -= 0.55;
          if (s.keys.right) s.vx += 0.55;
          if ((s.keys.left || s.keys.right) && s.tick % 7 === 0) {
            playThrusterBurst();
          }

          if (s.pointerX !== null) {
            const diff = s.pointerX - s.probeX;
            s.vx += Math.max(-0.7, Math.min(0.7, diff * 0.08));
          }
        }

        s.vx *= 0.88;
        s.probeX += s.vx;
        s.probeX = Math.max(32, Math.min(CANVAS_W - 32, s.probeX));

        for (const st of s.storms) {
          st.x += st.vx;
          if (st.x < 36 || st.x > CANVAS_W - 36) st.vx *= -1;
          st.y -= 2.2;
          if (st.y < -30) {
            st.y = CANVAS_H + 30;
            st.x = 60 + Math.random() * (CANVAS_W - 120);
          }

          if (s.stunTimer === 0 && Math.hypot(s.probeX - st.x, s.probeY - st.y) < st.radius + 16) {
            playLightningZap();
            s.vx = s.probeX < st.x ? -6.5 : 6.5;
            s.stunTimer = 25;
          }
        }

        const lockedOn =
          s.stunTimer === 0 && Math.abs(s.probeX - s.beamX) <= s.beamWidth / 2;

        if (lockedOn) {
          s.telemetry = Math.min(100, s.telemetry + 0.16);
          if (s.tick % 12 === 0) {
            playTelemetryDataTick(s.telemetry);
          }
        }

        if (s.tick % 4 === 0) {
          setTelemetry(Math.floor(s.telemetry));
          setInBeam(lockedOn);
        }

        if (s.telemetry >= 100 && !completedRef.current) {
          completedRef.current = true;
          playMissionCompleteFanfare();
          setTelemetry(100);
          setCompleted(true);
          setTimeout(() => onComplete(), 900);
        }
      }

      // Draw
      const bandColors = ['#7C2D12', '#C2410C', '#FDBA74', '#9A3412', '#FDE68A', '#B45309'];
      const bandHeight = 80;
      const scrollOffset = (s.tick * 2.2) % (bandColors.length * bandHeight);

      for (let i = -1; i <= Math.ceil(CANVAS_H / bandHeight) + 1; i++) {
        const y = i * bandHeight - (scrollOffset % bandHeight);
        const colorIdx =
          (Math.floor(scrollOffset / bandHeight) + i + bandColors.length) % bandColors.length;
        ctx.fillStyle = bandColors[colorIdx];
        ctx.fillRect(0, y, CANVAS_W, bandHeight + 1);
      }

      const depthGrad = ctx.createLinearGradient(0, 0, 0, CANVAS_H);
      depthGrad.addColorStop(0, 'rgba(15, 23, 42, 0.55)');
      depthGrad.addColorStop(0.5, 'rgba(15, 23, 42, 0.15)');
      depthGrad.addColorStop(1, 'rgba(15, 23, 42, 0.65)');
      ctx.fillStyle = depthGrad;
      ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

      const locked = s.stunTimer === 0 && Math.abs(s.probeX - s.beamX) <= s.beamWidth / 2;
      const beamGrad = ctx.createLinearGradient(0, 0, 0, CANVAS_H);
      beamGrad.addColorStop(
        0,
        locked ? 'rgba(56, 189, 248, 0.42)' : 'rgba(250, 204, 21, 0.25)'
      );
      beamGrad.addColorStop(
        1,
        locked ? 'rgba(56, 189, 248, 0.08)' : 'rgba(250, 204, 21, 0.04)'
      );
      ctx.fillStyle = beamGrad;
      ctx.fillRect(s.beamX - s.beamWidth / 2, 0, s.beamWidth, CANVAS_H);

      ctx.strokeStyle = locked ? '#38BDF8' : '#FACC15';
      ctx.lineWidth = 2;
      ctx.setLineDash([8, 6]);
      ctx.beginPath();
      ctx.moveTo(s.beamX - s.beamWidth / 2, 0);
      ctx.lineTo(s.beamX - s.beamWidth / 2, CANVAS_H);
      ctx.moveTo(s.beamX + s.beamWidth / 2, 0);
      ctx.lineTo(s.beamX + s.beamWidth / 2, CANVAS_H);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = '#0F172A';
      ctx.fillRect(s.beamX - 24, 4, 48, 14);
      ctx.fillStyle = locked ? '#38BDF8' : '#FACC15';
      ctx.font = 'bold 9px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('ORBITER LINK', s.beamX, 14);

      for (const st of s.storms) {
        ctx.fillStyle = 'rgba(30, 27, 75, 0.78)';
        ctx.beginPath();
        ctx.arc(st.x, st.y, st.radius, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = '#A855F7';
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.fillStyle = '#FACC15';
        ctx.beginPath();
        ctx.moveTo(st.x + 2, st.y - 10);
        ctx.lineTo(st.x - 6, st.y + 1);
        ctx.lineTo(st.x, st.y + 1);
        ctx.lineTo(st.x - 3, st.y + 11);
        ctx.lineTo(st.x + 7, st.y - 1);
        ctx.lineTo(st.x + 1, st.y - 1);
        ctx.closePath();
        ctx.fill();
      }

      const wobble = Math.sin(s.tick * 0.15) * 3;
      const px = s.probeX + wobble;
      const py = s.probeY;

      if (locked && !completedRef.current) {
        const wave = (s.tick % 30) / 30;
        ctx.strokeStyle = `rgba(56, 189, 248, ${1 - wave})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(px, py - 24, 10 + wave * 28, Math.PI * 1.15, Math.PI * 1.85);
        ctx.stroke();
      }

      ctx.strokeStyle = '#E2E8F0';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(px - 10, py - 8);
      ctx.lineTo(px - 22, py - 42);
      ctx.moveTo(px + 10, py - 8);
      ctx.lineTo(px + 22, py - 42);
      ctx.stroke();

      ctx.fillStyle = '#F8FAFC';
      ctx.beginPath();
      ctx.arc(px, py - 42, 23, Math.PI, 0);
      ctx.fill();

      ctx.fillStyle = s.stunTimer > 0 && s.tick % 4 < 2 ? '#EF4444' : '#CBD5E1';
      ctx.beginPath();
      ctx.moveTo(px - 18, py - 6);
      ctx.lineTo(px + 18, py - 6);
      ctx.lineTo(px + 11, py + 10);
      ctx.lineTo(px - 11, py + 10);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = '#F59E0B';
      ctx.fillRect(px - 12, py - 10, 24, 5);

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [isPaused, onComplete]);

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (isPaused) return;
    if (e.buttons === 0 && e.pointerType === 'mouse') return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    simRef.current.pointerX = (e.clientX - rect.left) * scaleX;
  };

  return (
    <div className="flex flex-col items-center">
      <div className="mb-3 flex w-full max-w-[640px] items-center justify-between gap-4 rounded-lg border border-slate-800 bg-slate-900 px-4 py-2.5 font-mono text-xs">
        <div className="flex items-center gap-2">
          <span className="text-slate-400">SIGNAL:</span>
          <span
            className={`font-bold ${
              inBeam ? 'text-sky-400' : 'animate-pulse text-amber-400'
            }`}
          >
            {inBeam ? 'LOCKED ON' : 'DRIFTED — RETURN TO BEAM'}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div className="h-3 w-36 overflow-hidden rounded-full bg-slate-800">
            <div
              className="h-full bg-sky-400 transition-all duration-100"
              style={{ width: `${telemetry}%` }}
            />
          </div>
          <span className="font-bold text-white">{telemetry}%</span>
        </div>
      </div>

      <div className="relative overflow-hidden rounded-xl border-4 border-slate-700 bg-slate-950 shadow-2xl">
        <canvas
          ref={canvasRef}
          width={CANVAS_W}
          height={CANVAS_H}
          onPointerDown={handlePointerMove}
          onPointerMove={handlePointerMove}
          onPointerUp={() => (simRef.current.pointerX = null)}
          className="block max-w-full touch-none"
        />

        {completed && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-emerald-950/80 p-6 text-center backdrop-blur-xs">
            <p className="animate-pulse font-mono text-lg font-bold tracking-wider text-emerald-300">
              100% JUPITER ATMOSPHERIC DATA UPLOADED!
            </p>
            <p className="mt-1 font-mono text-xs text-emerald-100">
              Opening Galileo mission dossier...
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
