import React, { Suspense } from 'react';
import MissionClientShell from '@/components/missions/MissionClientShell';
import { MissionSlug } from '@/lib/game';

export function generateStaticParams() {
  return [
    { slug: 'huygens' },
    { slug: 'lunokhod' },
    { slug: 'galileo' },
    { slug: 'ingenuity' },
    { slug: 'surveyor3' },
    { slug: 'venera13' },
    {slug: 'messenger'}
  ];
}

async function MissionContent({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  return <MissionClientShell slug={slug as MissionSlug} />;
}

export default function MissionPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-slate-950 font-mono text-xs text-slate-400">
          INITIALIZING TELEMETRY LINK...
        </div>
      }
    >
      <MissionContent params={params} />
    </Suspense>
  );
}
