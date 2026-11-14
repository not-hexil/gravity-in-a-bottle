'use client';

import React, { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { MissionSlug, PlanetSlug } from '@/lib/game';
import { playRandomSpaceBeep, playMissionLockSound } from '@/lib/soundEffects';

interface CelestialBody {
  id: PlanetSlug;
  name: string;
  orbitRadius: number;
  radius: number;
  speed: number;
  initialAngle: number;
  color: string;
  accentColor?: string;
  hasRings?: boolean;
  missions?: MissionSlug[];
  simulationCountLabel?: string;
}

const CANVAS_W = 960;
const CANVAS_H = 680;
const CENTER_X = CANVAS_W / 2;
const CENTER_Y = CANVAS_H / 2;

const STORAGE_KEY = 'gravity_completed_missions';
const EMPTY_COMPLETED: string[] = [];

let cachedRaw: string | null = null;
let cachedParsed: string[] = EMPTY_COMPLETED;

function getCompletedSnapshot(): string[] {
  if (typeof window === 'undefined') return EMPTY_COMPLETED;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw === cachedRaw) return cachedParsed;
    cachedRaw = raw;
    if (!raw) {
      cachedParsed = EMPTY_COMPLETED;
      return cachedParsed;
    }
    const parsed = JSON.parse(raw);
    cachedParsed = Array.isArray(parsed) ? parsed : EMPTY_COMPLETED;
    return cachedParsed;
  } catch {
    return EMPTY_COMPLETED;
  }
}

function getServerSnapshot(): string[] {
  return EMPTY_COMPLETED;
}

function subscribeToCompletedStore(callback: () => void): () => void {
  window.addEventListener('storage', callback);
  window.addEventListener('pageshow', callback);
  return () => {
    window.removeEventListener('storage', callback);
    window.removeEventListener('pageshow', callback);
  };
}

const MOON_MISSIONS: MissionSlug[] = ['lunokhod', 'surveyor3'];

const PLANETS: CelestialBody[] = [
  {
    id: 'mercury',
    name: 'Mercury',
    orbitRadius: 72,
    radius: 6,
    speed: 0.0038,
    initialAngle: 0.6,
    color: '#94A3B8',
    missions: ['messenger'],
    simulationCountLabel: 'MESSENGER ORBITER',
  },
  {
    id: 'venus',
    name: 'Venus',
    orbitRadius: 112,
    radius: 9,
    speed: 0.0028,
    initialAngle: 2.3,
    color: '#FDE047',
    missions: ['venera13'],
    simulationCountLabel: 'VENERA 13 LAB',
  },
  {
    id: 'earth',
    name: 'Earth',
    orbitRadius: 166,
    radius: 11,
    speed: 0.0021,
    initialAngle: 4.1,
    color: '#2563EB',
    accentColor: '#22C55E',
  },
  {
    id: 'mars',
    name: 'Mars',
    orbitRadius: 224,
    radius: 10,
    speed: 0.0016,
    initialAngle: 1.1,
    color: '#EA580C',
    missions: ['ingenuity'],
    simulationCountLabel: 'INGENUITY HELICOPTER',
  },
  {
    id: 'jupiter',
    name: 'Jupiter',
    orbitRadius: 286,
    radius: 20,
    speed: 0.001,
    initialAngle: 5.0,
    color: '#D97706',
    accentColor: '#FDE68A',
    missions: ['galileo'],
    simulationCountLabel: 'GALILEO PROBE',
  },
  {
    id: 'saturn',
    name: 'Saturn (Titan)',
    orbitRadius: 350,
    radius: 16,
    speed: 0.00075,
    initialAngle: 2.8,
    color: '#F59E0B',
    hasRings: true,
    missions: ['huygens'],
    simulationCountLabel: 'HUYGENS LANDER',
  },
  {
    id: 'uranus',
    name: 'Uranus',
    orbitRadius: 406,
    radius: 12,
    speed: 0.00052,
    initialAngle: 0.4,
    color: '#38BDF8',
  },
  {
    id: 'neptune',
    name: 'Neptune',
    orbitRadius: 454,
    radius: 12,
    speed: 0.00038,
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
  planetSlug?: PlanetSlug;
  name: string;
  x: number;
  y: number;
  hitRadius: number;
  hasPendingMission?: boolean;
  simulationCountLabel?: string;
}

export default function SolarSystemMap() {
  const router = useRouter();
  const pathname = usePathname();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const hitTargetsRef = useRef<HitTarget[]>([]);
  const hoveredIdRef = useRef<string | null>(null);
  const launchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const completedSlugs = useSyncExternalStore(
    subscribeToCompletedStore,
    getCompletedSnapshot,
    getServerSnapshot
  );

  const completedRef = useRef<string[]>(completedSlugs);
  useEffect(() => {
    completedRef.current = completedSlugs;
  }, [completedSlugs]);

  const [hoveredTarget, setHoveredTarget] = useState<HitTarget | null>(null);
  const [statusBanner, setStatusBanner] = useState<string | null>(null);
  const [launchState, setLaunchState] = useState<{ label: string; fromPath: string } | null>(null);
  const [telemetryClock, setTelemetryClock] = useState<string>('SYNCING UTC...');

  const openingDossier =
    launchState && launchState.fromPath === pathname ? launchState.label : null;

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      const isoDate = now.toISOString().slice(0, 10);
      const isoTime = now.toISOString().slice(11, 19);
      setTelemetryClock(`${isoDate} // ${isoTime} UTC`);
    };
    const initTimer = window.setTimeout(updateClock, 0);
    const interval = window.setInterval(updateClock, 1000);
    return () => {
      window.clearTimeout(initTimer);
      window.clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    const handlePageShow = () => setLaunchState(null);
    window.addEventListener('pageshow', handlePageShow);

    return () => {
      window.removeEventListener('pageshow', handlePageShow);
      if (launchTimeoutRef.current) {
        clearTimeout(launchTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (container && container.scrollWidth > container.clientWidth) {
      container.scrollLeft = (container.scrollWidth - container.clientWidth) / 2;
    }
  }, []);

  const openPlanetDossier = (planetSlug: PlanetSlug, label: string) => {
    if (openingDossier) return;
    playMissionLockSound();
    setLaunchState({ label, fromPath: pathname });
    launchTimeoutRef.current = setTimeout(() => {
      router.push(`/planets/${planetSlug}`);
      setLaunchState(null);
    }, 300);
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
      const completed = completedRef.current;
      const earthUnlocked = completed.length >= 4;

      // Space Background
      ctx.fillStyle = '#020617';
      ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

      // Starfield
      for (const star of STARS) {
        const alpha = 0.35 + 0.65 * Math.abs(Math.sin(tick * 0.012 + star.phase));
        ctx.fillStyle = `rgba(248, 250, 252, ${alpha})`;
        ctx.fillRect(star.x, star.y, star.size, star.size);
      }

      // Elliptical Orbit Rings
      const tiltY = 0.68;
      for (const p of PLANETS) {
        const hasPending =
          Array.isArray(p.missions) &&
          p.missions.some((m) => !completed.includes(m));
        const isEarthActive = p.id === 'earth' && earthUnlocked;

        ctx.strokeStyle = isEarthActive
          ? 'rgba(52, 211, 153, 0.32)'
          : hasPending
            ? 'rgba(250, 204, 21, 0.24)'
            : 'rgba(148, 163, 184, 0.14)';
        ctx.lineWidth = hasPending || isEarthActive ? 1.5 : 1;
        ctx.beginPath();
        ctx.ellipse(CENTER_X, CENTER_Y, p.orbitRadius, p.orbitRadius * tiltY, 0, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Asteroid Belt between Mars & Jupiter
      ctx.fillStyle = 'rgba(148, 163, 184, 0.38)';
      for (let a = 0; a < 60; a++) {
        const ang = (a / 60) * Math.PI * 2 + tick * 0.00035;
        const r = 254 + (a % 4) * 3;
        const ax = CENTER_X + Math.cos(ang) * r;
        const ay = CENTER_Y + Math.sin(ang) * r * tiltY;
        ctx.fillRect(ax, ay, 2, 2);
      }

      // Central Sun
      const sunPulse = Math.sin(tick * 0.03) * 3;
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

      // Planets & Moon
      for (const p of PLANETS) {
        const angle = p.initialAngle + tick * p.speed;
        const px = CENTER_X + Math.cos(angle) * p.orbitRadius;
        const py = CENTER_Y + Math.sin(angle) * p.orbitRadius * tiltY;

        const hasPending =
          Array.isArray(p.missions) &&
          p.missions.some((m) => !completed.includes(m));

        // Ping ONLY if this planet has at least one mission not yet completed
        if (hasPending) {
          const pulse = (tick % 75) / 75;
          ctx.strokeStyle = `rgba(250, 204, 21, ${0.85 - pulse * 0.85})`;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(px, py, p.radius + 6 + pulse * 11, 0, Math.PI * 2);
          ctx.stroke();
        }

        // Emerald beacon around Earth once >= 4 missions are completed
        if (p.id === 'earth' && earthUnlocked) {
          const ePulse = (tick % 70) / 70;
          ctx.strokeStyle = `rgba(52, 211, 153, ${0.9 - ePulse * 0.9})`;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(px, py, p.radius + 6 + ePulse * 12, 0, Math.PI * 2);
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

        ctx.font =
          hasPending || (p.id === 'earth' && earthUnlocked)
            ? 'bold 11px monospace'
            : '10px monospace';
        ctx.textAlign = 'center';
        ctx.fillStyle =
          p.id === 'earth' && earthUnlocked
            ? '#34D399'
            : hasPending
              ? '#FDE047'
              : '#94A3B8';
        ctx.fillText(p.name.toUpperCase(), px, py + p.radius + 16);

        currentTargets.push({
          id: p.id,
          planetSlug: p.id,
          name: p.name,
          x: px,
          y: py,
          hitRadius: Math.max(20, p.radius + 9),
          hasPendingMission: hasPending,
          simulationCountLabel:
            p.id === 'earth' && earthUnlocked
              ? 'HOME IS CALLING'
              : p.simulationCountLabel,
        });

        if (p.id === 'earth') {
          // Subtle lunar orbit guide ring
          ctx.strokeStyle = 'rgba(148, 163, 184, 0.16)';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.ellipse(px, py, 38, 29, 0, 0, Math.PI * 2);
          ctx.stroke();

          // Slower & wider Moon orbit around Earth
          const moonAngle = tick * 0.0085;
          const mx = px + Math.cos(moonAngle) * 38;
          const my = py + Math.sin(moonAngle) * 29;

          const moonHasPending = MOON_MISSIONS.some((m) => !completed.includes(m));

          if (moonHasPending) {
            const mPulse = (tick % 65) / 65;
            ctx.strokeStyle = `rgba(56, 189, 248, ${0.9 - mPulse * 0.9})`;
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.arc(mx, my, 7 + mPulse * 9, 0, Math.PI * 2);
            ctx.stroke();
          }

          ctx.fillStyle = '#E2E8F0';
          ctx.beginPath();
          ctx.arc(mx, my, 5.5, 0, Math.PI * 2);
          ctx.fill();

          ctx.font = moonHasPending ? 'bold 10px monospace' : '10px monospace';
          ctx.fillStyle = moonHasPending ? '#38BDF8' : '#94A3B8';
          ctx.fillText('MOON', mx, my - 11);

          currentTargets.push({
            id: 'moon',
            planetSlug: 'moon',
            name: 'The Moon',
            x: mx,
            y: my,
            hitRadius: 18,
            hasPendingMission: moonHasPending,
            simulationCountLabel: 'LUNOKHOD 1 & SURVEYOR 3',
          });

          // "HOME IS CALLING" textbox anchored to Earth
          if (earthUnlocked) {
            const boxW = 128;
            const boxH = 24;
            const boxX = px + 18;
            const boxY = py - 38;

            // Leader line from Earth to textbox
            ctx.strokeStyle = 'rgba(52, 211, 153, 0.75)';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(px + 8, py - 8);
            ctx.lineTo(boxX, boxY + boxH / 2);
            ctx.stroke();

            // Textbox background & border
            ctx.fillStyle = 'rgba(2, 6, 23, 0.92)';
            ctx.fillRect(boxX, boxY, boxW, boxH);
            ctx.strokeStyle = '#34D399';
            ctx.lineWidth = 1.5;
            ctx.strokeRect(boxX, boxY, boxW, boxH);

            // Text label
            ctx.fillStyle = '#6EE7B7';
            ctx.font = 'bold 10px monospace';
            ctx.textAlign = 'center';
            ctx.fillText('HOME IS CALLING', boxX + boxW / 2, boxY + 15);
          }
        }
      }

      if (hoveredIdRef.current) {
        const active = currentTargets.find((t) => t.id === hoveredIdRef.current);
        if (active) {
          ctx.strokeStyle = active.planetSlug ? '#38BDF8' : '#F59E0B';
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
      setStatusBanner('DEEP SPACE VOID — CLICK ANY PLANET TO OPEN DOSSIER');
      return;
    }

    if (hit.planetSlug) {
      openPlanetDossier(hit.planetSlug, hit.name.toUpperCase());
    } else {
      playRandomSpaceBeep();
      setStatusBanner('SOLAR CORONA: 5,500 °C — SELECT AN ORBITING WORLD TO INSPECT');
    }
  };

  return (
    <div className="flex w-full flex-col items-center">
      {/* Mobile Scroll Hint */}
      <p className="mb-2 font-mono text-[11px] text-slate-400 md:hidden">
        {'← Swipe horizontally to pan across the Solar System →'}
      </p>

      {/* Monitor Frame Container */}
      <div className="relative w-full max-w-[960px] overflow-hidden rounded-2xl border-4 border-slate-700/90 bg-slate-950 shadow-[0_0_50px_rgba(2,6,23,0.95)]">
        {/* Scrollable Orrery Canvas */}
        <div
          ref={scrollContainerRef}
          className="w-full overflow-x-auto overscroll-x-contain"
        >
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
            className={`block shrink-0 ${hoveredTarget ? 'cursor-pointer' : 'cursor-crosshair'}`}
            style={{ width: `${CANVAS_W}px`, height: `${CANVAS_H}px` }}
          />
        </div>

        {/* Passthrough CRT Scanline & Curved Monitor Vignette Overlay */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-10"
          style={{
            backgroundImage:
              'repeating-linear-gradient(0deg, rgba(15, 23, 42, 0.22) 0px, rgba(15, 23, 42, 0.22) 1px, transparent 1px, transparent 3px), radial-gradient(circle at center, transparent 58%, rgba(2, 6, 23, 0.72) 100%)',
          }}
        />

        {/* Four-Corner Monitor HUD Readouts (Strict Passthrough) */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-10 flex flex-col justify-between p-3.5 font-mono text-[10px] tracking-widest text-emerald-400/75 sm:text-[11px]"
        >
          {/* Top Corners */}
          <div className="flex items-start justify-between">
            <div className="border-t-2 border-l-2 border-emerald-400/50 pt-1.5 pl-2">
              <p className="font-bold text-emerald-300/90">{'SYS.ORRERY // TELEMETRY FEED'}</p>
              <p className="text-[9px] text-slate-400">{'OPTICAL ARRAY: SOL-01 [LIVE]'}</p>
            </div>

            <div className="border-t-2 border-r-2 border-emerald-400/50 pt-1.5 pr-2 text-right">
              <p className="font-bold text-sky-300/90">{telemetryClock}</p>
              <p className="text-[9px] text-slate-400">{'FRAME: ECLIPTIC J2000'}</p>
            </div>
          </div>

          {/* Bottom Corners */}
          <div className="flex items-end justify-between">
            <div className="border-b-2 border-l-2 border-emerald-400/50 pb-1.5 pl-2">
              <p className="text-[9px] text-slate-400">
                {`ARCHIVES CLEARED: ${completedSlugs.length} / 7`}
              </p>
              <p className="font-bold text-emerald-300/85">
                {completedSlugs.length >= 4
                  ? 'EARTH UPLINK: HOME IS CALLING'
                  : completedSlugs.length > 0
                    ? 'PING: UNEXPLORED TARGETS'
                    : 'PING: ALL TARGETS'}
              </p>
            </div>

            <div className="border-r-2 border-b-2 border-emerald-400/50 pr-2 pb-1.5 text-right">
              <p className="text-[9px] text-slate-400">{'SIGNAL LINK: NOMINAL'}</p>
              <p className="font-bold text-amber-300/85">{'CRT-HUD v2.6'}</p>
            </div>
          </div>
        </div>

        {/* Hover Telemetry Tooltip */}
        {hoveredTarget && !openingDossier && (
          <div className="pointer-events-none absolute top-14 left-4 z-20 rounded-lg border border-slate-700 bg-slate-900/95 px-3 py-1.5 font-mono text-xs shadow-lg">
            <p className="font-bold text-white">{hoveredTarget.name.toUpperCase()}</p>
            {hoveredTarget.planetSlug ? (
              <p className="text-amber-400">
                {'▶ CLICK TO OPEN ARCHIVE'}
                {hoveredTarget.simulationCountLabel
                  ? ` • ${hoveredTarget.simulationCountLabel}`
                  : ''}
              </p>
            ) : (
              <p className="text-slate-400">{'G-TYPE MAIN-SEQUENCE STAR'}</p>
            )}
          </div>
        )}

        {/* Sun / Void Feedback Banner */}
        {statusBanner && !openingDossier && (
          <div className="pointer-events-none absolute bottom-12 left-1/2 z-20 w-[90%] max-w-md -translate-x-1/2 rounded-full border border-slate-700 bg-slate-900/95 px-4 py-1.5 text-center font-mono text-[11px] text-slate-300 shadow sm:text-xs">
            {statusBanner}
          </div>
        )}

        {/* Planet Dossier Transition Overlay */}
        {openingDossier && (
          <div className="absolute inset-0 z-30 flex items-center justify-center bg-slate-950/90 p-4 text-center">
            <p className="animate-pulse font-mono text-base font-bold tracking-widest text-amber-400 sm:text-lg">
              {`OPENING PLANETARY ARCHIVE: ${openingDossier}...`}
            </p>
          </div>
        )}
      </div>

      {/* Planetary Archive Quick-Select Bar */}
      <div className="mt-4 flex w-full max-w-[960px] flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-800 bg-slate-900/90 px-4 py-3 text-xs">
        <span className="font-mono text-slate-400">
          <strong className="text-amber-400">{'PLANET ARCHIVES:'}</strong>{' '}
          {'Click any world on the map or jump directly'}
        </span>
        <div className="grid w-full grid-cols-2 gap-2 sm:flex sm:w-auto sm:flex-wrap">
          <button
            onClick={() => openPlanetDossier('mercury', 'MERCURY')}
            className="rounded border border-slate-500/40 bg-slate-800 px-3 py-2 font-mono text-xs font-bold text-slate-200 transition hover:bg-slate-300 hover:text-slate-950 sm:py-1"
          >
            {'☿ MERCURY'}
          </button>
          <button
            onClick={() => openPlanetDossier('venus', 'VENUS')}
            className="rounded border border-yellow-400/40 bg-slate-800 px-3 py-2 font-mono text-xs font-bold text-yellow-200 transition hover:bg-yellow-300 hover:text-slate-950 sm:py-1"
          >
            {'♀ VENUS'}
          </button>
          {completedSlugs.length >= 4 && (
            <button
              onClick={() => openPlanetDossier('earth', 'EARTH')}
              className="rounded border border-emerald-400/50 bg-emerald-950/60 px-3 py-2 font-mono text-xs font-bold text-emerald-300 transition hover:bg-emerald-400 hover:text-slate-950 sm:py-1"
            >
              {'🌍 EARTH (HOME IS CALLING)'}
            </button>
          )}
          <button
            onClick={() => openPlanetDossier('moon', 'THE MOON')}
            className="rounded border border-sky-500/40 bg-slate-800 px-3 py-2 font-mono text-xs font-bold text-sky-300 transition hover:bg-sky-500 hover:text-slate-950 sm:py-1"
          >
            {'🌕 MOON'}
          </button>
          <button
            onClick={() => openPlanetDossier('mars', 'MARS')}
            className="rounded border border-orange-500/40 bg-slate-800 px-3 py-2 font-mono text-xs font-bold text-orange-300 transition hover:bg-orange-500 hover:text-slate-950 sm:py-1"
          >
            {'🔴 MARS'}
          </button>
          <button
            onClick={() => openPlanetDossier('jupiter', 'JUPITER')}
            className="rounded border border-amber-500/40 bg-slate-800 px-3 py-2 font-mono text-xs font-bold text-amber-300 transition hover:bg-amber-500 hover:text-slate-950 sm:py-1"
          >
            {'🟠 JUPITER'}
          </button>
          <button
            onClick={() => openPlanetDossier('saturn', 'SATURN (TITAN)')}
            className="rounded border border-yellow-500/40 bg-slate-800 px-3 py-2 font-mono text-xs font-bold text-yellow-300 transition hover:bg-yellow-500 hover:text-slate-950 sm:py-1"
          >
            {'🪐 SATURN / TITAN'}
          </button>
        </div>
      </div>
    </div>
  );
}
