#!/usr/bin/env node
/**
 * Decode the base64 image sources in assets/img-b64/ into real binaries
 * in public/img/ before the Astro build copies them.
 *
 * Why this exists: the tooling used to commit to this repo writes file
 * contents as UTF-8 text, which silently corrupts binary files. Storing the
 * images base64 encoded keeps them as text in git and restores them to
 * valid JPEGs at build time. Self contained, no external fetch, no manual step.
 */
import { readdirSync, readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const SRC = 'assets/img-b64';
const OUT = 'public/img';

if (!existsSync(SRC)) {
  console.log('[images] no assets/img-b64, nothing to decode');
  process.exit(0);
}
mkdirSync(OUT, { recursive: true });

const JPEG = Buffer.from([0xff, 0xd8, 0xff]);
const PNG = Buffer.from([0x89, 0x50, 0x4e, 0x47]);
let ok = 0;
let failed = 0;

for (const f of readdirSync(SRC).filter((n) => n.endsWith('.b64'))) {
  const name = f.replace(/\.b64$/, '');
  const buf = Buffer.from(readFileSync(join(SRC, f), 'utf8').replace(/\s+/g, ''), 'base64');

  const isJpeg = buf.subarray(0, 3).equals(JPEG);
  const isPng = buf.subarray(0, 4).equals(PNG);
  if (!isJpeg && !isPng) {
    console.error(`[images] FAILED ${name}: decoded bytes are not a valid image`);
    failed++;
    continue;
  }

  writeFileSync(join(OUT, name), buf);
  console.log(`[images] ${name} ${(buf.length / 1024).toFixed(0)}KB ok`);
  ok++;
}

console.log(`[images] ${ok} decoded, ${failed} failed`);
if (failed > 0) process.exit(1);
