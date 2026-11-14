'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  playThrusterBurst,
  playParachuteDeploy,
  playAtmosphereBuffet,
  playCrashExplosion,
  playMissionCompleteFanfare,
} from '@/utils/soundEffects';

interface HuygensGameProps {
  isPaused: boolean;
  onComplete: () => void;
}

interface Hazard {
  x: number;
  y: number;
  radius: number;
  vx: number;
  type: 'wind' | 'ice';
}

const CANVAS_W = 640;
const CANVAS_H = 520;
const START_ALTITUDE = 160;

function createInitialSimState() {
  const initialHazards: Hazard[] = Array.from({ length: 7 }, (_, i) => ({
    x: 80 + ((i * 83) % (CANVAS_W - 160)),
    y: 120 + i * 65,
    radius: 22 + (i % 3) * 5,
    vx: (i % 2 === 0 ? 1 : -1) * (0.7 + (i % 4) * 0.25),
    type: i % 2 === 0 ? 'wind' : 'ice',
  }));

  return {
    x: CANVAS_W / 2,
    vx: 0,
    altitude: START_ALTITUDE,
    vy: 42,
    heat: 25,
    chuteDeployed: false,
    padX: CANVAS_W / 2 + 85,
    hazards: initialHazards,
    keys: { left: false, right: false },
    tick: 0,
    lastBuffetTick: -20,
  };
}

export default function HuygensGame({ isPaused, onComplete }: HuygensGameProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const completedRef = useRef(false);

  const [gameState, setGameState] = useState<'playing' | 'crashed' | 'landed'>('playing');
  const [failReason, setFailReason] = useState('');
  const [hud, setHud] = useState({
    altitude: START_ALTITUDE,
    speed: 42,
    heat: 25,
    chuteDeployed: false,
  });

  const simRef = useRef(createInitialSimState());

  const resetGame = useCallback(() => {
    completedRef.current = false;
    simRef.current = createInitialSimState();
    simRef.current.padX = 140 + Math.random() * (CANVAS_W - 280);
    setFailReason('');
    setHud({
      altitude: START_ALTITUDE,
      speed: 42,
      heat: 25,
      chuteDeployed: false,
    });
    setGameState('playing');
  }, []);

  const deployParachute = useCallback(() => {
    const s = simRef.current;
    if (isPaused || gameState !== 'playing' || s.chuteDeployed) return;

    if (s.altitude > 125) {
      playCrashExplosion();
      setFailReason('Parachute deployed too high in hypersonic entry — canopy shredded!');
      setGameState('crashed');
      return;
    }

    s.chuteDeployed = true;
    playParachuteDeploy();
  }, [isPaused, gameState]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (isPaused) return;
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        simRef.current.keys.left = true;
      }
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        simRef.current.keys.right = true;
      }
      if (e.key === ' ') {
        e.preventDefault();
        if (gameState === 'crashed') {
          resetGame();
        } else if (gameState === 'playing') {
          deployParachute();
        }
      }
    };

    const onKeyUp = (e: KeyboardEvent) => {
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
  }, [isPaused, gameState, resetGame, deployParachute]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;

    const updateAndDraw = () => {
      const s = simRef.current;

      if (!isPaused && gameState === 'playing') {
        s.tick++;
        const accel = s.chuteDeployed ? 0.28 : 0.36;
        if (s.keys.left) s.vx -= accel;
        if (s.keys.right) s.vx += accel;
        if ((s.keys.left || s.keys.right) && s.tick % 6 === 0) {
          playThrusterBurst();
        }

        s.vx *= 0.92;
        s.x += s.vx;
        s.x = Math.max(36, Math.min(CANVAS_W - 36, s.x));

        const targetVy = s.chuteDeployed ? 4.8 : Math.max(24, 18 + s.altitude * 0.16);
        s.vy += (targetVy - s.vy) * 0.06;
        s.altitude = Math.max(0, s.altitude - s.vy * 0.011);

        if (!s.chuteDeployed && s.altitude > 70) {
          s.heat = Math.min(100, s.heat + 0.14);
        } else {
          s.heat = Math.max(10, s.heat - 0.25);
        }

        if (s.heat >= 100) {
          playCrashExplosion();
          setFailReason('Aeroshell thermal overload! Deploy parachute below 125 km to cool down.');
          setGameState('crashed');
        }

        const scrollSpeed = s.vy * 0.085;
        for (const h of s.hazards) {
          h.x += h.vx;
          if (h.x < 40 || h.x > CANVAS_W - 40) h.vx *= -1;

          if (s.altitude > 14) {
            h.y -= scrollSpeed;
            if (h.y < -30) {
              h.y = CANVAS_H + 30;
              h.x = 60 + Math.random() * (CANVAS_W - 120);
            }
          }

          const probeY = s.altitude > 20 ? 170 : 170 + ((20 - s.altitude) / 20) * 265;
          const dist = Math.hypot(s.x - h.x, probeY - h.y);
          if (dist < h.radius + 16 && s.altitude > 8) {
            if (s.tick - s.lastBuffetTick > 14) {
              playAtmosphereBuffet();
              s.lastBuffetTick = s.tick;
            }
            if (h.type === 'wind') {
              s.vx += h.vx * 2.8;
              s.heat = Math.min(100, s.heat + 0.6);
            } else {
              s.heat = Math.min(100, s.heat + 1.2);
              s.vx += (s.x > h.x ? 1 : -1) * 1.6;
            }
          }
        }

        if (s.altitude <= 0) {
          const offset = Math.abs(s.x - s.padX);
          if (!s.chuteDeployed || s.vy > 8) {
            playCrashExplosion();
            setFailReason(
              `Hard impact at ${s.vy.toFixed(1)} m/s! You must deploy the parachute before landing.`
            );
            setGameState('crashed');
          } else if (offset > 56) {
            playCrashExplosion();
            setFailReason('Missed the Xanadu solid shoreline and sank into a liquid methane lake!');
            setGameState('crashed');
          } else {
            playMissionCompleteFanfare();
            setGameState('landed');
            if (!completedRef.current) {
              completedRef.current = true;
              setTimeout(() => onComplete(), 1100);
            }
          }
        }

        if (s.tick % 4 === 0) {
          setHud({
            altitude: Number(s.altitude.toFixed(1)),
            speed: Number(s.vy.toFixed(1)),
            heat: Math.round(s.heat),
            chuteDeployed: s.chuteDeployed,
          });
        }
      }

      // Render Scene
      const altRatio = s.altitude / START_ALTITUDE;
      const skyGrad = ctx.createLinearGradient(0, 0, 0, CANVAS_H);
      if (altRatio > 0.5) {
        skyGrad.addColorStop(0, '#0F172A');
        skyGrad.addColorStop(0.5, '#78350F');
        skyGrad.addColorStop(1, '#D97706');
      } else {
        skyGrad.addColorStop(0, '#92400E');
        skyGrad.addColorStop(0.5, '#D97706');
        skyGrad.addColorStop(1, '#F59E0B');
      }
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

      ctx.fillStyle = 'rgba(254, 243, 199, 0.08)';
      for (let i = 0; i < 5; i++) {
        const bandY = (((i * 110 - s.tick * (s.vy * 0.03)) % CANVAS_H) + CANVAS_H) % CANVAS_H;
        ctx.fillRect(0, bandY, CANVAS_W, 24);
      }

      if (s.altitude > 10) {
        for (const h of s.hazards) {
          if (h.type === 'wind') {
            ctx.strokeStyle = 'rgba(254, 240, 138, 0.65)';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(h.x - h.radius, h.y - 6);
            ctx.quadraticCurveTo(h.x, h.y - 14, h.x + h.radius, h.y - 6);
            ctx.moveTo(h.x - h.radius * 0.8, h.y + 6);
            ctx.quadraticCurveTo(h.x, h.y + 14, h.x + h.radius * 0.8, h.y + 6);
            ctx.stroke();
          } else {
            ctx.fillStyle = 'rgba(186, 230, 253, 0.45)';
            ctx.beginPath();
            ctx.arc(h.x, h.y, h.radius, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#E0F2FE';
            ctx.lineWidth = 1.5;
            ctx.stroke();
          }
        }
      }

      if (s.altitude < 24) {
        const groundY = CANVAS_H - ((24 - s.altitude) / 24) * 70;
        ctx.fillStyle = '#1E293B';
        ctx.fillRect(0, groundY, CANVAS_W, CANVAS_H - groundY);

        ctx.fillStyle = '#92400E';
        ctx.beginPath();
        ctx.ellipse(s.padX, groundY + 25, 110, 38, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#FACC15';
        ctx.fillRect(s.padX - 48, groundY - 2, 96, 8);
        ctx.fillStyle = '#0F172A';
        for (let bx = s.padX - 44; bx < s.padX + 44; bx += 16) {
          ctx.fillRect(bx, groundY - 2, 8, 8);
        }

        const pulse = (s.tick % 40) / 40;
        ctx.strokeStyle = `rgba(250, 204, 21, ${1 - pulse})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(s.padX, groundY, 20 + pulse * 35, Math.PI, Math.PI * 2);
        ctx.stroke();
      }

      const probeY =
        s.altitude > 20 ? 170 : 170 + ((20 - Math.min(20, s.altitude)) / 20) * 265;

      if (s.chuteDeployed) {
        ctx.strokeStyle = '#E2E8F0';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(s.x - 12, probeY - 6);
        ctx.lineTo(s.x - 38, probeY - 62);
        ctx.moveTo(s.x + 12, probeY - 6);
        ctx.lineTo(s.x + 38, probeY - 62);
        ctx.moveTo(s.x, probeY - 8);
        ctx.lineTo(s.x, probeY - 68);
        ctx.stroke();

        ctx.fillStyle = '#F8FAFC';
        ctx.beginPath();
        ctx.arc(s.x, probeY - 62, 40, Math.PI, 0);
        ctx.fill();

        ctx.fillStyle = '#EA580C';
        ctx.beginPath();
        ctx.arc(s.x, probeY - 62, 40, Math.PI * 1.25, Math.PI * 1.75);
        ctx.lineTo(s.x, probeY - 62);
        ctx.fill();
      }

      if (!s.chuteDeployed && s.altitude > 65 && gameState === 'playing') {
        ctx.fillStyle = `rgba(251, 146, 60, ${0.35 + Math.sin(s.tick * 0.3) * 0.15})`;
        ctx.beginPath();
        ctx.arc(s.x, probeY + 8, 28, 0, Math.PI);
        ctx.fill();
      }

      ctx.fillStyle = '#CBD5E1';
      ctx.beginPath();
      ctx.moveTo(s.x - 22, probeY);
      ctx.lineTo(s.x + 22, probeY);
      ctx.lineTo(s.x + 12, probeY + 12);
      ctx.lineTo(s.x - 12, probeY + 12);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = '#F59E0B';
      ctx.beginPath();
      ctx.arc(s.x, probeY, 13, Math.PI, 0);
      ctx.fill();

      if (!isPaused && gameState === 'playing') {
        ctx.fillStyle = '#38BDF8';
        if (s.keys.left) ctx.fillRect(s.x + 20, probeY - 2, 10, 4);
        if (s.keys.right) ctx.fillRect(s.x - 30, probeY - 2, 10, 4);
      }

      if (s.altitude >= 24 && gameState === 'playing') {
        ctx.fillStyle = 'rgba(15, 23, 42, 0.8)';
        ctx.fillRect(s.padX - 36, CANVAS_H - 26, 72, 20);
        ctx.strokeStyle = '#FACC15';
        ctx.strokeRect(s.padX - 36, CANVAS_H - 26, 72, 20);
        ctx.fillStyle = '#FACC15';
        ctx.font = 'bold 10px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('▼ PAD ZONE', s.padX, CANVAS_H - 13);
      }

      animId = requestAnimationFrame(updateAndDraw);
    };

    animId = requestAnimationFrame(updateAndDraw);
    return () => cancelAnimationFrame(animId);
  }, [isPaused, gameState, onComplete]);

  return (
    <div className="flex flex-col items-center">
      <div className="mb-3 grid w-full max-w-[640px] grid-cols-4 gap-2 rounded-lg border border-slate-800 bg-slate-900 p-3 font-mono text-xs">
        <div>
          <span className="block text-[10px] text-slate-400">ALTITUDE</span>
          <span className="text-sm font-bold text-amber-400">{hud.altitude} km</span>
        </div>
        <div>
          <span className="block text-[10px] text-slate-400">DESCENT RATE</span>
          <span className={`text-sm font-bold ${hud.speed > 10 ? 'text-rose-400' : 'text-emerald-400'}`}>
            {hud.speed} m/s
          </span>
        </div>
        <div>
          <span className="block text-[10px] text-slate-400">HEAT SHIELD</span>
          <span className={`text-sm font-bold ${hud.heat > 75 ? 'text-rose-400' : 'text-sky-400'}`}>
            {hud.heat}%
          </span>
        </div>
        <div>
          <span className="block text-[10px] text-slate-400">PARACHUTE</span>
          <span
            className={`text-sm font-bold ${
              hud.chuteDeployed
                ? 'text-emerald-400'
                : hud.altitude <= 125
                  ? 'animate-pulse text-amber-300'
                  : 'text-slate-500'
            }`}
          >
            {hud.chuteDeployed
              ? 'DEPLOYED'
              : hud.altitude <= 125
                ? 'ARMED [SPACE]'
                : 'WAIT (<125km)'}
          </span>
        </div>
      </div>

      <div className="relative overflow-hidden rounded-xl border-4 border-slate-700 bg-slate-950 shadow-2xl">
        <canvas ref={canvasRef} width={CANVAS_W} height={CANVAS_H} className="block max-w-full" />

        {gameState === 'crashed' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-rose-950/85 p-6 text-center backdrop-blur-xs">
            <h2 className="font-mono text-2xl font-bold text-rose-300">TELEMETRY LOST</h2>
            <p className="mt-2 max-w-md text-sm text-rose-100">{failReason}</p>
            <button
              onClick={resetGame}
              className="mt-6 rounded-lg bg-white px-6 py-2.5 font-mono text-sm font-bold text-slate-950 transition hover:bg-amber-300"
            >
              RETRY DESCENT [SPACE]
            </button>
          </div>
        )}

        {gameState === 'landed' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-emerald-950/80 p-6 text-center backdrop-blur-xs">
            <p className="animate-pulse font-mono text-lg font-bold tracking-wider text-emerald-300">
              TOUCHDOWN CONFIRMED ON TITAN!
            </p>
            <p className="mt-1 font-mono text-xs text-emerald-100">
              Decrypting surface telemetry dossier...
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
            ◀ THRUST LEFT
          </button>
          <button
            onMouseDown={() => (simRef.current.keys.right = true)}
            onMouseUp={() => (simRef.current.keys.right = false)}
            onMouseLeave={() => (simRef.current.keys.right = false)}
            className="rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 font-mono text-xs font-bold text-white active:bg-slate-700"
          >
            THRUST RIGHT ▶
          </button>
        </div>

        <button
          onClick={deployParachute}
          disabled={isPaused || gameState !== 'playing' || hud.chuteDeployed}
          className="rounded-lg bg-amber-500 px-4 py-2 font-mono text-xs font-bold text-slate-950 transition hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {hud.chuteDeployed ? 'CHUTE DEPLOYED' : 'DEPLOY CHUTE [SPACE]'}
        </button>
      </div>
    </div>
  );
}
