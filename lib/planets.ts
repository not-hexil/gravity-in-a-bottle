import { PlanetSlug, PlanetDossierData } from '@/lib/game';

export const PLANET_DOSSIERS: Record<PlanetSlug, PlanetDossierData> = {
  mercury: {
    slug: 'mercury',
    name: 'MERCURY',
    tagline: 'Sun-Scorched Iron World • Innermost Planet',
    accentColor: '#94A3B8',
    quickFacts: [
      { label: 'Orbit Distance', value: '57.9 Million km' },
      { label: 'Surface Temp', value: '-180 °C to 430 °C' },
      { label: 'Human Hardware', value: 'MESSENGER Impact Site' },
    ],
    infoBlocks: [
      {
        id: 'merc-1',
        badge: 'PLANETARY PROFILE',
        title: 'An Oversized Metallic Core',
        body: 'Mercury is the smallest terrestrial planet in the Solar System, yet its iron-rich core makes up nearly 85% of the planet’s radius. Without a thick atmosphere to trap heat, temperatures swing wildly between blistering solar noon and freezing night.',
        imageUrl: 'https://britastro.org/wp-content/uploads/2021/05/Figure-2-v3a.png',
        imageCaption: 'Mercury planetary Core',
      },
      {
        id: 'merc-2',
        badge: 'SURFACE GEOLOGY',
        title: 'Caloris Basin & Lobate Scarps',
        body: 'As Mercury’s massive iron core cooled and contracted over billions of years, its crust wrinkled into towering cliff-like scarps hundreds of kilometers long.',
        imageUrl: 'https://science.nasa.gov/wp-content/uploads/2023/05/mercury-from-messenger-pia15160-1920x640-1.jpg',
        imageCaption: 'Mercury surface',
      },
    ],
    whatWeLeftBehind: [
      {
        id: 'merc-left-1',
        badge: 'ARTIFACT • 2015',
        title: 'NASA MESSENGER Spacecraft',
        body: 'After orbiting Mercury for over four years and mapping 100% of its surface, MESSENGER ran out of propellant on April 30, 2015 and impacted near Janáček crater at 14,000 km/h—becoming the first human artifact on Mercury.',
      },
    ],
    minigames: [
      {
        id: 'mercury-sim-1',
        title: 'MESSENGER: SUNSHADE & FINAL IMPACT',
        subtitle: '3-Stage Orbital Shielding & Crater Crash • Active Simulation',
        description:
          'Keep MESSENGER’s ceramic sunshade locked against 430 °C solar glare, scan polar ice craters, and execute its 2015 impact into Shakespeare Crater.',
        missionSlug: 'messenger',
        unlockedLoreTitle: 'MESSENGER SHAKESPEARE CRATER ARCHIVE',
        unlockedLoreParagraphs: [
          'For four years, MESSENGER’s 38 cm × 25 cm ceramic-cloth sunshade protected its electronics from 430 °C solar radiation while mapping 100% of Mercury.',
          'On April 30, 2015, after exhausting both hydrazine and emergency helium pressurant gas, MESSENGER impacted near Shakespeare Crater at 3.91 km/s—leaving a ~16-meter crater on Mercury’s surface.',
        ],
      },
    ],
  },

  venus: {
    slug: 'venus',
    name: 'VENUS',
    tagline: 'Supercritical Greenhouse World • 92-Bar Surface',
    accentColor: '#F59E0B',
    quickFacts: [
      { label: 'Surface Pressure', value: '92 Bar (900m Ocean)' },
      { label: 'Surface Temp', value: '465 °C' },
      { label: 'Human Hardware', value: 'Venera 7–14 & Vega Landers' },
    ],
    infoBlocks: [
      {
        id: 'venus-1',
        badge: 'ATMOSPHERE',
        title: 'Crushing Carbon Dioxide & Sulfuric Clouds',
        body: 'Shrouded in opaque sulfuric acid clouds, Venus suffers a runaway greenhouse effect that makes its surface hotter than Mercury despite being nearly twice as far from the Sun.',
        imageUrl: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/8/8f/Arc-1978-ac78-9464_copy.jpg/960px-Arc-1978-ac78-9464_copy.jpg',
        imageCaption: 'Venus Atmosphere',
      },
      {
        id: 'venus-2',
        badge: 'ROTATION',
        title: 'Retrograde Slow Spin',
        body: 'Venus rotates backward compared to most planets, taking 243 Earth days to complete a single spin—longer than its 225-day orbital year.',
        imageUrl: 'https://assets.science.nasa.gov/dynamicimage/assets/science/cds/general/images/2024/03/venus-mariner-10-pia23791-fig2.jpg',
        imageCaption: 'Venus in 1974',
      },
    ],
    whatWeLeftBehind: [
      {
        id: 'venus-left-1',
        badge: 'ARTIFACT • 1970–1982',
        title: 'Soviet Venera Landers',
        body: 'Titanium-hulled Soviet Venera probes survived up to 127 minutes on Venus’s volcanic basalt plains, transmitting the first surface photographs and color panoramas from another planet.',
      },
    ],
    minigames: [
      {
        id: 'venus-sim-1',
        title: 'VENERA 13: SUPERCRITICAL DESCENT',
        subtitle: '3-Stage Cloud Entry & Surface Drill • Active Simulation',
        description:
          'Survive 92-bar pressure and 465 °C heat to drill Phoebe Regio and beam the first color panorama of Venus.',
        missionSlug: 'venera13',
        unlockedLoreTitle: 'VENERA 13 SURFACE TELEMETRY',
        unlockedLoreParagraphs: [
          'Built with a thick titanium pressure shell, Venera 13 survived 127 minutes on Venus’s volcanic basalt plains—nearly four times longer than its 32-minute design target.',
          'Its X-ray fluorescence spectrometer analyzed drilled regolith samples while its mechanical camera recorded the first color images of Venus’s orange-lit landscape.',
        ],
      },
    ],
  },

  earth: {
    slug: 'earth',
    name: 'EARTH',
    tagline: 'Blue Ocean Cradle • Launchpad of Deep Space Exploration',
    accentColor: '#38BDF8',
    quickFacts: [
      { label: 'Atmosphere', value: '78% N₂ • 21% O₂' },
      { label: 'Orbital Velocity', value: '29.78 km/s' },
      { label: 'Deep Space Network', value: 'Goldstone • Madrid • Canberra' },
    ],
    infoBlocks: [
      {
        id: 'earth-1',
        badge: 'HOMEWORLD',
        title: 'The Only Known Biosphere',
        body: 'Protected by a global magnetosphere and liquid water oceans, Earth is the point of origin for every robotic emissary and crewed expedition sent across the Solar System.',
        imageUrl: 'https://science.nasa.gov/wp-content/uploads/2023/05/earth-1-jpg.webp',
        imageCaption: 'Earth - our home',
      },
    ],
    whatWeLeftBehind: [
      {
        id: 'earth-comms',
        badge: 'DEEP SPACE NETWORK',
        title: 'Odyssey 6',
        body: 'Home',
        imageUrl: 'https://science.nasa.gov/wp-content/uploads/2023/05/earth-1-jpg.webp',
        imageCaption: 'Earth',
      },
    ],
    minigames: [],
  },

  moon: {
    slug: 'moon',
    name: 'THE MOON',
    tagline: 'Earth’s Ancient Companion • Mare Imbrium & Oceanus Procellarum',
    accentColor: '#CBD5E1',
    quickFacts: [
      { label: 'Distance', value: '384,400 km' },
      { label: 'Surface Gravity', value: '1.62 m/s² (1/6 g)' },
      { label: 'Human Hardware', value: 'Apollo, Luna, Lunokhod & Surveyor' },
    ],
    infoBlocks: [
      {
        id: 'moon-1',
        badge: 'LUNAR GEOLOGY',
        title: 'Basalt Maria & Ancient Highlands',
        body: 'Dark volcanic plains (maria) formed billions of years ago when asteroid impacts flooded basins with molten lava, contrasted against bright, heavily cratered anorthosite highlands.',
        imageUrl: '/assets/planets/placeholder.png',
        imageCaption: 'The Moon planetary archive placeholder',
      },
      {
        id: 'moon-2',
        badge: 'REGOLITH',
        title: 'Electrostatic Razor-Sharp Dust',
        body: 'Without wind or water erosion, billions of years of micrometeorite impacts pulverized lunar rock into fine, abrasive glass-like regolith that clings to spacesuits and rover wheels.',
        imageUrl: '/assets/planets/placeholder.png',
        imageCaption: 'The Moon regolith telemetry placeholder',
      },
    ],
    whatWeLeftBehind: [
      {
        id: 'moon-left-1',
        badge: 'ROVER • NOV 1970',
        title: 'Lunokhod 1 (Luna 17)',
        body: 'The first planetary rover in history traversed 10.54 km across Mare Imbrium over 322 Earth days, carrying a French laser retroreflector that still returns laser pulses from Earth.',
        imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/7/79/Soviet_moonrover.JPG',
        imageCaption: 'Lunokhod 1 eight-wheeled rover with clamshell solar lid',
      },
      {
        id: 'moon-left-2',
        badge: 'LANDER • APR 1967 & NOV 1969',
        title: 'Surveyor 3 & Apollo 12',
        body: 'Surveyor 3 soft-landed inside a crater in Oceanus Procellarum in 1967 and dug trenches with its robotic soil sampler. Thirty-one months later, Apollo 12 astronauts Pete Conrad and Alan Bean landed 160 meters away and brought its camera back to Earth.',
      },
    ],
    minigames: [
      {
        id: 'moon-lunokhod',
        title: 'LUNOKHOD 1: LUNAR TRAVERSE',
        subtitle: '3-Stage Rover Expedition • Active Simulation',
        description:
          'Drive the 8-wheeled Soviet rover across Mare Imbrium, pulse subsurface sonar, and survive lunar nightfall.',
        missionSlug: 'lunokhod',
        unlockedLoreTitle: 'LUNOKHOD 1 FIELD REPORT',
        unlockedLoreParagraphs: [
          'Delivered to the Sea of Rains by Luna 17 in November 1970, Lunokhod 1 was driven in real time by a five-person crew on Earth navigating a 2.6-second radio delay.',
          'Its French-built corner-cube laser retroreflector remained operational for decades, allowing observatories on Earth to measure the Moon’s receding orbit to millimeter accuracy.',
        ],
      },
      {
        id: 'moon-surveyor3',
        title: 'SURVEYOR 3: REGOLITH SCOOP & APOLLO 12',
        subtitle: '3-Stage Surface Sampler • Active Simulation',
        description:
          'Operate Surveyor 3’s surface-sampler trenching claw in Oceanus Procellarum ahead of the Apollo 12 rendezvous.',
        missionSlug: 'surveyor3',
        unlockedLoreTitle: 'SURVEYOR 3 & APOLLO 12 ARCHIVE',
        unlockedLoreParagraphs: [
          'Surveyor 3 operated its soil mechanics surface sampler for 18 hours in April 1967, proving lunar regolith could support crewed Apollo lunar modules.',
          'In November 1969, Apollo 12 astronauts visited Surveyor 3 on foot—making it the only robotic probe ever visited by humans on another world.',
        ],
      },
    ],
  },

  mars: {
    slug: 'mars',
    name: 'MARS',
    tagline: 'The Red Planet • Jezero Crater & Ancient River Deltas',
    accentColor: '#EA580C',
    quickFacts: [
      { label: 'Atmosphere', value: '95% CO₂ (1% Earth Pressure)' },
      { label: 'Surface Gravity', value: '3.72 m/s² (0.38 g)' },
      { label: 'Human Hardware', value: 'Ingenuity, Perseverance, Curiosity' },
    ],
    infoBlocks: [
      {
        id: 'mars-1',
        badge: 'ANCIENT HYDROLOGY',
        title: 'Jezero Crater Lakebed',
        body: 'Over 3.5 billion years ago, liquid water flowed into Jezero Crater, carving river channels and depositing a fan-shaped clay delta rich in preserved mineral clues.',
        imageUrl: 'https://assets.science.nasa.gov/dynamicimage/assets/science/psd/solar/2023/09/j/JezeroCrater_1600.jpg',
        imageCaption: 'Mars Jezero Crater',
      },
      {
        id: 'mars-2',
        badge: 'THIN AIR',
        title: 'Aerodynamic Frontier',
        body: 'Mars’s carbon dioxide atmosphere has roughly 1% the surface density of Earth’s—equivalent to flying at 30,000 meters altitude above Earth.',
        imageUrl: 'https://media.esa.int/legacy/web/images/esa_multimedia/images/2018/04/comparing_the_atmospheres_of_mars_and_earth/17444033-1-eng-GB/208975/image-thumb__208975__fit_large/Comparing_the_atmospheres_of_Mars_and_Earth~-~media--9a2dd926--query@2x.fc37edfc.webp',
        imageCaption: 'Mars vs Earth Atmosphere',
      },
    ],
    whatWeLeftBehind: [
      {
        id: 'mars-left-1',
        badge: 'ROTORCRAFT • 2021–2024',
        title: 'Ingenuity Mars Helicopter',
        body: 'Designed for 5 test hops, the 1.8 kg coaxial helicopter completed 72 flights across 17 km of Jezero Crater before resting permanently at Valinor Hills.',
        imageUrl:
          'https://www.universetoday.com/article_images/PIA25338_Three_models_of_Mars_helicopter-750.jpg',
        imageCaption: 'Ingenuity coaxial rotor hardware at NASA JPL',
      },
    ],
    minigames: [
      {
        id: 'mars-ingenuity',
        title: 'INGENUITY: JEZERO FLIGHT CAMPAIGN',
        subtitle: '3-Stage Rotorcraft Flight • Active Simulation',
        description:
          'Spin counter-rotating carbon blades at 2,537 RPM through shifting Martian winds and dust devils.',
        missionSlug: 'ingenuity',
        unlockedLoreTitle: 'INGENUITY FLIGHT LOGS',
        unlockedLoreParagraphs: [
          'On April 19, 2021, Ingenuity achieved the first powered, controlled aerodynamic flight on another planet.',
          'Over 72 flights, Ingenuity served as an autonomous aerial scout for Perseverance across treacherous sand dunes and boulder fields.',
        ],
      },
    ],
  },

  jupiter: {
    slug: 'jupiter',
    name: 'JUPITER',
    tagline: 'King of the Gas Giants • 22-Bar Crushing Abyss',
    accentColor: '#D97706',
    quickFacts: [
      { label: 'Equatorial Radius', value: '71,492 km (11× Earth)' },
      { label: 'Entry Velocity', value: '47.4 km/s (170,000 km/h)' },
      { label: 'Human Hardware', value: 'Galileo Atmospheric Probe' },
    ],
    infoBlocks: [
      {
        id: 'jup-1',
        badge: 'GAS GIANT STRUCTURE',
        title: 'No Solid Surface',
        body: 'Composed primarily of hydrogen and helium, Jupiter transitions smoothly from turbulent ammonia cloud bands into supercritical fluid and metallic hydrogen deep below.',
        imageUrl: 'https://dbx6c2burld74.cloudfront.net/migration/1551192248-6ad699d72d9c13a901a51b99690e6cbb.jpg',
        imageCaption: 'Jupiter surface',
      },
      {
        id: 'jup-2',
        badge: 'EXTREME WEATHER',
        title: 'Giant Red',
        body: 'Jupiter’s iconic Great Red Spot is a giant storm bigger than Earth that has raged for hundreds of years.',
        imageUrl: 'https://science.nasa.gov/wp-content/uploads/2024/03/jupiter-marble-pia22946-16x9-1.jpg?resize=1200,675',
        imageCaption: 'Jupiter Great Red',
      },
    ],
    whatWeLeftBehind: [
      {
        id: 'jup-left-1',
        badge: 'ENTRY PROBE • DEC 7, 1995',
        title: 'Galileo Atmospheric Probe',
        body: 'Plunging into Jupiter at 170,000 km/h, the Galileo probe survived 228 g of deceleration and transmitted 57.6 minutes of direct atmospheric telemetry before vaporizing at 22 bars.',
        imageUrl:
          'https://assets.science.nasa.gov/content/dam/science/psd/solar/2023/07/galileo_probe.jpg/jcr:content/renditions/cq5dam.web.1280.1280.jpeg',
        imageCaption: 'Galileo Atmospheric Entry Probe deceleration module',
      },
    ],
    minigames: [
      {
        id: 'jup-galileo',
        title: 'GALILEO: 22-BAR ATMOSPHERIC PLUNGE',
        subtitle: '3-Stage Entry & Relay • Active Simulation',
        description:
          'Tune transponder frequencies inside the Orbiter beam, vent heat shield plasma, and dodge super-bolts.',
        missionSlug: 'galileo',
        unlockedLoreTitle: 'GALILEO DEEP ATMOSPHERE DATA',
        unlockedLoreParagraphs: [
          'Galileo’s carbon-phenolic heat shield lost more than half its mass during entry while withstanding shockwave temperatures hotter than the Sun’s surface.',
          'The probe discovered unexpectedly dry, windy conditions inside a Jovian hot spot before crushing pressure ended transmission at 156 km depth.',
        ],
      },
    ],
  },

  saturn: {
    slug: 'saturn',
    name: 'SATURN & TITAN',
    tagline: 'Ringed Giant & Methane-Shrouded Moon',
    accentColor: '#EAB308',
    quickFacts: [
      { label: 'Ring Span', value: '282,000 km' },
      { label: 'Largest Moon', value: 'Titan (-179.5 °C)' },
      { label: 'Human Hardware', value: 'Huygens Lander & Cassini' },
    ],
    infoBlocks: [
      {
        id: 'sat-1',
        badge: 'RING SYSTEM',
        title: 'Billions of Water-Ice Fragments',
        body: 'Saturn’s iconic rings span hundreds of thousands of kilometers yet average only tens of meters thick, sculpted by shepherd moons.',
        imageUrl: 'https://science.nasa.gov/wp-content/uploads/2024/03/saturn-farewell-pia21345.jpg',
        imageCaption: 'Saturn planetary archive placeholder',
      },
      {
        id: 'sat-2',
        badge: 'MOON TITAN',
        title: 'Liquid Methane Rivers & Lakes',
        body: 'Saturn’s largest moon, Titan, possesses a dense nitrogen atmosphere 1.5× thicker than Earth’s surface pressure, where liquid methane falls as rain and fills dark hydrocarbon seas.',
        imageUrl: 'https://assets.science.nasa.gov/dynamicimage/assets/science/psd/solar/2023/07/titan_carousel2.jpg',
        imageCaption: 'Saturn ring & moon telemetry placeholder',
      },
    ],
    whatWeLeftBehind: [
      {
        id: 'sat-left-1',
        badge: 'LANDER • JAN 14, 2005',
        title: 'ESA / NASA Huygens Lander',
        body: 'After a 7-year journey aboard Cassini, Huygens parachuted for 2 hours and 27 minutes through Titan’s orange haze to achieve humanity’s first landing in the outer Solar System.',
        imageUrl: 'https://www.nasa.gov/wp-content/uploads/2023/03/545754main_pia08427-full_full.jpg',
        imageCaption: 'Huygens surface panorama from Titan’s Xanadu flood plain',
      },
    ],
    minigames: [
      {
        id: 'sat-huygens',
        title: 'HUYGENS: TITAN PARACHUTE DESCENT',
        subtitle: '3-Stage Atmospheric Landing • Active Simulation',
        description:
          'Deploy your main canopy below 130 km, activate deflector shields, and touch down on Xanadu’s shoreline.',
        missionSlug: 'huygens',
        unlockedLoreTitle: 'HUYGENS SURFACE TELEMETRY',
        unlockedLoreParagraphs: [
          'Huygens transmitted 72 minutes of surface data from Titan’s pebble-strewn flood plain—over 1.2 billion kilometers from Earth.',
          'Acoustic sounders and penetrometers revealed a damp, tar-like crust of water-ice pebbles coated in liquid methane.',
        ],
      },
    ],
  },

  titan: {
    slug: 'titan',
    name: 'TITAN (SATURN VI)',
    tagline: 'Organic Haze World • Xanadu Shoreline',
    accentColor: '#F97316',
    quickFacts: [
      { label: 'Surface Temp', value: '-179.5 °C' },
      { label: 'Surface Pressure', value: '1.45 Bar' },
      { label: 'Human Hardware', value: 'ESA Huygens Probe' },
    ],
    infoBlocks: [
      {
        id: 'titan-1',
        badge: 'DESERTS AND SEAS',
        title: 'Deserts and Seas',
        body: 'Rippling sand dunes, like those in Earth\'s Arabian desert, can be seen in the dark equatorial regions of Titan. Scientists think the sand is not made of silicates as on Earth, but of solid water ice coated with hydrocarbons that fall from the atmosphere. ',
        imageUrl: 'https://assets.science.nasa.gov/dynamicimage/assets/science/psd/solar/internal_resources/3797/Full_view_of_Titan_with_sunlight_glinting_off_lakes.jpeg',
        imageCaption: 'Titan planetary archive placeholder',
      },
    ],
    whatWeLeftBehind: [
      {
        id: 'titan-left-1',
        badge: 'LANDER • JAN 14, 2005',
        title: 'Huygens Surface Station',
        body: 'Resting near the Xanadu region, Huygens remains the farthest spacecraft ever landed by humanity.',
        imageUrl: 'https://www.nasa.gov/wp-content/uploads/2023/03/545754main_pia08427-full_full.jpg',
        imageCaption: 'Huygens surface view on Titan',
      },
    ],
    minigames: [
      {
        id: 'titan-huygens',
        title: 'HUYGENS: TITAN PARACHUTE DESCENT',
        subtitle: '3-Stage Atmospheric Landing • Active Simulation',
        description:
          'Guide Huygens through Titan’s thick nitrogen-methane haze onto solid ice bedrock.',
        missionSlug: 'huygens',
        unlockedLoreTitle: 'HUYGENS SURFACE TELEMETRY',
        unlockedLoreParagraphs: [
          'Huygens captured panoramic imagery of dendritic drainage channels during its 147-minute descent.',
        ],
      },
    ],
  },

  uranus: {
    slug: 'uranus',
    name: 'URANUS',
    tagline: 'The Tilted Ice Giant • 98° Axial Obliquity & 13 Faint Rings',
    accentColor: '#38BDF8',
    quickFacts: [
      { label: 'Distance from Sun', value: '2.87 Billion km (19.2 AU)' },
      { label: 'Axial Tilt', value: '97.77° (Rolling on Side)' },
      { label: 'Surface Hardware', value: 'None — Flyby Only (Voyager 2, 1986)' },
    ],
    infoBlocks: [
      {
        id: 'uranus-1',
        badge: 'ICE GIANT COMPOSITION',
        title: 'Water, Ammonia & Methane Mantle',
        body: 'Unlike gas giants Jupiter and Saturn, Uranus is an ice giant composed primarily of a hot, dense fluid mantle of water, ammonia, and methane ices surrounding a small rocky core. Atmospheric methane absorbs red sunlight and reflects blue-green wavelengths, giving Uranus its pale cyan hue.',
        imageUrl: 'https://assets.science.nasa.gov/dynamicimage/assets/science/cds/general/images/2024/03/uranus-pia18182-16x9-1.jpg',
        imageCaption: 'Uranus View',
      },
      {
        id: 'uranus-2',
        badge: 'EXTREME SEASONS',
        title: 'A 98-Degree Sideways Tilt',
        body: 'Likely knocked onto its side by an ancient protoplanetary collision, Uranus rolls around the Sun with its poles pointed nearly directly toward and away from solar illumination. Each pole experiences 42 continuous Earth years of sunlight followed by 42 years of total winter darkness.',
        imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/f/fa/Uranuscolour.png',
        imageCaption: 'Uranus climate',
      },
    ],
    whatWeLeftBehind: [
      {
        id: 'uranus-left-1',
        badge: 'STATUS • UNTOUCHED ORBIT',
        title: 'No Spacecraft Left Behind',
        body: `Humanity has visited Uranus only once—when NASA’s Voyager 2 sped past on January 24, 1986 before continuing outward toward Neptune and interstellar space.

No orbiter, atmospheric probe, or lander has ever remained at Uranus, leaving its 28 moons and 13 dark rings completely free of human hardware.`,
      },
    ],
    minigames: [],
  },

  neptune: {
    slug: 'neptune',
    name: 'NEPTUNE',
    tagline: 'The Supersonic Wind World • Great Dark Spot & Triton',
    accentColor: '#4F46E5',
    quickFacts: [
      { label: 'Distance from Sun', value: '4.50 Billion km (30.1 AU)' },
      { label: 'Peak Wind Speed', value: '2,100 km/h (Supersonic)' },
      { label: 'Surface Hardware', value: 'None — Flyby Only (Voyager 2, 1989)' },
    ],
    infoBlocks: [
      {
        id: 'neptune-1',
        badge: 'ATMOSPHERIC DYNAMICS',
        title: 'Fastest Winds in the Solar System',
        body: 'Despite receiving less than 0.1% of the sunlight that reaches Earth, Neptune drives ferocious supersonic winds exceeding 2,100 km/h—powered by internal heat radiating from its deep interior. High-altitude methane ice clouds cast visible shadows onto the deeper azure cloud deck below.',
        imageUrl: 'https://science.nasa.gov/wp-content/uploads/2024/03/pia01492-neptune-full-disk-16x9-1.jpg',
        imageCaption: 'Neptune Surface',
      },
      {
        id: 'neptune-2',
        badge: 'CAPTURED MOON',
        title: 'Triton’s Nitrogen Geysers',
        body: `Neptune’s largest moon, Triton, orbits backward (retrograde) around the planet, revealing it as a captured Kuiper Belt object similar to Pluto.

Even at -235 °C, solar heating drives active cryovolcanic plumes that erupt dark nitrogen gas and dust 8 kilometers into Triton’s thin atmosphere.`,
        imageUrl: 'https://assets.science.nasa.gov/dynamicimage/assets/science/psd/solar/2023/07/PIA00317_modest.jpg',
        imageCaption: 'Neptune & Triton',
      },
    ],
    whatWeLeftBehind: [
      {
        id: 'neptune-left-1',
        badge: 'STATUS • UNTOUCHED ORBIT',
        title: 'No Spacecraft Left Behind',
        body: `Like Uranus, Neptune has been explored by just a single flyby: Voyager 2 skimmed 4,950 km above Neptune’s north pole on August 25, 1989 before exiting the planetary system.

Because Voyager 2 continued on its interstellar trajectory, zero probes, landers, or orbiters have ever been left behind in the Neptunian system.`,
      },
    ],
    minigames: [],
  },
};

export function resolvePlanetSlug(raw?: string): PlanetSlug {
  if (!raw) return 'moon';
  const normalized = raw.toLowerCase().trim();
  if (normalized in PLANET_DOSSIERS) {
    return normalized as PlanetSlug;
  }
  return 'moon';
}
