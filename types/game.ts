export type MissionSlug = 'huygens' | 'lunokhod' | 'galileo' | 'ingenuity';

export interface BuildingConfig {
  id: MissionSlug;
  name: string;
  shortLabel: string;
  roofColor: string;
  trimColor: string;
  x: number;
  y: number;
  width: number;
  height: number;
  doorX: number;
  doorY: number;
}

export interface MissionModalData {
  slug: MissionSlug;
  title: string;
  subtitle: string;
  imageUrl: string;
  imageAlt: string;
  paragraphs: [string, string, string];
}

export interface MissionInstructionData {
  slug: MissionSlug;
  targetWorld: string;
  missionTitle: string;
  objective: string;
  controls: { key: string; action: string }[];
  tips: string[];
}
