// Folha de personagens (prévia do elenco) — 1080×1920, duas páginas: ?sheet=1 (personagens) e ?sheet=2 (aviões e objetos)
import { INK, init, frame, g, shape, fillOnly, stroke, rect, rr, ell, text, bands } from './toon.js';
import { marlene, juca, olhao, bandeja, jet, teimoso, farolete, radar, dropsonde, gMeter, trainer } from './cast.js';

init(document.getElementById('c'));
const PAGE = new URLSearchParams(location.search).get('sheet') === '2' ? 2 : 1;
function cell(x, y, w, h, cols) { const n = cols.length; for (let i = 0; i < n; i++) fillOnly(rect(x, y + h * i / n, w, h / n + 1), cols[i], { boil: 0 }); }
function label(x, y, n, name, role) {
  shape(rr(x - 6, y - 30, 54, 56, 26), { fill: '#ffd23f', lw: 6 });
  text(String(n), x + 21, y + 2, { font: '800 38px "Baloo 2"', fill: INK });
  text(name, x + 62, y, { font: '800 40px "Baloo 2"', fill: '#ffffff', align: 'left', outlineW: 10 });
  if (role) text(role, x + 64, y + 36, { font: '700 24px "Baloo 2"', fill: '#ffffff', align: 'left', outlineW: 7 });
}
const hline = y => stroke([[0, y], [1080, y]], 6), vline = (x, y0, y1) => stroke([[x, y0], [x, y1]], 6);
function header(sub) {
  cell(0, 0, 1080, 150, ['#1d2340']);
  text('E SE O AVIÃO ENTRAR NO OLHO?', 540, 58, { font: '50px "Titan One"', fill: '#ffd23f', outlineW: 12 });
  text(sub, 540, 118, { font: '700 30px "Baloo 2"', fill: '#e9e0ff' });
}

function page1(t) {
  header('elenco · prévia para aprovação · 1/2');
  // 1 Marlene — cabine (azul-noite + painel)
  cell(0, 150, 540, 690, ['#2c3d62', '#283858', '#24324e']);
  fillOnly(rect(0, 760, 540, 80), '#3a3f4a', { boil: 0 });
  marlene({ x: 250, y: 820, s: .9, t, holdR: 'mug', look: [.5, .1] });
  label(20, 186, 1, 'MARLENE', 'comandante · impassível');
  // 2 Juca
  cell(540, 150, 540, 690, ['#7fc7e6', '#72b9d8', '#66abc9']);
  fillOnly(rect(540, 760, 540, 80), '#3a3f4a', { boil: 0 });
  juca({ x: 800, y: 820, s: .84, t, holdR: 'selfie', look: [-.3, -.4], mouth: { o: .5, sm: 1 } });
  label(560, 186, 2, 'JUCA', 'copiloto novato · selfie');
  vline(540, 150, 840); hline(840);
  // 3 Olhão — mar visto do alto
  cell(0, 840, 540, 580, ['#1a5c7a', '#175370', '#144a64']);
  olhao({ x: 270, y: 1150, s: .78, t, look: [.3, .1] });
  label(20, 876, 3, 'OLHÃO', 'o furacão (não fala)');
  // 4 Bandeja — corredor do avião
  cell(540, 840, 540, 580, ['#e9e4d6', '#e0dac9', '#d6cfbc']);
  fillOnly(rect(540, 1340, 540, 80), '#5a6aa0', { boil: 0 });
  bandeja({ x: 810, y: 1390, s: .95, t });
  label(560, 876, 4, 'BANDEJA', 'comissária-robô');
  vline(540, 840, 1420); hline(1420);
  // 5 Teimoso — céu
  cell(0, 1420, 1080, 500, ['#8fd3ff', '#7cc6f5', '#6ab8ea']);
  for (const [cx, cy, r] of [[150, 1820, 90], [260, 1840, 70], [880, 1830, 100], [990, 1800, 70]]) shape(ell(cx, cy, r, r * .6, 20), { fill: '#ffffff', lw: 5 });
  teimoso(560, 1700, 860, { t, look: [.6, 0] });
  label(20, 1456, 5, 'TEIMOSO', 'caçador de furacões');
  text('4 turboélices · radar no nariz e na barriga', 540, 1890, { font: '800 26px "Baloo 2"', fill: '#ffffff', outlineW: 7 });
}

function page2(t) {
  header('aviões e objetos · prévia para aprovação · 2/2');
  // 6 Jato PT-SOH
  cell(0, 150, 1080, 480, ['#ffb47a', '#ff9f6a', '#f28a5c']);
  for (const [cx, cy, r] of [[140, 560, 80], [940, 540, 90]]) shape(ell(cx, cy, r, r * .55, 20), { fill: '#ffe6d2', lw: 5 });
  jet(560, 450, 800, { t });
  label(20, 186, 6, 'JATO PT-SOH', 'avião de passageiros');
  hline(630);
  // 7 Farolete
  cell(0, 630, 1080, 480, ['#3b2a5a', '#33244f', '#2b1f44']);
  farolete(520, 950, 760, { t, beam: .8 });
  label(20, 666, 7, 'FAROLETE', 'o avião-guia (caso Hugo, 1989)');
  hline(1110);
  // 8 Radar | 9 Medidor de G
  cell(0, 1110, 540, 450, ['#1d2340', '#192038']);
  radar(270, 1350, 130, { t });
  label(20, 1146, 8, 'RADAR', 'do painel');
  cell(540, 1110, 540, 450, ['#d9d4c7', '#cfc9bb']);
  gMeter(810, 1360, 130, { g: 1 + Math.sin(t * 3) * 1.4 });
  label(560, 1146, 9, 'MEDIDOR DE G', '');
  vline(540, 1110, 1560); hline(1560);
  // 10 Sonda | 11 Aviãozinho de 1943
  cell(0, 1560, 540, 360, ['#8fd3ff', '#7cc6f5']);
  dropsonde(300, 1800, .9, { t });
  label(20, 1596, 10, 'SONDA', 'com paraquedinha');
  cell(540, 1560, 540, 360, ['#e8d7a8', '#dcc893']);
  trainer(820, 1780, 460, { t });
  label(560, 1596, 11, 'TREINO 1943', 'a aposta');
  vline(540, 1560, 1920);
}

window.render = (t) => {
  frame(t);
  g.setTransform(1, 0, 0, 1, 0, 0); g.fillStyle = '#1b1422'; g.fillRect(0, 0, 1080, 1920);
  (PAGE === 2 ? page2 : page1)(t);
};
window.DUR = 2;
await document.fonts.ready;
await Promise.all(['50px "Titan One"', '800 40px "Baloo 2"', '26px "VT323"'].map(f => document.fonts.load(f)));
window.READY = true;
