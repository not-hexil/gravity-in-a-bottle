export type CharacterId = 1 | 2 | 3 | 4 | 5 | 6 | 0 | -1; // 0 = System, -1 = Radio Voice

export interface CharacterConfig {
  id: CharacterId;
  name: string;
  role: string;
  suitColor: string;
  blipFreq: number; // Hz for Web Audio synth
}

export const CREW: Record<number, CharacterConfig> = {
  1: { id: 1, name: 'Commander', role: 'Commander', suitColor: '#1d4ed8', blipFreq: 220 },
  2: { id: 2, name: 'Archivist', role: 'Science Officer', suitColor: '#15803d', blipFreq: 440 },
  3: { id: 3, name: 'Engineer', role: 'Engineer', suitColor: '#c2410c', blipFreq: 165 },
  4: { id: 4, name: 'Comms', role: 'Comms Officer', suitColor: '#7e22ce', blipFreq: 310 },
  5: { id: 5, name: 'Medic', role: 'Medic & Gardener', suitColor: '#dc2626', blipFreq: 520 },
  6: { id: 6, name: 'Pilot', role: 'Pilot', suitColor: '#eab308', blipFreq: 620 },
  0: { id: 0, name: 'SYSTEM', role: 'Ship AI', suitColor: '#38bdf8', blipFreq: 880 },
  [-1]: { id: -1, name: 'MISSION CONTROL', role: 'Earth', suitColor: '#22d3ee', blipFreq: 360 },
};

export interface DialogueLine {
  id: string;
  speaker: CharacterId;
  mood: string;
  text: string;
  sfx?: 'static' | 'boot' | 'pings_static';
  isCyanRadio?: boolean;
}

// S0: LORE INTRO[cite: 2, 3]
export const S0_LORE_LINES = [
  'Six astronauts. One small ship. Millions of kilometres from home.',
  'Then the signal died.',
  'No NASA. No maps. No voice from Earth.',
  'Only one thing still worked: an old archive of machines humanity left behind.',
  'Rovers. Landers. Probes. Some went silent. Some are still travelling.',
  'Left behind. Never forgotten.',
];

// S1: CREW DECK[cite: 3, 4]
export const S1_DIALOGUE: DialogueLine[] = [
  { id: 'D1', speaker: 4, mood: 'worried', text: 'Still nothing. Every channel is just static.', sfx: 'static' },
  { id: 'D2', speaker: 3, mood: 'neutral', text: "Main antenna's cooked. I can't fix it from inside the ship." },
  { id: 'D3', speaker: 6, mood: 'scared', text: 'So nobody knows where we are? Nobody is coming?' },
  { id: 'D4', speaker: 1, mood: 'calm', text: "We don't know that. We stay calm, and we stay busy." },
  { id: 'D5', speaker: 5, mood: 'smile', text: 'Busy is easy. Dinner is tomatoes. Again.' },
  { id: 'D6', speaker: 3, mood: 'joking', text: "Day nineteen of tomatoes. I'm turning red." },
  { id: 'D7', speaker: 2, mood: 'surprised', text: 'Commander, the archive terminal just woke up on backup power.', sfx: 'boot' },
  { id: 'D8', speaker: 1, mood: 'calm', text: "The old mission archive? That's all offline data." },
  { id: 'D9', speaker: 2, mood: 'neutral', text: "It's a record of hardware NASA left on the Moon, Mars, Jupiter and Saturn." },
  { id: 'D10', speaker: 6, mood: 'sad', text: 'Left behind. Great. Just like us.' },
  { id: 'D11', speaker: 4, mood: 'determined', text: 'Left behind, yes. Forgotten, no. Some of them are still out there.' },
  { id: 'D12', speaker: 1, mood: 'calm', text: "Then let's learn how they survived the silence." },
  { id: 'D13', speaker: 2, mood: 'happy', text: 'Booting SOLAR SYSTEM MISSION CONTROL. Pick a world, crew.' },
  { id: 'D14', speaker: 0, mood: 'none', text: 'ARCHIVE ONLINE. SELECT A MISSION.' },
];

// S4: ENDING[cite: 5, 6]
export const S4_DIALOGUE: DialogueLine[] = [
  { id: 'E1', speaker: 6, mood: 'sad', text: 'Every one of them went quiet. But somebody still wrote their story down.' },
  { id: 'E2', speaker: 4, mood: 'determined', text: "We're not lost. We're just quiet." },
  { id: 'E3', speaker: 3, mood: 'joking', text: "I can wire the backup dish to the archive's transmitter. Ten minutes." },
  { id: 'E4', speaker: 1, mood: 'calm', text: 'Do it. Character 4, you write the message.' },
  { id: 'E5', speaker: 4, mood: 'determined', text: 'Like the Pioneer 10 plaque: who we are, and where we are.' },
  { id: 'E6', speaker: 5, mood: 'smile', text: 'Put the tomatoes in. Humanity should know.' },
  { id: 'E7', speaker: 2, mood: 'happy', text: 'Sending: SIX CREW. ALL ALIVE. WE ARE HERE.', sfx: 'pings_static' },
  { id: 'E8', speaker: -1, mood: 'none', text: '...dyssey-6... this is Mission Control. We never stopped listening.', isCyanRadio: true },
  { id: 'E9', speaker: 6, mood: 'happy', text: 'They remembered us.' },
  { id: 'E10', speaker: 1, mood: 'calm', text: 'Abandoned... but not forgotten.' },
];

// S5: CREDITS
export const S5_CREDITS_BLOCKS = [
  { heading: 'ABANDONED BUT NOT FORGOTTEN', body: 'A game by Team Gravity in Space\nNASA Space Apps Challenge 2026' },
  { heading: 'STORY AND RESEARCH', body: '[Team Member Names]' },
  { heading: 'DESIGN AND DEVELOPMENT', body: '[Team Member Names]' },
  { heading: 'PIXEL ART', body: 'Made with generative AI from team photos and edited by the team' },
  { heading: 'MUSIC AND SOUND', body: 'Synthesized Chiptune Web Audio Engine' },
  { heading: 'DATA SOURCES', body: 'NASA Science • NASA/JPL • NASA PDS • NASA NSSDCA • ESA' },
  { heading: 'THANK YOU TO THE MACHINES', body: 'Lunokhod 1 • Ingenuity • Galileo Probe • Galileo Orbiter • Pioneer 10 • Huygens' },
];
