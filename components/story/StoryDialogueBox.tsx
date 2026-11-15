'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { CREW, DialogueLine } from '@/lib/storyData';
import { retroAudio } from '@/lib/retroAudio';

interface StoryDialogueBoxProps {
  line: DialogueLine;
  onNext: () => void;
  getPortraitUrl?: (speaker: number) => string | null;
}

const defaultMugshotResolver = (speaker: number) =>
  `/assets/mugshots/c${speaker}.png`;

const MugshotSlot: React.FC<{
  speaker: number;
  name: string;
  suitColor: string;
  url: string | null;
}> = ({ speaker, name, suitColor, url }) => {
  const [imgFailed, setImgFailed] = useState(false);

  return (
    <div
      className="relative w-32 h-32 sm:w-44 sm:h-44 shrink-0 border-4 border-sky-400 bg-slate-950 flex flex-col items-center justify-center text-center overflow-hidden shadow-[0_0_24px_rgba(56,189,248,0.4)] z-20"
      style={{ backgroundColor: url && !imgFailed ? '#020617' : suitColor }}
    >
      <span className="pointer-events-none absolute top-1 left-1 w-1.5 h-1.5 bg-sky-200" />
      <span className="pointer-events-none absolute top-1 right-1 w-1.5 h-1.5 bg-sky-200" />
      <span className="pointer-events-none absolute bottom-1 left-1 w-1.5 h-1.5 bg-sky-200" />
      <span className="pointer-events-none absolute bottom-1 right-1 w-1.5 h-1.5 bg-sky-200" />

      {url && !imgFailed ? (
        <img
          src={url}
          alt={name}
          onError={() => setImgFailed(true)}
          className="w-full h-full object-cover"
          style={{ imageRendering: 'pixelated' }}
        />
      ) : (
        <span className="text-sm font-bold uppercase tracking-widest bg-slate-950/75 border border-sky-400/50 px-2.5 py-1 text-sky-200 [text-shadow:2px_2px_0px_#020617]">
          {speaker === 0 ? 'SYS // AI' : `C${speaker}`}
        </span>
      )}
    </div>
  );
};

const DialogueContent: React.FC<StoryDialogueBoxProps> = ({
  line,
  onNext,
  getPortraitUrl = defaultMugshotResolver,
}) => {
  const [charIndex, setCharIndex] = useState(0);

  const char = CREW[line.speaker] || CREW[0];
  const hasPortrait = line.speaker >= 0;
  const portraitUrl = hasPortrait ? getPortraitUrl(line.speaker) : null;

  const isDoneTyping = charIndex >= line.text.length;
  const displayedText = line.text.slice(0, charIndex);

  useEffect(() => {
    if (line.sfx === 'static') retroAudio.playStatic(0.7);
    if (line.sfx === 'boot') retroAudio.playBootBeep();
    if (line.sfx === 'pings_static') retroAudio.playPingsAndStatic();
  }, [line]);

  useEffect(() => {
    if (charIndex >= line.text.length) return;

    const timer = setTimeout(() => {
      const nextChar = line.text[charIndex];
      setCharIndex((c) => c + 1);
      if (nextChar !== ' ') {
        retroAudio.playBlip(char.blipFreq);
      }
    }, 28);

    return () => clearTimeout(timer);
  }, [charIndex, line.text, char.blipFreq]);

  const handleAdvance = useCallback(() => {
    if (isDoneTyping) {
      onNext();
    }
  }, [isDoneTyping, onNext]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleAdvance();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleAdvance]);

  return (
    <div
      onClick={handleAdvance}
      className={`relative w-full max-w-4xl mx-auto mt-6 select-none font-mono text-white flex items-end gap-2 sm:gap-3 ${
        isDoneTyping ? 'cursor-pointer' : 'cursor-default'
      }`}
      style={{
        imageRendering: 'pixelated',
        WebkitFontSmoothing: 'none',
      }}
    >
      {hasPortrait && (
        <MugshotSlot
          key={line.speaker}
          speaker={line.speaker}
          name={char.name}
          suitColor={char.suitColor}
          url={portraitUrl}
        />
      )}

      <div className="flex-1 min-w-0 flex flex-col">
        <div className="self-start ml-2 -mb-1 z-20">
          <div
            className="inline-flex items-center gap-2 border-t-4 border-x-4 border-sky-400 bg-slate-950 px-3.5 py-1 shadow-[0_-4px_14px_rgba(56,189,248,0.25)]"
            style={{
              borderColor: line.isCyanRadio ? '#22d3ee' : '#38bdf8',
            }}
          >
            <span
              className="inline-block w-2 h-2"
              style={{
                backgroundColor: line.isCyanRadio ? '#06b6d4' : char.suitColor,
              }}
            />
            <span className="text-xs sm:text-sm font-bold uppercase tracking-[0.18em] text-white [text-shadow:2px_2px_0px_#020617,0_0_8px_rgba(56,189,248,0.45)]">
              {char.role ? `${char.name} | ${char.role}` : char.name}
            </span>
          </div>
        </div>

        <div
          className="relative w-full min-h-[6.75rem] sm:min-h-[8.25rem] overflow-hidden border-4 border-sky-400 bg-slate-950/95 px-4 pt-3.5 pb-3 sm:px-5 sm:pt-4 sm:pb-3.5 flex flex-col justify-between shadow-[0_0_25px_rgba(56,189,248,0.35)]"
          style={{
            borderColor: line.isCyanRadio ? '#22d3ee' : '#38bdf8',
          }}
        >
          <div
            className="pointer-events-none absolute inset-0 z-0 opacity-25"
            style={{
              backgroundImage:
                'repeating-linear-gradient(0deg, rgba(2,6,23,0.9) 0px, rgba(2,6,23,0.9) 1px, transparent 1px, transparent 3px)',
            }}
          />

          <div className="pointer-events-none absolute inset-1 border border-sky-400/25 z-0" />
          <span className="pointer-events-none absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-sky-300 z-10" />
          <span className="pointer-events-none absolute bottom-1.5 left-1.5 w-1.5 h-1.5 bg-sky-300 z-10" />

          <p
            className={`relative z-10 text-sm sm:text-base md:text-lg leading-relaxed tracking-wider pr-4 ${
              line.isCyanRadio
                ? 'text-cyan-300 font-semibold [text-shadow:2px_2px_0px_#083344,0_0_10px_rgba(34,211,238,0.5)]'
                : 'text-slate-100 [text-shadow:2px_2px_0px_#020617,0_0_6px_rgba(56,189,248,0.2)]'
            }`}
          >
            {displayedText}
            {!isDoneTyping && (
              <span className="inline-block w-2.5 h-4 ml-1 bg-sky-400 shadow-[2px_2px_0px_#020617] animate-pulse align-middle" />
            )}
          </p>

          <div className="relative z-10 flex items-center justify-end gap-2 mt-2 h-4">
            {isDoneTyping && (
              <span className="inline-flex items-center gap-1.5 text-[11px] font-bold tracking-[0.2em] text-sky-400 [text-shadow:2px_2px_0px_#020617]">
                <span className="hidden sm:inline opacity-85">CLICK / ENTER</span>
                <span className="inline-block border-2 border-sky-400 bg-sky-400/15 px-1.5 py-0.2 leading-none shadow-[2px_2px_0px_#020617] animate-bounce">
                  ▼
                </span>
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export const StoryDialogueBox: React.FC<StoryDialogueBoxProps> = (props) => {
  return <DialogueContent key={props.line.id} {...props} />;
};
