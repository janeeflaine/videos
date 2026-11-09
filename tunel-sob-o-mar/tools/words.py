# Tempos de cada palavra por fala (faster-whisper) → voices/words.json; também confere a transcrição
import json, os, sys
from faster_whisper import WhisperModel
D = os.path.dirname(os.path.abspath(__file__)) + '/../voices'
dur = json.load(open(D + '/dur.json'))
m = WhisperModel("small", device="cpu", compute_type="int8")
out = {}
for k in dur:
    segs, _ = m.transcribe(f'{D}/{k}.wav', language='pt', word_timestamps=True)
    ws = [{'w': w.word.strip(), 's': round(w.start, 2), 'e': round(w.end, 2)} for s in segs for w in s.words]
    out[k] = ws; print(k, ' '.join(w['w'] for w in ws))
json.dump(out, open(D + '/words.json', 'w'), ensure_ascii=False, indent=0)
