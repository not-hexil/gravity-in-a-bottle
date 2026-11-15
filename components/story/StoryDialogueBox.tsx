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
      className="absolute -top-10 -left-10 w-36 h-36 shrink-0 border-4 border-sky-400 flex flex-col items-center justify-center text-center overflow-hidden shadow-[0_0_25px_rgba(56,189,248,0.5)] z-30"
      style={{ backgroundColor: url && !imgFailed ? '#0f172a' : suitColor }}
    >
      {url && !imgFailed ? (
        <img
          src={url}
          alt={name}
          onError={() => setImgFailed(true)}
          className="w-full h-full object-cover"
          style={{ imageRendering: 'pixelated' }}
        />
      ) : (
        <span className="text-sm font-bold uppercase tracking-wider bg-black/50 px-2 py-0.5">
          C{speaker}
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
  const hasPortrait = line.speaker > 0;
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
      className={`relative w-full max-w-4xl mx-auto mt-12 select-none border-4 border-sky-400 bg-slate-950/95 pt-4 pb-4 pl-32 pr-6 shadow-[0_0_25px_rgba(56,189,248,0.35)] font-mono text-white ${
        isDoneTyping ? 'cursor-pointer' : 'cursor-default'
      }`}
      style={{ imageRendering: 'pixelated' }}
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

      <div className="min-h-[5rem] flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span
              className="text-s font-bold uppercase tracking-widest px-2 py-0.5 rounded-sm"
              style={{
                backgroundColor: line.isCyanRadio ? '#0891b2' : char.suitColor,
                color: '#ffffff',
              }}
            >
              {char.role ? `${char.name} | ${char.role}` : char.name}
            </span>
          </div>

          <p
            className={`text-base md:text-lg leading-relaxed ${
              line.isCyanRadio ? 'text-cyan-300 font-semibold tracking-wide' : 'text-slate-100'
            }`}
          >
            {displayedText}
            {!isDoneTyping && (
              <span className="inline-block w-2 h-4 ml-1 bg-sky-400 animate-pulse" />
            )}
          </p>
        </div>

        <div className="text-right text-xs text-sky-400 mt-2 h-4">
          {isDoneTyping ? '▼ CLICK OR PRESS ENTER' : ''}
        </div>
      </div>
    </div>
  );
};

export const StoryDialogueBox: React.FC<StoryDialogueBoxProps> = (props) => {
  return <DialogueContent key={props.line.id} {...props} />;
};
