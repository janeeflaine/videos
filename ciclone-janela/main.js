// main.js — "Abre a janela, Seu Ademar?" (Curioso Soh) — 1080×1920, 24 fps, ~107,5 s
// Tempos amarrados à narração (voices/narracao.mp3, palavras em words.json; a fala começa em VO = 0,2 s do filme).
import { clamp, lerp, seg, ss, eo, ei, eio, back, hash, TAU, env } from './lib.js';
import { INK, init, frame, g, push, pop, translate, rotate, scale, shape, fillOnly, stroke, rect, rr, ell, arc, spline, text, bands, wob, screenRect, dot, S } from './toon.js';
import { ademar, kika, rodamoinho, casa, telhado, janela, protecao, barometro, oculosRaioP, banheiro, eye, mouth, sweat, PAL } from './cast.js';

init(document.getElementById('c'));
export const VO = 0.2, CTA = 102.0, DUR = 107.5;
window.DUR = DUR;
const D = 1 / 12, st = t => Math.floor(t * 12 + 1e-6) / 12; // poses em 2s (12 fps)

// —— utilidades de cena ——
function cam(cx, cy, z, fn) { push(); translate(540, 960); scale(z); translate(-cx, -cy); fn(); pop(); }
function shake(t, a, amp = 10) { const k = Math.floor(t * 24); return [(hash(k * 3.1) - .5) * amp * a, (hash(k * 7.7) - .5) * amp * a]; }
function rain(t, a = 1, col = 'rgba(200,220,255,.55)', slant = -.35, n = 70) {
  if (a <= 0) return;
  g.setTransform(1, 0, 0, 1, 0, 0); g.strokeStyle = col; g.lineWidth = 4; g.lineCap = 'round'; g.globalAlpha = a;
  g.beginPath();
  for (let i = 0; i < n; i++) {
    const x0 = hash(i * 1.7) * 1400 - 160, sp = 1400 + hash(i * 3.3) * 600, y = ((hash(i * 9.1) * 2200 + t * sp) % 2200) - 140;
    const x = x0 + (y * slant); g.moveTo(x, y); g.lineTo(x + slant * 60, y + 60);
  }
  g.stroke(); g.globalAlpha = 1;
}
function flash(t, times) { for (const f of times) { const u = t - f; if (u >= 0 && u < .35) return (u < .08 || (u > .14 && u < .2)) ? 1 : .3 * (1 - u / .35); } return 0; }
function tag(str, x, y, col = '#39ff9e', sz = 46, typed = 1) {
  const s = str.slice(0, Math.ceil(str.length * clamp(typed)));
  g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.font = `${sz}px VT323`; const w = g.measureText(str).width; g.restore();
  shape(rr(x - 14, y - sz * .62, w + 28, sz * 1.15, 8), { fill: 'rgba(16,12,28,.86)', lw: 5 });
  text(s, x, y, { font: `${sz}px VT323`, fill: col, align: 'left' });
}
function sign(str, x, y, { fill = '#ffd23f', col = INK, sz = 54, rot = 0, pop: p = 1, font = '"Titan One"' } = {}) {
  if (p <= 0) return;
  push(); translate(x, y); rotate(rot); scale(p);
  g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.font = `${sz}px ${font}`; const w = g.measureText(str).width; g.restore();
  shape(rr(-w / 2 - 26, -sz * .78, w + 52, sz * 1.5, 18), { fill, lw: 7 });
  text(str, 0, 2, { font: `${sz}px ${font}`, fill: col });
  pop();
}
const popIn = (t, a, d = .35) => t < a ? 0 : back(seg(t, a, a + d), 1.2);
function arrow(x0, y0, x1, y1, w, col, lw = 7) {
  const dx = x1 - x0, dy = y1 - y0, L = Math.hypot(dx, dy) || 1, ux = dx / L, uy = dy / L, nx = -uy, ny = ux, hw = w * 1.1, hl = w * 1.3;
  const bx = x1 - ux * hl, by = y1 - uy * hl;
  shape([[x0 + nx * w / 2, y0 + ny * w / 2], [bx + nx * w / 2, by + ny * w / 2], [bx + nx * hw, by + ny * hw], [x1, y1], [bx - nx * hw, by - ny * hw], [bx - nx * w / 2, by - ny * w / 2], [x0 - nx * w / 2, y0 - ny * w / 2]], { fill: col, lw });
}
function roomBG(wall = ['#d9c9a6', '#cfbe98'], floor = '#8a6a48') {
  bands(wall, -400, 1500); fillOnly(rect(-4000, 1500, 9000, 600), floor, { boil: 0 });
  stroke([[-4000, 1500], [5000, 1500]], 7);
}
function stormSky(t, k = 0) { bands(['#2b2244', '#33295a', '#3b2f66', '#2a3f5a'], -2000 + k, 2400); }
function curtain(x, y, w, h, closed, col = '#5a7a3a') { // cortina de pregas
  for (const sx of [-1, 1]) {
    const cw = lerp(w * .18, w * .5, closed), x0 = sx < 0 ? x - w / 2 : x + w / 2 - cw;
    shape(rect(x0, y, cw, h), { fill: col, lw: 6, shade: () => { for (let i = 1; i < 5; i++) stroke([[x0 + cw * i / 5, y + 10], [x0 + cw * i / 5, y + h - 10]], 4, { line: '#3f5a26' }); } });
  }
  shape(rr(x - w / 2 - 30, y - 16, w + 60, 18, 9), { fill: PAL.brass, lw: 5 });
}
function weight(x, y, kg, s = 1) { // anilha de academia
  push(); translate(x, y); scale(s);
  shape(rr(-90, -40, 180, 40, 14), { fill: '#2f3138', lw: 6, shade: () => fillOnly(rect(-90, -16, 180, 16), '#1d1e23', { boil: .2 }) });
  text(kg, 0, -20, { font: '800 26px "Baloo 2"', fill: '#ffd23f' });
  pop();
}
function sofa(x, y, s = 1) {
  push(); translate(x, y); scale(s);
  shape(rr(-200, -150, 400, 110, 30), { fill: '#6d4c8f', lw: 7 });
  shape(rr(-230, -90, 460, 90, 24), { fill: '#7e5ba3', lw: 7 });
  for (const sx of [-1, 1]) shape(rr(sx * 230 - 30, -120, 60, 120, 24), { fill: '#6d4c8f', lw: 7 });
  pop();
}
function garageHouse(x, y, s, broken, roofOk, t) {
  push(); translate(x, y); scale(s);
  shape(rect(-200, -260, 400, 260), { fill: PAL.wall, lw: 7, shade: () => fillOnly(rect(110, -260, 100, 260), PAL.wallS, { boil: .3 }) });
  // porta de garagem seccional
  shape(rect(-150, -190, 220, 190), { fill: broken ? '#5c5f66' : '#e8e2d4', lw: 6, shade: () => {
    for (let i = 1; i < 4; i++) stroke(broken ? [[-150, -190 + i * 47], [-40, -190 + i * 47 + 30], [70, -190 + i * 47]] : [[-150, -190 + i * 47], [70, -190 + i * 47]], 4);
  } });
  if (broken) { shape([[-60, -150], [-20, -110], [-70, -80], [-30, -40]], { fill: '#222', lw: 5 }); }
  if (roofOk) telhado({ x: 0, y: -260, s: .7, t });
  else { push(); translate(0, -260); shape([[-220, 0], [-60, -110], [-20, -60], [40, -120], [220, 0]], { fill: PAL.roof, lw: 7 }); shape(rect(-40, -40, 70, 40), { fill: '#2a1f30', lw: 5 }); pop(); }
  pop();
}

// —— cenas ——
const W = t => (t - VO); // tempo da narração

function s1(t) { // 0–9,8: gancho — Ademar vai até a janela; "Spoiler" → Kika
  const n = W(t);
  if (n < 6.75) {
    const zo = lerp(1, 1.12, ss(seg(n, 0, 6.7)));
    cam(540, 1000, zo, () => {
      roomBG();
      // janela grande com tempestade lá fora
      const fl = flash(n, [1.2, 4.6]);
      janela({ x: 640, y: 1260, s: 1.35, latch: n > 3.5 ? -.35 * ss(seg(n, 3.5, 4.4)) : 0, glassA: .55, sky: fl > .5 ? '#c9c2ff' : '#2a2f45',
        outside: () => { rain(n, .9); rodamoinho({ x: 120 + wob(n, .3) * 30, y: 30, s: .55, t: n, look: [-.6, .1] }); } });
      curtain(640, 820, 520, 470, 0);
      // Ademar caminha até a janela (12 fps)
      const tt = st(n), wx = lerp(140, 380, ss(seg(tt, 0.4, 3.3))), bob = Math.abs(Math.sin(tt * 9)) * (tt > .4 && tt < 3.3 ? -10 : 0);
      ademar({ x: wx, y: 1520 + bob, s: 1.0, t: tt, look: [.6, -.1], lid: .25, brow: 1, mouth: { o: .12, sm: 1 },
        armR: tt > 3.3 ? { h: [lerp(60, 150, ss(seg(tt, 3.3, 3.9))), lerp(140, -10, ss(seg(tt, 3.3, 3.9)))], bend: -30 } : undefined });
    });
    tag('CICLONE A CAMINHO · VENTO 140 km/h', 60, 160, '#39ff9e', 44, seg(n, .1, 1.6));
    if (n > 5.0) sign('"EQUILIBRAR A PRESSÃO"', 540, 330, { sz: 46, rot: -.04, pop: popIn(n, 5.0) });
  } else {
    // close na Kika na porta, impassível
    const [sx, sy] = shake(n, n > 7.6 && n < 8.0 ? 1 : 0, 14);
    cam(540 - sx, 980 - sy, 3.3, () => {
      bands(['#3b2d63', '#33285a'], 300, 1400); fillOnly(rect(220, 400, 40, 1200), '#f4f1ea', { boil: 0 }); stroke([[220, 400], [220, 1600]], 6);
      const tt = st(n);
      kika({ x: 540, y: 1300, s: 1.25, t: tt, lid: .55, look: [-.5, 0], mouth: { o: tt > 7.5 && tt < 9.2 ? .25 + .15 * Math.abs(Math.sin(tt * 14)) : 0, sm: -.4, skew: .5 }, tilt: wob(tt, .6) * .04, armR: { h: [60, -60], bend: -30 } });
    });
    if (n > 7.6) sign('PIOR IDEIA DA NOITE', 540, 1650, { fill: '#e8392b', col: '#ffffff', sz: 58, rot: .03, pop: popIn(n, 7.6) });
  }
}

function s2(t) { // 9,8–18,6: a lenda — casa-balão estoura em pipoca
  const n = W(t);
  if (n < 16.1) {
    bands(['#ff8fc0', '#f77fb3', '#ec6fa6'], 0, 1920);
    // moldura de "balão de pensamento"
    tag('A LENDA:', 60, 150, '#ffd23f', 52, seg(n, 9.7, 10.3));
    const inflate = ss(seg(n, 11.9, 14.2)), wob2 = Math.sin(n * 22) * .03 * inflate;
    const pop_ = n > 14.25;
    cam(540, 1080, 1, () => {
      fillOnly(rect(-200, 1420, 1500, 600), '#b7e05a', { boil: 0 }); stroke([[-200, 1420], [1300, 1420]], 7);
      if (!pop_) {
        push(); translate(540, 1420); scale(1 + inflate * .45 + wob2, 1 + inflate * .3 - wob2); translate(-540, -1420);
        casa({ x: 540, y: 1420, s: 1.05, t: st(n), roofFace: true });
        pop();
        // setas: lá fora pressão BAIXA (seta pequena), dentro ALTA (setas para fora)
        if (n > 10.6) { sign('BAIXA', 170, 760, { fill: '#7fd0ff', sz: 40, pop: popIn(n, 11.3) }); }
        if (n > 12.4) { for (const [a, b, c, d] of [[540, 1150, 540, 880], [430, 1230, 300, 1230], [650, 1230, 780, 1230]]) arrow(a, b, c, d, 34 + inflate * 20, '#ff4d4d'); sign('ALTA', 540, 1250, { fill: '#ff4d4d', col: '#fff', sz: 44, pop: popIn(n, 12.8) }); }
        if (n > 13.6) sweat(760, 900, 1.6);
      } else {
        // estouro: estrela + pipocas voando
        const u = n - 14.25;
        if (u < .5) { const r = 200 + u * 900; const star = []; for (let i = 0; i < 20; i++) { const a = i / 20 * TAU, rr_ = i % 2 ? r : r * .55; star.push([540 + Math.cos(a) * rr_, 1100 + Math.sin(a) * rr_]); } shape(star, { fill: '#fff6b0', lw: 8 }); }
        for (let i = 0; i < 40; i++) {
          const a = hash(i * 2.3) * TAU, v = 500 + hash(i * 5.1) * 900, x = 540 + Math.cos(a) * v * u, y = 1100 + Math.sin(a) * v * u * .8 + 900 * u * u;
          push(); translate(x, y); rotate(u * 6 + i);
          shape(spline([[-22, 0], [-12, -20], [8, -22], [24, -6], [16, 16], [-10, 18]]), { fill: '#fffbe6', lw: 5, shade: () => fillOnly(ell(8, 6, 12, 10, 10), '#ffe08a', { boil: .3 }) });
          pop();
        }
        if (u > .2) sign('POP!', 540, 760, { fill: '#ffd23f', sz: 120, rot: -.08, pop: popIn(u, .2) });
      }
    });
    // barômetro na parede desmaia quando "cai"
    const nd = lerp(Math.PI * 1.7, Math.PI * .86, ss(seg(n, 11.3, 11.9)));
    barometro({ x: 900, y: 600, s: .9, needle: nd });
  } else {
    // "Tem gente que jura isso até hoje": Ademar convicto + fonte duvidosa
    bands(['#d9c9a6', '#cfbe98'], 0, 1920);
    const tt = st(n);
    cam(540, 1150, 2.6, () => {
      ademar({ x: 540, y: 1560, s: 1.1, t: tt, lid: .5, look: [-.2, -.2], brow: -1, tilt: Math.sin(tt * 8) * .05, mouth: { o: 0, sm: 1.2 }, armR: { h: [80, -120], bend: -40, fist: true } });
    });
    sign('fonte: grupo da família ✔✔', 540, 1720, { fill: '#dcf8c6', sz: 44, rot: .03, pop: popIn(n, 16.5), font: '"Baloo 2"' });
  }
}

function s3(t) { // 18,6–29,6: Óculos Raio-P — casa não é lata de conserva; frestas
  const n = W(t);
  if (n < 21.1) {
    // close: Kika baixa os óculos (brilho) + lata de conserva
    const on = n > 18.9;
    bands(['#1f2a33', '#18222a'], 0, 1920);
    if (on) { g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = .18 * (1 - seg(n, 18.9, 19.4)) + .05; g.fillStyle = PAL.glow; g.fillRect(0, 0, 1080, 1920); g.globalAlpha = 1; }
    cam(540, 860, 3.3, () => kika({ x: 540, y: 1180, s: 1.2, t: st(n), goggles: on, mouth: { o: 0, sm: .4, skew: .5 }, armR: on ? { h: [50, 90], bend: 20 } : { h: [40, -180], bend: -30 } }));
    if (n > 19.8) {
      push(); translate(250, 1840); scale(1.05 * popIn(n, 19.8));
      shape(rr(-110, -200, 220, 220, 20), { fill: '#c9d1d8', lw: 7, shade: () => { fillOnly(rect(-110, -150, 220, 110), '#e8392b', { boil: .2 }); text('CONSERVA', 0, -96, { font: '800 30px "Baloo 2"', fill: '#fff' }); } });
      shape(ell(0, -200, 110, 22, 30), { fill: '#e0e6ea', lw: 7 });
      if (n > 20.4) { stroke([[-150, -250], [150, 50]], 18, { line: '#e8392b' }); stroke([[150, -250], [-150, 50]], 18, { line: '#e8392b' }); }
      pop();
      sign('CASA ≠ LATA', 760, 1700, { fill: '#ffd23f', sz: 44, pop: popIn(n, 20.0) });
    }
  } else {
    // visão Raio-P: corte da casa em neon; ar escapando pelas frestas
    bands(['#0e1a1f', '#11222a', '#0e1a1f'], 0, 1920);
    // grade de fundo
    g.setTransform(1, 0, 0, 1, 0, 0); g.strokeStyle = 'rgba(57,255,158,.10)'; g.lineWidth = 2; for (let x = 0; x < 1080; x += 60) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, 1920); g.stroke(); } for (let y = 0; y < 1920; y += 60) { g.beginPath(); g.moveTo(0, y); g.lineTo(1080, y); g.stroke(); }
    tag('RAIO-P · MODO PRESSÃO', 60, 150, PAL.glow, 46, seg(n, 21.1, 22));
    const NE = PAL.glow;
    push(); translate(540, 1300);
    // contorno neon da casa
    S.lwScale = 1;
    shape(rect(-360, -420, 720, 420), { fill: 'rgba(57,255,158,.06)', lw: 7, line: NE });
    shape([[-420, -410], [0, -700], [420, -410]], { fill: 'rgba(57,255,158,.06)', lw: 7, line: NE });
    shape(rr(150, -280, 140, 280, 8), { fill: null, lw: 6, line: NE }); // porta
    shape(rect(-280, -320, 240, 180), { fill: null, lw: 6, line: NE }); // janela
    shape(rr(-60, -140, 40, 56, 6), { fill: null, lw: 5, line: NE }); // tomada
    // frestas com setinhas de ar saindo (aparecem em sequência a partir de "escapa por mil frestas")
    const leaks = [[220, -6, 1, 0, 'nº 12'], [-280, -322, -1, -1, 'nº 47'], [0, -700, 0, -1, 'nº 88'], [-40, -112, 1, 0, 'nº 213'], [-360, -200, -1, 0, 'nº 391'], [360, -420, 1, -1, 'nº 999']];
    leaks.forEach(([x, y, dx, dy, lab], i) => {
      const a0 = 25.4 + i * .22; if (n < a0) return;
      const u = ((n - a0) * 1.4) % 1;
      for (let k = 0; k < 3; k++) { const v = (u + k / 3) % 1; dot(x + dx * (20 + v * 120) + (dy ? Math.sin(v * 9) * 8 : 0), y + dy * (20 + v * 120) + (dx ? Math.sin(v * 9) * 8 : 0), 9 * (1 - v) + 3, '#c8ffe4'); }
      push(); translate(x + dx * 70, y + dy * 70 - 40); scale(popIn(n, a0)); text('fresta ' + lab, 0, 0, { font: '30px VT323', fill: '#ffd23f', outlineW: 6 }); pop();
    });
    pop();
    // medidores dentro × fora: diferença pequena que some
    const diff = lerp(.18, 0, ss(seg(n, 27.4, 28.6))), lift = ss(seg(n, 21.4, 22.6));
    const bar = (x, lab, v) => { shape(rect(x - 50, 1620 - 260, 100, 260), { fill: '#0a1418', lw: 6, line: NE }); fillOnly(rect(x - 44, 1614 - 248 * v, 88, 248 * v), NE, { boil: .2 }); text(lab, x, 1680, { font: '36px VT323', fill: NE }); };
    bar(380, 'FORA', lift * (.78 - diff)); bar(700, 'DENTRO', lift * .78);
    if (n > 23.2 && n < 27.4) text('diferença: pequena · devagar', 540, 1760, { font: '40px VT323', fill: '#ffd23f' });
    if (n > 27.6) sign('SE RESOLVE SOZINHA ✓', 540, 1790, { fill: PAL.glow, sz: 44, pop: popIn(n, 27.6) });
  }
}

function s4(t) { // 29,6–41,2: o vilão é o vento; 180 km/h; 150 kg por m²
  const n = W(t);
  const fl = flash(n, [29.7, 32.7, 36.3]);
  stormSky(n);
  if (n < 33.9) {
    const z = n < 32.7 ? lerp(1, 1.25, ss(seg(n, 29.6, 32.6))) : 1.9;
    const [sx, sy] = shake(n, n > 32.7 && n < 33.1 ? 1 : 0, 18);
    cam(540 + sx, (n < 32.7 ? 1100 : 900) + sy, z, () => {
      fillOnly(rect(-400, 1500, 1900, 600), '#24303a', { boil: 0 });
      rodamoinho({ x: 540, y: 1500, s: 1.5, t: n, look: n < 32.7 ? [0, .2] : [0, 0], lid: n < 32.7 ? .45 : .1, mouth: n < 32.7 ? { o: .1, sm: 1.2, skew: -.4 } : { o: .7, sm: 1, skew: 0 } });
    });
    rain(n, 1);
    tag('O VILÃO DE VERDADE', 60, 160, '#ff6b6b', 50, seg(n, 29.7, 30.6));
    if (n > 32.7) sign('O VENTO', 540, 1700, { fill: '#9fb4c9', sz: 80, rot: -.05, pop: popIn(n, 32.7) });
  } else {
    // parede da casa com 1 m² marcado; rajadas e anilhas empilhando
    cam(540, 960, 1, () => {
      fillOnly(rect(-100, 300, 1300, 1400), PAL.wall, { boil: 0 }); fillOnly(rect(-100, 1500, 1300, 500), '#24303a', { boil: 0 });
      stroke([[-100, 1500], [1300, 1500]], 7);
      for (let y = 360; y < 1500; y += 90) stroke([[-100, y], [1300, y]], 3, { line: PAL.wallS });
      // quadrado de 1 m²
      shape(rect(560, 760, 400, 400), { fill: 'rgba(255,210,63,.18)', lw: 7, line: '#c8402f' });
      text('1 m²', 760, 730, { font: '800 44px "Baloo 2"', fill: '#c8402f' });
      // pilha de anilhas encostada no quadrado (25 kg cada → 150 kg)
      const k = clamp(Math.floor((n - 37.3) / .5) + 1, 0, 6);
      for (let i = 0; i < k; i++) weight(760, 1150 - i * 64, '25 kg', 1.6);
      // Rodamoinho à esquerda soprando
      rodamoinho({ x: 230, y: 1480, s: .95, t: n, look: [.8, 0], mouth: { o: .55, w: .6, sm: 0 } });
      for (let i = 0; i < 4; i++) { const u = ((n * 1.8 + i * .25) % 1); stroke(arc(330 + u * 220, 900 + i * 70, 120, 26, Math.PI * 1.1, Math.PI * 1.9, 10), 6, { line: '#ffffff', alpha: 1 - u }); }
    });
    rain(n, .6);
    tag('180 km/h', 60, 170, '#ff6b6b', 70, seg(n, 33.9, 34.9));
    if (n > 35.5) sign('CATARINA · 2004', 300, 330, { fill: '#ffd23f', sz: 44, rot: -.04, pop: popIn(n, 35.5) });
    if (n > 38.7) sign('≈ 150 kg', 760, 1640, { fill: '#e8392b', col: '#fff', sz: 70, rot: .03, pop: popIn(n, 38.7) });
  }
  if (fl) screenRect('#ffffff', fl * .55);
}

function s5(t) { // 41,2–55,7: janela aberta → vento entra → telhado voa
  const n = W(t);
  if (n < 43.5) {
    // Ademar abre a janela; o Rodamoinho, lá fora, agradece o convite
    const open = ss(seg(n, 41.3, 42.0));
    cam(560, 1050, 1.15, () => {
      roomBG();
      janela({ x: 640, y: 1260, s: 1.35, open, latch: -.6, glassA: .55, outside: () => { stormSky(n); rain(n, .9); rodamoinho({ x: 0, y: 40, s: .7, t: n, look: [-.5, .3], mouth: { o: .35, sm: 1.3 } }); } });
      curtain(640, 820, 520, 470, 0);
      ademar({ x: 330, y: 1520, s: 1.0, t: st(n), look: [.6, 0], lid: .2, brow: 1, mouth: { o: .1, sm: 1.1 }, armR: { h: [150 + open * 80, -10], bend: -30 } });
    });
    if (n > 42.5) sign('CONVITE ACEITO', 540, 330, { fill: '#9fb4c9', sz: 56, rot: -.04, pop: popIn(n, 42.5) });
  } else if (n < 54.5) {
    // corte da casa: vento entra e empurra o telhado de dentro; por fora, sucção como asa de avião
    stormSky(n);
    const lift = n > 52.3 ? ss(seg(n, 52.3, 54.4)) * 40 + Math.abs(Math.sin(n * 18)) * 10 : 0;
    cam(540, 1150, 1, () => {
      fillOnly(rect(-400, 1500, 1900, 600), '#2f4a2a', { boil: 0 }); stroke([[-400, 1500], [1500, 1500]], 7);
      // casa em corte
      shape(rect(170, 1080, 740, 420), { fill: '#f6ead0', lw: 7 });
      fillOnly(rect(170, 1080, 30, 420), PAL.wallS, { boil: 0 }); fillOnly(rect(880, 1080, 30, 420), PAL.wallS, { boil: 0 });
      // janela aberta (abertura) do lado do vento
      fillOnly(rect(162, 1200, 46, 150), '#2a2f45', { boil: 0 }); stroke([[162, 1200], [208, 1200]], 6); stroke([[162, 1350], [208, 1350]], 6);
      sofa(560, 1500, .8);
      ademar({ x: 810, y: 1500, s: .55, t: st(n), lid: 0, look: [0, -1], mouth: { o: .6, sm: -1 }, brow: -1 });
      telhado({ x: 540, y: 1080 - lift, s: 1.25, t: n, face: true, look: [0, .6], mouth: { o: .3 + .4 * seg(n, 44.7, 46), sm: -1 }, lid: 0 });
      // vento entrando pela janela e subindo
      if (n > 43.6) {
        const a = ss(seg(n, 43.6, 44.4));
        rodamoinho({ x: lerp(-60, 330, ss(seg(n, 43.6, 45.0))), y: 1440, s: .5, t: n, look: [.5, -.5], mouth: { o: .5, sm: 1 } });
        if (n > 44.6) for (const x of [400, 540, 680]) arrow(x, 1330, x, 1130 - Math.sin(n * 10 + x) * 8, 46, '#ff4d4d');
        if (n > 45.0) sign('DENTRO ↑', 540, 1250, { fill: '#ff4d4d', col: '#fff', sz: 44, pop: popIn(n, 45.0) });
      }
      // vento por cima do telhado puxando
      if (n > 47.2) {
        for (let i = 0; i < 4; i++) { const u = ((n * 1.2 + i * .25) % 1); const pts = []; for (let k = 0; k <= 20; k++) { const x = -100 + k * 65; const y = 760 - i * 40 - Math.max(0, 260 - Math.abs(x - 540) * .7) * .9; pts.push([x, y]); } stroke(pts.slice(0, Math.round(5 + u * 16)), 6, { line: '#d6e3ef' }); }
        if (n > 49.4) for (const x of [380, 700]) arrow(x, 830, x, 660 - Math.sin(n * 10 + x) * 8, 40, '#ffd23f');
        if (n > 49.5) sign('FORA ↑', 540, 560, { fill: '#ffd23f', sz: 44, pop: popIn(n, 49.5) });
      }
    });
    // inserto: asa de avião
    if (n > 50.8 && n < 52.3) {
      push(); translate(830, 330); scale(popIn(n, 50.8));
      shape(rr(-200, -120, 400, 240, 24), { fill: '#7fd0ff', lw: 7 });
      shape(spline([[-150, 30], [-60, -40], [90, -30], [160, 20], [40, 30]]), { fill: '#e0e6ea', lw: 6 });
      arrow(0, 0, 0, -100, 26, '#ffd23f', 5); text('asa', -120, 90, { font: '800 34px "Baloo 2"' });
      pop();
    }
    if (n > 52.3) sign('2 FORÇAS · 1 DIREÇÃO', 540, 1760, { fill: '#ffffff', sz: 50, pop: popIn(n, 52.3) });
    rain(n, .7);
  } else {
    // "tchau, telhado": o telhado voa; Ademar no sofá debaixo de chuva
    stormSky(n);
    const u = n - 54.5;
    cam(540, 1120, 1.25, () => {
      fillOnly(rect(-400, 1500, 1900, 600), '#2f4a2a', { boil: 0 });
      shape(rect(170, 1080, 740, 420), { fill: '#f6ead0', lw: 7 });
      sofa(540, 1500, .9);
      ademar({ x: 540, y: 1470, s: .62, t: st(n), lid: .6, look: [0, -1], mouth: { o: 0, sm: -1 }, brow: -1 });
      telhado({ x: 540 + u * 420, y: 1080 - 40 - u * 760 + u * u * 80, s: 1.25 * (1 - u * .25), rot: u * 1.6, t: n, face: true, mouth: { o: .9, sm: -1 }, lid: 0, look: [-.6, .5] });
    });
    rain(n, 1, 'rgba(200,220,255,.75)', -.2, 110);
    if (u > .3) sign('TCHAU, TELHADO', 540, 360, { fill: '#e8392b', col: '#fff', sz: 60, rot: -.05, pop: popIn(u, .3) });
  }
}

function s6(t) { // 55,7–68,1: rebobina + dados do IBHS (porta da garagem)
  const n = W(t);
  if (n < 57.0) {
    // rebobinando: imagem do telhado voltando, com faixas de VHS
    stormSky(n);
    const u = 1 - seg(n, 55.7, 56.9);
    cam(540, 1150, 1, () => {
      fillOnly(rect(-400, 1500, 1900, 600), '#2f4a2a', { boil: 0 });
      shape(rect(170, 1080, 740, 420), { fill: '#f6ead0', lw: 7 });
      telhado({ x: 540 + u * 600, y: 1080 - u * 1000, s: 1.25, rot: u * 2, t: n, face: true, mouth: { o: .4, sm: .5 } });
    });
    g.setTransform(1, 0, 0, 1, 0, 0);
    for (let i = 0; i < 6; i++) { const y = (hash(Math.floor(n * 24) * 3 + i) * 1920); g.fillStyle = 'rgba(255,255,255,.25)'; g.fillRect(0, y, 1080, 6 + i * 3); }
    tag('◀◀ REBOBINANDO', 60, 170, '#ffffff', 60, 1);
    cam(260, 1500, 1, () => kika({ x: 180, y: 1880, s: 1.1, t: st(n), lid: .6, look: [.6, -.3], armR: { h: [90, -20], bend: -20 } }));
  } else {
    // tela dividida: porta cedeu × porta aguentou
    bands(['#f2e9d0'], 0, 1920);
    tag('CASAS ATINGIDAS POR FURACÕES', 60, 150, '#39ff9e', 44, seg(n, 56.9, 58));
    stroke([[540, 260], [540, 1860]], 7);
    const L = n > 59.3, R = n > 64.6;
    garageHouse(270, 980, .95, L, false, n);
    garageHouse(810, 980, .95, false, true, n);
    if (n > 59.3) sign('PORTA CEDEU', 270, 1110, { fill: '#e8392b', col: '#fff', sz: 38, pop: popIn(n, 59.3) });
    if (n > 64.6) sign('PORTA AGUENTOU', 810, 1110, { fill: '#3fa66b', col: '#fff', sz: 38, pop: popIn(n, 64.6) });
    // barra 60%
    const v = .6 * ss(seg(n, 61.0, 62.2));
    shape(rect(150, 1250, 240, 460), { fill: '#ffffff', lw: 7 });
    fillOnly(rect(156, 1704 - 448 * v, 228, 448 * v), '#e8392b', { boil: .2 });
    if (n > 61.0) text(`${Math.round(v * 100)}%`, 270, 1500, { font: '84px "Titan One"', fill: '#ffffff', outlineW: 12 });
    text('telhado danificado', 270, 1770, { font: '800 32px "Baloo 2"' });
    shape(rect(690, 1250, 240, 460), { fill: '#ffffff', lw: 7 });
    if (n > 65.9) { const vv = ss(seg(n, 65.9, 67.0)) * .06; fillOnly(rect(696, 1704 - 448 * vv, 228, 448 * vv), '#e8392b', { boil: .2 }); text('quase', 810, 1450, { font: '800 40px "Baloo 2"', fill: '#3fa66b' }); text('nunca', 810, 1500, { font: '800 40px "Baloo 2"', fill: '#3fa66b' }); }
    text('telhado inteiro', 810, 1770, { font: '800 32px "Baloo 2"' });
  }
}

function s7(t) { // 68,1–79,8: a pegadinha do olho do ciclone
  const n = W(t);
  if (n < 69.5) {
    bands(['#3b2d63', '#33285a'], 0, 1920);
    cam(540, 860, 3.3, () => kika({ x: 540, y: 1180, s: 1.2, t: st(n), lid: .3, look: [-.3, 0], mouth: { o: .2, sm: .6, skew: .6 }, armR: { h: [70, -160], bend: -10 } }));
    sign('A PEGADINHA', 540, 1650, { fill: '#ffd23f', sz: 64, rot: .03, pop: popIn(n, 68.6) });
  } else if (n < 74.1) {
    // vista de cima: espiral com olho; a casinha entra no olho
    bands(['#0f1b2e'], 0, 1920);
    tag('VISTA DE SATÉLITE', 60, 150, '#39ff9e', 44, seg(n, 69.5, 70.3));
    push(); translate(540, 1000); rotate(-n * .5);
    for (let k = 0; k < 4; k++) { const pts = []; for (let i = 0; i <= 40; i++) { const u = i / 40, a = k * TAU / 4 + u * 4.2, r = 130 + u * 420; pts.push([Math.cos(a) * r, Math.sin(a) * r]); } stroke(pts, 60, { line: '#d6e3ef' }); stroke(pts, 6, { line: '#9fb4c9' }); }
    shape(ell(0, 0, 150, 150, 40), { fill: '#d6e3ef', lw: 7 });
    shape(ell(0, 0, 90, 90, 30), { fill: '#3f8fcf', lw: 7 });
    pop();
    if (n > 70.5) { sign('OLHO', 540, 1000, { fill: '#ffd23f', sz: 40, pop: popIn(n, 70.5) }); }
    // casinha (ponto) entra no olho
    const hx = lerp(540, 540, 1), hy = lerp(1600, 1080, ss(seg(n, 71.8, 73.6)));
    push(); translate(hx, hy); scale(.25); casa({ x: 0, y: 0, s: 1, t: n }); pop();
    if (n > 73.0) text('calmaria…', 540, 1760, { font: '800 56px "Baloo 2"', fill: '#ffffff', outlineW: 10 });
  } else {
    // dia calmo falso → o vento volta do outro lado
    const back_ = n > 76.7;
    bands(back_ ? ['#4a5468', '#414a5d'] : ['#9ad8f0', '#b6e4f5', '#d3f0fa'], 0, 1600);
    cam(540, 1050, 1.05, () => {
      fillOnly(rect(-400, 1500, 1900, 600), back_ ? '#3c5a34' : '#7cc45a', { boil: 0 });
      if (!back_) { shape(ell(880, 420, 90, 90, 30), { fill: '#ffd23f', lw: 7 }); }
      casa({ x: 300, y: 1500, s: .75, t: n });
      const tt = st(n);
      const run = back_ ? ss(seg(n, 77.6, 79.0)) : 0;
      ademar({ x: lerp(640, 330, run), y: 1560 - Math.abs(Math.sin(tt * 14)) * (run > 0 && run < 1 ? 14 : 0), s: .85, t: tt, face: run > 0 ? -1 : 1,
        lid: back_ ? 0 : .3, look: back_ ? [-.8, 0] : [.3, -.4], brow: back_ ? -1 : 1, mouth: back_ ? { o: .8, sm: -1 } : { o: .35, sm: 1.2 },
        armR: back_ ? { h: [90, -120], bend: -20 } : { h: [60, -170], bend: -10 }, armL: back_ ? { h: [-90, -120], bend: 20 } : undefined });
      if (!back_) { // passarinho
        push(); translate(760 + Math.sin(n * 2) * 40, 700 + Math.sin(n * 5) * 10); shape(ell(0, 0, 28, 22, 16), { fill: '#e8637a', lw: 5 }); stroke(arc(-10, -6, 18, 12, Math.PI, Math.PI * 1.8, 8), 5); pop();
      }
      if (n > 76.8) rodamoinho({ x: lerp(1400, 900, eo(seg(n, 76.8, 77.6))), y: 1500, s: 1.05, t: n, dir: -1, face: -1, look: [.6, 0], mouth: { o: .45, sm: 1.2, skew: -.4 } });
    });
    if (n > 74.2 && n < 76.8) sign('PASSOU!', 640, 520, { fill: '#ffffff', sz: 70, rot: -.05, pop: popIn(n, 74.2) });
    if (n > 75.5 && n < 76.8) sign('…SÓ METADE', 540, 1760, { fill: '#ffd23f', sz: 50, pop: popIn(n, 75.5) });
    if (n > 77.9) { arrow(1000, 1700, 680, 1700, 50, '#ff4d4d'); sign('DO OUTRO LADO', 420, 1700, { fill: '#ff4d4d', col: '#fff', sz: 44, pop: popIn(n, 78.0) }); }
    if (back_) rain(n, .8, 'rgba(200,220,255,.6)', .35);
  }
}

function s8(t) { // 79,8–91,3: o que fazer — montagem com o mesmo enquadramento
  const n = W(t);
  if (n < 86.1) {
    // a janela recebe cada proteção
    bands(['#d9c9a6', '#cfbe98'], 0, 1920);
    const locked = n > 81.4, prot = ss(seg(n, 82.4, 83.2)), cur = ss(seg(n, 83.8, 84.6));
    cam(540, 1000, 1.2, () => {
      janela({ x: 540, y: 1280, s: 1.4, latch: locked ? .0 : -.6, glassA: .6, outside: () => { stormSky(n); rain(n, .9); } });
      // persiana descendo
      if (prot > 0) { push(); translate(540, 1280); scale(1.4); shape(rr(-180, -330, 360, 46, 8), { fill: PAL.steel, lw: 6 }); shape(rect(-160, -284, 320, 270 * prot), { fill: '#c9d1d8', lw: 6, shade: () => { for (let y = -270; y < -14; y += 22) stroke([[-160, y], [160, y]], 4, { line: PAL.steelS }); } }); pop(); }
      curtain(540, 800, 560, 520, cur);
    });
    const items = [[80.6, 'FECHADO E TRANCADO'], [82.3, 'JANELA PROTEGIDA'], [83.7, 'CORTINA FECHADA'], [85.3, 'segura estilhaço']];
    items.forEach(([a, s], i) => { if (n > a) sign('✓ ' + s, 540, 260 + i * 110, { fill: i === 3 ? '#ffffff' : '#ffd23f', sz: i === 3 ? 38 : 46, pop: popIn(n, a) }); });
    if (n > 81.4 && n < 81.9) sign('CLIC', 700, 1240, { fill: '#ffffff', sz: 40, pop: 1 });
  } else {
    // longe do vidro → banheiro (cômodo interno) → Defesa Civil
    bands(['#3f6f86'], 0, 1920);
    cam(540, 1100, 1.6, () => {
      banheiro({ x: 540, y: 1500, s: 1.15 });
      const tt = st(n), inn = ss(seg(n, 86.1, 87.6));
      ademar({ x: lerp(1100, 420, inn), y: 1500, s: .55, t: tt, lid: .3, look: [-.4, 0], mouth: { o: 0, sm: .2 } });
      kika({ x: lerp(1250, 620, inn), y: 1500, s: .7, t: tt, lid: .4, look: [-.6, 0] });
    });
    if (n > 86.2) sign('LONGE DO VIDRO', 540, 300, { fill: '#ffd23f', sz: 48, pop: popIn(n, 86.2) });
    if (n > 87.4) sign('CÔMODO INTERNO', 540, 410, { fill: '#ffffff', sz: 48, pop: popIn(n, 87.4) });
    if (n > 88.6) { sign('DEFESA CIVIL · 199', 540, 1720, { fill: '#ff8a2a', sz: 58, rot: -.03, pop: popIn(n, 88.6) }); }
  }
}

function s9(t) { // 91,3–101,6: a resposta — o trabalho pronto: casa protegida amanhece inteira
  const n = W(t);
  const day = ss(seg(n, 97.6, 99.2));
  const night = ['#2b2244', '#33295a', '#3b2f66'], dawn = ['#ff9fb2', '#ffc27a', '#ffe08a'];
  bands(night, 0, 1600);
  if (day > 0) { g.globalAlpha = day; bands(dawn, 0, 1600); g.globalAlpha = 1; }
  cam(540, 1080, lerp(1.05, 1, day), () => {
    fillOnly(rect(-400, 1500, 1900, 600), day > .5 ? '#7cc45a' : '#2f4a2a', { boil: 0 });
    if (day > 0) shape(ell(880, 600 + (1 - day) * 300, 110, 110, 30), { fill: '#ffd23f', lw: 7 });
    // casa protegida: tapume na janela, telhado com cara
    push(); translate(540, 1500); scale(1.15);
    shape(rect(-260, -300, 520, 300), { fill: PAL.wall, lw: 7, shade: () => fillOnly(rect(160, -300, 120, 300), PAL.wallS, { boil: .4 }) });
    shape(rr(70, -200, 110, 200, 10), { fill: PAL.door, lw: 6 });
    pop();
    protecao({ x: 540 - 110 * 1.15 + 90, y: 1500 - 70, s: .72 });
    telhado({ x: 540, y: 1500 - 345, s: 1.15, t: n, face: true, lid: day > .5 ? .5 : .1, look: day > .5 ? [0, 0] : [.5, -.2], mouth: day > .5 ? { o: 0, sm: 1.2 } : { o: .3, sm: -.6 } });
    // noite: Rodamoinho tenta e quica
    if (day < 1) {
      const u = (n - 91.3);
      const bx = 160 + Math.abs(Math.sin(u * 2.2)) * 120;
      rodamoinho({ x: bx, y: 1500, s: .7, t: n, look: [.8, 0], lid: .1 + seg(n, 95, 97) * .5, mouth: { o: .3, sm: -.8 } });
    }
    // manhã: Ademar com café na varanda, Kika joinha; uma meia perdida no quintal
    if (day > .3) {
      ademar({ x: 880, y: 1600, s: .62, t: st(n), lid: .45, look: [-.4, -.2], mouth: { o: 0, sm: 1 }, armR: { h: [40, 80], bend: 20 } });
      kika({ x: 220, y: 1600, s: .8, t: st(n), lid: .35, look: [.4, -.2], mouth: { o: .1, sm: .8 }, armR: { h: [60, -100], bend: -20, fist: true } });
      push(); translate(420, 1640); rotate(.3); shape(spline([[-14, -24], [8, -24], [8, 6], [26, 14], [22, 26], [-14, 18]]), { fill: '#f4f1ea', lw: 5 }); pop();
    }
  });
  if (day <= 0) rain(n, .8);
  if (n > 91.4 && n < 97.6) sign('POR QUE NUNCA ABRIR?', 540, 300, { fill: '#ffd23f', sz: 56, pop: popIn(n, 91.4) });
  if (n > 98.0) sign('A CASA AMANHECE INTEIRA', 540, 300, { fill: '#ffffff', sz: 52, rot: -.02, pop: popIn(n, 98.0) });
}

function s10(t) { // 101,6–107,5: chamada
  const u = t - 101.6 - VO;
  bands(['#3b2d63', '#33285a', '#2b224d'], 0, 1920);
  // raios de fundo girando
  push(); translate(540, 820); rotate(t * .2);
  for (let i = 0; i < 12; i++) { const a = i / 12 * TAU; fillOnly([[0, 0], [Math.cos(a) * 1400, Math.sin(a) * 1400], [Math.cos(a + .2) * 1400, Math.sin(a + .2) * 1400]], 'rgba(255,255,255,.05)', { boil: 0 }); }
  pop();
  const p = popIn(t, CTA + .1, .45);
  push(); translate(540, 760); scale(p); rotate(-.04);
  text('CURIOSO', 0, -70, { font: '150px "Titan One"', fill: '#ffd23f', outlineW: 18 });
  text('SOH!', 0, 90, { font: '170px "Titan One"', fill: '#39ff9e', outlineW: 18 });
  pop();
  const tt = st(t);
  ademar({ x: 330, y: 1720, s: .9, t: tt, lid: .3, look: [.3, -.3], mouth: { o: 0, sm: 1.2 }, armR: { h: [60, -170 + Math.sin(tt * 10) * 20], bend: -10 } });
  kika({ x: 760, y: 1720, s: 1.05, t: tt, lid: .3, look: [-.3, -.3], mouth: { o: .15, sm: 1 }, armR: { h: [60, -150 + Math.sin(tt * 10 + 1) * 20], bend: -10 } });
  rodamoinho({ x: 980, y: 1480, s: .35, t, look: [-.5, 0], mouth: { o: 0, sm: 1 } });
  if (t > CTA - .1) sign('Se você gostou, comenta:', 540, 500, { fill: '#ffffff', sz: 50, pop: popIn(t, CTA - .1), font: '"Baloo 2"' });
}

const SCENES = [[0, 9.8, s1], [9.8, 18.6, s2], [18.6, 29.6, s3], [29.6, 41.2, s4], [41.2, 55.7, s5], [55.7, 68.1, s6], [68.1, 79.8, s7], [79.8, 91.3, s8], [91.3, 101.6, s9], [101.6, DUR + 1, s10]];
window.render = (t) => {
  frame(t);
  g.setTransform(1, 0, 0, 1, 0, 0); g.fillStyle = INK; g.fillRect(0, 0, 1080, 1920);
  const sc = SCENES.find(([a, b]) => t >= a && t < b) || SCENES[SCENES.length - 1];
  sc[2](t);
  S.lwScale = 1;
};
await document.fonts.load('54px "Titan One"'); await document.fonts.load('800 38px "Baloo 2"'); await document.fonts.load('40px VT323');
window.READY = true;
