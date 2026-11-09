# Série "Jornal do seu ___"

Formato novo, separado do padrão de curiosidades (PADRAO.md). Mesmo estilo visual Sci-Fi Sitcom Toon, 9:16, 60–130 s, sem legendas.

## Conceito
A pessoa manda uma **notícia** (de preferência o link; print também serve). Um senhorzinho lê o jornal em casa, comenta com humor, a esposa e os bichos zoam, e no fim ele vai dormir.

## Elenco fixo (desenhar uma vez, reaproveitar em todo episódio)
- **O senhor:** calvo, de bigode, sem camisa, de bermuda e chinelo. Sentado na poltrona; lê o jornal todo dia, dá opiniões engraçadas e ri.
- **A esposa:** sempre na cozinha fazendo alguma coisa. Se intromete de vez em quando com bordões: "bem que te avisei", "né pussive", "rapaz, o mundo tá de cabeça pra baixo mesmo" e outros a inventar.
- **Gato magricelo:** faz bagunça e estressa o senhor (derruba a xícara etc.).
- **Papagaio:** repete palavras para zoar o senhor no pior momento.

## Cenário fixo
Casa simples de interior, perto da hora do jantar. Poltrona com mesinha ao lado, garrafa de café e xícara. Cozinha visível ao fundo.

## Estrutura do episódio
1. Abertura: ele se ajeita na poltrona e pega o café e o jornal.
2. Lê a manchete e os fatos.
3. **Close em primeira pessoa:** as mãos dele segurando o jornal com a notícia. É o momento da credibilidade.
4. Comentários engraçados, risada, intromissão da esposa e gags do gato e do papagaio.
5. Final:
   - notícia ruim: ele fica de mau humor;
   - notícia boa: ele solta uma piadinha.
   Nos dois casos fecha com "vou dormir que é melhor" e vai caminhando pro quarto de chinelo.
6. Chamada "Se você gostou, comenta: Curioso Soh!" (sugestão: o papagaio grita depois que ele sai).

## A notícia no jornal (credibilidade)
- **Preferir o link.** Eu leio a matéria, confiro os fatos em outra fonte e recomponho a notícia na tipografia do jornal desenhado:
  - a manchete real;
  - um resumo curto com as minhas palavras;
  - um selo de fonte bem legível (veículo, data e endereço).
- **Com print:** ele entra colado no jornal como um recorte.
- **Nunca** copiar a matéria inteira nem as fotos dela; só manchete, resumo e fonte (direitos autorais).
- Notícia fraca ou duvidosa: avisar a pessoa antes de produzir.

## Áudio com várias vozes (ponto de atenção)
São três vozes: senhor, esposa e papagaio, com risadas e interrupções.
- **Recomendado:** um MP3 por fala, numerados na ordem (`01-seu.mp3`, `02-esposa.mp3`, `03-papagaio.mp3`…), gerados pela pessoa no ElevenLabs. Eu monto a conversa na linha do tempo, o que dá controle de pausas e das gags.
- **Alternativa:** um arquivo único de diálogo (ElevenLabs v3 com marcações de emoção como `[ri]`). Eu separo os falantes pela transcrição. Dá menos trabalho para a pessoa, mas é mais difícil corrigir uma fala isolada.
- No roteiro eu entrego um bloco de texto pronto por fala, com a voz indicada e as marcações de emoção.
- Vozes a definir: uma para cada personagem. O senhor pode ou não usar a voz padrão `ZqE9vIHPcrC35dZv0Svu`.
- **Boca:** sincronizada pela transcrição palavra por palavra; cada personagem mexe só nas próprias falas.

## Diferenças em relação ao PADRAO.md
- Elenco **fixo** da série, em vez de elenco novo a cada vídeo.
- Entrada: notícia (link ou print), em vez de pergunta ou título.
- Custo: o primeiro episódio é o mais caro (cria elenco e cenário); os seguintes saem mais baratos que os vídeos de curiosidade.

## Próximo passo
1. Folha de elenco e cenário para aprovação: senhor, esposa, gato, papagaio e a sala com a cozinha ao fundo. **Feito, aguardando aprovação:** `jornal/elenco-previa.jpg`, `jornal/cenario-previa.jpg`, `jornal/jornal-close-previa.jpg` (código em `jornal/cast.js`).
2. Definir os nomes dos personagens e as vozes do ElevenLabs.
3. Primeira notícia: roteiro com as falas por personagem → MP3s da pessoa → produção. Reaproveitar o pipeline de `ciclone-janela/`: `tools/`, `toon.js`, `lib.js`, `mix.py`, `score.py`.
