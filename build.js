const fs = require('node:fs');
const path = require('node:path');
const root = __dirname;
const output = path.join(root, 'dist');
const files = ['index.html','empreendimento.html','lazer.html','localizacao.html','contato.html','styles.css','app.js','.htaccess','_headers'];
const assetDirs = ['assets','images','imagens','videos','media','fonts'];
fs.rmSync(output, { recursive: true, force: true });
fs.mkdirSync(output, { recursive: true });
for (const name of files) {
  const source = path.join(root, name);
  if (!fs.existsSync(source)) throw new Error(`Arquivo obrigatório ausente: ${name}`);
  fs.copyFileSync(source, path.join(output, name));
}
for (const name of assetDirs) {
  const source = path.join(root, name);
  if (fs.existsSync(source) && fs.statSync(source).isDirectory()) {
    fs.cpSync(source, path.join(output, name), { recursive: true });
  }
}
console.log('Site estático preparado em dist/');
