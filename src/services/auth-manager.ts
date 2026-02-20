// Módulo para gerenciar logout global sem dependência circular
let globalLogoutHandler: (() => Promise<void>) | null = null;

// Evita loop: múltiplos 401/token inválido em sequência disparam apenas um logout
const LOGOUT_DEBOUNCE_MS = 3000;
let lastLogoutTime = 0;
let logoutPromise: Promise<void> | null = null;

export const setLogoutHandler = (handler: (() => Promise<void>) | null) => {
  globalLogoutHandler = handler;
};

export const handleTokenExpiration = async (): Promise<void> => {
  const now = Date.now();
  if (now - lastLogoutTime < LOGOUT_DEBOUNCE_MS && logoutPromise) {
    return logoutPromise;
  }
  lastLogoutTime = now;
  logoutPromise = (async () => {
    if (globalLogoutHandler) {
      await globalLogoutHandler();
    }
  })();
  await logoutPromise;
};

