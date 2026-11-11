# Gera cada fala no ElevenLabs → voices/src/<id>.mp3 (pula as que não mudaram). A chave da API entra pelo proxy do ambiente
# ou pela variável ELEVEN_API_KEY.
import json, os, sys, urllib.request, urllib.error
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from lines import VOICE, LINES
D = os.path.dirname(os.path.abspath(__file__)) + '/../voices/src'; os.makedirs(D, exist_ok=True)
META = D + '/meta.json'; meta = json.load(open(META)) if os.path.exists(META) else {}
only = sys.argv[1:]
for k, (who, txt) in LINES.items():
    vid, model, vs = VOICE[who]; key = f'{vid}|{model}|{json.dumps(vs, sort_keys=True)}|{txt}'
    out = f'{D}/{k}.mp3'
    if (not only and meta.get(k) == key and os.path.exists(out)) or (only and k not in only): continue
    body = json.dumps({'text': txt, 'model_id': model, 'voice_settings': vs, 'language_code': 'pt'}).encode()
    req = urllib.request.Request(f'https://api.elevenlabs.io/v1/text-to-speech/{vid}?output_format=mp3_44100_128', body,
                                 {'Content-Type': 'application/json', **({'xi-api-key': os.environ['ELEVEN_API_KEY']} if os.environ.get('ELEVEN_API_KEY') else {})})
    try: data = urllib.request.urlopen(req, timeout=180).read()
    except urllib.error.HTTPError as e: sys.exit(f'{k}: HTTP {e.code} {e.read()[:300]}')
    open(out, 'wb').write(data)
    meta[k] = key; json.dump(meta, open(META, 'w'), indent=0); print(k, who, 'ok')
