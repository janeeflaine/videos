// cast.js — elenco original de "Abre a janela, Seu Ademar?": Ademar, Kika, Rodamoinho + a casa e os objetos reais
// Coordenadas locais: origem nos pés (ou na base do objeto), y para baixo.
import { clamp, lerp, hash, TAU } from './lib.js';
import { INK, g, push, pop, translate, rotate, scale, shape, fillOnly, stroke, ell, arc, spline, rr, rect, noodle, quad, dot, text, wob } from './toon.js';

export const PAL = {
  white: '#ffffff', mouthIn: '#4a1a2a', tongue: '#e8637a',
  // Ademar
  aSkin: '#f0b98f', aSkinS: '#d2936a', robe: '#c2433a', robeS: '#93302a', robeT: '#f2d16b', hairA: '#eeeae2', pj: '#7fb4d9', slip: '#5a4a8a',
  // Kika
  kSkin: '#8a5634', kSkinS: '#6c4025', hat: '#ffb21e', hatS: '#d68a0a', overall: '#2f9e8f', overallS: '#237a6e', shirtK: '#f4f1ea', hairK: '#2a1a14',
  // Rodamoinho
  wind: '#9fb4c9', windS: '#7890aa', windL: '#d6e3ef',
  // casa
  wall: '#f2e2b8', wallS: '#d8c493', roof: '#c8603a', roofS: '#a04a2a', frame: '#f4f1ea', glass: '#9ad4e8', glassS: '#79b8cf', door: '#7a4a2a',
  wood: '#c9a067', woodS: '#a37f4a', steel: '#9aa3ad', steelS: '#737d88', brass: '#e2b33c', brassS: '#b98a1f',
  tile: '#dfe8ec', tileS: '#bccad1',
  // brilho exclusivo dos Óculos Raio-P
  glow: '#39ff9e', glowL: '#c8ffe4',
};

// —— rosto (gramática do estilo) ——
export function eye(cx, cy, rx, ry, { lid = 0, look = [0, 0], pupil = 4.5, skin = PAL.aSkin, closed = false, lw = 6, jitter = 0 } = {}) {
  if (closed) { stroke(arc(cx, cy + ry * .15, rx * .8, ry * .45, Math.PI * .1, Math.PI * .9, 14), lw); return; }
  shape(ell(cx, cy, rx, ry, 36), {
    fill: PAL.white, lw, shade: () => {
      dot(cx + look[0] * rx * .55 + jitter, cy + look[1] * ry * .5, pupil);
      if (lid > 0) {
        const yl = cy - ry + lid * 2 * ry;
        fillOnly([[cx - rx * 1.3, cy - ry * 1.4], [cx + rx * 1.3, cy - ry * 1.4], [cx + rx * 1.3, yl], [cx - rx * 1.3, yl + ry * .08]], skin, { boil: .5 });
        stroke([[cx - rx * 1.2, yl + ry * .08], [cx + rx * 1.2, yl]], lw);
      }
    }
  });
}
export function mouth(cx, cy, mw, { o = 0, w = 1, sm = 0, skew = 0, lw = 6, teeth = true, tongue = true } = {}) {
  const hw = mw * w / 2, k = mw * .22, lc = [cx - hw, cy - sm * k + skew * k], rc = [cx + hw, cy - sm * k - skew * k];
  if (o < .07) { stroke(quad(lc, [cx, cy + sm * k * 1.2], rc, 12), lw); return; }
  const h = o * mw * .62;
  const up = quad(lc, [cx, cy - h * .25 + sm * k * .4], rc, 12), dn = quad(rc, [cx, cy + h + sm * k * .6], lc, 14);
  shape([...up, ...dn], {
    fill: PAL.mouthIn, lw, shade: () => {
      if (teeth && o > .22) fillOnly(rect(cx - hw * 1.2, cy - h, hw * 2.4, h * .32 + 6), PAL.white, { boil: .3 });
      if (tongue) fillOnly(ell(cx + hw * .15, cy + h * .95, hw * .6, h * .45, 20), PAL.tongue, { boil: .3 });
    }
  });
}
export function hand(x, y, ang, r = 20, col = PAL.aSkin, { fist = false, lw = 6 } = {}) {
  push(); translate(x, y); rotate(ang);
  const pts = fist ? spline([[-r * .6, -r * .8], [r * .7, -r * .9], [r * 1.1, -r * .1], [r * .8, r * .8], [-r * .5, r * .9], [-r * .9, 0]])
    : spline([[-r * .5, -r * .85], [r * .5, -r * 1.05], [r * 1.35, -r * .75], [r * 1.05, -r * .3], [r * 1.5, -r * .1], [r * 1.1, r * .3], [r * 1.35, r * .7], [r * .6, r * .95], [-r * .6, r * .8], [-r * .95, 0]]);
  shape(pts, { fill: col, lw });
  pop();
}
export const sweat = (x, y, s = 1) => shape(spline([[x, y - 16 * s], [x + 9 * s, y + 4 * s], [x, y + 12 * s], [x - 9 * s, y + 4 * s]]), { fill: '#bfe9ff', lw: 5 });

// —— 1. SEU ADEMAR: aposentado teimoso, roupão bordô com gola dourada, chinelo, careca com tufos e bigodão ——
export function ademar(P) {
  const f = P.face ?? 1, t = P.t ?? 0;
  push(); translate(P.x, P.y); scale((P.s ?? 1) * f, P.s ?? 1);
  // pernas de pijama + chinelos
  for (const sx of [-1, 1]) {
    shape(noodle([sx * 40, -150], [sx * 46, -26], 0, 50, 44), { fill: PAL.pj, lw: 7, shade: () => { for (let k = 0; k < 4; k++) fillOnly(rect(-200, -140 + k * 30, 400, 8), '#5f93bb', { boil: .3 }); } });
    shape(spline([[sx * 46 - 40, 0], [sx * 46 - 36, -22], [sx * 46 + 30, -24], [sx * 46 + 58, -8], [sx * 46 + 52, 2]]), { fill: PAL.slip, lw: 7 });
    shape(ell(sx * 46 + 6, -20, 26, 9, 16), { fill: '#f4f1ea', lw: 5 }); // pompom/tira
  }
  push(); rotate(P.lean ?? 0);
  // braço de trás
  const armB = P.armL || { h: [-40, 150], bend: -20 }, armF = P.armR || { h: [60, 140], bend: 30 };
  const shB = [-92, -380], shF = [92, -380];
  const drawArm = (sh, arm, back) => {
    const hp = [sh[0] + arm.h[0], sh[1] + arm.h[1]];
    shape(noodle(sh, hp, arm.bend ?? 0, 56, 52), { fill: back ? PAL.robeS : PAL.robe, lw: 7, shade: () => fillOnly(rect(-400, sh[1] + arm.h[1] * .8, 800, 18), PAL.robeT, { boil: .3 }) });
    hand(hp[0], hp[1] + 10, Math.atan2(arm.h[1], arm.h[0]) - .2, 24, PAL.aSkin, { fist: arm.fist });
  };
  drawArm(shB, armB, true);
  // corpo de pera (roupão)
  const body = spline([[-100, -400], [0, -428], [100, -400], [138, -260], [150, -150], [96, -118], [0, -112], [-96, -118], [-150, -150], [-138, -260]]);
  shape(body, {
    fill: PAL.robe, lw: 7, shade: () => {
      fillOnly(spline([[60, -420], [160, -300], [160, -120], [90, -110], [110, -260]]), PAL.robeS, { boil: .5 });
      // xadrez discreto
      for (let k = 0; k < 5; k++) fillOnly(rect(-200, -380 + k * 56, 400, 6), '#a83a32', { boil: .2 });
      // pijama aparecendo no decote
      fillOnly([[-30, -420], [30, -420], [0, -330]], PAL.pj, { boil: .3 });
    }
  });
  // gola dourada em V + faixa
  stroke(quad([-60, -414], [-10, -360], [20, -250], 10), 18, { line: PAL.robeT });
  stroke(quad([60, -414], [30, -340], [20, -250], 10), 18, { line: PAL.robeT });
  stroke(quad([-60, -414], [-10, -360], [20, -250], 10), 5);
  shape(rr(-142, -250, 290, 26, 12), { fill: PAL.robeT, lw: 6 });
  shape(spline([[30, -228], [60, -190], [40, -150], [20, -196]]), { fill: PAL.robeT, lw: 5 });
  // cabeça
  push(); translate(0, -430); rotate(P.tilt ?? 0);
  shape(ell(0, -88, 92, 98, 50), {
    fill: PAL.aSkin, lw: 7, shade: () => { fillOnly(ell(62, -60, 50, 90, 30), PAL.aSkinS, { boil: .4 }); fillOnly(ell(-30, -165, 26, 10, 12), '#ffd9bd', { boil: .3 }); }
  });
  // orelhas + tufos laterais
  for (const sx of [-1, 1]) {
    shape(ell(sx * 92, -82, 18, 26, 16), { fill: PAL.aSkin, lw: 6 });
    shape(spline([[sx * 84, -128], [sx * 122, -136], [sx * 128, -104], [sx * 116, -86], [sx * 92, -96]]), { fill: PAL.hairA, lw: 6 });
  }
  // fio solitário no topo (vira cata-vento)
  stroke(spline([[0, -184], [8, -214], [-6, -232], [10, -248]], false), 5);
  // sobrancelhas grossas
  const br = P.brow ?? 0;
  shape(rr(-62, -126 - br * 8, 46, 14, 7), { fill: PAL.hairA, lw: 5 });
  shape(rr(16, -126 + br * 4, 46, 14, 7), { fill: PAL.hairA, lw: 5 });
  // óculos de leitura + olhos
  eye(-34, -94, 24, 26, { lid: P.lid ?? .3, look: P.look || [.2, 0], skin: PAL.aSkin });
  eye(34, -94, 24, 26, { lid: P.lid ?? .3, look: P.look || [.2, 0], skin: PAL.aSkin });
  stroke(ell(-34, -94, 30, 30, 24), 5); stroke(ell(34, -94, 30, 30, 24), 5); stroke([[-4, -96], [4, -96]], 5);
  // nariz batata
  shape(ell(6, -52, 22, 18, 18), { fill: '#f7a98a', lw: 6 });
  // bigodão
  shape(spline([[-58, -20], [-36, -38], [0, -32], [36, -38], [58, -20], [36, -26], [0, -18], [-36, -26]]), { fill: PAL.hairA, lw: 6 });
  mouth(0, -4, 44, P.mouth || { o: .2, sm: .5 });
  pop();
  drawArm(shF, armF, false);
  pop(); pop();
}

// —— 2. KIKA: engenheira mirim, capacete de obra laranja, macacão, trancinhas para os lados, Óculos Raio-P ——
export function kika(P) {
  const f = P.face ?? 1;
  push(); translate(P.x, P.y); scale((P.s ?? 1) * f, P.s ?? 1);
  for (const sx of [-1, 1]) {
    shape(noodle([sx * 22, -110], [sx * 26, -20], 0, 30, 28), { fill: PAL.overall, lw: 7 });
    shape(spline([[sx * 26 - 24, 0], [sx * 26 - 22, -20], [sx * 26 + 22, -22], [sx * 26 + 36, -6], [sx * 26 + 32, 2]]), { fill: '#e8e2d4', lw: 7 });
  }
  const shB = [-50, -236], shF = [50, -236];
  const armB = P.armL || { h: [-30, 100], bend: -14 }, armF = P.armR || { h: [40, 96], bend: 20 };
  const drawArm = (sh, arm) => {
    const hp = [sh[0] + arm.h[0], sh[1] + arm.h[1]];
    shape(noodle(sh, hp, arm.bend ?? 0, 30, 26), { fill: PAL.shirtK, lw: 7 });
    hand(hp[0], hp[1] + 6, Math.atan2(arm.h[1], arm.h[0]) - .2, 16, PAL.kSkin, { fist: arm.fist });
  };
  drawArm(shB, armB);
  // tronco: camiseta + macacão com bolso de ferramentas
  shape(spline([[-56, -246], [0, -258], [56, -246], [66, -150], [58, -100], [0, -94], [-58, -100], [-66, -150]]), {
    fill: PAL.shirtK, lw: 7, shade: () => {
      fillOnly(spline([[-60, -186], [60, -186], [64, -100], [0, -92], [-64, -100]]), PAL.overall, { boil: .4 });
      fillOnly(rect(-40, -246, 14, 70), PAL.overall, { boil: .3 }); fillOnly(rect(26, -246, 14, 70), PAL.overall, { boil: .3 });
      fillOnly(rect(30, -186, 40, 90), PAL.overallS, { boil: .3 });
    }
  });
  shape(rr(-26, -174, 52, 40, 8), { fill: PAL.overallS, lw: 5 });
  stroke([[-10, -176], [-14, -206]], 5, { line: PAL.brass }); stroke([[8, -176], [12, -200]], 5, { line: PAL.steel }); // lápis + chave de fenda
  // cabeça
  push(); translate(0, -258); rotate(P.tilt ?? 0);
  // trancinhas para os lados
  for (const sx of [-1, 1]) {
    shape(spline([[sx * 56, -80], [sx * 104, -100], [sx * 132, -84], [sx * 110, -64], [sx * 60, -58]]), { fill: PAL.hairK, lw: 6 });
    shape(ell(sx * 132, -86, 12, 12, 12), { fill: PAL.hat, lw: 5 });
  }
  shape(ell(0, -76, 70, 72, 44), { fill: PAL.kSkin, lw: 7, shade: () => fillOnly(ell(44, -60, 40, 70, 24), PAL.kSkinS, { boil: .4 }) });
  // capacete de obra (laranja-amarelo, aba larga)
  shape(spline([[-82, -104], [-70, -150], [0, -172], [70, -150], [82, -104]]), { fill: PAL.hat, lw: 7, shade: () => fillOnly(rect(20, -180, 80, 80), PAL.hatS, { boil: .4 }) });
  shape(rr(-96, -112, 192, 18, 9), { fill: PAL.hat, lw: 6 });
  shape(rr(-12, -170, 24, 58, 8), { fill: PAL.hatS, lw: 5 });
  // Óculos Raio-P (na testa ou nos olhos)
  const on = P.goggles ?? false;
  const gy = on ? -76 : -100;
  if (on) { shape(ell(-30, gy, 44, 34, 30), { fill: PAL.glow, lw: 0, stroke: false, alpha: .25 }); shape(ell(30, gy, 44, 34, 30), { fill: PAL.glow, lw: 0, stroke: false, alpha: .25 }); }
  if (!on) { eye(-24, -70, 18, 20, { lid: P.lid ?? .4, look: P.look || [.3, 0], skin: PAL.kSkin }); eye(24, -70, 18, 20, { lid: P.lid ?? .4, look: P.look || [.3, 0], skin: PAL.kSkin }); }
  stroke([[-70, gy], [70, gy]], 10, { line: '#3a3a44' });
  for (const sx of [-1, 1]) shape(ell(sx * 28, gy, 26, 20, 24), { fill: on ? PAL.glowL : '#2d3a40', lw: 6, shade: () => { if (on) dot(sx * 28 + 6, gy, 5, INK); fillOnly(ell(sx * 28 - 8, gy - 8, 7, 4, 8), '#ffffff', { boil: .2 }); } });
  shape(rr(-8, gy - 6, 16, 12, 4), { fill: '#3a3a44', lw: 4 });
  // nariz + boca
  stroke(arc(4, -42, 8, 6, 0, Math.PI, 8), 5);
  mouth(0, -22, 30, P.mouth || { o: 0, sm: -.1, skew: .5 });
  pop();
  drawArm(shF, armF);
  pop();
}

// —— 3. RODAMOINHO: o vento do ciclone em forma de funil — anéis de vento empilhados que giram, rosto no anel largo de cima,
//    bracinhos de rajada e lixo orbitando. Silhueta de "redemoinho" clássico: lê-se como vento até em preto chapado ——
export function rodamoinho(P) {
  const t = P.t ?? 0, s = P.s ?? 1, dir = P.dir ?? 1;
  push(); translate(P.x, P.y); scale(s * (P.face ?? 1), s);
  const spin = t * 2.4 * dir;
  // riscos de vento atrás do corpo
  for (let k = 0; k < 3; k++) { const y = -90 - k * 110, rx = 90 + k * 60; stroke(arc(0, y, rx + 40, 26 + k * 6, Math.PI * (.9 + k * .1) + spin * .2, Math.PI * (1.3 + k * .1) + spin * .2, 10), 5, { line: PAL.windL }); }
  // anéis do funil: de baixo (ponta fina) para cima (largo); o centro serpenteia bastante
  const N = 6, rings = [];
  for (let i = 0; i < N; i++) {
    const u = i / (N - 1);
    rings.push({ y: -20 - u * 330, rx: 22 + u * u * 110 + u * 44, ry: 10 + u * 20, cx: Math.sin(u * 3.2 + t * 3) * 38 * (1 - u * .6) });
  }
  // contorno fofo: cada anel faz um gomo para fora, como nuvem torcida
  const side = sx => { const o = []; for (let i = 0; i < N - 1; i++) { const r0 = rings[i], r1 = rings[i + 1];
    o.push([r0.cx + sx * r0.rx, r0.y]); o.push([lerp(r0.cx, r1.cx, .5) + sx * (lerp(r0.rx, r1.rx, .5) * 1.12 + 6), lerp(r0.y, r1.y, .5)]); }
    o.push([rings[N - 1].cx + sx * rings[N - 1].rx, rings[N - 1].y]); return o; };
  const L = side(-1), R = side(1).reverse();
  shape(spline([[rings[0].cx, 4], ...L, ...R], true, 8), {
    fill: PAL.wind, lw: 7, shade: () => {
      fillOnly(spline([[rings[0].cx + 4, 4], ...rings.map(r => [r.cx + r.rx * .4, r.y]), ...side(1).reverse().map(([x, y]) => [x + 30, y]).reverse()].slice(0, N + 1).concat(side(1).reverse().map(([x, y]) => [x + 30, y]))), PAL.windS, { boil: .4 });
      // faixas de giro inclinadas (não fechadas: vento, não metal)
      for (let i = 0; i < N - 1; i++) {
        const r = rings[i], ph = ((spin * .45 + i * .29) % 1 + 1) % 1, a0 = Math.PI * (.05 + ph * .6);
        push(); translate(r.cx, r.y - 4); rotate(-.12);
        stroke(arc(0, 0, r.rx * .95, r.ry, a0, a0 + 1.1, 12), 6, { line: '#5b7088' });
        stroke(arc(0, 8, r.rx * .8, r.ry * .8, a0 + 1.4, a0 + 2.1, 8), 5, { line: PAL.windL });
        pop();
      }
    }
  });
  // nuvem no topo (gomos), girando devagar
  const top = rings[N - 1], lobes = [];
  for (let i = 0; i < 9; i++) { const a = Math.PI * (1.02 + i / 8 * .96) + wob(t, .5, i) * .03; lobes.push([top.cx + Math.cos(a) * top.rx * .95, top.y - 14 + Math.sin(a) * 46, 40 + (i % 3) * 8]); }
  lobes.push([top.cx - top.rx * .55, top.y + 8, 40], [top.cx, top.y + 14, 44], [top.cx + top.rx * .55, top.y + 8, 40]);
  for (const [x, y, r] of lobes) shape(ell(x, y, r, r * .86, 22), { fill: PAL.wind, lw: 7 });
  for (const [x, y, r] of lobes) fillOnly(ell(x, y, r - 6, r * .86 - 6, 22), PAL.wind, { boil: .6 });
  fillOnly(ell(top.cx, top.y - 10, top.rx * .95, 46, 30), PAL.wind, { boil: .4 });
  fillOnly(ell(top.cx + top.rx * .45, top.y + 4, top.rx * .45, 28, 20), PAL.windS, { boil: .4 });
  fillOnly(ell(top.cx - top.rx * .4, top.y - 48, 46, 14, 14), PAL.windL, { boil: .3 });
  // rosto no segundo anel de cima (largo), olhos de quem procura fresta
  const fr = rings[N - 2], fy = fr.y - 10, fx = fr.cx;
  eye(fx - 38, fy - 4, 26, 30, { lid: P.lid ?? .3, look: P.look || [.55, .1], skin: PAL.wind });
  eye(fx + 32, fy - 4, 26, 30, { lid: P.lid ?? .3, look: P.look || [.55, .1], skin: PAL.wind });
  shape(rr(fx - 68, fy - 46, 46, 12, 6), { fill: PAL.windS, lw: 5 });
  shape(rr(fx + 12, fy - 40, 46, 12, 6), { fill: PAL.windS, lw: 5 });
  mouth(fx - 2, fy + 50, 56, P.mouth || { o: .3, sm: .9, skew: -.35 });
  // bracinhos de rajada saindo dos lados do anel do rosto
  for (const sx of [-1, 1]) {
    const x0 = fr.cx + sx * fr.rx * .95, y0 = fr.y + 20;
    const arm = spline([[x0, y0], [x0 + sx * 50, y0 - 40], [x0 + sx * 86, y0 - 10], [x0 + sx * 66, y0 + 12]], false);
    stroke(arm, 16); stroke(arm, 8, { line: PAL.wind });
  }
  // riscos de vento ao redor + lixo orbitando (meia, folha, telha)
    const orb = (k, draw) => { const a = spin * 1.2 + k * 2.1, ry = -150 - k * 70; push(); translate(Math.cos(a) * (150 + k * 40), ry + Math.sin(a) * 30); rotate(a * 2); draw(); pop(); };
  orb(0, () => shape(spline([[-14, -24], [8, -24], [8, 6], [26, 14], [22, 26], [-14, 18]]), { fill: '#f4f1ea', lw: 5, shade: () => fillOnly(rect(-20, -26, 40, 10), '#e8392b', { boil: .2 }) }));
  orb(1, () => shape(spline([[-24, 0], [0, -14], [24, 0], [0, 14]]), { fill: '#6cbf4a', lw: 5 }));
  orb(2, () => shape(spline([[-20, -8], [20, -12], [22, 8], [-18, 12]]), { fill: PAL.roof, lw: 5 }));
  pop();
}

// —— 4. A CASA: térrea, telhado de telha, janela, porta ——
export function casa(P) {
  const t = P.t ?? 0;
  push(); translate(P.x, P.y); scale(P.s ?? 1);
  // paredes
  shape(rect(-260, -300, 520, 300), { fill: PAL.wall, lw: 7, shade: () => fillOnly(rect(160, -300, 120, 300), PAL.wallS, { boil: .4 }) });
  // porta
  shape(rr(70, -200, 110, 200, 10), { fill: PAL.door, lw: 6, shade: () => fillOnly(rect(140, -210, 50, 220), '#5d371f', { boil: .3 }) });
  dot(160, -100, 7, PAL.brass);
  // janela com moldura
  janela({ x: -110, y: -110, s: .62, open: P.open ?? 0, t, latchOnly: false });
  // telhado
  if (!P.noRoof) telhado({ x: 0, y: -300, s: 1, t, face: P.roofFace ?? false });
  pop();
}

// —— 5. O TELHADO: duas águas, telhas onduladas, com cara (reage) ——
export function telhado(P) {
  const t = P.t ?? 0;
  push(); translate(P.x, P.y); scale(P.s ?? 1); rotate(P.rot ?? 0);
  const roofPts = [[-310, 10], [0, -190], [310, 10]];
  shape(roofPts, {
    fill: PAL.roof, lw: 7, shade: () => {
      fillOnly([[0, -190], [310, 10], [120, 10]], PAL.roofS, { boil: .4 });
      for (let r = 0; r < 4; r++) { const y = -150 + r * 44; for (let x = -300; x < 300; x += 40) stroke(arc(x + (r % 2) * 20, y, 20, 10, 0, Math.PI, 8), 4, { line: '#8a3a1e' }); }
    }
  });
  // cumeeira + calha
  shape(rr(-30, -206, 60, 26, 10), { fill: PAL.roofS, lw: 6 });
  shape(rr(-320, 0, 640, 20, 8), { fill: PAL.steel, lw: 6 });
  if (P.face) {
    eye(-50, -104, 26, 30, { lid: P.lid ?? .2, look: P.look || [0, -.3], skin: PAL.roof });
    eye(50, -104, 26, 30, { lid: P.lid ?? .2, look: P.look || [0, -.3], skin: PAL.roof });
    mouth(0, -50, 56, P.mouth || { o: .45, sm: -.6 });
  }
  pop();
}

// —— 6. A JANELA: de correr com moldura branca e trinco de alavanca (o objeto da tentação) ——
export function janela(P) {
  const o = P.open ?? 0;
  push(); translate(P.x, P.y); scale(P.s ?? 1);
  shape(rect(-170, -300, 340, 300), { fill: PAL.frame, lw: 7 });
  shape(rect(-150, -280, 300, 260), { fill: P.sky ?? '#2a2f45', lw: 6, shade: P.outside }); // fundo (lá fora)
  // folha fixa (direita) e folha móvel (esquerda)
  const ga = P.glassA ?? 1;
  const glassPane = (x0, front) => shape(rect(x0, -280, 150, 260), {
    fill: PAL.glass, lw: 6, alpha: ga, shade: () => {
      fillOnly(rect(x0 + 100, -280, 50, 260), PAL.glassS, { boil: .3 });
      stroke([[x0 + 26, -250], [x0 + 70, -200]], 7, { line: '#ffffff' }); stroke([[x0 + 30, -210], [x0 + 52, -188]], 6, { line: '#ffffff' });
    }
  });
  glassPane(0, false);
  glassPane(-150 + o * 130, true);
  stroke([[-150 + o * 130 + 150, -280], [-150 + o * 130 + 150, -20]], 8);
  // trinco de alavanca (latão)
  push(); translate(-6 + o * 130, -150); rotate(P.latch ?? 0);
  shape(rr(-8, -26, 16, 52, 6), { fill: PAL.brass, lw: 5 });
  shape(rr(-6, -30, 40, 12, 6), { fill: PAL.brass, lw: 5, shade: () => fillOnly(rect(-10, -24, 60, 10), PAL.brassS, { boil: .2 }) });
  pop();
  // peitoril
  shape(rr(-190, -6, 380, 22, 6), { fill: PAL.frame, lw: 6 });
  pop();
}

// —— 7. PROTEÇÃO: persiana de enrolar de alumínio (com caixa) + tapume de compensado aparafusado ——
export function protecao(P) {
  push(); translate(P.x, P.y); scale(P.s ?? 1);
  // persiana (esquerda)
  shape(rr(-250, -330, 220, 46, 8), { fill: PAL.steel, lw: 6, shade: () => fillOnly(rect(-250, -300, 220, 16), PAL.steelS, { boil: .3 }) });
  shape(rect(-240, -284, 200, 270), { fill: '#c9d1d8', lw: 6, shade: () => { for (let y = -270; y < -14; y += 22) stroke([[-240, y], [-40, y]], 4, { line: PAL.steelS }); } });
  stroke([[-30, -280], [-30, -60]], 4, { line: '#e8e2d4' }); shape(rr(-38, -64, 16, 26, 6), { fill: '#e8e2d4', lw: 4 });
  // tapume (direita)
  shape(rect(20, -300, 230, 290), { fill: PAL.wood, lw: 6, shade: () => {
    fillOnly(rect(190, -300, 60, 290), PAL.woodS, { boil: .3 });
    for (const [x, y] of [[60, -260], [120, -200], [80, -120], [170, -80], [150, -230]]) stroke(arc(x, y, 30, 8, 0, Math.PI, 8), 3, { line: '#a37f4a' });
  } });
  for (const [x, y] of [[40, -280], [230, -280], [40, -30], [230, -30], [135, -280], [135, -30]]) { shape(ell(x, y, 9, 9, 10), { fill: PAL.steel, lw: 4 }); stroke([[x - 5, y - 5], [x + 5, y + 5]], 3); }
  pop();
}

// —— 8. BARÔMETRO: de parede, latão e mostrador, ponteiro dramático, cara que desmaia ——
export function barometro(P) {
  push(); translate(P.x, P.y); scale(P.s ?? 1);
  shape(ell(0, -110, 110, 110, 40), { fill: PAL.brass, lw: 7, shade: () => fillOnly(ell(40, -90, 90, 100, 30), PAL.brassS, { boil: .4 }) });
  shape(ell(0, -110, 86, 86, 40), { fill: '#f6f0de', lw: 6 });
  // marcas do mostrador
  for (let i = 0; i <= 10; i++) { const a = Math.PI * (.8 + i * .14); stroke([[Math.cos(a) * 74, -110 + Math.sin(a) * 74], [Math.cos(a) * 62, -110 + Math.sin(a) * 62]], 4); }
  text('CHUVA', -40, -150, { font: '800 18px "Baloo 2"', fill: '#3f6fd1' });
  text('SOL', 46, -150, { font: '800 18px "Baloo 2"', fill: '#d68a0a' });
  text('VIXE', 0, -54, { font: '800 22px "Baloo 2"', fill: '#c8402f' });
  // olhos em espiral (desmaio) + boca
  for (const sx of [-1, 1]) { const pts = []; for (let i = 0; i <= 30; i++) { const a = i / 30 * TAU * 2, r = 2 + i * .55; pts.push([sx * 30 + Math.cos(a) * r, -116 + Math.sin(a) * r]); } stroke(pts, 4); }
  // ponteiro
  const a = P.needle ?? Math.PI * .86;
  shape([[Math.cos(a) * 70, -110 + Math.sin(a) * 70], [Math.cos(a + 1.6) * 8, -110 + Math.sin(a + 1.6) * 8], [Math.cos(a - 1.6) * 8, -110 + Math.sin(a - 1.6) * 8]], { fill: INK, lw: 3 });
  dot(0, -110, 9, PAL.brass);
  mouth(0, -78, 26, { o: .5, sm: -.8 });
  pop();
}

// —— 9. ÓCULOS RAIO-P (objeto isolado): mostram pressão e vento em verde-neon ——
export function oculosRaioP(P) {
  const t = P.t ?? 0;
  push(); translate(P.x, P.y); scale(P.s ?? 1);
  for (let k = 0; k < 2; k++) shape(ell(0, -60, 170 - k * 30, 70 - k * 12, 30), { fill: PAL.glow, stroke: false, alpha: .14 });
  stroke(spline([[-150, -60], [-170, -20], [-130, 10], [0, 20], [130, 10], [170, -20], [150, -60]], false), 12, { line: '#3a3a44' });
  for (const sx of [-1, 1]) shape(ell(sx * 64, -60, 60, 46, 30), { fill: PAL.glowL, lw: 7, shade: () => {
    for (let k = 0; k < 4; k++) stroke(arc(sx * 64, -40, 50 - k * 10, 30 - k * 6, Math.PI * 1.1, Math.PI * 1.9, 12), 4, { line: '#17a865' });
    fillOnly(ell(sx * 64 - 20, -78, 14, 8, 10), '#ffffff', { boil: .2 });
  } });
  shape(rr(-18, -72, 36, 22, 8), { fill: '#3a3a44', lw: 5 });
  // antena com lâmpada (sci-fi caseiro) + rótulo de fita crepe
  stroke([[90, -104], [110, -150]], 5); shape(ell(112, -158, 12, 12, 12), { fill: PAL.glow, lw: 5 });
  shape(rr(-70, -126, 100, 28, 4), { fill: '#efe6c8', lw: 4 });
  text('RAIO-P', -20, -111, { font: '800 20px "Baloo 2"', fill: INK, rot: -.04 });
  pop();
}

// —— 10. BANHEIRO (cômodo seguro): porta aberta, azulejos, sem janela; lanterna e rádio de pilha ——
export function banheiro(P) {
  push(); translate(P.x, P.y); scale(P.s ?? 1);
  shape(rect(-200, -340, 400, 340), { fill: PAL.tile, lw: 7, shade: () => {
    for (let y = -340; y < 0; y += 40) stroke([[-200, y], [200, y]], 3, { line: PAL.tileS });
    for (let x = -200; x < 200; x += 40) stroke([[x, -340], [x, 0]], 3, { line: PAL.tileS });
  } });
  // vaso + pia
  shape(rr(70, -210, 70, 100, 10), { fill: '#ffffff', lw: 6 });
  shape(spline([[40, -110], [170, -110], [160, -50], [120, -20], [90, -20], [50, -50]]), { fill: '#ffffff', lw: 6 });
  shape(rr(-170, -200, 110, 30, 8), { fill: '#ffffff', lw: 6 }); shape(rr(-126, -170, 22, 170, 6), { fill: '#ffffff', lw: 5 });
  // lanterna + rádio
  push(); translate(-90, -10); rotate(-.15);
  shape(rr(-40, -26, 70, 26, 8), { fill: '#3f6fd1', lw: 5 }); shape(rr(28, -32, 22, 38, 6), { fill: '#e0e0d8', lw: 5 });
  shape([[50, -30], [140, -60], [140, 34], [50, 4]], { fill: '#fff6b0', stroke: false, alpha: .5 });
  pop();
  shape(rr(-30, -60, 90, 60, 10), { fill: '#e8392b', lw: 5, shade: () => fillOnly(ell(0, -30, 18, 18, 14), '#3a3a44', { boil: .2 }) });
  stroke([[40, -60], [60, -100]], 4);
  // batente de porta (vista de dentro)
  shape(rect(-220, -360, 30, 360), { fill: '#f4f1ea', lw: 6 }); shape(rect(190, -360, 30, 360), { fill: '#f4f1ea', lw: 6 }); shape(rect(-220, -380, 440, 30), { fill: '#f4f1ea', lw: 6 });
  pop();
}
