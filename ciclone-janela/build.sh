#!/bin/sh
# Constrói o filme do zero: fontes → trilha → mixagem → quadros → vídeo final. Requer Node + playwright (Chromium), ffmpeg, Python 3 + numpy.
set -e
P=$(cd "$(dirname "$0")" && pwd); cd "$P"
sh tools/fonts.sh
python3 music/score.py
python3 mix.py
mkdir -p out && node tools/video.cjs out/video.mp4 24
sh tools/mux.sh out/video.mp4 mix.wav abre-a-janela.mp4
node tools/still.cjs poster.jpg 99.6 ""
