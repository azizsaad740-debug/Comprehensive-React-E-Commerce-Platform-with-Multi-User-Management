// Mock utility for simulating blockchain-level encryption/decryption.
// In a real application, this would involve a secure vault or a dedicated encryption service.

const ENCRYPTION_PREFIX = 'BCE_';

/**
 * Simulates encrypting sensitive data using a mock blockchain encryption scheme.
 * @param data The sensitive string data.
 * @returns A mock encrypted string.
 */
export const encryptSensitiveData = (data: string): string => {
  if (!data) return '';
  // Simple base64 encoding simulation prefixed with BCE_
  const encoded = btoa(data).slice(0, 20); 
  return `${ENCRYPTION_PREFIX}${encoded}...`;
};

/**
 * Simulates decrypting sensitive data.
 * @param encryptedData The mock encrypted string.
 * @returns A mock decrypted string (placeholder).
 */
export const decryptSensitiveData = (encryptedData: string): string => {
  if (!encryptedData || !encryptedData.startsWith(ENCRYPTION_PREFIX)) {
    return 'DECRYPT_FAILED';
  }
  // In a real scenario, decryption would happen server-side or via a secure module.
  return 'DECRYPTED_VALUE';
};

/**
 * Checks if a string appears to be mock encrypted data.
 */
export const isEncrypted = (data: string): boolean => {
  return data.startsWith(ENCRYPTION_PREFIX);
};