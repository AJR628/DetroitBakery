#!/usr/bin/env node
/**
 * Pre-flight check for the content set.
 * Catches the failure modes that actually matter for this site:
 * stale verification dates, missing sources, dead-looking links,
 * and any profile published without the facts that justify publishing it.
 */
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const DIR = 'src/content/bakeries';
const STALE_DAYS = 120;
const today = new Date();

let errors = 0;
let warnings = 0;
const err = (f, m) => { console.error(`  ERROR  ${f}: ${m}`); errors++; };
const warn = (f, m) => { console.warn(`  warn   ${f}: ${m}`); warnings++; };

const files = readdirSync(DIR).filter((f) => f.endsWith('.json'));
console.log(`\nChecking ${files.length} bakery records\n`);

const slugs = new Set();

for (const file of files) {
  let d;
  try {
    d = JSON.parse(readFileSync(join(DIR, file), 'utf8'));
  } catch (e) {
    err(file, `invalid JSON: ${e.message}`);
    continue;
  }

  const expected = file.replace(/\.json$/, '');
  if (d.slug !== expected) err(file, `slug "${d.slug}" does not match filename "${expected}"`);
  if (slugs.has(d.slug)) err(file, `duplicate slug "${d.slug}"`);
  slugs.add(d.slug);

  if (!d.sources || d.sources.length === 0) err(file, 'no sources');
  for (const s of d.sources ?? []) {
    if (!/^https?:\/\//.test(s.url ?? '')) err(file, `source url looks wrong: ${s.url}`);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(s.checked ?? '')) err(file, `source checked date malformed: ${s.checked}`);
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(d.verifiedOn ?? '')) {
    err(file, `verifiedOn malformed: ${d.verifiedOn}`);
  } else {
    const age = Math.floor((today - new Date(d.verifiedOn + 'T00:00:00Z')) / 86400000);
    if (age > STALE_DAYS) warn(file, `last verified ${age} days ago, re-check due`);
    if (age < 0) err(file, 'verifiedOn is in the future');
  }

  if (d.publication === 'published') {
    if (d.operational !== 'operating') {
      err(file, `published but operational status is "${d.operational}"`);
    }
    if (!d.summary || d.summary.length < 60) err(file, 'published with a thin or missing summary');
    if (!d.website && !d.phone) warn(file, 'published with neither website nor phone');
    const hasDecisionFact =
      d.customCakeLeadTime ||
      d.customCakeProcess ||
      (d.hours && Object.keys(d.hours).length) ||
      (d.priceExamples && d.priceExamples.length);
    if (!hasDecisionFact) {
      warn(file, 'published with no decision fact (no hours, lead time or price). This is the whole point of the site.');
    }
  }

  // The dash rule.
  const blob = JSON.stringify(d);
  if (/[—–]/.test(blob)) err(file, 'contains an em dash or en dash');

  // Guard against a tri-state being written as a boolean.
  for (const k of ['customCakes','paczki','paczkiYearRound','vegan','glutenFree','halal','openSunday','seating','delivery']) {
    if (k in d && !['yes','no','unknown'].includes(d[k])) {
      err(file, `${k} must be yes, no or unknown, got ${JSON.stringify(d[k])}`);
    }
  }
}

const published = files.filter((f) => {
  try { return JSON.parse(readFileSync(join(DIR, f), 'utf8')).publication === 'published'; }
  catch { return false; }
}).length;

console.log(`\n${published} published, ${files.length - published} draft`);
console.log(`${errors} error(s), ${warnings} warning(s)\n`);
process.exit(errors > 0 ? 1 : 0);
