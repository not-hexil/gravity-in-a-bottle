import { MissionSlug, MissionModalData, MissionInstructionData } from '@/lib/game';

export const MISSION_MODALS: Record<MissionSlug, MissionModalData> = {
  huygens: {
    slug: 'huygens',
    title: 'HUYGENS LANDER',
    subtitle: 'ESA / NASA Cassini–Huygens Mission • Titan (2005)',
    imageUrl: 'https://assets.science.nasa.gov/dynamicimage/assets/science/psd/solar/2023/07/huygensartistrendering_full_main.jpg',
    imageCaption: 'Huygens Lander: First optical surface panorama from Saturn’s moon Titan',
    stageImages: [
      {
        imageUrl: 'https://assets.science.nasa.gov/dynamicimage/assets/science/psd/solar/2023/09/IMG002527.jpg',
        imageCaption: 'Huygens Landing Site',
      },
      {
        imageUrl: 'https://assets.science.nasa.gov/dynamicimage/assets/science/psd/solar/internal_resources/1440/Titans_Salty_Sea.jpeg',
        imageCaption: 'Titan\'s ice shell, which overlies a very salty ocean, varies in thickness around the moon, suggesting the crust is in the process of becoming rigid.',
      },
      {
        imageUrl: 'https://science.nasa.gov/wp-content/uploads/2018/08/pia16481-titan-seasons.jpg',
        imageCaption: 'An artist\'s impression of Saturn\'s moon Titan shows the change in observed atmospheric effects',
      },
    ],
    paragraphs: [
      'The huygens probe was left exactly at its landing site in a boundary between Adiri (the bright region) and Shangri-La (the dark region). This is because, the thick haze in Saturn’s atmosphere blocked sunlight, making the equipment entirely dependent on chemical batteries!',
      'The mission also provided evidence that Titan is hiding an internal, liquid ocean beneath its surface, likely composed of water and ammonia, proving Titan has an active meteorological cycle shaped by liquid methane rather than water.',
      'Titan is the only other place in the solar system known to have an Earth-like cycle of liquids flowing across its surface as the planet cycles through its seasons. Each Titan season lasts about 7.5 Earth years.',
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
    imageUrl: 'https://lroc.im-ldi.com/news/uploads/LROCiotw/Lunokhod1.jpg',
    imageCaption: 'Lunokhod 1',
    stageImages: [
      {
        imageUrl: '/demo.png',
        imageCaption: 'Stage 01 • Deployment down the Luna 17 landing ramp into Mare Imbrium',
      },
      {
        imageUrl: '/demo.png',
        imageCaption: 'Stage 02 • Subsurface sonar & soil penetrometer traverse across crater rims',
      },
      {
        imageUrl: '/demo.png',
        imageCaption: 'Stage 03 • French laser retroreflector alignment & 10.54 km endurance run',
      },
    ],
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
    imageUrl: 'https://assets.science.nasa.gov/dynamicimage/assets/science/psd/solar/2023/09/a/as12-48-7134_detail.jpg',
    imageCaption: 'Apollo 12 astronaut Alan Bean inspecting Surveyor 3 with Lunar Module Intrepid in the background',
    stageImages: [
      {
        imageUrl: 'https://assets.science.nasa.gov/dynamicimage/assets/science/psd/solar/2023/07/as12-48-7134_1280.jpg',
        imageCaption: 'This unusual photograph, taken during the second Apollo 12 extravehicular activity (EVA), shows two U.S. spacecraft on the surface of the Moon. The Apollo 12 Lunar Module (LM) is in the background. The unmanned Surveyor 3 spacecraft is in the foreground.',
      },
      {
        imageUrl: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/9/9e/Apollo_12-_Pinpoint_Landing_on_the_Ocean_of_Storms_%286962456793%29.jpg/960px-Apollo_12-_Pinpoint_Landing_on_the_Ocean_of_Storms_%286962456793%29.jpg',
        imageCaption: 'Surveyor 3 and Apollo 12 landing site',
      },
      {
        imageUrl: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/3/34/Surveyor_3_Fig_3-44.jpg/960px-Surveyor_3_Fig_3-44.jpg',
        imageCaption: 'Angular blocks, up to 7 feet (2 meters) in diameter, which form part of a strewn field of blocks that surround a sharp-rim crater 10 feet (3 meters) in diameter',
      },
    ],
    paragraphs: [
      'NASA\'s Surveyor 3 was the second in the Surveyor series to make a soft landing on the Moon. Based on the spacecraft\'s surface sampling tests, scientists concluded the lunar surface was solid enough to hold the weight of an Apollo lunar module.',
      'Surveyor 3 was the third engineering flight of the series, but for the first time carried a surface-sampling instrument that could reach up to 5 feet (1.5 meters) from the lander and could dig up to 7 inches (18 centimeters) deep.',
      'During their second extra-vehicular activity (EVA) on Nov. 19, 1969, the astronauts walked over to Surveyor 3 and recovered parts, including the soil scoop and camera system, to allow scientists to evaluate the effects of nearly two-and-a-half years of exposure on the Moon’s surface.',
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
    imageUrl: 'https://cdn.mos.cms.futurecdn.net/LpSpinMrdCCWZ68CjU4yUF-640-80.jpg.webp',
    imageCaption: 'An Artist\'s concept of Galileo Atmospheric Probe',
    stageImages: [
      {
        imageUrl: 'https://assets.science.nasa.gov/dynamicimage/assets/science/psd/solar/2023/07/galileo_probe.jpg',
        imageCaption: 'An artist’s impression of NASA\'s Galileo probe entering Jupiter’s atmosphere.',
      },
      {
        imageUrl: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/a/a3/Galileo_Probe_diagram.jpeg/960px-Galileo_Probe_diagram.jpeg',
        imageCaption: 'Diagram of the atmospheric entry probe\'s instruments and subsystems',
      },
      {
        imageUrl: 'https://spacecenter.org/wp-content/uploads/2019/09/Galileo-Infographic-1024x576.png',
        imageCaption: 'Galileo Mission Statistics',
      },
    ],
    paragraphs: [
      'Released from the Galileo orbiter five months prior, the 339-kilogram Galileo Entry Probe slammed into Jupiter’s upper atmosphere on December 7, 1995 at 170,000 km/h, the highest-speed atmospheric entry ever engineered, generating shockwave temperatures hotter than the Sun’s surface.It hit Jupiter’s atmosphere so fast that it could fly here (New York) from Los Angeles in about 90 seconds\!',
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
    imageUrl: 'https://assets.science.nasa.gov/dynamicimage/assets/science/psd/mars/resources/detail_files/2/7/27896_ingenuity_numbers1.24_0R1-web.jpg',
    imageCaption: 'Ingenuity Mars Helicopter',
    stageImages: [
      {
        imageUrl: 'https://science.nasa.gov/wp-content/uploads/2024/03/anatomy-of-ingenuity-mars-helicopter.jpg',
        imageCaption: 'The first aircraft to achieve powered, controlled flight on another planet, a feat that\'s been called a "Wright Brothers moment."',
      },
      {
        imageUrl: 'https://assets.science.nasa.gov/content/dam/science/psd/mars/downloadable_items/4/6/46152_PIA24598-IngenuityFlightSix.gif',
        imageCaption: 'NASA’s Ingenuity Mars Helicopter navigation camera depicts the last 29 seconds of the rotorcraft’s sixth flight.',
      },
      {
        imageUrl: 'https://science.nasa.gov/wp-content/uploads/2024/03/pia24443-crop.jpg',
        imageCaption: 'NASA’s Ingenuity Mars Helicopter extends vertically into place after being rotated outward from its horizontal position on the belly of the Perseverance rover on March 29, 2021',
      },
    ],
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
    imageUrl: 'https://planetary.s3.amazonaws.com/web/assets/pictures/_1200x2310_crop_center-center_82_line/20181218_venera_13_malmer_art.jpg.webp',
    imageCaption: 'An Artists depiction of Venera 13',
    stageImages: [
      {
        imageUrl: 'https://imagine.gsfc.nasa.gov/observatories/history/missions/images/venera/venera13_orbiter.gif',
        imageCaption: 'The Venera 13 orbiter.',
      },
      {
        imageUrl: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/2/2d/Venera_13_Venus_surface_images.gif/500px-Venera_13_Venus_surface_images.gif',
        imageCaption: 'Surface panoramas taken by Venera 13',
      },
      {
        imageUrl: 'https://cdn.mos.cms.futurecdn.net/umnbQmaP9jRSEVdobJT7QM-1200-80.jpg.webp',
        imageCaption: 'A mockup of the Venera 13 spacecraft is displayed at the Cosmos Pavilion of the Exhibition of the Achievements of the National Economy in Moscow, Russia.',
      },
    ],
    paragraphs: [
      'Venera 13 and 14 were identical spacecraft where were designed to study Venus and the interplanetary medium. Each spacecraft consisted of a bus and a descent craft. The bus relayed data for the lander and then continued into a heliocentric oribt.',
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
    imageUrl: 'https://assets.science.nasa.gov/dynamicimage/assets/science/psd/solar/2023/07/messenger.jpg',
    imageCaption: 'An artist\'s rendering of the MESSENGER spacecraft at Mercury.',
    stageImages: [
      {
        imageUrl: '/demo.png',
        imageCaption: 'Stage 01 • Ceramic-cloth sunshade shielding instruments from 430 °C solar glare',
      },
      {
        imageUrl: '/demo.png',
        imageCaption: 'Stage 02 • Neutron spectrometer detection of water ice in shadowed polar craters',
      },
      {
        imageUrl: '/demo.png',
        imageCaption: 'Stage 03 • Final helium-thruster deorbit impact near Shakespeare Crater (April 30, 2015)',
      },
    ],
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
