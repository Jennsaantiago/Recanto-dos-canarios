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
    'menu-rodape.css?v=15', 'class="recanto-menu"',
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

// Confere o mapa sem iframe: evita bloqueios de incorporação.
const loc=fs.readFileSync(path.join(root,'localizacao.html'),'utf8');
if(!loc.includes('class="recanto-map-access"')) throw new Error('localizacao.html: cartão de localização ausente');
if(!loc.includes('https://www.google.com/maps/')) throw new Error('localizacao.html: link oficial do mapa ausente');
if(!loc.includes('class="recanto-map-preview"')) throw new Error('localizacao.html: prévia da localização ausente');
if(loc.includes('<iframe')) throw new Error('localizacao.html: iframe não permitido por causa de bloqueios anteriores');

// v13: presença dos banners, social, cards de navegação e áreas especificadas.
for (const page of pages) {
 const html=fs.readFileSync(path.join(root,page),'utf8');
 if (!html.includes('recanto-instagram-feature')) throw new Error(`${page}: Instagram não visível no rodapé`);
 if (!html.includes('https://www.instagram.com/recantodoscanarioscorumba/')) throw new Error(`${page}: URL do Instagram incorreta`);
 if (page!=='index.html' && !html.includes('recanto-page-hero')) throw new Error(`${page}: banner com imagem de fundo não encontrado`);
}
for(const name of ['index.html','empreendimento.html']){
 const html=fs.readFileSync(path.join(root,name),'utf8');
 if ((html.match(/class="it recanto-info-card"/g)||[]).length!==5) throw new Error(`${name}: cinco cards clicáveis ausentes`);
}
const lazer=fs.readFileSync(path.join(root,'lazer.html'),'utf8');
for(const text of ['Arena poliesportiva','Quadra poliesportiva','Café','Mercado','Lojas, serviços, gastronomia e muito mais','recanto-bali-lake']){
 if(!lazer.includes(text))throw new Error(`lazer.html: conteúdo obrigatório ausente: ${text}`);
}
console.log('OK: banners, Instagram e cards clicáveis verificados.');

// v15: cada página tem arte própria e os três destaques de lazer estão completos.
const css=fs.readFileSync(path.join(root,'menu-rodape.css'),'utf8');
for (const file of ['empreendimento-hero-3d.webp','localizacao-hero-terreno-3d.webp']){
  if(!css.includes(file)||!fs.existsSync(path.join(root,file)))throw new Error('Capa de página ausente: '+file);
}
for (const title of ['Marina guarda barcos','Quadras','Momentos em família']){
  if(!lazer.includes('<h3>'+title+'</h3>'))throw new Error('Lazer: card '+title+' não encontrado');
}
for(const img of ['lazer-marina-guarda-barcos.webp','lazer-quadras.webp','lazer-momentos-familia.webp']){
  if(!fs.existsSync(path.join(root,img))||!lazer.includes('src="'+img+'"'))throw new Error('Lazer: imagem '+img+' ausente');
}
console.log('OK: banners distintos, mapa externo sem iframe e textos do lazer verificados.');

// v16: URLs amigáveis usadas em todos os menus, rodapés, cards e banners.
const cleanUrls={'index.html':'/','empreendimento.html':'/empreendimento','lazer.html':'/lazer','localizacao.html':'/localizacao','contato.html':'/contato'};
for (const page of pages) {
 const html=fs.readFileSync(path.join(root,page),'utf8');
 for(const [legacy,pretty] of Object.entries(cleanUrls)){
   if(html.includes('href="'+legacy) || html.includes("href='"+legacy)) throw new Error(`${page}: link antigo presente: ${legacy}`);
 }
 if(!html.includes('rel="canonical"')) throw new Error(`${page}: URL canônica ausente`);
}
const footerHtml=fs.readFileSync(path.join(root,'footer.html'),'utf8');
for(const legacy of Object.keys(cleanUrls)){
 if(footerHtml.includes('href="'+legacy)) throw new Error(`footer.html: link antigo presente: ${legacy}`);
}
console.log('OK: links amigáveis e canonical presentes em todas as páginas.');
