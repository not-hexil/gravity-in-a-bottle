import { MissionSlug, MissionModalData, MissionInstructionData } from '@/types/game';

export const MISSION_MODALS: Record<MissionSlug, MissionModalData> = {
  huygens: {
    slug: 'huygens',
    title: 'HUYGENS LANDER',
    subtitle: 'ESA / NASA Cassini–Huygens Mission • Titan (2005)',
    imageUrl: 'https://www.nasa.gov/wp-content/uploads/2023/03/545754main_pia08427-full_full.jpg',
    imageCaption: 'Huygens Lander: First optical surface panorama from Saturn’s moon Titan',
    paragraphs: [
      'Launched aboard NASA’s Cassini orbiter in 1997, the European Space Agency’s Huygens probe traveled seven years across the outer solar system before separating and plunging into the thick, nitrogen-rich haze of Saturn’s largest moon, Titan, on January 14, 2005.',
      'During a 2-hour, 27-minute parachute descent through freezing methane clouds, Huygens captured panoramic images of dendritic river channels and dark hydrocarbon lakes, proving Titan has an active meteorological cycle shaped by liquid methane rather than water.',
      'Touching down on a damp, pebble-strewn flood plain near the Xanadu region, Huygens achieved humanity’s first landing in the outer solar system—transmitting surface telemetry for 72 minutes after impact from more than 1.2 billion kilometers away.',
    ],
    stats: [
      { label: 'Landing Date', value: 'Jan 14, 2005' },
      { label: 'Surface Temp', value: '-179.5 °C' },
      { label: 'Distance from Earth', value: '1.2 Billion km' },
    ],
  },

  lunokhod: {
    slug: 'lunokhod',
    title: 'LUNOKHOD 1 ROVER',
    subtitle: 'Soviet Luna 17 Mission • Mare Imbrium, The Moon (1970)',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/7/79/Soviet_moonrover.JPG',
    imageCaption: 'Lunokhod 1: Eight-wheeled Soviet lunar rover with clamshell solar lid',
    paragraphs: [
      'Delivered to the Sea of Rains (Mare Imbrium) by Luna 17 in November 1970, Lunokhod 1 was the first planetary rover in history to land and operate on another celestial body, driven in real time by a five-person crew on Earth navigating a 2.6-second radio delay.',
      'Powered by a distinctive clamshell solar-cell lid during the 14-day lunar daytime and warmed through frigid lunar nights by a polonium-210 radioisotope heater, its eight independently powered wire-mesh wheels traversed rugged craters for nearly eleven months.',
      'Lunokhod 1 transmitted over 20,000 television images, performed 500 soil-strength penetrometer tests, and carried a French laser retroreflector that still helps scientists measure the Earth–Moon distance to millimeter precision today.',
    ],
    stats: [
      { label: 'Active Duration', value: '322 Earth Days' },
      { label: 'Distance Driven', value: '10.54 km' },
      { label: 'Soil Tests', value: '500+ Locations' },
    ],
  },

  surveyor3: {
    slug: 'surveyor3',
    title: 'SURVEYOR 3 & APOLLO 12',
    subtitle: 'NASA Surveyor Program • Oceanus Procellarum, The Moon (1967 & 1969)',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/4/45/AS12-48-7136HR.jpg',
    imageCaption: 'Apollo 12 astronaut Alan Bean inspecting Surveyor 3 with Lunar Module Intrepid in the background',
    paragraphs: [
      'Soft-landing inside a 200-meter crater in Oceanus Procellarum on April 20, 1967, NASA’s Surveyor 3 bounced twice across the lunar slope before deploying its pantograph surface-sampler scoop to dig four trenches and test whether lunar regolith could support crewed Apollo landers.',
      'Over 18 hours of robotic soil mechanics operations, Surveyor 3’s claw crushed lunar clods, measured bearing strength, and transmitted 6,315 television images back to Earth—proving the Moon’s surface had the firmness of wet beach sand.',
      'Thirty-one months later, on November 19, 1969, Apollo 12 astronauts Pete Conrad and Alan Bean executed a pinpoint landing just 160 meters away, walked down the crater wall to inspect Surveyor 3, and returned its television camera and scoop to Earth.',
    ],
    stats: [
      { label: 'Landing Site', value: 'Oceanus Procellarum' },
      { label: 'Trenches Dug', value: '4 Regolith Trenches' },
      { label: 'Apollo 12 Distance', value: '160 Meters' },
    ],
  },

  galileo: {
    slug: 'galileo',
    title: 'GALILEO ATMOSPHERIC PROBE',
    subtitle: 'NASA Galileo Mission • Jupiter Entry (1995)',
    imageUrl:
      'https://assets.science.nasa.gov/content/dam/science/psd/solar/2023/07/galileo_probe.jpg/jcr:content/renditions/cq5dam.web.1280.1280.jpeg',
    imageCaption: 'Galileo Atmospheric Probe: Gold-foiled deceleration module & heat shield',
    paragraphs: [
      'Released from the Galileo orbiter five months prior, the 339-kilogram Galileo Entry Probe slammed into Jupiter’s upper atmosphere on December 7, 1995 at 170,000 km/h—the highest-speed atmospheric entry ever engineered, generating shockwave temperatures hotter than the Sun’s surface.',
      'Protected by a carbon-phenolic heat shield that lost over half its mass during a 230-g deceleration, the probe deployed its main parachute and descended 156 kilometers below the cloud tops, beaming direct measurements of Jupiter’s winds, lightning, helium ratio, and heavy elements back to the orbiter overhead.',
      'For 57.6 minutes, Galileo relayed humanity’s first in-situ data from a gas giant until crushing 22-bar atmospheric pressure and 153 °C heat finally silenced its transmitter and vaporized the spacecraft deep inside Jupiter’s abyss.',
    ],
    stats: [
      { label: 'Entry Speed', value: '47.4 km/s' },
      { label: 'Max Deceleration', value: '228 g' },
      { label: 'Crush Depth', value: '22 Bar (~156 km)' },
    ],
  },

  ingenuity: {
    slug: 'ingenuity',
    title: 'INGENUITY MARS HELICOPTER',
    subtitle: 'NASA Mars 2020 Mission • Jezero Crater (2021–2024)',
    imageUrl:
      'https://www.universetoday.com/article_images/PIA25338_Three_models_of_Mars_helicopter-750.jpg',
    imageCaption: 'Ingenuity: Coaxial carbon-fiber rotor test hardware at NASA JPL',
    paragraphs: [
      'On April 19, 2021, the 1.8-kilogram Ingenuity helicopter spun its counter-rotating carbon-fiber blades at 2,537 RPM to achieve the first powered, controlled aerodynamic flight on another planet—lifting off in Martian air only 1% as dense as Earth’s atmosphere.',
      'Originally designed as a 30-sol technology demonstration slated for at most five short test hops, Ingenuity shattered every engineering expectation by completing 72 flights over nearly three years across Jezero Crater’s treacherous dunes and ancient river delta.',
      'Operating autonomously via onboard navigation cameras and solar-charged batteries, Ingenuity became an indispensable aerial scout for the Perseverance rover, mapping safe routes and hazardous terrain across more than 17 kilometers of Martian sky.',
    ],
    stats: [
      { label: 'Total Flights', value: '72 Flights' },
      { label: 'Total Distance', value: '17.0 km' },
      { label: 'Max Altitude', value: '24 Meters' },
    ],
  },
  venera13: {
      slug: 'venera13',
      title: 'VENERA 13 LANDER',
      subtitle: 'Soviet Venera Program • Phoebe Regio, Venus (1982)',
      imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/e/e1/Venera_13_surface.jpg',
      imageCaption: 'Venera 13: First color panoramic photograph transmitted from the surface of Venus',
      paragraphs: [
        'Plunging through Venus’s dense sulfuric acid clouds on March 1, 1982, the Soviet Venera 13 descent module used an aerodynamic braking ring rather than a full parachute in the lower supercritical atmosphere to reach the volcanic plains of Phoebe Regio.',
        'Built with a thick titanium pressure hull designed to withstand 92 atmospheres of crushing carbon dioxide pressure and 465 °C heat, Venera 13 deployed a spring-loaded soil drill, analyzed a basalt sample via X-ray fluorescence, and captured the first color panoramas of Venus.',
        'Engineered to survive just 32 minutes on the hellish surface, Venera 13 defied expectations by operating and beaming telemetry to its flyby spacecraft for 127 minutes before succumbing to the heat.',
      ],
      stats: [
        { label: 'Landing Date', value: 'Mar 1, 1982' },
        { label: 'Surface Survival', value: '127 Minutes' },
        { label: 'Surface Conditions', value: '465 °C • 92 Bar' },
      ],
  },
  messenger: {
      slug: 'messenger',
      title: 'MESSENGER ORBITER & IMPACTOR',
      subtitle: 'NASA Discovery Mission • Mercury & Shakespeare Crater (2011–2015)',
      imageUrl: 'https://assets.science.nasa.gov/content/dam/science/psd/solar/2023/07/messenger.jpg',
      imageCaption: 'MESSENGER spacecraft with its ceramic-cloth sunshade facing the Sun',
      paragraphs: [
        'Entering orbit around Mercury in March 2011, NASA’s MESSENGER spacecraft endured solar radiation eleven times brighter than at Earth—keeping its instruments at room temperature behind a lightweight ceramic-cloth sunshade while daytime surface temperatures outside reached 430 °C.',
        'Over four years and 4,105 orbits, MESSENGER mapped 100% of Mercury’s surface, revealed that its iron core spans roughly 85% of the planet’s radius, and confirmed water ice trapped inside permanently shadowed polar craters.',
        'After exhausting its hydrazine propellant and even firing non-fuel helium pressurant gas to extend its mission, MESSENGER slammed into Mercury near Shakespeare Crater on April 30, 2015 at 3.91 km/s—carving a new 16-meter impact crater into the crust.',
      ],
      stats: [
        { label: 'Orbit Duration', value: '4 Years (4,105 Orbits)' },
        { label: 'Impact Date', value: 'Apr 30, 2015' },
        { label: 'Impact Speed', value: '3.91 km/s (~16 m Crater)' },
      ],
    },
};

export const MISSION_INSTRUCTIONS: Record<MissionSlug, MissionInstructionData> = {
  huygens: {
    slug: 'huygens',
    targetWorld: 'SATURN VI • TITAN',
    missionTitle: 'HUYGENS TITAN DESCENT',
    title: 'HUYGENS TITAN DESCENT',
    objective:
      'Guide the Huygens probe across 3 atmospheric stages (~2 mins each) into Titan’s thick orange haze. Deploy your parachute below 130 km, shield or blast incoming storm orbs, and land on Xanadu.',
    controls: [
      { key: '← / → or A / D', action: 'Fire lateral attitude thrusters' },
      { key: 'SPACE', action: 'Deploy parachute (below 130 km) / Fire in Stage 3' },
      { key: 'S / SHIFT', action: 'Toggle Deflector Shield Dome (Stage 2+)' },
      { key: 'F / ENTER', action: 'Fire Atmospheric Plasma Cannon (Stage 3)' },
    ],
    tips: [
      'Deploying the parachute above 130 km shreds the canopy—wait until it reads ARMED!',
      'In Stage 2+, press [S] to activate a temporary shield dome that absorbs storm orb hits.',
      'In Stage 3, press [F] to blast incoming storm orbs and align with the cyan radar beam.',
    ],
  },

  lunokhod: {
    slug: 'lunokhod',
    targetWorld: 'EARTH • MARE IMBRIUM (THE MOON)',
    missionTitle: 'LUNOKHOD 1 LUNAR TRAVERSE',
    title: 'LUNOKHOD 1 LUNAR TRAVERSE',
    objective:
      'Navigate Lunokhod 1 across 3 expanding lunar sectors (~2 mins each). Recover all surface and buried telemetry beacons while avoiding jagged craters.',
    controls: [
      { key: 'WASD / Arrows', action: 'Drive 8-wheel lunar rover' },
      { key: 'Mouse Click', action: 'Set autonomous waypoint target' },
      { key: 'E / SHIFT', action: 'Fire Sonar Pulse to reveal buried beacons (Stage 2+)' },
      { key: 'SPACE', action: 'Sonar Pulse (Stage 1–2) • Hold for Turbo (Stage 3)' },
    ],
    tips: [
      'Use the bottom-right mini-radar to track surface beacons; fire Sonar [E] to reveal buried ones.',
      'In Stage 2, crossing rough craters slows you down—crossing 2 breaks the suspension.',
      'In Stage 3, rough craters are solid impassable walls; pulse [E] Sonar and hold [SPACE] Turbo.',
    ],
  },

  surveyor3: {
    slug: 'surveyor3',
    targetWorld: 'EARTH • OCEANUS PROCELLARUM (THE MOON)',
    missionTitle: 'SURVEYOR 3: REGOLITH SCOOP & APOLLO 12',
    title: 'SURVEYOR 3: REGOLITH SCOOP & APOLLO 12',
    objective:
      'Operate Surveyor 3’s pantograph sampler arm across 3 lunar crater phases: excavate regolith trenches, perform soil bearing-strength tests, and align optical beacons for Apollo 12.',
    controls: [
      { key: '← / → or A / D', action: 'Swing sampler boom azimuth left / right' },
      { key: '↑ / ↓ or W / S', action: 'Extend / retract pantograph arm reach' },
      { key: 'SPACE', action: 'Fire Scoop Claw / Bearing Drop / Optical Ping' },
      { key: 'P / ESC', action: 'Pause simulation & view briefing' },
    ],
    tips: [
      'Position the glowing yellow claw crosshair directly over amber regolith zones before pressing [SPACE].',
      'Avoid scooping dark basalt bedrock slabs—striking rock spikes Arm Strain!',
      'In Stage 3, calibrate all optical markers while Apollo 12’s LM Intrepid descends onto the crater rim.',
    ],
  },

  galileo: {
    slug: 'galileo',
    targetWorld: 'JUPITER • EQUATORIAL CLOUD DECK',
    missionTitle: 'GALILEO JUPITER PLUNGE',
    title: 'GALILEO JUPITER PLUNGE',
    objective:
      'Plunge through 3 Jovian cloud decks (~2 mins each). Stay inside the Orbiter Relay Beam, tune your carrier frequency band, collect sample rings, and survive 22-bar pressure.',
    controls: [
      { key: '← / → or Drag', action: 'Steer probe through zonal jet streams' },
      { key: 'SPACE', action: 'Cycle radio frequency band (Cyan / Amber / Emerald)' },
      { key: 'P / ESC', action: 'Pause simulation & view briefing' },
    ],
    tips: [
      'Match your probe’s transponder ring color to the Orbiter beam for 3× upload speed.',
      'Steer through cyan COOL VENT pockets to keep Shield Heat below 100%.',
      'Watch for flickering warning lines before Super-Bolt lightning arcs strike in Stages 2 & 3.',
    ],
  },

  ingenuity: {
    slug: 'ingenuity',
    targetWorld: 'MARS • JEZERO CRATER',
    missionTitle: 'INGENUITY MARS FLIGHT',
    title: 'INGENUITY MARS FLIGHT',
    objective:
      'Pilot Ingenuity across 3 Jezero Crater flight campaigns (~2 mins each). Scan all aerial waypoints while battling shifting Martian winds before landing on the helipad.',
    controls: [
      { key: 'SPACE / ↑ / W', action: 'Hold for coaxial rotor lift thrust' },
      { key: '← / → or A / D', action: 'Cyclic pitch left / right' },
      { key: 'P / ESC', action: 'Pause simulation & view briefing' },
    ],
    tips: [
      'Watch the MARS WIND indicator—headwinds, tailwinds, and downdrafts shift every 4 seconds.',
      'Repeated contact with basalt pillars and ceiling stalactites damages Airframe Integrity.',
      'Scan every waypoint before touching down on the final helipad at the end of the canyon.',
    ],
  },
  venera13: {
      slug: 'venera13',
      targetWorld: 'VENUS • PHOEBE REGIO',
      missionTitle: 'VENERA 13: SUPERCRITICAL DESCENT',
      title: 'VENERA 13: SUPERCRITICAL DESCENT',
      objective:
        'Guide Venera 13 across 3 Venusian phases: survive sulfuric acid clouds, deploy your aerobraking ring below 18 km onto Phoebe Regio, and drill & beam surface telemetry before Hull Heat hits 100%.',
      controls: [
        { key: '← / → or A / D', action: 'Steer descent module through cloud currents' },
        { key: 'SPACE', action: 'Vent Coolant (Stage 1) • Deploy Brake (Stage 2) • Drill & Beam (Stage 3)' },
        { key: 'P / ESC', action: 'Pause simulation & view briefing' },
      ],
      tips: [
        'In Stage 1, collect blue spectrometer packets and press [SPACE] to vent heat.',
        'In Stage 2, wait until altitude drops below 18 km before pressing [SPACE] to deploy the drag ring.',
        'In Stage 3, rapidly pulse [SPACE] to drill the basalt sample and upload the color panorama before hitting 465 °C!',
      ],
  },
  messenger: {
      slug: 'messenger',
      targetWorld: 'MERCURY • POLAR ORBIT & SHAKESPEARE CRATER',
      missionTitle: 'MESSENGER: SUNSHADE & FINAL IMPACT',
      title: 'MESSENGER: SUNSHADE & FINAL IMPACT',
      objective:
        'Protect MESSENGER behind its ceramic sunshade in 430 °C solar glare, scan permanently shadowed polar craters for water ice, and guide its final helium-thruster deorbit crash into Shakespeare Crater.',
      controls: [
        { key: '← / → or A / D', action: 'Rotate Sunshade (Stage 1) • Steer Orbiter (Stages 2 & 3)' },
        { key: 'SPACE', action: 'Scan Core (Stage 1) • Neutron Ice Ping (Stage 2) • Helium Hop (Stage 3)' },
        { key: 'P / ESC', action: 'Pause simulation & view briefing' },
      ],
      tips: [
        'Stage 1: Keep the green sunshade cone blocking the moving Sun before pressing [SPACE] to log scans.',
        'Stage 2: Stay out of the glowing horizon sun glare and pulse [SPACE] directly over dark polar craters.',
        'Stage 3: Tap [SPACE] to fire emergency helium gas hops over tall volcanic ridges, then crash straight into Shakespeare Crater!',
      ],
    },

};
