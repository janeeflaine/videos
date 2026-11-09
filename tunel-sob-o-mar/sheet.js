// Folha de personagens (prévia do elenco) — 1080×1920
import { INK, init, frame, g, push, pop, translate, scale, shape, fillOnly, stroke, rect, rr, ell, text, S } from './toon.js';
import { neide, bolota, pingo, tbm, cutterhead, scope, cutWindow, segRing, gasketDetail, pump, gauge, PAL } from './cast.js';

init(document.getElementById('c'));

function cell(x, y, w, h, cols) {
  const n = cols.length;
  for (let i = 0; i < n; i++) fillOnly(rect(x, y + h * i / n, w, h / n + 1), cols[i], { boil: 0 });
}
function label(x, y, n, name, role) {
  const pw = 54;
  shape(rr(x - 6, y - 30, pw, 56, 26), { fill: '#ffd23f', lw: 6 });
  text(String(n), x + pw / 2 - 6, y + 2, { font: '800 38px "Baloo 2"', fill: INK });
  text(name, x + pw + 8, y, { font: '800 40px "Baloo 2"', fill: '#ffffff', align: 'left', outlineW: 10 });
  if (role) text(role, x + pw + 10, y + 36, { font: '700 24px "Baloo 2"', fill: '#ffffff', align: 'left', outlineW: 7 });
}

window.render = (t) => {
  frame(t);
  g.setTransform(1, 0, 0, 1, 0, 0); g.fillStyle = '#1b1422'; g.fillRect(0, 0, 1080, 1920);
  // título
  cell(0, 0, 1080, 150, ['#2b2140']);
  text('NEM UMA GOTA?', 540, 58, { font: '64px "Titan One"', fill: '#ffd23f', outlineW: 12 });
  text('elenco · prévia para aprovação', 540, 118, { font: '700 30px "Baloo 2"', fill: '#e9e0ff' });

  // 1 Neide — cabine (verde-oliva + mostarda)
  cell(0, 150, 540, 640, ['#7b8a4a', '#6f7d42', '#64713b']);
  fillOnly(rect(0, 700, 540, 90), '#4f5a2e', { boil: 0 });
  neide({ x: 210, y: 722, s: .72, t, holdR: 'mug', look: [.4, .1] });
  label(20, 186, 1, 'NEIDE', 'engenheira · impassível');
  // close do rosto
  { const cx = 432, cy = 330, r = 92;
    g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.beginPath(); g.arc(cx, cy, r, 0, Math.PI * 2); g.clip();
    g.fillStyle = '#9aa85e'; g.fillRect(cx - r, cy - r, 2 * r, 2 * r);
    neide({ x: cx - 30 * 1.05, y: cy + 522 * 1.05, s: 1.05, t, look: [.3, .1] });
    g.restore();
    shape(ell(cx, cy, r, r, 48), { fill: null, lw: 7 });
    text('close', cx, cy + r + 22, { font: '800 22px "Baloo 2"', fill: '#ffffff', outlineW: 6 }); }

  // 2 Bolota
  cell(540, 150, 540, 640, ['#d9b84a', '#cfae40', '#c4a337']);
  fillOnly(rect(540, 700, 540, 90), '#a68a2a', { boil: 0 });
  bolota({ x: 810, y: 712, s: 1.02, t, nerv: .5, sweat: t * .7, armR: { h: [60, -40], bend: 30 }, armL: { h: [-50, 60], bend: -10 }, mouth: { o: .55, sm: -.7 } });
  label(560, 186, 2, 'BOLOTA', 'estagiário · em pânico');
  stroke([[540, 150], [540, 790]], 6);

  // 3 Pingo
  cell(0, 790, 360, 410, ['#14415e', '#103750', '#0d2e44']);
  pingo({ x: 180, y: 1130, s: 1.25, t });
  label(16, 830, 3, 'PINGO', 'a gota (não fala)');

  // 4 Corte-Scópio + janela de corte
  cell(360, 790, 360, 410, ['#3a2a52', '#33254a', '#2c2041']);
  cutWindow(540, 960, 70, { t });
  scope(470, 1110, .62, { t, a: -.35 });
  label(376, 830, 4, 'CORTE-SCÓPIO', 'o único brilho');

  // 5 manômetro
  cell(720, 790, 360, 410, ['#e7e0cf', '#ddd5c2', '#d3cab5']);
  gauge(900, 1035, 120, { val: 3, t });
  label(736, 830, 5, 'MANÔMETRO', '3 bar = 30 m de água');
  for (const xx of [360, 720]) stroke([[xx, 790], [xx, 1200]], 6);
  stroke([[0, 790], [1080, 790]], 6);

  // 6 Tatuzão
  cell(0, 1200, 1080, 380, ['#c8b18a', '#bba37b', '#ad966d']);
  tbm(40, 1440, .66, { t });
  cutterhead(960, 1430, 100, { rot: t * .6 });
  text('frente', 960, 1555, { font: '800 24px "Baloo 2"', fill: '#ffffff', outlineW: 7 });
  label(20, 1240, 6, 'TATUZÃO', 'tuneladora de lama');
  stroke([[0, 1200], [1080, 1200]], 6);

  // 7 Anel de aduelas
  cell(0, 1580, 540, 340, ['#7d8590', '#737b86', '#69717c']);
  segRing(150, 1770, 110, { t });
  gasketDetail(400, 1780, .62, { squeeze: 1 });
  text('junta de borracha', 400, 1850, { font: '800 22px "Baloo 2"', fill: '#ffffff', outlineW: 6 });
  label(20, 1616, 7, 'ADUELAS', '');

  // 8 Bomba
  cell(540, 1580, 540, 340, ['#2e8a7a', '#287a6c', '#226a5e']);
  pump(760, 1800, .78, { t });
  label(560, 1616, 8, 'BOMBA', 'devolve a água ao mar');
  stroke([[540, 1580], [540, 1920]], 6); stroke([[0, 1580], [1080, 1580]], 6);
};
window.DUR = 2;
await document.fonts.ready;
await Promise.all(['64px "Titan One"', '800 40px "Baloo 2"', '20px "VT323"'].map(f => document.fonts.load(f)));
window.READY = true;
