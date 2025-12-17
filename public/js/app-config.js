// config/app.js - Configurações da aplicação
export const APP_CONFIG = {
  calculators: {
    arbipro: {
      maxHouses: 10,
      defaultHouses: 3,
      defaultRounding: 0.01
    },
    freepro: {
      maxEntries: 10,
      defaultEntries: 3
    }
  }
};

// Expor globalmente para compatibilidade
if (typeof window !== 'undefined') {
  window.APP_CONFIG = APP_CONFIG;
}
