const express = require('express');
const jsdom = require('jsdom');
const { JSDOM } = jsdom;

const app = express();

// Configura o ambiente para uso com a biblioteca AdyenEncrypt
const { window } = new JSDOM(`<!DOCTYPE html><p></p>`);
global.window = window;
global.document = window.document;

global.navigator = {
  userAgent: 'node.js',
  platform: 'Node.js',
};

const AdyenEncrypt = require('adyen-cse-js');

// Endpoint para criptografar os dados do cartão
app.get('/encrypt-card', (req, res) => {
  const { number, cvc, holderName, expiryMonth, expiryYear, publicKey, version } = req.query;

  // Validação dos campos obrigatórios
  if (!number || !cvc || !holderName || !expiryMonth || !expiryYear || !publicKey) {
    return res.status(400).send('Todos os campos são obrigatórios: number, cvc, holderName, expiryMonth, expiryYear, publicKey');
  }

  // Cria o objeto de criptografia usando a chave pública
  const adyenEncrypt = AdyenEncrypt.createEncryption(publicKey);

  // Dados do cartão a serem criptografados
  const cardData = {
    number,
    cvc,
    holderName,
    expiryMonth,
    expiryYear,
    generationtime: new Date().toISOString()
  };

  // Criptografa os dados do cartão
  let encryptedData = adyenEncrypt.encrypt(cardData);

  // Ajusta a versão se for necessário
  if (version) {
    const versionPattern = /_0_1_\d+/;
    encryptedData = encryptedData.replace(versionPattern, `_0_1_${version}`);
  }

  // Retorna os dados criptografados
  res.send({ encryptedData });
});

// Inicia o servidor na porta especificada pelo Vercel ou 4000
const port = process.env.PORT || 4000;
app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});
