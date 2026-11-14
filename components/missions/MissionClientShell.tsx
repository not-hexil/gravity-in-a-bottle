'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { MISSION_MODALS, MISSION_INSTRUCTIONS } from '@/data/missions';
import { MissionSlug } from '@/types/game';
import { playMechKeyPress, playMechKeyRelease } from '@/utils/soundEffects';
import MissionModal from '@/components/ui/MissionModal';
import InstructionModal from '@/components/ui/InstructionModal';
import MobileDPad from '@/components/ui/MobileDPad';
import HuygensGame from '@/components/missions/HuygensGame';
import LunokhodGame from '@/components/missions/LunokhodGame';
import GalileoGame from '@/components/missions/GalileoGame';
import IngenuityGame from '@/components/missions/IngenuityGame';
import Surveyor3Game from '@/components/missions/Surveyor3Game';
import Venera13Game from '@/components/missions/Venera13Game';
import MessengerGame from '@/components/missions/MessengerGame';

interface MissionClientShellProps {
  slug: MissionSlug;
}

const DEFAULT_ACTION_LABELS: Record<MissionSlug, string> = {
  huygens: 'CHUTE',
  lunokhod: 'PING',
  surveyor3: 'SCOOP',
  venera13: 'DRILL',
  messenger: 'SCAN',
  galileo: 'TUNE',
  ingenuity: 'LIFT',
};

const DEFAULT_PLANET_FOR_MISSION: Record<MissionSlug, string> = {
  messenger: 'mercury',
  lunokhod: 'moon',
  surveyor3: 'moon',
  venera13: 'venus',
  ingenuity: 'mars',
  galileo: 'jupiter',
  huygens: 'saturn',
};

export default function MissionClientShell({ slug }: MissionClientShellProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const missionData = MISSION_MODALS[slug];
  const instructionData = MISSION_INSTRUCTIONS[slug];

  const parentPlanet = searchParams.get('planet') || DEFAULT_PLANET_FOR_MISSION[slug];

  const [hasStarted, setHasStarted] = useState(false);
  const [instructionOpen, setInstructionOpen] = useState(true);
  const [completionModalOpen, setCompletionModalOpen] = useState(false);
  const [resetSignal, setResetSignal] = useState(0);
  const [actionLabel, setActionLabel] = useState(DEFAULT_ACTION_LABELS[slug]);

  const handleStartOrResume = () => {
    setHasStarted(true);
    setInstructionOpen(false);
  };

  const handleRestart = () => {
    setResetSignal((prev) => prev + 1);
    setActionLabel(DEFAULT_ACTION_LABELS[slug]);
    setHasStarted(false);
    setInstructionOpen(true);
    setCompletionModalOpen(false);
  };

  const handleMissionComplete = () => {
    try {
      const existingRaw = window.localStorage.getItem('gravity_completed_missions');
      const existing: string[] = existingRaw ? JSON.parse(existingRaw) : [];
      if (!existing.includes(slug)) {
        window.localStorage.setItem(
          'gravity_completed_missions',
          JSON.stringify([...existing, slug])
        );
      }
    } catch {
      // Ignore storage errors
    }
    setCompletionModalOpen(true);
  };

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.isTrusted && !e.repeat) {
        playMechKeyPress(e.key === ' ' || e.key === 'Enter');
      }

      if (completionModalOpen) return;
      if (e.key === 'p' || e.key === 'P' || e.key === 'Escape' || e.key === 'h' || e.key === 'H') {
        e.preventDefault();
        if (!hasStarted) {
          setHasStarted(true);
          setInstructionOpen(false);
        } else {
          setInstructionOpen((prev) => !prev);
        }
      }
    };

    const onKeyUp = (e: KeyboardEvent) => {
      if (e.isTrusted) {
        playMechKeyRelease();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, [completionModalOpen, hasStarted]);

  if (!missionData || !instructionData) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-slate-950 text-white">
        <p className="font-mono">Unknown mission facility.</p>
        <button
          onClick={() => router.push('/')}
          className="mt-4 rounded bg-amber-500 px-4 py-2 font-mono text-xs font-bold text-slate-950"
        >
          Back to Solar System
        </button>
      </div>
    );
  }

  const isPaused = !hasStarted || instructionOpen || completionModalOpen;

  return (
    <main className="flex min-h-screen flex-col items-center justify-between bg-slate-950 px-3 py-4 text-slate-100 sm:justify-center sm:px-4 sm:py-6">
      <div className="mb-3 flex w-full max-w-[640px] items-center justify-between gap-2">
        <button
          onClick={() => router.push(`/planets/${parentPlanet}`)}
          className="rounded-lg border border-slate-800 bg-slate-900 px-3 py-1.5 font-mono text-xs font-bold text-slate-300 transition hover:border-amber-400 hover:text-amber-300"
        >
          {`← ${parentPlanet.toUpperCase()} ARCHIVE`}
        </button>

        <span className="hidden font-mono text-xs font-bold uppercase tracking-wider text-slate-400 sm:inline">
          {missionData.subtitle}
        </span>

        <button
          onClick={() => setInstructionOpen(true)}
          className="rounded-lg border border-amber-500/40 bg-slate-900 px-3 py-1.5 font-mono text-xs font-bold text-amber-400 transition hover:bg-amber-500 hover:text-slate-950"
        >
          {'⏸ BRIEFING [P]'}
        </button>
      </div>

      <div className="w-full max-w-[640px]">
        {slug === 'huygens' && (
          <HuygensGame
            key={resetSignal}
            isPaused={isPaused}
            missionData={missionData}
            onActionLabelChange={setActionLabel}
            onComplete={handleMissionComplete}
          />
        )}
        {slug === 'lunokhod' && (
          <LunokhodGame
            key={resetSignal}
            isPaused={isPaused}
            missionData={missionData}
            onActionLabelChange={setActionLabel}
            onComplete={handleMissionComplete}
          />
        )}
        {slug === 'surveyor3' && (
          <Surveyor3Game
            key={resetSignal}
            isPaused={isPaused}
            missionData={missionData}
            onActionLabelChange={setActionLabel}
            onComplete={handleMissionComplete}
          />
        )}
        {slug === 'galileo' && (
          <GalileoGame
            key={resetSignal}
            isPaused={isPaused}
            missionData={missionData}
            onActionLabelChange={setActionLabel}
            onComplete={handleMissionComplete}
          />
        )}
        {slug === 'ingenuity' && (
          <IngenuityGame
            key={resetSignal}
            isPaused={isPaused}
            missionData={missionData}
            onActionLabelChange={setActionLabel}
            onComplete={handleMissionComplete}
          />
        )}
        {slug === 'venera13' && (
                  <Venera13Game
                    key={resetSignal}
                    isPaused={isPaused}
                    missionData={missionData}
                    onActionLabelChange={setActionLabel}
                    onComplete={handleMissionComplete}
                  />
        )}
        {slug === 'messenger' && (
                  <MessengerGame
                    key={resetSignal}
                    isPaused={isPaused}
                    missionData={missionData}
                    onActionLabelChange={setActionLabel}
                    onComplete={handleMissionComplete}
                  />
        )}
      </div>

      <MobileDPad actionLabel={actionLabel} disabled={isPaused} />

      <InstructionModal
        isOpen={instructionOpen}
        isInitialStart={!hasStarted}
        data={instructionData}
        onResumeOrStart={handleStartOrResume}
        onRestart={handleRestart}
      />

      <MissionModal
        isOpen={completionModalOpen}
        data={missionData}
        onClose={handleRestart}
        onReturnToTown={() => router.push(`/planets/${parentPlanet}`)}
      />
    </main>
  );
}
