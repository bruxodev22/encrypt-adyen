const express = require('express');
const jsdom = require('jsdom');
const { JSDOM } = jsdom;

const app = express();
const port = 4000;


const { window } = new JSDOM(`<!DOCTYPE html><p></p>`);
global.window = window;
global.document = window.document;


global.navigator = {
  userAgent: 'node.js',
  platform: 'Node.js',
};


const AdyenEncrypt = require('adyen-cse-js');


app.get('/encrypt-card', (req, res) => {
  const { number, cvc, holderName, expiryMonth, expiryYear, publicKey, version } = req.query;

  if (!number || !cvc || !holderName || !expiryMonth || !expiryYear || !publicKey) {
    return res.status(400).send('Todos os campos são obrigatórios: number, cvc, holderName, expiryMonth, expiryYear, publicKey');
  }

  
  const adyenEncrypt = AdyenEncrypt.createEncryption(publicKey);

  
  const cardData = {
    number,
    cvc,
    holderName,
    expiryMonth,
    expiryYear,
    generationtime: new Date().toISOString()
  };


  let encryptedData = adyenEncrypt.encrypt(cardData);


  if (version) {
    const versionPattern = /_0_1_\d+/;
    encryptedData = encryptedData.replace(versionPattern, `_0_1_${version}`);
  }

  res.send({ encryptedData });
});


app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});
