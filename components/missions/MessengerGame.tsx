'use client';

import React, { useEffect, useRef, useState } from 'react';
import { MissionModalData } from '@/types/game';
import {
  playThrusterBurst,
  playAtmosphereBuffet,
  playProbeCollected,
  playCapabilityUnlockChime,
  playMissionCompleteFanfare,
  playCrashExplosion,
} from '@/utils/soundEffects';

interface MessengerGameProps {
  isPaused: boolean;
  missionData: MissionModalData;
  onActionLabelChange: (label: string) => void;
  onComplete: () => void;
}

interface PolarCrater {
  id: number;
  x: number;
  width: number;
  scanned: boolean;
}

interface RidgeObstacle {
  x: number;
  height: number;
  width: number;
}

const STAGE_TITLES = [
  'STAGE 1: CERAMIC SUNSHADE & CORE MAGNETOMETRY',
  'STAGE 2: POLAR SHADOWED CRATER ICE SCAN',
  'STAGE 3: HELIUM DEORBIT & SHAKESPEARE CRATER IMPACT',
];

export default function MessengerGame({
  isPaused,
  onActionLabelChange,
  onComplete,
}: MessengerGameProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [stage, setStage] = useState(1);
  const [busTemp, setBusTemp] = useState(22); // 0..100% thermal limit
  const [stageProgress, setStageProgress] = useState(0);
  const [statusBanner, setStatusBanner] = useState<string | null>(null);

  const stateRef = useRef({
    stage: 1,
    busTemp: 22,
    time: 0,
    keys: {} as Record<string, boolean>,
    stageTransitioning: false,
    completedAll: false,

    // Stage 1: Sunshade attitude vs shifting Solar Glare + Core Scans
    sunAngle: 0, // -0.75 .. +0.75 rad from top center
    sunTargetAngle: 0.35,
    shadeAngle: 0, // Player ceramic sunshade orientation
    coreScans: 0, // 0..5
    scanPulseAnim: 0,

    // Stage 2: Polar Ice Crater Flyover (keep sunshade pointed at low sun + scan dark craters)
    craftX: 320,
    polarSunSide: -1 as -1 | 1, // -1 left horizon, +1 right horizon
    craters: [] as PolarCrater[],
    iceFound: 0, // 0..4

    // Stage 3: Final Helium-Gas Deorbit & Shakespeare Crater Crash
    deorbitX: 90,
    deorbitY: 130,
    deorbitVy: 0,
    heliumPulses: 6,
    scrollDistance: 0,
    targetCraterX: 1950,
    ridges: [] as RidgeObstacle[],
    impactAnim: 0,

    particles: [] as { x: number; y: number; vx: number; vy: number; life: number; color: string }[],
  });

  const initStage = (stageNum: number) => {
    const s = stateRef.current;
    s.stage = stageNum;
    s.stageTransitioning = false;
    s.particles = [];

    if (stageNum === 1) {
      s.busTemp = 22;
      s.sunAngle = 0;
      s.sunTargetAngle = 0.42;
      s.shadeAngle = 0;
      s.coreScans = 0;
      s.scanPulseAnim = 0;
      setStageProgress(0);
    } else if (stageNum === 2) {
      s.craftX = 320;
      s.shadeAngle = -0.7;
      s.polarSunSide = -1;
      s.iceFound = 0;
      s.scanPulseAnim = 0;
      s.craters = [
        { id: 1, x: 135, width: 68, scanned: false },
        { id: 2, x: 265, width: 64, scanned: false },
        { id: 3, x: 405, width: 70, scanned: false },
        { id: 4, x: 525, width: 64, scanned: false },
      ];
      setStageProgress(0);
    } else {
      // Stage 3: Final low-altitude plunge into Shakespeare Crater (April 30, 2015)
      s.deorbitX = 110;
      s.deorbitY = 125;
      s.deorbitVy = 12;
      s.heliumPulses = 7;
      s.scrollDistance = 0;
      s.targetCraterX = 1850;
      s.impactAnim = 0;
      s.ridges = [
        { x: 460, height: 155, width: 54 },
        { x: 780, height: 185, width: 60 },
        { x: 1120, height: 205, width: 64 },
        { x: 1480, height: 220, width: 62 },
      ];
      setStageProgress(0);
    }

    setStage(stageNum);
    setBusTemp(Math.round(s.busTemp));
  };

  useEffect(() => {
    const timer = window.setTimeout(() => {
      initStage(1);
      onActionLabelChange('SCAN');
    }, 0);
    return () => window.clearTimeout(timer);
  }, [onActionLabelChange]);

  const spawnParticles = (x: number, y: number, color: string, count = 14) => {
    const s = stateRef.current;
    for (let i = 0; i < count; i++) {
      const a = Math.random() * Math.PI * 2;
      const spd = 35 + Math.random() * 110;
      s.particles.push({
        x,
        y,
        vx: Math.cos(a) * spd,
        vy: Math.sin(a) * spd,
        life: 1,
        color,
      });
    }
  };

  const triggerAction = () => {
    const s = stateRef.current;
    if (s.stageTransitioning || s.completedAll) return;

    // ---------------------------------------------------------------------
    // STAGE 1: MAGNETOMETER & CORE SCAN WHILE SHIELDED
    // ---------------------------------------------------------------------
    if (s.stage === 1) {
      const shadeError = Math.abs(s.shadeAngle - s.sunAngle);
      s.scanPulseAnim = 1;

      if (shadeError > 0.22) {
        playAtmosphereBuffet();
        s.busTemp = Math.min(100, s.busTemp + 14);
        setBusTemp(Math.round(s.busTemp));
        setStatusBanner('SUNSHADE MISALIGNED — BLOCK THE SUN BEFORE SCANNING!');
        return;
      }

      s.coreScans += 1;
      const pct = Math.round((s.coreScans / 5) * 100);
      setStageProgress(pct);
      playProbeCollected(s.coreScans);
      spawnParticles(320, 265, '#38bdf8', 16);

      if (s.coreScans < 5) {
        setStatusBanner(
          `IRON-CORE & MAGNETOSPHERE SCAN ${s.coreScans}/5 LOGGED!`
        );
      } else {
        s.stageTransitioning = true;
        playCapabilityUnlockChime();
        setStatusBanner('CORE TELEMETRY COMPLETE — DESCENDING TO POLAR ORBIT!');
        window.setTimeout(() => {
          onActionLabelChange('PING');
          initStage(2);
          setStatusBanner(null);
        }, 1200);
      }
      return;
    }

    // ---------------------------------------------------------------------
    // STAGE 2: NEUTRON SPECTROMETER POLAR ICE SCAN
    // ---------------------------------------------------------------------
    if (s.stage === 2) {
      s.scanPulseAnim = 1;
      const hitCrater = s.craters.find(
        (c) => !c.scanned && Math.abs(c.x - s.craftX) <= c.width * 0.55
      );

      if (hitCrater) {
        hitCrater.scanned = true;
        s.iceFound += 1;
        const pct = Math.round((s.iceFound / s.craters.length) * 100);
        setStageProgress(pct);
        playProbeCollected(s.iceFound + 1);
        spawnParticles(hitCrater.x, 385, '#38bdf8', 18);

        if (s.iceFound < s.craters.length) {
          setStatusBanner(
            `WATER ICE CONFIRMED IN SHADOWED CRATER (${s.iceFound}/${s.craters.length})!`
          );
        } else {
          s.stageTransitioning = true;
          playCapabilityUnlockChime();
          setStatusBanner(
            'PROPELLANT DEPLETED — INITIATING FINAL HELIUM DEORBIT IMPACT!'
          );
          window.setTimeout(() => {
            onActionLabelChange('HELIUM');
            initStage(3);
            setStatusBanner(null);
          }, 1300);
        }
      } else {
        playThrusterBurst();
        setStatusBanner('NO ICE SIGNATURE — ALIGN OVER DARK SHADOWED CRATER!');
      }
      return;
    }

    // ---------------------------------------------------------------------
    // STAGE 3: HELIUM PRESSURANT THRUSTER HOP DURING FINAL DEORBIT CRASH
    // ---------------------------------------------------------------------
    if (s.stage === 3) {
      if (s.heliumPulses <= 0) {
        playAtmosphereBuffet();
        setStatusBanner('HELIUM TANKS EMPTY — BRACE FOR SHAKESPEARE CRATER IMPACT!');
        return;
      }

      s.heliumPulses -= 1;
      s.deorbitVy = -145; // Emergency helium cold-gas hop over jagged ridges
      playThrusterBurst();
      spawnParticles(s.deorbitX - 10, s.deorbitY + 12, '#7dd3fc', 14);
      setStatusBanner(
        `HELIUM GAS VENTED (${s.heliumPulses} PULSES LEFT) — CLEAR VOLCANIC RIDGES!`
      );
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

    const resetCurrentStage = (msg: string) => {
      const s = stateRef.current;
      if (s.stageTransitioning) return;
      s.stageTransitioning = true;
      playCrashExplosion();
      setStatusBanner(msg);
      window.setTimeout(() => {
        s.busTemp = 25;
        initStage(s.stage);
        setStatusBanner(null);
      }, 1250);
    };

    const render = (now: number) => {
      const dt = Math.min(0.05, (now - lastTime) / 1000);
      lastTime = now;

      const s = stateRef.current;

      if (!isPaused) {
        s.time += dt;
        if (s.scanPulseAnim > 0) {
          s.scanPulseAnim = Math.max(0, s.scanPulseAnim - dt * 2.5);
        }

        // Update particles
        for (let i = s.particles.length - 1; i >= 0; i--) {
          const p = s.particles[i];
          p.x += p.vx * dt;
          p.y += p.vy * dt;
          p.life -= dt * 1.7;
          if (p.life <= 0) s.particles.splice(i, 1);
        }

        if (!s.stageTransitioning && !s.completedAll) {
          // ===============================================================
          // STAGE 1 UPDATE: SUNSHADE ALIGNMENT
          // ===============================================================
          if (s.stage === 1) {
            if (s.keys['arrowleft'] || s.keys['a']) {
              s.shadeAngle = Math.max(-0.85, s.shadeAngle - 1.35 * dt);
            }
            if (s.keys['arrowright'] || s.keys['d']) {
              s.shadeAngle = Math.min(0.85, s.shadeAngle + 1.35 * dt);
            }

            // Sun drifts smoothly across upper sky
            if (Math.abs(s.sunAngle - s.sunTargetAngle) < 0.04) {
              s.sunTargetAngle = (Math.random() * 1.4 - 0.7);
            } else {
              s.sunAngle += Math.sign(s.sunTargetAngle - s.sunAngle) * 0.36 * dt;
            }

            const shadeError = Math.abs(s.shadeAngle - s.sunAngle);
            if (shadeError > 0.22) {
              s.busTemp = Math.min(100, s.busTemp + dt * 16);
            } else {
              s.busTemp = Math.max(12, s.busTemp - dt * 7);
            }
            setBusTemp(Math.round(s.busTemp));

            if (s.busTemp >= 100) {
              resetCurrentStage(
                'SOLAR RADIATION EXCEEDED 430 °C — RECALIBRATING SUNSHADE!'
              );
            }
          }

          // ===============================================================
          // STAGE 2 UPDATE: POLAR CRATER FLYOVER + HORIZON SUNSHADE
          // ===============================================================
          if (s.stage === 2) {
            if (s.keys['arrowleft'] || s.keys['a']) {
              s.craftX = Math.max(55, s.craftX - 210 * dt);
            }
            if (s.keys['arrowright'] || s.keys['d']) {
              s.craftX = Math.min(585, s.craftX + 210 * dt);
            }

            // Low-angle polar sun switches sides every 5.5 seconds
            s.polarSunSide = Math.sin(s.time * 0.55) < 0 ? -1 : 1;
            // Craft auto-tilts sunshade slightly toward direction of travel; player must stay away from exposed glare side
            const exposedToGlare =
              (s.polarSunSide === -1 && s.craftX < 145) ||
              (s.polarSunSide === 1 && s.craftX > 495);

            if (exposedToGlare) {
              s.busTemp = Math.min(100, s.busTemp + dt * 18);
            } else {
              s.busTemp = Math.max(15, s.busTemp - dt * 5);
            }
            setBusTemp(Math.round(s.busTemp));

            if (s.busTemp >= 100) {
              resetCurrentStage(
                'POLAR HORIZON GLARE OVERHEATED SENSORS — RETRYING FLYOVER!'
              );
            }
          }

          // ===============================================================
          // STAGE 3 UPDATE: FINAL LOW-ALTITUDE PLUNGE & SHAKESPEARE CRASH
          // ===============================================================
          if (s.stage === 3) {
            const forwardSpeed = 240; // ~3.91 km/s scaled
            s.scrollDistance += forwardSpeed * dt;

            // Player horizontal trim & descent pitch
            if (s.keys['arrowleft'] || s.keys['a']) {
              s.deorbitX = Math.max(60, s.deorbitX - 135 * dt);
            }
            if (s.keys['arrowright'] || s.keys['d']) {
              s.deorbitX = Math.min(240, s.deorbitX + 135 * dt);
            }

            // Mercury gravity pulls MESSENGER downward into its terminal trajectory
            s.deorbitVy += 115 * dt;
            s.deorbitY += s.deorbitVy * dt;

            if (s.deorbitY < 52) {
              s.deorbitY = 52;
              s.deorbitVy = 0;
            }

            const distToTarget = Math.max(0, s.targetCraterX - (s.scrollDistance + s.deorbitX));
            const pct = Math.min(
              100,
              Math.round(((s.scrollDistance + s.deorbitX) / s.targetCraterX) * 100)
            );
            setStageProgress(pct);

            // Check premature crash into volcanic ridges before reaching Shakespeare Crater
            const groundY = 415;
            for (const ridge of s.ridges) {
              const screenRidgeX = ridge.x - s.scrollDistance;
              if (
                Math.abs(screenRidgeX - s.deorbitX) < ridge.width * 0.45 &&
                s.deorbitY + 14 >= groundY - ridge.height
              ) {
                resetCurrentStage(
                  'PREMATURE RIDGE IMPACT — USE [SPACE] HELIUM HOPS TO REACH TARGET CRATER!'
                );
                break;
              }
            }

            // Check ground impact
            if (!s.stageTransitioning && s.deorbitY + 14 >= groundY) {
              if (distToTarget <= 155) {
                // Successful mission-ending crash into Shakespeare Crater!
                s.completedAll = true;
                s.stageTransitioning = true;
                s.impactAnim = 1;
                playCrashExplosion();
                playMissionCompleteFanfare();
                spawnParticles(s.deorbitX, groundY - 8, '#fbbf24', 36);
                spawnParticles(s.deorbitX, groundY - 8, '#38bdf8', 24);
                setStatusBanner(
                  'IMPACT CONFIRMED AT 3.91 KM/S! 16-METER CRATER FORMED IN SHAKESPEARE BASIN!'
                );
                window.setTimeout(() => {
                  onComplete();
                }, 1350);
              } else {
                resetCurrentStage(
                  'TOUCHED DOWN SHORT OF SHAKESPEARE CRATER — USE HELIUM THRUSTERS!'
                );
              }
            }
          }
        }
      }

      // -------------------------------------------------------------------
      // RENDER MERCURY & MESSENGER
      // -------------------------------------------------------------------
      ctx.fillStyle = '#030712';
      ctx.fillRect(0, 0, 640, 480);

      // Crisp airless starfield
      ctx.fillStyle = '#e2e8f0';
      for (let i = 0; i < 42; i++) {
        const sx = (i * 157) % 640;
        const sy = (i * 97) % 340;
        ctx.fillRect(sx, sy, i % 4 === 0 ? 2 : 1, i % 4 === 0 ? 2 : 1);
      }

      // ===================================================================
      // RENDER STAGE 1: SUNSHADE VS. GIANT MERCURIAN SUN
      // ===================================================================
      if (s.stage === 1) {
        const cx = 320;
        const cy = 285;
        const sunDist = 195;
        const sunX = cx + Math.sin(s.sunAngle) * sunDist;
        const sunY = cy - Math.cos(s.sunAngle) * sunDist;

        // Solar radiation beam cone
        const shadeError = Math.abs(s.shadeAngle - s.sunAngle);
        const isBlocked = shadeError <= 0.22;

        ctx.save();
        ctx.fillStyle = isBlocked
          ? 'rgba(250, 204, 21, 0.14)'
          : 'rgba(239, 68, 68, 0.28)';
        ctx.beginPath();
        ctx.moveTo(sunX, sunY);
        ctx.lineTo(cx - 55, cy);
        ctx.lineTo(cx + 55, cy);
        ctx.closePath();
        ctx.fill();
        ctx.restore();

        // Blinding Sun Orb
        const sunGrad = ctx.createRadialGradient(sunX, sunY, 8, sunX, sunY, 46);
        sunGrad.addColorStop(0, '#fef9c3');
        sunGrad.addColorStop(0.5, '#f59e0b');
        sunGrad.addColorStop(1, 'rgba(245, 158, 11, 0)');
        ctx.fillStyle = sunGrad;
        ctx.beginPath();
        ctx.arc(sunX, sunY, 46, 0, Math.PI * 2);
        ctx.fill();

        // Mercury curved limb at bottom
        ctx.fillStyle = '#44403c';
        ctx.beginPath();
        ctx.arc(320, 690, 340, Math.PI * 1.15, Math.PI * 1.85);
        ctx.fill();

        // MESSENGER Spacecraft + Ceramic Sunshade Arc
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(s.shadeAngle);

        // Ceramic-cloth thermal sunshade (curved shield facing up toward angle 0)
        ctx.strokeStyle = isBlocked ? '#34d399' : '#f87171';
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.arc(0, 0, 44, -Math.PI * 0.78, -Math.PI * 0.22);
        ctx.stroke();

        // Spacecraft bus behind shade
        ctx.fillStyle = '#cbd5e1';
        ctx.fillRect(-14, -8, 28, 24);
        // Magnetometer boom
        ctx.strokeStyle = '#94a3b8';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, 16);
        ctx.lineTo(0, 48);
        ctx.stroke();
        ctx.restore();

        // Scan pulse ring
        if (s.scanPulseAnim > 0) {
          ctx.strokeStyle = `rgba(56, 189, 248, ${s.scanPulseAnim})`;
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.arc(cx, cy + 25, (1 - s.scanPulseAnim) * 140 + 20, 0, Math.PI * 2);
          ctx.stroke();
        }

        ctx.fillStyle = isBlocked ? '#6ee7b7' : '#fca5a5';
        ctx.font = 'bold 11px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(
          isBlocked
            ? 'CERAMIC SUNSHADE LOCKED — PRESS [SPACE] TO SCAN CORE'
            : 'WARNING: SOLAR GLARE EXPOSED — ROTATE SUNSHADE [←/→]!',
          320,
          36
        );
      }

      // ===================================================================
      // RENDER STAGE 2: POLAR SHADOWED CRATERS & NEUTRON ICE SCAN
      // ===================================================================
      if (s.stage === 2) {
        // Low-angle polar horizon sun glare on left or right edge
        const glareX = s.polarSunSide === -1 ? 0 : 640;
        const glareGrad = ctx.createRadialGradient(glareX, 240, 10, glareX, 240, 185);
        glareGrad.addColorStop(0, 'rgba(251, 191, 36, 0.55)');
        glareGrad.addColorStop(1, 'rgba(251, 191, 36, 0)');
        ctx.fillStyle = glareGrad;
        ctx.fillRect(0, 0, 640, 480);

        // Polar cratered crust
        ctx.fillStyle = '#292524';
        ctx.fillRect(0, 365, 640, 115);

        // Permanently shadowed polar craters with water-ice deposits
        for (const c of s.craters) {
          ctx.fillStyle = '#090d16';
          ctx.beginPath();
          ctx.ellipse(c.x, 382, c.width * 0.5, 16, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = c.scanned ? '#34d399' : '#38bdf8';
          ctx.lineWidth = 2;
          ctx.stroke();

          ctx.fillStyle = c.scanned ? '#6ee7b7' : '#7dd3fc';
          ctx.font = 'bold 10px monospace';
          ctx.textAlign = 'center';
          ctx.fillText(c.scanned ? '✓ H₂O ICE' : 'SHADOWED CRATER', c.x, 416);
        }

        // Neutron Spectrometer beam from MESSENGER
        ctx.fillStyle =
          s.scanPulseAnim > 0
            ? 'rgba(56, 189, 248, 0.38)'
            : 'rgba(56, 189, 248, 0.1)';
        ctx.beginPath();
        ctx.moveTo(s.craftX - 8, 175);
        ctx.lineTo(s.craftX - 28, 375);
        ctx.lineTo(s.craftX + 28, 375);
        ctx.lineTo(s.craftX + 8, 175);
        ctx.closePath();
        ctx.fill();

        // MESSENGER polar orbiter
        ctx.save();
        ctx.translate(s.craftX, 155);
        ctx.fillStyle = '#cbd5e1';
        ctx.fillRect(-16, -12, 32, 22);
        // Sunshade oriented toward active polar sun side
        ctx.fillStyle = '#f59e0b';
        ctx.fillRect(s.polarSunSide === -1 ? -24 : 18, -20, 6, 38);
        ctx.restore();

        ctx.fillStyle = '#fde68a';
        ctx.font = 'bold 11px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(
          `SOLAR GLARE ON ${s.polarSunSide === -1 ? 'LEFT' : 'RIGHT'} HORIZON — SCAN DARK CRATERS [SPACE]`,
          320,
          34
        );
      }

      // ===================================================================
      // RENDER STAGE 3: TERMINAL PLUNGE INTO SHAKESPEARE CRATER
      // ===================================================================
      if (s.stage === 3) {
        const groundY = 415;

        // Cratered Mercurian surface
        ctx.fillStyle = '#292524';
        ctx.fillRect(0, groundY, 640, 65);

        // Jagged volcanic ridges to hop over with Helium thrusters
        for (const ridge of s.ridges) {
          const rx = ridge.x - s.scrollDistance;
          if (rx < -80 || rx > 720) continue;
          ctx.fillStyle = '#1c1917';
          ctx.strokeStyle = '#78716c';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(rx - ridge.width * 0.5, groundY);
          ctx.lineTo(rx, groundY - ridge.height);
          ctx.lineTo(rx + ridge.width * 0.5, groundY);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
        }

        // Target Impact Zone: Shakespeare Crater Basin
        const targetScreenX = s.targetCraterX - s.scrollDistance;
        if (targetScreenX < 760) {
          ctx.fillStyle = 'rgba(245, 158, 11, 0.25)';
          ctx.strokeStyle = '#fbbf24';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.ellipse(targetScreenX, groundY + 4, 125, 16, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();

          ctx.fillStyle = '#fde68a';
          ctx.font = 'bold 11px monospace';
          ctx.textAlign = 'center';
          ctx.fillText('SHAKESPEARE CRATER IMPACT ZONE', targetScreenX, groundY - 18);
        }

        // Draw MESSENGER hurtling downward at 3.91 km/s
        if (!s.completedAll) {
          ctx.save();
          ctx.translate(s.deorbitX, s.deorbitY);
          ctx.rotate(0.32);
          // Ceramic sunshade leading edge
          ctx.fillStyle = '#f59e0b';
          ctx.fillRect(14, -18, 6, 36);
          // Spacecraft bus
          ctx.fillStyle = '#e2e8f0';
          ctx.fillRect(-14, -11, 28, 22);
          // Solar wings
          ctx.fillStyle = '#0284c7';
          ctx.fillRect(-6, -30, 12, 16);
          ctx.fillRect(-6, 14, 12, 16);
          ctx.restore();
        } else {
          // Newly formed 16-meter impact crater!
          ctx.fillStyle = '#090d16';
          ctx.strokeStyle = '#fbbf24';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.ellipse(s.deorbitX, groundY + 4, 42, 12, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
        }

        // Top HUD indicator for Helium pulses & distance to impact
        const distLeft = Math.max(
          0,
          Math.round(s.targetCraterX - (s.scrollDistance + s.deorbitX))
        );
        ctx.fillStyle = '#7dd3fc';
        ctx.font = 'bold 11px monospace';
        ctx.textAlign = 'left';
        ctx.fillText(
          `HELIUM THRUSTER PULSES: ${s.heliumPulses} [SPACE]   |   TARGET RANGE: ${distLeft} M`,
          16,
          28
        );
      }

      // Render Particles
      for (const p of s.particles) {
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
          <span className="text-emerald-400">{`MISSION: ${stageProgress}%`}</span>
          <span className={busTemp >= 75 ? 'font-bold text-rose-400' : 'text-sky-300'}>
            {`BUS HEAT: ${busTemp}%`}
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
