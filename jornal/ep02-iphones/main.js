// main.js — "Jornal do Seu Chicó", ep. 02: "Dura mais que mandato" — 1080×1920, 24 fps
// Tudo amarrado a timeline.json (falas cortadas, posições no filme, envelope de boca e palavras).
import { clamp, lerp, seg, ss, eo, ei, eio, back, hash, TAU } from '../lib.js';
import { INK, init, frame, g, push, pop, translate, rotate, scale, shape, fillOnly, stroke, rect, rr, ell, arc, spline, noodle, text, S } from '../toon.js';
import { chico, zefinha, gato, gatoEmPe, papagaio, poleiro, poltrona, mesinha, garrafa, xicara, sala, jornalClose, jornalDobrado, celularVelho, hand, sweat, PAL } from '../cast.js';
import { NEWS } from './news.js';

init(document.getElementById('c'));
const TL = await (await fetch(new URL('./timeline.json', import.meta.url))).json();
const L = TL.lines, DUR = TL.dur; window.DUR = DUR;
const st = t => Math.floor(t * 12 + 1e-6) / 12; // poses e bocas em 2s (12 fps)
const end = i => L[i].t0 + L[i].dur;
// início da n-ésima palavra da fala i que contém w
const wordT = (i, w, n = 0) => { const ws = L[i].words.filter(q => q.w.toLowerCase().includes(w)); return (ws[n] || ws[0] || L[i].words[0]).s; };

// —— fala, boca, piscada ——
function lineOf(who, t) { for (const l of L) if (l.who === who && t >= l.t0 - .02 && t < l.t0 + l.dur) return l; return null; }
function mouthOf(who, t) { const l = lineOf(who, t); if (!l) return 0; const i = Math.floor((st(t) - l.t0) * 24); return l.env[clamp(i, 0, l.env.length - 1)] ?? 0; }
function blink(t, ph) { const u = (t + ph) % 3.4; return u < .12; }
function cam(cx, cy, z, fn) { push(); translate(540, 960); scale(z); translate(-cx, -cy); fn(); pop(); }
function shake(t, a, amp = 12) { const k = Math.floor(t * 24); return [(hash(k * 3.1) - .5) * amp * a, (hash(k * 7.7) - .5) * amp * a]; }
const lerp2 = (a, b, u) => [lerp(a[0], b[0], u), lerp(a[1], b[1], u), lerp(a[2], b[2], u)];
const popIn = (t, a, d = .35) => t < a ? 0 : back(seg(t, a, a + d), 1.2);

// —— eventos (tempos do filme) ——
const T = {
  close: L[1].t0 - .3, read1: wordT(2, 'aparelhos') - .25, read3: wordT(2, 'cada', 1) - .2, closeEnd: L[3].t0 - .05,
  paperOff: end(3) + .1,                                    // o jornal vai pro colo (fora de quadro, durante a Zefinha)
  pull: L[5].t0 - .15,                                      // tira o tijolão do bolso
  lant: wordT(5, 'lanterna'), radio: wordT(5, 'rádio'), cobra: wordT(5, 'cobrinha'), bat: wordT(5, 'bateria'),
  secret: wordT(3, 'secretária') - .15,
  ear: end(6) + .1, yell: wordT(7, 'lorenzo') - .1,
  onTable: wordT(8, 'esse') - .1,                           // corte: o celular já está em pé na mesinha
  catIn: L[8].t0 + 1.2, catUp: L[8].t0 + 3.6,
  crash: end(8) + .08,                                      // a pata derruba o celular
  fix: end(9) + .25,                                        // o conserto: bateria, tampa, borrachinha… plim
  win: L[10].t0 - .1,
  stand: wordT(15, 'senado') - .55, walkA: wordT(15, 'senado') - .1, walkB: L[16].t0 - .4,
};
T.read2 = (T.read1 + T.read3) / 2;
T.land = T.crash + .4; T.plim = T.fix + 1.75;
window.EVENTS = T; window.TL = TL;
const PHONE_T = [962, 1470], FLOOR = [872, 1866];

// —— o tijolão: onde está e como está ——
function foneQuebrado(t) { // no chão, desmontando
  const u = eo(seg(t, T.land, T.land + .5));
  return { x: FLOOR[0], y: FLOOR[1], s: .34, rot: 1.5, t, parts: u };
}
function foneMesa(t) {
  if (t < T.onTable || t >= T.fix) return null;
  if (t < T.crash) return { x: PHONE_T[0], y: PHONE_T[1] - 52, s: .34, rot: 0, t };
  if (t < T.land) { const u = seg(t, T.crash, T.land); // caindo
    return { x: lerp(PHONE_T[0], FLOOR[0], u), y: lerp(PHONE_T[1] - 52, FLOOR[1], ei(u)) - Math.sin(u * Math.PI) * 70, s: .34, rot: -u * 4.2 - .3, t, fall: true }; }
  return { ...foneQuebrado(t), fall: true };
}

// —— efeitos de cena ——
function sparkle(x, y, s, a = 0) {
  push(); translate(x, y); rotate(a); scale(s);
  shape([[0, -40], [9, -9], [40, 0], [9, 9], [0, 40], [-9, 9], [-40, 0], [-9, -9]], { fill: '#fff6a8', lw: 5 });
  pop();
}
function nota(x, y, s, r = 0) { // notinha musical (rádio)
  push(); translate(x, y); rotate(r); scale(s);
  shape(ell(0, 0, 14, 10, 12), { fill: INK, lw: 0, stroke: false }); stroke([[12, -2], [12, -52], [30, -40]], 6);
  pop();
}
// balãozinho de pensamento com uma secretária de fone dentro do celular de luxo
function balaoSecretaria(x, y, p) {
  if (p <= 0) return;
  push(); translate(x, y); scale(p);
  for (const [dx, dy, r] of [[-80, 150, 12], [-56, 112, 18]]) shape(ell(dx, dy, r, r, 14), { fill: '#ffffff', lw: 5 });
  shape(spline([[-150, 0], [-120, -80], [-30, -110], [60, -100], [140, -60], [150, 20], [90, 80], [-20, 90], [-120, 70]], true, 6), { fill: '#ffffff', lw: 6 });
  shape(rr(-50, -86, 100, 158, 16), { fill: '#c9b8a0', lw: 5 });
  shape(rr(-42, -78, 84, 142, 10), { fill: '#bfe3ff', lw: 4 });
  shape(ell(0, -20, 22, 24, 16), { fill: PAL.zSkin, lw: 4 });                      // cabecinha
  shape(ell(0, -46, 20, 12, 12), { fill: '#6b4423', lw: 4 });                      // coque
  shape(spline([[-30, 60], [-26, 14], [26, 14], [30, 60]]), { fill: PAL.pRed, lw: 4 }); // blusa
  stroke(arc(0, -22, 26, 26, Math.PI * 1.05, Math.PI * 1.95, 10), 4);               // tiara do fone
  shape(ell(-25, -18, 6, 9, 8), { fill: INK, lw: 0, stroke: false }); stroke([[-25, -10], [-6, 2]], 3); // microfone
  for (const sx of [-1, 1]) shape(ell(sx * 8, -22, 2.5, 3, 6), { fill: INK, lw: 0, stroke: false });
  stroke(arc(0, -12, 7, 5, Math.PI * .15, Math.PI * .85, 6), 3);
  text('alô?', 96, 4, { font: '800 30px "Baloo 2"', fill: PAL.pBlue });
  pop();
}

// —— Seu Chicó: poses do braço da frente e o que ele segura ——
// braço da frente (relativo ao ombro): descanso, mostrando o celular, no ouvido, erguido (vitória), no colo, apontando
const ARM = {
  rest: { e: [60, 150], h: [40, 214], fist: true }, show: { e: [80, 170], h: [110, 40], fist: true }, ear: { e: [80, 120], h: [-6, -96], fist: true },
  win: { e: [120, 40], h: [90, -190], fist: true }, lap: { e: [40, 160], h: [-60, 214], fist: true }, point: { e: [140, 110], h: [270, 70], fist: false },
};
const lerpArm = (a, b, u) => ({ e: [lerp(a.e[0], b.e[0], u), lerp(a.e[1], b.e[1], u)], h: [lerp(a.h[0], b.h[0], u), lerp(a.h[1], b.h[1], u)], fist: u < .5 ? a.fist : b.fist });
const FONE = { show: [2, -70, .5, 0], ear: [6, -44, .42, -.35], win: [0, -76, .5, .08], lap: [10, -26, .42, 1.3] };
function foneNaMao(t, mode, o = {}) {
  const [dx, dy, s, r] = FONE[mode];
  return hp => {
    const x = hp[0] + dx, y = hp[1] + dy;
    if (o.lant > 0) { // lanterna: um facho amarelo saindo do topo
      push(); translate(x + 22 * s, y - 200 * s); rotate(-.5);
      fillOnly([[0, 0], [-90 * o.lant, -420], [90 * o.lant, -420]], '#fff3a0', { alpha: .55, boil: .4 }); pop();
    }
    celularVelho({ x, y, s, rot: r, t, lit: o.lit ?? 0, scr: o.scr, ring: o.ring ?? 0 });
    if (o.radio > 0) { const k = st(t) * 3; nota(x + 70, y - 130 - (k % 1) * 50, 1.6, .2); nota(x - 80, y - 100 - ((k + .5) % 1) * 50, 1.3, -.2);
      for (let j = 0; j < 3; j++) stroke(arc(x - 40, y - 60, 26 + j * 18, 26 + j * 18, Math.PI * 1.1, Math.PI * 1.5, 8), 4); }
    hand(hp[0], hp[1] + 4, mode === 'ear' ? -2.2 : mode === 'lap' ? -.3 : -1.4, 22, PAL.cSkin, { fist: true });
  };
}
function chicoAt(t, o = {}) {
  const m = mouthOf('chico', t), cl = blink(t, .3);
  if (t >= T.stand) { // em pé e caminhando pro quarto
    const w = seg(t, T.walkA, T.walkB), x = lerp(400, -260, ss(w)), up = eo(seg(t, T.stand, T.stand + .3));
    if (x < -240) return;
    chico({ x, y: 1800 - Math.abs(Math.sin(st(t) * 6)) * 10 * (w > 0 && w < 1 ? 1 : 0), s: .95 * lerp(.96, 1, up), t, face: w > 0 ? -1 : 1, walk: w > 0 && w < 1 ? st(t) * 1.6 : null,
      armL: { h: [-30, 220], bend: -20 }, armR: { h: [30, 220], bend: 20 }, look: [-.6, .1], lid: .55, brow: .9, mouth: { o: m * .9, sm: -.6 }, closed: cl });
    return;
  }
  const paper = t < T.paperOff;
  const P = { x: 400, y: 1800, s: .95, t, sit: true, closed: cl, ...o, mouth: { o: m * (o.mouthK ?? .95), sm: o.sm ?? .3, ...(o.mouthX || {}) } };
  if (paper) P.paper = {};
  else {
    P.armL = { e: [-60, 150], h: [-40, 214], fist: true };
    const arm = o.arm || 'rest';
    P.armR = o.armAt || ARM[arm];
    if (o.fone) P.holdR = foneNaMao(t, o.fone, o.foneO || {});
  }
  chico(P);
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
  const tchau = t >= wordT(16, 'tchau') - .1 && t < end(16) + .6;
  papagaio({ x: 150, y: 996, s: .7, t, beak: talking ? clamp(m * 1.2) : 0,
    wing: tchau ? .55 + .45 * Math.sin(st(t) * 14) : talking ? .5 + .5 * Math.abs(Math.sin(st(t) * 9)) : (o.wing ?? 0),
    bob: talking ? Math.sin(st(t) * 14) * 6 : Math.sin(t * 2) * 2, look: o.look || [.6, .3], lid: blink(t, 2.4) ? 1 : (o.lid ?? .1), tilt: o.tilt });
  if (o.ring && talking) for (let j = 0; j < 3; j++) { // "trim, trim": tremidinhas em volta da cabeça
    const k = (st(t) * 4 + j / 3) % 1, r = 70 + k * 70;
    for (const sx of [-1, 1]) stroke(arc(160, 812, r, r, sx > 0 ? -.5 : Math.PI - .5 + .0, sx > 0 ? .5 : Math.PI + .5, 8), 5, { alpha: 1 - k });
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
  xicara({ x: 902, y: 1470, s: .6, t });
  const f = foneMesa(t); if (f && !f.fall) celularVelho(f);
  poltrona({ x: 400, y: 1820, s: .9 });
  if (t >= T.paperOff && t < T.stand) jornalDobrado(250, 1590, .8, -.25);
  if (t >= T.stand) jornalDobrado(392, 1566, .95, -.04);
  chicoAt(t, o.chico || {});
  bitucaAt(t);
  if (f && f.fall) celularVelho(f);
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
// o jornal na mão dele (close em primeira pessoa)
function page(t, cy, z) {
  g.setTransform(1, 0, 0, 1, 0, 0); g.fillStyle = '#5a3d2e'; g.fillRect(0, 0, 1080, 1920);
  cam(540, cy, z, () => jornalClose({ t, ...NEWS }));
}
// o conserto, de pertinho no chão: bateria, tampa, borrachinha… e a tela acende (plim)
function conserto(t) {
  const A = T.fix, b = 1 - ss(seg(t, A, A + .45)), tp = 1 - ss(seg(t, A + .6, A + 1.05)), bd = 1 - ss(seg(t, A + 1.2, A + 1.55));
  const lit = t >= T.plim ? 1 : 0, punch = 1 + .08 * Math.sin(clamp(seg(t, T.plim, T.plim + .25)) * Math.PI);
  cam(FLOOR[0] + 10, FLOOR[1] - 10, 3.1 * punch, () => {
    room(t);
    celularVelho({ x: FLOOR[0], y: FLOOR[1], s: .34, rot: 1.5, t, parts: { bateria: b, tampa: tp, banda: bd }, lit });
    // a mão do Seu Chicó empurrando cada peça no lugar
    const beat = [[A, A + .5, 170, 60], [A + .6, A + 1.1, -150, 40], [A + 1.2, A + 1.6, 60, -30]].find(([a, z]) => t >= a - .1 && t < z + .12);
    if (beat) { const u = seg(t, beat[0], beat[1]) * .9 + .1, p = 1 - u, hx = FLOOR[0] + beat[2] * p * .34 + 20, hy = FLOOR[1] + beat[3] * p * .34 + 30;
      shape(noodle([hx + 70, hy + 260], [hx + 6, hy + 16], -14, 34, 26), { fill: PAL.cSkin, lw: 6 }); // antebraço
      shape(noodle([hx + 80, hy + 330], [hx + 66, hy + 240], 0, 50, 46), { fill: PAL.shirt, lw: 6 });   // manga
      hand(hx, hy, -1.9, 22, PAL.cSkin, { fist: false }); }
    if (lit) for (const [dx, dy, s, a] of [[-70, -60, .5, 0], [64, -70, .4, .4], [10, -96, .3, .8]]) sparkle(FLOOR[0] + dx, FLOOR[1] + dy, s * (1 + .3 * Math.sin(t * 12 + a * 5)), a + t * 2);
  });
}

// —— planos ——
const CH = [400, 1330, 1.55], ZE = [800, 1060, 1.7], LO = [235, 880, 2.3], TWO = [640, 1380, 1.2], CHL = [470, 1240, 1.25];
const SHOTS = [
  // abertura: a sala às 18h10, empurrando devagar até o Seu Chicó
  [0, T.close, t => cam(...lerp2([540, 1060, 1], [430, 1300, 1.32], ss(seg(t, 0, T.close))), () => room(t, { chico: { look: [0, .1], lid: .55, brow: -.2, sm: .6 } }))],
  // close em primeira pessoa: manchete e começo do resumo
  [T.close, T.read1, t => page(t, 950, 1.28)],
  // no meio da leitura: ele lendo, e a Dona Zefinha ouvindo da cozinha
  [T.read1, T.read2, t => cam(CH[0], CH[1] - 30, CH[2] + .1 * seg(t, T.read1, T.read2), () => room(t, { chico: { look: [0, .9], lid: .55, brow: .2, sm: 0 } }))],
  [T.read2, T.read3, t => cam(...ZE, () => room(t, { zef: { look: [-.8, .2], lid: .3, brow: .8, tilt: .05 } }))],
  // volta pro jornal no preço: a etiqueta de R$ 13.499 e, no fim, o selo de fonte parado na tela
  [T.read3, T.closeEnd, t => page(t, lerp(1000, 1130, ss(seg(t, T.read3, end(2) - 1.4))), 1.3)],
  // "Treze mil reais... num TELEFONE?!" (e a secretária dentro do celular)
  [T.closeEnd, end(3) + .1, t => {
    const [sx, sy] = shake(t, t < wordT(3, 'rapaz') ? .6 : 0);
    cam(CH[0] + sx, CH[1] + sy, CH[2] + .12 * eo(seg(t, T.closeEnd, T.closeEnd + .5)), () => {
      room(t, { chico: t < wordT(3, 'rapaz') ? { look: [0, 0], lid: 0, brow: 1.5, sm: -.9, mouthK: 1.3, mouthX: { o: .5 } } : { look: [.5, -.5], lid: .25, brow: -.3, sm: .9, tilt: -.05 } });
      if (t >= T.secret) balaoSecretaria(490, 905, popIn(t, T.secret, .3));
    });
  }],
  // Dona Zefinha sonhando: "Um iPhone dezoito... Deus me livre. Mas quem me dera."
  [end(3) + .1, end(4) + .2, t => cam(...ZE, () => {
    const dream = t >= wordT(4, 'mas') - .1;
    room(t, { zef: { look: dream ? [-.2, -.9] : [-.6, -.4], lid: dream ? .45 : .2, brow: dream ? -.4 : .9, sm: dream ? .6 : -.2, tilt: dream ? -.08 : 0, armR: { h: [40, -150], bend: -40, spoonA: -1.9, spoonL: .5 } } });
    if (dream) { const p = popIn(t, wordT(4, 'mas') - .1, .3); sparkle(790, 852, .5 * p, t * 3); sparkle(742, 846, .32 * p, -t * 3); }
  })],
  // o tijolão: lanterna, rádio, cobrinha, bateria de uma semana
  [end(4) + .2, L[6].t0 - .1, t => {
    const pull = ss(seg(t, T.pull, T.pull + .45)), armAt = lerpArm(ARM.rest, ARM.show, pull);
    const fx = { lit: t >= T.lant - .1 ? 1 : 0, lant: t >= T.lant && t < T.radio - .05 ? eo(seg(t, T.lant, T.lant + .2)) : 0,
      radio: t >= T.radio && t < T.cobra - .05 ? 1 : 0, scr: t >= T.bat ? 'bateria' : t >= T.cobra ? 'cobrinha' : undefined };
    const zin = ss(seg(t, T.cobra - .25, T.cobra + .2)) * (1 - ss(seg(t, wordT(5, 'custou') - .2, wordT(5, 'custou') + .25)));
    cam(...lerp2([CH[0] + 40, CH[1] - 20, CH[2] + .05], [612, 1240, 3.4], zin), () => room(t, { chico: { armAt, fone: pull > .3 ? 'show' : null, foneO: fx, look: [.6, -.4], lid: .2, brow: t < T.lant ? 1.1 : -.2, sm: t < T.lant ? -.4 : .8 } }));
  }],
  // Lorenzo: "Trim, trim!"
  [L[6].t0 - .1, T.ear, t => cam(...LO, () => room(t, { lor: { ring: true, look: [.7, .4] } }))],
  // "Alô? Alô?... Quem fala?..." — atende o celular (de tela apagada)
  [T.ear, T.yell, t => cam(CH[0] + 20, CH[1] - 60, CH[2] + .15, () => {
    room(t, { chico: { arm: 'ear', fone: 'ear', look: [-.5, -.2], lid: 0, brow: 1, sm: -.2 } });
    if (t < T.ear + .5) sweat(470, 1150 - seg(t, T.ear, T.ear + .5) * 20, 1.2);
  })],
  // "...LORENZO!" (o papagaio, satisfeito)
  [T.yell, L[8].t0 - .1, t => { const [sx, sy] = shake(t, t < end(7) ? .7 : 0);
    cam(CHL[0] + sx, CHL[1] + sy, CHL[2], () => room(t, { chico: { arm: 'show', fone: 'show', look: [-.9, -.3], lid: .1, brow: 1.3, sm: -.7, mouthK: 1.3 }, lor: { look: [.7, .4], lid: .5, tilt: .15 } })); }],
  // "E outra: lá eles trocam de celular a cada dois anos." (celular erguido)
  [L[8].t0 - .1, T.onTable, t => cam(...CH, () => room(t, { chico: { arm: 'show', fone: 'show', look: [.3, -.2], lid: .4, brow: .6, sm: .2 } }))],
  // "Esse aqui eu tenho desde 2008... mais que dois mandatos de senador!" — o celular no pedestal da mesinha; o Bituca sobe e derruba
  [T.onTable, T.land + .75, t => cam(...lerp2(TWO, [760, 1560, 1.35], ss(seg(t, T.crash - .6, T.crash + .2))), () => room(t, {
    chico: t < T.crash + .1 ? { arm: 'point', look: [.9, .2], lid: .35, brow: -.3, sm: .9 } : { arm: 'rest', look: [.9, .4], lid: 0, brow: 1.4, sm: -.9, mouthX: { o: .6 } } }))],
  // o silêncio: as peças no chão, só o relógio
  [T.land + .75, L[9].t0 - .05, t => cam(FLOOR[0] + 30, FLOOR[1] - 120, 2.0, () => room(t))],
  // "BITUCA!" (close com tremida)
  [L[9].t0 - .05, end(9) + .2, t => { const [sx, sy] = shake(t, 1); cam(400 + sx, 1250 + sy, 2.3, () => room(t, { chico: { arm: 'rest', look: [.6, .2], lid: 0, brow: 1.4, sm: -.9, mouthK: 1.6 } })); }],
  // o conserto
  [end(9) + .2, T.win, t => conserto(t)],
  // "Viu só? Caiu, desmontou, montou de novo... e tá funcionando!" (celular erguido, aceso)
  [T.win, L[11].t0 - .1, t => cam(CH[0], CH[1] - 80, CH[2] + .12 * seg(t, T.win, L[11].t0), () => room(t, { chico: { arm: 'win', fone: 'win', foneO: { lit: 1 }, look: [.4, -.6], lid: .3, brow: -.4, sm: 1, tilt: -.05 } }))],
  // Lorenzo: "Quem paga é você!"
  [L[11].t0 - .1, end(11) + .15, t => cam(...LO, () => room(t, { lor: { look: [.8, .5] } }))],
  // "...É. O iPhone é do senador... mas a conta chega aqui em casa." (murcha na poltrona)
  [end(11) + .15, L[13].t0 - .1, t => cam(CH[0], CH[1] + 20 * seg(t, end(11), L[13].t0), CH[2], () => room(t, { chico: { arm: 'lap', fone: 'lap', foneO: { lit: 1 }, look: [.1, .9], lid: .6, brow: .9, sm: -.8, tilt: .06 } }))],
  // Dona Zefinha, de braços cruzados: "Bem que eu te avisei, Chicó: era pra você ter virado senador."
  [L[13].t0 - .1, L[14].t0 - .1, t => cam(...ZE, () => room(t, { zef: { cross: true, look: [-.5, .1], lid: .45, brow: .2 } }))],
  // "Eu? E trocar meu chinelo por sapato?" (rindo)
  [L[14].t0 - .1, wordT(14, 'chinelo') - .15, t => cam(...CH, () => room(t, { chico: { arm: 'lap', fone: 'lap', foneO: { lit: 1 }, look: [.4, -.1], lid: .3, brow: -.4, sm: 1, tilt: -.05 } }))],
  // o chinelo, de pertinho
  [wordT(14, 'chinelo') - .15, wordT(14, 'nem') - .1, t => cam(420, 1660 - 8 * Math.abs(Math.sin(t * 9)), 2.4, () => room(t, { chico: { arm: 'lap', fone: 'lap', foneO: { lit: 1 } } }))],
  // "Nem por um iPhone!"
  [wordT(14, 'nem') - .1, L[15].t0 - .1, t => cam(CH[0], CH[1], CH[2] + .06, () => room(t, { chico: { arm: 'win', fone: 'win', foneO: { lit: 1 }, look: [.5, -.2], lid: .35, brow: -.3, sm: 1 } }))],
  // "Quer saber? Vou dormir que é melhor. E se o Senado ligar... diz que eu tô sem sinal." — levanta e vai de chinelo pro quarto
  [L[15].t0 - .1, L[16].t0 - .25, t => cam(...lerp2([430, 1300, 1.3], [470, 1180, 1.12], ss(seg(t, T.stand - .2, T.walkA + .5))), () => room(t, { chico: { arm: 'lap', fone: 'lap', look: [.1, .1], lid: .6, brow: .9, sm: -.8 } }))],
  // sala vazia: Lorenzo faz a chamada
  [L[16].t0 - .25, DUR + 1, t => {
    cam(...lerp2([470, 1180, 1.12], [330, 1050, 1.4], ss(seg(t, L[16].t0 - .25, end(16)))), () => room(t, { lor: { look: [.8, .2] } }));
    const p1 = popIn(t, L[16].t0 + .1), p2 = popIn(t, wordT(16, 'senado') - .05), p3 = popIn(t, wordT(16, 'curte') - .05);
    sign('Se você também quer um celular, comenta:', 540, 270, { p: p1, sz: 40, font: '"Baloo 2"', wt: '800 ', fill: '#ffffff', rot: -.02 });
    sign('SENADO, QUERO CELULAR!', 540, 400, { p: p2, sz: 70, rot: .03 });
    sign('e curte o vídeo!', 540, 1700, { p: p3, sz: 46, font: '"Baloo 2"', wt: '800 ', fill: '#9be36b', rot: -.03 });
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
