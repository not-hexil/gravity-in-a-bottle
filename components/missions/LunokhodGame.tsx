'use client';

import React, { useEffect, useRef, useState } from 'react';
import { MissionModalData } from '@/lib/game';
import TelemetryUnlockOverlay from '@/components/ui/TelemetryUnlockOverlay';
import {
  playWaypointPing,
  playSonarSweep,
  playRoverDrivePulse,
  playProbeCollected,
  playCapabilityUnlockChime,
  playMissionCompleteFanfare,
  playCrashExplosion,
} from '@/lib/soundEffects';

interface LunokhodGameProps {
  isPaused: boolean;
  missionData: MissionModalData;
  onActionLabelChange: (label: string) => void;
  onComplete: () => void;
}

interface ProbeBeacon {
  id: number;
  x: number;
  y: number;
  collected: boolean;
  hidden: boolean;
}

interface Crater {
  id: number;
  x: number;
  y: number;
  r: number;
  rough: boolean;
}

const VIEW_W = 640;
const VIEW_H = 480;
const WORLD_W = 2200;
const WORLD_H = 1650;

function generateCraters(stage: number): Crater[] {
  const count = stage === 1 ? 16 : stage === 2 ? 24 : 30;
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: 240 + ((i * 397) % (WORLD_W - 420)),
    y: 180 + ((i * 283) % (WORLD_H - 360)),
    r: stage === 1 ? 38 + (i % 3) * 12 : 46 + (i % 4) * 14,
    rough: stage >= 2 && i % 2 === 0,
  }));
}

function generateProbes(stage: number, craters: Crater[]): ProbeBeacon[] {
  const count = stage === 1 ? 8 : stage === 2 ? 10 : 12;
  const probes: ProbeBeacon[] = [];

  for (let i = 0; i < count; i++) {
    let px = 260 + ((i * 463 + stage * 130) % (WORLD_W - 400));
    let py = 180 + ((i * 349 + stage * 90) % (WORLD_H - 320));

    for (const c of craters) {
      const dist = Math.hypot(px - c.x, py - c.y);
      if (dist < c.r + 36) {
        px = Math.min(WORLD_W - 120, c.x + c.r + 45);
      }
    }

    // Stage 2: all 10 hidden until sonar; Stage 3: 5 hidden subsurface beacons + 7 surface beacons
    const isHidden = stage === 2 ? true : stage === 3 ? i % 2 === 1 && i < 10 : false;

    probes.push({
      id: i + 1,
      x: px,
      y: py,
      collected: false,
      hidden: isHidden,
    });
  }
  return probes;
}

export default function LunokhodGame({
  isPaused,
  missionData,
  onActionLabelChange,
  onComplete,
}: LunokhodGameProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const completedRef = useRef(false);

  const [stage, setStage] = useState(1);
  const [unlockModalStage, setUnlockModalStage] = useState<number | null>(null);
  const [collectedCount, setCollectedCount] = useState(0);
  const [totalInStage, setTotalInStage] = useState(8);
  const [roughHits, setRoughHits] = useState(0);
  const [battery, setBattery] = useState(100);
  const [failReason, setFailReason] = useState<string | null>(null);
  const [completed, setCompleted] = useState(false);

  const initialCraters = generateCraters(1);
  const simRef = useRef({
    stage: 1,
    roverX: 120,
    roverY: WORLD_H / 2,
    angle: 0,
    targetX: null as number | null,
    targetY: null as number | null,
    tracks: [] as { x: number; y: number; angle: number }[],
    craters: initialCraters,
    probes: generateProbes(1, initialCraters),
    sonarWaveRadius: 0,
    sonarRevealTimer: 0,
    sonarRequested: false,
    activeRoughCraterId: null as number | null,
    roughCrossings: 0,
    battery: 100,
    keys: { up: false, down: false, left: false, right: false, space: false },
    tick: 0,
  });

  const setupStage = (nextStage: number) => {
    const craters = generateCraters(nextStage);
    const probes = generateProbes(nextStage, craters);

    simRef.current = {
      ...simRef.current,
      stage: nextStage,
      roverX: 120,
      roverY: WORLD_H / 2,
      angle: 0,
      targetX: null,
      targetY: null,
      tracks: [],
      craters,
      probes,
      sonarWaveRadius: 0,
      sonarRevealTimer: 0,
      sonarRequested: false,
      activeRoughCraterId: null,
      roughCrossings: 0,
      battery: 100,
    };

    setStage(nextStage);
    setCollectedCount(0);
    setTotalInStage(probes.length);
    setRoughHits(0);
    setBattery(100);
    setFailReason(null);

    if (nextStage === 1) onActionLabelChange('PING');
    if (nextStage === 2) onActionLabelChange('SONAR');
    if (nextStage === 3) onActionLabelChange('TURBO');
  };

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (isPaused || unlockModalStage !== null || failReason) return;
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
        e.preventDefault();
      }
      if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') simRef.current.keys.up = true;
      if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') simRef.current.keys.down = true;
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') simRef.current.keys.left = true;
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D')
        simRef.current.keys.right = true;

      // Dedicated Sonar keybind [E] or [Shift] (works in Stage 2 & Stage 3)
      if (e.key === 'e' || e.key === 'E' || e.key === 'Shift') {
        simRef.current.sonarRequested = true;
      }

      // [SPACE]: Sonar in Stage 1-2, Turbo in Stage 3
      if (e.key === ' ') {
        if (!simRef.current.keys.space && simRef.current.stage <= 2) {
          simRef.current.sonarRequested = true;
        }
        simRef.current.keys.space = true;
      }
    };

    const onKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') simRef.current.keys.up = false;
      if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') simRef.current.keys.down = false;
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') simRef.current.keys.left = false;
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D')
        simRef.current.keys.right = false;
      if (e.key === ' ') simRef.current.keys.space = false;
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

      if (!paused && !completedRef.current) {
        s.tick++;

        if (s.sonarRequested) {
          s.sonarRequested = false;
          if (s.stage >= 2) {
            s.sonarWaveRadius = 16;
            s.sonarRevealTimer = 360;
            playSonarSweep();
          } else {
            playWaypointPing();
          }
        }

        if (s.sonarWaveRadius > 0) {
          s.sonarWaveRadius += 8;
          if (s.sonarWaveRadius > 560) s.sonarWaveRadius = 0;
        }
        if (s.sonarRevealTimer > 0) s.sonarRevealTimer--;

        // Stage 3: ~2.8 minute battery window (100 / 0.0062 / 60fps ≈ 268s)
        if (s.stage === 3) {
          const drain = s.keys.space ? 0.01 : 0.0062;
          s.battery = Math.max(0, s.battery - drain);
          if (s.tick % 10 === 0) setBattery(Math.ceil(s.battery));
          if (s.battery <= 0) {
            playCrashExplosion();
            setFailReason(
              'Lunar nightfall drained the rover battery before reaching the final beacons. Use [E] Sonar and [SPACE] Turbo!'
            );
          }
        }

        // Stage 2 Rough Terrain Slowdown + 2-Hit Suspension Break
        let inRoughCrater: Crater | null = null;
        if (s.stage === 2) {
          for (const c of s.craters) {
            if (c.rough && Math.hypot(s.roverX - c.x, s.roverY - c.y) < c.r + 6) {
              inRoughCrater = c;
              break;
            }
          }

          if (inRoughCrater && s.activeRoughCraterId !== inRoughCrater.id) {
            s.activeRoughCraterId = inRoughCrater.id;
            s.roughCrossings += 1;
            setRoughHits(s.roughCrossings);
            playCrashExplosion();

            if (s.roughCrossings >= 2) {
              setFailReason(
                'SUSPENSION FRACTURED! Crossing two jagged boulder craters snapped the rover torsion bars.'
              );
            }
          } else if (!inRoughCrater) {
            s.activeRoughCraterId = null;
          }
        }

        const turboActive = s.stage === 3 && s.keys.space;
        const baseSpeed = turboActive ? 3.8 : inRoughCrater ? 1.05 : 2.35;

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
          s.roverX += (dx / len) * baseSpeed;
          s.roverY += (dy / len) * baseSpeed;
          s.angle = Math.atan2(dy, dx);
        } else if (s.targetX !== null && s.targetY !== null) {
          const tdx = s.targetX - s.roverX;
          const tdy = s.targetY - s.roverY;
          const dist = Math.hypot(tdx, tdy);
          if (dist > 4) {
            isMoving = true;
            s.roverX += (tdx / dist) * baseSpeed;
            s.roverY += (tdy / dist) * baseSpeed;
            s.angle = Math.atan2(tdy, tdx);
          } else {
            s.targetX = null;
            s.targetY = null;
          }
        }

        // Stage 3: Rough craters are completely uncrossable solid barriers
        if (s.stage === 3) {
          for (const c of s.craters) {
            if (!c.rough) continue;
            const dist = Math.hypot(s.roverX - c.x, s.roverY - c.y);
            const minDist = c.r + 18;
            if (dist < minDist && dist > 0) {
              const pushX = (s.roverX - c.x) / dist;
              const pushY = (s.roverY - c.y) / dist;
              s.roverX = c.x + pushX * minDist;
              s.roverY = c.y + pushY * minDist;
              s.targetX = null;
              s.targetY = null;
            }
          }
        }

        s.roverX = Math.max(30, Math.min(WORLD_W - 30, s.roverX));
        s.roverY = Math.max(30, Math.min(WORLD_H - 30, s.roverY));

        if (isMoving) {
          if (s.tick % 5 === 0) {
            s.tracks.push({ x: s.roverX, y: s.roverY, angle: s.angle });
            if (s.tracks.length > 140) s.tracks.shift();
          }
          if (s.tick % (turboActive ? 5 : 10) === 0) {
            playRoverDrivePulse();
          }
        }

        let newlyCollected = false;
        for (const p of s.probes) {
          if (!p.collected && Math.hypot(s.roverX - p.x, s.roverY - p.y) < 32) {
            p.collected = true;
            p.hidden = false;
            newlyCollected = true;
          }
        }

        if (newlyCollected) {
          const count = s.probes.filter((p) => p.collected).length;
          setCollectedCount(count);

          if (count === s.probes.length) {
            if (s.stage < 3) {
              playCapabilityUnlockChime();
              setUnlockModalStage(s.stage);
            } else if (!completedRef.current) {
              completedRef.current = true;
              playMissionCompleteFanfare();
              setCompleted(true);
              setTimeout(() => onComplete(), 1000);
            }
          } else {
            playProbeCollected(count);
          }
        }
      }

      const camX = Math.max(0, Math.min(WORLD_W - VIEW_W, s.roverX - VIEW_W / 2));
      const camY = Math.max(0, Math.min(WORLD_H - VIEW_H, s.roverY - VIEW_H / 2));

      ctx.save();
      ctx.translate(-camX, -camY);

      ctx.fillStyle =
        s.stage === 1 ? '#475569' : s.stage === 2 ? '#334155' : '#0F172A';
      ctx.fillRect(camX, camY, VIEW_W, VIEW_H);

      ctx.fillStyle = s.stage === 1 ? '#334155' : '#1E293B';
      const startGx = Math.floor(camX / 64) * 64;
      const startGy = Math.floor(camY / 64) * 64;
      for (let gx = startGx; gx < camX + VIEW_W + 64; gx += 64) {
        for (let gy = startGy; gy < camY + VIEW_H + 64; gy += 64) {
          ctx.fillRect(gx, gy, 3, 3);
        }
      }

      // Craters
      for (const c of s.craters) {
        if (
          c.x + c.r < camX ||
          c.x - c.r > camX + VIEW_W ||
          c.y + c.r < camY ||
          c.y - c.r > camY + VIEW_H
        ) {
          continue;
        }

        ctx.fillStyle = c.rough
          ? s.stage === 3
            ? '#020617'
            : '#1E293B'
          : '#334155';
        ctx.beginPath();
        ctx.arc(c.x, c.y, c.r, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = c.rough
          ? s.stage === 3
            ? '#EF4444'
            : '#F59E0B'
          : '#64748B';
        ctx.lineWidth = c.rough ? 2.5 : 1.5;
        ctx.beginPath();
        ctx.arc(c.x, c.y, c.r, 0, Math.PI * 2);
        ctx.stroke();

        if (c.rough) {
          ctx.fillStyle = s.stage === 3 ? '#FCA5A5' : '#FBBF24';
          ctx.font = 'bold 9px monospace';
          ctx.textAlign = 'center';
          ctx.fillText(s.stage === 3 ? 'IMPASSABLE' : 'ROUGH HAZARD', c.x, c.y + 3);
        }
      }

      // Tire Tracks
      for (let i = 0; i < s.tracks.length; i++) {
        const t = s.tracks[i];
        ctx.save();
        ctx.translate(t.x, t.y);
        ctx.rotate(t.angle);
        ctx.fillStyle = `rgba(15, 23, 42, ${(i / s.tracks.length) * 0.5})`;
        ctx.fillRect(-4, -12, 4, 4);
        ctx.fillRect(-4, 8, 4, 4);
        ctx.restore();
      }

      // Sonar Ring (Stages 2 & 3)
      if (s.sonarWaveRadius > 0) {
        ctx.strokeStyle = `rgba(56, 189, 248, ${Math.max(0, 1 - s.sonarWaveRadius / 560)})`;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(s.roverX, s.roverY, s.sonarWaveRadius, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Beacons
      for (const p of s.probes) {
        if (p.collected) continue;
        const distToRover = Math.hypot(s.roverX - p.x, s.roverY - p.y);
        const visible = !p.hidden || s.sonarRevealTimer > 0 || distToRover < 110;

        if (!visible) {
          ctx.fillStyle = 'rgba(56, 189, 248, 0.16)';
          ctx.beginPath();
          ctx.arc(p.x, p.y, 5, 0, Math.PI * 2);
          ctx.fill();
          continue;
        }

        const pulse = Math.sin(s.tick * 0.08 + p.id) * 4;
        ctx.strokeStyle = p.hidden ? 'rgba(56, 189, 248, 0.7)' : 'rgba(250, 204, 21, 0.6)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 16 + pulse, 0, Math.PI * 2);
        ctx.stroke();

        ctx.fillStyle = p.hidden ? '#38BDF8' : '#FACC15';
        ctx.beginPath();
        ctx.arc(p.x, p.y, 8, 0, Math.PI * 2);
        ctx.fill();
      }

      // Rover Vehicle
      ctx.save();
      ctx.translate(s.roverX, s.roverY);
      ctx.rotate(s.angle);

      if (s.stage === 3) {
        const beamGrad = ctx.createLinearGradient(14, 0, 195, 0);
        beamGrad.addColorStop(0, 'rgba(254, 240, 138, 0.35)');
        beamGrad.addColorStop(1, 'rgba(254, 240, 138, 0)');
        ctx.fillStyle = beamGrad;
        ctx.beginPath();
        ctx.moveTo(14, -6);
        ctx.lineTo(195, -55);
        ctx.lineTo(195, 55);
        ctx.lineTo(14, 6);
        ctx.closePath();
        ctx.fill();
      }

      ctx.fillStyle = '#020617';
      for (const wx of [-14, -5, 5, 14]) {
        ctx.fillRect(wx - 3, -16, 6, 4);
        ctx.fillRect(wx - 3, 12, 6, 4);
      }

      ctx.fillStyle = s.stage === 1 ? '#E2E8F0' : s.stage === 2 ? '#BAE6FD' : '#F8FAFC';
      ctx.beginPath();
      ctx.ellipse(0, 0, 18, 13, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#1E293B';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.fillStyle = s.stage >= 2 ? '#0284C7' : '#1D4ED8';
      ctx.fillRect(-14, -9, 14, 18);

      if (s.stage >= 2) {
        ctx.strokeStyle = '#38BDF8';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(16, 0);
        ctx.lineTo(26, 0);
        ctx.stroke();
      }

      if (s.stage === 3) {
        ctx.fillStyle = '#F43F5E';
        ctx.fillRect(8, -5, 6, 10);
      }

      ctx.restore();
      ctx.restore();

      // Mini-Radar HUD
      const mapW = 110;
      const mapH = 82;
      const mapX = VIEW_W - mapW - 10;
      const mapY = VIEW_H - mapH - 10;
      ctx.fillStyle = 'rgba(2, 6, 23, 0.82)';
      ctx.fillRect(mapX, mapY, mapW, mapH);
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 1;
      ctx.strokeRect(mapX, mapY, mapW, mapH);

      for (const p of s.probes) {
        if (p.collected) continue;
        // Hidden beacons only appear on mini-radar while Sonar is active
        if (p.hidden && s.sonarRevealTimer <= 0) continue;
        ctx.fillStyle = p.hidden ? '#38BDF8' : '#FACC15';
        ctx.fillRect(
          mapX + (p.x / WORLD_W) * mapW - 1.5,
          mapY + (p.y / WORLD_H) * mapH - 1.5,
          3,
          3
        );
      }
      ctx.fillStyle = '#10B981';
      ctx.beginPath();
      ctx.arc(
        mapX + (s.roverX / WORLD_W) * mapW,
        mapY + (s.roverY / WORLD_H) * mapH,
        3,
        0,
        Math.PI * 2
      );
      ctx.fill();

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [isPaused, unlockModalStage, failReason, onComplete]);

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isPaused || unlockModalStage !== null || failReason) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const s = simRef.current;
    const camX = Math.max(0, Math.min(WORLD_W - VIEW_W, s.roverX - VIEW_W / 2));
    const camY = Math.max(0, Math.min(WORLD_H - VIEW_H, s.roverY - VIEW_H / 2));

    s.targetX = camX + (e.clientX - rect.left) * scaleX;
    s.targetY = camY + (e.clientY - rect.top) * scaleY;
    playWaypointPing();
  };

  return (
    <div className="flex flex-col items-center">
      <div className="mb-3 flex w-full max-w-[640px] flex-wrap items-center justify-between gap-2 rounded-lg border border-slate-800 bg-slate-900 px-4 py-2.5 font-mono text-xs">
        <span className="font-bold text-sky-400">STAGE {stage} / 3</span>
        <span className="font-bold text-amber-400">
          BEACONS: {collectedCount} / {totalInStage}
        </span>
        {stage === 2 && (
          <span className={`font-bold ${roughHits > 0 ? 'text-rose-400' : 'text-slate-300'}`}>
            SUSPENSION HITS: {roughHits} / 2
          </span>
        )}
        {stage === 3 && (
          <>
            <span className="text-sky-300">[E] SONAR • [SPACE] TURBO</span>
            <span
              className={`font-bold ${
                battery < 30 ? 'animate-pulse text-rose-400' : 'text-emerald-400'
              }`}
            >
              BATTERY: {battery}%
            </span>
          </>
        )}
      </div>

      <div className="relative overflow-hidden rounded-xl border-4 border-slate-700 bg-slate-950 shadow-2xl">
        <canvas
          ref={canvasRef}
          width={VIEW_W}
          height={VIEW_H}
          onClick={handleCanvasClick}
          className="block max-w-full cursor-crosshair"
        />

        {failReason && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-rose-950/88 p-6 text-center backdrop-blur-xs">
            <h2 className="font-mono text-xl font-bold text-rose-300">ROVER DISABLED</h2>
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
            unlockedCapabilityName="Regolith Penetrometer & Sonar Pulse [SPACE / E]"
            unlockedCapabilityDesc="Dusk settles over jagged crater rims. Rough craters slow the rover—crossing 2 will snap your suspension! Press [SPACE] or [E] to reveal 10 buried beacons."
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
            unlockedCapabilityName="High-Beam Spotlight & Solar Overdrive [HOLD SPACE]"
            unlockedCapabilityDesc="Lunar night has fallen! Rough craters are now solid walls, and 5 beacons are buried subsurface—use [E] / [SHIFT] for Sonar and hold [SPACE] for Turbo."
            onContinue={() => {
              setUnlockModalStage(null);
              setupStage(3);
            }}
          />
        )}

        {completed && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-emerald-950/85 p-6 text-center backdrop-blur-xs">
            <p className="animate-pulse font-mono text-lg font-bold tracking-wider text-emerald-300">
              ALL 3 LUNAR EXPEDITIONS COMPLETE!
            </p>
            <p className="mt-1 font-mono text-xs text-emerald-100">
              Compiling full Lunokhod 1 mission dossier...
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
