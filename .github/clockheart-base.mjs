// Written by Clockheart. GitHub Pages serves this site under /<repo>/; Astro
// prefixes its own files with that base, but links written in the templates
// as "/menu/" would point outside it. This adds the base to every root link in
// the built pages and stylesheets. Run after `astro build`: node <this> dist /repo
import { readdirSync, readFileSync, writeFileSync, statSync } from 'node:fs';
import { join, extname } from 'node:path';
const [dir = 'dist', baseArg = ''] = process.argv.slice(2);
const base = baseArg.replace(/\/+$/, '');
if (!base) process.exit(0); // served at the domain root: nothing to do
const fix = (u) => (u.startsWith('/') && !u.startsWith('//') && u !== base && !u.startsWith(base + '/') && !u.startsWith(base + '?') && !u.startsWith(base + '#')) ? base + u : u;
const html = (s) => s
  .replace(/\b(href|src|action|poster|data-src)=(["'])(\/[^"']*)\2/gi, (m, a, q, u) => `${a}=${q}${fix(u)}${q}`)
  .replace(/\bsrcset=(["'])([^"']*)\1/gi, (m, q, v) => `srcset=${q}${v.split(',').map((p) => p.trim().replace(/^(\S+)/, (u) => fix(u))).join(', ')}${q}`)
  .replace(/url\((["']?)(\/[^)"']*)\1\)/g, (m, q, u) => `url(${q}${fix(u)}${q})`);
const css = (s) => s.replace(/url\((["']?)(\/[^)"']*)\1\)/g, (m, q, u) => `url(${q}${fix(u)}${q})`);
let n = 0;
const walk = (d) => {
  for (const f of readdirSync(d)) {
    const p = join(d, f);
    if (statSync(p).isDirectory()) { walk(p); continue; }
    const ext = extname(f).toLowerCase();
    if (ext !== '.html' && ext !== '.css') continue;
    const before = readFileSync(p, 'utf8');
    const after = ext === '.html' ? html(before) : css(before);
    if (after !== before) { writeFileSync(p, after); n++; }
  }
};
walk(dir);
console.log(`Links under ${base}/ in ${n} file(s).`);
