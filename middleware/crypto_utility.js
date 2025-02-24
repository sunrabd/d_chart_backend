const crypto = require('crypto');

const SECRET_KEY = crypto.createHash('sha256').digest('utf8');
const ALGORITHM = 'aes-256-cbc';
const IV_LENGTH = 16;

// Encrypt function
function encrypt(text) {
    try {
        if (typeof text !== 'string' || !text) {
            throw new Error('Invalid text for encryption');
        }
        const iv = crypto.randomBytes(IV_LENGTH);
        const cipher = crypto.createCipheriv(ALGORITHM, SECRET_KEY, iv);
        let encrypted = cipher.update(text, 'utf8', 'hex');
        encrypted += cipher.final('hex');
        return iv.toString('hex') + ':' + encrypted; // IV and encrypted data combined
    } catch (error) {
        console.error('Encryption error:', error.message);
        throw new Error('Encryption failed');
    }
}

// Decrypt function
function decrypt(encryptedText) {
    try {
        console.log('Encrypted Text:', encryptedText);  // Add this log
        if (typeof encryptedText !== 'string' || !encryptedText.includes(':')) {
            throw new Error('Invalid text for decryption');
        }
        const [iv, encryptedData] = encryptedText.split(':');
        if (!iv || !encryptedData) {
            throw new Error('Malformed encrypted text');
        }
        const decipher = crypto.createDecipheriv(ALGORITHM, SECRET_KEY, Buffer.from(iv, 'hex'));
        let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        return decrypted;
    } catch (error) {
        console.error('Decryption error:', error.message);
        throw new Error('Decryption failed');
    }
}

module.exports = { encrypt, decrypt };