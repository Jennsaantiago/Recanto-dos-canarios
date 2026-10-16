// Servidor HTTP simples para hospedagens Node.js sem dependências externas.
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const root = __dirname;
const mime = {'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.webp':'image/webp','.mp4':'video/mp4','.ico':'image/x-icon'};
const port = Number(process.env.PORT) || 3000;
http.createServer((req,res)=>{
  let pathname;
  try { pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname); } catch {res.writeHead(400).end('Bad Request');return;}
  const requested = path.resolve(root, '.' + pathname);
  if (requested !== root && !requested.startsWith(root + path.sep)) {res.writeHead(403).end('Forbidden');return;}
  let file = requested;
  try {if(fs.statSync(file).isDirectory()) file=path.join(file,'index.html');}catch {res.writeHead(404).end('Not Found');return;}
  if (path.basename(file).startsWith('.') || ['package.json','package-lock.json','build.js','server.js','_headers'].includes(path.basename(file))) {res.writeHead(404).end('Not Found');return;}
  const ext=path.extname(file).toLowerCase();
  if(!mime[ext]) {res.writeHead(404).end('Not Found');return;}
  res.setHeader('Content-Type',mime[ext]);
  res.setHeader('X-Content-Type-Options','nosniff');
  res.setHeader('Referrer-Policy','strict-origin-when-cross-origin');
  res.setHeader('X-Frame-Options','DENY');
  res.setHeader('Content-Security-Policy',"default-src 'self'; base-uri 'self'; object-src 'none'; frame-ancestors 'none'; script-src 'self'; style-src 'self' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com data:; img-src 'self' data: https:; media-src 'self' data: https:; connect-src 'self'; form-action 'self'; upgrade-insecure-requests");
  const stream=fs.createReadStream(file);
  stream.on('error',()=>{if(!res.headersSent)res.writeHead(404);res.end();});
  stream.pipe(res);
}).listen(port,'0.0.0.0',()=>console.log(`Site disponível na porta ${port}`));
