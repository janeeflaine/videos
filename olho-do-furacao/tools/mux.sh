#!/bin/sh
# Junta vídeo + mixagem, com loudnorm em duas passadas para -14 LUFS (pico -1.5 dBTP). Funciona com ffmpeg 6.
# Uso: sh tools/mux.sh video.mp4 mix.wav saida.mp4
set -e
V=$1; A=$2; O=$3
J=$(ffmpeg -hide_banner -nostats -i "$A" -af loudnorm=I=-14:TP=-1.5:LRA=11:print_format=json -f null - 2>&1 | sed -n '/^{/,/^}/p')
g() { echo "$J" | grep "\"$1\"" | sed 's/.*: "\(.*\)".*/\1/'; }
LN="loudnorm=I=-14:TP=-1.5:LRA=11:measured_I=$(g input_i):measured_TP=$(g input_tp):measured_LRA=$(g input_lra):measured_thresh=$(g input_thresh):offset=$(g target_offset):linear=true"
ffmpeg -y -loglevel error -i "$V" -i "$A" -filter_complex "[1:a]$LN,aresample=48000[a]" -map 0:v -map "[a]" \
  -c:v libx264 -preset slow -crf 19 -pix_fmt yuv420p -r 24 -c:a aac -b:a 256k -movflags +faststart -shortest "$O.tmp.mp4"
mv "$O.tmp.mp4" "$O"
ffmpeg -hide_banner -nostats -i "$O" -vn -af ebur128=peak=true -f null - 2>&1 | grep -E "^\s+(I|Peak):" | head -2
echo "$O"
