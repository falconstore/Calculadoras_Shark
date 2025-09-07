// PASSO 6 - assets/js/config/app.js  
// Configurações globais da aplicação

export const APP_CONFIG = {
  // Informações básicas
  name: 'Calculadoras Shark 100% Green',
  version: '2.0.0',
  
  // URLs dos planos de assinatura
  subscriptionUrls: {
    monthly: 'https://lastlink.com/p/C84FEE0AA/checkout-payment/',
    quarterly: 'https://lastlink.com/p/C22278B31/checkout-payment/',
    biannual: 'https://lastlink.com/p/C1D318901/checkout-payment/',
    annual: 'https://lastlink.com/p/C479D71C2/checkout-payment/'
  },
  
  // Chaves do localStorage
  storage: {
    userKey: 'freepro_user',
    themeKey: 'freepro-theme'
  },
  
  // Configurações das calculadoras
  calculators: {
    arbipro: {
      maxHouses: 6,
      defaultHouses: 2,
      roundingOptions: [0.01, 0.10, 0.50, 1.00],
      defaultRounding: 0.01
    },
    freepro: {
      maxMarkets: 6,
      defaultMarkets: 3,
      roundingOptions: [0.01, 0.10, 0.50, 1.00],
      defaultRounding: 1.00,
      defaultExtractionRate: 70
    }
  },
  
  // Mensagens de erro
  errorMessages: {
    auth: {
      emailRequired: 'E-mail é obrigatório',
      emailInvalid: 'E-mail inválido', 
      passwordRequired: 'Senha é obrigatória',
      passwordTooShort: 'Senha deve ter pelo menos 6 caracteres',
      userNotFound: 'Usuário não encontrado',
      incorrectPassword: 'Senha incorreta',
      subscriptionExpired: 'Assinatura expirada',
      firebaseNotReady: 'Sistema não inicializado'
    },
    calculator: {
      invalidOdd: 'Odd inválida',
      invalidStake: 'Stake inválido',
      invalidCommission: 'Comissão inválida'
    }
  }
};

// Função para verificar se está em desenvolvimento
export function isDevelopment() {
  return window.location.hostname === 'localhost' || 
         window.location.hostname === '127.0.0.1' ||
         window.location.hostname.includes('github.io');
}

// Função para log de debug
export function debugLog(message, ...args) {
  if (isDevelopment()) {
    console.log(`[Shark Green] ${message}`, ...args);
  }
}

// Função para log de erro
export function errorLog(message, error = null) {
 console.error(`[Shark Green Error] ${message}`, error);
}
