class SimpleAES {
    private secretKey: CryptoKey | null = null;
    private keyPromise: Promise<void>;

    constructor() {
        // Automatically initialize the secret key on instantiation
        const secret = process.env.AES_SECRET!;
        this.keyPromise = this.importKey(secret);
    }

    // Import the AES key
    private async importKey(secret: string): Promise<void> {
        const keyMaterial = await this.truncateHash(secret, 32); // AES-256 key size is 32 bytes
        this.secretKey = await crypto.subtle.importKey(
            'raw',
            keyMaterial,
            { name: 'AES-CBC' }, // Use AES-CBC for simplicity
            false,
            ['encrypt', 'decrypt']
        );
    }

    // Truncate the key using SHA-256
    private async truncateHash(key: string, length: number): Promise<ArrayBuffer> {
        const encoder = new TextEncoder();
        const keyBytes = encoder.encode(key);
        const hashBuffer = await crypto.subtle.digest('SHA-256', keyBytes);
        return hashBuffer.slice(0, length);
    }

    public async encryptData(plaintext: string): Promise<string> {
        await this.keyPromise;

        const iv = crypto.getRandomValues(new Uint8Array(16)); // Initialization vector (IV)
        const encoder = new TextEncoder();
        const plaintextBytes = encoder.encode(plaintext);

        if (!this.secretKey) throw new Error('Secret key is not initialized.');

        const encryptedBytes = await crypto.subtle.encrypt(
            {
                name: 'AES-CBC',
                iv: iv,
            },
            this.secretKey,
            plaintextBytes
        );

        const ivBase64 = this.arrayBufferToBase64(iv);
        const encryptedBase64 = this.arrayBufferToBase64(encryptedBytes);

        return `${ivBase64}:${encryptedBase64}`; // Return both IV and ciphertext
    }

    public async decryptData(encryptedText: string): Promise<string> {
        await this.keyPromise;

        const [ivBase64, encryptedBase64] = encryptedText.split(':');
        const iv = this.base64ToArrayBuffer(ivBase64);
        const encryptedBytes = this.base64ToArrayBuffer(encryptedBase64);

        if (!this.secretKey) throw new Error('Secret key is not initialized.');

        try {
            const decryptedBytes = await crypto.subtle.decrypt(
                {
                    name: 'AES-CBC',
                    iv: iv,
                },
                this.secretKey,
                encryptedBytes
            );

            const decoder = new TextDecoder();
            return decoder.decode(decryptedBytes);
        } catch (error) {
            throw new Error('Decryption failed. The data might be corrupted or the key is incorrect.');
        }
    }

    public async compare(plaintext: string, encryptedText: string): Promise<boolean> {
        try {
            const decryptedText = await this.decryptData(encryptedText);
            return decryptedText === plaintext;
        } catch (error) {
            return false;
        }
    }

    private arrayBufferToBase64(buffer: ArrayBuffer): string {
        let binary = '';
        const bytes = new Uint8Array(buffer);
        for (let i = 0; i < bytes.byteLength; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        return btoa(binary);
    }

    private base64ToArrayBuffer(base64: string): ArrayBuffer {
        const binaryString = atob(base64);
        const len = binaryString.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }
        return bytes.buffer;
    }

    public static validate(cipher: string): boolean {
        return cipher.includes(':'); // Simple validation for format
    }
}
export default SimpleAES