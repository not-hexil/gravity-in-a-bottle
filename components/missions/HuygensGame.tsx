'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { MissionModalData } from '@/types/game';
import TelemetryUnlockOverlay from '@/components/ui/TelemetryUnlockOverlay';
import {
  playThrusterBurst,
  playParachuteDeploy,
  playAtmosphereBuffet,
  playMagneticShieldPulse,
  playWaypointPing,
  playCrashExplosion,
  playCapabilityUnlockChime,
  playMissionCompleteFanfare,
} from '@/utils/soundEffects';

interface HuygensGameProps {
  isPaused: boolean;
  missionData: MissionModalData;
  onActionLabelChange: (label: string) => void;
  onComplete: () => void;
}

interface Hazard {
  x: number;
  y: number;
  radius: number;
  vx: number;
  type: 'plasma' | 'ice';
  hitCooldown: number;
}

interface LaserBolt {
  x: number;
  y: number;
  vy: number;
}

const CANVAS_W = 640;
const CANVAS_H = 520;
const START_ALTITUDE = 160;

function createHazards(count: number): Hazard[] {
  return Array.from({ length: count }, (_, i) => ({
    x: 75 + ((i * 97) % (CANVAS_W - 150)),
    y: 260 + i * 75,
    radius: 19 + (i % 3) * 4,
    vx: (i % 2 === 0 ? 1 : -1) * (0.45 + (i % 3) * 0.2),
    type: i % 2 === 0 ? 'plasma' : 'ice',
    hitCooldown: 0,
  }));
}

export default function HuygensGame({
  isPaused,
  missionData,
  onActionLabelChange,
  onComplete,
}: HuygensGameProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const completedRef = useRef(false);

  const [stage, setStage] = useState(1);
  const [unlockModalStage, setUnlockModalStage] = useState<number | null>(null);
  const [gameState, setGameState] = useState<'playing' | 'crashed' | 'landed'>('playing');
  const [failReason, setFailReason] = useState('');
  const [hud, setHud] = useState({
    altitude: START_ALTITUDE,
    hull: 100,
    chuteDeployed: false,
    shieldReady: true,
    shieldActive: false,
    cannonReady: true,
  });

  const simRef = useRef({
    stage: 1,
    x: CANVAS_W / 2,
    vx: 0,
    altitude: START_ALTITUDE,
    vy: 38,
    hull: 100,
    chuteDeployed: false,
    shieldActiveTimer: 0,
    shieldCooldown: 0,
    shieldRequested: false,
    cannonCooldown: 0,
    fireRequested: false,
    bolts: [] as LaserBolt[],
    padX: CANVAS_W / 2 + 95,
    hazards: createHazards(6),
    keys: { left: false, right: false },
    tick: 0,
  });

  const resetGame = useCallback(() => {
    completedRef.current = false;
    simRef.current = {
      stage: 1,
      x: CANVAS_W / 2,
      vx: 0,
      altitude: START_ALTITUDE,
      vy: 38,
      hull: 100,
      chuteDeployed: false,
      shieldActiveTimer: 0,
      shieldCooldown: 0,
      shieldRequested: false,
      cannonCooldown: 0,
      fireRequested: false,
      bolts: [],
      padX: 140 + Math.random() * (CANVAS_W - 280),
      hazards: createHazards(6),
      keys: { left: false, right: false },
      tick: 0,
    };
    setStage(1);
    setUnlockModalStage(null);
    setFailReason('');
    setHud({
      altitude: START_ALTITUDE,
      hull: 100,
      chuteDeployed: false,
      shieldReady: true,
      shieldActive: false,
      cannonReady: true,
    });
    setGameState('playing');
    onActionLabelChange('CHUTE');
  }, [onActionLabelChange]);

  const deployParachute = useCallback(() => {
    const s = simRef.current;
    if (isPaused || unlockModalStage !== null || gameState !== 'playing' || s.chuteDeployed) return;

    if (s.altitude > 130) {
      playCrashExplosion();
      setFailReason('Parachute deployed too high in hypersonic entry — canopy shredded!');
      setGameState('crashed');
      return;
    }

    s.chuteDeployed = true;
    playParachuteDeploy();
  }, [isPaused, unlockModalStage, gameState]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (isPaused || unlockModalStage !== null) return;
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') simRef.current.keys.left = true;
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D')
        simRef.current.keys.right = true;

      // Stage 2+: Toggle Deflector Shield [S] or [Shift]
      if (e.key === 's' || e.key === 'S' || e.key === 'Shift') {
        simRef.current.shieldRequested = true;
      }

      // Stage 3: Fire Plasma Pulse Cannon [F] or [Enter]
      if (e.key === 'f' || e.key === 'F' || e.key === 'Enter') {
        e.preventDefault();
        simRef.current.fireRequested = true;
      }

      if (e.key === ' ') {
        e.preventDefault();
        if (gameState === 'crashed') {
          resetGame();
        } else if (gameState === 'playing') {
          if (!simRef.current.chuteDeployed) {
            deployParachute();
          } else if (simRef.current.stage === 3) {
            simRef.current.fireRequested = true;
          } else if (simRef.current.stage === 2) {
            simRef.current.shieldRequested = true;
          }
        }
      }
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
  }, [isPaused, unlockModalStage, gameState, resetGame, deployParachute]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;

    const updateAndDraw = () => {
      const s = simRef.current;
      const paused = isPaused || unlockModalStage !== null;

      if (!paused && gameState === 'playing') {
        s.tick++;

        // Shield Cooldown & Activation (Stage 2+)
        if (s.shieldActiveTimer > 0) s.shieldActiveTimer--;
        if (s.shieldCooldown > 0) s.shieldCooldown--;
        if (s.shieldRequested) {
          s.shieldRequested = false;
          if (s.stage >= 2 && s.shieldCooldown <= 0 && s.shieldActiveTimer <= 0) {
            s.shieldActiveTimer = 150; // 2.5 seconds active
            s.shieldCooldown = 420; // 7 seconds cooldown
            playMagneticShieldPulse();
          }
        }

        // Plasma Cannon Cooldown & Firing (Stage 3)
        if (s.cannonCooldown > 0) s.cannonCooldown--;
        if (s.fireRequested) {
          s.fireRequested = false;
          if (s.stage >= 3 && s.cannonCooldown <= 0) {
            const probeY = s.altitude > 20 ? 155 : 155 + ((20 - s.altitude) / 20) * 280;
            s.bolts.push({ x: s.x, y: probeY + 14, vy: 7.5 });
            s.cannonCooldown = 55;
            playWaypointPing();
          }
        }

        const accel = s.stage >= 2 ? 0.38 : 0.28;
        if (s.keys.left) s.vx -= accel;
        if (s.keys.right) s.vx += accel;
        if ((s.keys.left || s.keys.right) && s.tick % 6 === 0) {
          playThrusterBurst();
        }

        s.vx *= 0.92;
        s.x += s.vx;
        s.x = Math.max(36, Math.min(CANVAS_W - 36, s.x));

        const targetVy = s.chuteDeployed ? 5.2 : 12.5;
        s.vy += (targetVy - s.vy) * 0.05;
        const altStep = s.chuteDeployed ? 0.0072 : 0.0085;
        s.altitude = Math.max(0, s.altitude - altStep);

        if (s.stage === 1 && s.altitude <= 110) {
          if (!s.chuteDeployed) {
            playCrashExplosion();
            setFailReason('Entered dense lower atmosphere without deploying parachute!');
            setGameState('crashed');
          } else {
            s.stage = 2;
            s.hazards = createHazards(8);
            setStage(2);
            playCapabilityUnlockChime();
            setUnlockModalStage(1);
          }
        } else if (s.stage === 2 && s.altitude <= 50) {
          s.stage = 3;
          s.hazards = createHazards(9);
          setStage(3);
          playCapabilityUnlockChime();
          setUnlockModalStage(2);
        }

        // Move Plasma Bolts & Destroy Hazards
        const nextBolts: LaserBolt[] = [];
        for (const b of s.bolts) {
          b.y += b.vy;
          let hitHazard = false;
          for (const h of s.hazards) {
            if (Math.hypot(b.x - h.x, b.y - h.y) < h.radius + 10) {
              hitHazard = true;
              h.y = CANVAS_H + 50 + Math.random() * 80;
              h.x = 60 + Math.random() * (CANVAS_W - 120);
              playAtmosphereBuffet();
              break;
            }
          }
          if (!hitHazard && b.y < CANVAS_H + 20) {
            nextBolts.push(b);
          }
        }
        s.bolts = nextBolts;

        // Rising Obstacle Orbs
        const riseSpeed = s.stage === 1 ? 1.35 : s.stage === 2 ? 1.65 : 1.9;
        for (const h of s.hazards) {
          if (h.hitCooldown > 0) h.hitCooldown--;
          h.x += h.vx;
          if (h.x < 40 || h.x > CANVAS_W - 40) h.vx *= -1;

          if (s.altitude > 10) {
            h.y -= riseSpeed;
            if (h.y < -30) {
              h.y = CANVAS_H + 30;
              h.x = 60 + Math.random() * (CANVAS_W - 120);
            }
          }

          const probeY = s.altitude > 20 ? 155 : 155 + ((20 - s.altitude) / 20) * 280;
          const dist = Math.hypot(s.x - h.x, probeY - h.y);
          if (dist < h.radius + 16 && s.altitude > 6 && h.hitCooldown === 0) {
            h.hitCooldown = 45;

            if (s.shieldActiveTimer > 0) {
              // Shield absorbs impact and vaporizes orb
              h.y = CANVAS_H + 50;
              playMagneticShieldPulse();
            } else {
              s.hull = Math.max(0, s.hull - 16);
              s.vx += (s.x > h.x ? 1 : -1) * 2.4;
              playAtmosphereBuffet();

              if (s.hull <= 0) {
                playCrashExplosion();
                setFailReason(
                  'HULL INTEGRITY DEPLETED! Use your [S] Deflector Shield and [F] Pulse Cannon.'
                );
                setGameState('crashed');
              }
            }
          }
        }

        if (s.altitude <= 0) {
          const offset = Math.abs(s.x - s.padX);
          if (!s.chuteDeployed || s.vy > 8) {
            playCrashExplosion();
            setFailReason(`Hard impact at ${s.vy.toFixed(1)} m/s!`);
            setGameState('crashed');
          } else if (offset > 58) {
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
            hull: s.hull,
            chuteDeployed: s.chuteDeployed,
            shieldReady: s.shieldCooldown <= 0 && s.shieldActiveTimer <= 0,
            shieldActive: s.shieldActiveTimer > 0,
            cannonReady: s.cannonCooldown <= 0,
          });
        }
      }

      // Titan Atmosphere
      const skyGrad = ctx.createLinearGradient(0, 0, 0, CANVAS_H);
      if (s.stage === 1) {
        skyGrad.addColorStop(0, '#090D16');
        skyGrad.addColorStop(0.55, '#451A03');
        skyGrad.addColorStop(1, '#9A3412');
      } else if (s.stage === 2) {
        skyGrad.addColorStop(0, '#78350F');
        skyGrad.addColorStop(0.5, '#C2410C');
        skyGrad.addColorStop(1, '#EA580C');
      } else {
        skyGrad.addColorStop(0, '#92400E');
        skyGrad.addColorStop(0.6, '#D97706');
        skyGrad.addColorStop(1, '#F59E0B');
      }
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

      ctx.fillStyle = 'rgba(254, 243, 199, 0.07)';
      for (let i = 0; i < 5; i++) {
        const bandY = (((i * 115 - s.tick * 0.9) % CANVAS_H) + CANVAS_H) % CANVAS_H;
        ctx.fillRect(0, bandY, CANVAS_W, 28);
      }

      // Obstacle Orbs
      if (s.altitude > 8) {
        for (const h of s.hazards) {
          ctx.fillStyle =
            h.type === 'plasma' ? 'rgba(244, 63, 94, 0.35)' : 'rgba(56, 189, 248, 0.32)';
          ctx.beginPath();
          ctx.arc(h.x, h.y, h.radius, 0, Math.PI * 2);
          ctx.fill();

          ctx.strokeStyle = h.type === 'plasma' ? '#FB7185' : '#7DD3FC';
          ctx.lineWidth = 2;
          ctx.stroke();

          ctx.fillStyle = '#FFF';
          ctx.beginPath();
          ctx.arc(h.x, h.y, 4, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Plasma Pulse Bolts (Stage 3)
      for (const b of s.bolts) {
        ctx.fillStyle = '#38BDF8';
        ctx.fillRect(b.x - 3, b.y - 8, 6, 16);
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(b.x - 1, b.y - 6, 2, 12);
      }

      // Xanadu Shoreline Ground
      if (s.altitude < 26) {
        const groundY = CANVAS_H - ((26 - s.altitude) / 26) * 75;
        ctx.fillStyle = '#0F172A';
        ctx.fillRect(0, groundY, CANVAS_W, CANVAS_H - groundY);

        ctx.fillStyle = '#92400E';
        ctx.beginPath();
        ctx.ellipse(s.padX, groundY + 25, 115, 40, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#FACC15';
        ctx.fillRect(s.padX - 48, groundY - 2, 96, 8);
      }

      const probeY =
        s.altitude > 20 ? 155 : 155 + ((20 - Math.min(20, s.altitude)) / 20) * 280;

      // Stage 3 Radar Guide Beam
      if (s.stage === 3 && gameState === 'playing') {
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.5)';
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.moveTo(s.x, probeY + 12);
        ctx.lineTo(s.padX, CANVAS_H - 12);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // Parachute Canopy
      if (s.chuteDeployed) {
        ctx.strokeStyle = '#E2E8F0';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(s.x - 12, probeY - 6);
        ctx.lineTo(s.x - 42, probeY - 64);
        ctx.moveTo(s.x + 12, probeY - 6);
        ctx.lineTo(s.x + 42, probeY - 64);
        ctx.stroke();

        ctx.fillStyle = '#F8FAFC';
        ctx.beginPath();
        ctx.arc(s.x, probeY - 64, 42, Math.PI, 0);
        ctx.fill();

        if (s.stage >= 2) {
          ctx.fillStyle = '#EA580C';
          ctx.beginPath();
          ctx.arc(s.x, probeY - 64, 42, Math.PI * 1.25, Math.PI * 1.75);
          ctx.lineTo(s.x, probeY - 64);
          ctx.fill();
        }
      }

      // Huygens Probe Vehicle
      ctx.fillStyle = s.stage === 1 ? '#CBD5E1' : '#F8FAFC';
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

      // Active Deflector Shield Bubble (Stage 2+)
      if (s.shieldActiveTimer > 0) {
        ctx.fillStyle = 'rgba(56, 189, 248, 0.22)';
        ctx.beginPath();
        ctx.arc(s.x, probeY, 34, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = '#38BDF8';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(s.x, probeY, 34, 0, Math.PI * 2);
        ctx.stroke();
      }

      // RCS Thruster Plumes
      if (!paused && gameState === 'playing') {
        ctx.fillStyle = s.stage >= 2 ? '#38BDF8' : '#FDE047';
        if (s.keys.left) ctx.fillRect(s.x + 20, probeY - 2, 12, 4);
        if (s.keys.right) ctx.fillRect(s.x - 32, probeY - 2, 12, 4);
      }

      if (s.altitude >= 26 && gameState === 'playing') {
        ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
        ctx.fillRect(s.padX - 42, CANVAS_H - 26, 84, 20);
        ctx.strokeStyle = s.stage === 3 ? '#38BDF8' : '#FACC15';
        ctx.strokeRect(s.padX - 42, CANVAS_H - 26, 84, 20);
        ctx.fillStyle = s.stage === 3 ? '#38BDF8' : '#FACC15';
        ctx.font = 'bold 10px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(s.stage === 3 ? '▼ RADAR LOCK' : '▼ PAD ZONE', s.padX, CANVAS_H - 13);
      }

      animId = requestAnimationFrame(updateAndDraw);
    };

    animId = requestAnimationFrame(updateAndDraw);
    return () => cancelAnimationFrame(animId);
  }, [isPaused, unlockModalStage, gameState, onComplete]);

  return (
    <div className="flex flex-col items-center">
      <div className="mb-3 grid w-full max-w-[640px] grid-cols-4 gap-2 rounded-lg border border-slate-800 bg-slate-900 p-3 font-mono text-xs">
        <div>
          <span className="block text-[10px] text-slate-400">STAGE / ALT</span>
          <span className="text-sm font-bold text-sky-400">
            {stage}/3 • {hud.altitude}km
          </span>
        </div>
        <div>
          <span className="block text-[10px] text-slate-400">HULL</span>
          <span
            className={`text-sm font-bold ${
              hud.hull <= 32 ? 'animate-pulse text-rose-400' : 'text-emerald-400'
            }`}
          >
            {hud.hull}%
          </span>
        </div>
        <div>
          <span className="block text-[10px] text-slate-400">SHIELD [S]</span>
          <span
            className={`text-sm font-bold ${
              stage < 2
                ? 'text-slate-600'
                : hud.shieldActive
                  ? 'animate-pulse text-sky-300'
                  : hud.shieldReady
                    ? 'text-emerald-400'
                    : 'text-amber-400'
            }`}
          >
            {stage < 2
              ? 'LOCKED'
              : hud.shieldActive
                ? 'ACTIVE'
                : hud.shieldReady
                  ? 'READY'
                  : 'RECHARGING'}
          </span>
        </div>
        <div>
          <span className="block text-[10px] text-slate-400">
            {stage >= 3 ? 'CANNON [F]' : 'PARACHUTE'}
          </span>
          <span
            className={`text-sm font-bold ${
              stage >= 3
                ? hud.cannonReady
                  ? 'text-sky-400'
                  : 'text-slate-500'
                : hud.chuteDeployed
                  ? 'text-emerald-400'
                  : hud.altitude <= 130
                    ? 'animate-pulse text-amber-300'
                    : 'text-slate-500'
            }`}
          >
            {stage >= 3
              ? hud.cannonReady
                ? 'ARMED'
                : 'COOLING'
              : hud.chuteDeployed
                ? 'DEPLOYED'
                : hud.altitude <= 130
                  ? 'ARMED!'
                  : 'WAIT'}
          </span>
        </div>
      </div>

      <div className="relative overflow-hidden rounded-xl border-4 border-slate-700 bg-slate-950 shadow-2xl">
        <canvas ref={canvasRef} width={CANVAS_W} height={CANVAS_H} className="block max-w-full" />

        {gameState === 'crashed' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-rose-950/88 p-6 text-center backdrop-blur-xs">
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

        {unlockModalStage === 1 && (
          <TelemetryUnlockOverlay
            isOpen
            stageCompleted={1}
            totalStages={3}
            unlockedParagraphs={missionData.paragraphs.slice(0, 1)}
            imageUrl={missionData.imageUrl}
            imageCaption={missionData.imageCaption}
            unlockedCapabilityName="Deflector Shield Dome [S] & Hull Repair"
            unlockedCapabilityDesc="Main striped parachute deployed and hull repaired +25%! Press [S] or [SHIFT] to toggle an electromagnetic deflector dome that absorbs storm orb impacts."
            onContinue={() => {
              simRef.current.hull = Math.min(100, simRef.current.hull + 25);
              setUnlockModalStage(null);
              onActionLabelChange('SHIELD');
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
            unlockedCapabilityName="Atmospheric Plasma Pulse Cannon [F] & Radar Altimeter"
            unlockedCapabilityDesc="Press [F] or [SPACE] to fire downward plasma bolts that vaporize incoming storm orbs! Follow the cyan radar beam onto the solid Xanadu peninsula."
            onContinue={() => {
              simRef.current.hull = Math.min(100, simRef.current.hull + 25);
              setUnlockModalStage(null);
              onActionLabelChange('FIRE');
            }}
          />
        )}

        {gameState === 'landed' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-emerald-950/85 p-6 text-center backdrop-blur-xs">
            <p className="animate-pulse font-mono text-lg font-bold tracking-wider text-emerald-300">
              TOUCHDOWN CONFIRMED ON TITAN!
            </p>
            <p className="mt-1 font-mono text-xs text-emerald-100">
              Decrypting full Huygens mission dossier...
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
