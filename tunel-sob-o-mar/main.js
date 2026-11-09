// "Nem uma gota?" — Sci-Fi Sitcom Toon, 1080×1920
import { clamp, lerp, seg, ss, eo, ei, eio, back, hash, TAU } from '/core/lib.js';
import { W, H, INK, init, frame, g, push, pop, translate, rotate, scale, shape, fillOnly, stroke, ell, arc, rr, rect, spline, dot, text, noodle, quad, reset, bands, S } from './toon.js';
import { neide, bolota, pingo, tbm, cutterhead, scope, cutWindow, segRing, gasketDetail, pump, gauge, mug, PAL } from './cast.js';
import { build, ORDER } from './story.js';

init(document.getElementById('c'));
const J = async f => { try { const r = await fetch(f); if (r.ok) return await r.json(); } catch (e) { } return null; };
const DURS = await J('voices/dur.json'), WORDS = (await J('voices/words.json')) || {};
const { VO, END, w, SC } = build(DURS, WORDS);
const q = t => Math.floor(t * 12 + 1e-6) / 12;          // tempo "em dois" (12 fps)
const pulse = (t, a, d = .35) => t >= a && t < a + d ? Math.sin(Math.PI * (t - a) / d) : 0;

// —— câmera e utilidades ——
function cam(cx, cy, z = 1, shake = 0, t = 0) {
  reset(); translate(W / 2, H / 2);
  if (shake) { const f = Math.floor(t * 24); translate((hash(f) - .5) * shake * 2, (hash(f + 77) - .5) * shake * 2); }
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
  push(); translate(x, y); rotate(rot); scale(s);
  g.font = `800 ${size}px "Baloo 2"`; const tw = g.measureText(str).width;
  shape(rr(-tw / 2 - 26, -size * .62, tw + 52, size * 1.24, size * .4), { fill, lw: 6 });
  text(str, 0, 2, { font: `800 ${size}px "Baloo 2"`, fill: col });
  pop();
}
// transição pelo "portal" do Corte-Scópio (redemoinho rosa que cobre a tela)
function swirlWipe(t, tc, half = .28) {
  const d = Math.abs(t - tc); if (d > half) return;
  const k = 1 - d / half, r = k * 1300;
  scr(); push(); translate(W / 2, H / 2);
  fillOnly(ell(0, 0, r, r, 64), PAL.glow, { boil: .6 });
  for (let i = 0; i < 5; i++) { push(); rotate(t * 7 + i * TAU / 5); stroke(spline([[0, 0], [r * .25, -r * .2], [r * .55, -r * .12], [r * .8, r * .15]], false), 16, { line: PAL.glowL }); pop(); }
  fillOnly(ell(0, 0, r * .25, r * .25, 30), PAL.glowL, { boil: .4 });
  pop();
}
const WATERS = ['#35b3b3', '#2a9fa6', '#218a98', '#197489', '#125f78', '#0d4b64', '#0a3a52'];

// —— cenários ——
function ship(x, y, t) {
  push(); translate(x, y + Math.sin(t * 1.6) * 6); rotate(Math.sin(t * 1.1) * .02);
  shape([[-260, -60], [250, -60], [210, 40], [-220, 40]], { fill: '#2b2a33', lw: 7, shade: () => fillOnly(rect(-300, 0, 600, 60), '#c8402f', { boil: .3 }) });
  stroke([[-250, -40], [240, -40]], 4, { line: '#f4f1ea' });
  shape(rect(30, -150, 150, 90), { fill: '#f4f1ea', lw: 7, shade: () => fillOnly(rect(120, -160, 80, 110), '#d6d0c2', { boil: .3 }) });
  for (let k = 0; k < 4; k++) shape(rect(44 + k * 32, -134, 22, 20), { fill: '#7fd0e6', lw: 4 });
  shape(rect(-120, -140, 60, 80), { fill: '#e3a72f', lw: 7 });
  shape(rect(-200, -110, 60, 50), { fill: '#3f6fd1', lw: 6 }); shape(rect(-140, -100, 50, 40), { fill: '#3fa66b', lw: 6 });
  stroke([[100, -150], [100, -210]], 5); dot(100, -214, 6, '#e8392b');
  pop();
}
function waves(y, t, x0 = -400, x1 = 1500) {
  const p = []; for (let x = x0; x <= x1; x += 60) p.push([x, y + Math.sin(x * .02 + t * 2) * 10]);
  stroke(p, 6, { line: '#e9fbff' });
}
function soil(x0, y0, w, h, cols = ['#c9ad7d', '#b8986a', '#a6865a'], seed = 1) {
  const n = cols.length; for (let i = 0; i < n; i++) fillOnly(rect(x0, y0 + h * i / n, w, h / n + 2), cols[i], { boil: 0 });
  for (let k = 0; k < Math.floor(w * h / 9000); k++) { const a = hash(k * 1.7 + seed), b = hash(k * 3.3 + seed * 2); dot(x0 + a * w, y0 + b * h, 3 + hash(k + seed) * 5, 'rgba(70,50,30,.35)'); }
}
// túnel revestido (vista lateral): anéis de concreto à direita de x0
function lining(x0, x1, cy, R, th = 30, off = 0) {
  fillOnly(rect(x0, cy - R, x1 - x0, 2 * R), '#2c2f38', { boil: 0 });
  for (const sy of [-1, 1]) {
    const y = sy < 0 ? cy - R - th : cy + R;
    shape(rect(x0, y, x1 - x0, th), { fill: PAL.concrete, lw: 6 });
    for (let x = x0 + ((off % 90) + 90) % 90; x < x1; x += 90) stroke([[x, y], [x, y + th]], 5, { line: PAL.gasket });
  }
}

// —— elenco em cena ——
const NEI = (o) => neide({ s: .95, holdR: 'mug', look: [-.4, .05], ...o });
const BOL = (o) => bolota({ s: 1.12, ...o });

// —— cabine (verde-oliva + mostarda) ——
function cabin(t, { gaugeVal = 3, lamp = 1 } = {}) {
  fillScreen('#6f7d42');
  scr();
  bands(['#808f4c', '#76854a', '#6c7a43', '#62703c'], 0, 1460, -20, W + 20);
  // teto curvo com tubos
  shape([[-20, -20], [W + 20, -20], [W + 20, 180], [W / 2, 250], [-20, 180]], { fill: '#525c30', lw: 7 });
  for (let k = 0; k < 3; k++) stroke(spline([[-20, 200 + k * 30], [W / 2, 270 + k * 30], [W + 20, 200 + k * 30]], false), 10, { line: k === 1 ? '#c8402f' : '#9aa0a6' });
  // monitor com a roda girando (VT323)
  shape(rr(90, 380, 330, 250, 18), { fill: '#3a3f2a', lw: 7 });
  shape(rr(114, 404, 282, 202, 10), { fill: '#13261b', lw: 5 });
  push(); translate(255, 505); rotate(t * .8); for (let k = 0; k < 6; k++) { rotate(TAU / 6); stroke([[0, 0], [80, 0]], 5, { line: '#6dff9b' }); } pop();
  stroke(arc(255, 505, 80, 80, 0, TAU, 30), 5, { line: '#6dff9b' });
  text('RODA: OK', 255, 590, { font: '28px "VT323"', fill: '#6dff9b' });
  // manômetro na parede
  gauge(760, 500, 120, { val: gaugeVal, t });
  // painel / chão
  fillOnly(rect(-20, 1460, W + 40, 500), '#4f5a2e', { boil: 0 });
  stroke([[-20, 1460], [W + 20, 1460]], 7);
  for (let x = 30; x < W; x += 90) stroke([[x, 1500], [x + 40, 1900]], 4, { line: '#3f4824' });
  // luz de alerta
  shape(ell(540, 330, 30, 22, 18), { fill: lamp ? '#ff9a3c' : '#8a5a2a', lw: 6 });
}

// ============ CENAS ============
// 01 — do navio até a tuneladora, 30 m abaixo
function s01(t, u, D) {
  const tun = w('01', 'tunel'), como = w('01', 'como');
  const k = eio(seg(t, .45, tun + .2));
  const cy = lerp(800, 3480, k), z = lerp(1, .74, k);
  const pz = ss(seg(t, como - .15, como + .25));            // push no Pingo em "Como?"
  cam(lerp(540, 820, pz), lerp(cy, 3330, pz), lerp(z, 1.9, pz));
  // céu, mar, fundo
  bands(['#ffd59a', '#ffc98a', '#f7b979'], -1400, 1000, -900, 2200);
  shape(ell(860, 640, 70, 70, 30), { fill: '#fff1c4', lw: 7 });
  bands(WATERS, 1000, 3000, -900, 2200);
  for (let i = 0; i < 9; i++) { const y = 1300 + i * 190, x = (hash(i) * 1600 + t * (i % 2 ? 40 : -40)) % 1800 - 300; shape(spline([[x, y], [x + 30, y - 14], [x + 60, y], [x + 30, y + 14]]), { fill: 'rgba(255,255,255,.18)', lw: 4 }); }
  waves(1000, t);
  ship(540, 1000, t);
  // marcas de profundidade
  for (let m = 1; m <= 3; m++) {
    const y = 1000 + m * 666; stroke([[-120, y], [40, y]], 6, { line: '#e9fbff' });
    text(`${m * 10} m`, 70, y, { font: '800 46px "Baloo 2"', fill: '#ffffff', align: 'left', outlineW: 9 });
  }
  soil(-900, 3000, 3100, 2200, ['#d8c08a', '#c4a874', '#b19463', '#9c8257'], 3);
  stroke(spline([[-900, 3000], [0, 2990], [800, 3008], [2200, 2996]], false), 7);
  // túnel + máquina
  lining(1150, 2300, 3560, 160, 32);
  tbm(180, 3560, 1, { t, cut: false });
  // Pingo encostado no anel, por fora
  pingo({ x: 820, y: 3404, s: .9, t, look: [-.3, .4], mouth: { o: .2, sm: -.4 }, sq: 1 - .08 * Math.sin(t * 6) });
}

// 02 — 3 bar, 30 toneladas por metro quadrado
function s02(t, u, D) {
  const tBar = w('02', 'bar', 0), tTres = w('02', 'tres'), tUmas = w('02', 'umas'), tTon = w('02', 'toneladas'), tParede = w('02', 'parede');
  if (t < tUmas - .1) {
    // insert: o manômetro sobe 0→1→3
    const v = t < tBar ? lerp(0, 1, ss(seg(t, VO['02'] + .3, tBar))) : t < tTres ? 1 : lerp(1, 3, eo(seg(t, tTres, tTres + .35)));
    const sh = t > tTres && t < tTres + .4 ? 10 : 0;
    cam(540, 960, 1, sh, t);
    bandsScreen(['#808f4c', '#76854a', '#6c7a43']);
    gauge(540, 900, 360, { val: v, t, shake: t > tTres ? .4 : 0 });
    // régua de água ao lado: 10 m = 1 bar
    push(); translate(540, 1480);
    shape(rr(-300, -60, 600, 120, 40), { fill: '#13261b', lw: 7 });
    text(t < tTres ? '10 m de água = 1 bar' : '30 m de água = 3 bar', 0, 4, { font: '44px "VT323"', fill: '#6dff9b' });
    pop();
    return;
  }
  // cabine: bloco de 30 t cai no quadrado de 1 m²
  const drop = eio(seg(t, tTon - .35, tTon + .05)), hit = t >= tTon + .05;
  const sq = hit ? 1 - .22 * Math.exp(-(t - tTon) * 6) * Math.cos((t - tTon) * 22) : 1;
  const reac = t > tParede - .2;
  if (!reac) {
    cam(540, 1080, 1.12, hit && t < tTon + .5 ? 14 : 0, t);
    cabin(t);
    // quadrado de 1 m² pintado na parede
    shape(rect(400, 1110, 280, 280), { fill: '#e9e0c4', lw: 7 }); text('1 m²', 540, 1250, { font: '800 64px "Baloo 2"', fill: INK });
    if (t > tTon - .4) {
      push(); translate(540, lerp(-200, 1110, drop)); scale(1 / sq, sq);
      shape(spline([[-170, 0], [-130, -290], [130, -290], [170, 0]]), { fill: '#4a525d', lw: 8, shade: () => fillOnly(rect(40, -300, 200, 300), '#363c45', { boil: .3 }) });
      shape(rr(-50, -340, 100, 56, 20), { fill: '#4a525d', lw: 7 });
      text('30 t', 0, -140, { font: '800 92px "Baloo 2"', fill: '#ffd23f', outlineW: 10 });
      pop();
    }
    BOL({ x: 240, y: 1500, t, nerv: hit ? 1 : .3, sweat: t, eyeS: hit ? 1.25 : 1, mouth: { o: hit ? .9 : .4, sm: -.8 }, armL: hit ? { h: [-40, -110], bend: -20 } : undefined, armR: hit ? { h: [40, -110], bend: 20 } : undefined, bob: hit ? -Math.abs(Math.sin((t - tTon) * 9)) * 30 * Math.exp(-(t - tTon) * 2) : 0 });
    NEI({ x: 860, y: 1500, t, face: -1, look: [.6, .2], lid: .55 });
  } else {
    // close de reação do Bolota
    cam(540, 1000, 2.2, 6, t);
    cabin(t);
    BOL({ x: 540, y: 1500, t, nerv: 1.2, sweat: t * 1.3, eyeS: 1.3, pupil: 2.6, mouth: { o: .3, sm: -1, w: .7 } });
  }
}

// 03 — Corte-Scópio → a roda de corte → a câmara de lama
function s03(t, u, D) {
  const fire = VO['03'] + .25, tw = w('03', 'tuneladora', 0, true) + .05, logo = w('03', 'logo');
  if (t < tw) {
    const zin = ei(seg(t, fire + .25, tw)) ;
    cam(540, lerp(1080, 820, zin), lerp(1.12, 3.2, zin), 0, t);
    cabin(t);
    const op = back(seg(t, fire, fire + .3), 1.1);
    cutWindow(540, 820, 210, { open: op, t });
    if (op > 0) { scr(); fillOnly(rect(0, 0, W, H), 'rgba(255,63,164,.10)', { boil: 0 }); cam(540, lerp(1080, 820, zin), lerp(1.12, 3.2, zin), 0, t); }
    BOL({ x: 230, y: 1500, t, nerv: .6, sweat: t, look: [.6, -.4], mouth: { o: .5, sm: -.5 } });
    const raise = ss(seg(t, VO['03'] - .2, fire));
    NEI({ x: 850, y: 1500, t, face: -1, holdR: 'scope', glow: op, scopeA: lerp(.4, -.25, raise), armR: { h: [lerp(40, 110, raise), lerp(120, -10, raise)], bend: 30 }, look: [.8, -.2] });
    swirlWipe(t, tw);
    return;
  }
  if (t < logo - .05) {
    // mundo "frente": roda de corte de frente, triturando
    bandsScreen(['#cdb489', '#c2a87c', '#b69c70', '#aa8f63']);
    cam(540, 960, 1, 3, t);
    soil(0, 0, W, H, ['#c9ad7d', '#bea270', '#b29664'], 7);
    fillOnly(ell(540, 900, 470, 470, 60), '#5a4630', { boil: .4 });
    cutterhead(540, 900, 430, { rot: t * 1.4 });
    for (let k = 0; k < 14; k++) {   // migalhas de terra voando
      const ph = (t * 1.6 + hash(k) * 3) % 1, a = hash(k * 2.3) * TAU, r = 300 + ph * 380;
      shape(ell(540 + Math.cos(a) * r, 900 + Math.sin(a) * r, 16 * (1 - ph) + 4, 12 * (1 - ph) + 3, 10), { fill: '#8a6c47', lw: 4 });
    }
    sign('discos de aço', 540, 1560, { size: 56, fill: '#d8dde2' });
    swirlWipe(t, tw);
    return;
  }
  // corte lateral: a câmara se enche de lama de bentonita
  const fillK = ss(seg(t, logo + .2, logo + 2.4));
  bandsScreen(['#cdb489', '#c2a87c', '#b69c70']);
  cam(330, 960, 2.0, 0, t);
  push(); translate(0, 0);
  soil(-200, 500, 1500, 1000, ['#c9ad7d', '#bea270', '#b29664'], 9);
  tbm(180, 960, 1, { t, cut: true });
  // nível da lama subindo dentro da câmara (por cima do desenho da câmara)
  fillOnly(rect(242, 960 - 126, 168, 252), '#2c2f38', { boil: 0 });
  fillOnly(rect(242, 960 + 126 - 252 * fillK, 168, 252 * fillK), PAL.slurry, { boil: .5 });
  for (let i = 0; i < 6; i++) if (fillK > .2) dot(262 + hash(i * 3.1) * 130, 960 + 110 - hash(i * 7.7) * 230 * fillK, 5, PAL.slurryS);
  stroke([[242, 960 + 126 - 252 * fillK], [410, 960 + 126 - 252 * fillK]], 5, { line: '#7c5a3a' });
  pop();
  if (t > w('03', 'bentonita') - .1) sign('BENTONITA', 330, 760, { size: 34, fill: '#f6e7cc', s: back(seg(t, w('03', 'bentonita') - .1, w('03', 'bentonita') + .2), 1.4) });
}

// 04 — reboco (filter cake): a lama segura a água
const GRAINS = Array.from({ length: 70 }, (_, k) => [hash(k * 1.3) * 560 - 20, hash(k * 2.9) * 2000 - 40, 26 + hash(k * 5.1) * 26]);
function faceSection(t, cake, { arrows = 0, pump_ = 0 } = {}) {
  cam(540, 960, 1, 0, t);
  fillScreen('#5aa7d6');                                    // água nos poros
  for (const [x, y, r] of GRAINS) shape(ell(x, y, r, r * .85, 18), { fill: '#d4b98a', lw: 5 });   // grãos de areia
  // câmara de lama (direita)
  fillOnly(rect(560, -20, 560, 1960), PAL.slurry, { boil: 0 });
  for (let i = 0; i < 40; i++) dot(580 + hash(i * 4.1) * 500, hash(i * 1.9) * 1920, 5, PAL.slurryS);
  // reboco crescendo para dentro do solo
  if (cake > 0) {
    const th = 60 * cake;
    const P = []; for (let y = -20; y <= 1940; y += 60) P.push([560 - th + Math.sin(y * .03) * 10 * cake, y]);
    shape([...P, [560, 1940], [560, -20]], { fill: '#6b5236', lw: 6 });
  }
  stroke([[560, -20], [560, 1940]], 7);
  if (arrows > 0) {
    const a = arrows, p = Math.sin(t * 5) * 14;
    for (const y of [520, 960, 1400]) {
      arrow(60, y, 60 + 340 * a + p, y, '#2f8fe0');
      arrow(1020, y + 70, 1020 - 340 * a + p, y + 70, '#8a6239');
    }
    text('ÁGUA', 230, 360, { font: '800 64px "Baloo 2"', fill: '#ffffff', outlineW: 10 });
    text('LAMA', 850, 360, { font: '800 64px "Baloo 2"', fill: '#ffffff', outlineW: 10 });
  }
}
function sieve(t, mud, drops) {
  cam(540, 960, 1, 0, t);
  bandsScreen(['#f3e6c8', '#ead9b6', '#e0cca4']);
  // jarra despejando água
  push(); translate(700, 360); rotate(-.6);
  shape(rr(-90, -120, 180, 240, 30), { fill: 'rgba(170,225,245,.85)', lw: 7 }); shape(spline([[90, -60], [150, -40], [150, 40], [90, 60]], false), { fill: null, lw: 7 });
  pop();
  stroke(spline([[620, 470], [590, 600], [560, 760]], false), 18, { line: '#62c6ef' });
  // peneira (vista lateral)
  const sv = [...arc(540, 820, 300, 230, 0, Math.PI, 30)];
  shape(sv, { fill: mud > .05 ? null : null, lw: 8 });
  for (let k = -5; k <= 5; k++) stroke([[540 + k * 52, 820], [540 + k * 52 * .9, 820 + Math.sqrt(Math.max(0, 1 - (k * 52 / 300) ** 2)) * 230]], 3);
  for (let k = 1; k < 5; k++) stroke(arc(540, 820, 300 * (1 - k * .02), 230 * k / 5, 0, Math.PI, 24), 3);
  if (mud > 0) shape([...arc(540, 820, 296, 226, 0, Math.PI, 30), ...arc(540, 820, 296, 226 - 50 * mud, Math.PI, 0, 30).map(([x, y]) => [x, y])], { fill: '#7a5a3a', lw: 5, alpha: mud });
  if (mud > .6) fillOnly(ell(540, 830, 250, 40, 30), 'rgba(98,198,239,.9)', { boil: .5 });
  stroke([[220, 820], [860, 820]], 8); shape(rr(860, 805, 160, 30, 12), { fill: '#c8402f', lw: 6 });
  for (let k = 0; k < 8; k++) {   // gotas passando
    const ph = (t * 1.3 + k / 8) % 1, x = 400 + hash(k) * 280, y = 1080 + ph * 600;
    if (drops > 0) shape(spline([[x, y - 18], [x + 10, y + 4], [x, y + 14], [x - 10, y + 4]]), { fill: '#62c6ef', lw: 4, alpha: drops * (1 - ph * .5) });
  }
  // tigela embaixo
  shape([...arc(540, 1600, 360, 140, 0, Math.PI, 26)], { fill: '#e8e0d0', lw: 8 });
  fillOnly(ell(540, 1600, 360, 40, 30), '#62c6ef', { boil: .4 });
  stroke(arc(540, 1600, 360, 40, 0, TAU, 40), 6);
}
function s04(t, u, D) {
  const tPres = w('04', 'pressao'), tEntra = w('04', 'entra'), tReb = w('04', 'reboco', 0, true), tComo = w('04', 'como'), tPen = w('04', 'peneira', 0, true), tAgua2 = w('04', 'agua', 1), tEmp = w('04', 'empate');
  if (t >= tComo - .05 && t < tPen + .35) {
    const mud = ss(seg(t, tComo + .5, tPen - .2));
    sieve(t, mud, 1 - mud);
    return;
  }
  const cake = ss(seg(t, tEntra, tReb + .3));
  const arrows = ss(seg(t, tPres - .1, tPres + .4));
  faceSection(t, cake, { arrows });
  // Pingo no solo: chega, empurra o reboco, quica
  const px = lerp(-120, 380, ss(seg(t, VO['04'], tPres))), push_ = t > tAgua2 ? Math.max(0, Math.sin((t - tAgua2) * 5)) : 0;
  const sqz = 1 - .25 * push_;
  pingo({ x: px + 60 * push_, y: 1120, s: 1.3, t, sq: sqz, look: [1, 0], mouth: { o: .3 + .4 * push_, sm: t > tEmp ? -1 : .5 } });
  if (t > tEmp - .05) {
    const s_ = back(seg(t, tEmp - .05, tEmp + .25), 1.6);
    push(); translate(540, 1700); scale(s_);
    shape(rr(-120, -70, 240, 40, 14), { fill: '#ffffff', lw: 7 }); shape(rr(-120, 10, 240, 40, 14), { fill: '#ffffff', lw: 7 });
    pop();
  }
}

// 05 — pressão de menos / demais / o vigia do ponteiro
function s05(t, u, D) {
  const tDes = w('05', 'desaba'), tP2 = w('05', 'pressao', 1), tEst = w('05', 'estoura'), tPor = w('05', 'por');
  if (t < tPor - .1) {
    fillScreen(INK);
    // painel de cima: de menos → o solo desaba
    reset(); g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.beginPath(); g.rect(0, 0, W, 950); g.clip();
    cam(540, 960, 1, t > tDes && t < tDes + .5 ? 8 : 0, t);
    soil(-20, 0, 600, 950, ['#c9ad7d', '#bea270', '#b29664'], 11);
    fillOnly(rect(580, 0, 520, 950), '#5a4630', { boil: 0 });
    fillOnly(rect(580, 950 - 300, 520, 300), PAL.slurry, { boil: .4 });
    const k = ss(seg(t, tDes - .3, tDes + .9));
    for (let i = 0; i < 9; i++) { const y0 = 200 + i * 60, fall = k * (500 - i * 20) * (0.6 + hash(i) * .6); shape(spline([[560 + 20 * k * i, y0 + fall], [620 + 30 * k * i + 40, y0 + fall + 10], [600 + 30 * k * i + 40, y0 + fall + 60], [550 + 20 * k * i, y0 + fall + 50]]), { fill: '#b29664', lw: 5 }); }
    stroke([[580, 0], [580, 950]], 7);
    gauge(880, 220, 120, { val: 1, t, shake: .3 });
    sign('DE MENOS', 230, 90, { size: 50, fill: '#8cc4ff' });
    g.restore();
    // painel de baixo: demais → estoura o fundo do mar
    const show = 1;
    if (show > 0) {
      reset(); g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.beginPath(); g.rect(0, 970, W, 950); g.clip();
      cam(540, 960 - (1 - show) * 950, 1, t > tEst && t < tEst + .6 ? 12 : 0, t);
      bands(WATERS.slice(0, 4), 970, 1460, -20, W + 20);
      const bulge = ss(seg(t, tEst - .5, tEst + .1)), erupt = seg(t, tEst, tEst + 1.6);
      soil(-20, 1460, W + 40, 500, ['#d8c08a', '#c4a874', '#b19463'], 13);
      shape(spline([[-20, 1460], [300, 1460], [540, 1460 - 160 * bulge], [780, 1460], [1100, 1460], [1100, 1460]], false), 7);
      if (erupt > 0) for (let i = 0; i < 16; i++) {
        const a = -Math.PI / 2 + (hash(i) - .5) * 1.2, r = erupt * (300 + hash(i * 2) * 500);
        shape(ell(540 + Math.cos(a) * r, 1300 + Math.sin(a) * r, 26 * (1 - erupt) + 8, 26 * (1 - erupt) + 8, 14), { fill: i % 3 ? '#e9fbff' : '#8a6c47', lw: 5 });
      }
      gauge(880, 1700, 120, { val: 5.6, t, shake: .5 });
      sign('DEMAIS', 200, 1060, { size: 50, fill: '#ff8a7a' });
      g.restore();
      scr(); stroke([[-10, 960], [W + 10, 960]], 14);
    }
    return;
  }
  // o vigia: Bolota colado no ponteiro
  cam(650, 540, 1.9, 0, t);
  cabin(t, { gaugeVal: 3 + Math.sin(t * 3) * .1 });
  BOL({ x: 540, y: 1080, t, s: 1.6, nerv: .5, look: [1, -.3], pupil: 2.4, eyeS: 1.2, mouth: { o: .05, sm: -.3 }, headTilt: .15 });
}

// 06 — a terra vai embora com a lama e volta limpa
function s06(t, u, D) {
  const tMis = w('06', 'mistura'), tUs = w('06', 'usina'), tSep = w('06', 'separa'), tVol = w('06', 'volta');
  const k = eio(seg(t, tMis + .2, tUs + .2));
  cam(lerp(540, 600, k), lerp(2700, 470, k), lerp(.9, 1.15, k), 0, t);
  // terra (topo) + usina
  bands(['#bfe3dc', '#a9d8cf'], -400, 600, -500, 1600);
  soil(-500, 600, 2100, 200, ['#9c8257', '#8a7350'], 2);
  fillOnly(rect(-500, 600, 2100, 16), '#5f8f4a', { boil: 0 });
  bands(WATERS, 800, 2400, -500, 1600);
  soil(-500, 2400, 2100, 900, ['#d8c08a', '#c4a874', '#b19463'], 5);
  // tubos: ida (lama suja, sobe) e volta (lama limpa, desce)
  stroke([[420, 2850], [420, 380]], 46, { line: INK }); stroke([[420, 2850], [420, 380]], 32, { line: '#7c5a3a' });
  stroke([[660, 380], [660, 2850]], 46, { line: INK }); stroke([[660, 380], [660, 2850]], 32, { line: '#d9c39a' });
  for (let i = 0; i < 18; i++) {
    const ph = (t * .35 + i / 18) % 1;
    dot(420, lerp(2850, 380, ph), 12, '#4a3524');
    if (t > tSep) dot(660, lerp(380, 2850, (ph + .5) % 1), 11, '#f6e7cc');
  }
  // usina de separação
  shape(rr(700, -40, 150, 300, 20), { fill: '#d8dde2', lw: 7, shade: () => fillOnly(rect(790, -50, 80, 320), '#b4bcc4', { boil: .3 }) });   // silo de lama limpa
  shape(ell(775, -40, 75, 20, 20), { fill: '#c4ccd4', lw: 6 });
  shape([[260, 60], [780, 60], [780, 380], [260, 380]], { fill: '#3f9c8a', lw: 7, shade: () => fillOnly(rect(560, 50, 260, 340), '#2f7d6e', { boil: .3 }) });
  shape([[300, 60], [360, -10], [470, -10], [530, 60]], { fill: '#2f7d6e', lw: 6 });                 // telhado
  for (let k = 0; k < 3; k++) shape(rect(290 + k * 90, 110, 60, 50), { fill: '#bfe9ff', lw: 5 });
  text('USINA', 540, 210, { font: '800 64px "Baloo 2"', fill: '#ffffff', outlineW: 9 });
  const shk = t > tSep ? Math.sin(t * 40) * 5 : 0;
  shape(rect(330 + shk, 300, 300, 30), { fill: PAL.steel, lw: 6 });                 // peneira vibratória
  for (let x = 350; x < 620; x += 30) stroke([[x + shk, 300], [x + shk, 330]], 3);
  // monte de terra separada
  const pile = ss(seg(t, tSep, tSep + 2));
  shape(spline([[790, 600], [880, 600 - 230 * pile - 6], [990, 600 - 120 * pile - 4], [1060, 600]]), { fill: '#8a6c47', lw: 7 });
  if (pile > .3) sign('TERRA', 925, 520 - 240 * pile, { size: 46, fill: '#f2c230' });
  for (let i = 0; i < 4; i++) if (t > tSep) { const ph = (t * 1.2 + i / 4) % 1; shape(ell(lerp(640, 900, ph), 330 + ph * ph * 230, 12, 10, 10), { fill: '#8a6c47', lw: 4 }); }
  // tuneladora lá embaixo
  lining(1000, 1700, 2850, 160, 30);
  tbm(160, 2850, 1, { t, cut: true });
  for (let i = 0; i < 6; i++) { const ph = (t * 1.5 + i / 6) % 1; shape(ell(lerp(150, 330, ph), 2850 + (hash(i) - .5) * 160, 10, 8, 8), { fill: '#8a6c47', lw: 4 }); }
}

// 07 — anéis de aduelas + borracha
function s07(t, u, D) {
  const tAd = w('07', 'aduelas', 0, true), tCada = w('07', 'cada'), tBraco = w('07', 'braco'), tEsm = w('07', 'esmaga'), tVeda = w('07', 'veda'), tDez = w('07', 'dez');
  if (t < tBraco - .1) {
    const zo = ss(seg(t, tCada, tCada + .8));
    cam(lerp(540, 540, zo), lerp(960, 600, zo), lerp(1, 2.0, zo), 0, t);
    fillScreen('#262a33');
    for (let k = 5; k >= 1; k--) { const r = 420 * Math.pow(.62, k); stroke(arc(540, 960, r, r, 0, TAU, 40), 6, { line: '#4a505c' }); }
    // aduelas chegando uma a uma
    const n = 7, t0 = VO['07'] + .2, step = (tAd - t0) / n;
    for (let i = 0; i < n; i++) {
      const p = eo(seg(t, t0 + i * step, t0 + (i + .8) * step)); if (p <= 0) continue;
      const key = i === 6, a0 = key ? TAU - .3 : i * (TAU - .3) / 6, a1 = key ? TAU : (i + 1) * (TAU - .3) / 6;
      const R = lerp(150, 430, p), r0 = R - 90;
      push(); translate(540, 960); rotate(-Math.PI / 2 + (1 - p) * .6);
      shape([...arc(0, 0, R, R, a0 + .01, a1 - .01, 12), ...arc(0, 0, r0, r0, a1 - .01, a0 + .01, 12)], { fill: key ? '#d6b48a' : PAL.concrete, lw: 6, shade: () => fillOnly(ell(60, 80, 420, 420, 30), PAL.concreteS, { boil: .3 }) });
      const gw = 7 + (t > tCada ? 6 * (.5 + .5 * Math.sin(t * 10)) : 0);
      for (const a of [a0 + .01, a1 - .01]) stroke([[Math.cos(a) * r0, Math.sin(a) * r0], [Math.cos(a) * R, Math.sin(a) * R]], gw, { line: PAL.gasket });
      pop();
    }
    // braço montador (eretor) no centro
    const ang = t * 1.2;
    push(); translate(540, 960); rotate(ang);
    shape(rr(-30, -30, 260, 60, 20), { fill: PAL.yellow, lw: 7 });
    shape(ell(0, 0, 70, 70, 30), { fill: PAL.steel, lw: 7 });
    pop();
    if (t > tCada) sign('borracha', 540, 380, { size: 40, fill: '#ffd23f', s: back(seg(t, tCada, tCada + .3), 1.4) });
    return;
  }
  // detalhe da junta apertando — Pingo tenta passar e é expulso
  const sq = ss(seg(t, tEsm - .3, tEsm + .2));
  bandsScreen(['#7d8590', '#737b86', '#69717c']);
  cam(540, 960, 1, t > tEsm && t < tEsm + .3 ? 8 : 0, t);
  gasketDetail(540, 1000, 2.8, { squeeze: sq });
  const out = seg(t, tVeda, tVeda + .7);
  const px = 540, py = out > 0 ? lerp(760, 300, eo(out)) : 760;
  pingo({ x: px + out * 260, y: py, s: 1.1 * (1 - .5 * sq * (1 - out)), sq: 1 - .3 * sq * (1 - out), t, look: [0, 1], mouth: { o: .4 + .4 * sq, sm: out > 0 ? -1 : .3 } });
  if (t > tDez - .05) sign('10 bar', 540, 1500, { size: 96, fill: '#ffd23f', rot: -.08, s: back(seg(t, tDez - .05, tDez + .25), 1.8) });
}

// 08 — macacos hidráulicos: um anel de cada vez
function s08(t, u, D) {
  const tMac = w('08', 'macacos'), tAv = w('08', 'avanca');
  const t0 = tMac, cyc = (VO['08'] + DURS['08'] - t0) / 2;
  const c = clamp((t - t0) / cyc, 0, 1.999), ci = Math.floor(c), f = c - ci;
  const ext = t < t0 ? 0 : f < .6 ? ss(f / .6) : 1 - ss((f - .6) / .4);
  const RW = 110, adv = (t < t0 ? 0 : ci + ss(Math.min(f, .6) / .6)) * RW;   // quanto a máquina já andou
  cam(620, 960, .85, 0, t);
  soil(-600, -300, 2600, 2600, ['#c9ad7d', '#bea270', '#b29664'], 17);
  // anéis à direita (os novos aparecem conforme a máquina anda)
  const xr = 700 - adv + RW * ci;
  lining(xr + 40 * ext, 1700, 960, 170, 34);
  // máquina andando para a esquerda
  const xm = -380 - adv;
  shape(rr(xm + 60, 960 - 190, 940, 380, 30), { fill: PAL.yellow, lw: 8, shade: () => fillOnly(rect(xm, 1030, 1100, 200), PAL.yellowS, { boil: .3 }) });
  shape(rr(xm + 20, 960 - 210, 60, 420, 18), { fill: PAL.dark, lw: 8 });
  for (let k = -4; k <= 4; k++) shape(ell(xm + 14, 960 + k * 46 + ((t * 120) % 46), 12, 16, 12), { fill: PAL.disc, lw: 5 });
  // macacos (cilindros + pistões) empurrando o último anel
  const xb = xm + 1000 - 220;
  for (const y of [960 - 120, 960, 960 + 120]) {
    shape(rr(xb - 60, y - 26, 180, 52, 12), { fill: PAL.steelS, lw: 6 });
    const pl = 120 * ext + (xr - (xb + 120)) * (1 - ext) * 0;
    shape(rect(xb + 120, y - 14, Math.max(8, xr + 40 * ext - xb - 120), 28), { fill: '#e3e7ea', lw: 5 });
  }
  // migalhas na frente
  for (let i = 0; i < 6; i++) { const ph = (t * 2 + i / 6) % 1; shape(ell(xm - ph * 60, 960 + (hash(i) - .5) * 300, 10, 8, 8), { fill: '#8a6c47', lw: 4 }); }
  // contador de anéis
  const nAn = t < t0 ? 0 : ci + (f > .6 ? 1 : 0);
  for (let k = 0; k < 2; k++) { push(); translate(380 + k * 160, 1500); shape(ell(0, 0, 60, 60, 24), { fill: k < nAn ? PAL.concrete : 'rgba(255,255,255,.15)', lw: 6 }); fillOnly(ell(0, 0, 34, 34, 20), '#b29664', { boil: .3 }); stroke(arc(0, 0, 34, 34, 0, TAU, 20), 5); pop(); }
  if (nAn > 0) text('+1 anel', 540 + 160, 1640, { font: '800 72px "Baloo 2"', fill: '#ffffff', outlineW: 9 });
  if (t < tMac) { scr(); sign('E PRA ANDAR?', 540, 360, { size: 60, fill: '#ffd23f' }); }
}

// 09 — cauda: escovas com graxa + argamassa
function s09(t, u, D) {
  const tFil = w('09', 'fileiras'), tGrax = w('09', 'graxa'), tPor = w('09', 'por'), tInj = w('09', 'injeta'), tCola = w('09', 'cola');
  const pan = ss(seg(t, VO['09'], tFil));
  cam(lerp(300, 560, pan), 900, lerp(.8, 1.15, pan), 0, t);
  soil(-800, -500, 2800, 1180, ['#c9ad7d', '#bea270', '#b29664'], 21);
  // vão (anel de folga) entre o solo e o anel de concreto
  fillOnly(rect(-600, 680, 2400, 90), '#3a3530', { boil: 0 });
  // argamassa preenchendo o vão da esquerda para a direita
  const gr = ss(seg(t, tInj, tCola + .3));
  if (gr > 0) shape(rect(380, 680, 1400 * gr, 90), { fill: '#9a9a96', lw: 6, shade: () => { for (let i = 0; i < 20; i++) dot(400 + hash(i) * 1300 * gr, 700 + hash(i * 3) * 60, 4, '#7a7a76'); } });
  // anel de concreto
  shape(rect(-600, 770, 2400, 140), { fill: PAL.concrete, lw: 7 });
  for (let x = -560; x < 1800; x += 180) stroke([[x, 770], [x, 910]], 6, { line: PAL.gasket });
  fillOnly(rect(-800, 910, 2800, 1500), '#2c2f38', { boil: 0 });
  // chapa do escudo (aço) cobrindo o anel até a cauda
  shape(rect(-600, 640, 1000, 60), { fill: PAL.yellow, lw: 7 });
  // escovas + graxa
  for (let r = 0; r < 3; r++) {
    const bx = 120 + r * 90;
    shape(rect(bx - 30, 700, 70, 70), { fill: PAL.grease, lw: 5, alpha: ss(seg(t, tFil + r * .2, tFil + r * .2 + .4)) });
    for (let k = 0; k < 6; k++) stroke([[bx - 20 + k * 10, 700], [bx - 26 + k * 10, 770]], 3, { line: '#20242a' });
  }
  // bico de injeção
  shape(rr(330, 600, 60, 100, 10), { fill: PAL.steelS, lw: 6 });
  if (gr > 0 && gr < 1) for (let i = 0; i < 3; i++) { const ph = (t * 3 + i / 3) % 1; dot(390 + ph * 60, 725, 10, '#9a9a96'); }
  // Pingo: tenta entrar pela cauda, atola na graxa, é empurrado pela argamassa
  let px = lerp(1300, 300, ss(seg(t, VO['09'] + .3, tGrax))), py = 725, st = 0;
  if (t > tGrax) st = 1;
  if (t > tInj) { const k = ss(seg(t, tInj, tCola)); px = lerp(300, 1100, k); py = lerp(725, 560, k); }
  pingo({ x: px, y: py + 40, s: .8, t, sq: st && t < tInj ? .8 + .05 * Math.sin(t * 12) : 1, look: [-1, 0], mouth: { o: st ? .6 : .3, sm: st ? -1 : .6 } });
  if (st && t < tInj + .3) for (let i = 0; i < 4; i++) shape(ell(px - 20 + i * 12, py + 20 + Math.sin(t * 8 + i) * 4, 9, 7, 8), { fill: PAL.grease, lw: 3 });
  if (t > tGrax - .1 && t < tPor) { scr(); sign('GRAXA', 300, 1500, { size: 60, fill: '#b8a6ff' }); }
  if (t > tInj) { scr(); sign('ARGAMASSA', 540, 1500, { size: 60, fill: '#e3e3dc', s: back(seg(t, tInj, tInj + .3), 1.4) }); }
}

// 10a — "nem uma gota mesmo?" + o silêncio + a gota
function s10a(t, u, D) {
  const end = VO['10a'] + DURS['10a'], fall = end + .25, land = fall + .5;
  const push_ = ss(seg(t, end, VO['10b']));
  cam(lerp(540, 330, push_), lerp(1080, 900, push_), lerp(1.12, 1.9, push_), 0, t);
  cabin(t);
  const hitK = t > land;
  BOL({ x: 300, y: 1500, t, nerv: hitK ? .2 : 0, eyeS: hitK ? 1.35 : 1, pupil: hitK ? 2.4 : 3.4, look: hitK ? [0, -1] : [.4, 0], mouth: hitK ? { o: 0, sm: -.2 } : { o: .2, sm: .9 }, brow: hitK ? 1.4 : .2 });
  NEI({ x: 840, y: 1500, t, face: -1, look: [-.6, .1], armR: { h: [60, t < end ? 30 : 90], bend: 30 } });
  if (t > fall) {
    const k = clamp((t - fall) / .5, 0, 1);
    if (k < 1) shape(spline([[300, lerp(260, 1050, k * k) - 16], [309, lerp(260, 1050, k * k) + 4], [300, lerp(260, 1050, k * k) + 12], [291, lerp(260, 1050, k * k) + 4]]), { fill: '#7fdcff', lw: 5 });
    else pingo({ x: 300, y: 1090, s: .35, t, look: [.6, .2], mouth: { o: .3, sm: .9 }, sq: 1 - .25 * Math.exp(-(t - land) * 6) * Math.cos((t - land) * 20) });
  }
}

// 10b — infiltração planejada: canaleta → poço → bomba
function s10b(t, u, D) {
  const tCan = w('10b', 'canaletas'), tPoco = w('10b', 'poco'), tBom = w('10b', 'bombas'), tMar = w('10b', 'mar', 1);
  if (t < tCan - .1) {
    // túnel por dentro: algumas manchinhas de umidade
    cam(540, 960, 1, 0, t);
    fillScreen('#1c2b3a');
    for (let k = 6; k >= 0; k--) { const r = 520 * Math.pow(.7, k); shape(ell(540, 960, r, r, 48), { fill: k % 2 ? '#a9b0b8' : '#b8bec5', lw: 6 }); }
    fillOnly(ell(540, 960, 60, 60, 20), '#0e1620', { boil: .2 });
    shape([[180, 1360], [900, 1360], [600, 1010], [480, 1010]], { fill: '#5d6672', lw: 6 });           // piso
    stroke([[480, 1010], [330, 1460]], 5); stroke([[600, 1010], [750, 1460]], 5);                        // trilhos
    const n = 7;
    for (let i = 0; i < n; i++) {
      const a = -Math.PI * .9 + i * .3, r = 470, x = 540 + Math.cos(a) * r, y = 960 + Math.sin(a) * r;
      const on = ss(seg(t, VO['10b'] + .6 + i * .25, VO['10b'] + .9 + i * .25));
      if (on > 0) { shape(ell(x, y, 22 * on, 14 * on, 12), { fill: 'rgba(98,198,239,.75)', lw: 4 }); const ph = (t * .9 + i * .3) % 1; shape(spline([[x, y + 20 + ph * 80 - 12], [x + 7, y + 20 + ph * 80 + 4], [x, y + 20 + ph * 80 + 12], [x - 7, y + 20 + ph * 80 + 4]]), { fill: '#62c6ef', lw: 3, alpha: on }); }
    }
    sign('UM POUQUINHO', 540, 1700, { size: 56, fill: '#8cd9ff', s: back(seg(t, VO['10b'] + .8, VO['10b'] + 1.1), 1.4) });
    return;
  }
  // corte lateral: canaleta inclinada → poço → bomba → tubo para o mar
  const slide = ss(seg(t, tCan, tPoco + .3)), suckK = seg(t, tBom, tBom + .6), up = eo(seg(t, tBom + .5, tMar + .4));
  cam(540, lerp(1100, 900, up), 1, 0, t);
  fillScreen('#262a33');
  bands(['#3c4552', '#343c48'], 300, 1300, -20, W + 20);
  // canaleta inclinada
  shape([[-40, 900], [700, 1160], [700, 1200], [-40, 940]], { fill: '#8e99a5', lw: 7 });
  const flowY = x => 900 + (x + 40) / 740 * 260;
  for (let i = 0; i < 6; i++) { const ph = (t * .8 + i / 6) % 1, x = -40 + ph * 740; shape(ell(x, flowY(x) + 8, 22, 6, 10), { fill: '#62c6ef', lw: 3 }); }
  // poço + bomba
  translate(0, 0);
  pump(820, 1360, 1.15, { t, on: t > tBom ? 1 : 0 });
  // tubo subindo para o mar
  stroke([[990, 1060], [990, -400]], 44, { line: INK }); stroke([[990, 1060], [990, -400]], 30, { line: '#d0d4d8' });
  // Pingo escorregando, sugado, subindo
  let px, py, sc = .7, rot_ = 0;
  if (t < tBom) { const x = lerp(-60, 760, slide); px = x; py = flowY(Math.min(x, 700)) + (x > 700 ? (x - 700) * 3 : 0); rot_ = .3; }
  else if (suckK < 1) { px = lerp(760, 820, suckK); py = lerp(1240, 1400, suckK); sc = .7 * (1 - .5 * suckK); }
  else { px = 990; py = lerp(1060, -300, up); sc = .5; }
  push(); translate(px, py); rotate(rot_);
  pingo({ x: 0, y: 0, s: sc, t, look: [.6, -.3], mouth: { o: .6, sm: t < tBom ? .9 : -.6 } });
  pop();
  if (t > tPoco - .1 && t < tBom) sign('POÇO', 820, 1720, { size: 52, fill: '#9ef0d8' });
  if (t > tBom - .05) sign('BOMBA', 640, 820, { size: 52, fill: '#9ef0d8', s: back(seg(t, tBom - .05, tBom + .25), 1.4) });
}

// 11 — Pingo de volta ao mar; a água nunca ganha
function s11(t, u, D) {
  const tSo = w('11', 'so');
  if (t < tSo - .1) {
    cam(540, 960, 1, 0, t);
    bandsScreen(['#ffd59a', '#ffc98a'], 0, 700);
    bandsScreen(WATERS.slice(0, 5), 700, H);
    waves(700, t, -50, 1150);
    const k = seg(t, VO['11'] - .2, tSo - .3);
    const x = lerp(160, 760, k), y = 1500 - Math.sin(k * Math.PI) * 1250;
    stroke([[160, 1940], [160, 1560]], 44, { line: INK }); stroke([[160, 1940], [160, 1560]], 30, { line: '#d0d4d8' });
    if (k < .95) { push(); translate(x, y); rotate(k * TAU * 1.5); pingo({ x: 0, y: 0, s: .9, t, look: [0, -1], mouth: { o: .9, sm: -.5 } }); pop(); }
    else { pingo({ x: 760, y: 780, s: .9, t, look: [-.6, .2], mouth: { o: .1, sm: -1 }, lid: .35 }); for (let i = 0; i < 6; i++) { const a = -Math.PI * (.15 + i * .14); dot(760 + Math.cos(a) * 140, 720 + Math.sin(a) * 90, 10, '#e9fbff'); } }
    return;
  }
  // close da Neide: brinde impassível
  cam(820, 900, 1.7, 0, t);
  cabin(t);
  NEI({ x: 840, y: 1500, t, face: -1, look: [-1, .1], lid: .6, armR: { h: [80, lerp(60, -40, ss(seg(t, tSo + .3, tSo + .9)))], bend: 40 } });
}

// 12 — chamada: CURIOSO SOH
function s12(t, u, D) {
  const tCur = w('12', 'curioso');
  cam(540, 960, 1, 0, t);
  bandsScreen(['#3a2a52', '#33254a', '#2c2041', '#251b38']);
  cutWindow(540, 760, 330, { open: back(seg(t, VO['12'] - .25, VO['12'] + .1), 1.1), t });
  scr(); fillOnly(rect(0, 0, W, H), 'rgba(255,63,164,.08)', { boil: 0 });
  // elenco na frente
  BOL({ x: 290, y: 1720, t, s: .95, look: [.4, -.5], mouth: { o: .3, sm: 1 }, brow: 0, armR: { h: [40, -110], bend: 20 } });
  NEI({ x: 800, y: 1720, t, face: -1, s: .8, look: [-.3, -.4], armR: { h: [80, -20], bend: 40 } });
  pingo({ x: 545, y: 1700, s: 1.1, t, look: [0, -.6], mouth: { o: .5, sm: 1 }, sq: 1 + .06 * Math.sin(t * 9) });
  // textos
  const a = back(seg(q(t), VO['12'] - .1, VO['12'] + .3), 1.6);
  if (a > 0) text('se gostou, comenta:', 540, 320, { font: `800 ${Math.round(70 * a)}px "Baloo 2"`, fill: '#ffffff', outlineW: 12 });
  const b = back(seg(q(t), tCur - .1, tCur + .25), 1.8);
  if (b > 0) {
    push(); translate(540, 760); rotate(-.05 + Math.sin(q(t) * 3) * .015); scale(b);
    text('CURIOSO', 0, -80, { font: '150px "Titan One"', fill: '#ffd23f', outlineW: 26 });
    text('SOH', 0, 110, { font: '210px "Titan One"', fill: '#ff8fd0', outlineW: 30 });
    pop();
  }
}

const FN = { '01': s01, '02': s02, '03': s03, '04': s04, '05': s05, '06': s06, '07': s07, '08': s08, '09': s09, '10a': s10a, '10b': s10b, '11': s11, '12': s12 };
window.DUR = END;
window.render = (t) => {
  frame(t);
  fillScreen('#000');
  const sc = SC.find(([, a, b]) => t >= a && t < b) || SC[SC.length - 1];
  FN[sc[0]](t, t - sc[1], sc[2] - sc[1]);
};

// —— eventos de som (exportados por events.mjs) ——
const EV = [];
const ev = (type, t, o = {}) => EV.push({ type, t: +t.toFixed(3), ...o });
for (const id of ORDER) ev('vo', VO[id], { id });
for (const [id, a, b] of SC) ev('scene', a, { id, d: +(b - a).toFixed(3) });
ev('cue', 0, { name: 'abertura', t0: 0, t1: VO['03'] - .2 });
ev('cue', VO['03'] - .2, { name: 'explica', t0: VO['03'] - .2, t1: VO['10a'] + DURS['10a'] });
ev('cue', VO['10b'] - .1, { name: 'dreno', t0: VO['10b'] - .1, t1: VO['12'] - .3 });
ev('cue', VO['12'] - .3, { name: 'final', t0: VO['12'] - .3, t1: END });
// foley
ev('waves', 0, { d: w('01', 'tunel') }); ev('dive', .5);
ev('squish', w('01', 'como') + .1);
ev('clunk', w('02', 'bar')); ev('clunk', w('02', 'tres')); ev('clunk', w('02', 'tres') + .12);
ev('whistleFall', w('02', 'toneladas') - .4); ev('slam', w('02', 'toneladas') + .05); ev('jitter', w('02', 'parede') - .2);
ev('portalOpen', VO['03'] + .25); ev('portalWhoosh', w('03', 'tuneladora', 0, true) - .2);
ev('grind', w('03', 'tuneladora', 0, true) + .05, { d: w('03', 'logo') - w('03', 'tuneladora', 0, true) });
ev('gurgle', w('03', 'logo') + .2); ev('pop', w('03', 'bentonita'));
ev('squish', w('04', 'agua', 1)); ev('squish', w('04', 'agua', 1) + .6); ev('pour', w('04', 'como'), { d: 1.6 }); ev('ding', w('04', 'empate'));
ev('crumble', w('05', 'desaba') - .2); ev('geyser', w('05', 'estoura')); ev('tick', w('05', 'por'), { d: DURS['05'] - (w('05', 'por') - VO['05']) });
ev('pipeflow', VO['06'], { d: DURS['06'] }); ev('shaker', w('06', 'separa'), { d: VO['06'] + DURS['06'] - w('06', 'separa') });
{ const t0 = VO['07'] + .2, step = (w('07', 'aduelas', 0, true) - t0) / 7; for (let i = 0; i < 7; i++) ev('clack', t0 + (i + .8) * step); }
ev('squish', w('07', 'esmaga')); ev('boing', w('07', 'veda')); ev('stamp', w('07', 'dez'));
{ const t0 = w('08', 'macacos'), cyc = (VO['08'] + DURS['08'] - t0) / 2; for (let c = 0; c < 2; c++) { ev('hydraulic', t0 + c * cyc, { d: cyc * .6 }); ev('clack', t0 + c * cyc + cyc * .62); } }
ev('glorp', w('09', 'graxa')); ev('grout', w('09', 'injeta'), { d: w('09', 'cola') - w('09', 'injeta') + .3 });
ev('plip', VO['10a'] + DURS['10a'] + .75); ev('drip', VO['10b'] + .6, { d: 2.2 });
ev('slide', w('10b', 'canaletas'), { d: w('10b', 'poco') - w('10b', 'canaletas') + .3 }); ev('splash', w('10b', 'poco') + .3);
ev('pumpRun', w('10b', 'bombas'), { d: 2.2 }); ev('suck', w('10b', 'bombas'));
ev('wheee', VO['11'] - .1, { d: w('11', 'so') - VO['11'] - .2 }); ev('splash', w('11', 'so') - .35); ev('cupSet', w('11', 'so') + .9);
ev('portalOpen', VO['12'] - .25); ev('titleHit', w('12', 'curioso'));
// ambiências por mundo
for (const [id, a, b] of SC) ev('amb', a, { d: +(b - a).toFixed(3), w: { '01': 'sea', '02': 'cabin', '03': 'machine', '04': 'machine', '05': 'machine', '06': 'machine', '07': 'tunnel', '08': 'machine', '09': 'machine', '10a': 'cabin', '10b': 'tunnel', '11': 'sea', '12': 'none' }[id] });
EV.sort((a, b) => a.t - b.t);
window.EV = EV;

await document.fonts.ready;
await Promise.all(['150px "Titan One"', '800 40px "Baloo 2"', '28px "VT323"'].map(f => document.fonts.load(f)));
window.READY = true;
