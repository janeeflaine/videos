// "E se o avião entrar no olho?" — Sci-Fi Sitcom Toon, 1080×1920
import { clamp, lerp, seg, ss, eo, ei, eio, back, hash, TAU } from '/core/lib.js';
import { W, H, INK, init, frame, g, push, pop, translate, rotate, scale, shape, fillOnly, stroke, ell, arc, rr, rect, spline, dot, text, reset, bands, tx } from './toon.js';
import { marlene, juca, olhao, bandeja, jet, teimoso, farolete, radar, dropsonde, gMeter, trainer, magMug, PAL } from './cast.js';
import { build, ORDER } from './story.js';

init(document.getElementById('c'));
const J = async f => { try { const r = await fetch(f); if (r.ok) return await r.json(); } catch (e) { } return null; };
const DURS = await J('voices/dur.json'), WORDS = (await J('voices/words.json')) || {};
const { VO, END, w, SC } = build(DURS, WORDS);
const q = t => Math.floor(t * 12 + 1e-6) / 12;
const endOf = id => VO[id] + DURS[id];

// —— câmera e utilidades ——
function cam(cx, cy, z = 1, shake = 0, t = 0, rot = 0) {
  reset(); translate(W / 2, H / 2);
  if (shake) { const f = Math.floor(t * 24); translate((hash(f) - .5) * shake * 2, (hash(f + 77) - .5) * shake * 2); }
  if (rot) rotate(rot);
  scale(z); translate(-cx, -cy);
}
const scr = () => reset();
function fillScreen(col) { g.setTransform(1, 0, 0, 1, 0, 0); g.fillStyle = col; g.fillRect(0, 0, W, H); }
function bandsScreen(cols, y0 = 0, y1 = H) { reset(); bands(cols, y0, y1, -20, W + 20); }
function arrow(x0, y0, x1, y1, col, lw = 26) {
  const a = Math.atan2(y1 - y0, x1 - x0), L = Math.hypot(x1 - x0, y1 - y0), hd = Math.min(60, L * .45);
  push(); translate(x0, y0); rotate(a);
  shape([[0, -lw / 2], [L - hd, -lw / 2], [L - hd, -lw * 1.3], [L, 0], [L - hd, lw * 1.3], [L - hd, lw / 2], [0, lw / 2]], { fill: col, lw: 6 });
  pop();
}
function sign(str, x, y, { size = 54, fill = '#ffd23f', col = INK, rot = 0, s = 1 } = {}) {
  if (s <= 0) return;
  push(); translate(x, y); rotate(rot); scale(s);
  g.font = `800 ${size}px "Baloo 2"`; const tw = g.measureText(str).width;
  shape(rr(-tw / 2 - 26, -size * .62, tw + 52, size * 1.24, size * .4), { fill, lw: 6 });
  text(str, 0, 2, { font: `800 ${size}px "Baloo 2"`, fill: col });
  pop();
}
const popIn = (t, a, d = .3, o = 1.6) => back(seg(t, a, a + d), o);
function clipPoly(pts, fn) {
  g.save(); const c = pts.map(p => tx(p[0], p[1])); const P = new Path2D(); P.moveTo(...c[0]); c.slice(1).forEach(p => P.lineTo(...p)); P.closePath();
  g.setTransform(1, 0, 0, 1, 0, 0); g.clip(P); fn(); g.restore();
}
function puff(x, y, r, col = '#ffffff', lw = 6, sh = null) {
  const p = []; for (let i = 0; i < 9; i++) { const a = Math.PI + i / 8 * Math.PI; const k = 1 + .18 * Math.sin(i * 2.7); p.push([x + Math.cos(a) * r * 1.3 * k, y + Math.sin(a) * r * .8 * k]); }
  shape(spline([...p, [x + r * 1.2, y + r * .25], [x - r * 1.2, y + r * .25]]), { fill: col, lw, shade: sh ? () => fillOnly(rect(x - r * 2, y - r * .1, r * 4, r), sh, { boil: .2 }) : null });
}
const flashAt = t => { const k = Math.floor(t * 1.3); return hash(k * 7.3) > .8 && (t * 1.3 - k) < .12; };
function rain(t, n = 70, a = .35, col = 'rgba(220,230,255,.6)') {
  scr();
  for (let i = 0; i < n; i++) { const x = (hash(i) * 1400 + t * 300) % 1400 - 160, y = (hash(i * 3.1) * 2100 + t * 1700) % 2100 - 100; stroke([[x, y], [x - 60 * a, y + 70]], 3, { line: col }); }
}
// mar visto de lado
const waveY = (x, t, A = 30) => Math.sin(x * .006 - t * 1.6) * A + Math.sin(x * .013 + t * 2.3) * A * .35;
function sea(t, y0, { A = 30, cols = ['#1f6f86', '#185d72', '#124b5e'], x0 = -900, x1 = 2000, foam = true } = {}) {
  const top = []; for (let x = x0; x <= x1; x += 40) top.push([x, y0 + waveY(x, t, A)]);
  shape([...top, [x1, y0 + 2400], [x0, y0 + 2400]], { fill: cols[0], lw: 7, shade: () => { for (let i = 1; i < cols.length; i++) fillOnly(rect(x0 - 100, y0 + A + i * 140, x1 - x0 + 200, 2400), cols[i], { boil: 0 }); } });
  if (foam) for (let x = x0; x <= x1; x += 110) { const y = y0 + waveY(x, t, A); if (waveY(x + 20, t, A) < waveY(x, t, A) - 4) shape(ell(x, y - 4, 22, 9, 12), { fill: '#e9fbff', lw: 4 }); }
}

// —— céus ——
const DAY = ['#5fb8f2', '#72c3f5', '#86cef7', '#9bd8f9'];
const STORM = ['#2c2f45', '#363a54', '#414663', '#4b5172'];
const SUNSET = ['#5b3f8a', '#a24f86', '#e0677a', '#ff9a6b', '#ffc27a'];
function skyDay(t, drift = 1) {
  bands(DAY, -400, 2300, -1200, 2400);
  for (let i = 0; i < 6; i++) { const x = ((i * 330 - t * 40 * drift) % 1700 + 1700) % 1700 - 300, y = 300 + (i % 3) * 420; puff(x, y, 70 + (i % 2) * 30); }
}

// —— cabine de comando (janelão com o "lá fora" + console) ——
const WS = [[-60, 160], [1140, 160], [1140, 1220], [-60, 1220]];
function cockpit(t, outside, { shake = 0 } = {}) {
  fillScreen('#232a40');
  bands(['#2c3550', '#283049', '#232a40'], -200, 2200, -400, 1500);
  clipPoly(WS, () => outside(t));
  // moldura do para-brisa (colunas)
  stroke([[540, 140], [540, 1230]], 26); stroke([[540, 140], [540, 1230]], 14, { line: '#3a4258' });
  shape([[-80, 120], [1160, 120], [1160, 170], [-80, 190]], { fill: '#3a4258', lw: 7 });
  shape(rect(-80, 1200, 1240, 330), { fill: '#3a4258', lw: 8, shade: () => fillOnly(rect(-80, 1200, 1240, 26), '#4f5975', { boil: .2 }) });
  // instrumentos
  for (const [x, c] of [[150, '#6dff9b'], [930, '#ffb84d']]) { shape(rr(x - 100, 1260, 200, 140, 12), { fill: '#0f1a2a', lw: 6 }); stroke(spline([[x - 76, 1340], [x - 30, 1300 + Math.sin(t * 3 + x) * 20], [x + 14, 1350], [x + 70, 1310]], false), 4, { line: c }); }
  shape(rr(400, 1250, 280, 170, 14), { fill: '#0e1a14', lw: 6, shade: () => { fillOnly(ell(540, 1330, 70, 46, 20), PAL.rGreen, { boil: .5 }); fillOnly(ell(548, 1334, 34, 22, 16), PAL.rYellow, { boil: .5 }); fillOnly(ell(552, 1336, 14, 9, 12), PAL.rRed, { boil: .5 }); } });
  fillOnly(rect(-80, 1530, 1240, 500), '#1a2034', { boil: 0 });
}
// cabine de passageiros (corredor de frente)
function cabin(t, { stormy = 1, shake = 0 } = {}) {
  fillScreen('#e9e4d6');
  // teto com bagageiros
  shape([[-100, -50], [1180, -50], [1180, 360], [900, 420], [180, 420], [-100, 360]], { fill: '#f4f1ea', lw: 7, shade: () => fillOnly(rect(-100, 300, 1280, 140), '#d9d4c5', { boil: .2 }) });
  for (const x of [300, 780]) stroke([[x, 330], [x, 410]], 4, { line: '#b9b2a0' });
  // paredes com janelas (o lá fora é tempestade)
  for (const sx of [-1, 1]) for (let k = 0; k < 3; k++) {
    const x = 540 + sx * (430 - k * 110), y = 640 + k * 30, rw = 70 - k * 14, rh = 100 - k * 18;
    shape(rr(x - rw / 2, y - rh / 2, rw, rh, rw * .45), { fill: stormy ? (flashAt(t + k) ? '#e6e8ff' : '#3a3f5c') : '#ff9a6b', lw: 5 });
  }
  // fundo do corredor
  shape(rect(380, 520, 320, 480), { fill: '#d9d4c5', lw: 6 });
  shape(rr(470, 600, 140, 300, 10), { fill: '#c9c2b0', lw: 5 });
  // carpete
  shape([[380, 1000], [700, 1000], [1180, 2000], [-100, 2000]], { fill: '#5a6aa0', lw: 7, shade: () => { for (let k = 0; k < 6; k++) fillOnly(rect(-200, 1080 + k * 150, 1500, 10), '#4c5b8e', { boil: 0 }); } });
  // poltronas dos dois lados
  for (const sx of [-1, 1]) for (let k = 2; k >= 0; k--) {
    const x = 540 + sx * (310 + k * -70) * (1 + (2 - k) * .25), y = 1000 + (2 - k) * 260, s = .55 + (2 - k) * .3;
    push(); translate(x, y); scale(s * sx, s);
    shape(rr(-60, -360, 200, 380, 40), { fill: '#2f5fb8', lw: 7, shade: () => fillOnly(rect(80, -380, 80, 420), '#26509c', { boil: .2 }) });
    shape(rr(-50, -380, 160, 70, 30), { fill: '#f4f1ea', lw: 6 });
    pop();
  }
}

// —— corte lateral do furacão: paredes de nuvem em volta do olho (o "estádio") ——
function crossSection(t, { cx = 540, eyeW = 520, seaY = 1680, sun = 1, dark = 0, cut = 0 } = {}) {
  bands(dark ? STORM : DAY, -600, seaY + 100, -1400, 2500);
  if (sun) { shape(ell(cx, 320, 90, 90, 30), { fill: '#fff1a8', lw: 7 }); for (let k = 0; k < 10; k++) { const a = k / 10 * TAU + t * .4; stroke([[cx + Math.cos(a) * 120, 320 + Math.sin(a) * 120], [cx + Math.cos(a) * 160, 320 + Math.sin(a) * 160]], 7, { line: '#fff1a8' }); } }
  sea(t, seaY, { A: dark ? 40 : 22 });
  for (const sx of [-1, 1]) {
    const inner = cx + sx * eyeW / 2, outer = cx + sx * 1600;
    const edge = []; for (let k = 0; k <= 18; k++) { const y = seaY - k * 110, open = Math.pow(k / 18, 1.4) * 300, wob = Math.sin(k * 1.7 + t * 1.2 + sx) * 22; edge.push([inner + sx * (open + wob), y]); }
    // a parede abre para cima (estádio): o topo recua para fora
    const wall = [[outer, seaY + 40], ...edge.map(([x, y]) => [x, y]), [outer, -800]];
    shape(spline(wall, true, 6), {
      fill: '#c6cedb', lw: 8, shade: () => {
        for (let k = 0; k < 7; k++) { const y = seaY - 120 - k * 230 + (t * 40 * (k % 2 ? 1 : -1)) % 60; stroke(spline([[inner - sx * 40, y], [inner + sx * 200, y + 30], [inner + sx * 520, y + 10], [inner + sx * 900, y + 50]], false), 10, { line: '#9aa5b8' }); }
        fillOnly(rect(sx > 0 ? inner + 260 : inner - 1900, -900, 1640, 3200), '#a9b3c4', { boil: .2 });
        if (cut > 0 && sx > 0) { fillOnly(ell(inner + sx * 160, seaY - 760, 160 * cut, 120 * cut, 24), 'rgba(255,241,168,.55)', { boil: .5 }); }
      }
    });
  }
}

// ============ CENAS ============
const MAR = o => marlene({ s: 1.2, look: [.4, -.2], holdR: 'mug', ...o });
const JUC = o => juca({ s: 1.18, ...o });
const outsideHorizon = (ox = 0, os = .5, blinkT = -9, lookOl = [0, 0]) => t => {
  skyDay(t);
  fillOnly(rect(-200, 1000, 1500, 400), '#2a7fb0', { boil: 0 });
  olhao({ x: 760 + ox, y: 820, s: os, t, blink: Math.max(0, 1 - Math.abs(t - blinkT) * 7), look: lookOl });
};

// 01 — e se entrar no olho?
function s01(t) {
  const tOl = w('01', 'olho'), k = ss(seg(t, 0, endOf('01')));
  cam(540, lerp(960, 900, k), lerp(1, 1.06, k), 0, t);
  cockpit(t, outsideHorizon(0, lerp(.45, .58, k), tOl + .2, [-.3, .2]));
  MAR({ x: 280, y: 1900, t, look: [.5, -.3] });
  JUC({ x: 800, y: 1910, t, look: [-.1, -.6], armR: { h: [lerp(10, 40, popIn(t, .6)), lerp(-60, -180, popIn(t, .6))], bend: 20 }, mouth: { o: .5, sm: .6 } });
  if (t > tOl - .1) { scr(); sign('?', 760, 560, { size: 90, s: popIn(t, tOl - .1), rot: .1 }); }
}
// 02 — o Juca acha ótima ideia (selfie); Marlene toma café
function s02(t) {
  const tOt = w('02', 'otima'), tAz = w('02', 'azul'), tFo = w('02', 'foto');
  cam(540, 960, 1.04, 0, t);
  cockpit(t, outsideHorizon(0, .58, -9, [.4, .1]));
  const sip = ss(seg(t, VO['02'] + .5, VO['02'] + 1.1)) - ss(seg(t, VO['02'] + 2.6, VO['02'] + 3.2));
  MAR({ x: 280, y: 1900, t, armR: { h: [lerp(60, 20, sip), lerp(120, -40, sip)], bend: 44 }, look: [.3, -.1] });
  JUC({ x: 800, y: 1910, t, holdR: 'selfie', stick: [-40, -170], look: [.5, -.5], mouth: { o: .7, sm: 1 }, armR: { h: [60, -160], bend: 30 }, bob: Math.sin(t * 9) * 6 * (t < tFo ? 1 : 0) });
  scr();
  if (t > tOt - .1) sign('ATALHO!', 800, 330, { size: 70, s: popIn(t, tOt - .1), rot: .06 });
  if (t > tAz - .1) sign('céu azul', 260, 480, { size: 46, fill: '#8cd9ff', s: popIn(t, tAz - .1), rot: -.08 });
  const fl = 1 - seg(t, tFo, tFo + .35);
  if (t > tFo && fl > 0) fillOnly(rect(0, 0, W, H), `rgba(255,255,255,${.85 * fl})`, { boil: 0 });
}
// 03 — o olho é calmo; o problema é a parede
function s03(t) {
  const tOl = w('03', 'olho'), tPr = w('03', 'problema'), tPa = w('03', 'parede'), tFo = w('03', 'fortes');
  if (t < tPr - .1) {
    // vista de cima: o Olhão sobre o mar; o olho tem 30–60 km
    cam(540, 960, lerp(1, 1.12, ss(seg(t, VO['03'], tPr))), 0, t);
    fillScreen('#1a5c7a'); bands(['#1a5c7a', '#175370', '#144a64'], 0, 1920, -200, 1300);
    olhao({ x: 540, y: 960, s: 1.45, t, look: [0, 0] });
    scr();
    if (t > tOl - .1) {
      const a = popIn(t, tOl - .1); push(); translate(540, 960); scale(a);
      stroke([[-130, 220], [130, 220]], 8, { line: '#ffd23f' }); stroke([[-130, 200], [-130, 240]], 8, { line: '#ffd23f' }); stroke([[130, 200], [130, 240]], 8, { line: '#ffd23f' }); pop();
      sign('OLHO: 30–60 km', 540, 1260, { size: 54, s: a });
      sign('calmo', 540, 520, { size: 50, fill: '#8cd9ff', s: popIn(t, tOl + .5) });
    }
    return;
  }
  // corte lateral: as paredes
  cam(540, 960, 1, 0, t);
  crossSection(t, { eyeW: 460, dark: 0 });
  scr();
  if (t > tFo - .2) for (let k = 0; k < 5; k++) { const y = 650 + k * 200, ph = (t * 1.6 + k * .3) % 1; arrow(lerp(-80, 260, ph), y, lerp(-80, 260, ph) + 120, y - 20, '#ffffff', 14); arrow(lerp(1160, 820, ph), y + 60, lerp(1160, 820, ph) - 120, y + 40, '#ffffff', 14); }
  if (t > tPa - .1) {
    const a = popIn(t, tPa - .1);
    sign('PAREDE', 160, 900, { size: 54, fill: '#ff8a7a', s: a, rot: -.08 }); sign('PAREDE', 920, 900, { size: 54, fill: '#ff8a7a', s: a, rot: .08 });
    arrow(250, 1000, 300, 1100, '#ff8a7a', 18); arrow(830, 1000, 780, 1100, '#ff8a7a', 18);
  }
}
// 04 — dentro da parede: sobe-e-desce; tudo voa
function s04(t) {
  const tSo = w('04', 'sobem'), tDe = w('04', 'descem'), tCh = w('04', 'chacoalhado'), tSol = w('04', 'solto');
  if (t < tSol - .5) {
    const bob = Math.sin(t * 5.2) * 120 * seg(t, tCh - .5, tCh) + Math.sin(t * 9) * 20;
    cam(540, 960, 1, 8, t);
    bands(STORM, -200, 2200, -400, 1500);
    if (flashAt(t)) { fillScreen('#6a6f90'); }
    for (let i = 0; i < 8; i++) { const x = ((i * 260 - t * 500) % 1800 + 1800) % 1800 - 300, y = 200 + (i % 4) * 430; puff(x, y, 120, '#5a607e', 6); }
    // correntes: sobe (verde) e desce (vermelho) lado a lado
    const ph = (t * 1.2) % 1;
    if (t > tSo - .1) for (const x of [240, 420]) arrow(x, lerp(1700, 1200, ph), x, lerp(1700, 1200, ph) - 220, '#6dff9b', 30);
    if (t > tDe - .1) for (const x of [660, 840]) arrow(x, lerp(300, 800, ph), x, lerp(300, 800, ph) + 220, '#ff6a5a', 30);
    jet(540, 960 + bob, 820, { t, pitch: Math.sin(t * 5.2 + .6) * .12, flex: Math.sin(t * 10) * .4 });
    rain(t, 90, .5);
    return;
  }
  // cabine de passageiros: Bandeja perde tudo; a caneca da Marlene não se mexe
  const sh = 9;
  cam(540, 960, 1, sh, t);
  cabin(t);
  const sp = ss(seg(t, tSol - .4, tSol + .8));
  bandeja({ x: 560 + Math.sin(t * 7) * 30, y: 1700, s: 1.25, t, spill: sp, mood: sp > .2 ? 1 : 0, bob: Math.sin(t * 11) * 14 });
  // a caneca magnética no apoio de braço, firme
  magMug(180, 1520, 0, { t });
  if (t > tSol) { scr(); sign('PROJÉTIL!', 540, 330, { size: 64, fill: '#ff8a7a', s: popIn(t, tSol), rot: -.05 }); }
}
// 05 — a estrutura aguenta; o estômago, nem tanto
function s05(t) {
  const tCi = w('05', 'cinquenta'), tCa = w('05', 'casco'), tEs = w('05', 'estomago');
  if (t < tEs - .3) {
    cam(540, 960, 1, 0, t);
    fillScreen('#1e3b6e');
    scr(); for (let x = 0; x <= W; x += 60) stroke([[x, 0], [x, H]], 2, { line: 'rgba(255,255,255,.07)' });
    for (let y = 0; y <= H; y += 60) stroke([[0, y], [W, y]], 2, { line: 'rgba(255,255,255,.07)' });
    const gv = 1 + Math.sin(t * 4) * 1.1;
    gMeter(540, 470, 190, { g: gv, t });
    jet(560, 1220, 900, { t, flex: Math.sin(t * 4) * .5, pitch: -.02 });
    // régua de folga: limite normal → +50%
    if (t > tCi - .3) {
      const a = popIn(t, tCi - .3); push(); translate(540, 1560); scale(a);
      shape(rr(-420, -40, 840, 80, 16), { fill: '#f4f1ea', lw: 6, shade: () => { fillOnly(rect(-420, -40, 560, 80), '#6dff9b', { boil: .2 }); fillOnly(rect(140, -40, 280, 80), '#ffd23f', { boil: .2 }); } });
      text('limite do voo', -140, 2, { font: '800 36px "Baloo 2"', fill: INK }); text('+50%', 280, 2, { font: '800 40px "Baloo 2"', fill: INK });
      pop();
      sign('+50% DE FOLGA', 540, 1700, { size: 50, s: popIn(t, tCi + .3) });
    }
    if (t > tCa - .1) { scr(); sign('CASCO FORTE ✓', 540, 880, { size: 52, fill: '#6dff9b', s: popIn(t, tCa - .1), rot: -.04 }); }
    return;
  }
  // close no Juca, verde, com o saquinho
  cam(540, 1120, 1.5, 3, t);
  cabin(t, { stormy: 1 });
  JUC({ x: 540, y: 1980, t, nerv: 1.4, sweat: t, eyeS: 1.15, look: [0, .2], brow: 1, mouth: { o: .25, sm: -1, skew: .4 }, armL: { h: [60, 40], bend: -30, fist: true }, armR: { h: [-60, 40], bend: 30, fist: true } });
  scr(); fillOnly(rect(0, 0, W, H), 'rgba(110,200,90,.16)', { boil: 0 });
  // saquinho
  push(); translate(540, 1500); rotate(Math.sin(t * 6) * .05);
  shape(spline([[-80, -80], [80, -80], [96, 120], [-96, 120]]), { fill: '#f4f1ea', lw: 7, shade: () => fillOnly(rect(-100, -88, 200, 26), '#d9d4c5', { boil: .2 }) });
  text('ENJOO', 0, 30, { font: '800 40px "Baloo 2"', fill: '#2f5fb8' }); pop();
}
// 06 — 1943: aposta, aviãozinho de treino (sépia)
function s06(t) {
  const tAp = w('06', 'aposta'), tTr = w('06', 'treino');
  cam(540, 960, 1, 2, t);
  bands(['#c9b48a', '#bfa77c', '#b49a6f', '#a98d62'], -200, 2200, -400, 1500);
  // nuvens escuras à direita (o furacão)
  for (let i = 0; i < 6; i++) puff(860 + (i % 2) * 140 + hash(i) * 60, 300 + i * 260, 130 + hash(i * 2.7) * 90, i % 2 ? '#8c7a5c' : '#7d6c50', 6);
  const k = seg(t, VO['06'] - .25, endOf('06') + .3);
  trainer(lerp(-300, 760, ss(k)), 1000 + Math.sin(t * 7) * 30 * k, 620, { t });
  scr();
  sign('1943', 540, 260, { size: 80, fill: '#f2e3b8', s: popIn(t, VO['06'] + .1) });
  if (t > tTr - .1) sign('avião de TREINO', 330, 1450, { size: 46, fill: '#f2e3b8', s: popIn(t, tTr - .1), rot: -.06 });
  if (t > tAp - .1) sign('APOSTA!', 700, 1620, { size: 76, fill: '#ffd23f', s: popIn(t, tAp - .1, .35, 2.2), rot: .08 });
  // grão e vinheta de filme antigo
  for (let i = 0; i < 40; i++) dot(hash(i + Math.floor(t * 12) * 3.1) * W, hash(i * 2.3 + Math.floor(t * 12)) * H, 2.4, 'rgba(60,40,20,.35)');
  if (hash(Math.floor(t * 12)) > .6) stroke([[hash(Math.floor(t * 12) * 1.7) * W, 0], [hash(Math.floor(t * 12) * 1.7) * W + 10, H]], 3, { line: 'rgba(60,40,20,.3)' });
}
// 07 — os caçadores de furacão
function s07(t) {
  const tTr = w('07', 'tres'), tSo = w('07', 'sondas'), tBl = w('07', 'blindados'), tSe = w('07', 'serie');
  cam(540, 960, 1, 2, t);
  bands(['#6b7896', '#7a87a4', '#8a96b2', '#9aa5bf'], -200, 2200, -400, 1500);
  for (let i = 0; i < 6; i++) { const x = ((i * 300 - t * 160) % 1800 + 1800) % 1800 - 300; puff(x, 1700 + (i % 2) * 80, 140, '#c6cedb', 6, '#a9b3c4'); }
  // parede do furacão à direita
  for (let i = 0; i < 7; i++) puff(1040 + (i % 2) * 60, 180 + i * 230, 200, '#5a607e', 6);
  const k = ss(seg(t, VO['07'] - .25, VO['07'] + 2.5));
  const sonde = t > tSo ? seg(t, tSo, tSo + 2.2) : 0;
  teimoso(lerp(-200, 470, k), 820 + Math.sin(t * 2) * 14, 860, { t, look: [.7, .1], sonde, mood: 0 });
  scr();
  if (t > tTr - .1) { sign('3.000 m', 220, 300, { size: 60, s: popIn(t, tTr - .1) }); stroke([[220, 350], [220, 760]], 6, { line: '#ffd23f' }); }
  if (t > tSo - .1) sign('SONDA', 380, 1500, { size: 46, fill: '#ff8a2a', s: popIn(t, tSo - .1) });
  if (t > tBl - .1) {
    const a = popIn(t, tBl - .1);
    sign('BLINDADO?', 700, 1280, { size: 58, fill: '#ff8a7a', s: a, rot: -.05 });
    if (t > tBl + .4) { push(); translate(700, 1280); scale(popIn(t, tBl + .4)); stroke([[-200, -50], [200, 50]], 14, { line: '#e8392b' }); pop(); }
  }
  if (t > tSe - .1) sign('QUASE DE SÉRIE', 600, 1420, { size: 50, fill: '#6dff9b', s: popIn(t, tSe - .1), rot: .04 });
}
// 08 — o caso Hugo, 1989
function altimeter(x, y, m, s = 1, warn = false) {
  push(); translate(x, y); scale(s);
  shape(rr(-170, -70, 340, 140, 20), { fill: '#0f1a2a', lw: 7 });
  text(`${Math.round(m)} m`, 0, 6, { font: '76px "VT323"', fill: warn ? '#ff6a5a' : '#6dff9b' });
  text('ALTITUDE', 0, -50, { font: '26px "VT323"', fill: '#8cc8ff' });
  pop();
}
function s08(t) {
  const tHu = w('08', 'hugo'), tBa = w('08', 'baixo'), tQu = w('08', 'quatrocentos'), tFo = w('08', 'fogo'), tDe = w('08', 'despencou'), tDu = w('08', 'duzentos');
  const tCh = w('08', 'chegaram'), tPr = w('08', 'presos'), tOu = w('08', 'outro'), tFr = w('08', 'fraco'), tNi = w('08', 'ninguem'), tRe = w('08', 'regra'), tMi = w('08', 'mil');
  if (t < tCh - .2) {
    // tempestade baixa sobre o mar
    const fall = ss(seg(t, tDe, tDe + 1.6)), alt = t < tDe ? 450 : lerp(450, 240, fall);
    const yPl = lerp(900, 1180, fall) + Math.sin(t * 6) * 20;
    cam(540, 960, 1, t > tFo ? 10 : 5, t);
    bands(STORM, -200, 2200, -400, 1500);
    if (flashAt(t)) fillScreen('#6a6f90');
    for (let i = 0; i < 7; i++) { const x = ((i * 280 - t * 420) % 1800 + 1800) % 1800 - 300; puff(x, 220 + (i % 3) * 200, 140, '#4b5172', 6); }
    sea(t, 1480, { A: 60, cols: ['#1e5a6e', '#174a5c', '#103a4a'] });
    teimoso(500, yPl, 760, { t, pitch: t > tDe ? lerp(0, .22, fall) * (1 - seg(t, tDe + 1.6, tDe + 2.4)) : Math.sin(t * 4) * .05, fire: t > tFo ? 1 : 0, mood: t > tFo ? 1 : 0, look: t > tFo ? [-.6, 0] : [.6, 0] });
    rain(t, 100, .6);
    scr();
    sign('HUGO · 1989', 540, 230, { size: 66, fill: '#ff8a7a', s: popIn(t, VO['08'] + .05) });
    if (t > tBa - .1) altimeter(820, 420, alt, popIn(t, tBa - .1), t > tFo);
    if (t > tFo - .1 && t < tDe) sign('MOTOR EM CHAMAS!', 540, 1700, { size: 50, fill: '#ff8a2a', s: popIn(t, tFo - .1), rot: -.05 });
    if (t > tDu - .2) sign('240 m das ondas', 540, 1760, { size: 50, fill: '#ff6a5a', s: popIn(t, tDu - .2), rot: .04 });
    if (t > tFo && t < tDe + 2) { const on = Math.floor(t * 4) % 2; if (on) fillOnly(rect(0, 0, W, H), 'rgba(255,60,40,.12)', { boil: 0 }); }
    return;
  }
  // no olho: presos, dando voltas; outro avião acha o ponto fraco
  cam(540, 960, 1, 0, t);
  const cut = t > tFr - .2 ? ss(seg(t, tFr - .2, tFr + .6)) : 0;
  crossSection(t, { eyeW: 600, dark: 0, cut, sun: 1 });
  const out = t > tNi - .4 ? ss(seg(t, tNi - .4, tNi + 2.4)) : 0;
  // Teimoso em voltas (elipse vista de lado: vai e volta, encolhe ao fundo)
  const ang = (t - tCh) * 1.6, depth = (Math.sin(ang) + 1) / 2;
  let px = 540 + Math.cos(ang) * 190, py = 1180 + Math.sin(ang) * 40, s = lerp(.3, .44, depth), face = -Math.sin(ang) >= 0 ? 1 : -1;
  if (out > 0) { px = lerp(px, 1300, out); py = lerp(py, 900, out); face = 1; s = lerp(s, .5, out); }
  const drawT = () => { push(); translate(px, py); scale(face, 1); teimoso(0, 0, 1000 * s, { t, fire: 0, mood: out > 0 ? 0 : 1, look: [.6, 0] }); pop(); };
  // Farolete sonda a parede da direita com o farol
  const fx = t > tOu - .2 ? lerp(-400, 640, ss(seg(t, tOu - .2, tOu + 1.6))) : -999;
  const fdrawn = () => { if (fx > -900) { const fo = out > 0 ? lerp(fx, 1400, out) : fx; farolete(fo, 700, 420, { t, beam: t > tOu + .8 ? 1 : 0, look: [.7, .2] }); } };
  if (depth < .5) { drawT(); fdrawn(); } else { fdrawn(); drawT(); }
  scr();
  if (t > tPr - .1 && out <= 0) { const n = Math.max(1, Math.floor((t - tCh) * 1.6 / TAU) + 1); sign(`volta ${n}`, 540, 1560, { size: 50, s: popIn(t, tPr - .1) }); }
  if (t > tFr - .1 && out <= 0) sign('PONTO FRACO!', 820, 470, { size: 50, fill: '#fff1a8', s: popIn(t, tFr - .1), rot: .05 });
  if (t > tNi - .1) sign('NINGUÉM SE FERIU', 540, 1560, { size: 52, fill: '#6dff9b', s: popIn(t, tNi - .1) });
  if (t > tRe - .1) { sign('REGRA:', 540, 230, { size: 48, s: popIn(t, tRe - .1) }); }
  if (t > tMi - .1) sign('entrar acima de 1.500 m', 540, 330, { size: 52, fill: '#ffd23f', s: popIn(t, tMi - .1) });
}
// 09 — o estádio de nuvens; para sair, a parede de novo
function s09(t) {
  const tLi = w('09', 'lindo'), tEs = w('09', 'estadio'), tDe = w('09', 'detalhe'), tPa = w('09', 'parede');
  const k = ss(seg(t, VO['09'] - .25, tDe));
  cam(540, lerp(1100, 900, k), lerp(1.25, 1, k), 0, t);
  crossSection(t, { eyeW: 640, sun: 1 });
  const look = t > tDe ? [1, 0] : [.3, -.6];
  teimoso(540 + Math.sin(t * .8) * 60, 1180, 380, { t, look, mood: t > tDe + .3 ? 1 : 0 });
  scr();
  if (t > tEs - .1) sign('ESTÁDIO DE NUVENS', 540, 300, { size: 56, s: popIn(t, tEs - .1) });
  if (t > tDe - .1) sign('…para sair?', 540, 1520, { size: 52, fill: '#ff8a7a', s: popIn(t, tDe - .1) });
  if (t > tPa - .1) { arrow(760, 1180, 980, 1180, '#ff8a7a', 30); sign('PAREDE DE NOVO', 760, 1040, { size: 46, fill: '#ff8a7a', s: popIn(t, tPa - .1), rot: .05 }); }
}
// 10 — o avião de passageiros nunca entra: radar e desvio
function s10(t) {
  const tRa = w('10', 'radar'), tLo = w('10', 'longe');
  if (t < tRa - .2) {
    cam(540, 960, 1, 0, t);
    cockpit(t, outsideHorizon(0, .6, -9, [.3, .2]));
    MAR({ x: 280, y: 1900, t, look: [.5, -.3] });
    JUC({ x: 800, y: 1910, t, holdR: 'selfie', stick: [-40, -170], look: [-.6, -.2], mouth: { o: .3, sm: -.4 }, armR: { h: [60, -160], bend: 30 } });
    scr(); sign('NUNCA ENTRA', 540, 300, { size: 60, fill: '#ff8a7a', s: popIn(t, VO['10'] + .3) });
    return;
  }
  const k = ss(seg(t, tLo - .6, tLo + 1));
  if (t < tLo - .2) {
    cam(540, 960, 1, 0, t);
    fillScreen('#232a40');
    radar(540, 1000, 300, { t, red: 1, offset: lerp(0, 1.5, k) });
    scr(); sign('RADAR', 540, 260, { size: 60, fill: '#6dff9b', s: popIn(t, tRa - .2) });
    return;
  }
  // a volta: vista de cima, o jato contorna o Olhão
  cam(540, 960, 1, 0, t);
  fillScreen('#1a5c7a'); bands(['#1a5c7a', '#175370', '#144a64'], 0, 1920, -200, 1300);
  olhao({ x: 380, y: 900, s: 1.05, t, look: [.6, .3] });
  const path = u => { const a = lerp(Math.PI * .75, -Math.PI * .75, u); return [380 + Math.cos(a) * 560, 900 + Math.sin(a) * 640 + 0]; };
  const u = seg(t, tLo - .2, endOf('10') + .4);
  const pts = []; for (let i = 0; i <= 30; i++) pts.push(path(i / 30 * u));
  if (pts.length > 1) stroke(pts, 6, { line: 'rgba(255,255,255,.8)' });
  const [x1, y1] = path(u), [x0, y0] = path(Math.max(0, u - .02));
  // jatinho visto de cima
  push(); translate(x1, y1); rotate(Math.atan2(y1 - y0, x1 - x0));
  shape(spline([[-60, -10], [50, -12], [72, 0], [50, 12], [-60, 10]]), { fill: PAL.jetW, lw: 5 });
  shape([[0, -10], [-24, -74], [-40, -74], [-26, -10]], { fill: PAL.jetW, lw: 4 }); shape([[0, 10], [-24, 74], [-40, 74], [-26, 10]], { fill: PAL.jetW, lw: 4 });
  shape([[-50, -6], [-66, -30], [-74, -30], [-66, -6]], { fill: PAL.teal, lw: 3 }); shape([[-50, 6], [-66, 30], [-74, 30], [-66, 6]], { fill: PAL.teal, lw: 3 });
  pop();
  scr(); sign('PASSA LONGE', 760, 1700, { size: 56, fill: '#6dff9b', s: popIn(t, tLo - .2) });
}
// 11 — resposta: o trabalho pronto (pouso ao pôr do sol + previsão na TV)
function s11(t) {
  const tAg = w('11', 'aguentaria'), tAs = w('11', 'assustadoras'), tVo = w('11', 'volta', 1), tCa = w('11', 'cacador'), tPr = w('11', 'previsao'), tCi = w('11', 'cidade');
  if (t < tCa - .3) {
    // pouso: pista horizontal, o jato desce da esquerda para a direita
    cam(540, 960, 1, 0, t);
    bands(SUNSET, -200, 1500, -400, 1500);
    shape(ell(780, 1120, 150, 150, 40), { fill: '#ffe08a', lw: 7 });
    fillOnly(rect(-200, 1300, 1500, 800), '#4a5a3a', { boil: 0 });
    shape([[-200, 1380], [1300, 1380], [1300, 1520], [-200, 1520]], { fill: '#3a3f4a', lw: 7 });
    for (let x = -200; x < 1300; x += 160) fillOnly(rect(x + ((t * 400) % 160) * 0, 1444, 80, 12), '#f4f1ea', { boil: 0 });
    for (let x = -150; x < 1300; x += 120) dot(x, 1386, 6, '#ffd23f');
    const u = ss(seg(t, VO['11'] - .25, tAs));
    const jx = lerp(-200, 560, u), jy = lerp(900, 1330, ss(seg(u, 0, .9)));
    jet(jx, jy, 620, { t, pitch: lerp(.12, -.03, u), gear: 1 });
    if (u > .95) for (let k = 0; k < 3; k++) { const ph = (t * 2 + k / 3) % 1; fillOnly(ell(jx - 120 - ph * 120, 1370 - ph * 30, 20 + ph * 30, 12 + ph * 16, 14), `rgba(230,230,240,${.6 * (1 - ph)})`, { boil: .4 }); }
    scr();
    sign('RESPOSTA:', 540, 250, { size: 70, s: popIn(t, VO['11'] + .05) });
    if (t > tAg - .1) sign('o avião aguentaria ✓', 540, 380, { size: 50, fill: '#6dff9b', s: popIn(t, tAg - .1) });
    if (t > tAs - .1) sign('mas: susto na ida E na volta', 540, 500, { size: 44, fill: '#ff8a7a', s: popIn(t, tAs - .1) });
    if (t > tVo - .1) sign('então ele dá a volta', 540, 620, { size: 46, fill: '#ffd23f', s: popIn(t, tVo - .1) });
    return;
  }
  // a cidade ao pôr do sol: o caçador volta, a previsão na TV
  cam(540, 960, 1, 0, t);
  bands(SUNSET, -200, 1300, -400, 1500);
  push(); translate(lerp(1300, 640, ss(seg(t, tCa - .3, tCa + 2))), 380); scale(-1, 1); teimoso(0, 0, 520, { t, look: [.2, .4] }); pop();   // voa para a esquerda: nariz à esquerda
  // prédios
  for (let i = 0; i < 7; i++) { const x = -40 + i * 170, h = 300 + hash(i * 3.3) * 260; shape(rect(x, 1300 - h, 150, h + 700), { fill: ['#3a2a52', '#46325f', '#33254a'][i % 3], lw: 6, shade: () => { for (let r = 0; r < 6; r++) for (let c = 0; c < 3; c++) if (hash(i * 9 + r * 3 + c) > .4) fillOnly(rect(x + 18 + c * 44, 1300 - h + 30 + r * 60, 26, 30), '#ffd27a', { boil: 0 }); } }); }
  // a TV com a previsão
  const a = popIn(t, tPr - .3);
  if (a > 0) {
    push(); translate(540, 1500); scale(a);
    shape(rr(-330, -230, 660, 440, 30), { fill: '#2b2d33', lw: 8 });
    shape(rr(-300, -200, 600, 360, 16), { fill: '#7fd0e6', lw: 6, shade: () => { fillOnly(spline([[-300, 20], [-120, -20], [40, 30], [300, -10], [300, 200], [-300, 200]]), '#6db36a', { boil: .3 }); } });
    olhao({ x: 120, y: -60, s: .26, t, bolt: false });
    arrow(60, 0, -60, 80, '#e8392b', 18);
    text('PREVISÃO', -170, -150, { font: '800 44px "Baloo 2"', fill: '#ffffff', outlineW: 8 });
    for (const sx of [-1, 1]) stroke([[sx * 120, 210], [sx * 160, 260]], 8);
    pop();
  }
  scr();
  if (t > tCi - .1) sign('CIDADE PROTEGIDA', 540, 820, { size: 54, fill: '#6dff9b', s: popIn(t, tCi - .1) });
}
// 12 — chamada
function s12(t) {
  const tCur = w('12', 'curioso');
  cam(540, 960, 1, 0, t);
  bandsScreen(['#24324e', '#283858', '#2c3d62', '#33466e']);
  olhao({ x: 540, y: 880, s: 1.2, t, blink: t > tCur + .3 && t < tCur + .55 ? 1 : 0, look: [0, .2], bolt: false });
  MAR({ x: 240, y: 1990, t, s: .75, look: [.4, -.5] });
  JUC({ x: 840, y: 2000, t, s: .72, look: [-.4, -.6], mouth: { o: .6, sm: 1 }, armR: { h: [40, -150], bend: 20 } });
  bandeja({ x: 540, y: 1940, s: .6, t, mood: 0 });
  const a = back(seg(q(t), VO['12'] - .1, VO['12'] + .3), 1.6);
  if (a > 0) text('se gostou, comenta:', 540, 260, { font: `800 ${Math.round(70 * a)}px "Baloo 2"`, fill: '#ffffff', outlineW: 12 });
  const b = back(seg(q(t), tCur - .1, tCur + .25), 1.8);
  if (b > 0) {
    push(); translate(540, 880); rotate(-.05 + Math.sin(q(t) * 3) * .015); scale(b);
    text('CURIOSO', 0, -80, { font: '150px "Titan One"', fill: '#ffd23f', outlineW: 26 });
    text('SOH', 0, 110, { font: '210px "Titan One"', fill: '#8cd9ff', outlineW: 30 });
    pop();
  }
}

const FN = { '01': s01, '02': s02, '03': s03, '04': s04, '05': s05, '06': s06, '07': s07, '08': s08, '09': s09, '10': s10, '11': s11, '12': s12 };
window.DUR = END;
window.render = (t) => {
  frame(t);
  fillScreen('#000');
  const sc = SC.find(([, a, b]) => t >= a && t < b) || SC[SC.length - 1];
  FN[sc[0]](t, t - sc[1], sc[2] - sc[1]);
};

// —— eventos de som ——
const EV = [];
const ev = (type, t, o = {}) => EV.push({ type, t: +t.toFixed(3), ...o });
for (const id of ORDER) ev('vo', VO[id], { id });
ev('cue', 0, { name: 'lounge', t0: 0, t1: VO['04'] - .25 });
ev('cue', VO['04'] - .25, { name: 'theremin', t0: VO['04'] - .25, t1: VO['06'] - .25 });
ev('cue', VO['06'] - .25, { name: 'sepia', t0: VO['06'] - .25, t1: VO['07'] - .25 });
ev('cue', VO['07'] - .25, { name: 'hunt', t0: VO['07'] - .25, t1: w('08', 'chegaram') - .2 });
ev('cue', w('08', 'chegaram') - .2, { name: 'calm', t0: w('08', 'chegaram') - .2, t1: VO['10'] - .25 });
ev('cue', VO['10'] - .25, { name: 'lounge', t0: VO['10'] - .25, t1: VO['12'] - .25 });
ev('cue', VO['12'] - .25, { name: 'final', t0: VO['12'] - .25, t1: END });
// trovões onde há relâmpago e tempestade em cena
for (let k = 0; k < END * 1.3; k++) { const t = k / 1.3; if (hash(k * 7.3) > .8) { const sc = SC.find(([, a, b]) => t >= a && t < b); if (sc && (sc[0] === '04' || (sc[0] === '08' && t < w('08', 'chegaram') - .2))) ev('thunder', t + .15); } }
ev('blink', w('01', 'olho') + .2); ev('pop', w('01', 'olho') - .1);
ev('pop', w('02', 'otima') - .1); ev('pop', w('02', 'azul') - .1); ev('sip', VO['02'] + .9); ev('shutter', w('02', 'foto'));
ev('pop', w('03', 'olho') - .1); ev('pop', w('03', 'olho') + .5); ev('whoosh', w('03', 'problema') - .2); ev('pop', w('03', 'parede') - .1); ev('wind', w('03', 'fortes') - .2, { d: 2.5 });
ev('rumble', VO['04'] - .25, { d: endOf('04') - VO['04'] + .5 }); ev('whoosh', w('04', 'sobem')); ev('whoosh', w('04', 'descem'));
ev('clatter', w('04', 'solto') - .2); ev('clink', w('04', 'solto') + .4); ev('pop', w('04', 'solto'));
ev('creak', VO['05'] + .6); ev('boing', VO['05'] + 1.5); ev('pop', w('05', 'cinquenta') - .3); ev('pop', w('05', 'cinquenta') + .3); ev('ding', w('05', 'casco') - .1); ev('gulp', w('05', 'estomago') + .3);
ev('prop', VO['06'] - .25, { d: endOf('06') - VO['06'] + .4 }); ev('pop', w('06', 'treino') - .1); ev('slam', w('06', 'aposta') - .1);
ev('drone', VO['07'] - .25, { d: w('08', 'chegaram') - VO['07'] }); ev('pop', w('07', 'tres') - .1); ev('whistle', w('07', 'sondas')); ev('pop', w('07', 'blindados') - .1); ev('scratch', w('07', 'blindados') + .4); ev('ding', w('07', 'serie') - .1);
ev('pop', VO['08'] + .05); ev('beep', w('08', 'baixo') - .1); ev('alarm', w('08', 'fogo') - .1, { d: 2.4 }); ev('fire', w('08', 'fogo')); ev('dive', w('08', 'despencou')); ev('pop', w('08', 'duzentos') - .2);
ev('whoosh', w('08', 'chegaram') - .2); ev('pop', w('08', 'presos') - .1); ev('portalWhoosh', w('08', 'outro')); ev('ding', w('08', 'fraco') - .1); ev('whoosh', w('08', 'ninguem')); ev('cheer', w('08', 'ninguem') + .2); ev('stamp', w('08', 'regra') - .1); ev('pop', w('08', 'mil') - .1);
ev('pop', w('09', 'estadio') - .1); ev('gulp', w('09', 'detalhe') + .3); ev('pop', w('09', 'parede') - .1);
ev('pop', VO['10'] + .3); ev('radar', w('10', 'radar') - .2, { d: 2 }); ev('whoosh', w('10', 'longe') - .2);
ev('pop', VO['11'] + .05); ev('ding', w('11', 'aguentaria') - .1); ev('pop', w('11', 'assustadoras') - .1); ev('pop', w('11', 'volta', 1) - .1);
ev('tires', VO['11'] - .25 + (w('11', 'assustadoras') - VO['11'] + .25) * .93); ev('chime', w('11', 'cacador') - .3); ev('pop', w('11', 'previsao') - .3); ev('ding', w('11', 'cidade') - .1);
ev('blink', w('12', 'curioso') + .3); ev('titleHit', w('12', 'curioso'));
const AMBW = { '01': 'cockpit', '02': 'cockpit', '03': 'wind', '04': 'storm', '05': 'cabin', '06': 'old', '07': 'wind', '08': 'storm', '09': 'wind', '10': 'cockpit', '11': 'evening', '12': 'none' };
for (const [id, a, b] of SC) ev('amb', a, { d: +(b - a).toFixed(3), w: AMBW[id] });
EV.sort((a, b) => a.t - b.t);
window.EV = EV;

await document.fonts.ready;
await Promise.all(['150px "Titan One"', '800 40px "Baloo 2"', '28px "VT323"'].map(f => document.fonts.load(f)));
window.READY = true;
