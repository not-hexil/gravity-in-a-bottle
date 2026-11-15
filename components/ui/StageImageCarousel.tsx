'use client';

import React, { useState } from 'react';
import { StageImageSlide } from '@/lib/game';

interface StageImageCarouselProps {
  slides: StageImageSlide[];
  initialIndex?: number;
  heightClass?: string;
  fallbackAlt?: string;
}

export default function StageImageCarousel({
  slides,
  initialIndex = 0,
  heightClass = 'h-48',
  fallbackAlt = 'Mission telemetry stage capture',
}: StageImageCarouselProps) {
  const safeInitial = Math.min(Math.max(0, initialIndex), Math.max(0, slides.length - 1));
  const [activeIndex, setActiveIndex] = useState(safeInitial);

  if (slides.length === 0) return null;

  const currentIdx = Math.min(activeIndex, slides.length - 1);
  const currentSlide = slides[currentIdx];
  const hasMultiple = slides.length > 1;

  const handlePrev = () => {
    setActiveIndex((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const handleNext = () => {
    setActiveIndex((prev) => (prev + 1) % slides.length);
  };

  return (
    <figure className="overflow-hidden rounded-lg border border-slate-700 bg-slate-950">
      <div className="relative">
        <img
          src={currentSlide.imageUrl}
          alt={currentSlide.imageCaption || `${fallbackAlt} — Stage ${currentIdx + 1}`}
          className={`${heightClass} w-full object-cover transition-opacity duration-200`}
        />

        {/* Stage Badge Pill */}
        <span className="absolute top-2.5 left-2.5 rounded border border-slate-700/80 bg-slate-950/85 px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider text-amber-300 backdrop-blur-xs">
          {`STAGE 0${currentIdx + 1} / 0${slides.length}`}
        </span>

        {/* Prev / Next Controls */}
        {hasMultiple && (
          <>
            <button
              type="button"
              onClick={handlePrev}
              aria-label="Previous stage image"
              className="absolute top-1/2 left-2 -translate-y-1/2 rounded-md border border-slate-700 bg-slate-950/85 px-2.5 py-1 font-mono text-xs font-bold text-slate-200 shadow-md transition hover:border-amber-400 hover:text-amber-300"
            >
              {'← PREV'}
            </button>
            <button
              type="button"
              onClick={handleNext}
              aria-label="Next stage image"
              className="absolute top-1/2 right-2 -translate-y-1/2 rounded-md border border-slate-700 bg-slate-950/85 px-2.5 py-1 font-mono text-xs font-bold text-slate-200 shadow-md transition hover:border-amber-400 hover:text-amber-300"
            >
              {'NEXT →'}
            </button>
          </>
        )}
      </div>

      {/* Caption & Stage Selector Dots */}
      <figcaption className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-800 px-3 py-1.5 font-mono text-[11px] text-slate-400">
        <span>{currentSlide.imageCaption || `Stage ${currentIdx + 1} Telemetry Visual`}</span>

        {hasMultiple && (
          <div className="flex items-center gap-1.5">
            {slides.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setActiveIndex(idx)}
                aria-label={`View stage ${idx + 1} image`}
                className={`rounded px-1.5 py-0.5 text-[10px] font-bold transition ${
                  idx === currentIdx
                    ? 'bg-amber-500 text-slate-950'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {`S${idx + 1}`}
              </button>
            ))}
          </div>
        )}
      </figcaption>
    </figure>
  );
}
