# 🛰️ Gravity in the House: What We Left Behind

*An interactive planetary exploration and space-archaeology experience tracing the robotic pioneers humanity left across the Solar System.*

## 🚀 Project Overview
**Gravity in the House** is an interactive digital archive and arcade simulation experience centered on the landers, rovers, helicopters, and atmospheric probes humanity has sent to other worlds—and left behind on their surfaces, in their clouds, and inside their impact craters. Viewed through a retro-futuristic orbital telemetry monitor, explorers inspect real planetary environments, unlock archival mission logs, and pilot multi-stage hardware simulations across the Solar System.

Built with verified mission telemetry and historical records from NASA, ESA, and Soviet planetary programs, the experience blends accessible science communication with hands-on mechanical and atmospheric gameplay.

---

## 🧩 Structure of the Experience
The journey is organized around an interactive Solar System telemetry monitor and planetary archive dossiers:

1. **The Orbital Monitor (Orrery Navigation)**: Track real-time planetary orbits through a CRT telemetry HUD where pulsing beacons highlight unexplored worlds with active field simulations.
2. **Planetary Environment & Relic Dossiers**: Scroll-driven, content-adaptive logbooks detailing each world's geology, atmosphere, and the exact human hardware resting there today.
3. **Field Simulations (7 Multi-Stage Missions)**:
   - **Mercury — MESSENGER**: Shield electronics behind a ceramic sunshade in 430 °C glare, scan shadowed polar ice craters, and execute its 2015 Shakespeare Crater impact.
   - **Venus — Venera 13**: Drill volcanic basalt on Phoebe Regio, seal 92-bar pyrotechnic airlocks, and tune an X-ray fluorescence spectrometer before internal heat reaches 465 °C.
   - **The Moon — Lunokhod 1 & Surveyor 3**: Traverse Mare Imbrium with an 8-wheeled solar rover and excavate Oceanus Procellarum regolith ahead of the Apollo 12 rendezvous.
   - **Mars — Ingenuity**: Pilot counter-rotating carbon-fiber rotors through shifting Jezero Crater winds across 3 aerial scouting campaigns.
   - **Jupiter — Galileo Atmospheric Probe**: Survive 22-bar crushing pressure and super-bolt lightning while tuning carrier frequencies to relay gas-giant telemetry.
   - **Saturn & Titan — Huygens Lander**: Plunge through Titan's orange methane haze, deploy parachutes below 130 km, and touch down on Xanadu.
4. **Home Is Calling (Earth Orbital Link)**: Completing at least four deep-space missions unlocks Earth's orbital station beacon for humanity's return telemetry link.

---

## 🛰️ Data Sources & Scientific Foundations
Mission parameters, engineering constraints, and archival photography are grounded in official planetary science records from NASA, ESA, and partner institutions:

- [NASA Solar System Exploration](https://science.nasa.gov/solar-system/)
- [NASA MESSENGER Mission to Mercury](https://science.nasa.gov/mission/messenger/)
- [NASA Surveyor Program & Apollo 12](https://science.nasa.gov/mission/surveyor/)
- [NASA Ingenuity Mars Helicopter](https://science.nasa.gov/mission/ingenuity/)
- [NASA Galileo Probe to Jupiter](https://science.nasa.gov/mission/galileo/)
- [ESA / NASA Cassini–Huygens Mission to Titan](https://www.esa.int/Science_Exploration/Space_Science/Cassini-Huygens)
- [NASA NSSDC Master Catalog (Venera 13 & Luna 17 / Lunokhod 1)](https://nssdc.gsfc.nasa.gov/)

---

## 💻 Tech Stack
- **Framework**: Next.js (App Router), React 19, TypeScript
- **Styling & Layout**: Tailwind CSS (Mobile-First Responsive Design)
- **Simulation & Audio**: HTML5 Canvas 2D Engine & Zero-Dependency Web Audio API Procedural Synthesizer
- **Persistence**: Client-Side `localStorage` Mission Archive State

---

## ✨ Innovation Highlights
- 🎮 **Authentic Engineering Mechanics**: Each minigame translates real spacecraft constraints—such as ceramic sunshades, 92-bar airlocks, radio frequency tuning, and 1/6 g soil trenching—into tactile controls.
- 🔊 **Zero-Dependency Procedural Audio**: Custom Web Audio API synthesis generates mechanical key clicks, sonar sweeps, thruster bursts, and telemetry chimes without external audio files.
- 📖 **Scroll-Driven Archival Dossiers**: Dynamic, content-sized entry cards with sticky quick-jump navigation and post-mission unlocked telemetry logs.
- 📱 **Cross-Device Controls**: Full keyboard support paired with an integrated on-screen directional pad and action trigger for mobile play.

---

## 📬 License & Use
All source code is open-source under the [MIT License](LICENSE). Archival mission imagery and scientific data remain the property of their respective space agencies (NASA, ESA, and partner archives) and are credited per their public media guidelines. This project does **not** imply endorsement by NASA or ESA.

---

## 🤖 AI Disclosure
Artificial intelligence tools were utilized during the development of this project for **debugging**, **asset generation**, and **coding assistance** (including TypeScript/React component structuring, HTML5 Canvas simulation logic, and Web Audio API sound synthesis). All scientific facts, historical mission milestones, and educational content were curated and verified against official space agency records.

---

> “Across silent craters, methane seas, and crushing orange clouds, humanity’s quietest explorers still stand watch.”