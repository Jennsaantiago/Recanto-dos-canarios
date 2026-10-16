# Recanto dos Canários — site institucional

## Executar localmente

```bash
npm install
npm run check
npm start
```

Abra http://localhost:3000.

## Gerar arquivos para hospedagem estática

```bash
npm run build
```

Publique o conteúdo da pasta `dist/` em uma hospedagem estática. Para hospedagem Node.js, use `npm start` e configure a variável `PORT` conforme a plataforma.

**Atenção:** confirme o número oficial de WhatsApp em `app.js` antes de publicar. Imagens embutidas em base64 tornam algumas páginas grandes; recomenda-se extraí-las em uma etapa futura, com testes visuais.
