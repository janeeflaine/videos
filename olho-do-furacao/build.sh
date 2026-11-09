#!/bin/sh
# Constrói o filme do zero: fontes → transcrição → falas → eventos → trilha → mixagem → quadros → vídeo final.
# Pré-requisitos: biblioteca Lemo-Opuscar com `setup.sh deps` e `deps voice`.
set -e
LIB=${LIB:-$HOME/lemo-opuscar}
P=$(cd "$(dirname "$0")" && pwd)
sh "$P/tools/fonts.sh"
(cd "$LIB" && HF_HUB_DISABLE_XET=1 .venv/bin/python "$P/tools/words_raw.py")   # narração única → palavras com tempo
"$LIB/.venv/bin/python" "$P/tools/cut_voice.py"                                 # → falas aceleradas (+ chamada avulsa 12)
(cd "$LIB" && HF_HUB_DISABLE_XET=1 .venv/bin/python "$P/tools/words.py")       # tempos de cada palavra por fala
cd "$LIB"
node core/render/events.mjs "$P" --size 1080x1920
.venv/bin/python "$P/music/score.py"
LIB="$LIB" .venv/bin/python "$P/mix.py"
node core/render/video.mjs "$P" --fps 24 --workers 4 --size 1080x1920
sh "$P/tools/mux.sh" "$P/out/video.mp4" "$P/mix.wav" "$P/e-se-o-aviao-entrar-no-olho.mp4"
