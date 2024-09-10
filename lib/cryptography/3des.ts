class Simple3Des {
    private secretKey: CryptoKey | null = null;

    constructor() {
        // Constructor cannot be async, so the key import logic must be moved outside
    }

    // Call this method after creating an instance to initialize the key
    public async initialize(): Promise<void> {
        const secret = process.env.DES_SECRET!;
        await this.importKey(secret);
    }

    // Truncate the secret to 24 bytes (192 bits) and import it for use in Web Crypto API
    private async importKey(secret: string): Promise<void> {
        const truncatedKey = await this.truncateHash(secret, 24); // Triple DES key size is 24 bytes
        this.secretKey = await crypto.subtle.importKey(
            'raw',
            truncatedKey,
            { name: 'DES-EDE3' },
            false,
            ['encrypt', 'decrypt']
        );
    }

    // Equivalent truncation using SHA-1
    private async truncateHash(key: string, length: number): Promise<ArrayBuffer> {
        const encoder = new TextEncoder();
        const keyBytes = encoder.encode(key);
        const hashBuffer = await crypto.subtle.digest('SHA-1', keyBytes);
        return hashBuffer.slice(0, length);
    }

    public async encryptData(plaintext: string): Promise<string> {
        const encoder = new TextEncoder();
        const plaintextBytes = encoder.encode(plaintext);

        if (!this.secretKey) throw new Error('Secret key is not initialized.');

        const encryptedBytes = await crypto.subtle.encrypt(
            {
                name: 'DES-EDE3',
                iv: new Uint8Array(0), // No IV in EDE mode
            },
            this.secretKey,
            plaintextBytes
        );

        return this.arrayBufferToBase64(encryptedBytes);
    }

    public async decryptData(encryptedtext: string): Promise<string> {
        // Validate the base64 encoded input before decryption
        if (!Simple3Des.validate(encryptedtext)) {
            throw new Error('Invalid encrypted text format');
        }

        const encryptedBytes = this.base64ToArrayBuffer(encryptedtext);

        if (!this.secretKey) throw new Error('Secret key is not initialized.');

        try {
            const decryptedBytes = await crypto.subtle.decrypt(
                {
                    name: 'DES-EDE3',
                    iv: new Uint8Array(0), // No IV in EDE mode
                },
                this.secretKey,
                encryptedBytes
            );

            const decoder = new TextDecoder('utf-16le');
            return decoder.decode(decryptedBytes);
        } catch (error) {
            throw new Error('Decryption failed. The data might be corrupted or the key is incorrect.');
        }
    }

    // Helper function to convert ArrayBuffer to base64 string
    private arrayBufferToBase64(buffer: ArrayBuffer): string {
        let binary = '';
        const bytes = new Uint8Array(buffer);
        const len = bytes.byteLength;
        for (let i = 0; i < len; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        return btoa(binary);
    }

    // Helper function to convert base64 string to ArrayBuffer
    private base64ToArrayBuffer(base64: string): ArrayBuffer {
        const binaryString = atob(base64);
        const len = binaryString.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }
        return bytes.buffer;
    }

    // Validate that the cipher is a valid base64 encoded string
    private static validate(cipher: string): boolean {
        try {
            // Check if the input is valid base64 by attempting to decode it
            atob(cipher);
            return true;
        } catch (error) {
            return false;
        }
    }
}