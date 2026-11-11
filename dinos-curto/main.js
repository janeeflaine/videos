// "Cadê os dinossauros?" (versão curta, ≤ 20 s) — Sci-Fi Sitcom Toon, 1080×1920
import { clamp, lerp, seg, ss, eo, ei, eio, back, hash, TAU } from '/core/lib.js';
import { W, H, INK, init, frame, g, push, pop, translate, rotate, scale, shape, fillOnly, stroke, ell, arc, rr, rect, spline, dot, text, noodle, reset, bands, quad } from './toon.js';
import { noe, rex, bird, raptorShadow, ampulheta, portal, arca, ramp, giraffe, elephant, turtle, asteroid, fossil, clipboard, sweat, eye, PAL } from './cast.js';
import { build, ORDER } from './story.js';

init(document.getElementById('c'));
const J = async f => { try { const r = await fetch(f); if (r.ok) return await r.json(); } catch (e) { } return null; };
const DURS = await J('voices/dur.json'), WORDS = (await J('voices/words.json')) || {}, ENV = (await J('voices/env.json')) || {};
const { VO, END, w, SC } = build(DURS, WORDS);
const T66 = w('02', '66') - .15;
const q = t => Math.floor(t * 12 + 1e-6) / 12;
const endOf = id => VO[id] + DURS[id];
const SCS = Object.fromEntries(SC.map(([id, a, b]) => [id, [a, b]]));

// —— lip-sync: abertura da boca a partir do áudio da fala, amostrada no desenho de 12 fps ——
function lip(id, t, k = 1) {
  const e = ENV[id]; if (!e) return { o: 0 };
  const i = Math.floor((q(t) - VO[id]) * 24); if (i < 0 || i >= e.o.length) return { o: 0 };
  return { o: e.o[i] * k, w: .75 + e.w[i] * .5 };
}
const loud = (id, t) => lip(id, t).o;

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
function sign(str, x, y, { size = 54, fill = '#ffd23f', col = INK, rot = 0, s = 1, font = 'Baloo 2', weight = '800' } = {}) {
  if (s <= 0) return;
  push(); translate(x, y); rotate(rot); scale(s);
  const f = `${weight} ${size}px "${font}"`; g.font = f; const tw = g.measureText(str).width;
  shape(rr(-tw / 2 - 26, -size * .62, tw + 52, size * 1.24, size * .4), { fill, lw: 6 });
  text(str, 0, 2, { font: f, fill: col });
  pop();
}
const popIn = (t, a, d = .3, o = 1.6) => back(seg(q(t), a, a + d), o);
function swirlWipe(t, tc, half = .28) {
  const d = Math.abs(t - tc); if (d > half) return;
  const k = 1 - d / half, r = k * 1300;
  scr(); push(); translate(W / 2, H / 2);
  fillOnly(ell(0, 0, r, r, 64), PAL.glow, { boil: .6 });
  for (let i = 0; i < 5; i++) { push(); rotate(t * 7 + i * TAU / 5); stroke(spline([[0, 0], [r * .25, -r * .2], [r * .55, -r * .12], [r * .8, r * .15]], false), 16, { line: PAL.glowD }); pop(); }
  fillOnly(ell(0, 0, r * .25, r * .25, 30), PAL.glowL, { boil: .4 });
  pop();
}
// etiqueta de terminal retrô (VT323), digitada
function tag(str, t, t0, { y = 170, col = '#ffe36a', bg = 'rgba(20,14,30,.82)' } = {}) {
  if (t < t0) return;
  const n = Math.min(str.length, Math.floor((t - t0) * 24));
  scr(); g.font = '64px "VT323"'; const tw = g.measureText(str).width;
  shape(rr(540 - tw / 2 - 30, y - 50, tw + 60, 100, 10), { fill: bg, lw: 6 });
  text(str.slice(0, n) + (Math.floor(t * 3) % 2 ? '█' : ' '), 540 - tw / 2, y + 4, { font: '64px "VT323"', fill: col, align: 'left' });
}
const speedLines = (t, n = 16, col = 'rgba(255,255,255,.7)') => { scr(); for (let i = 0; i < n; i++) { const y = hash(i * 3.7 + Math.floor(t * 12)) * H, x = hash(i * 1.3 + Math.floor(t * 12)) * W; stroke([[x, y], [x - 260, y]], 5, { line: col }); } };

// —— mundo 1: arca na chuva (azul-ardósia + madeira ocre) ——
const flashAt = t => { const k = Math.floor(t * 1.1); return hash(k * 7.3) > .84 && (t * 1.1 - k) < .12; };
function rainSky(t, { flash = true } = {}) {
  fillScreen('#3e4d6b');
  bands(['#2f3a52', '#36435f', '#3e4d6b', '#46577a', '#4e6187'], -1400, 1300, -3000, 4000);
  for (let i = 0; i < 6; i++) { const x = ((i * 420 + t * 25) % 2200) - 600, y = 150 + (i % 3) * 120; shape(spline([[x - 180, y], [x - 130, y - 70], [x - 20, y - 100], [x + 100, y - 80], [x + 190, y - 10], [x + 130, y + 34], [x - 160, y + 34]]), { fill: '#2b3448', lw: 6 }); }
  if (flash && flashAt(t)) { stroke([[760, -50], [720, 180], [800, 220], [730, 460]], 10, { line: '#fff6c8' }); scr(); fillOnly(rect(0, 0, W, H), 'rgba(255,255,255,.2)', { boil: 0 }); }
}
function rain(t, n = 70, a = .3, alpha = .5) {
  scr();
  for (let i = 0; i < n; i++) { const x = (hash(i) * 1400 + t * 260) % 1400 - 160, y = (hash(i * 3.1) * 2100 + t * 1700) % 2100 - 100; stroke([[x, y], [x - 60 * a, y + 70]], 3, { line: `rgba(220,230,255,${alpha})` }); }
}
const waveY = (x, t, A = 20) => Math.sin(x * .006 - t * 1.4) * A + Math.sin(x * .013 + t * 2.1) * A * .35;
function water(t, y0, { A = 20, cols = ['#3d6f8f', '#335f7d', '#2a506b'], x0 = -1500, x1 = 2600, foam = true } = {}) {
  const top = []; for (let x = x0; x <= x1; x += 40) top.push([x, y0 + waveY(x, t, A)]);
  shape([...top, [x1, y0 + 3000], [x0, y0 + 3000]], { fill: cols[0], lw: 7, shade: () => { for (let i = 1; i < cols.length; i++) fillOnly(rect(x0 - 100, y0 + A + i * 120, x1 - x0 + 200, 3000), cols[i], { boil: 0 }); } });
  if (foam) for (let x = x0; x <= x1; x += 160) { const y = y0 + waveY(x, t, A); if (waveY(x + 20, t, A) < waveY(x, t, A) - 3) shape(ell(x, y - 3, 22, 8, 12), { fill: '#e9f4ff', lw: 4 }); }
}
// parede da casinha da arca + piso do convés (planos médios)
function deck(t, { win = true, floorY = 1560, lamp = false } = {}) {
  fillScreen(PAL.woodL);
  for (let i = 0; i < 40; i++) fillOnly(rect(-2000, -800 + i * 70, 5000, 6), PAL.wood, { boil: .2 });
  if (win) {
    shape(rr(560, 420, 380, 300, 14), { fill: '#3e4d6b', lw: 8 });
    stroke([[750, 420], [750, 720]], 10); stroke([[560, 570], [940, 570]], 10);
    for (let i = 0; i < 6; i++) { const x = 580 + hash(i) * 340, y = 440 + ((hash(i * 2) * 260 + t * 500) % 260); stroke([[x, y], [x - 8, y + 26]], 3, { line: 'rgba(220,230,255,.6)' }); }
  }
  if (lamp) { stroke([[260, 300], [260, 380]], 5); shape(rr(220, 380, 80, 90, 14), { fill: '#ffe9a0', lw: 6 }); fillOnly(ell(260, 430, 160, 140, 30), 'rgba(255,233,160,.18)', { boil: .5 }); }
  shape(rect(-2000, floorY, 5000, 1200), { fill: PAL.wood, lw: 8, shade: () => { for (let i = 0; i < 10; i++) fillOnly(rect(-2000, floorY + 40 + i * 70, 5000, 6), PAL.woodS, { boil: .2 }); } });
}

// —— mundo 2: Cretáceo (laranja-queimado + verde-petróleo) ——
function sauropod(x, y, s, col, t, ph = 0) {
  push(); translate(x, y); scale(s);
  const st = Math.sin(t * 3 + ph) * 14;
  for (const [lx, p] of [[-90, 0], [-40, 1], [60, 0], [110, 1]]) fillOnly(rr(lx - 22 + (p ? st : -st), -150, 44, 150, 14), col, { boil: .5 });
  fillOnly(ell(10, -190, 170, 90, 24), col, { boil: .5 });
  fillOnly(noodle([140, -230], [300, -470 + Math.sin(t * 1.5 + ph) * 10], -40, 60, 34), col, { boil: .5 });
  fillOnly(ell(312, -480 + Math.sin(t * 1.5 + ph) * 10, 46, 26, 16), col, { boil: .5 });
  fillOnly(noodle([-140, -200], [-380, -120], 30, 70, 10), col, { boil: .5 });
  pop();
}
function pterosaur(x, y, s, col, t) {
  push(); translate(x, y); scale(s); const f = Math.sin(t * 6) * 30;
  fillOnly([[0, 0], [-120, -40 - f], [-40, 6], [40, 6], [120, -40 - f]], col, { boil: .5 }); fillOnly([[30, -6], [80, -14], [40, 6]], col, { boil: .5 });
  pop();
}
function fern(x, y, s, col, t, ph = 0) {
  push(); translate(x, y); scale(s);
  for (let i = 0; i < 7; i++) { const a = -Math.PI / 2 + (i - 3) * .32 + Math.sin(t * 1.5 + ph + i) * .04; push(); rotate(a + Math.PI / 2); shape(spline([[0, 0], [-34, -120], [0, -260], [34, -120]]), { fill: col, lw: 6, shade: () => fillOnly(rect(0, -300, 60, 320), 'rgba(0,0,0,.15)', { boil: .3 }) }); pop(); }
  pop();
}
function volcano(x, y, s, t, boom = 0) {
  push(); translate(x, y); scale(s);
  shape([[-300, 0], [-70, -380], [70, -380], [300, 0]], { fill: '#6b3b2e', lw: 7, shade: () => fillOnly([[0, -400], [80, -400], [320, 20], [100, 20]], '#4f2a21', { boil: .3 }) });
  shape(spline([[-60, -380], [-20, -330], [20, -320], [60, -380]], false), { fill: null, lw: 6 });
  fillOnly(spline([[-50, -375], [50, -375], [30, -300], [-20, -330]]), '#ff5a1f', { boil: .5 });
  for (let i = 0; i < 4; i++) { const k = (t * .25 + i / 4) % 1, r = 50 + k * 120 + boom * 80; shape(ell(Math.sin(i * 2) * 40 + k * 60, -420 - k * 420 - boom * 200, r, r * .8, 18), { fill: `rgba(90,70,80,${.85 - k * .5})`, lw: 5 }); }
  pop();
}
function creta(t, { boom = 0, dinos = true, pal = 0 } = {}) {
  fillScreen('#ffb35a');
  bands(['#ffd27a', '#ffbf63', '#ffa955', '#f99248', '#f2843a'], -1200, 1250, -3000, 4000);
  shape(ell(820, 420, 110, 110, 40), { fill: '#fff1c4', lw: 7 });
  volcano(180, 1280, .9, t, boom);
  if (dinos) { sauropod(700, 1300, .55, '#a04a35', t); sauropod(1050, 1320, .4, '#a04a35', t, 2); pterosaur(400 + (t * 40) % 900, 520, .5, '#8a3e2f', t); pterosaur(900 - (t * 30) % 900, 640, .35, '#8a3e2f', t + 1); }
  shape(rect(-2000, 1280, 5000, 1400), { fill: '#1f5f5a', lw: 8, shade: () => fillOnly(rect(-2000, 1500, 5000, 1400), '#174b47', { boil: .2 }) });
  for (let i = 0; i < 6; i++) fern(-100 + i * 260, 1330 + (i % 2) * 30, .7 + (i % 3) * .1, i % 2 ? '#2a8a7a' : '#21766a', t, i);
}

// —— mundo 3: espaço / impacto (anil + laranja-fogo) ——
function space(t) {
  fillScreen('#1c1a4a'); bandsScreen(['#16143c', '#1c1a4a', '#232158', '#2a2866']);
  scr(); for (let i = 0; i < 70; i++) { const x = hash(i * 9.1) * W, y = hash(i * 4.3) * H; dot(x, y, hash(i) > .8 ? 4 : 2.2, Math.floor(t * 6 + i) % 5 ? '#f2eeff' : '#8f8acb'); }
}
function globe(x, y, r, t, { hit = 0 } = {}) {
  push(); translate(x, y);
  shape(ell(0, 0, r, r, 64), {
    fill: '#2f7fc1', lw: 8, shade: () => {
      const land = '#5f9a4a';
      fillOnly(spline([[-r * .75, -r * .55], [-r * .35, -r * .8], [r * .05, -r * .7], [r * .15, -r * .45], [-r * .05, -r * .25], [-r * .2, -r * .05], [-r * .4, -r * .1], [-r * .6, -r * .3]]), land, { boil: .4 });
      fillOnly(spline([[-r * .2, -r * .05], [-r * .08, 0], [-r * .02, r * .05], [-r * .1, r * .02]]), land, { boil: .3 });
      fillOnly(spline([[-r * .05, r * .08], [r * .25, r * .12], [r * .3, r * .35], [r * .1, r * .75], [-r * .02, r * .55], [-r * .1, r * .25]]), land, { boil: .4 });
      fillOnly(ell(r * .35, r * .1, r * .9, r * 1.1, 40), 'rgba(0,0,0,.12)', { boil: .2 });
      if (hit > 0) { fillOnly(ell(-r * .1, -r * .06, r * .9 * hit, r * .9 * hit, 40), `rgba(120,110,110,${.7 * Math.min(1, hit * 1.4)})`, { boil: .6 }); fillOnly(ell(-r * .1, -r * .06, r * .25 * Math.min(1, hit * 3), r * .25 * Math.min(1, hit * 3), 24), '#ffb35a', { boil: .6 }); }
    }
  });
  pop();
}

// —— mundo 4: campo de futebol (verde-grama + giz + céu amarelo). 100 m = 10 000 px ——
const FL = 10000, GY = 1500;
function field(t, x0, x1) {
  fillScreen('#ffe08a');
  bands(['#fff1b0', '#ffe9a0', '#ffe08a', '#ffd76e'], -4000, GY - 120, x0 - 2000, x1 + 2000);
  // arquibancada distante
  fillOnly(rect(x0 - 2000, GY - 320, x1 - x0 + 4000, 200), '#d98a4a', { boil: 0 });
  for (let x = Math.floor((x0 - 2000) / 40) * 40; x < x1 + 2000; x += 40) dot(x + (hash(x) - .5) * 10, GY - 260 + hash(x * 1.7) * 100, 9, ['#e8392b', '#3f6fd1', '#ffffff', '#2f9a4a'][Math.floor(hash(x * 3.3) * 4)]);
  shape(rect(x0 - 2000, GY - 120, x1 - x0 + 4000, 14000), {
    fill: '#4fae4f', lw: 8, shade: () => {
      for (let x = Math.floor(x0 / 1000) * 1000 - 1000; x < x1 + 1000; x += 1000) fillOnly(rect(x + 500, GY - 140, 500, 14000), '#46a046', { boil: 0 });
    }
  });
  // linhas de giz a cada 10 m + números
  for (let m = 0; m <= 100; m += 10) {
    const x = m * 100; if (x < x0 - 400 || x > x1 + 400) continue;
    stroke([[x, GY - 118], [x, GY + 5000]], m % 50 === 0 ? 14 : 9, { line: '#fbfbf2' });
    if (m > 0 && m < 100) text(`${m} m`, x, GY + 120, { font: '800 60px "Baloo 2"', fill: '#fbfbf2' });
  }
  // traves
  for (const gx of [0, FL]) if (gx > x0 - 600 && gx < x1 + 600) {
    const d = gx ? 1 : -1;
    stroke([[gx, GY - 120], [gx, GY - 420], [gx + d * 260, GY - 420], [gx + d * 260, GY - 120]], 12, { line: '#fbfbf2' });
    for (let k = 1; k < 6; k++) stroke([[gx + d * k * 44, GY - 420], [gx + d * k * 44, GY - 120]], 3, { line: 'rgba(255,255,255,.6)' });
  }
}
function caveman(x, y, s, t, ph = 0) {
  push(); translate(x, y); scale(s);
  const st = Math.sin(t * 6 + ph) * 10;
  shape(noodle([-10, -60], [-14 + st, 0], 0, 14, 12), { fill: '#c98e62', lw: 5 }); shape(noodle([10, -60], [14 - st, 0], 0, 14, 12), { fill: '#c98e62', lw: 5 });
  shape(spline([[-26, -110], [26, -110], [30, -50], [-30, -50]]), { fill: '#a0703f', lw: 5 });
  shape(ell(0, -134, 24, 26, 16), { fill: '#c98e62', lw: 5 }); shape(spline([[-26, -140], [-18, -166], [18, -166], [26, -140], [0, -152]]), { fill: '#3b2a1a', lw: 4 });
  eye(-8, -136, 7, 8, { look: [.4, 0], pupil: 2.5, skin: '#c98e62', lw: 3 }); eye(9, -136, 7, 8, { look: [.4, 0], pupil: 2.5, skin: '#c98e62', lw: 3 });
  stroke([[26, -90], [56, -170]], 6, { line: '#6b4a2a' });
  pop();
}

// —— mundo 5: camadas de rocha (bege "suspeitamente normal") ——
const STRATA = ['#e9dcc0', '#dccaa6', '#cdb68c', '#bfa37a', '#b0926a', '#a2845f'];
function strata(t) {
  fillScreen('#bfe3f2');
  bands(['#cfe9f5', '#bfe3f2'], -2000, 600, -2000, 3000);
  for (let i = 0; i < STRATA.length; i++) {
    const y = 600 + i * 420;
    const top = []; for (let x = -1200; x <= 2400; x += 120) top.push([x, y + Math.sin(x * .004 + i) * 26]);
    shape([...top, [2400, 6000], [-1200, 6000]], { fill: STRATA[i], lw: 6 });
    for (let k = 0; k < 10; k++) { const px = hash(i * 30 + k) * 1300 - 100, py = y + 80 + hash(i * 7 + k) * 300; shape(ell(px, py, 14 + hash(k) * 16, 10, 10), { fill: STRATA[Math.min(5, i + 1)], lw: 4 }); }
  }
}

// —— mundo 6: depois do dilúvio (pastel + arco-íris) ——
function afterSky(t, rb = 1) {
  fillScreen('#bfe3f2');
  bands(['#d7eef8', '#cdeaf6', '#ffe8cf', '#ffd9b8'], -1500, 1250, -3000, 4000);
  if (rb > 0) {
    const cols = ['#e8392b', '#ff8a2a', '#f2c230', '#5fbf5a', '#3f8fd1', '#6f5fc8'];
    cols.forEach((c, i) => { const r = 720 - i * 46; stroke(arc(540, 1250, r, r * .95, Math.PI, Math.PI + Math.PI * rb, 60), 46, { line: c, boil: .4 }); });
  }
  shape(ell(880, 360, 100, 100, 36), { fill: '#fff4c4', lw: 7 });
}

// ============ CENAS (versão curta) ============
const NOE = o => noe({ s: 1, ...o });
const REX = o => rex({ s: 1, ...o });
let TITLE_END = T66;   // ajustado em build: some logo antes do selo "66 milhões"
// gancho: a pergunta na tela desde o primeiro quadro
function hookTitle(t) {
  if (t > TITLE_END) return;
  const out = ss(seg(t, TITLE_END - .25, TITLE_END));
  scr(); push(); translate(540, 300 - out * 600); rotate(-.04 + Math.sin(q(t) * 4) * .012); scale(1 + .06 * Math.max(0, 1 - t * 4));
  shape(rr(-520, -210, 1040, 420, 40), { fill: 'rgba(27,20,34,.82)', lw: 8 });
  text('POR QUE OS', 0, -120, { font: '86px "Titan One"', fill: '#ffffff', outlineW: 16 });
  text('DINOSSAUROS', 0, -10, { font: '112px "Titan One"', fill: '#ffd23f', outlineW: 18 });
  text('NÃO ENTRARAM NA ARCA?', 0, 110, { font: '66px "Titan One"', fill: '#ffffff', outlineW: 14 });
  pop();
}
// 01 — GANCHO: "Corre, Noé! Corre!" com o asteroide chegando
function s01(t) {
  const L = lip('01', t, 1.7), tC2 = w('01', 'corre', 1), tImp = SCS['02'][0] - .14;
  const k = seg(t, 0, tImp);
  if (t < tC2 - .06) {
    cam(800, 1150, 1.9, 12, t);
    creta(t, { dinos: false }); scr(); fillOnly(rect(0, 0, W, H), 'rgba(140,40,20,.35)', { boil: 0 });
    reset(); asteroid(lerp(900, 760, k), lerp(760, 880, k), lerp(120, 190, k), { t, a: 2.3, tail: 1.2 });
    cam(800, 1150, 1.9, 12, t);
    REX({ x: 820, y: 1780, s: .9, t, face: -1, look: [-.6, -.6], mouth: { o: Math.max(.85, L.o), sm: -1 }, brow: 1.2, browAng: -1, eyeS: 1.35, nerv: 1.6, sweat: true, arms: 1 });
  } else {
    const r = seg(t, tC2 - .06, tImp);
    cam(540, 1180, 1, 10, t);
    creta(t, { dinos: false, boom: 1 }); scr(); fillOnly(rect(0, 0, W, H), 'rgba(140,40,20,.35)', { boil: 0 });
    reset(); asteroid(lerp(760, 600, r), lerp(560, 760, r), lerp(150, 260, r), { t, a: 2.3, tail: 1.3 });
    cam(540, 1180, 1, 10, t);
    portal(140, 1300, 230, { open: 1, t });
    NOE({ x: lerp(420, 220, r), y: 1780, s: .85, t, walk: 1, face: -1, holdR: 'glass', glow: 1, look: [-.8, 0], lid: .35, eyeS: 1.15, lean: -.15 });
    REX({ x: lerp(860, 400, r), y: 1800, s: .9, t, face: -1, run: 1, look: [-.8, 0], mouth: { o: Math.max(.7, L.o), sm: -1 }, brow: 1, nerv: .6, lean: -.2, sweat: true, smoke: true });
    speedLines(t, 8);
  }
  if (t > tImp - .12) { scr(); fillOnly(rect(0, 0, W, H), 'rgba(255,250,235,.9)', { boil: 0 }); }
  hookTitle(t);
}
// 02 — "O asteroide acabou com eles 66 milhões de anos antes de existir gente."
function s02(t) {
  const t0 = SCS['02'][0], t66 = w('02', '66'), tAn = w('02', 'antes');
  if (t < t66 - .1) {
    // o impacto visto do espaço (o asteroide do gancho)
    cam(540, 960, 1, t < t0 + .5 ? 14 : 0, t);
    space(t);
    globe(540, 1250, 400, t, { hit: seg(t, t0 + .05, t66) });
    if (t < t0 + .08) { scr(); fillOnly(rect(0, 0, W, H), 'rgba(255,250,235,.9)', { boil: 0 }); }
    sign('ASTEROIDE', 540, 1760, { size: 64, fill: '#ff9a2f', s: popIn(t, w('02', 'asteroide') - .05) });
  } else {
    // os grandes dinossauros tombam no horizonte cinzento
    cam(540, 1100, 1, 0, t);
    fillScreen('#6e6a72'); bands(['#8a8590', '#7c7882', '#6e6a72', '#605c64'], -400, 1400, -2000, 3000);
    for (let i = 0; i < 4; i++) {
      const tf = t66 + i * .22, k = ss(seg(t, tf, tf + .4)), sink = ei(seg(t, tf + .4, tf + .9));
      if (sink > .98) continue;
      push(); translate(140 + i * 270, 1420 + sink * 700); rotate(k * (i % 2 ? 1.4 : -1.4)); translate(0, k * 60);
      sauropod(0, 0, .45 + (i % 2) * .08, '#2b2830', t * (1 - k), i);
      pop();
      if (k > .85 && sink < .6) for (let p = 0; p < 3; p++) fillOnly(ell(140 + i * 270 + (p - 1) * 60, 1410, 50, 30, 12), 'rgba(160,150,160,.6)', { boil: .5 });
    }
    shape(rect(-2000, 1420, 5000, 900), { fill: '#3e3a40', lw: 7 });
    scr();
    sign('66 MILHÕES DE ANOS', 540, 380, { size: 76, fill: '#ffd23f', s: popIn(t, t66 - .1), font: 'Titan One', weight: '400', rot: -.03 });
    if (t > tAn - .1) sign('ANTES DE EXISTIR GENTE', 540, 520, { size: 58, fill: '#ffffff', s: popIn(t, tAn - .1), rot: .02 });
  }
  hookTitle(t);
}
// 03 — o campo de 100 m: humanos só nos últimos 45 cm (e a arca nos últimos milímetros)
function s03(t) {
  const t0 = SCS['03'][0], tCam = w('03', 'campo'), tHum = w('03', 'gente'), t45 = w('03', '45'), tCen = w('03', 'centímetros'), tEnd = SCS['04'][0];
  const runA = tHum - .35, runB = t45 - .05, tLupa = tCen + .15;
  const rk = ss(seg(t, runA, runB)), rxw = lerp(520, FL - 260, rk);
  const Z = (a, b, k) => Math.exp(lerp(Math.log(a), Math.log(b), k));
  let cx, cy, z;
  if (t < runA) { cx = FL / 2; cy = 1300; z = .1; }
  else if (t < runB) { const k = eio(seg(t, runA, runA + .4)); z = Z(.1, .75, k); cx = lerp(FL / 2, Math.min(rxw + 260, FL - 400), k); cy = lerp(1300, 1250, k); }
  else if (t < tLupa) { const k = eio(seg(t, runB, runB + .45)); z = Z(.75, 7, k); cx = lerp(FL - 400, FL - 22, k); cy = lerp(1250, GY + 120, k); }
  else { const k = eio(seg(t, tLupa, tEnd - .25)); z = Z(7, 110, k); cx = lerp(FL - 22, FL - 3.4, k); cy = lerp(GY + 120, GY + 158.6, k); }
  const half = W / 2 / z;
  cam(cx, cy, z, 0, t);
  field(t, cx - half, cx + half);
  const hl = seg(t, t45 - .1, t45 + .3);
  if (hl > 0) { fillOnly(rect(FL - 45, GY - 116, 45, 400), `rgba(255,214,63,${.55 * hl})`, { boil: .3 }); for (let i = 0; i < 3; i++) caveman(FL - 38 + i * 12, GY + 160, .055, t, i); }
  arca(FL - 3.4, GY + 160, 4.6, { t, necks: 1 });
  push(); translate(FL - 1.2, GY + 158.8); scale(.0016); noe({ x: 0, y: 0, s: 1, t, look: [-1, -.4], lid: .5, holdR: 'clip' }); pop();
  REX({ x: rxw, y: GY + 160, s: .8, t, run: t > runA && t < runB, lean: t > runA && t < runB ? .18 : 0, look: [1, 0], mouth: { o: .6, sm: .4 }, brow: .8, arms: t < runA ? 1 : 0 });
  scr();
  if (t < runA + .2) {
    sign('ASTEROIDE', 150, 1180, { size: 38, fill: '#e8392b', col: '#ffffff', s: popIn(t, t0) }); sign('HOJE', 960, 1180, { size: 40, fill: '#3f6fd1', col: '#ffffff', s: popIn(t, t0 + .15) });
    sign('100 m = 66 MILHÕES DE ANOS', 540, 420, { size: 54, fill: '#ffffff', s: popIn(t, tCam - .1) });
  }
  if (t > runA && t < runB) speedLines(t, 12);
  if (t > t45 - .1 && t < tLupa) sign('GENTE: 45 cm', 540, 420, { size: 66, fill: '#ffd23f', s: popIn(t, t45 - .1) });
  if (t > tLupa) {
    const a = ss(seg(t, tLupa, tLupa + .25));
    stroke(ell(540, 1000, 470 * a + 1, 470 * a + 1, 80), 30, { line: '#5b3a1f' }); stroke(ell(540, 1000, 492 * a + 1, 492 * a + 1, 80), 6);
    if (a > .5) shape(noodle([870, 1340], [1080, 1600], 0, 60, 70), { fill: '#5b3a1f', lw: 7 });
    sign('A ARCA: MILÍMETROS', 540, 420, { size: 58, fill: '#ffffff', s: popIn(t, tLupa + .1) });
  }
}
// 04 — "Cheguei atrasado?!"
function s04(t) {
  const L = lip('04', t, 1.3);
  cam(FL - 160, GY - 120, 1.45, 0, t);
  field(t, FL - 1200, FL + 900);
  arca(FL - 3.4, GY + 160, 4.6, { t, necks: 0 });
  sign('A ARCA', FL - 3, GY + 20, { size: 30, fill: '#ffffff', s: .77 }); stroke([[FL - 3, GY + 60], [FL - 3, GY + 140]], 5);
  REX({ x: FL - 260, y: GY + 160, s: .8, t, look: [.9, .9], mouth: { o: Math.max(L.o, .25), sm: -.5 }, brow: 1, browAng: -.8, sweat: true, bob: Math.abs(Math.sin(t * 9)) * 12, lean: -.06, headTilt: .2, eyeS: 1.25 });
}
// 05 — "Mas as aves são dinossauros. Então tinha dinossauro na arca, sim: a pomba!"  → a resposta, com a arca pronta
function s05(t) {
  const t0 = SCS['05'][0], tSao = w('05', 'são'), tEn = w('05', 'então'), tTi = w('05', 'tinha'), tPo = w('05', 'pomba');
  if (t < tEn - .1) {
    // a sombra da pomba é um raptor + carimbo DINOSSAURO
    cam(540, 1150, 1, t > tSao && t < tSao + .25 ? 10 : 0, t);
    deck(t, { win: false, floorY: 1560, lamp: true });
    stroke([[-100, 1500], [1200, 1500]], 18, { line: PAL.woodS });
    const m = ss(seg(t, t0, t0 + .4));
    raptorShadow(560, 1460, 1.9 * (.6 + .4 * m), `rgba(30,20,40,${.5 * m})`, .3 + .4 * Math.max(0, Math.sin(t * 6)));
    bird({ x: 480, y: 1500, s: 1.3, t, face: 1, look: [.5, 0], smug: 1 });
    sign('AVES', 540, 380, { size: 80, fill: '#9be08a', s: popIn(t, t0), font: 'Titan One', weight: '400' });
    const a = popIn(t, tSao - .05, .2, 2.4);
    if (a > 0) { scr(); push(); translate(540, 620); rotate(-.18); scale(lerp(2.2, 1, Math.min(1, a))); shape(rr(-360, -80, 720, 160, 20), { fill: 'rgba(0,0,0,0)', lw: 12, line: '#e8392b' }); text('DINOSSAURO', 0, 6, { font: '110px "Titan One"', fill: '#e8392b' }); pop(); }
    return;
  }
  // a resposta: arca pronta sob o arco-íris; a pomba sai voando da mão do Noé
  const k = ss(seg(t, tEn - .1, SCS['06'][0]));
  cam(540, lerp(1150, 1110, k), lerp(1.05, .97, k), 0, t);
  afterSky(t, ss(seg(t, tEn - .1, tEn + .7)));
  water(t, 1480, { A: 10, cols: ['#6fb6d6', '#5aa3c6', '#4a90b3'] });
  arca(560, 1500, 860, { t, necks: 1, roll: Math.sin(t * .9) * .015 });
  push(); translate(560, 1500 - 180 * .955); scale(.42);
  noe({ x: -520, y: 0, s: 1, t, look: [.6, -.6], lid: .45, mouth: { sm: .6 }, armR: { h: [60, -200], bend: 30 } });
  rex({ x: 640, y: 0, s: .9, t, face: -1, arms: 1, look: [-.4, -.6], mouth: { o: .4, sm: 1 }, brow: .4 });
  pop();
  const fk = seg(t, tPo - .35, tPo + 1.1);
  const hx = 560 + (-520 + 140) * .42, hy = 1500 - 180 * .955 + (-400 - 210) * .42;
  if (fk <= 0) bird({ x: hx + 10, y: hy, s: .55, t, look: [.6, -.3], smug: 1 });
  else bird({ x: lerp(hx, 700, eo(fk)), y: lerp(hy, 900, eo(fk)) + Math.sin(t * 4) * 12, s: lerp(.55, 1.5, eo(fk)), t, fly: 1, branch: true, look: [.4, .2], smug: 1 });
  scr();
  sign('TINHA DINOSSAURO NA ARCA!', 540, 300, { size: 54, fill: '#ffd23f', s: popIn(t, tTi - .1) });
  if (t > tPo - .1) sign('A POMBA!', 540, 430, { size: 72, fill: '#9be08a', s: popIn(t, tPo - .1), font: 'Titan One', weight: '400', rot: -.04 });
}
// 06 — chamada
function s06(t) {
  const v = VO['06'], tCm = w('06', 'comenta'), tCu = w('06', 'curte'), tCp = w('06', 'compartilha');
  cam(540, 960, 1, 0, t);
  bandsScreen(['#ffe8cf', '#ffd9b8', '#ffcaa0', '#f6b98c']);
  NOE({ x: 250, y: 1900, s: .72, t, look: [.5, -.3], lid: .45, mouth: { sm: .7 }, holdR: 'clip', marks: 2, zero: 1 });
  REX({ x: 820, y: 1900, s: .7, t, face: -1, arms: 1, look: [-.4, -.4], mouth: { o: .5, sm: 1 }, brow: .4, bob: -Math.abs(Math.sin(t * 6)) * 14 });
  bird({ x: 540, y: 1180 + Math.sin(t * 2) * 10, s: .9, t, fly: 1, look: [0, .4] });
  const a = popIn(t, v - .15, .3, 1.8);
  if (a > 0) text('Se você gostou,', 540, 300, { font: `800 ${Math.round(84 * a)}px "Baloo 2"`, fill: '#ffffff', outlineW: 14 });
  const ic = [['COMENTA', tCm, '#3f6fd1', 0], ['CURTE', tCu, '#e8392b', 1], ['COMPARTILHA', tCp, '#2f9a4a', 2]];
  for (const [s_, tt, c, i] of ic) {
    const b = popIn(t, tt - .08, .3, 1.9); if (b <= 0) continue;
    push(); translate(540, 470 + i * 190); scale(b); rotate([-.04, .03, -.02][i]);
    shape(rr(-330, -72, 660, 144, 60), { fill: c, lw: 8 });
    push(); translate(-240, 0);
    if (i === 0) shape(spline([[-40, -34], [40, -34], [48, 0], [36, 26], [-6, 26], [-30, 46], [-24, 26], [-42, 20], [-48, -8]]), { fill: '#ffffff', lw: 6 });
    if (i === 1) shape(spline([[0, 40], [-46, 0], [-40, -30], [-16, -38], [0, -18], [16, -38], [40, -30], [46, 0]]), { fill: '#ffffff', lw: 6 });
    if (i === 2) shape([[-40, 10], [10, 10], [10, 34], [50, -6], [10, -46], [10, -22], [-40, -22]], { fill: '#ffffff', lw: 6 });
    pop();
    text(s_, 50, 4, { font: '70px "Titan One"', fill: '#ffffff', outlineW: 12 });
    pop();
  }
}

const FN = { '01': s01, '02': s02, '03': s03, '04': s04, '05': s05, '06': s06 };
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
for (const id of ORDER) ev('vo', VO[id], { id, who: ENV[id] ? ENV[id].who : 'N' });
const S = id => SCS[id][0];
const tImp = S('02') - .14;
ev('cue', 0, { name: 'panico', t0: 0, t1: tImp });
ev('cue', S('02'), { name: 'perdeu', t0: S('02'), t1: S('03') });
ev('cue', S('03'), { name: 'campo', t0: S('03'), t1: S('04') });
ev('cue', S('05'), { name: 'aves', t0: S('05'), t1: w('05', 'então') - .1 });
ev('cue', w('05', 'então') - .1, { name: 'final', t0: w('05', 'então') - .1, t1: END });
// 01
ev('meteor', 0, { d: tImp + .05 }); ev('steps', w('01', 'corre', 1) - .06, { d: tImp - w('01', 'corre', 1), fast: 1 }); ev('impact', tImp);
// 02
ev('pop', w('02', 'asteroide') - .05); for (let i = 0; i < 4; i++) ev('fall', w('02', '66') + i * .22 + .1); ev('stamp', w('02', '66') - .1); ev('pop', w('02', 'antes') - .1);
// 03
ev('pop', S('03') + .02); ev('pop', w('03', 'campo') - .1); ev('whistle', w('03', 'gente') - .5); ev('steps', w('03', 'gente') - .35, { d: w('03', '45') - w('03', 'gente') + .3, fast: 1 });
ev('zoomIn', w('03', 'gente') - .3, { d: w('03', '45') - w('03', 'gente') + .5 }); ev('skid', w('03', '45') - .1); ev('pop', w('03', '45') - .1); ev('zoomIn', w('03', 'centímetros') + .15, { d: .9 }); ev('ding', w('03', 'centímetros') + .3);
// 04
ev('boing', VO['04'] + .05);
// 05
ev('roar', S('05') + .05); ev('stamp', w('05', 'são') - .02); ev('harp', w('05', 'então') - .1); ev('pop', w('05', 'tinha') - .1);
ev('flutter', w('05', 'pomba') - .35, { d: 1.2 }); ev('titleHit', w('05', 'pomba') - .1); ev('coo', w('05', 'pomba') + .3);
// 06
ev('pop', VO['06'] - .15); ev('pop', w('06', 'comenta') - .08); ev('pop', w('06', 'curte') - .08); ev('titleHit', w('06', 'compartilha') - .08);
for (const [id, a, b] of SC) ev('amb', a, { d: +(b - a).toFixed(3), w: { '01': 'jungle', '02': 'none', '03': 'field', '04': 'field', '05': 'rain', '06': 'none' }[id] });
EV.sort((a, b) => a.t - b.t);
window.EV = EV;

await document.fonts.ready;
await Promise.all(['120px "Titan One"', '800 40px "Baloo 2"', '64px "VT323"'].map(f => document.fonts.load(f)));
window.READY = true;
