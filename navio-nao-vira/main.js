// "Por que ele não vira?" — Sci-Fi Sitcom Toon, 1080×1920
import { clamp, lerp, seg, ss, eo, ei, eio, back, hash, TAU } from '/core/lib.js';
import { W, H, INK, init, frame, g, push, pop, translate, rotate, scale, shape, fillOnly, stroke, ell, arc, rr, rect, spline, dot, text, noodle, reset, bands, tx } from './toon.js';
import { dalva, tico, ondina, lunetaX, xWindow, ship, hullSection, joaoBobo, twistlock, lashingBar, PAL } from './cast.js';
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
function swirlWipe(t, tc, half = .28) {
  const d = Math.abs(t - tc); if (d > half) return;
  const k = 1 - d / half, r = k * 1300;
  scr(); push(); translate(W / 2, H / 2);
  fillOnly(ell(0, 0, r, r, 64), PAL.glow, { boil: .6 });
  for (let i = 0; i < 5; i++) { push(); rotate(t * 7 + i * TAU / 5); stroke(spline([[0, 0], [r * .25, -r * .2], [r * .55, -r * .12], [r * .8, r * .15]], false), 16, { line: PAL.glowL }); pop(); }
  fillOnly(ell(0, 0, r * .25, r * .25, 30), PAL.glowL, { boil: .4 });
  pop();
}
export function gMark(x, y, r = 26) {
  shape(ell(x, y, r, r, 24), { fill: '#f2c230', lw: 5, shade: () => { fillOnly([[x, y], [x + r * 2, y], [x + r * 2, y - r * 2], [x, y - r * 2]], INK, { boil: 0 }); fillOnly([[x, y], [x - r * 2, y], [x - r * 2, y + r * 2], [x, y + r * 2]], INK, { boil: 0 }); } });
}
export function bMark(x, y, r = 26) { shape(ell(x, y, r, r, 24), { fill: '#3fb6e6', lw: 5 }); text('B', x, y + 2, { font: `800 ${Math.round(r * 1.3)}px "Baloo 2"`, fill: '#ffffff' }); }

// —— mar ——
const STORM = ['#2a1d45', '#33244f', '#3b2b5c', '#45346a'];
const waveY = (x, t, A = 60) => Math.sin(x * .006 - t * 1.6) * A + Math.sin(x * .013 + t * 2.3) * A * .35;
function sea(t, y0, { A = 60, cols = ['#1f6f86', '#185d72', '#124b5e', '#0d3a4a'], x0 = -600, x1 = 1700, foam = true } = {}) {
  const top = []; for (let x = x0; x <= x1; x += 40) top.push([x, y0 + waveY(x, t, A)]);
  shape([...top, [x1, y0 + 2400], [x0, y0 + 2400]], { fill: cols[0], lw: 7, shade: () => { for (let i = 1; i < cols.length; i++) fillOnly(rect(x0 - 100, y0 + A + i * 160, x1 - x0 + 200, 2400), cols[i], { boil: 0 }); } });
  if (foam) for (let x = x0; x <= x1; x += 120) { const y = y0 + waveY(x, t, A); if (waveY(x + 20, t, A) < waveY(x, t, A) - 6) shape(ell(x, y - 4, 24, 10, 12), { fill: '#e9fbff', lw: 4 }); }
}
function rain(t, n = 60, a = .35) {
  scr();
  for (let i = 0; i < n; i++) { const x = (hash(i) * 1400 + t * 300) % 1400 - 160, y = (hash(i * 3.1) * 2100 + t * 1600) % 2100 - 100; stroke([[x, y], [x - 60 * a, y + 70]], 3, { line: 'rgba(220,230,255,.55)' }); }
}
const flashAt = t => { const k = Math.floor(t * 1.2); return hash(k * 7.3) > .82 && (t * 1.2 - k) < .12; };
function stormSky(t) {
  fillScreen(STORM[0]);
  bands(STORM, -1500, 900, -1000, 2200);
  for (let i = 0; i < 5; i++) { const x = ((i * 380 + t * 30) % 1800) - 400, y = 120 + (i % 2) * 140; shape(spline([[x - 160, y], [x - 120, y - 60], [x - 20, y - 90], [x + 90, y - 70], [x + 170, y - 10], [x + 120, y + 30], [x - 140, y + 30]]), { fill: '#4b3d70', lw: 6 }); }
  if (flashAt(t)) { stroke([[640, -50], [600, 160], [680, 200], [610, 420]], 10, { line: '#fff6c8' }); scr(); fillOnly(rect(0, 0, W, H), 'rgba(255,255,255,.22)', { boil: 0 }); }
}

// —— ponte de comando por dentro (azul-marinho + latão); a sala inclina com o navio ——
function bridge(t, roll = 0, { calm = 0 } = {}) {
  fillScreen('#1b2440');
  push(); translate(540, 960); rotate(roll); translate(-540, -960);
  bands(['#2b3a63', '#26345a', '#212e50'], -600, 1500, -600, 1700);
  // janelão com o mar lá fora (o mar fica nivelado; o navio é que inclina)
  shape(rr(-100, 260, 1280, 520, 10), { fill: calm ? '#ffcf9a' : '#3b2b5c', lw: 8 });
  g.save(); { const P = new Path2D(); const c = [[-100, 260], [1180, 260], [1180, 780], [-100, 780]].map(p => tx(p[0], p[1])); P.moveTo(...c[0]); c.slice(1).forEach(p => P.lineTo(...p)); P.closePath(); g.setTransform(1, 0, 0, 1, 0, 0); g.clip(P); }
  push(); translate(540, 620); rotate(-roll); translate(-540, -620);
  if (!calm) { if (flashAt(t)) fillOnly(rect(-400, 0, 1900, 900), 'rgba(255,255,255,.3)', { boil: 0 }); sea(t, 640, { A: 70 }); }
  else { fillOnly(ell(780, 520, 80, 80, 30), '#fff1c4', { boil: .3 }); sea(t, 640, { A: 10, cols: ['#ff9a6b', '#e8785a', '#c95b4b'], foam: false }); }
  pop();
  g.restore();
  for (let x = 120; x < 1080; x += 240) stroke([[x, 260], [x, 780]], 14);
  stroke([[-100, 520], [1180, 520]], 6, { line: '#121a30' });
  // painel
  shape(rect(-200, 1080, 1480, 900), { fill: '#3a4a74', lw: 8, shade: () => fillOnly(rect(-200, 1080, 1480, 40), PAL.brass, { boil: .2 }) });
  for (const [x, c] of [[160, '#6dff9b'], [400, '#ffb84d'], [660, '#8cc8ff']]) { shape(rr(x - 90, 1150, 180, 120, 12), { fill: '#0f1a2a', lw: 6 }); stroke(spline([[x - 70, 1220], [x - 30, 1190 + Math.sin(t * 3 + x) * 20], [x + 10, 1230], [x + 60, 1200]], false), 4, { line: c }); }
  stroke([[900, 1080], [900, 1000]], 10); shape(ell(900, 990, 22, 22, 14), { fill: '#e8392b', lw: 5 });   // manete
  fillOnly(rect(-200, 1500, 1480, 600), '#16203a', { boil: 0 });
  pop();
}
const DAL = o => dalva({ s: .95, holdR: 'tea', look: [-.4, .05], ...o });
const TIC = o => tico({ s: 1.0, ...o });

// —— corte no "mundo raio-X" (azul-blueprint) ——
function blueprint(t) {
  fillScreen('#1e3b6e');
  scr(); for (let x = 0; x <= W; x += 60) stroke([[x, 0], [x, H]], 2, { line: 'rgba(255,255,255,.07)' });
  for (let y = 0; y <= H; y += 60) stroke([[0, y], [W, y]], 2, { line: 'rgba(255,255,255,.07)' });
}
// seção com G e B corretos para a inclinação: B vai para o lado que afunda
function sectionGB(x, y, R, roll, t, { wide = 1, ballast = .3, keels = 1, showG = 1, showB = 1, arrows = 1, gy = -.05, water = 1 } = {}) {
  hullSection(x, y, R, { roll, t, wide, ballast, keels });
  if (water) { fillOnly(rect(x - 900, y, 1800, 1400), 'rgba(42,159,214,.55)', { boil: .4 }); stroke([[x - 900, y], [x + 900, y]], 5, { line: '#e9fbff' }); }
  const H2 = R * .9, gyy = gy * H2;
  const G = [x - gyy * Math.sin(roll), y + gyy * Math.cos(roll)];
  const B = [x + .95 * R * wide * wide * Math.sin(roll), y + H2 * .32];
  if (showG) { if (arrows) arrow(G[0], G[1] + 30, G[0], G[1] + 230, '#f2c230', 22); gMark(G[0], G[1], 26 * showG); }
  if (showB) { if (arrows) arrow(B[0], B[1] - 30, B[0], B[1] - 230, '#3fb6e6', 22); bMark(B[0], B[1], 26 * showB); }
  return { G, B };
}

// ============ CENAS ============
// 01 — a tempestade; por que ele não vira?
function s01(t, u) {
  const tPor = w('01', 'por');
  if (t < tPor - .1) {
    const roll = .14 * Math.sin(t * 1.4);
    const zk = ss(seg(t, 0, tPor));
    cam(540, lerp(980, 1060, zk), lerp(1.15, .95, zk), 0, t);
    stormSky(t);
    sea(t, 1300, { A: 80 });
    ship(540, 1290 + waveY(540, t, 80), 860, { roll, t, speed: 1 });
    // Ondina empurrando pelo lado
    const ox = lerp(1500, 1000, ss(seg(t, .3, 3)));
    ondina({ x: ox, y: 1460, s: 1.15, t, face: -1, look: [-.8, .1] });
    // frente do mar por cima do casco
    fillOnly(rect(-400, 1330, 1900, 900), 'rgba(24,93,114,.55)', { boil: .3 });
    rain(t);
    return;
  }
  // a ponte inclina; Tico agarrado; Dalva e o chá nivelados
  const roll = .2 * Math.sin(t * 1.6);
  cam(540, 1060, 1.05, 4, t);
  bridge(t, roll);
  push(); translate(540, 960); rotate(roll); translate(-540, -960);
  TIC({ x: 300, y: 1500, t, nerv: 1.2, sweat: t, eyeS: 1.2, mouth: { o: .7, sm: -.8 }, armL: { h: [-80, -140], bend: -20, fist: true }, armR: { h: [80, -150], bend: 20, fist: true }, lean: -roll * .8 });
  DAL({ x: 800, y: 1500, t, face: -1, tilt: roll, lean: -roll });
  pop();
}

// 02 — joão-bobo; dois pontos invisíveis (G e B)
function s02(t, u) {
  const tTodo = w('02', 'todo'), tGrav = w('02', 'gravidade'), tEmp = w('02', 'empuxo');
  if (t < tTodo + .3) {
    cam(540, 1080, 1.12, 0, t);
    bridge(t, 0);
    const poke = VO['02'] + 1.4, dt = t - poke;
    const a = dt > 0 ? .7 * Math.exp(-dt * 1.3) * Math.cos(dt * 6) : 0;
    joaoBobo(540, 1500, 1.05, { a });
    DAL({ x: 830, y: 1500, t, face: -1, holdR: dt < .3 ? null : 'tea', armR: dt > -.4 && dt < .3 ? { h: [-120, 40], bend: -10 } : undefined, look: [-.8, .3] });
    TIC({ x: 220, y: 1500, t, nerv: .3, look: [.8, .2], mouth: { o: .3, sm: .2 } });
    const fire = tTodo - .3;
    if (t > fire - .4) {
      DAL({ x: 830, y: 1500, t, face: -1, holdR: 'scope', glow: t > fire ? 1 : 0, scopeA: .1, armR: { h: [100, -20], bend: 30 }, look: [-.8, .1] });
      xWindow(540, 900, 220 * popIn(t, fire, .3, 1.1), { t });
    }
    swirlWipe(t, tTodo + .3);
    return;
  }
  blueprint(t);
  cam(540, 1000, 1.25, 0, t);
  sectionGB(540, 1000, 300, 0, t, { showG: popIn(t, tGrav - .1), showB: popIn(t, tEmp - .1), arrows: 1 });
  if (t > tGrav) sign('PESO', 330, 1300, { size: 50, fill: '#f2c230', s: popIn(t, tGrav) });
  if (t > tEmp) sign('ÁGUA', 750, 1300, { size: 50, fill: '#8cd9ff', s: popIn(t, tEmp) });
  swirlWipe(t, tTodo + .3);
}

// 03 — a onda inclina; o empuxo muda de lado; ele gira de volta
function s03(t, u) {
  const tInc = w('03', 'inclina'), tAf = w('03', 'afunda'), tPeso = w('03', 'peso'), tGira = w('03', 'gira');
  const tilt = ss(seg(t, tInc - .2, tInc + 1.0)) * .38;
  const back_ = t > tGira ? .38 * Math.exp(-(t - tGira) * 1.6) * Math.cos((t - tGira) * 4) : tilt;
  const roll = t > tGira ? back_ : tilt;
  blueprint(t);
  cam(540, 900, 1, 0, t);
  // Ondina empurrando pela esquerda
  ondina({ x: lerp(-200, 120, ss(seg(t, VO['03'], tInc))), y: 1120, s: .8, t, look: [1, 0], mouth: { o: t > tGira ? .7 : .35, sm: t > tGira ? -1 : .9 } });
  const { G, B } = sectionGB(560, 1000, 300, roll, t, { arrows: t > tPeso - .1 ? 1 : 0, showG: 1, showB: 1 });
  if (t > tAf && t < tPeso) sign('mais casco na água', 760, 1500, { size: 40, fill: '#8cd9ff', s: popIn(t, tAf) });
  if (t > tPeso - .1 && t < tGira + 1.5) {   // seta curva de giro
    push(); translate(560, 900);
    stroke(arc(0, 0, 360, 360, -Math.PI * .85, -Math.PI * .55, 18), 18, { line: '#ffd23f' });
    arrow(Math.cos(-Math.PI * .55) * 360 - 20, Math.sin(-Math.PI * .55) * 360 - 10, Math.cos(-Math.PI * .5) * 360 + 30, Math.sin(-Math.PI * .5) * 360, '#ffd23f', 18);
    pop();
  }
}

// 04 — casco estreito vira; casco largo volta
function s04(t, u) {
  const tQuant = w('04', 'quanto'), tLong = w('04', 'longe'), tForca = w('04', 'forca');
  blueprint(t);
  cam(540, 960, 1, 0, t);
  const push_ = ss(seg(t, VO['04'] + .3, VO['04'] + 1.4));
  // estreito (cima): vira de vez
  const rN = Math.min(1.6, push_ * .45 + Math.max(0, t - (VO['04'] + 1.4)) * 1.4);
  sectionGB(540, 560, 170, rN, t, { wide: .45, arrows: 0, showB: 0, showG: 0, keels: 0, ballast: 0 });
  if (rN > 1.2) sign('estreito: virou!', 540, 300, { size: 44, fill: '#ff8a7a', s: popIn(t, VO['04'] + 2.2) });
  // largo (baixo): volta
  const rW = t < tQuant ? push_ * .3 : .3 * Math.exp(-(t - tQuant) * 1.2) * Math.cos((t - tQuant) * 3.6);
  sectionGB(540, 1340, 210, rW, t, { wide: 1.15, arrows: 0, showG: t > tLong ? 1 : 0, showB: t > tLong ? 1 : 0 });
  // régua 58,8 m
  const rl = ss(seg(t, VO['04'] + .9, VO['04'] + 1.6));
  if (rl > 0) { stroke([[540 - 240 * rl, 1060], [540 + 240 * rl, 1060]], 8, { line: '#ffd23f' }); for (const sx of [-1, 1]) stroke([[540 + sx * 240 * rl, 1040], [540 + sx * 240 * rl, 1080]], 8, { line: '#ffd23f' }); sign('58,8 m', 540, 1000, { size: 56, fill: '#ffd23f', s: rl }); }
  if (t > tForca) sign('mais força pra voltar', 540, 1780, { size: 44, fill: '#8cd9ff', s: popIn(t, tForca) });
}

// 05 — o peso fica embaixo: guindaste, pesados no fundo, leves em cima, computador
const CRATE = (x, y, w_, h_, col, lbl) => { shape(rect(x - w_ / 2, y - h_, w_, h_), { fill: col, lw: 6, shade: () => { for (const k of [.25, .5, .75]) fillOnly(rect(x - w_ / 2 + w_ * k - 2, y - h_, 4, h_), 'rgba(0,0,0,.18)', { boil: 0 }); } }); if (lbl) text(lbl, x, y - h_ / 2, { font: `800 ${Math.round(h_ * .42)}px "Baloo 2"`, fill: '#ffffff', outlineW: 6 }); };
function s05(t, u) {
  const tPes = w('05', 'pesados'), tLev = w('05', 'leves'), tComp = w('05', 'computador');
  if (t >= tComp - .1) {
    // tela do computador com o plano de carga
    cam(540, 960, 1, 0, t);
    bridge(t, 0);
    shape(rr(140, 300, 800, 1000, 30), { fill: '#0f1a2a', lw: 9 });
    text('PLANO DE CARGA', 540, 380, { font: '64px "VT323"', fill: '#6dff9b' });
    const k = seg(t, tComp, tComp + 2.5);
    for (let r = 0; r < 8; r++) for (let c = 0; c < 8; c++) {
      const idx = r * 8 + c; if (idx / 64 > k * 1.2) continue;
      const heavy = r > 4, mid = r > 2 && !heavy;
      fillOnly(rect(220 + c * 82, 470 + r * 90, 74, 80), heavy ? '#e8392b' : mid ? '#f2c230' : '#6dff9b', { boil: .2 });
    }
    text('pesado', 330, 1250, { font: '40px "VT323"', fill: '#e8392b' }); text('médio', 540, 1250, { font: '40px "VT323"', fill: '#f2c230' }); text('leve', 750, 1250, { font: '40px "VT323"', fill: '#6dff9b' });
    TIC({ x: 140, y: 1700, t, s: .8, look: [1, -.4], mouth: { o: .1, sm: .3 } });
    return;
  }
  // porto: guindaste sobre o navio em corte lateral
  cam(540, 960, 1, 0, t);
  bandsScreen(['#ffb86b', '#ffa95a', '#ff9a4d']);
  sea(t, 1500, { A: 6, cols: ['#2a9fd6', '#2189bd'], foam: false });
  // guindaste
  shape(rect(80, 200, 40, 1300), { fill: '#e8392b', lw: 7 }); shape(rect(960, 200, 40, 1300), { fill: '#e8392b', lw: 7 });
  shape(rect(40, 180, 1000, 50), { fill: '#e8392b', lw: 7 });
  // porão (casco aberto)
  shape([[120, 900], [960, 900], [960, 1560], [120, 1560]], { fill: PAL.hull, lw: 8 });
  shape(rect(150, 900, 780, 620), { fill: '#cfd6de', lw: 5 });
  // pilha: pesados no fundo, leves em cima
  const placed = [];
  const order = [['30 t', '#5a4a72', 1], ['30 t', '#5a4a72', 1], ['30 t', '#5a4a72', 1], ['12 t', '#3f6fd1', 2], ['12 t', '#3f6fd1', 2], ['12 t', '#3f6fd1', 2], ['3 t', '#6dcf8a', 3], ['3 t', '#6dcf8a', 3], ['3 t', '#6dcf8a', 3]];
  const t0 = VO['05'] + .4, st = (tComp - .3 - t0) / order.length;
  order.forEach(([lbl, col, row], i) => {
    const k = seg(t, t0 + i * st, t0 + (i + .85) * st); if (k <= 0) return;
    const col_ = i % 3, X = 290 + col_ * 250, Y = 1520 - (row - 1) * 150;
    const yy = lerp(260, Y, eo(k)), xx = lerp(540, X, ss(Math.min(1, k * 1.4)));
    if (k < 1) stroke([[xx, 230], [xx, yy - 140]], 4);
    CRATE(xx, yy, 230, 140, col, lbl);
  });
  // Tico tenta pôr um pesado em cima: buzina
  if (t > tLev && t < tComp) {
    const k = seg(t, tLev, tLev + .6);
    TIC({ x: 1000, y: 1500, t, s: .75, face: -1, nerv: k > .5 ? 1 : .2, mouth: { o: k > .5 ? .8 : .2, sm: -.8 }, armL: { h: [-80, -100], bend: -10 }, armR: { h: [80, -100], bend: 10 } });
    if (k > .5) { sign('NÃO!', 760, 700, { size: 90, fill: '#ff5a4a', col: '#ffffff', rot: -.1, s: popIn(t, tLev + .3) }); }
  }
  if (t > tPes - .1 && t < tLev) sign('PESADOS NO FUNDO', 540, 820, { size: 48, fill: '#ffd23f', s: popIn(t, tPes - .1) });
}

// 06 — lastro: tanques enchem, G desce
function s06(t, u) {
  const tTanq = w('06', 'tanques'), tLast = w('06', 'lastro');
  const fill_ = ss(seg(t, tTanq, tTanq + 2.5));
  blueprint(t);
  cam(540, 900, 1, 0, t);
  const sink = fill_ * 40;
  sectionGB(540, 980, 320, .06 * Math.sin(t * 2) * (1 - fill_), t, { ballast: .05 + .95 * fill_, arrows: 0, gy: lerp(-.05, .12, fill_) });
  if (fill_ > 0) for (let i = 0; i < 6; i++) { const ph = (t * 1.5 + i / 6) % 1; shape(ell(lerp(150, 380, ph), 1240, 10, 7, 8), { fill: '#bfe9ff', lw: 3 }); }
  if (t > tLast) sign('LASTRO = contrapeso', 540, 1560, { size: 52, fill: '#8cd9ff', s: popIn(t, tLast) });
  if (fill_ > .5) { push(); translate(830, 1000); arrow(0, -120, 0, 40, '#f2c230', 20); pop(); }
}

// 07 — travas nos cantos, barras de amarração, Tico apertando
function s07(t, u) {
  const tTrav = w('07', 'travado'), tBarr = w('07', 'barras'), tAnt = w('07', 'antes');
  if (t < tBarr - .1) {
    cam(540, 960, 1, 0, t);
    bandsScreen(['#5a6b8a', '#526281', '#4a5978']);
    rain(t, 25, .2);
    twistlock(540, 960, 2.3, { turn: ss(seg(t, tTrav, tTrav + .6)) });
    if (t > tTrav + .4) sign('TRAVADO', 540, 1500, { size: 70, fill: '#6dff9b', s: popIn(t, tTrav + .4) });
    return;
  }
  // convés: pilha amarrada; Tico aperta o esticador com uma chave gigante
  cam(540, 1000, 1, 0, t);
  stormSky(t);
  shape(rect(-100, 1400, 1300, 700), { fill: PAL.deck, lw: 7 });
  for (let c = 0; c < 3; c++) for (let r = 0; r < 4; r++) CRATE(360 + c * 250, 1400 - r * 150, 240, 148, PAL.box[(c * 3 + r) % 8], '');
  const bars = ss(seg(t, tBarr, tBarr + 1.2));
  for (let c = 0; c < 4; c++) { const x = 240 + c * 250; if (bars > c / 4) { lashingBar(x, 1400, x + 120, 1110); lashingBar(x + 10, 1400, x - 110, 1110); } }
  const crank = t > tAnt ? Math.sin(t * 9) * .5 : 0;
  TIC({ x: 980, y: 1600, t, s: .85, face: -1, nerv: .5, sweat: t * 1.2, mouth: { o: .4, sm: -.4 }, armL: { h: [-110, -20 + crank * 40], bend: -10, fist: true }, armR: { h: [-90, 10 + crank * 40], bend: 10, fist: true } });
  if (t > tAnt) { push(); translate(830, 1560 + crank * 40); rotate(-.5 + crank); shape(rr(-10, -10, 200, 30, 10), { fill: PAL.steel, lw: 6 }); shape(ell(0, 5, 34, 34, 16), { fill: PAL.steel, lw: 6 }); pop(); }
  DAL({ x: 120, y: 1600, t, s: .7, look: [1, -.2] });
  rain(t, 40, .3);
}

// 08 — aletas laterais: freio de balanço (visão submarina)
function s08(t, u) {
  const t0 = VO['08'], tCada = w('08', 'cada');
  const amp = t < tCada ? .22 : .22 * Math.exp(-(t - tCada) * .9);
  const roll = amp * Math.sin((t - t0) * 2.4);
  cam(540, 820, 1, 0, t);
  fillScreen('#0d3a4a');
  bands(['#1f6f86', '#185d72', '#124b5e', '#0d3a4a'], 400, 2000, -200, 1300);
  hullSection(540, 400, 340, { roll, t, ballast: .6, keels: 1.4 });
  // redemoinhos nas aletas
  for (const sx of [-1, 1]) {
    const kx = 540 + Math.cos(roll) * sx * 320 - Math.sin(roll) * 250, ky = 400 + Math.sin(roll) * sx * 320 + Math.cos(roll) * 250;
    for (let i = 0; i < 3; i++) { const r = 30 + i * 22 + ((t * 40) % 22); stroke(arc(kx + sx * 40, ky + 40, r, r * .7, t * 3 + i, t * 3 + i + 3.6, 12), 5, { line: 'rgba(233,251,255,.55)' }); }
  }
  if (t > tCada - .1) sign('FREIO', 540, 1350, { size: 80, fill: '#ffd23f', s: popIn(t, tCada - .1) });
  // medidor de balanço
  push(); translate(540, 1650); shape(rr(-300, -60, 600, 120, 30), { fill: '#0f1a2a', lw: 6 }); stroke([[0, -40], [Math.sin(roll * 3) * 260, 30]], 8, { line: '#ff8a7a' }); pop();
}

// 09 — o comandante: desvia, desacelera, proa nas ondas
function s09(t, u) {
  const tDes = w('09', 'desvia'), tDim = w('09', 'diminui'), tApo = w('09', 'aponta');
  if (t < tApo - .1) {
    cam(540, 960, 1, 0, t);
    bridge(t, .05 * Math.sin(t * 1.4));
    shape(rr(120, 300, 840, 900, 30), { fill: '#0f1a2a', lw: 9 });
    text('ROTA', 540, 370, { font: '60px "VT323"', fill: '#8cc8ff' });
    // tempestade (vermelha) e rota desviando
    fillOnly(ell(560, 760, 170, 130, 30), 'rgba(232,57,43,.75)', { boil: .5 });
    for (let k = 0; k < 4; k++) stroke(arc(560, 760, 60 + k * 30, 44 + k * 22, t * 2 + k, t * 2 + k + 4, 14), 4, { line: '#ffb3a8' });
    const rk = ss(seg(t, tDes - .2, tDes + 1.4));
    const route = []; for (let i = 0; i <= 40 * rk; i++) { const s_ = i / 40; route.push([lerp(200, 900, s_), lerp(1080, 460, s_) + Math.sin(s_ * Math.PI) * 360]); }
    if (route.length > 1) stroke(route, 8, { line: '#6dff9b' });
    if (route.length > 1) { const p = route[route.length - 1]; dot(p[0], p[1], 14, '#6dff9b'); }
    // velocidade
    if (t > tDim - .1) { push(); translate(540, 1110); text(`${Math.round(lerp(22, 12, ss(seg(t, tDim, tDim + 1))))} nós`, 0, 0, { font: '70px "VT323"', fill: '#ffb84d' }); pop(); }
    DAL({ x: 900, y: 1700, t, s: .8, face: -1, look: [-.8, -.4] });
    return;
  }
  // fora: o navio vira a proa para as ondas; Ondina bate de frente
  const turn = ss(seg(t, tApo, tApo + 1.2));
  cam(540, 1000, 1, 0, t);
  stormSky(t);
  sea(t, 1250, { A: 60 });
  // vista de cima simplificada: proa girando para as ondas
  push(); translate(540, 1300); rotate(lerp(Math.PI / 2, Math.PI * .02, turn)); scale(.55);
  shape(spline([[0, -620], [120, -420], [130, 400], [90, 520], [-90, 520], [-130, 400], [-120, -420]]), { fill: PAL.hull, lw: 10 });
  for (let r = 0; r < 9; r++) for (let c = 0; c < 4; c++) fillOnly(rect(-100 + c * 50, -380 + r * 80, 44, 72), PAL.box[(r * 4 + c) % 8], { boil: .2 });
  shape(rect(-120, 330, 240, 90), { fill: '#f4f1ea', lw: 7 });
  pop();
  const hit = seg(t, tApo + 1.1, tApo + 1.6);
  ondina({ x: lerp(1400, 640, eo(seg(t, tApo + .3, tApo + 1.2))), y: 800 + (hit > 0 ? -60 * Math.sin(hit * Math.PI) : 0), s: .8, t, face: -1, look: [-1, .3], sq: hit > 0 && hit < 1 ? .7 : 1, mouth: { o: hit > 0 ? .8 : .4, sm: hit > 0 ? -1 : .8 } });
  if (hit > 0 && hit < 1) for (let i = 0; i < 10; i++) { const a = -Math.PI * (.1 + i * .08); dot(600 + Math.cos(a) * 200 * hit, 760 + Math.sin(a) * 160 * hit, 12, '#e9fbff'); }
  rain(t);
}

// 10 — "nada cai, nunca?" + silêncio + plop
function s10(t, u) {
  const end = endOf('10'), slip = end + .35, plop = slip + .75;
  bandsScreen(['#7a8fb8', '#6f84ad']);
  cam(lerp(540, 520, ss(seg(t, end, VO['11']))), lerp(1000, 1180, ss(seg(t, end, VO['11']))), lerp(1, 1.6, ss(seg(t, end, VO['11']))), 0, t);
  sea(t, 1250, { A: 20, cols: ['#2a7fa8', '#226d93'] });
  shape(rect(-100, 1400, 1300, 700), { fill: PAL.deck, lw: 7 });
  for (let c = 0; c < 2; c++) for (let r = 0; r < 4; r++) {
    let x = 620 + c * 250, y = 1400 - r * 150;
    if (c === 1 && r === 3 && t > slip) { const k = seg(t, slip, plop); x += k * 260; y += k * k * 600; if (k >= 1) continue; push(); translate(x, y); rotate(k * 1.4); CRATE(0, 0, 240, 148, PAL.box[5], ''); pop(); continue; }
    CRATE(x, y, 240, 148, PAL.box[(c * 3 + r) % 8], '');
  }
  const heard = t > plop;
  TIC({ x: 300, y: 1600, t, s: .9, look: heard ? [1, -.2] : [-.3, 0], mouth: heard ? { o: 0, sm: -.3 } : { o: .2, sm: .9 }, eyeS: heard ? 1.3 : 1, brow: heard ? 1.6 : .2, armL: { h: [-70, -160], bend: -20 }, armR: heard ? undefined : { h: [70, -160], bend: 20 } });
}

// 11 — 2020: 1.800 contêineres no mar; Ondina surfando
function s11(t, u) {
  const tPac = w('11', 'pacifico'), tDer = w('11', 'derrubou'), tNav = w('11', 'navio', 1), tCx = w('11', 'caixas');
  if (t < tCx - .1) {
    cam(540, 960, 1, 0, t);
    stormSky(t);
    sea(t, 1000, { A: 50 });
    const n = Math.floor(ss(seg(t, tDer - .3, tDer + 2.5)) * 26);
    for (let i = 0; i < n; i++) { const x = hash(i) * 1200 - 60 + (t - tDer) * 30 * (hash(i * 2) - .5), y = 1090 + hash(i * 3) * 740; push(); translate(x, y + Math.sin(t * 2 + i) * 10); rotate((hash(i * 5) - .5) * .8); CRATE(0, 0, 120, 70, PAL.box[i % 8], ''); pop(); }
    // Ondina surfando num contêiner
    push(); translate(lerp(-200, 700, seg(t, VO['11'] + .3, tCx)), 1080); rotate(-.1);
    CRATE(0, 0, 200, 90, PAL.box[1], ''); ondina({ x: 0, y: -90, s: .45, t, mouth: { o: .6, sm: 1 } }); pop();
    if (t > tDer) sign('+1.800 contêineres', 540, 420, { size: 64, fill: '#ffd23f', s: popIn(t, tDer + .3) });
    if (t > tNav - .1) { ship(lerp(1400, 700, ss(seg(t, tNav - .2, tNav + 1.5))), 1000 + waveY(700, t, 50), 520, { roll: .05 * Math.sin(t * 1.5), t, speed: 1, lost: .6 }); sign('navio: inteiro!', 540, 600, { size: 48, fill: '#6dff9b', s: popIn(t, tNav) }); }
    rain(t, 30);
    return;
  }
  // reação: close no Tico
  bandsScreen(['#7a8fb8', '#6f84ad']);
  cam(540, 1080, 2.0, 0, t);
  TIC({ x: 540, y: 1520, t, s: 1, nerv: .3, mouth: { o: .05, sm: -.5, w: .6 }, lid: .35, look: [.6, .3] });
}

// 12 — a resposta: amanhecer, chegada ao porto, brinde com o chá intacto
function s12(t, u) {
  const tPeso = w('12', 'peso'), tVolt = w('12', 'volta');
  const k = ss(seg(t, VO['12'], endOf('12') + .5));
  cam(lerp(560, 600, k), lerp(1060, 980, k), lerp(1.25, .8, k), 0, t);
  bands(['#ff9ec4', '#ffb3a0', '#ffc98a', '#ffe0a0'], -1000, 1250, -1200, 2400);
  shape(ell(240, 1020, 140, 140, 40), { fill: '#fff1c4', lw: 7 });
  // porto com guindastes à direita
  for (let i = 0; i < 3; i++) { const x = 1250 + i * 230; shape(rect(x, 600, 34, 650), { fill: '#e8392b', lw: 6 }); shape(rect(x - 150, 600, 330, 34), { fill: '#e8392b', lw: 6 }); }
  shape(rect(1050, 1180, 1300, 120), { fill: '#8e99a5', lw: 7 });
  sea(t, 1250, { A: 8, cols: ['#ff9a6b', '#e8785a', '#c95b4b'], foam: false, x0: -1200, x1: 2400 });
  ship(lerp(300, 620, k), 1250, 900, { roll: .01 * Math.sin(t), t, speed: .4 });
  fillOnly(rect(-1200, 1250, 3600, 900), 'rgba(201,91,75,.45)', { boil: .3 });
  // Dalva na asa da ponte, brinde
  const dx = lerp(300, 620, k) + .9 * 440;
  push(); translate(dx, 1250 - 142 * .9); scale(.36);
  dalva({ x: 0, y: 0, t, s: 1, face: -1, look: [-.6, -.3], holdR: 'tea', armR: { h: [80, lerp(80, -60, ss(seg(t, tVolt - .6, tVolt)))], bend: 40 } });
  pop();
  // gaivotas
  for (let i = 0; i < 4; i++) { const x = (i * 300 + t * 60) % 1600 - 200, y = 500 + i * 70 + Math.sin(t * 3 + i) * 20; stroke(spline([[x - 30, y], [x - 12, y - 14], [x, y], [x + 12, y - 14], [x + 30, y]], false), 5); }
  if (t > tPeso - .1) {
    scr();
    const items = [['peso embaixo', 0], ['casco largo', .9], ['água empurrando', 1.8]];
    items.forEach(([s_, d], i) => { if (t > tPeso + d - .1) sign(s_, 540, 260 + i * 110, { size: 48, fill: ['#f2c230', '#ffd23f', '#8cd9ff'][i], s: popIn(t, tPeso + d - .1) }); });
  }
}

// 13 — chamada: CURIOSO SOH
function s13(t, u) {
  const tCur = w('13', 'curioso');
  cam(540, 960, 1, 0, t);
  bandsScreen(['#3a2a52', '#33254a', '#2c2041', '#251b38']);
  xWindow(540, 760, 330, { open: back(seg(t, VO['13'] - .25, VO['13'] + .1), 1.1), t });
  scr(); fillOnly(rect(0, 0, W, H), 'rgba(139,92,255,.08)', { boil: 0 });
  ondina({ x: 560, y: 1880, s: .55, t, mouth: { o: .4, sm: 1 }, look: [0, -.6] });
  TIC({ x: 260, y: 1740, t, s: .62, look: [.4, -.5], mouth: { o: .3, sm: 1 }, brow: 0, armR: { h: [40, -150], bend: 20 }, nerv: 0 });
  DAL({ x: 830, y: 1740, t, s: .6, face: -1, look: [-.3, -.4] });
  const a = back(seg(q(t), VO['13'] - .1, VO['13'] + .3), 1.6);
  if (a > 0) text('se gostou, comenta:', 540, 320, { font: `800 ${Math.round(70 * a)}px "Baloo 2"`, fill: '#ffffff', outlineW: 12 });
  const b = back(seg(q(t), tCur - .1, tCur + .25), 1.8);
  if (b > 0) {
    push(); translate(540, 760); rotate(-.05 + Math.sin(q(t) * 3) * .015); scale(b);
    text('CURIOSO', 0, -80, { font: '150px "Titan One"', fill: '#ffd23f', outlineW: 26 });
    text('SOH', 0, 110, { font: '210px "Titan One"', fill: '#c9b5ff', outlineW: 30 });
    pop();
  }
}

const FN = { '01': s01, '02': s02, '03': s03, '04': s04, '05': s05, '06': s06, '07': s07, '08': s08, '09': s09, '10': s10, '11': s11, '12': s12, '13': s13 };
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
ev('cue', 0, { name: 'tempestade', t0: 0, t1: VO['02'] - .2 });
ev('cue', VO['02'] - .2, { name: 'explica', t0: VO['02'] - .2, t1: endOf('10') });
ev('cue', VO['11'] - .1, { name: 'caixas', t0: VO['11'] - .1, t1: VO['12'] - .3 });
ev('cue', VO['12'] - .3, { name: 'chegada', t0: VO['12'] - .3, t1: VO['13'] - .3 });
ev('cue', VO['13'] - .3, { name: 'final', t0: VO['13'] - .3, t1: END });
// trovões (onde há relâmpago, com a tempestade em cena)
for (let k = 0; k < END * 1.2; k++) { const t = k / 1.2; if (hash(k * 7.3) > .82) { const sc = SC.find(([, a, b]) => t >= a && t < b); if (sc && ['01', '07', '09', '11'].includes(sc[0])) ev('thunder', t + .15); } }
ev('creak', 2); ev('creak', w('01', 'por') + .3); ev('splashBig', 1.2);
ev('boing', VO['02'] + 1.4); ev('portalOpen', w('02', 'todo') - .3); ev('portalWhoosh', w('02', 'todo') + .1);
ev('pop', w('02', 'gravidade')); ev('pop', w('02', 'empuxo'));
ev('whoosh', w('03', 'inclina')); ev('creak', w('03', 'inclina') + .3); ev('bloop', w('03', 'afunda')); ev('wobble', w('03', 'gira'));
ev('creak', VO['04'] + 1.4); ev('splashBig', VO['04'] + 2.4); ev('pop', w('04', 'longe')); ev('wobble', w('04', 'quanto'));
{ const t0 = VO['05'] + .4, st = (w('05', 'computador') - .3 - t0) / 9; for (let i = 0; i < 9; i++) ev('clang', t0 + (i + .85) * st); }
ev('buzzer', w('05', 'leves') + .3); ev('beepScan', w('05', 'computador'), { d: 2.5 });
ev('fillWater', w('06', 'tanques'), { d: 2.5 }); ev('pop', w('06', 'lastro'));
ev('clunk', w('07', 'travado') + .3); ev('ratchet', w('07', 'antes'), { d: endOf('07') - w('07', 'antes') });
ev('swirl', w('08', 'cada'), { d: 2.5 }); ev('pop', w('08', 'cada'));
ev('beepScan', w('09', 'desvia'), { d: 1.4 }); ev('slowdown', w('09', 'diminui'));
ev('splashBig', w('09', 'aponta') + 1.15); ev('foghorn', w('09', 'aponta') + .2);
ev('plop', endOf('10') + .35 + .75);
ev('splash', w('11', 'derrubou')); ev('splash', w('11', 'derrubou') + .5); ev('splash', w('11', 'derrubou') + 1.1); ev('wheee', VO['11'] + .4, { d: w('11', 'caixas') - VO['11'] - .5 });
ev('sigh', w('11', 'caixas') + .6);
ev('foghornLong', VO['12'] + .3); ev('gulls', VO['12'], { d: endOf('12') - VO['12'] }); ev('cupSet', w('12', 'volta'));
ev('pop', w('12', 'peso')); ev('pop', w('12', 'peso') + .9); ev('pop', w('12', 'peso') + 1.8);
ev('portalOpen', VO['13'] - .25); ev('titleHit', w('13', 'curioso'));
for (const [id, a, b] of SC) ev('amb', a, { d: +(b - a).toFixed(3), w: { '01': 'storm', '02': 'bridge', '03': 'xray', '04': 'xray', '05': 'port', '06': 'xray', '07': 'storm', '08': 'under', '09': 'storm', '10': 'sea', '11': 'storm', '12': 'port', '13': 'none' }[id] });
EV.sort((a, b) => a.t - b.t);
window.EV = EV;

await document.fonts.ready;
await Promise.all(['150px "Titan One"', '800 40px "Baloo 2"', '28px "VT323"'].map(f => document.fonts.load(f)));
window.READY = true;
