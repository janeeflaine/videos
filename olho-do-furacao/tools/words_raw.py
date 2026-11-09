# Transcreve a narração única (voices/narracao.mp3) com tempos por palavra → voices/words_raw.json (usado por cut_voice.py)
import json, os
from faster_whisper import WhisperModel
D = os.path.dirname(os.path.abspath(__file__)) + '/../voices'
m = WhisperModel("small", device="cpu", compute_type="int8")
segs, _ = m.transcribe(D + '/narracao.mp3', language='pt', word_timestamps=True)
W = [{'w': w.word.strip(), 's': round(w.start, 2), 'e': round(w.end, 2)} for s in segs for w in s.words]
json.dump(W, open(D + '/words_raw.json', 'w'), ensure_ascii=False, indent=0)
print(' '.join(w['w'] for w in W)); print(len(W), 'palavras', W[-1]['e'], 's')
