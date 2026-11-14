'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { MISSION_MODALS, MISSION_INSTRUCTIONS } from '@/data/missions';
import { MissionSlug } from '@/types/game';
import MissionModal from '@/components/ui/MissionModal';
import InstructionModal from '@/components/ui/InstructionModal';
import MobileDPad from '@/components/ui/MobileDPad';
import HuygensGame from '@/components/missions/HuygensGame';
import LunokhodGame from '@/components/missions/LunokhodGame';
import GalileoGame from '@/components/missions/GalileoGame';
import IngenuityGame from '@/components/missions/IngenuityGame';

interface MissionClientShellProps {
  slug: MissionSlug;
}

export default function MissionClientShell({ slug }: MissionClientShellProps) {
  const router = useRouter();
  const missionData = MISSION_MODALS[slug];
  const instructionData = MISSION_INSTRUCTIONS[slug];

  const [hasStarted, setHasStarted] = useState(false);
  const [instructionOpen, setInstructionOpen] = useState(true);
  const [completionModalOpen, setCompletionModalOpen] = useState(false);
  const [resetSignal, setResetSignal] = useState(0);

  const handleStartOrResume = useCallback(() => {
    setHasStarted(true);
    setInstructionOpen(false);
  }, []);

  const handleRestart = useCallback(() => {
    setResetSignal((prev) => prev + 1);
    setHasStarted(false);
    setInstructionOpen(true);
    setCompletionModalOpen(false);
  }, []);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (completionModalOpen) return;
      if (e.key === 'p' || e.key === 'P' || e.key === 'Escape' || e.key === 'h' || e.key === 'H') {
        e.preventDefault();
        if (!hasStarted) {
          handleStartOrResume();
        } else {
          setInstructionOpen((prev) => !prev);
        }
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [completionModalOpen, hasStarted, handleStartOrResume]);

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
      {/* Top Facility Header Bar */}
      <div className="mb-3 flex w-full max-w-[640px] items-center justify-between gap-2">
        <button
          onClick={() => router.push('/')}
          className="rounded-lg border border-slate-800 bg-slate-900 px-3 py-1.5 font-mono text-xs font-bold text-slate-300 transition hover:border-amber-400 hover:text-amber-300"
        >
          ← SOLAR SYSTEM
        </button>

        <span className="hidden font-mono text-xs font-bold uppercase tracking-wider text-slate-400 sm:inline">
          {missionData.subtitle}
        </span>

        <button
          onClick={() => setInstructionOpen(true)}
          className="rounded-lg border border-amber-500/40 bg-slate-900 px-3 py-1.5 font-mono text-xs font-bold text-amber-400 transition hover:bg-amber-500 hover:text-slate-950"
        >
          ⏸ BRIEFING [P]
        </button>
      </div>

      {/* Dedicated Minigame Viewport */}
      <div className="w-full max-w-[640px]">
        {slug === 'huygens' && (
          <HuygensGame
            isPaused={isPaused}
            resetSignal={resetSignal}
            onComplete={() => setCompletionModalOpen(true)}
          />
        )}
        {slug === 'lunokhod' && (
          <LunokhodGame
            isPaused={isPaused}
            resetSignal={resetSignal}
            onComplete={() => setCompletionModalOpen(true)}
          />
        )}
        {slug === 'galileo' && (
          <GalileoGame
            isPaused={isPaused}
            resetSignal={resetSignal}
            onComplete={() => setCompletionModalOpen(true)}
          />
        )}
        {slug === 'ingenuity' && (
          <IngenuityGame
            isPaused={isPaused}
            resetSignal={resetSignal}
            onComplete={() => setCompletionModalOpen(true)}
          />
        )}
      </div>

      {/* Universal Mobile D-Pad & Action Button (Hidden on Desktop) */}
      <MobileDPad slug={slug} disabled={isPaused} />

      {/* Pre-Game Briefing & Pause Modal */}
      <InstructionModal
        isOpen={instructionOpen}
        isInitialStart={!hasStarted}
        data={instructionData}
        onResumeOrStart={handleStartOrResume}
        onRestart={handleRestart}
      />

      {/* Completion Dossier Modal */}
      <MissionModal
        isOpen={completionModalOpen}
        data={missionData}
        onClose={handleRestart}
        onReturnToTown={() => router.push('/')}
      />
    </main>
  );
}
