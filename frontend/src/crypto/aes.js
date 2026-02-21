import { getSharedClientKeyBytes } from './keyManager';

/**
 * Encrypt plaintext KYC JSON with a random DEK.
 * The DEK itself is encrypted with SHARED_CLIENT_KEY so any authorized user can unwrap it.
 */
export async function encryptKYC(plaintextObj) {
  const sharedKeyBytes = getSharedClientKeyBytes();
  const sharedCryptoKey = await window.crypto.subtle.importKey(
    'raw', sharedKeyBytes, 'AES-GCM', false, ['encrypt', 'decrypt']
  );

  // Generate random DEK
  const dek = await window.crypto.subtle.generateKey({ name: 'AES-GCM', length: 256 }, true, ['encrypt', 'decrypt']);
  const dekRaw = await window.crypto.subtle.exportKey('raw', dek);

  // Encrypt the KYC payload with DEK
  const iv  = window.crypto.getRandomValues(new Uint8Array(12));
  const enc = await window.crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    dek,
    new TextEncoder().encode(JSON.stringify(plaintextObj))
  );

  // Wrap DEK with SHARED_CLIENT_KEY
  const dekIv      = window.crypto.getRandomValues(new Uint8Array(12));
  const wrappedDek = await window.crypto.subtle.encrypt(
    { name: 'AES-GCM', iv: dekIv },
    sharedCryptoKey,
    dekRaw
  );

  const toB64 = buf => btoa(String.fromCharCode(...new Uint8Array(buf)));

  return {
    encrypted_payload: toB64(enc),
    iv:                toB64(iv),
    auth_tag:          '',          // GCM tag is appended inside enc by Web Crypto API
    encrypted_dek:     toB64(dekIv) + ':' + toB64(wrappedDek)
  };
}

/**
 * Decrypt an encrypted KYC record. Any authorized user with SHARED_CLIENT_KEY can decrypt.
 */
export async function decryptKYC({ encrypted_payload, iv, encrypted_dek }) {
  const sharedKeyBytes = getSharedClientKeyBytes();
  const sharedCryptoKey = await window.crypto.subtle.importKey(
    'raw', sharedKeyBytes, 'AES-GCM', false, ['decrypt']
  );

  const fromB64 = b64 => Uint8Array.from(atob(b64), c => c.charCodeAt(0));
  const [dekIvB64, wrappedDekB64] = encrypted_dek.split(':');

  // Unwrap DEK using shared key
  const dekRaw = await window.crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: fromB64(dekIvB64) },
    sharedCryptoKey,
    fromB64(wrappedDekB64)
  );

  const dek = await window.crypto.subtle.importKey('raw', dekRaw, 'AES-GCM', false, ['decrypt']);

  // Decrypt payload
  const plaintext = await window.crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: fromB64(iv) },
    dek,
    fromB64(encrypted_payload)
  );

  return JSON.parse(new TextDecoder().decode(plaintext));
}
