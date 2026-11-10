// main.js — "Jornal do Seu Chicó", ep. 01: "Visita boa toma café e vai embora" — 1080×1920, 24 fps
// Tudo amarrado a timeline.json (falas cortadas, posições no filme, envelope de boca e palavras).
import { clamp, lerp, seg, ss, eo, ei, eio, back, hash, TAU } from '../lib.js';
import { INK, init, frame, g, push, pop, translate, rotate, scale, shape, fillOnly, stroke, rect, rr, ell, arc, spline, text, S } from '../toon.js';
import { chico, zefinha, gato, gatoEmPe, papagaio, poleiro, poltrona, mesinha, garrafa, xicara, sala, paninho, jornalClose, jornalDobrado, PAL } from '../cast.js';

init(document.getElementById('c'));
const TL = await (await fetch(new URL('./timeline.json', import.meta.url))).json();
const L = TL.lines, DUR = TL.dur; window.DUR = DUR;
const st = t => Math.floor(t * 12 + 1e-6) / 12; // poses e bocas em 2s (12 fps)
const end = i => L[i].t0 + L[i].dur;

// —— a notícia no jornal (manchete real, resumo nosso, selo de fonte) ——
const NEWS = {
  masthead: 'BRAZUELA', date: 'SEGUNDA-FEIRA, 9 DE NOVEMBRO DE 2026', kicker: 'SÃO PAULO',
  headline: 'ESPOSA DE FHC PRESTA QUEIXA CONTRA HOMEM QUE FEZ VÍDEO EM APARTAMENTO DO EX-PRESIDENTE',
  resumo: 'Visitante gravou a sala, o quarto, o escritório e o próprio FHC, que tem Alzheimer, e postou nas redes. Diz que tinha autorização; a esposa diz que não e registrou queixa. A polícia investiga. Os vídeos foram apagados.',
  fonte: ['FONTE: g1 São Paulo · 09/11/2026', 'g1.globo.com/sp/sao-paulo'],
  clip: (x, y, w, h) => { // celular com o botão de gravar riscado (desenho nosso)
    shape(rr(x, y, w, h, 10), { fill: '#e9e0c8', lw: 5 });
    const cx = x + w / 2, cy = y + h / 2;
    shape(rr(cx - 56, cy - 92, 112, 184, 18), { fill: '#3a3a44', lw: 6 });
    shape(rr(cx - 46, cy - 76, 92, 146, 8), { fill: '#9ad4e8', lw: 4 });
    shape(ell(cx, cy - 4, 24, 24, 20), { fill: PAL.pRed, lw: 5 });
    stroke([[cx - 84, cy + 84], [cx + 84, cy - 84]], 22); stroke([[cx - 84, cy + 84], [cx + 84, cy - 84]], 12, { line: PAL.pRed });
  },
};

// —— fala, boca, piscada ——
function lineOf(who, t) { for (const l of L) if (l.who === who && t >= l.t0 - .02 && t < l.t0 + l.dur) return l; return null; }
function mouthOf(who, t) { const l = lineOf(who, t); if (!l) return 0; const i = Math.floor((st(t) - l.t0) * 24); return l.env[clamp(i, 0, l.env.length - 1)] ?? 0; }
function blink(t, ph) { const u = (t + ph) % 3.4; return u < .12; }
const env = (t, a, b, fi = .3, fo = .3) => Math.min(seg(t, a, a + fi), 1 - seg(t, b - fo, b));
function cam(cx, cy, z, fn) { push(); translate(540, 960); scale(z); translate(-cx, -cy); fn(); pop(); }
function shake(t, a, amp = 12) { const k = Math.floor(t * 24); return [(hash(k * 3.1) - .5) * amp * a, (hash(k * 7.7) - .5) * amp * a]; }
const lerp2 = (a, b, u) => [lerp(a[0], b[0], u), lerp(a[1], b[1], u), lerp(a[2], b[2], u)];

// —— eventos (tempos do filme) ——
const T = {
  close: L[1].t0 - .3, closeEnd: end(2) + 1.7, read1: L[2].t0 + 8.55, read2: L[2].t0 + 13.9, read3: L[2].t0 + 16.5,
  throwA: end(6) - .15, throwB: end(6) + .55,           // paninho voa da poltrona pro poleiro
  unveil: L[11].t0 - .1,                                  // paninho escorrega da cabeça do Lorenzo
  catIn: L[9].t0 + .3, catUp: L[9].t0 + 2.4,
  crash: end(9) + .12,                                   // a pata derruba a xícara
  stand: end(14) + .35, walkA: end(14) + .8, walkB: L[15].t0 - .5,
};
window.EVENTS = T; window.TL = TL;
const CUP = [912, 1470], FLOOR_CUP = [850, 1886];
function cupPos(t) {
  if (t < T.crash) return { p: CUP, r: 0, on: true };
  const u = seg(t, T.crash, T.crash + .38);
  if (u >= 1) return null;
  return { p: [lerp(CUP[0], FLOOR_CUP[0], u), lerp(CUP[1] - 20, FLOOR_CUP[1], ei(u)) - Math.sin(u * Math.PI) * 60], r: -u * 3.4, on: false };
}
function cacos(t) { // xícara quebrada + poça de café
  if (t < T.crash + .38) return;
  const u = eo(seg(t, T.crash + .38, T.crash + 1.4));
  shape(ell(FLOOR_CUP[0] + 10, FLOOR_CUP[1] + 4, 40 + 70 * u, 12 + 18 * u, 30), { fill: PAL.coffee, lw: 5 });
  for (const [dx, dy, r, k] of [[-60, -6, .4, 1], [-20, 8, -.6, .8], [30, -12, .9, 1.1], [70, 4, -.2, .7], [4, -26, .3, .6]]) {
    push(); translate(FLOOR_CUP[0] + dx * (.4 + u * .6), FLOOR_CUP[1] + dy * (.4 + u * .6)); rotate(r); scale(k);
    shape([[-18, 0], [-6, -16], [18, -8], [14, 8], [-10, 10]], { fill: PAL.cup, lw: 5, shade: () => fillOnly(rect(-20, -16, 40, 6), PAL.cupBand, { boil: .2 }) });
    pop();
  }
}

// —— personagens no cenário ——
function chicoAt(t, o = {}) {
  const m = mouthOf('chico', t), cl = blink(t, .3);
  if (t >= T.stand) { // em pé e caminhando pro quarto
    const w = seg(t, T.walkA, T.walkB), x = lerp(400, -260, ss(w)), up = eo(seg(t, T.stand, T.stand + .3));
    if (x < -240) return;
    chico({ x, y: 1800 - Math.abs(Math.sin(st(t) * 6)) * 10 * (w > 0 && w < 1 ? 1 : 0), s: .95 * lerp(.96, 1, up), t, face: w > 0 ? -1 : 1, walk: w > 0 && w < 1 ? st(t) * 1.6 : null,
      armL: { h: [-30, 220], bend: -20 }, armR: { h: [30, 220], bend: 20 }, look: [-.6, .1], lid: .55, brow: .9, mouth: { o: m * .9, sm: -.6 }, closed: cl });
    return;
  }
  chico({ x: 400, y: 1800, s: .95, t, sit: true, paper: {}, closed: cl, ...o, mouth: { o: m * (o.mouthK ?? .95), sm: o.sm ?? .3, ...(o.mouthX || {}) } });
}
function zefAt(t, o = {}) {
  const m = mouthOf('zefinha', t), ph = st(t) * TAU * .7, cx = Math.cos(ph), sy = Math.sin(ph);
  zefinha({ x: 760, y: 1302, s: .66, t, spoon: !o.cross, cross: o.cross,
    armR: o.cross ? undefined : (o.armR || { e: [58, 74], h: [106 + cx * 18, -36 + sy * 6], spoonA: 1.38 - cx * .12, spoonL: .55 }), armL: { h: [-20, 200], bend: -10 },
    look: o.look || [.5, 0], lid: blink(t, 1.7) ? 1 : (o.lid ?? .35), brow: o.brow ?? .3, tilt: o.tilt ?? 0,
    mouth: { o: m * .9, sm: o.sm ?? -.45 } });
}
function lorenzoAt(t, o = {}) {
  const m = mouthOf('lorenzo', t), talking = m > .05;
  const covered = t >= T.throwB && t < T.unveil + .45;
  papagaio({ x: 150, y: 996, s: .7, t, beak: talking ? clamp(m * 1.2) : 0, wing: talking ? .5 + .5 * Math.abs(Math.sin(st(t) * 9)) : 0,
    bob: talking ? Math.sin(st(t) * 14) * 6 : Math.sin(t * 2) * 2, look: o.look || [.6, .3], lid: blink(t, 2.4) ? 1 : .1 });
  if (covered) { // debaixo do paninho: só o bico aparece
    const u = seg(t, T.unveil, T.unveil + .45);
    paninho(158 + u * 60, 760 + u * 260, 1.05, .1 + u * 1.2);
  }
}
function bitucaAt(t) {
  if (t < T.catIn) return;
  if (t < T.catUp) { const u = ss(seg(t, T.catIn, T.catUp)); gato({ x: lerp(1240, 1060, u), y: 1798 - Math.abs(Math.sin(st(t) * 9)) * 8, s: .5, t, face: -1, arch: .2, look: [-.4, -.6] }); return; }
  const up = seg(t, T.catUp, T.catUp + .35), sq = 1 + Math.sin(up * Math.PI) * .08;
  const sw = seg(t, T.crash - .28, T.crash + .06), after = t > T.crash + .45;
  gatoEmPe({ x: 1012, y: 1792, s: .75 * sq, t, face: -1, swipe: sw < 1 ? sw : 0, look: after ? [.9, .1] : [.8, .5], lid: after ? .45 : .1,
    mouth: after ? { o: 0, sm: .9, skew: -.5, lw: 5 } : undefined });
}
// a sala inteira, na ordem de profundidade
function room(t, o = {}) {
  sala({ t }, { kitchen: () => zefAt(t, o.zef || {}) });
  poleiro({ x: 160, y: 1430, s: 1, h: 420 });
  lorenzoAt(t, o.lor || {});
  mesinha({ x: 860, y: 1770, s: .9 });
  garrafa({ x: 826, y: 1472, s: .55 });
  const c = cupPos(t); if (c && c.on) xicara({ x: c.p[0], y: c.p[1], s: .6, t });
  poltrona({ x: 400, y: 1820, s: .9, noDoily: t >= T.throwA });
  if (t >= T.stand) jornalDobrado(392, 1566, .95, -.04);
  chicoAt(t, o.chico || {});
  bitucaAt(t);
  if (c && !c.on) xicara({ x: c.p[0], y: c.p[1], s: .6, t, rot: c.r, steam: false });
  cacos(t);
  if (t >= T.throwA && t < T.throwB) { // paninho voando
    const u = seg(t, T.throwA, T.throwB);
    paninho(lerp(400, 158, u), lerp(1188, 760, eio(u)) - Math.sin(u * Math.PI) * 220, lerp(.85, 1.05, u), u * TAU * 1.2);
  }
}

// —— letreiro (chamada) ——
function sign(str, x, y, { fill = '#ffd23f', col = INK, sz = 54, rot = 0, p = 1, font = '"Titan One"', wt = '' } = {}) {
  if (p <= 0) return;
  push(); translate(x, y); rotate(rot); scale(p);
  g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.font = `${wt}${sz}px ${font}`; const w = g.measureText(str).width; g.restore();
  shape(rr(-w / 2 - 26, -sz * .78, w + 52, sz * 1.5, 18), { fill, lw: 7 });
  text(str, 0, 2, { font: `${wt}${sz}px ${font}`, fill: col });
  pop();
}
const popIn = (t, a, d = .35) => t < a ? 0 : back(seg(t, a, a + d), 1.2);
const wordT = (i, w) => (L[i].words.find(q => q.w.toLowerCase().includes(w)) || L[i].words[0]).s;

// o jornal na mão dele (close em primeira pessoa)
function page(t, cy, z) {
  g.setTransform(1, 0, 0, 1, 0, 0); g.fillStyle = '#5a3d2e'; g.fillRect(0, 0, 1080, 1920);
  cam(540, cy, z, () => jornalClose({ t, ...NEWS }));
}
// —— planos ——
const CH = [400, 1330, 1.55], ZE = [800, 1060, 1.7], LO = [235, 880, 2.3], TWO = [640, 1380, 1.2], WIDE = [540, 960, 1];
const SHOTS = [
  // abertura: a sala às 18h10, empurrando devagar até o Seu Chicó
  [0, T.close, t => cam(...lerp2([540, 1060, 1], [430, 1300, 1.32], ss(seg(t, 0, T.close))), () => room(t, { chico: { look: [0, .1], lid: .55, brow: -.2, sm: .6 } }))],
  // close em primeira pessoa: manchete, e a câmera desce pela página até o selo de fonte
  [T.close, T.read1, t => page(t, 950, 1.28)],
  // no meio da leitura: ele lendo de óculos, e a Dona Zefinha ouvindo da cozinha
  [T.read1, T.read2, t => cam(CH[0], CH[1] - 30, CH[2] + .1 * seg(t, T.read1, T.read2), () => room(t, { chico: { look: [0, .9], lid: .55, brow: .2, sm: 0 } }))],
  [T.read2, T.read3, t => cam(...ZE, () => room(t, { zef: { look: [-.8, .2], lid: .3, brow: .8, tilt: .05 } }))],
  // volta pro jornal: resumo e o selo de fonte parado na tela
  [T.read3, T.closeEnd, t => page(t, lerp(1010, 1130, ss(seg(t, T.read3, end(2) - 1.2))), 1.3)],
  // ele baixa o jornal e comenta
  [T.closeEnd, L[4].t0 - .1, t => cam(...CH, () => room(t, { chico: { look: [.15, 0], lid: .2, brow: .9, sm: -.5 } }))],
  // Dona Zefinha da cozinha: "Né pussive!"
  [L[4].t0 - .1, end(4) + .2, t => cam(...ZE, () => room(t, { zef: { look: [-.6, .1], lid: .1, brow: -.2, armR: { h: [110, -80], bend: -30, spoonA: -1.4 } } }))],
  // Lorenzo: "Grava! Grava!"
  [end(4) + .2, end(5), t => cam(...LO, () => room(t))],
  // "Cala a boca, Lorenzo!" + o paninho voa
  [end(5), L[7].t0 - .1, t => cam(470, 1240, 1.25, () => room(t, { chico: { look: [-.9, -.3], lid: .1, brow: 1.2, sm: -.6, mouthK: 1.2 }, lor: { look: [.7, .4] } }))],
  // "Visita boa..." (rindo)
  [L[7].t0 - .1, L[8].t0 - .1, t => cam(CH[0], CH[1], CH[2] + .08 * seg(t, L[7].t0, L[8].t0), () => room(t, { chico: { look: [.4, -.1], lid: .3, brow: -.4, sm: 1, tilt: -.05 } }))],
  // Dona Zefinha de braços cruzados: "Bem que te avisei"
  [L[8].t0 - .1, L[9].t0 - .1, t => cam(...ZE, () => room(t, { zef: { cross: true, look: [-.5, .1], lid: .45, brow: .2 } }))],
  // "Velho também tem direito..." e o Bituca sobe na mesinha
  [L[9].t0 - .1, L[10].t0 - .05, t => cam(...TWO, () => room(t, { chico: t < T.crash + .1 ? { closed: true, lid: .6, brow: -.3, sm: .5 } : { look: [.9, .3], lid: 0, brow: 1.2, sm: -.8, mouthX: { o: .5 } } }))],
  // "...e ao seu CAFÉ! BITUCA!" (close com tremida)
  [L[10].t0 - .05, end(10) + .12, t => { const [sx, sy] = shake(t, 1); cam(400 + sx, 1250 + sy, 2.3, () => room(t, { chico: { look: [.6, .2], lid: 0, brow: 1.4, sm: -.9, mouthK: 1.6 } })); }],
  // Lorenzo debocha
  [end(10) + .12, L[12].t0 - .1, t => cam(...LO, () => room(t))],
  // "Visita aqui deixa o celular na porta..." (resmungando; o Bituca na mesinha, com cara de santo)
  [L[12].t0 - .1, L[13].t0 - .1, t => cam(...TWO, () => room(t, { chico: { look: [.2, .1], lid: .5, brow: 1, sm: -.7 } }))],
  // "Rapaz, o mundo tá de cabeça pra baixo mesmo"
  [L[13].t0 - .1, L[14].t0 - .1, t => cam(...ZE, () => room(t, { zef: { look: [0, .2], lid: .6, brow: .6, tilt: -.06 } }))],
  // "Vou dormir que é melhor" — levanta e vai de chinelo pro quarto
  [L[14].t0 - .1, L[15].t0 - .25, t => cam(...lerp2([430, 1300, 1.3], [470, 1180, 1.12], ss(seg(t, end(14), T.walkA + .5))), () => room(t, { chico: { look: [.1, .1], lid: .6, brow: .9, sm: -.8 } }))],
  // sala vazia: Lorenzo faz a chamada
  [L[15].t0 - .25, DUR + 1, t => {
    cam(...lerp2([470, 1180, 1.12], [330, 1050, 1.4], ss(seg(t, L[15].t0 - .25, end(15)))), () => room(t, { lor: { look: [.8, .2] } }));
    const p1 = popIn(t, L[15].t0 + .1), p2 = popIn(t, wordT(15, 'curioso') - .05);
    sign('Se você gostou, comenta:', 540, 300, { p: p1, sz: 50, font: '"Baloo 2"', wt: '800 ', fill: '#ffffff', rot: -.02 });
    sign('CURIOSO SOH!', 540, 430, { p: p2, sz: 92, rot: .03 });
  }],
];

window.render = (t) => {
  frame(t);
  g.setTransform(1, 0, 0, 1, 0, 0); g.fillStyle = INK; g.fillRect(0, 0, 1080, 1920);
  const sh = SHOTS.find(([a, b]) => t >= a && t < b) || SHOTS[SHOTS.length - 1];
  sh[2](t);
  S.lwScale = 1;
};
await document.fonts.load('92px "Titan One"'); await document.fonts.load('800 38px "Baloo 2"'); await document.fonts.load('64px "Bungee"');
window.READY = true;
