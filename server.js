// Servidor para hospedagens Node.js, com suporte a MP4 / Range (206).
// Usa a saída do build (`dist`), ou os arquivos da raiz quando o build não existe.
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const base = __dirname;
const root = fs.existsSync(path.join(base, 'dist', 'index.html')) ? path.join(base, 'dist') : base;
const mime = {
  '.html':'text/html; charset=utf-8', '.css':'text/css; charset=utf-8',
  '.js':'text/javascript; charset=utf-8', '.svg':'image/svg+xml',
  '.png':'image/png', '.jpg':'image/jpeg', '.jpeg':'image/jpeg',
  '.webp':'image/webp', '.mp4':'video/mp4', '.ico':'image/x-icon'
};
const excluded = new Set(['package.json','package-lock.json','build.js','server.js','_headers']);
const port = Number(process.env.PORT) || 3000;
const policy = "default-src 'self'; base-uri 'self'; object-src 'none'; frame-ancestors 'none'; script-src 'self'; style-src 'self' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com data:; img-src 'self' data: https:; media-src 'self' data: https:; frame-src https://www.google.com https://maps.google.com; connect-src 'self'; form-action 'self'; upgrade-insecure-requests";
http.createServer((req, res) => {
  if (req.method !== 'GET' && req.method !== 'HEAD') { res.writeHead(405,{Allow:'GET, HEAD'}).end(); return; }
  let pathname;
  try { pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname); }
  catch { res.writeHead(400).end('Bad Request'); return; }
  const requested = path.resolve(root, '.' + pathname);
  if (requested !== root && !requested.startsWith(root + path.sep)) { res.writeHead(403).end('Forbidden'); return; }
  let file = requested;
  try { if (fs.statSync(file).isDirectory()) file = path.join(file,'index.html'); }
  catch { res.writeHead(404).end('Not Found'); return; }
  if (path.basename(file).startsWith('.') || excluded.has(path.basename(file))) { res.writeHead(404).end('Not Found'); return; }
  const ext = path.extname(file).toLowerCase();
  if (!mime[ext]) { res.writeHead(404).end('Not Found'); return; }
  let stat;
  try { stat=fs.statSync(file); if (!stat.isFile()) throw new Error('not file'); }
  catch { res.writeHead(404).end('Not Found'); return; }
  res.setHeader('Content-Type',mime[ext]);
  res.setHeader('Accept-Ranges','bytes');
  res.setHeader('X-Content-Type-Options','nosniff');
  res.setHeader('Referrer-Policy','strict-origin-when-cross-origin');
  res.setHeader('X-Frame-Options','DENY');
  res.setHeader('Content-Security-Policy',policy);
  // Browsers often request MP4 ranges to seek or begin playback.
  const range = req.headers.range;
  if (range) {
    const match = /^bytes=(\d*)-(\d*)$/.exec(range);
    if (!match || (!match[1] && !match[2])) { res.writeHead(416,{'Content-Range':`bytes */${stat.size}`}).end(); return; }
    let start, end;
    if (!match[1]) {
      const suffix=Number(match[2]);
      if (!Number.isSafeInteger(suffix) || suffix<=0) {res.writeHead(416,{'Content-Range':`bytes */${stat.size}`}).end();return;}
      start=Math.max(stat.size-suffix,0);end=stat.size-1;
    } else {
      start=Number(match[1]);end=match[2]?Number(match[2]):stat.size-1;
    }
    if (!Number.isSafeInteger(start)||!Number.isSafeInteger(end)||start>=stat.size||end<start||start<0) {
      res.writeHead(416,{'Content-Range':`bytes */${stat.size}`}).end(); return;
    }
    end=Math.min(end,stat.size-1);
    res.writeHead(206,{'Content-Range':`bytes ${start}-${end}/${stat.size}`,'Content-Length':end-start+1});
    if(req.method==='HEAD'){res.end();return;}
    fs.createReadStream(file,{start,end}).pipe(res);
    return;
  }
  res.writeHead(200,{'Content-Length':stat.size});
  if(req.method==='HEAD'){res.end();return;}
  fs.createReadStream(file).pipe(res);
}).listen(port,'0.0.0.0',()=>console.log(`Recanto dos Canários: http://localhost:${port} (${root})`));
