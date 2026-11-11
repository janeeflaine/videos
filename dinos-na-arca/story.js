// story.js — linha do tempo única (vozes → cenas → sons → música)
export const ORDER = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12', '13', '14', '15', '16'];
// silêncio ANTES de cada fala (s). 13: a pausa morta depois do "nenhum dinossauro" (a pomba pousa em silêncio)
const GAPB = { '02': .45, '03': .4, '04': .7, '05': .35, '06': .2, '07': .45, '08': .05, '09': .75, '10': .35, '11': .6, '12': .45, '13': 2.1, '14': .3, '15': .7, '16': .5 };
export const LEAD = .25;      // a cena começa um pouco antes da fala
export function build(DUR, WORDS) {
  let t = .45; const VO = {};
  for (const id of ORDER) { if (id !== '01') t += GAPB[id]; VO[id] = t; t += DUR[id]; }
  const END = +(t + 2.4).toFixed(2);
  const norm = s => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]/g, '');
  // w(id, 'palavra', n) → instante absoluto do início (ou fim) da n-ésima palavra que começa com o texto dado
  function w(id, word, n = 0, end = false) {
    const L = WORDS[id] || [], k = norm(word); let c = 0;
    for (const x of L) if (norm(x.w).startsWith(k)) { if (c++ === n) return VO[id] + (end ? x.e : x.s); }
    console.warn('palavra não achada', id, word); return VO[id];
  }
  const S = {};
  ORDER.forEach((id, i) => { S[id] = i === 0 ? 0 : VO[id] - LEAD; });
  S['08'] = VO['08'] - .02;              // o grito corta a cena
  S['09'] = VO['09'] - .45;              // depois do redemoinho
  S['13'] = w('12', 'arca', 0, true) + .5; // a pausa morta já é a cena da pomba
  S['14'] = VO['14'] - .1;
  const SC = ORDER.map((id, i) => [id, S[id], i + 1 < ORDER.length ? S[ORDER[i + 1]] : END]);
  return { VO, END, w, SC };
}
