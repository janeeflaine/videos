# Gera as falas do episódio direto da tabela do ROTEIRO.md e salva voices/NN-quem.mp3 + words/NN-quem.json:
#   Seu Chicó e Dona Zefinha no ElevenLabs (modelo v4); o tempo de cada palavra vem do alinhamento da própria API.
#   Lorenzo no Fish Audio (voz pública "Papagaio", modelo s1); o tempo de cada palavra vem do faster-whisper local.
# Uso: python3 vozes.py [números das falas, ex.: 4 9]   (sem números: todas)
#      python3 vozes.py --palavras 7 12                 (só refaz words/ de MP3s que já estão em voices/)
# As chaves das APIs são injetadas pelo proxy do ambiente; os valores abaixo são só marcadores.
import json, os, re, sys, base64, urllib.request
P = os.path.dirname(os.path.abspath(__file__))
VOZ = {'chico': 'RGbeQtiShYRDVCrd9b9w', 'zefinha': 'FrCDCQwye0euHmliGxP9', 'lorenzo': 'cd611264dd134b34aa41dfa78a607941'}
FISH = {'lorenzo'}  # vozes que saem do Fish Audio
MODEL = 'eleven_v4'
rows = re.findall(r'^\| (\d+) \| `(\d\d-(\w+))\.mp3` \| [^|]+ \| (.+?) \|$', open(f'{P}/ROTEIRO.md', encoding='utf-8').read(), re.M)
so_palavras = '--palavras' in sys.argv
only = {int(a) for a in sys.argv[1:] if a.isdigit()}
_wm = None
def whisper_words(f):  # tempo de cada palavra pelo faster-whisper (modelo medium), como no ep. 01
    global _wm
    import subprocess, numpy as np
    from faster_whisper import WhisperModel
    os.environ.setdefault('HF_HUB_DISABLE_XET', '1')
    _wm = _wm or WhisperModel('medium', device='cpu', compute_type='int8')
    x = np.frombuffer(subprocess.run(['ffmpeg', '-v', 'error', '-i', f, '-ac', '1', '-ar', '16000', '-f', 'f32le', '-'], capture_output=True, check=True).stdout, np.float32)
    segs, _ = _wm.transcribe(x, language='pt', beam_size=5, word_timestamps=True)
    return [{'text': w.word.strip(), 'start': round(w.start, 3), 'end': round(w.end, 3)} for sg in segs for w in sg.words]
os.makedirs(f'{P}/voices', exist_ok=True); os.makedirs(f'{P}/words', exist_ok=True)
for n, name, who, text in rows:
    if who not in VOZ or (only and int(n) not in only): continue
    text = re.sub(r'^\*\(.*?\)\*\s*', '', text.strip())  # tira observações em itálico, ex.: *(reaproveitada)*
    if who in FISH:
        if not so_palavras:
            body = json.dumps({'text': text, 'reference_id': VOZ[who], 'format': 'mp3', 'mp3_bitrate': 128, 'normalize': True, 'latency': 'normal'}).encode()
            req = urllib.request.Request('https://api.fish.audio/v1/tts', body, {'Authorization': 'Bearer injected-by-proxy', 'Content-Type': 'application/json', 'model': 's1'})
            open(f'{P}/voices/{name}.mp3', 'wb').write(urllib.request.urlopen(req, timeout=300).read())
        words = whisper_words(f'{P}/voices/{name}.mp3')
        json.dump({'text': text, 'words': words, 'model': 'fish-s1', 'voice': VOZ[who]}, open(f'{P}/words/{name}.json', 'w'), ensure_ascii=False)
        print(f'{name}: {words[-1]["end"]:.2f} s, {len(words)} palavras (whisper: {" ".join(w["text"] for w in words)})')
        continue
    if so_palavras: continue  # ElevenLabs: as palavras vêm junto com o áudio
    body = json.dumps({'text': text, 'model_id': MODEL, 'language_code': 'pt',
                       'voice_settings': {'stability': .5, 'similarity_boost': .75}}).encode()
    req = urllib.request.Request(f'https://api.elevenlabs.io/v1/text-to-speech/{VOZ[who]}/with-timestamps?output_format=mp3_44100_128',
                                 body, {'xi-api-key': 'injected-by-proxy', 'Content-Type': 'application/json'})
    d = json.load(urllib.request.urlopen(req, timeout=300))
    open(f'{P}/voices/{name}.mp3', 'wb').write(base64.b64decode(d['audio_base64']))
    a = d['alignment']; ch, s0, s1 = a['characters'], a['character_start_times_seconds'], a['character_end_times_seconds']
    words, cur, depth = [], None, 0
    for c, a0, a1 in zip(ch, s0, s1):  # palavras faladas; o que está entre colchetes (marcações de emoção) fica de fora
        if c == '[': depth += 1
        if depth or c.isspace():
            if cur: words.append(cur); cur = None
            if c == ']': depth -= 1
            continue
        if cur is None: cur = {'text': '', 'start': a0, 'end': a1}
        cur['text'] += c; cur['end'] = a1
    if cur: words.append(cur)
    words = [w for w in words if re.search(r'\w', w['text'])]
    for w in words: w['start'], w['end'] = round(w['start'], 3), round(w['end'], 3)
    spoken = re.sub(r'\[[^\]]*\]\s*', '', text).strip()
    json.dump({'text': spoken, 'words': words, 'model': MODEL, 'voice': VOZ[who]}, open(f'{P}/words/{name}.json', 'w'), ensure_ascii=False)
    print(f'{name}: {words[-1]["end"]:.2f} s, {len(words)} palavras')
