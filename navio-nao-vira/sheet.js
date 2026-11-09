// Folha de personagens (prévia do elenco) — 1080×1920
import { INK, init, frame, g, push, pop, translate, scale, rotate, shape, fillOnly, stroke, rect, rr, ell, arc, text, bands } from './toon.js';
import { dalva, tico, ondina, lunetaX, xWindow, ship, hullSection, joaoBobo, twistlock, lashingBar, PAL } from './cast.js';

init(document.getElementById('c'));
function cell(x, y, w, h, cols) { const n = cols.length; for (let i = 0; i < n; i++) fillOnly(rect(x, y + h * i / n, w, h / n + 1), cols[i], { boil: 0 }); }
function label(x, y, n, name, role) {
  shape(rr(x - 6, y - 30, 54, 56, 26), { fill: '#ffd23f', lw: 6 });
  text(String(n), x + 21, y + 2, { font: '800 38px "Baloo 2"', fill: INK });
  text(name, x + 62, y, { font: '800 40px "Baloo 2"', fill: '#ffffff', align: 'left', outlineW: 10 });
  if (role) text(role, x + 64, y + 36, { font: '700 24px "Baloo 2"', fill: '#ffffff', align: 'left', outlineW: 7 });
}
// marcadores G (gravidade) e B (empuxo)
export function gMark(x, y, r = 22) {
  shape(ell(x, y, r, r, 24), { fill: '#f2c230', lw: 5, shade: () => { fillOnly([[x, y], [x + r * 2, y], [x + r * 2, y - r * 2], [x, y - r * 2]], INK, { boil: 0 }); fillOnly([[x, y], [x - r * 2, y], [x - r * 2, y + r * 2], [x, y + r * 2]], INK, { boil: 0 }); } });
}
export function bMark(x, y, r = 22) { shape(ell(x, y, r, r, 24), { fill: '#3fb6e6', lw: 5 }); text('B', x, y + 2, { font: `800 ${r * 1.3}px "Baloo 2"`, fill: '#ffffff' }); }

window.render = (t) => {
  frame(t);
  g.setTransform(1, 0, 0, 1, 0, 0); g.fillStyle = '#1b1422'; g.fillRect(0, 0, 1080, 1920);
  cell(0, 0, 1080, 150, ['#1d2340']);
  text('POR QUE ELE NÃO VIRA?', 540, 58, { font: '58px "Titan One"', fill: '#ffd23f', outlineW: 12 });
  text('elenco · prévia para aprovação', 540, 118, { font: '700 30px "Baloo 2"', fill: '#e9e0ff' });

  // 1 Dalva — ponte de comando (azul-marinho + latão)
  cell(0, 150, 540, 640, ['#3a4f7a', '#33466e', '#2c3d62']);
  fillOnly(rect(0, 700, 540, 90), '#6b5232', { boil: 0 });
  dalva({ x: 250, y: 770, s: .72, t, holdR: 'tea', look: [.5, .1] });
  label(20, 186, 1, 'DALVA', 'comandante · impassível');
  // 2 Tico
  cell(540, 150, 540, 640, ['#7fc7b0', '#72b9a2', '#66ab95']);
  fillOnly(rect(540, 700, 540, 90), '#8e99a5', { boil: 0 });
  tico({ x: 810, y: 770, s: .86, t, nerv: .5, sweat: t * .7, armL: { h: [-60, -60], bend: -20 }, armR: { h: [60, -40], bend: 20 }, mouth: { o: .35, sm: -.8, skew: .4 } });
  label(560, 186, 2, 'TICO', 'novato · enjoado');
  stroke([[540, 150], [540, 790]], 6);

  // 3 Ondina
  cell(0, 790, 400, 410, ['#3b2a5a', '#33244f', '#2b1f44']);
  ondina({ x: 230, y: 1180, s: .78, t });
  label(16, 830, 3, 'ONDINA', 'a onda (não fala)');
  // 4 Luneta-X
  cell(400, 790, 340, 410, ['#1d2340', '#192038', '#151b30']);
  xWindow(600, 990, 70, { t });
  lunetaX(450, 1110, .6, { t, a: -.45 });
  label(414, 830, 4, 'LUNETA-X', '');
  // 5 João-bobo
  cell(740, 790, 340, 410, ['#f3e6c8', '#ead9b6', '#e0cca4']);
  joaoBobo(910, 1170, .95, { a: Math.sin(t * 2.4) * .3 });
  label(754, 830, 5, 'JOÃO-BOBO', '');
  for (const xx of [400, 740]) stroke([[xx, 790], [xx, 1200]], 6);
  stroke([[0, 790], [1080, 790]], 6);

  // 6 o navio
  cell(0, 1200, 1080, 360, ['#5b3f8a', '#4f3780']);
  bands(["#2a9fd6", "#2189bd", "#1a73a3"], 1500, 1560, 0, 1080);
  ship(560, 1500, 880, { t });
  text("400 m · 20 mil contêineres", 760, 1538, { font: '800 26px "Baloo 2"', fill: '#ffffff', outlineW: 7 });
  label(20, 1240, 6, 'O NAVIO', '');
  stroke([[0, 1200], [1080, 1200]], 6);

  // 7 corte do casco: G, B, lastro, aletas
  cell(0, 1560, 540, 360, ['#1e3b6e', '#1a3462', '#162c56']);
  for (let k = 0; k < 12; k++) stroke([[k * 48, 1560], [k * 48, 1920]], 2, { line: 'rgba(255,255,255,.08)' });
  bands(['rgba(42,159,214,.6)'], 1790, 1920, 0, 540);
  hullSection(300, 1790, 130, { t, ballast: .7 });
  gMark(300, 1800, 18); bMark(300, 1856, 18);
  text('lastro', 470, 1880, { font: '800 22px "Baloo 2"', fill: '#ffffff', outlineW: 6 });
  label(20, 1596, 7, 'CORTE', 'G · B · lastro · aletas');
  // 8 trava + barra
  cell(540, 1560, 540, 360, ['#d9d4c7', '#cfc9bb', '#c5bfb0']);
  twistlock(800, 1780, .9, { turn: .5 + .5 * Math.sin(t * 2) });
  lashingBar(600, 1890, 700, 1660);
  label(560, 1596, 8, 'TRAVA + BARRA', '');
  stroke([[540, 1560], [540, 1920]], 6); stroke([[0, 1560], [1080, 1560]], 6);
};
window.DUR = 2;
await document.fonts.ready;
await Promise.all(['58px "Titan One"', '800 40px "Baloo 2"', '18px "VT323"'].map(f => document.fonts.load(f)));
window.READY = true;
