# Gravity in a Bottle — Brief

## 1. What does it do or how does it work?
**Gravity in a Bottle** is an interactive, retro-styled narrative and simulation web game set aboard the stranded deep-space vessel **Odyssey-6**.
* **Narrative Framing:** After 19 days without contact from Earth, the six-person crew accesses the ship’s Archive Terminal to study how historic robotic spacecraft survived extreme environments and communicated across the Solar System.
* **Interactive Solar System Map & Dossiers:** Players explore a celestial map spanning Mercury, Venus, Earth, the Moon, Mars, Jupiter, Saturn, Titan, Uranus, and Neptune. Selecting any body opens a telemetry dossier detailing its physical environment and the human-made hardware left behind on its surface or in its orbit.
* **7 Multi-Stage Historical Minigames:** Players pilot seven real spacecraft across 3-stage simulations—**Huygens** on Titan, **Lunokhod 1** and **Surveyor 3** on the Moon, **Galileo** plunging into Jupiter, **Ingenuity** on Mars, **Venera 13** on Venus, and **MESSENGER** at Mercury.
* **AI Archive Terminal & Progression:** Completing simulations unlocks decoded mission telemetry with real NASA/ESA imagery, while a built-in **Archive AI Q&A terminal** lets players ask questions strictly focused on lost and abandoned instruments in space. Clearing missions unlocks Earth’s orbital station link and triggers the crew’s final transmission home.

## 2. What benefits does it have?
* **Active Learning Over Passive Reading:** Players experience real engineering constraints firsthand—such as thin-air rotor lift on Mars, 465 °C thermal limits on Venus, 2.6-second lunar rover delays, and high-altitude parachute shred thresholds.
* **Bridges Storytelling and Real Data:** Pairs pixel-art characters and dialogue with authentic NASA/ESA telemetry, stats, and archival photography.
* **Zero-Friction Browser Access:** Runs directly in any modern browser with automatic local progress persistence and no installation required.

## 3. What is the intended impact of the project?
The project reframes space exploration around **human ingenuity, resilience, and legacy**. Billions of kilometers away, silent landers, rovers, and impactors sit as permanent monuments to human curiosity. By connecting a stranded crew’s fight to re-establish contact with the real engineering triumphs of past probes—and culminating in Mission Control’s message, *“We’ve always been listening”*—the project inspires players to appreciate both the scientific data these instruments gathered and the human teamwork behind every mission.

## 4. What tools, coding languages, hardware, or software did you use?
* **Languages:** TypeScript, TSX/React, HTML5, and CSS3.
* **Frameworks & Libraries:** Next.js (App Router), React, and Tailwind CSS.
* **AI Integration:** Google Gemini API (`gemini-2.5-flash` via `@google/genai`) powering a domain-locked Next.js serverless API route (`/api/archive-bot`).
* **Audio & Graphics:** Custom Web Audio API procedural retro synthesizer (`retroAudio`), custom pixel-art sprites and CRT scanline shaders, and NASA/ESA archival imagery.
* **Hosting & Version Control:** Git/GitHub and Vercel.

## 5. How is your project creative?
* **“Reverse-Engineering” History to Survive:** The Odyssey-6 crew treats historical missions as a survival manual, studying past probes’ communication and survival tricks to bring their own backup dish online.
* **Physics-Driven Minigames:** Each simulation mirrors the actual physics and failure modes of its real-world mission rather than generic arcade mechanics.
* **Cohesive Retro Terminal Aesthetic:** Pixel-art crew portraits, procedural 8-bit sound effects, CRT scanlines, and an in-universe AI terminal make every interface feel like part of the spacecraft’s computer.

## 6. What factors did your team consider?
* **Scientific & Historical Accuracy:** Real mission dates, crush depths, thermal limits, and untouched flyby-only worlds (Uranus and Neptune).
* **Responsive Design & Usability:** Multi-device sprite scaling across mobile/tablet/desktop viewports, uncropped archival image carousels, and automatic `localStorage` state saving.
* **AI Guardrails & Reliability:** Strict system instructions so the Archive AI stays accurate, educational, and in character, handles space acronyms (LRV, LM, ALSEP), and retries automatically on transient network drops.
