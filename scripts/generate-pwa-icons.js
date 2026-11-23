import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

function makePng(width, height, drawFn) {
  const rowBytes = width * 4;
  const rawData = Buffer.alloc(height * (1 + rowBytes));

  for (let y = 0; y < height; y++) {
    const rowOffset = y * (1 + rowBytes);
    rawData[rowOffset] = 0; // Filter 0
    for (let x = 0; x < width; x++) {
      const [r, g, b, a] = drawFn(x, y, width, height);
      const pxOffset = rowOffset + 1 + x * 4;
      rawData[pxOffset] = r;
      rawData[pxOffset + 1] = g;
      rawData[pxOffset + 2] = b;
      rawData[pxOffset + 3] = a;
    }
  }

  const deflated = zlib.deflateSync(rawData);

  function crc32(buf) {
    let crc = 0xffffffff;
    for (let i = 0; i < buf.length; i++) {
      crc ^= buf[i];
      for (let j = 0; j < 8; j++) {
        crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0);
      }
    }
    return (crc ^ 0xffffffff) >>> 0;
  }

  function chunk(type, data) {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length, 0);
    const typeBuf = Buffer.from(type, 'binary');
    const crcBuf = Buffer.alloc(4);
    const typeAndData = Buffer.concat([typeBuf, data]);
    crcBuf.writeUInt32BE(crc32(typeAndData), 0);
    return Buffer.concat([len, typeAndData, crcBuf]);
  }

  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;

  return Buffer.concat([
    sig,
    chunk('IHDR', ihdr),
    chunk('IDAT', deflated),
    chunk('IEND', Buffer.alloc(0))
  ]);
}

// Draw functions for Standard and Maskable icons
function drawStandardIcon(x, y, w, h) {
  const nx = x / w;
  const ny = y / h;
  const cx = 0.5;
  const cy = 0.5;

  // Rounded rectangle background (radius ~ 22%)
  const radius = 0.22;
  const dx = Math.abs(nx - cx);
  const dy = Math.abs(ny - cy);
  const halfW = 0.44;
  const halfH = 0.44;

  let insideCard = false;
  if (dx <= halfW - radius && dy <= halfH) insideCard = true;
  else if (dx <= halfW && dy <= halfH - radius) insideCard = true;
  else {
    const cornerDx = dx - (halfW - radius);
    const cornerDy = dy - (halfH - radius);
    if (cornerDx > 0 && cornerDy > 0 && cornerDx * cornerDx + cornerDy * cornerDy <= radius * radius) {
      insideCard = true;
    }
  }

  if (!insideCard) {
    return [0, 0, 0, 0]; // Transparent outside
  }

  // Emerald gradient
  const grad = (nx + ny) * 0.5;
  let r = Math.round(4 + grad * 12);
  let g = Math.round(90 + grad * 75);
  let b = Math.round(65 + grad * 50);

  // Border highlight
  const distFromEdge = Math.min(halfW - dx, halfH - dy);
  if (distFromEdge < 0.02) {
    r = Math.min(255, r + 40);
    g = Math.min(255, g + 60);
    b = Math.min(255, b + 40);
  }

  // Wallet Symbol drawing in the center
  // Wallet body: box from nx 0.28 to 0.72, ny 0.35 to 0.65
  const inWalletBody = nx >= 0.28 && nx <= 0.72 && ny >= 0.35 && ny <= 0.65;
  const inWalletFlap = nx >= 0.28 && nx <= 0.72 && ny >= 0.28 && ny <= 0.36;
  const inWalletClasp = nx >= 0.58 && nx <= 0.74 && ny >= 0.45 && ny <= 0.55;

  // Gold accent coin / clasp center
  const claspDx = nx - 0.64;
  const claspDy = ny - 0.50;
  const inGoldButton = claspDx * claspDx + claspDy * claspDy <= 0.03 * 0.03;

  // Rupee / 'M' emblem in center
  const centerDx = nx - 0.45;
  const centerDy = ny - 0.50;
  const inEmblem = centerDx * centerDx + centerDy * centerDy <= 0.09 * 0.09;

  if (inGoldButton) {
    return [245, 158, 11, 255]; // Amber gold
  }

  if (inWalletClasp) {
    return [255, 255, 255, 240];
  }

  if (inEmblem) {
    // Subtle coin background
    return [16, 185, 129, 255]; // Bright emerald
  }

  if (inWalletBody || inWalletFlap) {
    return [255, 255, 255, 230];
  }

  return [r, g, b, 255];
}

function drawMaskableIcon(x, y, w, h) {
  const nx = x / w;
  const ny = y / h;

  // Maskable full-bleed background gradient
  const grad = (nx + ny) * 0.5;
  let r = Math.round(4 + grad * 10);
  let g = Math.round(85 + grad * 70);
  let b = Math.round(60 + grad * 45);

  // Everything kept inside 80% safe zone (center circle radius 0.40)
  const cx = 0.5;
  const cy = 0.5;
  const dist = Math.sqrt((nx - cx) ** 2 + (ny - cy) ** 2);

  // Central medallion
  if (dist <= 0.32) {
    // Inner badge
    const badgeGrad = (nx - cx) * 0.5 + 0.5;
    const br = Math.round(5 + badgeGrad * 15);
    const bg = Math.round(120 + badgeGrad * 60);
    const bb = Math.round(90 + badgeGrad * 40);

    // Wallet iconography inside safe zone
    const inWalletBody = nx >= 0.33 && nx <= 0.67 && ny >= 0.38 && ny <= 0.62;
    const inWalletFlap = nx >= 0.33 && nx <= 0.67 && ny >= 0.32 && ny <= 0.39;
    const inWalletClasp = nx >= 0.56 && nx <= 0.69 && ny >= 0.46 && ny <= 0.54;

    const claspDx = nx - 0.61;
    const claspDy = ny - 0.50;
    const inGoldButton = claspDx * claspDx + claspDy * claspDy <= 0.025 * 0.025;

    const centerDx = nx - 0.46;
    const centerDy = ny - 0.50;
    const inEmblem = centerDx * centerDx + centerDy * centerDy <= 0.07 * 0.07;

    if (inGoldButton) return [245, 158, 11, 255];
    if (inWalletClasp) return [255, 255, 255, 245];
    if (inEmblem) return [16, 185, 129, 255];
    if (inWalletBody || inWalletFlap) return [255, 255, 255, 230];

    return [br, bg, bb, 255];
  }

  // Safe outer rim highlight
  if (dist <= 0.33) {
    return [52, 211, 153, 220]; // Emerald 400
  }

  return [r, g, b, 255];
}

const outDir = path.resolve(process.cwd(), 'public');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

console.log('Generating PWA icons in:', outDir);

fs.writeFileSync(path.join(outDir, 'pwa-192x192.png'), makePng(192, 192, drawStandardIcon));
fs.writeFileSync(path.join(outDir, 'pwa-512x512.png'), makePng(512, 512, drawStandardIcon));
fs.writeFileSync(path.join(outDir, 'pwa-maskable-512x512.png'), makePng(512, 512, drawMaskableIcon));
fs.writeFileSync(path.join(outDir, 'apple-touch-icon.png'), makePng(180, 180, drawStandardIcon));

// Also generate public/icon.svg
const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#022c22" />
      <stop offset="50%" stop-color="#047857" />
      <stop offset="100%" stop-color="#10b981" />
    </linearGradient>
    <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#f59e0b" />
      <stop offset="100%" stop-color="#d97706" />
    </linearGradient>
    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="12" stdDeviation="16" flood-color="#000000" flood-opacity="0.35" />
    </filter>
  </defs>
  
  <!-- Base Squircle -->
  <rect x="32" y="32" width="448" height="448" rx="112" fill="url(#bgGrad)" filter="url(#shadow)" />
  <rect x="34" y="34" width="444" height="444" rx="110" fill="none" stroke="rgba(255,255,255,0.2)" stroke-width="4" />
  
  <!-- Wallet Body -->
  <rect x="128" y="176" width="256" height="176" rx="36" fill="#ffffff" opacity="0.95" filter="url(#shadow)" />
  
  <!-- Wallet Flap & Inner Contour -->
  <path d="M 128 212 C 128 176 160 156 196 156 L 316 156 C 352 156 384 176 384 212 Z" fill="#e2e8f0" opacity="0.9" />
  
  <!-- Vault / Rupee Symbol Emblem -->
  <circle cx="236" cy="264" r="44" fill="#059669" />
  <text x="236" y="278" font-family="system-ui, -apple-system, sans-serif" font-size="44" font-weight="900" fill="#ffffff" text-anchor="middle">₹</text>
  
  <!-- Clasp & Gold Coin Button -->
  <rect x="300" y="238" width="88" height="52" rx="26" fill="#f8fafc" filter="url(#shadow)" />
  <circle cx="344" cy="264" r="16" fill="url(#goldGrad)" />
  <circle cx="344" cy="264" r="8" fill="#fef3c7" />

  <!-- Sparkle Accent -->
  <path d="M 400 96 L 408 120 L 432 128 L 408 136 L 400 160 L 392 136 L 368 128 L 392 120 Z" fill="#34d399" />
</svg>`;

fs.writeFileSync(path.join(outDir, 'icon.svg'), svgContent, 'utf-8');

console.log('Successfully generated all PWA icons (PNG & SVG)!');
