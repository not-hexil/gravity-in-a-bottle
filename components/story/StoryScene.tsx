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
  logoUrl?: string;
  titleImageUrl?: string;
  creditsLogo1Url?: string;
  creditsLogo2Url?: string;
  loreBg?: string;
  crewDeckBg?: string;
  endingBg?: string;
  getSpriteUrl?: (speaker: number) => string | null;
  getPortraitUrl?: (speaker: number) => string | null;
}

const CREW_POSITIONS: Record<number, { x: number; y: number }> = {
  1: { x: 850, y: 580 },
  2: { x: 1100, y: 370 },
  3: { x: 1150, y: 220 },
  4: { x: 1250, y: 250 },
  5: { x: 460, y: 260 },
  6: { x: 900, y: 230 },
};

// Scene 0
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
      }, 65);
      return () => clearTimeout(t);
    } else {
      const pause = setTimeout(() => {
        if (lineIndex < S0_LORE_LINES.length - 1) {
          setLineIndex((i) => i + 1);
          setCharCount(0);
        } else {
          setPhase('READY_TO_PLAY');
        }
      }, 1300);
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
      <style>{`
        @keyframes retroFlicker {
          0%, 100% { opacity: 0.97; }
          48% { opacity: 1; }
          50% { opacity: 0.91; }
          52% { opacity: 0.99; }
        }
        @keyframes retroCursorBlink {
          0%, 49% { opacity: 1; }
          50%, 100% { opacity: 0; }
        }
        .retro-text-cyan {
          text-shadow:
            -1px 0 rgba(255, 0, 85, 0.45),
            1px 0 rgba(0, 255, 255, 0.55),
            0 0 10px rgba(56, 189, 248, 0.75);
          animation: retroFlicker 4s infinite;
        }
        .retro-text-lore {
          text-shadow:
            -1.5px 0 rgba(239, 68, 68, 0.55),
            1.5px 0 rgba(34, 211, 238, 0.65),
            0 0 14px rgba(125, 211, 252, 0.65);
          animation: retroFlicker 3.5s infinite;
        }
        .retro-text-amber {
          text-shadow:
            -1.5px 0 rgba(239, 68, 68, 0.55),
            1.5px 0 rgba(56, 189, 248, 0.55),
            0 0 16px rgba(251, 191, 36, 0.85);
          animation: retroFlicker 3s infinite;
        }
        .retro-cursor {
          animation: retroCursorBlink 0.75s steps(1) infinite;
        }
      `}</style>

      {/* CRT Scanline & Vignette Overlay */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-20"
        style={{
          backgroundImage:
            'radial-gradient(circle at center, transparent 58%, rgba(0, 0, 0, 0.72) 100%), repeating-linear-gradient(0deg, rgba(0, 0, 0, 0.28) 0px, rgba(0, 0, 0, 0.28) 1px, transparent 1px, transparent 3px)',
        }}
      />

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
          <div>
            <p className="relative z-10 text-xs md:text-sm text-sky-400 tracking-[0.25em] uppercase retro-text-cyan">
              NASA Space Apps Challenge 2026
            </p>

            {/* Logo 2.5x Larger with Negative Vertical Margin for Overlap */}
            <div className="relative z-0 -my-20 sm:-my-16 flex justify-center pointer-events-none">
              <img
                src={assets?.logoUrl || '/assets/logo.png'}
                alt="Gravity in a Bottle Logo"
                className="h-[25rem] w-[25rem] sm:h-[17.5rem] sm:w-[17.5rem] object-contain drop-shadow-[0_0_20px_rgba(56,189,248,0.45)]"
                style={{ imageRendering: 'pixelated' }}
              />
            </div>

            <p className="relative z-10 text-xs md:text-sm text-sky-400 tracking-[0.25em] retro-text-cyan">
              presents
            </p>

            <div className="relative z-10 flex justify-center">
              <h1 className="sr-only">GRAVITY IN A BOTTLE</h1>
              <img
                src={assets?.titleImageUrl || '/assets/title.png'}
                alt="Gravity in a Bottle"
                className="max-h-96 md:max-h-[33rem] w-auto object-contain drop-shadow-[0_0_25px_rgba(251,191,36,0.45)]"
                style={{ imageRendering: 'pixelated' }}
              />
            </div>

            <p className="relative z-10 mt-3 text-sm md:text-base text-slate-300 tracking-[0.2em] retro-text-cyan">
              ODYSSEY-6 | ARCHIVE TERMINAL
            </p>
            <p className="relative z-10 pt-6 text-sm md:text-lg text-sky-300 animate-bounce tracking-widest retro-text-cyan">
              [ PRESS ENTER TO INITIATE ]
            </p>
          </div>
        )}

        {phase === 'PLAYING_LORE' && (
          <div className="space-y-6">
            <p className="text-xl md:text-3xl leading-relaxed tracking-wider min-h-[5rem] text-cyan-100 retro-text-lore">
              {currentLine.slice(0, charCount)}
              <span className="inline-block ml-1 text-sky-400 retro-cursor">
                █
              </span>
            </p>
          </div>
        )}

        {phase === 'READY_TO_PLAY' && (
          <div className="space-y-8">
            <p className="text-2xl md:text-4xl font-bold text-amber-300 tracking-wider retro-text-amber">
              {S0_LORE_LINES[S0_LORE_LINES.length - 1]}
            </p>
            <p className="text-sm md:text-lg text-emerald-400 animate-bounce pt-4 tracking-widest retro-text-cyan">
              [ PRESS ENTER TO PLAY ]
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

// Scene 01
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
      className={`relative w-full h-screen bg-slate-900 text-white font-mono flex flex-col justify-between p-4 md:p-8 overflow-hidden transition-opacity duration-700 ${
        fadingOut ? 'opacity-0' : 'opacity-100'
      }`}
      style={{
        backgroundImage: assets?.crewDeckBg ? `url(${assets.crewDeckBg})` : undefined,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        imageRendering: 'pixelated',
      }}
    >
      <div className="z-30 flex justify-between items-center bg-slate-950/90 border-2 border-amber-500/70 px-4 py-2 text-xs md:text-sm">
        <span className="text-amber-400 font-bold tracking-wider">
          ODYSSEY-6 | CREW DECK
        </span>
        <span className="text-red-400 animate-pulse">
          19 DAYS WITHOUT CONTACT
        </span>
      </div>

      {[1, 2, 3, 4, 5, 6].map((id) => {
        const member = CREW[id];
        const isSpeaking = currentLine.speaker === id;
        const spriteUrl = assets?.getSpriteUrl ? assets.getSpriteUrl(id) : null;
        const pos = CREW_POSITIONS[id] || { x: 0, y: 0 };

        return (
          <div
            key={id}
            className={`absolute flex flex-col items-center transition-transform duration-200 ${
              isSpeaking ? 'opacity-100 z-20' : 'opacity-85 z-10'
            }`}
            style={{
              left: `${pos.x}px`,
              top: `${pos.y}px`,
              transform: isSpeaking ? 'scale(1.15)' : 'scale(1)',
            }}
          >
            {spriteUrl ? (
              <img
                src={spriteUrl}
                alt={member.name}
                className="w-32 h-32 object-contain"
              />
            ) : (
              <div
                className={`w-24 h-24 border-2 ${
                  isSpeaking ? 'border-white shadow-[0_0_12px_#fff]' : 'border-slate-950'
                } flex items-center justify-center text-sm font-bold`}
                style={{ backgroundColor: member.suitColor }}
              >
                C{id}
              </div>
            )}
            <span className="mt-2 text-xs bg-black/75 px-2 py-0.5 rounded text-white">
              {member.name}
            </span>
          </div>
        );
      })}

      <div className="z-30 mt-auto">
        <StoryDialogueBox
          line={currentLine}
          onNext={handleNext}
          getPortraitUrl={assets?.getPortraitUrl}
        />
      </div>
    </div>
  );
};

// Final Impact Overlay
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

// Scene 04
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
      className="relative w-full h-screen bg-slate-900 text-white font-mono flex flex-col justify-between p-4 md:p-8 overflow-hidden"
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

      <div className="z-30 flex justify-between items-center bg-slate-950/90 border-2 border-emerald-400/70 px-4 py-2 text-xs md:text-sm">
        <span className="text-amber-300 font-bold tracking-wider">
          ODYSSEY-6 | CREW DECK
        </span>
        <span className="text-emerald-400">
          {showSignalShip ? 'TRANSMITTING SIGNAL...' : 'BACKUP DISH ONLINE'}
        </span>
      </div>

      {!showSignalShip &&
        [1, 2, 3, 4, 5, 6].map((id) => {
          const member = CREW[id];
          const isSpeaking = currentLine.speaker === id;
          const spriteUrl = assets?.getSpriteUrl ? assets.getSpriteUrl(id) : null;
          const pos = CREW_POSITIONS[id] || { x: 0, y: 0 };

          return (
            <div
              key={id}
              className={`absolute flex flex-col items-center transition-transform duration-200 ${
                isSpeaking ? 'opacity-100 z-20' : 'opacity-85 z-10'
              }`}
              style={{
                left: `${pos.x}px`,
                top: `${pos.y}px`,
                transform: isSpeaking ? 'scale(1.15)' : 'scale(1)',
              }}
            >
              {spriteUrl ? (
                <img
                  src={spriteUrl}
                  alt={member.name}
                  className="w-32 h-32 object-contain"
                />
              ) : (
                <div
                  className="w-24 h-24 border-2 border-amber-200 flex items-center justify-center text-sm font-bold"
                  style={{ backgroundColor: member.suitColor }}
                >
                  C{id}
                </div>
              )}
              <span className="mt-2 text-xs bg-black/75 px-2 py-0.5 rounded text-white">
                {member.name}
              </span>
            </div>
          );
        })}

      {showSignalShip && !assets?.endingBg && (
        <div className="relative z-10 flex-1 flex items-center justify-center">
          <div className="text-center space-y-3 bg-slate-950/80 border-2 border-cyan-400 p-6 rounded">
            <div className="text-cyan-300 text-sm tracking-widest animate-ping">
              (( ( • ) ))
            </div>
            <p className="text-xs text-slate-300">
              [ODYSSEY-6 DISH TRANSMITTING TOWARD EARTH]
            </p>
          </div>
        </div>
      )}

      {!showImpactFinale && (
        <div className="z-30 mt-auto">
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

// Scene 05
export const Scene5Credits: React.FC<{
  onRestart?: () => void;
  onGoHome?: () => void;
  assets?: AssetOverrides;
}> = ({ onRestart, onGoHome, assets }) => {
  const [showFinalCard, setShowFinalCard] = useState(false);

  const logo1 = assets?.creditsLogo1Url || assets?.logoUrl || '/assets/logo.png';
  const logo2 = assets?.creditsLogo2Url || '/assets/title.png';

  useEffect(() => {
    const timer = setTimeout(() => setShowFinalCard(true), 18000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="relative w-full h-screen bg-black text-white font-mono overflow-hidden flex flex-col items-center justify-center p-6 select-none">
      <div className="fixed top-4 left-1/2 -translate-x-1/2 z-30 flex items-center justify-center gap-6 sm:gap-10 pointer-events-none">
        <img
          src={logo1}
          alt="Team Logo"
          className="h-44 w-44 sm:h-64 sm:w-64 object-contain drop-shadow-[0_0_16px_rgba(56,189,248,0.45)]"
          style={{ imageRendering: 'pixelated' }}
        />
        <div className="h-32 w-px bg-slate-700" />
        <img
          src={logo2}
          alt="Project Logo"
          className="h-44 w-44 sm:h-64 sm:w-64 object-contain drop-shadow-[0_0_16px_rgba(250,204,21,0.45)]"
          style={{ imageRendering: 'pixelated' }}
        />
      </div>

      {!showFinalCard ? (
        <>
          <style>{`
            @keyframes pixelScroll {
              0% { transform: translateY(75vh); }
              100% { transform: translateY(-110%); }
            }
            .animate-credits {
              animation: pixelScroll 18s linear forwards;
            }
          `}</style>

          {/* Masked Viewport */}
          <div
            className="relative z-10 w-full h-full flex justify-center overflow-hidden pointer-events-none"
            style={{
              WebkitMaskImage:
                'linear-gradient(to bottom, transparent 0%, transparent 32%, black 46%, black 92%, transparent 100%)',
              maskImage:
                'linear-gradient(to bottom, transparent 0%, transparent 32%, black 46%, black 92%, transparent 100%)',
            }}
          >
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
          </div>

          <button
            onClick={() => setShowFinalCard(true)}
            className="absolute bottom-6 right-6 z-30 text-xs text-slate-500 hover:text-sky-400 cursor-pointer"
          >
            SKIP CREDITS ▸
          </button>
        </>
      ) : (
        <div className="relative z-20 text-center space-y-6 pt-44">
          <h2 className="text-2xl md:text-4xl font-bold tracking-widest text-sky-300 border-y-2 border-sky-500 py-4 px-6">
            GRAVITY IN A BOTTLE
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
