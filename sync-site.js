// Fonte única do rodapé de todas as páginas HTML.
// npm run build executa este script antes do validador.
const fs = require('node:fs');
const path = require('node:path');
const pages = ['index.html','empreendimento.html','lazer.html','localizacao.html','contato.html'];
const template = fs.readFileSync(path.join(__dirname,'partials','footer.html'),'utf8').trim();
const footerPattern=/<footer\b[^>]*\brecanto-footer\b[^>]*>[\s\S]*?<\/footer>/i;
for (const name of pages) {
  const filename=path.join(__dirname,name);
  const original=fs.readFileSync(filename,'utf8');
  if (!footerPattern.test(original)) throw new Error(`${name}: rodapé não encontrado; nada foi apagado`);
  const normalized=original.replace(footerPattern, () => template);
  if (original !== normalized) {
    fs.writeFileSync(filename, normalized, 'utf8');
    console.log(`${name}: rodapé sincronizado`);
  }
}
console.log('OK: rodapé único sincronizado nas 5 páginas.');
