'use client';

import React, { useCallback, useEffect, useState } from 'react';
import {
  CREW,
  S0_LORE_LINES,
  S1_DIALOGUE,
  S4_DIALOGUE,
  S5_CREDITS_BLOCKS,
} from '@/lib/storyData';
import { StoryDialogueBox } from './StoryDialogueBox';
import { retroAudio } from '@/lib/retroAudio';

export interface AssetOverrides {
  loreBg?: string;
  crewDeckBg?: string;
  endingBg?: string;
  getSpriteUrl?: (speaker: number) => string | null;
  getPortraitUrl?: (speaker: number) => string | null;
}

type S0Phase = 'TITLE' | 'PLAYING_LORE' | 'READY_TO_PLAY';

export const Scene0LoreIntro: React.FC<{
  onComplete: () => void;
  assets?: AssetOverrides;
}> = ({ onComplete, assets }) => {
  const [phase, setPhase] = useState<S0Phase>('TITLE');
  const [lineIndex, setLineIndex] = useState(0);
  const [charCount, setCharCount] = useState(0);

  const currentLine = S0_LORE_LINES[lineIndex] || '';

  useEffect(() => {
    if (phase !== 'PLAYING_LORE') return;

    if (charCount < currentLine.length) {
      const t = setTimeout(() => {
        const nextChar = currentLine[charCount];
        setCharCount((c) => c + 1);
        if (nextChar !== ' ') retroAudio.playBlip(340);
      }, 35);
      return () => clearTimeout(t);
    } else {
      const pause = setTimeout(() => {
        if (lineIndex < S0_LORE_LINES.length - 1) {
          setLineIndex((i) => i + 1);
          setCharCount(0);
        } else {
          setPhase('READY_TO_PLAY');
        }
      }, 950);
      return () => clearTimeout(pause);
    }
  }, [phase, charCount, lineIndex, currentLine]);

  const handleAdvance = useCallback(() => {
    if (phase === 'TITLE') {
      retroAudio.playBootBeep();
      setPhase('PLAYING_LORE');
      setLineIndex(0);
      setCharCount(0);
    } else if (phase === 'READY_TO_PLAY') {
      retroAudio.playBootBeep();
      onComplete();
    }
  }, [phase, onComplete]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleAdvance();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [handleAdvance]);

  return (
    <div
      onClick={handleAdvance}
      className={`relative w-full h-screen bg-black text-white font-mono flex flex-col items-center justify-center p-6 overflow-hidden select-none ${
        phase === 'PLAYING_LORE' ? 'cursor-default' : 'cursor-pointer'
      }`}
      style={{
        backgroundImage: assets?.loreBg ? `url(${assets.loreBg})` : undefined,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        imageRendering: 'pixelated',
      }}
    >
      {!assets?.loreBg && (
        <div className="absolute inset-0 pointer-events-none opacity-80">
          {Array.from({ length: 45 }).map((_, i) => (
            <div
              key={i}
              className="absolute bg-white animate-pulse"
              style={{
                width: i % 3 === 0 ? '3px' : '2px',
                height: i % 3 === 0 ? '3px' : '2px',
                top: `${(i * 23) % 100}%`,
                left: `${(i * 41) % 100}%`,
                animationDelay: `${(i % 5) * 0.4}s`,
              }}
            />
          ))}
        </div>
      )}

      <div className="relative z-10 max-w-3xl w-full text-center space-y-8">
        {phase === 'TITLE' && (
          <div className="space-y-6">
            <p className="text-xs md:text-sm text-sky-400 tracking-[0.25em] uppercase">
              NASA Space Apps Challenge 2026 • Team Gravity in Space
            </p>
            <h1 className="text-3xl md:text-6xl font-extrabold tracking-wider text-amber-300 border-y-4 border-sky-400 py-6 shadow-[0_0_40px_rgba(56,189,248,0.2)]">
              GRAVITY IN A BOTTLE
            </h1>
            <p className="text-sm md:text-base text-slate-300">
              ODYSSEY-6 | ARCHIVE TERMINAL
            </p>
            <p className="text-sm md:text-lg text-sky-300 animate-bounce pt-6 tracking-widest">
              [ PRESS ENTER TO INITIATE ]
            </p>
          </div>
        )}

        {phase === 'PLAYING_LORE' && (
          <div className="space-y-6">
            <p className="text-xl md:text-3xl leading-relaxed tracking-wide min-h-[5rem] text-slate-100">
              {currentLine.slice(0, charCount)}
              <span className="inline-block w-2.5 h-6 ml-1 bg-sky-400 animate-pulse" />
            </p>
          </div>
        )}

        {phase === 'READY_TO_PLAY' && (
          <div className="space-y-8">
            <p className="text-2xl md:text-4xl font-bold text-amber-300 tracking-wider">
              {S0_LORE_LINES[S0_LORE_LINES.length - 1]}
            </p>
            <p className="text-sm md:text-lg text-emerald-400 animate-bounce pt-4 tracking-widest">
              [ PRESS ENTER TO PLAY ]
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export const Scene1CrewDeck: React.FC<{
  onComplete: () => void;
  assets?: AssetOverrides;
}> = ({ onComplete, assets }) => {
  const [index, setIndex] = useState(0);
  const [fadingOut, setFadingOut] = useState(false);

  const currentLine = S1_DIALOGUE[index];

  const handleNext = () => {
    if (index < S1_DIALOGUE.length - 1) {
      setIndex((i) => i + 1);
    } else {
      setFadingOut(true);
      setTimeout(() => onComplete(), 900);
    }
  };

  return (
    <div
      className={`relative w-full h-screen bg-slate-900 text-white font-mono flex flex-col justify-between p-4 md:p-8 transition-opacity duration-700 ${
        fadingOut ? 'opacity-0' : 'opacity-100'
      }`}
      style={{
        backgroundImage: assets?.crewDeckBg ? `url(${assets.crewDeckBg})` : undefined,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        imageRendering: 'pixelated',
      }}
    >
      <div className="z-10 flex justify-between items-center bg-slate-950/90 border-2 border-amber-500/70 px-4 py-2 text-xs md:text-sm">
        <span className="text-amber-400 font-bold tracking-wider">
          ODYSSEY-6 | CREW DECK
        </span>
        <span className="text-red-400 animate-pulse">
          19 DAYS WITHOUT CONTACT
        </span>
      </div>

      <div className="relative z-10 flex-1 flex items-center justify-center">
        <div className="grid grid-cols-3 md:grid-cols-6 gap-6 md:gap-10 items-center bg-slate-950/60 p-6 rounded border border-slate-700/80">
          {[1, 2, 3, 4, 5, 6].map((id) => {
            const member = CREW[id];
            const isSpeaking = currentLine.speaker === id;
            const spriteUrl = assets?.getSpriteUrl ? assets.getSpriteUrl(id) : null;

            return (
              <div
                key={id}
                className={`flex flex-col items-center transition-transform duration-200 ${
                  isSpeaking ? '-translate-y-2 scale-110' : 'opacity-80'
                }`}
              >
                {spriteUrl ? (
                  <img
                    src={spriteUrl}
                    alt={member.name}
                    className="w-16 h-16 object-contain"
                  />
                ) : (
                  <div
                    className={`w-12 h-12 border-2 ${
                      isSpeaking ? 'border-white shadow-[0_0_12px_#fff]' : 'border-slate-950'
                    } flex items-center justify-center text-xs font-bold`}
                    style={{ backgroundColor: member.suitColor }}
                  >
                    C{id}
                  </div>
                )}
                <span className="mt-2 text-[11px] bg-black/75 px-1.5 py-0.5 rounded">
                  {member.name}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="z-10">
        <StoryDialogueBox
          line={currentLine}
          onNext={handleNext}
          getPortraitUrl={assets?.getPortraitUrl}
        />
      </div>
    </div>
  );
};

const FinalImpactOverlay: React.FC<{
  onViewCredits: () => void;
  onGoHome: () => void;
}> = ({ onViewCredits, onGoHome }) => {
  const headline = '“We’ve always been listening.”';
  const subline = '... WELCOME BACK...ODYSSEY-6... THIS IS MISSION CONTROL, EARTH.';
  const [typedCount, setTypedCount] = useState(0);

  const isDone = typedCount >= headline.length;

  useEffect(() => {
    retroAudio.playBootBeep();
  }, []);

  useEffect(() => {
    if (typedCount >= headline.length) return;
    const t = setTimeout(() => {
      setTypedCount((c) => c + 1);
      retroAudio.playBlip(360);
    }, 55);
    return () => clearTimeout(t);
  }, [typedCount, headline.length]);

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/98 text-white font-mono flex flex-col items-center justify-center p-6 text-center overflow-hidden">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            'radial-gradient(circle at center, rgba(34,211,238,0.18) 0%, rgba(2,6,23,0.96) 72%), repeating-linear-gradient(0deg, rgba(34,211,238,0.06) 0px, rgba(34,211,238,0.06) 1px, transparent 1px, transparent 4px)',
        }}
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute w-72 h-72 md:w-[32rem] md:h-[32rem] rounded-full border border-cyan-400/25 animate-ping"
        style={{ animationDuration: '3.2s' }}
      />

      <div className="relative z-10 max-w-4xl w-full space-y-8">
        <p className="text-xs md:text-sm tracking-[0.3em] text-cyan-400 uppercase animate-pulse">
          {subline}
        </p>

        <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-wide text-cyan-200 leading-tight drop-shadow-[0_0_28px_rgba(34,211,238,0.65)] min-h-[5rem] flex items-center justify-center">
          <span>
            {headline.slice(0, typedCount)}
            {!isDone && (
              <span className="inline-block w-3 h-10 md:h-12 ml-1 bg-cyan-300 animate-pulse align-middle" />
            )}
          </span>
        </h1>

        {isDone && (
          <div className="pt-8 space-y-6">
            <p className="text-xs md:text-sm text-amber-300 tracking-widest uppercase">
              Gravity in a bottle | fin
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
              <button
                onClick={onViewCredits}
                className="w-full sm:w-auto px-6 py-3 border-2 border-cyan-400 bg-cyan-400 text-slate-950 font-bold text-sm tracking-widest hover:bg-cyan-300 transition cursor-pointer"
              >
                ▶ VIEW CREDITS
              </button>
              <button
                onClick={onGoHome}
                className="w-full sm:w-auto px-6 py-3 border-2 border-slate-500 bg-slate-900/90 text-slate-200 font-bold text-sm tracking-widest hover:border-amber-400 hover:text-amber-300 transition cursor-pointer"
              >
                ⌂ RETURN TO MISSION CONTROL
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export const Scene4Ending: React.FC<{
  onComplete: () => void;
  onGoHome?: () => void;
  assets?: AssetOverrides;
}> = ({ onComplete, onGoHome, assets }) => {
  const [index, setIndex] = useState(0);
  const [showImpactFinale, setShowImpactFinale] = useState(false);

  const currentLine = S4_DIALOGUE[index];
  const showSignalShip = index >= 6;

  const handleNext = () => {
    if (currentLine.id === 'E7' || index >= S4_DIALOGUE.length - 1) {
      setShowImpactFinale(true);
    } else {
      setIndex((i) => i + 1);
    }
  };

  return (
    <div
      className="relative w-full h-screen bg-slate-900 text-white font-mono flex flex-col justify-between p-4 md:p-8"
      style={{
        backgroundImage:
          showSignalShip && assets?.endingBg
            ? `url(${assets.endingBg})`
            : assets?.crewDeckBg
            ? `url(${assets.crewDeckBg})`
            : undefined,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        imageRendering: 'pixelated',
      }}
    >
      <div className="absolute inset-0 bg-amber-500/10 pointer-events-none" />

      <div className="z-10 flex justify-between items-center bg-slate-950/90 border-2 border-emerald-400/70 px-4 py-2 text-xs md:text-sm">
        <span className="text-amber-300 font-bold tracking-wider">
          ODYSSEY-6 | CREW DECK
        </span>
        <span className="text-emerald-400">
          {showSignalShip ? 'TRANSMITTING SIGNAL...' : 'BACKUP DISH ONLINE'}
        </span>
      </div>

      <div className="relative z-10 flex-1 flex items-center justify-center">
        {showSignalShip && !assets?.endingBg ? (
          <div className="text-center space-y-3 bg-slate-950/80 border-2 border-cyan-400 p-6 rounded">
            <div className="text-cyan-300 text-sm tracking-widest animate-ping">
              (( ( • ) ))
            </div>
            <p className="text-xs text-slate-300">
              [ODYSSEY-6 DISH TRANSMITTING TOWARD EARTH]
            </p>
          </div>
        ) : !showSignalShip ? (
          <div className="grid grid-cols-3 md:grid-cols-6 gap-6 items-center bg-slate-950/60 p-6 rounded border border-amber-500/40">
            {[1, 2, 3, 4, 5, 6].map((id) => {
              const member = CREW[id];
              const isSpeaking = currentLine.speaker === id;
              const spriteUrl = assets?.getSpriteUrl ? assets.getSpriteUrl(id) : null;

              return (
                <div
                  key={id}
                  className={`flex flex-col items-center transition-transform duration-200 ${
                    isSpeaking ? '-translate-y-2 scale-110' : 'opacity-85'
                  }`}
                >
                  {spriteUrl ? (
                    <img
                      src={spriteUrl}
                      alt={member.name}
                      className="w-16 h-16 object-contain"
                    />
                  ) : (
                    <div
                      className="w-12 h-12 border-2 border-amber-200 flex items-center justify-center text-xs font-bold"
                      style={{ backgroundColor: member.suitColor }}
                    >
                      C{id}
                    </div>
                  )}
                  <span className="mt-2 text-[11px] bg-black/75 px-1.5 py-0.5 rounded">
                    {member.name}
                  </span>
                </div>
              );
            })}
          </div>
        ) : null}
      </div>

      {!showImpactFinale && (
        <div className="z-10">
          <StoryDialogueBox
            line={currentLine}
            onNext={handleNext}
            getPortraitUrl={assets?.getPortraitUrl}
          />
        </div>
      )}

      {showImpactFinale && (
        <FinalImpactOverlay
          onViewCredits={onComplete}
          onGoHome={onGoHome ?? onComplete}
        />
      )}
    </div>
  );
};

export const Scene5Credits: React.FC<{
  onRestart?: () => void;
  onGoHome?: () => void;
}> = ({ onRestart, onGoHome }) => {
  const [showFinalCard, setShowFinalCard] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowFinalCard(true), 18000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="relative w-full h-screen bg-black text-white font-mono overflow-hidden flex flex-col items-center justify-center p-6 select-none">
      {!showFinalCard ? (
        <>
          <style>{`
            @keyframes pixelScroll {
              0% { transform: translateY(70vh); }
              100% { transform: translateY(-110%); }
            }
            .animate-credits {
              animation: pixelScroll 18s linear forwards;
            }
          `}</style>

          <div className="animate-credits max-w-xl w-full text-center space-y-12">
            {S5_CREDITS_BLOCKS.map((block, idx) => (
              <div key={idx} className="space-y-2">
                <h3 className="text-amber-300 text-sm md:text-base font-bold tracking-widest">
                  {block.heading}
                </h3>
                <p className="text-slate-300 text-xs md:text-sm whitespace-pre-line leading-relaxed">
                  {block.body}
                </p>
              </div>
            ))}
          </div>

          <button
            onClick={() => setShowFinalCard(true)}
            className="absolute bottom-6 right-6 text-xs text-slate-500 hover:text-sky-400 cursor-pointer"
          >
            SKIP CREDITS ▸
          </button>
        </>
      ) : (
        <div className="text-center space-y-6">
          <h2 className="text-2xl md:text-4xl font-bold tracking-widest text-sky-300 border-y-2 border-sky-500 py-4 px-6">
            Abandoned but not Forgotten
          </h2>
          <p className="text-xs text-slate-400">
            Team Gravity in Space • NASA Space Apps Challenge 2026
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            {onGoHome && (
              <button
                onClick={onGoHome}
                className="px-4 py-2 border-2 border-emerald-400 text-emerald-300 hover:bg-emerald-400 hover:text-black text-xs tracking-widest transition-colors cursor-pointer"
              >
                RETURN TO MISSION CONTROL
              </button>
            )}
            {onRestart && (
              <button
                onClick={onRestart}
                className="px-4 py-2 border-2 border-sky-400 text-sky-300 hover:bg-sky-400 hover:text-black text-xs tracking-widest transition-colors cursor-pointer"
              >
                PLAY FROM TITLE
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
