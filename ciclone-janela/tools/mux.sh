#!/bin/sh
# Junta vídeo + mix.wav com loudnorm em duas passadas (−14 LUFS, pico −1,5 dBTP) → <saida.mp4>
set -e
V=$1; A=$2; O=$3
J=$(ffmpeg -hide_banner -i "$A" -af loudnorm=I=-14:TP=-1.5:LRA=11:print_format=json -f null - 2>&1 | sed -n '/^{/,/^}/p')
g() { echo "$J" | grep "\"$1\"" | sed 's/.*: "\(.*\)".*/\1/'; }
ffmpeg -y -v error -i "$V" -i "$A" -map 0:v -map 1:a -c:v copy -c:a aac -b:a 192k -ar 48000 \
  -af "loudnorm=I=-14:TP=-1.5:LRA=11:measured_I=$(g input_i):measured_TP=$(g input_tp):measured_LRA=$(g input_lra):measured_thresh=$(g input_thresh):offset=$(g target_offset):linear=true" \
  -shortest -movflags +faststart "$O"
