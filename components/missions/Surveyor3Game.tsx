'use client';

import React, { useEffect, useRef, useState } from 'react';
import { MissionModalData } from '@/types/game';
import {
  playProbeCollected,
  playRockBump,
  playRoverDrivePulse,
  playCapabilityUnlockChime,
  playMissionCompleteFanfare,
} from '@/utils/soundEffects';

interface Surveyor3GameProps {
  isPaused: boolean;
  missionData: MissionModalData;
  onActionLabelChange: (label: string) => void;
  onComplete: () => void;
}

interface SampleTarget {
  id: number;
  x: number;
  y: number;
  radius: number;
  completed: boolean;
  label: string;
}

interface BasaltHazard {
  x: number;
  y: number;
  rx: number;
  ry: number;
  rot: number;
}

const STAGE_TITLES = [
  'STAGE 1: REGOLITH TRENCH EXCAVATION (1967)',
  'STAGE 2: BEARING STRENGTH & CLOD CRUSH TEST',
  'STAGE 3: APOLLO 12 RENDEZVOUS CALIBRATION (1969)',
];

const STAGE_TARGETS = [4, 5, 5];

function generateStageEntities(stageNum: number): {
  targets: SampleTarget[];
  hazards: BasaltHazard[];
} {
  const baseX = 320;
  const baseY = 420;
  const count = STAGE_TARGETS[stageNum - 1] ?? 4;

  const targets: SampleTarget[] = [];
  for (let i = 0; i < count; i++) {
    const frac = count === 1 ? 0.5 : i / (count - 1);
    const angle = -Math.PI * 0.82 + frac * (Math.PI * 0.64);
    const dist = 120 + ((i * 53 + stageNum * 37) % 135);
    targets.push({
      id: i + 1,
      x: baseX + Math.cos(angle) * dist,
      y: baseY + Math.sin(angle) * dist,
      radius: stageNum === 3 ? 22 : 25,
      completed: false,
      label: stageNum === 3 ? `OPT-${i + 1}` : `TRENCH-${i + 1}`,
    });
  }

  const hazards: BasaltHazard[] = [];
  const hazardCount = stageNum === 1 ? 4 : stageNum === 2 ? 6 : 7;
  for (let i = 0; i < hazardCount; i++) {
    const angle = -Math.PI * 0.85 + ((i + 0.5) / hazardCount) * (Math.PI * 0.7);
    const dist = 105 + ((i * 79 + stageNum * 41) % 155);
    const hx = baseX + Math.cos(angle) * dist;
    const hy = baseY + Math.sin(angle) * dist;

    const tooClose = targets.some((t) => Math.hypot(t.x - hx, t.y - hy) < 48);
    if (!tooClose) {
      hazards.push({
        x: hx,
        y: hy,
        rx: 18 + (i % 3) * 5,
        ry: 13 + ((i + 1) % 3) * 4,
        rot: (i * 0.7) % Math.PI,
      });
    }
  }

  return { targets, hazards };
}

export default function Surveyor3Game({
  isPaused,
  onActionLabelChange,
  onComplete,
}: Surveyor3GameProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [stage, setStage] = useState(1);
  const [samplesDone, setSamplesDone] = useState(0);
  const [armStrain, setArmStrain] = useState(0);
  const [statusBanner, setStatusBanner] = useState<string | null>(null);

  const stateRef = useRef<{
    stage: number;
    armAngle: number;
    armLength: number;
    clawAnim: number;
    armStrain: number;
    samplesDone: number;
    targets: SampleTarget[];
    hazards: BasaltHazard[];
    dustParticles: { x: number; y: number; vx: number; vy: number; life: number }[];
    keys: Record<string, boolean>;
    stageTransitioning: boolean;
    completedAll: boolean;
    time: number;
  }>({
    stage: 1,
    armAngle: -Math.PI / 2,
    armLength: 145,
    clawAnim: 0,
    armStrain: 0,
    samplesDone: 0,
    targets: [],
    hazards: [],
    dustParticles: [],
    keys: {},
    stageTransitioning: false,
    completedAll: false,
    time: 0,
  });

  const resetStageEntities = (stageNum: number) => {
    const { targets, hazards } = generateStageEntities(stageNum);
    stateRef.current.targets = targets;
    stateRef.current.hazards = hazards;
    stateRef.current.samplesDone = 0;
    stateRef.current.armStrain = 0;
    stateRef.current.stageTransitioning = false;
    setSamplesDone(0);
    setArmStrain(0);
  };

  useEffect(() => {
    const { targets, hazards } = generateStageEntities(1);
    stateRef.current.targets = targets;
    stateRef.current.hazards = hazards;
    onActionLabelChange('SCOOP');
  }, [onActionLabelChange]);

  const triggerScoopAction = () => {
    const s = stateRef.current;
    if (s.stageTransitioning || s.completedAll) return;

    s.clawAnim = 1;
    const baseX = 320;
    const baseY = 420;
    const clawX = baseX + Math.cos(s.armAngle) * s.armLength;
    const clawY = baseY + Math.sin(s.armAngle) * s.armLength;

    for (let i = 0; i < 14; i++) {
      const a = Math.random() * Math.PI * 2;
      const spd = 25 + Math.random() * 65;
      s.dustParticles.push({
        x: clawX,
        y: clawY,
        vx: Math.cos(a) * spd,
        vy: Math.sin(a) * spd - 20,
        life: 1,
      });
    }

    const hitTarget = s.targets.find(
      (t) => !t.completed && Math.hypot(t.x - clawX, t.y - clawY) <= t.radius + 10
    );

    if (hitTarget) {
      hitTarget.completed = true;
      s.samplesDone += 1;
      setSamplesDone(s.samplesDone);
      playProbeCollected(s.samplesDone);
      setStatusBanner(
        s.stage === 3
          ? `OPTICAL MARKER ${hitTarget.label} LOCKED FOR APOLLO 12`
          : `REGOLITH SAMPLE ${hitTarget.label} ACQUIRED`
      );

      const needed = s.targets.length;
      if (s.samplesDone >= needed) {
        s.stageTransitioning = true;
        if (s.stage < 3) {
          const nextStage = s.stage + 1;
          playCapabilityUnlockChime();
          setStatusBanner(`STAGE ${s.stage} COMPLETE — ADVANCING TO STAGE ${nextStage}`);
          window.setTimeout(() => {
            s.stage = nextStage;
            setStage(nextStage);
            onActionLabelChange(nextStage === 3 ? 'PING' : 'SCOOP');
            resetStageEntities(nextStage);
            setStatusBanner(null);
          }, 1200);
        } else {
          s.completedAll = true;
          playMissionCompleteFanfare();
          setStatusBanner('APOLLO 12 RENDEZVOUS TELEMETRY COMPLETE!');
          window.setTimeout(() => {
            onComplete();
          }, 900);
        }
      }
      return;
    }

    const hitHazard = s.hazards.some(
      (h) => Math.hypot(h.x - clawX, h.y - clawY) <= Math.max(h.rx, h.ry) + 8
    );

    if (hitHazard) {
      playRockBump();
      s.armStrain = Math.min(100, s.armStrain + 35);
      setArmStrain(s.armStrain);
      setStatusBanner('WARNING: BASALT BEDROCK IMPACT — ACTUATOR STRAIN!');
      if (s.armStrain >= 100) {
        setStatusBanner('ACTUATOR OVERLOAD — RECALIBRATING STAGE');
        s.stageTransitioning = true;
        window.setTimeout(() => {
          resetStageEntities(s.stage);
          setStatusBanner(null);
        }, 1000);
      }
    } else {
      playRoverDrivePulse();
      setStatusBanner('EMPTY REGOLITH — ALIGN CLAW WITH AMBER TARGET RING');
    }
  };

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      stateRef.current.keys[e.key.toLowerCase()] = true;
      if (e.key === ' ' && !isPaused) {
        e.preventDefault();
        triggerScoopAction();
      }
    };

    const onKeyUp = (e: KeyboardEvent) => {
      stateRef.current.keys[e.key.toLowerCase()] = false;
    };

    const onMobileAction = () => {
      if (!isPaused) triggerScoopAction();
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    window.addEventListener('mobile-dpad-action', onMobileAction);

    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('mobile-dpad-action', onMobileAction);
    };
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let lastTime = performance.now();

    const render = (now: number) => {
      const dt = Math.min(0.05, (now - lastTime) / 1000);
      lastTime = now;

      const s = stateRef.current;

      if (!isPaused) {
        s.time += dt;
        const rotSpeed = 1.45;
        const extSpeed = 140;

        if (s.keys['arrowleft'] || s.keys['a']) {
          s.armAngle = Math.max(-Math.PI * 0.88, s.armAngle - rotSpeed * dt);
        }
        if (s.keys['arrowright'] || s.keys['d']) {
          s.armAngle = Math.min(-Math.PI * 0.12, s.armAngle + rotSpeed * dt);
        }
        if (s.keys['arrowup'] || s.keys['w']) {
          s.armLength = Math.min(265, s.armLength + extSpeed * dt);
        }
        if (s.keys['arrowdown'] || s.keys['s']) {
          s.armLength = Math.max(75, s.armLength - extSpeed * dt);
        }

        if (s.clawAnim > 0) {
          s.clawAnim = Math.max(0, s.clawAnim - dt * 3.5);
        }

        if (s.armStrain > 0 && !s.stageTransitioning) {
          s.armStrain = Math.max(0, s.armStrain - dt * 4);
          setArmStrain(Math.round(s.armStrain));
        }

        for (let i = s.dustParticles.length - 1; i >= 0; i--) {
          const p = s.dustParticles[i];
          p.x += p.vx * dt;
          p.y += p.vy * dt;
          p.vy += 45 * dt;
          p.life -= dt * 1.4;
          if (p.life <= 0) s.dustParticles.splice(i, 1);
        }
      }

      ctx.fillStyle = '#020617';
      ctx.fillRect(0, 0, 640, 480);

      ctx.fillStyle = '#cbd5e1';
      for (let i = 0; i < 36; i++) {
        const sx = (i * 173) % 640;
        const sy = (i * 89) % 130;
        ctx.fillRect(sx, sy, i % 3 === 0 ? 2 : 1, i % 3 === 0 ? 2 : 1);
      }

      ctx.fillStyle = '#1e293b';
      ctx.beginPath();
      ctx.moveTo(0, 125);
      ctx.quadraticCurveTo(180, 95, 340, 122);
      ctx.quadraticCurveTo(500, 145, 640, 112);
      ctx.lineTo(640, 480);
      ctx.lineTo(0, 480);
      ctx.closePath();
      ctx.fill();

      if (s.stage === 3) {
        const lmX = 520;
        const lmY = 114;
        ctx.save();
        ctx.translate(lmX, lmY);
        ctx.fillStyle = '#f59e0b';
        ctx.fillRect(-14, -14, 28, 12);
        ctx.fillStyle = '#cbd5e1';
        ctx.beginPath();
        ctx.arc(0, -19, 9, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#fbbf24';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(-12, -4);
        ctx.lineTo(-20, 6);
        ctx.moveTo(12, -4);
        ctx.lineTo(20, 6);
        ctx.stroke();

        ctx.fillStyle = '#38bdf8';
        ctx.font = 'bold 10px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('APOLLO 12 LM', 0, -34);
        ctx.restore();
      }

      ctx.fillStyle = '#334155';
      ctx.beginPath();
      ctx.moveTo(0, 150);
      ctx.quadraticCurveTo(320, 132, 640, 152);
      ctx.lineTo(640, 480);
      ctx.lineTo(0, 480);
      ctx.closePath();
      ctx.fill();

      const baseX = 320;
      const baseY = 420;
      ctx.strokeStyle = 'rgba(148, 163, 184, 0.16)';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.arc(baseX, baseY, 265, -Math.PI * 0.88, -Math.PI * 0.12);
      ctx.stroke();
      ctx.setLineDash([]);

      for (const h of s.hazards) {
        ctx.save();
        ctx.translate(h.x, h.y);
        ctx.rotate(h.rot);
        ctx.fillStyle = '#0f172a';
        ctx.strokeStyle = '#475569';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.ellipse(0, 0, h.rx, h.ry, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.restore();
      }

      for (const t of s.targets) {
        ctx.save();
        if (t.completed) {
          ctx.fillStyle = '#0f172a';
          ctx.strokeStyle = '#10b981';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.ellipse(t.x, t.y, t.radius * 0.85, t.radius * 0.45, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();

          ctx.fillStyle = '#34d399';
          ctx.font = 'bold 10px monospace';
          ctx.textAlign = 'center';
          ctx.fillText('✓ DONE', t.x, t.y - 14);
        } else {
          const pulse = 1 + Math.sin(s.time * 4 + t.id) * 0.1;
          ctx.strokeStyle = s.stage === 3 ? '#38bdf8' : '#fbbf24';
          ctx.fillStyle =
            s.stage === 3 ? 'rgba(56, 189, 248, 0.16)' : 'rgba(251, 191, 36, 0.16)';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(t.x, t.y, t.radius * pulse, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();

          ctx.fillStyle = s.stage === 3 ? '#7dd3fc' : '#fde68a';
          ctx.font = 'bold 10px monospace';
          ctx.textAlign = 'center';
          ctx.fillText(t.label, t.x, t.y - t.radius - 6);
        }
        ctx.restore();
      }

      ctx.save();
      ctx.translate(baseX, baseY);
      ctx.strokeStyle = '#e2e8f0';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(-24, 0);
      ctx.lineTo(-48, 34);
      ctx.moveTo(24, 0);
      ctx.lineTo(48, 34);
      ctx.moveTo(0, 4);
      ctx.lineTo(0, 38);
      ctx.stroke();

      ctx.fillStyle = '#f59e0b';
      ctx.fillRect(-56, 32, 16, 6);
      ctx.fillRect(40, 32, 16, 6);
      ctx.fillRect(-8, 36, 16, 6);

      ctx.fillStyle = '#cbd5e1';
      ctx.fillRect(-26, -16, 52, 20);
      ctx.fillStyle = '#0284c7';
      ctx.fillRect(-18, -42, 36, 14);
      ctx.restore();

      const clawX = baseX + Math.cos(s.armAngle) * s.armLength;
      const clawY = baseY + Math.sin(s.armAngle) * s.armLength;
      const midX = (baseX + clawX) / 2 - Math.sin(s.armAngle) * 18;
      const midY = (baseY + clawY) / 2 + Math.cos(s.armAngle) * 18;
      const midX2 = (baseX + clawX) / 2 + Math.sin(s.armAngle) * 18;
      const midY2 = (baseY + clawY) / 2 - Math.cos(s.armAngle) * 18;

      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(baseX, baseY - 8);
      ctx.lineTo(midX, midY);
      ctx.lineTo(clawX, clawY);
      ctx.moveTo(baseX, baseY - 8);
      ctx.lineTo(midX2, midY2);
      ctx.lineTo(clawX, clawY);
      ctx.stroke();

      ctx.save();
      ctx.translate(clawX, clawY);
      const scale = 1 + s.clawAnim * 0.35;
      ctx.scale(scale, scale);
      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(0, 0, 12, 0, Math.PI * 2);
      ctx.stroke();

      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.arc(0, 0, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      for (const p of s.dustParticles) {
        ctx.fillStyle = `rgba(203, 213, 225, ${Math.max(0, p.life)})`;
        ctx.fillRect(p.x - 2, p.y - 2, 4, 4);
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [isPaused]);

  const targetCount = STAGE_TARGETS[stage - 1] ?? 4;

  return (
    <div className="w-full overflow-hidden rounded-xl border-2 border-slate-800 bg-slate-900 shadow-2xl">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 bg-slate-950 px-4 py-2.5 font-mono text-xs">
        <span className="font-bold text-amber-400">{STAGE_TITLES[stage - 1]}</span>
        <div className="flex items-center gap-4">
          <span className="text-emerald-400">
            {`SAMPLES: ${samplesDone} / ${targetCount}`}
          </span>
          <span className={armStrain > 65 ? 'font-bold text-rose-400' : 'text-sky-300'}>
            {`STRAIN: ${armStrain}%`}
          </span>
        </div>
      </div>

      <div className="relative">
        <canvas
          ref={canvasRef}
          width={640}
          height={480}
          className="block h-auto w-full bg-slate-950"
        />

        {statusBanner && (
          <div className="pointer-events-none absolute inset-x-0 bottom-3 flex justify-center px-3">
            <span className="rounded-lg border border-amber-500/40 bg-slate-950/90 px-3 py-1 font-mono text-[11px] font-bold text-amber-300 shadow-lg">
              {statusBanner}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
