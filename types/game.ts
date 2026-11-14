export type MissionSlug = 'huygens' | 'lunokhod' | 'galileo' | 'ingenuity';

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
  title: string;
  objective: string;
  controls: {
    key: string;
    action: string;
  }[];
  tips: string[];
}
