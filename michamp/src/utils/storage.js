// src/utils/storage.js
const getPrefix = () => {
  try {
    return window.location.pathname.startsWith('/beta') ? 'beta_' : '';
  } catch {
    return import.meta.env.VITE_ENV === 'beta' ? 'beta_' : '';
  }
};

export const storage = {
  get: (key) => {
    try {
      const prefixed = `${getPrefix()}${key}`;
      const item = localStorage.getItem(prefixed);
      return item ? JSON.parse(item) : null;
    } catch {
      return null;
    }
  },
  set: (key, value) => {
    try {
      const prefixed = `${getPrefix()}${key}`;
      localStorage.setItem(prefixed, JSON.stringify(value));
      return true;
    } catch (e) {
      console.error('Storage error:', e);
      return false;
    }
  },
  remove: (key) => {
    try {
      const prefixed = `${getPrefix()}${key}`;
      localStorage.removeItem(prefixed);
    } catch {}
  },
  clear: () => {
    try {
      const prefix = getPrefix();
      Object.keys(localStorage)
        .filter(k => k.startsWith(prefix))
        .forEach(k => localStorage.removeItem(k));
    } catch {}
  },
  // Util para migrar dados (admin apenas)
  migrate: (fromPrefix, toPrefix) => {
    Object.keys(localStorage)
      .filter(k => k.startsWith(fromPrefix))
      .forEach(k => {
        const newKey = k.replace(fromPrefix, toPrefix);
        localStorage.setItem(newKey, localStorage.getItem(k));
        localStorage.removeItem(k);
      });
  }
};
