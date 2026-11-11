#!/bin/sh
# Constrói o filme do zero: fontes → falas (ElevenLabs) → eventos → trilha → mixagem → quadros → vídeo final.
# Pré-requisitos: biblioteca Lemo-Opuscar (setup.sh deps + deps voice) e acesso à API do ElevenLabs
# (variável ELEVEN_API_KEY, ou um proxy que injete a chave). Falas já geradas em voices/src/ não são pedidas de novo.
set -e
LIB=${LIB:-$HOME/lemo-opuscar}
PY=${PY:-$( [ -x "$LIB/.venv/bin/python" ] && echo "$LIB/.venv/bin/python" || echo python3 )}
P=$(cd "$(dirname "$0")" && pwd)
sh "$P/tools/fonts.sh"
"$PY" "$P/tools/tts.py"                                  # narrador + Noé + Rex → voices/src/*.mp3
"$PY" "$P/tools/prep_voice.py"                           # apara, acelera o narrador, envelope de boca (lip-sync)
HF_HUB_DISABLE_XET=1 "$PY" "$P/tools/words.py"           # tempos de cada palavra + conferência da fala
cd "$LIB"
node core/render/events.mjs "$P" --size 1080x1920
LIB="$LIB" "$PY" "$P/music/score.py"
LIB="$LIB" "$PY" "$P/mix.py"
node core/render/video.mjs "$P" --fps 24 --workers 4 --size 1080x1920
sh "$P/tools/mux.sh" "$P/out/video.mp4" "$P/mix.wav" "$P/cade-os-dinossauros.mp4"
"$PY" "$P/tools/srt.py"
