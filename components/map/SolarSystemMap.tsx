'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { MissionSlug } from '@/types/game';
import { playRandomSpaceBeep, playMissionLockSound } from '@/utils/soundEffects';

interface CelestialBody {
  id: string;
  name: string;
  orbitRadius: number;
  radius: number;
  speed: number;
  initialAngle: number;
  color: string;
  accentColor?: string;
  hasRings?: boolean;
  missionSlug?: MissionSlug;
  missionLabel?: string;
}

const CANVAS_W = 960;
const CANVAS_H = 680;
const CENTER_X = CANVAS_W / 2;
const CENTER_Y = CANVAS_H / 2;

const PLANETS: CelestialBody[] = [
  {
    id: 'mercury',
    name: 'Mercury',
    orbitRadius: 72,
    radius: 6,
    speed: 0.011,
    initialAngle: 0.6,
    color: '#94A3B8',
  },
  {
    id: 'venus',
    name: 'Venus',
    orbitRadius: 112,
    radius: 9,
    speed: 0.008,
    initialAngle: 2.3,
    color: '#FDE047',
  },
  {
    id: 'earth',
    name: 'Earth',
    orbitRadius: 162,
    radius: 11,
    speed: 0.006,
    initialAngle: 4.1,
    color: '#2563EB',
    accentColor: '#22C55E',
  },
  {
    id: 'mars',
    name: 'Mars',
    orbitRadius: 218,
    radius: 10,
    speed: 0.0046,
    initialAngle: 1.1,
    color: '#EA580C',
    missionSlug: 'ingenuity',
    missionLabel: 'INGENUITY HELICOPTER',
  },
  {
    id: 'jupiter',
    name: 'Jupiter',
    orbitRadius: 282,
    radius: 20,
    speed: 0.0029,
    initialAngle: 5.0,
    color: '#D97706',
    accentColor: '#FDE68A',
    missionSlug: 'galileo',
    missionLabel: 'GALILEO PROBE',
  },
  {
    id: 'saturn',
    name: 'Saturn (Titan)',
    orbitRadius: 348,
    radius: 16,
    speed: 0.0021,
    initialAngle: 2.8,
    color: '#F59E0B',
    hasRings: true,
    missionSlug: 'huygens',
    missionLabel: 'HUYGENS LANDER',
  },
  {
    id: 'uranus',
    name: 'Uranus',
    orbitRadius: 404,
    radius: 12,
    speed: 0.0015,
    initialAngle: 0.4,
    color: '#38BDF8',
  },
  {
    id: 'neptune',
    name: 'Neptune',
    orbitRadius: 452,
    radius: 12,
    speed: 0.0011,
    initialAngle: 3.7,
    color: '#4F46E5',
  },
];

const STARS = Array.from({ length: 130 }, (_, i) => ({
  x: (i * 211) % CANVAS_W,
  y: (i * 149) % CANVAS_H,
  size: i % 5 === 0 ? 2 : 1,
  phase: i * 0.7,
}));

interface HitTarget {
  id: string;
  name: string;
  x: number;
  y: number;
  hitRadius: number;
  missionSlug?: MissionSlug;
  missionLabel?: string;
}

export default function SolarSystemMap() {
  const router = useRouter();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const hitTargetsRef = useRef<HitTarget[]>([]);
  const hoveredIdRef = useRef<string | null>(null);
  const launchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [hoveredTarget, setHoveredTarget] = useState<HitTarget | null>(null);
  const [statusBanner, setStatusBanner] = useState<string | null>(null);
  const [launchingMission, setLaunchingMission] = useState<string | null>(null);

  // Clear launch overlay whenever returning to the Solar System (Router Cache / bfcache)
  useEffect(() => {
    setLaunchingMission(null);

    const handlePageShow = () => setLaunchingMission(null);
    window.addEventListener('pageshow', handlePageShow);

    return () => {
      window.removeEventListener('pageshow', handlePageShow);
      if (launchTimeoutRef.current) {
        clearTimeout(launchTimeoutRef.current);
      }
    };
  }, []);

  const launchMission = (slug: MissionSlug, label: string) => {
    if (launchingMission) return;
    playMissionLockSound();
    setLaunchingMission(label);
    launchTimeoutRef.current = setTimeout(() => {
      router.push(`/missions/${slug}`);
    }, 350);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let tick = 0;

    const render = () => {
      tick++;
      const currentTargets: HitTarget[] = [];

      // 1. Deep Space Background
      ctx.fillStyle = '#020617';
      ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

      // Twinkling Starfield
      for (const star of STARS) {
        const alpha = 0.35 + 0.65 * Math.abs(Math.sin(tick * 0.02 + star.phase));
        ctx.fillStyle = `rgba(248, 250, 252, ${alpha})`;
        ctx.fillRect(star.x, star.y, star.size, star.size);
      }

      // 2. Elliptical Orbit Rings
      const tiltY = 0.68;
      for (const p of PLANETS) {
        ctx.strokeStyle = p.missionSlug
          ? 'rgba(250, 204, 21, 0.24)'
          : 'rgba(148, 163, 184, 0.14)';
        ctx.lineWidth = p.missionSlug ? 1.5 : 1;
        ctx.beginPath();
        ctx.ellipse(CENTER_X, CENTER_Y, p.orbitRadius, p.orbitRadius * tiltY, 0, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Asteroid Belt between Mars & Jupiter
      ctx.fillStyle = 'rgba(148, 163, 184, 0.38)';
      for (let a = 0; a < 60; a++) {
        const ang = (a / 60) * Math.PI * 2 + tick * 0.001;
        const r = 248 + (a % 4) * 3;
        const ax = CENTER_X + Math.cos(ang) * r;
        const ay = CENTER_Y + Math.sin(ang) * r * tiltY;
        ctx.fillRect(ax, ay, 2, 2);
      }

      // 3. Central Sun
      const sunPulse = Math.sin(tick * 0.05) * 3;
      const sunGlow = ctx.createRadialGradient(
        CENTER_X,
        CENTER_Y,
        8,
        CENTER_X,
        CENTER_Y,
        48 + sunPulse
      );
      sunGlow.addColorStop(0, '#FEF08A');
      sunGlow.addColorStop(0.45, '#F59E0B');
      sunGlow.addColorStop(1, 'rgba(245, 158, 11, 0)');
      ctx.fillStyle = sunGlow;
      ctx.beginPath();
      ctx.arc(CENTER_X, CENTER_Y, 48 + sunPulse, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#FACC15';
      ctx.beginPath();
      ctx.arc(CENTER_X, CENTER_Y, 24, 0, Math.PI * 2);
      ctx.fill();

      currentTargets.push({
        id: 'sun',
        name: 'The Sun',
        x: CENTER_X,
        y: CENTER_Y,
        hitRadius: 28,
      });

      // 4. Planets & Moon
      for (const p of PLANETS) {
        const angle = p.initialAngle + tick * p.speed;
        const px = CENTER_X + Math.cos(angle) * p.orbitRadius;
        const py = CENTER_Y + Math.sin(angle) * p.orbitRadius * tiltY;

        if (p.missionSlug) {
          const pulse = (tick % 55) / 55;
          ctx.strokeStyle = `rgba(250, 204, 21, ${0.85 - pulse * 0.85})`;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(px, py, p.radius + 6 + pulse * 11, 0, Math.PI * 2);
          ctx.stroke();
        }

        if (p.hasRings) {
          ctx.strokeStyle = '#FDE68A';
          ctx.lineWidth = 3.5;
          ctx.beginPath();
          ctx.ellipse(px, py, p.radius + 15, (p.radius + 15) * 0.35, -0.25, Math.PI, Math.PI * 2);
          ctx.stroke();
        }

        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(px, py, p.radius, 0, Math.PI * 2);
        ctx.fill();

        if (p.id === 'earth' && p.accentColor) {
          ctx.fillStyle = p.accentColor;
          ctx.beginPath();
          ctx.arc(px - 3, py - 2, 4, 0, Math.PI * 2);
          ctx.arc(px + 3, py + 3, 3.5, 0, Math.PI * 2);
          ctx.fill();
        } else if (p.id === 'jupiter' && p.accentColor) {
          ctx.fillStyle = p.accentColor;
          ctx.fillRect(px - p.radius + 2, py - 6, (p.radius - 2) * 2, 3);
          ctx.fillRect(px - p.radius + 3, py + 3, (p.radius - 3) * 2, 3);
        }

        if (p.hasRings) {
          ctx.strokeStyle = '#FDE68A';
          ctx.lineWidth = 3.5;
          ctx.beginPath();
          ctx.ellipse(px, py, p.radius + 15, (p.radius + 15) * 0.35, -0.25, 0, Math.PI);
          ctx.stroke();
        }

        ctx.font = p.missionSlug ? 'bold 11px monospace' : '10px monospace';
        ctx.textAlign = 'center';
        ctx.fillStyle = p.missionSlug ? '#FDE047' : '#94A3B8';
        ctx.fillText(p.name.toUpperCase(), px, py + p.radius + 16);

        currentTargets.push({
          id: p.id,
          name: p.name,
          x: px,
          y: py,
          hitRadius: Math.max(20, p.radius + 9),
          missionSlug: p.missionSlug,
          missionLabel: p.missionLabel,
        });

        if (p.id === 'earth') {
          const moonAngle = tick * 0.026;
          const mx = px + Math.cos(moonAngle) * 28;
          const my = py + Math.sin(moonAngle) * 22;

          const mPulse = (tick % 45) / 45;
          ctx.strokeStyle = `rgba(56, 189, 248, ${0.9 - mPulse * 0.9})`;
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.arc(mx, my, 7 + mPulse * 8, 0, Math.PI * 2);
          ctx.stroke();

          ctx.fillStyle = '#E2E8F0';
          ctx.beginPath();
          ctx.arc(mx, my, 5, 0, Math.PI * 2);
          ctx.fill();

          ctx.font = 'bold 10px monospace';
          ctx.fillStyle = '#38BDF8';
          ctx.fillText('MOON', mx, my - 10);

          currentTargets.push({
            id: 'moon',
            name: 'The Moon',
            x: mx,
            y: my,
            hitRadius: 16,
            missionSlug: 'lunokhod',
            missionLabel: 'LUNOKHOD 1 ROVER',
          });
        }
      }

      if (hoveredIdRef.current) {
        const active = currentTargets.find((t) => t.id === hoveredIdRef.current);
        if (active) {
          ctx.strokeStyle = active.missionSlug ? '#38BDF8' : '#F43F5E';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(active.x, active.y, active.hitRadius + 4, 0, Math.PI * 2);
          ctx.stroke();
        }
      }

      hitTargetsRef.current = currentTargets;
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, []);

  const getHitAtPointer = (e: React.MouseEvent<HTMLCanvasElement>): HitTarget | null => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const mx = (e.clientX - rect.left) * scaleX;
    const my = (e.clientY - rect.top) * scaleY;

    const ordered = [...hitTargetsRef.current].reverse();
    for (const target of ordered) {
      if (Math.hypot(mx - target.x, my - target.y) <= target.hitRadius) {
        return target;
      }
    }
    return null;
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const hit = getHitAtPointer(e);
    const nextId = hit ? hit.id : null;
    if (hoveredIdRef.current !== nextId) {
      hoveredIdRef.current = nextId;
      setHoveredTarget(hit);
    }
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const hit = getHitAtPointer(e);
    if (!hit) {
      playRandomSpaceBeep();
      setStatusBanner('DEEP SPACE VOID — CLICK A PLANET TO SCAN');
      return;
    }

    if (hit.missionSlug && hit.missionLabel) {
      launchMission(hit.missionSlug, hit.missionLabel);
    } else {
      playRandomSpaceBeep();
      setStatusBanner(`${hit.name.toUpperCase()}: NO ACTIVE LANDER TELEMETRY`);
    }
  };

  return (
    <div className="flex flex-col items-center">
      {/* Main Orrery Viewport */}
      <div className="relative overflow-hidden rounded-xl border-4 border-slate-700 bg-slate-950 shadow-2xl">
        <canvas
          ref={canvasRef}
          width={CANVAS_W}
          height={CANVAS_H}
          onMouseMove={handleMouseMove}
          onMouseLeave={() => {
            hoveredIdRef.current = null;
            setHoveredTarget(null);
          }}
          onClick={handleCanvasClick}
          className={`block max-w-full ${hoveredTarget ? 'cursor-pointer' : 'cursor-crosshair'}`}
        />

        {/* Hover Telemetry Tooltip */}
        {hoveredTarget && !launchingMission && (
          <div className="pointer-events-none absolute top-4 left-4 rounded-lg border border-slate-700 bg-slate-900/90 px-3.5 py-2 font-mono text-xs shadow-lg">
            <p className="font-bold text-white">{hoveredTarget.name.toUpperCase()}</p>
            {hoveredTarget.missionLabel ? (
              <p className="text-amber-400">▶ CLICK TO LAUNCH: {hoveredTarget.missionLabel}</p>
            ) : (
              <p className="text-slate-400">SIGNAL: PASSIVE BEACON ONLY</p>
            )}
          </div>
        )}

        {/* Non-Mission Beep Feedback Banner */}
        {statusBanner && !launchingMission && (
          <div className="pointer-events-none absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full border border-slate-700 bg-slate-900/90 px-4 py-1.5 font-mono text-xs text-slate-300 shadow">
            {statusBanner}
          </div>
        )}

        {/* Mission Launch Transition Overlay */}
        {launchingMission && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-slate-950/90">
            <p className="animate-pulse font-mono text-lg font-bold tracking-widest text-amber-400">
              LOCKING TRAJECTORY: {launchingMission}...
            </p>
          </div>
        )}
      </div>

      {/* Mission Target Quick-Launch Bar */}
      <div className="mt-4 flex w-full max-w-[960px] flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-800 bg-slate-900/90 px-4 py-3 text-xs">
        <span className="font-mono text-slate-400">
          <strong className="text-amber-400">ACTIVE MISSIONS:</strong> Click glowing worlds or
          select below
        </span>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => launchMission('lunokhod', 'LUNOKHOD 1 ROVER')}
            className="rounded border border-sky-500/40 bg-slate-800 px-3 py-1 font-mono text-xs font-bold text-sky-300 transition hover:bg-sky-500 hover:text-slate-950"
          >
            🌕 MOON (LUNOKHOD 1)
          </button>
          <button
            onClick={() => launchMission('ingenuity', 'INGENUITY HELICOPTER')}
            className="rounded border border-orange-500/40 bg-slate-800 px-3 py-1 font-mono text-xs font-bold text-orange-300 transition hover:bg-orange-500 hover:text-slate-950"
          >
            🔴 MARS (INGENUITY)
          </button>
          <button
            onClick={() => launchMission('galileo', 'GALILEO PROBE')}
            className="rounded border border-amber-500/40 bg-slate-800 px-3 py-1 font-mono text-xs font-bold text-amber-300 transition hover:bg-amber-500 hover:text-slate-950"
          >
            🟠 JUPITER (GALILEO)
          </button>
          <button
            onClick={() => launchMission('huygens', 'HUYGENS LANDER')}
            className="rounded border border-yellow-500/40 bg-slate-800 px-3 py-1 font-mono text-xs font-bold text-yellow-300 transition hover:bg-yellow-500 hover:text-slate-950"
          >
            🪐 SATURN / TITAN (HUYGENS)
          </button>
        </div>
      </div>
    </div>
  );
}
