export type MissionSlug =
  | 'huygens'
  | 'lunokhod'
  | 'galileo'
  | 'ingenuity'
  | 'surveyor3'
  | 'venera13'
  | 'messenger';

export type PlanetSlug =
  | 'mercury'
  | 'venus'
  | 'earth'
  | 'moon'
  | 'mars'
  | 'jupiter'
  | 'saturn'
  | 'titan'
  | 'uranus'
  | 'neptune';

export interface MissionModalData {
  slug: MissionSlug;
  title: string;
  subtitle: string;
  paragraphs: [string, string, string];
  imageUrl?: string;
  imageCaption?: string;
  stats: {
    label: string;
    value: string;
  }[];
}

export interface MissionInstructionData {
  slug: MissionSlug;
  targetWorld: string;
  missionTitle: string;
  title: string;
  objective: string;
  controls: {
    key: string;
    action: string;
  }[];
  tips: string[];
}

export interface PlanetInfoBlock {
  id: string;
  badge: string;
  title: string;
  body: string;
  imageUrl?: string;
  imageCaption?: string;
}

export interface PlanetMinigameOption {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  missionSlug: MissionSlug | null;
  unlockedLoreTitle: string;
  unlockedLoreParagraphs: string[];
}

export interface PlanetDossierData {
  slug: PlanetSlug;
  name: string;
  tagline: string;
  accentColor: string;
  heroImageUrl?: string;
  quickFacts: {
    label: string;
    value: string;
  }[];
  infoBlocks: PlanetInfoBlock[];
  whatWeLeftBehind: PlanetInfoBlock[];
  minigames: PlanetMinigameOption[];
}
