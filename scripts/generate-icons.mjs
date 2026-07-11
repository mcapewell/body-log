// Generates Body-Log PWA icons as PNGs with no external dependencies.
// Draws a rounded dark tile with a light-blue dumbbell glyph.
import { deflateSync } from 'node:zlib';
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const publicDir = join(__dirname, '..', 'public');
mkdirSync(publicDir, { recursive: true });

// ---- tiny PNG encoder ------------------------------------------------------
const crcTable = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  return t;
})();
function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = crcTable[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}
function chunk(type, data) {
  const typeBuf = Buffer.from(type, 'ascii');
  const body = Buffer.concat([typeBuf, data]);
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body), 0);
  return Buffer.concat([len, body, crc]);
}
function encodePng(width, height, rgba) {
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // RGBA
  const stride = width * 4;
  const raw = Buffer.alloc((stride + 1) * height);
  for (let y = 0; y < height; y++) {
    raw[y * (stride + 1)] = 0; // filter: none
    rgba.copy(raw, y * (stride + 1) + 1, y * stride, y * stride + stride);
  }
  return Buffer.concat([
    sig,
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

// ---- drawing ---------------------------------------------------------------
const BG = [15, 23, 42, 255]; // #0f172a
const ACCENT = [56, 189, 248, 255]; // #38bdf8

function draw(size, { rounded }) {
  const buf = Buffer.alloc(size * size * 4);
  const radius = rounded ? size * 0.22 : 0;
  const set = (x, y, c) => {
    const i = (y * size + x) * 4;
    buf[i] = c[0];
    buf[i + 1] = c[1];
    buf[i + 2] = c[2];
    buf[i + 3] = c[3];
  };
  const insideRounded = (x, y) => {
    if (radius <= 0) return true;
    const r = radius;
    const cx = Math.min(Math.max(x, r), size - r);
    const cy = Math.min(Math.max(y, r), size - r);
    return (x - cx) ** 2 + (y - cy) ** 2 <= r * r;
  };

  // Dumbbell geometry (centred).
  const mid = size / 2;
  const barHalf = size * 0.24; // bar reaches this far from centre
  const barThick = size * 0.06;
  const plateW = size * 0.06;
  const innerPlateH = size * 0.20;
  const outerPlateH = size * 0.30;

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      if (!insideRounded(x, y)) {
        set(x, y, [0, 0, 0, 0]);
        continue;
      }
      let c = BG;
      const dx = x - mid;
      const dy = y - mid;

      // central bar
      if (Math.abs(dx) <= barHalf && Math.abs(dy) <= barThick) c = ACCENT;
      // inner plates
      const innerEdge = barHalf;
      if (
        Math.abs(dx) >= innerEdge &&
        Math.abs(dx) <= innerEdge + plateW &&
        Math.abs(dy) <= innerPlateH
      )
        c = ACCENT;
      // outer plates
      const outerEdge = innerEdge + plateW + size * 0.03;
      if (
        Math.abs(dx) >= outerEdge &&
        Math.abs(dx) <= outerEdge + plateW &&
        Math.abs(dy) <= outerPlateH
      )
        c = ACCENT;

      set(x, y, c);
    }
  }
  return encodePng(size, size, buf);
}

const outputs = [
  { name: 'icon-192.png', size: 192, rounded: true },
  { name: 'icon-512.png', size: 512, rounded: true },
  { name: 'icon-maskable-512.png', size: 512, rounded: false },
  { name: 'apple-touch-icon.png', size: 180, rounded: true },
];

for (const o of outputs) {
  writeFileSync(join(publicDir, o.name), draw(o.size, { rounded: o.rounded }));
  console.log('wrote', o.name);
}

// SVG favicon (crisp at small sizes).
const favicon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <rect width="64" height="64" rx="14" fill="#0f172a"/>
  <g fill="#38bdf8">
    <rect x="17" y="29" width="30" height="6" rx="2"/>
    <rect x="14" y="23" width="6" height="18" rx="2"/>
    <rect x="9" y="19" width="6" height="26" rx="2"/>
    <rect x="44" y="23" width="6" height="18" rx="2"/>
    <rect x="49" y="19" width="6" height="26" rx="2"/>
  </g>
</svg>`;
writeFileSync(join(publicDir, 'favicon.svg'), favicon);
console.log('wrote favicon.svg');
