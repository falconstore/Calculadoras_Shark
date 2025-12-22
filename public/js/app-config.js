// config/app.js - Configurações da aplicação
export const APP_CONFIG = {
  calculators: {
    arbipro: {
      maxHouses: 10,
      defaultHouses: 2,
      defaultRounding: 1.0,
    },
    freepro: {
      maxEntries: 10,
      defaultEntries: 2,
    },
  },
};

// Expor globalmente para compatibilidade
if (typeof window !== "undefined") {
  window.APP_CONFIG = APP_CONFIG;
}
