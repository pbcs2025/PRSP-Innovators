import { getSharedClientKeyBytes } from './keyManager';

/**
 * Compute trapdoor = HMAC-SHA256(keyword, SHARED_CLIENT_KEY)
 * Because ALL authorized users use the SAME key, any user's trapdoor
 * for a given keyword matches any other user's record for that keyword.
 */
export async function computeTrapdoor(keyword) {
  const keyBytes = getSharedClientKeyBytes();
  const cryptoKey = await window.crypto.subtle.importKey(
    'raw', keyBytes, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
  );
  const msgBytes = new TextEncoder().encode(keyword);
  const sig      = await window.crypto.subtle.sign('HMAC', cryptoKey, msgBytes);
  return Array.from(new Uint8Array(sig)).map(b => b.toString(16).padStart(2, '0')).join('');
}
