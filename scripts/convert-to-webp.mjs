#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

// Lazy import sharp only when needed, so reading help doesn't crash if not installed
let sharp = null;
async function ensureSharp() {
  if (!sharp) {
    try { sharp = (await import('sharp')).default; }
    catch (e) {
      console.error('\nError: This tool requires the "sharp" package.');
      console.error('Install once with:');
      console.error('  npm i sharp --save-dev');
      process.exit(1);
    }
  }
}

const ROOT = process.cwd();
const IMAGES_DIRS = [
  'images/about',
  'images/Process',
  'images/Portfolio',
];

const exts = new Set(['.jpg', '.jpeg', '.png']);

function* walk(dir) {
  const entries = fs.existsSync(dir) ? fs.readdirSync(dir, { withFileTypes: true }) : [];
  for (const e of entries) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) yield* walk(p);
    else yield p;
  }
}

async function convertFile(srcPath, quality = 82) {
  const ext = path.extname(srcPath).toLowerCase();
  if (!exts.has(ext)) return { skipped: true };
  const outPath = srcPath.replace(/\.(jpe?g|png)$/i, '.webp');
  if (fs.existsSync(outPath)) return { skipped: true, exists: true };
  await ensureSharp();
  try {
    await sharp(srcPath).webp({ quality }).toFile(outPath);
    return { ok: true, outPath };
  } catch (e) {
    return { ok: false, error: e && e.message ? e.message : String(e) };
  }
}

(async function main(){
  const argQ = Number(process.env.WEBP_QUALITY || 82);
  const targets = (process.argv.slice(2).length ? process.argv.slice(2) : IMAGES_DIRS)
    .map(p => path.resolve(ROOT, p));

  let done = 0, made = 0, skipped = 0, failed = 0;
  console.log('Convert to WebP — starting');
  console.log('Quality:', argQ);
  for (const t of targets) {
    console.log('\nScanning:', path.relative(ROOT, t));
    for (const file of walk(t)) {
      const res = await convertFile(file, argQ);
      done++;
      if (res.ok) { made++; console.log('✔ webp:', path.relative(ROOT, res.outPath)); }
      else if (res.skipped) { skipped++; }
      else { failed++; console.warn('✖ failed:', path.relative(ROOT, file), '-', res.error); }
    }
  }
  console.log('\nSummary:');
  console.log('  Processed:', done);
  console.log('  Created  :', made);
  console.log('  Skipped  :', skipped);
  console.log('  Failed   :', failed);
  console.log('\nTip: You can control quality by prefixing the command with WEBP_QUALITY=75');
  console.log('     Example: WEBP_QUALITY=75 node scripts/convert-to-webp.mjs');
})();
