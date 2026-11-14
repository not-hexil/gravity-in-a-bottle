'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { BUILDINGS } from '@/data/missions';
import { BuildingConfig } from '@/types/game';
import {
  TILE_SIZE,
  MAP_COLS,
  MAP_ROWS,
  TOWN_GRID,
  drawTile,
  drawBuilding,
  drawCenterRocket,
  drawAstronaut,
} from './tileRenderer';

export default function TownMap() {
  const router = useRouter();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Grid coordinates of the player (starts just south of the rocket)
  const [playerPos, setPlayerPos] = useState({ x: 11, y: 12 });
  const [direction, setDirection] = useState<'down' | 'up' | 'left' | 'right'>('down');
  const [walkFrame, setWalkFrame] = useState(0);
  const [nearbyBuilding, setNearbyBuilding] = useState<BuildingConfig | null>(null);
  const [enteringBuilding, setEnteringBuilding] = useState<BuildingConfig | null>(null);

  // Check if a target tile is walkable
  const isWalkable = useCallback((tx: number, ty: number): BuildingConfig | boolean => {
    if (tx < 0 || ty < 0 || tx >= MAP_COLS || ty >= MAP_ROWS) return false;

    const tile = TOWN_GRID[ty][tx];
    if (tile === 3 || tile === 4) return false; // Trees & Water

    // Center Rocket collision box (cols 11..12, rows 7..9)
    if (tx >= 11 && tx <= 12 && ty >= 7 && ty <= 9) return false;

    // Building collisions (doors are enterable triggers)
    for (const b of BUILDINGS) {
      if (tx === b.doorX && ty === b.doorY) {
        return b; // Trigger door entry
      }
      if (tx >= b.x && tx < b.x + b.width && ty >= b.y && ty < b.y + b.height) {
        return false;
      }
    }

    return true;
  }, []);

  const enterBuilding = useCallback(
    (building: BuildingConfig) => {
      if (enteringBuilding) return;
      setEnteringBuilding(building);
      setTimeout(() => {
        router.push(`/missions/${building.id}`);
      }, 450);
    },
    [enteringBuilding, router]
  );

  // Check if standing right in front of a door
  useEffect(() => {
    const adjacentDoor = BUILDINGS.find(
      (b) =>
        (playerPos.x === b.doorX && playerPos.y === b.doorY + 1) ||
        (playerPos.x === b.doorX && playerPos.y === b.doorY)
    );
    setNearbyBuilding(adjacentDoor || null);
  }, [playerPos]);

  // Keyboard Navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (enteringBuilding) return;

      let dx = 0;
      let dy = 0;
      let nextDir = direction;

      switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          dy = -1;
          nextDir = 'up';
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          dy = 1;
          nextDir = 'down';
          break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
          dx = -1;
          nextDir = 'left';
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          dx = 1;
          nextDir = 'right';
          break;
        case 'Enter':
        case ' ':
          if (nearbyBuilding) {
            e.preventDefault();
            enterBuilding(nearbyBuilding);
          }
          return;
        default:
          return;
      }

      e.preventDefault();
      setDirection(nextDir);
      setWalkFrame((prev) => (prev + 1) % 4);

      const targetX = playerPos.x + dx;
      const targetY = playerPos.y + dy;
      const check = isWalkable(targetX, targetY);

      if (typeof check === 'object') {
        // Stepped into a door
        setPlayerPos({ x: targetX, y: targetY });
        enterBuilding(check);
      } else if (check === true) {
        setPlayerPos({ x: targetX, y: targetY });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [playerPos, direction, isWalkable, nearbyBuilding, enterBuilding, enteringBuilding]);

  // Canvas Render Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let tick = 0;

    const render = () => {
      tick++;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // 1. Ground Tiles
      for (let r = 0; r < MAP_ROWS; r++) {
        for (let c = 0; c < MAP_COLS; c++) {
          drawTile(ctx, TOWN_GRID[r][c], c, r, tick);
        }
      }

      // 2. Top Buildings (North)
      BUILDINGS.filter((b) => b.y < 8).forEach((b) =>
        drawBuilding(ctx, b, nearbyBuilding?.id === b.id)
      );

      // 3. Center NASA Rocket
      drawCenterRocket(ctx, tick);

      // 4. Bottom Buildings (South)
      BUILDINGS.filter((b) => b.y >= 8).forEach((b) =>
        drawBuilding(ctx, b, nearbyBuilding?.id === b.id)
      );

      // 5. Player Astronaut
      drawAstronaut(
        ctx,
        playerPos.x * TILE_SIZE,
        playerPos.y * TILE_SIZE,
        direction,
        walkFrame
      );

      animationFrameId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animationFrameId);
  }, [playerPos, direction, walkFrame, nearbyBuilding]);

  // Click on canvas to move one step toward clicked tile or enter clicked building
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (enteringBuilding) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const clickX = Math.floor(((e.clientX - rect.left) * scaleX) / TILE_SIZE);
    const clickY = Math.floor(((e.clientY - rect.top) * scaleY) / TILE_SIZE);

    // Direct click on a building allows instant teleport/entry for mouse-only users
    const clickedBuilding = BUILDINGS.find(
      (b) =>
        clickX >= b.x &&
        clickX < b.x + b.width &&
        clickY >= b.y &&
        clickY < b.y + b.height
    );
    if (clickedBuilding) {
      setPlayerPos({ x: clickedBuilding.doorX, y: clickedBuilding.doorY });
      enterBuilding(clickedBuilding);
      return;
    }

    // Step 1 tile toward clicked coordinate
    const dx = Math.sign(clickX - playerPos.x);
    const dy = Math.sign(clickY - playerPos.y);
    const stepX = dx !== 0 ? playerPos.x + dx : playerPos.x;
    const stepY = dx === 0 && dy !== 0 ? playerPos.y + dy : playerPos.y;

    if (dx > 0) setDirection('right');
    else if (dx < 0) setDirection('left');
    else if (dy > 0) setDirection('down');
    else if (dy < 0) setDirection('up');

    setWalkFrame((prev) => (prev + 1) % 4);
    const check = isWalkable(stepX, stepY);
    if (typeof check === 'object') {
      setPlayerPos({ x: stepX, y: stepY });
      enterBuilding(check);
    } else if (check === true) {
      setPlayerPos({ x: stepX, y: stepY });
    }
  };

  return (
    <div className="relative flex flex-col items-center justify-center">
      {/* Retro Handheld Bezel */}
      <div className="relative overflow-hidden rounded-xl border-4 border-slate-700 bg-slate-950 shadow-2xl">
        <canvas
          ref={canvasRef}
          width={MAP_COLS * TILE_SIZE}
          height={MAP_ROWS * TILE_SIZE}
          onClick={handleCanvasClick}
          className="block max-w-full cursor-pointer"
          style={{ imageRendering: 'pixelated' }}
        />

        {/* Pokemon-style Screen Transition Fade */}
        {enteringBuilding && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-slate-950/90 transition-opacity duration-300">
            <p className="animate-pulse font-mono text-lg font-bold tracking-widest text-amber-400">
              ENTERING {enteringBuilding.name.toUpperCase()}...
            </p>
          </div>
        )}

        {/* RPG Dialogue Prompt Box when standing at a door */}
        {nearbyBuilding && !enteringBuilding && (
          <div className="absolute bottom-4 left-1/2 z-10 w-[90%] max-w-md -translate-x-1/2 rounded-lg border-4 border-slate-800 bg-white px-5 py-3 text-slate-900 shadow-xl">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="font-mono text-xs font-bold uppercase tracking-wider text-blue-600">
                  Facility Entrance
                </p>
                <p className="font-mono text-sm font-bold">{nearbyBuilding.name}</p>
              </div>
              <button
                onClick={() => enterBuilding(nearbyBuilding)}
                className="rounded bg-slate-900 px-3 py-1.5 font-mono text-xs font-bold text-white hover:bg-blue-600"
              >
                ENTER [↵]
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Controls & Quick-Jump Bar */}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-4 rounded-lg border border-slate-800 bg-slate-900/90 px-4 py-2.5 text-xs text-slate-300 w-full max-w-[768px]">
        <div className="font-mono">
          <span className="font-bold text-amber-400">MOVE:</span> WASD / Arrows / Click Tile •{' '}
          <span className="font-bold text-amber-400">ENTER DOOR:</span> Walk onto door or click building
        </div>
        <div className="flex flex-wrap gap-1.5">
          {BUILDINGS.map((b) => (
            <button
              key={b.id}
              onClick={() => enterBuilding(b)}
              className="rounded border border-slate-700 bg-slate-800 px-2 py-1 font-mono text-[11px] font-semibold text-slate-200 transition hover:border-amber-400 hover:text-amber-300"
            >
              {b.shortLabel}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
