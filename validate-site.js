// Confere que menu, marcas e rodapé permanecem iguais nas cinco páginas.
const fs = require('node:fs');
const path = require('node:path');
const root = __dirname;
const pages=['index.html','empreendimento.html','lazer.html','localizacao.html','contato.html'];
const footerPattern=/<footer\b[^>]*\brecanto-footer\b[^>]*>[\s\S]*?<\/footer>/i;
function footerBaseFromSource() {
  for (const name of ['footer.html','partials/footer.html']) {
    const filename=path.join(root,name);
    if (fs.existsSync(filename)) return fs.readFileSync(filename,'utf8').match(footerPattern)?.[0];
  }
  return fs.readFileSync(path.join(root,'index.html'),'utf8').match(footerPattern)?.[0];
}
const footerBase=footerBaseFromSource();
if (!footerBase) throw new Error('Rodapé de referência não encontrado');
for (const page of pages) {
  const html=fs.readFileSync(path.join(root,page),'utf8');
  const footer=html.match(/<footer\b[^>]*\brecanto-footer\b[^>]*>[\s\S]*?<\/footer>/i)?.[0];
  if(!footer) throw new Error(`${page}: rodapé Recanto não localizado`);
  if(footer !== footerBase) throw new Error(`${page}: rodapé diferente das outras páginas`);
  for (const fragment of [
    'menu-rodape.css?v=7', 'class="recanto-menu"',
    'class="recanto-footer-recanto-logo"','class="recanto-footer-mg-logo"',
    '57.456.057/0001-17','data:image/webp;base64,'
  ]) {
    if(!html.includes(fragment)) throw new Error(`${page}: componente/estilo ausente: ${fragment}`);
  }
}
for(const [page,video] of [['empreendimento.html','video-empreendimento.mp4'],['localizacao.html','video-localizacao.mp4']]){
  const html=fs.readFileSync(path.join(root,page),'utf8');
  if(!html.includes(`src="${video}"`) || !html.includes(`href="${video}"`)) throw new Error(`${page}: referência ao vídeo incorreta`);
  if(!fs.existsSync(path.join(root,video))) throw new Error(`${video}: arquivo MP4 ausente`);
}
console.log('OK: logos, menu, rodapé iguais em 5 páginas; dois vídeos presentes.');

// Proteção do mapa e da política de frames para publicação na Hostinger.
const loc=fs.readFileSync(path.join(root,'localizacao.html'),'utf8');
if(!loc.includes('https://www.google.com/maps/embed?pb=')) throw new Error('localizacao.html: mapa oficial do Google ausente');
if(!loc.includes('class="map-embed recanto-google-map"')) throw new Error('localizacao.html: contêiner responsivo do mapa ausente');
for(const name of ['server.js','_headers','.htaccess']) {
  const config=fs.readFileSync(path.join(root,name),'utf8');
  if(!config.includes('frame-src https://www.google.com https://maps.google.com')) throw new Error(`${name}: CSP bloqueia o Google Maps`);
}
