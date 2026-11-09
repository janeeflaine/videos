// cast.js — elenco e cenário FIXOS da série "Jornal do seu ___" (reaproveitados em todo episódio)
// O senhor, a esposa, o gato magricelo, o papagaio + a sala com a cozinha ao fundo e os objetos de cena.
// Coordenadas locais: origem nos pés (ou na base do objeto), y para baixo.
import { clamp, lerp, hash, TAU } from './lib.js';
import { INK, g, push, pop, translate, rotate, scale, shape, fillOnly, stroke, ell, arc, spline, rr, rect, noodle, quad, dot, text, wob } from './toon.js';

export const PAL = {
  white: '#ffffff', mouthIn: '#4a1a2a', tongue: '#e8637a',
  // o senhor: moreno de sol, marca de regata, bermuda tactel azul, chinelo de dedo
  sSkin: '#bf7a46', sSkinS: '#a5673a', sTan: '#f1c79c', sNose: '#d8774f', sHair: '#6c6670', stache: '#3b3238', stacheG: '#8a8590',
  short: '#2f6fd0', shortS: '#2456a6', flip: '#2fb37a', flipS: '#1f8a5b', strap: '#f4f1ea', gold: '#e2b33c', goldS: '#b98a1f',
  // a esposa: alta e magra, vestido florido, avental, bobes
  eSkin: '#94552f', eSkinS: '#743f20', eHair: '#d9d4dc', eHairS: '#b3adb8', dress: '#c4508f', dressS: '#9c3a70', flower: '#ffe0f0',
  apron: '#ffd23f', apronS: '#e0ad1a', blush: '#c25a50', lip: '#b8283c', curl: ['#5ec4e8', '#ff8fb1', '#9be36b', '#ffb21e', '#5ec4e8'], eSlip: '#ff8fb1',
  // gato magricelo: cinza rajado
  cat: '#a19fab', catS: '#7d7b88', catStripe: '#64626e', catPink: '#f2a0b5', catBelly: '#d6d4dc',
  // papagaio (papagaio-verdadeiro): verde, testa azul, cara amarela, ombro vermelho
  pGreen: '#3cb44b', pGreenS: '#2a8a37', pBlue: '#3e7be0', pYellow: '#ffd23f', pRed: '#e5402f', beak: '#4a4550', beakS: '#2e2a33', claw: '#8e8a94',
  // a casa
  wallT: '#a8dccf', wallTS: '#93c8bb', wallB: '#3f8c7c', wallBS: '#347567', floor: '#b5462f', floorS: '#9a3826', grout: '#7e2c1d',
  kWall: '#f6dd8a', kTile: '#fbfaf3', kTileB: '#7fb4d9', kFloor: '#efe6cf', kFloorB: '#d8ccae',
  wood: '#b07a45', woodS: '#8a5c30', woodD: '#6b4423', chair: '#8e2f45', chairS: '#6e2236', doily: '#fff7e6',
  thermos: '#d9342b', thermosS: '#a82520', cup: '#fdfbf5', cupS: '#dcd8cc', cupBand: '#3e7be0', coffee: '#5a3418',
  paper: '#f3ecd9', paperS: '#ddd2b6', news: '#2b2730', clay: '#c46a3c', clayS: '#9c4f28', steel: '#c8cdd3', steelS: '#9aa1aa',
  sun1: '#ffb347', sun2: '#ff8a5c', sun3: '#e8607a', sun4: '#9a5ca8', sunD: '#ffe27a',
  chita: '#ff7a3d', chitaS: '#d9582a', chitaF: '#ffe14d', chitaL: '#2fb37a',
  rug: ['#ff8fb1', '#ffd23f', '#5ec4e8', '#9be36b'],
};

// —— gramática de rosto e mãos ——
export function eye(cx, cy, rx, ry, { lid = 0, look = [0, 0], pupil = 4.5, skin = PAL.sSkin, closed = false, lw = 6, jitter = 0 } = {}) {
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
export function mouth(cx, cy, mw, { o = 0, w = 1, sm = 0, skew = 0, lw = 6, teeth = true, tongue = true, lip = null } = {}) {
  const hw = mw * w / 2, k = mw * .22, lc = [cx - hw, cy - sm * k + skew * k], rc = [cx + hw, cy - sm * k - skew * k];
  if (o < .07) {
    if (lip) shape([...quad(lc, [cx, cy - 4 + sm * k * 1.2], rc, 12), ...quad(rc, [cx, cy + 9 + sm * k * 1.2], lc, 12)], { fill: lip, lw: 4 });
    stroke(quad(lc, [cx, cy + sm * k * 1.2], rc, 12), lw); return;
  }
  const h = o * mw * .62;
  const up = quad(lc, [cx, cy - h * .25 + sm * k * .4], rc, 12), dn = quad(rc, [cx, cy + h + sm * k * .6], lc, 14);
  shape([...up, ...dn], {
    fill: PAL.mouthIn, lw: lip ? lw + 2 : lw, line: lip ?? INK, shade: () => {
      if (teeth && o > .22) fillOnly(rect(cx - hw * 1.2, cy - h, hw * 2.4, h * .32 + 6), PAL.white, { boil: .3 });
      if (tongue) fillOnly(ell(cx + hw * .15, cy + h * .95, hw * .6, h * .45, 20), PAL.tongue, { boil: .3 });
    }
  });
}
export function hand(x, y, ang, r = 20, col = PAL.sSkin, { fist = false, lw = 6 } = {}) {
  push(); translate(x, y); rotate(ang);
  const pts = fist ? spline([[-r * .6, -r * .8], [r * .7, -r * .9], [r * 1.1, -r * .1], [r * .8, r * .8], [-r * .5, r * .9], [-r * .9, 0]])
    : spline([[-r * .5, -r * .85], [r * .5, -r * 1.05], [r * 1.35, -r * .75], [r * 1.05, -r * .3], [r * 1.5, -r * .1], [r * 1.1, r * .3], [r * 1.35, r * .7], [r * .6, r * .95], [-r * .6, r * .8], [-r * .95, 0]]);
  shape(pts, { fill: col, lw });
  pop();
}
// tubo com contorno (rabo, alça, fio): traço preto largo + traço colorido por cima
export function tube(pts, w, col, lw = 6) { stroke(pts, w + lw * 2, { boil: .6 }); stroke(pts, w, { line: col, boil: .6 }); }
export const sweat = (x, y, s = 1) => shape(spline([[x, y - 16 * s], [x + 9 * s, y + 4 * s], [x, y + 12 * s], [x - 9 * s, y + 4 * s]]), { fill: '#bfe9ff', lw: 5 });
// florzinhas (estampa)
function flowers(x0, y0, w, h, col, step = 46, r = 6, seed = 1) {
  for (let y = y0; y < y0 + h; y += step) for (let x = x0 + ((y / step) % 2) * step / 2; x < x0 + w; x += step) {
    const jx = (hash(x * .3 + y * .7 + seed) - .5) * 14, jy = (hash(x * .9 + y * .2 + seed) - .5) * 14;
    for (let k = 0; k < 5; k++) { const a = k / 5 * TAU; fillOnly(ell(x + jx + Math.cos(a) * r, y + jy + Math.sin(a) * r, r * .7, r * .7, 8), col, { boil: .2 }); }
  }
}

// —— chinelo de dedo (vista 3/4, dir = lado da ponta) ——
function chinelo(fx, dir, skin) {
  push(); translate(fx, 0); scale(dir, 1);
  shape(spline([[-34, 3], [-38, -10], [-10, -16], [36, -16], [62, -8], [58, 4]]), { fill: PAL.flip, lw: 6, shade: () => fillOnly(rect(-60, -4, 140, 10), PAL.flipS, { boil: .2 }) });
  shape(spline([[-26, -10], [-24, -32], [6, -38], [40, -28], [50, -12], [44, -8]]), { fill: skin, lw: 6 });
  for (let k = 0; k < 3; k++) stroke(arc(30 + k * 7, -14, 4, 5, Math.PI * 1.1, Math.PI * 1.9, 5), 4);
  stroke([[-4, -12], [16, -30], [36, -14]], 13); stroke([[-4, -12], [16, -30], [36, -14]], 6, { line: PAL.strap });
  pop();
}

// —— 1. O SENHOR: calvo, bigodão escuro, óculos de leitura na ponta do nariz, sem camisa (com marca de regata),
//    barrigão, bermuda tactel azul, chinelo de dedo e relógio dourado ——
// P: { x, y, s, t, face, sit, armL, armR, mouth, look, lid, brow, tilt, paper: {open:bool} }
export function seu(P) {
  const sit = P.sit ?? false;
  push(); translate(P.x, P.y); scale((P.s ?? 1) * (P.face ?? 1), P.s ?? 1);
  const b = sit ? -262 : -206; // base da barriga
  // pernas finas + chinelos
  for (const sx of [-1, 1]) {
    const top = sit ? [sx * 64, -236] : [sx * 46, -150], ank = sit ? [sx * 70, -30] : [sx * 50, -30];
    shape(noodle(top, ank, 0, 36, 30), { fill: PAL.sSkin, lw: 7, shade: () => fillOnly(rect(sx > 0 ? ank[0] : -400, -300, sx > 0 ? 400 : 400 + ank[0] - 8, 300), PAL.sSkinS, { boil: .3, alpha: sx > 0 ? .7 : 0 }) });
    chinelo(ank[0], sx, PAL.sSkin);
  }
  // bermuda
  const shorts = sit
    ? spline([[-150, -306], [0, -312], [150, -306], [160, -240], [104, -214], [30, -228], [-30, -228], [-104, -214], [-160, -240]])
    : spline([[-126, -262], [0, -268], [126, -262], [130, -150], [80, -132], [10, -150], [-10, -150], [-80, -132], [-130, -150]]);
  shape(shorts, {
    fill: PAL.short, lw: 7, shade: () => {
      fillOnly(rect(60, -330, 200, 260), PAL.shortS, { boil: .3 });
      for (const sx of [-1, 1]) fillOnly(rect(sx * (sit ? 142 : 116) - 7, -330, 14, 260), PAL.strap, { boil: .3 });
    }
  });
  // braços
  const shB = [-110, b - 244], shF = [110, b - 244];
  const armB = P.armL || { h: [-30, 190], bend: -22 }, armF = P.armR || { h: [30, 190], bend: 22 };
  const drawArm = (sh, arm, watch) => {
    const hp = [sh[0] + arm.h[0], sh[1] + arm.h[1]];
    shape(noodle(sh, hp, arm.bend ?? 0, 46, 38), { fill: PAL.sSkin, lw: 7 });
    if (watch) { const w = [lerp(sh[0], hp[0], .84), lerp(sh[1], hp[1], .84)]; shape(ell(w[0], w[1], 24, 13, 16), { fill: PAL.gold, lw: 5, shade: () => fillOnly(ell(w[0] + 8, w[1] + 4, 14, 8, 10), PAL.goldS, { boil: .2 }) }); }
    hand(hp[0], hp[1] + 8, Math.atan2(arm.h[1], arm.h[0]) - .2, 24, PAL.sSkin, { fist: arm.fist });
  };
  if (!P.paper) drawArm(shB, armB, true);
  // tronco: barrigão com a marca de regata
  const torso = spline([[-100, b - 262], [0, b - 276], [100, b - 262], [134, b - 190], [160, b - 92], [148, b - 18], [92, b + 10], [0, b + 18], [-92, b + 10], [-148, b - 18], [-160, b - 92], [-134, b - 190]]);
  shape(torso, {
    fill: PAL.sSkin, lw: 7, shade: () => {
      fillOnly(spline([[-50, b - 296], [-34, b - 222], [0, b - 204], [34, b - 222], [50, b - 296], [84, b - 296], [76, b - 226], [96, b - 176], [150, b - 150], [176, b - 110], [176, b + 40], [-176, b + 40], [-176, b - 110], [-150, b - 150], [-96, b - 176], [-76, b - 226], [-84, b - 296]]), PAL.sTan, { boil: .4 });
      fillOnly(spline([[80, b - 250], [170, b - 150], [170, b + 30], [70, b + 30], [110, b - 120]]), '#7a3a12', { boil: .4, alpha: .2 });
      fillOnly(ell(-40, b - 150, 40, 18, 16), '#fff3e2', { boil: .3, alpha: .5 });
    }
  });
  // pelinhos do peito + umbigo + dobra da barriga
  for (const [cx, cy] of [[-30, b - 196], [-8, b - 186], [16, b - 194], [36, b - 182], [-4, b - 166]]) stroke(arc(cx, cy, 5, 6, Math.PI * .9, Math.PI * 2.2, 7), 4);
  stroke(arc(0, b - 54, 9, 6, Math.PI * .1, Math.PI * .9, 8), 5);
  stroke(arc(0, b - 34, 120, 26, Math.PI * .2, Math.PI * .8, 14), 5);
  // cabeça
  push(); translate(0, b - 272); rotate(P.tilt ?? 0);
  shape(spline([[-60, 10], [-50, -40], [50, -40], [60, 10]]), { fill: PAL.sSkin, lw: 7 }); // pescoço
  for (const sx of [-1, 1]) shape(ell(sx * 86, -78, 18, 26, 16), { fill: PAL.sSkin, lw: 6, shade: () => stroke(arc(sx * 88, -78, 8, 12, Math.PI * .6, Math.PI * 1.4, 6), 4) });
  shape(ell(0, -88, 86, 100, 50), {
    fill: PAL.sSkin, lw: 7, shade: () => {
      fillOnly(ell(60, -60, 44, 90, 30), PAL.sSkinS, { boil: .4 });
      fillOnly(ell(-28, -150, 28, 11, 14), '#ffe3c7', { boil: .3 }); fillOnly(ell(4, -164, 9, 5, 8), '#ffe3c7', { boil: .3 });
      fillOnly(ell(-46, -36, 16, 10, 10), PAL.sNose, { boil: .3, alpha: .5 }); fillOnly(ell(46, -36, 16, 10, 10), PAL.sNose, { boil: .3, alpha: .5 });
    }
  });
  // coroinha de cabelo grisalho dos lados
  for (const sx of [-1, 1]) shape(spline([[sx * 66, -132], [sx * 96, -124], [sx * 102, -96], [sx * 96, -60], [sx * 80, -74], [sx * 72, -104]]), { fill: PAL.sHair, lw: 6 });
  // sobrancelhas grossas pretas
  const br = P.brow ?? 0;
  shape(spline([[-64, -116 - br * 10], [-40, -128 - br * 12], [-14, -120 - br * 4], [-18, -110], [-60, -106 - br * 8]]), { fill: PAL.stache, lw: 5 });
  shape(spline([[64, -116 + br * 2], [40, -128 + br * 2], [14, -120 + br * 4], [18, -110], [60, -106 + br * 2]]), { fill: PAL.stache, lw: 5 });
  eye(-32, -88, 22, 24, { lid: P.lid ?? .35, look: P.look || [0, 0], skin: PAL.sSkin, closed: P.closed });
  eye(32, -88, 22, 24, { lid: P.lid ?? .35, look: P.look || [0, 0], skin: PAL.sSkin, closed: P.closed });
  // narigão
  shape(spline([[-4, -76], [22, -66], [30, -42], [14, -28], [-14, -30], [-24, -48]]), { fill: PAL.sNose, lw: 6 });
  // óculos de leitura meia-lua na ponta do nariz (ele olha por cima)
  for (const sx of [-1, 1]) shape([[sx * 8, -62], [sx * 50, -62], ...arc(sx * 29, -62, 21, 14, 0, Math.PI, 12)], { fill: '#e8f6ff', alpha: .9, lw: 5 });
  stroke([[-8, -64], [8, -64]], 5); stroke([[-50, -64], [-80, -78]], 4); stroke([[50, -64], [80, -78]], 4);
  // bigodão escovão
  shape(spline([[-70, -20], [-52, -42], [-20, -44], [0, -38], [20, -44], [52, -42], [70, -20], [52, -12], [24, -22], [0, -18], [-24, -22], [-52, -12]]), {
    fill: PAL.stache, lw: 6, shade: () => { fillOnly(ell(-40, -34, 16, 5, 8), PAL.stacheG, { boil: .3 }); fillOnly(ell(34, -36, 12, 4, 8), PAL.stacheG, { boil: .3 }); }
  });
  mouth(0, -8, 54, P.mouth || { o: .12, sm: .4 });
  stroke(arc(0, 6, 46, 26, Math.PI * .25, Math.PI * .75, 10), 4); // queixo duplo
  pop();
  if (P.paper) seguraJornal(b, P.t);
  else drawArm(shF, armF, false);
  pop();
}

// segurando o jornal aberto (plano geral): ombros à vista, braços atrás do papel, antebraços em pé pelas laterais,
// e do lado de cá do papel aparecem só os quatro dedos dobrados sobre a borda (o polegar fica do lado dele)
function seguraJornal(b, t) {
  const yH = b - 168;
  for (const sx of [-1, 1]) shape(noodle([sx * 110, b - 244], [sx * 318, b + 4], sx * 30, 46, 40), { fill: PAL.sSkin, lw: 7 });
  for (const sx of [-1, 1]) shape(noodle([sx * 326, b + 10], [sx * 322, yH + 20], 0, 42, 36), { fill: PAL.sSkin, lw: 7, shade: () => fillOnly(rect(sx > 0 ? 330 : -360, b - 300, 30, 360), PAL.sSkinS, { boil: .3, alpha: .6 }) });
  jornalAberto({ x: 0, y: b - 110, s: 1, t });
  for (const sx of [-1, 1]) {
    // costas da mão, por fora da borda
    shape(spline([[sx * 300, yH - 34], [sx * 330, yH - 40], [sx * 350, yH - 14], [sx * 348, yH + 24], [sx * 326, yH + 40], [sx * 302, yH + 34]]), { fill: PAL.sSkin, lw: 7, shade: () => fillOnly(ell(sx * 342, yH, 12, 40, 12), PAL.sSkinS, { boil: .3, alpha: .6 }) });
    // quatro dedos dobrados por cima da borda do papel
    for (let k = 0; k < 4; k++) {
      const fy = yH - 26 + k * 18, len = [30, 36, 34, 26][k];
      shape(rr(sx > 0 ? 300 - len : -300, fy - 8, len + 6, 17, 8), { fill: PAL.sSkin, lw: 5 });
      fillOnly(ell(sx * (300 - len + 7), fy, 4, 5, 8), '#e8b090', { boil: .2 });
    }
  }
  // relógio dourado no pulso esquerdo (dele), visível pela lateral
  const wx = -326, wy = yH + 74;
  stroke([[wx - 26, wy], [wx + 26, wy]], 24); stroke([[wx - 24, wy], [wx + 24, wy]], 13, { line: PAL.goldS });
  shape(ell(wx - 6, wy, 15, 15, 16), { fill: PAL.gold, lw: 5 }); shape(ell(wx - 6, wy, 8, 8, 12), { fill: '#fffbea', lw: 3 });
}

// jornal aberto segurado na frente da barriga (plano geral)
export function jornalAberto(P) {
  push(); translate(P.x, P.y); scale(P.s ?? 1);
  const w = 300, h = 210;
  shape(spline([[-w, -h * .55], [-w * .5, -h * .62], [0, -h * .52], [w * .5, -h * .62], [w, -h * .55], [w * 1.02, h * .5], [w * .5, h * .44], [0, h * .52], [-w * .5, h * .44], [-w * 1.02, h * .5]], true, 6), {
    fill: PAL.paper, lw: 7, shade: () => {
      fillOnly(rect(0, -200, 400, 400), PAL.paperS, { boil: .3 });
      fillOnly(rect(-w + 26, -h * .44, w - 52, 30), PAL.news, { boil: .3 });
      for (let c = 0; c < 2; c++) for (let k = 0; k < 6; k++) fillOnly(rect(-w + 26 + c * 136, -h * .44 + 50 + k * 22, 116, 8), '#9a9180', { boil: .2 });
      fillOnly(rect(28, -h * .44, w - 54, 90), '#b9ae95', { boil: .3 });
      for (let c = 0; c < 2; c++) for (let k = 0; k < 4; k++) fillOnly(rect(28 + c * 136, -h * .44 + 108 + k * 22, 116, 8), '#9a9180', { boil: .2 });
    }
  });
  stroke([[0, -h * .52], [0, h * .52]], 5);
  pop();
}

// —— 2. A ESPOSA: alta e magra, bobes coloridos no cabelo, vestido florido, avental amarelo, chinelo rosa, colher de pau ——
// P: { x, y, s, t, face, armL, armR, mouth, look, lid, brow, tilt, spoon }
export function esposa(P) {
  push(); translate(P.x, P.y); scale((P.s ?? 1) * (P.face ?? 1), P.s ?? 1);
  for (const sx of [-1, 1]) {
    shape(noodle([sx * 26, -200], [sx * 28, -26], 0, 26, 22), { fill: PAL.eSkin, lw: 7 });
    push(); translate(sx * 28, 0); scale(sx * .9, 1);
    shape(spline([[-26, 3], [-28, -12], [20, -20], [50, -10], [46, 3]]), { fill: PAL.eSlip, lw: 6 });
    shape(spline([[-20, -10], [-18, -30], [16, -34], [38, -16], [36, -8]]), { fill: PAL.eSkin, lw: 6 });
    stroke([[-10, -20], [26, -22]], 14); stroke([[-10, -20], [26, -22]], 7, { line: PAL.eSlip });
    pop();
  }
  const shB = [-58, -536], shF = [58, -536];
  const armB = P.armL || { h: [-34, 210], bend: -20 }, armF = P.armR || { h: [40, 200], bend: 24 };
  const drawArm = (sh, arm, spoon) => {
    const hp = [sh[0] + arm.h[0], sh[1] + arm.h[1]];
    shape(noodle(sh, hp, arm.bend ?? 0, 26, 22), { fill: PAL.eSkin, lw: 7 });
    shape(ell(sh[0] + arm.h[0] * .1, sh[1] + arm.h[1] * .12, 30, 28, 20), { fill: PAL.dress, lw: 6, shade: () => fillOnly(ell(sh[0] + 14, sh[1] + 20, 22, 18, 12), PAL.dressS, { boil: .3 }) }); // manguinha bufante
    if (spoon) { // colher de pau
      const a = arm.spoonA ?? -1.9;
      push(); translate(hp[0], hp[1] + 6); rotate(a);
      shape(rr(-6, -14, 180, 12, 6), { fill: PAL.wood, lw: 5 });
      shape(ell(196, -8, 30, 20, 18), { fill: PAL.wood, lw: 6, shade: () => fillOnly(ell(200, -4, 18, 10, 12), PAL.woodS, { boil: .3 }) });
      pop();
    }
    hand(hp[0], hp[1] + 6, Math.atan2(arm.h[1], arm.h[0]) - .2, 17, PAL.eSkin, { fist: arm.fist || spoon });
  };
  drawArm(shB, armB, false);
  // vestido em A
  shape(spline([[-58, -548], [0, -560], [58, -548], [70, -420], [104, -280], [124, -186], [60, -176], [0, -182], [-60, -176], [-124, -186], [-104, -280], [-70, -420]]), {
    fill: PAL.dress, lw: 7, shade: () => { flowers(-140, -560, 280, 400, PAL.flower, 44, 6, 3); fillOnly(spline([[30, -560], [80, -430], [130, -300], [140, -170], [70, -170], [60, -400]]), PAL.dressS, { boil: .4, alpha: .55 }); }
  });
  // avental amarelo com bolso e babado
  shape(spline([[-62, -420], [0, -414], [62, -420], [84, -300], [90, -226], [0, -218], [-90, -226], [-84, -300]]), {
    fill: PAL.apron, lw: 6, shade: () => { fillOnly(rect(30, -440, 120, 240), PAL.apronS, { boil: .3 }); for (let k = 0; k < 7; k++) fillOnly(ell(-84 + k * 28, -224, 16, 10, 10), '#fff1a8', { boil: .3 }); }
  });
  shape(rr(-44, -350, 70, 52, 10), { fill: PAL.apronS, lw: 5 });
  shape(rr(-70, -432, 140, 22, 10), { fill: PAL.apron, lw: 5 });
  // cabeça
  push(); translate(0, -560); rotate(P.tilt ?? 0);
  shape(spline([[-26, 10], [-22, -40], [22, -40], [26, 10]]), { fill: PAL.eSkin, lw: 7 }); // pescoço comprido
  // cabelo grisalho (volume atrás)
  shape(spline([[-84, -110], [-74, -168], [0, -196], [74, -168], [84, -110], [70, -70], [-70, -70]]), { fill: PAL.eHair, lw: 6, shade: () => fillOnly(ell(50, -120, 40, 60, 20), PAL.eHairS, { boil: .3 }) });
  shape(ell(0, -88, 62, 78, 44), { fill: PAL.eSkin, lw: 7, shade: () => { fillOnly(ell(44, -70, 34, 76, 24), PAL.eSkinS, { boil: .4 }); for (const sx of [-1, 1]) fillOnly(ell(sx * 34, -54, 14, 8, 10), PAL.blush, { boil: .3, alpha: .7 }); } });
  // franja enrolada
  shape(spline([[-60, -120], [-30, -150], [10, -156], [56, -138], [62, -112], [30, -128], [-10, -126], [-44, -110]]), { fill: PAL.eHair, lw: 6 });
  // bobes
  const cs = [[-62, -170, -.5], [-24, -194, -.15], [16, -196, .15], [54, -176, .5]];
  cs.forEach(([x, y, a], i) => { push(); translate(x, y); rotate(a); shape(rr(-20, -14, 40, 28, 12), { fill: PAL.curl[i], lw: 5 }); for (let k = -1; k <= 1; k++) stroke([[k * 10, -12], [k * 10, 12]], 3); pop(); });
  // argolas
  for (const sx of [-1, 1]) stroke(ell(sx * 64, -50, 10, 13, 14), 6, { line: PAL.gold });
  // sobrancelha arqueada (uma lá em cima: cética)
  const br = P.brow ?? .6;
  stroke(quad([-44, -120], [-28, -134 - br * 6], [-12, -122]), 7);
  stroke(quad([12, -124], [28, -136 - br * 16], [46, -128 - br * 4]), 7);
  eye(-26, -100, 17, 20, { lid: P.lid ?? .45, look: P.look || [0, 0], skin: PAL.eSkin, pupil: 4 });
  eye(26, -100, 17, 20, { lid: P.lid ?? .45, look: P.look || [0, 0], skin: PAL.eSkin, pupil: 4 });
  shape(spline([[-2, -88], [12, -66], [8, -56], [-6, -58]]), { fill: PAL.eSkinS, lw: 5 });
  mouth(0, -34, 26, { lip: PAL.lip, lw: 5, ...(P.mouth || { o: 0, sm: -.2, skew: .4 }) });
  pop();
  drawArm(shF, armF, P.spoon ?? true);
  pop();
}

// —— 3. O GATO MAGRICELO: cinza rajado, costelas à mostra, orelha dobrada, rabo com dobra, olhão de aprontar ——
// P: { x, y, s, t, face, arch (0..1), look, lid, mouth, tail }
export function gato(P) {
  const t = P.t ?? 0, arch = P.arch ?? .3;
  push(); translate(P.x, P.y); scale((P.s ?? 1) * (P.face ?? 1), P.s ?? 1);
  const hip = [-120, -150 - arch * 30], sho = [70, -160 - arch * 10];
  // rabo comprido com dobra na ponta
  const tw = Math.sin(t * TAU * .5) * 14;
  tube(spline([[hip[0] + 10, hip[1]], [-200, -230], [-214 + tw, -320], [-186 + tw, -350], [-160 + tw, -336]], false, 8), 16, PAL.cat);
  // pernas de trás (fundo)
  const leg = (a, b, w, col, bend = 0) => { shape(noodle(a, b, bend, w, w * .8), { fill: col, lw: 6 }); shape(ell(b[0] + 8, b[1] - 6, 18, 10, 12), { fill: col, lw: 5 }); };
  leg([hip[0] + 20, hip[1] + 20], [-104, -6], 17, PAL.catS, 34);
  leg([sho[0] - 20, sho[1] + 20], [80, -6], 17, PAL.catS, -6);
  // corpo magrelo arqueado
  const mid = [(hip[0] + sho[0]) / 2, Math.min(hip[1], sho[1]) - 40 - arch * 50];
  shape(spline([[hip[0] - 26, hip[1] + 8], [hip[0] - 10, hip[1] - 34], [mid[0], mid[1] - 14], [sho[0] + 20, sho[1] - 34], [sho[0] + 34, sho[1] + 6], [sho[0] - 6, sho[1] + 34], [mid[0], mid[1] + 70 + arch * 10], [hip[0] + 10, hip[1] + 34]]), {
    fill: PAL.cat, lw: 7, shade: () => {
      for (let k = 0; k < 4; k++) fillOnly(spline([[-150 + k * 50, -400], [-130 + k * 50, -400], [-122 + k * 50, mid[1] + 10], [-140 + k * 50, mid[1] + 6]]), PAL.catStripe, { boil: .3 });
      fillOnly(ell(mid[0], mid[1] + 70, 120, 26, 20), PAL.catBelly, { boil: .3 });
    }
  });
  for (let k = 0; k < 3; k++) stroke(arc(mid[0] - 10 + k * 22, mid[1] + 34, 14, 22, Math.PI * .7, Math.PI * 1.3, 6), 4); // costelas
  leg([hip[0] - 4, hip[1] + 24], [-138, -4], 18, PAL.cat, 38);
  leg([sho[0] + 4, sho[1] + 24], [104, -4], 18, PAL.cat, -6);
  // cabeça grande
  push(); translate(sho[0] + 40, sho[1] - 60); rotate(P.tilt ?? -.08);
  // orelhas (a da direita dobrada)
  shape(spline([[-58, -40], [-62, -108], [-16, -64]]), { fill: PAL.cat, lw: 6, shade: () => fillOnly([[-52, -50], [-56, -94], [-26, -62]], PAL.catPink, { boil: .3 }) });
  shape(spline([[16, -64], [52, -102], [78, -96], [62, -44]]), { fill: PAL.cat, lw: 6, shade: () => fillOnly([[28, -64], [56, -90], [60, -54]], PAL.catPink, { boil: .3 }) });
  stroke([[56, -100], [66, -74]], 5);
  shape(spline([[-72, -20], [-56, -64], [0, -76], [56, -64], [74, -20], [56, 26], [0, 38], [-56, 26]]), {
    fill: PAL.cat, lw: 7, shade: () => { for (let k = -1; k <= 1; k++) fillOnly(rect(k * 18 - 5, -90, 10, 34), PAL.catStripe, { boil: .3 }); fillOnly(ell(4, 18, 40, 22, 16), PAL.catBelly, { boil: .3 }); }
  });
  eye(-24, -22, 22, 25, { lid: P.lid ?? .2, look: P.look || [.5, -.2], skin: PAL.cat, pupil: 4 });
  eye(26, -22, 22, 25, { lid: P.lid ?? .2, look: P.look || [.5, -.2], skin: PAL.cat, pupil: 4 });
  shape(spline([[-8, 4], [8, 4], [0, 14]]), { fill: PAL.catPink, lw: 4 });
  mouth(0, 20, 26, P.mouth || { o: 0, sm: .8, skew: -.4, lw: 5 });
  for (const sx of [-1, 1]) for (let k = 0; k < 3; k++) stroke([[sx * 22, 10 + k * 6], [sx * 74, 2 + k * 12]], 3);
  pop();
  pop();
}

// —— 4. O PAPAGAIO: verde, testa azul, cara amarela, ombro vermelho, bico curvo que abre pra gritar ——
// P: { x, y, s, t, face, beak (0..1 aberto), look, lid, wing (0..1 aberta), bob }
export function papagaio(P) {
  const t = P.t ?? 0, bk = P.beak ?? 0, wing = P.wing ?? 0;
  push(); translate(P.x, P.y); scale((P.s ?? 1) * (P.face ?? 1), P.s ?? 1);
  // cauda comprida pendurada atrás da poleira
  shape(spline([[-40, -50], [-6, -46], [-2, 60], [-22, 130], [-46, 64]]), { fill: PAL.pGreen, lw: 6, shade: () => { fillOnly(rect(-70, 70, 90, 80), PAL.pBlue, { boil: .3 }); fillOnly(rect(-70, 40, 90, 30), PAL.pRed, { boil: .3, alpha: .8 }); } });
  // asa aberta (atrás do corpo) quando grita
  if (wing > 0) { push(); translate(-30, -170); rotate(-.2 - wing * 1.1);
    shape(spline([[0, -10], [-60, -40], [-170, -30], [-200, 0], [-150, 20], [-170, 40], [-110, 44], [-20, 40]]), { fill: PAL.pGreen, lw: 6, shade: () => { fillOnly(rect(-220, -60, 70, 120), PAL.pBlue, { boil: .3 }); fillOnly(ell(-20, 0, 34, 24, 14), PAL.pRed, { boil: .3 }); } });
    pop(); }
  // corpo
  shape(spline([[0, -232], [50, -210], [64, -140], [52, -70], [24, -24], [-10, -18], [-44, -50], [-60, -120], [-52, -196]]), {
    fill: PAL.pGreen, lw: 7, shade: () => { fillOnly(ell(36, -100, 30, 90, 20), PAL.pGreenS, { boil: .4, alpha: .6 }); for (let k = 0; k < 4; k++) stroke(arc(4, -170 + k * 30, 16, 8, Math.PI * .2, Math.PI * .8, 6), 3, { line: PAL.pGreenS }); }
  });
  // asa dobrada (de frente) com ombro vermelho e pontas azuis
  shape(spline([[-58, -190], [-20, -196], [-6, -150], [-14, -70], [-34, -24], [-62, -60], [-70, -130]]), {
    fill: PAL.pGreenS, lw: 6, shade: () => { fillOnly(ell(-36, -186, 30, 18, 14), PAL.pRed, { boil: .3 }); fillOnly(rect(-90, -76, 100, 70), PAL.pBlue, { boil: .3 }); for (let k = 0; k < 3; k++) stroke([[-52 + k * 14, -130], [-48 + k * 14, -40]], 3); }
  });
  // cabeça redonda: testa azul, cara amarela
  push(); translate(10, -262 + (P.bob ?? 0)); rotate(P.tilt ?? 0);
  shape(ell(0, 0, 58, 54, 36), { fill: PAL.pGreen, lw: 7, shade: () => {
    fillOnly(spline([[-40, -40], [0, -58], [40, -44], [30, -24], [-10, -26], [-44, -20]]), PAL.pBlue, { boil: .3 });
    fillOnly(spline([[-6, -24], [40, -26], [62, 4], [50, 34], [10, 30], [-10, 6]]), PAL.pYellow, { boil: .3 });
    fillOnly(ell(-30, 22, 26, 20, 14), PAL.pGreenS, { boil: .3, alpha: .5 });
  } });
  eye(16, -6, 15, 16, { lid: P.lid ?? .1, look: P.look || [.4, 0], skin: PAL.pYellow, pupil: 4.5 });
  stroke(ell(16, -6, 20, 21, 20), 4, { line: '#f4f1ea' });
  // bico curvo: a mandíbula de baixo abre pra gritar
  push(); translate(50, 18); rotate(bk * .6);
  shape(spline([[-6, -2], [24, 2], [32, 12], [12, 22], [-8, 14]]), { fill: PAL.beakS, lw: 6 });
  pop();
  if (bk > .1) fillOnly(ell(56, 22, 10, 6 + bk * 6, 10), PAL.tongue, { boil: .2 });
  shape(spline([[38, -16], [70, -20], [92, 0], [92, 30], [80, 44], [76, 22], [58, 16], [40, 16]]), { fill: PAL.beak, lw: 6, shade: () => fillOnly(ell(64, -8, 14, 6, 10), '#7a7480', { boil: .2 }) });
  dot(68, -4, 3);
  pop();
  // pés agarrados
  for (const sx of [-1, 1]) { shape(ell(sx * 18, -6, 16, 10, 12), { fill: PAL.claw, lw: 5 }); for (let k = 0; k < 2; k++) stroke(arc(sx * 18 + (k - .5) * 14, 2, 5, 8, 0, Math.PI, 6), 4); }
  pop();
}

// poleiro de madeira em pé (com potinho de água)
export function poleiro(P) {
  push(); translate(P.x, P.y); scale(P.s ?? 1);
  const h = P.h ?? 460;
  shape(rr(-80, -16, 160, 18, 8), { fill: PAL.wood, lw: 6 });
  shape(rr(-70, -12, 18, 10, 4), { fill: PAL.woodS, lw: 4 });
  shape(rr(-8, -h, 16, h, 6), { fill: PAL.wood, lw: 6, shade: () => fillOnly(rect(2, -h, 8, h), PAL.woodS, { boil: .2 }) });
  shape(rr(-110, -h - 14, 220, 18, 9), { fill: PAL.wood, lw: 6, shade: () => fillOnly(rect(-110, -h - 4, 220, 8), PAL.woodS, { boil: .2 }) });
  shape(spline([[70, -h - 4], [100, -h - 4], [96, -h + 26], [74, -h + 26]]), { fill: PAL.steel, lw: 5, shade: () => fillOnly(rect(70, -h - 4, 34, 10), '#9ad4e8', { boil: .2 }) });
  pop();
}

// —— OBJETOS DE CENA ——
// poltrona de veludo vinho com paninho de crochê; part: 'back' (atrás de quem senta) | 'front' (braços e assento)
export function poltrona(P, part = 'all') {
  push(); translate(P.x, P.y); scale(P.s ?? 1);
  if (part !== 'front') {
    shape(spline([[-230, -330], [-240, -560], [-170, -680], [0, -700], [170, -680], [240, -560], [230, -330]]), {
      fill: PAL.chair, lw: 7, shade: () => {
        fillOnly(ell(150, -500, 90, 220, 20), PAL.chairS, { boil: .3 });
        for (const x of [-120, 0, 120]) for (const y of [-600, -480]) dot(x, y, 6, PAL.chairS);
      }
    });
    // paninho de crochê no encosto (bordas em leque)
    const dp = []; for (let i = 0; i <= 10; i++) { const x = lerp(-110, 110, i / 10); dp.push([x, -640 + (i % 2 ? 22 : 10)]); }
    shape([[-110, -706], [110, -706], ...dp.reverse()], { fill: PAL.doily, lw: 5, shade: () => { for (let i = 0; i < 6; i++) stroke(ell(-80 + i * 32, -672, 8, 8, 10), 3, { line: '#d9cdb0' }); } });
  }
  if (part !== 'back') {
    // assento
    shape(rr(-210, -300, 420, 110, 30), { fill: PAL.chair, lw: 7, shade: () => fillOnly(rect(-210, -220, 420, 40), PAL.chairS, { boil: .3 }) });
    // braços estofados
    for (const sx of [-1, 1]) {
      shape(spline([[sx * 190, -420], [sx * 250, -440], [sx * 290, -410], [sx * 280, -180], [sx * 200, -170]].map(p => p)), { fill: PAL.chair, lw: 7, shade: () => fillOnly(rect(sx > 0 ? 250 : -300, -440, 50, 280), PAL.chairS, { boil: .3 }) });
      shape(ell(sx * 244, -420, 48, 22, 20), { fill: PAL.chair, lw: 6, shade: () => fillOnly(ell(sx * 244, -416, 30, 10, 14), PAL.chairS, { boil: .3, alpha: .6 }) });
    }
    // base e pezinhos de madeira
    shape(rr(-280, -190, 560, 110, 16), { fill: PAL.chair, lw: 7, shade: () => fillOnly(rect(-280, -110, 560, 40), PAL.chairS, { boil: .3 }) });
    for (const sx of [-1, 1]) shape(spline([[sx * 250 - 18, -84], [sx * 250 + 18, -84], [sx * 252 + 8, 0], [sx * 252 - 8, 0]]), { fill: PAL.woodD, lw: 6 });
  }
  pop();
}

// mesinha redonda com toalhinha
export function mesinha(P) {
  push(); translate(P.x, P.y); scale(P.s ?? 1);
  for (const sx of [-1, 0, 1]) shape(spline([[sx * 60 - 8, -330], [sx * 60 + 8, -330], [sx * 80 + 6, 0], [sx * 80 - 6, 0]]), { fill: sx ? PAL.woodS : PAL.wood, lw: 6 });
  shape(ell(0, -330, 130, 28, 30), { fill: PAL.wood, lw: 7, shade: () => fillOnly(ell(30, -324, 120, 20, 20), PAL.woodS, { boil: .2 }) });
  const sc = []; for (let i = 0; i <= 12; i++) { const a = lerp(Math.PI * .02, Math.PI * .98, i / 12); sc.push([Math.cos(a) * 112, -326 + Math.sin(a) * 24 + (i % 2 ? 26 : 12)]); }
  shape([...arc(0, -332, 112, 20, Math.PI, TAU, 14), ...sc], { fill: PAL.doily, lw: 5 });
  pop();
}

// garrafa térmica de bomba (vermelha florida)
export function garrafa(P) {
  push(); translate(P.x, P.y); scale(P.s ?? 1);
  shape(spline([[-50, 0], [-54, -40], [-54, -200], [-46, -224], [46, -224], [54, -200], [54, -40], [50, 0]], true, 4), {
    fill: PAL.thermos, lw: 7, shade: () => { flowers(-70, -210, 140, 200, '#ffffff', 40, 6, 9); fillOnly(rect(22, -240, 40, 260), PAL.thermosS, { boil: .3 }); fillOnly(rect(-40, -200, 10, 170), '#ff8a80', { boil: .2 }); }
  });
  shape(rr(-58, -20, 116, 22, 8), { fill: PAL.steel, lw: 6 });
  shape(spline([[-48, -224], [-40, -262], [40, -262], [48, -224]]), { fill: PAL.steel, lw: 6, shade: () => fillOnly(rect(16, -270, 40, 50), PAL.steelS, { boil: .2 }) });
  shape(rr(-20, -282, 40, 24, 8), { fill: PAL.thermos, lw: 5 }); // botão da bomba
  shape(spline([[40, -250], [76, -258], [84, -246], [46, -236]]), { fill: PAL.steel, lw: 5 }); // bico
  stroke(spline([[-54, -190], [-90, -170], [-92, -80], [-54, -60]], false, 8), 8); stroke(spline([[-54, -190], [-90, -170], [-92, -80], [-54, -60]], false, 8), 3, { line: PAL.thermosS });
  pop();
}

// xícara com pires e fumacinha
export function xicara(P) {
  const t = P.t ?? 0;
  push(); translate(P.x, P.y); scale(P.s ?? 1); rotate(P.rot ?? 0);
  shape(ell(0, -6, 64, 14, 24), { fill: PAL.cup, lw: 6, shade: () => fillOnly(ell(10, -2, 56, 8, 18), PAL.cupS, { boil: .2 }) });
  stroke(spline([[40, -70], [70, -70], [70, -36], [38, -30]], false, 8), 9); stroke(spline([[40, -70], [70, -70], [70, -36], [38, -30]], false, 8), 3, { line: PAL.cup });
  shape(spline([[-44, -80], [44, -80], [38, -30], [22, -12], [-22, -12], [-38, -30]]), { fill: PAL.cup, lw: 6, shade: () => { fillOnly(rect(-50, -70, 100, 10), PAL.cupBand, { boil: .2 }); fillOnly(rect(16, -90, 40, 90), PAL.cupS, { boil: .2 }); } });
  shape(ell(0, -80, 44, 10, 20), { fill: PAL.coffee, lw: 6 });
  if (P.steam !== false) for (let k = 0; k < 2; k++) {
    const ph = t * 1.4 + k * .5, y0 = -100, a = (ph % 1);
    stroke(spline([[k * 22 - 10, y0], [k * 22 - 22 + Math.sin(ph * 6) * 6, y0 - 30], [k * 22 - 4, y0 - 60], [k * 22 - 16 + Math.sin(ph * 6 + 1) * 6, y0 - 90]], false, 6), 5, { line: '#ffffff', alpha: .9 - a * .5 });
  }
  pop();
}

// —— CENÁRIO: sala de casa simples do interior, fim de tarde, com a cozinha ao fundo pela porta em arco ——
// sala(P, { kitchen: fn }) desenha a parede, janela, relógio, calendário, a cozinha (e chama kitchen() pra pôr quem está lá) e o piso.
export const SET = { floorY: 1350, door: { x0: 600, x1: 1000, top: 560 }, kFloor: 1262 };
export function sala(P = {}, hooks = {}) {
  const t = P.t ?? 0, D = SET.door, F = SET.floorY;
  // parede: verde-água em cima, barra pintada embaixo
  fillOnly(rect(-40, -40, 1160, 1060), PAL.wallT, { boil: 0 });
  fillOnly(rect(-40, 1000, 1160, F - 1000), PAL.wallB, { boil: 0 });
  stroke([[-40, 1000], [1120, 1000]], 6);
  // cozinha (atrás da porta em arco)
  const archPts = [[D.x0, F], [D.x0, D.top + 100], ...arc((D.x0 + D.x1) / 2, D.top + 100, (D.x1 - D.x0) / 2, 100, Math.PI, TAU, 18), [D.x1, F]];
  const arch = shape(archPts, {
    fill: PAL.kWall, lw: 0, stroke: false, shade: () => {
      fillOnly(rect(D.x0, 1010, D.x1 - D.x0, SET.kFloor - 1010), PAL.kTile, { boil: 0 });
      for (let x = D.x0; x < D.x1; x += 42) for (let y = 1010; y < SET.kFloor; y += 42) { stroke(rect(x, y, 42, 42).concat([[x, y]]), 2, { line: '#cfd9de', boil: 0 }); if ((x / 42 + y / 42) % 2 < 1) fillOnly(ell(x + 21, y + 21, 7, 7, 8), PAL.kTileB, { boil: .2 }); }
      fillOnly(rect(D.x0, SET.kFloor, D.x1 - D.x0, F - SET.kFloor), PAL.kFloor, { boil: 0 });
      for (let x = D.x0; x < D.x1; x += 50) for (let r = 0; r < 2; r++) if (((x - D.x0) / 50 + r) % 2 < 1) fillOnly(rect(x, SET.kFloor + r * 44, 50, 44), PAL.kFloorB, { boil: 0 });
      // prateleira com filtro de barro
      shape(rr(D.x0 + 10, 930, 150, 16, 6), { fill: PAL.wood, lw: 5 });
      filtro({ x: D.x0 + 85, y: 930, s: .62 });
      // janelinha da cozinha com o céu do entardecer
      shape(rr(D.x0 + 200, 740, 150, 150, 8), { fill: PAL.sun2, lw: 6, shade: () => { fillOnly(rect(D.x0 + 200, 815, 150, 80), PAL.sun3, { boil: 0 }); } });
      stroke([[D.x0 + 275, 740], [D.x0 + 275, 890]], 6); stroke([[D.x0 + 200, 815], [D.x0 + 350, 815]], 6);
      // fogão de 4 bocas com panela fumegando
      fogao({ x: D.x0 + 330, y: SET.kFloor + 20, s: .8, t });
      if (hooks.kitchen) hooks.kitchen();
    }
  });
  // batente da porta
  const jamb = [[D.x0 - 22, F], [D.x0 - 22, D.top + 100], ...arc((D.x0 + D.x1) / 2, D.top + 100, (D.x1 - D.x0) / 2 + 22, 122, Math.PI, TAU, 18), [D.x1 + 22, F]];
  stroke(jamb, 22, { line: PAL.wood }); stroke(jamb, 6); stroke(archPts, 6);
  // janela da sala com o pôr do sol + cortina de chita
  janelaSala({ x: 70, y: 380, w: 330, h: 420, t });
  // relógio de parede: 18h10
  shape(ell(510, 330, 64, 64, 40), { fill: PAL.wood, lw: 7 });
  shape(ell(510, 330, 50, 50, 36), { fill: '#fffbea', lw: 5 });
  for (let k = 0; k < 12; k++) { const a = k / 12 * TAU; dot(510 + Math.cos(a) * 40, 330 + Math.sin(a) * 40, 3); }
  stroke([[510, 330], [510 + Math.cos(-Math.PI / 2 + TAU * (6 + 10 / 60) / 12) * 26, 330 + Math.sin(-Math.PI / 2 + TAU * (6 + 10 / 60) / 12) * 26]], 7);
  stroke([[510, 330], [510 + Math.cos(-Math.PI / 2 + TAU * 10 / 60) * 38, 330 + Math.sin(-Math.PI / 2 + TAU * 10 / 60) * 38]], 5);
  // calendário de parede do armazém (fictício)
  shape(rr(440, 520, 140, 200, 6), { fill: '#fffdf4', lw: 6, shade: () => { fillOnly(rect(440, 520, 140, 90), '#ffd23f', { boil: 0 }); fillOnly(rect(440, 610, 140, 22), PAL.pRed, { boil: 0 }); for (let r = 0; r < 4; r++) for (let c = 0; c < 6; c++) fillOnly(rect(452 + c * 21, 644 + r * 18, 12, 8), '#9a9180', { boil: 0 }); } });
  vaquinha(510, 580, .5);
  text('NOV', 510, 622, { font: '700 18px "Baloo 2"', fill: '#ffffff' });
  stroke([[510, 500], [470, 520]], 3); stroke([[510, 500], [550, 520]], 3); dot(510, 500, 5);
  // rodapé + piso de vermelhão em perspectiva
  fillOnly(rect(-40, F, 1160, 640), PAL.floor, { boil: 0 });
  shape(rect(-40, F - 16, D.x0 - 22 + 40, 16), { fill: PAL.woodS, lw: 5 }); shape(rect(D.x1 + 22, F - 16, 200, 16), { fill: PAL.woodS, lw: 5 });
  stroke([[-40, F], [1120, F]], 6);
  for (let k = -8; k <= 8; k++) stroke([[540 + k * 70, F], [540 + k * 230, 1960]], 3, { line: PAL.grout, boil: .4 });
  for (const y of [1400, 1470, 1570, 1710, 1900]) stroke([[-40, y], [1120, y]], 3, { line: PAL.grout, boil: .4 });
  // tapete de barbante redondo
  for (let k = 0; k < 4; k++) shape(ell(470, 1790, 470 - k * 80, 90 - k * 16, 60), { fill: PAL.rug[k], lw: 5, boil: .5 });
}
function janelaSala({ x, y, w, h, t }) {
  shape(rect(x, y, w, h), { fill: PAL.sun1, lw: 7, shade: () => {
    const cols = [PAL.sun4, PAL.sun3, PAL.sun2, PAL.sun1];
    cols.forEach((c, i) => fillOnly(rect(x, y + i * h * .16, w, h * .16 + 1), c, { boil: 0 }));
    shape(ell(x + w * .62, y + h * .72, 70, 70, 36), { fill: PAL.sunD, lw: 5 });
    fillOnly(spline([[x - 10, y + h * .82], [x + w * .3, y + h * .74], [x + w * .6, y + h * .8], [x + w + 10, y + h * .72], [x + w + 10, y + h + 10], [x - 10, y + h + 10]]), '#6c4a7a', { boil: .4 }); // morro
    for (const [px, ph] of [[.2, 50], [.32, 70], [.85, 60]]) { stroke([[x + w * px, y + h * .8], [x + w * px, y + h * .8 - ph]], 5); shape(ell(x + w * px, y + h * .8 - ph - 16, 22, 18, 14), { fill: '#4a3260', lw: 5 }); } // arvorezinhas
  } });
  stroke([[x + w / 2, y], [x + w / 2, y + h]], 8); stroke([[x, y + h * .5], [x + w, y + h * .5]], 8);
  shape(rect(x - 20, y + h, w + 40, 22), { fill: PAL.wood, lw: 6 });
  // cortina de chita (laranja com flores) amarrada
  for (const sx of [0, 1]) {
    const cx = sx ? x + w + 10 : x - 10, d = sx ? -1 : 1;
    shape(spline([[cx - d * 30, y - 30], [cx + d * 60, y - 30], [cx + d * 30, y + h * .45], [cx + d * 50, y + h + 40], [cx - d * 30, y + h + 40], [cx - d * 20, y + h * .45]]), {
      fill: PAL.chita, lw: 6, shade: () => { flowers(cx - 80, y - 40, 160, h + 90, PAL.chitaF, 38, 7, sx * 5); fillOnly(rect(cx - 6, y - 40, 14, h + 100), PAL.chitaS, { boil: .3 }); }
    });
    shape(ell(cx + d * 22, y + h * .45, 20, 12, 12), { fill: PAL.chitaL, lw: 5 });
  }
  shape(rr(x - 70, y - 44, w + 140, 18, 9), { fill: PAL.woodS, lw: 6 });
}
function vaquinha(x, y, s) { push(); translate(x, y); scale(s);
  shape(rr(-50, -30, 100, 56, 24), { fill: '#ffffff', lw: 5, shade: () => { fillOnly(ell(-20, -10, 16, 12, 12), INK, { boil: .3 }); fillOnly(ell(26, 8, 12, 10, 12), INK, { boil: .3 }); } });
  shape(ell(56, -26, 26, 22, 16), { fill: '#ffffff', lw: 5 }); shape(ell(66, -16, 14, 9, 10), { fill: PAL.catPink, lw: 4 });
  for (const lx of [-34, -12, 18, 38]) stroke([[lx, 24], [lx, 48]], 7);
  pop(); }
function filtro({ x, y, s }) { push(); translate(x, y); scale(s);
  shape(spline([[-60, 0], [-64, -100], [-56, -150], [56, -150], [64, -100], [60, 0]]), { fill: PAL.clay, lw: 6, shade: () => { fillOnly(rect(20, -160, 60, 170), PAL.clayS, { boil: .3 }); stroke([[-64, -100], [64, -100]], 4); } });
  shape(spline([[-56, -150], [-48, -220], [0, -236], [48, -220], [56, -150]]), { fill: PAL.clay, lw: 6, shade: () => fillOnly(rect(20, -240, 60, 100), PAL.clayS, { boil: .3 }) });
  shape(ell(0, -238, 16, 8, 10), { fill: PAL.clayS, lw: 5 });
  shape(rr(52, -40, 26, 14, 4), { fill: PAL.steel, lw: 4 });
  pop(); }
function fogao({ x, y, s, t }) { push(); translate(x, y); scale(s);
  shape(rr(-120, -260, 260, 260, 10), { fill: '#fbfaf3', lw: 7, shade: () => { fillOnly(rect(80, -270, 70, 280), '#dcdcd4', { boil: .2 }); shape(rr(-90, -170, 200, 130, 10), { fill: '#3a3a44', lw: 5 }); for (let k = 0; k < 4; k++) shape(ell(-80 + k * 56, -226, 14, 14, 12), { fill: '#3a3a44', lw: 4 }); } });
  shape(rr(-130, -290, 280, 34, 8), { fill: '#e6e6de', lw: 6 });
  // panela com tampa e vapor
  shape(spline([[-80, -290], [-84, -380], [40, -380], [36, -290]]), { fill: PAL.steel, lw: 6, shade: () => fillOnly(rect(10, -400, 40, 120), PAL.steelS, { boil: .2 }) });
  shape(ell(-22, -384, 70, 14, 20), { fill: PAL.steelS, lw: 6 }); shape(rr(-34, -406, 24, 18, 6), { fill: '#3a3a44', lw: 4 });
  for (const sx of [-1, 1]) shape(rr(sx > 0 ? 34 : -104, -360, 26, 14, 6), { fill: '#3a3a44', lw: 4 });
  for (let k = 0; k < 3; k++) { const ph = t * 1.2 + k * .33, a = ph % 1; stroke(spline([[-60 + k * 36, -420], [-72 + k * 36 + Math.sin(ph * 5) * 8, -460], [-56 + k * 36, -500], [-66 + k * 36, -530]], false, 6), 5, { line: '#ffffff', alpha: .9 - a * .6 }); }
  pop(); }

// —— CLOSE EM PRIMEIRA PESSOA: as mãos dele segurando o jornal com a notícia (momento da credibilidade) ——
// P: { t, masthead, date, kicker, headline:[linhas], resumo:[linhas], fonte:[linhas], clip: fn opcional (recorte de print) }
export function jornalClose(P) {
  const t = P.t ?? 0, sway = Math.sin(t * TAU * .25) * 6;
  push(); translate(540 + sway, 980); rotate(Math.sin(t * TAU * .2) * .01);
  const W2 = 420, H2 = 760;
  // página
  shape([[-W2, -H2], [W2, -H2 + 10], [W2 + 10, H2], [-W2 - 6, H2 - 8]], { fill: PAL.paper, lw: 7, shade: () => {
    fillOnly(rect(W2 - 60, -H2, 80, H2 * 2), PAL.paperS, { boil: .2 });
    stroke([[-W2 + 30, -H2 + 150], [W2 - 30, -H2 + 150]], 6, { line: PAL.news }); stroke([[-W2 + 30, -H2 + 196], [W2 - 30, -H2 + 196]], 3, { line: PAL.news });
  } });
  text(P.masthead ?? 'O NOTICIÃO', 0, -H2 + 82, { font: '92px "Titan One"', fill: PAL.news });
  text(P.date ?? 'SEGUNDA-FEIRA, 9 DE NOVEMBRO DE 2026', 0, -H2 + 174, { font: '700 26px "Baloo 2"', fill: PAL.news });
  if (P.kicker) { shape(rr(-W2 + 34, -H2 + 222, 260, 44, 8), { fill: PAL.pRed, lw: 5 }); text(P.kicker, -W2 + 164, -H2 + 245, { font: '800 28px "Baloo 2"', fill: '#ffffff' }); }
  const hl = P.headline ?? ['A MANCHETE REAL', 'DA NOTÍCIA ENTRA', 'AQUI, BEM GRANDE'];
  hl.forEach((l, i) => text(l, -W2 + 36, -H2 + 330 + i * 86, { font: '68px "Bungee"', fill: PAL.news, align: 'left' }));
  const y0 = -H2 + 330 + hl.length * 86 + 10;
  // ilustração nossa (nunca a foto da matéria)
  if (P.clip) P.clip(-W2 + 36, y0, 380, 300);
  else shape(rr(-W2 + 36, y0, 380, 300, 8), { fill: '#e9e0c8', lw: 5, shade: () => { stroke([[-W2 + 36, y0], [-W2 + 416, y0 + 300]], 3, { line: '#b9ae95' }); stroke([[-W2 + 416, y0], [-W2 + 36, y0 + 300]], 3, { line: '#b9ae95' }); } });
  if (!P.clip) text('ilustração', -W2 + 226, y0 + 150, { font: '700 30px "Baloo 2"', fill: '#8a8070' });
  const rs = P.resumo ?? ['Resumo curto,', 'com as minhas', 'palavras: o que', 'aconteceu, onde', 'e por quê.'];
  rs.forEach((l, i) => text(l, -W2 + 446, y0 + 22 + i * 46, { font: '600 34px "Baloo 2"', fill: PAL.news, align: 'left' }));
  // selo de fonte, bem legível
  const fy = y0 + 340;
  shape(rr(-W2 + 36, fy, W2 * 2 - 72, 150, 14), { fill: '#fff6c2', lw: 6, shade: () => fillOnly(rect(-W2 + 36, fy, 22, 150), PAL.pRed, { boil: 0 }) });
  const fo = P.fonte ?? ['FONTE: Nome do Veículo · 09/11/2026', 'siteoriginal.com.br/caminho-da-materia'];
  text(fo[0], -W2 + 74, fy + 50, { font: '800 34px "Baloo 2"', fill: PAL.news, align: 'left' });
  text(fo[1], -W2 + 74, fy + 104, { font: '600 30px "Baloo 2"', fill: '#4a4458', align: 'left' });
  // resto da página: outras notas (só linhas, ilegíveis de propósito)
  stroke([[-W2 + 36, fy + 184], [W2 - 36, fy + 184]], 3, { line: PAL.news });
  const cw = (W2 * 2 - 72 + 28) / 3;
  for (let c = 0; c < 3; c++) {
    fillOnly(rect(-W2 + 36 + c * cw, fy + 210, cw * .7, 22), '#6e6676', { boil: .2 });
    for (let k = 0; k < 7; k++) fillOnly(rect(-W2 + 36 + c * cw, fy + 254 + k * 30, k === 6 ? cw * .55 : cw - 28, 10), '#a39a88', { boil: .2 });
  }
  pop();
  // mãos dele segurando as laterais, vistas do lado de quem lê: polegar por cima do papel, dedos por trás,
  // a lateral da mão e do indicador por fora da borda. Relógio dourado no pulso esquerdo. Longe do selo de fonte.
  for (const sx of [-1, 1]) {
    push(); translate(540 + sway + sx * (W2 + 6), 980 + 560); scale(sx, 1);
    // antebraço
    shape(noodle([200, 560], [56, 70], -16, 128, 104), { fill: PAL.sSkin, lw: 7, shade: () => fillOnly(rect(120, -100, 300, 800), PAL.sSkinS, { boil: .3, alpha: .55 }) });
    if (sx < 0) {
      const c = [96, 240], px = .956, py = -.293;
      stroke([[c[0] - px * 66, c[1] - py * 66], [c[0] + px * 66, c[1] + py * 66]], 42);
      stroke([[c[0] - px * 62, c[1] - py * 62], [c[0] + px * 62, c[1] + py * 62]], 30, { line: PAL.goldS });
      shape(ell(c[0], c[1], 38, 38, 28), { fill: PAL.gold, lw: 6 });
      shape(ell(c[0], c[1], 25, 25, 22), { fill: '#fffbea', lw: 4 });
      stroke([[c[0], c[1]], [c[0], c[1] - 15]], 4); stroke([[c[0], c[1]], [c[0] + 11, c[1] + 4]], 4);
    }
    // mão: lateral do indicador dobrando atrás da borda + palma
    shape(spline([[2, -92], [36, -110], [76, -100], [100, -60], [108, 0], [96, 62], [62, 104], [20, 96], [2, 40]]), {
      fill: PAL.sSkin, lw: 7, shade: () => { fillOnly(ell(92, 10, 26, 90, 16), PAL.sSkinS, { boil: .3, alpha: .55 }); }
    });
    stroke(arc(34, -66, 22, 16, Math.PI * .15, Math.PI * .85, 8), 4);  // dobra do indicador
    stroke(arc(40, -20, 20, 12, Math.PI * .2, Math.PI * .8, 8), 4);    // dobra do médio
    // polegar: base gordinha, junta, ponta com unha
    shape(spline([[40, 40], [10, -30], [-40, -64], [-86, -82], [-104, -66], [-94, -44], [-50, -24], [-10, 20], [6, 60]]), { fill: PAL.sSkin, lw: 7, shade: () => fillOnly(ell(10, 20, 30, 40, 12), PAL.sSkinS, { boil: .3, alpha: .4 }) });
    push(); translate(-84, -66); rotate(.42);
    shape(rr(-18, -12, 32, 22, 10), { fill: '#e8b090', lw: 4 });
    pop();
    stroke(arc(-42, -44, 12, 10, Math.PI * 1.15, Math.PI * 1.75, 6), 4); // vinco da junta
    pop();
  }
}
