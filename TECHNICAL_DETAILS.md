# 🛰️ GRAVITY IN A BOTTLE — Odyssey-6 Archive Terminal

> **NASA Space Apps Challenge 2026** • *Team Gravity in Space*  
> *"We’ve always been listening."*

**Gravity in a Bottle** is an interactive, retro-styled narrative and planetary simulation web game built with **Next.js**, **TypeScript**, **Tailwind CSS**, and the **Google Gemini API**. Set aboard the stranded deep-space vessel **Odyssey-6**, players explore an interactive Solar System map, inspect real NASA/ESA planetary telemetry, pilot **7 multi-stage historical probe simulations**, and query an in-character **Archive AI Terminal** dedicated to lost and abandoned instruments across space.

---

## 📖 Table of Contents

1. [Overview & Narrative Premise](#-overview--narrative-premise)
2. [Key Features](#-key-features)
3. [Playable Historical Missions](#-playable-historical-missions)
4. [Tech Stack & Architecture](#-tech-stack--architecture)
5. [Project Structure](#-project-structure)
6. [Getting Started (Local Setup)](#-getting-started-local-setup)
7. [Environment Variables](#-environment-variables)
8. [Deployment (Vercel)](#-deployment-vercel)
9. [Credits & Data Sources](#-credits--data-sources)

---

## 🌌 Overview & Narrative Premise

Nineteen days into deep-space transit, **Odyssey-6** loses all communication with Earth. Cut off from Mission Control, the six-person crew turns to the ship's onboard **Archive Terminal**—studying how humanity's historic robotic emissaries survived crushing pressures, extreme temperatures, and vast radio delays across the Solar System to reverse-engineer a way to bring their own backup dish online.

Players progress through:
* **Scene 0 — Title & Lore Sequence:** An atmospheric CRT terminal intro with procedural 8-bit audio and typewriter lore.
* **Scene 1 — Odyssey-6 Crew Deck:** Interactive pixel-art crew dialogue introducing the six crew members and Ship AI.
* **Scene 2 — Solar System Mission Control (Radar):** An interactive orrery map covering **Mercury, Venus, Earth, the Moon, Mars, Jupiter, Saturn, Titan, Uranus, and Neptune**, plus the **Odyssey-6 Archive AI** Q&A terminal.
* **Scene 3 — Planetary Dossiers & 7 Field Simulations:** Detailed planetary profiles, "What We Left Behind" hardware archives, 3-stage playable missions, and unlocked post-simulation NASA/ESA telemetry carousels.
* **Scene 4 & 5 — Finale & Credits:** Unlocking Earth's orbital relay link after completing missions triggers the crew's final transmission home and scrolling retro credits.

---

## ✨ Key Features

* **Interactive Solar System Orrery & Dossiers:** Explore 10 celestial bodies—including untouched flyby-only ice giants (Uranus and Neptune) alongside worlds hosting permanent human hardware.
* **7 Multi-Stage Historical Simulations:** Each simulation features 3 distinct stages modeled after real mission physics, controls, and failure conditions.
* **Unlocked Post-Simulation Telemetry:** Completing a mission unlocks decoded field reports, engineering stats, and uncropped (`object-contain`) multi-slide NASA/ESA image carousels.
* **Odyssey-6 Archive AI (Gemini-Powered Q&A):** A collapsible retro terminal widget in Mission Control powered by `gemini-2.5-flash` (`v1beta`). Strictly domain-locked via system instructions to answer questions exclusively about lost, abandoned, decommissioned, or crashed spacecraft, rovers, landers, and space instruments (including space acronyms like LRV, LM, and ALSEP).
* **Procedural Web Audio Synthesizer (`retroAudio`):** Zero-dependency 8-bit sound engine generating character-specific voice blips, boot beeps, sonar pings, and radio static.
* **Client-Side Progress Persistence:** Uses `localStorage` and `useSyncExternalStore` to save mission completions, unlocked lore, and Earth station unlock state automatically.
* **Responsive Pixel-Art UI:** Custom CRT scanline overlays, pixel-shadow typography, and viewport-aware crew sprite positioning across mobile, tablet, and desktop displays.

---

## 🚀 Playable Historical Missions

| Mission | Celestial Body | Year | Core Gameplay & Physics Mechanics |
| :--- | :--- | :--- | :--- |
| **MESSENGER** | Mercury | 2011–2015 | Lock ceramic-cloth sunshade against 430 °C solar glare, scan shadowed polar ice craters, and execute final helium-thruster deorbit impact into Shakespeare Crater. |
| **Venera 13** | Venus (Phoebe Regio) | 1982 | Survive 92-bar sulfuric acid clouds, deploy aerobraking ring below 18 km, and drill basalt regolith before hull heat reaches 465 °C. |
| **Lunokhod 1** | The Moon (Mare Imbrium) | 1970 | Drive the 8-wheeled Soviet rover across cratered plains, pulse subsurface sonar for buried beacons, and manage lunar nightfall. |
| **Surveyor 3** | The Moon (Oceanus Procellarum) | 1967 & 1969 | Operate the pantograph soil-sampler claw to dig regolith trenches, avoid basalt bedrock, and align optical markers for Apollo 12. |
| **Ingenuity** | Mars (Jezero Crater) | 2021–2024 | Pilot the 1.8 kg coaxial rotorcraft at 2,537 RPM in 1% Earth-density air against shifting Martian crosswinds and dust devils. |
| **Galileo Probe** | Jupiter | 1995 | Plunge at 47.4 km/s into a 22-bar abyss, match transponder frequency bands inside the Orbiter relay beam, vent plasma heat, and dodge super-bolts. |
| **Huygens Lander** | Saturn VI (Titan) | 2005 | Descend through Titan's methane haze, deploy main parachute below 130 km, activate deflector shields, and touch down on Xanadu's shoreline. |

---

## 🛠️ Tech Stack & Architecture

* **Framework:** Next.js (App Router) & React
* **Language:** TypeScript (`.ts` / `.tsx`)
* **Styling:** Tailwind CSS + Custom Retro CRT & Pixel-Art CSS
* **Generative AI:** `@google/genai` SDK (`gemini-2.5-flash` via server-side `/api/archive-bot` route with automatic socket retry and strict domain guardrails)
* **Audio Engine:** Native Browser Web Audio API (`lib/retroAudio.ts`)
* **Deployment:** Vercel Edge & Serverless Functions

---

## 📁 Project Structure

```text
├── app/
│   ├── api/
│   │   └── archive-bot/
│   │       └── route.ts            # Gemini API serverless endpoint (domain-locked Q&A)
│   ├── planets/
│   │   └── [slug]/
│   │       └── page.tsx            # Dynamic planet dossier route
│   ├── layout.tsx                  # Root layout & metadata
│   └── page.tsx                    # Main state router (S0 Lore → S1 Deck → S2 Radar → S4/S5 Finale)
├── components/
│   ├── map/
│   │   └── SolarSystemMap.tsx      # Interactive Solar System orrery & Earth unlock trigger
│   ├── planets/
│   │   └── PlanetDossierClient.tsx # Planet telemetry, artifacts, simulations & unlocked carousels
│   ├── story/
│   │   ├── StoryDialogueBox.tsx    # Pixel-art RPG dialogue box with portrait frame & typewriter FX
│   │   └── StoryScene.tsx          # Scenes 0, 1, 4, and 5 with responsive crew positioning
│   └── ui/
│       └── ArchiveBotWidget.tsx    # Collapsible Odyssey-6 Archive AI chat terminal
├── data/
│   └── planets.ts                  # Planetary profiles, quick facts, and "What We Left Behind" entries
├── lib/
│   ├── game.ts                     # TypeScript interfaces, progress store & localStorage sync
│   ├── missions.ts                 # Mission briefings, controls, tips & post-mission stage imagery
│   ├── retroAudio.ts               # Procedural Web Audio API 8-bit sound synthesizer
│   └── storyData.ts                # Crew roster, dialogue scripts, lore lines & credits
└── public/
    └── assets/                     # Pixel-art backgrounds, logos, crew sprites & mugshots
```

---

## 💻 Getting Started (Local Setup)

### Prerequisites
* **Node.js** 18.18+ or 20+
* **npm**, **yarn**, or **pnpm**
* A **Google Gemini API Key** from [Google AI Studio](https://aistudio.google.com/)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/<your-username>/<your-repo-name>.git
   cd <your-repo-name>
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables:**
   Create a `.env.local` file in the root directory:
   ```env
   GEMINI_API_KEY=your_google_gemini_api_key_here
   ```

4. **Run the development server:**
   ```bash
   npm run dev
   ```

5. Open **[http://localhost:3000](http://localhost:3000)** in your browser.

---

## 🔐 Environment Variables

| Variable | Required | Description |
| :--- | :--- | :--- |
| `GEMINI_API_KEY` | **Yes** | Server-side API key used by `app/api/archive-bot/route.ts` to power the Odyssey-6 Archive Q&A bot. Never exposed to the client browser. |

---

## ☁️ Deployment (Vercel)

1. Push your repository to GitHub.
2. Import the project into **[Vercel](https://vercel.com/)**.
3. In **Project Settings → Environment Variables**, add `GEMINI_API_KEY` with your Gemini API key.
4. Click **Deploy**. Vercel automatically builds the Next.js frontend and deploys `/api/archive-bot` as a serverless function.

---

## 🛰️ Credits & Data Sources

* **Developed by:** Team Gravity in Space — *NASA Space Apps Challenge 2026*
* **Scientific & Archival Imagery:** NASA Science, NASA/JPL-Caltech, ESA/NASA Cassini–Huygens Archive, Lunar Reconnaissance Orbiter Camera (LROC), and Wikimedia Commons public-domain spaceflight archives.