import MissionClientShell from '@/components/missions/MissionClientShell';
import { MissionSlug } from '@/types/game';

export function generateStaticParams() {
  return [
    { slug: 'huygens' },
    { slug: 'lunokhod' },
    { slug: 'galileo' },
    { slug: 'ingenuity' },
  ];
}

export default async function MissionPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  return <MissionClientShell slug={slug as MissionSlug} />;
}
