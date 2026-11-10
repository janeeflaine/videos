// Folha do elenco fixo da série (prévia para aprovação) — 1080×1920
import { INK, init, frame, g, fillOnly, rect, rr, shape, stroke, text, push, pop, translate, scale } from './toon.js';
import { chico, zefinha, gato, papagaio, poleiro, poltrona, mesinha, garrafa, xicara, jornalClose, PAL } from './cast.js';

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
function clip(x, y, w, h, fn) { g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.beginPath(); g.rect(x, y, w, h); g.clip(); fn(); g.restore(); }

window.render = (t) => {
  frame(t);
  g.setTransform(1, 0, 0, 1, 0, 0); g.fillStyle = INK; g.fillRect(0, 0, 1080, 1920);
  cell(0, 0, 1080, 150, ['#2a2140']);
  text('JORNAL DO SEU CHICÓ', 540, 58, { font: '56px "Titan One"', fill: '#ffd23f', outlineW: 12 });
  text('elenco fixo da série · prévia para aprovação', 540, 118, { font: '700 30px "Baloo 2"', fill: '#e9e0ff' });

  // 1 O senhor — parede verde-água da sala
  clip(0, 150, 540, 700, () => {
    cell(0, 150, 540, 700, ['#a8dccf', '#9fd3c6', '#93c8bb']);
    fillOnly(rect(0, 560, 540, 220), PAL.wallB, { boil: 0 });
    fillOnly(rect(0, 780, 540, 70), PAL.floor, { boil: 0 });
    chico({ x: 250, y: 830, s: .72, t, armR: { e: [44, 186], h: [-96, -24], fist: true, ang: -2.2 }, mouth: { o: 0, sm: .25, skew: .3 }, look: [.3, 0], lid: .35, brow: .5 });
  });
  label(20, 190, 1, 'SEU CHICÓ', 'lê o jornal · opina · ri');
  // 2 A esposa — cozinha amarela com azulejo
  clip(540, 150, 540, 700, () => {
    cell(540, 150, 540, 700, ['#f6dd8a', '#f2d47a']);
    fillOnly(rect(540, 560, 540, 220), PAL.kTile, { boil: 0 });
    for (let x = 540; x < 1080; x += 44) for (let y = 560; y < 780; y += 44) stroke([[x, y], [x + 44, y], [x + 44, y + 44]], 2, { line: '#cfd9de', boil: 0 });
    fillOnly(rect(540, 780, 540, 70), PAL.kFloorB, { boil: 0 });
    zefinha({ x: 815, y: 830, s: .76, t, look: [-.3, 0], lid: .35, brow: .3 });
  });
  label(560, 190, 2, 'DONA ZEFINHA', 'na cozinha · bordões');
  vline(540, 150, 850); hline(850);

  // 3 Gato · 4 Papagaio
  clip(0, 850, 540, 440, () => {
    cell(0, 850, 540, 440, ['#5d3b52', '#553649', '#4d3142']);
    fillOnly(rect(0, 1240, 540, 50), PAL.floor, { boil: 0 });
    gato({ x: 290, y: 1258, s: .95, t, arch: .55, look: [.6, -.4] });
  });
  label(20, 888, 3, 'BITUCA', 'magricelo · bagunceiro');
  clip(540, 850, 540, 440, () => {
    cell(540, 850, 540, 440, ['#ffb347', '#ff9a55', '#ff8a5c']);
    poleiro({ x: 800, y: 1290, s: 1, h: 120 });
    papagaio({ x: 790, y: 1166, s: .82, t, beak: .8, wing: .6, look: [.6, -.2] });
  });
  label(560, 888, 4, 'LORENZO', 'repete na pior hora');
  vline(540, 850, 1290); hline(1290);

  // 5 Poltrona + mesinha + café
  clip(0, 1290, 540, 630, () => {
    cell(0, 1290, 540, 630, ['#a8dccf', '#9fd3c6']);
    fillOnly(rect(0, 1600, 540, 200), PAL.wallB, { boil: 0 });
    fillOnly(rect(0, 1800, 540, 120), PAL.floor, { boil: 0 });
    poltrona({ x: 190, y: 1870, s: .62 });
    mesinha({ x: 440, y: 1870, s: .78 });
    garrafa({ x: 410, y: 1612, s: .6 });
    xicara({ x: 486, y: 1610, s: .62, t });
  });
  label(20, 1328, 5, 'A POLTRONA', 'café de garrafa · xícara');
  // 6 Close em primeira pessoa
  clip(540, 1290, 540, 630, () => {
    cell(540, 1290, 540, 630, ['#3a2f2a']);
    push(); translate(540 + 270 - 540 * .3, 1290 + 40); scale(.3);
    jornalClose({ t });
    pop();
  });
  label(560, 1328, 6, 'BRAZUELA', 'o jornal · close nas mãos dele');
  vline(540, 1290, 1920);
};
await document.fonts.load('58px "Titan One"'); await document.fonts.load('800 38px "Baloo 2"'); await document.fonts.load('78px "Bungee"');
window.READY = true;
