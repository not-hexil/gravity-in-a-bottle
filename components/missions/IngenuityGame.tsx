'use client';

import React, { useEffect, useRef, useState } from 'react';
import { MissionModalData } from '@/types/game';
import TelemetryUnlockOverlay from '@/components/ui/TelemetryUnlockOverlay';
import {
  playRotorPulse,
  playWaypointScanChime,
  playRockBump,
  playCrashExplosion,
  playCapabilityUnlockChime,
  playMissionCompleteFanfare,
} from '@/utils/soundEffects';

interface IngenuityGameProps {
  isPaused: boolean;
  missionData: MissionModalData;
  onActionLabelChange: (label: string) => void;
  onComplete: () => void;
}

interface Waypoint {
  id: number;
  x: number;
  y: number;
  scanned: boolean;
}

interface RockObstacle {
  x: number;
  width: number;
  height: number;
  fromCeiling?: boolean;
}

interface DustDevil {
  x: number;
  vx: number;
  width: number;
}

const VIEW_W = 640;
const VIEW_H = 480;
const GROUND_Y = 415;
const MAX_HULL = 150;
const HIT_DAMAGE = 8;

function getStageLength(stage: number): number {
  return stage === 1 ? 2600 : stage === 2 ? 3200 : 3800;
}

function generateObstacles(stage: number, worldW: number): RockObstacle[] {
  const obstacles: RockObstacle[] = [];
  const step = stage === 1 ? 290 : stage === 2 ? 245 : 215;

  for (let x = 280; x < worldW - 260; x += step) {
    const idx = Math.floor(x / step);
    obstacles.push({
      x,
      width: 34 + (idx % 3) * 6,
      height: stage === 1 ? 90 + (idx % 3) * 22 : 112 + (idx % 4) * 24,
      fromCeiling: false,
    });

    if (stage >= 2 && idx % 2 === 1) {
      obstacles.push({
        x: x + 110,
        width: 32,
        height: 88 + (idx % 3) * 20,
        fromCeiling: true,
      });
    }
  }
  return obstacles;
}

function generateWaypoints(stage: number, worldW: number): Waypoint[] {
  const count = stage === 1 ? 7 : stage === 2 ? 8 : 9;
  const usableW = worldW - 440;
  return Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    x: 260 + Math.round((i / (count - 1)) * usableW),
    y: 150 + ((i * 67 + stage * 40) % 140),
    scanned: false,
  }));
}

export default function IngenuityGame({
  isPaused,
  missionData,
  onActionLabelChange,
  onComplete,
}: IngenuityGameProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const completedRef = useRef(false);

  const [stage, setStage] = useState(1);
  const [unlockModalStage, setUnlockModalStage] = useState<number | null>(null);
  const [scannedCount, setScannedCount] = useState(0);
  const [totalWaypoints, setTotalWaypoints] = useState(7);
  const [hullPct, setHullPct] = useState(100);
  const [windLabel, setWindLabel] = useState('CALM');
  const [failReason, setFailReason] = useState<string | null>(null);
  const [completed, setCompleted] = useState(false);

  const initWorldW = getStageLength(1);
  const simRef = useRef({
    stage: 1,
    worldW: initWorldW,
    x: 80,
    y: GROUND_Y - 14,
    vx: 0,
    vy: 0,
    hull: MAX_HULL,
    rotorAngle: 0,
    windX: 0,
    windY: 0,
    obstacles: generateObstacles(1, initWorldW),
    waypoints: generateWaypoints(1, initWorldW),
    dustDevils: [] as DustDevil[],
    keys: { up: false, left: false, right: false },
    pointerThrust: false,
    tick: 0,
    lastHitTick: -50,
  });

  const setupStage = (nextStage: number) => {
    const worldW = getStageLength(nextStage);
    const wps = generateWaypoints(nextStage, worldW);

    simRef.current = {
      ...simRef.current,
      stage: nextStage,
      worldW,
      x: 80,
      y: GROUND_Y - 14,
      vx: 0,
      vy: 0,
      hull: MAX_HULL,
      windX: 0,
      windY: 0,
      obstacles: generateObstacles(nextStage, worldW),
      waypoints: wps,
      dustDevils:
        nextStage === 3
          ? Array.from({ length: 6 }, (_, i) => ({
              x: 480 + i * 520,
              vx: i % 2 === 0 ? 1.0 : -1.0,
              width: 26,
            }))
          : [],
      lastHitTick: -50,
    };

    setStage(nextStage);
    setScannedCount(0);
    setTotalWaypoints(wps.length);
    setHullPct(100);
    setFailReason(null);
    onActionLabelChange(nextStage === 1 ? 'LIFT' : 'SURGE');
  };

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (isPaused || unlockModalStage !== null || failReason) return;
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
  }, [isPaused, unlockModalStage, failReason]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;

    const loop = () => {
      const s = simRef.current;
      const paused = isPaused || unlockModalStage !== null || failReason !== null;
      const thrusting = !paused && (s.keys.up || s.pointerThrust);

      if (!paused && !completedRef.current) {
        s.tick++;

        if (s.tick % 240 === 1) {
          const strength = s.stage === 1 ? 0.03 : s.stage === 2 ? 0.055 : 0.075;
          const dirs = [
            { wx: -strength, wy: 0, label: '◀ HEADWIND' },
            { wx: strength, wy: 0, label: 'TAILWIND ▶' },
            { wx: -strength * 0.7, wy: 0.025, label: '↙ DOWNDRAFT' },
            { wx: strength * 0.7, wy: -0.02, label: '↗ UPDRAFT' },
          ];
          const chosen = dirs[Math.floor(Math.random() * dirs.length)];
          s.windX = chosen.wx;
          s.windY = chosen.wy;
          setWindLabel(chosen.label);
        }

        if (thrusting && s.tick % 5 === 0) {
          playRotorPulse(s.stage >= 2);
        }

        const marsGravity = 0.14;
        const liftPower = s.stage >= 2 ? -0.34 : -0.29;
        const airborne = s.y < GROUND_Y - 15;

        s.vy += marsGravity + (thrusting ? liftPower : 0) + (airborne ? s.windY : 0);
        s.vy *= 0.94;

        const horizAccel = s.stage >= 2 ? 0.24 : 0.2;
        if (s.keys.left) s.vx -= horizAccel;
        if (s.keys.right) s.vx += horizAccel;
        if (airborne) s.vx += s.windX;
        s.vx *= 0.91;

        s.x += s.vx;
        s.y += s.vy;

        s.rotorAngle += thrusting || airborne ? (s.stage >= 2 ? 0.85 : 0.65) : 0.08;

        s.x = Math.max(30, Math.min(s.worldW - 30, s.x));
        if (s.y < 24) {
          s.y = 24;
          s.vy = 0;
        }

        for (const dd of s.dustDevils) {
          dd.x += dd.vx;
          if (Math.abs(s.x - dd.x) < dd.width && s.y > GROUND_Y - 150) {
            s.vy -= 0.22;
            s.vx += dd.vx * 0.45;
          }
        }

        // Gentle Pillar & Stalactite Collisions (-8 HP out of 150 HP)
        for (const ob of s.obstacles) {
          const halfW = ob.width / 2 + 12;
          const hitFloorPillar = !ob.fromCeiling && s.y > GROUND_Y - ob.height - 12;
          const hitCeilingRock = Boolean(ob.fromCeiling) && s.y < ob.height + 12;

          if (Math.abs(s.x - ob.x) < halfW && (hitFloorPillar || hitCeilingRock)) {
            s.vx = s.x < ob.x ? -2.4 : 2.4;
            s.vy = hitCeilingRock ? 1.8 : -1.6;

            if (s.tick - s.lastHitTick > 50) {
              s.lastHitTick = s.tick;
              s.hull = Math.max(0, s.hull - HIT_DAMAGE);
              setHullPct(Math.round((s.hull / MAX_HULL) * 100));
              playRockBump();

              if (s.hull <= 0) {
                playCrashExplosion();
                setFailReason(
                  'CARBON ROTOR BLADES SHATTERED! Too many collisions with basalt spires damaged the airframe.'
                );
              }
            }
          }
        }

        const helipadX = s.worldW - 95;
        const padY = s.stage === 3 ? GROUND_Y - 48 : GROUND_Y;
        const onTargetPad = Math.abs(s.x - helipadX) < 44;

        if (s.stage === 3 && onTargetPad && s.y >= padY - 14 && s.y <= padY + 10 && s.vy >= 0) {
          s.y = padY - 14;
          s.vy = 0;
          s.vx *= 0.75;
        } else if (s.y >= GROUND_Y - 14) {
          s.y = GROUND_Y - 14;
          s.vy = 0;
          s.vx *= 0.75;
        }

        const landedOnPad =
          onTargetPad && Math.abs(s.y - (padY - 14)) < 4 && Math.abs(s.vy) < 0.5;
        const allScanned = s.waypoints.every((w) => w.scanned);

        if (landedOnPad && allScanned && !completedRef.current) {
          if (s.stage < 3) {
            playCapabilityUnlockChime();
            setUnlockModalStage(s.stage);
          } else {
            completedRef.current = true;
            playMissionCompleteFanfare();
            setCompleted(true);
            setTimeout(() => onComplete(), 1000);
          }
        }

        let updated = false;
        for (const wp of s.waypoints) {
          if (!wp.scanned && Math.hypot(s.x - wp.x, s.y - wp.y) < 34) {
            wp.scanned = true;
            updated = true;
          }
        }

        if (updated) {
          const count = s.waypoints.filter((w) => w.scanned).length;
          playWaypointScanChime(count);
          setScannedCount(count);
        }
      }

      const camX = Math.max(0, Math.min(s.worldW - VIEW_W, s.x - 180));

      const skyGrad = ctx.createLinearGradient(0, 0, 0, GROUND_Y);
      if (s.stage === 1) {
        skyGrad.addColorStop(0, '#78350F');
        skyGrad.addColorStop(0.6, '#C2410C');
        skyGrad.addColorStop(1, '#FDBA74');
      } else if (s.stage === 2) {
        skyGrad.addColorStop(0, '#451A03');
        skyGrad.addColorStop(0.55, '#9A3412');
        skyGrad.addColorStop(1, '#EA580C');
      } else {
        skyGrad.addColorStop(0, '#1E1B4B');
        skyGrad.addColorStop(0.55, '#7C2D12');
        skyGrad.addColorStop(1, '#C2410C');
      }
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, VIEW_W, VIEW_H);

      ctx.strokeStyle = 'rgba(254, 243, 199, 0.18)';
      ctx.lineWidth = 1;
      for (let i = 0; i < 12; i++) {
        const wx = (((i * 97 + s.tick * (s.windX * 55)) % VIEW_W) + VIEW_W) % VIEW_W;
        const wy = 45 + i * 28;
        ctx.beginPath();
        ctx.moveTo(wx, wy);
        ctx.lineTo(wx + 24, wy + s.windY * 140);
        ctx.stroke();
      }

      ctx.save();
      ctx.translate(-camX, 0);

      for (const ob of s.obstacles) {
        if (ob.x + ob.width < camX || ob.x - ob.width > camX + VIEW_W) continue;
        ctx.fillStyle = '#431407';
        ctx.beginPath();
        if (ob.fromCeiling) {
          ctx.moveTo(ob.x - ob.width / 2, 0);
          ctx.lineTo(ob.x - ob.width / 4, ob.height);
          ctx.lineTo(ob.x + ob.width / 4, ob.height);
          ctx.lineTo(ob.x + ob.width / 2, 0);
        } else {
          ctx.moveTo(ob.x - ob.width / 2, GROUND_Y);
          ctx.lineTo(ob.x - ob.width / 4, GROUND_Y - ob.height);
          ctx.lineTo(ob.x + ob.width / 4, GROUND_Y - ob.height);
          ctx.lineTo(ob.x + ob.width / 2, GROUND_Y);
        }
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = '#EA580C';
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }

      for (const dd of s.dustDevils) {
        ctx.fillStyle = 'rgba(253, 186, 116, 0.25)';
        ctx.beginPath();
        ctx.moveTo(dd.x - 8, GROUND_Y);
        ctx.lineTo(dd.x - 24, GROUND_Y - 140);
        ctx.lineTo(dd.x + 24, GROUND_Y - 140);
        ctx.lineTo(dd.x + 8, GROUND_Y);
        ctx.closePath();
        ctx.fill();

        ctx.strokeStyle = '#38BDF8';
        ctx.setLineDash([4, 4]);
        ctx.strokeRect(dd.x - 24, GROUND_Y - 140, 48, 140);
        ctx.setLineDash([]);
      }

      ctx.fillStyle = '#B45309';
      ctx.fillRect(camX, GROUND_Y, VIEW_W, VIEW_H - GROUND_Y);

      const helipadX = s.worldW - 95;
      const padY = s.stage === 3 ? GROUND_Y - 48 : GROUND_Y;
      if (s.stage === 3) {
        ctx.fillStyle = '#78350F';
        ctx.fillRect(helipadX - 42, padY, 84, 48);
      }
      const allScanned = s.waypoints.every((w) => w.scanned);
      ctx.fillStyle = allScanned ? '#10B981' : '#FACC15';
      ctx.fillRect(helipadX - 42, padY - 3, 84, 7);
      ctx.fillStyle = allScanned ? '#6EE7B7' : '#FDE047';
      ctx.font = 'bold 9px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('HELIPAD', helipadX, padY + 18);

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

        ctx.fillStyle = '#F8FAFC';
        ctx.font = 'bold 10px monospace';
        ctx.fillText(`SCAN ${wp.id}`, wp.x, wp.y + 3);
      }

      ctx.save();
      ctx.translate(s.x, s.y);
      ctx.rotate(s.vx * 0.06);

      if (s.stage === 3) {
        const spot = ctx.createLinearGradient(10, 0, 140, 25);
        spot.addColorStop(0, 'rgba(254, 240, 138, 0.35)');
        spot.addColorStop(1, 'rgba(254, 240, 138, 0)');
        ctx.fillStyle = spot;
        ctx.beginPath();
        ctx.moveTo(10, 0);
        ctx.lineTo(140, -25);
        ctx.lineTo(140, 45);
        ctx.closePath();
        ctx.fill();
      }

      ctx.strokeStyle = '#E2E8F0';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(-6, 4);
      ctx.lineTo(-14, 14);
      ctx.moveTo(6, 4);
      ctx.lineTo(14, 14);
      ctx.stroke();

      ctx.fillStyle = s.stage === 3 ? '#38BDF8' : '#F59E0B';
      ctx.fillRect(-9, -4, 18, 10);
      ctx.fillStyle = '#CBD5E1';
      ctx.fillRect(-2, -16, 4, 12);
      ctx.fillStyle = '#1D4ED8';
      ctx.fillRect(-11, -18, 22, 3);

      const bladeSpan1 = Math.cos(s.rotorAngle) * 32;
      const bladeSpan2 = Math.sin(s.rotorAngle * 1.1) * 32;
      ctx.strokeStyle = s.stage >= 2 ? '#38BDF8' : '#F8FAFC';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(-bladeSpan1, -13);
      ctx.lineTo(bladeSpan1, -13);
      ctx.moveTo(-bladeSpan2, -9);
      ctx.lineTo(bladeSpan2, -9);
      ctx.stroke();

      ctx.restore();
      ctx.restore();

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [isPaused, unlockModalStage, failReason, onComplete]);

  return (
    <div className="flex flex-col items-center">
      <div className="mb-3 grid w-full max-w-[640px] grid-cols-4 gap-2 rounded-lg border border-slate-800 bg-slate-900 p-3 font-mono text-xs">
        <div>
          <span className="block text-[10px] text-slate-400">STAGE</span>
          <span className="text-sm font-bold text-sky-400">{stage} / 3</span>
        </div>
        <div>
          <span className="block text-[10px] text-slate-400">SCANS</span>
          <span className="text-sm font-bold text-amber-400">
            {scannedCount} / {totalWaypoints}
          </span>
        </div>
        <div>
          <span className="block text-[10px] text-slate-400">AIRFRAME</span>
          <span
            className={`text-sm font-bold ${
              hullPct <= 25 ? 'animate-pulse text-rose-400' : 'text-emerald-400'
            }`}
          >
            {hullPct}%
          </span>
        </div>
        <div>
          <span className="block text-[10px] text-slate-400">MARS WIND</span>
          <span className="text-sm font-bold text-orange-300">{windLabel}</span>
        </div>
      </div>

      <div className="relative overflow-hidden rounded-xl border-4 border-slate-700 bg-slate-950 shadow-2xl">
        <canvas
          ref={canvasRef}
          width={VIEW_W}
          height={VIEW_H}
          onPointerDown={() => {
            if (!isPaused && unlockModalStage === null && !failReason) {
              simRef.current.pointerThrust = true;
            }
          }}
          onPointerUp={() => (simRef.current.pointerThrust = false)}
          onPointerLeave={() => (simRef.current.pointerThrust = false)}
          className="block max-w-full cursor-pointer touch-none"
        />

        {failReason && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-rose-950/88 p-6 text-center backdrop-blur-xs">
            <h2 className="font-mono text-xl font-bold text-rose-300">AIRFRAME DAMAGED</h2>
            <p className="mt-2 max-w-sm text-xs text-rose-100">{failReason}</p>
            <button
              onClick={() => setupStage(stage)}
              className="mt-5 rounded-lg bg-white px-5 py-2 font-mono text-xs font-bold text-slate-950 transition hover:bg-amber-300"
            >
              RESTART STAGE {stage}
            </button>
          </div>
        )}

        {unlockModalStage === 1 && (
          <TelemetryUnlockOverlay
            isOpen
            stageCompleted={1}
            totalStages={3}
            unlockedParagraphs={missionData.paragraphs.slice(0, 1)}
            imageUrl={missionData.imageUrl}
            imageCaption={missionData.imageCaption}
            unlockedCapabilityName="2,537 RPM Carbon Rotor Surge"
            unlockedCapabilityDesc="Airframe reinforced and rotor pitch upgraded! Beware of hanging canyon stalactites and shifting Martian crosswinds in Séítah Dunes."
            onContinue={() => {
              setUnlockModalStage(null);
              setupStage(2);
            }}
          />
        )}

        {unlockModalStage === 2 && (
          <TelemetryUnlockOverlay
            isOpen
            stageCompleted={2}
            totalStages={3}
            unlockedParagraphs={missionData.paragraphs.slice(0, 2)}
            imageUrl={missionData.imageUrl}
            imageCaption={missionData.imageCaption}
            unlockedCapabilityName="Autonomous Nav-Cam Hazard Radar & Searchlight"
            unlockedCapabilityDesc="Twilight falls on Jezero River Delta! Nav-Cam radar highlights swirling dust devils in cyan boxes. Scan all 9 canyon waypoints and land on the elevated Mesa Helipad."
            onContinue={() => {
              setUnlockModalStage(null);
              setupStage(3);
            }}
          />
        )}

        {completed && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-emerald-950/85 p-6 text-center backdrop-blur-xs">
            <p className="animate-pulse font-mono text-lg font-bold tracking-wider text-emerald-300">
              ALL 3 JEZERO FLIGHT CAMPAIGNS COMPLETE!
            </p>
            <p className="mt-1 font-mono text-xs text-emerald-100">
              Loading full Ingenuity mission dossier...
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
