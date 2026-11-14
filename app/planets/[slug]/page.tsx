import React, { Suspense } from 'react';
import { PLANET_DOSSIERS, resolvePlanetSlug } from '@/data/planets';
import PlanetDossierClient from '@/components/planets/PlanetDossierClient';

export function generateStaticParams() {
  return Object.keys(PLANET_DOSSIERS).map((slug) => ({ slug }));
}

async function PlanetContent({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const resolvedSlug = resolvePlanetSlug(slug);
  const data = PLANET_DOSSIERS[resolvedSlug];

  return <PlanetDossierClient planet={data} />;
}

export default function PlanetPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-slate-950 font-mono text-xs text-slate-400">
          LOADING PLANETARY ARCHIVE...
        </div>
      }
    >
      <PlanetContent params={params} />
    </Suspense>
  );
}
