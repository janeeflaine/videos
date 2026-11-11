// "Cadê os dinossauros?" — Sci-Fi Sitcom Toon, 1080×1920
import { clamp, lerp, seg, ss, eo, ei, eio, back, hash, TAU } from '/core/lib.js';
import { W, H, INK, init, frame, g, push, pop, translate, rotate, scale, shape, fillOnly, stroke, ell, arc, rr, rect, spline, dot, text, noodle, reset, bands, quad } from './toon.js';
import { noe, rex, bird, raptorShadow, ampulheta, portal, arca, ramp, giraffe, elephant, turtle, asteroid, fossil, clipboard, sweat, eye, PAL } from './cast.js';
import { build, ORDER } from './story.js';

init(document.getElementById('c'));
const J = async f => { try { const r = await fetch(f); if (r.ok) return await r.json(); } catch (e) { } return null; };
const DURS = await J('voices/dur.json'), WORDS = (await J('voices/words.json')) || {}, ENV = (await J('voices/env.json')) || {};
const { VO, END, w, SC } = build(DURS, WORDS);
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

// ============ CENAS ============
const NOE = o => noe({ s: 1, ...o });
const REX = o => rex({ s: 1, ...o });
// bichos subindo a prancha em pares
function procession(t, x0, y0, x1, y1) {
  const list = [['g', 0], ['g', .06], ['e', .25], ['e', .32], ['t', .52], ['t', .56], ['g', .75], ['g', .81]];
  for (const [k, o] of list) {
    const u = (t * .07 + o) % 1; if (u > .93) continue;
    const x = lerp(x0, x1, u), y = lerp(y0, y1, u);
    if (k === 'g') giraffe(x, y, .5, t + o * 9); else if (k === 'e') elephant(x, y, .45, t + o * 9); else turtle(x, y, .45, t);
  }
}
// 01 — dois de cada... por que os dinossauros não entraram?
function s01(t) {
  const tPor = w('01', 'por'), tDino = w('01', 'dinossauros');
  if (t < tPor - .12) {
    const k = ss(seg(t, 0, tPor));
    cam(lerp(560, 600, k), lerp(1150, 1120, k), lerp(.78, .9, k), 0, t);
    rainSky(t);
    // morro + água subindo
    shape(spline([[-900, 1600], [-500, 1380], [100, 1330], [700, 1360], [1400, 1420], [2000, 1600], [2000, 2600], [-900, 2600]]), { fill: '#55704f', lw: 8 });
    arca(700, 1300, 900, { t });
    ramp(-200, 1470, 600, 1170);
    procession(t, -200, 1470, 600, 1176);
    water(t, lerp(1640, 1560, k), { A: 18 });
    rain(t, 80);
    if (t > w('01', 'pergunta') - .1) sign('?', 700, 640, { size: 120, fill: '#ffd23f', s: popIn(t, w('01', 'pergunta') - .1) });
    return;
  }
  // insert: a marca no convés onde deveriam estar os dinossauros — vazia
  const k = ss(seg(t, tPor, SCS['02'][0]));
  cam(540, 1050, lerp(1, 1.08, k), 0, t);
  deck(t, { win: false, floorY: 1180 });
  // faixa de giz "fila" e pegadas de três dedos pintadas
  for (const [x, y, a] of [[360, 1450, -.2], [640, 1640, .15], [430, 1800, -.1]]) {
    push(); translate(x, y); rotate(a);
    fillOnly(spline([[-30, 40], [30, 40], [40, -10], [0, -20], [-40, -10]]), 'rgba(255,255,255,.5)', { boil: .4 });
    for (const [dx, da] of [[-44, -.5], [0, 0], [44, .5]]) { push(); translate(dx * .7, -20); rotate(da); fillOnly(spline([[-12, 0], [12, 0], [6, -70], [0, -86], [-6, -70]]), 'rgba(255,255,255,.5)', { boil: .4 }); pop(); }
    pop();
  }
  // placa
  stroke([[820, 1180], [820, 1500]], 14, { line: PAL.woodS });
  sign('DINOSSAUROS', 820, 1120, { size: 52, fill: PAL.paper, rot: -.05 });
  // bola de feno rolando (o vazio)
  const tx_ = lerp(-150, 1250, seg(t, tPor + .2, tPor + 3.2));
  push(); translate(tx_, 1640 - Math.abs(Math.sin(t * 6)) * 40); rotate(t * 5);
  shape(ell(0, 0, 60, 60, 20), { fill: '#d8b26a', lw: 6 }); for (let i = 0; i < 4; i++) stroke(arc(0, 0, 40 - i * 8, 30 + i * 6, i, i + 4, 12), 4, { line: '#a07a3a' });
  pop();
  rain(t, 50, .3, .35);
  const a = popIn(t, tDino - .1, .35, 1.8);
  if (a > 0) { scr(); push(); translate(540, 520); rotate(-.05 + Math.sin(q(t) * 3) * .015); scale(a); text('CADÊ OS', 0, -80, { font: '120px "Titan One"', fill: '#ffffff', outlineW: 22 }); text('DINOSSAUROS?', 0, 60, { font: '112px "Titan One"', fill: '#ffd23f', outlineW: 22 }); pop(); }
}

// 02 — Noé confere a lista
function s02(t) {
  const tDin = w('02', 'dinossauro'), tZero = w('02', 'zero');
  const L = lip('02', t);
  if (t < tZero - .12) {
    const close = t > tDin - .1;
    if (!close) cam(540, 1150, 1, 0, t); else cam(470, 1060, 1.75, 0, t);
    deck(t, { floorY: 1640 });
    // bichos passando atrás
    const gx = lerp(-300, 1400, seg(t, w('02', 'girafa') - .6, w('02', 'girafa') + 2.6));
    if (gx > -300 && gx < 1400) { giraffe(gx, 1700, .9, t); giraffe(gx - 260, 1700, .9, t + .4); }
    const ex = lerp(-400, 1500, seg(t, w('02', 'elefante') - .5, w('02', 'elefante') + 2.8));
    if (ex > -400 && ex < 1500) { elephant(ex, 1700, .9, t); elephant(ex - 330, 1700, .9, t + .5); }
    const marks = (t > w('02', 'duas') + .15) + (t > w('02', 'dois') + .15);
    NOE({ x: 470, y: 1860, s: 1.25, t, holdR: 'clip', marks, armR: { h: [70, 70], bend: 30 }, look: close ? [.6, .45] : [.7, .3], lid: close ? .62 : .5, mouth: { o: L.o * .9, w: L.w, sm: -.2 }, bob: L.o * 6, drip: 1, wet: 1, brow: close ? -.3 : 0 });
    rain(t, 30, .3, .25);
    return;
  }
  // insert extremo: a prancheta, círculo vermelho no zero
  cam(540, 960, 1, 0, t);
  fillScreen(PAL.coat);
  scr(); fillOnly(rect(0, 1200, W, 800), PAL.coatS, { boil: .2 });
  clipboard(540, 1000, 5.2, { a: -.05, marks: 2, zero: ss(seg(t, tZero, tZero + .5)) });
  shape(spline([[690, 1480], [800, 1420], [900, 1500], [870, 1620], [720, 1640]]), { fill: PAL.nSkin, lw: 7 });   // polegar do Noé
  if (t > tZero + .2) { scr(); const k = Math.floor(q(t) * 12) % 2; for (let i = 0; i < 3; i++) stroke([[770 + i * 70, 1220 - k * 8], [800 + i * 90, 1150 - k * 8]], 8, { line: '#e8392b' }); }
}

// 03 — o problema não era o tamanho; era o horário → ampulheta-portal
function s03(t) {
  const tHor = w('03', 'era', 1), tEnt = w('03', 'então'), tPeg = w('03', 'pegou'), tPor = w('03', 'portal'), tBus = w('03', 'buscar'), tPas = w('03', 'passado'), tEnd = SCS['04'][0];
  if (t < tHor - .1) {
    cam(540, 1000, .72, 0, t);
    rainSky(t, { flash: false });
    shape(spline([[-900, 1600], [-400, 1440], [400, 1420], [1200, 1440], [2000, 1600], [2000, 2700], [-900, 2700]]), { fill: '#55704f', lw: 8 });
    arca(540, 1380, 1300, { t });
    NOE({ x: 300, y: 1560, s: .3, t, look: [.3, -1], lid: .4, holdR: 'clip' });
    sign('ESPAÇO SOBRANDO', 540, 420, { size: 64, fill: '#9be08a', s: popIn(t, VO['03'] + .3), rot: -.04 });
    rain(t, 60);
    return;
  }
  if (t < tEnt - .1) {
    // insert: areia caindo; o tique-taque do problema
    cam(540, 960, 1, 0, t);
    fillScreen('#2b2140'); bandsScreen(['#2b2140', '#30264a', '#352a52']);
    ampulheta(540, 980, 3.2, { t });
    tag('PROBLEMA: O HORÁRIO', t, tHor, { y: 240 });
    return;
  }
  // Noé tira a ampulheta da barba, aperta a campainha, o portal abre e o engole
  cam(540, 1150, 1, t > tBus && t < tBus + .4 ? 8 : 0, t);
  deck(t, { floorY: 1640 });
  const open = back(seg(t, tBus - .2, tBus + .2), .9);
  portal(800, 1200, 230, { open, t });
  if (open > 0) { scr(); fillOnly(rect(0, 0, W, H), `rgba(255,47,168,${.08 * open})`, { boil: 0 }); }
  const out = ss(seg(t, tPeg - .2, tPeg + .5));
  const suck = ei(seg(t, tPas - .1, tEnd - .05));
  push();
  if (suck > 0) { translate(lerp(0, 800 - 380, suck), lerp(0, 1200 - 1400, suck)); translate(380, 1400); rotate(suck * 2.5); scale(lerp(1, .05, suck), lerp(1, .5, suck)); translate(-380, -1400); }
  NOE({ x: 380, y: 1860, s: 1.2, t, holdR: out > 0 ? 'glass' : undefined, glow: t > tPor ? 1 : 0, armR: { h: [lerp(-20, 60, out), lerp(120, -60, out)], bend: 30 }, look: t > tBus ? [1, -.1] : [.5, -.3], lid: t > tBus ? .3 : .55, eyeS: t > tBus ? 1.1 : 1, brow: t > tBus ? .6 : 0, wet: 1, sq: 1 - .1 * Math.max(0, Math.sin((t - tPas) * 20)) * (t > tPas ? 1 : 0) });
  pop();
  if (t > tPor - .1 && t < tPor + .4) { scr(); sign('PLIM!', 640, 760, { size: 64, fill: '#ffffff', s: popIn(t, tPor - .1) }); }
}

// 04 — 66 milhões de anos atrás; a Terra era dos dinossauros; o Rex
function s04(t) {
  const t0 = SCS['04'][0], tVul = w('04', 'vulcões'), tRex = w('04', 'rex'), tAni = w('04', 'animado');
  cam(540, 1050, 1, t > tVul && t < tVul + .35 ? 7 : 0, t);
  creta(t, { boom: Math.max(0, 1 - Math.abs(t - tVul - .2) * 2) });
  // portal no alto à esquerda; Noé cai rodando e pousa
  portal(220, 820, 150, { open: back(seg(t, t0, t0 + .3), .9), t });
  const fl = seg(t, t0 + .1, t0 + .75), land = t - (t0 + .75);
  const sq = land > 0 ? 1 - .22 * Math.cos(land * 22) * Math.exp(-land * 6) : 1.05;
  const nx = lerp(220, 320, fl), ny = fl < 1 ? lerp(820, 1640, ei(fl)) - Math.sin(fl * Math.PI) * 160 : 1640;
  push(); if (fl < 1) { translate(nx, ny - 250); rotate(fl * TAU * .9); translate(-nx, -(ny - 250)); }
  NOE({ x: nx, y: ny, s: .8, t, holdR: 'glass', glow: .5, look: t > tRex ? [.9, 0] : [.3, -.4], lid: t > tRex + .3 ? .35 : .5, eyeS: t > tRex ? 1.12 : 1, sq, armR: { h: [60, -30], bend: 30 } });
  pop();
  // Rex salta das samambaias
  const j = seg(t, tRex - .35, tRex + .25), lnd = t - (tRex + .25);
  const rx = lerp(1300, 800, j), ry = j < 1 ? 1700 - Math.sin(j * Math.PI) * 300 : 1700;
  const rsq = lnd > 0 ? 1 - .22 * Math.cos(lnd * 20) * Math.exp(-lnd * 6) : 1.04;
  if (t > tRex - .35) REX({ x: rx, y: ry, s: .82, t, face: -1, arms: t > tAni - .3 ? 1 : 0, sq: rsq, mouth: { o: .5, sm: .8 }, look: [.6, -.1], brow: .5, run: j < 1 });
  fern(1000, 1900, 1.1, '#2a8a7a', t, 3);
  tag('HÁ 66 MILHÕES DE ANOS', t, VO['04'] - .1);
}

// 05 — "Você vem comigo. Vai chover."
function s05(t) {
  const L = lip('05', t);
  cam(560, 1180, 1.05, 0, t);
  creta(t, { dinos: false });
  portal(-20, 1100, 200, { open: 1, t });
  NOE({ x: 310, y: 1760, s: .95, t, holdR: 'glass', glow: .5, armR: { h: [-40, -190], bend: 40 }, armL: { h: [-60, 150], bend: -14 }, look: [.8, 0], lid: .6, mouth: { o: L.o, w: L.w, sm: -.2 }, bob: L.o * 6 });
  REX({ x: 820, y: 1780, s: .9, t, face: -1, look: [.5, 0], arms: 1, mouth: { o: .2, sm: 1 }, brow: .6, bob: Math.abs(Math.sin(t * 6)) * -10 });
}

// 06 — "Chover? Que nada! Olha que estrela cadente linda!"
function s06(t) {
  const L = lip('06', t, 1.15), tOl = w('06', 'olha');
  if (t < tOl - .1) {
    cam(700, 1180, 1.55, 0, t);
    creta(t, { dinos: false });
    REX({ x: 820, y: 1780, s: .9, t, face: -1, look: [.5, .1], arms: 1, mouth: { o: L.o, sm: .8 }, brow: .9, lid: .2, headTilt: Math.sin(t * 5) * .05, bob: -L.o * 10 });
    return;
  }
  // contra-plongée: Rex aponta (o bracinho não chega lá em cima); a "estrela" brilha
  cam(540, 1100, 1, 0, t);
  creta(t, { dinos: false });
  const k = seg(t, tOl, SCS['07'][0] + 3);
  asteroid(lerp(900, 840, k), lerp(330, 380, k), lerp(16, 26, k), { t, a: 2.4, tail: .8 });
  for (let i = 0; i < 4; i++) { push(); translate(lerp(900, 840, k), lerp(330, 380, k)); rotate(i * Math.PI / 4 + t); stroke([[0, 40], [0, 70]], 5, { line: '#fff6c8' }); pop(); }
  NOE({ x: 300, y: 1760, s: .9, t, holdR: 'glass', glow: .5, look: [.6, -1], lid: .5 });
  REX({ x: 760, y: 1780, s: .92, t, face: -1, arms: 2, look: [-.5, -1], mouth: { o: L.o, sm: 1 }, brow: .9, headTilt: .25, lean: .05 });
  sign('?!', 900, 230, { size: 40, fill: '#fff6c8', s: 0 });
}

// 07 — o asteroide; México; fogo, poeira, frio, fome; os grandes sumiram
function duo(t, o = {}) {
  NOE({ x: 300, y: 1760, s: .9, t, holdR: 'glass', glow: .5, look: [.5, -.2], lid: .6, ...o.n });
  REX({ x: 780, y: 1780, s: .9, t, face: -1, look: [-.5, -.2], ...o.r });
}
function s07(t) {
  const tAst = w('07', 'asteroide'), tDez = w('07', '10'), tCai = w('07', 'caiu'), tMex = w('07', 'méxico'), tFo = w('07', 'fogo'), tPo = w('07', 'poeira'), tSol = w('07', 'sol'), tFr = w('07', 'frio'), tFm = w('07', 'fome'), tOs = w('07', 'os'), tSum = w('07', 'sumiram');
  if (t < tAst - .08) {
    // close de reação: o Noé entende antes de todo mundo
    cam(300, 1170, 2.1, 0, t);
    creta(t, { dinos: false });
    NOE({ x: 300, y: 1760, s: .9, t, holdR: 'glass', glow: .5, look: [.5, -1], lid: lerp(.5, .78, seg(t, VO['07'], VO['07'] + .5)), brow: -.4 });
    if (t > VO['07'] + .3) sweat(400, 1150, 1.4);
    return;
  }
  if (t < tCai - .1) {
    // insert: o asteroide vindo na nossa direção (na 1)
    cam(540, 960, 1, 4, t);
    space(t);
    const k = seg(t, tAst - .1, tCai);
    asteroid(lerp(800, 560, k), lerp(500, 900, k), lerp(90, 330, ei(k)), { t, a: 2.3, tail: 1.2 });
    speedLines(t, 10, 'rgba(255,200,120,.5)');
    if (t > tDez - .1) sign('~10 km', 540, 1640, { size: 90, fill: '#ffd23f', s: popIn(t, tDez - .1), rot: .04 });
    return;
  }
  if (t < tFo - .1) {
    cam(540, 960, 1, t > tMex && t < tMex + .5 ? 14 : 0, t);
    space(t);
    const hit = seg(t, tMex + .05, tMex + 1.2);
    globe(540, 1000, 420, t, { hit });
    const k = seg(t, tCai - .1, tMex + .05);
    if (k < 1) asteroid(lerp(1100, 498, ei(k)), lerp(380, 975, ei(k)), lerp(50, 20, k), { t, a: 2.4, tail: 1 });
    if (t > tMex + .05 && t < tMex + .25) { scr(); fillOnly(rect(0, 0, W, H), 'rgba(255,255,240,.85)', { boil: 0 }); }
    if (t > tMex - .2) { stroke([[498, 975], [330, 700]], 6, { line: '#ffffff' }); sign('MÉXICO (HOJE)', 330, 660, { size: 50, fill: '#ffffff', s: popIn(t, tMex - .2) }); }
    return;
  }
  if (t < tOs - .1) {
    // mesmo enquadramento, quatro mundos: fogo → poeira → frio → fome
    cam(540, 1180, 1.05, t < tPo ? 3 : 0, t);
    const ph = t < tPo - .05 ? 0 : t < tFr - .05 ? 1 : t < tFm - .05 ? 2 : 3;
    if (ph === 0) {
      fillScreen('#ff5a1f'); bands(['#ffb35a', '#ff8a2f', '#ff5a1f', '#e8392b'], -400, 1400, -2000, 3000);
      for (let i = 0; i < 9; i++) { const x = -60 + i * 150, h = 300 + Math.sin(t * 9 + i) * 60; shape(spline([[x - 70, 1500], [x - 40, 1500 - h * .6], [x, 1500 - h], [x + 40, 1500 - h * .6], [x + 70, 1500]]), { fill: i % 2 ? '#ffe36a' : '#ff9a2f', lw: 6 }); }
      fillOnly(rect(-2000, 1500, 5000, 900), '#3a1f1a', { boil: 0 });
    } else if (ph === 1) {
      fillScreen('#8f8a8a'); bands(['#a7a2a0', '#99938f', '#8a8480', '#7c7672'], -400, 1400, -2000, 3000);
      const dim = seg(t, tPo, tSol + .4); shape(ell(820, 420, 110, 110, 40), { fill: '#fff1c4', lw: 7 }); fillOnly(ell(820, 420, 130, 130, 40), `rgba(124,118,114,${dim * .9})`, { boil: .4 });
      for (let i = 0; i < 12; i++) { const x = (hash(i) * 1400 + t * 120) % 1400 - 100, y = 300 + hash(i * 2) * 1000; fillOnly(ell(x, y, 90, 50, 16), 'rgba(110,104,100,.5)', { boil: .5 }); }
      fillOnly(rect(-2000, 1500, 5000, 900), '#4a4644', { boil: 0 });
    } else if (ph === 2) {
      fillScreen('#9fd2ef'); bands(['#c4e6f7', '#b0dcf3', '#9fd2ef', '#8cc6e8'], -400, 1400, -2000, 3000);
      fillOnly(rect(-2000, 1500, 5000, 900), '#eaf6ff', { boil: 0 });
      scr(); for (let i = 0; i < 26; i++) { const x = (hash(i) * 1200 + Math.sin(t + i) * 40) % 1200 - 60, y = (hash(i * 3) * 2000 + t * 160) % 2000 - 40; push(); translate(x, y); for (let a = 0; a < 3; a++) { stroke([[-14, 0], [14, 0]], 4, { line: '#ffffff' }); rotate(Math.PI / 3); } pop(); }
    } else {
      fillScreen('#e9d6a8'); bands(['#efe0b8', '#e9d6a8', '#e2cc98'], -400, 1400, -2000, 3000);
      fillOnly(rect(-2000, 1500, 5000, 900), '#8a7a5a', { boil: 0 });
      for (let i = 0; i < 4; i++) { const x = 120 + i * 300; stroke([[x, 1500], [x + 10, 1380], [x - 10, 1300]], 6, { line: '#7a6a4a' }); }   // gravetos secos
    }
    const cold = ph === 2, hungry = ph === 3;
    duo(t, {
      n: { singe: ph >= 0 && t > tFo + .4 ? 1 : 0, nerv: cold ? .9 : 0, lid: ph === 0 ? .7 : .6, look: ph === 1 ? [.8, -.6] : [.5, -.1] },
      r: { nerv: cold ? 1.4 : ph === 0 ? .8 : .4, sweat: ph === 0, mouth: { o: hungry ? .4 : ph === 0 ? .9 : .5, sm: -.8 }, brow: .9, eyeS: 1.15, smoke: ph === 0, look: hungry ? [.2, .6] : [-.4, -.4] }
    });
    if (hungry) { scr(); const k = Math.floor(q(t) * 12) % 2; stroke(arc(860, 1420, 50 + k * 8, 30, Math.PI * 1.1, Math.PI * 1.9, 10), 6); stroke(arc(860, 1420, 80 + k * 8, 50, Math.PI * 1.15, Math.PI * 1.85, 10), 6); }
    const lbl = ['FOGO', 'POEIRA', 'FRIO', 'FOME'][ph], tl = [tFo, tPo, tFr, tFm][ph];
    sign(lbl, 540, 330, { size: 96, fill: ['#ffe36a', '#d8d2cc', '#ffffff', '#ffd23f'][ph], s: popIn(t, tl - .08), rot: [-.05, .04, -.03, .05][ph], font: 'Titan One', weight: '400' });
    return;
  }
  // os grandes dinossauros sumiram: silhuetas no horizonte tombam, uma a uma
  cam(540, 1100, 1, 0, t);
  fillScreen('#6e6a72'); bands(['#8a8590', '#7c7882', '#6e6a72', '#605c64'], -400, 1400, -2000, 3000);
  fillOnly(rect(-2000, 1420, 5000, 900), '#3e3a40', { boil: 0 });
  for (let i = 0; i < 4; i++) {
    const tf = tSum - .4 + i * .3, k = ss(seg(t, tf, tf + .45));
    push(); translate(140 + i * 270, 1420); rotate(k * (i % 2 ? 1.4 : -1.4)); translate(0, k * 60);
    sauropod(0, 0, .45 + (i % 2) * .08, '#2b2830', t * (1 - k), i);
    pop();
    if (k > .9 && k < 1) for (let p = 0; p < 3; p++) fillOnly(ell(140 + i * 270 + (p - 1) * 60, 1400, 50, 30, 12), 'rgba(160,150,160,.6)', { boil: .5 });
  }
  NOE({ x: 230, y: 1900, s: .7, t, holdR: 'glass', glow: .5, look: [.6, -.4], lid: .7, singe: 1 });
  REX({ x: 760, y: 1920, s: .72, t, face: -1, look: [-.2, -.5], nerv: .6, mouth: { o: .2, sm: -1 }, brow: 1, eyeS: 1.2 });
}

// 08 — "Corre, Noé! Corre!" → os dois para o portal
function s08(t) {
  const L = lip('08', t, 1.7), tC2 = w('08', 'corre', 1);
  if (t < tC2 - .08) {
    cam(860, 1100, 2.2, 12, t);
    creta(t, { dinos: false }); scr(); fillOnly(rect(0, 0, W, H), 'rgba(90,60,40,.35)', { boil: 0 });
    REX({ x: 820, y: 1780, s: .9, t, face: -1, look: [-.8, 0], mouth: { o: Math.max(.8, L.o), sm: -1 }, brow: 1.2, browAng: -1, eyeS: 1.3, nerv: 1.5, sweat: true, arms: 1 });
    return;
  }
  const k = seg(t, tC2 - .1, SCS['09'][0] - .05);
  cam(540, 1180, 1, 4, t);
  creta(t, { dinos: false, boom: 1 }); scr(); fillOnly(rect(0, 0, W, H), 'rgba(90,60,40,.35)', { boil: 0 });
  portal(140, 1300, 230, { open: 1, t });
  const sk = ei(seg(k, .55, 1));
  push(); translate(lerp(0, -140, sk), 0);
  NOE({ x: lerp(380, 180, k), y: 1780, s: lerp(.85, .2, sk), t, walk: 1, face: -1, holdR: 'glass', glow: 1, look: [-.8, 0], lid: .4, eyeS: 1.15, lean: -.15, singe: 1 });
  REX({ x: lerp(820, 260, k), y: 1800, s: lerp(.9, .25, sk), t, face: -1, run: 1, look: [-.8, 0], mouth: { o: 1, sm: -1 }, brow: 1, nerv: .5, lean: -.2, sweat: true, smoke: true });
  pop();
  speedLines(t, 8);
}

// 09 — o campo de futebol de 100 m
function s09(t) {
  const t0 = SCS['09'][0], v = VO['09'];
  const tEst = w('09', 'estica'), tCam = w('09', 'campo'), tOsD = w('09', 'os'), tCom = w('09', 'comecinho'), tHum = w('09', 'humanos'), t45 = w('09', '45'), tCen = w('09', 'centímetros'), tHis = w('09', 'história'), tBib = w('09', 'bíblia'), tMil = w('09', 'milímetros');
  const runA = tHum - .25, runB = t45 - .1;
  // posição do Rex: pousa no começo, corre até perto do fim
  const rk = ss(seg(t, runA, runB));
  const rxw = lerp(520, FL - 260, rk);
  // câmera (zoom exponencial)
  const Z = (a, b, k) => Math.exp(lerp(Math.log(a), Math.log(b), k));
  let cx, cy, z;
  if (t < tEst) { cx = 540; cy = 1180; z = 1; }
  else if (t < tOsD - .3) { const k = eio(seg(t, tEst, tCam + .3)); z = Z(1, .1, k); cx = lerp(540, FL / 2, k); cy = lerp(1180, 1300, k); }
  else if (t < runA) { const k = eio(seg(t, tOsD - .3, tCom)); z = Z(.1, 1, k); cx = lerp(FL / 2, 540, k); cy = lerp(1300, 1180, k); }
  else if (t < tHis - .1) { const k = seg(t, runA, runB); z = Z(1, .55, Math.sin(Math.PI * k)); cx = Math.min(rxw + 200, FL - 300); cy = 1180; if (t > runB) { const k2 = eio(seg(t, runB, tCen + .2)); z = Z(1, 7, k2); cx = lerp(FL - 300, FL - 22, k2); cy = lerp(1180, GY + 120, k2); } }
  else { const k2 = eio(seg(t, tHis - .1, tMil + .1)); z = Z(7, 110, k2); cx = lerp(FL - 22, FL - 3.4, k2); cy = lerp(GY + 120, GY + 158.6, k2); }
  const half = W / 2 / z;
  cam(cx, cy, z, 0, t);
  field(t, cx - half, cx + half);
  // faixas das pontas
  if (cx - half < 1600) sign('66 MILHÕES DE ANOS ATRÁS', 560, GY - 560, { size: 56, fill: '#e8392b', col: '#ffffff' });
  if (cx + half > FL - 1600) sign('HOJE', FL - 380, GY - 560, { size: 80, fill: '#3f6fd1', col: '#ffffff' });
  // os últimos 45 cm: faixa destacada com gente pequenininha
  const hl = seg(t, t45 - .1, t45 + .3);
  if (hl > 0) {
    fillOnly(rect(FL - 45, GY - 116, 45, 400), `rgba(255,214,63,${.55 * hl})`, { boil: .3 });
    for (let i = 0; i < 3; i++) caveman(FL - 38 + i * 12, GY + 160, .055, t, i);
  }
  // os últimos milímetros: a arca minúscula sobre o giz
  arca(FL - 3.4, GY + 160, 4.6, { t, necks: 1 });
  push(); translate(FL - 1.2, GY + 158.8); scale(.0016); noe({ x: 0, y: 0, s: 1, t, look: [-1, -.4], lid: .5, holdR: 'clip' }); pop();
  // o Rex
  const land = t - (t0 + .45);
  if (t < runA) {
    const fl = seg(t, t0, t0 + .45);
    REX({ x: 520, y: fl < 1 ? lerp(900, GY + 160, ei(fl)) : GY + 160, s: .8, t, sq: land > 0 ? 1 - .22 * Math.cos(land * 20) * Math.exp(-land * 6) : 1.05, arms: t > tOsD ? 1 : 0, look: [.6, -.2], mouth: { o: t > tOsD ? .5 : .2, sm: 1 }, brow: .5 });
  } else {
    const done = t > runB;
    REX({ x: rxw, y: GY + 160, s: .8, t, run: !done, lean: done ? -.1 : .18, look: [1, 0], mouth: { o: done ? .7 : .6, sm: done ? -.6 : .4 }, brow: .8, sweat: done, nerv: done ? .4 : 0, eyeS: 1.1 });
    if (!done) { scr(); speedLines(t, 12); }
  }
  // sinalizações de tela
  scr();
  if (t > tCam - .1 && t < tOsD - .25) { sign('INÍCIO', 120, 1180, { size: 40, fill: '#e8392b', col: '#ffffff', s: popIn(t, tCam + .2) }); sign('HOJE', 960, 1180, { size: 40, fill: '#3f6fd1', col: '#ffffff', s: popIn(t, tCam + .4) }); }
  if (t > tCam - .1 && t < tOsD - .25) sign('100 m = 66 MILHÕES DE ANOS', 540, 380, { size: 52, fill: '#ffffff', s: popIn(t, tCam - .1) });
  if (t > tOsD - .1 && t < runA + .3) sign('DINOSSAUROS: AQUI', 540, 380, { size: 58, fill: '#ffd23f', s: popIn(t, tOsD - .1) });
  if (t > t45 - .1 && t < tHis - .15) {
    scr(); const a = popIn(t, t45 - .1);
    sign('PRIMEIROS HUMANOS: 45 cm', 540, 380, { size: 52, fill: '#ffd23f', s: a });
  }
  if (t > tHis - .1) {
    // lupa por cima (tela)
    scr(); const a = ss(seg(t, tHis - .1, tHis + .3));
    stroke(ell(540, 1000, 470 * a + 1, 470 * a + 1, 80), 30, { line: '#5b3a1f' }); stroke(ell(540, 1000, 492 * a + 1, 492 * a + 1, 80), 6);
    if (a > .5) shape(noodle([870, 1340], [1080, 1600], 0, 60, 70), { fill: '#5b3a1f', lw: 7 });
    if (t > tMil - .15) sign('A ARCA: ÚLTIMOS MILÍMETROS', 540, 380, { size: 48, fill: '#ffffff', s: popIn(t, tMil - .15) });
  }
}

// 10 — "Eu corri cem metros... pra chegar atrasado?!"
function s10(t) {
  const L = lip('10', t, 1.2), tAt = w('10', 'atrasado');
  const pant = Math.abs(Math.sin(t * 8)) * 12;
  const look = t > tAt - .2;
  cam(FL - 120, GY - 200, look ? 1.3 : 1.15, 0, t);
  field(t, FL - 1200, FL + 900);
  sign('HOJE', FL - 380, GY - 560, { size: 80, fill: '#3f6fd1', col: '#ffffff' });
  arca(FL - 3.4, GY + 160, 4.6, { t, necks: 0 });
  if (look) { sign('A ARCA', FL - 3, GY + 20, { size: 30, fill: '#ffffff', s: popIn(t, tAt - .2) / 1.3 }); stroke([[FL - 3, GY + 60], [FL - 3, GY + 140]], 5); }
  REX({ x: FL - 260, y: GY + 160, s: .8, t, look: look ? [.9, .9] : [.6, 0], mouth: { o: Math.max(L.o, .25), sm: -.5 }, brow: 1, browAng: look ? -.8 : 0, sweat: true, bob: pant, lean: -.06, headTilt: look ? .2 : 0, eyeS: look ? 1.2 : 1 });
}

// 11 — já eram fóssil; não tinha casal pra embarcar
function s11(t) {
  const tFos = w('11', 'fóssil'), tOs = w('11', 'osso'), tPed = w('11', 'pedra'), tNao = w('11', 'não');
  if (t < tNao - .1) {
    const k = eio(seg(t, VO['11'] + 1.2, tFos + .2));
    cam(540, lerp(760, 2650, k), 1, 0, t);
    strata(t);
    // na superfície: a arca e o Noé, pequenos
    arca(700, 610, 320, { t, necks: 1 });
    NOE({ x: 300, y: 640, s: .22, t, look: [.5, .5], lid: .5, holdR: 'clip' });
    caveman(180, 640, .4, t);
    // lá embaixo: o fóssil do Rex
    fossil(560, 2700, 1.3);
    if (t > tFos - .1) sign('FÓSSIL', 540, 2340, { size: 64, fill: '#ffffff', s: popIn(t, tFos - .1) });
    // o Rex de verdade espia pela borda e engole seco
    const pk = ss(seg(t, tOs - .3, tOs + .2));
    if (pk > 0) {
      push(); translate(lerp(1350, 1080, pk), 2950); rotate(-.35);
      rex({ x: 0, y: 0, s: 1, t, face: -1, look: [-.9, .2], eyeS: 1.25, mouth: { o: t > tPed ? .15 : .35, sm: -1 }, brow: 1, nerv: t > tPed ? .8 : .2, sweat: t > tPed });
      pop();
    }
    return;
  }
  // corte: a baia dos dinossauros, vazia (grilos)
  cam(540, 1150, 1, 0, t);
  deck(t, { floorY: 1500 });
  for (let i = 0; i < 5; i++) stroke([[100 + i * 220, 1100], [100 + i * 220, 1620]], 16, { line: PAL.woodS });
  stroke([[60, 1150], [1020, 1150]], 14, { line: PAL.woodS }); stroke([[60, 1380], [1020, 1380]], 14, { line: PAL.woodS });
  sign('DINOSSAUROS', 540, 980, { size: 62, fill: PAL.paper, rot: .03 });
  stroke(spline([[100, 1100], [180, 1180], [220, 1110], [320, 1100]], false), 3, { line: 'rgba(255,255,255,.8)' });   // teia
  for (let i = 0; i < 4; i++) stroke(arc(100, 1100, 60 + i * 40, 60 + i * 40, 0, Math.PI / 2, 8), 2, { line: 'rgba(255,255,255,.6)' });
  stroke([[420, 1700], [470, 1690], [520, 1705]], 4, { line: '#e6c27a' });   // um fiapo de feno
  rain(t, 25, .3, .2);
}

// 12 — "Então. Nenhum dinossauro na arca."  (o carimbo)
function noeDeckClose(t, extra = {}) {
  deck(t, { floorY: 1700 });
  NOE({ x: 520, y: 2000, s: 1.5, t, lid: .62, look: [.2, .3], wet: 1, drip: 1, ...extra });
}
function s12(t) {
  const L = lip('12', t), tArc = w('12', 'arca');
  cam(540, 1150, 1, 0, t);
  const st = seg(t, tArc - .15, tArc + .05), up = seg(t, tArc + .15, tArc + .5);
  noeDeckClose(t, { holdR: 'stamp', armR: { h: [40, lerp(-20, 140, ei(st)) - up * 120], bend: 30 }, holdL: 'clip', armL: { h: [80, 180], bend: -20 }, zero: 1, marks: 2, mouth: { o: L.o, w: L.w, sm: -.2 }, bob: L.o * 6 });
  if (t > tArc + .02) sign('ZERO', 760, 1640, { size: 80, fill: '#e8392b', col: '#ffffff', s: popIn(t, tArc + .02), rot: -.12, font: 'Titan One', weight: '400' });
}

// 13 — pausa morta; pousa uma pomba. "Bom... quase nenhum." Aves são dinossauros. Corvo e pomba.
function s13(t) {
  const t0 = SCS['13'][0], v = VO['13'], tAv = w('13', 'aves'), tCar = w('13', 'carnívoros'), tTu = w('13', 'turma'), tCi = w('13', 'ciência'), tSao = w('13', 'são'), tE = w('13', 'e'), tCo = w('13', 'corvo'), tPo = w('13', 'pomba');
  const tLand = t0 + .9;
  if (t < tAv - .1) {
    // a pausa: mesmo enquadramento do 12, empurrão lento; a pomba desce e pousa na barba
    const close = t > v - .05;
    const k = ss(seg(t, t0, v));
    if (!close) cam(540, lerp(1150, 1080, k), lerp(1, 1.12, k), 0, t); else cam(560, 1180, 2.1, 0, t);
    const fl = seg(t, t0 + .1, tLand), lnd = t - tLand;
    const bx = lerp(1200, 600, eo(fl)), by = lerp(500, 1390, eo(fl));
    const dove = () => {};
    noeDeckClose(t, { holdL: 'clip', armL: { h: [80, 180], bend: -20 }, zero: 1, marks: 2, look: t > tLand + .6 ? [.4, -.9] : [.2, .3], lid: t > tLand + .6 ? .5 : .62, brow: t > tLand + .6 ? .4 : 0 });
    bird({ x: bx, y: by, s: 1.15, t, fly: fl < 1 ? 1 : 0, face: -1, look: [-.4, .3], sq: lnd > 0 ? 1 - .25 * Math.cos(lnd * 22) * Math.exp(-lnd * 7) : 1, smug: close, peck: false, headTilt: close ? Math.sin(t * 3) * .1 : 0 });
    return;
  }
  if (t < tTu - .1) {
    // a sombra na parede: pomba → raptor
    cam(540, 1150, 1, 0, t);
    deck(t, { win: false, floorY: 1560, lamp: true });
    stroke([[-100, 1500], [1200, 1500]], 18, { line: PAL.woodS });   // corrimão
    const m = ss(seg(t, tCar - .4, tCar + .2));
    push(); translate(560, 1300); scale(2.6 * (1 - m * .3)); fillOnly(spline([[-60, -50], [-30, -90], [30, -96], [70, -70], [60, -36], [0, -24], [-50, -30]]), `rgba(30,20,40,${.45 * (1 - m)})`, { boil: .5 }); fillOnly(ell(54, -104, 34, 32, 18), `rgba(30,20,40,${.45 * (1 - m)})`, { boil: .5 }); pop();
    if (m > 0) raptorShadow(560, 1460, 1.9 * (.6 + m * .4), `rgba(30,20,40,${.5 * m})`, .3 + .4 * Math.max(0, Math.sin(t * 6)));
    bird({ x: 480, y: 1500, s: 1, t, face: 1, look: [.5, 0], smug: 1 });
    return;
  }
  if (t < tCi - .1) {
    // foto de família: a mesma turma
    cam(540, 1150, 1, 0, t);
    fillScreen('#e9dcc0'); bandsScreen(['#efe3c8', '#e9dcc0', '#e2d3b4']);
    raptorShadow(560, 1700, 1.25, '#3f9a8a', .3);
    push(); translate(560 + 110 * 1.25 + 40, 1700 - 345 * 1.25 - 20); eye(0, 0, 18, 20, { look: [.6, 0], pupil: 4, skin: '#3f9a8a', lw: 5 }); pop();
    REX({ x: 230, y: 1760, s: .65, t, look: [.6, 0], arms: 1, mouth: { o: .3, sm: 1 }, brow: .4 });
    bird({ x: 900, y: 1760, s: 1.4, t, face: -1, look: [-.5, 0], smug: 1 });
    sign('MESMA TURMA', 540, 520, { size: 84, fill: '#ffd23f', s: popIn(t, tTu - .05), rot: -.03, font: 'Titan One', weight: '400' });
    sign('dinossauros terópodes', 540, 660, { size: 46, fill: '#ffffff', s: popIn(t, tTu + .4) });
    if (t > tTu - .1 && t < tTu + .05) { scr(); fillOnly(rect(0, 0, W, H), 'rgba(255,255,255,.8)', { boil: 0 }); }
    return;
  }
  if (t < tE - .1) {
    // carimbo: DINOSSAURO
    cam(540, 1150, 1, t > tSao && t < tSao + .25 ? 10 : 0, t);
    fillScreen('#cfe0ef'); bandsScreen(['#d9e8f4', '#cfe0ef', '#c4d8ea']);
    shape(rr(160, 1500, 760, 60, 14), { fill: PAL.woodL, lw: 7 });
    bird({ x: 540, y: 1520, s: 2.4, t, face: 1, look: [.3, -.2], smug: 1 });
    const a = popIn(t, tSao - .05, .2, 2.4);
    if (a > 0) { push(); translate(540, 760); rotate(-.18); scale(lerp(2.2, 1, Math.min(1, a))); shape(rr(-360, -80, 720, 160, 20), { fill: 'rgba(0,0,0,0)', lw: 12, line: '#e8392b' }); text('DINOSSAURO', 0, 6, { font: '110px "Titan One"', fill: '#e8392b' }); pop(); }
    return;
  }
  // a janela da arca: Noé solta o corvo e a pomba sobre a água
  cam(540, 1100, 1, 0, t);
  rainSky(t, { flash: false });
  water(t, 1500, { A: 26 });
  shape(rect(-200, 700, 1500, 650), { fill: PAL.woodL, lw: 8, shade: () => { for (let i = 0; i < 10; i++) fillOnly(rect(-200, 700 + i * 70, 1500, 6), PAL.wood, { boil: .2 }); } });
  shape(rect(-200, 1350, 1500, 260), { fill: PAL.wood, lw: 8 });
  shape(rr(250, 800, 420, 380, 16), { fill: '#3a2614', lw: 8 });
  push(); translate(0, 0);
  noe({ x: 450, y: 1560, s: .85, t, look: [.6, -.5], lid: .55, armR: { h: [130, lerp(60, -150, ss(seg(t, tCo - .4, tCo)) + ss(seg(t, tPo - .4, tPo)) * 0)], bend: 30 } });
  pop();
  shape(rect(-200, 1210, 1500, 140), { fill: PAL.woodL, lw: 0, line: null, shade: () => { for (let i = 0; i < 3; i++) fillOnly(rect(-200, 1230 + i * 40, 1500, 6), PAL.wood, { boil: .2 }); } });
  shape(rect(-200, 1350, 1500, 260), { fill: PAL.wood, lw: 8 });
  shape(rect(240, 1180, 440, 34), { fill: PAL.woodS, lw: 6 });   // peitoril
  for (const [tb, crow, dy] of [[tCo, 1, 0], [tPo, 0, 80]]) {
    const k = seg(t, tb - .2, tb + 2.2);
    if (t < tb - .2) { if (!crow) bird({ x: 640, y: 1180, s: .8, t, smug: 1, look: [.6, -.2] }); continue; }
    bird({ x: lerp(640, 1400, ei(k)), y: lerp(1100 + dy, 300 + dy, k), s: crow ? .9 : .8, t, crow, fly: 1, face: 1, a: -.3, look: [.8, -.3], branch: false });
  }
  rain(t, 30, .3, .25);
  if (t > tCo - .1) sign('CORVO', 820, 420, { size: 52, fill: '#ffffff', s: popIn(t, tCo - .1) });
  if (t > tPo - .1) sign('POMBA', 860, 600, { size: 52, fill: '#ffffff', s: popIn(t, tPo - .1) });
}

// 14 — "Prima?! Você entrou e eu não?!"
function s14(t) {
  const L = lip('14', t, 1.25), tVc = w('14', 'você'), tNao = w('14', 'não');
  cam(600, 1150, 1.15, t < VO['14'] + .3 ? 6 : 0, t);
  rainSky(t, { flash: false });
  water(t, 1620, { A: 20 });
  shape(rect(-400, 1480, 2000, 900), { fill: PAL.wood, lw: 8 });
  stroke([[-400, 1440], [1600, 1440]], 18, { line: PAL.woodS });
  REX({ x: 440, y: 1980, s: 1.2, t, look: [.9, .3], mouth: { o: L.o, sm: -.4 }, eyeS: t < tVc ? 1.35 : 1.1, brow: 1, browAng: t > tVc ? -1 : 0, nerv: t > tVc ? .5 : 0, arms: t > tVc ? 2 : 0, sweat: t > tVc, smoke: true });
  bird({ x: 860, y: 1440, s: 1.5, t, face: t > tNao ? 1 : -1, look: t > tNao ? [.8, -.3] : [-.6, 0], smug: 1, headTilt: t > tNao ? -.2 : 0 });
  rain(t, 20, .3, .2);
}

// 15 — a resposta, com o trabalho pronto: arco-íris, arca na água calma, aves voando
function s15(t) {
  const t0 = SCS['15'][0], tSum = w('15', 'sumiram'), tEx = w('15', 'existir'), tPe = w('15', 'pena'), tVo = w('15', 'voando');
  const k = ss(seg(t, t0, END));
  cam(540, lerp(1150, 1100, k), lerp(1.05, .92, k), 0, t);
  afterSky(t, ss(seg(t, t0, t0 + 1.4)));
  water(t, 1480, { A: 10, cols: ['#6fb6d6', '#5aa3c6', '#4a90b3'] });
  arca(560, 1500, 860, { t, necks: 1, roll: Math.sin(t * .9) * .015 });
  // no convés: Noé (enfim um sorrisinho) e o Rex de boias
  push(); translate(560, 1500 - 180 * .955); scale(.42);
  noe({ x: -520, y: 0, s: 1, t, holdR: 'clip', marks: 2, zero: 1, look: [.6, -.3], lid: .45, mouth: { o: 0, sm: .6 } });
  rex({ x: 640, y: 0, s: .9, t, face: -1, arms: 1, look: [-.4, -.6], mouth: { o: .4, sm: 1 }, brow: .4 });
  pop();
  // aves (dinossauros de pena) cruzando o arco-íris
  for (let i = 0; i < 5; i++) {
    const kk = seg(t, tPe - .4 + i * .18, tPe + 3.2 + i * .18);
    if (kk <= 0) continue;
    bird({ x: lerp(-100, 1250, kk), y: 520 + i * 70 + Math.sin(t * 3 + i) * 20, s: .55, t: t + i, fly: 1, crow: i === 2, branch: i === 0, look: [.8, 0] });
  }
  scr();
  const items = [['SUMIRAM 66 MILHÕES DE ANOS ANTES', tSum - .1, '#ffd23f'], ['MUITO ANTES DE EXISTIR GENTE', tEx - .1, '#ffffff'], ['AVES = DINOSSAUROS', tPe - .1, '#9be08a']];
  items.forEach(([s_, tt, c], i) => { if (t > tt) sign(s_, 540, 230 + i * 110, { size: i === 2 ? 56 : 44, fill: c, s: popIn(t, tt) }); });
}

// 16 — chamada
function s16(t) {
  const v = VO['16'], tCm = w('16', 'comenta'), tCu = w('16', 'curte'), tCp = w('16', 'compartilha');
  cam(540, 960, 1, 0, t);
  bandsScreen(['#ffe8cf', '#ffd9b8', '#ffcaa0', '#f6b98c']);
  NOE({ x: 250, y: 1900, s: .72, t, look: [.5, -.3], lid: .45, mouth: { sm: .7 }, holdR: 'clip', marks: 2, zero: 1 });
  REX({ x: 820, y: 1900, s: .7, t, face: -1, arms: 1, look: [-.4, -.4], mouth: { o: .5, sm: 1 }, brow: .4, bob: -Math.abs(Math.sin(t * 6)) * 14 });
  bird({ x: 540, y: 1180 + Math.sin(t * 2) * 10, s: .9, t, fly: 1, look: [0, .4] });
  const a = popIn(t, v - .1, .35, 1.8);
  if (a > 0) text('Se você gostou,', 540, 300, { font: `800 ${Math.round(84 * a)}px "Baloo 2"`, fill: '#ffffff', outlineW: 14 });
  const ic = [['COMENTA', tCm, '#3f6fd1', 0], ['CURTE', tCu, '#e8392b', 1], ['COMPARTILHA', tCp, '#2f9a4a', 2]];
  for (const [s_, tt, c, i] of ic) {
    const b = popIn(t, tt - .08, .3, 1.9); if (b <= 0) continue;
    push(); translate(540, 470 + i * 190); scale(b); rotate([-.04, .03, -.02][i]);
    shape(rr(-330, -72, 660, 144, 60), { fill: c, lw: 8 });
    // ícones
    push(); translate(-240, 0);
    if (i === 0) { shape(spline([[-40, -34], [40, -34], [48, 0], [36, 26], [-6, 26], [-30, 46], [-24, 26], [-42, 20], [-48, -8]]), { fill: '#ffffff', lw: 6 }); }
    if (i === 1) { shape(spline([[0, 40], [-46, 0], [-40, -30], [-16, -38], [0, -18], [16, -38], [40, -30], [46, 0]]), { fill: '#ffffff', lw: 6 }); }
    if (i === 2) { shape([[-40, 10], [10, 10], [10, 34], [50, -6], [10, -46], [10, -22], [-40, -22]], { fill: '#ffffff', lw: 6 }); }
    pop();
    text(s_, 50, 4, { font: '70px "Titan One"', fill: '#ffffff', outlineW: 12 });
    pop();
  }
}

const FN = { '01': s01, '02': s02, '03': s03, '04': s04, '05': s05, '06': s06, '07': s07, '08': s08, '09': s09, '10': s10, '11': s11, '12': s12, '13': s13, '14': s14, '15': s15, '16': s16 };
window.DUR = END;
window.render = (t) => {
  frame(t);
  fillScreen('#000');
  const sc = SC.find(([, a, b]) => t >= a && t < b) || SC[SC.length - 1];
  FN[sc[0]](t, t - sc[1], sc[2] - sc[1]);
  // passagens pelo portal: redemoinho
  for (const id of ['04', '09']) swirlWipe(t, SCS[id][0]);
};

// —— eventos de som ——
const EV = [];
const ev = (type, t, o = {}) => EV.push({ type, t: +t.toFixed(3), ...o });
for (const id of ORDER) ev('vo', VO[id], { id, who: ENV[id] ? ENV[id].who : 'N' });
const S = id => SCS[id][0];
ev('cue', 0, { name: 'arca', t0: 0, t1: S('04') });
ev('cue', S('04'), { name: 'creta', t0: S('04'), t1: VO['07'] - .1 });
ev('cue', VO['07'] - .1, { name: 'impacto', t0: VO['07'] - .1, t1: S('09') });
ev('cue', S('09'), { name: 'campo', t0: S('09'), t1: w('10', 'atrasado') });
ev('cue', w('10', 'atrasado') + .1, { name: 'triste', t0: w('10', 'atrasado') + .1, t1: S('11') });
ev('cue', S('11'), { name: 'fossil', t0: S('11'), t1: w('11', 'não') - .1 });
ev('cue', VO['13'], { name: 'aves', t0: VO['13'], t1: S('15') });
ev('cue', S('15'), { name: 'final', t0: S('15'), t1: END });
// trovões na chuva
for (let k = 0; k < END * 1.1; k++) { const t = k / 1.1; if (hash(k * 7.3) > .84) { const sc = SC.find(([, a, b]) => t >= a && t < b); if (sc && ['01'].includes(sc[0]) && t < w('01', 'por')) ev('thunder', t + .1); } }
// 01
for (let i = 0; i < 8; i++) ev('clop', .4 + i * .55, { g: .5 });
ev('pop', w('01', 'pergunta')); ev('whoosh', w('01', 'por') - .1); ev('rolling', w('01', 'por') + .2, { d: 3 }); ev('titleHit', w('01', 'dinossauros'));
// 02
ev('steps', w('02', 'girafa') - .5, { d: 3 }); ev('elephant', w('02', 'elefante') + .2); ev('steps', w('02', 'elefante') - .4, { d: 3 });
ev('check', w('02', 'duas') + .15); ev('check', w('02', 'dois') + .15); ev('marker', w('02', 'zero'), { d: .5 }); ev('sting', w('02', 'zero') + .55);
// 03
ev('ding', VO['03'] + .3); ev('tick', w('03', 'era', 1) - .1, { d: w('03', 'então') - w('03', 'era', 1) }); ev('cloth', w('03', 'pegou') - .2); ev('click', w('03', 'portal'));
ev('portalOpen', w('03', 'buscar') - .2); ev('portalHum', w('03', 'buscar'), { d: S('04') - w('03', 'buscar') }); ev('suck', w('03', 'passado') - .05); ev('portalWhoosh', S('04') - .15);
// 04
ev('portalOpen', S('04') + .02); ev('portalHum', S('04') + .3, { d: VO['07'] - S('04') - .3 }); ev('slide', S('04') + .15); ev('thud', S('04') + .78);
ev('volcano', w('04', 'vulcões') + .05); ev('jump', w('04', 'rex') - .3); ev('boing', w('04', 'rex') + .25); ev('thud', w('04', 'rex') + .25);
// 05–06
ev('twinkle', w('06', 'estrela')); ev('blip', w('06', 'olha'));
// 07
ev('gulp', VO['07'] + .6); ev('meteor', w('07', 'asteroide') - .15, { d: w('07', 'caiu') - w('07', 'asteroide') + .1 }); ev('pop', w('07', '10'));
ev('meteorSmall', w('07', 'caiu') - .1, { d: w('07', 'méxico') - w('07', 'caiu') + .15 }); ev('impact', w('07', 'méxico') + .05); ev('pop', w('07', 'méxico') - .2);
ev('fire', w('07', 'fogo') - .05, { d: w('07', 'poeira') - w('07', 'fogo') }); ev('wind', w('07', 'poeira') - .05, { d: w('07', 'frio') - w('07', 'poeira') }); ev('brr', w('07', 'frio')); ev('growl', w('07', 'fome') + .1);
for (const k of ['fogo', 'poeira', 'frio', 'fome']) ev('stinger', w('07', k) - .08);
for (let i = 0; i < 4; i++) ev('fall', w('07', 'sumiram') - .4 + i * .3 + .4);
// 08
ev('steps', w('08', 'corre', 1) - .1, { d: 1.2, fast: 1 }); ev('suck', S('09') - .5); ev('portalWhoosh', S('09') - .15);
// 09
ev('thud', S('09') + .45); ev('zoomOut', w('09', 'estica'), { d: w('09', 'campo') - w('09', 'estica') + .3 }); ev('crowd', S('09') + .3, { d: w('10', 'atrasado') - S('09') });
ev('pop', w('09', 'campo') - .1); ev('pop', w('09', 'os') - .1); ev('whistle', w('09', 'humanos') - .35); ev('steps', w('09', 'humanos') - .25, { d: w('09', '45') - w('09', 'humanos') + .1, fast: 1 });
ev('skid', w('09', '45') - .1); ev('pop', w('09', '45') - .1); ev('zoomIn', w('09', 'história') - .1, { d: w('09', 'milímetros') - w('09', 'história') + .2 }); ev('ding', w('09', 'milímetros'));
{ const runA = w('09', 'humanos') - .25, runB = w('09', '45') - .1; ev('mark', runA, { name: 'run' }); ev('mark', runB, { name: 'stop' }); ev('mark', w('09', 'história') - .1, { name: 'lupa' }); }
// 11
ev('dive', VO['11'] + 1.2); ev('pop', w('11', 'fóssil') - .1); ev('gulp', w('11', 'pedra') + .3); ev('crickets', w('11', 'não') - .1, { d: VO['13'] - w('11', 'não') + .1 });
// 12
ev('stamp', w('12', 'arca') + .02); ev('pop', w('12', 'arca') + .05);
// 13 (a pausa)
ev('flutter', S('13') + .1, { d: .8 }); ev('squish', S('13') + .9); ev('coo', S('13') + 1.4); ev('coo', VO['13'] + .9);
ev('roar', w('13', 'carnívoros') - .2); ev('camera', w('13', 'turma') - .1); ev('pop', w('13', 'turma') + .4); ev('stamp', w('13', 'são') - .02);
ev('caw', w('13', 'corvo') + .1); ev('flutter', w('13', 'corvo') - .1, { d: 1 }); ev('flutter', w('13', 'pomba') - .1, { d: 1 }); ev('coo', w('13', 'pomba') + .4);
// 14
ev('boing', VO['14'] - .05); ev('coo', w('14', 'não') + .4);
// 15
ev('harp', S('15') + .1); ev('gulls', S('15'), { d: END - S('15') - 3 });
for (const k of ['sumiram', 'existir', 'pena']) ev('pop', w('15', k) - .1);
ev('flutter', w('15', 'pena') - .3, { d: 2.5 });
// 16
ev('pop', VO['16'] - .1); ev('pop', w('16', 'comenta') - .08); ev('pop', w('16', 'curte') - .08); ev('titleHit', w('16', 'compartilha') - .08);
for (const [id, a, b] of SC) ev('amb', a, { d: +(b - a).toFixed(3), w: { '01': 'rain', '02': 'rain', '03': 'rain', '04': 'jungle', '05': 'jungle', '06': 'jungle', '07': 'none', '08': 'jungle', '09': 'field', '10': 'field', '11': 'cave', '12': 'rain', '13': 'rain', '14': 'rain', '15': 'sea', '16': 'none' }[id] });
EV.sort((a, b) => a.t - b.t);
window.EV = EV;

await document.fonts.ready;
await Promise.all(['120px "Titan One"', '800 40px "Baloo 2"', '64px "VT323"'].map(f => document.fonts.load(f)));
window.READY = true;
