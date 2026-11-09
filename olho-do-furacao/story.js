// story.js — linha do tempo única (voz → cenas → sons → música)
export const ORDER = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'];
// silêncio ANTES de cada fala (s)
const GAPB = { '02': .3, '03': .25, '04': .25, '05': .3, '06': .3, '07': .35, '08': .4, '09': .35, '10': .25, '11': .4, '12': .45 };
export const LEAD = .25;      // a cena começa um pouco antes da fala
export function build(DUR, WORDS) {
  let t = .35; const VO = {};
  for (const id of ORDER) { if (id !== '01') t += GAPB[id]; VO[id] = t; t += DUR[id]; }
  const END = +(t + 2.3).toFixed(2);
  // w(id, 'palavra', n) → instante absoluto do início da n-ésima ocorrência da palavra na fala
  const norm = s => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]/g, '');
  const AL = { tres: '3', quatrocentos: '450', duzentos: '240', mil: '1500', cinquenta: '50', aposta: 'posta' };
  function w(id, word, n = 0, end = false) {
    const L = WORDS[id] || [], k = norm(word); let c = 0;
    for (const x of L) { const v = norm(x.w); if (v.startsWith(k) || (AL[k] && v.startsWith(AL[k]))) { if (c++ === n) return VO[id] + (end ? x.e : x.s); } }
    if (typeof console !== 'undefined') console.warn('palavra não achada', id, word); return VO[id] + (DUR[id] || 0) * .5;
  }
  const S = {};
  ORDER.forEach((id, i) => { S[id] = i === 0 ? 0 : VO[id] - LEAD; });
  const SC = ORDER.map((id, i) => [id, S[id], i + 1 < ORDER.length ? S[ORDER[i + 1]] : END]);
  return { VO, END, w, SC };
}
