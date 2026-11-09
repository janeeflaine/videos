// story.js — linha do tempo única (voz → cenas → sons → música)
export const ORDER = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12', '13'];
// silêncio ANTES de cada fala (s). 10b: a pausa da gota (o silêncio é a piada)
const GAPB = { '02': .35, '03': .3, '04': .3, '05': .35, '06': .3, '07': .3, '08': .3, '09': .3, '10': .5, '11': 1.4, '12': .5, '13': .5 };
export const LEAD = .25;      // a cena começa um pouco antes da fala
export function build(DUR, WORDS) {
  let t = .35; const VO = {};
  for (const id of ORDER) { if (id !== '01') t += GAPB[id]; VO[id] = t; t += DUR[id]; }
  const END = +(t + 2.6).toFixed(2);
  // w(id, 'palavra', n) → instante absoluto do início da n-ésima ocorrência da palavra na fala
  const norm = s => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]/g, '');
  function w(id, word, n = 0, end = false) {
    const L = WORDS[id] || [], k = norm(word), AL = { quatrocentos: '400', vinte: '20', sessenta: '60', 'doismilevinte': '2020', tanques: 'tanks', conves: 'converso', so: 'so' }; let c = 0;
    for (const x of L) if (norm(x.w).startsWith(k) || (AL[k] && norm(x.w) === AL[k])) { if (c++ === n) return VO[id] + (end ? x.e : x.s); }
    console.warn('palavra não achada', id, word); return VO[id];
  }
  const S = {};   // início de cada cena
  ORDER.forEach((id, i) => { S[id] = i === 0 ? 0 : VO[id] - LEAD; });
  S['11'] = VO['11'] - .12;
  const SC = ORDER.map((id, i) => [id, S[id], i + 1 < ORDER.length ? S[ORDER[i + 1]] : END]);
  return { VO, END, w, SC };
}
