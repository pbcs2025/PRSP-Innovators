import { create } from 'zustand';
import { setSharedClientKey, clearSharedClientKey } from '../crypto/keyManager';

const useAuthStore = create((set) => ({
  token:    null,
  username: null,
  role:     null,

  login: (token, username, role, shared_client_key) => {
    setSharedClientKey(shared_client_key);   // load shared key into memory
    set({ token, username, role });
  },

  logout: () => {
    clearSharedClientKey();
    set({ token: null, username: null, role: null });
  }
}));

export default useAuthStore;
