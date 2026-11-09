// Vários quadros do filme: node tools/stills.cjs <outdir> t1 t2 ...  → <outdir>/t_<t>.jpg (+ contact.jpg via ffmpeg fora daqui)
const http = require('http'), fs = require('fs'), path = require('path');
const { chromium } = require('playwright');
const root = path.resolve(__dirname, '..'), [out, ...times] = process.argv.slice(2);
const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.woff2': 'font/woff2', '.json': 'application/json' };
fs.mkdirSync(out, { recursive: true });
const srv = http.createServer((req, res) => {
  const f = path.join(root, decodeURIComponent(req.url.split('?')[0]));
  if (!f.startsWith(root) || !fs.existsSync(f)) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { 'Content-Type': types[path.extname(f)] || 'application/octet-stream' }); fs.createReadStream(f).pipe(res);
}).listen(0, async () => {
  const b = await chromium.launch(), p = await b.newPage({ viewport: { width: 1080, height: 1920 } });
  p.on('pageerror', e => { console.error(e); process.exit(1); });
  await p.goto(`http://127.0.0.1:${srv.address().port}/index.html`);
  await p.waitForFunction(() => window.READY);
  for (const t of times) { await p.evaluate(t => window.render(t), parseFloat(t)); await p.screenshot({ path: path.join(out, `t_${t}.jpg`), type: 'jpeg', quality: 85 }); }
  await b.close(); srv.close();
});
