// assets/js/utils/share.js
// Sistema de compartilhamento de configurações

export class ShareSystem {
  constructor() {
    this.baseUrl = window.location.origin + window.location.pathname;
    this.shortenerApi = 'https://tinyurl.com/api-create.php'; // API gratuita
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
        f: data.freebetValue || '', // valor da freebet
        e: data.extractionRate || 70 // taxa de extração
      },
      // Coberturas
      cov: data.coverages || []
    };

    return this.createShareableLink(config);
  }

  // Cria links compartilháveis
  async createShareableLink(config) {
    try {
      // Comprime configuração
      const compressed = this.compressConfig(config);
      
      // URL completa
      const fullUrl = `${this.baseUrl}?config=${compressed}`;
      
      // URL encurtada
      const shortUrl = await this.shortenUrl(fullUrl);
      
      return {
        fullUrl,
        shortUrl: shortUrl || fullUrl, // fallback para URL completa
        config: compressed,
        timestamp: Date.now()
      };
    } catch (error) {
      console.error('Erro ao criar link:', error);
      // Retorna apenas URL completa em caso de erro
      const compressed = this.compressConfig(config);
      const fullUrl = `${this.baseUrl}?config=${compressed}`;
      
      return {
        fullUrl,
        shortUrl: fullUrl,
        config: compressed,
        timestamp: Date.now()
      };
    }
  }

  // Comprime configuração para URL
  compressConfig(config) {
    try {
      const jsonString = JSON.stringify(config);
      // Usa btoa para base64 (compatível com todos navegadores)
      return btoa(encodeURIComponent(jsonString));
    } catch (error) {
      console.error('Erro ao comprimir config:', error);
      return '';
    }
  }

  // Descomprime configuração da URL
  decompressConfig(compressed) {
    try {
      const jsonString = decodeURIComponent(atob(compressed));
      return JSON.parse(jsonString);
    } catch (error) {
      console.error('Erro ao descomprimir config:', error);
      return null;
    }
  }

  // Encurta URL usando serviço gratuito
  async shortenUrl(longUrl) {
    try {
      // Tentativa 1: TinyURL (gratuito, sem API key)
      const tinyResponse = await fetch(`${this.shortenerApi}?url=${encodeURIComponent(longUrl)}`);
      
      if (tinyResponse.ok) {
        const shortUrl = await tinyResponse.text();
        if (shortUrl.startsWith('http')) {
          return shortUrl;
        }
      }
    } catch (error) {
      console.warn('Erro ao encurtar URL:', error);
    }

    // Fallback: retorna URL original
    return longUrl;
  }

  // Gera URL do QR Code
  generateQRCodeUrl(url, size = 200) {
    // Usa QR Server gratuito
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(url)}`;
    return qrUrl;
  }

  // Copia texto para área de transferência
  async copyToClipboard(text) {
    try {
      // Método moderno (navegadores novos)
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
        return true;
      }
      
      // Fallback para navegadores mais antigos
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      
      const successful = document.execCommand('copy');
      document.body.removeChild(textArea);
      
      return successful;
    } catch (error) {
      console.error('Erro ao copiar:', error);
      return false;
    }
  }

  // Carrega configuração da URL atual
  loadFromUrl() {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const configParam = urlParams.get('config');
      
      if (configParam) {
        const config = this.decompressConfig(configParam);
        if (config && this.validateConfig(config)) {
          console.log('Configuração carregada da URL:', config);
          return config;
        }
      }
      
      return null;
    } catch (error) {
      console.error('Erro ao carregar da URL:', error);
      return null;
    }
  }

  // Valida configuração
  validateConfig(config) {
    if (!config || typeof config !== 'object') {
      return false;
    }

    // Verifica se tem tipo válido
    if (!config.t || !['arbipro', 'freepro'].includes(config.t)) {
      return false;
    }

    // Validações específicas por tipo
    if (config.t === 'arbipro') {
      return this.validateArbiProConfig(config);
    } else if (config.t === 'freepro') {
      return this.validateFreeProConfig(config);
    }

    return false;
  }

  // Valida configuração ArbiPro
  validateArbiProConfig(config) {
    return (
      typeof config.n === 'number' &&
      config.n >= 2 && config.n <= 6 &&
      typeof config.r === 'number' &&
      Array.isArray(config.h) &&
      config.h.length <= config.n
    );
  }

  // Valida configuração FreePro
  validateFreeProConfig(config) {
    return (
      typeof config.n === 'number' &&
      config.n >= 2 && config.n <= 6 &&
      typeof config.r === 'number' &&
      config.p && typeof config.p === 'object'
    );
  }

  // Limpa URL removendo parâmetros de compartilhamento
  cleanUrl() {
    try {
      const url = new URL(window.location);
      url.searchParams.delete('config');
      
      // Atualiza URL sem recarregar página
      window.history.replaceState({}, document.title, url.pathname + url.search);
    } catch (error) {
      console.error('Erro ao limpar URL:', error);
    }
  }

  // Estatísticas de uso (futuro)
  trackShare(type, calculator) {
    try {
      // Implementar analytics se necessário
      console.log(`Share tracked: ${type} for ${calculator}`);
    } catch (error) {
      console.warn('Erro ao rastrear compartilhamento:', error);
    }
  }

  // Verifica se link expirou (30 dias)
  isLinkExpired(timestamp) {
    if (!timestamp) return false;
    
    const thirtyDays = 30 * 24 * 60 * 60 * 1000; // 30 dias em ms
    const now = Date.now();
    
    return (now - timestamp) > thirtyDays;
  }

  // Gera ID único para links
  generateLinkId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
}
