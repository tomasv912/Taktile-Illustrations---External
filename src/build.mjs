// Turns the raw Figma SVG exports into clean inline fragments and injects them into template.html
// Usage: node src/build.mjs            (writes ../index.html next to this folder)
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const dir = path.dirname(fileURLToPath(import.meta.url));
const out = process.argv[2] || path.join(dir, '..', 'index.html');

const slug = s => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

function extract(file, prefix) {
  let svg = fs.readFileSync(path.join(dir, file), 'utf8');
  const start = svg.indexOf('<g id="Illus">');
  const defsStart = svg.indexOf('<defs>');
  let body = svg.slice(start + '<g id="Illus">'.length, defsStart);
  // drop the frame background rect (the card paints it)
  body = body.replace(/^\s*<rect width="1080" height="1080" fill="#[0-9A-Fa-f]+"\/>/, '');
  // strip the closers of Illus (and the ref frame wrapping it) until the fragment balances
  const count = re => (body.match(re) || []).length;
  while (count(/<\/g>/g) > count(/<g[\s>]/g)) body = body.replace(/\s*<\/g>\s*$/, '');
  // Figma exports "inside" strokes as a mask + filled ring; the ring breaks up into a dotted
  // look when scaled down. Replace it with a plain stroke on the same outline.
  body = body.replace(
    /<g id="([^"]+)">\s*<mask id="([^"]+)"[^>]*>\s*<path d="([^"]+)"\/>\s*<\/mask>\s*<path d="\3" fill="#0B0A0A" fill-opacity="0.5"\/>\s*<path d="[^"]+" fill="#FDFCFC" mask="url\(#\2\)"\/>\s*<\/g>/g,
    '<path id="$1" d="$3" fill="#0B0A0A" fill-opacity="0.5" stroke="#FDFCFC"/>');
  if (body.includes('<mask')) throw new Error(file + ': unconverted mask stroke');
  const defs = svg.slice(defsStart + 6, svg.indexOf('</defs>'));
  let all = body + '\n<defs>' + defs + '</defs>';
  all = all.replace(/id="([^"]+)"/g, (_, id) => `id="${prefix}-${slug(id)}"`);
  all = all.replace(/url\(#([^)]+)\)/g, (_, id) => `url(#${prefix}-${slug(id)})`);
  const o = (all.match(/<g[\s>]/g) || []).length, c = (all.match(/<\/g>/g) || []).length;
  if (o !== c) throw new Error(`${file}: unbalanced <g>: ${o} open / ${c} close`);
  return all;
}

let i1 = extract('i1.svg', 'cubes');
i1 = i1.replace(/<path id="cubes-vector-5874"[^>]*\/>\s*/, ''); // stray 8px mark in the frame
const i2 = extract('i2.svg', 'stack');
const i4 = extract('i4.svg', 'hole');
const i5 = extract('i5.svg', 'slices');
let i6 = extract('i6.svg', 'orbit');
// the dashed connectors are loose paths in the frame; give each its own group so it
// becomes a layer the hover can tint
i6 = i6.replace(/(<path id="orbit-vector-(\d+)"[^>]*stroke-dasharray[^>]*\/>)/g, '<g id="orbit-conn-$2">$1</g>');

// 07 (Figma node 7732:27118), rebuilt from the frame's geometry with the outlines already as strokes
const i7 = extract('i7.svg', 'grow');

let html = fs.readFileSync(path.join(dir, 'template.html'), 'utf8');
html = html.replace('{{CUBES}}', i1).replace('{{STACK}}', i2).replace('{{HOLE}}', i4).replace('{{SLICES}}', i5)
  .replace('{{ORBIT}}', i6).replace('{{GROW}}', i7);
fs.writeFileSync(out, html);
console.log('wrote', out, html.length, 'bytes');
