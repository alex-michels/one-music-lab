import fs from 'node:fs';
import createVerovioModule from '../node_modules/verovio/dist/verovio-module.mjs';
import { VerovioToolkit } from '../node_modules/verovio/dist/verovio.mjs';

// Every glyph the staff prototype draws, coaxed out of Verovio in one render.
const MEI = `<?xml version="1.0" encoding="UTF-8"?>
<music xmlns="http://www.music-encoding.org/ns/mei">
 <body><mdiv><score>
  <scoreDef><staffGrp>
   <staffDef n="1" lines="5" clef.shape="G" clef.line="2"/>
   <staffDef n="2" lines="5" clef.shape="F" clef.line="4"/>
   <staffDef n="3" lines="5" clef.shape="C" clef.line="3"/>
  </staffGrp></scoreDef>
  <section><measure n="1">
   <staff n="1"><layer n="1">
    <note dur="4" oct="4" pname="c" accid="s"/>
    <note dur="2" oct="4" pname="d" accid="f"/>
    <note dur="1" oct="4" pname="e" accid="n"/>
   </layer></staff>
   <staff n="2"><layer n="1">
    <note dur="4" oct="3" pname="g" accid="x"/>
    <note dur="4" oct="3" pname="a" accid="ff"/>
    <note dur="2" oct="3" pname="b"/>
   </layer></staff>
   <staff n="3"><layer n="1"><note dur="4" oct="4" pname="c"/></layer></staff>
  </measure></section>
 </score></mdiv></body></music>`;

const wasm = await createVerovioModule();
const tk = new VerovioToolkit(wasm);
tk.setOptions({ adjustPageHeight: true, svgViewBox: true, scale: 100 });
tk.loadData(MEI);
const svg = tk.renderToSVG(1);

const wanted = {
  E050: 'gClef',
  E062: 'fClef',
  E05C: 'cClef',
  E0A4: 'noteheadBlack',
  E0A3: 'noteheadHalf',
  E0A2: 'noteheadWhole',
  E260: 'accidentalFlat',
  E261: 'accidentalNatural',
  E262: 'accidentalSharp',
  E263: 'accidentalDoubleSharp',
  E264: 'accidentalDoubleFlat',
};

const groups = [
  ...svg.matchAll(/<g id="([0-9A-F]{4})-[^"]*">([\s\S]*?)<\/g>/g),
];
const out = {};
for (const [, code, body] of groups) {
  if (!wanted[code]) continue;
  const paths = [...body.matchAll(/<path[^>]*\sd="([^"]+)"/g)].map((m) => m[1]);
  if (paths.length) out[code] = { name: wanted[code], d: paths.join(' ') };
}

/** Rough bounding box from the numbers in a path, enough to check the unit. */
function bbox(d) {
  const nums = d.match(/-?\d+(?:\.\d+)?/g)?.map(Number) ?? [];
  const xs = nums.filter((_, i) => i % 2 === 0);
  const ys = nums.filter((_, i) => i % 2 === 1);
  return {
    w: Math.round(Math.max(...xs) - Math.min(...xs)),
    h: Math.round(Math.max(...ys) - Math.min(...ys)),
  };
}

console.log('found', Object.keys(out).length, 'of', Object.keys(wanted).length);
for (const [code, g] of Object.entries(out))
  console.log(
    code,
    g.name.padEnd(22),
    `${g.d.length}b`.padStart(7),
    JSON.stringify(bbox(g.d)),
  );
const missing = Object.keys(wanted).filter((c) => !out[c]);
if (missing.length)
  console.log('MISSING:', missing.map((c) => wanted[c]).join(', '));

fs.writeFileSync(
  new URL('../lib/glyphs.json', import.meta.url),
  JSON.stringify(out, null, 1),
);
console.log(
  '\ntotal path bytes:',
  Object.values(out).reduce((n, g) => n + g.d.length, 0),
);
