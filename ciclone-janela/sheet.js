// Folha de personagens (prévia do elenco) — 1080×1920
import { INK, init, frame, g, fillOnly, rect, rr, shape, stroke, text } from './toon.js';
import { ademar, kika, rodamoinho, casa, telhado, janela, protecao, barometro, oculosRaioP, banheiro, PAL } from './cast.js';

init(document.getElementById('c'));
function cell(x, y, w, h, cols) { const n = cols.length; for (let i = 0; i < n; i++) fillOnly(rect(x, y + h * i / n, w, h / n + 1), cols[i], { boil: 0 }); }
function label(x, y, n, name, role, sm = 1) {
  shape(rr(x - 6, y - 28 * sm, 54 * sm, 54 * sm, 25 * sm), { fill: '#ffd23f', lw: 6 });
  text(String(n), x - 6 + 27 * sm, y - 1 * sm, { font: `800 ${36 * sm}px "Baloo 2"`, fill: INK });
  text(name, x + 60 * sm, y - 2, { font: `800 ${38 * sm}px "Baloo 2"`, fill: '#ffffff', align: 'left', outlineW: 10 * sm });
  if (role) text(role, x + 62 * sm, y + 32 * sm, { font: `700 ${24 * sm}px "Baloo 2"`, fill: '#ffffff', align: 'left', outlineW: 7 * sm });
}
const vline = (x, y0, y1) => stroke([[x, y0], [x, y1]], 6);
const hline = (y) => stroke([[0, y], [1080, y]], 6);

window.render = (t) => {
  frame(t);
  g.setTransform(1, 0, 0, 1, 0, 0); g.fillStyle = INK; g.fillRect(0, 0, 1080, 1920);
  cell(0, 0, 1080, 150, ['#2a2140']);
  text('ABRE A JANELA, SEU ADEMAR?', 540, 58, { font: '54px "Titan One"', fill: '#ffd23f', outlineW: 12 });
  text('elenco · prévia para aprovação', 540, 118, { font: '700 30px "Baloo 2"', fill: '#e9e0ff' });

  // 1 Ademar — sala (bege "suspeitamente normal")
  cell(0, 150, 540, 640, ['#d9c9a6', '#cfbe98', '#c4b28a']);
  fillOnly(rect(0, 712, 540, 78), '#8a6a48', { boil: 0 });
  ademar({ x: 270, y: 770, s: .84, t, armR: { h: [110, -60], bend: -40 }, mouth: { o: .3, sm: .7 }, look: [.4, -.1], lid: .35, brow: 1 });
  label(20, 190, 1, 'SEU ADEMAR', 'aposentado · teimoso');
  // 2 Kika — noite de tempestade (roxo + verde-neon dos óculos)
  cell(540, 150, 540, 640, ['#3b2d63', '#33285a', '#2b224d']);
  fillOnly(rect(540, 712, 540, 78), '#8a6a48', { boil: 0 });
  kika({ x: 810, y: 770, s: 1.24, t, goggles: false, armR: { h: [60, -70], bend: -30 }, mouth: { o: .15, sm: .3, skew: .6 }, look: [-.4, 0], lid: .5 });
  label(560, 190, 2, 'KIKA', 'neta · engenheira mirim');
  vline(540, 150, 790); hline(790);

  // 3 Rodamoinho — céu de ciclone
  cell(0, 790, 540, 440, ['#4a5468', '#414a5d', '#384052']);
  rodamoinho({ x: 270, y: 1222, s: .74, t });
  label(20, 828, 3, 'RODAMOINHO', 'o vento · não fala');
  // 4 Casa
  cell(540, 790, 540, 440, ['#7fc1d9', '#74b5cd', '#6aa9c1']);
  fillOnly(rect(540, 1180, 540, 50), '#6fae4f', { boil: 0 });
  casa({ x: 810, y: 1190, s: .6, t });
  label(560, 828, 4, 'A CASA', 'térrea · telha');
  vline(540, 790, 1230); hline(1230);

  // 5 Telhado · 6 Janela · 7 Proteção
  cell(0, 1230, 360, 345, ['#f0a35e']);
  telhado({ x: 180, y: 1520, s: .54, t, face: true, mouth: { o: .5, sm: -.7 } });
  label(16, 1266, 5, 'TELHADO', 'reage a tudo', .8);
  cell(360, 1230, 360, 345, ['#d9c9a6']);
  janela({ x: 540, y: 1555, s: .66, latch: -.4 });
  label(376, 1266, 6, 'JANELA', 'trinco de alavanca', .8);
  cell(720, 1230, 360, 345, ['#9fb4c9']);
  protecao({ x: 900, y: 1560, s: .66 });
  label(736, 1266, 7, 'PROTEÇÃO', 'persiana · tapume', .8);
  vline(360, 1230, 1575); vline(720, 1230, 1575); hline(1575);

  // 8 Barômetro · 9 Óculos Raio-P · 10 Banheiro
  cell(0, 1575, 360, 345, ['#5d3b52']);
  barometro({ x: 180, y: 1890, s: 1.05 });
  label(16, 1611, 8, 'BARÔMETRO', 'dramático', .8);
  cell(360, 1575, 360, 345, ['#1f2a33']);
  oculosRaioP({ x: 540, y: 1820, s: .95, t });
  label(376, 1611, 9, 'ÓCULOS RAIO-P', 'veem pressão e vento', .8);
  cell(720, 1575, 360, 345, ['#3f6f86']);
  banheiro({ x: 900, y: 1910, s: .66 });
  label(736, 1611, 10, 'BANHEIRO', 'cômodo seguro', .8);
  vline(360, 1575, 1920); vline(720, 1575, 1920);
};
await document.fonts.load('54px "Titan One"'); await document.fonts.load('800 38px "Baloo 2"');
window.READY = true;
