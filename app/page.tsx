import SolarSystemMap from '@/components/map/SolarSystemMap';

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-slate-950 px-4 py-8 text-slate-100">
      <header className="mb-5 text-center">
        <h1 className="font-mono text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
          🪐 SOLAR SYSTEM MISSION CONTROL
        </h1>
        <p className="mt-1 font-mono text-xs text-slate-400 sm:text-sm">
          Select a target world with an active probe mission—or click any planet to ping telemetry
        </p>
      </header>

      <SolarSystemMap />
    </main>
  );
}
