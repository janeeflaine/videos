// Folha de personagens (prévia do elenco) — 1080×1920
import { INK, init, frame, g, push, pop, translate, scale, rotate, shape, fillOnly, stroke, rect, rr, ell, text } from './toon.js';
import { noe, rex, bird, raptorShadow, ampulheta, portal, arca, giraffe, elephant, turtle, asteroid, fossil, clipboard, PAL } from './cast.js';
init(document.getElementById('c'));
function cell(x, y, w, h, cols) { const n = cols.length; for (let i = 0; i < n; i++) fillOnly(rect(x, y + h * i / n, w, h / n + 1), cols[i], { boil: 0 }); }
function label(x, y, n, name, role) {
  shape(rr(x - 6, y - 30, 54, 56, 26), { fill: '#ffd23f', lw: 6 });
  text(String(n), x + 21, y + 2, { font: '800 38px "Baloo 2"', fill: INK });
  text(name, x + 62, y, { font: '800 40px "Baloo 2"', fill: '#ffffff', align: 'left', outlineW: 10 });
  if (role) text(role, x + 64, y + 36, { font: '700 24px "Baloo 2"', fill: '#ffffff', align: 'left', outlineW: 7 });
}
window.DUR = 3;
window.render = (t) => {
  frame(t);
  g.setTransform(1, 0, 0, 1, 0, 0); g.fillStyle = '#1b1422'; g.fillRect(0, 0, 1080, 1920);
  cell(0, 0, 1080, 150, ['#22304a']);
  text('CADÊ OS DINOSSAUROS?', 540, 58, { font: '58px "Titan One"', fill: '#ffd23f', outlineW: 12 });
  text('elenco · prévia', 540, 118, { font: '700 30px "Baloo 2"', fill: '#e9e0ff' });
  // Noé — convés na chuva
  cell(0, 150, 540, 700, ['#5a6f8f', '#52668a', '#4a5d80']); fillOnly(rect(0, 760, 540, 90), PAL.woodL, { boil: 0 });
  noe({ x: 250, y: 820, s: .95, t, holdR: 'clip', marks: 2, zero: 1, look: [.5, .1], mouth: { o: .3 }, drip: 1, wet: 1 });
  label(20, 186, 1, 'NOÉ', 'impassível · voz Sergio');
  // Rex — Cretáceo
  cell(540, 150, 540, 700, ['#ff9a4a', '#f2843a', '#d96d2e']); fillOnly(rect(540, 760, 540, 90), '#1f6f6a', { boil: 0 });
  rex({ x: 820, y: 820, s: .85, t, arms: 1, mouth: { o: .7 }, look: [.4, -.2], brow: .4 });
  label(560, 186, 2, 'REX', 'nervoso · voz Elvis');
  // pomba + sombra
  cell(0, 850, 540, 560, ['#e9dcc0', '#e2d3b4']);
  raptorShadow(260, 1330, .9);
  bird({ x: 240, y: 1340, s: 1.4, t, look: [.5, 0], smug: 1 });
  bird({ x: 420, y: 1300, s: .9, t, crow: 1, look: [-.5, 0], face: -1 });
  label(20, 886, 3, 'POMBA', 'e o corvo · arrulham');
  // ampulheta + portal
  cell(540, 850, 540, 560, ['#2b2140', '#251c38']);
  portal(900, 1130, 120, { t, open: 1 });
  ampulheta(680, 1180, .75, { glow: 1, t });
  label(560, 886, 4, 'AMPULHETA', 'portal no tempo');
  // arca + bichos
  cell(0, 1410, 1080, 510, ['#7d93b3', '#6d84a6', '#2d5a7a']);
  arca(560, 1790, 640, { t });
  giraffe(140, 1880, .55, t); elephant(910, 1880, .6, t); turtle(1000, 1890, .6, t);
  asteroid(900, 1500, 40, { t });
  fossil(150, 1560, .45);
  label(20, 1446, 5, 'ARCA', 'bichos, asteroide, fóssil');
};
await document.fonts.ready;
await Promise.all(['58px "Titan One"', '800 40px "Baloo 2"', '28px "VT323"'].map(f => document.fonts.load(f)));
window.READY = true;
