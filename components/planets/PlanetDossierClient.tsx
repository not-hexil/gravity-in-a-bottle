'use client';

import React, { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { useRouter } from 'next/navigation';
import {
  PlanetDossierData,
  PlanetInfoBlock,
  PlanetMinigameOption,
} from '@/lib/game';

import StageImageCarousel from '@/components/ui/StageImageCarousel';
import { MISSION_MODALS } from '@/lib/missions';

interface PlanetDossierClientProps {
  planet: PlanetDossierData;
}

interface BookPage extends PlanetInfoBlock {
  chapter: string;
  isArtifact: boolean;
}

const STORAGE_KEY = 'gravity_completed_missions';
const EMPTY_COMPLETED: string[] = [];

let cachedRaw: string | null = null;
let cachedParsed: string[] = EMPTY_COMPLETED;

function getCompletedSnapshot(): string[] {
  if (typeof window === 'undefined') return EMPTY_COMPLETED;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw === cachedRaw) return cachedParsed;
    cachedRaw = raw;
    if (!raw) {
      cachedParsed = EMPTY_COMPLETED;
      return cachedParsed;
    }
    const parsed = JSON.parse(raw);
    cachedParsed = Array.isArray(parsed) ? parsed : EMPTY_COMPLETED;
    return cachedParsed;
  } catch {
    return EMPTY_COMPLETED;
  }
}

function getServerSnapshot(): string[] {
  return EMPTY_COMPLETED;
}

function subscribeToCompletedStore(callback: () => void): () => void {
  window.addEventListener('storage', callback);
  window.addEventListener('pageshow', callback);
  return () => {
    window.removeEventListener('storage', callback);
    window.removeEventListener('pageshow', callback);
  };
}

export default function PlanetDossierClient({ planet }: PlanetDossierClientProps) {
  const router = useRouter();
  const completedSlugs = useSyncExternalStore(
    subscribeToCompletedStore,
    getCompletedSnapshot,
    getServerSnapshot
  );

  const bookPages: BookPage[] = [
    ...planet.infoBlocks.map((b) => ({
      ...b,
      chapter: '01 // PLANETARY ENVIRONMENT',
      isArtifact: false,
    })),
    ...planet.whatWeLeftBehind.map((a) => ({
      ...a,
      chapter: '02 // WHAT WE LEFT BEHIND',
      isArtifact: true,
    })),
  ];

  const [activeIndex, setActiveIndex] = useState(0);
  const entryRefs = useRef<(HTMLElement | null)[]>([]);
  const gamesSectionRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (bookPages.length === 0) return;

    let ticking = false;

    const updateActiveFromScroll = () => {
      const focalY = window.innerHeight * 0.45;
      let bestIdx = 0;
      let bestDistance = Infinity;

      for (let i = 0; i < entryRefs.current.length; i++) {
        const el = entryRefs.current[i];
        if (!el) continue;
        const rect = el.getBoundingClientRect();

        const dist =
          focalY >= rect.top && focalY <= rect.bottom
            ? 0
            : Math.min(Math.abs(rect.top - focalY), Math.abs(rect.bottom - focalY));

        if (dist < bestDistance) {
          bestDistance = dist;
          bestIdx = i;
        }
      }

      setActiveIndex(bestIdx);
      ticking = false;
    };

    const onScrollOrResize = () => {
      if (!ticking) {
        ticking = true;
        window.requestAnimationFrame(updateActiveFromScroll);
      }
    };

    updateActiveFromScroll();
    window.addEventListener('scroll', onScrollOrResize, { passive: true });
    window.addEventListener('resize', onScrollOrResize);

    return () => {
      window.removeEventListener('scroll', onScrollOrResize);
      window.removeEventListener('resize', onScrollOrResize);
    };
  }, [bookPages.length]);

  const jumpToEntry = (idx: number) => {
    const target = entryRefs.current[idx];
    if (!target) return;
    setActiveIndex(idx);
    target.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  const handleLaunchMinigame = (game: PlanetMinigameOption) => {
    if (!game.missionSlug) return;
    router.push(`/missions/${game.missionSlug}?planet=${planet.slug}`);
  };

  const unlockedGames = planet.minigames.filter(
    (g) => g.missionSlug !== null && completedSlugs.includes(g.missionSlug)
  );

  const isEarth = planet.slug === 'earth';
  const earthUnlocked = completedSlugs.length >= 4;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* 1. INITIAL SCREEN: KEY STATS ONLY */}
      <section className="mx-auto flex min-h-screen max-w-5xl flex-col justify-between px-4 py-8">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <button
            onClick={() => router.push('/')}
            className="rounded-lg border border-slate-800 bg-slate-900 px-3.5 py-2 font-mono text-xs font-bold text-slate-300 transition hover:border-amber-400 hover:text-amber-300"
          >
            {'← SOLAR SYSTEM MAP'}
          </button>

          <span className="font-mono text-xs uppercase tracking-widest text-slate-400">
            PLANETARY TELEMETRY DOSSIER
          </span>
        </div>

        <header className="my-auto rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 p-6 shadow-2xl sm:p-10">
          <div className="flex items-center gap-3">
            <span
              className="inline-block h-3.5 w-3.5 rounded-full"
              style={{ backgroundColor: planet.accentColor }}
            />
            <span className="font-mono text-xs font-bold uppercase tracking-widest text-amber-400">
              KEY TELEMETRY OVERVIEW
            </span>
          </div>

          <h1 className="mt-3 font-mono text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
            {planet.name}
          </h1>
          <p className="mt-2 text-sm text-slate-400 sm:text-base">{planet.tagline}</p>

          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
            {planet.quickFacts.map((fact) => (
              <div
                key={fact.label}
                className="rounded-xl border border-slate-800 bg-slate-950/80 p-4"
              >
                <span className="block font-mono text-[10px] uppercase tracking-wider text-slate-400">
                  {fact.label}
                </span>
                <span className="mt-1.5 block font-mono text-base font-bold text-amber-300">
                  {fact.value}
                </span>
              </div>
            ))}
          </div>
        </header>

        <div className="pb-2 text-center">
          <button
            type="button"
            onClick={() => jumpToEntry(0)}
            className="animate-bounce font-mono text-xs tracking-widest text-slate-400 transition hover:text-amber-300"
          >
            {'↓ SCROLL DOWN TO EXPLORE ARCHIVE ↓'}
          </button>
        </div>
      </section>

      {/* 2. STICKY QUICK-JUMP NAVIGATION BAR */}
      {bookPages.length > 0 && (
        <div className="sticky top-0 z-30 border-y border-slate-800/90 bg-slate-950/90 px-4 py-3 backdrop-blur-md">
          <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3">
            <span
              className={`font-mono text-xs font-bold tracking-widest ${
                bookPages[activeIndex]?.isArtifact ? 'text-amber-400' : 'text-sky-400'
              }`}
            >
              {bookPages[activeIndex]?.chapter}
            </span>

            <div className="flex flex-wrap items-center gap-1.5">
              {bookPages.map((page, idx) => {
                const isCurrent = idx === activeIndex;
                return (
                  <button
                    key={page.id}
                    type="button"
                    onClick={() => jumpToEntry(idx)}
                    title={page.title}
                    className={`rounded-md px-2.5 py-1 font-mono text-[11px] font-bold transition ${
                      isCurrent
                        ? page.isArtifact
                          ? 'bg-amber-500 text-slate-950'
                          : 'bg-sky-400 text-slate-950'
                        : 'border border-slate-700 bg-slate-900 text-slate-300 hover:border-slate-500 hover:text-white'
                    }`}
                  >
                    {`0${idx + 1} • ${page.title.slice(0, 16)}${page.title.length > 16 ? '…' : ''}`}
                  </button>
                );
              })}

              <button
                type="button"
                onClick={() =>
                  gamesSectionRef.current?.scrollIntoView({ behavior: 'smooth' })
                }
                className="ml-1 rounded-md border border-emerald-500/40 bg-emerald-950/40 px-2.5 py-1 font-mono text-[11px] font-bold text-emerald-300 transition hover:bg-emerald-400 hover:text-slate-950"
              >
                {'STATUS ↓'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. CONTENT-SIZED DYNAMIC ENTRIES */}
      <div className="mx-auto max-w-5xl space-y-8 px-4 py-10">
        {bookPages.map((page, idx) => {
          const isActive = idx === activeIndex;
          const isAbove = idx < activeIndex;

          return (
            <article
              key={page.id}
              ref={(el) => {
                entryRefs.current[idx] = el;
              }}
              data-entry-index={idx}
              className={`transition-all duration-500 ease-out ${
                isActive
                  ? 'translate-y-0 scale-100 opacity-100'
                  : isAbove
                    ? '-translate-y-2 scale-[0.99] opacity-30'
                    : 'translate-y-3 scale-[0.99] opacity-30'
              }`}
            >
              <div
                className={`grid grid-cols-1 gap-6 rounded-2xl border p-5 shadow-xl lg:grid-cols-12 lg:p-8 ${
                  page.isArtifact
                    ? 'border-amber-500/40 bg-slate-900/95'
                    : 'border-slate-800 bg-slate-900/95'
                }`}
              >
                {/* Left Visual / Image Panel */}
                <div className="flex flex-col overflow-hidden rounded-xl border border-slate-800 bg-slate-950 lg:col-span-5">
                  {page.imageUrl ? (
                    <>
                      <div className="relative min-h-[200px] w-full flex-1 overflow-hidden">
                        <img
                          src={page.imageUrl}
                          alt={page.imageCaption || page.title}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      {page.imageCaption && (
                        <p className="border-t border-slate-800 bg-slate-950 px-3.5 py-2 font-mono text-[11px] text-slate-400">
                          {page.imageCaption}
                        </p>
                      )}
                    </>
                  ) : (
                    <div className="flex min-h-[160px] flex-1 flex-col items-center justify-center bg-gradient-to-br from-slate-900 to-slate-950 p-5 text-center">
                      <div
                        className="h-16 w-16 rounded-full opacity-80 blur-xs"
                        style={{
                          background: `radial-gradient(circle at 30% 30%, ${planet.accentColor}, #020617)`,
                        }}
                      />
                      <span className="mt-3 font-mono text-xs font-bold uppercase tracking-widest text-slate-400">
                        {`${planet.name} // ENTRY 0${idx + 1}`}
                      </span>
                      <span className="mt-1 font-mono text-[11px] text-slate-500">
                        {'(Add imageUrl in data/planets.ts)'}
                      </span>
                    </div>
                  )}
                </div>

                {/* Right Content-Driven Narrative Panel */}
                <div className="flex flex-col justify-between lg:col-span-7">
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={`inline-block rounded px-2.5 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider ${
                          page.isArtifact
                            ? 'bg-amber-500/15 text-amber-300'
                            : 'bg-sky-500/15 text-sky-300'
                        }`}
                      >
                        {page.badge}
                      </span>
                      <span className="font-mono text-xs text-slate-500">
                        {`0${idx + 1} / 0${bookPages.length}`}
                      </span>
                    </div>

                    <h2 className="mt-2.5 font-mono text-xl font-extrabold text-white sm:text-2xl">
                      {page.title}
                    </h2>

                    <div className="mt-3 space-y-3 text-sm leading-relaxed text-slate-200 sm:text-base">
                      {page.body.split('\n\n').map((paragraph, pIdx) => (
                        <p key={pIdx}>{paragraph}</p>
                      ))}
                    </div>
                  </div>

                  {/* Per-Card Manual Navigation Footer */}
                  <div className="mt-6 flex items-center justify-between border-t border-slate-800 pt-3.5">
                    <button
                      type="button"
                      disabled={idx === 0}
                      onClick={() => jumpToEntry(idx - 1)}
                      className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 font-mono text-xs font-bold text-slate-200 transition hover:border-amber-400 hover:text-white disabled:cursor-not-allowed disabled:opacity-35"
                    >
                      {'↑ PREV ENTRY'}
                    </button>

                    {idx < bookPages.length - 1 ? (
                      <button
                        type="button"
                        onClick={() => jumpToEntry(idx + 1)}
                        className="rounded-lg bg-amber-500 px-3.5 py-1.5 font-mono text-xs font-bold text-slate-950 transition hover:bg-amber-400"
                      >
                        {'NEXT ENTRY ↓'}
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() =>
                          gamesSectionRef.current?.scrollIntoView({ behavior: 'smooth' })
                        }
                        className="rounded-lg bg-emerald-400 px-3.5 py-1.5 font-mono text-xs font-bold text-slate-950 transition hover:bg-emerald-300"
                      >
                        {'STATUS ↓'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      {/* 4. END OF PAGE: MINIGAME OPTIONS, EARTH STATION GATE, OR "NOTHING ABANDONED YET" */}
      <div ref={gamesSectionRef} className="mx-auto max-w-5xl px-4 pb-20 pt-6">
        {isEarth ? (
          <section className="mb-10">
            <h2 className="mb-4 font-mono text-xs font-bold uppercase tracking-widest text-emerald-400">
              {'03 // ORBITAL STATION TELEMETRY LINK'}
            </h2>

            {earthUnlocked ? (
              <div className="rounded-2xl border-2 border-emerald-400/50 bg-gradient-to-br from-slate-900 via-emerald-950/20 to-slate-950 p-6 shadow-2xl sm:p-8">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="rounded bg-emerald-500/20 px-2.5 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider text-emerald-300">
                    {'★ SIGNAL LOCKED • HOME IS CALLING'}
                  </span>
                  <span className="font-mono text-xs text-emerald-300">
                    {`MISSIONS CLEARED: ${completedSlugs.length} / 4+`}
                  </span>
                </div>

                <h3 className="mt-3 font-mono text-2xl font-extrabold text-white sm:text-3xl">
                  {'HOME IS CALLING'}
                </h3>

                <p className="mt-2.5 text-sm leading-relaxed text-slate-200 sm:text-base">
                  {
                    'With four or more deep-space telemetry archives recovered across the solar system, Low Earth Orbit Station uplink is now online. Board the orbital station to review humanity’s return trajectory.'
                  }
                </p>

                <div className="mt-6">
                  <span className="inline-block rounded-lg border border-emerald-400/40 bg-emerald-500/15 px-4 py-2.5 font-mono text-xs font-bold uppercase tracking-wider text-emerald-300">
                    {'ORBITAL STATION DOCKING READY (CUTSCENE MODULE PENDING)'}
                  </span>
                </div>
              </div>
            ) : (
              <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-6 shadow-lg sm:p-8">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="rounded bg-amber-500/15 px-2.5 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider text-amber-300">
                    {'🔒 ENCRYPTED ORBITAL BEACON'}
                  </span>
                  <span className="font-mono text-xs text-slate-400">
                    {`PROGRESS: ${completedSlugs.length} / 4 MISSIONS`}
                  </span>
                </div>

                <h3 className="mt-3 font-mono text-xl font-extrabold text-white sm:text-2xl">
                  {'SPACE STATION ACCESS LOCKED'}
                </h3>

                <p className="mt-2.5 text-sm leading-relaxed text-slate-300 sm:text-base">
                  {
                    'Complete at least 4 planetary missions across the solar system to establish a return telemetry link with Earth’s orbital station.'
                  }
                </p>
              </div>
            )}
          </section>
        ) : planet.minigames.length > 0 ? (
          <section className="mb-10">
            <h2 className="mb-4 font-mono text-xs font-bold uppercase tracking-widest text-emerald-400">
              {'03 // FIELD SIMULATIONS & MINIGAMES'}
            </h2>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {planet.minigames.map((game) => {
                const isPlayable = game.missionSlug !== null;
                const isDone =
                  game.missionSlug !== null &&
                  completedSlugs.includes(game.missionSlug);

                return (
                  <div
                    key={game.id}
                    className="flex h-full flex-col justify-between rounded-xl border border-slate-800 bg-slate-900 p-6 shadow-lg"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          {game.subtitle}
                        </span>
                        {isDone && (
                          <span className="rounded bg-emerald-500/20 px-2 py-0.5 font-mono text-[10px] font-bold text-emerald-300">
                            {'✓ COMPLETED'}
                          </span>
                        )}
                      </div>

                      <h3 className="mt-1.5 font-mono text-lg font-bold text-white">
                        {game.title}
                      </h3>
                      <p className="mt-2 text-xs leading-relaxed text-slate-300 sm:text-sm">
                        {game.description}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleLaunchMinigame(game)}
                      className={`mt-5 w-full rounded-lg py-2.5 font-mono text-xs font-extrabold tracking-wider transition ${
                        isPlayable
                          ? 'bg-amber-500 text-slate-950 hover:bg-amber-400'
                          : 'cursor-default border border-slate-700 bg-slate-800/70 text-slate-400'
                      }`}
                    >
                      {isPlayable
                        ? isDone
                          ? 'REPLAY SIMULATION →'
                          : 'PLAY MINIGAME →'
                        : 'SIMULATION STANDBY'}
                    </button>
                  </div>
                );
              })}
            </div>
          </section>
        ) : (
          <section className="mb-10">
            <h2 className="mb-4 font-mono text-xs font-bold uppercase tracking-widest text-slate-400">
              {'03 // SURFACE & ORBITAL HARDWARE STATUS'}
            </h2>

            <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 shadow-lg sm:p-8">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="rounded bg-sky-500/15 px-2.5 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider text-sky-300">
                  {'PRISTINE FRONTIER • FLYBY ONLY'}
                </span>
                <span className="font-mono text-xs text-slate-500">
                  {'HARDWARE COUNT: 0'}
                </span>
              </div>

              <h3 className="mt-3 font-mono text-xl font-extrabold text-white sm:text-2xl">
                {'NOTHING ABANDONED HERE YET'}
              </h3>

              <p className="mt-2.5 text-sm leading-relaxed text-slate-300 sm:text-base">
                {`No lander, rover, or atmospheric entry probe has ever been left behind at ${planet.name}. Only NASA’s Voyager 2 spacecraft briefly swept past during its Grand Tour flyby before continuing out toward interstellar space—leaving this world untouched for future missions.`}
              </p>
            </div>
          </section>
        )}

        {/* 5. ADDITIONAL INFORMATION UNLOCKED BELOW MINIGAMES */}
        {unlockedGames.length > 0 && (
          <section>
            <h2 className="mb-4 font-mono text-xs font-bold uppercase tracking-widest text-purple-400">
              {'04 // UNLOCKED POST-SIMULATION TELEMETRY'}
            </h2>

            <div className="space-y-6">
              {unlockedGames.map((game) => {
                const missionModal = game.missionSlug
                  ? MISSION_MODALS[game.missionSlug]
                  : undefined;

                const slides =
                  game.stageImages && game.stageImages.length > 0
                    ? game.stageImages
                    : missionModal?.stageImages && missionModal.stageImages.length > 0
                      ? missionModal.stageImages
                      : missionModal?.imageUrl
                        ? [
                            {
                              imageUrl: missionModal.imageUrl,
                              imageCaption: missionModal.imageCaption,
                            },
                          ]
                        : [];

                return (
                  <div
                    key={`unlocked-${game.id}`}
                    className="rounded-xl border-2 border-emerald-500/40 bg-slate-900/95 p-6 shadow-xl"
                  >
                    <span className="inline-block rounded bg-emerald-500/20 px-2 py-0.5 font-mono text-[10px] font-bold uppercase text-emerald-300">
                      {`★ DECODED FROM ${game.title}`}
                    </span>
                    <h3 className="mt-2 font-mono text-lg font-bold text-white">
                      {game.unlockedLoreTitle}
                    </h3>

                    {slides.length > 0 && (
                      <div className="mt-4">
                        <StageImageCarousel
                          key={`dossier-carousel-${game.id}`}
                          slides={slides}
                          initialIndex={0}
                          heightClass="max-h-[32rem] !object-contain"
                          fallbackAlt={game.title}
                        />
                      </div>
                    )}

                    <div className="mt-4 space-y-2.5 text-sm leading-relaxed text-slate-200">
                      {game.unlockedLoreParagraphs.map((para, i) => (
                        <p key={i}>{para}</p>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
