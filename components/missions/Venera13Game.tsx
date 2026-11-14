'use client';

import React, { useEffect, useRef, useState } from 'react';
import { MissionModalData } from '@/lib/game';
import {
  playThrusterBurst,
  playParachuteDeploy,
  playAtmosphereBuffet,
  playProbeCollected,
  playCapabilityUnlockChime,
  playMissionCompleteFanfare,
  playCrashExplosion,
} from '@/lib/soundEffects';

interface Venera13GameProps {
  isPaused: boolean;
  missionData: MissionModalData;
  onActionLabelChange: (label: string) => void;
  onComplete: () => void;
}

const STAGE_TITLES = [
  'STAGE 1: SPRING-LOADED REGOLITH CORE DRILL',
  'STAGE 2: 92-BAR PYROTECHNIC AIRLOCK TRANSFER',
  'STAGE 3: X-RAY FLUORESCENCE BASALT SPECTROMETER',
];

interface SpectralTarget {
  element: string;
  targetFreq: number; // 15..85
  targetAmp: number; // 25..85
  locked: boolean;
}

export default function Venera13Game({
  isPaused,
  onActionLabelChange,
  onComplete,
}: Venera13GameProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [stage, setStage] = useState(1);
  const [hullTemp, setHullTemp] = useState(15); // 0..100% of 465°C thermal limit
  const [stageProgress, setStageProgress] = useState(0);
  const [statusBanner, setStatusBanner] = useState<string | null>(null);

  const stateRef = useRef({
    stage: 1,
    hullTemp: 15,
    time: 0,
    keys: {} as Record<string, boolean>,
    stageTransitioning: false,
    completedAll: false,

    // Stage 1: Soil Core Drill
    drillAngle: 0, // -0.65 .. +0.65 rad
    targetPocketAngle: 0.24,
    drillTorque: 45, // 0..100 (optimal 45..72)
    drillDepth: 0, // 0..100%
    bitHeat: 0, // 0..100%
    isDrillingPulse: 0,

    // Stage 2: 92-Bar Pyrotechnic Airlock Transfer
    pressurePhase: 0,
    pressureNeedle: 50, // 0..100
    airlockTransfers: 0, // 0..3
    airlockFlash: 0,

    // Stage 3: X-Ray Fluorescence Spectrometer
    tuningFreq: 50, // 10..90
    tuningAmp: 50, // 15..90
    currentPeakIdx: 0,
    peaks: [
      { element: 'SILICON (SiO₂)', targetFreq: 28, targetAmp: 74, locked: false },
      { element: 'IRON OXIDE (FeO)', targetFreq: 56, targetAmp: 62, locked: false },
      { element: 'POTASSIUM (K₂O)', targetFreq: 77, targetAmp: 80, locked: false },
    ] as SpectralTarget[],

    sparks: [] as { x: number; y: number; vx: number; vy: number; life: number; color: string }[],
  });

  const initStage = (stageNum: number) => {
    const s = stateRef.current;
    s.stage = stageNum;
    s.stageTransitioning = false;
    s.sparks = [];

    if (stageNum === 1) {
      s.hullTemp = 15;
      s.drillAngle = -0.32;
      s.targetPocketAngle = 0.26;
      s.drillTorque = 55;
      s.drillDepth = 0;
      s.bitHeat = 0;
      s.isDrillingPulse = 0;
      setStageProgress(0);
    } else if (stageNum === 2) {
      s.pressurePhase = 0;
      s.pressureNeedle = 20;
      s.airlockTransfers = 0;
      s.airlockFlash = 0;
      setStageProgress(0);
    } else {
      s.tuningFreq = 45;
      s.tuningAmp = 45;
      s.currentPeakIdx = 0;
      s.peaks = [
        { element: 'SILICON (SiO₂)', targetFreq: 26, targetAmp: 72, locked: false },
        { element: 'IRON OXIDE (FeO)', targetFreq: 54, targetAmp: 64, locked: false },
        { element: 'POTASSIUM (K₂O)', targetFreq: 78, targetAmp: 82, locked: false },
      ];
      setStageProgress(0);
    }

    setStage(stageNum);
    setHullTemp(Math.round(s.hullTemp));
  };

  useEffect(() => {
    const timer = window.setTimeout(() => {
      initStage(1);
      onActionLabelChange('DRILL');
    }, 0);
    return () => window.clearTimeout(timer);
  }, [onActionLabelChange]);

  const spawnBurst = (x: number, y: number, color: string, count = 12) => {
    const s = stateRef.current;
    for (let i = 0; i < count; i++) {
      const a = Math.random() * Math.PI * 2;
      const spd = 30 + Math.random() * 85;
      s.sparks.push({
        x,
        y,
        vx: Math.cos(a) * spd,
        vy: Math.sin(a) * spd - 20,
        life: 1,
        color,
      });
    }
  };

  const triggerAction = () => {
    const s = stateRef.current;
    if (s.stageTransitioning || s.completedAll) return;

    // ---------------------------------------------------------------------
    // STAGE 1: SOIL CORE DRILL
    // ---------------------------------------------------------------------
    if (s.stage === 1) {
      s.isDrillingPulse = 1;
      const angleDiff = Math.abs(s.drillAngle - s.targetPocketAngle);
      const tipX = 320 + Math.sin(s.drillAngle) * 145;
      const tipY = 230 + Math.cos(s.drillAngle) * 145;

      if (angleDiff > 0.13) {
        playAtmosphereBuffet();
        s.bitHeat = Math.min(100, s.bitHeat + 24);
        spawnBurst(tipX, tipY, '#f87171', 10);
        setStatusBanner('SOLID BASALT SLAB — AIM DRILL INTO GLOWING SOIL POCKET!');
        return;
      }

      if (s.drillTorque < 40 || s.drillTorque > 76) {
        playAtmosphereBuffet();
        s.bitHeat = Math.min(100, s.bitHeat + 20);
        spawnBurst(tipX, tipY, '#facc15', 8);
        setStatusBanner(
          s.drillTorque < 40
            ? 'TORQUE TOO LOW — PRESS [↑ / W] INTO GREEN RPM ZONE!'
            : 'TORQUE TOO HIGH — PRESS [↓ / S] BEFORE BIT SEIZES!'
        );
        return;
      }

      // Good core drill bite!
      playProbeCollected(Math.ceil(s.drillDepth / 25) + 1);
      s.drillDepth = Math.min(100, s.drillDepth + 20);
      s.bitHeat = Math.min(100, s.bitHeat + 8);
      setStageProgress(Math.round(s.drillDepth));
      spawnBurst(tipX, tipY, '#34d399', 14);

      if (s.drillDepth < 100) {
        // Shift pocket slightly for next core bite
        s.targetPocketAngle =
          s.targetPocketAngle > 0
            ? -0.22 - Math.random() * 0.25
            : 0.2 + Math.random() * 0.28;
        setStatusBanner(
          `CORE BORE AT ${Math.round(s.drillDepth)}% — REALIGN WITH NEXT REGOLITH POCKET!`
        );
      } else {
        s.stageTransitioning = true;
        playCapabilityUnlockChime();
        setStatusBanner('BASALT SAMPLE EXTRACTED — PREPARING 92-BAR AIRLOCK TRANSFER!');
        window.setTimeout(() => {
          onActionLabelChange('SEAL');
          initStage(2);
          setStatusBanner(null);
        }, 1250);
      }
      return;
    }

    // ---------------------------------------------------------------------
    // STAGE 2: 92-BAR PYROTECHNIC AIRLOCK TRANSFER
    // ---------------------------------------------------------------------
    if (s.stage === 2) {
      s.airlockFlash = 1;
      // Optimal seal window is 40..60
      const inSealZone = s.pressureNeedle >= 40 && s.pressureNeedle <= 60;

      if (inSealZone) {
        s.airlockTransfers += 1;
        const pct = Math.round((s.airlockTransfers / 3) * 100);
        setStageProgress(pct);
        playParachuteDeploy();
        spawnBurst(320, 255, '#38bdf8', 18);

        if (s.airlockTransfers < 3) {
          setStatusBanner(
            `PYRO-CHARGE ${s.airlockTransfers}/3 SEALED — SAMPLE PULLED INTO CHAMBER!`
          );
        } else {
          s.stageTransitioning = true;
          playCapabilityUnlockChime();
          setStatusBanner('SAMPLE SEALED AT 1 BAR — BOOTING X-RAY SPECTROMETER!');
          window.setTimeout(() => {
            onActionLabelChange('LOCK');
            initStage(3);
            setStatusBanner(null);
          }, 1250);
        }
      } else {
        playAtmosphereBuffet();
        s.hullTemp = Math.min(100, s.hullTemp + 14);
        setHullTemp(Math.round(s.hullTemp));
        spawnBurst(320, 255, '#f87171', 12);
        setStatusBanner('MISSED PRESSURE WINDOW — HOT 92-BAR CO₂ LEAKED INTO VALVE!');
      }
      return;
    }

    // ---------------------------------------------------------------------
    // STAGE 3: X-RAY FLUORESCENCE SPECTROMETER
    // ---------------------------------------------------------------------
    if (s.stage === 3) {
      const targetPeak = s.peaks[s.currentPeakIdx];
      if (!targetPeak) return;

      const freqError = Math.abs(s.tuningFreq - targetPeak.targetFreq);
      const ampError = Math.abs(s.tuningAmp - targetPeak.targetAmp);

      if (freqError <= 6 && ampError <= 8) {
        targetPeak.locked = true;
        s.currentPeakIdx += 1;
        const pct = Math.round((s.currentPeakIdx / s.peaks.length) * 100);
        setStageProgress(pct);
        playProbeCollected(s.currentPeakIdx + 1);
        spawnBurst(320, 230, '#34d399', 18);

        if (s.currentPeakIdx < s.peaks.length) {
          setStatusBanner(
            `${targetPeak.element} VERIFIED — TUNE NEXT PEAK: ${s.peaks[s.currentPeakIdx].element}`
          );
        } else {
          s.completedAll = true;
          s.stageTransitioning = true;
          playMissionCompleteFanfare();
          setStatusBanner('LEUCITE BASALT COMPOSITION CONFIRMED & BEAMED TO EARTH!');
          window.setTimeout(() => {
            onComplete();
          }, 950);
        }
      } else {
        playThrusterBurst();
        setStatusBanner(
          `SIGNAL MISMATCH (ΔFREQ ${Math.round(freqError)}, ΔGAIN ${Math.round(ampError)}) — ALIGN CYAN & AMBER CURVES!`
        );
      }
    }
  };

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      stateRef.current.keys[e.key.toLowerCase()] = true;
      if (e.key === ' ' && !isPaused) {
        e.preventDefault();
        triggerAction();
      }
    };

    const onKeyUp = (e: KeyboardEvent) => {
      stateRef.current.keys[e.key.toLowerCase()] = false;
    };

    const onMobileAction = () => {
      if (!isPaused) triggerAction();
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

    const triggerOverheatReset = (msg: string) => {
      const s = stateRef.current;
      if (s.stageTransitioning) return;
      s.stageTransitioning = true;
      playCrashExplosion();
      setStatusBanner(msg);
      window.setTimeout(() => {
        s.hullTemp = 20;
        initStage(s.stage);
        setStatusBanner(null);
      }, 1200);
    };

    const render = (now: number) => {
      const dt = Math.min(0.05, (now - lastTime) / 1000);
      lastTime = now;

      const s = stateRef.current;

      if (!isPaused) {
        s.time += dt;

        // Update sparks
        for (let i = s.sparks.length - 1; i >= 0; i--) {
          const p = s.sparks[i];
          p.x += p.vx * dt;
          p.y += p.vy * dt;
          p.life -= dt * 1.9;
          if (p.life <= 0) s.sparks.splice(i, 1);
        }

        if (!s.stageTransitioning && !s.completedAll) {
          // Relentless 465°C Venusian thermal soak across all surface phases
          s.hullTemp = Math.min(100, s.hullTemp + dt * 1.35);
          setHullTemp(Math.round(s.hullTemp));

          if (s.hullTemp >= 100) {
            triggerOverheatReset(
              'INTERNAL TEMP EXCEEDED 465 °C LIMIT — RECALIBRATING LAB STAGE'
            );
          }

          if (s.stage === 1) {
            if (s.keys['arrowleft'] || s.keys['a']) {
              s.drillAngle = Math.max(-0.62, s.drillAngle - 0.85 * dt);
            }
            if (s.keys['arrowright'] || s.keys['d']) {
              s.drillAngle = Math.min(0.62, s.drillAngle + 0.85 * dt);
            }
            if (s.keys['arrowup'] || s.keys['w']) {
              s.drillTorque = Math.min(100, s.drillTorque + 48 * dt);
            }
            if (s.keys['arrowdown'] || s.keys['s']) {
              s.drillTorque = Math.max(0, s.drillTorque - 48 * dt);
            }

            if (s.isDrillingPulse > 0) {
              s.isDrillingPulse = Math.max(0, s.isDrillingPulse - dt * 3.2);
            }
            if (s.bitHeat > 0) {
              s.bitHeat = Math.max(0, s.bitHeat - dt * 7);
            }
          } else if (s.stage === 2) {
            // Pressure differential oscillation speeds up with each transfer
            const speed = 2.4 + s.airlockTransfers * 0.75;
            s.pressurePhase += dt * speed;
            s.pressureNeedle = 50 + Math.sin(s.pressurePhase) * 46;
            if (s.airlockFlash > 0) {
              s.airlockFlash = Math.max(0, s.airlockFlash - dt * 3);
            }
          } else if (s.stage === 3) {
            if (s.keys['arrowleft'] || s.keys['a']) {
              s.tuningFreq = Math.max(10, s.tuningFreq - 36 * dt);
            }
            if (s.keys['arrowright'] || s.keys['d']) {
              s.tuningFreq = Math.min(90, s.tuningFreq + 36 * dt);
            }
            if (s.keys['arrowup'] || s.keys['w']) {
              s.tuningAmp = Math.min(90, s.tuningAmp + 36 * dt);
            }
            if (s.keys['arrowdown'] || s.keys['s']) {
              s.tuningAmp = Math.max(15, s.tuningAmp - 36 * dt);
            }
          }
        }
      }

      // -------------------------------------------------------------------
      // RENDER STAGE-SPECIFIC INSTRUMENT CONSOLE
      // -------------------------------------------------------------------
      ctx.fillStyle = '#090d16';
      ctx.fillRect(0, 0, 640, 480);

      // Subtle titanium bulkhead grid
      ctx.strokeStyle = 'rgba(148, 163, 184, 0.08)';
      ctx.lineWidth = 1;
      for (let gx = 0; gx <= 640; gx += 40) {
        ctx.beginPath();
        ctx.moveTo(gx, 0);
        ctx.lineTo(gx, 480);
        ctx.stroke();
      }
      for (let gy = 0; gy <= 480; gy += 40) {
        ctx.beginPath();
        ctx.moveTo(0, gy);
        ctx.lineTo(640, gy);
        ctx.stroke();
      }

      // ===================================================================
      // RENDER STAGE 1: PHOEBE REGIO SOIL CORE DRILL
      // ===================================================================
      if (s.stage === 1) {
        // Orange-amber Venusian sky & basalt horizon
        const skyGrad = ctx.createLinearGradient(0, 0, 0, 320);
        skyGrad.addColorStop(0, '#451a03');
        skyGrad.addColorStop(1, '#9a3412');
        ctx.fillStyle = skyGrad;
        ctx.fillRect(0, 0, 640, 320);

        // Basalt crust floor
        ctx.fillStyle = '#1c1917';
        ctx.fillRect(0, 315, 640, 165);

        // Serrated Venera 13 landing ring base
        ctx.fillStyle = '#d97706';
        ctx.fillRect(190, 212, 260, 16);
        ctx.fillStyle = '#e2e8f0';
        ctx.beginPath();
        ctx.arc(320, 180, 46, Math.PI, 0);
        ctx.fill();

        // Target soft regolith pocket along the drill arc
        const pivotX = 320;
        const pivotY = 230;
        const arcR = 145;
        const pocketX = pivotX + Math.sin(s.targetPocketAngle) * arcR;
        const pocketY = pivotY + Math.cos(s.targetPocketAngle) * arcR;

        // Hard basalt slabs flanking the soft pocket
        ctx.fillStyle = '#0c0a09';
        ctx.strokeStyle = '#57534e';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.ellipse(215, 355, 58, 22, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        ctx.beginPath();
        ctx.ellipse(425, 355, 58, 22, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Glowing regolith target pocket
        const pulse = 1 + Math.sin(s.time * 5) * 0.1;
        ctx.fillStyle = 'rgba(251, 191, 36, 0.25)';
        ctx.strokeStyle = '#fbbf24';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(pocketX, pocketY, 22 * pulse, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#fde68a';
        ctx.font = 'bold 10px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('SOFT REGOLITH POCKET', pocketX, pocketY + 36);

        // Spring-loaded drill boom
        const thrustOffset = s.isDrillingPulse * 14;
        const tipX = pivotX + Math.sin(s.drillAngle) * (arcR + thrustOffset);
        const tipY = pivotY + Math.cos(s.drillAngle) * (arcR + thrustOffset);

        ctx.strokeStyle = '#cbd5e1';
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.moveTo(pivotX, pivotY);
        ctx.lineTo(tipX, tipY);
        ctx.stroke();

        // Auger bit tip
        ctx.fillStyle = '#38bdf8';
        ctx.beginPath();
        ctx.arc(tipX, tipY, 8, 0, Math.PI * 2);
        ctx.fill();

        // Left HUD Gauge: Drill Torque RPM (Optimal 40..76)
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(26, 36, 28, 210);
        // Green optimal band
        ctx.fillStyle = 'rgba(16, 185, 129, 0.35)';
        const optTop = 36 + ((100 - 76) / 100) * 210;
        const optHeight = ((76 - 40) / 100) * 210;
        ctx.fillRect(26, optTop, 28, optHeight);
        // Torque level bar
        const inOptimal = s.drillTorque >= 40 && s.drillTorque <= 76;
        ctx.fillStyle = inOptimal ? '#10b981' : '#f59e0b';
        const barH = (s.drillTorque / 100) * 210;
        ctx.fillRect(30, 36 + (210 - barH), 20, barH);
        ctx.strokeStyle = '#64748b';
        ctx.strokeRect(26, 36, 28, 210);

        ctx.fillStyle = '#e2e8f0';
        ctx.font = 'bold 10px monospace';
        ctx.textAlign = 'left';
        ctx.fillText('TORQUE [↑/↓]', 20, 24);
        ctx.fillText(`${Math.round(s.drillTorque)} RPM`, 20, 262);
      }

      // ===================================================================
      // RENDER STAGE 2: 92-BAR PYROTECHNIC AIRLOCK TRANSFER
      // ===================================================================
      if (s.stage === 2) {
        // Exterior 92-Bar Venus Chamber (Left) vs Interior 1-Bar Lab Sphere (Right)
        ctx.fillStyle = 'rgba(180, 83, 9, 0.25)';
        ctx.fillRect(36, 90, 250, 290);
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 2;
        ctx.strokeRect(36, 90, 250, 290);

        ctx.fillStyle = 'rgba(14, 165, 233, 0.16)';
        ctx.fillRect(354, 90, 250, 290);
        ctx.strokeStyle = '#38bdf8';
        ctx.strokeRect(354, 90, 250, 290);

        ctx.fillStyle = '#fbbf24';
        ctx.font = 'bold 12px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('EXTERIOR: 92 BAR • 465 °C', 161, 78);

        ctx.fillStyle = '#7dd3fc';
        ctx.fillText('INTERIOR LAB: 1 BAR • 28 °C', 479, 78);

        // Pyrotechnic Transfer Conduit Bridge
        ctx.fillStyle = s.airlockFlash > 0 ? '#38bdf8' : '#334155';
        ctx.fillRect(286, 220, 68, 42);
        ctx.strokeStyle = '#94a3b8';
        ctx.strokeRect(286, 220, 68, 42);

        // Soil Core Capsules transferred
        for (let i = 0; i < 3; i++) {
          const filled = i < s.airlockTransfers;
          ctx.fillStyle = filled ? '#10b981' : '#1e293b';
          ctx.strokeStyle = filled ? '#6ee7b7' : '#475569';
          ctx.beginPath();
          ctx.arc(420 + i * 58, 240, 18, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
        }

        // Pressure Differential Timing Bar at Bottom
        const barX = 110;
        const barY = 412;
        const barW = 420;
        const barH = 26;

        ctx.fillStyle = '#0f172a';
        ctx.fillRect(barX, barY, barW, barH);

        // Green Seal Window (40% .. 60%)
        ctx.fillStyle = 'rgba(16, 185, 129, 0.45)';
        ctx.fillRect(barX + barW * 0.4, barY, barW * 0.2, barH);
        ctx.strokeStyle = '#34d399';
        ctx.strokeRect(barX + barW * 0.4, barY, barW * 0.2, barH);

        // Moving Pressure Differential Needle
        const needleX = barX + (s.pressureNeedle / 100) * barW;
        ctx.fillStyle = '#f8fafc';
        ctx.fillRect(needleX - 3, barY - 5, 6, barH + 10);

        ctx.strokeStyle = '#64748b';
        ctx.strokeRect(barX, barY, barW, barH);

        ctx.fillStyle = '#e2e8f0';
        ctx.font = 'bold 11px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(
          'PRESS [SPACE] WHEN NEEDLE ENTERS GREEN PYRO-SEAL WINDOW',
          320,
          400
        );
      }

      // ===================================================================
      // RENDER STAGE 3: X-RAY FLUORESCENCE BASALT SPECTROMETER
      // ===================================================================
      if (s.stage === 3) {
        const plotX = 70;
        const plotY = 85;
        const plotW = 500;
        const plotH = 260;

        // Spectrometer CRT Display Frame
        ctx.fillStyle = '#020617';
        ctx.fillRect(plotX, plotY, plotW, plotH);
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 2;
        ctx.strokeRect(plotX, plotY, plotW, plotH);

        const activePeak = s.peaks[s.currentPeakIdx];

        // Header readout
        ctx.fillStyle = '#7dd3fc';
        ctx.font = 'bold 12px monospace';
        ctx.textAlign = 'left';
        ctx.fillText(
          activePeak
            ? `ACTIVE ISOTOPE TARGET: ${activePeak.element}`
            : 'ALL BASALT PEAKS VERIFIED',
          plotX,
          68
        );

        ctx.textAlign = 'right';
        ctx.fillStyle = '#fde68a';
        ctx.fillText(
          `PEAKS LOCKED: ${s.currentPeakIdx} / ${s.peaks.length}`,
          plotX + plotW,
          68
        );

        // Draw Reference Target Gaussian Curve (Amber)
        if (activePeak) {
          ctx.strokeStyle = '#f59e0b';
          ctx.lineWidth = 2.5;
          ctx.setLineDash([6, 4]);
          ctx.beginPath();
          for (let px = 0; px <= plotW; px += 4) {
            const normX = (px / plotW) * 100;
            const dist = normX - activePeak.targetFreq;
            const gaussian =
              activePeak.targetAmp * Math.exp(-(dist * dist) / (2 * 6.5 * 6.5));
            const py = plotY + plotH - (gaussian / 100) * (plotH - 24);
            if (px === 0) ctx.moveTo(plotX + px, py);
            else ctx.lineTo(plotX + px, py);
          }
          ctx.stroke();
          ctx.setLineDash([]);
        }

        // Draw Live Player Spectrometer Curve (Cyan)
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 3;
        ctx.beginPath();
        for (let px = 0; px <= plotW; px += 4) {
          const normX = (px / plotW) * 100;
          const dist = normX - s.tuningFreq;
          const gaussian = s.tuningAmp * Math.exp(-(dist * dist) / (2 * 6.5 * 6.5));
          const py = plotY + plotH - (gaussian / 100) * (plotH - 24);
          if (px === 0) ctx.moveTo(plotX + px, py);
          else ctx.lineTo(plotX + px, py);
        }
        ctx.stroke();

        // Bottom Tuning Readouts
        ctx.fillStyle = '#e2e8f0';
        ctx.font = 'bold 11px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(
          `[←/→] FREQUENCY: ${Math.round(s.tuningFreq)} keV   |   [↑/↓] GAIN: ${Math.round(
            s.tuningAmp
          )}%   |   [SPACE] LOCK PEAK`,
          320,
          376
        );

        // Elemental Pill Indicators
        s.peaks.forEach((pk, idx) => {
          const pillX = 115 + idx * 145;
          const pillY = 398;
          ctx.fillStyle = pk.locked
            ? 'rgba(16, 185, 129, 0.25)'
            : idx === s.currentPeakIdx
              ? 'rgba(56, 189, 248, 0.2)'
              : '#0f172a';
          ctx.strokeStyle = pk.locked
            ? '#34d399'
            : idx === s.currentPeakIdx
              ? '#38bdf8'
              : '#334155';
          ctx.fillRect(pillX, pillY, 130, 28);
          ctx.strokeRect(pillX, pillY, 130, 28);

          ctx.fillStyle = pk.locked ? '#6ee7b7' : '#cbd5e1';
          ctx.font = 'bold 10px monospace';
          ctx.fillText(pk.locked ? `✓ ${pk.element}` : pk.element, pillX + 65, pillY + 18);
        });
      }

      // Render Sparks / Particles
      for (const p of s.sparks) {
        ctx.fillStyle = p.color;
        ctx.globalAlpha = Math.max(0, p.life);
        ctx.fillRect(p.x - 2, p.y - 2, 4, 4);
      }
      ctx.globalAlpha = 1;

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [isPaused, onActionLabelChange, onComplete]);

  return (
    <div className="w-full overflow-hidden rounded-xl border-2 border-slate-800 bg-slate-900 shadow-2xl">
      {/* Telemetry HUD */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 bg-slate-950 px-4 py-2.5 font-mono text-xs">
        <span className="font-bold text-amber-400">{STAGE_TITLES[stage - 1]}</span>
        <div className="flex items-center gap-4">
          <span className="text-emerald-400">{`LAB PROGRESS: ${stageProgress}%`}</span>
          <span className={hullTemp >= 75 ? 'font-bold text-rose-400' : 'text-sky-300'}>
            {`HULL HEAT: ${hullTemp}%`}
          </span>
        </div>
      </div>

      {/* Canvas Viewport */}
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
