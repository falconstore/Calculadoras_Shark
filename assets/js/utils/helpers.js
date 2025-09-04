// PASSO 7 - assets/js/utils/helpers.js
// Funções utilitárias compartilhadas

export class Utils {
  // Formatação de números brasileira
  static parseFlex(value) {
    if (value === null || value === undefined) return NaN;
    const str = String(value).trim();
    if (str === '') return NaN;
    
    const hasComma = str.includes(',');
    const hasDot = str.includes('.');
    
    let processed = str;
    if (hasComma && !hasDot) {
      processed = str.replace(',', '.');
    } else if (hasComma && hasDot) {
      processed = str.replace(/\./g, '').replace(',', '.');
    }
    
    const parsed = parseFloat(processed);
    return Number.isFinite(parsed) ? parsed : NaN;
  }

  static formatBRL(value) {
    return (Number.isFinite(value) ? value : 0).toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      maximumFractionDigits: 2
    });
  }

  static formatDecimal(value) {
    return Number.isFinite(value) 
      ? value.toLocaleString('pt-BR', { 
          minimumFractionDigits: 2, 
          maximumFractionDigits: 2 
        })
      : '';
  }

  // Sanitização de input
  static keepNumeric(str) {
    return str.replace(/[^0-9.,]/g, '');
  }

  // Validações
  static isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  static isValidOdd(odd) {
    const parsed = this.parseFlex(odd);
    return Number.isFinite(parsed) && parsed > 1;
  }

  static isValidStake(stake) {
    const parsed = this.parseFlex(stake);
    return Number.isFinite(parsed) && parsed > 0;
  }

  // Utilitários de DOM
  static $(selector, root = document) {
    return root.querySelector(selector);
  }

  static $$(selector, root = document) {
    return Array.from(root.querySelectorAll(selector));
  }

  // Utilitários de localStorage
  static saveToStorage(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error('Erro ao salvar no localStorage:', error);
      return false;
    }
  }

  static loadFromStorage(key, defaultValue = null) {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.error('Erro ao carregar do localStorage:', error);
      return defaultValue;
    }
  }

  // Utilitários de data
  static formatDate(dateString, locale = 'pt-BR') {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Data inválida';
      return date.toLocaleDateString(locale);
    } catch (error) {
      return 'N/A';
    }
  }

  // Debounce para performance
  static debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  // Cálculos das calculadoras
  static calculateEffectiveOdd(odd, commissionPercentage = 0) {
    if (!Number.isFinite(odd) || odd <= 1) return 0;
    const commission = Number.isFinite(commissionPercentage) ? commissionPercentage / 100 : 0;
    return 1 + (odd - 1) * (1 - commission);
  }

  static roundToStep(value, step = 0.01) {
    if (!Number.isFinite(value) || !Number.isFinite(step) || step <= 0) {
      return value;
    }
    return Math.round(value / step) * step;
  }
}
