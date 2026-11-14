import {
  BuildingConfig,
  MissionModalData,
  MissionInstructionData,
  MissionSlug,
} from '@/types/game';

export const BUILDINGS: BuildingConfig[] = [
  {
    id: 'huygens',
    name: 'Huygens Lander Lab',
    shortLabel: 'HUYGENS',
    roofColor: '#D97706',
    trimColor: '#92400E',
    x: 3,
    y: 2,
    width: 4,
    height: 3,
    doorX: 4,
    doorY: 4,
  },
  {
    id: 'lunokhod',
    name: 'Lunokhod 1 Garage',
    shortLabel: 'LUNOKHOD 1',
    roofColor: '#475569',
    trimColor: '#1E293B',
    x: 17,
    y: 2,
    width: 4,
    height: 3,
    doorX: 18,
    doorY: 4,
  },
  {
    id: 'galileo',
    name: 'Galileo Probe Observatory',
    shortLabel: 'GALILEO',
    roofColor: '#DC2626',
    trimColor: '#7F1D1D',
    x: 3,
    y: 12,
    width: 4,
    height: 3,
    doorX: 4,
    doorY: 14,
  },
  {
    id: 'ingenuity',
    name: 'Ingenuity Flight Hangar',
    shortLabel: 'INGENUITY',
    roofColor: '#2563EB',
    trimColor: '#1E3A8A',
    x: 17,
    y: 12,
    width: 4,
    height: 3,
    doorX: 18,
    doorY: 14,
  },
];

export const MISSION_MODALS: Record<MissionSlug, MissionModalData> = {
  huygens: {
    slug: 'huygens',
    title: 'Huygens Lander — Titan Touchdown',
    subtitle: 'ESA / NASA Cassini-Huygens Mission (2005)',
    imageUrl: '/images/huygens-placeholder.png',
    imageAlt: 'Huygens Lander on Titan surface',
    paragraphs: [
      'Stub Paragraph 1: Replace this with your opening overview of the Huygens probe, its seven-year journey aboard Cassini, and its historic descent through Saturn’s largest moon.',
      'Stub Paragraph 2: Replace this with details about Titan’s dense nitrogen-methane atmosphere, parachute deployment, and the dramatic aerodynamic braking sequence.',
      'Stub Paragraph 3: Replace this with the scientific discoveries made on the frozen riverbed landing site—the farthest touchdown ever accomplished by humanity.',
    ],
  },
  lunokhod: {
    slug: 'lunokhod',
    title: 'Lunokhod 1 — First Lunar Rover',
    subtitle: 'Soviet Luna 17 Mission (1970)',
    imageUrl: '/images/lunokhod-placeholder.png',
    imageAlt: 'Lunokhod 1 rover on the Moon',
    paragraphs: [
      'Stub Paragraph 1: Replace this with the story of Lunokhod 1, the first remote-controlled robotic rover to land on another celestial body in Mare Imbrium.',
      'Stub Paragraph 2: Replace this with how Earth-based drivers navigated craters in real time using television cameras, solar-powered batteries, and eight independent wheels.',
      'Stub Paragraph 3: Replace this with the mission’s legacy: operating for 10 months, traveling over 10 kilometers, and leaving behind a laser retroreflector still used today.',
    ],
  },
  galileo: {
    slug: 'galileo',
    title: 'Galileo Atmospheric Probe — Into Jupiter',
    subtitle: 'NASA Galileo Mission (1995)',
    imageUrl: '/images/galileo-placeholder.png',
    imageAlt: 'Galileo Probe descending into Jupiter',
    paragraphs: [
      'Stub Paragraph 1: Replace this with the introduction to the Galileo Atmospheric Probe, which separated from its orbiter five months before plunging into Jupiter.',
      'Stub Paragraph 2: Replace this with the extreme physics of entry—hitting Jupiter’s upper atmosphere at 170,000 km/h and enduring 230 Gs of deceleration.',
      'Stub Paragraph 3: Replace this with the 58 minutes of telemetry transmitted before extreme heat and pressure crushed the probe, revealing Jupiter’s winds and composition.',
    ],
  },
  ingenuity: {
    slug: 'ingenuity',
    title: 'Ingenuity — First Powered Flight on Mars',
    subtitle: 'NASA Mars 2020 Perseverance Mission (2021)',
    imageUrl: '/images/ingenuity-placeholder.png',
    imageAlt: 'Ingenuity Helicopter hovering over Jezero Crater',
    paragraphs: [
      'Stub Paragraph 1: Replace this with the engineering challenge of flying in Mars’s ultra-thin atmosphere, which has just 1% the density of Earth’s.',
      'Stub Paragraph 2: Replace this with how Ingenuity’s counter-rotating carbon-fiber blades spun at over 2,500 RPM to achieve the Wright Brothers moment of another world.',
      'Stub Paragraph 3: Replace this with how a 5-flight technology demonstrator evolved into a 72-flight aerial scout for the Perseverance rover.',
    ],
  },
};

export const MISSION_INSTRUCTIONS: Record<MissionSlug, MissionInstructionData> = {
  huygens: {
    slug: 'huygens',
    targetWorld: 'SATURN MOON TITAN • ENTRY INTERFACE',
    missionTitle: 'Huygens Atmospheric Descent',
    objective:
      'Guide the Huygens lander from 160 km altitude down to a soft touchdown on the illuminated Xanadu shoreline pad.',
    controls: [
      { key: 'A / D  or  ← / →', action: 'Fire lateral attitude thrusters to dodge methane shear' },
      { key: 'SPACE', action: 'Deploy main parachute (must be below 125 km altitude)' },
      { key: 'P / ESC / H', action: 'Pause simulation & open this flight manual' },
    ],
    tips: [
      'Deploying the parachute above 125 km in hypersonic entry will shred the canopy.',
      'Watch the yellow ▼ PAD ZONE marker at the bottom to line up before breaking through the haze.',
    ],
  },
  lunokhod: {
    slug: 'lunokhod',
    targetWorld: 'EARTH MOON • MARE IMBRIUM',
    missionTitle: 'Lunokhod 1 Surface Exploration',
    objective:
      'Drive the 8-wheeled lunar rover across Mare Imbrium and recover all 5 yellow telemetry probe beacons.',
    controls: [
      { key: 'W A S D  or  Arrows', action: 'Drive rover across the lunar regolith' },
      { key: 'LEFT CLICK', action: 'Set an autonomous drive waypoint on the surface' },
      { key: 'P / ESC / H', action: 'Pause rover & open this field manual' },
    ],
    tips: [
      'Drive directly over each pulsing yellow probe beacon to recover its data.',
      'Your tire tracks stay visible in the lunar dust to help map where you have explored.',
    ],
  },
  galileo: {
    slug: 'galileo',
    targetWorld: 'JUPITER • UPPER CLOUD DECKS',
    missionTitle: 'Galileo Atmospheric Plunge',
    objective:
      'Keep the descending probe locked inside the overhead Orbiter Radio Relay Beam until 100% of telemetry is uploaded.',
    controls: [
      { key: 'A / D  or  ← / →', action: 'Steer probe horizontally across Jovian cloud bands' },
      { key: 'CLICK & DRAG', action: 'Guide probe smoothly with mouse or touch' },
      { key: 'P / ESC / H', action: 'Pause descent & open this telemetry guide' },
    ],
    tips: [
      'Data only uploads while your probe stays inside the vertical cyan relay beam.',
      'Avoid purple lightning storm cells—getting struck knocks your probe off-beam briefly.',
    ],
  },
  ingenuity: {
    slug: 'ingenuity',
    targetWorld: 'MARS • JEZERO CRATER',
    missionTitle: 'Ingenuity Scout Flight',
    objective:
      'Fly across Jezero Crater, scan all 3 blue aerial waypoints, and land safely on the target helipad.',
    controls: [
      { key: 'HOLD SPACE / W / ↑', action: 'Spin coaxial rotors for lift (or hold click on canvas)' },
      { key: 'A / D  or  ← / →', action: 'Tilt cyclic pitch left or right' },
      { key: 'P / ESC / H', action: 'Pause flight & open this flight briefing' },
    ],
    tips: [
      'Mars has thin air and 38% Earth gravity—pulse your rotor lift rather than holding it continuously.',
      'All 3 waypoints must be scanned before the landing pad turns green for touchdown.',
    ],
  },
};
