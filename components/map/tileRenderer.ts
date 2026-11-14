import { BuildingConfig } from '@/types/game';

export const TILE_SIZE = 32;
export const MAP_COLS = 24;
export const MAP_ROWS = 18;

// Tile IDs:
// 0 = Grass, 1 = Dirt Path, 2 = Concrete Plaza, 3 = Tree/Border, 4 = Water, 5 = Flower Grass
export const TOWN_GRID: number[][] = [
  [3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3],
  [3,0,5,0,0,0,0,0,0,0,1,1,1,1,0,0,0,0,0,0,5,0,4,3],
  [3,0,0,0,0,0,0,0,0,0,1,2,2,1,0,0,0,0,0,0,0,4,4,3],
  [3,5,0,0,0,0,0,0,0,0,1,2,2,1,0,0,0,0,0,0,0,4,4,3],
  [3,0,0,0,0,0,0,0,0,0,1,2,2,1,0,0,0,0,0,0,0,0,4,3],
  [3,0,0,0,1,1,1,1,1,1,1,2,2,1,1,1,1,1,1,0,0,0,0,3],
  [3,0,5,0,1,0,0,0,0,2,2,2,2,2,2,0,0,0,1,0,5,0,0,3],
  [3,0,0,0,1,0,0,0,2,2,2,2,2,2,2,2,0,0,1,0,0,0,0,3],
  [3,0,0,0,1,0,0,0,2,2,2,2,2,2,2,2,0,0,1,0,0,0,0,3],
  [3,0,0,0,1,0,0,0,2,2,2,2,2,2,2,2,0,0,1,0,0,0,0,3],
  [3,0,0,0,1,0,0,0,2,2,2,2,2,2,2,2,0,0,1,0,0,0,0,3],
  [3,0,5,0,1,0,0,0,0,2,2,2,2,2,2,0,0,0,1,0,5,0,0,3],
  [3,0,0,0,1,0,0,0,0,0,1,2,2,1,0,0,0,0,1,0,0,0,0,3],
  [3,0,0,0,1,0,0,0,0,0,1,2,2,1,0,0,0,0,1,0,0,0,0,3],
  [3,0,0,0,1,0,0,0,0,0,1,2,2,1,0,0,0,0,1,0,0,0,0,3],
  [3,5,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,5,0,3],
  [3,0,0,0,0,0,0,5,0,0,0,0,0,0,0,0,5,0,0,0,0,0,0,3],
  [3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3],
];

export function drawTile(
  ctx: CanvasRenderingContext2D,
  tile: number,
  col: number,
  row: number,
  tick: number
) {
  const x = col * TILE_SIZE;
  const y = row * TILE_SIZE;

  // Base Grass
  ctx.fillStyle = '#58B947';
  ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);

  // Subtle grass pixel blades
  ctx.fillStyle = '#489E39';
  if ((col + row) % 2 === 0) {
    ctx.fillRect(x + 6, y + 8, 2, 4);
    ctx.fillRect(x + 20, y + 22, 2, 4);
  } else {
    ctx.fillRect(x + 14, y + 6, 2, 4);
    ctx.fillRect(x + 8, y + 24, 2, 4);
  }

  if (tile === 5) {
    // Wildflowers
    const colors = ['#FACC15', '#F87171', '#FFFFFF'];
    ctx.fillStyle = colors[(col * 3 + row) % colors.length];
    ctx.fillRect(x + 10, y + 12, 4, 4);
    ctx.fillRect(x + 20, y + 20, 4, 4);
  } else if (tile === 1) {
    // Dirt Path
    ctx.fillStyle = '#E5C687';
    ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
    ctx.fillStyle = '#D4B06A';
    ctx.fillRect(x + 4, y + 6, 4, 4);
    ctx.fillRect(x + 22, y + 18, 4, 4);
  } else if (tile === 2) {
    // Launchpad Concrete Plaza
    ctx.fillStyle = '#CBD5E1';
    ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
    ctx.strokeStyle = '#94A3B8';
    ctx.lineWidth = 1;
    ctx.strokeRect(x + 0.5, y + 0.5, TILE_SIZE - 1, TILE_SIZE - 1);
  } else if (tile === 3) {
    // Pokemon-style Lush Tree
    ctx.fillStyle = '#2D6A2E';
    ctx.beginPath();
    ctx.arc(x + 16, y + 18, 13, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#3E8E41';
    ctx.beginPath();
    ctx.arc(x + 16, y + 13, 11, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#58B947';
    ctx.beginPath();
    ctx.arc(x + 13, y + 10, 6, 0, Math.PI * 2);
    ctx.fill();
  } else if (tile === 4) {
    // Animated Water Pond
    ctx.fillStyle = '#38BDF8';
    ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
    const waveOffset = Math.sin(tick * 0.05 + col + row) * 3;
    ctx.fillStyle = '#BAE6FD';
    ctx.fillRect(x + 6 + waveOffset, y + 10, 10, 2);
    ctx.fillRect(x + 12 - waveOffset, y + 22, 8, 2);
  }
}

export function drawBuilding(
  ctx: CanvasRenderingContext2D,
  b: BuildingConfig,
  isHoveredOrNear: boolean
) {
  const px = b.x * TILE_SIZE;
  const py = b.y * TILE_SIZE;
  const pw = b.width * TILE_SIZE;
  const ph = b.height * TILE_SIZE;

  // Drop shadow
  ctx.fillStyle = 'rgba(15, 23, 42, 0.25)';
  ctx.fillRect(px + 4, py + 8, pw, ph - 4);

  // Main Facility Wall
  ctx.fillStyle = '#F8FAFC';
  ctx.fillRect(px + 2, py + TILE_SIZE, pw - 4, ph - TILE_SIZE);

  // Wall Panel Lines
  ctx.strokeStyle = '#CBD5E1';
  ctx.lineWidth = 2;
  ctx.strokeRect(px + 3, py + TILE_SIZE, pw - 6, ph - TILE_SIZE - 1);

  // Pitched / Lab Roof
  ctx.fillStyle = b.roofColor;
  ctx.fillRect(px, py + 4, pw, TILE_SIZE + 4);
  ctx.fillStyle = b.trimColor;
  ctx.fillRect(px, py + TILE_SIZE + 4, pw, 6);

  // Windows
  ctx.fillStyle = '#0EA5E9';
  ctx.fillRect(px + 12, py + TILE_SIZE + 18, 18, 16);
  ctx.fillRect(px + pw - 30, py + TILE_SIZE + 18, 18, 16);
  // Window Glint
  ctx.fillStyle = '#E0F2FE';
  ctx.fillRect(px + 14, py + TILE_SIZE + 20, 6, 4);
  ctx.fillRect(px + pw - 28, py + TILE_SIZE + 20, 6, 4);

  // Entrance Door (aligned to doorX, doorY)
  const doorPx = b.doorX * TILE_SIZE + 4;
  const doorPy = b.doorY * TILE_SIZE + 2;
  ctx.fillStyle = isHoveredOrNear ? '#FACC15' : '#1E293B';
  ctx.fillRect(doorPx, doorPy, TILE_SIZE - 8, TILE_SIZE - 2);
  ctx.fillStyle = '#38BDF8';
  ctx.fillRect(doorPx + 4, doorPy + 4, TILE_SIZE - 16, 10);

  // Building Nameplate Sign
  ctx.font = 'bold 10px monospace';
  const textWidth = ctx.measureText(b.shortLabel).width;
  const badgeW = textWidth + 12;
  const badgeX = px + pw / 2 - badgeW / 2;
  const badgeY = py - 8;

  ctx.fillStyle = '#0F172A';
  ctx.fillRect(badgeX, badgeY, badgeW, 16);
  ctx.strokeStyle = '#F8FAFC';
  ctx.lineWidth = 1;
  ctx.strokeRect(badgeX, badgeY, badgeW, 16);

  ctx.fillStyle = '#F8FAFC';
  ctx.textAlign = 'center';
  ctx.fillText(b.shortLabel, px + pw / 2, badgeY + 11);
}

export function drawCenterRocket(ctx: CanvasRenderingContext2D, tick: number) {
  // Center plaza is around cols 10..13, rows 7..10
  const centerX = 12 * TILE_SIZE;
  const baseY = 10 * TILE_SIZE + 12;

  // Launchpad Hazard Ring
  ctx.strokeStyle = '#EAB308';
  ctx.lineWidth = 3;
  ctx.setLineDash([8, 6]);
  ctx.beginPath();
  ctx.arc(centerX, baseY - 12, 42, 0, Math.PI * 2);
  ctx.stroke();
  ctx.setLineDash([]);

  // Launch Tower Gantry (Left)
  ctx.fillStyle = '#DC2626';
  ctx.fillRect(centerX - 30, baseY - 105, 8, 105);
  ctx.strokeStyle = '#991B1B';
  ctx.lineWidth = 1;
  for (let y = baseY - 100; y < baseY; y += 12) {
    ctx.beginPath();
    ctx.moveTo(centerX - 30, y);
    ctx.lineTo(centerX - 22, y + 12);
    ctx.stroke();
  }
  // Swing Arm
  ctx.fillStyle = '#475569';
  ctx.fillRect(centerX - 22, baseY - 75, 16, 4);

  // Rocket Shadow
  ctx.fillStyle = 'rgba(15, 23, 42, 0.3)';
  ctx.beginPath();
  ctx.ellipse(centerX, baseY + 2, 22, 8, 0, 0, Math.PI * 2);
  ctx.fill();

  // Engine Nozzles
  ctx.fillStyle = '#1E293B';
  ctx.fillRect(centerX - 10, baseY - 10, 6, 10);
  ctx.fillRect(centerX + 4, baseY - 10, 6, 10);

  // Side Boosters
  ctx.fillStyle = '#E2E8F0';
  ctx.fillRect(centerX - 16, baseY - 65, 6, 55);
  ctx.fillRect(centerX + 10, baseY - 65, 6, 55);
  // Booster Nose Cones
  ctx.fillStyle = '#EF4444';
  ctx.beginPath();
  ctx.moveTo(centerX - 16, baseY - 65);
  ctx.lineTo(centerX - 13, baseY - 73);
  ctx.lineTo(centerX - 10, baseY - 65);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(centerX + 10, baseY - 65);
  ctx.lineTo(centerX + 13, baseY - 73);
  ctx.lineTo(centerX + 16, baseY - 65);
  ctx.fill();

  // Core Stage Body (Saturn V / SLS styling)
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(centerX - 10, baseY - 92, 20, 82);

  // Black Roll Patterns
  ctx.fillStyle = '#0F172A';
  ctx.fillRect(centerX - 10, baseY - 22, 20, 8);
  ctx.fillRect(centerX - 10, baseY - 75, 6, 12);
  ctx.fillRect(centerX + 4, baseY - 75, 6, 12);

  // NASA Meatball Insignia (Blue circle + red chevron)
  ctx.fillStyle = '#1D4ED8';
  ctx.beginPath();
  ctx.arc(centerX, baseY - 45, 5, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#EF4444';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(centerX - 6, baseY - 43);
  ctx.lineTo(centerX, baseY - 48);
  ctx.lineTo(centerX + 6, baseY - 44);
  ctx.stroke();

  // Command Capsule & Launch Escape Tower
  ctx.fillStyle = '#CBD5E1';
  ctx.beginPath();
  ctx.moveTo(centerX - 10, baseY - 92);
  ctx.lineTo(centerX, baseY - 108);
  ctx.lineTo(centerX + 10, baseY - 92);
  ctx.fill();

  ctx.strokeStyle = '#EF4444';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(centerX, baseY - 108);
  ctx.lineTo(centerX, baseY - 120);
  ctx.stroke();

  // Animated Venting Steam Puff
  const steamPhase = (tick % 60) / 60;
  ctx.fillStyle = `rgba(255, 255, 255, ${0.7 - steamPhase * 0.7})`;
  ctx.beginPath();
  ctx.arc(
    centerX + 16 + steamPhase * 14,
    baseY - 18 - steamPhase * 10,
    4 + steamPhase * 6,
    0,
    Math.PI * 2
  );
  ctx.fill();
}

export function drawAstronaut(
  ctx: CanvasRenderingContext2D,
  pixelX: number,
  pixelY: number,
  direction: 'down' | 'up' | 'left' | 'right',
  walkFrame: number
) {
  const bob = walkFrame % 2 === 1 ? -2 : 0;
  const x = pixelX;
  const y = pixelY + bob;

  // Shadow
  ctx.fillStyle = 'rgba(0,0,0,0.25)';
  ctx.beginPath();
  ctx.ellipse(x + 16, pixelY + 29, 9, 4, 0, 0, Math.PI * 2);
  ctx.fill();

  // Backpack (PLSS)
  ctx.fillStyle = '#94A3B8';
  if (direction === 'left') {
    ctx.fillRect(x + 20, y + 11, 5, 11);
  } else if (direction === 'right') {
    ctx.fillRect(x + 7, y + 11, 5, 11);
  } else if (direction === 'down') {
    ctx.fillRect(x + 8, y + 11, 16, 11);
  }

  // Spacesuit Torso
  ctx.fillStyle = '#F8FAFC';
  ctx.fillRect(x + 9, y + 13, 14, 11);

  // NASA Blue Chest Patch
  if (direction !== 'up') {
    ctx.fillStyle = '#2563EB';
    ctx.fillRect(x + 11, y + 15, 4, 4);
    ctx.fillStyle = '#EF4444';
    ctx.fillRect(x + 17, y + 16, 4, 2);
  }

  // Legs (animated stride)
  ctx.fillStyle = '#E2E8F0';
  const leftLegOffset = walkFrame === 1 ? -2 : 0;
  const rightLegOffset = walkFrame === 3 ? -2 : 0;
  ctx.fillRect(x + 10, y + 24 + leftLegOffset, 5, 5);
  ctx.fillRect(x + 17, y + 24 + rightLegOffset, 5, 5);

  // Helmet
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.arc(x + 16, y + 9, 8, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#CBD5E1';
  ctx.lineWidth = 1;
  ctx.stroke();

  // Gold Reflective Visor
  if (direction !== 'up') {
    ctx.fillStyle = '#F59E0B';
    const visorX =
      direction === 'left' ? x + 9 : direction === 'right' ? x + 15 : x + 11;
    const visorW = direction === 'down' ? 10 : 8;
    ctx.fillRect(visorX, y + 6, visorW, 6);

    // Visor Shine
    ctx.fillStyle = '#FEF08A';
    ctx.fillRect(visorX + 1, y + 7, 3, 2);
  }
}
