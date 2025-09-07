// assets/js/utils/share.js
// Sistema de compartilhamento de configurações

export class ShareSystem {
  constructor() {
    this.baseUrl = window.location.origin + window.location.pathname;
  }

  // Gera link compartilhável para ArbiPro
  generateArbiProLink(data) {
    const config = {
      t: 'arbipro', // tipo
      n: data.numHouses || 2, // número de casas
      r: data.rounding || 0.01, // arredondamento
      h: data.houses.slice(0, data.numHouses).map(house => ({
        o: house.odd || '', // odd
        s: house.stake || '', // stake
        c: house.commission, // comissão (null se não tem)
        f: house.freebet || false, // freebet
        i: house.increase, // aumento de odd (null se não tem)
        l: house.lay || false, // lay
        x: house.fixedStake || false // stake fixada
      }))
    };

    return this.createShareableLink(config);
  }

  // Gera link compartilhável para FreePro
  generateFreeProLink(data) {
    const config = {
      t: 'freepro', // tipo
      n: data.numEntradas || 3, // número de entradas
      r: data.roundStep || 1.00, // arredondamento
      // Casa promoção
      p: {
        o: data.promoOdd || '', // odd da casa
        c: data.promoComm || '', // comissão
        s: data.promoStake || '', // stake qualificação
        f: data.freebetValue || '', // valor freebet
        e: data.extractionRate || 70 // taxa extração
      },
      // Coberturas
      cov: data.coverages || []
    };

    return this.createShareableLink(config);
  }

  // Cria link encurtado usando base64
  createShareableLink(config) {
    try {
      const jsonStr = JSON.stringify(config);
      const base64 = btoa(encodeURIComponent(jsonStr));
      const shortId = this.generateShortId(base64);
      
      // Salva no localStorage para recuperação
      const shareData = {
        id: shortId,
        config: config,
        created: Date.now(),
        expires: Date.now() + (30 * 24 * 60 * 60 * 1000) // 30 dias
      };
      
      this.saveShareData(shortId, shareData);
      
      return {
        fullUrl: `${this.baseUrl}?share=${base64}`,
        shortUrl: `${this.baseUrl}?s=${shortId}`,
        shareId: shortId
      };
    } catch (error) {
      console.error('Erro ao criar link compartilhável:', error);
      return null;
    }
  }

  // Gera ID curto para link encurtado
  generateShortId(base64) {
    const hash = this.simpleHash(base64);
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    let num = Math.abs(hash);
    
    for (let i = 0; i < 8; i++) {
      result += chars[num % chars.length];
      num = Math.floor(num / chars.length);
    }
    
    return result;
  }

  // Hash simples para gerar ID
  simpleHash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash;
  }

  // Salva dados de compartilhamento
  saveShareData(shortId, data) {
    try {
      const key = `share_${shortId}`;
      localStorage.setItem(key, JSON.stringify(data));
      
      // Limpa dados antigos
      this.cleanupOldShares();
    } catch (error) {
      console.warn('Não foi possível salvar dados de compartilhamento:', error);
    }
  }

  // Limpa compartilhamentos expirados
  cleanupOldShares() {
    try {
      const now = Date.now();
      const keys = Object.keys(localStorage);
      
      keys.forEach(key => {
        if (key.startsWith('share_')) {
          try {
            const data = JSON.parse(localStorage.getItem(key));
            if (data.expires && data.expires < now) {
              localStorage.removeItem(key);
            }
          } catch (e) {
            localStorage.removeItem(key); // Remove dados corrompidos
          }
        }
      });
    } catch (error) {
      console.warn('Erro ao limpar compartilhamentos antigos:', error);
    }
  }

  // Carrega configuração do URL
  loadFromUrl() {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      
      // Link completo (base64)
      const shareParam = urlParams.get('share');
      if (shareParam) {
        const jsonStr = decodeURIComponent(atob(shareParam));
        return JSON.parse(jsonStr);
      }
      
      // Link curto
      const shortParam = urlParams.get('s');
      if (shortParam) {
        const shareData = this.loadShareData(shortParam);
        return shareData ? shareData.config : null;
      }
      
      return null;
    } catch (error) {
      console.error('Erro ao carregar configuração do URL:', error);
      return null;
    }
  }

  // Carrega dados de compartilhamento
  loadShareData(shortId) {
    try {
      const key = `share_${shortId}`;
      const data = localStorage.getItem(key);
      
      if (!data) return null;
      
      const shareData = JSON.parse(data);
      
      // Verifica se não expirou
      if (shareData.expires && shareData.expires < Date.now()) {
        localStorage.removeItem(key);
        return null;
      }
      
      return shareData;
    } catch (error) {
      console.error('Erro ao carregar dados de compartilhamento:', error);
      return null;
    }
  }

  // Remove parâmetros de compartilhamento da URL
  cleanUrl() {
    try {
      const url = new URL(window.location);
      url.searchParams.delete('share');
      url.searchParams.delete('s');
      
      // Atualiza URL sem recarregar a página
      window.history.replaceState({}, document.title, url.toString());
    } catch (error) {
      console.warn('Não foi possível limpar URL:', error);
    }
  }

  // Copia link para área de transferência
  async copyToClipboard(url) {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(url);
        return true;
      } else {
        // Fallback para navegadores mais antigos
        const textArea = document.createElement('textarea');
        textArea.value = url;
        textArea.style.position = 'fixed';
        textArea.style.left = '-9999px';
        document.body.appendChild(textArea);
        textArea.select();
        const success = document.execCommand('copy');
        document.body.removeChild(textArea);
        return success;
      }
    } catch (error) {
      console.error('Erro ao copiar para área de transferência:', error);
      return false;
    }
  }

  // Gera QR Code (opcional)
  generateQRCodeUrl(url) {
    // Usando serviço público para QR code
    const encodedUrl = encodeURIComponent(url);
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodedUrl}`;
  }

  // Valida se uma configuração é válida
  validateConfig(config) {
    if (!config || typeof config !== 'object') return false;
    
    const validTypes = ['arbipro', 'freepro'];
    if (!validTypes.includes(config.t)) return false;
    
    if (config.t === 'arbipro') {
      return this.validateArbiProConfig(config);
    } else if (config.t === 'freepro') {
      return this.validateFreeProConfig(config);
    }
    
    return false;
  }

  validateArbiProConfig(config) {
    return (
      typeof config.n === 'number' &&
      config.n >= 2 && config.n <= 6 &&
      Array.isArray(config.h) &&
      config.h.length <= config.n
    );
  }

  validateFreeProConfig(config) {
    return (
      typeof config.n === 'number' &&
      config.n >= 2 && config.n <= 6 &&
      config.p && typeof config.p === 'object'
    );
  }
}
