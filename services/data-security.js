const crypto = require('crypto');
const algorithm = 'aes-256-ctr';

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY;
const IV_LENGTH = 16;

function encrypt(text) {
  var iv = crypto.randomBytes(IV_LENGTH);
  var cipher = crypto.createCipheriv(algorithm, Buffer.from(ENCRYPTION_KEY), iv);
  var encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return iv.toString('hex') + ':' + encrypted.toString('hex');
}

function decrypt(text) {
  var textParts = text.split(':');
  var iv = Buffer.from(textParts.shift(), 'hex');
  var encryptedText = Buffer.from(textParts.join(':'), 'hex');
  var decipher = crypto.createDecipheriv(algorithm, Buffer.from(ENCRYPTION_KEY), iv);
  var decrypted = decipher.update(encryptedText);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString();
}

module.exports = {
  encrypt,
  decrypt
}