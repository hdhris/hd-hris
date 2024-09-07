import crypto from 'crypto';

class Simple3Des {
    private secretKey: Buffer;
    private cipher: crypto.Cipher;

    constructor() {
        const secret = process.env.DES_SECRET!;
        this.secretKey = this.truncateHash(secret, 24); // Triple DES key size is 24 bytes
        this.cipher = crypto.createCipheriv('des-ede3', this.secretKey, Buffer.alloc(0));
    }

    private truncateHash(key: string, length: number): Buffer {
        const sha1 = crypto.createHash('sha1');
        const keyBytes = Buffer.from(key, 'utf16le');
        const hash = sha1.update(keyBytes).digest();
        const truncatedHash = Buffer.alloc(length);
        if (hash.length >= length) {
            hash.copy(truncatedHash, 0, 0, length);
        } else {
            hash.copy(truncatedHash);
        }
        return truncatedHash;
    }

    public encryptData(plaintext: string): string {
        const plaintextBytes = Buffer.from(plaintext, 'utf16le');
        const encryptedBytes = Buffer.concat([this.cipher.update(plaintextBytes), this.cipher.final()]);
        return encryptedBytes.toString('base64');
    }

    public decryptData(encryptedtext: string): string {
        const encryptedBytes = Buffer.from(encryptedtext, 'base64');
        const decipher = crypto.createDecipheriv('des-ede3', this.secretKey, Buffer.alloc(0));
        const decryptedBytes = Buffer.concat([decipher.update(encryptedBytes), decipher.final()]);
        return decryptedBytes.toString('utf16le');
    }

    public static validate(cipher: string): boolean {
        try {
            Buffer.from(cipher, 'base64');
            return true;
        } catch (error) {
            return false;
        }
    }
}




export default Simple3Des;
