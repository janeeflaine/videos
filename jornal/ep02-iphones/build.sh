#!/bin/sh
# Constrói o ep. 02 do zero: fontes → linha do tempo → trilha → mixagem → quadros → vídeo final.
# Requer Node + playwright (Chromium), ffmpeg, Python 3 + numpy. As vozes (voices/) e o tempo das palavras (words/) já estão no
# repositório; para refazer uma fala, veja vozes.py.
set -e
P=$(cd "$(dirname "$0")" && pwd); J=$(dirname "$P"); cd "$P"
sh "$J/tools/fonts.sh"
python3 timeline.py
python3 music/score.py
python3 mix.py
mkdir -p out && node "$J/tools/video.cjs" out/video.mp4 24 "ep=ep02-iphones"
sh "$J/tools/mux.sh" out/video.mp4 mix.wav dura-mais-que-mandato.mp4
