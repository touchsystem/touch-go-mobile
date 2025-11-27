// Módulo para gerenciar logout global sem dependência circular
let globalLogoutHandler: (() => Promise<void>) | null = null;

export const setLogoutHandler = (handler: (() => Promise<void>) | null) => {
  globalLogoutHandler = handler;
};

export const handleTokenExpiration = async (): Promise<void> => {
  if (globalLogoutHandler) {
    await globalLogoutHandler();
  }
};

