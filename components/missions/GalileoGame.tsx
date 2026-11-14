'use client';

import React, { useEffect, useRef, useState } from 'react';
import { MissionModalData } from '@/types/game';
import TelemetryUnlockOverlay from '@/components/ui/TelemetryUnlockOverlay';
import {
  playTelemetryDataTick,
  playMagneticShieldPulse,
  playLightningZap,
  playWaypointPing,
  playCapabilityUnlockChime,
  playMissionCompleteFanfare,
  playCrashExplosion,
  playThrusterBurst,
} from '@/utils/soundEffects';

interface GalileoGameProps {
  isPaused: boolean;
  missionData: MissionModalData;
  onActionLabelChange: (label: string) => void;
  onComplete: () => void;
}

type FreqBand = 0 | 1 | 2; // 0 = Cyan, 1 = Amber, 2 = Emerald

interface SampleRing {
  id: number;
  x: number;
  y: number;
  label: string;
  collected: boolean;
}

interface CoolPocket {
  x: number;
  y: number;
  radius: number;
}

interface LightningBolt {
  x: number;
  warningTimer: number; // counts down from 90 frames (1.5s) -> strikes at 0
  strikeTimer: number;
}

const CANVAS_W = 640;
const CANVAS_H = 480;

const BAND_META: { name: string; stroke: string; fill: string; text: string }[] = [
  {
    name: 'CH-A (CYAN)',
    stroke: '#38BDF8',
    fill: 'rgba(56, 189, 248, 0.24)',
    text: 'text-sky-400',
  },
  {
    name: 'CH-B (AMBER)',
    stroke: '#FACC15',
    fill: 'rgba(250, 204, 21, 0.24)',
    text: 'text-amber-300',
  },
  {
    name: 'CH-C (EMERALD)',
    stroke: '#34D399',
    fill: 'rgba(52, 211, 153, 0.24)',
    text: 'text-emerald-400',
  },
];

const SAMPLE_LABELS = ['He-4', 'Ne-20', 'H2O', 'CH4', 'NH3', 'Ar-36'];

function createSampleRings(): SampleRing[] {
  return Array.from({ length: 4 }, (_, i) => ({
    id: i,
    x: 110 + ((i * 145) % (CANVAS_W - 220)),
    y: 340 + i * 110,
    label: SAMPLE_LABELS[i % SAMPLE_LABELS.length],
    collected: false,
  }));
}

function createCoolPockets(): CoolPocket[] {
  return Array.from({ length: 3 }, (_, i) => ({
    x: 130 + i * 190,
    y: 300 + i * 150,
    radius: 34,
  }));
}

export default function GalileoGame({
  isPaused,
  missionData,
  onActionLabelChange,
  onComplete,
}: GalileoGameProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const completedRef = useRef(false);

  const [stage, setStage] = useState(1);
  const [unlockModalStage, setUnlockModalStage] = useState<number | null>(null);
  const [telemetry, setTelemetry] = useState(0);
  const [heat, setHeat] = useState(20);
  const [pressureBar, setPressureBar] = useState(1.0);
  const [probeBand, setProbeBand] = useState<FreqBand>(0);
  const [beamBand, setBeamBand] = useState<FreqBand>(0);
  const [failReason, setFailReason] = useState<string | null>(null);
  const [completed, setCompleted] = useState(false);

  const simRef = useRef({
    stage: 1,
    probeX: CANVAS_W / 2,
    probeY: 205,
    vx: 0,
    beamX: CANVAS_W / 2,
    beamTargetX: CANVAS_W / 2 + 110,
    beamWidth: 128,
    beamBand: 0 as FreqBand,
    probeBand: 0 as FreqBand,
    tuneRequested: false,
    telemetry: 0,
    heat: 20,
    pressureBar: 1.0,
    stunTimer: 0,
    shieldJettisoned: false,
    rings: createSampleRings(),
    coolPockets: createCoolPockets(),
    bolts: [] as LightningBolt[],
    keys: { left: false, right: false },
    pointerX: null as number | null,
    tick: 0,
  });

  const setupStage = (nextStage: number) => {
    const startTelemetry = nextStage === 1 ? 0 : nextStage === 2 ? 33 : 67;
    simRef.current = {
      ...simRef.current,
      stage: nextStage,
      telemetry: startTelemetry,
      beamWidth: nextStage === 1 ? 128 : nextStage === 2 ? 112 : 98,
      heat: 25,
      stunTimer: 0,
      shieldJettisoned: nextStage >= 2,
      rings: createSampleRings(),
      coolPockets: createCoolPockets(),
      bolts: [],
    };
    setStage(nextStage);
    setTelemetry(startTelemetry);
    setHeat(25);
    setFailReason(null);
    onActionLabelChange('TUNE');
  };

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (isPaused || unlockModalStage !== null || failReason) return;
      if (['ArrowLeft', 'ArrowRight', ' '].includes(e.key)) e.preventDefault();
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        simRef.current.keys.left = true;
      }
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        simRef.current.keys.right = true;
      }
      if (e.key === ' ') {
        simRef.current.tuneRequested = true;
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

        // Handle Frequency Band Cycling ([SPACE] / TUNE)
        if (s.tuneRequested) {
          s.tuneRequested = false;
          s.probeBand = ((s.probeBand + 1) % 3) as FreqBand;
          setProbeBand(s.probeBand);
          playMagneticShieldPulse();
        }

        // Orbiter switches relay frequency channel every 9 seconds (540 frames)
        if (s.tick % 540 === 0) {
          s.beamBand = ((s.beamBand + 1) % 3) as FreqBand;
          setBeamBand(s.beamBand);
          playWaypointPing();
        }

        // Orbiter Beam Horizontal Drift
        const beamSpeed = s.stage === 1 ? 0.85 : s.stage === 2 ? 1.15 : 1.4;
        if (Math.abs(s.beamX - s.beamTargetX) < 6) {
          s.beamTargetX = 95 + Math.random() * (CANVAS_W - 190);
        }
        s.beamX += Math.sign(s.beamTargetX - s.beamX) * beamSpeed;

        // Stage 3: Alternating Zonal Jet Streams
        const jetStreamWind =
          s.stage === 3 ? Math.sin(s.tick * 0.015) * 0.26 : 0;

        if (s.stunTimer > 0) {
          s.stunTimer--;
        } else {
          if (s.keys.left) s.vx -= 0.56;
          if (s.keys.right) s.vx += 0.56;
          if ((s.keys.left || s.keys.right) && s.tick % 7 === 0) {
            playThrusterBurst();
          }

          if (s.pointerX !== null) {
            const diff = s.pointerX - s.probeX;
            s.vx += Math.max(-0.75, Math.min(0.75, diff * 0.08));
          }
        }

        s.vx = (s.vx + jetStreamWind) * 0.88;
        s.probeX += s.vx;
        s.probeX = Math.max(32, Math.min(CANVAS_W - 32, s.probeX));

        // Thermal Stress & Cooler Downdraft Pockets
        let inCoolPocket = false;
        for (const cp of s.coolPockets) {
          cp.y -= 1.6;
          if (cp.y < -40) {
            cp.y = CANVAS_H + 40;
            cp.x = 70 + Math.random() * (CANVAS_W - 140);
          }
          if (Math.hypot(s.probeX - cp.x, s.probeY - cp.y) < cp.radius + 16) {
            inCoolPocket = true;
          }
        }

        if (inCoolPocket) {
          s.heat = Math.max(5, s.heat - 0.35);
        } else {
          const heatGain = s.stage === 1 ? 0.045 : s.stage === 2 ? 0.035 : 0.05;
          s.heat = Math.min(100, s.heat + heatGain);
        }

        if (s.heat >= 100) {
          playCrashExplosion();
          setFailReason(
            'THERMAL OVERLOAD! Steer into cyan Cooler Downdraft Pockets to vent atmospheric entry heat.'
          );
        }

        // Atmospheric Sample Rings (+2.5% data burst when collected inside beam)
        const inBeam = Math.abs(s.probeX - s.beamX) <= s.beamWidth / 2;
        for (const ring of s.rings) {
          ring.y -= 1.75;
          if (ring.y < -30) {
            ring.y = CANVAS_H + 40;
            ring.x = 80 + Math.random() * (CANVAS_W - 160);
            ring.collected = false;
          }
          if (
            !ring.collected &&
            Math.hypot(s.probeX - ring.x, s.probeY - ring.y) < 30
          ) {
            ring.collected = true;
            s.telemetry = Math.min(100, s.telemetry + (inBeam ? 2.5 : 1.0));
            playWaypointPing();
          }
        }

        // Telegraphed Super-Bolt Lightning Arcs (Stages 2 & 3)
        if (s.stage >= 2 && s.tick % (s.stage === 2 ? 170 : 120) === 0) {
          s.bolts.push({
            x: 60 + Math.random() * (CANVAS_W - 120),
            warningTimer: 90,
            strikeTimer: 16,
          });
        }

        const activeBolts: LightningBolt[] = [];
        for (const b of s.bolts) {
          if (b.warningTimer > 0) {
            b.warningTimer--;
            activeBolts.push(b);
          } else if (b.strikeTimer > 0) {
            b.strikeTimer--;
            if (
              b.strikeTimer === 14 &&
              s.stunTimer === 0 &&
              Math.abs(s.probeX - b.x) < 26
            ) {
              playLightningZap();
              s.stunTimer = 30;
              s.heat = Math.min(100, s.heat + 16);
              s.vx = s.probeX < b.x ? -6 : 6;
            }
            activeBolts.push(b);
          }
        }
        s.bolts = activeBolts;

        // Telemetry Upload (~2 minutes per stage = ~6 minutes total)
        // Base rate = 0.0022/frame (~0.132%/sec); Frequency Match = 3x rate (~0.40%/sec -> ~85s + sample rings)
        if (inBeam && s.stunTimer === 0) {
          const freqMatched = s.probeBand === s.beamBand;
          const stageBoost = s.stage === 3 ? 1.25 : 1.0;
          const rate = (freqMatched ? 0.0055 : 0.0018) * stageBoost;
          s.telemetry = Math.min(100, s.telemetry + rate);

          if (s.tick % (freqMatched ? 14 : 28) === 0) {
            playTelemetryDataTick(s.telemetry);
          }
        }

        // Bar Pressure rises from 1.0 bar -> 22.0 bar across the 100% plunge
        s.pressureBar = Number((1 + (s.telemetry / 100) * 21).toFixed(1));

        if (s.tick % 5 === 0) {
          setTelemetry(Math.floor(s.telemetry));
          setHeat(Math.round(s.heat));
          setPressureBar(s.pressureBar);
        }

        // Stage Checkpoints at 33% and 67%
        if (s.stage === 1 && s.telemetry >= 33) {
          s.telemetry = 33;
          setTelemetry(33);
          playCapabilityUnlockChime();
          setUnlockModalStage(1);
        } else if (s.stage === 2 && s.telemetry >= 67) {
          s.telemetry = 67;
          setTelemetry(67);
          playCapabilityUnlockChime();
          setUnlockModalStage(2);
        } else if (s.telemetry >= 100 && !completedRef.current) {
          completedRef.current = true;
          playMissionCompleteFanfare();
          setTelemetry(100);
          setCompleted(true);
          setTimeout(() => onComplete(), 1000);
        }
      }

      // Stage-Specific Jovian Cloud Deck Atmosphere
      const bandColors =
        s.stage === 1
          ? ['#9A3412', '#EA580C', '#FDBA74', '#C2410C', '#FDE68A', '#B45309']
          : s.stage === 2
            ? ['#431407', '#7C2D12', '#B45309', '#1E3A8A', '#9A3412', '#78350F']
            : ['#090D16', '#1E1B4B', '#31102F', '#431407', '#1E293B', '#0F172A'];
      const bandHeight = 80;
      const scrollOffset = (s.tick * 1.8) % (bandColors.length * bandHeight);

      for (let i = -1; i <= Math.ceil(CANVAS_H / bandHeight) + 1; i++) {
        const y = i * bandHeight - (scrollOffset % bandHeight);
        const colorIdx =
          (Math.floor(scrollOffset / bandHeight) + i + bandColors.length) % bandColors.length;
        ctx.fillStyle = bandColors[colorIdx];
        ctx.fillRect(0, y, CANVAS_W, bandHeight + 1);
      }

      // Orbiter Relay Beam (Color-Coded to Active Frequency Band)
      const activeBandMeta = BAND_META[s.beamBand];
      const freqMatched = s.probeBand === s.beamBand;
      ctx.fillStyle = activeBandMeta.fill;
      ctx.fillRect(s.beamX - s.beamWidth / 2, 0, s.beamWidth, CANVAS_H);

      ctx.strokeStyle = activeBandMeta.stroke;
      ctx.lineWidth = freqMatched ? 3 : 1.5;
      ctx.setLineDash([8, 6]);
      ctx.beginPath();
      ctx.moveTo(s.beamX - s.beamWidth / 2, 0);
      ctx.lineTo(s.beamX - s.beamWidth / 2, CANVAS_H);
      ctx.moveTo(s.beamX + s.beamWidth / 2, 0);
      ctx.lineTo(s.beamX + s.beamWidth / 2, CANVAS_H);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = 'rgba(2, 6, 23, 0.85)';
      ctx.fillRect(s.beamX - 46, 6, 92, 16);
      ctx.fillStyle = activeBandMeta.stroke;
      ctx.font = 'bold 9px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(activeBandMeta.name, s.beamX, 17);

      // Cooler Downdraft Pockets
      for (const cp of s.coolPockets) {
        ctx.fillStyle = 'rgba(56, 189, 248, 0.22)';
        ctx.beginPath();
        ctx.arc(cp.x, cp.y, cp.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#7DD3FC';
        ctx.lineWidth = 1.5;
        ctx.stroke();
        ctx.fillStyle = '#E0F2FE';
        ctx.font = 'bold 9px monospace';
        ctx.fillText('COOL VENT', cp.x, cp.y + 3);
      }

      // Atmospheric Sample Rings
      for (const ring of s.rings) {
        if (ring.collected) continue;
        ctx.strokeStyle = '#FACC15';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(ring.x, ring.y, 14, 0, Math.PI * 2);
        ctx.stroke();
        ctx.fillStyle = '#FEF08A';
        ctx.font = 'bold 9px monospace';
        ctx.fillText(ring.label, ring.x, ring.y + 3);
      }

      // Telegraphed Super-Bolt Lightning Arcs
      for (const b of s.bolts) {
        if (b.warningTimer > 0) {
          ctx.strokeStyle =
            b.warningTimer % 10 < 5
              ? 'rgba(244, 63, 94, 0.7)'
              : 'rgba(250, 204, 21, 0.4)';
          ctx.lineWidth = 2;
          ctx.setLineDash([6, 6]);
          ctx.beginPath();
          ctx.moveTo(b.x, 0);
          ctx.lineTo(b.x, CANVAS_H);
          ctx.stroke();
          ctx.setLineDash([]);
        } else {
          ctx.strokeStyle = '#FDE047';
          ctx.lineWidth = 5;
          ctx.beginPath();
          ctx.moveTo(b.x, 0);
          ctx.lineTo(b.x - 12, CANVAS_H * 0.35);
          ctx.lineTo(b.x + 14, CANVAS_H * 0.65);
          ctx.lineTo(b.x, CANVAS_H);
          ctx.stroke();
        }
      }

      // Galileo Probe Vehicle (Stage 1: Conical Aeroshell -> Stage 2+: Jettisoned Gold Spectrometer)
      const px = s.probeX + Math.sin(s.tick * 0.15) * 2.5;
      const py = s.probeY;
      const probeBandMeta = BAND_META[s.probeBand];

      // Parachute Canopy
      ctx.strokeStyle = '#E2E8F0';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(px - 10, py - 8);
      ctx.lineTo(px - 24, py - 44);
      ctx.moveTo(px + 10, py - 8);
      ctx.lineTo(px + 24, py - 44);
      ctx.stroke();

      ctx.fillStyle = '#F8FAFC';
      ctx.beginPath();
      ctx.arc(px, py - 44, 24, Math.PI, 0);
      ctx.fill();

      if (!s.shieldJettisoned) {
        // Stage 1: Carbon-Phenolic Conical Heat Shield + Bow Shock
        ctx.fillStyle = '#CBD5E1';
        ctx.beginPath();
        ctx.moveTo(px - 20, py - 6);
        ctx.lineTo(px + 20, py - 6);
        ctx.lineTo(px + 12, py + 12);
        ctx.lineTo(px - 12, py + 12);
        ctx.closePath();
        ctx.fill();
      } else {
        // Stage 2+: Exposed Gold-Foiled Mass Spectrometer & Nephelometer Boom
        ctx.fillStyle = '#F59E0B';
        ctx.fillRect(px - 14, py - 8, 28, 16);
        ctx.strokeStyle = '#FEF08A';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(px - 14, py - 8, 28, 16);

        ctx.strokeStyle = '#38BDF8';
        ctx.beginPath();
        ctx.moveTo(px - 22, py + 2);
        ctx.lineTo(px + 22, py + 2);
        ctx.stroke();
      }

      // Transponder Frequency Indicator Ring around Probe
      ctx.strokeStyle = probeBandMeta.stroke;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(px, py, 20, 0, Math.PI * 2);
      ctx.stroke();

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [isPaused, unlockModalStage, failReason, onComplete]);

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (isPaused || unlockModalStage !== null || failReason) return;
    if (e.buttons === 0 && e.pointerType === 'mouse') return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    simRef.current.pointerX = (e.clientX - rect.left) * scaleX;
  };

  return (
    <div className="flex flex-col items-center">
      {/* Interactive Telemetry HUD */}
      <div className="mb-3 grid w-full max-w-[640px] grid-cols-4 gap-2 rounded-lg border border-slate-800 bg-slate-900 p-3 font-mono text-xs">
        <div>
          <span className="block text-[10px] text-slate-400">STAGE / DEPTH</span>
          <span className="text-sm font-bold text-sky-400">
            {stage}/3 • {pressureBar} bar
          </span>
        </div>
        <div>
          <span className="block text-[10px] text-slate-400">TRANSPONDER [SPACE]</span>
          <span className={`text-sm font-bold ${BAND_META[probeBand].text}`}>
            {BAND_META[probeBand].name.split(' ')[0]}
            {probeBand === beamBand ? ' ★3X' : ''}
          </span>
        </div>
        <div>
          <span className="block text-[10px] text-slate-400">SHIELD HEAT</span>
          <span
            className={`text-sm font-bold ${
              heat >= 75 ? 'animate-pulse text-rose-400' : 'text-emerald-400'
            }`}
          >
            {heat}%
          </span>
        </div>
        <div>
          <span className="block text-[10px] text-slate-400">DATA UPLOAD</span>
          <span className="text-sm font-bold text-amber-400">{telemetry}%</span>
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

        {failReason && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-rose-950/88 p-6 text-center backdrop-blur-xs">
            <h2 className="font-mono text-xl font-bold text-rose-300">PROBE SIGNAL LOST</h2>
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
            unlockedCapabilityName="Pyrotechnic Heat Shield Jettison"
            unlockedCapabilityDesc="Charred aeroshell jettisoned! Golden mass spectrometer instruments are now exposed. Watch out for telegraphed Super-Bolt lightning arcs in the water-cloud layer."
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
            unlockedCapabilityName="High-Gain 22-Bar Deep Spectrometer (+25% Upload)"
            unlockedCapabilityDesc="Entering Jupiter’s crushing 22-bar abyss! Violent zonal jet streams now shear horizontally—match transponder colors and grab sample rings to hit 100%."
            onContinue={() => {
              setUnlockModalStage(null);
              setupStage(3);
            }}
          />
        )}

        {completed && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-emerald-950/85 p-6 text-center backdrop-blur-xs">
            <p className="animate-pulse font-mono text-lg font-bold tracking-wider text-emerald-300">
              100% JOVIAN PLUNGE TELEMETRY UPLOADED!
            </p>
            <p className="mt-1 font-mono text-xs text-emerald-100">
              Opening full Galileo mission dossier...
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
