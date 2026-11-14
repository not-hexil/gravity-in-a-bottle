'use client';

import React, { useState, useSyncExternalStore } from 'react';
import SolarSystemMap from '@/components/map/SolarSystemMap';
import {
  Scene0LoreIntro,
  Scene1CrewDeck,
  Scene4Ending,
  Scene5Credits,
  AssetOverrides
} from '@/components/story/StoryScene';

type SceneState = 'S0' | 'S1' | 'S2_RADAR' | 'S4' | 'S5';

const INTRO_SEEN_KEY = 'odyssey6_intro_seen';
const INTRO_EVENT = 'odyssey6_intro_change';

function subscribeIntroSeen(callback: () => void): () => void {
  window.addEventListener(INTRO_EVENT, callback);
  window.addEventListener('storage', callback);
  return () => {
    window.removeEventListener(INTRO_EVENT, callback);
    window.removeEventListener('storage', callback);
  };
}

function getIntroSeenSnapshot(): boolean {
  if (typeof window === 'undefined') return false;
  return window.sessionStorage.getItem(INTRO_SEEN_KEY) === 'true';
}

function getIntroSeenServerSnapshot(): boolean | null {
  return null;
}

export default function HomePage() {
  const introSeen = useSyncExternalStore(
    subscribeIntroSeen,
    getIntroSeenSnapshot,
    getIntroSeenServerSnapshot
  );

  const [overrideScene, setOverrideScene] = useState<SceneState | null>(null);

  if (introSeen === null) {
    return <main className="min-h-screen bg-slate-950" />;
  }

  const scene: SceneState = overrideScene ?? (introSeen ? 'S2_RADAR' : 'S0');

  const enterRadar = () => {
    window.sessionStorage.setItem(INTRO_SEEN_KEY, 'true');
    window.dispatchEvent(new Event(INTRO_EVENT));
    setOverrideScene('S2_RADAR');
  };

  const storyAssets: AssetOverrides = {
    getPortraitUrl: (speaker: number) => `/assets/mugshots/c${speaker}.png`,
    loreBg: '/assets/lore_bg.png',
    crewDeckBg: '/assets/crew_deck.png',
    endingBg: '/assets/ending_bg.jpg',
    getSpriteUrl: (speaker: number) => `/assets/sprites/c${speaker}.png`,
  };

  return (
    <div className="relative min-h-screen bg-slate-950">
      <div className="fixed top-2 right-2 z-50 flex gap-1 rounded border border-slate-700 bg-slate-950/90 p-1 font-mono text-[10px] text-slate-300 opacity-60 hover:opacity-100">
        {(['S0', 'S1', 'S2_RADAR', 'S4', 'S5'] as SceneState[]).map((s) => (
          <button
            key={s}
            onClick={() => setOverrideScene(s)}
            className={`px-1.5 py-0.5 rounded ${
              scene === s ? 'bg-sky-500 text-black font-bold' : 'hover:bg-slate-800'
            }`}
          >
            {s === 'S2_RADAR' ? 'S2' : s}
          </button>
        ))}
      </div>

      {scene === 'S0' && (
        <Scene0LoreIntro assets={storyAssets} onComplete={() => setOverrideScene('S1')} />
      )}

      {scene === 'S1' && (
        <Scene1CrewDeck assets={storyAssets} onComplete={enterRadar} />
      )}

      {scene === 'S2_RADAR' && (
        <main className="flex min-h-screen flex-col items-center justify-center bg-slate-950 px-4 py-8 text-slate-100">
          <header className="mb-5 text-center">
            <h1 className="font-mono text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
              🪐 SOLAR SYSTEM MISSION CONTROL
            </h1>
            <p className="mt-1 font-mono text-xs text-slate-400 sm:text-sm">
              Select any celestial body to inspect planetary archives, artifacts, and field simulations
            </p>
          </header>

          <SolarSystemMap onTriggerEnding={() => setOverrideScene('S4')} />
        </main>
      )}

      {scene === 'S4' && (
        <Scene4Ending
          assets={storyAssets}
          onComplete={() => setOverrideScene('S5')}
          onGoHome={() => setOverrideScene('S2_RADAR')}
        />
      )}

      {scene === 'S5' && (
        <Scene5Credits
          onRestart={() => {
            window.sessionStorage.removeItem(INTRO_SEEN_KEY);
            window.dispatchEvent(new Event(INTRO_EVENT));
            setOverrideScene('S0');
          }}
          onGoHome={() => setOverrideScene('S2_RADAR')}
        />
      )}
    </div>
  );
}
