# Tempos de cada palavra por fala (faster-whisper, com 0,6 s de silêncio nas pontas) → voices/words.json; confere a transcrição
import json, os, sys, numpy as np, soundfile as sf
from faster_whisper import WhisperModel
D = os.path.dirname(os.path.abspath(__file__)) + '/../voices'
dur = json.load(open(D + '/dur.json')); only = sys.argv[1:]
P = D + '/words.json'; out = json.load(open(P)) if os.path.exists(P) else {}
m = WhisperModel("small", device="cpu", compute_type="int8")
for k in dur:
    if only and k not in only: continue
    y, sr = sf.read(f'{D}/{k}.wav'); pad = np.zeros(int(.6 * sr)); sf.write(D + '/.pad.wav', np.concatenate([pad, y, pad]), sr)
    segs, _ = m.transcribe(D + '/.pad.wav', language='pt', word_timestamps=True)
    ws = [{'w': w.word.strip(), 's': round(max(0, w.start - .6), 2), 'e': round(w.end - .6, 2)} for s in segs for w in s.words]
    out[k] = ws; print(k, ' '.join(w['w'] for w in ws))
os.remove(D + '/.pad.wav')
json.dump(out, open(P, 'w'), ensure_ascii=False, indent=0)
