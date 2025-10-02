import crypto from "node:crypto";

const KEY_LENGTH = 32; // 256 bits
const IV_LENGTH = 16; // 128 bits

/**
 * Simple encryption using AES-256-CBC
 * Returns just the encrypted string and key for easy transmission
 */
export function encryptPreimage(preimage: Buffer): {
	key: Buffer;
	encrypted: Buffer;
} {
	const key = crypto.randomBytes(KEY_LENGTH);
	const iv = crypto.randomBytes(IV_LENGTH);

	const cipher = crypto.createCipheriv("aes-256-cbc", key, iv);

	const encrypted = Buffer.concat([
		iv, // Prepend IV to encrypted data
		cipher.update(preimage),
		cipher.final(),
	]);

	return { key, encrypted: encrypted };
}

/**
 * Simple decryption using AES-256-CBC
 */
export function decryptPreimage(
	encryptedPreimage: Buffer,
	key: Buffer,
): Buffer {
	const iv = encryptedPreimage.subarray(0, IV_LENGTH);
	const data = encryptedPreimage.subarray(IV_LENGTH);

	const decipher = crypto.createDecipheriv("aes-256-cbc", key, iv);

	const decrypted = Buffer.concat([decipher.update(data), decipher.final()]);

	return decrypted;
}
