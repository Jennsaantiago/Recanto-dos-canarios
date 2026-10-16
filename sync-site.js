// Sincroniza o rodapé nas cinco páginas antes da validação/build.
// Compatível com upload do GitHub que mantém ou achata a pasta partials.
const fs = require('node:fs');
const path = require('node:path');
const root = __dirname;
const pages = ['index.html','empreendimento.html','lazer.html','localizacao.html','contato.html'];
const footerPattern = /<footer\b[^>]*\brecanto-footer\b[^>]*>[\s\S]*?<\/footer>/i;
function readFooter() {
  // Prioriza arquivo direto na raiz, que não depende de subpastas no GitHub.
  for (const name of ['footer.html','partials/footer.html']) {
    const full = path.join(root,name);
    if (fs.existsSync(full)) {
      const content = fs.readFileSync(full,'utf8').trim();
      const markup = content.match(footerPattern)?.[0];
      if (!markup) throw new Error(`${name}: rodapé .recanto-footer não encontrado`);
      console.log(`Rodapé de referência: ${name}`);
      return markup;
    }
  }
  // Em caso de upload incompleto, recupera rodapé da página inicial,
  // em vez de impedir a publicação por ENOENT.
  const home=path.join(root,'index.html');
  const markup=fs.readFileSync(home,'utf8').match(footerPattern)?.[0];
  if (!markup) throw new Error('Faltam footer.html e partials/footer.html; rodapé ausente também em index.html');
  console.warn('AVISO: footer.html ausente; usando o rodapé de index.html');
  return markup;
}
const template=readFooter();
for (const page of pages) {
  const filename=path.join(root,page);
  const original=fs.readFileSync(filename,'utf8');
  if (!footerPattern.test(original)) throw new Error(`${page}: rodapé não encontrado; nada foi apagado`);
  const updated=original.replace(footerPattern,()=>template);
  if (updated!==original) {
    fs.writeFileSync(filename,updated,'utf8');
    console.log(`${page}: rodapé sincronizado`);
  }
}
console.log('OK: rodapé igual nas cinco páginas.');
