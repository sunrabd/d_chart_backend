const crypto = require('crypto');
require('dotenv').config();

const secretKey = crypto.createHash('sha256')
    .update(process.env.CRYPTO_KEY || "default_secret_key")
    .digest('base64')
    .substr(0, 32);

function encryptData(data) {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-cbc', secretKey, iv);
    let encrypted = cipher.update(data, 'utf8', 'base64');
    encrypted += cipher.final('base64');
    return { encryptedData: encrypted, iv: iv.toString('base64') };
}

function decryptData(encryptedData, iv) {
    const decipher = crypto.createDecipheriv('aes-256-cbc', secretKey, Buffer.from(iv, 'base64'));
    let decrypted = decipher.update(encryptedData, 'base64', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
}

module.exports = { encryptData, decryptData };
