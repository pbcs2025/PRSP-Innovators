// Stores the SHARED_CLIENT_KEY in memory only — never in localStorage
let _sharedClientKey = null;

export function setSharedClientKey(hexKey) {
  _sharedClientKey = hexKey;
}

export function getSharedClientKeyBytes() {
  if (!_sharedClientKey) throw new Error('Shared client key not loaded');
  const bytes = new Uint8Array(_sharedClientKey.match(/.{2}/g).map(h => parseInt(h, 16)));
  return bytes;
}

export function clearSharedClientKey() {
  _sharedClientKey = null;
}
