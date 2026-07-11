// Generates Body-Log's PWA icons from the traced flexed-bicep glyph
// (scripts/bicep-glyph.svg — vector-traced from the 💪 reference and recoloured
// to the app theme: cyan fill #38bdf8, navy detail #0f172a).
//
// SVG assets are written directly (no dependencies). The PNG raster icons are
// rasterised with Chromium via playwright-core, using the browser under
// $PLAYWRIGHT_BROWSERS_PATH. Run with:  node scripts/generate-icons.mjs
import { createRequire } from 'node:module';
import { readFileSync, writeFileSync, mkdirSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const publicDir = join(root, 'public');
mkdirSync(publicDir, { recursive: true });

const BG = '#0f172a';
const glyphSvg = readFileSync(join(__dirname, 'bicep-glyph.svg'), 'utf8');
const glyphInner = glyphSvg.replace(/<\/?svg[^>]*>/g, '').trim(); // just the <path>s, in a 0..512 box

// Compose one square icon SVG: dark tile + the glyph scaled to `fill` and centred.
// `rounded` controls the corner radius (0 = full-bleed square, for maskable).
function iconSvg(rounded, fill) {
  const S = 512;
  const r = rounded ? S * 0.22 : 0;
  const pad = ((1 - fill) / 2) * S;
  return `<svg viewBox="0 0 ${S} ${S}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${S}" height="${S}" rx="${r}" fill="${BG}"/>
  <g transform="translate(${pad} ${pad}) scale(${fill})">${glyphInner}</g>
</svg>`;
}

// SVG favicon (crisp, dependency-free).
writeFileSync(join(publicDir, 'favicon.svg'), iconSvg(true, 0.92));
console.log('wrote favicon.svg');

// PNG raster targets. Maskable gets extra padding so the glyph stays inside the
// safe zone when the platform crops the icon to a circle/squircle.
const targets = [
  { name: 'icon-192.png', size: 192, rounded: true, fill: 0.92 },
  { name: 'icon-512.png', size: 512, rounded: true, fill: 0.92 },
  { name: 'apple-touch-icon.png', size: 180, rounded: true, fill: 0.92 },
  { name: 'icon-maskable-512.png', size: 512, rounded: false, fill: 0.66 },
];

function findChromium() {
  const base = process.env.PLAYWRIGHT_BROWSERS_PATH || '/opt/pw-browsers';
  const dir = readdirSync(base).find((d) => d.startsWith('chromium-'));
  if (!dir) throw new Error(`No chromium-* build found under ${base}`);
  return join(base, dir, 'chrome-linux', 'chrome');
}

const require = createRequire(join(root, 'package.json'));
const { chromium } = require('playwright-core');
const browser = await chromium.launch({ executablePath: findChromium(), args: ['--no-sandbox'] });
try {
  for (const t of targets) {
    const page = await browser.newPage({
      viewport: { width: t.size, height: t.size },
      deviceScaleFactor: 1,
    });
    const svg = iconSvg(t.rounded, t.fill);
    const html = `<!doctype html><html><head><style>
      html,body{margin:0;padding:0}svg{display:block;width:${t.size}px;height:${t.size}px}
    </style></head><body>${svg}</body></html>`;
    await page.setContent(html, { waitUntil: 'networkidle' });
    await page.screenshot({
      path: join(publicDir, t.name),
      clip: { x: 0, y: 0, width: t.size, height: t.size },
      omitBackground: false,
    });
    await page.close();
    console.log('wrote', t.name);
  }
} finally {
  await browser.close();
}
