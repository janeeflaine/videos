# Série "Jornal do seu ___" — elenco e cenário fixos

Ideia e regras da série: [../SERIE-JORNAL.md](../SERIE-JORNAL.md). Estilo Sci-Fi Sitcom Toon, 9:16, 1080×1920.

Esta pasta guarda o que se desenha **uma vez** e se reaproveita em todo episódio:

- `cast.js` — o senhor (`seu`), a esposa (`esposa`), o gato (`gato`), o papagaio (`papagaio` + `poleiro`),
  a poltrona, a mesinha, a garrafa de café, a xícara, o jornal aberto (`jornalAberto`),
  o cenário da sala com a cozinha ao fundo (`sala`) e o close em primeira pessoa do jornal (`jornalClose`,
  que recebe manchete, resumo e selo de fonte de cada notícia).
- `toon.js`, `lib.js`, `tools/` — mesmo motor e ferramentas do `ciclone-janela/`.

Prévias para aprovação (`node tools/still.cjs <saída.jpg> <t> <query>`):

| Arquivo | Query |
|---|---|
| `elenco-previa.jpg` | `sheet` |
| `cenario-previa.jpg` | `cenario` |
| `jornal-close-previa.jpg` | `cenario&close` |

Antes da primeira renderização: `sh tools/fonts.sh` (baixa as fontes, que não ficam no git).
