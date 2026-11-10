# Ep. 02 — "Dura mais que mandato"

Série "Jornal do Seu Chicó" · 9:16 · alvo ≈ 115–125 s · notícia ruim → final de mau humor.

## A notícia (conferida)
- **Fonte enviada (lida):** CNN Brasil, 10/11/2026, 08h49 — Lucas Massei e Laura Molfese — cnnbrasil.com.br/politica/senado-dara-95-iphones-18-pro-e-330-celulares-a-parlamentares-e-servidores
- **Conferida em outros veículos** (mesmos números em todos): ND+, MacMagazine (10/11), InfoMoney, Midiamax, Lupa1, Clic Camaquã, Blog do Valente.
- **Fatos usados (todos da CNN):** licitação aberta no fim de outubro, custo estimado de R$ 6 milhões, contrato de 4 anos. São 95 iPhones 18 Pro e outros 330 celulares Samsung e Motorola para parlamentares e servidores, mais os serviços de telefonia. Os aparelhos ficam em comodato (emprestados durante o contrato) e devem ser trocados a cada dois anos pelo "melhor aparelho da categoria high end". Cada iPhone custa R$ 582,74 por mês; no site da Apple, o mesmo modelo sai por R$ 13.499. A internet dos iPhones dobra de 50 GB para 100 GB. Substitui o contrato de 2022 (93 iPhones 13 Pro e 290 intermediários). A nova legislatura toma posse em 1º de fevereiro e já usa os aparelhos novos. O Senado não respondeu à CNN sobre a escolha dos modelos.
- **Fica de fora de propósito:** a briga política em torno do caso (ação popular, TCU), para a piada não tomar partido, o total de linhas, que diverge entre os veículos (425 aparelhos ou 675 linhas), e a divisão de quem fica com qual aparelho, que a CNN não detalha.

## Tom
A piada é com o gasto, não com uma pessoa ou um partido. Seu Chicó leva um susto com o preço e defende o celular velho de 2008 como se fosse um tesouro: lá eles trocam a cada dois anos, o dele dura mais que mandato. As gags do papagaio e do gato **provam** o argumento dele (o celular cai, desmonta e volta a funcionar), e o papagaio dá a facada final: "quem paga é você".

## O jornal (close em primeira pessoa)
- **Manchete (a real, da CNN Brasil):** SENADO DARÁ 95 IPHONES 18 PRO E 330 CELULARES A PARLAMENTARES E SERVIDORES
- **Resumo impresso (minhas palavras):**
  Contrato de R$ 6 milhões, por 4 anos. Os aparelhos são emprestados pela operadora e trocados a cada 2 anos. Cada iPhone custa ao Senado R$ 582,74 por mês, com 100 GB. Na loja, o mesmo modelo sai por R$ 13.499.
- **Selo de fonte:** FONTE: CNN Brasil · 10/11/2026 / cnnbrasil.com.br/politica
- **Ilustração (nossa):** um celular novinho numa almofada de veludo, com a etiqueta "R$ 13.499".
- Prévia: `previa-jornal.jpg`.

## Objeto novo: o celular do Seu Chicó
Um tijolão de teclinha com antena, tela verde e uma borrachinha de dinheiro segurando a tampa (`celularVelho` em `cast.js`). Ele acende, treme e desmonta no tombo (tampa, bateria e borrachinha voam). Prévias: `previa-celular.jpg` e `previa-sala.jpg`.

## Falas (um MP3 por fala, nesta ordem)
**Vozes (geradas pela API com `vozes.py`, modelo v4):** Seu Chicó = "Sergio – Friendly and Encouraging" (`RGbeQtiShYRDVCrd9b9w`); Dona Zefinha = "Edna E." (`FrCDCQwye0euHmliGxP9`), voz nova escolhida pela autora a partir deste episódio. Já estão em `voices/` (01–06, 08–11, 13–16), com o tempo de cada palavra em `words/`; todas conferidas por transcrição local (faster-whisper).
**Lorenzo:** a autora faz à mão as falas **07** e **12**. A 17 é a chamada do ep. 01, reaproveitada (já está em `voices/17-lorenzo.mp3`).
Para refazer uma fala: corrija o texto na tabela e rode `python3 vozes.py <número>`.
Marcações entre colchetes são para o ElevenLabs (em inglês funcionam melhor). Os números estão por extenso e "Pró" leva acento de propósito, para a voz não ler "18" em inglês nem "pro" como "para o".
SFX e música são meus; não precisam ir no áudio.

| # | Arquivo | Quem | Fala |
|---|---|---|---|
| 1 | `01-chico.mp3` | Seu Chicó | [sighs contentedly] Aaah... cafezinho, poltrona e jornal. Vamo ver o que aprontaram hoje. |
| 2 | `02-chico.mp3` | Seu Chicó | [reading slowly] "Senado dará noventa e cinco iPhones dezoito Pró e trezentos e trinta celulares a parlamentares e servidores." |
| 3 | `03-chico.mp3` | Seu Chicó | [reading the newspaper, steady pace] Diz aqui que o Senado abriu uma licitação de seis milhões de reais: quatro anos de celular e internet pros parlamentares e servidores. Os aparelhos são emprestados pela operadora e trocados por novos a cada dois anos. Cada iPhone sai por quinhentos e oitenta e dois reais por mês. E na loja, esse mesmo iPhone custa treze mil, quatrocentos e noventa e nove reais. |
| 4 | `04-chico.mp3` | Seu Chicó | [lowering the paper, outraged] Treze mil reais... num TELEFONE?! [disbelieving laugh] Rapaz, por esse preço ele tinha que vir com uma secretária dentro, pra atender por mim! |
| 5 | `05-zefinha.mp3` | Dona Zefinha | [dreamy, from the kitchen] Um iPhone dezoito... [sighs] Deus me livre. [short pause] Mas quem me dera. |
| 6 | `06-chico.mp3` | Seu Chicó | [offended, proudly showing his old phone] Zefinha! E esse aqui? Tem lanterna, tem rádio, tem o joguinho da cobrinha... a bateria dura uma semana, e não custou nem a metade de uma mensalidade daquele! |
| 7 | `07-lorenzo.mp3` | Lorenzo | [imitating a ringing phone] Trim-trim! Trim-trim! Trim-trim! |
| 8 | `08-chico.mp3` | Seu Chicó | [answering the phone, confused, then furious] Alô? Alô?... Quem fala?... LORENZO! |
| 9 | `09-chico.mp3` | Seu Chicó | [proud, showing off] E outra: lá eles trocam de celular a cada dois anos. Esse aqui eu tenho desde dois mil e oito... já durou mais que dois mandatos de senador! |
| 10 | `10-chico.mp3` | Seu Chicó | [shouting] BITUCA! |
| 11 | `11-chico.mp3` | Seu Chicó | [triumphant, laughing] Viu só? Caiu, desmontou, montou de novo... e tá funcionando! Quero ver o iPhone do senador fazer isso! |
| 12 | `12-lorenzo.mp3` | Lorenzo | [mocking, squawking] Quem paga é você! Quem paga é você! |
| 13 | `13-chico.mp3` | Seu Chicó | [deflated, grumbling] ...É. O iPhone é do senador... mas a conta chega aqui em casa. |
| 14 | `14-zefinha.mp3` | Dona Zefinha | [arms crossed, dry] Bem que eu te avisei, Chicó: era pra você ter virado senador. |
| 15 | `15-chico.mp3` | Seu Chicó | [laughs] Eu? E trocar meu chinelo por sapato? Nem por um iPhone! |
| 16 | `16-chico.mp3` | Seu Chicó | [grumpy, getting up] Quer saber? Vou dormir que é melhor. [beat] E se o Senado ligar... diz que eu tô sem sinal. |
| 17 | `17-lorenzo.mp3` | Lorenzo | *(reaproveitada do ep. 01)* Se você gostou, comenta: Curioso Soh! |

## Plano das cenas (resumo)
1. **Abertura (fala 1):** a sala às 18h10. Seu Chicó se ajeita na poltrona, serve o café e abre o jornal.
2. **Manchete (fala 2):** corte para o **close em primeira pessoa**: as mãos dele com o BRAZUELA.
3. **O resumo (fala 3):** a câmera desce pela página: ilustração do iPhone na almofada, resumo impresso e, no fim, o selo de fonte, parado na tela por uns 2 s. No meio, um corte rápido para a Dona Zefinha ouvindo da cozinha.
4. **O preço (fala 4):** ele baixa o jornal devagar, de boca aberta, e quase engasga com o café.
5. **"Deus me livre... mas quem me dera" (fala 5):** Dona Zefinha na porta da cozinha, olhando pro teto, sonhando, com a colher de pau no peito. No "mas quem me dera", um brilho de estrelinha nos óculos.
6. **O tijolão (fala 6):** ele tira o tijolão do bolso e ergue como um troféu; a cada item, um efeito: a lanterninha acende, um chiado de rádio, o "bip" da cobrinha.
7. **Gag do papagaio (falas 7–8):** Lorenzo faz "trim-trim". Seu Chicó leva um susto, olha pro celular (tela apagada), atende assim mesmo: "Alô? Alô? Quem fala?". Só no fim percebe e se vira pro poleiro. Lorenzo balança a cabeça, satisfeito.
8. **"Dura mais que mandato" (fala 9):** ele põe o celular em pé na mesinha, ao lado da xícara, como num pedestal. Enquanto ele fala, o Bituca sobe na mesinha. No "senador!", a pata derruba o celular (sim, o Bituca de novo).
9. **O tombo (fala 10):** o celular bate no chão e desmonta: tampa pra um lado, bateria pro outro, borrachinha voando. Silêncio; só o relógio. Close tremido: "BITUCA!".
10. **O conserto (sem fala, ~2,5 s):** três cortes rápidos com estalinhos: encaixa a bateria, a tampa, estica a borrachinha... e a tela acende com um "plim".
11. **A vitória (fala 11):** ele ergue o celular de novo, rindo.
12. **A facada (falas 12–13):** Lorenzo abre as asas: "Quem paga é você!". A risada dele morre; ele murcha na poltrona.
13. **Dona Zefinha (falas 14–15):** de braços cruzados, ela solta a ideia; ele ri, mexendo os dedões no chinelo.
14. **Final de mau humor (fala 16):** ele levanta emburrado, deixa o tijolão na mesinha e vai de chinelo pro quarto. Na porta, sem se virar: "...diz que eu tô sem sinal."
15. **Chamada (fala 17):** sala vazia; Lorenzo grita a chamada. Fim.

## Estimativa de tempo
As falas geradas somam ≈ 113 s (sem as duas do Lorenzo) e as vozes saíram mais pausadas do que o previsto. Com os silêncios de cada fala cortados, ≈ 5 s a mais do Lorenzo e ≈ 18 s de pausas e gags, o total dá ≈ 130 s. Na montagem eu aperto as pausas para ficar em ≈ 120–125 s.
